/**
 * MetricCard — Displays a single metric (Confidence or Uncertainty) with
 * animated circular progress (confidence) or color-coded numeric (uncertainty).
 */

// ── Circular animated confidence ring ─────────────────────────────────────────
function ConfidenceRing({ value, prediction }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const isSpill = prediction === "Oil Spill";
  const color = isSpill ? "#ef4444" : "#10b981";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96">
        {/* Track */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke="#2d3548"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring__circle"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
        <text
          x="48" y="48"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-sm font-bold"
          fill="#e2e8f0"
          fontSize="14"
          fontWeight="700"
        >
          {value.toFixed(1)}%
        </text>
      </svg>
      <p className="text-xs text-slate-400 font-medium">Confidence</p>
    </div>
  );
}

// ── Uncertainty color-coded number ─────────────────────────────────────────────
function UncertaintyBadge({ value }) {
  let color = "text-emerald-400";
  let label = "Low";
  let bg = "bg-emerald-500/10 border-emerald-500/20";

  if (value >= 0.3) {
    color = "text-red-400";
    label = "High";
    bg = "bg-red-500/10 border-red-500/20";
  } else if (value >= 0.1) {
    color = "text-amber-400";
    label = "Medium";
    bg = "bg-amber-500/10 border-amber-500/20";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`rounded-xl border px-4 py-3 ${bg} text-center`}>
        <p className={`text-2xl font-bold ${color}`}>{value.toFixed(4)}</p>
        <p className={`text-xs font-semibold mt-0.5 ${color}`}>{label}</p>
      </div>
      <p className="text-xs text-slate-400 font-medium">Uncertainty (σ)</p>
    </div>
  );
}

// ── Processing time ────────────────────────────────────────────────────────────
function ProcessingTime({ ms }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-center">
        <p className="text-2xl font-bold text-accent">{ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`}</p>
        <p className="text-xs font-semibold mt-0.5 text-slate-400">Processing</p>
      </div>
      <p className="text-xs text-slate-400 font-medium">Time</p>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function MetricCard({ confidence, uncertainty, processingTimeMs, prediction }) {
  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-in">
      <ConfidenceRing value={confidence} prediction={prediction} />
      <UncertaintyBadge value={uncertainty} />
      <ProcessingTime ms={processingTimeMs} />
    </div>
  );
}
