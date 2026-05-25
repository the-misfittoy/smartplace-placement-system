/**
 * src/pages/tpo/Dashboard.jsx
 * High-fidelity glassmorphic TPO Dashboard with Recharts visualization streams.
 */
import { useMemo } from "react";
import { useDashboardSummary } from "@/hooks/useQueries";
import { Users, Building2, CalendarCheck, Trophy, TrendingUp, Award } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { T, getTheme } from "@/tokens";
import { useOutletContext } from "react-router-dom";
import PageSkeleton from "@/components/ui/PageSkeleton";

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

function Pkg({ value }) {
  return (
    <span style={{
      padding: "4px 8px",
      background: "rgba(16, 185, 129, 0.08)",
      border: "1.5px solid rgba(16, 185, 129, 0.2)",
      borderRadius: 8,
      color: "#10B981",
      fontWeight: 700,
      fontSize: 12.5,
      display: "inline-block"
    }}>
      ₹{value} LPA
    </span>
  );
}

function StatCard({ label, value, icon, color, th }) {
  return (
    <div style={{
      background: th.surface,
      border: `1px solid ${th.border}`,
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
    }}>
      <div>
        <div style={{ fontSize: 11, color: th.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: color, fontFamily: T.fontSerif, lineHeight: 1 }}>
          {value}
        </div>
      </div>
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 10,
        background: th.surfaceUp,
        border: `1px solid ${th.borderUp}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color
      }}>
        {icon}
      </div>
    </div>
  );
}

function DashboardCard({ title, children, th }) {
  return (
    <div style={{
      background: th.surface,
      border: `1px solid ${th.border}`,
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
    }}>
      <h3 style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 700, color: th.textPrimary, margin: "0 0 20px 0" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function TPODashboard() {
  const { dark = true } = useOutletContext() || {};
  const th = getTheme(dark);

  const { data, isLoading, isError } = useDashboardSummary();

  const { pieData, barData } = useMemo(() => {
    if (!data) return { pieData: [], barData: [] };
    const { stats, branch_stats = [] } = data;

    const pie = [
      { name: 'Placed', value: (stats?.placed || 0) },
      { name: 'Dream Placed', value: stats?.dream_placed || 0 },
      { name: 'Not Placed', value: stats?.not_placed || 0 },
    ].filter(d => d.value > 0);

    const bar = branch_stats.map(b => ({
      name: b.branch?.substring(0, 8),
      rate: parseFloat(b.placement_rate) || 0,
      placed: b.placed || 0,
      total: b.total || 0,
    }));

    return { pieData: pie, barData: bar };
  }, [data]);

  if (isLoading) return <PageSkeleton type="dashboard" dark={dark} />;
  
  if (isError) return (
    <div style={{ color: T.danger, padding: 32, fontFamily: T.font }}>
      Error loading placement analytics. Please verify your connection.
    </div>
  );

  const { stats, recent_offers = [], recent_drives = [] } = data || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 32, fontFamily: T.font, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: T.fontSerif, fontSize: 32, fontWeight: "bold", color: th.textPrimary, marginBottom: 4 }}>
          TPO Overview ✦
        </h1>
        <p style={{ color: th.textSecondary, margin: 0 }}>Real-time university placement statistics and analytical streams.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        <StatCard label="Total Students" value={stats?.total_students || 0} icon={<Users size={18} />} color={th.textPrimary} th={th} />
        <StatCard label="Placed (Regular)" value={stats?.placed || 0} icon={<Trophy size={18} />} color={T.success} th={th} />
        <StatCard label="Dream Placed" value={stats?.dream_placed || 0} icon={<Award size={18} />} color={T.info} th={th} />
        <StatCard label="Placement Rate" value={stats?.placement_rate || '0%'} icon={<TrendingUp size={18} />} color={T.amber} th={th} />
        <StatCard label="Highest Package" value={stats?.highest_package ? `₹${stats.highest_package} LPA` : '—'} icon={<Building2 size={18} />} color={T.success} th={th} />
        <StatCard label="Avg. Package" value={stats?.average_package ? `₹${stats.average_package} LPA` : '—'} icon={<CalendarCheck size={18} />} color={T.info} th={th} />
      </div>

      {/* Recharts Analytics Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 32 }}>
        <DashboardCard title="Placement by Branch" th={th}>
          {barData.length > 0 ? (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: th.textMuted }} />
                  <YAxis tick={{ fontSize: 11, fill: th.textMuted }} unit="%" />
                  <Tooltip
                    contentStyle={{ background: th.surfaceUp, border: `1px solid ${th.borderUp}`, borderRadius: 8, fontSize: 12, color: th.textPrimary }}
                    formatter={(v) => [`${v}%`, 'Rate']}
                  />
                  <Bar dataKey="rate" fill={T.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ color: th.textMuted, fontSize: 13.5, textAlign: 'center', padding: "80px 0" }}>No branch data recorded yet</div>
          )}
        </DashboardCard>

        <DashboardCard title="Placement Status Distribution" th={th}>
          {pieData.length > 0 ? (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: th.surfaceUp, border: `1px solid ${th.borderUp}`, borderRadius: 8, fontSize: 12, color: th.textPrimary }} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12, color: th.textSecondary }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ color: th.textMuted, fontSize: 13.5, textAlign: 'center', padding: "80px 0" }}>No status data recorded yet</div>
          )}
        </DashboardCard>
      </div>

      {/* Stream lists section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 32 }}>
        <DashboardCard title="Recent Placements" th={th}>
          {recent_offers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recent_offers.map((o, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: i < recent_offers.length - 1 ? `1px solid ${th.border}` : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: th.textPrimary }}>{o.name}</div>
                    <div style={{ fontSize: 12, color: th.textSecondary, marginTop: 2 }}>{o.company_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Pkg value={o.package} />
                    <div style={{ fontSize: 11, color: th.textMuted, marginTop: 4 }}>
                      {o.accepted_date ? new Date(o.accepted_date).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: th.textMuted, fontSize: 13.5, textAlign: 'center', padding: "40px 0" }}>No placements secured yet</div>
          )}
        </DashboardCard>

        <DashboardCard title="Recent Drives" th={th}>
          {recent_drives.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recent_drives.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: i < recent_drives.length - 1 ? `1px solid ${th.border}` : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: th.textPrimary }}>{d.company_name}</div>
                    <div style={{ fontSize: 12, color: th.textSecondary, marginTop: 2 }}>{d.drive_type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Pkg value={d.package} />
                    <div style={{ fontSize: 11, color: th.textMuted, marginTop: 4 }}>
                      {d.drive_date ? new Date(d.drive_date).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: th.textMuted, fontSize: 13.5, textAlign: 'center', padding: "40px 0" }}>No drives scheduled yet</div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}