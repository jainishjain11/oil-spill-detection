import { create } from "zustand";

/**
 * Zustand store for session prediction history.
 * Persists in memory for the duration of the browser session.
 */
const useSessionStore = create((set, get) => ({
  history: [],

  /** Append a new prediction result to history */
  addResult: (result) =>
    set((state) => ({
      history: [{ ...result, id: Date.now() + Math.random() }, ...state.history],
    })),

  /** Clear all history */
  clearHistory: () => set({ history: [] }),

  /** Export current history as a CSV file download */
  exportCSV: () => {
    const { history } = get();
    if (history.length === 0) return;

    const headers = ["#", "Filename", "Time", "Prediction", "Confidence (%)", "Uncertainty", "Processing (ms)"];
    const rows = history.map((r, i) => [
      history.length - i,
      r.filename,
      new Date(r.timestamp).toLocaleTimeString(),
      r.prediction,
      r.confidence.toFixed(2),
      r.uncertainty.toFixed(4),
      r.processing_time_ms.toFixed(1),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `oil_spill_results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
}));

export default useSessionStore;
