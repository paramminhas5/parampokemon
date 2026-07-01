"use client";
import type { Zone } from "@/game/data";
import { useEffect, useRef, useState } from "react";
import { CREATURE_URL, LEADER_URL } from "@/game/sprite-registry";

const SHEET_STYLES = `
@keyframes pq-sheet-up { from { transform: translateY(32px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes pq-modal-pop { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
@keyframes pq-scroll-hint { 0%, 100% { transform: translateX(-50%) translateY(0) } 50% { transform: translateX(-50%) translateY(4px) } }
@keyframes cn-metric-in { from { opacity:0; transform: scale(0.85) } to { opacity:1; transform: scale(1) } }
`;

export function CliffNotes({ zone, onClose }: { zone: Zone; onClose: () => void }) {
  const c = zone.cliff;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const accent = zone.theme.accent;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollHeight > el.clientHeight + 8);
    check();
    const onScroll = () => { if (el.scrollTop > 16) setScrolled(true); };
    el.addEventListener("scroll", onScroll);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", onScroll); ro.disconnect(); };
  }, []);

  // Close on backdrop click or Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const creatureUrl = zone.creature ? CREATURE_URL[zone.id] : undefined;
  const leaderUrl   = zone.gym ? LEADER_URL[zone.gym.leader] : undefined;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(4,8,20,0.72)",
        backdropFilter: "blur(3px)",
      }}
      onClick={onClose}
    >
      <style>{SHEET_STYLES}</style>
      <div
        style={{
          width: "92%", maxWidth: 560,
          maxHeight: "70dvh", height: "auto",
          display: "flex", flexDirection: "column",
          background: "linear-gradient(180deg, #060e1c 0%, #04080f 100%)",
          border: `1px solid ${accent}35`,
          borderRadius: 12,
          boxShadow: `0 -8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${accent}18`,
          animation: "pq-modal-pop 200ms cubic-bezier(0.2,0.8,0.4,1)",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent top line */}
        <div style={{
          height: 3, flexShrink: 0,
          background: `linear-gradient(90deg, transparent 0%, ${accent} 30%, ${accent} 70%, transparent 100%)`,
        }} />

        {/* Drag handle */}
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", paddingTop: 8, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, background: accent + "40", borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{
          flexShrink: 0, padding: "0 16px 12px",
          borderBottom: `1px solid ${accent}20`,
          display: "flex", alignItems: "flex-start", gap: 14,
        }}>
          {/* Creature/leader thumb */}
          <div style={{ flexShrink: 0 }}>
            {creatureUrl ? (
              <div style={{
                width: 56, height: 56,
                background: accent + "14",
                border: `2px solid ${accent}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 4,
              }}>
                <img src={creatureUrl} alt="" style={{ width: 48, height: 48, imageRendering: "pixelated" }} />
              </div>
            ) : leaderUrl ? (
              <div style={{
                width: 56, height: 56,
                background: accent + "14",
                border: `2px solid ${accent}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 4,
              }}>
                <img src={leaderUrl} alt="" style={{ width: 48, height: 48, imageRendering: "pixelated" }} />
              </div>
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: 4,
                background: accent + "14", border: `2px solid ${accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-pixel)", fontSize: 20, color: accent,
              }}>★</div>
            )}
          </div>

          {/* Title info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 6,
              color: accent, letterSpacing: "0.2em", opacity: 0.8, marginBottom: 4,
            }}>CLIFFNOTES #{zone.index + 1}</div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 14,
              color: "#d8eaf8", lineHeight: 1.1, marginBottom: 4,
            }} className="truncate">{zone.name.toUpperCase()}</div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 7,
              color: "#3a5070",
            }}>{c.era}</div>
          </div>

          {/* Close button — prominent */}
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              background: `linear-gradient(135deg, ${accent}18 0%, rgba(4,8,20,0.9) 100%)`,
              border: `1px solid ${accent}50`,
              color: accent,
              padding: "8px 14px",
              fontFamily: "var(--font-pixel)", fontSize: 9,
              cursor: "pointer",
              borderRadius: 4,
              boxShadow: `0 0 12px ${accent}20`,
              transition: "all 0.15s",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${accent}40`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 12px ${accent}20`; }}
          >✕ EXIT</button>
        </div>

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflowY: "auto", padding: "14px 16px",
            WebkitOverflowScrolling: "touch" as const, minHeight: 0,
          }}
        >
          {/* Outcome banner */}
          <div style={{
            background: `linear-gradient(135deg, ${accent}12 0%, rgba(4,8,20,0.8) 100%)`,
            border: `1px solid ${accent}28`,
            padding: "10px 14px", marginBottom: 14,
            borderRadius: 4,
          }}>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 6,
              color: accent, letterSpacing: "0.15em", marginBottom: 5,
            }}>OUTCOME</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 16,
              color: "#c0d4ec", lineHeight: 1.5,
            }}>{zone.outcome}</div>
          </div>

          {/* DID / LEARNED two-col */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{
              background: "rgba(4,8,20,0.7)", border: `1px solid ${accent}20`,
              padding: "10px 12px", borderRadius: 4,
            }}>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: accent, letterSpacing: "0.15em", marginBottom: 8,
              }}>★ WHAT I DID</div>
              {c.did.map((d, i) => (
                <div key={i} style={{
                  fontFamily: "var(--font-mono)", fontSize: 14,
                  color: "#8aa0c0", lineHeight: 1.5, marginBottom: 5,
                  paddingLeft: 10, position: "relative",
                }}>
                  <span style={{
                    position: "absolute", left: 0,
                    color: accent, fontSize: 10,
                  }}>▸</span>
                  {d}
                </div>
              ))}
            </div>

            <div style={{
              background: "rgba(4,8,20,0.7)", border: `1px solid ${accent}20`,
              padding: "10px 12px", borderRadius: 4,
            }}>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: accent, letterSpacing: "0.15em", marginBottom: 8,
              }}>✦ WHAT I LEARNED</div>
              {c.learned.map((l, i) => (
                <div key={i} style={{
                  fontFamily: "var(--font-mono)", fontSize: 14,
                  color: "#6080a0", lineHeight: 1.5, marginBottom: 5,
                  fontStyle: "italic",
                  paddingLeft: 10, position: "relative",
                }}>
                  <span style={{
                    position: "absolute", left: 0,
                    color: accent + "80", fontSize: 10,
                  }}>✦</span>
                  "{l}"
                </div>
              ))}
            </div>
          </div>

          {/* Metrics row */}
          <div style={{
            display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14,
          }}>
            {c.metrics.map((m, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 80,
                background: `linear-gradient(135deg, ${accent}10 0%, rgba(4,8,20,0.8) 100%)`,
                border: `1px solid ${accent}30`,
                padding: "10px 12px", textAlign: "center", borderRadius: 4,
                animation: `cn-metric-in 0.3s ease-out ${i * 0.08}s both`,
              }}>
                <div style={{
                  fontFamily: "var(--font-pixel)", fontSize: 6,
                  color: "#3a5070", letterSpacing: "0.1em", marginBottom: 5,
                }}>{m.label}</div>
                <div style={{
                  fontFamily: "var(--font-pixel)", fontSize: 14,
                  color: accent, lineHeight: 1,
                }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Creature card */}
          {zone.creature && creatureUrl && (
            <div style={{
              display: "flex", gap: 12, alignItems: "center",
              background: "rgba(4,8,20,0.7)", border: `1px solid ${accent}20`,
              padding: "10px 12px", marginBottom: 10, borderRadius: 4,
            }}>
              <img
                src={creatureUrl}
                alt={zone.creature.name}
                style={{
                  width: 56, height: 56, imageRendering: "pixelated",
                  flexShrink: 0, background: accent + "18",
                  border: `2px solid ${accent}50`, borderRadius: 4,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
                }}>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: accent }}>{zone.creature.name}</span>
                  <span style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    background: accent + "18", border: `1px solid ${accent}40`,
                    color: accent, padding: "2px 6px", borderRadius: 99,
                  }}>{zone.creature.type}</span>
                  <span style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    background: "rgba(255,210,74,0.1)", border: "1px solid rgba(255,210,74,0.3)",
                    color: "#ffd24a", padding: "2px 6px", borderRadius: 99,
                  }}>PWR {zone.creature.power}</span>
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 13,
                  color: "#5070a0", fontStyle: "italic", lineHeight: 1.4,
                }}>{zone.creature.description}</div>
              </div>
            </div>
          )}

          {/* Skill card */}
          {zone.skill && (
            <div style={{
              background: "rgba(4,8,20,0.7)", border: `1px solid ${accent}20`,
              padding: "10px 12px", marginBottom: 10, borderRadius: 4,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
              }}>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070", letterSpacing: "0.1em" }}>SKILL BERRY</div>
                <span style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: accent }}>{zone.skill.name}</span>
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: 6,
                  background: "rgba(255,210,74,0.1)", border: "1px solid rgba(255,210,74,0.3)",
                  color: "#ffd24a", padding: "2px 6px", borderRadius: 99,
                }}>PWR {zone.skill.power}</span>
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                color: "#5070a0", fontStyle: "italic",
              }}>{zone.skill.description}</div>
            </div>
          )}

          {/* Gym boss */}
          {zone.gym && leaderUrl && (
            <div style={{
              display: "flex", gap: 12, alignItems: "center",
              background: `linear-gradient(135deg, ${accent}10 0%, rgba(4,8,20,0.8) 100%)`,
              border: `1px solid ${accent}30`,
              padding: "10px 12px", borderRadius: 4,
            }}>
              <img
                src={leaderUrl}
                alt={zone.gym.opponentName}
                style={{
                  width: 56, height: 56, imageRendering: "pixelated",
                  flexShrink: 0, border: `2px solid ${accent}50`, borderRadius: 4,
                }}
              />
              <div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070", letterSpacing: "0.1em", marginBottom: 4 }}>⚔ GYM BOSS</div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: accent, marginBottom: 4 }}>{zone.gym.opponentName}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 13, color: "#5070a0",
                  fontStyle: "italic", lineHeight: 1.4,
                }}>"{zone.gym.victory}"</div>
              </div>
            </div>
          )}

          <div style={{ height: 24 }} />
        </div>

        {/* Scroll hint */}
        {hasOverflow && !scrolled && (
          <div style={{
            position: "absolute", left: "50%", bottom: 12,
            transform: "translateX(-50%)",
            padding: "4px 12px",
            background: `${accent}22`, border: `1px solid ${accent}40`,
            color: accent, borderRadius: 12,
            fontFamily: "var(--font-pixel)", fontSize: 7,
            pointerEvents: "none",
            animation: "pq-scroll-hint 1.4s ease-in-out infinite",
            backdropFilter: "blur(4px)",
          }}>
            ↓ SCROLL
          </div>
        )}
      </div>
    </div>
  );
}
