import { useCallback, useEffect, useRef, useState } from "react";
import { Settings, Sliders, Eye, Layers } from "lucide-react";
import useSessionStore from "../store/sessionStore";

export default function SettingsPage() {
  const { mcRuns, setMcRuns, gradcamEnabled, setGradcamEnabled } = useSessionStore();
  
  const debounceTimer = useRef(null);
  const [localRuns, setLocalRuns] = useState(mcRuns);

  const handleSliderChange = useCallback((e) => {
    const val = Number(e.target.value);
    setLocalRuns(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setMcRuns(val);
    }, 400);
  }, [setMcRuns]);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const estimatedSec = ((localRuns * 0.08) + 0.5).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Settings size={28} color="var(--primary)" />
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Configuration</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Fine-tune the model parameters and pipeline preferences.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Inference Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sliders size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Inference Settings</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-body)' }}>Monte Carlo Dropout Runs</label>
               <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{localRuns}</span>
            </div>
            
            <input
              type="range"
              min={5} max={100} step={5}
              value={localRuns}
              onChange={handleSliderChange}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>5 (Fast)</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>100 (Precise)</span>
            </div>

            <div style={{ marginTop: 12, padding: 12, background: 'var(--surface-alt)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>MC Dropout</strong> estimates model uncertainty by running {localRuns} forward passes per image. Higher runs yield more accurate confidence intervals but incur a performance cost.
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                ⏱ Estimated process time: <strong>~{estimatedSec}s</strong> / image
              </p>
            </div>
          </div>
        </div>

        {/* Explainability Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Eye size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Explainability</h3>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 400 }}>
             <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Grad-CAM Visualization</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Generate heatmaps highlighting region importance.</p>
             </div>
             
             <label className="toggle-switch" htmlFor="gradcam-toggle">
              <input
                id="gradcam-toggle"
                type="checkbox"
                checked={gradcamEnabled}
                onChange={(e) => setGradcamEnabled(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="card" style={{ background: 'var(--surface-alt)', border: 'none' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Layers size={18} color="var(--text-primary)" />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>System Architecture</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            This application utilizes <strong>MobileNetV2</strong> fine-tuned for SAR imagery analysis via FastAPI and PyTorch. 
            Frontend is powered by React, Vite, and Zustand for state persistence.
          </p>
        </div>

      </div>
    </div>
  );
}
