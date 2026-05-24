/**
 * src/pages/shared/Drives.jsx
 * 
 * Enhanced with:
 *  - "Already Placed" guard for placed students (blocks normal apply)
 *  - Dream Company drives are visually highlighted and allow placed students to apply
 *  - Star badge indicator on dream-eligible drives
 */
import { useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { T, getTheme } from "@/tokens";
import {
  useDrives, useApplyForDrive, useApplications,
  useDreamEligibleDrives, useApplyDreamCompany,
} from "@/hooks/useQueries";
import useAuthStore from "@/store/authStore";

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

  const { data: drives = [], isLoading } = useDrives();
  const { data: userApps = [] } = useApplications();

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

  // ── Action logic per row ────────────────────────────────────────────────────
  const buildActions = (r) => {
    if (role !== "student") return [];

    const driveStatus = getDriveStatus(r.drive_date);
    const alreadyApplied = appliedDriveIds.has(r.drive_id);
    const isDreamDrive = dreamEligibleDriveIds.has(r.drive_id);

    // Already applied
    if (alreadyApplied) {
      return [{
        label: "✓ Applied",
        bg: T.successDim, color: T.success,
        onClick: () => {},
      }];
    }

    // Only upcoming drives can be applied to
    if (driveStatus !== "upcoming") return [];

    // Placed student handling
    if (isPlaced) {
      if (isDreamDrive) {
        // Placed students CAN apply to dream drives
        return [{
          label: "★ Apply Dream →",
          bg: "rgba(139,92,246,0.15)", color: "#A78BFA",
          onClick: () => handleApplyDream(r.drive_id),
        }];
      } else {
        // Placed students CANNOT apply to regular drives
        return [{
          label: "Already Placed",
          bg: "rgba(34,197,94,0.07)", color: T.success,
          onClick: () => showToast(
            `You're already placed! 🎉 To apply to ${r.company_name}, navigate to the Dream Company portal where you can apply for tier-up opportunities.`
          ),
        }];
      }
    }

    // Normal unplaced student — regular apply
    return [{
      label: "Apply →",
      bg: T.amber, color: "#1C1917",
      onClick: () => handleApply(r.drive_id),
    }];
  };

  if (isLoading) return (
    <div style={{ color: th.textPrimary, fontFamily: T.font, padding: 32 }}>
      Loading placement drives...
    </div>
  );

  // Build a merged data set with inline actions
  const dataWithActions = drives.map(r => ({ ...r, _actions: buildActions(r) }));

  return (
    <>
      <Toast msg={toast} onClose={() => setToast("")} />
      <DataTable
        title={role === "student" ? "Placement Drives" : "Manage Drives"}
        columns={cols}
        data={drives}
        searchKeys={["company_name", "role", "drive_type"]}
        actions={role === "student" ? [
          // Static action array — dynamically hidden per row using show()
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
    </>
  );
}