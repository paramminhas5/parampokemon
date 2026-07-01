"use client";
import { useState, useEffect, useRef } from "react";
import { ZONES } from "@/game/data";
import { playSound } from "@/lib/audio";

const WORLD_SELECT_STYLES = `
@keyframes ws-fade-in   { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
@keyframes ws-card-in   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes ws-scanline  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
@keyframes ws-glow-pulse { 0%,100%{opacity:0.35} 50%{opacity:0.75} }
@keyframes ws-node-bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
@keyframes ws-shoot     { 0%{opacity:0;stroke-dashoffset:30} 30%{opacity:1} 100%{opacity:0;stroke-dashoffset:0} }
@keyframes ws-era-in    { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
`;

// Career-arc layout: zones positioned to tell a story
// Column 1 (left) = early/indie, Column 2 (center) = growth/scale, Column 3 (right) = now/current
// Vertical = time (top = earlier, bottom = now)
const ZONE_POSITIONS: Record<string, [number, number]> = {
  home:       [18,  8],   // top-left: the beginning
  origin:     [18, 23],   // early independent chapter
  grp:        [38, 16],   // first startup, college
  hab:        [22, 42],   // operator era starts
  ai:         [55, 24],   // AI before AI — right side
  investopad: [62, 38],   // venture capital chapter
  sole:       [45, 56],   // brand building peak — center
  fere:       [28, 68],   // return to AI
  ccd:        [70, 60],   // creative / soul chapter — right
  iterate:    [52, 80],   // the now — center-bottom
};

// Story connections showing career flow
const CONNECTIONS: [string, string][] = [
  ["home", "origin"],
  ["origin", "grp"],
  ["origin", "hab"],
  ["grp", "ai"],
  ["grp", "investopad"],
  ["hab", "sole"],
  ["ai", "investopad"],
  ["investopad", "sole"],
  ["sole", "fere"],
  ["sole", "ccd"],
  ["fere", "iterate"],
  ["ccd", "iterate"],
];

// Era groupings for the career story
const ERA_LABELS: { label: string; x: number; y: number; color: string }[] = [
  { label: "THE BEGINNING", x: 6,  y: 4,  color: "#9ad6e8" },
  { label: "FIRST BETS",    x: 30, y: 10, color: "#a8d39a" },
  { label: "OPERATOR ERA",  x: 6,  y: 36, color: "#f6a268" },
  { label: "VENTURE",       x: 56, y: 32, color: "#f0c4ff" },
  { label: "BRAND ERA",     x: 36, y: 50, color: "#ff9fd4" },
  { label: "NOW",           x: 36, y: 74, color: "#7ce0ff" },
];

// Shooting star paths (from-zone to-zone)
const SHOOT_PATHS: [string, string][] = [
  ["home", "origin"], ["grp", "ai"], ["sole", "iterate"],
];

export function WorldSelect({ onSelect, onClose }: {
  onSelect: (zoneId: string) => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [shootIdx, setShootIdx] = useState(0);
  const [shootVisible, setShootVisible] = useState(false);
  const hoveredZone = ZONES.find(z => z.id === (hovered ?? selected));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setShowList(mq.matches);
  }, []);

  // Shooting star effect: fires along a random path every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setShootIdx(i => (i + 1) % SHOOT_PATHS.length);
      setShootVisible(true);
      setTimeout(() => setShootVisible(false), 900);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function handleSelect(id: string) {
    setSelected(id);
    playSound("warp");
    setTimeout(() => onSelect(id), 180);
  }

  const [shootA, shootB] = SHOOT_PATHS[shootIdx];
  const [sax, say] = ZONE_POSITIONS[shootA] ?? [0, 0];
  const [sbx, sby] = ZONE_POSITIONS[shootB] ?? [0, 0];

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 60,
      background: "linear-gradient(180deg, #010209 0%, #020412 40%, #01030e 100%)",
      display: "flex", flexDirection: "column",
      animation: "ws-fade-in 0.3s cubic-bezier(0.34,1.2,0.64,1)",
      overflow: "hidden",
    }}>
      <style>{WORLD_SELECT_STYLES}</style>

      {/* Scanline */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:1 }}>
        <div style={{ position:"absolute", left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(124,224,255,0.035),transparent)", animation:"ws-scanline 10s linear infinite" }} />
      </div>

      {/* Nebula blobs — deeper & richer */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0 }}>
        {ZONES.map((z, i) => {
          const [px, py] = ZONE_POSITIONS[z.id] ?? [50,50];
          return (
            <div key={z.id} style={{
              position:"absolute",
              left:`${px - 12}%`, top:`${py - 12}%`,
              width:"24%", height:"24%",
              background:`radial-gradient(ellipse, ${z.theme.accent}22 0%, transparent 68%)`,
              filter:"blur(22px)",
              animation:`ws-glow-pulse ${3.5 + i * 0.35}s ease-in-out ${i * 0.15}s infinite`,
              pointerEvents:"none",
            }} />
          );
        })}
      </div>

      {/* Header */}
      <div style={{ position:"relative", zIndex:10, padding:"16px 20px 0", flexShrink:0 }}>
        <div style={{ fontFamily:"var(--font-pixel)", fontSize:6, color:"#1e2e48", letterSpacing:"0.3em", marginBottom:6 }}>✦ PARAM QUEST — CAREER MAP</div>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"var(--font-pixel)", fontSize:13, color:"#7ce0ff", textShadow:"0 0 24px rgba(124,224,255,0.55), 0 3px 0 #081828" }}>
              WORLD SELECT
            </div>
            <div style={{ fontFamily:"var(--font-pixel)", fontSize:7, color:"#2a4060", marginTop:3 }}>
              15 YEARS · 10 WORLDS · ALL CHAPTERS OPEN
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:2 }}>
            <button onClick={() => setShowList(l => !l)} style={{ background:"transparent", border:"1px solid #152030", color:"#2a4060", padding:"5px 10px", fontFamily:"var(--font-pixel)", fontSize:6, cursor:"pointer", letterSpacing:"0.05em" }}>
              {showList ? "GALAXY ★" : "LIST ≡"}
            </button>
            <button onClick={onClose} style={{ background:"transparent", border:"1px solid #152030", color:"#2a4060", padding:"5px 10px", fontFamily:"var(--font-pixel)", fontSize:6, cursor:"pointer" }}>
              CLOSE ✕
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", padding:"10px 20px 18px", gap:14, position:"relative", zIndex:5 }}>

        {showList ? (
          /* ── LIST VIEW ── */
          <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:3 }}>
            {ZONES.map((z, i) => (
              <button key={z.id} onClick={() => handleSelect(z.id)}
                onMouseEnter={() => setHovered(z.id)} onMouseLeave={() => setHovered(null)}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  background: hovered === z.id ? `${z.theme.accent}14` : "rgba(4,8,18,0.65)",
                  border:`1px solid ${hovered === z.id ? z.theme.accent + "55" : "#101e30"}`,
                  padding:"9px 13px", cursor:"pointer", textAlign:"left",
                  transition:"all 0.1s", borderRadius:2,
                  animation:`ws-card-in 0.28s ease-out ${i * 22}ms both`,
                }}
              >
                <div style={{ width:34, height:34, flexShrink:0, background:`${z.theme.accent}10`, border:`1px solid ${z.theme.accent}28`, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:2 }}>
                  {z.id !== "home" ? (
                    <img src={`/sprites/landmarks/${z.id}.png`} alt="" style={{ width:30, height:30, imageRendering:"pixelated" }} onError={e => (e.currentTarget.style.display = "none")} />
                  ) : (
                    <span style={{ fontFamily:"var(--font-pixel)", fontSize:13, color:z.theme.accent }}>⌂</span>
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"var(--font-pixel)", fontSize:8, color: hovered === z.id ? z.theme.accent : "#b8cce0", transition:"color 0.1s" }}>{z.name.toUpperCase()}</span>
                    <span style={{ fontFamily:"var(--font-pixel)", fontSize:6, color:z.theme.accent, opacity:0.65 }}>{z.years}</span>
                  </div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"#3a5070", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{z.role}</div>
                </div>
                {z.gym && <div style={{ fontFamily:"var(--font-pixel)", fontSize:6, color:z.theme.accent, border:`1px solid ${z.theme.accent}38`, padding:"2px 5px", flexShrink:0 }}>GYM</div>}
              </button>
            ))}
          </div>
        ) : (
          /* ── GALAXY MAP ── */
          <div style={{ flex:1, position:"relative", minHeight:0 }}>
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", overflow:"visible" }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">

              {/* Era group labels */}
              {ERA_LABELS.map(era => (
                <text key={era.label}
                  x={era.x} y={era.y}
                  fontSize={2.0} fontFamily="monospace"
                  fill={era.color} fillOpacity={0.25}
                  letterSpacing="0.3"
                  style={{ userSelect:"none", animation:"ws-era-in 0.5s ease-out both" }}
                >{era.label}</text>
              ))}

              {/* Shooting star */}
              {shootVisible && (
                <line
                  x1={sax} y1={say} x2={sbx} y2={sby}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                  strokeDasharray="4,30"
                  strokeLinecap="round"
                  style={{ animation:"ws-shoot 0.9s ease-out both" }}
                />
              )}

              {/* Connection lines */}
              {CONNECTIONS.map(([a, b], i) => {
                const [ax, ay] = ZONE_POSITIONS[a] ?? [50,50];
                const [bx, by] = ZONE_POSITIONS[b] ?? [50,50];
                const za = ZONES.find(z => z.id === a);
                const isHov = hovered === a || hovered === b;
                return (
                  <line key={i}
                    x1={ax} y1={ay} x2={bx} y2={by}
                    stroke={isHov ? (za?.theme.accent ?? "#7ce0ff") : "#1a2e44"}
                    strokeWidth={isHov ? 0.55 : 0.22}
                    strokeOpacity={isHov ? 0.95 : 0.5}
                    strokeDasharray={isHov ? "none" : "1.5,2.5"}
                    style={{ transition:"all 0.2s" }}
                  />
                );
              })}

              {/* Zone nodes */}
              {ZONES.map(z => {
                const [px, py] = ZONE_POSITIONS[z.id] ?? [50,50];
                const isHov = hovered === z.id;
                const nodeR = isHov ? 3.2 : 2.0;
                return (
                  <g key={z.id} style={{ cursor:"pointer" }}
                    onMouseEnter={() => setHovered(z.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleSelect(z.id)}
                  >
                    {/* Outer pulse ring */}
                    <circle cx={px} cy={py} r={nodeR + 3} fill="none"
                      stroke={z.theme.accent} strokeWidth={0.4}
                      strokeOpacity={isHov ? 0.6 : 0.15}
                      style={{ transition:"all 0.25s" }}
                    />
                    {/* Inner glow ring */}
                    <circle cx={px} cy={py} r={nodeR + 1.5} fill="none"
                      stroke={z.theme.accent} strokeWidth={0.5}
                      strokeOpacity={isHov ? 0.9 : 0.3}
                      style={{ transition:"all 0.2s" }}
                    />
                    {/* Background fill glow */}
                    <circle cx={px} cy={py} r={nodeR + 1}
                      fill={z.theme.accent}
                      fillOpacity={isHov ? 0.15 : 0.05}
                      style={{ transition:"all 0.2s" }}
                    />
                    {/* Main dot */}
                    <circle cx={px} cy={py} r={nodeR}
                      fill={z.theme.accent}
                      fillOpacity={isHov ? 1 : 0.85}
                      stroke={z.theme.accent}
                      strokeWidth={0.4}
                      strokeOpacity={0.6}
                      style={{
                        transition:"all 0.2s",
                        filter: isHov ? `drop-shadow(0 0 4px ${z.theme.accent}) drop-shadow(0 0 8px ${z.theme.accent}80)` : `drop-shadow(0 0 2px ${z.theme.accent}60)`,
                        animation: isHov ? "none" : `ws-node-bob ${3 + ZONES.indexOf(z) * 0.4}s ease-in-out infinite`,
                      }}
                    />
                    {/* Zone name */}
                    <text x={px} y={py - nodeR - 1.8}
                      textAnchor="middle" fontSize={isHov ? 2.6 : 2.1}
                      fill={isHov ? z.theme.accent : "#3a5878"}
                      fontFamily="monospace"
                      style={{ transition:"all 0.2s", pointerEvents:"none", fontWeight: isHov ? "bold" : "normal" }}
                    >{z.name.toUpperCase()}</text>
                    {/* Year on hover */}
                    {isHov && (
                      <text x={px} y={py + nodeR + 3.5}
                        textAnchor="middle" fontSize={2.0}
                        fill={z.theme.accent} fontFamily="monospace"
                        style={{ pointerEvents:"none" }}
                      >{z.years}</text>
                    )}
                    {/* Gym indicator dot — positioned inside the outer ring */}
                    {z.gym && (
                      <circle cx={px + nodeR * 0.7} cy={py - nodeR * 0.7}
                        r={1.0} fill="#f5d24a" fillOpacity={0.95}
                        stroke="#f5d24a" strokeWidth={0.3} strokeOpacity={0.5}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Preview panel */}
        <div style={{ width:216, flexShrink:0, display:"flex", flexDirection:"column", gap:10 }} className="hidden sm:flex">
          {hoveredZone ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"ws-card-in 0.18s ease-out" }}>
              {/* Landmark image */}
              <div style={{ height:180, background:`${hoveredZone.theme.accent}0e`, border:`2px solid ${hoveredZone.theme.accent}40`, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:3, overflow:"hidden", position:"relative" }}>
                <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at center, ${hoveredZone.theme.accent}28 0%, transparent 68%)`, animation:"ws-glow-pulse 2.2s ease-in-out infinite" }} />
                {/* Corner decorations */}
                <div style={{ position:"absolute", top:4, left:4, width:8, height:8, borderTop:`1px solid ${hoveredZone.theme.accent}60`, borderLeft:`1px solid ${hoveredZone.theme.accent}60` }} />
                <div style={{ position:"absolute", top:4, right:4, width:8, height:8, borderTop:`1px solid ${hoveredZone.theme.accent}60`, borderRight:`1px solid ${hoveredZone.theme.accent}60` }} />
                <div style={{ position:"absolute", bottom:4, left:4, width:8, height:8, borderBottom:`1px solid ${hoveredZone.theme.accent}60`, borderLeft:`1px solid ${hoveredZone.theme.accent}60` }} />
                <div style={{ position:"absolute", bottom:4, right:4, width:8, height:8, borderBottom:`1px solid ${hoveredZone.theme.accent}60`, borderRight:`1px solid ${hoveredZone.theme.accent}60` }} />
                <img
                  src={`/sprites/landmarks/${hoveredZone.id}.png`}
                  alt={hoveredZone.name}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", objectPosition: "center",
                    imageRendering: "auto",
                    position: "relative", zIndex: 1,
                    opacity: 0.92,
                  }}
                  onError={e => (e.currentTarget.style.display = "none")}
                />
                {/* Accent overlay to tie into game palette */}
                <div style={{
                  position: "absolute", inset: 0, zIndex: 2,
                  background: `linear-gradient(180deg, transparent 50%, ${hoveredZone.theme.accent}22 100%)`,
                  pointerEvents: "none",
                }} />
              </div>

              {/* Zone info card */}
              <div style={{ background:"rgba(4,8,18,0.92)", border:`1px solid ${hoveredZone.theme.accent}28`, padding:"12px 14px", borderRadius:3, backdropFilter:"blur(6px)" }}>
                {/* Year tag */}
                <div style={{ fontFamily:"var(--font-pixel)", fontSize:6, color:hoveredZone.theme.accent, opacity:0.7, marginBottom:4, letterSpacing:"0.15em" }}>{hoveredZone.years}</div>
                {/* Org */}
                <div style={{ fontFamily:"var(--font-pixel)", fontSize:6, color:hoveredZone.theme.accent, marginBottom:5, letterSpacing:"0.06em" }}>{hoveredZone.org.toUpperCase()}</div>
                {/* Zone name */}
                <div style={{ fontFamily:"var(--font-pixel)", fontSize:9, color:"#c0d4f0", marginBottom:6 }}>{hoveredZone.name.toUpperCase()}</div>
                {/* Outcome */}
                <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"#5a7898", lineHeight:1.55, marginBottom:10 }}>{hoveredZone.outcome}</div>
                {/* Gym leader row */}
                {hoveredZone.gym && (
                  <div style={{ borderTop:`1px solid ${hoveredZone.theme.accent}18`, paddingTop:8, marginTop:2, display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"var(--font-pixel)", fontSize:5, color:"#2a3e58", letterSpacing:"0.1em", marginBottom:3 }}>GYM LEADER</div>
                      <div style={{ fontFamily:"var(--font-pixel)", fontSize:7, color:hoveredZone.theme.accent }}>{hoveredZone.gym.opponentName}</div>
                    </div>
                    <img
                      src={`/sprites/leaders/${hoveredZone.gym.leader}.png`}
                      alt={hoveredZone.gym.opponentName}
                      style={{ width:28, height:28, imageRendering:"pixelated", border:`1px solid ${hoveredZone.theme.accent}30`, flexShrink:0 }}
                      onError={e => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
                {/* Warp button */}
                <button onClick={() => handleSelect(hoveredZone.id)} style={{
                  marginTop:10, width:"100%",
                  background:`${hoveredZone.theme.accent}18`,
                  border:`1.5px solid ${hoveredZone.theme.accent}70`,
                  color:hoveredZone.theme.accent,
                  padding:"10px",
                  fontFamily:"var(--font-pixel)", fontSize:8, cursor:"pointer",
                  borderRadius:2, letterSpacing:"0.07em",
                  transition:"all 0.12s",
                  textShadow:`0 0 10px ${hoveredZone.theme.accent}80`,
                }}>
                  ⚡ WARP HERE
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex:1, background:"rgba(4,8,18,0.45)", border:"1px solid #0c1824", display:"flex", alignItems:"center", justifyContent:"center", padding:16, borderRadius:3 }}>
              <div style={{ fontFamily:"var(--font-pixel)", fontSize:7, color:"#152030", textAlign:"center", lineHeight:2.2 }}>
                HOVER A<br />WORLD NODE<br />TO PREVIEW
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
