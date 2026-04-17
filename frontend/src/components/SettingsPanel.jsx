import { useCallback, useEffect, useRef } from "react";

/**
 * SettingsPanel — MC Runs slider + Grad-CAM toggle.
 * MC Runs slider is debounced 500ms before calling onMcRunsChange.
 */
export default function SettingsPanel({
  mcRuns,
  onMcRunsChange,
  gradcamEnabled,
  onGradcamToggle,
}) {
  const debounceTimer = useRef(null);

  const handleSliderChange = useCallback(
    (e) => {
      const val = Number(e.target.value);
      // Optimistic immediate UI update via parent
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onMcRunsChange(val);
      }, 500);
      // Update visual immediately
      e.target.closest(".slider-container")
        ?.querySelector(".slider-value")
        ?.setAttribute("data-value", val);
    },
    [onMcRunsChange]
  );

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  // Estimate time based on mc_runs
  const estimatedSec = ((mcRuns * 0.08) + 0.5).toFixed(1);

  return (
    <div className="card flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚙️</span>
        <h2 className="text-sm font-bold text-slate-200 tracking-wide uppercase">Settings</h2>
      </div>

      {/* MC Runs Slider */}
      <div className="slider-container flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            MC Dropout Runs
          </label>
          <span className="text-sm font-bold text-accent tabular-nums">{mcRuns}</span>
        </div>
        <input
          id="mc-runs-slider"
          type="range"
          min={5}
          max={100}
          step={5}
          defaultValue={mcRuns}
          onChange={(e) => onMcRunsChange(Number(e.target.value))}
          className="w-full"
          aria-label="Monte Carlo Dropout runs"
        />
        <div className="flex justify-between text-[10px] text-slate-600">
          <span>5 (fast)</span>
          <span>100 (precise)</span>
        </div>

        {/* Tooltip / info */}
        <div className="mt-1 rounded-lg border border-border bg-surface-2 p-3">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <span className="text-amber-400 font-semibold">MC Dropout</span> runs the model
            <span className="font-semibold text-slate-300"> {mcRuns}×</span> with dropout active,
            then averages predictions to estimate uncertainty.
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            ⏱ ~{estimatedSec}s per image
          </p>
        </div>
      </div>

      {/* Grad-CAM Toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Grad-CAM</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Visual explanation heatmap</p>
        </div>
        <label className="toggle-switch" htmlFor="gradcam-toggle">
          <input
            id="gradcam-toggle"
            type="checkbox"
            checked={gradcamEnabled}
            onChange={(e) => onGradcamToggle(e.target.checked)}
            aria-label="Enable Grad-CAM heatmap"
          />
          <span className="toggle-slider" />
        </label>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Model info */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Model</p>
        <div className="flex flex-wrap gap-1.5">
          {["MobileNetV2", "MC Dropout", "Grad-CAM", "SAR Imagery"].map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium bg-surface-2 text-slate-400 border border-border rounded px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
