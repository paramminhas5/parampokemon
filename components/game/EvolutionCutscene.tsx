"use client";
import { useEffect, useRef, useState } from "react";
import type { StarterStage } from "@/game/data";
import { STARTER_STAGES } from "@/game/data";
import { drawStarter } from "@/game/sprites";

const EVOLVE_STYLES = `
@keyframes evo-bg-flash  { 0%,100%{opacity:0} 10%,90%{opacity:1} 40%,60%{opacity:0.5} }
@keyframes evo-white-in  { 0%{opacity:0} 30%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
@keyframes evo-shake     { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
@keyframes evo-scale-in  { 0%{transform:scale(0.4);opacity:0} 60%{transform:scale(1.12);opacity:1} 100%{transform:scale(1)} }
@keyframes evo-title-in  { 0%{opacity:0;transform:translateY(16px) scale(0.9)} 100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes evo-sparkle   { 0%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0)} }
@keyframes evo-ring      { 0%{transform:scale(0.5);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
@keyframes evo-done-fade { 0%{opacity:0} 100%{opacity:1} }
`;

interface Props {
  fromStage: StarterStage;
  toStage: StarterStage;
  onComplete: () => void;
}

export function EvolutionCutscene({ fromStage, toStage, onComplete }: Props) {
  const [phase, setPhase] = useState<"shake"|"white"|"reveal"|"done">("shake");
  const [frame, setFrame] = useState(0);
  const oldRef  = useRef<HTMLCanvasElement>(null);
  const newRef  = useRef<HTMLCanvasElement>(null);
  const rafRef  = useRef(0);
  const startRef = useRef(performance.now());

  // Advance phases
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("white"),   900);
    const t2 = setTimeout(() => setPhase("reveal"),  1800);
    const t3 = setTimeout(() => setPhase("done"),    3200);
    const t4 = setTimeout(() => onComplete(),        4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  // Sprite animation
  useEffect(() => {
    const loop = (now: number) => {
      const t = (now - startRef.current) / 100;
      setFrame(t);
      if (oldRef.current) {
        const c = oldRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 160, 160);
        drawStarter(c, fromStage.id, "front", 10, 10, 4.5, t);
      }
      if (newRef.current) {
        const c = newRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 160, 160);
        drawStarter(c, toStage.id, "front", 10, 10, 4.5, t);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fromStage.id, toStage.id]);

  // Sparkle positions (deterministic)
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    x: 30 + (i * 37 % 140),
    y: 20 + (i * 53 % 120),
    delay: (i * 0.18) % 1.5,
    color: [fromStage.color, toStage.color, "#fff", "#ffd24a"][i % 4],
  }));

  const isWhitePhase = phase === "white";
  const isReveal     = phase === "reveal" || phase === "done";

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 70,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: isWhitePhase
        ? "#ffffff"
        : `radial-gradient(ellipse at center, ${toStage.color}30 0%, #010308 60%)`,
      transition: "background 0.4s",
      overflow: "hidden",
    }}>
      <style>{EVOLVE_STYLES}</style>

      {/* Flash overlay */}
      {isWhitePhase && (
        <div style={{ position:"absolute", inset:0, background:"#ffffff", animation:"evo-white-in 0.8s ease-in-out", zIndex:2 }} />
      )}

      {/* Expanding rings */}
      {isReveal && [0,1,2].map(i => (
        <div key={i} style={{
          position:"absolute", width:200, height:200,
          borderRadius:"50%", border:`2px solid ${toStage.color}`,
          animation:`evo-ring 1.2s ease-out ${i*0.3}s both`,
          pointerEvents:"none",
        }} />
      ))}

      {/* Sparkles */}
      {sparkles.map((s,i) => (
        <div key={i} style={{
          position:"absolute", left:s.x, top:s.y,
          width:6, height:6, borderRadius:"50%",
          background:s.color,
          boxShadow:`0 0 8px ${s.color}`,
          animation:`evo-sparkle 0.8s ease-in-out ${s.delay}s both`,
          pointerEvents:"none",
        }} />
      ))}

      {/* Sprite container */}
      <div style={{ position:"relative", zIndex:3, marginBottom:24 }}>
        {/* Old sprite (shake → disappear) */}
        {!isReveal && (
          <canvas ref={oldRef} width={160} height={160} style={{
            imageRendering:"pixelated", width:160, height:160,
            animation: phase==="shake" ? "evo-shake 0.18s ease-in-out infinite" : "none",
            filter: isWhitePhase ? "brightness(10)" : "none",
            transition: "filter 0.3s",
          }} />
        )}
        {/* New sprite (scale in on reveal) */}
        {isReveal && (
          <canvas ref={newRef} width={160} height={160} style={{
            imageRendering:"pixelated", width:160, height:160,
            animation:"evo-scale-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
            filter:`drop-shadow(0 0 24px ${toStage.color})`,
          }} />
        )}
      </div>

      {/* Text */}
      <div style={{ position:"relative", zIndex:3, textAlign:"center" }}>
        {phase === "shake" && (
          <div style={{ fontFamily:"var(--font-pixel)", fontSize:10, color:fromStage.color, animation:"evo-title-in 0.4s ease-out" }}>
            What?! {fromStage.name.toUpperCase()} is evolving!
          </div>
        )}
        {isReveal && (
          <div style={{ animation:"evo-done-fade 0.6s ease-out" }}>
            <div style={{ fontFamily:"var(--font-pixel)", fontSize:7, color:"#3a5070", marginBottom:8, letterSpacing:"0.15em" }}>
              ★ EVOLUTION COMPLETE
            </div>
            <div style={{ fontFamily:"var(--font-pixel)", fontSize:18, color:toStage.color, textShadow:`0 0 30px ${toStage.color}`, marginBottom:6 }}>
              {toStage.name.toUpperCase()}
            </div>
            <div style={{ fontFamily:"var(--font-pixel)", fontSize:8, color:"#7a9aaa", letterSpacing:"0.08em" }}>
              {toStage.tag}
            </div>
            <div style={{ fontFamily:"var(--font-pixel)", fontSize:7, color:"#3a5070", marginTop:12 }}>
              HP {toStage.hp} · {toStage.baseMoves.length} BASE MOVES
            </div>
          </div>
        )}
        {phase === "done" && (
          <button onClick={onComplete} style={{ marginTop:24, background:`${toStage.color}18`, border:`1px solid ${toStage.color}60`, color:toStage.color, padding:"12px 28px", fontFamily:"var(--font-pixel)", fontSize:9, cursor:"pointer", borderRadius:3, animation:"evo-done-fade 0.8s 0.4s ease-out both" }}>
            CONTINUE ▶
          </button>
        )}
      </div>
    </div>
  );
}

/** Check if a badge count triggers an evolution. Returns the new stage or null. */
export function checkEvolution(prevBadges: number, newBadges: number): { from: StarterStage; to: StarterStage } | null {
  for (const stage of STARTER_STAGES) {
    if (stage.minBadges > 0 && prevBadges < stage.minBadges && newBadges >= stage.minBadges) {
      const prevStage = STARTER_STAGES.find(s => s.minBadges < stage.minBadges && (STARTER_STAGES.find(s2 => s2.minBadges > s.minBadges && s2.minBadges <= stage.minBadges) === undefined)) ?? STARTER_STAGES[0];
      const idx = STARTER_STAGES.indexOf(stage);
      if (idx > 0) return { from: STARTER_STAGES[idx - 1], to: stage };
    }
  }
  return null;
}
