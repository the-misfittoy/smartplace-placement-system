/**
 * src/pages/shared/Companies.jsx
 */
import { useCompanies } from "@/hooks/useQueries";
import { T, getTheme } from "@/tokens";

export default function Companies({ role, dark = true }) {
  const th = getTheme(dark);
  const { data: companies = [], isLoading, isError } = useCompanies();

  if (isLoading) return <div style={{ padding: 32, color: th.textMuted }}>Loading company profiles...</div>;
  if (isError) return <div style={{ padding: 32, color: T.danger }}>Failed to load companies.</div>;

  return (
    <div style={{ padding: 32, fontFamily: T.font }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", color: th.textPrimary }}>Partner Companies</h1>
        
        {/* FIX: Improved UX on pending features */}
        {role === "tpo" && (
          <button 
            disabled
            title="Feature in development"
            style={{ 
              padding: "8px 16px", background: th.surfaceUp, color: th.textMuted, 
              fontWeight: "bold", borderRadius: 8, border: `1px solid ${th.border}`, 
              cursor: "not-allowed" 
            }}
          >
            + Add Company
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        {companies.map((company) => (
          <div key={company.company_id} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: "bold", color: th.textPrimary, margin: 0 }}>{company.company_name}</h2>
              <span style={{ padding: "4px 8px", background: th.surfaceUp, color: th.textSecondary, fontSize: 12, borderRadius: 4 }}>
                ID: {company.company_id}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: th.textSecondary, marginBottom: 24 }}>
              <div>Role: <span style={{ color: th.textPrimary }}>{company.role}</span></div>
              <div>Package: <span style={{ color: T.success, fontWeight: 500 }}>₹{company.package} LPA</span></div>
              <div>Min CGPA: <span style={{ color: th.textPrimary }}>{company.min_cgpa}</span></div>
              <div>Max Backlogs: <span style={{ color: th.textPrimary }}>{company.max_backlogs}</span></div>
            </div>
          </div>
        ))}
        
        {companies.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: 48, textAlign: "center", color: th.textMuted, background: th.surface, border: `1px dashed ${th.border}`, borderRadius: 12 }}>
            No partner companies registered yet.
          </div>
        )}
      </div>
    </div>
  );
}