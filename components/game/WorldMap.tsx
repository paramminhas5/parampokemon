"use client";
import { ZONES } from "@/game/data";
import { LEADER_URL } from "@/game/sprite-registry";

const WM_STYLES = `
@keyframes wm-fade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes wm-node-pulse { 0%,100%{box-shadow:0 0 6px currentColor} 50%{box-shadow:0 0 14px currentColor} }
`;

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
        background: "rgba(2,4,14,0.95)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 12,
      }}
      onClick={onClose}
    >
      <style>{WM_STYLES}</style>
      <div
        style={{
          width: "100%", maxWidth: 500,
          border: "2px solid #162438",
          background: "linear-gradient(180deg, #060e1e 0%, #040a16 100%)",
          display: "flex", flexDirection: "column",
          maxHeight: "92vh",
          borderRadius: 3,
          boxShadow: "0 0 40px rgba(124,224,255,0.06), 0 20px 60px rgba(0,0,0,0.8)",
          animation: "wm-fade 0.25s ease-out",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #101e32",
          background: "rgba(4,8,18,0.8)",
          borderRadius: "3px 3px 0 0",
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#7ce0ff", textShadow: "0 0 16px rgba(124,224,255,0.4)" }}>
              ✦ WORLD MAP
            </div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a4060", marginTop: 3, letterSpacing: "0.1em" }}>
              CAREER TIMELINE — ALL WORLDS ACCESSIBLE
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid #162438",
            color: "#2a4060", padding: "6px 10px",
            fontFamily: "var(--font-pixel)", fontSize: 9, cursor: "pointer",
            borderRadius: 2, transition: "all 0.1s",
          }}>✕</button>
        </div>

        {/* Zone timeline */}
        <div style={{ overflowY: "auto", padding: "6px 14px 14px" }}>
          {ZONES.map((z, i) => {
            const isCurrent  = z.id === currentId;
            const isDefeated = defeated.has(z.id);
            const isVisited  = visited.has(z.id);

            return (
              <div key={z.id} style={{ position: "relative", display: "flex", alignItems: "stretch" }}>

                {/* Timeline column */}
                <div style={{ width: 28, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {i > 0 && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 8,
                      background: isDefeated
                        ? `linear-gradient(to bottom, ${ZONES[i-1].theme.accent}, ${z.theme.accent})`
                        : "#0e1c2e",
                    }} />
                  )}
                  {/* Timeline node */}
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%", flexShrink: 0, zIndex: 2,
                    background: isCurrent
                      ? "#7ce0ff"
                      : isDefeated
                        ? z.theme.accent
                        : isVisited ? "#1e3050" : "#0c1828",
                    border: `2px solid ${isCurrent ? "#7ce0ff" : isDefeated ? z.theme.accent : "#162438"}`,
                    color: isCurrent ? "#7ce0ff" : z.theme.accent,
                    boxShadow: isCurrent
                      ? "0 0 10px #7ce0ff, 0 0 20px rgba(124,224,255,0.3)"
                      : isDefeated
                        ? `0 0 8px ${z.theme.accent}80`
                        : "none",
                    animation: isCurrent ? "wm-node-pulse 2s ease-in-out infinite" : "none",
                  }} />
                  {i < ZONES.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 8, background: "#0e1c2e" }} />
                  )}
                </div>

                {/* Zone card */}
                <button
                  onClick={() => !isCurrent && onWarp(z.id)}
                  disabled={isCurrent}
                  style={{
                    flex: 1, textAlign: "left",
                    background: isCurrent
                      ? `linear-gradient(135deg, ${z.theme.accent}14, ${z.theme.accent}08)`
                      : "transparent",
                    border: `1px solid ${isCurrent ? z.theme.accent + "38" : "transparent"}`,
                    borderRadius: 2,
                    padding: "7px 10px",
                    margin: "2px 0 2px 8px",
                    cursor: isCurrent ? "default" : "pointer",
                    transition: "all 0.1s",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent) {
                      (e.currentTarget as HTMLButtonElement).style.background = z.theme.accent + "0e";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = z.theme.accent + "28";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                    }
                  }}
                >
                  {/* Landmark thumbnail */}
                  <div style={{
                    width: 36, height: 36, flexShrink: 0,
                    background: `${z.theme.accent}0c`,
                    border: `1px solid ${z.theme.accent}20`,
                    borderRadius: 2, overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    {isDefeated && z.gym && LEADER_URL[z.gym.leader] && (
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 2,
                      }}>
                        <img
                          src={LEADER_URL[z.gym.leader]}
                          alt={z.gym.opponentName}
                          style={{ width: 32, height: 32, imageRendering: "pixelated", filter: "grayscale(0.3)" }}
                          onError={e => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    )}
                    {!isDefeated && (
                      <img
                        src={`/sprites/landmarks/${z.id}.png`}
                        alt=""
                        style={{ width: 32, height: 32, imageRendering: "pixelated" }}
                        onError={e => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    {isDefeated && (
                      <div style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: 12, height: 12,
                        background: z.theme.accent,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 7, zIndex: 3,
                      }}>★</div>
                    )}
                  </div>

                  {/* Zone text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{
                        fontFamily: "var(--font-pixel)", fontSize: 8,
                        color: isCurrent ? "#7ce0ff" : isDefeated ? z.theme.accent : "#a0b8d0",
                      }}>{z.name.toUpperCase()}</span>
                      {isCurrent && (
                        <span style={{
                          fontSize: 6, padding: "1px 4px",
                          background: "#7ce0ff18", border: "1px solid #7ce0ff35",
                          color: "#7ce0ff", fontFamily: "var(--font-pixel)",
                        }}>HERE</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: z.theme.accent, flexShrink: 0,
                        boxShadow: `0 0 3px ${z.theme.accent}`,
                      }} />
                      <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a4060" }}>{z.org}</span>
                      <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#1a2e48" }}>{z.years}</span>
                    </div>
                  </div>

                  {/* Right CTA */}
                  <div style={{ flexShrink: 0 }}>
                    {isDefeated && !isCurrent ? (
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: `${z.theme.accent}22`,
                        border: `1.5px solid ${z.theme.accent}70`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: z.theme.accent, fontSize: 11,
                      }}>★</div>
                    ) : !isCurrent ? (
                      <span style={{
                        fontFamily: "var(--font-pixel)", fontSize: 6,
                        border: "1px solid #162438", color: "#2a4060",
                        padding: "3px 6px", borderRadius: 1,
                      }}>WARP</span>
                    ) : null}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "8px 16px", borderTop: "1px solid #0e1c30",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(2,6,14,0.7)",
          borderRadius: "0 0 3px 3px",
        }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a4060" }}>
            ★ {defeated.size}/9 GYMS · {visited.size}/{ZONES.length} VISITED
          </div>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#162438" }}>
            ALL WORLDS OPEN
          </div>
        </div>
      </div>
    </div>
  );
}
