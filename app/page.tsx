"use client";
import { useState } from "react";
import type { ContentMatrix, ContentItem } from "./api/generate/route";
import type { ExpandedScript } from "./api/expand/route";

type FieldErrors = Record<string, string>;

const TIER_CONFIG = {
  1: {
    label: "Narrative",
    audience: "For: Founders & Tech Leaders",
    activeBg: "bg-purple-600",
    audienceBg: "bg-purple-500/20 text-purple-300",
    cardBorder: "border-purple-500",
    icon: "🎯",
  },
  2: {
    label: "Problem-Solution",
    audience: "For: Tech Leads & Senior Devs",
    activeBg: "bg-blue-600",
    audienceBg: "bg-blue-500/20 text-blue-300",
    cardBorder: "border-blue-500",
    icon: "🔗",
  },
  3: {
    label: "Product Demo",
    audience: "For: Individual Developers",
    activeBg: "bg-green-600",
    audienceBg: "bg-green-500/20 text-green-300",
    cardBorder: "border-green-500",
    icon: "🎬",
  },
};

function Card({
  item,
  index,
  form,
  onRegenerate,
}: {
  item: ContentItem;
  index: number;
  form: Record<string, string>;
  onRegenerate: (tier: number, index: number) => void;
}) {
  const config = TIER_CONFIG[item.tier];
  const id = `tier${item.tier}-${index}`;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [expandedScript, setExpandedScript] = useState<ExpandedScript | null>(null);
  const [expanding, setExpanding] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const isCopied = copiedId === id;

  const copyToClipboard = () => {
    const text = `${item.title}\n\n${item.description}\n\nFormat: ${item.format}\nChannel: ${item.channel}\nAngle: ${item.angle}\nGoal: ${item.tier_goal}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (expandedScript) {
      setExpanded(true);
      return;
    }
    setExpanding(true);
    try {
      const res = await fetch("/api/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          tier: item.tier,
          productContext: `${form.productName} — ${form.description}`,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data: ExpandedScript = await res.json();
      setExpandedScript(data);
      setExpanded(true);
    } catch {
      // silently fail — button just resets
    } finally {
      setExpanding(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    onRegenerate(item.tier, index);
  };

  return (
    <div
      data-testid={`card-tier${item.tier}-${index}`}
      className={`border-l-4 ${config.cardBorder} bg-slate-800/80 rounded-xl p-5 space-y-3 transition-all duration-200 hover:bg-slate-800`}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h3 data-testid="card-title" className="text-white font-bold text-base leading-snug flex-1">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Regenerate icon */}
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            title="Regenerate this card"
            className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition disabled:opacity-40"
          >
            <svg
              className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
          {/* Copy */}
          <button
            onClick={copyToClipboard}
            className={`text-xs px-2.5 py-1.5 rounded-lg transition-all duration-200 font-medium ${
              isCopied
                ? "bg-green-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
            }`}
          >
            {isCopied ? "✓ Copied" : "Copy"}
          </button>
          {/* Expand Script */}
          <button
            onClick={handleExpand}
            disabled={expanding}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-purple-700/60 text-purple-200 hover:bg-purple-700 transition font-medium disabled:opacity-50"
          >
            {expanding ? "Loading…" : expanded ? "Collapse" : "Expand Script"}
          </button>
        </div>
      </div>

      {/* Description */}
      <p data-testid="card-script" className="text-slate-300 text-sm leading-relaxed">
        {item.description}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 text-xs pt-1">
        <span data-testid="card-format" className="bg-slate-700/80 text-slate-200 px-2.5 py-1 rounded-lg">
          Format: {item.format}
        </span>
        <span data-testid="card-channel" className="bg-slate-700/80 text-slate-200 px-2.5 py-1 rounded-lg">
          Channel: {item.channel}
        </span>
        <span data-testid="card-angle" className="bg-slate-700/80 text-slate-200 px-2.5 py-1 rounded-lg">
          Angle: {item.angle}
        </span>
      </div>
      <p data-testid="card-goal" className="text-slate-400 text-xs">
        Goal: {item.tier_goal}
      </p>

      {/* Expanded Script Panel */}
      {expanded && expandedScript && (
        <div className="mt-2 space-y-4 border-t border-slate-700 pt-4">
          {/* Hook */}
          <div>
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1.5">
              ⚡ 30–60s Hook Script
            </p>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/50 rounded-lg p-3">
              {expandedScript.hook}
            </p>
          </div>
          {/* Full */}
          <div>
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-1.5">
              📽 2–3 Min Full Script
            </p>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/50 rounded-lg p-3">
              {expandedScript.full}
            </p>
          </div>
          {/* Shot list */}
          <div>
            <p className="text-xs font-semibold text-green-300 uppercase tracking-wide mb-1.5">
              🎥 Shot List
            </p>
            <ol className="space-y-1.5">
              {expandedScript.shots.map((shot, i) => (
                <li key={i} className="text-slate-300 text-sm flex gap-2">
                  <span className="text-slate-500 shrink-0">{i + 1}.</span>
                  <span>{shot}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState<Record<string, string>>({
    productName: "",
    description: "",
    targetUsers: "",
    coreFeatures: "",
    pastContent: "",
  });
  const [matrix, setMatrix] = useState<ContentMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [activeTier, setActiveTier] = useState<1 | 2 | 3>(1);

  const handleSubmit = async () => {
    const errors: FieldErrors = {};
    if (!form.productName.trim()) errors.productName = "Product name is required";
    if (!form.description.trim()) errors.description = "Product description is required";
    if (!form.targetUsers.trim()) errors.targetUsers = "Target users is required";
    if (!form.coreFeatures.trim()) errors.coreFeatures = "Core features is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setError("");
    setMatrix(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      const data: ContentMatrix = await res.json();
      setMatrix(data);
      setActiveTier(1);
      if (typeof window !== "undefined") localStorage.setItem("reelmatrix_last", JSON.stringify(data));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (tier: number, index: number) => {
    if (!matrix) return;
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, index, ...form }),
      });
      if (!res.ok) throw new Error("Failed");
      const newItem: ContentItem = await res.json();
      const tierKey = `tier${tier}` as keyof ContentMatrix;
      const updated = [...(matrix[tierKey] as ContentItem[])];
      updated[index] = newItem;
      setMatrix({ ...matrix, [tierKey]: updated });
    } catch {
      // silently fail
    }
  };

  const currentItems = matrix ? (matrix[`tier${activeTier}` as keyof ContentMatrix] as ContentItem[]) : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">ReelMatrix</h1>
          <p className="text-slate-400 mt-2 text-sm">AI Video Content Strategist for DevTool Companies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Form */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product Information</h2>
              {matrix && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                  ✓ Generated — edit & regenerate
                </span>
              )}
            </div>

            {[
              { key: "productName", label: "Product Name", multiline: false, placeholder: "e.g. TestSprite" },
              { key: "description", label: "Product Description", multiline: true, placeholder: "What does your product do?" },
              { key: "targetUsers", label: "Target Users", multiline: true, placeholder: "Who uses it?" },
              { key: "coreFeatures", label: "Core Features", multiline: true, placeholder: "Key capabilities..." },
            ].map(({ key, label, multiline, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
                {multiline ? (
                  <textarea
                    className={`w-full bg-slate-700/60 border ${
                      fieldErrors[key] ? "border-red-500" : "border-slate-600/50"
                    } rounded-xl p-3 text-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition placeholder-slate-500`}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                ) : (
                  <input
                    className={`w-full bg-slate-700/60 border ${
                      fieldErrors[key] ? "border-red-500" : "border-slate-600/50"
                    } rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition placeholder-slate-500`}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                )}
                {fieldErrors[key] && (
                  <p data-testid={`error-${key}`} className="text-red-400 text-xs mt-1">
                    {fieldErrors[key]}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">
                Past Content / Notes{" "}
                <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <textarea
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl p-3 text-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition placeholder-slate-500"
                placeholder="Paste existing content or notes to repurpose..."
                value={form.pastContent}
                onChange={(e) => setForm({ ...form, pastContent: e.target.value })}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating your matrix...
                </span>
              ) : matrix ? (
                "Regenerate Content Matrix"
              ) : (
                "Generate Content Matrix"
              )}
            </button>
          </div>

          {/* Right: Matrix */}
          <div className="space-y-4">
            {/* Empty state */}
            {!matrix && !loading && (
              <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">🎬</div>
                <p className="text-slate-400 text-sm">Fill in your product info and click Generate</p>
                <p className="text-slate-500 text-xs mt-1">Your 3-tier content matrix will appear here</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
                <div className="space-y-3 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-3 bg-slate-700 rounded-full animate-pulse"
                      style={{ width: `${70 + i * 10}%` }}
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-slate-700/50 rounded-xl p-4 animate-pulse h-28" />
                  ))}
                </div>
              </div>
            )}

            {/* Matrix */}
            {matrix && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                {/* Feature 4: Core Narrative banner */}
                {matrix.coreNarrative && (
                  <div className="px-5 pt-4">
                    <div className="border border-purple-500/40 bg-purple-500/10 rounded-xl px-4 py-2.5 flex items-start gap-2">
                      <span className="text-purple-400 text-xs font-semibold shrink-0 mt-0.5">Core Narrative</span>
                      <p className="text-purple-200 text-xs leading-relaxed">{matrix.coreNarrative}</p>
                    </div>
                  </div>
                )}

                {/* Feature 1: Simplified tab bar — content type only, no audience subtext */}
                <div className="flex border-b border-slate-700/50 mt-4">
                  {([1, 2, 3] as const).map((tier) => {
                    const config = TIER_CONFIG[tier];
                    const isActive = activeTier === tier;
                    return (
                      <button
                        key={tier}
                        data-testid={`tier-heading-${tier}`}
                        onClick={() => setActiveTier(tier)}
                        className={`flex-1 py-3 px-2 text-xs font-semibold transition-all duration-200 border-b-2 ${
                          isActive
                            ? `${config.activeBg} text-white border-transparent`
                            : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/40"
                        }`}
                      >
                        {config.icon} {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Audience badge — card level only */}
                <div className="px-5 pt-4 pb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${TIER_CONFIG[activeTier].audienceBg}`}>
                    {TIER_CONFIG[activeTier].audience}
                  </span>
                </div>

                {/* Cards */}
                <div className="px-5 pb-5 space-y-3">
                  {currentItems.map((item, i) => (
                    <Card
                      key={`${activeTier}-${i}`}
                      item={item}
                      index={i}
                      form={form}
                      onRegenerate={handleRegenerate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
