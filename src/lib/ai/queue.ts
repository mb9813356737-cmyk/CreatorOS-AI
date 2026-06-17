import { Queue, ConnectionOptions } from "bullmq";
import Redis from "ioredis";
import { db } from "@/lib/prisma";
import crypto from "crypto";

// ─── Redis Connection Settings ──────────────────────────────
const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;

let redisConnection: Redis | null = null;
let aiQueue: Queue | null = null;

try {
  if (REDIS_URL) {
    redisConnection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ
    });
    
    aiQueue = new Queue("ai-generations", {
      connection: redisConnection as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000, // 5 seconds initial delay
        },
        removeOnComplete: true, // Auto clean completed
        removeOnFail: false,   // Retain failed for admin audit
      },
    });
    console.log("[AI Queue] Redis Queue initialized successfully.");
  } else {
    console.warn("[AI Queue] REDIS_URL environment variable is missing. Queue is running in async fallback mode.");
  }
} catch (err) {
  console.error("[AI Queue] Failed to establish Redis Queue connection:", err);
}

export function getRedisConnection() {
  return redisConnection;
}

export function getAIQueue() {
  return aiQueue;
}

// ─── Helper: Request Deduplication Check ───────────────────
export async function checkDuplicateRequest(payload: any, userId: string): Promise<string | null> {
  try {
    const payloadHash = crypto
      .createHash("md5")
      .update(JSON.stringify(payload))
      .digest("hex");

    // Look for processing or waiting jobs matching hash in last 30 seconds
    const threshold = new Date(Date.now() - 30 * 1000);
    const existing = await db.aIQueueJob.findFirst({
      where: {
        userId,
        createdAt: { gte: threshold },
        status: { in: ["pending", "processing"] },
      },
    });

    if (existing) {
      // Check if current payload hash matches
      const existingHash = crypto
        .createHash("md5")
        .update(JSON.stringify(existing.payload))
        .digest("hex");
        
      if (existingHash === payloadHash) {
        return existing.jobId;
      }
    }
  } catch (err) {
    console.warn("[AI Queue] Deduplication filter failed to check:", err);
  }
  return null;
}

// ─── Core: Submit AI Generation Job ────────────────────────
export async function submitAIJob({
  userId,
  type,
  payload,
  platform,
  language,
}: {
  userId: string;
  type: string;
  payload: any;
  platform?: string;
  language?: string;
}) {
  // 1. Deduplicate check
  const duplicateJobId = await checkDuplicateRequest(payload, userId);
  if (duplicateJobId) {
    console.log(`[AI Queue] Duplicate request detected. Routing payload to existing job ID: ${duplicateJobId}`);
    return { duplicate: true, jobId: duplicateJobId };
  }

  const generatedId = "job_" + crypto.randomUUID().slice(0, 16);

  // 2. Create tracking record in DB
  const dbJob = await db.aIQueueJob.create({
    data: {
      jobId: generatedId,
      userId,
      type,
      payload,
      status: "pending",
    },
  });

  // 3. Dispatch to BullMQ or resolve asynchronously if offline
  if (aiQueue && redisConnection) {
    try {
      const bullJob = await aiQueue.add(
        type,
        { userId, type, payload, platform, language, dbJobId: dbJob.id },
        { jobId: generatedId }
      );
      
      return { success: true, jobId: bullJob.id, status: "pending" };
    } catch (err) {
      console.error("[AI Queue] BullMQ submission failed. Triggering immediate fallback resolution:", err);
    }
  }

  // 4. Async Fallback Loop (for local dev or Vercel hosting)
  // Executes processing inside setImmediate to prevent thread blocking, mimicking worker queue
  setImmediate(async () => {
    try {
      console.log(`[AI Queue Fallback] Processing job ${generatedId} asynchronously...`);
      
      // Update state to processing
      await db.aIQueueJob.update({
        where: { id: dbJob.id },
        data: { status: "processing", workerId: "serverless_fallback" },
      });

      // Lazy import worker processor to execute generation
      const { processJobDirectly } = await import("./worker-processor");
      const startTime = Date.now();
      const result = await processJobDirectly({
        userId,
        type,
        payload,
        platform,
        language,
        dbJobId: dbJob.id,
      });

      const duration = Date.now() - startTime;

      // Update state to completed
      await db.aIQueueJob.update({
        where: { id: dbJob.id },
        data: {
          status: "completed",
          result: typeof result === "string" ? result : JSON.stringify(result),
          executionTimeMs: duration,
        },
      });
      console.log(`[AI Queue Fallback] Job ${generatedId} completed successfully in ${duration}ms.`);
    } catch (err: any) {
      console.error(`[AI Queue Fallback] Job ${generatedId} failed:`, err);
      
      await db.aIQueueJob.update({
        where: { id: dbJob.id },
        data: {
          status: "failed",
          error: err.message || "Asynchronous execution failed",
        },
      });
    }
  });

  return { success: true, jobId: generatedId, status: "pending" };
}
