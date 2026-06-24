"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Zone } from "@/game/data";
import { COMPANY_LINKS, KEY_PEOPLE } from "@/game/data";

// ─── Recruiter-friendly challenge & impact per zone ──────────────────────────
const ZONE_NARRATIVE: Record<string, { challenge: string; impact: string }> = {
  grp: {
    challenge: "Building India's first price-comparison engine with zero playbook, in college, when smartphones barely existed.",
    impact: "First product shipped. Angel-backed by Sidharth Rao (Webchutney). Proved ability to build from nothing.",
  },
  hab: {
    challenge: "Launching branded budget hospitality with zero capital — same market OYO later raised billions to dominate.",
    impact: "$120K+ revenue, fully bootstrapped. 16-person team across 3 cities. Proved unit economics without a safety net.",
  },
  ai: {
    challenge: "Selling conversational AI in 2013 before anyone searched for the term. Zero market awareness, pure missionary selling.",
    impact: "Octo acquired by Quartic.ai. Built entire marketing function + rebuilt product dashboard. Set the AI career trajectory.",
  },
  investopad: {
    challenge: "Transitioning from operator to investor — learning the other side of the table while building a fund from scratch.",
    impact: "Helped build Fund I. Portfolio includes Meesho (now India's largest e-commerce), Entri, Simsim. Fundamentally changed how I evaluate companies.",
  },
  sole: {
    challenge: "Creating sneaker culture in India from nothing — no existing market, no playbook, skepticism from every side.",
    impact: "$6M+ revenue. 350K+ community. $795K raised. India's first sneaker convention (SneakinOut, 3 seasons). Featured in VICE, CNBC-TV18.",
  },
  fere: {
    challenge: "Marketing autonomous AI agents — invisible product, zero trust baseline, in a noisy crypto-adjacent market.",
    impact: "Proved AI-native operating model. Restructured marketing to run lean on AI systems. Used as proving ground for launching Iterate.",
  },
  ccd: {
    challenge: "Creating without a brief, a client, or permission — building a culture platform purely because it needed to exist.",
    impact: "End-to-end platform live (artist directory, event booking, music-production learning). Flagship show at Social with Impresario.",
  },
  iterate: {
    challenge: "Competing against the status quo — traditional agencies, slow timelines, headcount-heavy models that don't scale.",
    impact: "90-person network active. National-scale clients (Noida Airport, ChargeZone EV). AI-native operating model proven at scale.",
  },
};

export function CareerCard({ z }: { z: Zone; i: number }) {
  const [open, setOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const accent = z.theme.accent;

  // Opens ONCE on scroll into viewport, stays open. Simple timeline reveal.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setOpen(true); setContentVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          setTimeout(() => setContentVisible(true), 250);
          observer.disconnect(); // Once opened, done.
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Click header to manually toggle
  const handleToggle = useCallback(() => {
    setOpen(o => {
      const next = !o;
      if (next) setTimeout(() => setContentVisible(true), 200);
      else setContentVisible(false);
      return next;
    });
  }, []);

  const links = COMPANY_LINKS[z.id] || [];
  const people = KEY_PEOPLE[z.id] || [];
  const narrative = ZONE_NARRATIVE[z.id];

  return (
    <article
      ref={cardRef}
      style={{
        position: "relative",
        background: open
          ? `linear-gradient(135deg, ${accent}0a 0%, rgba(4,8,20,0.97) 100%)`
          : "rgba(6,12,24,0.9)",
        border: `1px solid ${open ? accent + "40" : accent + "15"}`,
        borderLeft: `3px solid ${open ? accent : accent + "30"}`,
        borderRadius: 8,
        transition: "all 0.45s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: open
          ? `0 4px 32px ${accent}15, inset 3px 0 16px ${accent}06`
          : `0 1px 4px rgba(0,0,0,0.2)`,
        overflow: "hidden",
        transform: open ? "scale(1)" : "scale(0.985)",
      }}
    >
      {/* Left border glow pulse on open */}
      {open && (
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0, width: 3,
          background: accent,
          boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}50`,
          animation: "border-pulse 2.5s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Header row — clickable to toggle */}
      <div
        onClick={handleToggle}
        style={{ padding: "18px 20px", position: "relative", zIndex: 1, cursor: "pointer" }}
      >
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          gap: 10, flexWrap: "wrap", marginBottom: 5,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-pixel)", fontSize: 12,
              color: accent, letterSpacing: "0.04em",
            }}>
              {z.org}
            </span>
            <span style={{
              fontFamily: "var(--font-pixel)", fontSize: 7,
              color: "#4a6888", letterSpacing: "0.06em",
            }}>
              {z.years}
            </span>
          </div>
          <span style={{
            fontFamily: "var(--font-pixel)", fontSize: 7,
            color: accent, opacity: 0.6,
            transition: "transform 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</span>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 15,
          color: "#9ab0cc", lineHeight: 1.4, marginBottom: 4,
        }}>
          {z.role}
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 13,
          color: "#5a7a9a", lineHeight: 1.4,
        }}>
          {z.outcome}
        </div>
      </div>

      {/* Expanded content */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 1400 : 0,
        opacity: open ? 1 : 0,
        transition: "max-height 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease 0.1s",
      }}>
        <div style={{
          borderTop: `1px solid ${accent}15`,
          padding: "20px 20px 24px",
        }}>

          <AnimSection visible={contentVisible} delay={0} accent={accent} title="WHAT I DID">
            {z.cliff.did.map((d, di) => (
              <Bullet key={di} accent={accent}>{d}</Bullet>
            ))}
          </AnimSection>

          {people.length > 0 && (
            <AnimSection visible={contentVisible} delay={60} accent={accent} title="KEY PEOPLE">
              {people.map((p, pi) => (
                <div key={pi} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#c8d8f0" }}>{p.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#4a6888" }}>— {p.relevance}</span>
                </div>
              ))}
            </AnimSection>
          )}

          {narrative && (
            <AnimSection visible={contentVisible} delay={120} accent={accent} title="THE CHALLENGE">
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                color: "#7a98b8", lineHeight: 1.6,
                paddingLeft: 14, borderLeft: `2px solid ${accent}25`,
              }}>
                {narrative.challenge}
              </div>
            </AnimSection>
          )}

          {narrative && (
            <AnimSection visible={contentVisible} delay={180} accent={accent} title="IMPACT">
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                color: "#9ab8d0", lineHeight: 1.6, fontWeight: 500,
              }}>
                {narrative.impact}
              </div>
            </AnimSection>
          )}

          {links.length > 0 && (
            <AnimSection visible={contentVisible} delay={240} accent={accent} title="LINKS">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {links.map((link, li) => (
                  <a key={li} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: "var(--font-mono)", fontSize: 11,
                    color: "#7ce0ff", textDecoration: "none",
                    background: "rgba(124,224,255,0.05)",
                    border: "1px solid rgba(124,224,255,0.18)",
                    padding: "4px 10px", borderRadius: 3,
                  }}>
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </AnimSection>
          )}
        </div>
      </div>

      <style>{`
        @keyframes border-pulse {
          0%, 100% { box-shadow: 0 0 8px ${accent}, 0 0 16px ${accent}40; }
          50% { box-shadow: 0 0 14px ${accent}, 0 0 28px ${accent}55; }
        }
      `}</style>
    </article>
  );
}

function AnimSection({ visible, delay, accent, title, children }: {
  visible: boolean; delay: number; accent: string; title: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      marginBottom: 18,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
    }}>
      <div style={{
        fontFamily: "var(--font-pixel)", fontSize: 7,
        color: accent, marginBottom: 9, letterSpacing: "0.12em",
      }}>★ {title}</div>
      {children}
    </div>
  );
}

function Bullet({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 13,
      color: "#7a98b8", marginBottom: 5, lineHeight: 1.55,
      paddingLeft: 14, position: "relative",
    }}>
      <span style={{ position: "absolute", left: 0, color: accent, fontSize: 9, top: 2 }}>▸</span>
      {children}
    </div>
  );
}
