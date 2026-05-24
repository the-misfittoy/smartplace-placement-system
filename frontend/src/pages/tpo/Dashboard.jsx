/**
 * src/pages/tpo/Dashboard.jsx
 */
import { useMemo } from "react";
import { useStudents, useOffers, useDrives } from "@/hooks/useQueries";
import { T, getTheme } from "@/tokens";

export default function TPODashboard({ dark = true }) {
  const th = getTheme(dark);
  
  const { data: students = [], isLoading: isLoadingStudents } = useStudents();
  const { data: offers = [], isLoading: isLoadingOffers } = useOffers();
  const { data: drives = [], isLoading: isLoadingDrives } = useDrives();

  const { statsArray, acceptedOffers } = useMemo(() => {
    const totalStudents = students.length;
    const placedStudents = students.filter(s => s.placement_status === "Placed" || s.placement_status === "Dream Placed").length;
    const placementRate = totalStudents ? Math.round((placedStudents / totalStudents) * 100) : 0;

    // FIX: Normalized status checking to handle case inconsistencies
    const accepted = offers.filter(o => o.status?.toLowerCase() === "accepted");
    const highestPackage = accepted.length 
      ? Math.max(...accepted.map(o => parseFloat(o.package) || 0)) 
      : 0;
      
    const avgPackage = accepted.length 
      ? (accepted.reduce((sum, o) => sum + (parseFloat(o.package) || 0), 0) / accepted.length).toFixed(2)
      : 0;

    const statsArray = [
      { title: "Placement Rate", value: `${placementRate}%`, subtext: `${placedStudents} / ${totalStudents} Placed`, color: T.amber },
      { title: "Offers Accepted", value: accepted.length, subtext: "Across all branches", color: T.success },
      { title: "Highest Package", value: `₹${highestPackage}L`, subtext: "Current Academic Year", color: T.info },
      { title: "Average Package", value: `₹${avgPackage}L`, subtext: "LPA Average", color: th.textPrimary }
    ];

    return { statsArray, acceptedOffers: accepted };
  }, [students, offers, th]);

  const activeDrives = useMemo(() => {
    return drives.filter(d => (d.status || "").toLowerCase() !== "completed").slice(0, 4);
  }, [drives]);

  const isLoading = isLoadingStudents || isLoadingOffers || isLoadingDrives;

  if (isLoading) return <div style={{ padding: 32, color: th.textMuted, fontFamily: T.font }}>Calculating institutional analytics...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 32, fontFamily: T.font, maxWidth: 1200 }}>
      <div>
        <h1 style={{ fontFamily: T.fontSerif, fontSize: 32, fontWeight: "bold", color: th.textPrimary, marginBottom: 4 }}>
          TPO Overview ✦
        </h1>
        <p style={{ color: th.textSecondary, margin: 0 }}>Real-time placement statistics and drive activity.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
        {statsArray.map((stat, i) => (
          <div key={i} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: 24, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <h3 style={{ color: th.textMuted, fontSize: 13, fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.title}</h3>
            <p style={{ fontSize: 36, fontWeight: 900, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
            <p style={{ color: th.textSecondary, fontSize: 12, marginTop: 12, margin: "12px 0 0 0" }}>{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32 }}>
        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: "bold", color: th.textPrimary, marginBottom: 16 }}>Latest Accepted Offers</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {acceptedOffers.slice(0, 5).map((offer, idx) => (
              <div key={offer.offer_id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: th.surfaceUp, borderRadius: 12 }}>
                <div>
                  <p style={{ fontWeight: 600, color: th.textPrimary, margin: "0 0 2px 0" }}>{offer.student_name}</p>
                  <p style={{ fontSize: 12, color: th.textSecondary, margin: 0 }}>{offer.company_name} • {offer.role}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: "bold", color: T.success, margin: 0 }}>₹{offer.package} LPA</p>
                </div>
              </div>
            ))}
            {acceptedOffers.length === 0 && <p style={{ fontSize: 14, color: th.textMuted, textAlign: "center", padding: "16px 0", margin: 0 }}>No accepted offers recorded yet.</p>}
          </div>
        </div>

        <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: "bold", color: th.textPrimary, marginBottom: 16 }}>Upcoming & Active Drives</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeDrives.map((drive, idx) => (
              <div key={drive.drive_id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, border: `1px solid ${th.border}`, borderRadius: 12, transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = T.amberBorder} onMouseLeave={e => e.currentTarget.style.borderColor = th.border}>
                <div>
                  <p style={{ fontWeight: 600, color: th.textPrimary, margin: "0 0 2px 0" }}>{drive.company_name}</p>
                  <p style={{ fontSize: 12, color: th.textSecondary, margin: 0 }}>{drive.role} • {new Date(drive.drive_date).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ padding: "4px 8px", background: T.amberDim, color: T.amber, fontSize: 12, fontWeight: "bold", borderRadius: 6 }}>
                    {drive.status || "Upcoming"}
                  </span>
                </div>
              </div>
            ))}
            {activeDrives.length === 0 && <p style={{ fontSize: 14, color: th.textMuted, textAlign: "center", padding: "16px 0", margin: 0 }}>No active drives at the moment.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}