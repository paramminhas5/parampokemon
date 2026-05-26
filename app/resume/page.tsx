import Link from "next/link";
import { ZONES, CONTACT, PRESS } from "@/game/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV — Param Minhas",
  description: "15 years of building across e-commerce, AI, real estate, sneakers, music and AI-native marketing.",
};

const HIGHLIGHTS = [
  { label: "EXPERIENCE", value: "15+ yrs" },
  { label: "ANNUAL REV", value: "₹30Cr+" },
  { label: "RAISED", value: "$795K" },
  { label: "SUPPORTED", value: "$1.3M" },
  { label: "AI SINCE", value: "2013" },
  { label: "BOOTSTRAPPED", value: "₹1Cr" },
];

const SKILL_GROUPS = [
  { group: "Strategy", items: ["GTM strategy", "Positioning & narrative", "ICP definition", "Fundraising decks", "Cap-table reading", "Founder coaching"] },
  { group: "Brand & Creative", items: ["Brand identity systems", "Creative direction", "Copywriting", "Editorial & content design", "Press & PR strategy"] },
  { group: "Growth", items: ["Performance marketing", "SEO & content", "Influencer partnerships", "Community building", "Event marketing (30+ events)"] },
  { group: "Product & Design", items: ["Product strategy", "Figma · prototyping", "UX research", "Design systems"] },
  { group: "Engineering", items: ["Web (HTML/CSS/JS · React)", "AI workflows (LLMs · agents)", "Shopify / Webflow", "Crawling & data pipelines"] },
  { group: "Operations", items: ["Unit economics", "Retail ops", "Bootstrapped P&L", "Hiring & team building"] },
];

export default function ResumePage() {
  const careerZones = ZONES.filter(z => z.id !== "home");
  const gymZones = ZONES.filter(z => z.gym);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #04080f 0%, #070e1a 40%, #0a1428 100%)",
      padding: "24px 16px",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <Link href="/" className="pq-label" style={{ color: "#3a5070", textDecoration: "none", fontSize: 9 }}>← BACK</Link>
          <Link href="/play" className="pq-btn pq-btn-primary" style={{ fontSize: 10, padding: "8px 14px" }}>▶ PLAY</Link>
        </div>

        {/* ── Hero header ── */}
        <header style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5a80", letterSpacing: "0.2em", marginBottom: 12 }}>
            ★ INTERACTIVE CV
          </div>
          <h1 style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "clamp(22px, 5vw, 38px)",
            color: "#c8d8f0",
            lineHeight: 1.1, margin: "0 0 12px",
            textShadow: "0 4px 0 #0a2040",
          }}>
            PARAM MINHAS
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "#8aa0c0", lineHeight: 1.5, maxWidth: 600, margin: "0 0 20px" }}>
            Builder · Designer · Creative Director · Founder.<br />
            Fifteen years across e-commerce, AI, real estate, sneakers, music and AI-native marketing.<br />
            <span style={{ color: "#5570aa" }}>Pune → Bengaluru → Mumbai.</span>
          </p>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
            {HIGHLIGHTS.map(h => (
              <div key={h.label} className="pq-panel">
                <div className="pq-panel-inner" style={{ textAlign: "center", padding: "10px 8px" }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", marginBottom: 4 }}>{h.label}</div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 14, color: "#c8d8f0" }}>{h.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Badge strip ── */}
          <div className="pq-panel" style={{ marginBottom: 0 }}>
            <div className="pq-panel-inner">
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", marginBottom: 10, letterSpacing: "0.12em" }}>
                ★ ALL BADGES — EARNED IN GAME
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {gymZones.map(z => (
                  <div key={z.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: `${z.badge.color}22`,
                      border: `2px solid ${z.badge.color}60`,
                      boxShadow: `0 0 8px ${z.badge.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, color: z.badge.color,
                    }}>★</div>
                    <div style={{ fontFamily: "var(--font-pixel)", fontSize: 5, color: z.theme.accent, maxWidth: 40, textAlign: "center", lineHeight: 1.3 }}>
                      {z.badge.label.split(" ")[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ── Experience — with creature sprites ── */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", marginBottom: 16, letterSpacing: "0.15em" }}>
            ★ EXPERIENCE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {careerZones.map((z, i) => (
              <div key={z.id} style={{ display: "flex", alignItems: "stretch", position: "relative" }}>
                {/* Timeline bar */}
                <div style={{ width: 32, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {i > 0 && <div style={{ width: 2, height: 16, background: "#1a2a4a" }} />}
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: z.theme.accent,
                    border: `2px solid ${z.theme.accent}80`,
                    boxShadow: `0 0 6px ${z.theme.accent}60`,
                    flexShrink: 0, zIndex: 1,
                    marginTop: i === 0 ? 16 : 0,
                  }} />
                  {i < careerZones.length - 1 && <div style={{ width: 2, flex: 1, background: "#1a2a4a", minHeight: 16 }} />}
                </div>

                {/* Card */}
                <div
                  className="pq-panel"
                  style={{
                    flex: 1, marginLeft: 8,
                    marginTop: i === 0 ? 10 : 6,
                    marginBottom: 6,
                    borderColor: `${z.theme.accent}30`,
                  }}
                >
                  <div className="pq-panel-inner">
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      {/* Creature sprite */}
                      {z.creature && (
                        <div style={{
                          width: 52, height: 52, flexShrink: 0,
                          background: `${z.theme.accent}12`,
                          border: `2px solid ${z.theme.accent}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: 4,
                        }}>
                          <img
                            src={`/sprites/creatures/${z.id}.png`}
                            alt={z.creature.name}
                            width={44} height={44}
                            style={{ imageRendering: "pixelated", width: 44, height: 44, objectFit: "contain" }}
                          />
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: z.theme.accent }}>{z.org}</div>
                          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", flexShrink: 0 }}>{z.years}</div>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 17, color: "#c8d8f0", lineHeight: 1.3, marginBottom: 8 }}>{z.role}</div>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                          {z.bullets.map((b, bi) => (
                            <li key={bi} style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "#7a90b0", marginTop: 3, lineHeight: 1.4 }}>▸ {b}</li>
                          ))}
                        </ul>
                        {/* Gym leader */}
                        {z.gym && (
                          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                            <img
                              src={`/sprites/leaders/${z.gym.leader}.png`}
                              alt={z.gym.opponentName}
                              width={28} height={28}
                              style={{ imageRendering: "pixelated", width: 28, height: 28, border: `1px solid ${z.theme.accent}40`, borderRadius: 2 }}
                            />
                            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070" }}>
                              GYM: <span style={{ color: z.theme.accent }}>{z.gym.opponentName}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Skills ── */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", marginBottom: 16, letterSpacing: "0.15em" }}>★ SKILLS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {SKILL_GROUPS.map(sg => (
              <div key={sg.group} className="pq-panel">
                <div className="pq-panel-inner">
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#5570aa", marginBottom: 8 }}>{sg.group.toUpperCase()}</div>
                  {sg.items.map((item, i) => (
                    <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "#7a90b0", marginTop: 3 }}>▸ {item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Selected Press ── */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", marginBottom: 16, letterSpacing: "0.15em" }}>★ SELECTED PRESS</div>
          <div className="pq-panel">
            <div className="pq-panel-inner">
              {PRESS.map((p, i) => (
                <div key={i} style={{
                  padding: "10px 0",
                  borderBottom: i < PRESS.length - 1 ? "1px solid #0d1a2a" : "none",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#5570aa", flexShrink: 0, paddingTop: 2, minWidth: 90 }}>{p.outlet}</span>
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "#7ce0ff", textDecoration: "none", lineHeight: 1.4 }}
                    className="story-link">
                    {p.title} ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section style={{ marginBottom: 48 }}>
          <div className="pq-panel">
            <div className="pq-panel-inner">
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", marginBottom: 12 }}>★ CONTACT</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "#8aa0c0", marginBottom: 12 }}>
                Working on something? Bring it.
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href={`mailto:${CONTACT.email}`} className="pq-btn" style={{ fontSize: 10 }}>{CONTACT.email}</a>
                <a href={CONTACT.linkedin} className="pq-btn" style={{ fontSize: 10 }}>LINKEDIN ↗</a>
                <a href={CONTACT.twitter} className="pq-btn" style={{ fontSize: 10 }}>TWITTER ↗</a>
                <a href={CONTACT.site} className="pq-btn" style={{ fontSize: 10 }}>CATSCANDANCE.COM ↗</a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingBottom: 8 }}>
          <Link href="/play" className="pq-btn pq-btn-primary" style={{ fontSize: 11, padding: "14px 28px" }}>
            ▶ PLAY PARAM QUEST
          </Link>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#1a2a40", marginTop: 12 }}>
            © PARAM MINHAS · param@catscandance.com
          </div>
        </div>
      </div>
    </div>
  );
}
