import { useState } from "react";
import useSessionStore from "../store/sessionStore";

const COLUMNS = [
  { key: "index", label: "#", sortable: false },
  { key: "filename", label: "Filename", sortable: true },
  { key: "time", label: "Time", sortable: false },
  { key: "prediction", label: "Prediction", sortable: true },
  { key: "confidence", label: "Confidence (%)", sortable: true },
  { key: "uncertainty", label: "Uncertainty", sortable: true },
  { key: "processing_time_ms", label: "Processing (ms)", sortable: true },
];

/**
 * HistoryTable — Session prediction log with sortable columns and CSV export.
 */
export default function HistoryTable() {
  const { history, clearHistory, exportCSV } = useSessionStore();
  const [sortKey, setSortKey] = useState("index");
  const [sortDir, setSortDir] = useState("desc");

  if (history.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-500 text-sm">
          📋 No predictions yet. Upload images above to start.
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
    if (sortKey === "filename") return sortDir === "asc"
      ? a.filename.localeCompare(b.filename)
      : b.filename.localeCompare(a.filename);
    if (sortKey === "prediction") return sortDir === "asc"
      ? a.prediction.localeCompare(b.prediction)
      : b.prediction.localeCompare(a.prediction);
    if (sortKey === "confidence") return sortDir === "asc"
      ? a.confidence - b.confidence
      : b.confidence - a.confidence;
    if (sortKey === "uncertainty") return sortDir === "asc"
      ? a.uncertainty - b.uncertainty
      : b.uncertainty - a.uncertainty;
    if (sortKey === "processing_time_ms") return sortDir === "asc"
      ? a.processing_time_ms - b.processing_time_ms
      : b.processing_time_ms - a.processing_time_ms;
    return 0; // default: insertion order
  });

  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            Session History
          </h2>
          <span className="text-xs bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="export-csv-btn"
            onClick={exportCSV}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            📥 Export CSV
          </button>
          <button
            id="clear-history-btn"
            onClick={clearHistory}
            className="btn-ghost text-xs px-3 py-1.5 text-red-400 hover:text-red-300 border-red-500/20"
          >
            🗑 Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface-2 border-b border-border">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-2.5 text-left font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap
                    ${col.sortable ? "cursor-pointer hover:text-slate-200 select-none" : ""}`}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1 text-accent">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => {
              const isSpill = row.prediction === "Oil Spill";
              return (
                <tr
                  key={row.id}
                  className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                >
                  <td className="px-3 py-2.5 text-slate-500">{idx + 1}</td>
                  <td className="px-3 py-2.5 text-slate-300 font-medium max-w-[140px] truncate" title={row.filename}>
                    {row.filename}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                    {new Date(row.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-md
                        ${isSpill
                          ? "text-red-400 bg-red-500/10"
                          : "text-emerald-400 bg-emerald-500/10"}`}
                    >
                      {row.prediction}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300 tabular-nums">
                    {row.confidence.toFixed(2)}%
                  </td>
                  <td className={`px-3 py-2.5 tabular-nums font-medium
                    ${row.uncertainty >= 0.3 ? "text-red-400"
                      : row.uncertainty >= 0.1 ? "text-amber-400"
                        : "text-emerald-400"}`}
                  >
                    {row.uncertainty.toFixed(4)}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 tabular-nums">
                    {row.processing_time_ms.toFixed(0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
