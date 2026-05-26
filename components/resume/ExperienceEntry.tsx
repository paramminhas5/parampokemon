"use client";
import { useState } from "react";
import type { Zone } from "@/game/data";

export function ExperienceEntry({ z, i, isLast }: { z: Zone; i: number; isLast: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "stretch", position: "relative" }}>
      {/* Timeline bar */}
      <div style={{ width: 32, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {i > 0 && <div style={{ width: 2, height: 16, background: "#1a2a4a" }} />}
        <div style={{
          width: 12, height: 12, borderRadius: "50%",
          background: z.theme.accent,
          border: `2px solid ${z.theme.accent}80`,
          boxShadow: `0 0 6px ${z.theme.accent}60`,
          flexShrink: 0, zIndex: 1,
          marginTop: i === 0 ? 16 : 0,
        }} />
        {!isLast && <div style={{ width: 2, flex: 1, background: "#1a2a4a", minHeight: 16 }} />}
      </div>

      {/* Card */}
      <div
        className="pq-panel"
        style={{
          flex: 1, marginLeft: 8,
          marginTop: i === 0 ? 10 : 6,
          marginBottom: 6,
          borderColor: `${z.theme.accent}30`,
          cursor: "pointer",
        }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Collapsed header */}
        <div className="pq-panel-inner">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            {/* Creature sprite */}
            {z.creature && (
              <div style={{
                width: 52, height: 52, flexShrink: 0,
                background: `${z.theme.accent}12`,
                border: `2px solid ${z.theme.accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 4,
              }}>
                <img
                  src={`/sprites/creatures/${z.id}.png`}
                  alt={z.creature.name}
                  width={44} height={44}
                  style={{ imageRendering: "pixelated", width: 44, height: 44, objectFit: "contain" }}
                />
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: z.theme.accent }}>{z.org}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070" }}>{z.years}</div>
                  {/* Expand chevron */}
                  <div style={{
                    fontFamily: "var(--font-pixel)", fontSize: 7, color: z.theme.accent, opacity: 0.55,
                    transition: "transform 0.2s",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  }}>▼</div>
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 17, color: "#c8d8f0", lineHeight: 1.3, marginBottom: 4 }}>{z.role}</div>
              {/* Always-visible bullets */}
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {z.bullets.slice(0, 2).map((b, bi) => (
                  <li key={bi} style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#7a90b0", marginTop: 2, lineHeight: 1.4 }}>▸ {b}</li>
                ))}
                {z.bullets.length > 2 && !open && (
                  <li style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: z.theme.accent, marginTop: 4, opacity: 0.7 }}>
                    + {z.bullets.length - 2} more — click to expand
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <div style={{
          overflow: "hidden",
          maxHeight: open ? 700 : 0,
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <div style={{
            borderTop: `1px solid ${z.theme.accent}20`,
            padding: "14px 14px 16px",
          }}>
            {/* Remaining bullets */}
            {z.bullets.length > 2 && (
              <div style={{ marginBottom: 14 }}>
                {z.bullets.slice(2).map((b, bi) => (
                  <div key={bi} style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#7a90b0", marginBottom: 3, lineHeight: 1.4 }}>▸ {b}</div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Left column: what I did / learned */}
              <div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: z.theme.accent, marginBottom: 8, letterSpacing: "0.1em" }}>
                  ✦ WHAT I LEARNED
                </div>
                {z.cliff.learned.map((l, li) => (
                  <div key={li} style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#5570a0", marginBottom: 4, lineHeight: 1.4, fontStyle: "italic" }}>
                    "{l}"
                  </div>
                ))}

                {/* Metrics */}
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: z.theme.accent, margin: "12px 0 8px", letterSpacing: "0.1em" }}>
                  ★ METRICS
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {z.cliff.metrics.map(m => (
                    <div key={m.label} style={{
                      background: `${z.theme.accent}0e`,
                      border: `1px solid ${z.theme.accent}28`,
                      padding: "4px 8px", borderRadius: 2,
                    }}>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 5, color: "#3a5070" }}>{m.label}</div>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 11, color: z.theme.accent }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column: gym leader */}
              {z.gym && (
                <div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: z.theme.accent, marginBottom: 8, letterSpacing: "0.1em" }}>
                    ⚔ GYM BOSS
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <img
                      src={`/sprites/leaders/${z.gym.leader}.png`}
                      alt={z.gym.opponentName}
                      width={44} height={44}
                      style={{
                        imageRendering: "pixelated", width: 44, height: 44,
                        border: `2px solid ${z.theme.accent}40`, borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: z.theme.accent }}>{z.gym.opponentName}</div>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070", marginTop: 3 }}>{z.gym.opponentTitle}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#5570a0", fontStyle: "italic", lineHeight: 1.4 }}>
                    "{z.gym.victory}"
                  </div>

                  {/* Creature info */}
                  {z.creature && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${z.theme.accent}18` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#a0b8d0" }}>{z.creature.name}</span>
                        <span style={{
                          fontFamily: "var(--font-pixel)", fontSize: 6,
                          background: `${z.theme.accent}18`, border: `1px solid ${z.theme.accent}35`,
                          color: z.theme.accent, padding: "1px 5px", borderRadius: 2,
                        }}>{z.creature.type}</span>
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#3a5070", fontStyle: "italic" }}>
                        {z.creature.description}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
