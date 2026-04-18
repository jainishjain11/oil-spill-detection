import { useEffect, useRef } from "react";

/**
 * MetricCard — Three-column metrics: confidence ring, uncertainty badge, processing time.
 * Uses Space Grotesk for numbers, animated SVG confidence ring.
 */

// ── Animated confidence ring ──────────────────────────────────────────────────
function ConfidenceRing({ value, prediction }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const isSpill = prediction === "Oil Spill";
  const color = isSpill ? "var(--spill-red)" : "var(--clean-green)";
  const glowColor = isSpill ? "rgba(255,69,96,0.4)" : "rgba(0,230,118,0.4)";

  const circleRef = useRef(null);

  useEffect(() => {
    if (!circleRef.current) return;
    // Start from full offset (invisible), animate to actual value
    circleRef.current.style.transition = 'none';
    circleRef.current.style.strokeDashoffset = circumference;
    // Force reflow
    circleRef.current.getBoundingClientRect();
    circleRef.current.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
    circleRef.current.style.strokeDashoffset = offset;
  }, [value, circumference, offset]);

  const confColor = value >= 70
    ? "var(--cyan-bright)"
    : value >= 50
    ? "var(--warn-amber)"
    : "var(--spill-red)";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        {/* Outer glow ring */}
        <circle cx="42" cy="42" r={radius + 4}
          fill="none"
          stroke={isSpill ? "rgba(255,69,96,0.06)" : "rgba(0,230,118,0.06)"}
          strokeWidth="8"
        />
        {/* Track */}
        <circle cx="42" cy="42" r={radius}
          fill="none"
          stroke="#0a2a3a"
          strokeWidth="7"
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx="42" cy="42" r={radius}
          fill="none"
          stroke={confColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{
            filter: `drop-shadow(0 0 6px ${glowColor})`,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
        {/* Value text */}
        <text
          x="42" y="38"
          textAnchor="middle"
          dominantBaseline="central"
          fill={confColor}
          fontSize="13"
          fontWeight="700"
          fontFamily="'Space Grotesk', sans-serif"
        >
          {value.toFixed(1)}%
        </text>
        <text
          x="42" y="52"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--cyan-trace)"
          fontSize="8"
          fontFamily="'Inter', sans-serif"
        >
          conf.
        </text>
      </svg>
      <p style={{ fontSize: 10, color: 'var(--cyan-dim)', fontFamily: 'Inter, sans-serif' }}>
        Confidence
      </p>
    </div>
  );
}

// ── Uncertainty badge ─────────────────────────────────────────────────────────
function UncertaintyBadge({ value }) {
  let color = "var(--clean-green)";
  let label = "Low";
  let bg = "var(--clean-green-bg)";
  let border = "var(--clean-green-bdr)";

  if (value >= 0.3) {
    color = "var(--spill-red)";
    label = "High";
    bg = "var(--spill-red-bg)";
    border = "var(--spill-red-bdr)";
  } else if (value >= 0.1) {
    color = "var(--warn-amber)";
    label = "Medium";
    bg = "var(--warn-amber-bg)";
    border = "var(--warn-amber-bdr)";
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: '10px 12px',
        textAlign: 'center',
        minWidth: 80,
      }}>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color,
        }}>
          {value.toFixed(4)}
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 9,
          fontWeight: 600,
          color,
          marginTop: 2,
        }}>
          {label}
        </p>
      </div>
      <p style={{ fontSize: 10, color: 'var(--cyan-dim)', fontFamily: 'Inter, sans-serif' }}>
        Uncertainty σ
      </p>
    </div>
  );
}

// ── Processing time ───────────────────────────────────────────────────────────
function ProcessingTime({ ms }) {
  const display = ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        background: 'var(--ocean-mid)',
        border: '1px solid var(--ocean-border)',
        borderRadius: 10,
        padding: '10px 12px',
        textAlign: 'center',
        minWidth: 80,
      }}>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--cyan-dim)',
        }}>
          {display}
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 9,
          fontWeight: 600,
          color: 'var(--cyan-trace)',
          marginTop: 2,
        }}>
          elapsed
        </p>
      </div>
      <p style={{ fontSize: 10, color: 'var(--cyan-dim)', fontFamily: 'Inter, sans-serif' }}>
        Processing
      </p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MetricCard({ confidence, uncertainty, processingTimeMs, prediction }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8,
      padding: '8px 10px',
      borderBottom: '1px solid var(--ocean-border-sub)',
    }}>
      <ConfidenceRing value={confidence} prediction={prediction} />
      <UncertaintyBadge value={uncertainty} />
      <ProcessingTime ms={processingTimeMs} />
    </div>
  );
}
