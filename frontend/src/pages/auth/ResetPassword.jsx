/**
 * src/pages/ResetPassword.jsx
 */
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { resetPassword } from "@/API/api"; 
import { useTheme } from "@/context/ThemeContext";
import { T, getTheme } from "@/tokens";

export default function ResetPassword() {
  const { dark } = useTheme();
  const th = getTheme(dark);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "", loading: false });

  // 1. Memory Leak Fix: Clean up the timeout if component unmounts
  useEffect(() => {
    let timer;
    if (status.type === "success") {
      timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [status.type, navigate]);

  // Guard clause for missing token
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: th.page, fontFamily: T.font }}>
        <div style={{ textAlign: "center", color: th.textSecondary }}>
          <XCircle size={40} color={T.danger} style={{ marginBottom: 16 }} />
          <h2 style={{ fontFamily: T.fontSerif, color: th.textPrimary }}>Invalid Reset Link</h2>
          <p>Please request a new password reset link.</p>
          <Link to="/forgot-password" style={{ color: T.amber, textDecoration: "none", fontWeight: 600 }}>Go back</Link>
        </div>
      </div>
    );
  }

  // 2. UX Upgrade: Strict Password Validation Rules
  const getValidationErrors = (pw) => {
    const errors = [];
    if (pw.length > 0 && pw.length < 8) errors.push("At least 8 characters");
    if (pw.length > 0 && !/[A-Z]/.test(pw)) errors.push("One uppercase letter");
    if (pw.length > 0 && !/[a-z]/.test(pw)) errors.push("One lowercase letter");
    if (pw.length > 0 && !/[0-9]/.test(pw)) errors.push("One number");
    return errors;
  };
  const pwErrors = getValidationErrors(form.password);
  const isMatch = form.password && form.confirm && form.password === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pwErrors.length > 0) return;
    if (!isMatch) {
      setStatus({ type: "error", message: "Passwords do not match.", loading: false });
      return;
    }

    setStatus({ type: "", message: "", loading: true });
    try {
      await resetPassword(token, form.password);
      setStatus({ type: "success", message: "Password reset successfully! Redirecting...", loading: false });
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.detail || "Link expired or network error.", 
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
          <h2 style={{ fontFamily: T.fontSerif, fontSize: 28, color: th.textPrimary, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Create New Password</h2>
          <p style={{ fontSize: 14, color: th.textSecondary, margin: 0 }}>Please enter your new strong password below.</p>
        </div>

        {status.message && (
          <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 24, fontSize: 14, fontWeight: 500, background: status.type === "success" ? T.successDim : T.dangerDim, border: `1px solid ${status.type === "success" ? T.successBorder : T.dangerBorder}`, color: status.type === "success" ? T.success : T.danger, display: "flex", alignItems: "center", gap: 8 }}>
            {status.type === "success" && <CheckCircle2 size={18} />}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* New Password Input */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: th.textSecondary, marginBottom: 8 }}>New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"} required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ ...inputStyle, paddingRight: 48, borderColor: pwErrors.length > 0 ? T.danger : th.borderUp }}
                onFocus={e => e.target.style.borderColor = pwErrors.length > 0 ? T.danger : T.amber}
                onBlur={e => e.target.style.borderColor = pwErrors.length > 0 ? T.danger : th.borderUp}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: th.textMuted, cursor: "pointer", display: "flex", padding: 4 }}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Real-time UX Feedback */}
            {pwErrors.length > 0 && (
              <ul style={{ margin: "8px 0 0 0", paddingLeft: 16, fontSize: 12, color: T.danger }}>
                {pwErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: th.textSecondary, marginBottom: 8 }}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"} required
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                style={{ ...inputStyle, paddingRight: 48, borderColor: form.confirm && !isMatch ? T.danger : th.borderUp }}
                onFocus={e => e.target.style.borderColor = form.confirm && !isMatch ? T.danger : T.amber}
                onBlur={e => e.target.style.borderColor = form.confirm && !isMatch ? T.danger : th.borderUp}
              />
            </div>
            {form.confirm && !isMatch && (
              <div style={{ fontSize: 12, color: T.danger, marginTop: 8 }}>Passwords must match.</div>
            )}
          </div>

          <button type="submit" disabled={status.loading || status.type === "success" || pwErrors.length > 0 || !isMatch} style={{ padding: "14px", background: status.loading || status.type === "success" || pwErrors.length > 0 || !isMatch ? th.surfaceUp : T.amber, color: status.loading || status.type === "success" || pwErrors.length > 0 || !isMatch ? th.textMuted : "#1C1917", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: status.loading || status.type === "success" || pwErrors.length > 0 || !isMatch ? "not-allowed" : "pointer", fontFamily: T.font, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "background 0.2s" }}>
            {status.loading ? <><Loader2 size={18} className="animate-spin" /> Updating…</> : "Reset Password"}
          </button>
        </form>

      </div>
    </div>
  );
}