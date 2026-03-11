"use client";
import { useState } from "react";
import type { ContentMatrix, ContentItem } from "./api/generate/route";

type FieldErrors = Record<string, string>;

const TIER_CONFIG = {
  1: {
    label: "Tier 1 — Narrative",
    audience: "For: Founders & Tech Leaders",
    border: "border-purple-500",
    audienceBg: "bg-purple-500/20 text-purple-300",
    icon: "🎯",
  },
  2: {
    label: "Tier 2 — Problem-Solution",
    audience: "For: Tech Leads & Senior Devs",
    border: "border-blue-500",
    audienceBg: "bg-blue-500/20 text-blue-300",
    icon: "🔗",
  },
  3: {
    label: "Tier 3 — Product Demo",
    audience: "For: Individual Developers",
    border: "border-green-500",
    audienceBg: "bg-green-500/20 text-green-300",
    icon: "🎬",
  },
};

export default function Home() {
  const [form, setForm] = useState({
    productName: "",
    description: "",
    targetUsers: "",
    coreFeatures: "",
    pastContent: "",
  });
  const [matri] = useState<ContentMatrix | null>(null);
  const [matrix, setMatrix] = useState<ContentMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMatrix(data);
      localStorage.setItem("reelmatrix_last", JSON.stringify(data));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Card = ({ item }: { item: ContentItem }) => {
    const config = TIER_CONFIG[item.tier];
    return (
      <div className={`border-l-4 ${config.border} bg-slate-800 rounded-lg p-4 space-y-2`}>
        <h3 className="text-white font-bold">{item.title}</h3>
        <p className="text-slate-300 text-sm">{item.description}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded">Format: {item.format}</span>
          <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded">Channel: {item.channel}</span>
          <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded">Angle: {item.angle}</span>
        </div>
        <p className="text-slate-400 text-xs">Goal: {item.tier_goal}</p>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">ReelMatrix</h1>
          <p className="text-slate-400 mt-2">AI Video Content Strategist for DevTool Companies</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="bg-slate-800/50 rounded-xl p-6 space-y-4 h-fit">
            <h2 className="text-xl font-semibold">Product Information</h2>
            {[
              { key: "productName", label: "Product Name", multiline: false },
              { key: "description", label: "Product Description", multiline: true },
              { key: "targetUsers", label: "Target Users", multiline: true },
              { key: "coreFeatures", label: "Core Features", multiline: true },
            ].map(({ key, label, multiline }) => (
              <div key={key}>
                <label className="block text-sm text-slate-400 mb-1">{label}</label>
                {multiline ? (
                  <textarea
                    className={`w-full bg-slate-700 rounded-lg p-3 text-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500 ${fieldErrors[key] ? "ring-2 ring-red-500" : ""}`}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                ) : (
                  <input
                    className={`w-full bg-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${fieldErrors[key] ? "ring-2 ring-red-500" : ""}`}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                )}
                {fieldErrors[key] && <p className="text-red-400 text-xs mt-1">{fieldErrors[key]}</p>}
              </div>
            ))}

            {/* Optional: Past Content */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Past Content / Hackathon Notes{" "}
                <span className="text-slate-500 text-xs">(optional — paste existing content to repurpose)</span>
              </label>
              <textarea
                className="w-full bg-slate-700 rounded-lg p-3 text-white text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. We built X at a hackathon, users loved Y feature, common FAQ: why is Z better than..."
                value={form.pastContent}
                onChange={(e) => setForm({ ...form, pastContent: e.target.value })}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Generating..." : "Generate Content Matrix"}
            </button>
          </div>

          {/* Right: Matrix */}
          <div className="space-y-6">
            {!matrix && !loading && (
              <div className="bg-slate-800/30 rounded-xl p-8 text-center text-slate-500">
                Fill in the form and click Generate to create your content matrix
              </div>
            )}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-800 rounded-xl p-4 animate-pulse h-24" />
                ))}
              </div>
            )}
            {matrix &&
              ([1, 2, 3] as const).map((tier) => {
                const config = TIER_CONFIG[tier];
                return (
                  <div key={tier}>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-lg font-semibold">
                        {config.icon} {config.label}
                      </h2>
                      <span className={`text-xs px-2 py-1 rounded-full ${config.audienceBg}`}>
                        {config.audience}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {matrix[`tier${tier}` as keyof ContentMatrix].map((item, i) => (
                        <Card key={i} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </main>
  );
}
