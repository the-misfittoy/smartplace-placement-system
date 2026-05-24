/**
 * src/components/ui/PageSkeleton.jsx
 */
import { getTheme } from "@/tokens";

const SHIMMER_CSS = `
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
`;

function Block({ h = 14, w = "100%", r = 7, dark }) {
  const th = getTheme(dark);
  return (
    <div style={{
      height: h, width: w, borderRadius: r, flexShrink: 0,
      background: `linear-gradient(90deg, ${th.surfaceUp} 25%, ${th.surface} 50%, ${th.surfaceUp} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s ease-in-out infinite",
    }}/>
  );
}

function StatCard({ dark }) {
  const th = getTheme(dark);
  return (
    <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:13, padding:"16px 18px", display:"flex", flexDirection:"column", gap:8 }}>
      <Block h={10} w="55%" r={5} dark={dark}/>
      <Block h={34} w="45%" r={6} dark={dark}/>
      <Block h={10} w="70%" r={5} dark={dark}/>
    </div>
  );
}

function TableRow({ cols = 5, dark }) {
  const th = getTheme(dark);
  return (
    <div style={{ display:"flex", gap:14, padding:"12px 16px", borderBottom:`1px solid ${th.border}`, alignItems:"center" }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} style={{ flex: i === 0 ? 2 : 1, display:"flex", flexDirection:"column", gap:6 }}>
          <Block h={12} w={i === 0 ? "80%" : "55%"} r={5} dark={dark}/>
          {i === 0 && <Block h={10} w="60%" r={4} dark={dark}/>}
        </div>
      ))}
    </div>
  );
}

export default function PageSkeleton({ type = "dashboard", dark = true }) {
  const th = getTheme(dark);

  if (type === "dashboard") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        <style>{SHIMMER_CSS}</style>
        <Block h={30} w="220px" r={8} dark={dark}/>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14 }}>
          {[0,1,2,3].map(i => <StatCard key={i} dark={dark}/>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
          {[0,1].map(i => (
            <div key={i} style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:14, padding:"20px 22px", display:"flex", flexDirection:"column", gap:14 }}>
              <Block h={18} w="160px" r={6} dark={dark}/>
              {[0,1,2].map(j => <Block key={j} h={56} w="100%" r={10} dark={dark}/>)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <style>{SHIMMER_CSS}</style>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
          {[0,1,2,3].map(i => <StatCard key={i} dark={dark}/>)}
        </div>
        <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:14, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${th.border}`, display:"flex", gap:12, alignItems:"center" }}>
            <Block h={34} w="200px" r={8} dark={dark}/>
            <Block h={34} w="140px" r={8} dark={dark}/>
            <Block h={34} w="100px" r={8} dark={dark}/>
            <div style={{ marginLeft:"auto" }}><Block h={34} w="110px" r={8} dark={dark}/></div>
          </div>
          <div style={{ display:"flex", gap:14, padding:"10px 16px", background:th.surfaceUp, borderBottom:`1px solid ${th.border}` }}>
            {[0,1,2,3,4].map(i => <Block key={i} h={10} w={i===0?"120px":"80px"} r={4} dark={dark}/>)}
          </div>
          {[0,1,2,3,4,5,6,7].map(i => <TableRow key={i} dark={dark}/>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <style>{SHIMMER_CSS}</style>
      <Block h={28} w="200px" r={7} dark={dark}/>
      <Block h={200} w="100%" r={14} dark={dark}/>
      <Block h={160} w="100%" r={14} dark={dark}/>
    </div>
  );
}