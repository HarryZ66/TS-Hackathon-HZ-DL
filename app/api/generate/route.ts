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
  hookVersion: string;
  fullVersion: string;
};

export type ContentMatrix = {
  tier1: ContentItem[];
  tier2: ContentItem[];
  tier3: ContentItem[];
  coreNarrative: string;
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
        content: `You are ReelMatrix, an AI video content strategist for DevTool companies.

Generate a 3-tier video content matrix for this product:

Product: ${productName}
Description: ${description}
Target Users: ${targetUsers}
Core Features: ${coreFeatures}
${pastContent ? `Past Content / Notes: ${pastContent}` : ""}

Each tier targets a specific audience:
- Tier 1 (Narrative): For Founders & Tech Leaders — big-picture industry takes
- Tier 2 (Problem-Solution): For Tech Leads & Senior Devs — bridge trends to product value
- Tier 3 (Product Demo): For Individual Developers — tactical product demonstrations

IMPORTANT: Return ONLY raw JSON, no markdown, no backticks. Start with { and end with }.

Required structure:
{
  "coreNarrative": "One sentence that captures the core narrative direction for this product's video content strategy",
  "tier1": [
    {
      "title": "...",
      "description": "...",
      "format": "...",
      "channel": "...",
      "angle": "...",
      "tier_goal": "...",
      "tier": 1,
      "hookVersion": "30-60 second hook version description",
      "fullVersion": "2-3 minute full version description"
    }
  ],
  "tier2": [ /* same shape, tier: 2 */ ],
  "tier3": [ /* same shape, tier: 3 */ ]
}

Generate exactly 2 items per tier. hookVersion and fullVersion are brief descriptions (1-2 sentences each) of how to adapt the content for those formats.`,
      },
    ],
  });

  try {
    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const matrix = JSON.parse(cleaned) as ContentMatrix;
    return NextResponse.json(matrix);
  } catch (e) {
    console.error("Parse error:", e);
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  }
}
