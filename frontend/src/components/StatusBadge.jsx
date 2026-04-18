/**
 * StatusBadge — Pill badge for prediction status with ocean-themed colors.
 */
export default function StatusBadge({ prediction, uncertainty }) {
  const isSpill = prediction === "Oil Spill";
  const isUncertain = (uncertainty ?? 0) > 0.3;

  if (isSpill) {
    return (
      <span className="badge-spill">
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--spill-red)',
          display: 'inline-block',
          animation: 'pulse-dot 2s infinite'
        }} />
        Oil Spill
      </span>
    );
  }

  if (isUncertain) {
    return (
      <span className="badge-uncertain">
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--warn-amber)',
          display: 'inline-block',
        }} />
        Uncertain
      </span>
    );
  }

  return (
    <span className="badge-clean">
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--clean-green)',
        display: 'inline-block',
      }} />
      No Oil Spill
    </span>
  );
}
