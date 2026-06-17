import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { db } from "@/lib/prisma";
import { processJobDirectly } from "@/lib/ai/worker-processor";

const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;

if (REDIS_URL) {
  try {
    const connection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null, // Required configuration for BullMQ
    });

    const worker = new Worker(
      "ai-generations",
      async (job: Job) => {
        const { userId, type, payload, platform, language, dbJobId } = job.data;
        console.log(`[AI Worker] Processing job ${job.id} of type ${type}`);

        // 1. Update job status to processing in Database
        await db.aIQueueJob.update({
          where: { id: dbJobId },
          data: {
            status: "processing",
            workerId: `worker_${process.pid}_${job.id}`,
            retryCount: job.attemptsMade,
          },
        });

        const startTime = Date.now();

        try {
          // 2. Call direct job processor
          const result = await processJobDirectly({
            userId,
            type,
            payload,
            platform,
            language,
            dbJobId,
          });

          const duration = Date.now() - startTime;

          // 3. Update job status to completed
          await db.aIQueueJob.update({
            where: { id: dbJobId },
            data: {
              status: "completed",
              result: typeof result === "string" ? result : JSON.stringify(result),
              executionTimeMs: duration,
            },
          });

          console.log(`[AI Worker] Job ${job.id} resolved successfully in ${duration}ms`);
          return result;
        } catch (error: any) {
          const duration = Date.now() - startTime;
          console.error(`[AI Worker] Attempt failed for job ${job.id}:`, error);

          // Check if this was the last attempt
          const maxRetries = job.opts.attempts || 3;
          const isLastAttempt = job.attemptsMade >= maxRetries;

          await db.aIQueueJob.update({
            where: { id: dbJobId },
            data: {
              status: isLastAttempt ? "failed" : "pending", // Keep pending if retrying
              error: error.message || "Job execution failed",
              executionTimeMs: duration,
              retryCount: job.attemptsMade,
            },
          });

          throw error; // Re-throw to trigger BullMQ retry backoff
        }
      },
      {
        connection: connection as any,
        concurrency: 5, // process up to 5 concurrent jobs
      }
    );

    worker.on("active", (job) => {
      console.log(`[AI Worker Active] Job ${job.id} is now active`);
    });

    worker.on("completed", (job) => {
      console.log(`[AI Worker Completed] Job ${job.id} completed successfully`);
    });

    worker.on("failed", (job, err) => {
      console.error(`[AI Worker Failed] Job ${job?.id} failed with error:`, err.message);
    });

    worker.on("error", (err) => {
      console.error("[AI Worker Connection Error] Worker error event:", err);
    });

    console.log("[AI Worker] BullMQ background queue worker initialized successfully.");
  } catch (err) {
    console.error("[AI Worker Init Error] Failed to spin up background worker process:", err);
  }
} else {
  console.warn("[AI Worker Bypass] REDIS_URL environment variable is missing. Background Queue Worker is disabled.");
}
export {};
