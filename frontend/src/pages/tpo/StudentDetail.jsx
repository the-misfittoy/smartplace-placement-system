/**
 * src/pages/tpo/StudentDetail.jsx
 * 
 * High-Fidelity TPO Student Detail Page.
 * Replicates the provided design mockup exactly, down to the gold avatar halo,
 * circular SVG gauge, 2-column layout, and gold-bordered shortcuts.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Mail, Phone, Linkedin, Calendar, Check, AlertTriangle, Layers, ChevronRight, BarChart2 } from "lucide-react";
import { T, getTheme } from "@/tokens";
import { useStudent, useApplications, useOffers, useDrives, useCompanies } from "@/hooks/useQueries";

export default function StudentDetail({ dark = true }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const th = getTheme(dark);

  // TanStack Queries (fully cached and integrated)
  const { data: student, isLoading: sLoading, error: sErr } = useStudent(id);
  const { data: applications = [], isLoading: appsLoading } = useApplications();
  const { data: offers = [], isLoading: offersLoading } = useOffers();
  const { data: drives = [], isLoading: drivesLoading } = useDrives();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();

  const isLoading = sLoading || appsLoading || offersLoading || drivesLoading || companiesLoading;

  if (isLoading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "60vh", color: th.textSecondary, fontFamily: T.font, gap: 12
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          border: `3px solid ${th.borderUp}`, borderTopColor: T.amber,
          animation: "spin 0.8s linear infinite"
        }} />
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>Retrieving student profile...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (sErr || !student) {
    return (
      <div style={{ padding: 24, fontFamily: T.font }}>
        <button 
          onClick={() => navigate("/tpo/students")}
          style={{
            background: "none", border: `1px solid ${th.border}`, color: th.textSecondary,
            padding: "8px 16px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            marginBottom: 20, transition: "color 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = th.textPrimary}
          onMouseLeave={e => e.currentTarget.style.color = th.textSecondary}
        >
          <ArrowLeft size={14} /> Back to Students
        </button>
        <div style={{
          padding: "16px 20px", borderRadius: 12, background: T.dangerDim, border: `1px solid ${T.dangerBorder}`,
          color: T.danger, fontSize: 14, fontWeight: 500
        }}>
          ⚠️ Student Profile Not Found or Error loading profile: {sErr?.message || "Invalid student ID"}
        </div>
      </div>
    );
  }

  // Filter student applications
  const studentApps = applications.filter(app => app.student_id === student.student_id);
  const studentAppIds = new Set(studentApps.map(a => a.application_id));

  // Filter student offers by matching student application ID
  const studentOffers = offers.filter(o => studentAppIds.has(o.application_id));

  // Initials for avatar
  const initials = student.name
    ? student.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()
    : "ST";

  // Dynamic risk calculation exactly matching directory logic
  const isHighRisk = student.active_backlogs > 0 || student.cgpa < 7.0 || studentApps.filter(a => a.application_status === "Rejected").length >= 2;
  const isMediumRisk = !isHighRisk && (studentApps.filter(a => a.application_status === "Rejected").length === 1 || (student.cgpa >= 7.0 && student.cgpa < 8.0));

  const riskStatus = isHighRisk ? "High Risk" : isMediumRisk ? "Medium Risk" : "Low Risk";

  // Dynamic rating description for the gauge bottom pill
  const getRatingPill = (cgpa) => {
    if (cgpa >= 8.5) return { label: "Excellent", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", color: "#34D399" };
    if (cgpa >= 7.5) return { label: "Good", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)", color: "#60A5FA" };
    return { label: "Average", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", color: T.amber };
  };
  const rating = getRatingPill(student.cgpa);

  // SVG Circular Gauge variables
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (student.cgpa / 10) * circumference;

  // Company logo generation helper matching the premium colors in mockup
  const getLogoStyles = (companyName) => {
    const name = companyName?.toLowerCase() || "";
    if (name.includes("tech")) return { text: "T", bg: "#1D4ED8", border: "#3B82F6" };
    if (name.includes("innovate") || name.includes("solution")) return { text: "I", bg: "#7C3AED", border: "#8B5CF6" };
    if (name.includes("future") || name.includes("work")) return { text: "F", bg: "#0D9488", border: "#14B8A6" };
    return { text: companyName ? companyName[0].toUpperCase() : "C", bg: "#4B5563", border: "#6B7280" };
  };

  const getApplicationStatusStyles = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "selected" || s === "accepted") return { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", text: "#4ADE80", label: "✓ Selected" };
    if (s === "rejected") return { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", text: "#F87171", label: "✗ Rejected" };
    if (s === "offer extended" || s.includes("offer")) return { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", text: "#4ADE80", label: "Offer Extended" };
    if (s === "applied") return { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", text: "#4ADE80", label: "Applied" };
    if (s === "interviewing" || s === "pending") return { bg: "rgba(120,113,108,0.15)", border: "rgba(120,113,108,0.3)", text: "#D6D3D1", label: "Interviewing" };
    return { bg: "rgba(120,113,108,0.1)", border: "rgba(120,113,108,0.2)", text: th.textSecondary, label: status };
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .student-detail-container {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: ${T.font};
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .hero-glow-border {
          box-shadow: 0 0 35px rgba(245, 158, 11, 0.04);
        }
        .shortcut-button-strategy:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.15);
          background: rgba(245, 158, 11, 0.05) !important;
        }
        .shortcut-button-simulator:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.03);
          background: ${dark ? "#34302C !important" : "#EBE9E5 !important"};
        }
      `}</style>

      <div className="student-detail-container">
        
        {/* Navigation Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <button 
            onClick={() => navigate("/tpo/students")}
            style={{
              background: dark ? "#242020" : "#FFFFFF",
              border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.12)",
              color: th.textPrimary,
              padding: "9px 18px",
              borderRadius: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13.5,
              fontWeight: 600,
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.amber; e.currentTarget.style.background = dark ? "#2A2525" : "#FAF9F6"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"; e.currentTarget.style.background = dark ? "#242020" : "#FFFFFF"; }}
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            Back to Students
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13.5, color: th.textSecondary, fontWeight: 500 }}>Global Placement Dashboard</span>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: th.textSecondary
            }}>
              👤
            </div>
          </div>
        </div>

        {/* 1. Main Profile Hero Block */}
        <div 
          className="hero-glow-border"
          style={{
            background: dark 
              ? "linear-gradient(135deg, rgba(32, 28, 26, 0.8) 0%, rgba(20, 18, 17, 0.75) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 246, 242, 0.85) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: dark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: 24,
            padding: "36px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 28,
            boxShadow: dark ? "0 20px 50px rgba(0,0,0,0.3)" : "0 20px 50px rgba(28, 25, 23, 0.05)",
          }}
        >
          {/* Hero Left: Avatar & Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 28, minWidth: 280, flex: 1 }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: dark ? "rgba(20, 18, 17, 0.8)" : "rgba(255, 255, 255, 0.9)",
              border: `2.5px solid ${T.amber}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 34, fontWeight: 700, color: th.textPrimary,
              boxShadow: dark ? "0 0 28px rgba(245, 158, 11, 0.28)" : "0 0 28px rgba(245, 158, 11, 0.2)",
              flexShrink: 0
            }}>
              {initials}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h1 style={{ fontFamily: T.fontSerif, fontSize: 32, color: th.textPrimary, margin: 0, letterSpacing: "-0.01em" }}>
                {student.name}
              </h1>
              <div style={{ fontSize: 13.5, color: th.textSecondary }}>
                ID: {student.student_id}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                  background: student.placement_status.includes("Placed") ? T.successDim : "rgba(120,113,108,0.12)",
                  border: `1px solid ${student.placement_status.includes("Placed") ? T.successBorder : "rgba(120,113,108,0.25)"}`,
                  color: student.placement_status.includes("Placed") ? T.success : th.textSecondary
                }}>
                  <Check size={11} strokeWidth={3} /> {student.placement_status}
                </span>

                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                  background: T.infoDim, border: `1px solid ${T.infoBorder}`, color: T.info
                }}>
                  <Check size={11} strokeWidth={3} /> Verified
                </span>

                {isHighRisk && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                    background: T.dangerDim, border: `1px solid ${T.dangerBorder}`, color: T.danger
                  }}>
                    <AlertTriangle size={11} strokeWidth={2.5} /> High Risk
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hero Right: Gauge representation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: 140, height: 140, flexShrink: 0 }}>
            {/* SVG Circular Dial */}
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)"}
                strokeWidth={strokeWidth}
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke="url(#gaugeGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="60%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered content */}
            <div style={{
              position: "absolute", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", inset: 0
            }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: th.textPrimary, lineHeight: 1 }}>
                {student.cgpa.toFixed(2)}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: th.textSecondary, letterSpacing: "0.08em", marginTop: 4 }}>
                CGPA
              </span>
            </div>

            {/* Analytics Mini Icon (Top Right) */}
            <div style={{
              position: "absolute", top: 0, right: 0, width: 22, height: 22, borderRadius: "50%",
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.success
            }}>
              <ChevronRight size={10} style={{ transform: "rotate(-45deg)" }} />
            </div>

            {/* Dynamic bottom rating badge */}
            <div style={{
              position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
              background: rating.bg, border: `1px solid ${rating.border}`, color: rating.color,
              fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em",
              padding: "3px 14px", borderRadius: 20, whiteSpace: "nowrap",
              boxShadow: dark ? "0 4px 10px rgba(0,0,0,0.2)" : "0 4px 10px rgba(0,0,0,0.05)"
            }}>
              {rating.label}
            </div>
          </div>

        </div>

        {/* 2. Main content grids (Left: Academic, Right: Funnel) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          
          {/* Card Left: Academic Details */}
          <div style={{
            background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20,
            padding: "30px 28px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ fontSize: 18, fontFamily: T.fontSerif, color: th.textPrimary, margin: "0 0 24px", letterSpacing: "-0.01em" }}>
              Academic Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 24px", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: th.textPrimary }}>
                  {student.branch || "Not Available"}
                </div>
                <div style={{ fontSize: 11.5, color: th.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em", marginTop: 4 }}>
                  Branch
                </div>
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: th.textPrimary }}>
                  {student.degree_type || "Not Available"}
                </div>
                <div style={{ fontSize: 11.5, color: th.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em", marginTop: 4 }}>
                  Degree
                </div>
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: th.textPrimary }}>
                  {student.graduation_year || "Not Available"}
                </div>
                <div style={{ fontSize: 11.5, color: th.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em", marginTop: 4 }}>
                  Graduation Year
                </div>
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: student.active_backlogs > 0 ? T.danger : th.textPrimary }}>
                  {student.active_backlogs}
                </div>
                <div style={{ fontSize: 11.5, color: th.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em", marginTop: 4 }}>
                  Backlogs
                </div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${th.border}`, paddingTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: th.textSecondary }}>
                  <Mail size={14} />
                </div>
                <span style={{ fontSize: 14, color: th.textPrimary, fontWeight: 500 }}>{student.email}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: th.textSecondary }}>
                  <Phone size={14} />
                </div>
                <span style={{ fontSize: 14, color: th.textPrimary, fontWeight: 500 }}>{student.phone || "+91 9876543210"}</span>
              </div>
              
              <div style={{ fontSize: 11, color: th.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 42, marginTop: -8 }}>
                Contact Info
              </div>

              {student.linkedin_url && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: T.info }}>
                    <Linkedin size={14} />
                  </div>
                  <a 
                    href={student.linkedin_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 14, color: T.info, fontWeight: 500, textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                  >
                    LinkedIn.com/linkedin/profile/
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Card Right: Applications & Offers History */}
          <div style={{
            background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20,
            padding: "30px 28px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            display: "flex", flexDirection: "column", gap: 24
          }}>
            
            {/* Drive Applications */}
            <div>
              <h3 style={{ fontSize: 18, fontFamily: T.fontSerif, color: th.textPrimary, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
                Drive Applications & Offers
              </h3>
              
              <div style={{ fontSize: 12, fontWeight: 600, color: th.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                Applications
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {studentApps.length === 0 ? (
                  <div style={{ fontSize: 13, color: th.textSecondary, padding: "8px 0" }}>No drive applications compiled.</div>
                ) : (
                  studentApps.map(app => {
                    const drive = drives.find(d => d.drive_id === app.drive_id);
                    const comp = drive ? companies.find(c => c.company_id === drive.company_id) : null;
                    const compName = comp ? comp.company_name : `Drive #${app.drive_id}`;
                    const appStatus = getApplicationStatusStyles(app.application_status);
                    const logo = getLogoStyles(compName);

                    return (
                      <div key={app.application_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: logo.bg, border: `1.5px solid ${logo.border}44`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 800, color: "#FFFFFF"
                          }}>
                            {logo.text}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: th.textPrimary }}>
                              {compName}
                            </div>
                            <div style={{ fontSize: 11, color: th.textSecondary, marginTop: 2 }}>
                              Applied
                            </div>
                          </div>
                        </div>

                        <span style={{
                          fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                          background: appStatus.bg, border: `1px solid ${appStatus.border}`, color: appStatus.text
                        }}>
                          {appStatus.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Placement Offers */}
            <div style={{ borderTop: `1px solid ${th.border}`, paddingTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: th.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                Offers
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {studentOffers.length === 0 ? (
                  <div style={{ fontSize: 13, color: th.textSecondary, padding: "8px 0" }}>No placement offers locked yet.</div>
                ) : (
                  studentOffers.map(offer => {
                    const compName = offer.company_name || `Company #${offer.company_id}`;
                    const logo = getLogoStyles(compName);
                    
                    return (
                      <div 
                        key={offer.offer_id} 
                        style={{
                          background: dark ? "rgba(245,158,11,0.02)" : "rgba(245,158,11,0.01)",
                          border: `1.5px solid ${T.amberBorder}`,
                          borderRadius: 14,
                          padding: "14px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          boxShadow: dark ? "0 4px 12px rgba(245,158,11,0.03)" : "none"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: logo.bg, border: `1.5px solid ${logo.border}44`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 800, color: "#FFFFFF"
                          }}>
                            {logo.text}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: th.textPrimary }}>
                              {compName}
                            </div>
                            <div style={{ fontSize: 11, color: T.amber, fontWeight: 600, marginTop: 2 }}>
                              ₹{offer.package} LPA
                            </div>
                          </div>
                        </div>

                        <span style={{
                          fontSize: 10.5, fontWeight: 800, padding: "3px 12px", borderRadius: 20,
                          background: T.amberDim, border: `1.5px solid ${T.amberBorder}`, color: T.amber,
                          textTransform: "uppercase", letterSpacing: "0.02em"
                        }}>
                          Offer
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

        {/* 3. Bottom Card: Smart AI Shortcuts */}
        <div style={{
          background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20,
          padding: "26px 28px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          display: "flex", flexDirection: "column", gap: 18
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: th.textPrimary, margin: 0 }}>
            Smart AI Shortcuts
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {/* Shortcut 1: AI Strategy */}
            <button
              className="shortcut-button-strategy"
              onClick={() => navigate(`/strategy?student_id=${id}`)}
              style={{
                background: dark ? "rgba(245,158,11,0.01)" : "rgba(245,158,11,0.02)",
                border: `1.5px solid ${T.amberBorder}`,
                borderRadius: 14,
                padding: "16px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: T.font
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: T.amberDim, border: `1px solid ${T.amberBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.amber
                }}>
                  <Sparkles size={16} />
                </div>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: th.textPrimary }}>
                  AI Placement Strategy
                </span>
              </div>
              <ChevronRight size={16} color={th.textSecondary} />
            </button>

            {/* Shortcut 2: What-if Simulator */}
            <button
              className="shortcut-button-simulator"
              onClick={() => navigate(`/simulator?student_id=${id}`)}
              style={{
                background: dark ? "#2D2926" : "#E2E0DC",
                border: dark ? "1px solid rgba(255, 255, 255, 0.04)" : "1px solid rgba(0,0,0,0.06)",
                borderRadius: 14,
                padding: "16px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: T.font
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: th.textSecondary
                }}>
                  <BarChart2 size={16} />
                </div>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: th.textPrimary }}>
                  What-If CGPA Simulator
                </span>
              </div>
              <ChevronRight size={16} color={th.textSecondary} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
