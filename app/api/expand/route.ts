import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export type ExpandedScript = {
  hook: string;
  full: string;
  shots: string[];
};

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const { title, description, tier, productContext } = await req.json();

  if (!title || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are ReelMatrix, an expert video scriptwriter for developer-tool companies.

Expand the following content idea into detailed scripts:

Title: ${title}
Description: ${description}
Tier: ${tier} ${tier === 1 ? "(Narrative — for Founders & Tech Leaders)" : tier === 2 ? "(Problem-Solution — for Tech Leads)" : "(Product Demo — for Individual Developers)"}
${productContext ? `Product Context: ${productContext}` : ""}

Write shoot-ready scripts calibrated for a developer audience. Avoid corporate fluff — be direct, specific, and technical where appropriate.

Return ONLY raw JSON, no markdown, no backticks. Start with { and end with }.

{
  "hook": "Full word-for-word 30-60 second hook script. Open with a bold statement or question that stops the scroll. Include spoken words, not just a description.",
  "full": "Full word-for-word 2-3 minute script. Include intro, main argument with 2-3 supporting points, and a clear call to action. Write as spoken words.",
  "shots": [
    "Shot 1: describe exactly what appears on screen",
    "Shot 2: describe exactly what appears on screen",
    "Shot 3: describe exactly what appears on screen",
    "Shot 4: describe exactly what appears on screen"
  ]
}`,
      },
    ],
  });

  try {
    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const result = JSON.parse(cleaned) as ExpandedScript;
    return NextResponse.json(result);
  } catch (e) {
    console.error("Expand parse error:", e);
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  }
}
