"use client";
import { useState } from "react";
import type { ContentMatrix, ContentItem } from "./api/generate/route";
import { fetchWithTimeout } from "../lib/fetchWithTimeout";
import { validateIntakeForm } from "../lib/validateIntake";
import { getErrorMessage } from "../lib/errorMessages";

type FieldErrors = Record<string, string>;
type ErrorInfo = { type: string; title: string; message: string; action: string } | null;


const STORAGE_KEY = "reelmatrix_last_result";

const SAMPLE_MATRIX: ContentMatrix = {
  tier1: [
    { tier: 1, title: "The Founder's Story", description: "Why we built this — a personal narrative about the problem we experienced and why existing tools failed us.", format: "Long-form video", channel: "YouTube", angle: "Founder story", tier_goal: "Build brand trust and audience connection" },
    { tier: 1, title: "The Future of Developer Workflows", description: "Thought leadership piece on where the industry is heading and how modern DevTools are reshaping daily engineering.", format: "Webinar", channel: "LinkedIn", angle: "Industry vision", tier_goal: "Establish category authority" },
  ],
  tier2: [
    { tier: 2, title: "Stop Wasting Time on Manual Setup", description: "Side-by-side comparison showing how much time teams save by replacing manual config with automated tooling.", format: "Short-form video", channel: "Twitter / X", angle: "Time-savings", tier_goal: "Drive trial sign-ups from pain-aware audience" },
    { tier: 2, title: "Why Your CI Pipeline Keeps Breaking", description: "Diagnoses the most common root causes of flaky pipelines and positions the product as the fix.", format: "Tutorial video", channel: "YouTube", angle: "Problem diagnosis", tier_goal: "Capture search-intent traffic from frustrated devs" },
  ],
  tier3: [
    { tier: 3, title: "5-Minute Onboarding Walkthrough", description: "Screen-recorded demo showing a new user going from zero to first successful run in under 5 minutes.", format: "Demo video", channel: "Product page", angle: "Speed to value", tier_goal: "Reduce drop-off during trial conversion" },
    { tier: 3, title: "Advanced Features Deep Dive", description: "Power-user walkthrough of integrations, custom config, and team collaboration features.", format: "Tutorial video", channel: "YouTube", angle: "Power user appeal", tier_goal: "Expand usage and reduce churn among existing users" },
  ],
};

export default function Home() {
  const [form, setForm] = useState({ productName: "", description: "", targetUsers: "", coreFeatures: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [matrix, setMatrix] = useState<ContentMatrix>(() => {
    if (typeof window === "undefined") return SAMPLE_MATRIX;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as ContentMatrix) : SAMPLE_MATRIX;
    } catch {
      return SAMPLE_MATRIX;
    }
  });
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo>(null);
  const [isSample, setIsSample] = useState(() => {
    if (typeof window === "undefined") return true;
    return !localStorage.getItem(STORAGE_KEY);
  });

  const handleSubmit = async () => {
    setErrorInfo(null);

    // Fix 4: client-side validation before API call
    const { isValid, errors } = validateIntakeForm(form);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      // Fix 3: fetchWithTimeout replaces bare fetch()
      const res = await fetchWithTimeout(
        "/api/generate",
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) },
        30000
      );
      if (!res.ok) {
        const err = new Error("API error") as Error & { status: number; statusText: string };
        err.status = res.status;
        err.statusText = res.statusText;
        throw err;
      }
      const data = await res.json();
      setMatrix(data);
      setIsSample(false);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
    } catch (err: unknown) {
      // Fix 5: differentiated error messages
      setErrorInfo(getErrorMessage(err as Error & { status?: number; statusText?: string }));
    } finally {
      setLoading(false);
    }
  };

  const tierColors: Record<number, string> = { 1: "border-purple-500", 2: "border-blue-500", 3: "border-green-500" };
  const tierLabels: Record<number, string> = { 1: "🎯 Tier 1 — Narrative", 2: "🔗 Tier 2 — Problem-Solution", 3: "🎬 Tier 3 — Product Demo" };

  // Fix 1 + Fix 2: label prefixes and data-testid on every card field
  const Card = ({ item }: { item: ContentItem }) => (
    <div className={`border-l-4 ${tierColors[item.tier]} bg-slate-800 rounded-lg p-4 space-y-2`}>
      <h3 data-testid="card-title" className="text-white font-bold">{item.title}</h3>
      <p data-testid="card-script" className="text-slate-300 text-sm">{item.description}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span data-testid="card-format" className="bg-slate-700 text-slate-200 px-2 py-1 rounded">Format: {item.format}</span>
        <span data-testid="card-channel" className="bg-slate-700 text-slate-200 px-2 py-1 rounded">Channel: {item.channel}</span>
        <span data-testid="card-angle" className="bg-slate-700 text-slate-200 px-2 py-1 rounded">Angle: {item.angle}</span>
      </div>
      <p data-testid="card-goal" className="text-slate-400 text-xs">Goal: {item.tier_goal}</p>
    </div>
  );

  const fields = [
    { key: "productName", label: "Product Name", multiline: false },
    { key: "description", label: "Product Description", multiline: true },
    { key: "targetUsers", label: "Target Users", multiline: true },
    { key: "coreFeatures", label: "Core Features", multiline: true },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">ReelMatrix</h1>
          <p className="text-slate-400 mt-2">AI Video Content Strategist for DevTool Companies</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 rounded-xl p-6 space-y-4 h-fit">
            <h2 className="text-xl font-semibold">Product Information</h2>
            {fields.map(({ key, label, multiline }) => (
              <div key={key}>
                <label className="block text-sm text-slate-400 mb-1">{label}</label>
                {multiline ? (
                  <textarea
                    className="w-full bg-slate-700 rounded-lg p-3 text-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  />
                ) : (
                  <input
                    className="w-full bg-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  />
                )}
                {/* Fix 4: per-field validation error */}
                {fieldErrors[key] && (
                  <p data-testid={`error-${key}`} className="text-red-400 text-xs mt-1">
                    {fieldErrors[key]}
                  </p>
                )}
              </div>
            ))}
            {/* Fix 5: differentiated error display */}
            {errorInfo && (
              <div data-testid={`error-${errorInfo.type}`} className="bg-red-900/40 border border-red-700 rounded-lg p-3 space-y-1">
                <p className="text-red-300 text-sm font-semibold">{errorInfo.title}</p>
                <p className="text-red-400 text-xs">{errorInfo.message}</p>
                <button
                  onClick={handleSubmit}
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  {errorInfo.action}
                </button>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Generating..." : "Generate Content Matrix"}
            </button>
          </div>
          <div className="space-y-6">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="bg-slate-800 rounded-xl p-4 animate-pulse h-24" />)}
              </div>
            )}
            {!loading && (
              <>
                {isSample && (
                  <div className="bg-slate-700/40 border border-slate-600 rounded-lg px-4 py-2 text-xs text-slate-400">
                    Sample matrix — fill in the form and click Generate to create your own
                  </div>
                )}
                {/* Fix 2: data-testid on tier headings */}
                {[1, 2, 3].map(tier => (
                  <div key={tier}>
                    <h2
                      data-testid={`tier-heading-${tier}`}
                      className="text-lg font-semibold mb-3"
                    >
                      {tierLabels[tier]}
                    </h2>
                    <div className="space-y-3">
                      {matrix[`tier${tier}` as keyof ContentMatrix].map((item, i) => (
                        <Card key={i} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
