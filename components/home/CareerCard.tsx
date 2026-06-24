"use client";
import { useEffect, useRef, useState } from "react";
import type { Zone } from "@/game/data";
import { COMPANY_LINKS, KEY_PEOPLE } from "@/game/data";

export function CareerCard({ z, i }: { z: Zone; i: number }) {
  const [open, setOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const accent = z.theme.accent;

  // Auto-expand on scroll into viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setOpen(true); setContentVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          // Stagger inner content after card opens
          setTimeout(() => setContentVisible(true), 300);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const links = COMPANY_LINKS[z.id] || [];
  const people = KEY_PEOPLE[z.id] || [];

  // Challenge text — recruiter-friendly framing of the gym boss
  const challengeText = z.gym ? z.gym.intro : null;
  const gainedText = z.gym ? z.gym.victory : null;

  return (
    <div
      ref={cardRef}
      style={{
        position: "relative",
        background: open
          ? `linear-gradient(135deg, ${accent}08 0%, rgba(4,8,20,0.97) 100%)`
          : "rgba(6,12,24,0.92)",
        border: `1px solid ${open ? accent + "40" : accent + "18"}`,
        borderLeft: `3px solid ${open ? accent : accent + "30"}`,
        borderRadius: 6,
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: open
          ? `0 0 24px ${accent}12, inset 3px 0 12px ${accent}08`
          : "none",
        overflow: "hidden",
      }}
    >
      {/* Header row — always visible */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px 18px" }}>
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
            color: "#5a7a9a", lineHeight: 1.4,
          }}>
            {z.outcome}
          </div>
        </div>

        {/* Right: key metric */}
        {z.cliff.metrics[0] && (
          <div style={{
            flexShrink: 0,
            background: `${accent}14`,
            border: `1px solid ${accent}${open ? "50" : "30"}`,
            padding: "6px 12px", borderRadius: 4,
            fontFamily: "var(--font-pixel)", fontSize: 10,
            color: accent, letterSpacing: "0.03em",
            transition: "border-color 0.3s",
          }}>
            {z.cliff.metrics[0].value}
          </div>
        )}
      </div>

      {/* Expanded content — opens on scroll with staggered inner animations */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 1200 : 0,
        opacity: open ? 1 : 0,
        transition: "max-height 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease 0.1s",
      }}>
        <div style={{
          borderTop: `1px solid ${accent}18`,
          padding: "18px 18px 22px",
        }}>

          {/* WHAT I DID */}
          <div style={{
            marginBottom: 18,
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease 0ms, transform 0.4s ease 0ms",
          }}>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 7,
              color: accent, marginBottom: 10,
              letterSpacing: "0.12em",
            }}>★ WHAT I DID</div>
            {z.cliff.did.map((d, di) => (
              <div key={di} style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                color: "#7a98b8", marginBottom: 5, lineHeight: 1.55,
                paddingLeft: 14, position: "relative",
              }}>
                <span style={{
                  position: "absolute", left: 0,
                  color: accent, fontSize: 9, top: 2,
                }}>▸</span>
                {d}
              </div>
            ))}
          </div>

          {/* KEY PEOPLE */}
          {people.length > 0 && (
            <div style={{
              marginBottom: 18,
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease 80ms, transform 0.4s ease 80ms",
            }}>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                color: accent, marginBottom: 10,
                letterSpacing: "0.12em",
              }}>★ KEY PEOPLE</div>
              {people.map((p, pi) => (
                <div key={pi} style={{
                  display: "flex", gap: 8, marginBottom: 6,
                  alignItems: "baseline",
                }}>
                  <span style={{
                    fontFamily: "var(--font-pixel)", fontSize: 8,
                    color: "#c8d8f0", flexShrink: 0,
                  }}>
                    {p.name}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: "#4a6888",
                  }}>
                    — {p.relevance}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* THE CHALLENGE */}
          {challengeText && (
            <div style={{
              marginBottom: 18,
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease 160ms, transform 0.4s ease 160ms",
            }}>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                color: accent, marginBottom: 10,
                letterSpacing: "0.12em",
              }}>⚔ THE CHALLENGE</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                color: "#5a7a9a", fontStyle: "italic",
                lineHeight: 1.55,
                paddingLeft: 14,
                borderLeft: `2px solid ${accent}30`,
              }}>
                {challengeText}
              </div>
            </div>
          )}

          {/* WHAT WAS GAINED */}
          {gainedText && (
            <div style={{
              marginBottom: 18,
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease 240ms, transform 0.4s ease 240ms",
            }}>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                color: accent, marginBottom: 10,
                letterSpacing: "0.12em",
              }}>★ WHAT WAS GAINED</div>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                flexWrap: "wrap",
              }}>
                {z.badge && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: `${accent}10`,
                    border: `1px solid ${accent}35`,
                    padding: "5px 12px",
                    borderRadius: 4,
                  }}>
                    <span style={{ color: accent, fontSize: 10 }}>★</span>
                    <span style={{
                      fontFamily: "var(--font-pixel)", fontSize: 7,
                      color: accent,
                    }}>
                      {z.badge.label}
                    </span>
                  </div>
                )}
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 13,
                  color: "#7a98b8", lineHeight: 1.5,
                }}>
                  {gainedText}
                </span>
              </div>
            </div>
          )}

          {/* LINKS */}
          {links.length > 0 && (
            <div style={{
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease 320ms, transform 0.4s ease 320ms",
            }}>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                color: accent, marginBottom: 8,
                letterSpacing: "0.12em",
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
                      transition: "background 0.2s, border-color 0.2s",
                    }}
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
