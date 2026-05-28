"use client";
import { useEffect, useState } from "react";
import type { Zone } from "@/game/data";
import { LEADER_URL, getSprite, isReady } from "@/game/sprite-registry";

const STYLES = `
@keyframes vm-bg-in      { from{opacity:0} to{opacity:1} }
@keyframes vm-sprite-in  { from{transform:translateY(28px) scale(0.8);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes vm-badge-pop  { 0%{transform:scale(0) rotate(-30deg);opacity:0} 60%{transform:scale(1.15) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes vm-text-in    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes vm-glow-ring  { 0%{transform:scale(0.6);opacity:0.9} 100%{transform:scale(2.4);opacity:0} }
@keyframes vm-sparkle    { 0%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
@keyframes vm-scan       { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }
@keyframes vm-continue   { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes vm-defeat-tilt{ 0%{transform:rotate(0deg)} 20%{transform:rotate(-4deg)} 60%{transform:rotate(2deg)} 100%{transform:rotate(-1.5deg)} }
`;

interface Props {
  zone: Zone;
  onContinue: () => void;
}

export function VictoryMoment({ zone, onContinue }: Props) {
  const gym = zone.gym!;
  const accent = zone.theme.accent;
  const [phase, setPhase] = useState<"leader" | "badge" | "quote" | "ready">("leader");
  const [leaderReady, setLeaderReady] = useState(false);

  const leaderUrl = LEADER_URL[gym.leader];

  // Pre-load leader PNG
  useEffect(() => {
    const img = getSprite(leaderUrl);
    if (isReady(img)) { setLeaderReady(true); return; }
    const t = setInterval(() => { if (isReady(img)) { setLeaderReady(true); clearInterval(t); } }, 60);
    return () => clearInterval(t);
  }, [leaderUrl]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("badge"),  800);
    const t2 = setTimeout(() => setPhase("quote"),  1600);
    const t3 = setTimeout(() => setPhase("ready"),  2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "ready" && ["Enter", " ", "z", "Z", "Escape"].includes(e.key)) {
        e.preventDefault(); onContinue();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onContinue]);

  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    x: 50 + Math.cos((i / 8) * Math.PI * 2) * 42,
    y: 50 + Math.sin((i / 8) * Math.PI * 2) * 42,
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

      {/* Glow rings on badge reveal */}
      {(phase === "badge" || phase === "quote" || phase === "ready") && [0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", width: 200, height: 200,
          borderRadius: "50%", border: `2px solid ${accent}`,
          animation: `vm-glow-ring 1.4s ease-out ${i * 0.28}s both`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Defeated leader — PNG with defeat tilt + desaturate */}
      <div style={{
        animation: "vm-sprite-in 0.5s cubic-bezier(0.2,0.8,0.4,1) both",
        position: "relative", zIndex: 2,
        marginBottom: -8,
      }}>
        {/* Glow halo */}
        <div style={{
          position: "absolute", inset: -16, borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        {leaderReady ? (
          <img
            src={leaderUrl}
            alt={gym.opponentName}
            style={{
              width: 160, height: 160,
              imageRendering: "pixelated",
              position: "relative", zIndex: 1,
              // Defeated look: slight grayscale + dim + tilt
              filter: `grayscale(0.45) brightness(0.72) drop-shadow(0 0 12px ${accent}40)`,
              animation: "vm-defeat-tilt 0.6s ease-out 0.3s both",
            }}
          />
        ) : (
          <div style={{ width: 160, height: 160, background: `${accent}12`, border: `1px solid ${accent}25` }} />
        )}
      </div>

      {/* Badge + leader portrait combo */}
      {(phase === "badge" || phase === "quote" || phase === "ready") && (
        <div style={{
          position: "relative", zIndex: 3,
          animation: "vm-badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
          marginTop: 4,
        }}>
          {/* Sparkles */}
          <div style={{ position: "absolute", inset: -44, pointerEvents: "none" }}>
            {sparkles.map((s, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${s.x}%`, top: `${s.y}%`,
                width: 5, height: 5, borderRadius: "50%",
                background: accent, boxShadow: `0 0 8px ${accent}`,
                animation: `vm-sparkle 1s ease-in-out ${s.delay + 0.4}s both`,
              }} />
            ))}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 20px",
            background: `linear-gradient(135deg, ${accent}18 0%, #050c18 100%)`,
            border: `2px solid ${accent}`,
            boxShadow: `0 0 30px ${accent}40`,
          }}>
            {/* Leader PNG thumbnail in badge card */}
            {leaderReady && (
              <img
                src={leaderUrl}
                alt={gym.opponentName}
                style={{
                  width: 48, height: 48,
                  imageRendering: "pixelated",
                  border: `1px solid ${accent}50`,
                  filter: "grayscale(0.3) brightness(0.85)",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 6, color: accent, letterSpacing: "0.2em" }}>GYM BADGE EARNED</div>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 20px ${accent}, inset 0 0 10px rgba(255,255,255,0.3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#fff",
              }}>★</div>
              <div style={{ fontSize: 10, color: "#fff", textShadow: `0 0 12px ${accent}`, letterSpacing: "0.05em" }}>
                {zone.badge.label.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Victory quote */}
      {(phase === "quote" || phase === "ready") && (
        <div style={{
          animation: "vm-text-in 0.4s ease-out both",
          textAlign: "center", padding: "0 20px",
          maxWidth: 380, marginTop: 18,
          zIndex: 3, position: "relative",
        }}>
          <div style={{ fontSize: 6, color: accent, letterSpacing: "0.15em", marginBottom: 8 }}>
            {gym.opponentName.toUpperCase()} CONCEDES
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 15,
            color: "#c8d8f0", lineHeight: 1.65,
            padding: "10px 16px",
            background: "rgba(3,6,14,0.88)",
            border: `1px solid ${accent}30`,
            fontStyle: "italic",
          }}>
            "{gym.victory}"
          </div>
        </div>
      )}

      {/* Continue prompt */}
      {phase === "ready" && (
        <div style={{
          marginTop: 22, fontSize: 7, color: accent,
          letterSpacing: "0.1em",
          animation: "vm-continue 1.2s ease-in-out infinite",
          zIndex: 3, position: "relative",
        }}>
          ▶ CONTINUE
        </div>
      )}
    </div>
  );
}
