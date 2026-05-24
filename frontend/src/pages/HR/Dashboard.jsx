/**
 * src/pages/hr/Dashboard.jsx
 * HR (company) role only with AI Semantic Sourcing.
 */

import { useMemo, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { T, getTheme } from "@/tokens";
import useAuthStore from "@/store/authStore";
import { useCompanyDashboard, useHrSemanticSearch } from "@/hooks/useQueries";
import { Sparkles, X, Search } from "lucide-react";

export default function HRDashboard({ dark = true }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  
  // Fetch live data from FastAPI
  const { data: students = [], isLoading, isError } = useCompanyDashboard();
  const { mutate: runSemanticSearch, isPending: searchingSemantic } = useHrSemanticSearch();

  const [semanticQuery, setSemanticQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [activeFilters, setActiveFilters] = useState(null);

  // 1. Performance Optimization: Memoized Dynamic Stats
  const stats = useMemo(() => {
    const activeData = searchResults || students;
    const totalApplicants = activeData.length;
    const shortlisted = activeData.filter(s => s.application_status === 'Selected' || s.placement_status === 'Placed').length;

    return [
      { label: "Total Applicants",  value: totalApplicants, color: T.amber   },
      { label: "Selected / Placed", value: shortlisted,     color: T.success },
    ];
  }, [students, searchResults]);

  // 2. Scalability Optimization: Dynamic Filter Generation
  const branchOptions = useMemo(() => {
    const activeData = searchResults || students;
    const uniqueBranches = [...new Set(activeData.map(s => s.branch).filter(Boolean))];
    return uniqueBranches.map(branch => ({ value: branch, label: branch }));
  }, [students, searchResults]);

  const cols = [
    {
      key: "name", label: "Student", sortable: true,
      render: (v) => <div style={{ fontWeight: 500, color: th.textPrimary }}>{v}</div>,
    },
    { key: "branch", label: "Branch", sortable: true },
    {
      key: "cgpa", label: "CGPA", sortable: true,
      render: v => <strong style={{ color: v >= 8 ? T.success : T.amber }}>{v ? parseFloat(v).toFixed(2) : "-"}</strong>,
    },
    {
      key: "active_backlogs", label: "Backlogs", sortable: true,
      render: v => <span style={{ color: v === 0 ? th.textMuted : T.danger }}>{v}</span>,
    },
    { 
      key: "placement_status", label: "Placement Status", sortable: true,
      render: v => <StatusBadge status={v || "Not Placed"} />
    }
  ];

  const handleSemanticSearch = (e) => {
    if (e) e.preventDefault();
    const q = semanticQuery.trim();
    if (!q || searchingSemantic) return;

    runSemanticSearch(q, {
      onSuccess: (data) => {
        setSearchResults(data.students);
        setActiveFilters(data.filters);
      }
    });
  };

  const handleClearSemantic = () => {
    setSemanticQuery("");
    setSearchResults(null);
    setActiveFilters(null);
  };

  if (isLoading) return <PageSkeleton type="table" dark={dark} />;
  
  if (isError) return (
    <div style={{ color: T.danger, padding: 32, fontFamily: T.font }}>
      Error loading dashboard data. Please check your connection.
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: T.font, maxWidth: 1200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: "clamp(20px,2.5vw,27px)", color: th.textPrimary, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
            HR Dashboard ✦
          </h2>
          <p style={{ fontSize: 13.5, color: th.textSecondary, margin: 0 }}>
            Welcome back, {user?.name || user?.username}
          </p>
        </div>
      </div>

      {/* AI Semantic Talent Sourcing Search Console */}
      <div style={{
        background: th.surface, border: `1px solid ${th.border}`,
        borderRadius: 16, padding: 20, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color={T.amber} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: th.textPrimary, margin: 0 }}>AI Recruiter Candidate Sourcing</h3>
        </div>
        
        <form onSubmit={handleSemanticSearch} style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} color={th.textMuted} style={{ position: "absolute", left: 14, top: 13 }} />
            <input
              value={semanticQuery}
              onChange={e => setSemanticQuery(e.target.value)}
              placeholder="Ask AI to find candidates (e.g. 'Show me CSE students with CGPA above 8.0 and zero backlogs')..."
              style={{
                width: "100%", padding: "12px 14px 12px 42px",
                background: th.surfaceUp, border: `1.5px solid ${th.borderUp}`,
                borderRadius: 10, color: th.textPrimary, fontSize: 13.5,
                outline: "none", fontFamily: T.font, transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = T.amber}
              onBlur={e => e.target.style.borderColor = th.borderUp}
            />
          </div>
          <button
            type="submit"
            disabled={!semanticQuery.trim() || searchingSemantic}
            style={{
              padding: "0 20px", borderRadius: 10, background: T.amber, color: T.amberText,
              border: "none", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            {searchingSemantic ? "Parsing..." : "Source Talent"}
          </button>
        </form>

        {/* AI Badges row if active */}
        {activeFilters && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <span style={{ fontSize: 11.5, color: th.textMuted }}>AI Filters Active:</span>
            {activeFilters.min_cgpa && (
              <span style={{ padding: "4px 8px", background: T.successDim, color: T.success, fontSize: 11, fontWeight: "bold", borderRadius: 6 }}>
                CGPA ≥ {activeFilters.min_cgpa}
              </span>
            )}
            {activeFilters.branch && (
              <span style={{ padding: "4px 8px", background: T.infoDim, color: T.info, fontSize: 11, fontWeight: "bold", borderRadius: 6 }}>
                Branch: {activeFilters.branch}
              </span>
            )}
            {activeFilters.max_backlogs !== null && activeFilters.max_backlogs !== undefined && (
              <span style={{ padding: "4px 8px", background: T.dangerDim, color: T.danger, fontSize: 11, fontWeight: "bold", borderRadius: 6 }}>
                Backlogs ≤ {activeFilters.max_backlogs}
              </span>
            )}
            {activeFilters.placement_status && (
              <span style={{ padding: "4px 8px", background: th.borderUp, color: th.textSecondary, fontSize: 11, fontWeight: "bold", borderRadius: 6 }}>
                Status: {activeFilters.placement_status}
              </span>
            )}
            <button
              onClick={handleClearSemantic}
              style={{
                background: "none", border: "none", color: T.danger, cursor: "pointer",
                fontSize: 11.5, display: "flex", alignItems: "center", gap: 3, padding: "2px 6px"
              }}
            >
              <X size={12} /> Reset AI Search
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 13, padding: "15px 18px" }}>
            <div style={{ fontSize: 10.5, color: th.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>{s.label}</div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 32, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <DataTable
        title={searchResults ? "AI Sourced Candidates" : "Student Applications"}
        columns={cols}
        data={searchResults || students}
        searchKeys={["name", "branch"]}
        filters={[{
          key: "branch", label: "Branch",
          options: branchOptions,
        }]}
        dark={dark}
        pageSize={8}
      />
    </div>
  );
}