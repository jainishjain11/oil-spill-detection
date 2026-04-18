import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "../services/api";
import useSessionStore from "../store/sessionStore";
import SettingsPanel from "../components/SettingsPanel";
import UploadZone from "../components/UploadZone";
import ResultPanel from "../components/ResultPanel";
import HistoryTable from "../components/HistoryTable";

/**
 * Animated counter — counts up from 0 to `target` on mount/change.
 */
function AnimatedCounter({ target, color }) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    if (target === 0) { setValue(0); return; }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 24));
    const tick = () => {
      current = Math.min(current + step, target);
      setValue(current);
      if (current < target) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  return (
    <span style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 16, fontWeight: 700,
      color,
    }}>
      {value}
    </span>
  );
}

/**
 * OceanWatch AI brand logo with animated waves + radar icon.
 */
function BrandLogo() {
  return (
    <div style={{
      width: 42, height: 42,
      borderRadius: 12,
      background: '#03344a',
      border: '1px solid #0a5a7a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Ocean waves at bottom */}
      <svg
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%' }}
        height="16" viewBox="0 0 42 16" xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path d="M-5 10 Q5 6 15 10 Q25 14 35 10 Q40 8 47 10 L47 16 L-5 16 Z"
          fill="#005a8a" opacity="0.8"
          style={{ animation: 'waveShift 4s linear infinite' }} />
        <path d="M-5 12 Q8 8 18 12 Q28 16 38 12 Q42 10 47 12 L47 16 L-5 16 Z"
          fill="#00a8c8" opacity="0.6"
          style={{ animation: 'waveShift 4s linear infinite 1.3s' }} />
      </svg>

      {/* Satellite/radar icon */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}>
        {/* Radar dish */}
        <path d="M10 10 L4 4" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 10 L16 4" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="2" stroke="#00d4ff" strokeWidth="1.5"/>
        <path d="M3 13 Q10 16 17 13" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
        <path d="M5 15.5 Q10 17.5 15 15.5" stroke="#00d4ff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>
        {/* Satellite arm */}
        <path d="M10 8 L10 5 M8 5 L12 5" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

/**
 * Dashboard — Main application page.
 * Layout: Header | Sidebar + Main (Upload + Results) | History | Footer
 */
export default function Dashboard() {
  const [mcRuns, setMcRuns] = useState(30);
  const [gradcamEnabled, setGradcamEnabled] = useState(true);
  const [results, setResults] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Poll backend health
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 10000,
    retry: false,
  });

  const modelLoaded = health?.model_loaded ?? null;

  // Reactive stats from Zustand store
  const history = useSessionStore((s) => s.history);
  const totalAnalysed = history.length;
  const totalSpills   = history.filter((r) => r.prediction === "Oil Spill").length;
  const totalUncertain = history.filter((r) => (r.uncertainty ?? 0) > 0.3 && r.prediction !== "Oil Spill").length;
  const totalClean    = history.filter((r) => r.prediction !== "Oil Spill" && (r.uncertainty ?? 0) <= 0.3).length;

  const handleNewResults = (newResults) => {
    setResults((prev) => [...newResults, ...prev]);
  };

  // Stat pills
  const stats = [
    { label: "Analysed", value: totalAnalysed, color: "var(--cyan-bright)" },
    { label: "Spills",   value: totalSpills,   color: "var(--spill-red)" },
    { label: "Uncertain",value: totalUncertain, color: "var(--warn-amber)" },
    { label: "Clean",    value: totalClean,    color: "var(--clean-green)" },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ocean-void)', display: 'flex', flexDirection: 'column' }}>

      {/* ═══════════════════════ HEADER ══════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: 64,
        background: 'var(--ocean-deep)',
        borderBottom: '1px solid var(--ocean-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
      }}>

        {/* Left — Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <BrandLogo />
          <div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 16, fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              OceanWatch AI
            </h1>
            <p style={{
              fontSize: 10,
              color: 'var(--cyan-ghost)',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.2,
            }}>
              SAR · Oil Spill Detection · MobileNetV2
            </p>
          </div>
        </div>

        {/* Center — Live stats bar */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--ocean-mid)',
            border: '1px solid var(--ocean-border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {stats.map((stat, i) => (
              <div key={stat.label} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 18px',
                borderRight: i < stats.length - 1 ? '1px solid var(--ocean-border-sub)' : 'none',
                gap: 1,
              }}>
                <AnimatedCounter target={stat.value} color={stat.color} />
                <span style={{
                  fontSize: 9,
                  fontFamily: 'Inter, sans-serif',
                  color: 'var(--cyan-trace)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Coordinate badge + status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Coordinate badge */}
          <div style={{
            fontSize: 10,
            color: 'var(--cyan-ghost)',
            fontFamily: 'Inter, sans-serif',
            background: 'var(--ocean-mid)',
            border: '1px solid var(--ocean-border)',
            borderRadius: 6,
            padding: '4px 8px',
          }}>
            12°N 80°E · Sentinel-1
          </div>

          {/* Status pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: modelLoaded === false ? '#1a0010' : '#001a10',
            border: `1px solid ${modelLoaded === false ? 'rgba(255,69,96,0.25)' : 'rgba(0,255,136,0.25)'}`,
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
            color: modelLoaded === false ? 'var(--spill-red)' : 'var(--clean-green)',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: modelLoaded === false ? 'var(--spill-red)' : 'var(--clean-green)',
              display: 'inline-block',
              animation: 'pulse-dot 2s infinite',
            }} />
            {modelLoaded === false ? "Backend offline"
              : modelLoaded === true ? "Model ready"
              : "Connecting…"}
          </div>

          {/* Mobile sidebar toggle */}
          <button
            style={{
              display: 'none', // shown via media query below
              background: 'var(--ocean-mid)',
              border: '1px solid var(--ocean-border)',
              borderRadius: 6,
              color: 'var(--cyan-dim)',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'Inter, sans-serif',
            }}
            className="lg:block"
            onClick={() => setSidebarOpen((p) => !p)}
            aria-label="Toggle settings"
            id="sidebar-toggle-btn"
          >
            ⚙
          </button>
        </div>
      </header>

      {/* ═══════════════════════ MAIN LAYOUT ═════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', maxWidth: 1400, margin: '0 auto', width: '100%', padding: '0 16px' }}>

        {/* Sidebar */}
        <aside style={{
          flexShrink: 0,
          paddingTop: 20, paddingBottom: 20,
        }}>
          <SettingsPanel
            mcRuns={mcRuns}
            onMcRunsChange={setMcRuns}
            gradcamEnabled={gradcamEnabled}
            onGradcamToggle={setGradcamEnabled}
          />
        </aside>

        {/* Main area */}
        <main style={{ flex: 1, minWidth: 0, padding: '20px 0 20px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Upload zone card */}
          <div style={{
            background: 'var(--ocean-deep)',
            border: '1px solid var(--ocean-border)',
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="6" stroke="var(--cyan-dim)" strokeWidth="1"/>
                <path d="M7 4v4M5 6l2-2 2 2" stroke="var(--cyan-dim)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12, fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                Upload SAR images
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12, fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}>
                    Analysis results
                  </h2>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 9, fontWeight: 600,
                    color: 'var(--cyan-mid)',
                    background: 'rgba(0, 168, 200, 0.12)',
                    border: '1px solid rgba(0, 168, 200, 0.2)',
                    borderRadius: 999,
                    padding: '1px 7px',
                  }}>
                    {results.length}
                  </span>
                </div>
                <button
                  onClick={() => setResults([])}
                  className="btn-clear"
                >
                  Clear results
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 14,
              }}>
                {results.map((r, idx) => (
                  <ResultPanel
                    key={r.filename + r.timestamp + idx}
                    result={r}
                    gradcamEnabled={gradcamEnabled}
                    animationDelay={idx * 60}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {results.length === 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 20px',
              textAlign: 'center',
              animation: 'fadeUp 0.7s ease-out both',
            }}>
              {/* Ocean icon */}
              <svg width="56" height="40" viewBox="0 0 56 40" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ opacity: 0.25, marginBottom: 16 }}>
                <path d="M0 24 Q7 18 14 24 Q21 30 28 24 Q35 18 42 24 Q49 30 56 24 L56 40 L0 40 Z"
                  fill="var(--cyan-mid)" />
                <path d="M0 28 Q8 22 16 28 Q24 34 32 28 Q40 22 48 28 L56 26 L56 40 L0 40 Z"
                  fill="var(--cyan-bright)" opacity="0.6" />
                <circle cx="28" cy="14" r="8" stroke="var(--cyan-dim)" strokeWidth="1.5" fill="none"/>
                <path d="M28 10 v8 M24 14 h8" stroke="var(--cyan-dim)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cyan-dim)', fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>
                Awaiting SAR imagery
              </p>
              <p style={{ fontSize: 12, color: 'var(--cyan-ghost)', fontFamily: 'Inter, sans-serif' }}>
                Drag & drop Sentinel-1 SAR images or click the upload zone above
              </p>
            </div>
          )}

          {/* Session history */}
          <div>
            <HistoryTable />
          </div>
        </main>
      </div>

      {/* ═══════════════════════ FOOTER ══════════════════════════════════ */}
      <footer style={{
        background: 'var(--ocean-surface)',
        borderTop: '1px solid var(--ocean-border-sub)',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        <p style={{ fontSize: 10, color: 'var(--cyan-trace)', fontFamily: 'Inter, sans-serif' }}>
          Built by{" "}
          <span style={{ color: '#0a6a8a' }}>Jainish Jain</span>
          {" & "}
          <span style={{ color: '#0a6a8a' }}>Yashodhan Singh Rathore</span>
        </p>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {["MobileNetV2", "Monte Carlo Dropout", "Grad-CAM XAI", "Sentinel-1 SAR"].map((chip) => (
            <span key={chip} style={{
              fontSize: 9,
              color: 'var(--cyan-trace)',
              background: 'var(--ocean-mid)',
              border: '1px solid var(--ocean-border-sub)',
              borderRadius: 4,
              padding: '2px 6px',
              fontFamily: 'Inter, sans-serif',
            }}>
              {chip}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
