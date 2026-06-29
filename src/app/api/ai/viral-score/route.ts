import { NextResponse } from "next/server";
import { handleAIGeneration } from "@/lib/ai/route-helper";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      videoTitle, 
      thumbnailText, 
      scrollStopHook, 
      videoScript, 
      platform, 
      thumbnailImage,
      title,
      hook,
      script,
      sourceContent
    } = body;
    
    if (!platform && !sourceContent && !title && !hook && !script && !thumbnailText && !videoTitle && !scrollStopHook && !videoScript) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let userPrompt = "";
    if (sourceContent) {
      userPrompt = `Content to Analyze:\n${sourceContent}\nPlatform: ${platform}`;
    } else {
      const t = videoTitle || title || "N/A";
      const h = scrollStopHook || hook || "N/A";
      const s = videoScript || script || "N/A";
      const tt = thumbnailText || "N/A";
      const img = thumbnailImage ? "Provided (Base64 Image)" : "N/A";

      userPrompt = `VIDEO_TITLE: ${t}\nTHUMBNAIL_TEXT: ${tt}\nSCROLL_STOP_HOOK: ${h}\nVIDEO_SCRIPT: ${s}\nPLATFORM: ${platform}\nTHUMBNAIL_IMAGE: ${img}`;
    }

    return await handleAIGeneration({
      type: "VIRAL_SCORE",
      systemPrompt: SYSTEM_PROMPTS.VIRAL_SCORE,
      userPrompt,
      platform,
      inputData: body,
      options: {
        maxTokens: 3000,
      },
    });
  } catch (error: any) {
    return handleRouteError(error, "Viral score generation error");
  }
}
