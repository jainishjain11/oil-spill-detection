import { lazy, Suspense } from "react";
import StatusBadge from "./StatusBadge";
import MetricCard from "./MetricCard";

// Lazy-load heatmap viewer for performance
const HeatmapViewer = lazy(() => import("./HeatmapViewer"));

/**
 * ResultPanel — Full card for a single image prediction result.
 * Ocean-themed with color-coded top accent stripe.
 */
export default function ResultPanel({ result, gradcamEnabled, animationDelay = 0 }) {
  const {
    filename,
    prediction,
    confidence,
    uncertainty,
    gradcam_image,
    processing_time_ms,
    timestamp,
    _preview,
    previewUrl,   // ← may come from store
  } = result;

  const imgSrc = _preview || previewUrl || null;

  const isSpill = prediction === "Oil Spill";
  const isUncertain = (uncertainty ?? 0) > 0.3;

  // Top accent color
  const accentColor = isSpill
    ? "var(--spill-red)"
    : isUncertain
    ? "var(--warn-amber)"
    : "var(--clean-green)";

  // Card glow
  const glowColor = isSpill
    ? "rgba(255, 69, 96, 0.08)"
    : isUncertain
    ? "rgba(255, 167, 38, 0.08)"
    : "rgba(0, 230, 118, 0.08)";

  return (
    <div
      style={{
        background: 'var(--ocean-deep)',
        border: '1px solid var(--ocean-border)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: `0 4px 24px ${glowColor}, 0 0 0 0 transparent`,
        animation: 'fadeUp 0.4s ease-out both',
        animationDelay: `${animationDelay}ms`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top accent stripe */}
      <div style={{ height: 2, background: accentColor, flexShrink: 0 }} />

      {/* Card header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid var(--ocean-border-sub)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <p style={{
            fontSize: 10,
            color: 'var(--cyan-ghost)',
            fontFamily: 'Inter, sans-serif',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
            title={filename}
          >
            {filename}
          </p>
          <StatusBadge prediction={prediction} uncertainty={uncertainty} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, color: 'var(--cyan-trace)', fontFamily: 'Inter, sans-serif' }}>
            {timestamp ? new Date(timestamp).toLocaleTimeString() : "—"}
          </span>
          {processing_time_ms != null && (
            <span style={{ fontSize: 9, color: 'var(--cyan-trace)', fontFamily: 'Inter, sans-serif' }}>
              · {processing_time_ms >= 1000
                ? `${(processing_time_ms / 1000).toFixed(1)}s`
                : `${Math.round(processing_time_ms)}ms`}
            </span>
          )}
        </div>
      </div>

      {/* SAR image preview */}
      <div style={{ height: 90, background: 'var(--ocean-surface)', position: 'relative', overflow: 'hidden' }}>
        {/* SVG grid overlay */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id={`grid-${filename?.replace(/\W/g,'')}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--cyan-bright)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${filename?.replace(/\W/g,'')})`} />
        </svg>

        {imgSrc ? (
          <img
            src={imgSrc}
            alt="SAR"
            style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 10, color: 'var(--cyan-trace)', fontFamily: 'Inter, sans-serif' }}>
              No preview available
            </span>
          </div>
        )}
      </div>

      {/* Metrics row */}
      <MetricCard
        confidence={confidence}
        uncertainty={uncertainty}
        processingTimeMs={processing_time_ms}
        prediction={prediction}
      />

      {/* Grad-CAM panels */}
      <HeatmapViewer
        originalSrc={imgSrc}
        gradcamBase64={gradcam_image}
        filename={filename}
        gradcamEnabled={gradcamEnabled}
      />
    </div>
  );
}
