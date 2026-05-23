"use client";
import { useState } from "react";
import { ZONES } from "@/game/data";
import { playSound } from "@/lib/audio";

export function WorldSelect({ onSelect, onClose }: {
  onSelect: (zoneId: string) => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredZone = ZONES.find(z => z.id === hovered);

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 60,
      background: "linear-gradient(180deg, #03060f 0%, #060b18 50%, #040810 100%)",
      display: "flex", flexDirection: "column",
      animation: "pq-world-select-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      {/* Stars */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(60)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 37.3) % 100}%`,
            top: `${(i * 53.7) % 100}%`,
            width: i % 5 === 0 ? 2 : 1,
            height: i % 5 === 0 ? 2 : 1,
            background: "#fff",
            opacity: 0.1 + (i % 4) * 0.08,
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#2a3a50", letterSpacing: "0.25em", marginBottom: 8 }}>
          ✦ PARAM QUEST
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 14, color: "#7ce0ff",
                          textShadow: "0 3px 0 #0a2040, 0 0 20px rgba(124,224,255,0.4)" }}>
              WORLD SELECT
            </div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", marginTop: 4 }}>
              ALL 10 WORLDS OPEN — EXPLORE IN ANY ORDER
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "1px solid #1a2a4a",
            color: "#3a5070", padding: "6px 12px",
            fontFamily: "var(--font-pixel)", fontSize: 7, cursor: "pointer",
          }}>SPAWN AT START</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "16px 20px 20px", gap: 16 }}>
        {/* Zone list */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {ZONES.map((z, i) => (
            <button
              key={z.id}
              onClick={() => { playSound("warp"); onSelect(z.id); }}
              onMouseEnter={() => setHovered(z.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: hovered === z.id ? `${z.theme.accent}12` : "rgba(6,12,24,0.6)",
                border: `1px solid ${hovered === z.id ? z.theme.accent + "50" : "#1a2a3a"}`,
                padding: "10px 14px", cursor: "pointer", textAlign: "left",
                transition: "all 0.1s",
                animation: `pq-slide-in 0.3s ease-out ${i * 30}ms both`,
              }}
            >
              {/* Zone creature sprite */}
              {z.id !== "home" && (
                <div style={{
                  width: 40, height: 40, flexShrink: 0,
                  background: `${z.theme.accent}10`,
                  border: `1px solid ${z.theme.accent}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img
                    src={`/sprites/creatures/${z.id}.png`}
                    alt=""
                    style={{ width: 36, height: 36, imageRendering: "pixelated" }}
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
              {z.id === "home" && (
                <div style={{
                  width: 40, height: 40, flexShrink: 0,
                  background: "#9ad6e810", border: "1px solid #9ad6e830",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-pixel)", fontSize: 14, color: "#9ad6e8",
                }}>⌂</div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontFamily: "var(--font-pixel)", fontSize: 8,
                    color: hovered === z.id ? z.theme.accent : "#c8d8f0",
                    transition: "color 0.1s",
                  }}>{z.name.toUpperCase()}</span>
                  <span style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    color: z.theme.accent, opacity: 0.7,
                  }}>{z.years}</span>
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "#4a6080", marginTop: 2,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{z.role}</div>
              </div>

              {/* Gym indicator */}
              {z.gym && (
                <div style={{
                  fontFamily: "var(--font-pixel)", fontSize: 6,
                  color: z.theme.accent, border: `1px solid ${z.theme.accent}40`,
                  padding: "2px 6px", flexShrink: 0,
                }}>GYM</div>
              )}
            </button>
          ))}
        </div>

        {/* Preview panel - desktop only */}
        <div style={{
          width: 200, flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 10,
        }} className="hidden sm:flex">
          {hoveredZone ? (
            <>
              {hoveredZone.id !== "home" && (
                <div style={{
                  height: 180,
                  background: `${hoveredZone.theme.accent}10`,
                  border: `2px solid ${hoveredZone.theme.accent}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img
                    src={`/sprites/landmarks/${hoveredZone.id}.png`}
                    alt=""
                    style={{ width: 160, height: 160, imageRendering: "pixelated" }}
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
              <div style={{
                background: "rgba(6,12,24,0.8)",
                border: "1px solid #1a2a3a",
                padding: 12,
              }}>
                <div style={{
                  fontFamily: "var(--font-pixel)", fontSize: 8,
                  color: hoveredZone.theme.accent, marginBottom: 6,
                }}>{hoveredZone.org.toUpperCase()}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 12,
                  color: "#8aa0c0", lineHeight: 1.5,
                }}>{hoveredZone.outcome}</div>
                {hoveredZone.gym && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{
                      fontFamily: "var(--font-pixel)", fontSize: 6,
                      color: "#3a5070",
                    }}>GYM LEADER</div>
                    <div style={{
                      fontFamily: "var(--font-pixel)", fontSize: 8,
                      color: hoveredZone.theme.accent, marginTop: 2,
                    }}>{hoveredZone.gym.opponentName}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              background: "rgba(6,12,24,0.4)",
              border: "1px solid #0d1a2a",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16,
            }}>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                color: "#1a2a3a", textAlign: "center", lineHeight: 2,
              }}>
                HOVER A WORLD<br />TO PREVIEW
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
