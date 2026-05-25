/**
 * src/pages/Login.jsx
 * Unified premium login page blending gorgeous visuals and robust security standards.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, GraduationCap, ArrowRight } from "lucide-react";
import { login as apiLogin } from "@/API/api";
import useAuthStore from "@/store/authStore";
import { useTheme } from "@/context/ThemeContext";
import { T, getTheme } from "@/tokens";

export default function Login() {
  const { dark, toggleDark } = useTheme();
  const th = getTheme(dark);
  const navigate = useNavigate();
  
  const { login } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = form;
    if (!username.trim() || !password.trim()) {
      setStatus({ loading: false, error: "Please enter both username and password." });
      return;
    }

    setStatus({ loading: true, error: "" });
    try {
      const res = await apiLogin(username.trim(), password.trim());
      login(res.user, res.access_token);

      const home =
        res.user.role === "tpo"     ? "/tpo/dashboard" :
        res.user.role === "company" ? "/hr/dashboard"  :
                                      "/student/dashboard";
      
      navigate(home, { replace: true });

    } catch (err) {
      let msg = "Cannot connect to server. Please try again later.";
      if (err.response?.status === 401) msg = "Invalid username or password.";
      else if (err.response?.data?.detail) msg = err.response.data.detail;
      setStatus({ loading: false, error: msg });
    }
  };

  return (
    <>
      <style>{`
        body { margin: 0; background: ${th.page}; overflow-x: hidden; }
        
        .login-wrap {
          display: flex;
          min-height: 100vh;
          font-family: ${T.font};
          background: ${th.page};
        }

        .login-left {
          flex: 1.2;
          background: linear-gradient(135deg, ${th.sidebar} 0%, ${th.page} 100%);
          border-right: 1px solid ${th.border};
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: -20%;
          right: -20%;
          width: 50%;
          height: 50%;
          background: radial-gradient(circle, ${T.amberDim} 0%, transparent 70%);
          pointer-events: none;
        }

        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: ${th.page};
        }

        .fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14.5px;
          color: ${th.textSecondary};
          padding: 6px 0;
          transition: transform 0.2s ease;
        }

        .feature-item:hover {
          transform: translateX(4px);
          color: ${th.textPrimary};
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .login-left { display: none; }
        }
      `}</style>

      <div className="login-wrap">
        {/* LEFT BRANDING PANEL */}
        <div className="login-left fade-in">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: T.amber,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${T.amberDim}`
            }}>
              <GraduationCap size={22} color="#1C1917" />
            </div>
            <span style={{
              fontFamily: T.fontSerif,
              fontSize: 26,
              color: th.textPrimary,
              letterSpacing: "-0.02em",
              fontWeight: 700
            }}>
              SmartPlace
            </span>
          </div>

          {/* Main Info */}
          <div className="slide-up" style={{ margin: "40px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>🎓</div>
            <h1 style={{
              fontFamily: T.fontSerif,
              fontSize: "clamp(32px, 3.5vw, 48px)",
              color: th.textPrimary,
              lineHeight: 1.15,
              margin: "0 0 20px",
              letterSpacing: "-0.02em"
            }}>
              Smart Placement<br />
              <span style={{ color: T.amber }}>Management System</span>
            </h1>
            <p style={{
              fontSize: 15.5,
              color: th.textSecondary,
              maxWidth: 460,
              lineHeight: 1.6,
              marginBottom: 32
            }}>
              AI-powered placement guidance for modern campuses. Manage placement drives, track candidate applications, and unlock intelligent student placement insights.
            </p>

            {/* Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Placement strategy recommendations",
                "What-If CGPA simulator",
                "Rejection pattern analysis",
                "Dream company tracker",
                "AI assistant chatbot & Mock Sandbox",
              ].map(f => (
                <div key={f} className="feature-item">
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: T.amber,
                    boxShadow: `0 0 8px ${T.amber}`
                  }} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ fontSize: 13, color: th.textMuted }}>
            © {new Date().getFullYear()} SmartPlace System. Crafted with precision.
          </div>
        </div>

        {/* RIGHT LOGIN PANEL */}
        <div className="login-right">
          <div className="fade-in" style={{ width: "100%", maxWidth: 390 }}>
            
            {/* Theme Toggle */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
              <button
                onClick={toggleDark}
                style={{
                  background: th.surfaceUp,
                  border: `1px solid ${th.border}`,
                  borderRadius: 20,
                  padding: "6px 14px",
                  color: th.textSecondary,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  fontFamily: T.font,
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.amber}
                onMouseLeave={e => e.currentTarget.style.borderColor = th.border}
              >
                {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>

            {/* Form Headers */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: T.fontSerif,
                fontSize: 32,
                color: th.textPrimary,
                margin: "0 0 8px",
                letterSpacing: "-0.02em"
              }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 15, color: th.textSecondary, margin: 0 }}>
                Sign in to your placement portal
              </p>
            </div>

            {/* Error Message */}
            {status.error && (
              <div className="slide-up" style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: T.dangerDim,
                border: `1px solid ${T.dangerBorder}`,
                color: T.danger,
                fontSize: 14,
                marginBottom: 24,
                fontWeight: 500
              }}>
                {status.error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: th.textSecondary, marginBottom: 8 }}>
                  Username
                </label>
                <input
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: th.inputBg,
                    border: `1.5px solid ${th.borderUp}`,
                    borderRadius: 12,
                    fontSize: 15,
                    color: th.textPrimary,
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: T.font,
                    boxSizing: "border-box"
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = T.amber;
                    e.target.style.boxShadow = `0 0 0 3px ${T.amberRing}`;
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = th.borderUp;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 600, color: th.textSecondary }}>
                    Password
                  </label>
                  <a href="/forgot-password" style={{
                    fontSize: 13,
                    color: T.amber,
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.2s"
                  }}>
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: th.inputBg,
                      border: `1.5px solid ${th.borderUp}`,
                      borderRadius: 12,
                      fontSize: 15,
                      color: th.textPrimary,
                      outline: "none",
                      transition: "all 0.2s ease",
                      fontFamily: T.font,
                      boxSizing: "border-box",
                      paddingRight: 48
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = T.amber;
                      e.target.style.boxShadow = `0 0 0 3px ${T.amberRing}`;
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = th.borderUp;
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: th.textMuted,
                      cursor: "pointer",
                      display: "flex",
                      padding: 6,
                      borderRadius: "50%",
                      transition: "color 0.2s"
                    }}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={status.loading}
                style={{
                  marginTop: 8,
                  padding: "14px",
                  background: status.loading ? th.surfaceUp : T.amber,
                  color: status.loading ? th.textMuted : "#1C1917",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: status.loading ? "not-allowed" : "pointer",
                  fontFamily: T.font,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.25s ease",
                  boxShadow: status.loading ? "none" : `0 4px 12px ${T.amberDim}`
                }}
                onMouseEnter={e => {
                  if (!status.loading) {
                    e.currentTarget.style.background = T.amberHover;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={e => {
                  if (!status.loading) {
                    e.currentTarget.style.background = T.amber;
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {status.loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Signing in…</>
                ) : (
                  <><GraduationCap size={18} /> Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Active Demo Credentials Card */}
            <div className="slide-up" style={{ 
              marginTop: 32, 
              padding: 16, 
              background: th.surfaceUp, 
              border: `1px dashed ${th.border}`, 
              borderRadius: 12, 
              fontSize: 12.5, 
              color: th.textSecondary,
              lineHeight: 1.6
            }}>
              <strong style={{ color: th.textPrimary, display: "block", marginBottom: 8 }}>
                🔑 Live Database Demo Credentials:
              </strong>
              <div style={{ display: "grid", gridTemplateColumns: "85px 1fr", gap: "6px 8px" }}>
                <span style={{ color: th.textMuted, fontWeight: 500 }}>TPO Admin:</span>
                <code>tpoadmin <span style={{ color: th.textMuted }}>/</span> admin123</code>
                
                <span style={{ color: th.textMuted, fontWeight: 500 }}>Student:</span>
                <code>student1 <span style={{ color: th.textMuted }}>/</span> password123</code>
                
                <span style={{ color: th.textMuted, fontWeight: 500 }}>Company HR:</span>
                <code>google <span style={{ color: th.textMuted }}>/</span> company123</code>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}