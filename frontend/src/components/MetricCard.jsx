import { useEffect, useRef } from "react";

// ── Animated confidence ring ──────────────────────────────────────────────────
function ConfidenceRing({ value, prediction }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const isSpill = prediction === "Oil Spill";
  const color = isSpill ? "var(--spill)" : "var(--clean)";

  const circleRef = useRef(null);

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.transition = 'none';
    circleRef.current.style.strokeDashoffset = circumference;
    // Force reflow
    circleRef.current.getBoundingClientRect();
    circleRef.current.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
    circleRef.current.style.strokeDashoffset = offset;
  }, [value, circumference, offset]);

  const confColor = value >= 70
    ? "var(--primary)"
    : value >= 50
    ? "var(--warn)"
    : "var(--spill)";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        {/* Track */}
        <circle cx="42" cy="42" r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx="42" cy="42" r={radius}
          fill="none"
          stroke={confColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
        {/* Value text */}
        <text
          x="42" y="38"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize="14"
          fontWeight="700"
          fontFamily="'Inter', sans-serif"
        >
          {value.toFixed(1)}%
        </text>
        <text
          x="42" y="52"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-faint)"
          fontSize="9"
          fontFamily="'Inter', sans-serif"
        >
          Conf.
        </text>
      </svg>
    </div>
  );
}

// ── Uncertainty badge ─────────────────────────────────────────────────────────
function UncertaintyBadge({ value }) {
  let color = "var(--clean)";
  let label = "Low";
  let bg = "var(--clean-bg)";
  let border = "var(--clean-bdr)";

  if (value >= 0.3) {
    color = "var(--spill)";
    label = "High";
    bg = "var(--spill-bg)";
    border = "var(--spill-bdr)";
  } else if (value >= 0.1) {
    color = "var(--warn)";
    label = "Medium";
    bg = "var(--warn-bg)";
    border = "var(--warn-bdr)";
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
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color,
        }}>
          {value.toFixed(4)}
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          fontWeight: 600,
          color,
          marginTop: 2,
        }}>
          {label} Uncertainty
        </p>
      </div>
    </div>
  );
}

// ── Processing time ───────────────────────────────────────────────────────────
function ProcessingTime({ ms }) {
  const display = ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        background: 'var(--surface-alt)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 12px',
        textAlign: 'center',
        minWidth: 80,
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          {display}
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          fontWeight: 500,
          color: 'var(--text-faint)',
          marginTop: 2,
        }}>
          Processing Time
        </p>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MetricCard({ confidence, uncertainty, processingTimeMs, prediction }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid var(--border-sub)',
      alignItems: 'center',
    }}>
      <ConfidenceRing value={confidence} prediction={prediction} />
      <UncertaintyBadge value={uncertainty} />
      <ProcessingTime ms={processingTimeMs} />
    </div>
  );
}
