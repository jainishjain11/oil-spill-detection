/**
 * StatusBadge — Pill badge for Oil Spill / No Oil Spill predictions.
 */
export default function StatusBadge({ prediction, size = "md" }) {
  const isSpill = prediction === "Oil Spill";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border
        ${sizeClasses[size]}
        ${isSpill
          ? "bg-red-500/20 text-red-400 border-red-500/30"
          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full animate-pulse-ring
          ${isSpill ? "bg-red-400" : "bg-emerald-400"}`}
      />
      {prediction}
    </span>
  );
}
