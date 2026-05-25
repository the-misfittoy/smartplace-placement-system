/**
 * src/pages/Shared/Rounds.jsx
 * 
 * High-fidelity Recruitment Rounds page with:
 *  - Responsive grid of glassmorphic drive cards
 *  - Premium vertical stepper with amber glowing node progression
 *  - Frosted glass backdrop overlay modal for adding rounds
 *  - Auto-sourcing database checks for next available IDs and Sequences
 *  - Unified role-based access checks (TPO has full CRUD, Students & HR have Read-Only views)
 */

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, X, Layers, Calendar, ChevronRight, HelpCircle, Loader2 } from "lucide-react";
import { T, getTheme } from "@/tokens";
import { useRounds, useCreateRound, useDrives, useCompanies } from "@/hooks/useQueries";
import useAuthStore from "@/store/authStore";

// ── Toast-style Notification ───────────────────────────────────────────────────
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

export default function RoundsPage() {
  const { dark = true } = useOutletContext() || {};
  const th = getTheme(dark);
  const { user } = useAuthStore();
  const role = user?.role || "student";

  const [toast, setToast] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Queries
  const { data: rounds = [], isLoading: roundsLoading, error: roundsErr } = useRounds();
  const { data: drives = [], isLoading: drivesLoading } = useDrives();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();

  const isLoading = roundsLoading || drivesLoading || companiesLoading;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  };

  const getCompanyForDrive = (driveId) => {
    const d = drives.find(d => d.drive_id === driveId);
    if (!d) return null;
    return companies.find(c => c.company_id === d.company_id);
  };

  const getDriveName = (driveId) => {
    const comp = getCompanyForDrive(driveId);
    return comp ? comp.company_name : `Drive #${driveId}`;
  };

  const getDriveRoleName = (driveId) => {
    const comp = getCompanyForDrive(driveId);
    return comp ? comp.role : "";
  };

  // Group and sort rounds by drive
  const grouped = rounds.reduce((acc, r) => {
    const key = r.drive_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  Object.values(grouped).forEach(g => {
    g.sort((a, b) => a.sequence_number - b.sequence_number);
  });

  const cardStyle = {
    background: dark 
      ? "linear-gradient(135deg, rgba(36, 32, 32, 0.7) 0%, rgba(28, 25, 23, 0.65) 100%)"
      : "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(245, 243, 240, 0.75) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: dark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.08)",
    borderRadius: 20,
    padding: "26px",
    boxShadow: dark 
      ? "0 12px 35px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)" 
      : "0 12px 35px rgba(28, 25, 23, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
  };

  if (isLoading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "60vh", color: th.textSecondary, fontFamily: T.font, gap: 12
      }}>
        <Loader2 size={36} className="animate-spin" style={{ color: T.amber }} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>Retrieving recruitment steppers...</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-fade {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .stepper-circle-glow {
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.35);
        }
        .drive-card:hover {
          transform: translateY(-2px);
          border-color: ${dark ? "rgba(245, 158, 11, 0.15) !important" : "rgba(245, 158, 11, 0.25) !important"};
          box-shadow: ${dark 
            ? "0 18px 45px rgba(0, 0, 0, 0.4), 0 0 30px rgba(245, 158, 11, 0.04)" 
            : "0 18px 45px rgba(28, 25, 23, 0.08), 0 0 30px rgba(245, 158, 11, 0.04)"} !important;
        }
      `}</style>
      
      <Toast msg={toast} onClose={() => setToast("")} />

      <div className="page-fade" style={{ fontFamily: T.font, display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Header Section */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, borderBottom: `1px solid ${th.border}`, paddingBottom: 20
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: T.amberDim, border: `1.5px solid ${T.amberBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Layers size={20} color={T.amber} />
              </div>
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 28, color: th.textPrimary, margin: 0, letterSpacing: "-0.01em" }}>
                Recruitment Rounds
              </h2>
            </div>
            <p style={{ margin: "6px 0 0 48px", fontSize: 13.5, color: th.textSecondary }}>
              Review the structured screening funnels. {rounds.length} total rounds active across {Object.keys(grouped).length} drives.
            </p>
          </div>

          {role === "tpo" && (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: "10px 20px",
                background: `linear-gradient(135deg, ${T.amber} 0%, ${T.amberHover} 100%)`,
                color: "#1C1917", border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: `0 4px 15px ${T.amberDim}`,
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 18px rgba(245, 158, 11, 0.25)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 15px ${T.amberDim}`; }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Round
            </button>
          )}
        </div>

        {roundsErr && (
          <div style={{
            padding: "14px 18px", borderRadius: 12,
            background: T.dangerDim, border: `1px solid ${T.dangerBorder}`,
            color: T.danger, fontSize: 14, fontWeight: 500
          }}>
            ⚠️ Failed to retrieve rounds data: {roundsErr.message}
          </div>
        )}

        {Object.keys(grouped).length === 0 ? (
          <div style={{
            ...cardStyle, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "80px 40px", gap: 14, textAlign: "center"
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)"
            }}>
              <Layers size={24} color={th.textMuted} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: th.textPrimary }}>No Rounds Defined Yet</h4>
              <p style={{ margin: "5px 0 0", fontSize: 13, color: th.textSecondary, maxWidth: 360 }}>
                Recruitment steppers will populate here once placement rounds are scheduled by TPO administration.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: 20
          }}>
            {Object.entries(grouped).map(([driveId, driveRounds]) => {
              const dId = parseInt(driveId);
              const companyName = getDriveName(dId);
              const roleName = getDriveRoleName(dId);
              
              return (
                <div key={driveId} className="drive-card" style={cardStyle}>
                  {/* Card Header */}
                  <div style={{ borderBottom: `1px solid ${th.border}`, paddingBottom: 16, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 18, fontFamily: T.fontSerif, color: th.textPrimary }}>
                          {companyName}
                        </h4>
                        {roleName && (
                          <div style={{ fontSize: 12.5, color: th.textSecondary, marginTop: 3 }}>
                            {roleName}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: T.amberDim, border: `1px solid ${T.amberBorder}`, color: T.amber
                      }}>
                        Drive #{driveId}
                      </span>
                    </div>
                  </div>

                  {/* Vertical Stepper */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {driveRounds.map((r, idx) => {
                      const isLast = idx === driveRounds.length - 1;
                      return (
                        <div key={r.round_id} style={{ display: "flex", gap: 16, minHeight: isLast ? "auto" : 64 }}>
                          {/* Left Line & Node */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div 
                              className="stepper-circle-glow"
                              style={{
                                width: 26, height: 26, borderRadius: "50%",
                                background: `linear-gradient(135deg, ${T.amber} 0%, ${T.amberHover} 100%)`,
                                color: "#1C1917", fontSize: 11.5, fontWeight: 800,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0
                              }}
                            >
                              {r.sequence_number}
                            </div>
                            {!isLast && (
                              <div style={{
                                flex: 1, width: 2,
                                background: `linear-gradient(to bottom, ${T.amber} 0%, ${th.border} 100%)`,
                                margin: "4px 0"
                              }} />
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ paddingBottom: isLast ? 0 : 20, paddingTop: 3 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: th.textPrimary }}>
                              {r.round_name}
                            </div>
                            <div style={{ fontSize: 11, color: th.textSecondary, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                              <span>ID #{r.round_id}</span>
                              <span style={{ color: th.textMuted }}>•</span>
                              <span>Step {r.sequence_number} of {driveRounds.length}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <AddRoundModal
          drives={drives}
          companies={companies}
          rounds={rounds}
          grouped={grouped}
          dark={dark}
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            showToast("Recruitment round registered and synchronized successfully!");
            setShowAdd(false);
          }}
        />
      )}
    </>
  );
}

// ── Frosted Glass Add Round Modal Component ─────────────────────────────────────
function AddRoundModal({ drives, companies, rounds, grouped, dark, onClose, onAdded }) {
  const th = getTheme(dark);
  const createMutation = useCreateRound();

  const [form, setForm] = useState({
    round_id: "",
    round_name: "Aptitude Test",
    sequence_number: "1",
    drive_id: drives[0]?.drive_id ? String(drives[0].drive_id) : "",
  });
  const [error, setError] = useState("");

  // Helper to resolve company name for dropdown labels
  const getDriveLabel = (d) => {
    const c = companies.find(c => c.company_id === d.company_id);
    return `${c?.company_name || "Company"} (${c?.role || "Drive"}) — Drive #${d.drive_id}`;
  };

  // Perform smart auto-computations when drive selection is adjusted
  useEffect(() => {
    if (!form.drive_id) return;
    const driveIdNum = parseInt(form.drive_id);
    
    // 1. Calculate next sequence number for this specific drive
    const existingRoundsForDrive = grouped[driveIdNum] || [];
    const nextSeq = existingRoundsForDrive.length + 1;

    // 2. Propose next globally unique round_id to prevent primary key clash
    const maxRoundId = rounds.length > 0 ? Math.max(...rounds.map(r => r.round_id)) : 0;
    const nextRoundId = maxRoundId + 1;

    setForm(prev => ({
      ...prev,
      sequence_number: String(nextSeq),
      round_id: String(nextRoundId)
    }));
  }, [form.drive_id, rounds, grouped]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.round_id || !form.round_name || !form.sequence_number || !form.drive_id) {
      setError("Please complete all required fields.");
      return;
    }

    createMutation.mutate({
      round_id: parseInt(form.round_id),
      round_name: form.round_name,
      sequence_number: parseInt(form.sequence_number),
      drive_id: parseInt(form.drive_id)
    }, {
      onSuccess: () => {
        onAdded();
      },
      onError: (err) => {
        const msg = err.response?.data?.detail || "Failed to add round. Ensure the Round ID is globally unique.";
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

  const roundNameOptions = [
    "Aptitude Test",
    "Coding Test",
    "Online Assessment",
    "Group Discussion",
    "Technical Interview",
    "Managerial Round",
    "HR Interview",
    "System Design",
    "Behavioral Screening"
  ];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0, 0, 0, 0.55)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 10000,
      fontFamily: T.font
    }}>
      <style>{`
        @keyframes modalEntrance {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
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
              background: T.amberDim, border: `1px solid ${T.amberBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 12px ${T.amberDim}`
            }}>
              <Layers size={18} color={T.amber} />
            </div>
            <h3 style={{ fontFamily: T.fontSerif, fontSize: 22, color: th.textPrimary, margin: 0, letterSpacing: "-0.01em" }}>
              Add Recruitment Round
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          
          <div>
            <label style={labelStyle}>Target Placement Drive</label>
            <select
              value={form.drive_id}
              onChange={e => setForm({ ...form, drive_id: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
            >
              {drives.length === 0 ? (
                <option value="">No active drives found</option>
              ) : (
                drives.map(d => (
                  <option key={d.drive_id} value={d.drive_id} style={{ background: dark ? "#1C1917" : "#FFFFFF", color: th.textPrimary }}>
                    {getDriveLabel(d)}
                  </option>
                ))
              )}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Round ID</label>
              <input
                type="number" required placeholder="Round ID"
                value={form.round_id}
                onChange={e => setForm({ ...form, round_id: e.target.value })}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
                onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={labelStyle}>Sequence #</label>
              <input
                type="number" required min="1" placeholder="Step Order"
                value={form.sequence_number}
                onChange={e => setForm({ ...form, sequence_number: e.target.value })}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
                onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Round Name</label>
            <select
              value={form.round_name}
              onChange={e => setForm({ ...form, round_name: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
            >
              {roundNameOptions.map(n => (
                <option key={n} value={n} style={{ background: dark ? "#1C1917" : "#FFFFFF", color: th.textPrimary }}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending || drives.length === 0}
            style={{
              marginTop: 10, padding: "14px",
              background: (createMutation.isPending || drives.length === 0)
                ? th.surfaceUp 
                : `linear-gradient(135deg, ${T.amber} 0%, ${T.amberHover} 100%)`,
              color: (createMutation.isPending || drives.length === 0) ? th.textMuted : "#1C1917",
              border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
              cursor: (createMutation.isPending || drives.length === 0) ? "not-allowed" : "pointer",
              fontFamily: T.font, display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: (createMutation.isPending || drives.length === 0) ? "none" : `0 4px 15px ${T.amberDim}`
            }}
            onMouseEnter={e => { 
              if(!createMutation.isPending && drives.length > 0) {
                e.currentTarget.style.transform = "translateY(-1.5px)";
                e.currentTarget.style.boxShadow = `0 6px 20px rgba(245, 158, 11, 0.25)`;
              } 
            }}
            onMouseLeave={e => { 
              if(!createMutation.isPending && drives.length > 0) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 15px ${T.amberDim}`;
              } 
            }}
          >
            {createMutation.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Adding Round…</>
            ) : (
              <><Plus size={16} /> Add Round</>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
