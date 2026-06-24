"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Zone } from "@/game/data";
import { COMPANY_LINKS, KEY_PEOPLE } from "@/game/data";

// ─── Recruiter-friendly challenge & impact per zone ──────────────────────────
const ZONE_NARRATIVE: Record<string, { challenge: string; impact: string }> = {
  grp: {
    challenge: "Building India's first price-comparison engine in college — zero playbook, no smartphones yet.",
    impact: "First product shipped. Angel-backed. Built catalog + crawl pipeline from scratch.",
  },
  hab: {
    challenge: "Branded budget hospitality with zero capital — same market OYO later raised billions for.",
    impact: "$120K+ revenue bootstrapped. 16-person team, 3 cities. Unit economics proven.",
  },
  ai: {
    challenge: "Selling AI in 2013 before anyone searched for the term. Pure missionary selling.",
    impact: "Octo acquired by Quartic.ai. Built marketing + product dashboard end-to-end.",
  },
  investopad: {
    challenge: "Operator → investor transition. Building a fund from family office to institutional.",
    impact: "Fund I built. Portfolio: Meesho, Entri, Simsim. Changed how I evaluate companies.",
  },
  sole: {
    challenge: "Creating sneaker culture in India from nothing — no market, no playbook.",
    impact: "$6M+ revenue. 350K+ community. $795K raised. SneakinOut: India's first sneaker convention.",
  },
  fere: {
    challenge: "Marketing invisible autonomous AI agents in a noisy crypto-adjacent market.",
    impact: "AI-native ops model proven. Lean team via AI systems. Proving ground for Iterate.",
  },
  ccd: {
    challenge: "Creating without a brief or client — building because it needed to exist.",
    impact: "Platform live. Flagship show at Social with Impresario. Creative sovereignty.",
  },
  iterate: {
    challenge: "Competing against traditional agencies — slow, headcount-heavy, not scalable.",
    impact: "90-person network. National clients (airport, EV network). AI-native at scale.",
  },
};

export function CareerCard({ z }: { z: Zone; i: number }) {
  const [open, setOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const accent = z.theme.accent;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setOpen(true); setContentVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          setTimeout(() => setContentVisible(true), 200);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleToggle = useCallback(() => {
    setOpen(o => {
      const next = !o;
      if (next) setTimeout(() => setContentVisible(true), 150);
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
      {open && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: accent,
          boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}50`,
          animation: "border-pulse 2.5s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Header */}
      <div onClick={handleToggle} style={{ padding: "16px 20px", cursor: "pointer", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 12, color: accent }}>{z.org}</span>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#4a6888" }}>{z.years}</span>
          </div>
          <span style={{
            fontFamily: "var(--font-pixel)", fontSize: 7, color: accent, opacity: 0.5,
            transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s",
          }}>▼</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#9ab0cc", marginBottom: 2 }}>{z.role}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#5a7a9a" }}>{z.outcome}</div>
      </div>

      {/* Expanded — compact layout */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 1000 : 0,
        opacity: open ? 1 : 0,
        transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease 0.1s",
      }}>
        <div style={{ borderTop: `1px solid ${accent}12`, padding: "16px 20px 20px" }}>

          {/* Bullets — no header, they speak for themselves */}
          <div style={{
            marginBottom: 14,
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}>
            {z.cliff.did.map((d, di) => (
              <div key={di} style={{
                fontFamily: "var(--font-mono)", fontSize: 12.5,
                color: "#7a98b8", marginBottom: 4, lineHeight: 1.5,
                paddingLeft: 12, position: "relative",
              }}>
                <span style={{ position: "absolute", left: 0, color: accent, fontSize: 8, top: 3 }}>▸</span>
                {d}
              </div>
            ))}
          </div>

          {/* Challenge + Impact side by side */}
          {narrative && (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14,
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.3s ease 100ms, transform 0.3s ease 100ms",
            }}>
              <div style={{
                padding: "10px 12px",
                background: `${accent}06`,
                borderLeft: `2px solid ${accent}30`,
                borderRadius: 4,
              }}>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: accent, marginBottom: 6, letterSpacing: "0.1em" }}>CHALLENGE</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#6a8aaa", lineHeight: 1.5 }}>{narrative.challenge}</div>
              </div>
              <div style={{
                padding: "10px 12px",
                background: `${accent}06`,
                borderLeft: `2px solid ${accent}30`,
                borderRadius: 4,
              }}>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: accent, marginBottom: 6, letterSpacing: "0.1em" }}>IMPACT</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#9ab8d0", lineHeight: 1.5, fontWeight: 500 }}>{narrative.impact}</div>
              </div>
            </div>
          )}

          {/* People — single compact line */}
          {people.length > 0 && (
            <div style={{
              marginBottom: 12,
              opacity: contentVisible ? 1 : 0,
              transition: "opacity 0.3s ease 160ms",
            }}>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#4a6888", letterSpacing: "0.1em" }}>PEOPLE: </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#7a98b8" }}>
                {people.map(p => p.name).join(" · ")}
              </span>
            </div>
          )}

          {/* Links — compact chips */}
          {links.length > 0 && (
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 5,
              opacity: contentVisible ? 1 : 0,
              transition: "opacity 0.3s ease 200ms",
            }}>
              {links.map((link, li) => (
                <a key={li} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "#7ce0ff", textDecoration: "none",
                  background: "rgba(124,224,255,0.04)",
                  border: "1px solid rgba(124,224,255,0.15)",
                  padding: "3px 8px", borderRadius: 3,
                }}>
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes border-pulse {
        0%, 100% { box-shadow: 0 0 8px ${accent}, 0 0 16px ${accent}40; }
        50% { box-shadow: 0 0 14px ${accent}, 0 0 28px ${accent}55; }
      }`}</style>
    </article>
  );
}
