/**
 * src/pages/shared/Applications.jsx
 * Unified job applications view merging regular drives and premium dream companies.
 */
import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { T, getTheme } from "@/tokens";
import { useApplications, useUpdateApplication, useDreamApplications } from "@/hooks/useQueries";
import useAuthStore from "@/store/authStore";

export default function Applications({ dark = true, role = "student" }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  const { data: apps = [], isLoading: isLoadingApps } = useApplications();
  const { data: dreamApps = [], isLoading: isLoadingDream } = useDreamApplications(
    role === "student" ? user?.student_id : null
  );
  const updateMutation = useUpdateApplication();

  const handleUpdate = (appId, newStatus) => {
    updateMutation.mutate({ id: appId, application_status: newStatus });
  };

  // Merge regular applications and dream company applications for student view
  const unifiedApps = useMemo(() => {
    if (role !== "student") return apps;
    
    const regular = apps.map(a => ({ 
      ...a, 
      isDream: false,
      normalizedStatus: a.application_status
    }));
    
    const dream = dreamApps.map(a => ({
      application_id: `dream-${a.dream_app_id}`,
      company_name: a.company_name,
      role: a.role,
      normalizedStatus: a.status === "Applied" ? "Pending" : a.status,
      drive_date: a.applied_at,
      isDream: true
    }));
    
    return [...dream, ...regular].sort((a, b) => new Date(b.drive_date) - new Date(a.drive_date));
  }, [apps, dreamApps, role]);

  const studentCols = [
    { 
      key: "company_name", 
      label: "Company", 
      sortable: true, 
      render: (v, r) => (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ color: th.textPrimary }}>{v || "Unknown"}</strong>
          {r.isDream && (
            <span style={{ fontSize: 9, background: "rgba(168,85,247,0.15)", color: "#A855F7", fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>
              DREAM
            </span>
          )}
        </span>
      )
    },
    { key: "role", label: "Role", sortable: true },
    { key: "drive_date", label: "Date Applied", sortable: true, render: v => v ? new Date(v).toLocaleDateString() : "-" },
    { key: "normalizedStatus", label: "Status", sortable: true, render: v => <StatusBadge status={v}/> },
  ];

  const tpoCols = [
    { key: "student_name", label: "Student", sortable: true, render: v => <strong style={{ color: th.textPrimary }}>{v || "Unknown"}</strong> },
    { key: "company_name", label: "Company", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "application_status", label: "Status", sortable: true, render: v => <StatusBadge status={v}/> },
  ];

  const tpoActions = [
    {
      label: "Select", bg: T.successDim, color: T.success, icon: CheckCircle2,
      show: r => r.application_status !== "Selected",
      onClick: r => handleUpdate(r.application_id, "Selected"),
    },
    {
      label: "Reject", bg: T.dangerDim, color: T.danger, icon: XCircle,
      show: r => r.application_status !== "Rejected",
      onClick: r => handleUpdate(r.application_id, "Rejected"),
    },
  ];

  const stats = useMemo(() => [
    { label: "Total Applications", value: unifiedApps.length, color: th.textPrimary },
    { label: "Selected", value: unifiedApps.filter(a => ["selected", "dream placed"].includes((a.normalizedStatus || a.application_status)?.toLowerCase())).length, color: T.success },
    { label: "Pending",  value: unifiedApps.filter(a => ["pending", "applied"].includes((a.normalizedStatus || a.application_status)?.toLowerCase())).length,  color: T.amber },
    { label: "Rejected", value: unifiedApps.filter(a => ["rejected"].includes((a.normalizedStatus || a.application_status)?.toLowerCase())).length, color: T.danger },
  ], [unifiedApps, th]);

  const isLoading = isLoadingApps || (role === "student" && isLoadingDream);

  if (isLoading) return <div style={{ color: th.textPrimary, fontFamily: T.font, padding: 32 }}>Loading applications...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: T.font }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 13, padding: "15px 18px" }}>
            <div style={{ fontSize: 10.5, color: th.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>{s.label}</div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 32, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <DataTable
        title={role === "student" ? "My Applications" : "All Applications"}
        columns={role === "student" ? studentCols : tpoCols}
        data={unifiedApps}
        searchKeys={role === "student" ? ["company_name", "role"] : ["student_name", "company_name", "role"]}
        actions={role !== "student" ? tpoActions : []}
        dark={dark}
        pageSize={8}
      />
    </div>
  );
}