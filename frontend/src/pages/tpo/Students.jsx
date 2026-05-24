/**
 * src/pages/tpo/Students.jsx
 */
import { useMemo, useState } from "react";
import { Trash2, Sparkles, X, Activity } from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { T, getTheme } from "@/tokens";
import { useTpoRisk, useDeleteStudent, useGenerateCoachingStrategy } from "@/hooks/useQueries";

export default function Students({ dark = true }) {
  const th = getTheme(dark);
  
  const { data: riskData, isLoading, isError, refetch } = useTpoRisk();
  const students = useMemo(() => riskData?.students || [], [riskData]);
  const metrics = useMemo(() => riskData?.metrics || { high: 0, medium: 0, low: 0, total: 0 }, [riskData]);

  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();
  const { mutate: generateCoaching, isPending: generatingCoaching } = useGenerateCoachingStrategy();

  const [activeStudent, setActiveStudent] = useState(null);
  const [strategyContent, setStrategyContent] = useState("");

  // Dynamic filter generation for branches
  const branchOptions = useMemo(() => {
    const branches = [...new Set(students.map(s => s.branch).filter(Boolean))];
    return branches.map(b => ({ value: b, label: b }));
  }, [students]);

  const cols = [
    {
      key: "name", label: "Student Details", sortable: true,
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 500, color: th.textPrimary }}>{v || "Unknown"}</div>
          <div style={{ fontSize: 11.5, color: th.textMuted }}>{r.email}</div>
        </div>
      ),
    },
    { key: "branch", label: "Branch", sortable: true, render: v => <span style={{ color: th.textSecondary }}>{v || "-"}</span> },
    { key: "cgpa", label: "CGPA", sortable: true, render: v => <strong style={{ color: v >= 8 ? T.success : T.amber }}>{v ? parseFloat(v).toFixed(2) : "-"}</strong> },
    { key: "placement_status", label: "Status", sortable: true, render: v => <StatusBadge status={v || "Not Placed"} /> },
    {
      key: "risk_score", label: "Placement Risk", sortable: true,
      render: v => {
        const bg = v === "High" ? T.dangerDim : v === "Medium" ? T.amberDim : T.successDim;
        const color = v === "High" ? T.danger : v === "Medium" ? T.amber : T.success;
        return (
          <span style={{ padding: "4px 10px", background: bg, color: color, fontSize: 11.5, fontWeight: "bold", borderRadius: 6 }}>
            {v || "Low"}
          </span>
        );
      }
    }
  ];

  const actions = [
    {
      label: "AI Coach", bg: T.amberDim, color: T.amber, icon: Sparkles,
      show: () => true,
      onClick: r => {
        setActiveStudent(r);
        setStrategyContent("");
        generateCoaching(r.student_id, {
          onSuccess: (data) => {
            setStrategyContent(data.strategy);
          }
        });
      }
    },
    {
      label: "Remove", bg: T.dangerDim, color: T.danger, icon: Trash2,
      show: () => true,
      onClick: r => {
        if (isDeleting) return;
        const confirmText = prompt(`WARNING: Type DELETE to permanently remove ${r.name}`);
        if (confirmText === "DELETE") {
          deleteStudent(r.student_id, {
            onSuccess: () => refetch()
          });
        } else if (confirmText !== null) {
          alert("Deletion cancelled: You must type DELETE exactly as shown.");
        }
      },
    }
  ];

  if (isLoading) return <div style={{ color: th.textPrimary, padding: 32, fontFamily: T.font }}>Loading student predictive analytics directory...</div>;
  if (isError) return <div style={{ color: T.danger, padding: 32, fontFamily: T.font }}>Failed to load student risk scores.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: T.font, position: "relative" }}>
      
      {/* Risk Metrics Highlight Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, color: th.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>High Placement Risk</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: T.danger }}>{metrics.high}</span>
            <span style={{ fontSize: 13, color: th.textSecondary }}>students</span>
          </div>
        </div>
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, color: th.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Medium Risk</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: T.amber }}>{metrics.medium}</span>
            <span style={{ fontSize: 13, color: th.textSecondary }}>students</span>
          </div>
        </div>
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, color: th.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Low Risk / Placed</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: T.success }}>{metrics.low}</span>
            <span style={{ fontSize: 13, color: th.textSecondary }}>students</span>
          </div>
        </div>
      </div>

      <DataTable
        title="Predictive Analytics & Student Directory"
        columns={cols}
        data={students}
        actions={actions}
        searchKeys={["name", "email", "branch"]}
        filters={[
          { key: "branch", label: "Branch", options: branchOptions },
          { key: "risk_score", label: "Placement Risk", options: [{ value: "High", label: "High" }, { value: "Medium", label: "Medium" }, { value: "Low", label: "Low" }] },
          { key: "placement_status", label: "Status", options: [{ value: "Placed", label: "Placed" }, { value: "Not Placed", label: "Not Placed" }, { value: "Dream Placed", label: "Dream Placed" }] }
        ]}
        dark={dark}
        pageSize={10}
      />

      {/* Modern Glassmorphic AI Coaching Strategy Modal */}
      {activeStudent && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(12, 10, 9, 0.6)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{
            background: th.surface, border: `1px solid ${th.border}`,
            borderRadius: 20, width: "100%", maxWidth: 640,
            overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            display: "flex", flexDirection: "column",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px", borderBottom: `1px solid ${th.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: th.surfaceUp
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, background: T.amberDim,
                  border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Sparkles size={16} color={T.amber} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: th.textPrimary, margin: 0 }}>AI Career Strategy Coach</h3>
                  <p style={{ fontSize: 12, color: th.textMuted, margin: 0 }}>Tailormade analysis for {activeStudent.name}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveStudent(null)}
                style={{ background: "none", border: "none", color: th.textMuted, cursor: "pointer", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 24, overflowY: "auto", maxHeight: "calc(80vh - 100px)", display: "flex", flexDirection: "column", gap: 16 }}>
              {generatingCoaching ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: `3px solid ${th.borderUp}`, borderTopColor: T.amber,
                    animation: "spin 0.8s linear infinite"
                  }} />
                  <p style={{ fontSize: 13.5, color: th.textSecondary, margin: 0 }}>Consulting Gemini Career Advisor...</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, lineHeight: 1.65, fontSize: 14, color: th.textSecondary }}>
                  {strategyContent.split("\n\n").map((para, i) => (
                    <p key={i} style={{ margin: 0 }}>{para}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 24px", borderTop: `1px solid ${th.border}`,
              display: "flex", justifyContent: "flex-end", background: th.surfaceUp
            }}>
              <button
                onClick={() => setActiveStudent(null)}
                style={{
                  padding: "8px 18px", borderRadius: 8, background: T.amber, color: T.amberText,
                  border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "opacity 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                Dismiss Coach
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(16px); } to { transform: translateY(0); } }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

    </div>
  );
}