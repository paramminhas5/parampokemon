"use client";
import { useEffect, useRef, useState } from "react";
import type { Zone } from "@/game/data";
import { drawGymLeader } from "@/game/sprites";

const STYLES = `
@keyframes bi-slide-right { from{transform:translateX(120px);opacity:0} to{transform:translateX(0);opacity:1} }
@keyframes bi-slide-left  { from{transform:translateX(-120px);opacity:0} to{transform:translateX(0);opacity:1} }
@keyframes bi-text-in     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes bi-bg-pulse    { 0%,100%{opacity:0.6} 50%{opacity:1} }
@keyframes bi-scanline    { from{transform:translateY(0)} to{transform:translateY(100%)} }
@keyframes bi-vs-pop      { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
`;

interface Props {
  zone: Zone;
  onComplete: () => void;
}

export function BattleIntro({ zone, onComplete }: Props) {
  const gym = zone.gym!;
  const accent = zone.theme.accent;
  const leaderRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [phase, setPhase] = useState<"slide" | "vs" | "text" | "done">("slide");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("vs"), 700);
    const t2 = setTimeout(() => setPhase("text"), 1200);
    const t3 = setTimeout(() => { setPhase("done"); onComplete(); }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  useEffect(() => {
    const loop = (now: number) => {
      const c = leaderRef.current?.getContext("2d");
      if (c) {
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 128, 128);
        drawGymLeader(c, gym.leader, 16, 8, 3.0);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gym.leader]);

  if (phase === "done") return null;

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 80,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 50% 60%, ${accent}22 0%, #020814 60%)`,
      overflow: "hidden",
      fontFamily: "var(--font-pixel)",
    }}>
      <style>{STYLES}</style>

      {/* Scanline sweep */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
        animation: "bi-scanline 2.5s linear infinite",
        pointerEvents: "none",
      }} />

      {/* Arena floor line */}
      <div style={{
        position: "absolute", bottom: "28%", left: 0, right: 0,
        height: 2, background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
      }} />

      {/* Leader sprite */}
      <div style={{
        animation: "bi-slide-right 0.5s cubic-bezier(0.2,0.8,0.4,1) both",
        filter: `drop-shadow(0 0 24px ${accent}90)`,
        marginBottom: 16,
      }}>
        <canvas ref={leaderRef} width={128} height={128}
          style={{ imageRendering: "pixelated", width: 160, height: 160 }} />
      </div>

      {/* VS badge */}
      {(phase === "vs" || phase === "text") && (
        <div style={{
          position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)",
          animation: "bi-vs-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
          fontFamily: "var(--font-pixel)", fontSize: 22,
          color: "#ffd24a",
          textShadow: "0 4px 0 #7a4a00, 0 0 30px #ffd24a80",
        }}>VS</div>
      )}

      {/* Name + title */}
      {phase === "text" && (
        <div style={{
          textAlign: "center",
          animation: "bi-text-in 0.35s ease-out both",
        }}>
          <div style={{ fontSize: 7, color: accent, letterSpacing: "0.15em", marginBottom: 8 }}>
            {gym.opponentTitle.toUpperCase()}
          </div>
          <div style={{
            fontSize: 14, color: "#fff",
            textShadow: `0 3px 0 #0a2040, 0 0 20px ${accent}80`,
            marginBottom: 12,
          }}>
            {gym.opponentName.toUpperCase()}
          </div>
          <div style={{
            fontSize: 7, color: "#c8d8f0",
            maxWidth: 260, margin: "0 auto",
            lineHeight: 1.8, opacity: 0.85,
            padding: "8px 14px",
            background: "rgba(3,6,14,0.8)",
            border: `1px solid ${accent}30`,
          }}>
            "{gym.intro}"
          </div>
        </div>
      )}

      {/* Zone name */}
      <div style={{
        position: "absolute", bottom: 16, left: 0, right: 0,
        textAlign: "center", fontSize: 6,
        color: accent, opacity: 0.5, letterSpacing: "0.2em",
      }}>
        ⚔ {zone.name.toUpperCase()} · GYM BATTLE
      </div>
    </div>
  );
}
