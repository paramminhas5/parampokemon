"use client";
import type { Zone } from "@/game/data";

const STRIP_STYLES = `
@keyframes creature-drift-0  { 0%,100%{transform:translateY(0)   translateX(0)}   50%{transform:translateY(-8px)  translateX(4px)} }
@keyframes creature-drift-1  { 0%,100%{transform:translateY(-4px) translateX(0)}   50%{transform:translateY(4px)   translateX(-6px)} }
@keyframes creature-drift-2  { 0%,100%{transform:translateY(0)   translateX(-4px)} 50%{transform:translateY(-10px) translateX(2px)} }
@keyframes creature-drift-3  { 0%,100%{transform:translateY(-6px) translateX(2px)} 50%{transform:translateY(2px)   translateX(-4px)} }
@keyframes creature-drift-4  { 0%,100%{transform:translateY(0)   translateX(4px)}  50%{transform:translateY(-6px)  translateX(-2px)} }
@keyframes creature-drift-5  { 0%,100%{transform:translateY(-2px) translateX(-2px)} 50%{transform:translateY(6px) translateX(4px)} }
@keyframes creature-drift-6  { 0%,100%{transform:translateY(4px) translateX(0)}    50%{transform:translateY(-4px) translateX(-6px)} }
@keyframes creature-drift-7  { 0%,100%{transform:translateY(0)   translateX(6px)}  50%{transform:translateY(-8px)  translateX(0)} }
@keyframes creature-drift-8  { 0%,100%{transform:translateY(-4px) translateX(-4px)} 50%{transform:translateY(4px) translateX(6px)} }
`;

export function CreatureStrip({ zones }: { zones: Zone[] }) {
  const withCreature = zones.filter(z => z.creature);
  return (
    <div style={{
      position: "absolute", top: 20, left: 0, right: 0,
      display: "flex", justifyContent: "center", gap: 0,
      opacity: 0.15, pointerEvents: "none",
      overflow: "hidden",
    }}>
      <style>{STRIP_STYLES}</style>
      {withCreature.map((z, i) => (
        <img
          key={z.id}
          src={`/sprites/creatures/${z.id}.png`}
          alt=""
          style={{
            width: 80, height: 80,
            imageRendering: "pixelated",
            animation: `creature-drift-${i % 9} ${6 + (i % 4) * 1.2}s ease-in-out ${i * 0.35}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
