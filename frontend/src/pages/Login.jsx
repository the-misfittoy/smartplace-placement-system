/**
 * src/pages/Login.jsx
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login as apiLogin } from "@/API/api";
import useAuthStore from "@/store/authStore";
import { useTheme } from "@/context/ThemeContext";
import { T, getTheme } from "@/tokens";

export default function Login() {
  // 1. Use global theme context instead of local state
  const { dark, toggleDark } = useTheme();
  const th = getTheme(dark);
  
  // 2. Use React Router for SPA navigation
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

      // 3. Navigate cleanly without reloading the browser
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

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    background: th.inputBg, border: `1.5px solid ${th.borderUp}`,
    borderRadius: 12, fontSize: 15, color: th.textPrimary,
    outline: "none", transition: "border-color 0.2s",
    fontFamily: T.font, boxSizing: "border-box"
  };

  return (
    <>
      <style>{`
        body { margin:0; background:${th.page}; }
        .login-wrap { display:flex; min-height:100vh; font-family:${T.font}; }
        .login-left { flex:1.2; background:${th.sidebar}; border-right:1px solid ${th.border}; padding:60px; display:flex; flex-direction:column; justify-content:space-between; }
        .login-right { flex:1; display:flex; align-items:center; justify-content:center; padding:40px; background:${th.page}; }
        @media (max-width: 900px) { .login-left { display:none; } }
      `}</style>

      <div className="login-wrap">
        {/* LEFT PANEL */}
        <div className="login-left">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: T.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <polygon points="10,1.5 18.5,6.5 18.5,13.5 10,18.5 1.5,13.5 1.5,6.5" stroke="#1C1917" strokeWidth="1.7" fill="none" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="2.7" fill="#1C1917" />
                <line x1="10" y1="7.3" x2="10" y2="1.5" stroke="#1C1917" strokeWidth="1.2" />
              </svg>
            </div>
            <span style={{ fontFamily: T.fontSerif, fontSize: 24, color: th.textPrimary, letterSpacing: "-0.02em" }}>SmartPlace</span>
          </div>
          <div>
            <h1 style={{ fontFamily: T.fontSerif, fontSize: "clamp(32px,4vw,56px)", color: th.textPrimary, lineHeight: 1.05, margin: "0 0 24px", letterSpacing: "-0.02em" }}>
              The modern standard for <span style={{ color: T.amber }}>campus placements.</span>
            </h1>
            <p style={{ fontSize: 18, color: th.textSecondary, maxWidth: 480, lineHeight: 1.5, margin: 0 }}>
              Connect your academic potential with enterprise opportunities through our unified AI-driven platform.
            </p>
          </div>
          <div style={{ fontSize: 13, color: th.textMuted }}>© {new Date().getFullYear()} SmartPlace System.</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <div style={{ width: "100%", maxWidth: 380 }}>
            
            {/* Theme Toggle */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
              <button onClick={toggleDark} style={{ background: th.surfaceUp, border: `1px solid ${th.border}`, borderRadius: 20, padding: "6px 12px", color: th.textSecondary, fontSize: 12, cursor: "pointer", display: "flex", gap: 6, alignItems: "center", fontFamily: T.font }}>
                {dark ? "Light Mode" : "Dark Mode"}
              </button>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 32, color: th.textPrimary, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Welcome back</h2>
              <p style={{ fontSize: 15, color: th.textSecondary, margin: 0 }}>Please enter your credentials to continue.</p>
            </div>

            {status.error && (
              <div style={{ padding: "12px 16px", borderRadius: 10, background: T.dangerDim, border: `1px solid ${T.dangerBorder}`, color: T.danger, fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
                {status.error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: th.textSecondary, marginBottom: 8 }}>Username / Email</label>
                <input
                  type="text" autoCapitalize="none" autoCorrect="off"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = T.amber}
                  onBlur={e => e.target.style.borderColor = th.borderUp}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: th.textSecondary }}>Password</label>
                  <a href="/forgot-password" style={{ fontSize: 13, color: T.amber, textDecoration: "none", fontWeight: 500 }}>Forgot password?</a>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: 48 }}
                    onFocus={e => e.target.style.borderColor = T.amber}
                    onBlur={e => e.target.style.borderColor = th.borderUp}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: th.textMuted, cursor: "pointer", display: "flex", padding: 4 }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={status.loading} style={{ marginTop: 8, padding: "14px", background: status.loading ? th.surfaceUp : T.amber, color: status.loading ? th.textMuted : "#1C1917", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: status.loading ? "not-allowed" : "pointer", fontFamily: T.font, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "background 0.2s" }}>
                {status.loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : "Sign in →"}
              </button>
            </form>

            <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${th.border}` }}>
              <p style={{ fontSize: 12, color: th.textMuted, margin: "0 0 12px", textAlign: "center" }}>Access is determined by your assigned role</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                {[{ label: "Student", color: T.success }, { label: "TPO", color: T.amber }, { label: "HR", color: T.info }].map(({ label, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: th.textSecondary, fontWeight: 500 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}