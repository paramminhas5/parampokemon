"use client";
import { useEffect, useState } from "react";
import type { StarterStage } from "@/game/data";
import { STARTER_STAGES } from "@/game/data";
import { PLAYER_FRONT_URL } from "@/game/sprite-registry";

const EVOLVE_STYLES = `
@keyframes evo-bg-flash  { 0%,100%{opacity:0} 10%,90%{opacity:1} 40%,60%{opacity:0.5} }
@keyframes evo-white-in  { 0%{opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
@keyframes evo-shake     { 0%,100%{transform:translateX(0) scale(1)} 10%{transform:translateX(-6px) scale(0.98)} 20%{transform:translateX(6px) scale(1.02)} 30%{transform:translateX(-8px) scale(0.97)} 40%{transform:translateX(8px) scale(1.03)} 50%{transform:translateX(-10px) scale(0.96)} 60%{transform:translateX(10px) scale(1.04)} 70%{transform:translateX(-12px) scale(0.95)} 80%{transform:translateX(12px) scale(1.05)} 90%{transform:translateX(-6px) scale(0.98)} }
@keyframes evo-scale-in  { 0%{transform:scale(0) rotate(-15deg);opacity:0;filter:brightness(5)} 30%{transform:scale(1.4) rotate(5deg);opacity:1;filter:brightness(2)} 60%{transform:scale(0.9) rotate(-2deg);filter:brightness(1.2)} 80%{transform:scale(1.05) rotate(1deg);filter:brightness(1)} 100%{transform:scale(1) rotate(0deg);filter:brightness(1)} }
@keyframes evo-title-in  { 0%{opacity:0;transform:translateY(16px) scale(0.9)} 100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes evo-sparkle   { 0%{opacity:0;transform:scale(0) rotate(0deg)} 40%{opacity:1;transform:scale(1.5) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
@keyframes evo-ring      { 0%{transform:scale(0.3);opacity:1} 100%{transform:scale(4);opacity:0} }
@keyframes evo-done-fade { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes evo-glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
@keyframes evo-silhouette { 0%{filter:brightness(0) invert(1)} 100%{filter:brightness(1) invert(0)} }
@keyframes evo-explode   { 0%{transform:scale(1);opacity:1} 100%{transform:scale(0);opacity:0} }
@keyframes evo-crown     { 0%{transform:scale(0) rotate(-30deg);opacity:0} 50%{transform:scale(1.3) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes evo-hp-fill   { 0%{width:0%} 100%{width:100%} }
@keyframes evo-screen-shake { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-3px,-2px)} 20%{transform:translate(3px,2px)} 30%{transform:translate(-2px,3px)} 40%{transform:translate(2px,-3px)} 50%{transform:translate(-3px,1px)} 60%{transform:translate(3px,-1px)} 70%{transform:translate(-1px,3px)} 80%{transform:translate(1px,-2px)} 90%{transform:translate(-2px,1px)} }
`;

interface Props {
  fromStage: StarterStage;
  toStage: StarterStage;
  onComplete: () => void;
}

export function EvolutionCutscene({ fromStage, toStage, onComplete }: Props) {
  const [phase, setPhase] = useState<"shake" | "white" | "reveal" | "done">("shake");

  useEffect(() => {
    // Extended timings for epic feel
    const t1 = setTimeout(() => setPhase("white"),  1400);  // longer shake buildup
    const t2 = setTimeout(() => setPhase("reveal"), 2600);  // longer white flash
    const t3 = setTimeout(() => setPhase("done"),   4200);  // longer reveal celebration
    const t4 = setTimeout(() => onComplete(),       6500);  // more time to admire
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const fromUrl = PLAYER_FRONT_URL[fromStage.id] ?? PLAYER_FRONT_URL.mermander;
  const toUrl   = PLAYER_FRONT_URL[toStage.id]   ?? PLAYER_FRONT_URL.mermander;

  const isWhitePhase = phase === "white";
  const isReveal     = phase === "reveal" || phase === "done";

  // Sparkle positions — deterministic, MORE particles for epic feel
  const sparkles = Array.from({ length: 24 }, (_, i) => ({
    x: 10 + (i * 37.3) % 80,
    y: 5 + (i * 47.1) % 90,
    delay: (i * 0.1) % 2.0,
    size: i % 4 === 0 ? 10 : i % 3 === 0 ? 7 : i % 2 === 0 ? 5 : 3,
    color: [fromStage.color, toStage.color, "#fff", "#ffd24a", toStage.color, "#fff"][i % 6],
  }));

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 70,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: isWhitePhase
        ? "#ffffff"
        : isReveal
          ? `radial-gradient(ellipse at center, ${toStage.color}28 0%, #010510 55%)`
          : `radial-gradient(ellipse at center, ${fromStage.color}18 0%, #010308 60%)`,
      transition: "background 0.5s",
      overflow: "hidden",
      animation: phase === "shake" ? "evo-screen-shake 0.2s ease-in-out infinite" : "none",
    }}>
      <style>{EVOLVE_STYLES}</style>

      {/* White flash */}
      {isWhitePhase && (
        <div style={{ position: "absolute", inset: 0, background: "#ffffff", animation: "evo-white-in 1.2s ease-in-out", zIndex: 2 }} />
      )}

      {/* Expanding rings — MORE for epic feel */}
      {isReveal && [0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          position: "absolute", width: 180, height: 180,
          borderRadius: "50%",
          border: `${3 - i * 0.4}px solid ${toStage.color}${i === 0 ? "ff" : i === 1 ? "cc" : i === 2 ? "88" : i === 3 ? "55" : "33"}`,
          animation: `evo-ring 1.8s ease-out ${i * 0.18}s both`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Sparkles */}
      {sparkles.map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: s.color,
          boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          animation: `evo-sparkle 1s ease-in-out ${s.delay}s both`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Sprite container */}
      <div style={{ position: "relative", zIndex: 3, marginBottom: 32 }}>
        {/* Glow halo behind sprite */}
        <div style={{
          position: "absolute", inset: -24,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${isReveal ? toStage.color : fromStage.color}40 0%, transparent 70%)`,
          animation: "evo-glow-pulse 0.8s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Old sprite — violent shake then silhouette */}
        {!isReveal && (
          <img
            src={fromUrl}
            alt={fromStage.name}
            style={{
              width: 192, height: 192,
              imageRendering: "pixelated",
              display: "block",
              animation: phase === "shake"
                ? "evo-shake 0.15s ease-in-out infinite"
                : "none",
              filter: isWhitePhase
                ? "brightness(100) saturate(0)"
                : "drop-shadow(0 0 16px " + fromStage.color + ")",
              transition: "filter 0.25s",
            }}
          />
        )}

        {/* New sprite — EPIC scale in with bounce on reveal */}
        {isReveal && (
          <img
            src={toUrl}
            alt={toStage.name}
            style={{
              width: 220, height: 220,
              imageRendering: "pixelated",
              display: "block",
              animation: "evo-scale-in 1.2s cubic-bezier(0.34,1.56,0.64,1) both",
              filter: `drop-shadow(0 0 32px ${toStage.color}) drop-shadow(0 0 64px ${toStage.color}88) drop-shadow(0 0 96px ${toStage.color}44)`,
            }}
          />
        )}
      </div>

      {/* Text */}
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 24px" }}>
        {phase === "shake" && (
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 11, color: fromStage.color,
            animation: "evo-title-in 0.4s ease-out",
            textShadow: `0 0 20px ${fromStage.color}`,
          }}>
            What?! {fromStage.name.toUpperCase()} is evolving!
          </div>
        )}

        {isReveal && (
          <div style={{ animation: "evo-done-fade 0.6s ease-out" }}>
            {/* Crown/star burst */}
            <div style={{
              fontSize: 28, textAlign: "center", marginBottom: 8,
              animation: "evo-crown 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
            }}>
              ★
            </div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 7,
              color: toStage.color, opacity: 0.8,
              letterSpacing: "0.22em", marginBottom: 10,
              textAlign: "center",
            }}>
              ★ EVOLUTION COMPLETE ★
            </div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 26,
              color: toStage.color,
              textShadow: `0 0 30px ${toStage.color}, 0 0 60px ${toStage.color}66, 0 4px 0 rgba(0,0,0,0.5)`,
              marginBottom: 8, lineHeight: 1.1,
              textAlign: "center",
            }}>
              {toStage.name.toUpperCase()}
            </div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 9,
              color: "#7a9aaa", letterSpacing: "0.1em", marginBottom: 16,
              textAlign: "center",
            }}>
              {toStage.tag}
            </div>
            {/* HP bar dramatic fill */}
            <div style={{ width: 200, margin: "0 auto 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070", marginBottom: 4 }}>
                HP {toStage.hp}
              </div>
              <div style={{ height: 6, background: "#0d1527", borderRadius: 3, overflow: "hidden", border: `1px solid ${toStage.color}40` }}>
                <div style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${toStage.color}cc, ${toStage.color}, #fff)`,
                  borderRadius: 3,
                  animation: "evo-hp-fill 1.2s ease-out 0.4s both",
                  boxShadow: `0 0 8px ${toStage.color}`,
                }} />
              </div>
            </div>
            <div style={{
              display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center",
              width: "100%",
            }}>
              <span style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                background: `${toStage.color}18`, border: `1px solid ${toStage.color}50`,
                color: toStage.color, padding: "4px 10px", borderRadius: 99,
              }}>POWER UP</span>
              <span style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                background: "rgba(255,210,74,0.1)", border: "1px solid rgba(255,210,74,0.3)",
                color: "#ffd24a", padding: "4px 10px", borderRadius: 99,
              }}>{toStage.baseMoves.length} NEW MOVES</span>
            </div>
          </div>
        )}

        {phase === "done" && (
          <button
            onClick={onComplete}
            style={{
              marginTop: 28,
              background: `linear-gradient(135deg, ${toStage.color}22 0%, ${toStage.color}0a 100%)`,
              border: `2px solid ${toStage.color}70`,
              color: toStage.color,
              padding: "14px 32px",
              fontFamily: "var(--font-pixel)", fontSize: 10,
              cursor: "pointer",
              boxShadow: `0 0 20px ${toStage.color}30`,
              animation: "evo-done-fade 0.8s 0.3s ease-out both",
              letterSpacing: "0.08em",
            }}
          >
            CONTINUE ▶
          </button>
        )}
      </div>
    </div>
  );
}

/** Check if a skill orb collection triggers an evolution. Returns the stage pair or null. */
export function checkEvolution(prevSkills: number, newSkills: number): { from: StarterStage; to: StarterStage } | null {
  // Mermalion at 4 skills, Merlord at 7 skills
  const thresholds = [4, 7];
  for (let idx = 0; idx < thresholds.length; idx++) {
    const threshold = thresholds[idx];
    if (prevSkills < threshold && newSkills >= threshold) {
      return { from: STARTER_STAGES[idx], to: STARTER_STAGES[idx + 1] };
    }
  }
  return null;
}
