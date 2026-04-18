import { History } from "lucide-react";
import HistoryTable from "../components/HistoryTable";

export default function HistoryPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <History size={24} color="var(--primary)" />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Session History</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Complete log of predictions made during this active session.
          </p>
        </div>
      </div>
      
      <HistoryTable />
    </div>
  );
}
