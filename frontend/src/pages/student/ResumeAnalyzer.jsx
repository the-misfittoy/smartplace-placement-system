/**
 * src/pages/student/ResumeAnalyzer.jsx
 */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useCompanies } from "@/hooks/useQueries";
import { analyzeResume, forwardResumeToTPO } from "@/API/api";
import { T, getTheme } from "@/tokens";
import useNotificationStore from "@/store/notificationStore";

export default function ResumeAnalyzer({ dark = true }) {
  const th = getTheme(dark);
  const [resumeText, setResumeText] = useState("");
  const [companyId, setCompanyId] = useState("");
  
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompanies();
  const { mutate: getFeedback, data: feedback, isPending, isError } = useMutation({ 
    mutationFn: analyzeResume,
    onSuccess: () => {
      setForwarded(false);
      setForwarding(false);
    }
  });

  const addNotification = useNotificationStore(state => state.addNotification);
  const [forwarding, setForwarding] = useState(false);
  const [forwarded, setForwarded] = useState(false);

  const handleForwardToTPO = async () => {
    if (!feedback || forwarding || forwarded) return;
    setForwarding(true);
    try {
      await forwardResumeToTPO({
        company_name: feedback.target_company,
        role: feedback.target_role,
        ats_score: feedback.ats_score
      });
      setForwarded(true);
      addNotification({
        title: "Resume Shared with TPO 📢",
        message: `Your AI evaluation (${feedback.ats_score}/100) and resume for ${feedback.target_company} have been forwarded to TPO administration.`,
        type: "success",
        link: "/student/resume"
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to forward request.");
    } finally {
      setForwarding(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resumeText || !companyId) return;
    getFeedback({ resume_text: resumeText, company_id: Number(companyId) });
  };

  return (
    <div style={{ padding: 32, fontFamily: T.font, display: "flex", flexDirection: "column", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: "bold", color: th.textPrimary, margin: "0 0 8px 0" }}>AI Resume Analyzer</h1>
          <p style={{ color: th.textSecondary, margin: 0 }}>Target a specific company role and let Gemini AI evaluate your ATS match.</p>
        </div>
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, padding: "8px 16px", borderRadius: 8, fontSize: 14, color: th.textSecondary }}>
          Powered by <strong style={{ color: T.amber }}>Gemini 2.5 Flash</strong>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32 }}>
        
        {/* Left Form */}
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: "bold", color: th.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>Target Role</label>
              <select
                required value={companyId} onChange={(e) => setCompanyId(e.target.value)} disabled={isLoadingCompanies || isPending}
                style={{ width: "100%", padding: 12, background: th.inputBg, border: `1px solid ${th.borderUp}`, color: th.textPrimary, borderRadius: 8, outline: "none", fontFamily: T.font }}
              >
                <option value="" disabled>Select a company to target...</option>
                {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name} — {c.role}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: "bold", color: th.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>Resume Content</label>
              <textarea
                required rows="14" placeholder="Paste your plain text resume here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} disabled={isPending}
                style={{ width: "100%", flex: 1, padding: 16, background: th.inputBg, border: `1px solid ${th.borderUp}`, color: th.textPrimary, borderRadius: 8, outline: "none", resize: "none", fontFamily: T.fontMono, fontSize: 13 }}
              />
            </div>
            <button
              type="submit" disabled={isPending || !resumeText || !companyId}
              style={{ padding: "16px", background: isPending ? th.surfaceUp : T.amber, color: isPending ? th.textMuted : "#1C1917", border: "none", borderRadius: 8, fontWeight: "bold", fontSize: 16, cursor: isPending ? "not-allowed" : "pointer", transition: "background 0.2s" }}
            >
              {isPending ? "Analyzing with AI..." : "Scan Resume against Job"}
            </button>
            {isError && <p style={{ color: T.danger, textAlign: "center", fontSize: 14 }}>Failed to reach AI Engine. Try again.</p>}
          </form>
        </div>

        {/* Right Results */}
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {!feedback && !isPending && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 48, color: th.textMuted, textAlign: "center" }}>
              <span style={{ fontSize: 48, marginBottom: 16 }}>🤖</span>
              <h3 style={{ fontSize: 20, color: th.textPrimary, marginBottom: 8 }}>Awaiting Resume</h3>
              <p>Select a role and paste your resume to get an instant breakdown of your ATS match score.</p>
            </div>
          )}

          {isPending && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 48, color: th.textSecondary }}>
              <h3 style={{ fontSize: 20, color: T.amber, marginBottom: 8 }}>Parsing Unstructured Text...</h3>
              <p>Cross-referencing skills with target requirements.</p>
            </div>
          )}

          {feedback && !isPending && (
            <>
              <div style={{ padding: 32, borderBottom: `1px solid ${th.border}`, background: th.surfaceUp, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: "bold", color: th.textSecondary, textTransform: "uppercase", marginBottom: 4 }}>Overall Match</h2>
                  <p style={{ fontSize: 24, color: th.textPrimary, margin: "0 0 12px 0" }}><strong>{feedback.target_role}</strong> at {feedback.target_company}</p>
                  
                  {/* Forward to TPO Action Button */}
                  <button
                    onClick={handleForwardToTPO}
                    disabled={forwarding || forwarded}
                    style={{
                      background: forwarded ? "rgba(16,185,129,0.08)" : "rgba(79, 70, 229, 0.08)",
                      border: `1px solid ${forwarded ? "rgba(16,185,129,0.2)" : "rgba(79, 70, 229, 0.2)"}`,
                      color: forwarded ? T.success : "#818CF8",
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: forwarding || forwarded ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => { if(!forwarded && !forwarding) e.currentTarget.style.background = "rgba(79, 70, 229, 0.15)"; }}
                    onMouseLeave={e => { if(!forwarded && !forwarding) e.currentTarget.style.background = "rgba(79, 70, 229, 0.08)"; }}
                  >
                    {forwarded ? (
                      <>
                        <span>✓ Shared with TPO</span>
                      </>
                    ) : forwarding ? (
                      <span>Forwarding Request...</span>
                    ) : (
                      <>
                        <span>📢 Forward to TPO for Review</span>
                      </>
                    )}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span style={{ fontSize: 10, fontWeight: "bold", color: th.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>ATS Score</span>
                  <div style={{ fontSize: 48, fontWeight: "bold", color: feedback.ats_score >= 80 ? T.success : feedback.ats_score >= 50 ? T.amber : T.danger, lineHeight: 1 }}>
                    {feedback.ats_score}<span style={{ fontSize: 20, color: th.textMuted }}>/100</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: 32, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 32 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: "bold", color: th.textPrimary, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: T.success }}>✓</span> Matched Skills
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {feedback.matched_skills.map((s, i) => <span key={i} style={{ background: th.surfaceUp, border: `1px solid ${th.border}`, padding: "4px 12px", borderRadius: 16, fontSize: 13, color: th.textSecondary }}>{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: "bold", color: th.textPrimary, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: T.danger }}>✕</span> Missing Skills
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {feedback.missing_skills.map((s, i) => <span key={i} style={{ background: T.dangerDim, border: `1px solid ${T.dangerBorder}`, padding: "4px 12px", borderRadius: 16, fontSize: 13, color: T.danger }}>{s}</span>)}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${th.border}`, paddingTop: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: "bold", color: th.textPrimary, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: T.amber }}>💡</span> AI Recommendations
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {feedback.improvement_tips.map((tip, i) => (
                      <div key={i} style={{ background: th.surfaceUp, padding: 16, borderRadius: 12, fontSize: 14, color: th.textSecondary, lineHeight: 1.6 }}>
                        <strong style={{ color: th.textPrimary, marginRight: 8 }}>{i + 1}.</strong>{tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}