"use client";
import { useEffect, useState } from "react";

const STYLES = `
@keyframes orb-collect-expand {
  0%   { transform: scale(0.3); opacity: 1; }
  50%  { transform: scale(1.8); opacity: 0.8; }
  100% { transform: scale(3); opacity: 0; }
}
@keyframes orb-collect-flash {
  0%   { opacity: 0; }
  20%  { opacity: 0.9; }
  100% { opacity: 0; }
}
@keyframes orb-particle-out {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
}
@keyframes orb-absorb-in {
  0%   { transform: scale(1.5) rotate(-5deg); opacity: 0; filter: brightness(3); }
  40%  { transform: scale(1.1) rotate(2deg); opacity: 1; filter: brightness(1.5); }
  70%  { transform: scale(0.95) rotate(0deg); filter: brightness(1); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; filter: brightness(1); }
}
@keyframes orb-ring-expand {
  0%   { transform: scale(0.5); opacity: 0.8; border-width: 3px; }
  100% { transform: scale(4); opacity: 0; border-width: 1px; }
}
@keyframes orb-text-rise {
  0%   { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}
@keyframes orb-core-pulse {
  0%,100% { transform: scale(1); box-shadow: 0 0 20px var(--accent); }
  50%     { transform: scale(1.3); box-shadow: 0 0 50px var(--accent), 0 0 80px var(--accent); }
}
`;

interface Props {
  accent: string;
  skillName: string;
  onComplete: () => void;
}

export function OrbCollectAnimation({ accent, skillName, onComplete }: Props) {
  const [phase, setPhase] = useState<"burst" | "absorb" | "done">("burst");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("absorb"), 600);
    const t2 = setTimeout(() => setPhase("done"), 1400);
    const t3 = setTimeout(onComplete, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === "done") return null;

  // Generate burst particles
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 60 + Math.random() * 40;
    return {
      px: `${Math.cos(angle) * dist}px`,
      py: `${Math.sin(angle) * dist}px`,
      color: i % 3 === 0 ? "#ffffff" : i % 2 === 0 ? accent : accent + "cc",
      size: 3 + (i % 4),
      delay: i * 0.02,
    };
  });

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 72,
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      <style>{STYLES}</style>

      {/* Screen flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle, ${accent}55 0%, transparent 60%)`,
        animation: "orb-collect-flash 0.6s ease-out forwards",
      }} />

      {/* Expanding rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute",
          width: 60, height: 60,
          borderRadius: "50%",
          border: `2px solid ${accent}`,
          animation: `orb-ring-expand 0.8s ease-out ${i * 0.12}s forwards`,
        }} />
      ))}

      {/* Burst particles */}
      {phase === "burst" && particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: p.color,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          // @ts-ignore CSS custom properties
          "--px": p.px,
          "--py": p.py,
          animation: `orb-particle-out 0.6s ease-out ${p.delay}s forwards`,
        } as React.CSSProperties} />
      ))}

      {/* Central orb that pulses then fades */}
      <div style={{
        width: 48, height: 48,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, #fff 0%, ${accent} 50%, transparent 100%)`,
        boxShadow: `0 0 30px ${accent}, 0 0 60px ${accent}88`,
        // @ts-ignore
        "--accent": accent,
        animation: phase === "burst"
          ? `orb-core-pulse 0.3s ease-in-out 2`
          : "orb-collect-expand 0.5s ease-out forwards",
      } as React.CSSProperties} />

      {/* Skill name rising text */}
      {phase === "absorb" && (
        <div style={{
          position: "absolute",
          fontFamily: "var(--font-pixel)", fontSize: 10,
          color: accent,
          textShadow: `0 0 10px ${accent}`,
          letterSpacing: "0.1em",
          animation: "orb-text-rise 1s ease-out forwards",
        }}>
          ✦ {skillName.toUpperCase()}
        </div>
      )}
    </div>
  );
}
