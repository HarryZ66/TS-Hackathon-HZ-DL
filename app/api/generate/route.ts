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

  const { productName, description, targetUsers, coreFeatures } = await req.json();

  if (!productName || !description || !targetUsers || !coreFeatures) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are ReelMatrix, an AI video content strategist for DevTool companies.
Generate a 3-tier video content matrix for this product:

Product: ${productName}
Description: ${description}
Target Users: ${targetUsers}
Core Features: ${coreFeatures}

Return ONLY a JSON object with this exact structure, no markdown:
{
  "tier1": [
    {"title":"...","description":"...","format":"...","channel":"...","angle":"...","tier_goal":"...","tier":1}
  ],
  "tier2": [
    {"title":"...","description":"...","format":"...","channel":"...","angle":"...","tier_goal":"...","tier":2}
  ],
  "tier3": [
    {"title":"...","description":"...","format":"...","channel":"...","angle":"...","tier_goal":"...","tier":3}
  ]
}

Generate 2 items per tier. Tier 1 = narrative/thought leadership, Tier 2 = problem-solution, Tier 3 = product demo.`,
      },
    ],
  });

  try {
    const text = message.content[0].type === "text" ? message.content[0].text : "";
const clean = text.replace(/```json|```/g, "").trim();
const matrix = JSON.parse(clean) as ContentMatrix;
    return NextResponse.json(matrix);
  } catch (e) {
    console.error("API Error:", e);
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  }
}
