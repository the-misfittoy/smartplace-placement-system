/**
 * src/pages/student/Dashboard.jsx
 * Unified student placement overview displaying regular applications, 
 * dream opportunities, and eligible upcoming drives.
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { useStudent, useApplications, useDrives, useDreamEligibleDrives, useDreamApplications } from "@/hooks/useQueries";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { T, getTheme } from "@/tokens";

export default function StudentDashboard({ dark = true }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  
  const { data: profile, isLoading: isLoadingProfile } = useStudent(user?.student_id);
  const { data: applications = [], isLoading: isLoadingApps } = useApplications();
  const { data: drives = [], isLoading: isLoadingDrives } = useDrives();
  
  const isPlaced = profile?.placement_status === "Placed";
  const { data: dreamData, isLoading: isLoadingDreamDrives } = useDreamEligibleDrives(user?.student_id, isPlaced);
  const { data: dreamApps = [], isLoading: isLoadingDreamApps } = useDreamApplications(user?.student_id);

  // Unified Application List: Regular + Dream Applications merged
  const allApplications = useMemo(() => {
    const regular = applications.map(a => ({ 
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
  }, [applications, dreamApps]);

  const stats = useMemo(() => {
    const totalApplied = allApplications.length;
    const selected = allApplications.filter(a => 
      ["selected", "dream placed", "selected"].includes(a.normalizedStatus?.toLowerCase())
    ).length;
    const pending = allApplications.filter(a => 
      ["pending", "shortlisted", "applied"].includes(a.normalizedStatus?.toLowerCase())
    ).length;
    const rejected = allApplications.filter(a => 
      a.normalizedStatus?.toLowerCase() === "rejected"
    ).length;
    
    return [
      { label: "Total Applied", value: totalApplied, color: th.textPrimary },
      { label: "Selected",      value: selected,     color: T.success },
      { label: "Pending",       value: pending,      color: T.amber },
      { label: "Rejected",      value: rejected,     color: T.danger }
    ];
  }, [allApplications, th]);

  // Unified Eligible Drives list: Show Dream drives for placed students, regular drives for unplaced students
  const eligibleUpcomingDrives = useMemo(() => {
    if (!profile) return [];
    
    if (isPlaced) {
      const rawDream = dreamData?.dream_eligible_drives || [];
      return rawDream.map(d => ({
        drive_id: d.drive_id,
        company_name: d.company_name,
        role: d.role,
        package: d.package,
        drive_date: d.drive_date,
        multiplier: d.multiplier,
        isDream: true
      }));
    }
    
    return drives
      .filter(d => d.status !== "Completed" && new Date(d.drive_date) >= new Date())
      .filter(d => (profile.cgpa || 0) >= (d.min_cgpa || 0))
      .filter(d => (profile.active_backlogs || 0) <= (d.max_backlogs || 0))
      .map(d => ({ ...d, isDream: false }));
  }, [drives, profile, isPlaced, dreamData]);

  const isLoading = isLoadingProfile || isLoadingApps || isLoadingDrives || isLoadingDreamDrives || isLoadingDreamApps;

  if (isLoading) return <div style={{ color: th.textPrimary, padding: 32, fontFamily: T.font }}>Loading your dashboard...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: T.font, maxWidth: 1200 }}>
      <div>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: "clamp(24px, 3vw, 32px)", color: th.textPrimary, margin: "0 0 8px" }}>
          Welcome back, {profile?.name?.split(" ")[0] || user?.username} ✦
        </h2>
        <p style={{ fontSize: 14, color: th.textSecondary, margin: 0 }}>Here is your live placement overview.</p>
      </div>

      {/* Statistics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 11, color: th.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 36, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        
        {/* Applications list */}
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: T.fontSerif, fontSize: 20, color: th.textPrimary, margin: 0 }}>Recent Applications</h3>
            <Link to="/student/apps" style={{ fontSize: 13, color: T.amber, fontWeight: 600, textDecoration: "none" }}>View All →</Link>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {allApplications.slice(0, 5).map(app => (
              <div key={app.application_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${th.border}` }}>
                <div>
                  <p style={{ fontWeight: 600, color: th.textPrimary, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
                    {app.company_name}
                    {app.isDream && (
                      <span style={{ fontSize: 9, background: "rgba(168,85,247,0.15)", color: "#A855F7", fontWeight: 700, padding: "1px 4px", borderRadius: 3 }}>
                        DREAM
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: 12, color: th.textSecondary, margin: 0 }}>
                    {app.role} · {new Date(app.applied_at || app.drive_date).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={app.normalizedStatus} />
              </div>
            ))}
            {allApplications.length === 0 && <p style={{ fontSize: 14, color: th.textMuted, fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>No applications yet.</p>}
          </div>
        </div>

        {/* Dynamic Drive recommendations */}
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: T.fontSerif, fontSize: 20, color: th.textPrimary, margin: 0 }}>
              {isPlaced ? "Upcoming Dream Drives" : "Upcoming Eligible Drives"}
            </h3>
            <Link to={isPlaced ? "/student/dream" : "/student/drives"} style={{ fontSize: 13, color: T.amber, fontWeight: 600, textDecoration: "none" }}>
              {isPlaced ? "Browse Dream →" : "Browse All →"}
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {eligibleUpcomingDrives.slice(0, 3).map(drive => (
              <div 
                key={drive.drive_id} 
                style={{ 
                  padding: 16, 
                  border: `1.5px solid ${drive.isDream ? 'rgba(168,85,247,0.3)' : th.border}`, 
                  borderRadius: 12, 
                  background: th.surfaceUp, 
                  position: "relative",
                  transition: "border-color 0.2s" 
                }} 
                onMouseEnter={e => e.currentTarget.style.borderColor = drive.isDream ? 'rgba(168,85,247,0.6)' : T.amberBorder} 
                onMouseLeave={e => e.currentTarget.style.borderColor = drive.isDream ? 'rgba(168,85,247,0.3)' : th.border}
              >
                {drive.isDream && (
                  <span style={{ 
                    position: "absolute", 
                    top: 12, 
                    right: 12, 
                    background: "rgba(168,85,247,0.15)", 
                    color: "#A855F7", 
                    fontSize: 9, 
                    fontWeight: 700, 
                    padding: "2px 6px", 
                    borderRadius: 4, 
                    letterSpacing: "0.05em" 
                  }}>
                    ✨ DREAM ELIGIBLE
                  </span>
                )}
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <p style={{ fontWeight: 600, color: th.textPrimary, margin: 0, paddingRight: drive.isDream ? 85 : 0 }}>
                    {drive.company_name}
                  </p>
                  {!drive.isDream && <p style={{ fontWeight: 600, color: T.success, margin: 0, fontSize: 14 }}>₹{drive.package} LPA</p>}
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ fontSize: 12, color: th.textSecondary, margin: 0 }}>Role: {drive.role}</p>
                    {drive.isDream && (
                      <p style={{ fontSize: 12, color: T.success, margin: "4px 0 0", fontWeight: 600 }}>
                        ₹{drive.package} LPA ({drive.multiplier}x package)
                      </p>
                    )}
                  </div>
                  <Link 
                    to={drive.isDream ? "/student/dream" : "/student/drives"} 
                    style={{ 
                      fontSize: 12, 
                      background: drive.isDream ? "#A855F7" : T.amber, 
                      color: drive.isDream ? "#FFFFFF" : "#1C1917", 
                      fontWeight: 600, 
                      padding: "6px 14px", 
                      borderRadius: 6, 
                      textDecoration: "none" 
                    }}
                  >
                    {drive.isDream ? "Apply Dream" : "Apply"}
                  </Link>
                </div>
              </div>
            ))}
            {eligibleUpcomingDrives.length === 0 && (
              <p style={{ fontSize: 14, color: th.textMuted, textAlign: "center", padding: "30px 0" }}>
                {isPlaced 
                  ? "No upcoming drives qualify as dream companies currently." 
                  : "No upcoming drives match your eligibility currently."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}