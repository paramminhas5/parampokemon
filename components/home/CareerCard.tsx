"use client";
import { useEffect, useRef, useState } from "react";
import type { Zone } from "@/game/data";
import { COMPANY_LINKS } from "@/game/data";

export function CareerCard({ z, i }: { z: Zone; i: number }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const accent = z.theme.accent;

  // Auto-expand on scroll into viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setOpen(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const links = COMPANY_LINKS[z.id] || [];

  return (
    <div
      ref={cardRef}
      style={{
        background: open
          ? `linear-gradient(135deg, ${accent}12 0%, rgba(4,8,20,0.97) 100%)`
          : hovered
          ? `linear-gradient(135deg, ${accent}08 0%, rgba(4,8,20,0.95) 100%)`
          : "rgba(6,12,24,0.92)",
        border: `1px solid ${open ? accent + "55" : hovered ? accent + "40" : accent + "22"}`,
        borderRadius: 6,
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
        boxShadow: open
          ? `0 0 28px ${accent}1a, 0 2px 0 ${accent}10`
          : hovered
          ? `0 0 12px ${accent}0e`
          : "none",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Collapsed row */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px" }}>

        {/* Creature / fallback sprite */}
        {z.creature ? (
          <div style={{
            width: 60, height: 60, flexShrink: 0,
            background: `${accent}14`,
            border: `1px solid ${accent}${open || hovered ? "50" : "35"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 4,
            transition: "border-color 0.2s, transform 0.2s",
            transform: hovered && !open ? "scale(1.05)" : "scale(1)",
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
          <div style={{
            display: "flex", alignItems: "baseline",
            gap: 10, flexWrap: "wrap", marginBottom: 4,
          }}>
            <span style={{
              fontFamily: "var(--font-pixel)", fontSize: 11,
              color: accent, letterSpacing: "0.04em",
            }}>
              {z.org}
            </span>
            <span style={{
              fontFamily: "var(--font-pixel)", fontSize: 7,
              color: "#3a5070", letterSpacing: "0.06em",
            }}>
              {z.years}
            </span>
          </div>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 8,
            color: "#8aa8c8", lineHeight: 1.4, marginBottom: 5,
          }}>
            {z.role}
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 14,
            color: "#4a6888", lineHeight: 1.35,
          }}>
            {z.outcome}
          </div>
        </div>

        {/* Right: metric pill */}
        <div style={{
          flexShrink: 0, textAlign: "right",
          display: "flex", flexDirection: "column",
          alignItems: "flex-end", gap: 8,
        }}>
          {z.cliff.metrics[0] && (
            <div style={{
              background: `${accent}18`,
              border: `1px solid ${accent}${open || hovered ? "55" : "35"}`,
              padding: "5px 10px", borderRadius: 3,
              fontFamily: "var(--font-pixel)", fontSize: 9,
              color: accent, letterSpacing: "0.03em",
              transition: "border-color 0.2s, background 0.2s",
            }}>
              {z.cliff.metrics[0].value}
            </div>
          )}
          {z.gym && (
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 6,
              color: "#2a3a50", textAlign: "right",
            }}>
              {z.gym.opponentName}
            </div>
          )}
        </div>
      </div>

      {/* Expanded panel — auto-opens on scroll */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 900 : 0,
        transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{
          borderTop: `1px solid ${accent}22`,
          padding: "16px 16px 20px",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 16, marginBottom: 14,
          }}>

            {/* Left: did + learned */}
            <div>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: accent, marginBottom: 9,
                letterSpacing: "0.12em",
              }}>★ WHAT I DID</div>
              {z.cliff.did.map((d, di) => (
                <div key={di} style={{
                  fontFamily: "var(--font-mono)", fontSize: 13,
                  color: "#6a88b0", marginBottom: 6, lineHeight: 1.55,
                  paddingLeft: 14, position: "relative",
                }}>
                  <span style={{
                    position: "absolute", left: 0,
                    color: accent, fontSize: 9, top: 1,
                  }}>▸</span>
                  {d}
                </div>
              ))}

              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: accent, margin: "14px 0 9px",
                letterSpacing: "0.12em", opacity: 0.85,
              }}>✦ WHAT I LEARNED</div>
              {z.cliff.learned.map((l, li) => (
                <div key={li} style={{
                  fontFamily: "var(--font-mono)", fontSize: 13,
                  color: "#3a5278", marginBottom: 6, lineHeight: 1.55,
                  fontStyle: "italic", paddingLeft: 14, position: "relative",
                }}>
                  <span style={{
                    position: "absolute", left: 0,
                    color: accent + "60", fontSize: 9, top: 1,
                  }}>✦</span>
                  &ldquo;{l}&rdquo;
                </div>
              ))}
            </div>

            {/* Right: metrics + gym + badge */}
            <div>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: accent, marginBottom: 9, letterSpacing: "0.12em",
              }}>★ METRICS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {z.cliff.metrics.map(m => (
                  <div key={m.label} style={{
                    background: `${accent}10`,
                    border: `1px solid ${accent}35`,
                    padding: "7px 11px", borderRadius: 3, minWidth: 60,
                  }}>
                    <div style={{
                      fontFamily: "var(--font-pixel)", fontSize: 6,
                      color: "#3a5070", marginBottom: 4,
                    }}>{m.label}</div>
                    <div style={{
                      fontFamily: "var(--font-pixel)", fontSize: 11,
                      color: accent,
                    }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Gym leader */}
              {z.gym && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    color: accent, marginBottom: 9, letterSpacing: "0.12em",
                  }}>⚔ GYM BOSS</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 52, height: 52, flexShrink: 0,
                      background: `${accent}10`,
                      border: `1px solid ${accent}40`,
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
                      <div style={{
                        fontFamily: "var(--font-pixel)", fontSize: 8,
                        color: accent, marginBottom: 4,
                      }}>
                        {z.gym.opponentName}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontSize: 12,
                        color: "#3a5278", fontStyle: "italic", lineHeight: 1.5,
                      }}>
                        &ldquo;{z.gym.victory}&rdquo;
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Badge earned */}
              {z.badge && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    color: accent, marginBottom: 7, letterSpacing: "0.12em",
                  }}>★ BADGE EARNED</div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: `${accent}10`,
                    border: `1px solid ${accent}40`,
                    padding: "6px 12px",
                    borderRadius: 4,
                  }}>
                    <span style={{ color: accent, fontSize: 12 }}>★</span>
                    <span style={{
                      fontFamily: "var(--font-pixel)", fontSize: 7,
                      color: accent,
                    }}>
                      {z.badge.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Company links */}
              {links.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    color: accent, marginBottom: 7, letterSpacing: "0.12em",
                  }}>🔗 LINKS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {links.map((link, li) => (
                      <a
                        key={li}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "var(--font-mono)", fontSize: 11,
                          color: "#7ce0ff", textDecoration: "none",
                          background: "rgba(124,224,255,0.06)",
                          border: "1px solid rgba(124,224,255,0.2)",
                          padding: "4px 10px", borderRadius: 3,
                        }}
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Creature info */}
              {z.creature && (
                <div>
                  <div style={{
                    fontFamily: "var(--font-pixel)", fontSize: 6,
                    color: accent, marginBottom: 7,
                    letterSpacing: "0.12em", opacity: 0.85,
                  }}>✦ ZONE CREATURE</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: "var(--font-pixel)", fontSize: 8,
                      color: "#8aa0c0",
                    }}>
                      {z.creature.name}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-pixel)", fontSize: 6,
                      background: `${accent}14`,
                      border: `1px solid ${accent}40`,
                      color: accent, padding: "2px 7px", borderRadius: 99,
                    }}>{z.creature.type}</span>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: "#2a4060", fontStyle: "italic", lineHeight: 1.5,
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
