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
  return (
    <div style={{ minHeight: "100vh", background: "#0a1226", padding: "24px 16px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Link href="/" className="pq-label" style={{ color: "#3a5070", textDecoration: "none" }}>← BACK</Link>
          <Link href="/play" className="pq-btn pq-btn-primary" style={{ fontSize: 10, padding: "8px 14px" }}>PLAY ▶</Link>
        </div>

        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-pixel)", fontSize: "clamp(24px, 5vw, 40px)", color: "#c8d8f0", lineHeight: 1.1, margin: "0 0 12px" }}>
            PARAM MINHAS
          </h1>
          <p style={{ fontFamily: "var(--font-vt)", fontSize: 20, color: "#8aa0c0", lineHeight: 1.5, maxWidth: 600, margin: 0 }}>
            Builder · Designer · Creative Director · Founder. Fifteen years across e-commerce, AI, real estate, sneakers, music and AI-native marketing. Pune → Bengaluru → Mumbai.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 16 }}>
            {HIGHLIGHTS.map(h => (
              <div key={h.label} className="pq-panel">
                <div className="pq-panel-inner" style={{ textAlign: "center", padding: "10px 8px" }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", marginBottom: 4 }}>{h.label}</div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 14, color: "#c8d8f0" }}>{h.value}</div>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* EXPERIENCE */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", marginBottom: 16, letterSpacing: "0.15em" }}>EXPERIENCE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {careerZones.map(z => (
              <div key={z.id} className="pq-panel" style={{ borderColor: `${z.theme.accent}30` }}>
                <div className="pq-panel-inner">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: z.theme.accent, marginBottom: 4 }}>{z.org}</div>
                      <div style={{ fontFamily: "var(--font-vt)", fontSize: 20, color: "#c8d8f0" }}>{z.role}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", flexShrink: 0 }}>{z.years}</div>
                  </div>
                  <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
                    {z.bullets.map((b, i) => (
                      <li key={i} style={{ fontFamily: "var(--font-vt)", fontSize: 17, color: "#7a90b0", marginTop: 4, lineHeight: 1.4 }}>▸ {b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SKILLS */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", marginBottom: 16, letterSpacing: "0.15em" }}>SKILLS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {SKILL_GROUPS.map(sg => (
              <div key={sg.group} className="pq-panel">
                <div className="pq-panel-inner">
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#5570aa", marginBottom: 8 }}>{sg.group.toUpperCase()}</div>
                  {sg.items.map((item, i) => (
                    <div key={i} style={{ fontFamily: "var(--font-vt)", fontSize: 16, color: "#7a90b0", marginTop: 3 }}>▸ {item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section style={{ marginBottom: 48 }}>
          <div className="pq-panel">
            <div className="pq-panel-inner">
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", marginBottom: 12 }}>CONTACT</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href={`mailto:${CONTACT.email}`} className="pq-btn" style={{ fontSize: 10 }}>{CONTACT.email}</a>
                <a href={CONTACT.linkedin} className="pq-btn" style={{ fontSize: 10 }}>LINKEDIN ↗</a>
                <a href={CONTACT.twitter} className="pq-btn" style={{ fontSize: 10 }}>TWITTER ↗</a>
                <a href={CONTACT.site} className="pq-btn" style={{ fontSize: 10 }}>CATSCANDANCE.COM ↗</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
