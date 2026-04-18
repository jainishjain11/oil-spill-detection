import { useState } from "react";
import { Download, SearchX, ArrowUpDown } from "lucide-react";
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

export default function HistoryTable() {
  const { history, clearHistory, exportCSV } = useSessionStore();
  const [sortKey, setSortKey] = useState("index");
  const [sortDir, setSortDir] = useState("desc");

  if (history.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12,
        padding: '32px 16px', textAlign: 'center',
      }}>
        <SearchX size={32} color="var(--border-focus)" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>
          No predictions available
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
          Session history will populate as you process images.
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
    if (pred === "Oil Spill") return "var(--spill)";
    if ((unc ?? 0) > 0.3)    return "var(--warn)";
    return "var(--clean)";
  };

  const uncertaintyColor = (unc) => {
    if (unc >= 0.3) return "var(--spill)";
    if (unc >= 0.1) return "var(--warn)";
    return "var(--clean)";
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Log Entries</span>
          <span style={{
            fontSize: 12, fontWeight: 600, color: 'var(--primary)',
            background: 'var(--primary-bg)', border: '1px solid var(--primary-bdr)',
            padding: '2px 8px', borderRadius: 999
          }}>
            {history.length}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={exportCSV} className="btn-ghost" style={{ padding: '6px 12px' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={clearHistory} className="btn-ghost" style={{ color: 'var(--spill)', padding: '6px 12px' }}>
            Clear Log
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
          <thead>
            <tr style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: '12px 20px', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                    whiteSpace: 'nowrap', cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => col.sortable && (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                  onMouseLeave={(e) => col.sortable && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                       <ArrowUpDown size={12} color="var(--primary)" style={{ 
                         transform: sortDir === "asc" ? 'rotate(180deg)' : 'none',
                         transition: 'transform 0.2s'
                       }} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-alt)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
              >
                <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                <td style={{
                  padding: '12px 20px', color: 'var(--text-primary)', fontWeight: 500,
                  maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }} title={row.filename}>
                  {row.filename}
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(row.timestamp).toLocaleTimeString()}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    color: predictionColor(row.prediction, row.uncertainty),
                    fontWeight: 600,
                    background: row.prediction === "Oil Spill" ? "var(--spill-bg)" : "var(--clean-bg)",
                    border: `1px solid ${row.prediction === "Oil Spill" ? "var(--spill-bdr)" : "var(--clean-bdr)"}`,
                    padding: '4px 8px', borderRadius: 6, fontSize: 12
                  }}>
                    {row.prediction}
                  </span>
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--text-body)', fontVariantNumeric: 'tabular-nums' }}>
                  {row.confidence.toFixed(2)}%
                </td>
                <td style={{
                  padding: '12px 20px',
                  color: uncertaintyColor(row.uncertainty),
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 600,
                }}>
                  {row.uncertainty.toFixed(4)}
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
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
