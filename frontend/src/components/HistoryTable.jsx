import { useState } from "react";
import useSessionStore from "../store/sessionStore";

const COLUMNS = [
  { key: "index",           label: "#",               sortable: false },
  { key: "filename",        label: "Filename",         sortable: true },
  { key: "time",            label: "Time",             sortable: false },
  { key: "prediction",      label: "Prediction",       sortable: true },
  { key: "confidence",      label: "Confidence (%)",   sortable: true },
  { key: "uncertainty",     label: "Uncertainty",      sortable: true },
  { key: "processing_time_ms", label: "Processing (ms)", sortable: true },
];

/**
 * HistoryTable — Ocean-themed session prediction log with sortable columns and CSV export.
 */
export default function HistoryTable() {
  const { history, clearHistory, exportCSV } = useSessionStore();
  const [sortKey, setSortKey] = useState("index");
  const [sortDir, setSortDir] = useState("desc");

  if (history.length === 0) {
    return (
      <div style={{
        background: 'var(--ocean-deep)',
        border: '1px solid var(--ocean-border)',
        borderRadius: 12,
        padding: '14px',
        textAlign: 'center',
        paddingTop: 28, paddingBottom: 28,
      }}>
        <p style={{ fontSize: 11, color: 'var(--cyan-ghost)', fontFamily: 'Inter, sans-serif' }}>
          No predictions yet. Upload SAR images above to begin analysis.
        </p>
      </div>
    );
  }

  const handleSort = (key) => {
    if (!COLUMNS.find((c) => c.key === key)?.sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...history].sort((a, b) => {
    if (sortKey === "filename")   return sortDir === "asc" ? a.filename.localeCompare(b.filename)   : b.filename.localeCompare(a.filename);
    if (sortKey === "prediction") return sortDir === "asc" ? a.prediction.localeCompare(b.prediction) : b.prediction.localeCompare(a.prediction);
    if (sortKey === "confidence") return sortDir === "asc" ? a.confidence - b.confidence : b.confidence - a.confidence;
    if (sortKey === "uncertainty") return sortDir === "asc" ? a.uncertainty - b.uncertainty : b.uncertainty - a.uncertainty;
    if (sortKey === "processing_time_ms") return sortDir === "asc" ? a.processing_time_ms - b.processing_time_ms : b.processing_time_ms - a.processing_time_ms;
    return 0;
  });

  const predictionColor = (pred, unc) => {
    if (pred === "Oil Spill") return "var(--spill-red)";
    if ((unc ?? 0) > 0.3)    return "var(--warn-amber)";
    return "var(--clean-green)";
  };

  const uncertaintyColor = (unc) => {
    if (unc >= 0.3) return "var(--spill-red)";
    if (unc >= 0.1) return "var(--warn-amber)";
    return "var(--clean-green)";
  };

  return (
    <div style={{
      background: 'var(--ocean-deep)',
      border: '1px solid var(--ocean-border)',
      borderRadius: 12,
      padding: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Table icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="12" height="12" rx="2" stroke="var(--cyan-dim)" strokeWidth="1"/>
            <path d="M1 5h12M5 1v12" stroke="var(--cyan-dim)" strokeWidth="1"/>
          </svg>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12, fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            Session log
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 9, fontWeight: 600,
            color: 'var(--cyan-mid)',
            background: 'rgba(0, 168, 200, 0.12)',
            border: '1px solid rgba(0, 168, 200, 0.2)',
            borderRadius: 999,
            padding: '1px 7px',
          }}>
            {history.length}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            id="export-csv-btn"
            onClick={exportCSV}
            className="btn-export"
          >
            ↓ Export CSV
          </button>
          <button
            id="clear-history-btn"
            onClick={clearHistory}
            className="btn-clear"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--ocean-border)' }}>
        <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
          <thead>
            <tr style={{ background: 'var(--ocean-mid)', borderBottom: '1px solid var(--ocean-border)' }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: '8px 10px',
                    textAlign: 'left',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'var(--cyan-faint)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span style={{ marginLeft: 4, color: 'var(--cyan-bright)' }}>
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr
                key={row.id}
                style={{ borderBottom: '1px solid var(--ocean-border-dim)' }}
              >
                <td style={{ padding: '7px 10px', color: 'var(--cyan-ghost)' }}>{idx + 1}</td>
                <td style={{
                  padding: '7px 10px',
                  color: 'var(--cyan-ghost)',
                  maxWidth: 140,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                  title={row.filename}
                >
                  {row.filename}
                </td>
                <td style={{ padding: '7px 10px', color: 'var(--cyan-ghost)', whiteSpace: 'nowrap' }}>
                  {new Date(row.timestamp).toLocaleTimeString()}
                </td>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{
                    color: predictionColor(row.prediction, row.uncertainty),
                    fontWeight: 600,
                  }}>
                    {row.prediction}
                  </span>
                </td>
                <td style={{ padding: '7px 10px', color: 'var(--cyan-ghost)', fontVariantNumeric: 'tabular-nums' }}>
                  {row.confidence.toFixed(2)}%
                </td>
                <td style={{
                  padding: '7px 10px',
                  color: uncertaintyColor(row.uncertainty),
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 500,
                }}>
                  {row.uncertainty.toFixed(4)}
                </td>
                <td style={{ padding: '7px 10px', color: 'var(--cyan-ghost)', fontVariantNumeric: 'tabular-nums' }}>
                  {row.processing_time_ms.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
