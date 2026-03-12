import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export type ContentItem = {
  title: string;
  description: string;
  format: string;
  channel: string;
  angle: string;
  tier_goal: string;
  tier: 1 | 2 | 3;
  hook_version: string;
  full_version: string;
  production_cost: "Low" | "Medium" | "High";
  publish_week: 1 | 2 | 3;
  priority: boolean;
};

export type ContentMatrix = {
  tier1: ContentItem[];
  tier2: ContentItem[];
  tier3: ContentItem[];
  core_narrative: string;
};

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const { productName, description, targetUsers, coreFeatures, pastContent } = await req.json();

  if (!productName || !description || !targetUsers || !coreFeatures) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are ReelMatrix, an AI video content strategist for DevTool companies in the Vibe Coding era. You think like a pragmatic marketing lead at a seed-stage startup with 1 person doing video content.

Generate a 3-tier video content matrix for this product:

Product: ${productName}
Description: ${description}
Target Users: ${targetUsers}
Core Features: ${coreFeatures}
${pastContent ? `Past Content / Hackathon Notes: ${pastContent}` : ""}

IMPORTANT RULES:
1. Every video must have TWO versions: a 30-60 second "hook version" for Twitter/X virality, and a 2-3 minute "full version" for YouTube
2. Assign a publish_week (1, 2, or 3) to create a narrative arc — week 1 starts concrete/specific, week 3 ends with big-picture industry story
3. Mark exactly ONE item as priority:true this is the single best video to make first if the team only has time for one
4. production_cost must be realistic: Low = screen recording + text overlay (half day), Medium = some editing + voiceover (1-2 days), High = scripted + shot footage (3+ days)
5. Prefer Low and Medium production costs — this is a small team
6. Tier 3 week 1 content should ALWAYS be the priority item — start with the most concrete, lowest-cost, highest-virality content

Tier targeting:
- Tier 1 (Narrative): Founders & Tech Leaders — big picture, industry framing
- Tier 2 (Problem-Solution): Tech Leads & Senior Devs — technical credibility  
- Tier 3 (Product Demo): Individual Developers — hands-on magic moments

IMPORTANT: Return ONLY raw JSON, no markdown, no backticks. Start with { and end with }.

{"core_narrative":"one sentence positioning statement","tier1":[{"title":"...","description":"...","format":"...","channel":"...","angle":"...","tier_goal":"...","tier":1,"hook_version":"30-60 sec version concept","full_version version concept","production_cost":"Low","publish_week":3,"priority":false}],"tier2":[{"title":"...","description":"...","format":"...","channel":"...","angle":"...","tier_goal":"...","tier":2,"hook_version":"...","full_version":"...","production_cost":"Low","publish_week":2,"priority":false}],"tier3":[{"title":"...","description":"...","format":"...","channel":"...","angle":"...","tier_goal":"...","tier":3,"hook_version":"...","full_version":"...","production_cost":"Low","publish_week":1,"priority":true}]}

Generate exactly 2 items per tier. Do not add any extra fields outside of tier1, tier2, tier3, core_narrative.`,
      },
    ],
  });

  try {
    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    const matrix = {
      tier1: parsed.tier1,
      tier2: parsed.tier2,
      tier3: parsed.tier3,
      core_narrative: parsed.core_narrative,
    };
    return NextResponse.json(matrix);
  } catch (e) {
    console.error("Parse error:", e);
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  }
}
