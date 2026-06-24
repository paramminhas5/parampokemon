"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Zone } from "@/game/data";
import { COMPANY_LINKS, KEY_PEOPLE } from "@/game/data";

// ─── Challenge & Impact text (recruiter-friendly) ────────────────────────────
const ZONE_NARRATIVE: Record<string, { challenge: string; impact: string }> = {
  grp: {
    challenge: "Building India's first price-comparison engine in college — zero playbook, no smartphones yet.",
    impact: "First product shipped. Angel-backed. Built catalog + crawl pipeline from scratch.",
  },
  hab: {
    challenge: "Branded budget hospitality with zero capital — same market OYO later raised billions for.",
    impact: "$120K+ revenue bootstrapped. 16-person team, 3 cities. Unit economics proven without a safety net.",
  },
  ai: {
    challenge: "Selling AI in 2016 before anyone searched for the term. Pure missionary selling, zero market awareness.",
    impact: "Built and ran entire marketing function. Rebuilt product dashboard end-to-end working with engineering. Octo acquired by Quartic.ai.",
  },
  investopad: {
    challenge: "Operator → investor transition. Building a venture fund from family office to institutional Fund I.",
    impact: "Fund I built. Portfolio: Meesho (now India's largest e-commerce), Entri, Simsim, Amazon, Forbes.",
  },
  quartic: {
    challenge: "Joining a post-acquisition enterprise AI company and building marketing from zero in San Jose.",
    impact: "Built brand identity, website, collateral, press strategy. Led team of 5. Backed by Good Capital, Celesta Capital, Michael Marks.",
  },
  sole: {
    challenge: "Creating sneaker culture in India from nothing — no existing market, no playbook, skepticism from every side.",
    impact: "$6M+ revenue. 350K+ community. $795K raised. India's first sneaker convention (SneakinOut, 3 seasons). VICE, CNBC-TV18.",
  },
  fere: {
    challenge: "Marketing invisible autonomous AI agents in a noisy crypto-adjacent market.",
    impact: "AI-native ops model proven. Lean team via AI systems. Operating model became proving ground for Iterate.",
  },
  ccd: {
    challenge: "Creating without a brief or client — building a culture platform purely because it needed to exist.",
    impact: "End-to-end platform live. Flagship show at Social with Impresario. Creative sovereignty established.",
  },
  iterate: {
    challenge: "Competing against traditional agencies — slow, headcount-heavy, not scalable.",
    impact: "90-person network active. National clients (Noida Airport, ChargeZone EV network). AI-native at scale.",
  },
};

// ─── Quartic-specific data (since it shares game zone with Octo) ─────────────
const QUARTIC_PEOPLE = [
  { name: "Good Capital partners", relevance: "Invited back post-acquisition" },
  { name: "Celesta Capital & Michael Marks", relevance: "Backers" },
];
const QUARTIC_LINKS = [
  { url: "https://www.quartic.ai", label: "Quartic.ai" },
];

export function CareerCard({ z, overrideId }: { z: Zone; i: number; overrideId?: string }) {
  const [entered, setEntered] = useState(false);
  const [open, setOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [showZoneTag, setShowZoneTag] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const accent = z.theme.accent;
  const cardId = overrideId || z.id;

  // 2-stage scroll animation: enter → then open
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setEntered(true); setOpen(true); setContentVisible(true); return; }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
          // Stage 1: card enters (slides up) + zone tag appears
          setEntered(true);
          setShowZoneTag(true);
          setTimeout(() => setShowZoneTag(false), 1800);
        }
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          // Stage 2: card opens
          setTimeout(() => {
            setOpen(true);
            setTimeout(() => setContentVisible(true), 200);
          }, 150);
          observer.disconnect();
        }
      },
      { threshold: [0.1, 0.25], rootMargin: "0px 0px -40px 0px" }
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

  const links = cardId === "quartic" ? QUARTIC_LINKS : (COMPANY_LINKS[cardId] || []);
  const people = cardId === "quartic" ? QUARTIC_PEOPLE : (KEY_PEOPLE[cardId] || []);
  const narrative = ZONE_NARRATIVE[cardId];

  return (
    <article
      ref={cardRef}
      style={{
        position: "relative",
        background: open
          ? `linear-gradient(145deg, ${accent}0c 0%, rgba(4,8,20,0.97) 100%)`
          : "rgba(6,12,24,0.9)",
        border: `1px solid ${open ? accent + "45" : entered ? accent + "20" : accent + "10"}`,
        borderLeft: `4px solid ${open ? accent : entered ? accent + "60" : accent + "25"}`,
        borderRadius: 10,
        transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: open
          ? `0 6px 40px ${accent}18, inset 4px 0 20px ${accent}08`
          : entered
          ? `0 2px 12px rgba(0,0,0,0.3)`
          : `0 1px 4px rgba(0,0,0,0.15)`,
        overflow: "hidden",
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
      }}
    >
      {/* Zone entry tag — "ENTERING: ZONE" */}
      {showZoneTag && (
        <div style={{
          position: "absolute", top: -28, left: 20, zIndex: 10,
          fontFamily: "var(--font-pixel)", fontSize: 7,
          color: accent,
          background: `${accent}15`,
          border: `1px solid ${accent}40`,
          padding: "4px 12px",
          borderRadius: 4,
          animation: "zone-tag-in 0.4s ease-out, zone-tag-out 0.4s ease-in 1.4s forwards",
          letterSpacing: "0.1em",
        }}>
          ENTERING: {(cardId === "quartic" ? "QUARTIC.AI" : z.org).toUpperCase()}
        </div>
      )}

      {/* Left border glow */}
      {open && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
          background: accent,
          boxShadow: `0 0 12px ${accent}, 0 0 24px ${accent}50`,
          animation: "border-pulse 3s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Entry sweep — one-time left border flash */}
      {entered && !open && (
        <div style={{
          position: "absolute", left: 0, top: 0, width: 4, height: "100%",
          background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
          animation: "border-sweep 0.8s ease-out forwards",
          pointerEvents: "none",
        }} />
      )}

      {/* ─── HEADER ─── */}
      <div onClick={handleToggle} style={{ padding: "20px 24px", cursor: "pointer", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h3 style={{
              fontFamily: "var(--font-pixel)", fontSize: 14, margin: 0,
              color: accent, letterSpacing: "0.03em",
            }}>
              {cardId === "quartic" ? "Quartic.ai" : z.org}
            </h3>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#5a7a9a" }}>
              {cardId === "quartic" ? "2020–2022" : z.years}
            </span>
          </div>
          <span style={{
            fontFamily: "var(--font-pixel)", fontSize: 8, color: accent, opacity: 0.5,
            transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s",
          }}>▼</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "#b0c8e0", marginBottom: 4, fontWeight: 500 }}>
          {cardId === "quartic" ? "Product Marketing Lead" : z.role}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#6088aa", lineHeight: 1.45 }}>
          {cardId === "quartic" ? "Enterprise AI platform. Built marketing from zero post-acquisition. San Jose, CA." : z.outcome}
        </div>
      </div>

      {/* ─── EXPANDED CONTENT ─── */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 1600 : 0,
        opacity: open ? 1 : 0,
        transition: "max-height 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease 0.1s",
      }}>
        <div style={{ borderTop: `1px solid ${accent}15`, padding: "22px 24px 26px" }}>

          {/* ★ WHAT I DID */}
          <CardSection visible={contentVisible} delay={0} accent={accent} title="WHAT I DID">
            {(cardId === "quartic"
              ? ["Led team of 5. Backed by Good Capital, Celesta Capital, Michael Marks.", "Rejoined at direct invitation of Good Capital partners post-acquisition.", "Built marketing function from zero: brand identity, website, collateral, press strategy."]
              : z.cliff.did
            ).map((d, di) => (
              <div key={di} style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                color: "#7a98b8", marginBottom: 6, lineHeight: 1.6,
                paddingLeft: 16, position: "relative",
              }}>
                <span style={{ position: "absolute", left: 0, color: accent, fontSize: 10, top: 3 }}>▸</span>
                {d}
              </div>
            ))}
          </CardSection>

          {/* ★ KEY PEOPLE */}
          {people.length > 0 && (
            <CardSection visible={contentVisible} delay={80} accent={accent} title="KEY PEOPLE">
              {people.map((p, pi) => (
                <div key={pi} style={{
                  display: "flex", gap: 10, marginBottom: 7, alignItems: "baseline", flexWrap: "wrap",
                }}>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#c8d8f0" }}>{p.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#5a7a9a" }}>— {p.relevance}</span>
                </div>
              ))}
            </CardSection>
          )}

          {/* ★ THE CHALLENGE + ★ IMPACT — side by side */}
          {narrative && (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22,
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.4s ease 160ms, transform 0.4s ease 160ms",
            }}>
              <div style={{
                padding: "14px 16px",
                background: `${accent}08`,
                borderLeft: `3px solid ${accent}35`,
                borderRadius: 6,
              }}>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: accent, marginBottom: 10, letterSpacing: "0.12em" }}>★ THE CHALLENGE</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#7a98b8", lineHeight: 1.6 }}>{narrative.challenge}</div>
              </div>
              <div style={{
                padding: "14px 16px",
                background: `${accent}08`,
                borderLeft: `3px solid ${accent}35`,
                borderRadius: 6,
              }}>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: accent, marginBottom: 10, letterSpacing: "0.12em" }}>★ IMPACT</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#a0c0d8", lineHeight: 1.6, fontWeight: 600 }}>{narrative.impact}</div>
              </div>
            </div>
          )}

          {/* 🔗 LINKS */}
          {links.length > 0 && (
            <CardSection visible={contentVisible} delay={320} accent={accent} title="LINKS">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {links.map((link, li) => (
                  <a key={li} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: "#7ce0ff", textDecoration: "none",
                    background: "rgba(124,224,255,0.06)",
                    border: "1.5px solid rgba(124,224,255,0.22)",
                    padding: "8px 14px", borderRadius: 5,
                    transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,224,255,0.5)"; e.currentTarget.style.boxShadow = "0 0 10px rgba(124,224,255,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(124,224,255,0.22)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </CardSection>
          )}
        </div>
      </div>

      <style>{`@keyframes border-pulse {
        0%, 100% { box-shadow: 0 0 8px ${accent}, 0 0 16px ${accent}35; }
        50% { box-shadow: 0 0 16px ${accent}, 0 0 32px ${accent}50; }
      }
      @keyframes zone-tag-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes zone-tag-out {
        from { opacity: 1; }
        to { opacity: 0; transform: translateY(-4px); }
      }
      @keyframes border-sweep {
        0% { height: 0%; top: 50%; opacity: 0; }
        50% { height: 100%; top: 0%; opacity: 1; }
        100% { height: 100%; top: 0%; opacity: 0; }
      }`}</style>
    </article>
  );
}

// ─── Section wrapper with stagger animation ──────────────────────────────────
function CardSection({ visible, delay, accent, title, children }: {
  visible: boolean; delay: number; accent: string; title: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      marginBottom: 22,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
    }}>
      <div style={{
        fontFamily: "var(--font-pixel)", fontSize: 8,
        color: accent, marginBottom: 10,
        letterSpacing: "0.12em",
      }}>★ {title}</div>
      {children}
    </div>
  );
}
