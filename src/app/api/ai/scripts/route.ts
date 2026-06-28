import { NextResponse } from "next/server";
import { handleAIGeneration } from "@/lib/ai/route-helper";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, duration, platform, language, additionalContext } = body;
    if (!topic || !duration || !platform || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userPrompt = `Topic: ${topic}
Duration: ${duration}
Platform: ${platform}
Language: ${language}${additionalContext ? `\nAdditional Context: ${additionalContext}` : ""}

Generate a ${duration} ${platform} script in ${language} language mode.`;

    return await handleAIGeneration({
      type: "SCRIPT",
      systemPrompt: SYSTEM_PROMPTS.SCRIPT,
      userPrompt,
      platform,
      language,
      inputData: body,
      options: { maxTokens: 4000 },
    });
  } catch (error: unknown) {
    return handleRouteError(error, "Script generation error");
  }
}
