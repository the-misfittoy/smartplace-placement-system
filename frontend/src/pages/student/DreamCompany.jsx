/**
 * src/pages/student/DreamCompany.jsx
 * 
 * Unified, Role-Aware Dream Company Portal.
 *  - Students: Secure, automated base offer checks, package calculations, and eligible drive applications.
 *  - TPOs/Admins: Search any student ID, review active applications, inspect eligible drives, and apply on their behalf.
 *  - Highly visible glassmorphism and gold-glow accents matching premium themes.
 */

import { useState, useEffect } from "react";
import { Star, Search, Plus, X, Layers, Calendar, Check, AlertTriangle, Loader2 } from "lucide-react";
import { T, getTheme } from "@/tokens";
import useAuthStore from "@/store/authStore";
import { useStudent, useDreamEligibleDrives, useDreamApplications, useApplyDreamCompany } from "@/hooks/useQueries";
import * as api from "@/API/api";

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

export default function DreamCompany({ dark = true }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  const isStudent = user?.role === "student";

  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  };

  // ===========================================================================
  // 1. STUDENT WORKFLOW (Fully Secured & Automated)
  // ===========================================================================
  const studentId = user?.student_id;
  const { data: profile, isLoading: isLoadingProfile } = useStudent(studentId);
  
  // Placed check
  const isPlaced = profile?.placement_status === "Placed" || profile?.placement_status === "Dream Placed";

  // Eligible drives and applications
  const { data: eligibleRes, isLoading: isLoadingDrives } = useDreamEligibleDrives(studentId, isPlaced);
  const eligibleDrives = eligibleRes?.dream_eligible_drives || [];

  const { data: studentApps, isLoading: isLoadingApps } = useDreamApplications(studentId);
  const pastApplications = Array.isArray(studentApps) ? studentApps : [];
  
  const { mutate: applyDream, isPending: isApplying } = useApplyDreamCompany();

  const handleStudentApply = (driveId, companyName) => {
    if (window.confirm(`Are you sure you want to utilize your Dream Company quota for ${companyName}? This action is permanent.`)) {
      applyDream({ drive_id: driveId }, {
        onSuccess: () => {
          showToast(`Successfully applied to ${companyName} under your Dream Quota!`);
        },
        onError: (err) => {
          showToast(`Error: ${err.response?.data?.detail || "Failed to apply."}`);
        }
      });
    }
  };

  // ===========================================================================
  // 2. TPO ADMIN WORKFLOW (Search console & Manual Actions)
  // ===========================================================================
  const [searchId, setSearchId] = useState("");
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [searchedApps, setSearchedApps] = useState([]);
  const [searchedEligibleDrives, setSearchedEligibleDrives] = useState([]);
  const [adminApplyDriveId, setAdminApplyDriveId] = useState("");
  
  const [tpoLoading, setTpoLoading] = useState(false);
  const [tpoErr, setTpoErr] = useState("");
  const [tpoSuccess, setTpoSuccess] = useState("");

  const handleTpoSearch = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    setTpoLoading(true);
    setTpoErr("");
    setTpoSuccess("");
    setSearchedStudent(null);
    setAdminApplyDriveId("");

    try {
      const s = await api.getStudent(searchId);
      setSearchedStudent(s);
      
      const isPl = s.placement_status === "Placed" || s.placement_status === "Dream Placed";
      if (isPl) {
        const [apps, drivesRes] = await Promise.all([
          api.getDreamApplications(searchId).catch(() => []),
          api.getDreamEligibleDrives(searchId).catch(() => ({ dream_eligible_drives: [] }))
        ]);
        setSearchedApps(apps);
        setSearchedEligibleDrives(drivesRes?.dream_eligible_drives || []);
      } else {
        setSearchedApps([]);
        setSearchedEligibleDrives([]);
      }
    } catch (err) {
      setTpoErr(err.response?.data?.detail || "Student record not found in the placement database.");
    }
    setTpoLoading(false);
  };

  const handleTpoApply = async () => {
    if (!adminApplyDriveId || !searchedStudent) return;
    
    setTpoLoading(true);
    setTpoErr("");
    setTpoSuccess("");

    try {
      await api.applyDreamCompany({
        student_id: parseInt(searchId),
        drive_id: parseInt(adminApplyDriveId)
      });
      setTpoSuccess("✅ Dream application submitted successfully on behalf of the student!");
      
      // Reload apps
      const apps = await api.getDreamApplications(searchId).catch(() => []);
      setSearchedApps(apps);
      setAdminApplyDriveId("");
    } catch (err) {
      setTpoErr(err.response?.data?.detail || "Operation denied by eligibility rules.");
    }
    setTpoLoading(false);
  };

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

  const labelStyle = {
    display: "block", fontSize: 13, fontWeight: 600, color: th.textSecondary, marginBottom: 8,
    letterSpacing: "0.02em"
  };

  const inputStyle = {
    padding: "12px 15px",
    background: dark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
    border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: 12, fontSize: 14, color: th.textPrimary,
    outline: "none", transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    fontFamily: T.font, boxSizing: "border-box"
  };

  // Render Student View
  if (isStudent) {
    if (isLoadingProfile || isLoadingDrives || isLoadingApps) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          height: "60vh", color: th.textSecondary, fontFamily: T.font, gap: 12
        }}>
          <Loader2 size={36} className="animate-spin" style={{ color: T.amber }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Verifying tier-up eligibility metrics...</span>
        </div>
      );
    }

    if (!isPlaced) {
      return (
        <div style={{ padding: 8, fontFamily: T.font, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: "bold", color: th.textPrimary, marginBottom: 8, fontFamily: T.fontSerif }}>
              Dream Company Quota
            </h1>
            <p style={{ color: th.textSecondary, margin: 0 }}>Institutional policies regarding package multipliers.</p>
          </div>

          <div style={{
            background: th.surface, borderLeft: `5px solid ${T.amber}`,
            borderRadius: "0 16px 16px 0", padding: "28px 32px",
            boxShadow: dark ? "0 10px 30px rgba(0,0,0,0.2)" : "0 10px 30px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.amber, marginBottom: 14 }}>
              <AlertTriangle size={22} />
              <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>Eligibility Locked</h2>
            </div>
            <p style={{ color: th.textPrimary, lineHeight: 1.7, fontSize: 14.5, marginBottom: 18, maxWidth: 640 }}>
              The Dream Company workflow is strictly reserved for students who have already secured an initial base placement offer. Currently, your profile is listed as <strong>Not Placed</strong>.
            </p>
            <p style={{ color: th.textSecondary, fontSize: 13.5, margin: 0 }}>
              Focus on securing your base offer. Once Placed, this portal will automatically unlock to show high-tier recruitment opportunities.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div style={{ fontFamily: T.font, display: "flex", flexDirection: "column", gap: 24 }}>
        <Toast msg={toast} onClose={() => setToast("")} />

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${th.border}`, paddingBottom: 20 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: T.amberDim, border: `1.5px solid ${T.amberBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 12px ${T.amberDim}`
          }}>
            <Star size={20} color={T.amber} fill={T.amber} />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: "bold", color: th.textPrimary, margin: 0, fontFamily: T.fontSerif }}>
              Dream Company Portal
            </h1>
            <p style={{ color: T.success, fontWeight: 600, fontSize: 13.5, margin: "4px 0 0" }}>
              ✓ Eligible (Base Offer Secured)
            </p>
          </div>
        </div>

        {/* Two Column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 20, alignItems: "flex-start" }}>
          
          {/* Opportunities Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 18, fontFamily: T.fontSerif, color: th.textPrimary, margin: 0, borderBottom: `1px solid ${th.border}`, paddingBottom: 8 }}>
              Eligible Tier-Up Opportunities
            </h3>

            {eligibleDrives.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: "center", color: th.textSecondary, padding: "54px 30px" }}>
                No active drives currently meet your required package multiplier threshold.
              </div>
            ) : (
              eligibleDrives.map((drive) => {
                const hasApplied = pastApplications.some(app => app.drive_id === drive.drive_id);
                return (
                  <div key={drive.drive_id} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div>
                      <h4 style={{ fontSize: 17, color: th.textPrimary, margin: "0 0 4px" }}>
                        {drive.company_name}
                      </h4>
                      <p style={{ fontSize: 13, color: th.textSecondary, margin: "0 0 12px" }}>
                        {drive.role}
                      </p>
                      <span style={{
                        background: T.successDim, border: `1px solid ${T.successBorder}`, color: T.success,
                        padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700
                      }}>
                        ₹{drive.package} LPA
                      </span>
                    </div>

                    <button 
                      onClick={() => handleStudentApply(drive.drive_id, drive.company_name)}
                      disabled={isApplying || hasApplied}
                      style={{
                        background: hasApplied ? th.surfaceUp : `linear-gradient(135deg, ${T.amber} 0%, ${T.amberHover} 100%)`,
                        color: hasApplied ? th.textMuted : "#1C1917",
                        border: "none", padding: "10px 22px", borderRadius: 10,
                        fontWeight: 700, cursor: hasApplied ? "not-allowed" : "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { if(!hasApplied) e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { if(!hasApplied) e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {hasApplied ? "Applied" : isApplying ? "Submitting..." : "Apply as Dream"}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Applications Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 18, fontFamily: T.fontSerif, color: th.textPrimary, margin: 0, borderBottom: `1px solid ${th.border}`, paddingBottom: 8 }}>
              Your Dream Applications
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pastApplications.map(app => (
                <div key={app.dream_app_id} style={{ ...cardStyle, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, color: th.textPrimary, fontSize: 14.5 }}>
                      {app.company_name}
                    </span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      background: app.status === "Selected" ? T.successDim : "rgba(120,113,108,0.12)",
                      border: `1px solid ${app.status === "Selected" ? T.successBorder : "rgba(120,113,108,0.25)"}`,
                      color: app.status === "Selected" ? T.success : th.textSecondary
                    }}>
                      {app.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: th.textSecondary }}>
                    <span>Role: {app.role || "Trainee"}</span>
                    <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

              {pastApplications.length === 0 && (
                <div style={{ color: th.textMuted, fontSize: 13.5, fontStyle: "italic", padding: 10 }}>
                  No dream company applications submitted yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Render TPO View
  return (
    <div style={{ fontFamily: T.font, display: "flex", flexDirection: "column", gap: 22 }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${th.border}`, paddingBottom: 20 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: T.amberDim, border: `1.5px solid ${T.amberBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Star size={20} color={T.amber} fill={T.amber} />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: "bold", color: th.textPrimary, margin: 0, fontFamily: T.fontSerif }}>
            Dream Company Tracker
          </h1>
          <p style={{ color: th.textSecondary, margin: "4px 0 0", fontSize: 13.5 }}>
            Audit active candidate tier-up records and submit manual overrides.
          </p>
        </div>
      </div>

      {/* Find Student Console */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: th.textPrimary, margin: "0 0 16px" }}>
          Find Student
        </h3>

        <form onSubmit={handleTpoSearch} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={labelStyle}>Student ID</label>
            <input 
              type="number" required placeholder="Enter integer Student ID (e.g. 4)"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
              onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
              onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <button 
            type="submit" 
            disabled={tpoLoading}
            style={{
              padding: "13px 24px",
              background: tpoLoading ? th.surfaceUp : `linear-gradient(135deg, ${T.amber} 0%, ${T.amberHover} 100%)`,
              color: tpoLoading ? th.textMuted : "#1C1917",
              border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: tpoLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
            }}
          >
            {tpoLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} strokeWidth={2.5} />
            )}
            View Dream Status
          </button>
        </form>

        {tpoErr && (
          <div style={{
            marginTop: 16, padding: "10px 14px", borderRadius: 10,
            background: T.dangerDim, border: `1px solid ${T.dangerBorder}`,
            color: T.danger, fontSize: 13, fontWeight: 500
          }}>
            {tpoErr}
          </div>
        )}
        {tpoSuccess && (
          <div style={{
            marginTop: 16, padding: "10px 14px", borderRadius: 10,
            background: T.successDim, border: `1px solid ${T.successBorder}`,
            color: T.success, fontSize: 13, fontWeight: 500
          }}>
            {tpoSuccess}
          </div>
        )}
      </div>

      {/* Searched Results Panel */}
      {searchedStudent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Dream Badge Hero */}
          <div style={{
            background: dark ? "rgba(245,158,11,0.03)" : "rgba(245,158,11,0.02)",
            border: `1.5px solid ${T.amberBorder}`,
            borderRadius: 20,
            padding: "24px 30px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: dark ? "0 10px 25px rgba(245,158,11,0.03)" : "none"
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: "50%",
              background: T.amberDim, border: `1px solid ${T.amberBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color: T.amber, flexShrink: 0
            }}>
              ⭐
            </div>
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: th.textPrimary, margin: 0 }}>
                {searchedStudent.name}
              </h3>
              <p style={{ fontSize: 13, color: th.textSecondary, margin: "4px 0 0" }}>
                Branch: {searchedStudent.branch} · CGPA {searchedStudent.cgpa} · graduation: {searchedStudent.graduation_year}
              </p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                background: searchedStudent.placement_status.includes("Placed") ? T.successDim : "rgba(120,113,108,0.12)",
                border: `1px solid ${searchedStudent.placement_status.includes("Placed") ? T.successBorder : "rgba(120,113,108,0.25)"}`,
                color: searchedStudent.placement_status.includes("Placed") ? T.success : th.textSecondary
              }}>
                {searchedStudent.placement_status}
              </span>
            </div>
          </div>

          {/* Action Grids */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
            
            {/* Left Card: Apply Manual Override */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: `1px solid ${th.border}`, paddingBottom: 10 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: th.textPrimary, margin: 0 }}>
                  Apply for Dream Company Drive
                </h4>
                <span style={{ fontSize: 11.5, color: th.textSecondary, fontWeight: 500 }}>
                  TPO Manual Override
                </span>
              </div>

              {searchedStudent.placement_status === "Not Placed" ? (
                <div style={{ padding: "14px 0", color: th.textMuted, fontSize: 13.5, fontStyle: "italic" }}>
                  ⚠️ This candidate has no active base offer. Manual submissions are restricted under institutional guidelines.
                </div>
              ) : searchedEligibleDrives.length === 0 ? (
                <div style={{ padding: "14px 0", color: th.textMuted, fontSize: 13.5, fontStyle: "italic" }}>
                  No active drives meet the required package multiplier rate for this candidate's tier-up.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Select Active Drive</label>
                    <select
                      value={adminApplyDriveId}
                      onChange={e => setAdminApplyDriveId(e.target.value)}
                      style={{ ...inputStyle, width: "100%", cursor: "pointer" }}
                      onFocus={e => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 4px ${T.amberRing}`; }}
                      onBlur={e => { e.target.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.target.style.boxShadow = "none"; }}
                    >
                      <option value="" style={{ background: dark ? "#1C1917" : "#FFFFFF", color: th.textSecondary }}>— Select Drive —</option>
                      {searchedEligibleDrives.map(drive => (
                        <option key={drive.drive_id} value={drive.drive_id} style={{ background: dark ? "#1C1917" : "#FFFFFF", color: th.textPrimary }}>
                          {drive.company_name} ({drive.role} — ₹{drive.package} LPA)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={handleTpoApply}
                    disabled={tpoLoading || !adminApplyDriveId}
                    style={{
                      padding: "13px",
                      background: (tpoLoading || !adminApplyDriveId)
                        ? th.surfaceUp 
                        : `linear-gradient(135deg, ${T.amber} 0%, ${T.amberHover} 100%)`,
                      color: (tpoLoading || !adminApplyDriveId) ? th.textMuted : "#1C1917",
                      border: "none", borderRadius: 12, fontSize: 14.5, fontWeight: 700,
                      cursor: (tpoLoading || !adminApplyDriveId) ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s"
                    }}
                  >
                    <Star size={15} fill={adminApplyDriveId ? "#1C1917" : "none"} />
                    Apply Dream Quota
                  </button>
                </div>
              )}
            </div>

            {/* Right Card: Dream applications log */}
            <div style={cardStyle}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: th.textPrimary, margin: "0 0 16px", borderBottom: `1px solid ${th.border}`, paddingBottom: 10 }}>
                Dream Applications Log
              </h4>

              {searchedApps.length === 0 ? (
                <div style={{ color: th.textMuted, fontSize: 13.5, fontStyle: "italic", padding: "14px 0" }}>
                  No active dream application logs captured.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 220 }}>
                  {searchedApps.map(app => (
                    <div 
                      key={app.dream_app_id} 
                      style={{
                        background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${th.border}`, borderRadius: 10,
                        padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: th.textPrimary, fontSize: 13.5 }}>
                          {app.company_name}
                        </div>
                        <div style={{ fontSize: 11, color: th.textSecondary, marginTop: 3 }}>
                          ₹{app.package} LPA · ID #{app.dream_app_id}
                        </div>
                      </div>

                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: app.status === "Selected" ? T.successDim : "rgba(120,113,108,0.12)",
                        border: `1px solid ${app.status === "Selected" ? T.successBorder : "rgba(120,113,108,0.25)"}`,
                        color: app.status === "Selected" ? T.success : th.textSecondary
                      }}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
            <h4 style={{ margin: "0 0 8px", fontSize: 17, color: th.textPrimary, fontWeight: 700 }}>
              Dream Company Tracker
            </h4>
            <p style={{ fontSize: 13.5, color: th.textSecondary, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
              Enter an active Placed candidate's Student ID to review their eligibility parameters, pull their active dream screening history, and schedule custom overrides.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}