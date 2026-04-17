import { lazy, Suspense, useState } from "react";

/**
 * HeatmapViewer — Shows original image alongside Grad-CAM overlay.
 * Side-by-side layout with a toggle to switch between both views on mobile.
 * Lazy-loaded for performance.
 */
function HeatmapViewerInner({ originalSrc, gradcamBase64, filename, gradcamEnabled }) {
  const [showHeatmap, setShowHeatmap] = useState(false);

  const gradcamSrc = gradcamBase64
    ? `data:image/png;base64,${gradcamBase64}`
    : null;

  if (!gradcamEnabled || !gradcamSrc) {
    return (
      <div className="mt-3">
        <p className="text-xs text-slate-500 font-medium mb-2">Grad-CAM Heatmap</p>
        <div className="flex items-center justify-center h-28 rounded-lg border border-dashed border-border bg-surface-2 text-slate-500 text-sm">
          {gradcamEnabled ? "⏳ Generating…" : "Grad-CAM disabled"}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500 font-medium">Grad-CAM Heatmap</p>
        {/* Mobile toggle */}
        <button
          onClick={() => setShowHeatmap((p) => !p)}
          className="text-xs text-accent hover:text-accent-hover font-medium transition-colors lg:hidden"
        >
          {showHeatmap ? "Show Original" : "Show Heatmap"}
        </button>
      </div>

      {/* Desktop: side by side */}
      <div className="hidden lg:grid grid-cols-2 gap-2">
        <div>
          <img
            src={originalSrc}
            alt={`Original: ${filename}`}
            className="w-full h-32 object-cover rounded-lg border border-border"
          />
          <p className="text-[10px] text-center text-slate-500 mt-1">Original</p>
        </div>
        <div>
          <img
            src={gradcamSrc}
            alt={`Grad-CAM: ${filename}`}
            className="w-full h-32 object-cover rounded-lg border border-border"
          />
          <p className="text-[10px] text-center text-slate-500 mt-1">Grad-CAM</p>
        </div>
      </div>

      {/* Mobile: toggled single view */}
      <div className="lg:hidden">
        <img
          src={showHeatmap ? gradcamSrc : originalSrc}
          alt={showHeatmap ? `Grad-CAM: ${filename}` : `Original: ${filename}`}
          className="w-full h-36 object-cover rounded-lg border border-border"
        />
        <p className="text-[10px] text-center text-slate-500 mt-1">
          {showHeatmap ? "Grad-CAM" : "Original"}
        </p>
      </div>
    </div>
  );
}

// Wrap in Suspense boundary for lazy loading
export default function HeatmapViewer(props) {
  return (
    <Suspense
      fallback={
        <div className="mt-3 h-28 rounded-lg skeleton" />
      }
    >
      <HeatmapViewerInner {...props} />
    </Suspense>
  );
}
