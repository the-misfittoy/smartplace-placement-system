/**
 * src/pages/tpo/Results.jsx
 */
import { CheckCircle2, XCircle } from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { T, getTheme } from "@/tokens";
import { useResults, useAddResult } from "@/hooks/useQueries";

export default function Results({ dark = true }) {
  const th = getTheme(dark);
  const { data: results = [], isLoading } = useResults();
  const { mutate: addResult, isPending } = useAddResult();

  const handleUpdate = (applicationId, status) => {
    // FIX: Add isPending protection guard 
    if (!isPending) {
      addResult({ application_id: applicationId, result_status: status });
    }
  };

  const cols = [
    {
      key: "student_name", label: "Student", sortable: true,
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 500, color: th.textPrimary }}>{v || "Unknown"}</div>
          <div style={{ fontSize: 11.5, color: th.textMuted }}>CGPA: {r.cgpa || "-"}</div>
        </div>
      ),
    },
    { key: "company_name", label: "Company", sortable: true },
    { key: "round_name", label: "Round", sortable: true },
    { key: "result_status", label: "Result", sortable: true, render: v => <StatusBadge status={v} /> },
  ];

  const actions = [
    {
      label: "Pass", bg: T.successDim, color: T.success, icon: CheckCircle2,
      show: r => r.result_status?.toLowerCase() !== "pass",
      onClick: r => handleUpdate(r.application_id, "Pass"),
    },
    {
      label: "Fail", bg: T.dangerDim, color: T.danger, icon: XCircle,
      show: r => r.result_status?.toLowerCase() !== "fail",
      onClick: r => handleUpdate(r.application_id, "Fail"),
    },
  ];

  if (isLoading) return <div style={{ color: th.textPrimary, padding: 32, fontFamily: T.font }}>Loading results...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: T.font }}>
      <DataTable
        title="Interview Results"
        columns={cols}
        data={results}
        actions={actions}
        searchKeys={["student_name", "company_name", "round_name"]}
        filters={[{
            key: "result_status", label: "Result",
            options: [{ value: "Pass", label: "Pass" }, { value: "Fail", label: "Fail" }, { value: "Pending", label: "Pending" }]
        }]}
        dark={dark}
        pageSize={10}
      />
    </div>
  );
}