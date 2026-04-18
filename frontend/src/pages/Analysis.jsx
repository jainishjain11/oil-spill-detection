import { useState } from "react";
import { UploadCloud, FileImage } from "lucide-react";
import UploadZone from "../components/UploadZone";
import ResultPanel from "../components/ResultPanel";
import useSessionStore from "../store/sessionStore";

export default function Analysis() {
  const [results, setResults] = useState([]);
  const mcRuns = useSessionStore((s) => s.mcRuns);
  const gradcamEnabled = useSessionStore((s) => s.gradcamEnabled);

  const handleNewResults = (newResults) => {
    setResults((prev) => [...newResults, ...prev]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Upload Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <UploadCloud size={20} color="var(--primary)" />
          <h2 className="font-outfit" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
            Upload SAR Images
          </h2>
        </div>
        <UploadZone
          mcRuns={mcRuns}
          gradcamEnabled={gradcamEnabled}
          onResults={handleNewResults}
        />
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="font-outfit" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
                Analysis Results
              </h2>
              <span style={{
                fontSize: 12, fontWeight: 700, color: 'var(--primary)',
                background: 'var(--primary-bg)', padding: '2px 8px', borderRadius: 999
              }}>
                {results.length}
              </span>
            </div>
            <button onClick={() => setResults([])} className="btn-ghost" style={{ fontSize: 12 }}>
              Clear Results
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}>
            {results.map((r, idx) => (
              <ResultPanel
                key={r.filename + r.timestamp + idx}
                result={r}
                gradcamEnabled={gradcamEnabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && (
        <div style={{
          padding: 60, textAlign: 'center',
          background: 'transparent',
          border: '1px dashed var(--border-focus)',
          borderRadius: 12,
        }}>
          <FileImage size={48} color="var(--border-focus)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)' }}>No Active Results</p>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 4 }}>
            Images processed will appear here. Past session history is available in the History tab.
          </p>
        </div>
      )}

    </div>
  );
}
