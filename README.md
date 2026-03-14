# ReelMatrix — AI Video Content Strategist for DevTools

> Built for the TestSprite Hackathon 2026

**Live Demo:** https://ts-hackathon-hz-dl-m8ic.vercel.app

---

## The Problem

After analyzing TestSprite's marketing posture, we found: active SEO pages, multiple Product Hunt launches, but almost zero short-form video content. This pattern is typical across early-stage DevTool companies.

The core bottleneck is not execution — it's strategy. Teams don't know what narrative to tell, what content mix to use, or how to structure a script for a developer audience.

## The Solution: Three-Tier Content Pyramid

ReelMatrix enforces a proven content architecture:

| Tier | Type | Weight | Purpose |
|------|------|--------|---------|
| Tier 1 | Narrative | 20% | Big-picture industry takes that build audience and authority |
| Tier 2 | Problem-Solution | 40% | Bridge macro trends to specific product value |
| Tier 3 | Demo | 40% | Tactical product demonstrations framed within the larger narrative |

Most DevTool accounts only produce Tier 3 content. This is why they feel flat and fail to build followings.

---

## Key Features

- **AI-driven intake form** — product name, description, target users, and core features
- **Three-tier content matrix** — 20/40/40 tier distribution enforced at the code level
- **Hook + Full version** — every card includes a 30-60 sec Twitter/X hook AND a 2-3 min YouTube version
- **Publishing rhythm** — Week 1/2/3 narrative arc with production cost (Low/Medium/High)
- **⭐ Start Here marker** — tells you which single video to make first
- **Single card regeneration** — refresh one card without regenerating the whole matrix
- **Expand Script** — click to reveal full platform-specific script concepts
- **One-click copy** — copy any card's full brief to clipboard
- **Core Narrative** — AI distills your product into a one-sentence positioning statement
- **localStorage persistence** — generated matrix survives page reload
- **Client-side validation** — per-field inline error messages before any API call

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| AI Engine | Claude API (`claude-haiku-4-5`) |
| Deployment | Vercel |
| Testing | TestSprite MCP |

---

## How TestSprite Was Used

TestSprite MCP was integrated as the primary QA layer from day one. All test cases are committed in the `testsprite_tests/` directory. Tests were run continuously as features were built, and TestSprite caught several real bugs that manual testing missed.

### Bugs Found and Fixed by TestSprite

**1. TC006 — Tier headings not found on page load**
The matrix was only rendering after form submission. TestSprite caught that a fresh browser context always saw a blank page.
- **Fix:** Persisted the last generated matrix to `localStorage` and seeded the page with a hardcoded sample matrix on first visit.

**2. TC008 / TC010 / TC011 — Badge label prefixes missing**
`Format`, `Angle`, and `Goal` badges were rendering raw values with no label text.
- **Fix:** Added `"Format:"`, `"Angle:"`, and `"Goal:"` prefix strings to all badge components.

**3. TC001 — Matrix not rendering after API response**
State was being set correctly but the component's conditional render logic was not re-evaluating after the state update.
- **Fix:** Corrected the conditional render logic so the matrix panel updates immediately when the API response arrives.

### Test Pass Rate Progression

| Run | Tests | Pass Rate | Notes |
|-----|-------|-----------|-------|
| Run 1 | 12 | 66.7% | Before any fixes |
| Run 2 | 13 | 46.2% | After fixes 1–5 |
| Run 3 | 15 | 53.3% | After localStorage persistence |
| Run 4 | 11 | **100%** | After sample matrix — final |

---

## How to Run Locally
```bash
git clone https://github.com/HarryZ66/TS-Hackathon-HZ-DL.git
cd TS-Hackathon-HZ-DL
npm install
```

Create a `.env.local` file in the project root:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your API key at [console.anthropic.com](https://console.anthropic.com).
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Project Structure
```
reelmatrix/
├── app/
│   ├── api/generate/route.ts     # POST /api/generate — Claude API call
│   ├── layout.tsx
│   └── page.tsx                  # Main UI: intake form + matrix display
├── public/                       # Screenshots
├── testsprite_tests/             # All TestSprite test cases + reports
└── README.md
```

---

## Roadmap

- **Phase 2:** Performance feedback loop — feed engagement data back to refine future content suggestions
- **Phase 3:** Content reuse engine — automatically repurpose hackathon notes and support FAQs into content briefs
- **Phase 4:** Multi-product comparison view — run two DevTools side by side to compare content strategies

---

## Team

Built by **Pengcheng LU, Harry Zhang ** — University of Washington MSIM

---

## License

MIT
