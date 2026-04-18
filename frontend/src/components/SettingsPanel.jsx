import { useCallback, useEffect, useRef, useState } from "react";

/**
 * SettingsPanel — Ocean-themed sidebar: MC runs, Grad-CAM toggle,
 * uncertainty legend, and stack chip tags.
 */
export default function SettingsPanel({
  mcRuns,
  onMcRunsChange,
  gradcamEnabled,
  onGradcamToggle,
}) {
  const debounceTimer = useRef(null);
  const [localRuns, setLocalRuns] = useState(mcRuns);

  const handleSliderChange = useCallback((e) => {
    const val = Number(e.target.value);
    setLocalRuns(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onMcRunsChange(val);
    }, 400);
  }, [onMcRunsChange]);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const estimatedSec = ((localRuns * 0.08) + 0.5).toFixed(1);
  const fillPct = ((localRuns - 5) / (100 - 5)) * 100;

  const sectionLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--cyan-faint)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 10,
  };

  const lineStyle = { flex: 1, height: 1, background: 'var(--ocean-border)' };

  const stackChips = [
    "MobileNetV2", "MC Dropout", "Grad-CAM",
    "Sentinel-1 SAR", "FastAPI", "React + Vite"
  ];

  return (
    <div style={{
      width: 240,
      background: 'var(--ocean-deep)',
      borderRight: '1px solid var(--ocean-border)',
      padding: '18px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      minHeight: '100%',
    }}>

      {/* ── Section 1: INFERENCE ──────────────────────────────────── */}
      <div>
        <div style={sectionLabelStyle}>
          INFERENCE
          <span style={lineStyle} />
        </div>

        {/* Ocean meter card */}
        <div style={{
          background: 'var(--ocean-mid)',
          border: '1px solid var(--ocean-border)',
          borderRadius: 10,
          padding: '10px 12px',
          marginBottom: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--cyan-dim)', fontFamily: 'Inter, sans-serif' }}>
              MC dropout runs
            </span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14, fontWeight: 700,
              color: 'var(--cyan-bright)',
            }}>
              {localRuns}
            </span>
          </div>

          {/* Slider */}
          <input
            id="mc-runs-slider"
            type="range"
            min={5} max={100} step={5}
            value={localRuns}
            onChange={handleSliderChange}
            style={{ width: '100%', marginBottom: 6 }}
            aria-label="Monte Carlo Dropout runs"
          />
          {/* Track labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: 'var(--cyan-trace)', fontFamily: 'Inter, sans-serif' }}>5 — fast</span>
            <span style={{ fontSize: 9, color: 'var(--cyan-trace)', fontFamily: 'Inter, sans-serif' }}>100 — precise</span>
          </div>
        </div>

        {/* Info box */}
        <div style={{
          background: '#011218',
          border: '1px solid var(--ocean-border)',
          borderRadius: 8,
          padding: '8px 10px',
        }}>
          <p style={{ fontSize: 10, fontFamily: 'Inter, sans-serif', lineHeight: 1.5, color: 'var(--cyan-ghost)' }}>
            <span style={{ color: 'var(--cyan-mid)', fontWeight: 600 }}>MC Dropout</span>{' '}
            runs the model {localRuns}× with dropout active, then averages predictions to estimate uncertainty.
          </p>
          <p style={{ fontSize: 9, color: 'var(--cyan-trace)', fontFamily: 'Inter, sans-serif', marginTop: 6 }}>
            ⏱ ~{estimatedSec}s per image
          </p>
        </div>
      </div>

      {/* ── Section 2: EXPLAINABILITY ─────────────────────────────── */}
      <div>
        <div style={sectionLabelStyle}>
          EXPLAINABILITY
          <span style={lineStyle} />
        </div>

        {/* Toggle row card */}
        <div style={{
          background: 'var(--ocean-mid)',
          border: '1px solid var(--ocean-border)',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--cyan-dim)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                Grad-CAM heatmap
              </p>
              <p style={{ fontSize: 10, color: 'var(--cyan-trace)', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                Spatial attention overlay
              </p>
            </div>
            <label className="toggle-switch" htmlFor="gradcam-toggle">
              <input
                id="gradcam-toggle"
                type="checkbox"
                checked={gradcamEnabled}
                onChange={(e) => onGradcamToggle(e.target.checked)}
                aria-label="Enable Grad-CAM heatmap"
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>

      {/* ── Section 3: UNCERTAINTY BANDS ─────────────────────────── */}
      <div>
        <div style={sectionLabelStyle}>
          UNCERTAINTY BANDS
          <span style={lineStyle} />
        </div>

        <div style={{
          background: 'var(--ocean-mid)',
          border: '1px solid var(--ocean-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          {[
            { dot: 'var(--clean-green)', label: 'Low', range: 'σ < 0.1' },
            { dot: 'var(--warn-amber)',  label: 'Medium', range: '0.1 – 0.3' },
            { dot: 'var(--spill-red)',   label: 'High', range: 'σ > 0.3' },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--ocean-border-sub)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: item.dot, display: 'inline-block', flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, color: 'var(--cyan-dim)', fontFamily: 'Inter, sans-serif' }}>
                  {item.label}
                </span>
              </div>
              <span style={{ fontSize: 9, color: 'var(--cyan-trace)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {item.range}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: STACK ─────────────────────────────────────── */}
      <div>
        <div style={sectionLabelStyle}>
          STACK
          <span style={lineStyle} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {stackChips.map((chip) => (
            <span key={chip} style={{
              fontSize: 9,
              color: '#0a6a8a',
              background: 'var(--ocean-mid)',
              border: '1px solid var(--ocean-border)',
              borderRadius: 4,
              padding: '3px 7px',
              fontFamily: 'Inter, sans-serif',
            }}>
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
