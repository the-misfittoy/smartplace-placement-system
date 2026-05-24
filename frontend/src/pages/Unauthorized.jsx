/**
 * src/pages/Unauthorized.jsx
 */
import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { useTheme } from "@/context/ThemeContext";
import { T, getTheme } from "@/tokens";
 
export default function Unauthorized() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const { dark } = useTheme();
  const th = getTheme(dark);
 
  const home =
    user?.role === "tpo"     ? "/tpo/dashboard" :
    user?.role === "company" ? "/hr/dashboard"  :
                               "/student/dashboard";
 
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
      background: th.page, fontFamily: T.font,
      padding: "40px 24px", textAlign: "center",
    }}>
      <div style={{ 
        width: 80, height: 80, borderRadius: "50%", 
        background: T.amberDim, display: "flex", 
        alignItems: "center", justifyContent: "center", marginBottom: 8 
      }}>
        <ShieldOff size={40} color={T.amber} strokeWidth={1.5} />
      </div>
      
      <div style={{
        fontFamily: T.fontSerif,
        fontSize: "clamp(28px, 4vw, 42px)", color: th.textPrimary,
        letterSpacing: "-0.02em", lineHeight: 1.1,
      }}>
        Access Restricted
      </div>
      
      <p style={{ fontSize: 15, color: th.textSecondary, maxWidth: 360, lineHeight: 1.6 }}>
        Your current role ({user?.role || "guest"}) does not have permission to view this page.
      </p>
      
      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate(home, { replace: true })}
          style={{
            padding: "12px 24px", borderRadius: 10,
            background: T.amber, border: "none",
            fontSize: 14, fontWeight: 600, color: "#1C1917",
            cursor: "pointer", fontFamily: T.font,
            transition: "opacity 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={e => e.currentTarget.style.opacity = 1}
        >
          Return to Dashboard
        </button>
        
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "12px 24px", borderRadius: 10,
            background: th.surfaceUp, border: `1px solid ${th.border}`,
            fontSize: 14, fontWeight: 600, color: th.textPrimary,
            cursor: "pointer", fontFamily: T.font,
            transition: "background 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = th.border}
          onMouseLeave={e => e.currentTarget.style.background = th.surfaceUp}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}