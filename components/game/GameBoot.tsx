"use client";
import { useEffect, useState } from "react";
import { preloadAllSprites, POKEBALL_URL } from "@/game/sprite-registry";

const BOOT_STYLES = `
@keyframes gb-spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes gb-title-in  { 0%{opacity:0;transform:translateY(-16px) scale(0.9)} 100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes gb-sub-in    { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes gb-ball-in   { 0%{opacity:0;transform:scale(0.6) translateY(12px)} 60%{transform:scale(1.08) translateY(-3px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
@keyframes gb-dot-pulse { 0%,80%,100%{opacity:0.2;transform:translateY(0)} 40%{opacity:1;transform:translateY(-4px)} }
@keyframes gb-scanline  { 0%{top:-3px;opacity:0} 5%{opacity:1} 95%{opacity:0.6} 100%{top:100%;opacity:0} }
@keyframes gb-star-tw   { 0%,100%{opacity:0.1} 50%{opacity:0.5} }
@keyframes gb-glow-pulse{ 0%,100%{opacity:0.45} 50%{opacity:0.8} }
@keyframes gb-bar-shine { 0%{left:-40%} 100%{left:140%} }
`;

function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", marginTop: 10 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5,
          borderRadius: "50%",
          background: "#3a5888",
          animation: `gb-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

export function GameBoot({ children }: { children: React.ReactNode }) {
  const [ready,       setReady]       = useState(false);
  const [minTimePast, setMinTimePast] = useState(false);
  const [phase, setPhase] = useState<"sprites" | "world" | "done">("sprites");

  useEffect(() => {
    let cancelled = false;
    setPhase("sprites");
    preloadAllSprites().then(() => {
      if (!cancelled) {
        setPhase("done");
        setReady(true);
      }
    });
    const t = setTimeout(() => setMinTimePast(true), 900);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const show = ready && minTimePast;

  return (
    <>
      {show ? children : null}
      {!show && (
        <div style={{
          position:      "fixed", inset: 0, zIndex: 50,
          display:       "flex", flexDirection: "column",
          alignItems:    "center", justifyContent: "center",
          background:    "linear-gradient(180deg, #04080f 0%, #070e1a 40%, #0a1428 100%)",
          paddingTop:    "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          overflow:      "hidden",
          fontFamily:    "var(--font-pixel)",
        }}>
          <style>{BOOT_STYLES}</style>

          {/* Stars */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {Array.from({ length: 60 }, (_, i) => (
              <div key={i} style={{
                position:     "absolute",
                left:         `${(i * 47.3 + 9) % 100}%`,
                top:          `${(i * 61.7 + 5) % 100}%`,
                width:        i % 9 === 0 ? 2 : 1,
                height:       i % 9 === 0 ? 2 : 1,
                background:   i % 4 === 0 ? "#7ce0ff" : i % 3 === 0 ? "#c89af0" : "#fff",
                borderRadius: "50%",
                opacity:      0.08 + (i % 5) * 0.05,
                animation:    `gb-star-tw ${2 + (i % 4) * 0.6}s ease-in-out ${(i % 6) * 0.35}s infinite`,
              }} />
            ))}
          </div>

          {/* Nebula blobs */}
          <div style={{
            position: "absolute", top: "-15%", left: "-10%",
            width: "55%", height: "65%",
            background: "radial-gradient(ellipse, rgba(124,100,255,0.1) 0%, transparent 70%)",
            filter: "blur(50px)",
            animation: "gb-glow-pulse 5s ease-in-out infinite",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-10%", right: "-5%",
            width: "45%", height: "50%",
            background: "radial-gradient(ellipse, rgba(0,200,140,0.07) 0%, transparent 70%)",
            filter: "blur(55px)",
            animation: "gb-glow-pulse 7s ease-in-out 2s infinite alternate",
            pointerEvents: "none",
          }} />

          {/* Scanline sweep */}
          <div style={{
            position:   "absolute", left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, transparent 0%, rgba(124,224,255,0.15) 20%, rgba(124,224,255,0.3) 50%, rgba(124,224,255,0.15) 80%, transparent 100%)",
            animation:  "gb-scanline 7s linear 1s infinite",
            pointerEvents: "none",
            zIndex: 8,
          }} />

          {/* Content */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 5 }}>

            {/* Badge */}
            <div style={{
              fontFamily:    "var(--font-pixel)",
              fontSize:      7,
              color:         "#3a5a80",
              letterSpacing: "0.28em",
              marginBottom:  22,
              animation:     "gb-sub-in 0.5s ease-out 0.1s both",
            }}>
              ★ FIFTEEN YEARS IN THE MAKING
            </div>

            {/* PARAM QUEST inline */}
            <div style={{
              display:       "flex",
              alignItems:    "baseline",
              justifyContent: "center",
              gap:           16,
              marginBottom:  36,
              animation:     "gb-title-in 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s both",
            }}>
              <span style={{
                fontFamily:  "var(--font-pixel)",
                fontSize:    "clamp(24px, 6vw, 42px)",
                color:       "#7ce0ff",
                lineHeight:  1.1,
                textShadow:  "0 5px 0 #0a2040, 0 0 40px rgba(124,224,255,0.5)",
                letterSpacing: "0.03em",
              }}>PARAM</span>
              <span style={{
                fontFamily:  "var(--font-pixel)",
                fontSize:    "clamp(24px, 6vw, 42px)",
                color:       "#ffd24a",
                lineHeight:  1.1,
                textShadow:  "0 5px 0 #3a1a00, 0 0 40px rgba(255,210,74,0.4)",
                letterSpacing: "0.03em",
              }}>QUEST</span>
            </div>

            {/* Pokéball spinner */}
            <div style={{ animation: "gb-ball-in 0.55s cubic-bezier(0.34,1.4,0.64,1) 0.45s both" }}>
              {/* Glow ring */}
              <div style={{
                width:        80, height: 80,
                margin:       "0 auto",
                borderRadius: "50%",
                background:   "radial-gradient(circle, rgba(124,224,255,0.2) 0%, transparent 70%)",
                animation:    "gb-glow-pulse 1.6s ease-in-out infinite",
                position:     "relative",
              }}>
                <img
                  src={POKEBALL_URL}
                  alt=""
                  style={{
                    position:        "absolute",
                    inset:           8,
                    width:           64,
                    height:          64,
                    imageRendering:  "pixelated",
                    filter:          "drop-shadow(0 4px 0 rgba(0,0,0,0.55))",
                    animation:       "gb-spin 1.3s linear infinite",
                  }}
                />
              </div>
            </div>

            {/* NOW LOADING + progress */}
            <div style={{
              fontFamily:    "var(--font-pixel)",
              fontSize:      8,
              color:         "#3a5070",
              marginTop:     22,
              letterSpacing: "0.22em",
              animation:     "gb-sub-in 0.45s ease-out 0.7s both",
            }}>
              {phase === "sprites" ? "LOADING SPRITES" : "READY"}
            </div>

            {/* Progress bar */}
            <div style={{
              width: 160,
              height: 6,
              margin: "12px auto 0",
              background: "rgba(30,50,80,0.5)",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid rgba(124,224,255,0.2)",
            }}>
              <div style={{
                width: phase === "done" ? "100%" : "65%",
                height: "100%",
                background: "linear-gradient(90deg, #2a78c0, #7ce0ff)",
                borderRadius: 3,
                transition: "width 0.6s ease-out",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  width: "30%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "gb-bar-shine 1.5s linear infinite",
                }} />
              </div>
            </div>
            <LoadingDots />
          </div>
        </div>
      )}
    </>
  );
}
