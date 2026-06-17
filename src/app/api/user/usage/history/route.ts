import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawHistory: any[] = [];
    let allGenerations: any[] = [];
    let dbOffline = false;

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Query database for user's generations in the last 7 days
      rawHistory = await db.generation.findMany({
        where: {
          userId,
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          createdAt: true,
          type: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Query database for user's all-time generations (to compile distribution)
      allGenerations = await db.generation.findMany({
        where: { userId },
        select: {
          type: true,
        },
      });

    } catch (dbErr) {
      console.warn("DB Offline in user history API, providing empty list:", dbErr);
      dbOffline = true;
    }

    // Build rolling 7 days map in correct order
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dataMap = new Map<string, { day: string; dateStr: string; youtube: number; reels: number; other: number }>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = weekdays[d.getDay()];
      const dateKey = d.toDateString();
      dataMap.set(dateKey, {
        day: dayName,
        dateStr: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        youtube: 0,
        reels: 0,
        other: 0,
      });
    }

    // Populate counts from DB if online
    if (!dbOffline && rawHistory.length > 0) {
      rawHistory.forEach((item) => {
        const dateKey = new Date(item.createdAt).toDateString();
        const dayObj = dataMap.get(dateKey);
        if (dayObj) {
          // Classify types: Youtube (scripts, thumbnails), Reels (hooks, captions), Other (trends, repurpose, score)
          if (item.type === "SCRIPT" || item.type === "THUMBNAIL") {
            dayObj.youtube += 1;
          } else if (item.type === "VIRAL_HOOK" || item.type === "CAPTION") {
            dayObj.reels += 1;
          } else {
            dayObj.other += 1;
          }
        }
      });
    }

    // Map tool distribution
    const toolMap: Record<string, { name: string; count: number; color: string }> = {
      VIRAL_HOOK: { name: "Hooks", count: 0, color: "#7c3aed" },
      CAPTION: { name: "Captions", count: 0, color: "#06b6d4" },
      SCRIPT: { name: "Scripts", count: 0, color: "#ec4899" },
      THUMBNAIL: { name: "Thumbnails", count: 0, color: "#10b981" },
      TREND: { name: "Trends", count: 0, color: "#f59e0b" },
      REPURPOSE: { name: "Repurpose", count: 0, color: "#a855f7" },
    };

    if (!dbOffline && allGenerations.length > 0) {
      allGenerations.forEach((g) => {
        if (toolMap[g.type]) {
          toolMap[g.type].count += 1;
        }
      });
    }

    // Convert distribution map to array ordered by usage counts
    const distribution = Object.values(toolMap).sort((a, b) => b.count - a.count);

    const formattedData = Array.from(dataMap.values());
    return NextResponse.json({
      dbOffline,
      history: formattedData,
      distribution,
    });

  } catch (error: any) {
    return handleRouteError(error, "User history endpoint error");
  }
}
