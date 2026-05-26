"use client";
import { useState, useEffect, useRef } from "react";
import { ZONES } from "@/game/data";
import { playSound } from "@/lib/audio";

const WORLD_SELECT_STYLES = `
@keyframes ws-fade-in   { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
@keyframes ws-node-pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.15);opacity:1} }
@keyframes ws-trail     { 0%{stroke-dashoffset:200} 100%{stroke-dashoffset:0} }
@keyframes ws-card-in   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes ws-scanline  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
@keyframes ws-glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
`;

// Zone positions in a loose constellation layout (x%, y%)
const ZONE_POSITIONS: Record<string, [number, number]> = {
  home:       [15, 12],
  origin:     [22, 30],
  grp:        [38, 20],
  ai:         [55, 35],
  hab:        [28, 52],
  investopad: [62, 18],
  sole:       [72, 48],
  fere:       [48, 62],
  ccd:        [82, 30],
  iterate:    [68, 72],
};

// Constellation connections (pairs of zone ids)
const CONNECTIONS: [string, string][] = [
  ["home","origin"], ["origin","grp"], ["origin","hab"],
  ["grp","ai"], ["grp","investopad"], ["ai","sole"],
  ["hab","fere"], ["sole","fere"], ["sole","ccd"],
  ["investopad","ccd"], ["fere","iterate"], ["ccd","iterate"],
];


export function WorldSelect({ onSelect, onClose }: {
  onSelect: (zoneId: string) => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const hoveredZone = ZONES.find(z => z.id === (hovered ?? selected));
  const svgRef = useRef<SVGSVGElement>(null);

  // Toggle list view on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setShowList(mq.matches);
  }, []);

  function handleSelect(id: string) {
    setSelected(id);
    playSound("warp");
    setTimeout(() => onSelect(id), 180);
  }

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 60,
      background: "linear-gradient(180deg, #010308 0%, #030614 40%, #020510 100%)",
      display: "flex", flexDirection: "column",
      animation: "ws-fade-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      overflow: "hidden",
    }}>
      <style>{WORLD_SELECT_STYLES}</style>

      {/* Scanline effect */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:1 }}>
        <div style={{ position:"absolute", left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(124,224,255,0.04),transparent)", animation:"ws-scanline 8s linear infinite" }} />
      </div>

      {/* Nebula glow blobs */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0 }}>
        {ZONES.map((z,i) => {
          const [px, py] = ZONE_POSITIONS[z.id] ?? [50,50];
          return (
            <div key={z.id} style={{
              position:"absolute",
              left:`${px-10}%`, top:`${py-10}%`,
              width:"20%", height:"20%",
              background:`radial-gradient(ellipse,${z.theme.accent}18 0%,transparent 70%)`,
              filter:"blur(18px)",
              animation:`ws-glow-pulse ${3+i*0.4}s ease-in-out ${i*0.2}s infinite`,
              pointerEvents:"none",
            }} />
          );
        })}
      </div>

      {/* Header */}
      <div style={{ position:"relative", zIndex:10, padding:"18px 20px 0", flexShrink:0 }}>
        <div style={{ fontFamily:"var(--font-pixel)", fontSize:7, color:"#2a3a50", letterSpacing:"0.25em", marginBottom:8 }}>✦ PARAM QUEST</div>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"var(--font-pixel)", fontSize:14, color:"#7ce0ff", textShadow:"0 3px 0 #0a2040,0 0 30px rgba(124,224,255,0.5)" }}>
              WORLD SELECT
            </div>
            <div style={{ fontFamily:"var(--font-pixel)", fontSize:7, color:"#3a5070", marginTop:4 }}>
              {ZONES.length} WORLDS · ALL OPEN · TAP TO WARP
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShowList(l=>!l)} style={{ background:"transparent", border:"1px solid #1a2a4a", color:"#3a5070", padding:"6px 12px", fontFamily:"var(--font-pixel)", fontSize:7, cursor:"pointer" }}>
              {showList ? "GALAXY ★" : "LIST ≡"}
            </button>
            <button onClick={onClose} style={{ background:"transparent", border:"1px solid #1a2a4a", color:"#3a5070", padding:"6px 12px", fontFamily:"var(--font-pixel)", fontSize:7, cursor:"pointer" }}>
              SPAWN AT START
            </button>
          </div>
        </div>
      </div>


      {/* Main content */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", padding:"12px 20px 20px", gap:16, position:"relative", zIndex:5 }}>

        {/* Galaxy map (desktop) / List (mobile or toggled) */}
        {showList ? (
          // ── LIST VIEW ──
          <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
            {ZONES.map((z,i) => (
              <button key={z.id} onClick={()=>handleSelect(z.id)}
                onMouseEnter={()=>setHovered(z.id)} onMouseLeave={()=>setHovered(null)}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  background:hovered===z.id?`${z.theme.accent}12`:"rgba(6,12,24,0.6)",
                  border:`1px solid ${hovered===z.id?z.theme.accent+"50":"#1a2a3a"}`,
                  padding:"10px 14px", cursor:"pointer", textAlign:"left",
                  transition:"all 0.1s", borderRadius:3,
                  animation:`ws-card-in 0.3s ease-out ${i*25}ms both`,
                }}
              >
                <div style={{ width:36,height:36,flexShrink:0,background:`${z.theme.accent}12`,border:`1px solid ${z.theme.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:2 }}>
                  {z.id!=="home" ? (
                    <img src={`/sprites/creatures/${z.id}.png`} alt="" style={{ width:32,height:32,imageRendering:"pixelated" }} onError={e=>(e.currentTarget.style.display="none")} />
                  ) : (
                    <span style={{ fontFamily:"var(--font-pixel)",fontSize:14,color:z.theme.accent }}>⌂</span>
                  )}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontFamily:"var(--font-pixel)",fontSize:8,color:hovered===z.id?z.theme.accent:"#c8d8f0",transition:"color 0.1s" }}>{z.name.toUpperCase()}</span>
                    <span style={{ fontFamily:"var(--font-pixel)",fontSize:6,color:z.theme.accent,opacity:0.7 }}>{z.years}</span>
                  </div>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:11,color:"#4a6080",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{z.role}</div>
                </div>
                {z.gym&&<div style={{ fontFamily:"var(--font-pixel)",fontSize:6,color:z.theme.accent,border:`1px solid ${z.theme.accent}40`,padding:"2px 6px",flexShrink:0 }}>GYM</div>}
              </button>
            ))}
          </div>
        ) : (
          // ── GALAXY MAP VIEW ──
          <div style={{ flex:1, position:"relative", minHeight:0 }}>
            <svg ref={svgRef} style={{ position:"absolute",inset:0,width:"100%",height:"100%" }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Connection lines */}
              {CONNECTIONS.map(([a,b],i) => {
                const [ax,ay]=ZONE_POSITIONS[a]??[50,50];
                const [bx,by]=ZONE_POSITIONS[b]??[50,50];
                const za=ZONES.find(z=>z.id===a);
                const isHov=hovered===a||hovered===b;
                return (
                  <line key={i}
                    x1={ax} y1={ay} x2={bx} y2={by}
                    stroke={isHov?(za?.theme.accent??"#7ce0ff"):"#1a2a4a"}
                    strokeWidth={isHov?0.5:0.25}
                    strokeOpacity={isHov?0.9:0.4}
                    strokeDasharray={isHov?"none":"2,3"}
                    style={{ transition:"all 0.2s" }}
                  />
                );
              })}

              {/* Zone nodes */}
              {ZONES.map(z => {
                const [px,py]=ZONE_POSITIONS[z.id]??[50,50];
                const isHov=hovered===z.id;
                const r=isHov?3.2:2;
                return (
                  <g key={z.id} style={{ cursor:"pointer" }}
                    onMouseEnter={()=>setHovered(z.id)} onMouseLeave={()=>setHovered(null)}
                    onClick={()=>handleSelect(z.id)}
                  >
                    {/* Glow ring */}
                    <circle cx={px} cy={py} r={r+2} fill="none" stroke={z.theme.accent} strokeWidth={0.5} strokeOpacity={isHov?0.6:0.15} style={{ transition:"all 0.2s" }} />
                    {/* Main dot */}
                    <circle cx={px} cy={py} r={r} fill={z.theme.accent} fillOpacity={isHov?1:0.7}
                      style={{ transition:"all 0.2s", filter:isHov?`drop-shadow(0 0 3px ${z.theme.accent})`:"none" }}
                    />
                    {/* Label */}
                    <text x={px} y={py-r-1.5} textAnchor="middle" fontSize={2.2}
                      fill={isHov?z.theme.accent:"#4a6080"}
                      fontFamily="monospace"
                      style={{ transition:"all 0.2s", pointerEvents:"none" }}
                    >{z.name.toUpperCase()}</text>
                    {/* Year */}
                    {isHov&&<text x={px} y={py+r+3} textAnchor="middle" fontSize={1.8} fill={z.theme.accent} fontFamily="monospace" style={{ pointerEvents:"none" }}>{z.years}</text>}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Preview panel — desktop right sidebar */}
        <div style={{ width:210,flexShrink:0,display:"flex",flexDirection:"column",gap:10 }} className="hidden sm:flex">
          {hoveredZone ? (
            <>
              {hoveredZone.id!=="home"&&(
                <div style={{ height:190,background:`${hoveredZone.theme.accent}10`,border:`2px solid ${hoveredZone.theme.accent}45`,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:3,overflow:"hidden",position:"relative" }}>
                  {/* Glow behind landmark */}
                  <div style={{ position:"absolute",inset:0,background:`radial-gradient(ellipse at center,${hoveredZone.theme.accent}25 0%,transparent 70%)`,animation:"ws-glow-pulse 2s ease-in-out infinite" }} />
                  <img src={`/sprites/landmarks/${hoveredZone.id}.png`} alt="" style={{ width:170,height:170,imageRendering:"pixelated",position:"relative",zIndex:1 }} onError={e=>(e.currentTarget.style.display="none")} />
                </div>
              )}
              <div style={{ background:"rgba(6,12,24,0.88)",border:`1px solid ${hoveredZone.theme.accent}30`,padding:14,borderRadius:3,backdropFilter:"blur(4px)",animation:"ws-card-in 0.2s ease-out" }}>
                <div style={{ fontFamily:"var(--font-pixel)",fontSize:7,color:hoveredZone.theme.accent,marginBottom:6,letterSpacing:"0.08em" }}>{hoveredZone.org.toUpperCase()}</div>
                <div style={{ fontFamily:"var(--font-pixel)",fontSize:8,color:"#c8d8f0",marginBottom:4 }}>{hoveredZone.name.toUpperCase()}</div>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:12,color:"#8aa0c0",lineHeight:1.5,marginBottom:8 }}>{hoveredZone.outcome}</div>
                {hoveredZone.gym&&(
                  <div style={{ borderTop:`1px solid ${hoveredZone.theme.accent}20`,paddingTop:8,marginTop:8 }}>
                    <div style={{ fontFamily:"var(--font-pixel)",fontSize:6,color:"#3a5070",marginBottom:3 }}>GYM LEADER</div>
                    <div style={{ fontFamily:"var(--font-pixel)",fontSize:8,color:hoveredZone.theme.accent }}>{hoveredZone.gym.opponentName}</div>
                  </div>
                )}
                <button onClick={()=>handleSelect(hoveredZone.id)} style={{ marginTop:12,width:"100%",background:`${hoveredZone.theme.accent}18`,border:`1px solid ${hoveredZone.theme.accent}60`,color:hoveredZone.theme.accent,padding:"10px",fontFamily:"var(--font-pixel)",fontSize:8,cursor:"pointer",borderRadius:3,transition:"all 0.12s",letterSpacing:"0.06em" }}>
                  ⚡ WARP HERE
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex:1,background:"rgba(6,12,24,0.4)",border:"1px solid #0d1a2a",display:"flex",alignItems:"center",justifyContent:"center",padding:16,borderRadius:3 }}>
              <div style={{ fontFamily:"var(--font-pixel)",fontSize:7,color:"#1a2a3a",textAlign:"center",lineHeight:2 }}>HOVER A WORLD<br/>TO PREVIEW</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
