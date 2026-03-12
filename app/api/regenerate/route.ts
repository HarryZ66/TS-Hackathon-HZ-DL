import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ContentItem } from "../generate/route";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const { tier, index, productName, description, targetUsers, coreFeatures } = await req.json();

  if (!tier || index === undefined || !productName || !description || !targetUsers || !coreFeatures) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const tierAudience =
    tier === 1
      ? "Founders & Tech Leaders — big-picture narrative/thought leadership"
      : tier === 2
      ? "Tech Leads & Senior Devs — problem-solution bridging macro trends to product value"
      : "Individual Developers — tactical product demo";

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `You are ReelMatrix, an AI video content strategist for DevTool companies.

Regenerate a single Tier ${tier} content card for this product:

Product: ${productName}
Description: ${description}
Target Users: ${targetUsers}
Core Features: ${coreFeatures}

This is Tier ${tier} — audience: ${tierAudience}

Generate ONE fresh content idea that is different from what might have been generated before.

Return ONLY raw JSON, no markdown, no backticks. Start with { and end with }.

{
  "title": "...",
  "description": "...",
  "format": "...",
  "channel": "...",
  "angle": "...",
  "tier_goal": "...",
  "tier": ${tier},
  "hookVersion": "30-60 second hook version description",
  "fullVersion": "2-3 minute full version description"
}`,
      },
    ],
  });

  try {
    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const item = JSON.parse(cleaned) as ContentItem;
    return NextResponse.json(item);
  } catch (e) {
    console.error("Regenerate parse error:", e);
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  }
}
