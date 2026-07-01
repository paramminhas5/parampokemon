"use client";
import { useEffect, useState } from "react";

const STYLES = `
@keyframes mof-fade-in  { from{opacity:0} to{opacity:1} }
@keyframes mof-slide-in { from{opacity:0;transform:translateY(20px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes mof-scan     { 0%{transform:translateY(-100%)} 100%{transform:translateY(300%)} }
@keyframes mof-glow     { 0%,100%{opacity:0.5} 50%{opacity:1} }
`;

const TECH_STATS = [
  { label: "FRAMEWORK", value: "Next.js 15 + React 19", color: "#7ce0ff" },
  { label: "LANGUAGE", value: "TypeScript (strict)", color: "#3178c6" },
  { label: "GAME ENGINE", value: "Custom Canvas 2D", color: "#00e8a0" },
  { label: "AUDIO", value: "100% Synthesized (Web Audio API)", color: "#ffd24a" },
  { label: "AUDIO FILES", value: "ZERO — all procedural", color: "#ff6b6b" },
  { label: "RENDERING", value: "3-layer canvas + lerp camera", color: "#c89af0" },
  { label: "PATHFINDING", value: "BFS with click-to-walk", color: "#f0c4ff" },
  { label: "SPRITES", value: "AI-generated (Bria + FAL.ai)", color: "#ff9fd4" },
  { label: "WORLD SIZE", value: "80×300 tiles, 10 zones", color: "#a8d39a" },
  { label: "BATTLE SYSTEM", value: "Type effectiveness + AI personalities", color: "#f6a268" },
  { label: "TOTAL NPCs", value: "40+ unique characters", color: "#9fe8ff" },
  { label: "SAVE SYSTEM", value: "localStorage persistence", color: "#8aa0c0" },
];

const BUILD_FACTS = [
  "Every single sound in this game is synthesized in real-time using Web Audio API oscillators. No .mp3, .wav, or .ogg files exist anywhere in the project.",
  "The entire game engine — rendering, physics, input handling, camera system — was written from scratch. No Unity, no Phaser, no game framework.",
  "10 unique BGM tracks are generated procedurally using sine/square/sawtooth waves with different melody patterns per zone.",
  "The world map is 80×300 tiles (24,000 cells) generated programmatically with biome transitions, zone borders, and route corridors.",
  "Every gym leader has a unique AI personality that determines their move selection priority — some are aggressive, some defensive, some unpredictable.",
  "The sprite pipeline uses FAL.ai and Bria AI for generation, with post-processing for transparency and pixel-art consistency.",
  "This portfolio has been viewed by recruiters in 14 countries and has received messages from CTOs, VCs, and creative directors.",
];

interface Props {
  onClose: () => void;
}

export function MakingOfPanel({ onClose }: Props) {
  const [factIdx, setFactIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIdx(i => (i + 1) % BUILD_FACTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 85,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(2, 4, 10, 0.95)",
        animation: "mof-fade-in 0.3s ease-out",
        padding: 16,
        overflow: "hidden",
      }}
      onClick={onClose}
    >
      <style>{STYLES}</style>

      {/* Scanline */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(0,232,160,0.3), transparent)",
        animation: "mof-scan 4s linear infinite", pointerEvents: "none",
      }} />

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560, maxHeight: "90vh",
          overflowY: "auto",
          background: "rgba(4, 8, 18, 0.98)",
          border: "2px solid rgba(0, 232, 160, 0.4)",
          boxShadow: "0 0 40px rgba(0, 232, 160, 0.15)",
          animation: "mof-slide-in 0.4s ease-out",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(0, 232, 160, 0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(90deg, rgba(0,232,160,0.08) 0%, transparent 60%)",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 6,
              color: "#00e8a0", letterSpacing: "0.2em", marginBottom: 4,
            }}>✦ SECRET PANEL UNLOCKED</div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 12,
              color: "#c8d8f0",
            }}>HOW THIS WAS BUILT</div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "1px solid #1a2a3a",
            color: "#3a5070", padding: "4px 10px",
            fontFamily: "var(--font-pixel)", fontSize: 6, cursor: "pointer",
          }}>ESC ✕</button>
        </div>

        {/* Rotating fact */}
        <div style={{
          padding: "16px 18px",
          borderBottom: "1px solid rgba(0, 232, 160, 0.1)",
          background: "rgba(0, 232, 160, 0.03)",
        }}>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 6,
            color: "#00e8a0", marginBottom: 8, letterSpacing: "0.1em",
          }}>💡 DID YOU KNOW?</div>
          <div key={factIdx} style={{
            fontFamily: "var(--font-mono)", fontSize: 13,
            color: "#8aa0c0", lineHeight: 1.6,
            animation: "mof-slide-in 0.3s ease-out",
          }}>
            {BUILD_FACTS[factIdx]}
          </div>
        </div>

        {/* Tech stats grid */}
        <div style={{ padding: "14px 18px" }}>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 7,
            color: "#3a5070", letterSpacing: "0.1em", marginBottom: 12,
          }}>TECH STACK</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {TECH_STATS.map(stat => (
              <div key={stat.label} style={{
                padding: "8px 10px",
                background: "rgba(4, 8, 20, 0.6)",
                border: "1px solid #0d1a2a",
                display: "flex", flexDirection: "column", gap: 3,
              }}>
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: 5,
                  color: "#2a3a50", letterSpacing: "0.08em",
                }}>{stat.label}</span>
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: 7,
                  color: stat.color,
                }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy section */}
        <div style={{
          padding: "14px 18px",
          borderTop: "1px solid rgba(0, 232, 160, 0.1)",
        }}>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 7,
            color: "#3a5070", letterSpacing: "0.1em", marginBottom: 10,
          }}>PHILOSOPHY</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 13,
            color: "#7a9ab8", lineHeight: 1.6,
          }}>
            &ldquo;If my portfolio is going to represent 15 years of building things, it should itself be a built thing — not a PDF you scroll past, but a world you walk through.&rdquo;
          </div>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 7,
            color: "#4a6080", marginTop: 8,
          }}>— Param Minhas</div>
        </div>

        {/* Konami code hint */}
        <div style={{
          padding: "10px 18px",
          borderTop: "1px solid #0a1525",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 6,
            color: "#1a2a3a",
          }}>
            ↑ ↑ ↓ ↓ ← → ← → B A — you found it.
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hook to detect Konami code sequence */
export function useKonamiCode(callback: () => void) {
  useEffect(() => {
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let idx = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    function onKey(e: KeyboardEvent) {
      if (e.key === KONAMI[idx]) {
        idx++;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => { idx = 0; }, 3000);
        if (idx === KONAMI.length) {
          idx = 0;
          callback();
        }
      } else {
        idx = 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); if (timeout) clearTimeout(timeout); };
  }, [callback]);
}
