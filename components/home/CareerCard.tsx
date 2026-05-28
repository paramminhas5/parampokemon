"use client";
import { useState } from "react";
import type { Zone } from "@/game/data";

export function CareerCard({ z, i }: { z: Zone; i: number }) {
  const [open, setOpen] = useState(false);
  const accent = z.theme.accent;

  return (
    <div
      style={{
        background: open
          ? `linear-gradient(135deg, ${accent}10 0%, rgba(4,8,20,0.96) 100%)`
          : "rgba(6,12,24,0.92)",
        border: `1px solid ${open ? accent + "50" : accent + "22"}`,
        borderRadius: 6,
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
        boxShadow: open ? `0 0 24px ${accent}18` : "none",
        overflow: "hidden",
        animationDelay: `${i * 60}ms`,
      }}
      onClick={() => setOpen(o => !o)}
      onMouseEnter={e => {
        if (!open) (e.currentTarget as HTMLDivElement).style.borderColor = accent + "40";
      }}
      onMouseLeave={e => {
        if (!open) (e.currentTarget as HTMLDivElement).style.borderColor = accent + "22";
      }}
    >
      {/* ── Collapsed row ── */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px" }}>
        {/* Creature sprite */}
        {z.creature ? (
          <div style={{
            width: 60, height: 60, flexShrink: 0,
            background: `${accent}14`,
            border: `1px solid ${accent}35`,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 4,
            transition: "border-color 0.2s",
          }}>
            <img
              src={`/sprites/creatures/${z.id}.png`}
              alt={z.creature.name}
              style={{ width: 52, height: 52, imageRendering: "pixelated" }}
            />
          </div>
        ) : (
          <div style={{
            width: 60, height: 60, flexShrink: 0,
            background: `${accent}10`, border: `1px solid ${accent}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-pixel)", fontSize: 22, color: accent,
            borderRadius: 4,
          }}>★</div>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{
              fontFamily: "var(--font-pixel)", fontSize: 10, color: accent,
              letterSpacing: "0.04em",
            }}>
              {z.org}
            </span>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#2a3a50" }}>
              {z.years}
            </span>
          </div>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 8,
            color: "#8aa8c8", lineHeight: 1.4, marginBottom: 4,
          }}>
            {z.role}
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 14,
            color: "#3a5278", lineHeight: 1.3,
          }}>
            {z.outcome}
          </div>
        </div>

        {/* Right: metrics strip + expand */}
        <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {/* Key metric pill */}
          {z.cliff.metrics[0] && (
            <div style={{
              background: `${accent}14`, border: `1px solid ${accent}35`,
              padding: "4px 8px", borderRadius: 3,
              fontFamily: "var(--font-pixel)", fontSize: 8, color: accent,
              letterSpacing: "0.03em",
            }}>
              {z.cliff.metrics[0].value}
            </div>
          )}
          {z.gym && (
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 6, color: "#1a2a40",
              textAlign: "right",
            }}>
              {z.gym.opponentName}
            </div>
          )}
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 7,
            color: accent, opacity: open ? 1 : 0.5,
            transition: "transform 0.25s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</div>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 700 : 0,
        transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{
          borderTop: `1px solid ${accent}20`,
          padding: "14px 16px 18px",
        }}>
          {/* Two-col: did/learned + stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {/* Left: what I did + learned */}
            <div>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: accent, marginBottom: 8, letterSpacing: "0.12em",
              }}>★ WHAT I DID</div>
              {z.cliff.did.map((d, di) => (
                <div key={di} style={{
                  fontFamily: "var(--font-mono)", fontSize: 13,
                  color: "#6a88b0", marginBottom: 5, lineHeight: 1.5,
                  paddingLeft: 12, position: "relative",
                }}>
                  <span style={{ position: "absolute", left: 0, color: accent, fontSize: 9 }}>▸</span>
                  {d}
                </div>
              ))}
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: accent, margin: "12px 0 8px", letterSpacing: "0.12em", opacity: 0.8,
              }}>✦ WHAT I LEARNED</div>
              {z.cliff.learned.map((l, li) => (
                <div key={li} style={{
                  fontFamily: "var(--font-mono)", fontSize: 13,
                  color: "#3a5070", marginBottom: 5, lineHeight: 1.5, fontStyle: "italic",
                  paddingLeft: 12, position: "relative",
                }}>
                  <span style={{ position: "absolute", left: 0, color: accent + "60", fontSize: 9 }}>✦</span>
                  "{l}"
                </div>
              ))}
            </div>

            {/* Right: metrics + gym leader */}
            <div>
              {/* Metrics */}
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: accent, marginBottom: 8, letterSpacing: "0.12em",
              }}>★ METRICS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {z.cliff.metrics.map(m => (
                  <div key={m.label} style={{
                    background: `${accent}10`, border: `1px solid ${accent}30`,
                    padding: "6px 10px", borderRadius: 3, minWidth: 60,
                  }}>
                    <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a3a50", marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontFamily: "var(--font-pixel)", fontSize: 11, color: accent }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Gym leader */}
              {z.gym && (
                <div>
                  <div style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    color: accent, marginBottom: 8, letterSpacing: "0.12em",
                  }}>⚔ GYM BOSS</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 52, height: 52, flexShrink: 0,
                      background: `${accent}10`, border: `1px solid ${accent}35`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 4,
                    }}>
                      <img
                        src={`/sprites/leaders/${z.gym.leader}.png`}
                        alt={z.gym.opponentName}
                        style={{ width: 44, height: 44, imageRendering: "pixelated" }}
                      />
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: accent, marginBottom: 3 }}>
                        {z.gym.opponentName}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontSize: 12,
                        color: "#3a5070", fontStyle: "italic", lineHeight: 1.4,
                      }}>
                        "{z.gym.victory}"
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Creature info */}
              {z.creature && (
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    color: accent, marginBottom: 6, letterSpacing: "0.12em", opacity: 0.8,
                  }}>✦ ZONE CREATURE</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#8aa0c0" }}>
                      {z.creature.name}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-pixel)", fontSize: 6,
                      background: `${accent}14`, border: `1px solid ${accent}40`,
                      color: accent, padding: "2px 6px", borderRadius: 99,
                    }}>{z.creature.type}</span>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: "#2a4060", marginTop: 3, fontStyle: "italic",
                  }}>{z.creature.description}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
