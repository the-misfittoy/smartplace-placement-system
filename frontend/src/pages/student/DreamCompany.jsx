/**
 * src/pages/student/DreamCompany.jsx
 */
import { useState } from "react";
import useAuthStore from "@/store/authStore";
import { useStudent, useDreamEligibleDrives, useDreamApplications, useApplyDreamCompany } from "@/hooks/useQueries";
import { T, getTheme } from "@/tokens";

export default function DreamCompany({ dark = true }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  const studentId = user?.student_id;

  const { data: profile, isLoading: isLoadingProfile } = useStudent(studentId);
  const isPlaced = profile?.placement_status === "Placed" || profile?.placement_status === "Dream Placed";

  const { data: eligibleRes, isLoading: isLoadingDrives } = useDreamEligibleDrives(studentId, isPlaced);
  const eligibleDrives = eligibleRes?.dream_eligible_drives || [];
  
  const { data: pastApplicationsData, isLoading: isLoadingApps } = useDreamApplications(studentId);
  const pastApplications = Array.isArray(pastApplicationsData) ? pastApplicationsData : [];
  const { mutate: applyDream, isPending: isApplying } = useApplyDreamCompany();

  const handleApply = (driveId, companyName) => {
    if (window.confirm(`Are you sure you want to use your Dream Company quota for ${companyName}?`)) {
      // FIX: Removed student_id to prevent identity spoofing. JWT handles this.
      applyDream({ drive_id: driveId });
    }
  };

  const isLoading = isLoadingProfile || isLoadingDrives || isLoadingApps;
  if (isLoading) return <div style={{ color: th.textPrimary, padding: 32, fontFamily: T.font }}>Verifying institutional eligibility...</div>;

  if (!isPlaced) {
    return (
      <div style={{ padding: 32, fontFamily: T.font }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", color: th.textPrimary, marginBottom: 8 }}>Dream Company Quota</h1>
        <p style={{ color: th.textSecondary, marginBottom: 32 }}>Institutional policies regarding multiple offers.</p>
        <div style={{ background: th.surface, borderLeft: `4px solid ${T.amber}`, borderRadius: "0 12px 12px 0", padding: 24 }}>
          <h2 style={{ fontSize: 20, color: T.amber, fontWeight: "bold", marginBottom: 12 }}>⚠️ Eligibility Locked</h2>
          <p style={{ color: th.textPrimary, lineHeight: 1.6, marginBottom: 16 }}>
            The Dream Company workflow is strictly reserved for students who have already secured a base placement offer. Currently, your status is listed as <strong>Not Placed</strong>.
          </p>
          <p style={{ color: th.textSecondary, fontSize: 14 }}>Focus on securing your first offer. Once placed, this portal will unlock automatically to show tier-up opportunities.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, fontFamily: T.font, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: "bold", color: th.textPrimary, marginBottom: 8 }}>Dream Company Portal</h1>
        <p style={{ color: T.success, fontWeight: 500 }}>Status: Eligible (Base Offer Secured)</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 20, color: th.textPrimary, borderBottom: `1px solid ${th.border}`, paddingBottom: 8 }}>Eligible Tier-Up Opportunities</h2>
          {eligibleDrives.length === 0 ? (
            <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 12, padding: 32, textAlign: "center", color: th.textMuted }}>
              No active drives currently meet your required package multiplier.
            </div>
          ) : (
            eligibleDrives.map((drive) => {
              const hasApplied = pastApplications.some(app => app.drive_id === drive.drive_id);
              return (
                <div key={drive.drive_id} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 12, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: 18, color: th.textPrimary, fontWeight: "bold", marginBottom: 4 }}>{drive.company_name}</h3>
                    <p style={{ fontSize: 14, color: th.textSecondary, marginBottom: 12 }}>{drive.role}</p>
                    <span style={{ background: T.successDim, color: T.success, padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: "bold" }}>₹{drive.package} LPA</span>
                  </div>
                  <button 
                    onClick={() => handleApply(drive.drive_id, drive.company_name)}
                    disabled={isApplying || hasApplied}
                    style={{ background: hasApplied ? th.surfaceUp : T.amber, color: hasApplied ? th.textMuted : "#1C1917", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: "bold", cursor: hasApplied ? "not-allowed" : "pointer" }}
                  >
                    {hasApplied ? "Applied" : isApplying ? "Submitting..." : "Apply as Dream"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div>
          <h2 style={{ fontSize: 20, color: th.textPrimary, borderBottom: `1px solid ${th.border}`, paddingBottom: 8, marginBottom: 16 }}>Your Dream Applications</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pastApplications.map(app => (
              <div key={app.dream_app_id} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 8, padding: 16 }}>
                <p style={{ fontWeight: "bold", color: th.textPrimary, margin: "0 0 8px 0" }}>{app.company_name}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: th.textSecondary }}>{new Date(app.applied_at).toLocaleDateString()}</span>
                  <span style={{ background: th.surfaceUp, color: th.textPrimary, padding: "2px 6px", borderRadius: 4 }}>{app.status}</span>
                </div>
              </div>
            ))}
            {pastApplications.length === 0 && <p style={{ color: th.textMuted, fontSize: 14, fontStyle: "italic" }}>No applications submitted yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}