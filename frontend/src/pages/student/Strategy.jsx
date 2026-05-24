/**
 * src/pages/student/Strategy.jsx
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Target, CheckCircle2, Flame, TrendingUp, Info } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { useStrategy, useApplyForDrive, useStudent } from "@/hooks/useQueries";
import { T, getTheme } from "@/tokens";

const priorityConfig = {
  "Apply first — high chance":  { label: "Apply First",  color: T.success, bg: T.successDim, border: T.successBorder, Icon: Flame },
  "Good target — apply early":  { label: "Good Match",   color: T.amber,   bg: T.amberDim,   border: T.amberBorder,   Icon: CheckCircle2 },
  "Low chance — keep as backup":{ label: "Backup",       color: T.info,    bg: T.infoDim,    border: T.infoBorder,    Icon: Info },
  "Stretch goal — apply last":  { label: "Stretch Goal", color: T.warning, bg: T.warningDim, border: T.warningBorder, Icon: TrendingUp },
};

function StrategyCard({ company, rank, th, onApply, appliedSet }) {
  const pCfg = priorityConfig[company.recommendation] || priorityConfig["Good target — apply early"];
  const hasApplied = appliedSet.has(company.company_name);

  return (
    <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 13, padding: "16px 18px", display: "flex", gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: rank <= 3 ? T.amberDim : th.surfaceUp, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontSerif, fontSize: 17, color: rank <= 3 ? T.amber : th.textMuted }}>{rank}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 600, color: th.textPrimary }}>{company.company_name}</span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: pCfg.bg, color: pCfg.color }}>{pCfg.label}</span>
          <span style={{ fontSize: 11, color: th.textMuted }}>{company.difficulty}</span>
        </div>
        <div style={{ fontSize: 13, color: th.textSecondary, marginBottom: 8 }}>{company.role} · ₹{company.package}L</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: th.surfaceUp }}><div style={{ height: "100%", width: `${company.match_score}%`, background: T.amber, borderRadius: 3 }} /></div>
          <span style={{ color: T.amber, fontWeight: 600 }}>{company.match_score}% Match</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={() => onApply(company.drive_id, company.company_name)}
          disabled={hasApplied}
          style={{ padding: "8px 16px", background: hasApplied ? th.surfaceUp : T.amber, color: hasApplied ? th.textMuted : "#1C1917", border: "none", borderRadius: 8, fontWeight: "bold", cursor: hasApplied ? "not-allowed" : "pointer", transition: "background 0.2s" }}
        >
          {hasApplied ? "Applied" : "Apply"}
        </button>
      </div>
    </div>
  );
}

export default function Strategy({ dark = true }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  const studentId = user?.student_id;
  
  const { data: student, isLoading: isStudentLoading } = useStudent(studentId);
  const { data: apiResponse, isLoading: isStrategyLoading } = useStrategy(studentId);
  const { mutate: apply } = useApplyForDrive();
  
  const [appliedSet, setApplied] = useState(new Set());

  const isLoading = isStudentLoading || (isStrategyLoading && !student?.placement_status);

  if (isLoading) return <div style={{ padding: 32, color: th.textPrimary, fontFamily: T.font }}>Loading your custom strategy...</div>;

  const isPlaced = student?.placement_status === "Placed" || student?.placement_status === "Dream Placed";

  if (isPlaced) {
    return (
      <div style={{ padding: 32, fontFamily: T.font }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", color: th.textPrimary, marginBottom: 8 }}>Placement Strategy</h1>
        <p style={{ color: th.textSecondary, marginBottom: 32 }}>Custom career matching metrics.</p>
        <div style={{ background: th.surface, borderLeft: `4px solid ${T.success}`, borderRadius: "0 12px 12px 0", padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          <h2 style={{ fontSize: 20, color: T.success, fontWeight: "bold", marginBottom: 12 }}>🎉 Custom Strategy Completed</h2>
          <p style={{ color: th.textPrimary, lineHeight: 1.6, marginBottom: 16 }}>
            Excellent news! You have already finalized your placement offer and your status is locked as <strong>{student?.placement_status}</strong>.
          </p>
          <p style={{ color: th.textSecondary, fontSize: 14, marginBottom: 24 }}>
            Because you are successfully placed, a base placement strategy is no longer required. You can now aim higher!
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/student/dream" style={{ background: T.amber, color: "#1C1917", textDecoration: "none", padding: "10px 20px", borderRadius: 8, fontWeight: "bold", fontSize: 14 }}>
              Go to Dream Portal →
            </Link>
            <Link to="/student/offers" style={{ background: th.surfaceUp, color: th.textPrimary, border: `1px solid ${th.border}`, textDecoration: "none", padding: "10px 20px", borderRadius: 8, fontWeight: "bold", fontSize: 14 }}>
              View My Offers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const strategyData = apiResponse?.strategy || [];
  const STUDENT_CGPA = apiResponse?.student_cgpa || 0;

  const handleApply = (driveId, companyName) => {
    // FIX: Removed student_id to prevent identity spoofing. JWT handles this.
    apply({ drive_id: driveId }, {
      onSuccess: () => setApplied(prev => new Set([...prev, companyName]))
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: T.font }}>
      <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "20px 24px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, color: th.textPrimary, margin: "0 0 6px 0" }}>Placement Strategy</h2>
          <p style={{ fontSize: 13.5, color: th.textSecondary, margin: 0 }}>{strategyData.length} companies ranked by your specific CGPA and backlog metrics.</p>
        </div>
        <div style={{ textAlign: "center", padding: "10px 16px", background: T.amberDim, borderRadius: 12 }}>
          <div style={{ fontSize: 10.5, color: T.amber, fontWeight: 600, textTransform: "uppercase" }}>Your CGPA</div>
          <div style={{ fontFamily: T.fontSerif, fontSize: 28, color: T.amber }}>{STUDENT_CGPA}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {strategyData.map((company, idx) => (
          <StrategyCard 
            key={idx} 
            company={company} 
            rank={idx + 1} 
            th={th} 
            onApply={handleApply} 
            appliedSet={appliedSet} 
          />
        ))}
      </div>
    </div>
  );
}