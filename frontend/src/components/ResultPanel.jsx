import { lazy, Suspense } from "react";
import StatusBadge from "./StatusBadge";
import MetricCard from "./MetricCard";

const HeatmapViewer = lazy(() => import("./HeatmapViewer"));

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
    previewUrl,
  } = result;

  const imgSrc = _preview || previewUrl || null;
  const isSpill = prediction === "Oil Spill";
  const isUncertain = (uncertainty ?? 0) > 0.3;

  const accentColor = isSpill ? "var(--spill)" : isUncertain ? "var(--warn)" : "var(--clean)";

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        animation: 'fadeUp 0.4s ease-out both',
        animationDelay: `${animationDelay}ms`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top accent stripe */}
      <div style={{ height: 3, background: accentColor, flexShrink: 0 }} />

      {/* Card header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-sub)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
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
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
            {timestamp ? new Date(timestamp).toLocaleTimeString() : "—"}
          </span>
          {processing_time_ms != null && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              · {processing_time_ms >= 1000
                ? `${(processing_time_ms / 1000).toFixed(1)}s`
                : `${Math.round(processing_time_ms)}ms`}
            </span>
          )}
        </div>
      </div>

      {/* Image Preview */}
      <div style={{ height: 120, background: 'var(--surface-alt)', position: 'relative', overflow: 'hidden' }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt="SAR Image"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              No image preview available
            </span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <MetricCard
        confidence={confidence}
        uncertainty={uncertainty}
        processingTimeMs={processing_time_ms}
        prediction={prediction}
      />

      {/* Grad-CAM Heatmap Viewer */}
      <div style={{ padding: '12px 16px' }}>
        <Suspense fallback={
          <div className="skeleton" style={{ height: 64, borderRadius: 8 }} />
        }>
          <HeatmapViewer
            originalSrc={imgSrc}
            gradcamBase64={gradcam_image}
            filename={filename}
            gradcamEnabled={gradcamEnabled}
          />
        </Suspense>
      </div>

    </div>
  );
}
