import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume — Param Minhas | Founder & Creative Director | 15+ Years Experience",
  description: "Param Minhas's full professional resume. Founder of Iterate (AI-native marketing agency, 90-person network). 15+ years building across AI, e-commerce, sneakers, music. $6M+ revenue, 350K+ community, $795K raised. Previously CEO at SoleSearch, CMO at Fere.ai, Partner at Good Capital (Meesho, Entri). BE Computer Science, Pune University. Based in Bengaluru.",
  keywords: [
    "Param Minhas resume", "Param Minhas CV", "Param Minhas experience",
    "creative director resume", "marketing leader resume India",
    "startup founder resume", "CMO resume India", "growth marketing resume",
    "AI marketing resume", "Iterate founder", "SoleSearch founder",
    "Bengaluru marketing leader", "GTM strategy resume",
    "fractional CMO India", "brand strategy leader",
  ],
  alternates: {
    canonical: "https://paramminhas.com/resume",
  },
  openGraph: {
    title: "Resume — Param Minhas | Founder & Creative Director",
    description: "15+ years building. $6M+ revenue. 350K+ community. 90-person network. Full professional resume with career timeline, skills, and press coverage.",
    type: "profile",
    url: "https://paramminhas.com/resume",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume — Param Minhas | Founder & Creative Director",
    description: "15+ years. $6M+ revenue. 350K+ community. Full CV — Iterate, SoleSearch, Fere.ai, Good Capital.",
    creator: "@paramminhas",
  },
};

const EXPERIENCE = [
  {
    company: "Iterate",
    role: "Founder & Creative Director",
    type: "AI-native marketing agency",
    period: "Jan 2026 – Present",
    location: "Bengaluru, India",
    url: "hyperiterate.com",
    link: "https://hyperiterate.com",
    bullets: [
      "Leads a 90-person network across strategy, creative, and engineering.",
      "Clients include ChargeZone, Noida International Airport, PickYourTrail, Billione, and Monkspace.",
    ],
    sub: {
      company: "Cats Can Dance",
      desc: "Culture platform (music, fashion & pet care), launched under Iterate",
      period: "Mar 2026 – Present",
      url: "catscandance.com",
      link: "https://catscandance.com",
      bullets: [
        "Designed and built a culture-discovery platform end-to-end — artist directory, event booking, and a music-production learning product.",
        "Produced a series of live shows pan-India, in partnership with Impresario.",
      ],
    },
  },
  {
    company: "Fere.ai",
    role: "CMO",
    type: "Autonomous AI agent platform, funded by Ethereal Ventures",
    period: "Jan 2025 – Dec 2025",
    location: "India",
    url: "fereai.xyz",
    link: "https://www.fereai.xyz/app",
    bullets: [
      "Joined early to build the growth and marketing function, rejoining long-time collaborator and co-founder Akshaya Aron.",
      "Restructured marketing to run lean — sustained by AI systems and a small team rather than headcount.",
      "Used that operating model as the proving ground for launching Iterate.",
    ],
  },
  {
    company: "SoleSearch",
    role: "Founder & CEO",
    type: "Sneaker, streetwear & collectibles marketplace",
    period: "2022 – Dec 2024",
    location: "India",
    link: "https://www.vice.com/en/article/india-genz-sneakerheads-sneaker-resellers-hype/",
    bullets: [
      "Founded SoleSearch; joined by Prabal Baghla and Rannvijay Singha. Led a team of 40.",
      "Raised $795K from Venture Catalysts, Anthill Ventures, and Cornerstone Ventures.",
      "Generated $6M+ in total revenue over four years, with omnichannel retail in Mumbai and Hyderabad.",
      "Built a 350,000+ follower community and ran 30+ live events, including SneakinOut — India's first sneaker convention format.",
      "Secured press in VICE, CNBC-TV18, Storyboard18, Economic Times, Inc42, and Business of Fashion.",
    ],
  },
  {
    company: "Quartic.ai",
    role: "Director of Marketing",
    type: "Enterprise AI platform",
    period: "2020 – 2022",
    location: "San Jose, California (HQ)",
    url: "quartic.ai",
    link: "https://www.quartic.ai",
    bullets: [
      "Led a team of 5. Backed by Good Capital, Celesta Capital, and Michael Marks.",
      "Rejoined at the direct invitation of the Good Capital partners following Octo's acquisition.",
      "Built the marketing function from zero: brand identity, website, collateral, and press strategy.",
    ],
  },
  {
    company: "Investopad → Good Capital",
    role: "Partner, Growth & Technology",
    type: "Family office turned venture fund",
    period: "2017 – 2020",
    location: "New Delhi, India",
    url: "wellfound.com/company/investopad",
    link: "https://wellfound.com/company/investopad/people",
    bullets: [
      "Partner for Tech & Growth as Investopad's family office evolved into Good Capital, an institutional Fund I.",
      "Helped build the fund from family office to Fund I — sourcing, diligence, founder support.",
      "Portfolio including Meesho (now one of India's largest e-commerce companies), Entri, Simsim, Amazon, and Forbes.",
    ],
  },
  {
    company: "Octo",
    role: "Founding Team, Head of Growth",
    type: "Conversational AI platform, acquired by Quartic.ai",
    period: "2016 – 2017",
    location: "New Delhi, India",
    link: "https://www.slideshare.net/slideshow/param-minhas-octo-marketing-deck/71004948",
    bullets: [
      "Co-built with Akshaya Aron, backed by Good Capital — built AI products before \"AI\" was a market category.",
      "Built and ran the entire marketing function from scratch and rebuilt the product dashboard end-to-end, working directly with engineering.",
    ],
  },
  {
    company: "Hab Housing",
    role: "Founder",
    type: "Branded budget hospitality",
    period: "2012 – 2015",
    location: "Pune, India",
    bullets: [
      "Built one of India's first branded budget-hospitality startups — the category OYO later scaled nationally.",
      "$120K+ in revenue, fully bootstrapped. Grew from sole founder to a 16-person team across three cities.",
    ],
  },
  {
    company: "GetRightPrice",
    role: "Founding Team Member",
    type: "India's first price-comparison engine",
    period: "2011 – 2012",
    location: "Delhi, India",
    bullets: [
      "Joined the founding team in college, angel-backed by Sidharth Rao (founder, Webchutney).",
      "Built the product catalog and crawl pipeline.",
    ],
  },
];


const SKILLS = [
  { group: "Growth & Marketing", items: ["Go-to-market strategy", "Demand generation", "Performance marketing", "SEO & GEO", "Community building", "Event marketing"] },
  { group: "Brand & Creative", items: ["Brand identity systems", "Creative direction", "Copywriting", "PR & press strategy"] },
  { group: "Strategy", items: ["Positioning", "ICP definition", "Pricing & packaging", "Fundraising", "GTM planning"] },
  { group: "AI & Engineering", items: ["AI-native marketing", "Conversational AI & agent development", "Full-stack web (Next.js, React)", "WhatsApp/bot integrations", "Prompt engineering", "Data pipelines"] },
  { group: "Leadership", items: ["Team building (5 to 90+)", "Hiring", "Founder coaching"] },
  { group: "Tools", items: ["Notion", "Linear", "Figma", "Cursor", "Claude", "Webflow", "Shopify", "Meta/Google Ads", "GA4", "n8n", "Zapier"] },
];

const PRESS_ITEMS = [
  "VICE", "Storyboard18 (syndicated to Forbes India)", "CNBC-TV18", "The Established",
  "Economic Times", "Entrackr", "Indian Retailer", "YourStory",
  "CB Insights", "Crunchbase", "PitchBook",
];

export default function ResumePage() {
  const resumeJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Param Minhas — Professional Experience",
    description: "Complete career timeline of Param Minhas, founder and creative director with 15+ years of experience.",
    numberOfItems: 8,
    itemListElement: [
      { "@type": "ListItem", position: 1, item: { "@type": "Role", roleName: "Founder & Creative Director", startDate: "2026-01", memberOf: { "@type": "Organization", name: "Iterate", url: "https://hyperiterate.com", description: "AI-native marketing agency, 90-person network" } } },
      { "@type": "ListItem", position: 2, item: { "@type": "Role", roleName: "CMO", startDate: "2025-01", endDate: "2025-12", memberOf: { "@type": "Organization", name: "Fere.ai", url: "https://www.fereai.xyz/app", description: "Autonomous AI agent platform, funded by Ethereal Ventures" } } },
      { "@type": "ListItem", position: 3, item: { "@type": "Role", roleName: "Founder & CEO", startDate: "2022", endDate: "2024-12", memberOf: { "@type": "Organization", name: "SoleSearch", description: "India's leading sneaker & streetwear marketplace, $6M+ revenue, $795K raised, 350K+ community" } } },
      { "@type": "ListItem", position: 4, item: { "@type": "Role", roleName: "Director of Marketing", startDate: "2020", endDate: "2022", memberOf: { "@type": "Organization", name: "Quartic.ai", url: "https://www.quartic.ai", description: "Enterprise AI platform" } } },
      { "@type": "ListItem", position: 5, item: { "@type": "Role", roleName: "Partner, Growth & Technology", startDate: "2017", endDate: "2020", memberOf: { "@type": "Organization", name: "Good Capital (Investopad)", description: "Family office turned venture fund, portfolio: Meesho, Entri, Simsim" } } },
      { "@type": "ListItem", position: 6, item: { "@type": "Role", roleName: "Founding Team, Head of Growth", startDate: "2016", endDate: "2017", memberOf: { "@type": "Organization", name: "Octo", description: "Conversational AI platform, acquired by Quartic.ai" } } },
      { "@type": "ListItem", position: 7, item: { "@type": "Role", roleName: "Founder", startDate: "2012", endDate: "2015", memberOf: { "@type": "Organization", name: "Hab Housing", description: "India's first branded budget-hospitality startup, bootstrapped $120K+" } } },
      { "@type": "ListItem", position: 8, item: { "@type": "Role", roleName: "Founding Team Member", startDate: "2011", endDate: "2012", memberOf: { "@type": "Organization", name: "GetRightPrice", description: "India's first price-comparison engine" } } },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://paramminhas.com" },
      { "@type": "ListItem", position: 2, name: "Resume", item: "https://paramminhas.com/resume" },
    ],
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      color: "#1a1a2e",
      fontFamily: "'Space Mono', monospace",
    }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resumeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* ── Sticky download bar ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e8e8ec",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px",
            background: "#ffffff", color: "#4a5a8a",
            border: "1.5px solid #d0d8e8",
            fontSize: 11, fontFamily: "'Press Start 2P', monospace",
            textDecoration: "none", borderRadius: 4,
            letterSpacing: "0.03em",
          }}
        >
          ← Home
        </Link>
        <a
          href="/api/resume-pdf"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px",
            background: "#1a1a2e", color: "#ffffff",
            fontSize: 11, fontFamily: "'Press Start 2P', monospace",
            textDecoration: "none", borderRadius: 4,
            letterSpacing: "0.03em",
          }}
        >
          ⬇ Full Resume PDF
        </a>
        <a
          href="/api/resume-1p"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px",
            background: "#ffffff", color: "#1a1a2e",
            border: "1.5px solid #1a1a2e",
            fontSize: 11, fontFamily: "'Press Start 2P', monospace",
            textDecoration: "none", borderRadius: 4,
            letterSpacing: "0.03em",
          }}
        >
          ⬇ 1-Pager PDF
        </a>
        <Link
          href="/play"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px",
            background: "#f0f4ff", color: "#4a5a8a",
            border: "1.5px solid #d0d8e8",
            fontSize: 11, fontFamily: "'Press Start 2P', monospace",
            textDecoration: "none", borderRadius: 4,
            letterSpacing: "0.03em",
          }}
        >
          ▶ Play Game
        </Link>
      </div>


      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 64px" }}>

        {/* ── HEADER ── */}
        <header style={{ marginBottom: 36, borderBottom: "2px solid #1a1a2e", paddingBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h1 style={{
              fontSize: 28, fontWeight: 700, margin: 0,
              fontFamily: "'Space Mono', monospace",
              color: "#1a1a2e",
            }}>
              PARAM MINHAS
            </h1>
            <a
              href="/api/resume-pdf"
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "#e8f5e9", color: "#2e7d32",
                fontSize: 8, fontFamily: "'Press Start 2P', monospace",
                padding: "3px 8px", borderRadius: 3,
                letterSpacing: "0.05em",
                textDecoration: "none",
                transition: "background 0.2s, transform 0.1s",
              }}
              title="Download full resume as PDF"
            >
              ◆ SAVE FILE
            </a>
          </div>

          <p style={{
            fontSize: 14, color: "#4a4a6a", margin: "0 0 12px",
            lineHeight: 1.4, fontWeight: 700,
          }}>
            Founder & Creative Director
          </p>
          <p style={{
            fontSize: 12, color: "#6a6a8a", margin: "0 0 16px",
            lineHeight: 1.4,
          }}>
            Growth & Brand Leadership | GTM | AI-Native Marketing | Creative Direction | Product
          </p>

          {/* Contact bar */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "6px 16px",
            fontSize: 12, color: "#4a5a7a", marginBottom: 16,
          }}>
            <a href="mailto:minhas.param@gmail.com" style={{ color: "#2a4a8a", textDecoration: "none" }}>minhas.param@gmail.com</a>
            <a href="https://linkedin.com/in/paramminhas" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>linkedin.com/in/paramminhas</a>
            <a href="https://catscandance.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>catscandance.com</a>
            <a href="https://hyperiterate.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>hyperiterate.com</a>
            <span>Bengaluru, India</span>
          </div>

          {/* 5-metric strip */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8,
          }}>
            {[
              { label: "Experience", value: "15+ Years" },
              { label: "Revenue", value: "$6M+" },
              { label: "Community", value: "350K+" },
              { label: "Network Led", value: "90-Person" },
              { label: "Raised", value: "$795K" },
            ].map(m => (
              <div key={m.label} style={{
                textAlign: "center", padding: "10px 6px",
                background: "#f0f4ff", border: "1px solid #d0d8f0",
                borderRadius: 4,
              }}>
                <div style={{ fontSize: 10, color: "#6a7a9a", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2a4a8a" }}>{m.value}</div>
              </div>
            ))}
          </div>
        </header>


        {/* ── SUMMARY ── */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 12 }}>
            SUMMARY
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#2a2a4a", margin: 0 }}>
            Founder and creative director who builds growth, brand, and marketing functions from zero, then ships the product underneath them. Operator across the full GTM stack — positioning, demand generation, brand systems, performance — with a rare engineering hand: built AI products before &ldquo;AI&rdquo; was a category, co-building one of India&apos;s first conversational AI platforms in 2013. Has led teams from 5 to 90+. Built one company to $6M+ in revenue and a 350,000+ community on a $795K raise; now runs an AI-native marketing agency serving clients including a national airport and a national EV charging network. Based in Bengaluru.
          </p>
        </section>

        {/* ── EXPERIENCE ── */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 16 }}>
            EXPERIENCE
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {EXPERIENCE.map((exp, i) => (
              <div key={i} style={{ borderLeft: "3px solid #4a7adb", paddingLeft: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{exp.role}</span>
                    <span style={{ fontSize: 14, color: "#4a5a7a" }}> — </span>
                    {exp.link ? (
                      <a href={exp.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "#2a4a8a", textDecoration: "none", fontWeight: 600 }}>{exp.company} ↗</a>
                    ) : (
                      <span style={{ fontSize: 14, color: "#4a5a7a" }}>{exp.company}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "#8a8aa0", whiteSpace: "nowrap" }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: 12, color: "#6a6a8a", marginBottom: 8 }}>
                  {exp.type} | {exp.location}
                  {exp.url && <> | <a href={`https://${exp.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>{exp.url}</a></>}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {exp.bullets.map((b, bi) => (
                    <li key={bi} style={{ fontSize: 13, color: "#2a2a4a", lineHeight: 1.6, marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "#b0b0c0" }}>•</span>
                      {b}
                    </li>
                  ))}
                </ul>
                {exp.sub && (
                  <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: "2px solid #f0f0f4" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2a2a4a", marginBottom: 2 }}>
                      {exp.sub.link ? (
                        <a href={exp.sub.link} target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>{exp.sub.company} ↗</a>
                      ) : (
                        exp.sub.company
                      )}
                      {" "}<span style={{ fontWeight: 400, color: "#6a6a8a" }}>— {exp.sub.desc}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#8a8aa0", marginBottom: 6 }}>
                      {exp.sub.period} | <a href={`https://${exp.sub.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>{exp.sub.url}</a>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {exp.sub.bullets.map((b, bi) => (
                        <li key={bi} style={{ fontSize: 13, color: "#2a2a4a", lineHeight: 1.6, marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: "#b0b0c0" }}>•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>


        {/* ── SKILLS ── */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 16 }}>
            SKILLS
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {SKILLS.map(sg => (
              <div key={sg.group} style={{
                background: "#f8f9fc", border: "1px solid #e8e8ec",
                borderRadius: 6, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {sg.group}
                </div>
                <div style={{ fontSize: 12, color: "#4a4a6a", lineHeight: 1.6 }}>
                  {sg.items.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EDUCATION ── */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 12 }}>
            EDUCATION
          </h2>
          <div style={{ borderLeft: "3px solid #4a7adb", paddingLeft: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>BE, Computer Science</div>
            <div style={{ fontSize: 13, color: "#4a5a7a" }}>Pune University</div>
          </div>
        </section>

        {/* ── PRESS & RECOGNITION ── */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 12 }}>
            PRESS & RECOGNITION
          </h2>
          <div style={{ fontSize: 13, color: "#2a2a4a", lineHeight: 1.8 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Major features:</span> {PRESS_ITEMS.slice(0, 4).join(", ")}
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Funding coverage:</span> {PRESS_ITEMS.slice(4, 8).join(", ")}
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>Profiles:</span> {PRESS_ITEMS.slice(8).join(", ")}
            </div>
          </div>
        </section>

        {/* ── OPEN TO ── */}
        <section style={{
          marginBottom: 0,
          padding: "20px 24px",
          background: "#f0f4ff",
          border: "1px solid #d0d8ec",
          borderRadius: 8,
        }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 10 }}>
            OPEN TO
          </h2>
          <p style={{ fontSize: 13, color: "#2a2a4a", lineHeight: 1.6, margin: 0 }}>
            Senior operating and CMO-track roles, fractional/advisory mandates, and operator-investor partnerships — at AI-native, brand-led, or culture-driven companies.
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="mailto:minhas.param@gmail.com" style={{
              fontSize: 12, color: "#2a4a8a", textDecoration: "none",
              padding: "6px 12px", background: "#ffffff", border: "1px solid #d0d8ec",
              borderRadius: 4,
            }}>
              minhas.param@gmail.com
            </a>
            <a href="https://linkedin.com/in/paramminhas" target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, color: "#2a4a8a", textDecoration: "none",
              padding: "6px 12px", background: "#ffffff", border: "1px solid #d0d8ec",
              borderRadius: 4,
            }}>
              LinkedIn
            </a>
            <a href="https://hyperiterate.com" target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, color: "#2a4a8a", textDecoration: "none",
              padding: "6px 12px", background: "#ffffff", border: "1px solid #d0d8ec",
              borderRadius: 4,
            }}>
              hyperiterate.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
