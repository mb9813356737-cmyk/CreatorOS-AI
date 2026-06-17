import { NextResponse } from "next/server";
import { handleAIGeneration } from "@/lib/ai/route-helper";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { niche, competitorHandle, platform } = body;
    if ((!niche && !competitorHandle) || !platform) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let userPrompt = "";
    let systemPrompt: string = SYSTEM_PROMPTS.TREND;

    if (competitorHandle) {
      systemPrompt = `You are a social media research specialist and competitive intelligence analyst. Analyze the competitor's social media handle, profile metrics, and their top performing content. Extract their top 3 viral videos, dissect the psychology of their hooks, and generate 2 higher-converting iteration suggestions for each.
      
      OUTPUT FORMAT:
      You MUST return a JSON object with the following structure:
      {
        "competitor": {
          "handle": "string (the competitor handle)",
          "niche": "string (their content category)",
          "subscribers": "string (estimated audience size)",
          "avg_views": "string (estimated average views/reach)"
        },
        "top_videos": [
          {
            "title": "string (viral video title)",
            "views": "string (e.g. '1.5M views')",
            "upload_date": "string (recency)",
            "ctr_estimate": "string (estimated CTR range, e.g. '10.5%')",
            "hook_analysis": "string (why the hook/angle succeeded)",
            "iteration_suggestions": string[] (2 high-ctr title/concept iterations based on their hook structure)
          }
        ]
      }`;
      userPrompt = `Analyze competitor: ${competitorHandle}\nPlatform: ${platform}`;
    } else {
      userPrompt = `Niche: ${niche}\nPlatform: ${platform}`;
    }

    return await handleAIGeneration({
      type: "TREND",
      systemPrompt,
      userPrompt,
      platform,
      inputData: body,
    });
  } catch (error: any) {
    return handleRouteError(error, "Trends generation error");
  }
}
