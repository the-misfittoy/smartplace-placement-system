/**
 * src/pages/student/RejectionAnalysis.jsx
 */
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, Lightbulb } from "lucide-react";
import { useRejectionAnalysis } from "@/hooks/useQueries";
import { T, getTheme } from "@/tokens";
import useAuthStore from "@/store/authStore";

function RadialCentreLabel({ cx, cy, value }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" style={{ fontFamily: T.fontSerif, fontSize: 32, fill: T.success }}>{value}</tspan>
      <tspan x={cx} dy="26" style={{ fontFamily: T.font, fontSize: 12, fill: "#A8A29E" }}>success rate</tspan>
    </text>
  );
}

// FIX: Removed dangerous hardcoded default student ID
export default function RejectionAnalysis({ dark = true }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  const studentId = user?.student_id;

  const { data, isLoading, error } = useRejectionAnalysis(studentId);

  if (isLoading) return <div style={{ color: th.textPrimary, padding: 32, fontFamily: T.font }}>Loading analytics...</div>;
  if (error) return <div style={{ padding: 24, color: T.danger, fontFamily: T.font }}>Error: {error.message}</div>;

  const totalApplications = data?.total_applications ?? 0;
  const selected          = data?.total_selected ?? 0;
  const rejected          = data?.total_rejections ?? 0;
  const successRate       = data?.success_rate ?? "0%";
  const rejectedApps      = data?.rejected_companies ?? [];
  const suggestions       = data?.suggestions ?? [];

  const companyCounts = rejectedApps.reduce((acc, app) => {
    acc[app.company_name] = (acc[app.company_name] || 0) + 1;
    return acc;
  }, {});
  
  const barData = Object.keys(companyCounts).map((name, i) => ({
    name, count: companyCounts[name], color: [T.danger, T.warning, T.info, T.amber][i % 4]
  }));

  const radialData = [{ name: "Success", value: parseFloat(successRate), fill: T.success }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, fontFamily: T.font }}>
      <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <BarChart3 size={17} color={T.amber} />
          <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, color: th.textPrimary, margin: 0 }}>Rejection Analysis</h2>
        </div>
        <p style={{ fontSize: 13.5, color: th.textSecondary, margin: 0 }}>Understand where applications didn't progress and how to improve.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 13 }}>
        {[
          { label: "Total Applied", value: totalApplications, color: th.textPrimary },
          { label: "Selected", value: selected, color: T.success },
          { label: "Rejected", value: rejected, color: T.danger },
        ].map((s, i) => (
          <div key={i} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 13, padding: "16px 18px" }}>
            <div style={{ fontSize: 10.5, color: th.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 36, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontFamily: T.fontSerif, fontSize: 17, color: th.textPrimary, marginBottom: 16 }}>Success Rate</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="85%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: th.surfaceUp }} />
              <RadialCentreLabel cx="50%" cy="50%" value={successRate} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontFamily: T.fontSerif, fontSize: 17, color: th.textPrimary, marginBottom: 16 }}>Rejections by Company</div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical" margin={{ left: 16, right: 24, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: th.textSecondary }} width={80} />
                <Tooltip contentStyle={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 8 }} cursor={{ fill: th.surfaceUp }} />
                <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ fontSize: 13.5, color: th.textMuted, padding: "20px 0" }}>No rejections recorded.</div>
          )}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontFamily: T.fontSerif, fontSize: 17, color: th.textPrimary }}>
            <Lightbulb size={16} color={T.amber} /> What To Do Next
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{ background: th.surfaceUp, border: `1px solid ${th.border}`, borderRadius: 11, padding: "14px 16px", fontSize: 14, color: th.textSecondary }}>
                • {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}