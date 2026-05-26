"use client";
import { useEffect, useRef, useState } from "react";
import type { Zone } from "@/game/data";
import { drawGymLeader } from "@/game/sprites";

const STYLES = `
@keyframes vm-bg-in     { from{opacity:0} to{opacity:1} }
@keyframes vm-sprite-in { from{transform:translateY(20px) scale(0.85);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes vm-badge-pop { 0%{transform:scale(0) rotate(-30deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes vm-text-in   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes vm-glow-ring { 0%{transform:scale(0.6);opacity:0.9} 100%{transform:scale(2.2);opacity:0} }
@keyframes vm-sparkle   { 0%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
@keyframes vm-scan      { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }
@keyframes vm-continue-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
`;

interface Props {
  zone: Zone;
  onContinue: () => void;
}

export function VictoryMoment({ zone, onContinue }: Props) {
  const gym = zone.gym!;
  const accent = zone.theme.accent;
  const leaderRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [phase, setPhase] = useState<"leader" | "badge" | "quote" | "ready">("leader");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("badge"), 800);
    const t2 = setTimeout(() => setPhase("quote"), 1500);
    const t3 = setTimeout(() => setPhase("ready"), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const loop = (now: number) => {
      const c = leaderRef.current?.getContext("2d");
      if (c) {
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 128, 128);
        // Draw defeated leader — slightly desaturated tint via shadow
        c.save();
        c.filter = "grayscale(0.4) brightness(0.8)";
        drawGymLeader(c, gym.leader, 16, 8, 3.0);
        c.restore();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gym.leader]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "ready" && ["Enter", " ", "z", "Z", "Escape"].includes(e.key)) {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onContinue]);

  // Sparkles around badge
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    x: 50 + Math.cos((i / 8) * Math.PI * 2) * 38,
    y: 50 + Math.sin((i / 8) * Math.PI * 2) * 38,
    delay: i * 0.12,
  }));

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 70,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: `radial-gradient(ellipse at 50% 40%, ${accent}1a 0%, #020814 65%)`,
        animation: "vm-bg-in 0.4s ease-out",
        overflow: "hidden",
        fontFamily: "var(--font-pixel)",
        cursor: phase === "ready" ? "pointer" : "default",
      }}
      onClick={phase === "ready" ? onContinue : undefined}
    >
      <style>{STYLES}</style>

      {/* Scanline */}
      <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${accent}40,transparent)`, animation: "vm-scan 5s linear infinite", pointerEvents: "none" }} />

      {/* Glow rings */}
      {(phase === "badge" || phase === "quote" || phase === "ready") && [0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", width: 200, height: 200,
          borderRadius: "50%", border: `2px solid ${accent}`,
          animation: `vm-glow-ring 1.4s ease-out ${i * 0.3}s both`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Defeated leader */}
      <div style={{ animation: "vm-sprite-in 0.5s cubic-bezier(0.2,0.8,0.4,1) both", position: "relative", zIndex: 2 }}>
        <canvas ref={leaderRef} width={128} height={128}
          style={{ imageRendering: "pixelated", width: 140, height: 140 }} />
      </div>

      {/* Badge earned */}
      {(phase === "badge" || phase === "quote" || phase === "ready") && (
        <div style={{
          position: "relative", zIndex: 3,
          animation: "vm-badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
          marginTop: -12,
        }}>
          {/* Sparkles */}
          <div style={{ position: "absolute", inset: -40, pointerEvents: "none" }}>
            {sparkles.map((s, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${s.x}%`, top: `${s.y}%`,
                width: 5, height: 5, borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 8px ${accent}`,
                animation: `vm-sparkle 1s ease-in-out ${s.delay + 0.5}s both`,
              }} />
            ))}
          </div>

          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: "16px 24px",
            background: `linear-gradient(135deg, ${accent}18 0%, #050c18 100%)`,
            border: `2px solid ${accent}`,
            boxShadow: `0 0 30px ${accent}40`,
          }}>
            <div style={{ fontSize: 6, color: accent, letterSpacing: "0.2em" }}>GYM BADGE EARNED</div>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 20px ${accent}, inset 0 0 10px rgba(255,255,255,0.3)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color: "#fff",
            }}>★</div>
            <div style={{ fontSize: 11, color: "#fff", textShadow: `0 0 12px ${accent}` }}>
              {zone.badge.label.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Defeat quote */}
      {(phase === "quote" || phase === "ready") && (
        <div style={{
          animation: "vm-text-in 0.4s ease-out both",
          textAlign: "center", padding: "0 20px",
          maxWidth: 380, marginTop: 20,
          zIndex: 3, position: "relative",
        }}>
          <div style={{ fontSize: 6, color: accent, letterSpacing: "0.15em", marginBottom: 8 }}>
            {gym.opponentName.toUpperCase()} CONCEDES
          </div>
          <div style={{
            fontSize: 7, color: "#c8d8f0", lineHeight: 2,
            padding: "10px 16px",
            background: "rgba(3,6,14,0.85)",
            border: `1px solid ${accent}30`,
          }}>
            "{gym.victory}"
          </div>
        </div>
      )}

      {/* Continue prompt */}
      {phase === "ready" && (
        <div style={{
          marginTop: 24, fontSize: 7, color: accent,
          letterSpacing: "0.1em",
          animation: "vm-continue-pulse 1.2s ease-in-out infinite",
          zIndex: 3, position: "relative",
        }}>
          ▶ CONTINUE
        </div>
      )}
    </div>
  );
}
