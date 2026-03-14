# ReelMatrix — AI Video Content Strategist for DevTools

> Built for the **TestSprite Hackathon 2026**

---

## What We Built

ReelMatrix is an AI agent that acts as a specialized short-video content strategist for developer-tool companies. It takes your product name, description, target users, and core features as input, and outputs a structured, narrative-driven, three-tier video content plan with shoot-ready scripts — calibrated specifically for developer audiences.

## Live Demo

https://ts-hackathon-hz-dl-m8ic.vercel.app

---

## The Problem

DevTool companies targeting small dev teams produce almost zero short-form video content despite it being the highest-ROI organic channel. The core bottleneck is not execution — it's strategy. Teams don't know what narrative to tell, what content mix to use, or how to structure a script for a developer audience.

## The Solution: Three-Tier Content Pyramid

ReelMatrix enforces a proven content architecture:

| Tier | Type | Weight | Purpose |
|---|---|---|---|
| **Tier 1** | Narrative | 20% | Big-picture industry takes that build audience and authority |
| **Tier 2** | Problem-Solution | 40% | Bridge macro trends to specific product value |
| **Tier 3** | Demo | 40% | Tactical product demonstrations framed within the larger narrative |

Most DevTool accounts only produce Tier 3 content. This is why they feel flat and fail to build followings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| AI Engine | Claude API (`claude-haiku-4-5`) with narrative framework system prompts |
| Deployment | Vercel |
| Testing | TestSprite MCP — continuous UI and API testing throughout development |

---

## Key Features

- **AI-driven intake form** — product name, description, target users, and core features
- **Three-tier content matrix** — 20/40/40 tier distribution enforced at the code level, not delegated to the LLM
- **Labeled card metadata** — every card shows Format, Channel, Angle, and Goal with explicit prefixes
- **localStorage persistence** — generated matrix is visible on every page load without re-generating
- **Built-in sample matrix** — a hardcoded example matrix is shown on first visit so the UI is never blank
- **Client-side validation** — per-field inline error messages before any API call is made
- **Differentiated error handling** — network errors, timeout errors, and API errors shown separately with distinct messages
- **30-second request timeout** — client-side abort with retry prompt if the Claude API stalls
- **Developer tone guardrails** — anti-fluff filter built into every generated script via system prompt design

---

## How TestSprite Was Used

TestSprite MCP was integrated as the primary QA layer from day one. All test cases are committed in the `testsprite_tests/` directory. Tests were run continuously as features were built, and TestSprite caught several real bugs that manual testing missed.

### Bugs Found and Fixed by TestSprite

**1. TC006 — Tier headings not found on page load**
The matrix was only rendering after form submission. TestSprite caught that the test agent loaded a fresh browser context with no prior generation, so card-display tests always saw a blank page.
- **Fix:** Persisted the last generated matrix to `localStorage` and seeded the page with a hardcoded sample matrix on first visit — tier headings and card fields are now always visible without requiring a prior generation.

**2. TC008 / TC010 / TC011 — Badge label prefixes missing**
`Format`, `Angle`, and `Goal` badges were rendering raw values inside unstyled `<span>` elements with no label text. TestSprite caught the inconsistency (the `Channel` test passed while `Format`, `Angle`, and `Goal` failed) because the test agent could not distinguish which badge was which.
- **Fix:** Added `"Format:"`, `"Angle:"`, and `"Goal:"` prefix strings to all badge components, matching the existing `"Channel:"` prefix.

**3. TC001 — Matrix not rendering after API response**
State was being set correctly but the component's conditional render logic was not re-evaluating after the state update. TestSprite caught this through the full end-to-end generation flow test.
- **Fix:** Corrected the conditional render logic so the matrix panel updates immediately when the API response arrives.

### Test Coverage

| Area | Test Cases |
|---|---|
| Form validation | TC002–TC005: all four required fields show inline errors when empty |
| Content matrix rendering | TC001, TC006–TC013: tier headings, card fields, badge label prefixes |
| localStorage persistence | TC010–TC011: matrix survives page reload; sample banner hidden after generation |
| Error state differentiation | network / timeout / API errors shown with distinct titles and messages |
| Card visibility | card-title, card-script, card-format, card-channel, card-angle, card-goal |

### Pass Rate Progression

| Run | Tests | Pass Rate | Notes |
|---|---|---|---|
| Run 1 | 12 | 66.7% | Before any fixes |
| Run 2 | 13 | 46.2% | After fixes 1–5 (new tests generated) |
| Run 3 | 15 | 53.3% | After localStorage persistence |
| **Run 4** | **11** | **100%** | After sample matrix — final |

---

## Project Structure

```
reelmatrix/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # POST /api/generate — Claude API call
│   ├── layout.tsx
│   └── page.tsx                  # Main UI: intake form + matrix display
├── lib/
│   ├── fetchWithTimeout.js       # fetch() wrapper with 30s AbortController timeout
│   ├── validateIntake.js         # Client-side form validation
│   └── errorMessages.js          # Typed error message factory (timeout/network/api/unknown)
├── testsprite_tests/
│   ├── testsprite_frontend_test_plan.json
│   ├── testsprite-mcp-test-report.md
│   └── tmp/                      # Raw test output and code summary
└── README.md
```

---

## How to Run Locally

```bash
git clone https://github.com/HarryZ66/TS-Hackathon-HZ-DL.git
cd TS-Hackathon-HZ-DL
npm install
```

Create a `.env.local` file in the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your Anthropic API key at [console.anthropic.com](https://console.anthropic.com).

Then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm run start
```

---

## API Reference

### `POST /api/generate`

Generates a three-tier video content matrix for a given product.

**Request body**

```json
{
  "productName": "string (required)",
  "description": "string (required)",
  "targetUsers": "string (required)",
  "coreFeatures": "string (required)"
}
```

**Response `200`**

```json
{
  "tier1": [
    {
      "title": "string",
      "description": "string",
      "format": "string",
      "channel": "string",
      "angle": "string",
      "tier_goal": "string",
      "tier": 1
    }
  ],
  "tier2": [ /* same shape, tier: 2 */ ],
  "tier3": [ /* same shape, tier: 3 */ ]
}
```

**Error responses**

| Status | Cause |
|---|---|
| `400` | One or more required fields missing |
| `500` | `ANTHROPIC_API_KEY` not set, or Claude response could not be parsed |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key for Claude model access |

---

## License

MIT
