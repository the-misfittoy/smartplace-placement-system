/**
 * src/pages/student/Profile.jsx
 * Comprehensive profile workspace mapping active student credentials,
 * resume upload controls, and chronological job application records.
 */
import { useState, useMemo } from "react";
import { User, Mail, Phone, BookOpen, Calendar, Award, Building2, CheckCircle2, Clock, XCircle, Edit, Loader2 } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { useStudent, useApplications, useUpdateStudentProfile, useDreamApplications } from "@/hooks/useQueries";
import { StatusBadge } from "@/components/ui/StatusBadge";
import ResumeUploadCard from "@/components/student/ResumeUploadCard";
import { T, getTheme } from "@/tokens";

function InfoRow({ icon: Icon, label, value, th }) {
  const isUrl = typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${th.border}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: th.surfaceUp, display: "flex", alignItems: "center", justifyContent: "center", color: th.textMuted }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: th.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: th.textPrimary, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {isUrl ? (
            <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: T.amber, textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
              {value}
            </a>
          ) : (
            value || "-"
          )}
        </div>
      </div>
    </div>
  );
}

export default function Profile({ dark = true }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  
  const { data: student, isLoading: studentLoading } = useStudent(user?.student_id);
  const { data: apps = [], isLoading: appsLoading } = useApplications();
  const { data: dreamApps = [], isLoading: dreamLoading } = useDreamApplications(user?.student_id);
  const updateMutation = useUpdateStudentProfile();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", linkedin_url: "", github_url: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenEdit = () => {
    setFormData({
      name: student?.name || "",
      phone: student?.phone || "",
      linkedin_url: student?.linkedin_url || "",
      github_url: student?.github_url || ""
    });
    setErrorMsg("");
    setIsEditOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg("");
    updateMutation.mutate({
      id: user?.student_id,
      ...formData
    }, {
      onSuccess: () => {
        setIsEditOpen(false);
      },
      onError: (err) => {
        setErrorMsg(err.response?.data?.detail || "Failed to update profile. Please try again.");
      }
    });
  };

  // Merge regular and dream applications chronologically
  const allApplications = useMemo(() => {
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
      applied_at: a.applied_at,
      drive_date: a.applied_at,
      isDream: true
    }));
    
    return [...dream, ...regular].sort((a, b) => 
      new Date(b.applied_at || b.drive_date) - new Date(a.applied_at || a.drive_date)
    );
  }, [apps, dreamApps]);

  const isLoading = studentLoading || appsLoading || dreamLoading;

  if (isLoading) return <div style={{ color: th.textPrimary, padding: 32, fontFamily: T.font }}>Loading profile...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: T.font, maxWidth: 1200 }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: 32, color: th.textPrimary, margin: "0 0 4px" }}>
            Student Profile
          </h2>
          <p style={{ fontSize: 14, color: th.textSecondary, margin: 0 }}>Manage your personal details and resume.</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button 
            onClick={handleOpenEdit}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 8,
              background: T.amber, color: "#1C1917",
              border: "none", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "opacity 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            <Edit size={14} /> Edit Profile
          </button>
          <div style={{ padding: "6px 14px", borderRadius: 20, background: student?.placement_status === "Placed" || student?.placement_status === "Dream Placed" ? T.successDim : th.surfaceUp, color: student?.placement_status === "Placed" || student?.placement_status === "Dream Placed" ? T.success : th.textPrimary, fontSize: 13, fontWeight: 600 }}>
            {student?.placement_status || "Not Placed"}
          </div>
        </div>
      </div>
 
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        
        {/* Academic & Personal Details */}
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "24px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontFamily: T.fontSerif, fontSize: 20, color: th.textPrimary, marginBottom: 16 }}>Academic Details</h3>
          
          <InfoRow icon={User}      label="Full Name"   value={student?.name} th={th} />
          <InfoRow icon={Mail}      label="Email"       value={student?.email} th={th} />
          <InfoRow icon={Phone}     label="Phone"       value={student?.phone} th={th} />
          <InfoRow icon={BookOpen}  label="Branch"      value={`${student?.branch} (${student?.degree_type})`} th={th} />
          <InfoRow icon={Calendar}  label="Graduation"  value={student?.graduation_year} th={th} />
          <InfoRow icon={Award}     label="CGPA"        value={student?.cgpa ? `${student.cgpa} / 10.0` : "-"} th={th} />
          <InfoRow icon={Award}     label="Backlogs"    value={student?.active_backlogs !== undefined ? `${student.active_backlogs} Active` : "-"} th={th} />
          <InfoRow icon={Building2} label="LinkedIn"    value={student?.linkedin_url} th={th} />
          <InfoRow icon={User}      label="GitHub"      value={student?.github_url} th={th} />
        </div>
 
        {/* Right Column: Resume & Application History */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          <ResumeUploadCard dark={dark} />
 
          <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "24px", flex: 1 }}>
            <h3 style={{ fontFamily: T.fontSerif, fontSize: 20, color: th.textPrimary, marginBottom: 16 }}>Recent Applications</h3>
            
            {allApplications.length === 0 ? (
               <div style={{ color: th.textMuted, fontSize: 14, fontStyle: "italic" }}>No applications submitted yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {allApplications.slice(0, 5).map(app => (
                  <div key={app.application_id} style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${th.border}`, paddingBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: th.textPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                        {app.company_name}
                        {app.isDream && (
                          <span style={{ fontSize: 9, background: "rgba(168,85,247,0.15)", color: "#A855F7", fontWeight: 700, padding: "1px 4px", borderRadius: 3 }}>
                            DREAM
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: th.textSecondary }}>{new Date(app.applied_at || app.drive_date).toLocaleDateString()}</div>
                    </div>
                    <StatusBadge status={app.normalizedStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
 
        </div>
      </div>
 
      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: th.surface, border: `1px solid ${th.border}`,
            borderRadius: 14, padding: 32, width: "90%", maxWidth: 500,
            display: "flex", flexDirection: "column", gap: 20,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            animation: "modalFadeIn 0.2s ease-out",
            boxSizing: "border-box"
          }}>
            <h3 style={{ fontFamily: T.fontSerif, fontSize: 24, color: th.textPrimary, margin: 0 }}>Edit Profile</h3>
            
            {errorMsg && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, background: T.dangerDim,
                color: T.danger, border: `1px solid ${T.dangerBorder}`, fontSize: 13
              }}>
                {errorMsg}
              </div>
            )}
 
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: th.textSecondary, marginBottom: 6 }}>Full Name</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: th.inputBg, border: `1.5px solid ${th.borderUp}`,
                    borderRadius: 8, color: th.textPrimary, fontSize: 14,
                    outline: "none", boxSizing: "border-box"
                  }}
                  onFocus={e => e.target.style.borderColor = T.amber}
                  onBlur={e => e.target.style.borderColor = th.borderUp}
                />
              </div>
 
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: th.textSecondary, marginBottom: 6 }}>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: th.inputBg, border: `1.5px solid ${th.borderUp}`,
                    borderRadius: 8, color: th.textPrimary, fontSize: 14,
                    outline: "none", boxSizing: "border-box"
                  }}
                  onFocus={e => e.target.style.borderColor = T.amber}
                  onBlur={e => e.target.style.borderColor = th.borderUp}
                />
              </div>
 
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: th.textSecondary, marginBottom: 6 }}>LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: th.inputBg, border: `1.5px solid ${th.borderUp}`,
                    borderRadius: 8, color: th.textPrimary, fontSize: 14,
                    outline: "none", boxSizing: "border-box"
                  }}
                  onFocus={e => e.target.style.borderColor = T.amber}
                  onBlur={e => e.target.style.borderColor = th.borderUp}
                />
              </div>
 
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: th.textSecondary, marginBottom: 6 }}>GitHub URL</label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                  placeholder="https://github.com/username"
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: th.inputBg, border: `1.5px solid ${th.borderUp}`,
                    borderRadius: 8, color: th.textPrimary, fontSize: 14,
                    outline: "none", boxSizing: "border-box"
                  }}
                  onFocus={e => e.target.style.borderColor = T.amber}
                  onBlur={e => e.target.style.borderColor = th.borderUp}
                />
              </div>
 
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button
                  type="button" onClick={() => setIsEditOpen(false)}
                  style={{
                    flex: 1, padding: "12px", background: "none",
                    border: `1px solid ${th.border}`, color: th.textSecondary,
                    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={updateMutation.isPending}
                  style={{
                    flex: 1, padding: "12px", background: T.amber,
                    color: "#1C1917", border: "none", borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                >
                  {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
    </div>
  );
}