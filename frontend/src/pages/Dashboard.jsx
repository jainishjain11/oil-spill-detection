import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "../services/api";
import SettingsPanel from "../components/SettingsPanel";
import UploadZone from "../components/UploadZone";
import ResultPanel from "../components/ResultPanel";
import HistoryTable from "../components/HistoryTable";

/**
 * Dashboard — Main application page.
 * Layout: Header | Sidebar (Settings) + Main (Upload + Results) | History
 */
export default function Dashboard() {
  const [mcRuns, setMcRuns] = useState(30);
  const [gradcamEnabled, setGradcamEnabled] = useState(true);
  const [results, setResults] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Poll backend health
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 10000,
    retry: false,
  });

  const handleNewResults = (newResults) => {
    setResults((prev) => [...newResults, ...prev]);
  };

  const modelLoaded = health?.model_loaded ?? null;

  return (
    <div className="min-h-screen bg-background text-slate-200 flex flex-col">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/25">
              🛰️
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">
                Oil Spill Detection
              </h1>
              <p className="text-[10px] text-slate-500 leading-tight hidden sm:block">
                MobileNetV2 · MC Dropout · Grad-CAM
              </p>
            </div>
          </div>

          {/* Status + mobile settings toggle */}
          <div className="flex items-center gap-3">
            {/* Backend status pill */}
            <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border
              ${modelLoaded === true
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : modelLoaded === false
                  ? "text-red-400 bg-red-500/10 border-red-500/20"
                  : "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full
                ${modelLoaded === true ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}
              />
              <span className="hidden sm:inline">
                {modelLoaded === true ? "Model Ready" : modelLoaded === false ? "Model Loading…" : "Connecting…"}
              </span>
            </div>

            {/* Mobile settings toggle */}
            <button
              className="lg:hidden btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1"
              onClick={() => setSettingsOpen((p) => !p)}
              aria-label="Toggle settings"
            >
              ⚙️ {settingsOpen ? "Hide" : "Settings"}
            </button>
          </div>
        </div>

        {/* Model not loaded warning banner */}
        {modelLoaded === false && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
            <p className="text-amber-400 text-xs font-medium">
              ⚠️ Backend model is still loading. Predictions will be available shortly.
            </p>
          </div>
        )}
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar: Settings */}
          <aside className={`lg:w-64 xl:w-72 flex-shrink-0
            ${settingsOpen ? "block" : "hidden lg:block"}`}
          >
            <SettingsPanel
              mcRuns={mcRuns}
              onMcRunsChange={setMcRuns}
              gradcamEnabled={gradcamEnabled}
              onGradcamToggle={setGradcamEnabled}
            />
          </aside>

          {/* Main area */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">

            {/* Upload zone */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span>📡</span>
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                  Upload SAR Images
                </h2>
              </div>
              <UploadZone
                mcRuns={mcRuns}
                gradcamEnabled={gradcamEnabled}
                onResults={handleNewResults}
              />
            </div>

            {/* Results grid */}
            {results.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <span>📊</span> Analysis Results
                    <span className="text-xs bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full">
                      {results.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => setResults([])}
                    className="btn-ghost text-xs px-2.5 py-1 text-slate-500"
                  >
                    Clear Results
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.map((r, idx) => (
                    <ResultPanel
                      key={r.filename + r.timestamp + idx}
                      result={r}
                      gradcamEnabled={gradcamEnabled}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-slow">
                <div className="text-6xl mb-4 opacity-30">🌊</div>
                <p className="text-slate-500 font-medium">Upload SAR satellite images to detect oil spills</p>
                <p className="text-slate-600 text-sm mt-1">
                  Drag & drop or click the upload zone above
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Session history ──────────────────────────────────────────── */}
        <div className="mt-8">
          <HistoryTable />
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-4 px-4 text-center">
        <p className="text-xs text-slate-600">
          Built by{" "}
          <span className="text-slate-400 font-medium">Jainish Jain & Yashodhan Singh Rathore</span>
          {" "}·{" "}
          <span className="text-slate-600">MobileNetV2 · Monte Carlo Dropout · Grad-CAM XAI</span>
        </p>
      </footer>
    </div>
  );
}
