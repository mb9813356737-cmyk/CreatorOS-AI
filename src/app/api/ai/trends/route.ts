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
      systemPrompt = `You are an expert YouTube competitor analysis strategist and content intelligence analyst.

The user will provide:
- COMPETITOR: competitor channel name or URL or niche description
- PLATFORM: one of (YouTube / Instagram / TikTok / LinkedIn)

Analyze this competitor deeply and extract actionable intelligence.

Return ONLY a valid JSON object. No preamble, no explanation, no markdown, no backticks.

Return this exact structure:

{
  "competitor": "competitor name or channel as provided",
  "platform": "user platform exactly as provided",
  "spy_summary": "2 sentence overview of what makes this competitor successful",
  "content_strategy": {
    "posting_frequency": "e.g. 3 times per week",
    "best_performing_format": "e.g. Listicles, Tutorials, Vlogs",
    "average_video_length": "e.g. 8 to 12 minutes",
    "hook_style": "How they hook viewers in first 10 seconds",
    "thumbnail_style": "Their thumbnail pattern and psychology",
    "title_formula": "Their title writing pattern with example"
  },
  "top_content_pillars": [
    {
      "pillar": "Content pillar name",
      "why_it_works": "One sentence explanation",
      "steal_this_angle": "How you can do this better or differently"
    }
  ],
  "weakness_gaps": [
    {
      "weakness": "What this competitor does poorly or ignores",
      "opportunity": "How you can fill this gap and win audience from them"
    }
  ],
  "viral_patterns": [
    {
      "pattern": "Specific pattern in their viral content",
      "example": "Example of how to apply this pattern",
      "viral_trigger": "The psychological trigger being used"
    }
  ],
  "steal_worthy_ideas": [
    "Idea 1 — specific content idea inspired by their strategy but with your unique angle",
    "Idea 2 — topic they covered that you can cover better",
    "Idea 3 — their best format applied to your niche",
    "Idea 4 — their audience pain point you can solve better",
    "Idea 5 — trending topic in their channel you can jump on"
  ],
  "counter_strategy": "2 sentence plan on exactly how to compete and beat this competitor",
  "pro_tip": "One highly specific actionable tip to outperform this competitor"
}

CONTENT PILLARS RULES:
- Generate exactly 4 content pillars
- Each pillar must be specific to the competitor provided
- steal_this_angle must be genuinely unique and actionable

WEAKNESS GAPS RULES:
- Generate exactly 3 weakness gaps
- Must be realistic weaknesses common in this type of creator
- opportunity must be specific and immediately actionable

VIRAL PATTERNS RULES:
- Generate exactly 3 viral patterns
- Must reflect real patterns used in this niche
- viral_trigger must name the exact psychological trigger

STRICT RULES:
- Return ONLY the JSON object, nothing else
- Every field must be filled, never empty or null
- steal_worthy_ideas must have exactly 5 items
- Do not add any text before or after the JSON object`;
      userPrompt = `Competitor: ${competitorHandle}\nPlatform: ${platform}`;
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
