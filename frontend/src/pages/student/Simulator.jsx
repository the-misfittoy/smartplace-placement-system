/**
 * src/pages/student/Simulator.jsx
 */
import { useState, useEffect } from "react";
import { SlidersHorizontal, Unlock, Lock, TrendingUp, ArrowRight } from "lucide-react";
import { useStudent, useSimulator } from "@/hooks/useQueries";
import useAuthStore from "@/store/authStore";
import { T, getTheme } from "@/tokens";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

function CompanyRow({ company, unlocked, th }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
      background: unlocked ? T.successDim : th.surfaceUp,
      border: `1px solid ${unlocked ? T.successBorder : th.border}`,
      borderRadius:10, transition:"background 0.3s",
    }}>
      <div style={{ color: unlocked ? T.success : th.textMuted, flexShrink:0 }}>
        {unlocked ? <Unlock size={14}/> : <Lock size={14}/>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13.5, fontWeight:500, color: unlocked ? th.textPrimary : th.textSecondary }}>
          {company.company_name}
        </div>
        <div style={{ fontSize:12, color:th.textMuted }}>{company.role}</div>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color: unlocked ? T.success : th.textSecondary }}>
        ₹{company.package}L
      </div>
      <div style={{ fontSize:11, color:th.textMuted, minWidth:50, textAlign:"right" }}>
        ≥ {company.min_cgpa}
      </div>
    </div>
  );
}

// FIX: Removed dangerous hardcoded default student ID
export default function Simulator({ dark = true }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  const studentId = user?.student_id;

  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  const studentCgpa = student?.cgpa ?? null;

  const [targetCgpa, setTargetCgpa] = useState(null);
  useEffect(() => {
    if (studentCgpa !== null && targetCgpa === null) setTargetCgpa(studentCgpa);
  }, [studentCgpa]);

  const debouncedTarget = useDebounce(targetCgpa, 400);
  const { data: simData, isLoading: simLoading, isFetching: simFetching } = useSimulator(studentId, debouncedTarget, studentCgpa);

  if (studentLoading || targetCgpa === null) return <div style={{ color: th.textPrimary, padding: 32, fontFamily: T.font }}>Loading simulator...</div>;

  const currentCount  = simData?.current_eligible_companies ?? 0;
  const targetCount   = simData?.target_eligible_companies ?? currentCount;
  const newlyUnlocked = simData?.unlocked_companies ?? [];   
  const delta         = targetCount - currentCount;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, fontFamily:T.font }}>
      <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:14, padding:"20px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <SlidersHorizontal size={17} color={T.amber}/>
          <h2 style={{ fontFamily:T.fontSerif, fontSize:22, color:th.textPrimary, margin:0, letterSpacing:"-0.02em" }}>CGPA Simulator</h2>
        </div>
        <p style={{ fontSize:13.5, color:th.textSecondary, margin:0 }}>Drag the slider to see how improving your CGPA expands your opportunities.</p>
      </div>

      <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:14, padding:"24px 28px" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:11, color:th.textMuted, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>Current CGPA (fixed)</div>
            <div style={{ fontFamily:T.fontSerif, fontSize:52, color:T.amber, lineHeight:1 }}>{studentCgpa.toFixed(1)}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, color:th.textMuted }}><ArrowRight size={24}/></div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:th.textMuted, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>Target CGPA {simFetching && "..."}</div>
            <div style={{ fontFamily:T.fontSerif, fontSize:52, color: targetCgpa > studentCgpa ? T.success : th.textMuted, lineHeight:1 }}>
              {targetCgpa.toFixed(1)}
            </div>
          </div>
        </div>

        <div style={{ position:"relative", marginBottom:8 }}>
          <input type="range" min={studentCgpa} max={10} step={0.1} value={targetCgpa} onChange={e => setTargetCgpa(parseFloat(e.target.value))} style={{ width: "100%", accentColor: T.amber }} />
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:14 }}>
        {[
          { label:"Currently Eligible", value:currentCount, color:th.textPrimary },
          { label:"After Improvement", value: simLoading ? "…" : targetCount, color: targetCount > currentCount ? T.success : th.textMuted },
          { label:"Newly Unlocked", value: simLoading ? "…" : delta > 0 ? `+${delta}` : "0", color: delta > 0 ? T.success : th.textMuted },
        ].map((s, i) => (
          <div key={i} style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:13, padding:"17px 20px" }}>
            <div style={{ fontSize:11, color:th.textMuted, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontFamily:T.fontSerif, fontSize:40, color:s.color, lineHeight:1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {newlyUnlocked.length > 0 && (
        <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:14, padding:"20px 22px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, fontFamily:T.fontSerif, fontSize:17, color:th.textPrimary }}>
            <TrendingUp size={16} color={T.success}/> Newly Unlocked at CGPA {targetCgpa.toFixed(1)}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {newlyUnlocked.map((c, idx) => <CompanyRow key={idx} company={c} unlocked th={th}/>)}
          </div>
        </div>
      )}
    </div>
  );
}