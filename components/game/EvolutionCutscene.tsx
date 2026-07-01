"use client";
import { useEffect, useState } from "react";
import type { StarterStage } from "@/game/data";
import { STARTER_STAGES } from "@/game/data";
import { PLAYER_FRONT_URL } from "@/game/sprite-registry";

const EVOLVE_STYLES = `
@keyframes evo-bg-flash  { 0%,100%{opacity:0} 10%,90%{opacity:1} 40%,60%{opacity:0.5} }
@keyframes evo-white-in  { 0%{opacity:0} 30%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
@keyframes evo-shake     { 0%,100%{transform:translateX(0) scale(1)} 25%{transform:translateX(-8px) scale(0.97)} 75%{transform:translateX(8px) scale(1.03)} }
@keyframes evo-scale-in  { 0%{transform:scale(0.3) rotate(-8deg);opacity:0;filter:brightness(4)} 60%{transform:scale(1.1) rotate(2deg);opacity:1;filter:brightness(1.2)} 100%{transform:scale(1) rotate(0deg);filter:brightness(1)} }
@keyframes evo-title-in  { 0%{opacity:0;transform:translateY(16px) scale(0.9)} 100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes evo-sparkle   { 0%{opacity:0;transform:scale(0) rotate(0deg)} 40%{opacity:1;transform:scale(1.2) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
@keyframes evo-ring      { 0%{transform:scale(0.5);opacity:0.9} 100%{transform:scale(3);opacity:0} }
@keyframes evo-done-fade { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes evo-glow-pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
@keyframes evo-silhouette { 0%{filter:brightness(0) invert(1)} 100%{filter:brightness(1) invert(0)} }
`;

interface Props {
  fromStage: StarterStage;
  toStage: StarterStage;
  onComplete: () => void;
}

export function EvolutionCutscene({ fromStage, toStage, onComplete }: Props) {
  const [phase, setPhase] = useState<"shake" | "white" | "reveal" | "done">("shake");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("white"),  900);
    const t2 = setTimeout(() => setPhase("reveal"), 1800);
    const t3 = setTimeout(() => setPhase("done"),   3200);
    const t4 = setTimeout(() => onComplete(),       5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const fromUrl = PLAYER_FRONT_URL[fromStage.id] ?? PLAYER_FRONT_URL.mermander;
  const toUrl   = PLAYER_FRONT_URL[toStage.id]   ?? PLAYER_FRONT_URL.mermander;

  const isWhitePhase = phase === "white";
  const isReveal     = phase === "reveal" || phase === "done";

  // Sparkle positions — deterministic
  const sparkles = Array.from({ length: 16 }, (_, i) => ({
    x: 15 + (i * 41.7) % 70,
    y: 10 + (i * 53.3) % 80,
    delay: (i * 0.14) % 1.6,
    size: i % 3 === 0 ? 8 : i % 2 === 0 ? 5 : 3,
    color: [fromStage.color, toStage.color, "#fff", "#ffd24a", toStage.color][i % 5],
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
    }}>
      <style>{EVOLVE_STYLES}</style>

      {/* White flash */}
      {isWhitePhase && (
        <div style={{ position: "absolute", inset: 0, background: "#ffffff", animation: "evo-white-in 0.8s ease-in-out", zIndex: 2 }} />
      )}

      {/* Expanding rings */}
      {isReveal && [0, 1, 2, 3].map(i => (
        <div key={i} style={{
          position: "absolute", width: 220, height: 220,
          borderRadius: "50%", border: `2px solid ${toStage.color}${i === 0 ? "ff" : i === 1 ? "aa" : i === 2 ? "66" : "33"}`,
          animation: `evo-ring 1.4s ease-out ${i * 0.22}s both`,
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

        {/* Old sprite — shake then silhouette */}
        {!isReveal && (
          <img
            src={fromUrl}
            alt={fromStage.name}
            style={{
              width: 192, height: 192,
              imageRendering: "pixelated",
              display: "block",
              animation: phase === "shake"
                ? "evo-shake 0.18s ease-in-out infinite"
                : "none",
              filter: isWhitePhase
                ? "brightness(100) saturate(0)"
                : "drop-shadow(0 0 16px " + fromStage.color + ")",
              transition: "filter 0.25s",
            }}
          />
        )}

        {/* New sprite — scale in on reveal */}
        {isReveal && (
          <img
            src={toUrl}
            alt={toStage.name}
            style={{
              width: 192, height: 192,
              imageRendering: "pixelated",
              display: "block",
              animation: "evo-scale-in 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
              filter: `drop-shadow(0 0 28px ${toStage.color}) drop-shadow(0 0 56px ${toStage.color}88)`,
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
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 7,
              color: toStage.color, opacity: 0.8,
              letterSpacing: "0.22em", marginBottom: 10,
            }}>
              ★ EVOLUTION COMPLETE
            </div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 22,
              color: toStage.color,
              textShadow: `0 0 30px ${toStage.color}, 0 0 60px ${toStage.color}66`,
              marginBottom: 8, lineHeight: 1.1,
            }}>
              {toStage.name.toUpperCase()}
            </div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 9,
              color: "#7a9aaa", letterSpacing: "0.1em", marginBottom: 12,
            }}>
              {toStage.tag}
            </div>
            <div style={{
              display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center",
            }}>
              <span style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                background: `${toStage.color}18`, border: `1px solid ${toStage.color}50`,
                color: toStage.color, padding: "4px 10px", borderRadius: 99,
              }}>HP {toStage.hp}</span>
              <span style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                background: "rgba(255,210,74,0.1)", border: "1px solid rgba(255,210,74,0.3)",
                color: "#ffd24a", padding: "4px 10px", borderRadius: 99,
              }}>{toStage.baseMoves.length} NEW MOVES UNLOCKED</span>
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
