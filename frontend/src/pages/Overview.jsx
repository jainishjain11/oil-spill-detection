import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Link2, AlertTriangle, CheckCircle, HelpCircle, Activity } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import useSessionStore from "../store/sessionStore";

export default function Overview() {
  const history = useSessionStore((s) => s.history);

  const stats = useMemo(() => {
    const total = history.length;
    const spills = history.filter((r) => r.prediction === "Oil Spill").length;
    const uncertain = history.filter((r) => (r.uncertainty ?? 0) > 0.3 && r.prediction !== "Oil Spill").length;
    const clean = history.filter((r) => r.prediction !== "Oil Spill" && (r.uncertainty ?? 0) <= 0.3).length;

    return { total, spills, uncertain, clean };
  }, [history]);

  const pieData = [
    { name: "Clean", value: stats.clean, color: "var(--clean)" },
    { name: "Spill", value: stats.spills, color: "var(--spill)" },
    { name: "Uncertain", value: stats.uncertain, color: "var(--warn)" },
  ].filter(d => d.value > 0);

  // Take the last 7 items for bar chart
  const barData = useMemo(() => {
    return history.slice(0, 7).reverse().map((r, i) => ({
      name: `T-${7 - i}`,
      confidence: Number(r.confidence.toFixed(1)),
      isSpill: r.prediction === "Oil Spill"
    }));
  }, [history]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Welcome Banner */}
      <div style={{
        background: 'var(--primary-bg)',
        border: '1px solid var(--primary-bdr)',
        borderRadius: 12, padding: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
            System Overview
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-body)', maxWidth: 500 }}>
            Real-time insights from Sentinel-1 SAR imagery analysis. You have processed {stats.total} images in this session.
          </p>
        </div>
        <Link to="/analysis" className="btn-primary" style={{ textDecoration: 'none' }}>
          Start New Analysis <Link2 size={16} />
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: "Total Analysed", value: stats.total, icon: Activity, color: "var(--primary)", bg: "var(--primary-bg)" },
          { label: "Spills Detected", value: stats.spills, icon: AlertTriangle, color: "var(--spill)", bg: "var(--spill-bg)" },
          { label: "Clean Waters", value: stats.clean, icon: CheckCircle, color: "var(--clean)", bg: "var(--clean-bg)" },
          { label: "Uncertainties", value: stats.uncertain, icon: HelpCircle, color: "var(--warn)", bg: "var(--warn-bg)" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={24} strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{s.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      {stats.total > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          {/* Pie Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Distribution
            </h3>
            <div style={{ flex: 1, minHeight: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
               {pieData.map(d => (
                 <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                    <span style={{ fontSize: 12, color: 'var(--text-body)' }}>{d.name}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Recent Confidence Trends
            </h3>
            <div style={{ flex: 1, minHeight: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: 'var(--surface-alt)' }}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isSpill ? 'var(--spill)' : 'var(--clean)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: 60, textAlign: 'center',
          background: 'var(--surface)', border: '1px dashed var(--border-focus)', borderRadius: 12,
        }}>
          <Activity size={48} color="var(--border-focus)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)' }}>No data to display yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 4 }}>
            Go to the Analysis tab to upload images and run predictions.
          </p>
        </div>
      )}

    </div>
  );
}
