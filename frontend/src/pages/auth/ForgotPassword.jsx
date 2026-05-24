/**
 * src/pages/ForgotPassword.jsx
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { requestPasswordReset } from "@/API/api"; 
import { useTheme } from "@/context/ThemeContext";
import { T, getTheme } from "@/tokens";

export default function ForgotPassword() {
  const { dark } = useTheme();
  const th = getTheme(dark);
  
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "", loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus({ type: "", message: "", loading: true });
    try {
      const res = await requestPasswordReset(email.trim());
      // Generic success prevents email enumeration attacks
      setStatus({ type: "success", message: res?.message || "If an account exists, a reset link has been sent.", loading: false });
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.detail || "Network error. Please try again later.", 
        loading: false 
      });
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: th.page, fontFamily: T.font, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: T.amberDim, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Mail size={24} color={T.amber} />
          </div>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: 28, color: th.textPrimary, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Reset Password</h2>
          <p style={{ fontSize: 14, color: th.textSecondary, margin: 0 }}>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {status.message && (
          <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 24, fontSize: 14, fontWeight: 500, background: status.type === "success" ? T.successDim : T.dangerDim, border: `1px solid ${status.type === "success" ? T.successBorder : T.dangerBorder}`, color: status.type === "success" ? T.success : T.danger }}>
            {status.message}
          </div>
        )}

        {!status.type || status.type === "error" ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: th.textSecondary, marginBottom: 8 }}>Email Address</label>
              <input
                type="email" required autoCapitalize="none"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = T.amber}
                onBlur={e => e.target.style.borderColor = th.borderUp}
              />
            </div>

            <button type="submit" disabled={status.loading || !email.trim()} style={{ padding: "14px", background: status.loading || !email.trim() ? th.surfaceUp : T.amber, color: status.loading || !email.trim() ? th.textMuted : "#1C1917", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: status.loading || !email.trim() ? "not-allowed" : "pointer", fontFamily: T.font, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "background 0.2s" }}>
              {status.loading ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : "Send Reset Link"}
            </button>
          </form>
        ) : null}

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: th.textSecondary, textDecoration: "none", fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}