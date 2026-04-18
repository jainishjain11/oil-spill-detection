import { Suspense } from "react";

/**
 * HeatmapViewer — Side-by-side Grad-CAM panels with ocean styling.
 */
function HeatmapViewerInner({ originalSrc, gradcamBase64, filename, gradcamEnabled }) {
  const gradcamSrc = gradcamBase64
    ? `data:image/png;base64,${gradcamBase64}`
    : null;

  if (!gradcamEnabled || !gradcamSrc) {
    return (
      <div style={{ padding: '8px 10px' }}>
        <p style={{ fontSize: 8, color: 'var(--cyan-trace)', fontFamily: 'Inter', textAlign: 'center' }}>
          {gradcamEnabled ? "Generating heatmap…" : "Grad-CAM disabled"}
        </p>
      </div>
    );
  }

  const panelStyle = {
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid var(--ocean-border-sub)',
  };

  const labelStyle = {
    fontSize: 8,
    color: 'var(--cyan-trace)',
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
    background: 'var(--ocean-deep)',
    padding: '3px 4px',
  };

  return (
    <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {/* Original SAR */}
      <div style={panelStyle}>
        {originalSrc ? (
          <img
            src={originalSrc}
            alt={`Original: ${filename}`}
            style={{ width: '100%', height: 50, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ height: 50, background: 'var(--ocean-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--cyan-trace)' }}>No preview</span>
          </div>
        )}
        <p style={labelStyle}>SAR Original</p>
      </div>

      {/* Grad-CAM */}
      <div style={panelStyle}>
        <img
          src={gradcamSrc}
          alt={`Grad-CAM: ${filename}`}
          style={{ width: '100%', height: 50, objectFit: 'cover', display: 'block' }}
        />
        <p style={labelStyle}>Grad-CAM XAI</p>
      </div>
    </div>
  );
}

export default function HeatmapViewer(props) {
  return (
    <Suspense fallback={
      <div style={{ height: 70, margin: '0 10px', borderRadius: 6, background: 'var(--ocean-surface)' }}
        className="skeleton" />
    }>
      <HeatmapViewerInner {...props} />
    </Suspense>
  );
}
