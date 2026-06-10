"use client";
import type { Zone } from "@/game/data";

const STRIP_STYLES = `
@keyframes creature-drift-0  { 0%,100%{transform:translateY(0)    translateX(0)}    50%{transform:translateY(-10px) translateX(5px)}  }
@keyframes creature-drift-1  { 0%,100%{transform:translateY(-5px)  translateX(0)}    50%{transform:translateY(5px)   translateX(-7px)} }
@keyframes creature-drift-2  { 0%,100%{transform:translateY(0)    translateX(-5px)}  50%{transform:translateY(-12px) translateX(3px)}  }
@keyframes creature-drift-3  { 0%,100%{transform:translateY(-7px)  translateX(3px)}  50%{transform:translateY(3px)   translateX(-5px)} }
@keyframes creature-drift-4  { 0%,100%{transform:translateY(0)    translateX(5px)}   50%{transform:translateY(-8px)  translateX(-3px)} }
@keyframes creature-drift-5  { 0%,100%{transform:translateY(-3px)  translateX(-3px)} 50%{transform:translateY(7px)   translateX(5px)}  }
@keyframes creature-drift-6  { 0%,100%{transform:translateY(5px)   translateX(0)}    50%{transform:translateY(-6px)  translateX(-7px)} }
@keyframes creature-drift-7  { 0%,100%{transform:translateY(0)    translateX(7px)}   50%{transform:translateY(-10px) translateX(0)}    }
@keyframes creature-drift-8  { 0%,100%{transform:translateY(-5px)  translateX(-5px)} 50%{transform:translateY(5px)   translateX(7px)}  }

@keyframes creature-fade-in  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
`;

export function CreatureStrip({ zones }: { zones: Zone[] }) {
  const withCreature = zones.filter(z => z.creature);
  return (
    <div style={{
      position: "absolute",
      top: -10,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      gap: 0,
      opacity: 0.28,
      pointerEvents: "none",
      overflow: "hidden",
      maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.7) 50%, transparent 100%)",
      WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.7) 50%, transparent 100%)",
    }}>
      <style>{STRIP_STYLES}</style>
      {withCreature.map((z, i) => (
        <img
          key={z.id}
          src={`/sprites/creatures/${z.id}.png`}
          alt=""
          style={{
            width: 88,
            height: 88,
            imageRendering: "pixelated",
            animation: [
              `creature-fade-in 0.6s ease-out ${i * 80}ms both`,
              `creature-drift-${i % 9} ${6.5 + (i % 4) * 1.3}s ease-in-out ${i * 0.4}s infinite alternate`,
            ].join(", "),
          }}
        />
      ))}
    </div>
  );
}
