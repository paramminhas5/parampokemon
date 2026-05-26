"use client";
import { useEffect, useState } from "react";
import type { Zone } from "@/game/data";

const STYLES = `
@keyframes sl-bg-in    { from{opacity:0} to{opacity:1} }
@keyframes sl-card-in  { from{opacity:0;transform:translateY(24px) scale(0.92)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes sl-berry-in { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.15) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes sl-ring     { 0%{transform:scale(0.5);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
@keyframes sl-sparkle  { 0%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0)} }
@keyframes sl-text-in  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
@keyframes sl-pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
`;

// Type → colour mapping (matches Battle.tsx)
const TYPE_COLORS: Record<string, string> = {
  Vision:"#f5b78a", Search:"#a8d39a", Ops:"#f6a268", AI:"#9fe8ff",
  Capital:"#f0c4ff", Brand:"#ff9fd4", Autonomy:"#00e8a0", Soul:"#ffd29a",
  Stack:"#7ce0ff", Ghost:"#8b6f9e", Dark:"#4a3a5a", Normal:"#8a8a8a",
};

interface Props {
  zone: Zone;         // zone whose skill was just learned
  npcName: string;    // NPC who taught it
  onClose: () => void;
}

export function SkillLearnOverlay({ zone, npcName, onClose }: Props) {
  const skill = zone.skill!;
  const accent = TYPE_COLORS[skill.type] ?? zone.theme.accent;
  const [phase, setPhase] = useState<"in" | "ready">("in");

  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "z", "Z", "Escape"].includes(e.key)) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Sparkle positions
  const sparkles = Array.from({ length: 10 }, (_, i) => ({
    x: 50 + Math.cos((i / 10) * Math.PI * 2) * 45,
    y: 50 + Math.sin((i / 10) * Math.PI * 2) * 45,
    delay: i * 0.1,
    color: i % 2 === 0 ? accent : "#fff",
  }));

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 75,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: `radial-gradient(ellipse at 50% 40%, ${accent}18 0%, rgba(4,8,20,0.94) 65%)`,
        animation: "sl-bg-in 0.3s ease-out",
        overflow: "hidden",
        fontFamily: "var(--font-pixel)",
        cursor: "pointer",
      }}
      onClick={onClose}
    >
      <style>{STYLES}</style>

      {/* Expanding rings */}
      {[0, 1].map(i => (
        <div key={i} style={{
          position: "absolute", width: 160, height: 160,
          borderRadius: "50%", border: `2px solid ${accent}`,
          animation: `sl-ring 1s ease-out ${i * 0.25}s both`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Main card */}
      <div style={{
        animation: "sl-card-in 0.45s cubic-bezier(0.2,0.8,0.4,1) both",
        width: "100%", maxWidth: 360, padding: "0 16px",
        position: "relative", zIndex: 5,
      }}>
        <div style={{
          background: "#07101e",
          border: `2px solid ${accent}60`,
          boxShadow: `0 0 40px ${accent}25`,
          overflow: "hidden",
        }}>
          {/* Top bar */}
          <div style={{
            padding: "8px 14px",
            background: `linear-gradient(90deg, ${accent}20 0%, transparent 70%)`,
            borderBottom: `1px solid ${accent}30`,
            fontSize: 6, color: accent, letterSpacing: "0.2em",
          }}>
            ✦ SKILL BERRY OBTAINED
          </div>

          {/* Berry + skill info */}
          <div style={{ padding: "20px 18px", textAlign: "center", position: "relative" }}>
            {/* Sparkles */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {sparkles.map((s, i) => (
                <div key={i} style={{
                  position: "absolute",
                  left: `${s.x}%`, top: `${s.y}%`,
                  width: 4, height: 4, borderRadius: "50%",
                  background: s.color,
                  boxShadow: `0 0 6px ${s.color}`,
                  animation: `sl-sparkle 0.8s ease-in-out ${s.delay}s both`,
                }} />
              ))}
            </div>

            {/* Berry orb */}
            <div style={{
              width: 64, height: 64,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, ${accent}ee 0%, ${accent}88 60%, ${accent}44 100%)`,
              boxShadow: `0 0 30px ${accent}80, inset 0 0 20px rgba(255,255,255,0.2)`,
              margin: "0 auto 16px",
              animation: "sl-berry-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              🫐
            </div>

            {/* Taught by */}
            <div style={{ fontSize: 6, color: "#3a5070", marginBottom: 6, animation: "sl-text-in 0.3s ease-out 0.3s both" }}>
              {npcName.toUpperCase()} TAUGHT YOU
            </div>

            {/* Skill name */}
            <div style={{
              fontSize: 14, color: "#fff",
              textShadow: `0 0 16px ${accent}`,
              marginBottom: 8,
              animation: "sl-text-in 0.3s ease-out 0.5s both",
            }}>
              {skill.name.toUpperCase()}
            </div>

            {/* Type badge + power */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 8, marginBottom: 12,
              animation: "sl-text-in 0.3s ease-out 0.6s both",
            }}>
              <span style={{
                fontSize: 7, padding: "3px 8px",
                background: `${accent}22`, border: `1px solid ${accent}60`,
                color: accent, borderRadius: 99,
              }}>{skill.type}</span>
              <span style={{
                fontSize: 7, padding: "3px 8px",
                background: "rgba(255,210,74,0.1)", border: "1px solid rgba(255,210,74,0.3)",
                color: "#ffd24a", borderRadius: 99,
              }}>PWR {skill.power}</span>
            </div>

            {/* Description */}
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 14,
              color: "#8aa0c0", lineHeight: 1.5,
              animation: "sl-text-in 0.3s ease-out 0.7s both",
            }}>
              {skill.description}
            </div>
          </div>

          {/* Mermander now knows */}
          <div style={{
            padding: "8px 14px 10px",
            borderTop: `1px solid ${accent}20`,
            fontSize: 7, color: "#3a5070",
            background: `${accent}06`,
            textAlign: "center",
          }}>
            MERMANDER CAN NOW USE THIS IN BATTLE
          </div>
        </div>
      </div>

      {/* Advance hint */}
      {phase === "ready" && (
        <div style={{
          marginTop: 16, fontSize: 7, color: "#3a5070",
          letterSpacing: "0.1em",
          animation: "sl-pulse 1.2s ease-in-out infinite",
        }}>
          TAP TO CONTINUE
        </div>
      )}
    </div>
  );
}
