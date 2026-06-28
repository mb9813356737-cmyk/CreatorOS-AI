import { NextResponse } from "next/server";
import { handleAIGeneration } from "@/lib/ai/route-helper";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, tone, mode, additionalContext } = body;
    const selectedMode = mode || tone;
    if (!topic || !selectedMode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userPrompt = `Topic/Concept: ${topic}\nCreative Mode: ${selectedMode}${
      additionalContext ? `\nAdditional Context: ${additionalContext}` : ""
    }`;

    return await handleAIGeneration({
      type: "THUMBNAIL",
      systemPrompt: SYSTEM_PROMPTS.THUMBNAIL,
      userPrompt,
      inputData: body,
      options: { maxTokens: 2000 },
    });
  } catch (error: any) {
    return handleRouteError(error, "Thumbnail concept generation error");
  }
}
