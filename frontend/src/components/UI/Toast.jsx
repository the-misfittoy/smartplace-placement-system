/**
 * src/components/ui/Toast.jsx
 */
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { T } from "@/tokens";

const ToastCtx = createContext(null);


const STYLES = {
  success: { Icon:CheckCircle2,  color:T.success, bg:"rgba(34,197,94,0.12)",  bd:"rgba(34,197,94,0.30)"  },
  error:   { Icon:XCircle,       color:T.danger,  bg:"rgba(239,68,68,0.12)",  bd:"rgba(239,68,68,0.30)"  },
  info:    { Icon:Info,          color:T.info,    bg:"rgba(96,165,250,0.12)", bd:"rgba(96,165,250,0.30)" },
  warning: { Icon:AlertTriangle, color:T.amber,   bg:"rgba(245,158,11,0.12)", bd:"rgba(245,158,11,0.30)" },
};

function ToastItem({ item, onDismiss }) {
  const cfg = STYLES[item.type] || STYLES.info;
  const { Icon } = cfg;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(item.id), item.duration ?? 3500);
    return () => clearTimeout(t);
  }, [item.id, item.duration, onDismiss]);

  return (
    <div style={{
      display:"flex", alignItems:"flex-start", gap:10,
      padding:"12px 14px", borderRadius:12, minWidth:280, maxWidth:360,
      background:cfg.bg, border:`1px solid ${cfg.bd}`,
      boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
      fontFamily:T.font,
      animation:"toastIn 0.2s ease",
    }}>
      <Icon size={16} color={cfg.color} style={{ flexShrink:0, marginTop:1 }}/>
      <span style={{ flex:1, fontSize:13.5, color:"#F5F5F4", lineHeight:1.55 }}>{item.message}</span>
      <button onClick={() => onDismiss(item.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#A8A29E", padding:2, display:"flex" }}>
        <X size={14}/>
      </button>
    </div>
  );
}

// DELETE THIS LINE at the top of the file:
// let _uid = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  
  const push = useCallback((message, type = "info", duration) => {
    // FIX: Collision-proof native UUIDs
    const id = crypto.randomUUID(); 
    setToasts(p => [...p, { id, message, type, duration }]);
    return id;
  }, []);
  
  // ... rest of component

  const toast = {
    success: (m, d) => push(m, "success", d),
    error:   (m, d) => push(m, "error",   d),
    info:    (m, d) => push(m, "info",    d),
    warning: (m, d) => push(m, "warning", d),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end", pointerEvents:"none" }}>
        <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
        {toasts.map(t => <div key={t.id} style={{ pointerEvents:"auto" }}><ToastItem item={t} onDismiss={dismiss}/></div>)}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}