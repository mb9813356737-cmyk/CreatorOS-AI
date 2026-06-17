import { NextResponse } from "next/server";
import { handleAIGeneration } from "@/lib/ai/route-helper";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, platform, tone } = body;
    if (!topic || !platform || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userPrompt = `Topic: ${topic}\nPlatform: ${platform}\nTone: ${tone}`;

    return await handleAIGeneration({
      type: "VIRAL_HOOK",
      systemPrompt: SYSTEM_PROMPTS.VIRAL_HOOK,
      userPrompt,
      platform,
      inputData: body,
    });
  } catch (error: any) {
    return handleRouteError(error, "Viral hook generation error");
  }
}
