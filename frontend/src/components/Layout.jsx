import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, ScanLine, History, Settings, Sun, Moon, Monitor } from "lucide-react";
import { fetchHealth } from "../services/api";
import useThemeStore from "../store/themeStore";

function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div style={{
      display: 'flex', background: 'var(--surface-alt)', borderRadius: 8, padding: 4, gap: 4
    }}>
      <button
        onClick={() => setTheme('light')}
        style={{
          flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: theme === 'light' ? 'var(--surface)' : 'transparent',
          color: theme === 'light' ? 'var(--primary)' : 'var(--text-muted)',
          boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
          transition: 'all 0.2s'
        }}
        title="Light Mode"
      >
        <Sun size={14} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => setTheme('system')}
        style={{
          flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: theme === 'system' ? 'var(--surface)' : 'transparent',
          color: theme === 'system' ? 'var(--primary)' : 'var(--text-muted)',
          boxShadow: theme === 'system' ? 'var(--shadow-sm)' : 'none',
          transition: 'all 0.2s'
        }}
        title="System Preference"
      >
        <Monitor size={14} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        style={{
          flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: theme === 'dark' ? 'var(--surface)' : 'transparent',
          color: theme === 'dark' ? 'var(--primary)' : 'var(--text-muted)',
          boxShadow: theme === 'dark' ? 'var(--shadow-sm)' : 'none',
          transition: 'all 0.2s'
        }}
        title="Dark Mode"
      >
        <Moon size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default function Layout() {
  const location = useLocation();

  // Poll backend health globally
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 10000,
    retry: false,
  });

  const modelLoaded = health?.model_loaded ?? null;

  const NAV_ITEMS = [
    { name: "Overview",   path: "/",           icon: LayoutDashboard },
    { name: "Analysis",   path: "/analysis",   icon: ScanLine },
    { name: "History",    path: "/history",    icon: History },
    { name: "Settings",   path: "/settings",   icon: Settings },
  ];

  const pageTitle = NAV_ITEMS.find(n => n.path === location.pathname)?.name || "Dashboard";

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="mesh-background" />

      {/* ── Sidebar ── */}
      <aside className="glass" style={{
        width: 260,
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--primary-bg)',
            border: '1px solid var(--primary-bdr)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)',
          }}>
            <ScanLine size={18} strokeWidth={2.5}/>
          </div>
          <div>
            <h1 className="font-outfit" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              OceanWatch
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enterprise Edition</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 13, fontWeight: 500,
                  transition: 'all 0.2s',
                  background: isActive ? 'var(--primary-bg)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-body)',
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} style={{ opacity: isActive ? 1 : 0.7 }} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Theme Toggler Bottom */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Appearance
          </p>
          <ThemeToggle />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, padding: '12px', background: 'var(--surface-alt)', borderRadius: 12, border: '1px solid var(--border)' }}>
             <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #9333ea)', flexShrink: 0 }} />
             <div style={{ minWidth: 0 }}>
               <p className="font-outfit" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>System Admin</p>
               <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>Active Session</p>
             </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header */}
        <header className="glass" style={{
          height: 64,
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{pageTitle}</h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Status Pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: modelLoaded === false ? 'var(--spill-bg)' : 'var(--clean-bg)',
              border: `1px solid ${modelLoaded === false ? 'var(--spill-bdr)' : 'var(--clean-bdr)'}`,
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 12, fontWeight: 500,
              color: modelLoaded === false ? 'var(--spill)' : 'var(--clean)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: modelLoaded === false ? 'var(--spill)' : 'var(--clean)',
                animation: 'pulse-dot 2s infinite',
              }} />
              {modelLoaded === false ? "Backend Offline"
                : modelLoaded === true ? "Model Ready"
                : "Connecting…"}
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}
