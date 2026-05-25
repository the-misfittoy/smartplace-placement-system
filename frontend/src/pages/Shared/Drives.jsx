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
    display: "block", fontSize: 13, fontWeight: 600, color: th.textSecondary, marginBottom: 8
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: th.inputBg, border: `1.5px solid ${th.borderUp}`,
    borderRadius: 10, fontSize: 14.5, color: th.textPrimary,
    outline: "none", transition: "all 0.18s ease",
    fontFamily: T.font, boxSizing: "border-box"
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0, 0, 0, 0.45)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 10000,
      fontFamily: T.font
    }}>
      <div className="fade-in" style={{
        width: "100%", maxWidth: 410,
        background: dark ? "rgba(45, 41, 38, 0.75)" : "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 16,
        padding: 28,
        boxShadow: dark 
          ? "0 24px 80px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.06)" 
          : "0 24px 80px rgba(28, 25, 23, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
        position: "relative"
      }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: T.amberDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={18} color={T.amber} />
            </div>
            <h3 style={{ fontFamily: T.fontSerif, fontSize: 20, color: th.textPrimary, margin: 0 }}>
              Add Placement Drive
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute", right: 20, top: 22,
              background: th.surfaceUp, border: `1px solid ${th.border}`,
              borderRadius: "50%", width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: th.textSecondary, cursor: "pointer", transition: "all 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.color = th.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = th.textSecondary}
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: 10,
            background: T.dangerDim, border: `1px solid ${T.dangerBorder}`,
            color: T.danger, fontSize: 13, marginBottom: 20, fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          
          <div>
            <label style={labelStyle}>Drive ID</label>
            <input
              type="number" required placeholder="Enter unique integer ID (e.g. 101)"
              value={form.drive_id}
              onChange={e => setForm({ ...form, drive_id: e.target.value })}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 3px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = th.borderUp; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Target Company</label>
            <select
              value={form.company_id}
              onChange={e => setForm({ ...form, company_id: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 3px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = th.borderUp; e.target.style.boxShadow = "none"; }}
            >
              {companies.map(c => (
                <option key={c.company_id} value={c.company_id} style={{ background: th.surface }}>
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
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 3px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = th.borderUp; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Drive Type</label>
            <select
              value={form.drive_type}
              onChange={e => setForm({ ...form, drive_type: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 3px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = th.borderUp; e.target.style.boxShadow = "none"; }}
            >
              <option value="On-Campus" style={{ background: th.surface }}>On-Campus</option>
              <option value="Off-Campus" style={{ background: th.surface }}>Off-Campus</option>
              <option value="Pool Campus" style={{ background: th.surface }}>Pool Campus</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{
              marginTop: 6, padding: "12px",
              background: createMutation.isPending ? th.surfaceUp : T.amber,
              color: createMutation.isPending ? th.textMuted : "#1C1917",
              border: "none", borderRadius: 10, fontSize: 14.5, fontWeight: 600,
              cursor: createMutation.isPending ? "not-allowed" : "pointer",
              fontFamily: T.font, display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => { if(!createMutation.isPending) e.currentTarget.style.background = "#D97706"; }}
            onMouseLeave={e => { if(!createMutation.isPending) e.currentTarget.style.background = T.amber; }}
          >
            {createMutation.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Adding Drive…</>
            ) : (
              <><Plus size={16} /> Add Drive</>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}