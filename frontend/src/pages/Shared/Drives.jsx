/**
 * src/pages/shared/Drives.jsx
 * 
 * Enhanced with:
 *  - "Already Placed" guard for placed students (blocks normal apply)
 *  - Dream Company drives are visually highlighted and allow placed students to apply
 *  - Star badge indicator on dream-eligible drives
 *  - High-fidelity glassmorphic "Add Placement Drive" modal for TPO role with strong blur effects
 */
import { useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { T, getTheme } from "@/tokens";
import {
  useDrives, useApplyForDrive, useApplications,
  useDreamEligibleDrives, useApplyDreamCompany,
  useCompanies, useCreateDrive,
} from "@/hooks/useQueries";
import useAuthStore from "@/store/authStore";
import { X, Calendar, Plus, Loader2 } from "lucide-react";

// ── Toast-style notification ───────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: "#292524", border: "1px solid rgba(245,158,11,0.35)",
      borderRadius: 12, padding: "14px 22px", color: "#F5F5F4",
      fontFamily: T.font, fontSize: 14, fontWeight: 500,
      boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", gap: 14, zIndex: 9999,
      maxWidth: 480,
    }}>
      <span style={{ fontSize: 20 }}>🎓</span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{
        background: "none", border: "none", color: "#78716C",
        cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0,
      }}>×</button>
    </div>
  );
}

export default function Drives({ dark = true, role = "student" }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();

  const [toast, setToast] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const { data: drives = [], isLoading } = useDrives();
  const { data: userApps = [] } = useApplications();
  const { data: companies = [] } = useCompanies();

  const applyMutation       = useApplyForDrive();
  const applyDreamMutation  = useApplyDreamCompany();

  // Only fetch dream eligible drives when student is placed/dream_placed
  const isPlaced = user?.placement_status === "Placed" ||
                   user?.placement_status === "Dream Placed" ||
                   ["Placed", "Dream Placed"].includes(user?.placement_status);

  // For placed students — fetch which drives they can apply to as dream
  const { data: dreamEligibleDrives = [] } = useDreamEligibleDrives(
    user?.student_id,
    role === "student" && isPlaced,
  );

  const dreamEligibleDriveIds = new Set(
    Array.isArray(dreamEligibleDrives)
      ? dreamEligibleDrives.map(d => d.drive_id)
      : []
  );

  const appliedDriveIds = new Set(
    Array.isArray(userApps) ? userApps.map(app => app.drive_id) : []
  );

  const getDriveStatus = (dateString) => {
    const driveDate = new Date(dateString);
    const today = new Date();
    if (driveDate > today) return "upcoming";
    if (driveDate.toDateString() === today.toDateString()) return "ongoing";
    return "completed";
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  };

  const handleApply = (driveId) => {
    applyMutation.mutate({ drive_id: driveId });
  };

  const handleApplyDream = (driveId) => {
    applyDreamMutation.mutate({ drive_id: driveId });
  };

  const cols = [
    {
      key: "company_name", label: "Company", sortable: true,
      render: (v, r) => {
        const isDream = dreamEligibleDriveIds.has(r.drive_id);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 500, color: th.textPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                {v}
                {isDream && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                    padding: "2px 7px", borderRadius: 20,
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.35)",
                    color: "#A78BFA",
                  }}>
                    ★ DREAM
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: th.textMuted }}>{r.role}</div>
            </div>
          </div>
        );
      },
    },
    { key: "drive_date", label: "Date", sortable: true, render: v => new Date(v).toLocaleDateString() },
    {
      key: "drive_type", label: "Type", sortable: true,
      render: v => (
        <span style={{ fontSize: 11.5, padding: "2px 7px", borderRadius: 20, background: T.infoDim, color: T.info }}>
          {v}
        </span>
      ),
    },
    { key: "package", label: "Package", sortable: true, render: v => <strong style={{ color: T.amber }}>₹{v}L</strong> },
    { key: "status", label: "Status", sortable: true, render: (_, r) => <StatusBadge status={getDriveStatus(r.drive_date)} /> },
    ...(role !== "student" ? [
      { key: "total_applied", label: "Applied", sortable: true },
      {
        key: "total_placed", label: "Placed", sortable: true,
        render: v => (
          <span style={{ color: v > 0 ? T.success : th.textMuted, fontWeight: v > 0 ? 600 : 400 }}>{v}</span>
        ),
      },
    ] : []),
  ];

  if (isLoading) return (
    <div style={{ color: th.textPrimary, fontFamily: T.font, padding: 32 }}>
      Loading placement drives...
    </div>
  );

  return (
    <>
      <Toast msg={toast} onClose={() => setToast("")} />
      
      <DataTable
        title={role === "student" ? "Placement Drives" : "Manage Drives"}
        columns={cols}
        data={drives}
        searchKeys={["company_name", "role", "drive_type"]}
        onAdd={role === "tpo" ? () => setShowAdd(true) : null}
        addLabel="Add Drive"
        actions={role === "student" ? [
          {
            label: "Apply →",
            bg: T.amber, color: "#1C1917",
            show: r => {
              const driveStatus = getDriveStatus(r.drive_date);
              return driveStatus === "upcoming" && !appliedDriveIds.has(r.drive_id) && !isPlaced;
            },
            onClick: r => handleApply(r.drive_id),
          },
          {
            label: "★ Apply Dream →",
            bg: "rgba(139,92,246,0.15)", color: "#A78BFA",
            show: r => {
              const driveStatus = getDriveStatus(r.drive_date);
              return driveStatus === "upcoming" && !appliedDriveIds.has(r.drive_id)
                && isPlaced && dreamEligibleDriveIds.has(r.drive_id);
            },
            onClick: r => handleApplyDream(r.drive_id),
          },
          {
            label: "Already Placed",
            bg: "rgba(34,197,94,0.07)", color: T.success,
            show: r => {
              const driveStatus = getDriveStatus(r.drive_date);
              return driveStatus === "upcoming" && !appliedDriveIds.has(r.drive_id)
                && isPlaced && !dreamEligibleDriveIds.has(r.drive_id);
            },
            onClick: r => showToast(
              `You're already placed! 🎉 To apply to ${r.company_name}, go to Dream Company portal for tier-up opportunities.`
            ),
          },
          {
            label: "✓ Applied",
            bg: T.successDim, color: T.success,
            show: r => appliedDriveIds.has(r.drive_id),
            onClick: () => {},
          },
        ] : []}
        dark={dark}
        pageSize={8}
      />

      {showAdd && (
        <AddDriveModal
          companies={companies}
          dark={dark}
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            showToast("Placement drive created successfully! Announcements dispatched to unplaced eligible students.");
            setShowAdd(false);
          }}
        />
      )}
    </>
  );
}

// ── High-Fidelity Glassmorphic Add Drive Modal ───────────────────────────────────
function AddDriveModal({ companies, dark, onClose, onAdded }) {
  const th = getTheme(dark);
  const createMutation = useCreateDrive();

  const [form, setForm] = useState({
    drive_id: "",
    drive_date: "",
    drive_type: "On-Campus",
    company_id: companies[0]?.company_id || "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.drive_id || !form.drive_date || !form.company_id || !form.drive_type) {
      setError("Please fill in all fields.");
      return;
    }

    createMutation.mutate({
      drive_id: parseInt(form.drive_id),
      company_id: parseInt(form.company_id),
      drive_date: form.drive_date,
      drive_type: form.drive_type,
    }, {
      onSuccess: () => {
        onAdded();
      },
      onError: (err) => {
        const msg = err.response?.data?.detail || "Failed to create drive. Make sure the Drive ID is unique.";
        setError(msg);
      }
    });
  };

  const labelStyle = {
    display: "block", fontSize: 13, fontWeight: 600, color: th.textSecondary, marginBottom: 8,
    letterSpacing: "0.02em"
  };

  const inputStyle = {
    width: "100%", padding: "12px 15px",
    background: dark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
    border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: 12, fontSize: 14.5, color: th.textPrimary,
    outline: "none", transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    fontFamily: T.font, boxSizing: "border-box"
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0, 0, 0, 0.55)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 10000,
      fontFamily: T.font
    }}>
      <style>{`
        @keyframes modalEntrance {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-card {
          animation: modalEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className="modal-card" style={{
        width: "100%", maxWidth: 410,
        background: dark 
          ? "linear-gradient(135deg, rgba(20, 18, 17, 0.85) 0%, rgba(32, 28, 26, 0.78) 100%)" 
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(245, 243, 240, 0.82) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: dark ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(245, 158, 11, 0.35)",
        borderRadius: 20,
        padding: "32px 28px",
        boxShadow: dark 
          ? "0 35px 100px rgba(0, 0, 0, 0.85), 0 0 50px rgba(245, 158, 11, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08)" 
          : "0 35px 100px rgba(28, 25, 23, 0.12), 0 0 50px rgba(245, 158, 11, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
        position: "relative"
      }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: T.amberDim,
              border: `1px solid ${T.amberBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 12px ${T.amberDim}`
            }}>
              <Calendar size={18} color={T.amber} />
            </div>
            <h3 style={{ fontFamily: T.fontSerif, fontSize: 22, color: th.textPrimary, margin: 0, letterSpacing: "-0.01em" }}>
              Add Placement Drive
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute", right: 22, top: 24,
              background: th.surfaceUp, border: `1px solid ${th.border}`,
              borderRadius: "50%", width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: th.textSecondary, cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.color = th.textPrimary; e.currentTarget.style.transform = "rotate(90deg)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = th.textSecondary; e.currentTarget.style.transform = "rotate(0deg)"; }}
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: "11px 15px", borderRadius: 10,
            background: T.dangerDim, border: `1px solid ${T.dangerBorder}`,
            color: T.danger, fontSize: 13, marginBottom: 22, fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div>
            <label style={labelStyle}>Drive ID</label>
            <input
              type="number" required placeholder="Enter unique integer ID (e.g. 101)"
              value={form.drive_id}
              onChange={e => setForm({ ...form, drive_id: e.target.value })}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Target Company</label>
            <select
              value={form.company_id}
              onChange={e => setForm({ ...form, company_id: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
            >
              {companies.map(c => (
                <option key={c.company_id} value={c.company_id} style={{ background: dark ? "#1C1917" : "#FFFFFF", color: th.textPrimary }}>
                  {c.company_name} ({c.role} — ₹{c.package}L)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Drive Date</label>
            <input
              type="date" required
              value={form.drive_date}
              onChange={e => setForm({ ...form, drive_date: e.target.value })}
              style={{ ...inputStyle, cursor: "text" }}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Drive Type</label>
            <select
              value={form.drive_type}
              onChange={e => setForm({ ...form, drive_type: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
            >
              <option value="On-Campus" style={{ background: dark ? "#1C1917" : "#FFFFFF", color: th.textPrimary }}>On-Campus</option>
              <option value="Off-Campus" style={{ background: dark ? "#1C1917" : "#FFFFFF", color: th.textPrimary }}>Off-Campus</option>
              <option value="Pool Campus" style={{ background: dark ? "#1C1917" : "#FFFFFF", color: th.textPrimary }}>Pool Campus</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{
              marginTop: 8, padding: "14px",
              background: createMutation.isPending 
                ? th.surfaceUp 
                : `linear-gradient(135deg, ${T.amber} 0%, ${T.amberHover} 100%)`,
              color: createMutation.isPending ? th.textMuted : "#1C1917",
              border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
              cursor: createMutation.isPending ? "not-allowed" : "pointer",
              fontFamily: T.font, display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: createMutation.isPending ? "none" : `0 4px 15px ${T.amberDim}`
            }}
            onMouseEnter={e => { 
              if(!createMutation.isPending) {
                e.currentTarget.style.transform = "translateY(-1.5px)";
                e.currentTarget.style.boxShadow = `0 6px 20px rgba(245, 158, 11, 0.25)`;
              } 
            }}
            onMouseLeave={e => { 
              if(!createMutation.isPending) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 15px ${T.amberDim}`;
              } 
            }}
          >
            {createMutation.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Adding Drive…</>
            ) : (
              <><Plus size={16} /> Add Placement Drive</>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}