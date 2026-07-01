"use client";
import { useEffect, useState } from "react";
import type { Zone } from "@/game/data";
import { CREATURE_URL, getSprite, isReady } from "@/game/sprite-registry";
import { playSound } from "@/lib/audio";

const STYLES = `
@keyframes we-bg-in    { from{opacity:0} to{opacity:1} }
@keyframes we-slide-in { 0%{transform:translateX(120px) scale(0.7);opacity:0} 100%{transform:translateX(0) scale(1);opacity:1} }
@keyframes we-text-in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes we-pulse    { 0%,100%{opacity:0.6} 50%{opacity:1} }
`;

export function WildEncounterIntro({ zone, onComplete }: { zone: Zone; onComplete: () => void }) {
  const [phase, setPhase] = useState<"appear" | "text" | "done">("appear");
  const cr = zone.creature!;
  const url = CREATURE_URL[zone.id];
  const accent = zone.theme.accent;

  useEffect(() => {
    playSound("menu");
    const t1 = setTimeout(() => setPhase("text"), 600);
    const t2 = setTimeout(() => { setPhase("done"); onComplete(); }, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  if (phase === "done") return null;

  const img = url ? getSprite(url) : null;
  const imgReady = img && isReady(img);

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 75,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 50% 60%, ${accent}30 0%, rgba(2,8,20,0.95) 60%)`,
      animation: "we-bg-in 0.3s ease-out",
      fontFamily: "var(--font-pixel)",
      overflow: "hidden",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <style>{STYLES}</style>

      {/* Creature sprite */}
      <div style={{ animation: "we-slide-in 0.5s cubic-bezier(0.2,0.8,0.4,1) both" }}>
        {imgReady ? (
          <img
            src={url}
            alt={cr.name}
            style={{
              width: 160, height: 160,
              imageRendering: "pixelated",
              filter: `drop-shadow(0 0 30px ${accent}90)`,
            }}
          />
        ) : (
          <div style={{ width: 160, height: 160, background: `${accent}20`, border: `2px solid ${accent}40` }} />
        )}
      </div>

      {/* Text */}
      {phase === "text" && (
        <div style={{
          marginTop: 20,
          animation: "we-text-in 0.3s ease-out",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 7, color: accent, letterSpacing: "0.15em",
            marginBottom: 8, animation: "we-pulse 1s ease-in-out infinite",
          }}>
            ✦ WILD ENCOUNTER ✦
          </div>
          <div style={{
            fontSize: "clamp(14px, 3vw, 20px)", color: "#fff",
            textShadow: `0 0 20px ${accent}80`,
            letterSpacing: "0.08em",
          }}>
            A wild {cr.name.toUpperCase()} appeared!
          </div>
        </div>
      )}
    </div>
  );
}
