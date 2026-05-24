/**
 * src/components/layout/AppShell.jsx
 */
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, User, Building2, Calendar, ClipboardList,
  Target, SlidersHorizontal, BarChart3, Star, Sparkles,
  Users, CheckCircle2, Gift, Award, Menu, X, FileText,
  ChevronsLeft, ChevronsRight, Sun, Moon, LogOut, Bell, MessageSquare, Mic,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import { T, getTheme } from "@/tokens";
import { useTheme } from "@/context/ThemeContext";
import useNotificationStore from "@/store/notificationStore";

// ── Nav config per role (Mapped exactly to router.jsx paths) ─────────────────
const NAV = {
  student: [
    {
      items: [
        { icon: LayoutDashboard, label: "Dashboard",    path: "/student/dashboard" },
        { icon: User,            label: "My Profile",   path: "/student/profile"   },
        { icon: Building2,       label: "Companies",    path: "/student/companies" },
        { icon: Calendar,        label: "Drives",       path: "/student/drives"    },
        { icon: ClipboardList,   label: "Applications", path: "/student/apps"      },
        { icon: Gift,            label: "My Offers",    path: "/student/offers"    },
        { icon: MessageSquare,   label: "Direct Messages", path: "/messages"       },
      ],
    },
    {
      section: "Smart Features",
      items: [
        { icon: Target,              label: "Strategy",        path: "/student/strategy"  },
        { icon: SlidersHorizontal,   label: "CGPA Simulator",  path: "/student/simulator" },
        { icon: BarChart3,           label: "Rejection",       path: "/student/rejection" },
        { icon: Star,                label: "Dream Company",   path: "/student/dream"     },
        { icon: FileText,            label: "Resume Analyzer", path: "/student/resume"    },
        { icon: Mic,                 label: "AI Mock Interview", path: "/student/mock-interview" },
      ],
    },
    {
      items: [{ icon: Sparkles, label: "AI Assistant", path: "/chat", ai: true }],
    },
  ],
  tpo: [
    {
      items: [
        { icon: LayoutDashboard, label: "Dashboard",       path: "/tpo/dashboard"    },
        { icon: Users,           label: "Students",        path: "/tpo/students"     },
        { icon: Building2,       label: "Companies",       path: "/tpo/companies"    },
        { icon: Calendar,        label: "Drives",          path: "/tpo/drives"       },
        { icon: ClipboardList,   label: "Applications",    path: "/tpo/applications" },
        { icon: CheckCircle2,    label: "Results",         path: "/tpo/results"      },
        { icon: Gift,            label: "Offers",          path: "/tpo/offers"       },
        { icon: Award,           label: "Placed Students", path: "/tpo/placed"       },
        { icon: MessageSquare,   label: "Direct Messages", path: "/tpo/messages"     },
      ],
    },
    {
      items: [{ icon: Sparkles, label: "AI Assistant", path: "/tpo/chat", ai: true }],
    },
  ],
  company: [ // HR Role
    {
      items: [
        { icon: LayoutDashboard, label: "Dashboard",       path: "/hr/dashboard"    },
        { icon: Building2,       label: "Companies",       path: "/hr/companies"    },
        { icon: Calendar,        label: "Drives",          path: "/hr/drives"       },
        { icon: ClipboardList,   label: "Applications",    path: "/hr/applications" },
        { icon: Award,           label: "Placed Students", path: "/hr/placed"       },
        { icon: MessageSquare,   label: "Direct Messages", path: "/hr/messages"     },
      ],
    },
    {
      items: [{ icon: Sparkles, label: "AI Assistant", path: "/hr/chat", ai: true }],
    },
  ],
};

const USER_META = {
  student: { badge: "Student", color: T.success },
  tpo:     { badge: "TPO",     color: T.amber   },
  company: { badge: "HR",      color: T.info    },
};

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.26, background: T.amber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 20 20" fill="none">
        <polygon points="10,1.5 18.5,6.5 18.5,13.5 10,18.5 1.5,13.5 1.5,6.5" stroke="#1C1917" strokeWidth="1.7" fill="none" strokeLinejoin="round"/>
        <circle cx="10" cy="10" r="2.7" fill="#1C1917"/>
        <line x1="10" y1="7.3" x2="10" y2="1.5" stroke="#1C1917" strokeWidth="1.2"/>
      </svg>
    </div>
  );
}

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavItem({ item, currentPath, collapsed, th, onClick }) {
  const [hov, setHov] = useState(false);

  const isActive = currentPath === item.path;
  const bg = isActive ? th.navActiveBg : hov ? th.navHoverBg : "transparent";
  const color = isActive ? th.navTextActive : hov ? th.navTextHover : th.navText;
  const IconEl = item.icon;

  return (
    <button
      onClick={() => onClick(item.path)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={collapsed ? item.label : undefined}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: collapsed ? 0 : 11,
        padding: collapsed ? "10px 0" : "9px 14px", justifyContent: collapsed ? "center" : "flex-start",
        background: item.ai ? (isActive ? "rgba(245,158,11,0.14)" : hov ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.04)") : bg,
        border: "none", borderRadius: 9, cursor: "pointer",
        borderLeft: isActive && !item.ai ? `2.5px solid ${T.amber}` : "2.5px solid transparent",
        transition: "background 0.15s, color 0.15s", fontFamily: T.font,
        color: item.ai ? (isActive ? T.amber : hov ? T.amber : "rgba(245,158,11,0.65)") : color,
      }}
    >
      <IconEl size={16} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ fontSize: 13.5, fontWeight: isActive ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
      {!collapsed && item.ai && <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 600, padding: "1.5px 5px", borderRadius: 4, background: "rgba(245,158,11,0.15)", color: T.amber, letterSpacing: "0.04em" }}>AI</span>}
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ role, currentPath, th, collapsed, onNav, onClose, mobile, authUser, logout }) {
  const nav = NAV[role] || NAV.student;
  const userMeta = USER_META[role] || USER_META.student;
  const name = authUser?.name || authUser?.username || "User";
  const initials = name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
  const W = collapsed ? 64 : 240;

  return (
    <aside style={{
      width: W, minWidth: W, height: "100vh", background: th.sidebar, borderRight: `1px solid ${th.border}`,
      display: "flex", flexDirection: "column", overflow: "hidden", transition: "width 0.22s ease, min-width 0.22s ease",
      position: mobile ? "fixed" : "relative", top: 0, left: 0, zIndex: mobile ? 200 : 1, flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 18px", display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", borderBottom: `1px solid ${th.border}` }}>
        <Logo size={30} />
        {!collapsed && (
          <>
            <span style={{ fontFamily: T.fontSerif, fontSize: 18, color: th.textPrimary, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>SmartPlace</span>
            {mobile && <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: th.navText, padding: 4 }}><X size={18} /></button>}
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "12px 8px" : "12px 10px" }}>
        {nav.map((group, gi) => (
          <div key={gi} style={{ marginBottom: gi < nav.length - 1 ? 8 : 0 }}>
            {group.section && !collapsed && <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: th.sectionLabel, fontWeight: 600, padding: "12px 14px 6px", userSelect: "none" }}>{group.section}</div>}
            {group.section && collapsed && <div style={{ height: 1, background: th.border, margin: "8px 0" }} />}
            {group.items.map(item => <NavItem key={item.path} item={item} currentPath={currentPath} collapsed={collapsed} th={th} onClick={onNav} />)}
          </div>
        ))}
      </nav>

      {/* User card + logout */}
      <div style={{ borderTop: `1px solid ${th.border}`, padding: collapsed ? "14px 0" : "14px 12px" }}>
        {!collapsed ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: userMeta.color + "22", border: `1.5px solid ${userMeta.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: userMeta.color, flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: th.navTextActive, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
              <div style={{ fontSize: 11, color: userMeta.color, fontWeight: 500 }}>{userMeta.badge}</div>
            </div>
            <button onClick={logout} title="Log Out" style={{ background: "none", border: "none", cursor: "pointer", color: th.navText, padding: 4 }}><LogOut size={15} /></button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}><div style={{ width: 32, height: 32, borderRadius: 8, background: userMeta.color + "22", border: `1.5px solid ${userMeta.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: userMeta.color }}>{initials}</div></div>
        )}
      </div>
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ currentLabel, dark, th, collapsed, onToggleSidebar, onToggleDark, onOpenMobile, isMobileWidth }) {
  const navigate = useNavigate();
  const notifications = useNotificationStore(state => state.notifications);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [open, setOpen] = useState(false);

  const handleNotifClick = (n) => {
    markAsRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <header style={{ height: 56, background: th.topbarBg, borderBottom: `1px solid ${th.border}`, display: "flex", alignItems: "center", padding: "0 20px 0 16px", gap: 12, flexShrink: 0 }}>
      {isMobileWidth ? (
        <button onClick={onOpenMobile} style={{ background: "none", border: "none", cursor: "pointer", color: th.textSecondary, padding: 4, display: "flex" }}><Menu size={20} /></button>
      ) : (
        <button onClick={onToggleSidebar} style={{ background: "none", border: "none", cursor: "pointer", color: th.textSecondary, padding: 4, display: "flex", transition: "color 0.15s" }}>
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      )}

      <h1 style={{ fontFamily: T.fontSerif, fontSize: 20, color: th.textPrimary, letterSpacing: "-0.02em", margin: 0, flex: 1 }}>{currentLabel}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
        
        {/* Bell Icon & Notification Button */}
        <button 
          onClick={() => setOpen(!open)}
          style={{ 
            background: open ? th.surfaceUp : "none", 
            border: "none", 
            cursor: "pointer", 
            color: th.textSecondary, 
            padding: "6px", 
            borderRadius: 8, 
            display: "flex", 
            position: "relative" 
          }}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <div style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: T.danger }} />
          )}
        </button>

        {/* Glassmorphic Notifications Panel */}
        {open && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
            <div style={{
              position: "absolute",
              top: 42,
              right: 0,
              width: 320,
              maxHeight: 400,
              background: th.surface,
              border: `1px solid ${th.borderUp}`,
              borderRadius: 12,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.35)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "slideDown 0.15s ease-out"
            }}>
              <style>{`
                @keyframes slideDown { from { transform: translateY(-5px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
              `}</style>
              
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${th.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: th.textPrimary }}>Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    style={{ background: "none", border: "none", color: T.amber, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ overflowY: "auto", flex: 1, maxHeight: 320 }}>
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: `1px solid ${th.border}`,
                      cursor: "pointer",
                      background: n.read ? "transparent" : "rgba(245,158,11,0.03)",
                      transition: "background 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = th.surfaceUp}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : "rgba(245,158,11,0.03)"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: n.read ? 500 : 600, color: n.read ? th.textPrimary : T.amber }}>
                        {n.title}
                      </span>
                      {!n.read && (
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber, marginTop: 5, flexShrink: 0 }} />
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: th.textSecondary, lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: 9.5, color: th.textMuted, marginTop: 2 }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: th.textMuted, fontSize: 13 }}>
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <button onClick={onToggleDark} style={{ background: th.surfaceUp, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: th.textSecondary, fontSize: 12, fontFamily: T.font, fontWeight: 500 }}>
          {dark ? <Sun size={13} /> : <Moon size={13} />}
          <span>{dark ? "Light" : "Dark"}</span>
        </button>
      </div>
    </header>
  );
}

// ── AppShell Main ─────────────────────────────────────────────────────────────
export default function AppShell() {
  const { dark, toggleDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { user: authUser, logout } = useAuthStore();
  const role = authUser?.role || "student";
  
  const location = useLocation();
  const navigate = useNavigate();
  const th = getTheme(dark);

  // Responsive detection
  // Responsive detection
  useEffect(() => {
    let timeoutId;
    
    const check = () => {
      clearTimeout(timeoutId);
      // Debounce: Only update state 150ms AFTER the user stops resizing
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };

    // Initial check without delay
    setIsMobile(window.innerWidth < 768); 
    
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("resize", check);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  // Find the label for the current route
  const currentNavItems = NAV[role]?.flatMap(group => group.items) || [];
  const currentLabel = currentNavItems.find(item => item.path === location.pathname)?.label || "Dashboard";

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${th.borderUp}; border-radius: 6px; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", fontFamily: T.font, background: th.page, overflow: "hidden", transition: "background 0.25s" }}>

        {isMobile && mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 190 }} />}

        {(!isMobile || mobileOpen) && (
          <div style={isMobile ? { animation: "slideIn 0.22s ease" } : {}}>
            <Sidebar
              role={role} currentPath={location.pathname} th={th}
              collapsed={isMobile ? false : collapsed}
              onNav={handleNav} onClose={() => setMobileOpen(false)}
              mobile={isMobile} authUser={authUser} logout={logout}
            />
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <Topbar
            currentLabel={currentLabel} dark={dark} th={th} collapsed={collapsed}
            onToggleSidebar={() => setCollapsed(c => !c)}
            onToggleDark={toggleDark} // <--- Change this to use the context function!
            onOpenMobile={() => setMobileOpen(true)}
            isMobileWidth={isMobile}
          />

          {/* This is the magic! This tells React Router to render the specific page component here */}
          <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "22px" }}>
            <Outlet context={{ dark }} /> 
          </main>
        </div>
      </div>
    </>
  );
}