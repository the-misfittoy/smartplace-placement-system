/**
 * src/components/ui/DataTable.jsx
 * Shared reusable table component
 */

import { useState, useMemo, useDeferredValue } from "react";
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Plus, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { T, getTheme } from "@/tokens";

export default function DataTable({
  columns    = [],
  data       = [],
  searchKeys = [],
  actions    = [],
  filters    = [],
  title      = "",
  onAdd,
  addLabel   = "Add New",
  dark       = true,
  pageSize   = 10,
}) {
  const th = getTheme(dark);
  const [search,        setSearch]        = useState("");
  const [sortKey,       setSortKey]       = useState(null);
  const [sortDir,       setSortDir]       = useState("asc");
  const [page,          setPage]          = useState(1);
  const [activeFilters, setActiveFilters] = useState({});

  // Performance Optimization: Defers the search filtering so typing doesn't lag
  const deferredSearch = useDeferredValue(search);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const setFilter = (key, value) => {
    setActiveFilters(p => ({ ...p, [key]: value }));
    setPage(1);
  };

  const filtered = useMemo(() => {
    let rows = [...data];

    // Text search (Using the optimized deferred value)
    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      rows = rows.filter(row =>
        searchKeys.some(k => String(row[k] ?? "").toLowerCase().includes(q))
      );
    }

    // Column filters
    Object.entries(activeFilters).forEach(([k, v]) => {
      if (v !== "" && v != null) rows = rows.filter(row => String(row[k]) === String(v));
    });

    // Sort
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return rows;
  }, [data, deferredSearch, sortKey, sortDir, activeFilters, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePageVal = Math.min(page, totalPages);
  const pageData  = filtered.slice((safePageVal - 1) * pageSize, safePageVal * pageSize);

  const pageNums = (() => {
    const half = 2;
    let start = Math.max(1, safePageVal - half);
    let end   = Math.min(totalPages, safePageVal + half);
    if (end - start < 4) {
      if (start === 1) end   = Math.min(totalPages, 5);
      else             start = Math.max(1, end - 4);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  const inputBase = {
    fontFamily: T.font, outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
  };

  return (
    <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:14, overflow:"hidden", fontFamily:T.font }}>
      
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${th.border}`, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        {title && <div style={{ fontFamily:T.fontSerif, fontSize:18, color:th.textPrimary, marginRight:4, whiteSpace:"nowrap" }}>{title}</div>}

        <div style={{ flex:1, minWidth:160, position:"relative" }}>
          <Search size={13} color={th.textMuted} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search…"
            style={{
              ...inputBase, width:"100%", padding:"8px 32px 8px 30px",
              background:th.surfaceUp, border:`1px solid ${th.borderUp}`,
              borderRadius:9, fontSize:13.5, color:th.textPrimary, boxSizing:"border-box",
            }}
            onFocus={e => { e.target.style.borderColor=T.amber; e.target.style.boxShadow=`0 0 0 3px rgba(245,158,11,0.15)`; }}
            onBlur={e => { e.target.style.borderColor=th.borderUp; e.target.style.boxShadow="none"; }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:th.textMuted, display:"flex" }}>
              <X size={13}/>
            </button>
          )}
        </div>

        {filters.map(f => (
          <select
            key={f.key} value={activeFilters[f.key] ?? ""} onChange={e => setFilter(f.key, e.target.value)}
            style={{ ...inputBase, padding:"8px 10px", background:th.surfaceUp, border:`1.5px solid ${activeFilters[f.key] ? T.amberBorder : th.borderUp}`, borderRadius:9, fontSize:13, cursor:"pointer", color: activeFilters[f.key] ? T.amber : th.textSecondary }}
          >
            <option value="">{f.label}</option>
            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}

        {onAdd && (
          <button onClick={onAdd} style={{ padding:"8px 14px", background:T.amber, border:"none", borderRadius:9, fontSize:13, fontWeight:600, color:"#1C1917", cursor:"pointer", fontFamily:T.font, display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", transition:"background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background="#D97706"}
          onMouseLeave={e => e.currentTarget.style.background=T.amber}>
            <Plus size={14}/> {addLabel}
          </button>
        )}

        <div style={{ fontSize:12, color:th.textMuted, whiteSpace:"nowrap" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
          <thead>
            <tr style={{ background:th.surfaceUp }}>
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600, color: sortKey === col.key ? T.amber : th.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:`1px solid ${th.border}`, cursor: col.sortable !== false ? "pointer" : "default", whiteSpace:"nowrap", width: col.width, userSelect:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {col.label}
                    {col.sortable !== false && (
                      sortKey === col.key
                        ? sortDir === "asc" ? <ChevronUp size={12} color={T.amber}/> : <ChevronDown size={12} color={T.amber}/>
                        : <ChevronsUpDown size={11} color={th.textMuted} style={{ opacity:0.5 }}/>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && <th style={{ padding:"10px 16px", fontSize:11, fontWeight:600, color:th.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:`1px solid ${th.border}`, width:140, textAlign:"right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} style={{ padding:"52px 20px", textAlign:"center", color:th.textMuted, fontSize:14 }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>🔍</div>
                  {search ? `No results matching "${search}"` : "No data available yet"}
                </td>
              </tr>
            ) : pageData.map((row, i) => (
              <tr key={row.id ?? i} style={{ borderBottom:`1px solid ${th.border}`, transition:"background 0.1s" }} onMouseEnter={e => e.currentTarget.style.background = th.surfaceUp} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding:"12px 16px", color:th.textSecondary, whiteSpace:"nowrap" }}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "—")}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td style={{ padding:"10px 16px", whiteSpace:"nowrap", textAlign:"right" }}>
                    <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                      {actions.filter(a => !a.show || a.show(row)).map((action, ai) => {
                        const Icon = action.icon;
                        return (
                          <button key={ai} onClick={() => action.onClick(row)} style={{ padding:"5px 11px", borderRadius:7, border:"none", background: action.bg || th.surfaceUp, color: action.color || th.textSecondary, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:T.font, display:"flex", alignItems:"center", gap:4, transition:"opacity 0.15s" }} onMouseEnter={e => e.currentTarget.style.opacity="0.8"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                            {Icon && <Icon size={12}/>} {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ padding:"11px 18px", borderTop:`1px solid ${th.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div style={{ fontSize:12.5, color:th.textMuted }}>
            Showing {Math.min((safePageVal-1)*pageSize+1, filtered.length)}–{Math.min(safePageVal*pageSize, filtered.length)} of {filtered.length}
          </div>
          <div style={{ display:"flex", gap:5 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={safePageVal===1} style={{ padding:"5px 9px", borderRadius:7, background:th.surfaceUp, border:`1px solid ${th.border}`, color:safePageVal===1 ? th.textMuted : th.textPrimary, cursor:safePageVal===1 ? "not-allowed":"pointer", display:"flex" }}><ChevronLeft size={14}/></button>
            {pageNums.map(n => <button key={n} onClick={() => setPage(n)} style={{ padding:"5px 10px", borderRadius:7, minWidth:32, background:safePageVal===n ? T.amber : th.surfaceUp, border:`1px solid ${safePageVal===n ? T.amber : th.border}`, color:safePageVal===n ? "#1C1917" : th.textSecondary, cursor:"pointer", fontFamily:T.font, fontSize:13, fontWeight:safePageVal===n ? 600 : 400 }}>{n}</button>)}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={safePageVal===totalPages} style={{ padding:"5px 9px", borderRadius:7, background:th.surfaceUp, border:`1px solid ${th.border}`, color:safePageVal===totalPages ? th.textMuted : th.textPrimary, cursor:safePageVal===totalPages ? "not-allowed":"pointer", display:"flex" }}><ChevronRight size={14}/></button>
          </div>
        </div>
      )}
    </div>
  );
}