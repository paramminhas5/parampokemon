"use client";
import { useEffect, useRef, useState } from "react";
import { TITLE_BG_URL, PLAYER_FRONT_URL, LEADER_URL, getSprite, isReady } from "@/game/sprite-registry";

// ─── Prof. Iterate's opening speech ─────────────────────────────────────────
const INTRO_LINES = [
  {
    speaker: "Prof. Iterate",
    role: "Pokémon Professor",
    text: "Welcome to the world of CAREER QUEST.\n\nThis is a portfolio — but not a PDF you scroll past. It's a world you walk through.",
  },
  {
    speaker: "Prof. Iterate",
    role: "Pokémon Professor",
    text: "The player is PARAM MINHAS — builder, designer, director. Fifteen years across e-commerce, AI, real estate, sneakers, music, and marketing.",
  },
  {
    speaker: "Prof. Iterate",
    role: "Pokémon Professor",
    text: "Ten worlds. Nine gym leaders. Each one a real challenge he actually faced.\n\nDefeat them. Earn the badges. Read what he learned.",
  },
  {
    speaker: "Prof. Iterate",
    role: "Pokémon Professor",
    text: "Your adventure begins now.\n\nChoose a world — or start from the beginning. The whole map is open.",
  },
];

const STYLES = `
/* ── Title phase ── */
@keyframes ts-bg-pulse    { 0%,100%{opacity:0.4} 50%{opacity:0.75} }
@keyframes ts-title-drop  {
  0%   { opacity:0; transform:translateY(-40px) scale(1.18); }
  55%  { opacity:1; transform:translateY(6px)   scale(0.97); }
  75%  { transform:translateY(-3px) scale(1.01); }
  100% { transform:translateY(0)    scale(1); }
}
@keyframes ts-sub-in      { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes ts-press-blink { 0%,100%{opacity:1} 49%{opacity:1} 50%,99%{opacity:0} }
@keyframes ts-star-twinkle{ 0%,100%{opacity:var(--s-base)} 50%{opacity:calc(var(--s-base) * 2.5)} }
@keyframes ts-merman-bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes ts-merman-glow {
  0%,100%{ filter:drop-shadow(0 0 20px rgba(124,224,255,0.5)) drop-shadow(0 6px 0 rgba(0,0,0,0.5)); }
  50%    { filter:drop-shadow(0 0 44px rgba(124,224,255,0.95)) drop-shadow(0 6px 0 rgba(0,0,0,0.5)); }
}
@keyframes ts-scanline    {
  0%   { top:-4px; opacity:0; }
  5%   { opacity:1; }
  95%  { opacity:0.7; }
  100% { top:100%; opacity:0; }
}
@keyframes ts-glow-ring   { 0%{transform:scale(0.7);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
@keyframes ts-pill-in     { 0%{opacity:0;transform:translateY(6px) scale(0.94)} 100%{opacity:1;transform:translateY(0) scale(1)} }

/* ── Intro phase ── */
@keyframes ts-dialog-in   { 0%{opacity:0;transform:translateY(18px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes ts-prof-in     { 0%{opacity:0;transform:scale(0.65) translateY(14px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
@keyframes ts-cursor      { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes ts-advance-pulse{
  0%,100%{ opacity:0.55; transform:translateY(0); }
  50%    { opacity:1;    transform:translateY(-3px); }
}
`;

const FRAME_MS = 20;

// ─── Title background canvas ─────────────────────────────────────────────────
function TitleBgLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  useEffect(() => {
    const img  = getSprite(TITLE_BG_URL);
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      if (img && isReady(img)) {
        const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
        const sw = img.naturalWidth  * scale;
        const sh = img.naturalHeight * scale;
        ctx.imageSmoothingEnabled  = true;
        ctx.imageSmoothingQuality  = "high";
        ctx.drawImage(img, (canvas.width - sw) / 2, (canvas.height - sh) / 2, sw, sh);
        // vignette
        const g = ctx.createRadialGradient(
          canvas.width/2, canvas.height/2, 0,
          canvas.width/2, canvas.height/2, canvas.width * 0.75
        );
        g.addColorStop(0,   "rgba(1,2,10,0.3)");
        g.addColorStop(0.6, "rgba(1,2,10,0.55)");
        g.addColorStop(1,   "rgba(1,2,10,0.92)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#010208";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return (
    <canvas ref={canvasRef} width={960} height={640} style={{
      position: "absolute", inset: 0,
      width: "100%", height: "100%",
      zIndex: 0, pointerEvents: "none",
    }} />
  );
}

// ─── Starfield ───────────────────────────────────────────────────────────────
function Starfield() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      {Array.from({ length: 110 }, (_, i) => {
        const big    = i % 11 === 0;
        const bright = i % 5  === 0;
        const base   = big ? 0.55 : bright ? 0.32 : 0.14 + (i % 5) * 0.05;
        return (
          <div key={i} style={{
            position:     "absolute",
            left:         `${(i * 43.7 + 7) % 100}%`,
            top:          `${(i * 67.1 + 11) % 100}%`,
            width:        big ? 3 : bright ? 2 : 1,
            height:       big ? 3 : bright ? 2 : 1,
            background:   i % 5 === 0 ? "#7ce0ff" : i % 3 === 0 ? "#c89af0" : "#fff",
            borderRadius: "50%",
            opacity:      base,
            // @ts-ignore CSS custom property
            "--s-base":   base,
            animation:    `ts-star-twinkle ${2.5 + (i % 5) * 0.7}s ease-in-out ${(i % 7) * 0.38}s infinite`,
          } as React.CSSProperties} />
        );
      })}
    </div>
  );
}

// ─── Scanline sweep ──────────────────────────────────────────────────────────
function Scanline() {
  return (
    <div style={{
      position:   "absolute",
      left:       0,
      right:      0,
      height:     3,
      top:        0,
      background: "linear-gradient(90deg, transparent 0%, rgba(124,224,255,0.18) 20%, rgba(124,224,255,0.35) 50%, rgba(124,224,255,0.18) 80%, transparent 100%)",
      animation:  "ts-scanline 8s linear 1.5s infinite",
      pointerEvents: "none",
      zIndex:     8,
    }} />
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
interface Props {
  onComplete:   () => void;
  isFirstVisit: boolean;
}

export function TitleScreen({ onComplete, isFirstVisit }: Props) {
  const [phase, setPhase]       = useState<"title" | "intro" | "done">(isFirstVisit ? "title" : "done");
  const [lineIdx, setLineIdx]   = useState(0);
  const [shown,  setShown]      = useState(0);
  const [textDone, setTextDone] = useState(false);
  const [mermanReady, setMermanReady] = useState(false);

  // Pre-load Mermander sprite
  useEffect(() => {
    const img = getSprite(PLAYER_FRONT_URL.mermander);
    if (isReady(img)) { setMermanReady(true); return; }
    const t = setInterval(() => {
      if (isReady(img)) { setMermanReady(true); clearInterval(t); }
    }, 80);
    return () => clearInterval(t);
  }, []);

  // Skip everything if not first visit
  useEffect(() => {
    if (!isFirstVisit) onComplete();
  }, [isFirstVisit, onComplete]);

  // Typewriter for intro phase
  const currentLine = INTRO_LINES[lineIdx];
  useEffect(() => {
    if (phase !== "intro") return;
    setShown(0);
    setTextDone(false);
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i++;
      if (i >= currentLine.text.length) { setShown(currentLine.text.length); setTextDone(true); return; }
      setShown(i);
      setTimeout(tick, FRAME_MS);
    };
    const id = setTimeout(tick, FRAME_MS);
    return () => { cancelled = true; clearTimeout(id); };
  }, [lineIdx, phase, currentLine.text]);

  function advance() {
    if (phase === "title") { setPhase("intro"); return; }
    if (phase === "intro") {
      if (!textDone) { setShown(currentLine.text.length); setTextDone(true); return; }
      if (lineIdx < INTRO_LINES.length - 1) { setLineIdx(l => l + 1); }
      else { setPhase("done"); onComplete(); }
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "z", "Z", "Escape"].includes(e.key)) { e.preventDefault(); advance(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "done") return null;

  const profUrl = LEADER_URL.prehype;

  return (
    <div
      style={{
        position:   "absolute", inset: 0, zIndex: 100,
        display:    "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, #010208 0%, #040b1e 40%, #060d22 100%)",
        overflow:   "hidden", cursor: "pointer",
        fontFamily: "var(--font-pixel)",
      }}
      onClick={advance}
    >
      <style>{STYLES}</style>
      <TitleBgLayer />
      <Starfield />
      <Scanline />

      {/* Nebula blobs */}
      <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"50%", height:"60%",
        background:"radial-gradient(ellipse, rgba(124,100,255,0.13) 0%, transparent 70%)",
        filter:"blur(40px)", animation:"ts-bg-pulse 6s ease-in-out infinite",
        pointerEvents:"none", zIndex:1 }} />
      <div style={{ position:"absolute", bottom:"-5%", right:"-5%", width:"45%", height:"55%",
        background:"radial-gradient(ellipse, rgba(0,232,160,0.09) 0%, transparent 70%)",
        filter:"blur(50px)", animation:"ts-bg-pulse 8s ease-in-out 2s infinite alternate",
        pointerEvents:"none", zIndex:1 }} />

      {/* ── TITLE PHASE ────────────────────────────────────────── */}
      {phase === "title" && (
        <div style={{ textAlign:"center", position:"relative", zIndex:5 }}>

          {/* Glow ring behind Mermander */}
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            width:180, height:180,
            transform:"translate(-50%,-70%)",
            borderRadius:"50%",
            background:"radial-gradient(circle, rgba(124,224,255,0.22) 0%, transparent 68%)",
            animation:"ts-glow-ring 2.8s ease-out infinite",
            pointerEvents:"none",
          }} />

          {/* Mermander sprite */}
          <div style={{ animation:"ts-merman-bob 2.2s ease-in-out infinite", marginBottom:8, display:"flex", justifyContent:"center" }}>
            {mermanReady ? (
              <img
                src={PLAYER_FRONT_URL.mermander}
                alt="Mermander"
                style={{ width:160, height:160, imageRendering:"pixelated",
                         animation:"ts-merman-glow 2.2s ease-in-out infinite" }}
              />
            ) : (
              <div style={{ width:160, height:160,
                background:"radial-gradient(ellipse, rgba(124,224,255,0.15) 0%, transparent 70%)",
                borderRadius:"50%" }} />
            )}
          </div>

          {/* Badge label */}
          <div style={{ fontSize:7, color:"#3a5a80", letterSpacing:"0.3em", marginBottom:18,
            animation:"ts-sub-in 0.55s ease-out 0.15s both" }}>
            ★ A PLAYABLE PORTFOLIO
          </div>

          {/* Title — drop animation, dual colour */}
          <div style={{ animation:"ts-title-drop 0.75s cubic-bezier(0.22,1,0.36,1) 0.05s both" }}>
            <div style={{
              fontFamily: "var(--font-pixel)",
              fontSize:   "clamp(30px, 7.5vw, 56px)",
              lineHeight: 1.05,
              color:      "#7ce0ff",
              textShadow: "0 6px 0 #0a2040, 0 0 50px rgba(124,224,255,0.55)",
              letterSpacing: "0.03em",
            }}>CAREER</div>
            <div style={{
              fontFamily: "var(--font-pixel)",
              fontSize:   "clamp(30px, 7.5vw, 56px)",
              lineHeight: 1.05,
              color:      "#ffd24a",
              textShadow: "0 6px 0 #3a1a00, 0 0 50px rgba(255,210,74,0.45)",
              letterSpacing: "0.03em",
              marginBottom: 10,
            }}>QUEST</div>
          </div>

          {/* Subtitle */}
          <div style={{ fontSize:7, color:"#5570aa", letterSpacing:"0.15em",
            animation:"ts-sub-in 0.5s ease-out 0.6s both" }}>
            FIFTEEN YEARS OF BUILDING
          </div>

          {/* PRESS START pill */}
          <div style={{
            display:"inline-block",
            marginTop: 32,
            padding: "10px 20px",
            background: "rgba(124,224,255,0.06)",
            border: "1px solid rgba(124,224,255,0.18)",
            animation: "ts-pill-in 0.4s ease-out 0.9s both",
          }}>
            <div style={{ fontSize:8, color:"#7ce0ff",
              animation:"ts-press-blink 1.4s step-end infinite", letterSpacing:"0.12em" }}>
              ▶ PRESS START
            </div>
          </div>

          {/* Hint */}
          <div style={{ fontSize:6, color:"#2a3a50", marginTop:10, letterSpacing:"0.08em",
            animation:"ts-sub-in 0.4s ease-out 1.1s both" }}>
            SPACE · ENTER · TAP
          </div>
        </div>
      )}

      {/* ── INTRO PHASE ────────────────────────────────────────── */}
      {phase === "intro" && (
        <div style={{
          position:"relative", zIndex:5,
          width:"100%", maxWidth:580,
          padding:"0 16px",
          display:"flex", flexDirection:"column",
          alignItems:"center", gap:18,
        }}>

          {/* Prof portrait */}
          <div style={{ animation:"ts-prof-in 0.45s cubic-bezier(0.34,1.4,0.64,1) both", position:"relative" }}>
            {/* Outer glow halo */}
            <div style={{
              position:"absolute", inset:-16, borderRadius:"50%",
              background:"radial-gradient(circle, rgba(168,211,154,0.28) 0%, transparent 70%)",
              animation:"ts-bg-pulse 1.8s ease-in-out infinite",
            }} />
            <div style={{
              width:96, height:96,
              border:"2px solid rgba(168,211,154,0.65)",
              background:"rgba(168,211,154,0.09)",
              display:"flex", alignItems:"center", justifyContent:"center",
              overflow:"hidden", position:"relative",
              boxShadow:"0 0 28px rgba(168,211,154,0.3), 0 4px 0 rgba(0,0,0,0.5)",
            }}>
              <img
                src={profUrl}
                alt="Prof. Iterate"
                style={{ width:88, height:88, imageRendering:"pixelated" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          </div>

          {/* Dialog box */}
          <div style={{
            width:"100%",
            background:"#07101e",
            border:"2px solid #2a4a3a",
            boxShadow:"inset 0 -2px 0 rgba(0,0,0,0.4), 0 0 24px rgba(168,211,154,0.12)",
            animation:"ts-dialog-in 0.3s ease-out both",
          }}>
            {/* Header bar */}
            <div style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"9px 14px",
              borderBottom:"1px solid rgba(168,211,154,0.18)",
              background:"linear-gradient(135deg, rgba(168,211,154,0.12) 0%, transparent 60%)",
            }}>
              <div>
                <div style={{ fontSize:10, color:"#b8e8a8", letterSpacing:"0.06em" }}>
                  {currentLine.speaker}
                </div>
                <div style={{ fontSize:7, color:"#5570aa", marginTop:3 }}>
                  {currentLine.role}
                </div>
              </div>
              <div style={{ marginLeft:"auto", display:"flex", gap:4, alignItems:"center" }}>
                {INTRO_LINES.map((_, i) => (
                  <div key={i} style={{
                    width:6, height:6, borderRadius:"50%",
                    background: i === lineIdx ? "#b8e8a8" : i < lineIdx ? "rgba(184,232,168,0.4)" : "rgba(184,232,168,0.12)",
                    border:"1px solid rgba(168,211,154,0.35)",
                    transition:"background 0.25s",
                  }} />
                ))}
              </div>
            </div>

            {/* Text body */}
            <div style={{ padding:"14px 16px 18px" }}>
              <div style={{
                fontFamily:"var(--font-mono)", fontSize:16,
                lineHeight:1.6, color:"#c8d8f0",
                whiteSpace:"pre-wrap", minHeight:88,
              }}>
                {currentLine.text.slice(0, shown)}
                {!textDone && (
                  <span style={{ animation:"ts-cursor 0.8s step-end infinite" }}>▌</span>
                )}
              </div>
            </div>
          </div>

          {/* Advance hint */}
          {textDone && (
            <div style={{
              fontSize:7, color:"#5588aa", letterSpacing:"0.12em",
              animation:"ts-advance-pulse 1.1s ease-in-out infinite",
            }}>
              {lineIdx < INTRO_LINES.length - 1 ? "▶ CONTINUE" : "▶ BEGIN QUEST"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
