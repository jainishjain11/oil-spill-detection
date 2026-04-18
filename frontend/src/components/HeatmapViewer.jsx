import { useState } from "react";

export default function HeatmapViewer({ originalSrc, gradcamBase64, filename, gradcamEnabled }) {
  const [showHeatMapMobile, setShowHeatMapMobile] = useState(false);

  const gradcamSrc = gradcamBase64
    ? `data:image/png;base64,${gradcamBase64}`
    : null;

  if (!gradcamEnabled || !gradcamSrc) {
    return (
      <div style={{
        background: 'var(--surface-alt)',
        border: '1px dashed var(--border-focus)',
        borderRadius: 8,
        padding: 16,
        textAlign: 'center'
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 500 }}>
          {gradcamEnabled ? "Generating explanation heatmap..." : "Explainability (Grad-CAM) Disabled"}
        </p>
      </div>
    );
  }

  const panelStyle = {
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid var(--border)',
    background: 'var(--surface-alt)',
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '6px 0',
    borderTop: '1px solid var(--border)',
    background: 'var(--surface)'
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Visual Explanation</p>
        
        {/* Mobile toggle button */}
        <button
          className="btn-ghost"
          style={{ display: 'none' }} // can conditionally show this
          onClick={() => setShowHeatMapMobile(!showHeatMapMobile)}
        >
          {showHeatMapMobile ? "View Original" : "View Map"}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        
        <div style={panelStyle}>
          {originalSrc ? (
            <img
              src={originalSrc}
              alt="Original"
              style={{ width: '100%', height: 64, objectFit: 'cover' }}
            />
          ) : (
             <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Not available</span>
             </div>
          )}
          <div style={labelStyle}>Original SAR</div>
        </div>

        <div style={panelStyle}>
          <img
            src={gradcamSrc}
            alt="Grad-CAM"
            style={{ width: '100%', height: 64, objectFit: 'cover' }}
          />
          <div style={labelStyle}>Grad-CAM Overlay</div>
        </div>

      </div>
    </div>
  );
}
