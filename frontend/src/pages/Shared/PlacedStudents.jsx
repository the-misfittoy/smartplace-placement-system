/**
 * src/pages/shared/PlacedStudents.jsx
 */
import { useMemo } from "react";
import DataTable from "@/components/ui/DataTable";
import { T, getTheme } from "@/tokens";
import { usePlacedStudents } from "@/hooks/useQueries";

export default function PlacedStudents({ dark = true }) {
  const th = getTheme(dark);
  const { data: placed = [], isLoading } = usePlacedStudents();

  const cols = [
    {
      key:"name", label:"Student", sortable:true,
      render:(v, r) => (
        <div>
          <div style={{ fontWeight:500, color:th.textPrimary }}>{v}</div>
          <div style={{ fontSize:11.5, color:th.textMuted }}>{r.branch}</div>
        </div>
      ),
    },
    { key:"company_name", label:"Company", sortable:true, render:v => <strong style={{ color:th.textPrimary }}>{v}</strong> },
    { key:"role", label:"Role", sortable:true },
    { key:"package", label:"Package", sortable:true, render:v => <strong style={{ color:T.success }}>₹{v}L</strong> },
  ];

  // FIX: Memoized expensive array reductions
  const stats = useMemo(() => {
    const totalPackages = placed.reduce((sum, s) => sum + (parseFloat(s.package) || 0), 0);
    const avgPackage = placed.length > 0 ? (totalPackages / placed.length).toFixed(1) : 0;
    const uniqueCompanies = new Set(placed.map(s => s.company_name)).size;

    return [
      { label:"Total Placed", value: placed.length, color:T.success },
      { label:"Avg Package",  value: `₹${avgPackage}L`, color:T.amber },
      { label:"Companies",    value: uniqueCompanies, color:th.textPrimary },
    ];
  }, [placed, th]);

  if (isLoading) return <div style={{ color: th.textPrimary, fontFamily: T.font, padding: 32 }}>Loading placement records...</div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, fontFamily: T.font }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:13, padding:"15px 18px" }}>
            <div style={{ fontSize:10.5, color:th.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:7 }}>{s.label}</div>
            <div style={{ fontFamily:T.fontSerif, fontSize:32, color:s.color, lineHeight:1 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <DataTable
        title="Placed Students Report"
        columns={cols}
        data={placed}
        searchKeys={["name","company_name","branch","role"]}
        dark={dark}
        pageSize={8}
      />
    </div>
  );
}