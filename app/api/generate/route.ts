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
};

export type ContentMatrix = {
  tier1: ContentItem[];
  tier2: ContentItem[];
  tier3: ContentItem[];
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
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are ReelMatrix, an AI video content strategist for DevTool companies in the Vibe Coding era. DevTools need to position themselves as the "verification layer" in the AI-native development workflow.

Generate a 3-tier video content matrix for this product:

Product: ${productName}
Description: ${description}
Target Users: ${targetUsers}
Core Features: ${coreFeatures}
${pastContent ? `Past Content / Hackathon Notes: ${pastContent}` : ""}

Each tier targets a specific audience:
- Tier 1 (Narrative): For Founders & Tech Leaders
- Tier 2 (Problem-Solution): For Tech Leads & Senior Devs
- Tier 3 (Product Demo): For Individual Developers

IMPORTANT: Return ONLY raw JSON, no markdown, no backticks, no explanation. Start your response with { and end with }.

{"tier1":[{"title":"...","description":"...","format":"...","channel":"...","angle":"...","tier_goal":"...","tier":1}],"tier2":[{"title":"...","description":"...","format":"...","channel":"...","angle":"...","tier_goal":"...","tier":2}],"tier3":[{"title":"...","description":"...","format":"...","channel":"...","angle":"...","tier_goal":"...","tier":3}]}

Generate exactly 2 items per tier. Do not add any extra fields outside of tier1, tier2, tier3.`,
      },
    ],
  });

  try {
    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    // Strip markdown code blocks if present
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const matrix = JSON.parse(cleaned) as ContentMatrix;
    return NextResponse.json(matrix);
  } catch (e) {
    console.error("Parse error:", e);
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  }
}
