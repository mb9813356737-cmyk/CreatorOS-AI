import { NextResponse } from "next/server";
import { handleAIGeneration } from "@/lib/ai/route-helper";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, platform, tone, language } = body;
    if (!topic || !platform || !tone || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userPrompt = `Topic: ${topic}\nPlatform: ${platform}\nTone: ${tone}\nLanguage: ${language}`;

    const systemPrompt = SYSTEM_PROMPTS.CAPTION
      .replace("{{topic}}", topic)
      .replace("{{platform}}", platform)
      .replace("{{tone}}", tone)
      .replace("{{language}}", language);

    return await handleAIGeneration({
      type: "CAPTION",
      systemPrompt,
      userPrompt,
      platform,
      language,
      inputData: body,
    });
  } catch (error: any) {
    return handleRouteError(error, "Caption generation error");
  }
}
