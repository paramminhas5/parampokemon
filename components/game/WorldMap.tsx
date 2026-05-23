"use client";
import { ZONES } from "@/game/data";

export function WorldMap({ visited, defeated, currentId, onWarp, onClose }: {
  visited: Set<string>;
  defeated: Set<string>;
  currentId: string;
  onWarp: (zoneId: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 40,
        background: "rgba(4,8,20,0.93)",
        backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 12,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 480,
          border: "2px solid #2a3a5a",
          background: "linear-gradient(180deg, #07101e 0%, #050c18 100%)",
          display: "flex", flexDirection: "column",
          maxHeight: "90vh",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "2px solid #1a2a4a",
          background: "#060e1c",
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#7ce0ff" }}>
              ✦ PARAM-AMP
            </div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", marginTop: 2 }}>
              FAST TRAVEL — ALL WORLDS ACCESSIBLE
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid #1a2a4a",
            color: "#3a5070", padding: "6px 10px",
            fontFamily: "var(--font-pixel)", fontSize: 9, cursor: "pointer",
          }}>✕</button>
        </div>

        {/* Zone list */}
        <div style={{ overflowY: "auto", padding: "8px 12px 12px" }}>
          {ZONES.map((z, i) => {
            const isCurrent = z.id === currentId;
            const isDefeated = defeated.has(z.id);
            const isVisited = visited.has(z.id);

            return (
              <div
                key={z.id}
                style={{ position: "relative", display: "flex", alignItems: "stretch" }}
              >
                {/* Timeline connector */}
                <div style={{
                  width: 32, flexShrink: 0,
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  {/* Top line */}
                  {i > 0 && (
                    <div style={{ width: 2, flex: 1, background: "#1a2a4a", minHeight: 8 }} />
                  )}
                  {/* Node */}
                  <div style={{
                    width: 12, height: 12,
                    borderRadius: "50%",
                    background: isCurrent ? "#7ce0ff" : isDefeated ? z.theme.accent : isVisited ? "#2a4060" : "#1a2a3a",
                    border: `2px solid ${isCurrent ? "#7ce0ff" : isDefeated ? z.theme.accent : "#2a3a5a"}`,
                    boxShadow: isCurrent ? `0 0 8px #7ce0ff` : isDefeated ? `0 0 6px ${z.theme.accent}` : "none",
                    flexShrink: 0, zIndex: 2,
                  }} />
                  {/* Bottom line */}
                  {i < ZONES.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: "#1a2a4a", minHeight: 8 }} />
                  )}
                </div>

                {/* Zone card */}
                <button
                  onClick={() => !isCurrent && onWarp(z.id)}
                  disabled={isCurrent}
                  style={{
                    flex: 1, textAlign: "left",
                    background: isCurrent ? z.theme.accent + "14" : "transparent",
                    border: `1px solid ${isCurrent ? z.theme.accent + "40" : "transparent"}`,
                    borderRadius: 2,
                    padding: "8px 12px",
                    margin: "3px 0 3px 6px",
                    cursor: isCurrent ? "default" : "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = z.theme.accent + "10";
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Zone color dot */}
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: z.theme.accent,
                      boxShadow: `0 0 4px ${z.theme.accent}`,
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "var(--font-pixel)", fontSize: 9,
                        color: isCurrent ? "#7ce0ff" : isDefeated ? z.theme.accent : "#c8d8f0",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        {z.name.toUpperCase()}
                        {isCurrent && (
                          <span style={{
                            fontSize: 6, padding: "1px 5px",
                            background: "#7ce0ff22", border: "1px solid #7ce0ff40",
                            color: "#7ce0ff",
                          }}>YOU ARE HERE</span>
                        )}
                        {isDefeated && !isCurrent && (
                          <span style={{ fontSize: 9, color: z.theme.accent }}>★</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                        <span style={{
                          fontFamily: "var(--font-pixel)", fontSize: 7,
                          color: "#4a6080",
                        }}>{z.org}</span>
                        <span style={{
                          fontFamily: "var(--font-pixel)", fontSize: 7,
                          color: "#3a5070",
                        }}>{z.years}</span>
                      </div>
                    </div>

                    {/* Warp badge or badge indicator */}
                    <div style={{ flexShrink: 0 }}>
                      {isDefeated ? (
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%",
                          background: z.theme.accent, border: `2px solid ${z.theme.accent}80`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10,
                        }}>★</div>
                      ) : !isCurrent ? (
                        <span style={{
                          fontFamily: "var(--font-pixel)", fontSize: 6,
                          border: "1px solid #2a3a5a", color: "#3a5070",
                          padding: "3px 6px",
                        }}>WARP</span>
                      ) : null}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 16px", borderTop: "2px solid #1a2a4a",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#040c18",
        }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070" }}>
            ★ {defeated.size}/9 GYMS · {visited.size}/{ZONES.length} VISITED
          </div>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#2a3a5a" }}>
            ALL WORLDS OPEN
          </div>
        </div>
      </div>
    </div>
  );
}
