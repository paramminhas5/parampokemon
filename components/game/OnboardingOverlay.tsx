"use client";
import { useState, useEffect } from "react";

const STYLES = `
@keyframes onb-fade-in   { from{opacity:0} to{opacity:1} }
@keyframes onb-slide-up  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
`;

interface Props {
  onDismiss: () => void;
}

// Single combined tips card — covers move/talk/battle/map in one screen so
// it reads well on both desktop (keyboard hints) and mobile (tap hints)
// without forcing the player through a multi-step wizard.
const TIPS: { icon: string; title: string; text: string; keys: string[] }[] = [
  {
    icon: "⬆️",
    title: "MOVE",
    text: "Walk with arrows/WASD, or tap anywhere to auto-walk there.",
    keys: ["↑↓←→", "WASD", "TAP"],
  },
  {
    icon: "💬",
    title: "TALK",
    text: "Walk up to an NPC and press SPACE, or tap them on mobile.",
    keys: ["SPACE", "TAP NPC"],
  },
  {
    icon: "⚔️",
    title: "BATTLE",
    text: "Step on a gym mat to challenge the zone's leader and earn a badge.",
    keys: ["GYM MAT"],
  },
  {
    icon: "⚡",
    title: "FAST TRAVEL",
    text: "Open the map anytime to warp to any zone, or try SPEED RUN for a 60-second overview.",
    keys: ["MAP", "SPEED RUN"],
  },
];

export function OnboardingOverlay({ onDismiss }: Props) {
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
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function finish() {
    try { localStorage.setItem("pq_onboarding_done", "1"); } catch {}
    setDismissed(true);
    onDismiss();
  }

  if (dismissed) return null;

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
      onClick={finish}
    >
      <style>{STYLES}</style>

      <div
        style={{
          width: "100%", maxWidth: 520,
          background: "rgba(7, 16, 30, 0.97)",
          border: "2px solid rgba(124, 224, 255, 0.3)",
          boxShadow: "0 0 30px rgba(124, 224, 255, 0.1)",
          padding: "20px 24px",
          animation: "onb-slide-up 0.3s ease-out",
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 10,
          color: "#7ce0ff", marginBottom: 14, letterSpacing: "0.06em",
        }}>
          WELCOME TO CAREER QUEST
        </div>

        {/* All tips in one compact grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}>
          {TIPS.map(tip => (
            <div key={tip.title} style={{
              background: "rgba(124,224,255,0.05)",
              border: "1px solid rgba(124,224,255,0.15)",
              padding: "10px 12px",
              borderRadius: 2,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{tip.icon}</span>
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: 8,
                  color: "#7ce0ff", letterSpacing: "0.05em",
                }}>{tip.title}</span>
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 12,
                color: "#8aa0c0", lineHeight: 1.5, marginBottom: 8,
              }}>
                {tip.text}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {tip.keys.map(k => (
                  <span key={k} style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    color: "#c8d8f0",
                    padding: "3px 7px",
                    background: "rgba(124,224,255,0.08)",
                    border: "1px solid rgba(124,224,255,0.25)",
                  }}>{k}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={finish} style={{
          width: "100%",
          background: "linear-gradient(135deg, rgba(124,224,255,0.12) 0%, rgba(58,120,216,0.08) 100%)",
          border: "1px solid rgba(124,224,255,0.4)",
          color: "#7ce0ff",
          padding: "10px",
          fontFamily: "var(--font-pixel)", fontSize: 8,
          cursor: "pointer", letterSpacing: "0.06em",
        }}>
          GOT IT — START PLAYING ▶
        </button>
      </div>
    </div>
  );
}
