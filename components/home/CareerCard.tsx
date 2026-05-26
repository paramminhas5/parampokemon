"use client";
import { useState } from "react";
import type { Zone } from "@/game/data";

export function CareerCard({ z, i }: { z: Zone; i: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="pq-panel animate-fade-in"
      style={{
        animationDelay: `${i * 60}ms`,
        borderColor: `${z.theme.accent}30`,
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onClick={() => setOpen(o => !o)}
    >
      {/* ── Collapsed row ── */}
      <div
        className="pq-panel-inner"
        style={{ display: "flex", gap: 16, alignItems: "center", padding: "14px 16px" }}
      >
        {/* Creature sprite */}
        {z.creature && (
          <div style={{
            width: 64, height: 64, flexShrink: 0,
            background: `${z.theme.accent}12`,
            border: `2px solid ${z.theme.accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.2s",
          }}>
            <img
              src={`/sprites/creatures/${z.id}.png`}
              alt={z.creature.name}
              style={{ width: 56, height: 56, imageRendering: "pixelated" }}
            />
          </div>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: z.theme.accent }}>
              {z.org}
            </span>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070" }}>
              {z.years}
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "#a0b8d0", lineHeight: 1.3 }}>
            {z.role}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "#5570a0", marginTop: 3, lineHeight: 1.4 }}>
            {z.outcome}
          </div>
        </div>

        {/* Right: badge + expand toggle */}
        <div style={{ flexShrink: 0, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `${z.theme.accent}20`,
            border: `2px solid ${z.theme.accent}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-pixel)", fontSize: 14,
            color: z.theme.accent,
          }}>★</div>
          {z.gym && (
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a3a50" }}>
              {z.gym.opponentName}
            </div>
          )}
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 7,
            color: z.theme.accent, opacity: 0.6,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</div>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 600 : 0,
        transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{
          borderTop: `1px solid ${z.theme.accent}20`,
          padding: "14px 16px 16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}>
          {/* Left: what I did + learned */}
          <div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: z.theme.accent, marginBottom: 8, letterSpacing: "0.1em" }}>
              ★ WHAT I DID
            </div>
            {z.cliff.did.map((d, di) => (
              <div key={di} style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#7a90b0", marginBottom: 4, lineHeight: 1.4 }}>
                ▸ {d}
              </div>
            ))}
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: z.theme.accent, margin: "12px 0 8px", letterSpacing: "0.1em" }}>
              ✦ WHAT I LEARNED
            </div>
            {z.cliff.learned.map((l, li) => (
              <div key={li} style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#5570a0", marginBottom: 4, lineHeight: 1.4, fontStyle: "italic" }}>
                "{l}"
              </div>
            ))}
          </div>

          {/* Right: metrics + gym leader */}
          <div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: z.theme.accent, marginBottom: 8, letterSpacing: "0.1em" }}>
              ★ METRICS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {z.cliff.metrics.map(m => (
                <div key={m.label} style={{
                  background: `${z.theme.accent}10`,
                  border: `1px solid ${z.theme.accent}30`,
                  padding: "6px 10px",
                  borderRadius: 2,
                }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070" }}>{m.label}</div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 12, color: z.theme.accent }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Gym leader thumbnail */}
            {z.gym && (
              <div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: z.theme.accent, marginBottom: 8, letterSpacing: "0.1em" }}>
                  ⚔ GYM BOSS
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 56, height: 56, flexShrink: 0,
                    background: `${z.theme.accent}10`,
                    border: `2px solid ${z.theme.accent}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img
                      src={`/sprites/leaders/${z.gym.leader}.png`}
                      alt={z.gym.opponentName}
                      style={{ width: 48, height: 48, imageRendering: "pixelated" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: z.theme.accent }}>{z.gym.opponentName}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#5570a0", marginTop: 3, fontStyle: "italic" }}>
                      "{z.gym.victory}"
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Creature info */}
            {z.creature && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: z.theme.accent, marginBottom: 6, letterSpacing: "0.1em" }}>
                  ✦ ZONE CREATURE
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#a0b8d0" }}>{z.creature.name}</div>
                  <div style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    background: `${z.theme.accent}18`, border: `1px solid ${z.theme.accent}40`,
                    color: z.theme.accent, padding: "2px 6px",
                  }}>{z.creature.type}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#3a5070", marginTop: 3, fontStyle: "italic" }}>
                  {z.creature.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
