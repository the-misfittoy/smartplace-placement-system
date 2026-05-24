/**
 * src/pages/tpo/Offers.jsx
 */
import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { T, getTheme } from "@/tokens";
import { useOffers, useUpdateOffer } from "@/hooks/useQueries";

export default function Offers({ dark = true }) {
  const th = getTheme(dark);
  const { data: offers = [], isLoading } = useOffers();
  const { mutate: updateOffer, isPending } = useUpdateOffer();

  const handleUpdate = (offerId, newStatus) => {
    // FIX: Safely lock function if API mutation is currently pending
    if (!isPending) {
      updateOffer({ id: offerId, status: newStatus });
    }
  };

  const cols = [
    { key: "student_name", label: "Student", sortable: true, render: (v) => <strong style={{ color: th.textPrimary }}>{v || "Unknown"}</strong> },
    { key: "company_name", label: "Company", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "package", label: "Package", sortable: true, render: v => <strong style={{ color: T.success }}>₹{v}L</strong> },
    // FIX: Using standardized StatusBadge component
    { key: "status", label: "Status", sortable: true, render: v => <StatusBadge status={v} /> },
    { key: "joining_date", label: "Joining", sortable: true, render: v => v ? new Date(v).toLocaleDateString() : "-" },
  ];

  const actions = [
    {
      label: "Accept", bg: T.successDim, color: T.success, icon: CheckCircle2,
      show: r => r.status?.toLowerCase() !== "accepted",
      onClick: r => handleUpdate(r.offer_id, "Accepted"),
    },
    {
      label: "Decline", bg: T.dangerDim, color: T.danger, icon: XCircle,
      show: r => r.status?.toLowerCase() !== "declined",
      onClick: r => handleUpdate(r.offer_id, "Declined"),
    },
  ];

  const stats = useMemo(() => [
    { label: "Total Offers", value: offers.length, color: th.textPrimary },
    { label: "Accepted", value: offers.filter(o => o.status?.toLowerCase() === "accepted").length, color: T.success },
    { label: "Pending", value: offers.filter(o => o.status?.toLowerCase() === "pending").length, color: T.amber },
    { label: "Declined", value: offers.filter(o => o.status?.toLowerCase() === "declined").length, color: T.danger },
  ], [offers, th]);

  if (isLoading) return <div style={{ color: th.textPrimary, padding: 32, fontFamily: T.font }}>Loading offers...</div>;

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
        title="Offer Management"
        columns={cols}
        data={offers}
        actions={actions}
        searchKeys={["student_name", "company_name", "role"]}
        filters={[{
            key: "status", label: "Status",
            options: [{ value: "Accepted", label: "Accepted" }, { value: "Pending", label: "Pending" }, { value: "Declined", label: "Declined" }]
        }]}
        dark={dark}
        pageSize={10}
      />
    </div>
  );
}