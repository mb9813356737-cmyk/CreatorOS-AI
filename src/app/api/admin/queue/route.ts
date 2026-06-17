import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { getAIQueue } from "@/lib/ai/queue";
import { getMockQueueJobs } from "@/lib/mockDb";
import { handleRouteError } from "@/lib/errors";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
      }
    } catch {
      // Offline mode fallback
    }

    const queue = getAIQueue();
    let bullStats = {
      active: 0,
      waiting: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      paused: false,
    };
    let isRedisOnline = false;

    if (queue) {
      try {
        const [active, waiting, completed, failed, delayed, paused] = await Promise.all([
          queue.getActiveCount(),
          queue.getWaitingCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
          queue.isPaused(),
        ]);
        bullStats = { active, waiting, completed, failed, delayed, paused };
        isRedisOnline = true;
      } catch (err) {
        console.warn("[Admin Queue] Redis connection error during stats fetch:", err);
      }
    }

    // Query database for recent queue jobs
    let recentJobs: any[] = [];
    try {
      recentJobs = await db.aIQueueJob.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (err) {
      console.warn("[Admin Queue] DB offline while fetching queue jobs. Using mock jobs.");
      recentJobs = getMockQueueJobs();
    }

    return NextResponse.json({
      isRedisOnline,
      bullStats,
      recentJobs,
    });
  } catch (error: any) {
    return handleRouteError(error, "Fetch queue status error");
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
      }
    } catch {
      // Offline mode fallback
    }

    const queue = getAIQueue();
    if (!queue) {
      return NextResponse.json(
        { error: "Redis BullMQ is offline or bypassed in current environment." },
        { status: 503 }
      );
    }

    if (action === "pause") {
      await queue.pause();
    } else if (action === "resume") {
      await queue.resume();
    } else if (action === "retry_failed") {
      try {
        const failed = await queue.getFailed();
        await Promise.all(failed.map((job) => job.retry().catch(() => {})));
      } catch (retryErr: any) {
        return NextResponse.json({ error: `Failed to retry jobs: ${retryErr.message}` }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Invalid queue operation action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Queue action ${action} processed successfully` });
  } catch (error: any) {
    return handleRouteError(error, "Modify queue error");
  }
}
