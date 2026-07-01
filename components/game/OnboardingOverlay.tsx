"use client";
import { useState, useEffect } from "react";

const STYLES = `
@keyframes onb-fade-in   { from{opacity:0} to{opacity:1} }
@keyframes onb-slide-up  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes onb-key-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
@keyframes onb-arrow     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
`;

interface Props {
  onDismiss: () => void;
}

export function OnboardingOverlay({ onDismiss }: Props) {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    try {
      if (localStorage.getItem("pq_onboarding_done")) {
        setDismissed(true);
        onDismiss();
      }
    } catch {}
  }, [onDismiss]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "Escape"].includes(e.key)) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function advance() {
    if (step >= STEPS.length - 1) {
      try { localStorage.setItem("pq_onboarding_done", "1"); } catch {}
      setDismissed(true);
      onDismiss();
    } else {
      setStep(s => s + 1);
    }
  }

  function skip() {
    try { localStorage.setItem("pq_onboarding_done", "1"); } catch {}
    setDismissed(true);
    onDismiss();
  }

  if (dismissed) return null;

  const current = STEPS[step];

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 55,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(2, 4, 10, 0.7)",
        animation: "onb-fade-in 0.3s ease-out",
        padding: "16px 16px 80px",
        cursor: "pointer",
      }}
      onClick={advance}
    >
      <style>{STYLES}</style>

      <div
        key={step}
        style={{
          width: "100%", maxWidth: 500,
          background: "rgba(7, 16, 30, 0.97)",
          border: "2px solid rgba(124, 224, 255, 0.3)",
          boxShadow: "0 0 30px rgba(124, 224, 255, 0.1)",
          padding: "20px 24px",
          animation: "onb-slide-up 0.3s ease-out",
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Step indicator */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 14,
        }}>
          <div style={{ display: "flex", gap: 4 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: i === step ? "#7ce0ff" : i < step ? "rgba(124,224,255,0.4)" : "rgba(124,224,255,0.1)",
                border: "1px solid rgba(124,224,255,0.3)",
                transition: "background 0.2s",
              }} />
            ))}
          </div>
          <button onClick={skip} style={{
            background: "transparent", border: "none",
            fontFamily: "var(--font-pixel)", fontSize: 6,
            color: "#2a3a50", cursor: "pointer", padding: "4px 8px",
          }}>SKIP ALL</button>
        </div>

        {/* Icon */}
        <div style={{
          fontSize: 28, marginBottom: 10,
          animation: "onb-key-pulse 1.5s ease-in-out infinite",
        }}>
          {current.icon}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 10,
          color: "#7ce0ff", marginBottom: 8, letterSpacing: "0.06em",
        }}>
          {current.title}
        </div>

        {/* Description */}
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 14,
          color: "#8aa0c0", lineHeight: 1.6, marginBottom: 14,
        }}>
          {current.text}
        </div>

        {/* Controls visualization */}
        {current.keys && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {current.keys.map(k => (
              <span key={k} style={{
                fontFamily: "var(--font-pixel)", fontSize: 8,
                color: "#c8d8f0",
                padding: "4px 10px",
                background: "rgba(124,224,255,0.08)",
                border: "1px solid rgba(124,224,255,0.25)",
              }}>{k}</span>
            ))}
          </div>
        )}

        {/* Next button */}
        <button onClick={advance} style={{
          width: "100%",
          background: "linear-gradient(135deg, rgba(124,224,255,0.12) 0%, rgba(58,120,216,0.08) 100%)",
          border: "1px solid rgba(124,224,255,0.4)",
          color: "#7ce0ff",
          padding: "10px",
          fontFamily: "var(--font-pixel)", fontSize: 8,
          cursor: "pointer", letterSpacing: "0.06em",
        }}>
          {step < STEPS.length - 1 ? "NEXT →" : "START PLAYING ▶"}
        </button>
      </div>
    </div>
  );
}

const STEPS = [
  {
    icon: "🎮",
    title: "WELCOME TO PARAM QUEST",
    text: "This is a playable portfolio — 15 years of career told as a Pokémon-style RPG. Walk through zones, talk to NPCs, battle gym leaders.",
    keys: null,
  },
  {
    icon: "⬆️",
    title: "MOVE AROUND",
    text: "Walk through the world using keyboard or touch. Click/tap anywhere to auto-walk there.",
    keys: ["↑", "↓", "←", "→", "W", "A", "S", "D", "TAP"],
  },
  {
    icon: "💬",
    title: "TALK TO PEOPLE",
    text: "Walk up to NPCs and press SPACE or TAP them. Each character tells part of the career story.",
    keys: ["SPACE", "ENTER", "TAP NPC"],
  },
  {
    icon: "⚔️",
    title: "BATTLE GYM LEADERS",
    text: "Step on the gym mat to challenge the zone's boss. Each leader represents a real challenge Param faced. Beat them to earn badges.",
    keys: ["GYM MAT", "CHOOSE MOVES"],
  },
  {
    icon: "⚡",
    title: "USE THE MAP",
    text: "Press WARP or MAP to fast-travel to any zone. The whole world is open — explore in any order. Or use SPEED RUN for a 60-second overview.",
    keys: ["MAP", "⚡ WARP", "SPEED RUN"],
  },
];
