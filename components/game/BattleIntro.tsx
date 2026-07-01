"use client";
import { useEffect, useState } from "react";
import type { Zone } from "@/game/data";
import { LEADER_URL, BATTLE_BG_URL, getSprite, isReady } from "@/game/sprite-registry";

const STYLES = `
@keyframes bi-slide-right { from{transform:translateX(120px) scale(0.88);opacity:0} to{transform:translateX(0) scale(1);opacity:1} }
@keyframes bi-text-in     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes bi-bg-pulse    { 0%,100%{opacity:0.6} 50%{opacity:1} }
@keyframes bi-scanline    { from{transform:translateY(0)} to{transform:translateY(100%)} }
@keyframes bi-vs-pop      { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes bi-glow-ring   { 0%{transform:scale(0.5);opacity:0.9} 100%{transform:scale(2.8);opacity:0} }
@keyframes bi-leader-glow { 0%,100%{filter:drop-shadow(0 0 18px var(--bi-accent,#7ce0ff))} 50%{filter:drop-shadow(0 0 38px var(--bi-accent,#7ce0ff))} }
`;

interface Props {
  zone: Zone;
  onComplete: () => void;
  opponentSpriteUrl?: string;
}

export function BattleIntro({ zone, onComplete, opponentSpriteUrl }: Props) {
  const gym = zone.gym!;
  const accent = zone.theme.accent;
  const [phase, setPhase] = useState<"slide" | "vs" | "text" | "done">("slide");
  const [leaderReady, setLeaderReady] = useState(false);
  const [bgReady, setBgReady] = useState(false);

  // Use opponentSpriteUrl for route trainers, otherwise gym leader
  const leaderUrl = opponentSpriteUrl ?? LEADER_URL[gym.leader];
  const bgUrl = BATTLE_BG_URL[zone.id];

  // Pre-load sprites
  useEffect(() => {
    const lImg = getSprite(leaderUrl);
    const bImg = bgUrl ? getSprite(bgUrl) : null;
    const checkL = () => { if (isReady(lImg)) setLeaderReady(true); };
    const checkB = () => { if (bImg && isReady(bImg)) setBgReady(true); };
    if (isReady(lImg)) setLeaderReady(true);
    else { const t = setInterval(() => { checkL(); if (leaderReady) clearInterval(t); }, 60); setTimeout(() => clearInterval(t), 3000); }
    if (bImg) { if (isReady(bImg)) setBgReady(true); else { const t = setInterval(() => { checkB(); if (bgReady) clearInterval(t); }, 60); setTimeout(() => clearInterval(t), 3000); } }
    else setBgReady(true);
  }, [leaderUrl, bgUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("vs"),   700);
    const t2 = setTimeout(() => setPhase("text"),  1200);
    const t3 = setTimeout(() => { setPhase("done"); onComplete(); }, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 80,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      fontFamily: "var(--font-pixel)",
      // CSS custom property for the glow animation
      ["--bi-accent" as string]: accent,
    }}>
      <style>{STYLES}</style>

      {/* Battle BG behind everything */}
      {bgReady && bgUrl && (
        <img
          src={bgUrl}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            opacity: 0.35, pointerEvents: "none",
          }}
        />
      )}

      {/* Dark gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 60%, ${accent}22 0%, rgba(2,8,20,0.88) 65%)`,
        pointerEvents: "none",
      }} />

      {/* Scanline sweep */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`, animation: "bi-scanline 2.5s linear infinite", pointerEvents: "none" }} />

      {/* Glow rings — fire on vs phase */}
      {(phase === "vs" || phase === "text") && [0, 1].map(i => (
        <div key={i} style={{
          position: "absolute", width: 220, height: 220,
          borderRadius: "50%", border: `2px solid ${accent}`,
          animation: `bi-glow-ring 1s ease-out ${i * 0.28}s both`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Arena floor line */}
      <div style={{ position: "absolute", bottom: "28%", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />

      {/* Leader sprite — real PNG, not canvas */}
      <div style={{
        animation: "bi-slide-right 0.5s cubic-bezier(0.2,0.8,0.4,1) both",
        marginBottom: 16, position: "relative", zIndex: 2,
      }}>
        {/* Glow halo */}
        <div style={{
          position: "absolute", inset: -20, borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
          animation: "bi-bg-pulse 1.4s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        {leaderReady ? (
          <img
            src={leaderUrl}
            alt={gym.opponentName}
            style={{
              width: 192, height: 192,
              imageRendering: "pixelated",
              position: "relative", zIndex: 1,
              animation: "bi-leader-glow 1.6s ease-in-out infinite",
              filter: `drop-shadow(0 0 24px ${accent}80)`,
            }}
          />
        ) : (
          /* Shimmer placeholder */
          <div style={{
            width: 192, height: 192,
            background: `radial-gradient(ellipse at center, ${accent}20 0%, transparent 70%)`,
            border: `1px solid ${accent}30`,
          }} />
        )}
      </div>

      {/* VS badge */}
      {(phase === "vs" || phase === "text") && (
        <div style={{
          position: "absolute", top: "16%", left: "50%", transform: "translateX(-50%)",
          animation: "bi-vs-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
          fontFamily: "var(--font-pixel)", fontSize: 24,
          color: "#ffd24a",
          textShadow: "0 4px 0 #7a4a00, 0 0 30px #ffd24a80",
          zIndex: 5,
        }}>VS</div>
      )}

      {/* Name + intro quote */}
      {phase === "text" && (
        <div style={{
          textAlign: "center", zIndex: 3,
          animation: "bi-text-in 0.35s ease-out both",
        }}>
          <div style={{ fontSize: 7, color: accent, letterSpacing: "0.15em", marginBottom: 8 }}>
            {gym.opponentTitle.toUpperCase()}
          </div>
          <div style={{
            fontSize: 15, color: "#fff",
            textShadow: `0 3px 0 #0a2040, 0 0 20px ${accent}80`,
            marginBottom: 14,
            letterSpacing: "0.06em",
          }}>
            {gym.opponentName.toUpperCase()}
          </div>
          <div style={{
            fontSize: 7, color: "#c8d8f0",
            maxWidth: 280, margin: "0 auto",
            lineHeight: 1.9, opacity: 0.9,
            padding: "10px 16px",
            background: "rgba(3,6,14,0.85)",
            border: `1px solid ${accent}35`,
            fontFamily: "var(--font-mono)",
          }}>
            "{gym.intro}"
          </div>
        </div>
      )}

      {/* Zone label */}
      <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontSize: 6, color: accent, opacity: 0.5, letterSpacing: "0.2em" }}>
        ⚔ {zone.name.toUpperCase()} · GYM BATTLE
      </div>
    </div>
  );
}
