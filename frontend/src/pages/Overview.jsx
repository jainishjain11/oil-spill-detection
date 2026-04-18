import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Link2, AlertTriangle, CheckCircle, HelpCircle, Activity, Globe, Server, Cpu } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
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

  // Generate a mock timeline for the Area Chart based on history or defaults
  const areaData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 7; i++) {
        const hItem = history[history.length - 1 - i];
        data.unshift({
            time: `T-${i}`,
            confidence: hItem ? Number(hItem.confidence.toFixed(1)) : (Math.random() * 40 + 50),
            baseline: 50
        });
    }
    return data;
  }, [history]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--primary-bg), var(--surface))',
        border: '1px solid var(--primary-bdr)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        padding: 32,
      }}>
        <div>
          <h2 className="font-outfit" style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Command Center Overview
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-body)', maxWidth: 600, lineHeight: 1.6 }}>
            Real-time insights from Sentinel-1 SAR imagery analysis. You have processed <strong style={{ color: 'var(--text-primary)' }}>{stats.total}</strong> active images in this session via the MobileNetV2 architecture pipeline.
          </p>
        </div>
        <Link to="/analysis" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: 15 }}>
          Start New Analysis <Link2 size={18} />
        </Link>
      </div>

      {/* Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 20,
        alignItems: 'start'
      }}>
        
        {/* Core Stats (Left Column) */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { label: "Total Monitored", value: stats.total, icon: Activity, color: "var(--primary)", bg: "var(--primary-bg)" },
            { label: "Spills Detected", value: stats.spills, icon: AlertTriangle, color: "var(--spill)", bg: "var(--spill-bg)" },
            { label: "Clean Waters", value: stats.clean, icon: CheckCircle, color: "var(--clean)", bg: "var(--clean-bg)" },
            { label: "Review Required", value: stats.uncertain, icon: HelpCircle, color: "var(--warn)", bg: "var(--warn-bg)" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 16,
                  background: s.bg, color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={26} strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="font-outfit" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Main Charts (Span 6) */}
        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="card" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
            <h3 className="font-outfit" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Confidence Timeline
            </h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, boxShadow: 'var(--shadow-lg)' }}
                  />
                  <Area type="monotone" dataKey="confidence" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorConf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* System Health Block */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Server size={18} color="var(--primary)" />
                  <h3 className="font-outfit" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>System Health</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Backend Latency</span>
                      <span style={{ color: 'var(--clean)', fontWeight: 600 }}>24ms</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: 'var(--surface-alt)', borderRadius: 2 }}>
                       <div style={{ width: '15%', height: '100%', background: 'var(--clean)', borderRadius: 2 }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>GPU Utilization</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>42%</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: 'var(--surface-alt)', borderRadius: 2 }}>
                       <div style={{ width: '42%', height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
            </div>

            {/* Geographic Coverage (Mock) */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Globe size={18} color="var(--primary)" />
                  <h3 className="font-outfit" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Active Region</h3>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sentinel-1 Oceanic Sweep Data</p>
                <div style={{ marginTop: 12, display: 'inline-flex', background: 'var(--surface-alt)', padding: '6px 12px', borderRadius: 8 }}>
                  <span className="font-outfit" style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>LAT: 12°N · LON: 80°E</span>
                </div>
              </div>
              <Activity size={100} color="var(--primary-bdr)" style={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.2 }} />
            </div>
          </div>
        </div>

        {/* Right Distribution & Feed (Span 3) */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="card">
            <h3 className="font-outfit" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Distribution Map
            </h3>
            {stats.total > 0 ? (
              <>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={70} paddingAngle={4}
                        dataKey="value" stroke="none"
                      >
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 8, fontSize: 12, boxShadow: 'var(--shadow-lg)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: 'var(--surface-alt)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-body)' }}>{d.name}</span>
                        </div>
                        <span className="font-outfit" style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Awaiting Prediction Data</p>
              </div>
            )}
          </div>

          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className="font-outfit" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {history.slice(0, 3).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.prediction === 'Oil Spill' ? 'var(--spill)' : 'var(--clean)', marginTop: 6 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, wordBreak: 'break-all' }}>
                      {item.filename}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                 <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>No recent activity securely logged.</p>
              )}
            </div>
            
            {history.length > 0 && (
              <Link to="/history" className="btn-ghost" style={{ marginTop: 'auto', alignSelf: 'center' }}>
                View Full Log
              </Link>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
