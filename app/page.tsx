"use client";
import { useState } from "react";
import type { ContentMatrix, ContentItem } from "./api/generate/route";

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

const COST_CONFIG = {
  Low: "bg-green-500/20 text-green-300",
  Medium: "bg-yellow-500/20 text-yellow-300",
  High: "bg-0/20 text-red-300",
};

const WEEK_LABEL = {
  1: "Week 1",
  2: "Week 2",
  3: "Week 3",
};

export default function Home() {
  const [form, setForm] = useState({
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    const errors: FieldErrors = {};
    if (!form.productName.trim()) errors.productName = "Product name is required";
    if (!form.description.trim()) errors.description = "Product description is required";
    if (!form.targetUsers.trim()) errors.targetUsers = "Target users is required";
    if (!form.coreFeatures.trim()) errors.coreFeatures = "Core features is required";
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
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
      const raw = await res.json();
      const data = { tier1: raw.tier1, tier2: raw.tier2, tier3: raw.tier3, core_narrative: raw.core_narrative };
      setMatrix(data);
      setActiveTier(1);
      if (typeof window !== "undefined") localStorage.setItem("reelmatrix_last", JSON.stringify(data));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenItem = async (tier: 1 | 2 | 3, index: number) => {
    if (!matrix) return;
    const id = `tier${tier}-${index}`;
    setRegeneratingId(id);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      const raw = await res.json();
      const newItem = raw[`tier${tier}`]?.[index];
      if (newItem) {
        const updated = { ...matrix } as ContentMatrix;
        (updated as Record<string, unknown>)[`tier${tier}`] = [...matrix[`tier${tier}` as keyof ContentMatrix] as ContentItem[]];
        ((updated as Record<string, unknown>)[`tier${tier}`] as ContentItem[])[index] = newItem;
        setMatrix(updated as ContentMatrix);
      }
    } catch {
      // silent fail
    } finally {
      setRegeneratingId(null);
    }
  };

  const copyToClipboard = (item: ContentItem, id: string) => {
    const text = `${item.title}\n\n${item.description}\n\nHook (30-60s): ${item.hook_version}\nFull (2-3min): ${item.full_version}\n\nFormat: ${item.format}\nChannel: ${item.channel}\nAngle: ${item.angle}\nGoal: ${item.tier_goal}\nProduction: ${item.production_cost}\nPublish: ${WEEK_LABEL[item.publish_week]}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const Card = ({ item, index }: { item: ContentItem; index: number }) => {
    const config = TIER_CONFIG[item.tier];
    const id = `tier${item.tier}-${index}`;
    const isCopied = copiedId === id;
    const isExpanded = expandedId === id;
    const isRegenerating = regeneratingId === id;

    return (
      <div className={`border-l-4 ${config.cardBorder} bg-slate-800/80 rounded-xl p-5 space-y-3 transition-all duration-200 hover:bg-slate-800 ${item.priority ? "ring-1 ring-yellow-500/50" : ""}`}>
        {/* Priority + Week badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.priority && (
            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-semibold">⭐ Start Here</span>
          )}
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{WEEK_LABEL[item.publish_week]}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${COST_CONFIG[item.production_cost]}`}>
            Cost: {item.production_cost}
          </span>
        </div>

        {/* Title + buttons */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-white font-bold text-base leading-snug">{item.title}</h3>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => handleRegenItem(item.tier, index)}
              disabled={isRegenerating}
              className="text-xs px-2 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
              title="Regenerate this card"
            >
              {isRegenerating ? "..." : "↻"}
            </button>
        <button
              onClick={() => copyToClipboard(item, id)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${isCopied ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"}`}
            >
              {isCopied ? "✓" : "Copy"}
            </button>
            <button
              onClick={() => setExpandedId(isExpanded ? null : id)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${isExpanded ? "bg-purple-600 text-white" : "bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white"}`}
            >
              {isExpanded ? "Collapse" : "Expand Script"}
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>

        {/* Expanded script view */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-slate-700">
            <div className="bg-slate-700/50 roued-lg p-3">
              <p className="text-xs text-yellow-300 font-semibold mb-1">⚡ Hook Version (30-60 sec) — Twitter/X</p>
              <p className="text-sm text-slate-200">{item.hook_version}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-blue-300 font-semibold mb-1">📺 Full Version (2-3 min) — YouTube</p>
              <p className="text-sm text-slate-200">{item.full_version}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs pt-1">
          <span className="bg-slate-700/80 text-slate-200 px-2.5 py-1 rounded-lg">Format: {item.format}</span>
          <span className="bg-slate-700/80 text-slate-200 px-2.5 py-1 rounded-lg">Channel: {item.channel}</span>
          <span className="bg-slate-700/80 text-slate-200 px-2.5 py-1 rounded-lg">Angle: {item.angle}</span>
        </div>
        <p className="text-slate-400 text-xs">Goal: {item.tier_goal}</p>
      </div>
   
    );
  };



  const currentItems = matrix ? matrix[`tier${activeTier}` as keyof ContentMatrix] as ContentItem[] : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">ReelMatrix</h1>
          <p className="text-slate-400 mt-2 text-sm">AI Video Content Strategist for DevTool Companies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Form */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product Information</h2>
              {matrix && <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">✓ Generated — edit & regenerate</span>}
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
                    className={`w-full bg-slate-700/60 border ${fieldErrors[key] ? "border-red-500" : "border-slate-600/50"} rounded-xl p-3 text-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition placeholder-slate-500`}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                ) : (
                  <input
                    className={`w-full bg-slate-700/60 border ${fieldErrors[key] ? "border-red-500" : "border-slate-600/50"} rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition placeholder-slate-500`}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                )}
                {fieldErrors[key] && <p className="text-red-400 text-xs mt-1">{fieldErrors[key]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Past Content / Notes <span className="text-slate-500 text-xs">(optional)</span></label>
              <textarea
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl p-3 text-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition placeholder-slate-500"
                placeholder="Paste existing content or hackathon notes to repurpose..."
                value={form.pastContent}
                onChange={(e) => setForm({ ...form, pastContent: e.target.value })}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Generating...
                </span>
              ) : matrix ? "Regenerate Content Matrix" : "Generate Content Matrix"}
            </button>
          </div>

          {/* Right: Matrix */}
          <div className="space-y-4">
            {!matrix && !loading && (
              <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">🎬</div>
                <p className="text-slate-400 text-sm">Fill in your product info and click Generate</p>
                <p className="text-slate-500 text-xs mt-1">Your 3-tier content matrix will appear here</p>
              </div>
            )}

            {loading && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 space-y-3">
                {[90, 70, 80].map((w, i) => (
                  <div key={i} className="h-3 bg-slate-700 rounded-full animate-pulse" style={{ width: `${w}%` }} />
                ))}
                <div className="space-y-3 pt-2">
                  {[1, 2].map((i) => <div key={i} className="bg-slate-700/50 rounded-xl animate-pulse h-28" />)}
                </div>
              </div>
            )}

            {matrix && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                {/* Core Narrative */}
                {matrix.core_narrative && (
                  <div className="px-5 pt-4 pb-3 border-b border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Core Narrative</p>
                    <p className="text-sm text-white font-medium">{matrix.core_narrative}</p>
                  </div>
                )}

                {/* Publish rhythm notice */}
                <div className="px-5 pt-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
                    💡 <span className="font-semibold">Publishing Strategy:</span> Start with Week 1 Product Demo content — lowest production cost, highest virality. Build audience first, then introduce narrative content in Week 2-3.
                  </div>
                </div>
                {/* Tabs */}
                <div className="flex border-b border-slate-700/50">
                  {([1, 2, 3] as const).map((tier) => {
                    const config = TIER_CONFIG[tier];
                    const isActive = activeTier === tier;
                    const items = matrix[`tier${tier}` as keyof ContentMatrix] as ContentItem[];
                    const hasPriority = items.some(i => i.priority);
                    return (
                      <button
                        key={tier}
                        onClick={() => setActiveTier(tier)}
                        className={`flex-1 py-3 px-2 text-xs font-semibold transition-all border-b-2 relative ${
                          isActive ? `${config.activeBg} text-white border-transparent` : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/40"
                        }`}
                      >
                        {hasPriority && <span className="absolute top-1 right-1 text-yellow-400 text-xs">⭐</span>}
                        <div>{config.icon} {config.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Audience badge */}
                <div className="px-5 pt-4 pb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${TIER_CONFIG[activeTier].audienceBg}`}>
                    {TIER_CONFIG[activeTier].audience}
                  </span>
                </div>

                {/* Cards */}
                <div className="px-5 pb-5 space-y-3">
                  {currentItems.map((item, i) => <Card key={i} item={item} index={i} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
