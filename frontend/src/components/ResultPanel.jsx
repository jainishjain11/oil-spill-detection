import { lazy } from "react";
import StatusBadge from "./StatusBadge";
import MetricCard from "./MetricCard";

// Lazy-load heatmap viewer for performance
const HeatmapViewer = lazy(() => import("./HeatmapViewer"));

/**
 * ResultPanel — Full card for a single image prediction result.
 */
export default function ResultPanel({ result, gradcamEnabled }) {
  const {
    filename,
    prediction,
    confidence,
    uncertainty,
    gradcam_image,
    processing_time_ms,
    timestamp,
    _preview, // client-side object URL for original image preview
  } = result;

  const isSpill = prediction === "Oil Spill";
  const borderColor = isSpill ? "border-red-500/30" : "border-emerald-500/30";
  const glowColor = isSpill
    ? "shadow-red-500/10"
    : "shadow-emerald-500/10";

  return (
    <div
      className={`card border ${borderColor} shadow-xl ${glowColor} animate-fade-in flex flex-col gap-4`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-medium truncate" title={filename}>
            {filename}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        </div>
        <StatusBadge prediction={prediction} />
      </div>

      {/* Original image thumbnail (from client preview) */}
      {_preview && (
        <img
          src={_preview}
          alt={`Uploaded: ${filename}`}
          className="w-full h-36 object-cover rounded-lg border border-border"
        />
      )}

      {/* Metrics */}
      <MetricCard
        confidence={confidence}
        uncertainty={uncertainty}
        processingTimeMs={processing_time_ms}
        prediction={prediction}
      />

      {/* Grad-CAM */}
      <HeatmapViewer
        originalSrc={_preview}
        gradcamBase64={gradcam_image}
        filename={filename}
        gradcamEnabled={gradcamEnabled}
      />
    </div>
  );
}
