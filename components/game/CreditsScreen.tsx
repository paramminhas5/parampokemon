"use client";
import { useEffect, useState } from "react";

const STYLES = `
@keyframes credits-scroll {
  0%   { transform: translateY(100%); }
  100% { transform: translateY(-100%); }
}
@keyframes credits-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes credits-star-tw { 0%,100%{opacity:0.1} 50%{opacity:0.4} }
`;

const CREDITS = [
  { section: "PARAM QUEST", items: ["A career told as an RPG"] },
  { section: "CREATED BY", items: ["Param Minhas"] },
  { section: "DESIGN & DIRECTION", items: ["Param Minhas"] },
  { section: "PROGRAMMING", items: ["TypeScript · Next.js 15 · Canvas 2D", "Custom game engine · BFS pathfinding", "Web Audio API synthesized soundtrack"] },
  { section: "ART & SPRITES", items: ["Bria AI — NPC & building pixel art", "FAL.ai — Creatures, leaders, backgrounds", "Procedural tile rendering"] },
  { section: "AUDIO", items: ["10 zone BGM tracks (synthesized)", "Battle BGM · 11 SFX", "Zero audio files — all Web Audio API"] },
  { section: "NARRATIVE", items: ["10 zones · 9 gym battles · 9 route trainers", "40+ NPCs · 10 building interiors", "15 years of career content"] },
  { section: "TOOLS & LIBRARIES", items: ["Next.js · React 19 · Tailwind CSS", "Howler.js · Vercel", "Bria AI · FAL.ai"] },
  { section: "SPECIAL THANKS", items: ["Everyone who believed in the journey", "The startups that taught the lessons", "You — for playing this far"] },
  { section: "", items: ["param@catscandance.com", "", "THANK YOU FOR PLAYING"] },
];

export function CreditsScreen({ onClose }: { onClose: () => void }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center"
         onClick={onClose}
         style={{
           background: "linear-gradient(180deg, #020408 0%, #04080f 50%, #020408 100%)",
           animation: "credits-fade-in 0.5s ease-out",
           overflow: "hidden",
         }}>
      <style>{STYLES}</style>

      {/* Stars background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 43.7 + 11) % 100}%`,
            top: `${(i * 67.3 + 7) % 100}%`,
            width: i % 7 === 0 ? 2 : 1,
            height: i % 7 === 0 ? 2 : 1,
            background: i % 3 === 0 ? "#7ce0ff" : "#fff",
            borderRadius: "50%",
            opacity: 0.1,
            animation: `credits-star-tw ${2 + (i % 4) * 0.8}s ease-in-out ${(i % 5) * 0.4}s infinite`,
          }} />
        ))}
      </div>

      {/* Scrolling credits */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center",
        animation: started ? "credits-scroll 35s linear forwards" : "none",
        paddingTop: "50vh",
      }}>
        {CREDITS.map((block, bi) => (
          <div key={bi} style={{ textAlign: "center", marginBottom: 48, maxWidth: 400 }}>
            {block.section && (
              <div style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "#7ce0ff",
                marginBottom: 12,
              }}>
                {block.section}
              </div>
            )}
            {block.items.map((item, ii) => (
              <div key={ii} style={{
                fontFamily: item === "THANK YOU FOR PLAYING" ? "var(--font-pixel)" : "var(--font-mono)",
                fontSize: item === "THANK YOU FOR PLAYING" ? 16 : item === "Param Minhas" ? 18 : 13,
                color: item === "THANK YOU FOR PLAYING" ? "#ffd24a" : "#c8d8f0",
                lineHeight: 1.8,
                letterSpacing: item === "THANK YOU FOR PLAYING" ? "0.1em" : undefined,
              }}>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Skip hint */}
      <div style={{
        position: "absolute", bottom: 20, right: 20,
        fontFamily: "var(--font-pixel)", fontSize: 7,
        color: "#3a5070", letterSpacing: "0.1em",
      }}>
        CLICK ANYWHERE TO CLOSE
      </div>
    </div>
  );
}
