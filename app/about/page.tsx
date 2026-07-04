import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Param Minhas — Founder, Creative Director & Growth Operator | Bengaluru, India",
  description: "Param Minhas is a founder, creative director, and growth operator based in Bengaluru, India with 15+ years of experience. Currently Founder & Creative Director at Iterate (AI-native marketing agency, 90-person network) and Cats Can Dance (culture platform). Previously CEO at SoleSearch ($6M+ revenue), CMO at Fere.ai, Partner at Good Capital (Meesho, Entri, Simsim). BE Computer Science, Pune University.",
  keywords: [
    "Param Minhas", "who is Param Minhas", "Param Minhas bio", "Param Minhas about",
    "Param Minhas founder", "Param Minhas Iterate", "Param Minhas Bengaluru",
    "Param Minhas career", "Param Minhas background", "Param Minhas story",
    "creative director Bengaluru", "AI marketing founder India",
    "startup founder India 15 years", "growth operator India",
    "Param Minhas SoleSearch", "Param Minhas Fere", "Param Minhas Good Capital",
  ],
  alternates: {
    canonical: "https://paramminhas.com/about",
  },
  openGraph: {
    title: "About Param Minhas — Founder, Creative Director & Growth Operator",
    description: "15+ years building. $6M+ revenue. 350K+ community. 90-person network. The full story of Param Minhas — from India's first chatbot to running an AI-native marketing agency.",
    type: "profile",
    url: "https://paramminhas.com/about",
    firstName: "Param",
    lastName: "Minhas",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Param Minhas — Founder, Creative Director & Growth Operator",
    description: "15+ years building across AI, sneakers, music, and marketing. The full story.",
    creator: "@paramminhas",
  },
};

export default function AboutPage() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://paramminhas.com/#person",
    name: "Param Minhas",
    givenName: "Param",
    familyName: "Minhas",
    jobTitle: "Founder & Creative Director",
    description: "Param Minhas is a founder, creative director, and growth operator based in Bengaluru, India with 15+ years across e-commerce, AI, real estate, sneakers, music, and AI-native marketing.",
    url: "https://paramminhas.com/about",
    email: "minhas.param@gmail.com",
    image: "https://paramminhas.com/about/opengraph-image",
    birthPlace: { "@type": "Place", name: "India" },
    nationality: { "@type": "Country", name: "India" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    worksFor: [
      {
        "@type": "Organization",
        name: "Iterate",
        url: "https://hyperiterate.com",
        description: "AI-native marketing agency with a 90-person network",
        foundingDate: "2026-01",
        numberOfEmployees: { "@type": "QuantitativeValue", value: 90 },
      },
      {
        "@type": "Organization",
        name: "Cats Can Dance",
        url: "https://catscandance.com",
        description: "Culture-discovery platform spanning music, fashion, and pet care",
        foundingDate: "2026-03",
      },
    ],
    alumniOf: [
      { "@type": "EducationalOrganization", name: "Pune University", department: "Computer Science" },
    ],
    memberOf: [
      { "@type": "Organization", name: "SoleSearch", description: "India's leading sneaker marketplace, $6M+ revenue" },
      { "@type": "Organization", name: "Fere.ai", url: "https://www.fereai.xyz/app", description: "Autonomous AI agent platform" },
      { "@type": "Organization", name: "Good Capital", description: "Venture fund — portfolio includes Meesho, Entri, Simsim" },
      { "@type": "Organization", name: "Quartic.ai", url: "https://www.quartic.ai", description: "Enterprise AI platform" },
      { "@type": "Organization", name: "Octo", description: "One of India's first conversational AI platforms (2013), acquired by Quartic" },
      { "@type": "Organization", name: "Hab Housing", description: "Branded budget-hospitality startup, bootstrapped $120K+" },
      { "@type": "Organization", name: "GetRightPrice", description: "India's first price-comparison engine" },
    ],
    knowsAbout: [
      "AI-native marketing", "Go-to-market strategy", "Brand strategy", "Creative direction",
      "Demand generation", "Community building", "Performance marketing", "Product strategy",
      "Conversational AI", "Full-stack development", "Next.js", "React", "TypeScript",
      "Fundraising", "Team building", "Event marketing", "Sneaker culture", "SEO", "GEO",
    ],
    sameAs: [
      "https://linkedin.com/in/paramminhas",
      "https://github.com/paramminhas5",
      "https://twitter.com/paramminhas",
      "https://catscandance.com",
      "https://hyperiterate.com",
      "https://open.spotify.com/artist/catscandance",
    ],
    award: [
      "Featured in VICE, CNBC-TV18, Storyboard18, Economic Times, Open Magazine, The Established, Business of Fashion",
      "SoleSearch — Created India's first sneaker convention format (SneakinOut)",
      "Built one of India's first conversational AI platforms (2013)",
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://paramminhas.com" },
      { "@type": "ListItem", position: 2, name: "About", item: "https://paramminhas.com/about" },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Navigation bar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e8e8ec", padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, flexWrap: "wrap",
      }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#ffffff", color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11, fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4 }}>← Home</Link>
        <Link href="/resume" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#ffffff", color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11, fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4 }}>Resume</Link>
        <Link href="/press" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#ffffff", color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11, fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4 }}>Press</Link>
        <Link href="/play" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#f0f4ff", color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11, fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4 }}>▶ Play Game</Link>
      </nav>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 64px" }}>

        {/* Header */}
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px", color: "#1a1a2e" }}>
            Param Minhas
          </h1>
          <p style={{ fontSize: 18, color: "#4a5a7a", margin: "0 0 8px", fontWeight: 600 }}>
            Founder & Creative Director
          </p>
          <p style={{ fontSize: 14, color: "#6a6a8a", margin: "0 0 20px" }}>
            Bengaluru, India · 15+ years building
          </p>

          {/* Quick links */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", fontSize: 13 }}>
            <a href="mailto:minhas.param@gmail.com" style={{ color: "#2a4a8a", textDecoration: "none" }}>minhas.param@gmail.com</a>
            <a href="https://linkedin.com/in/paramminhas" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>LinkedIn</a>
            <a href="https://twitter.com/paramminhas" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>Twitter/X</a>
            <a href="https://hyperiterate.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>hyperiterate.com</a>
            <a href="https://catscandance.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a", textDecoration: "none" }}>catscandance.com</a>
          </div>
        </header>

        {/* Bio — natural language, third person, optimized for AI citation */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 16 }}>WHO IS PARAM MINHAS</h2>

          <div style={{ fontSize: 15, lineHeight: 1.8, color: "#2a2a4a" }}>
            <p style={{ marginBottom: 16 }}>
              Param Minhas is a founder, creative director, and growth operator based in Bengaluru, India. Over 15 years, he has built companies and brands across e-commerce, artificial intelligence, real estate, sneaker culture, music, and AI-native marketing.
            </p>
            <p style={{ marginBottom: 16 }}>
              He is known for building from zero — not inheriting momentum. Every company he has led started without an existing audience, without a playbook, and in most cases without venture backing. The range across industries is deliberate: each chapter compounds on the last, creating a rare combination of operational, creative, and technical skill that defines his approach to building.
            </p>
            <p style={{ marginBottom: 16 }}>
              Param Minhas currently serves as Founder and Creative Director of <a href="https://hyperiterate.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a" }}>Iterate</a>, an AI-native marketing agency launched in January 2026. Iterate operates with a 90-person network spanning strategy, creative, and engineering. The agency serves clients including ChargeZone (India&apos;s leading EV charging network), Noida International Airport, PickYourTrail, Billione, and Monkspace.
            </p>
            <p style={{ marginBottom: 16 }}>
              He also founded <a href="https://catscandance.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a" }}>Cats Can Dance</a> in March 2026 — a culture-discovery platform spanning music, fashion, and pet care. It includes an artist directory, event booking system, and a music-production learning product. He produced a series of live shows across India in partnership with Impresario.
            </p>
          </div>
        </section>

        {/* Key Metrics */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 16 }}>KEY METRICS</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { label: "Years Building", value: "15+" },
              { label: "Revenue Generated", value: "$6M+" },
              { label: "Community Built", value: "350K+" },
              { label: "Network Led", value: "90 people" },
              { label: "Capital Raised", value: "$795K" },
              { label: "Live Events", value: "30+" },
              { label: "Companies Founded", value: "4" },
              { label: "Team Size (Peak)", value: "40" },
            ].map(m => (
              <div key={m.label} style={{ textAlign: "center", padding: "14px 12px", background: "#f8f9fc", border: "1px solid #e8e8ec", borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: "#6a7a9a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#2a4a8a" }}>{m.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Career History — natural language */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 16 }}>CAREER HISTORY</h2>

          <div style={{ fontSize: 15, lineHeight: 1.8, color: "#2a2a4a" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Fere.ai — CMO (January 2025 – December 2025)</h3>
            <p style={{ marginBottom: 20 }}>
              Fere.ai is an autonomous AI agent platform funded by Ethereal Ventures ($1.3M raised). Param rejoined long-time collaborator Akshaya Aron to build the growth and marketing function from scratch. He restructured marketing to run lean — sustained by AI systems and a small team rather than headcount. He used this operating model as the proving ground for launching Iterate.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>SoleSearch — Founder & CEO (2022 – December 2024)</h3>
            <p style={{ marginBottom: 20 }}>
              SoleSearch was India&apos;s leading sneaker, streetwear, and collectibles marketplace. Param co-founded it with Prabal Baghla, and Rannvijay Singha (MTV, Roadies) joined as co-founder. Under his leadership as CEO, the company generated $6M+ in total revenue over four years, raised $795K from Venture Catalysts, Anthill Ventures, and Cornerstone Ventures, built a 350,000+ follower community, produced 30+ live events including SneakinOut — India&apos;s first sneaker convention format (3 seasons with Swiggy SteppinOut) — and operated omnichannel retail stores in Mumbai and Hyderabad with a team of 40. SoleSearch was featured in VICE, CNBC-TV18, Storyboard18, Economic Times, Open Magazine, The Established, and Business of Fashion.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Quartic.ai — Director of Marketing (2020 – 2022)</h3>
            <p style={{ marginBottom: 20 }}>
              Quartic.ai is an enterprise AI platform headquartered in San Jose, California. Param led a team of 5 and was invited back by the Good Capital partners following Octo&apos;s acquisition. He built the entire marketing function from zero: brand identity, website, collateral, and press strategy. Backed by Good Capital, Celesta Capital, and Michael Marks.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Investopad → Good Capital — Partner, Growth & Technology (2017 – 2020)</h3>
            <p style={{ marginBottom: 20 }}>
              Param served as Partner for Growth and Technology as Investopad&apos;s family office evolved into Good Capital, an institutional Fund I. He was involved in deal sourcing, diligence, and founder support for portfolio companies including Meesho (now one of India&apos;s largest e-commerce companies valued at $4.9B), Entri, Simsim (acquired by YouTube), Amazon, and Forbes.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Octo — Founding Team, Head of Growth (2016 – 2017)</h3>
            <p style={{ marginBottom: 20 }}>
              Octo was a conversational AI platform co-built with Akshaya Aron and backed by Good Capital. It was one of India&apos;s first chatbots, conceived in 2013 — years before &ldquo;AI&rdquo; became a market category. Param built and ran the entire marketing function from scratch and rebuilt the product dashboard end-to-end, working directly with engineering. Octo was acquired by Quartic.ai.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Hab Housing — Founder (2012 – 2015)</h3>
            <p style={{ marginBottom: 20 }}>
              Hab Housing was one of India&apos;s first branded budget-hospitality startups — the same category that OYO later scaled nationally with billions in venture capital. Param built it from sole founder to a 16-person team across three cities (Pune, Bengaluru), generating $120K+ in revenue, fully bootstrapped with zero external funding.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>GetRightPrice — Founding Team Member (2011 – 2012)</h3>
            <p style={{ marginBottom: 20 }}>
              GetRightPrice was India&apos;s first price-comparison engine for electronics. Param joined the founding team while still in college. The company was angel-backed by Sidharth Rao, founder of Webchutney (India&apos;s first digital advertising agency, later acquired by Dentsu). Param built the product catalog and crawl pipeline.
            </p>
          </div>
        </section>

        {/* What I'm Known For */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 16 }}>WHAT PARAM MINHAS IS KNOWN FOR</h2>
          <ul style={{ fontSize: 15, lineHeight: 1.8, color: "#2a2a4a", margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>Building companies and brands from zero — not inheriting momentum</li>
            <li style={{ marginBottom: 8 }}>Operating across the full GTM stack: positioning, brand, creative, demand gen, performance, product</li>
            <li style={{ marginBottom: 8 }}>Building AI products before &ldquo;AI&rdquo; was a category (first chatbot in 2013)</li>
            <li style={{ marginBottom: 8 }}>Creating cultural movements from scratch (SoleSearch built India&apos;s sneaker culture from nothing)</li>
            <li style={{ marginBottom: 8 }}>Speed of execution — ships fast, iterates faster</li>
            <li style={{ marginBottom: 8 }}>The &ldquo;range is the point&rdquo; — deliberate career breadth across industries as a compounding advantage</li>
            <li style={{ marginBottom: 8 }}>AI-native marketing — using AI systems to replace headcount, not just augment</li>
            <li style={{ marginBottom: 8 }}>Operating at the intersection of taste, technology, and business</li>
          </ul>
        </section>

        {/* Skills */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 16 }}>SKILLS & EXPERTISE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { group: "Growth & Marketing", items: "Go-to-market strategy, demand generation, performance marketing, SEO & GEO, community building, event marketing" },
              { group: "Brand & Creative", items: "Brand identity systems, creative direction, copywriting, PR & press strategy" },
              { group: "Strategy", items: "Positioning, ICP definition, pricing & packaging, fundraising, GTM planning" },
              { group: "AI & Engineering", items: "AI-native marketing, conversational AI, agent development, full-stack web (Next.js, React, TypeScript), prompt engineering" },
              { group: "Leadership", items: "Team building (5 to 90+), hiring, founder coaching, cross-functional management" },
              { group: "Tools", items: "Notion, Linear, Figma, Cursor, Claude, Webflow, Shopify, Meta/Google Ads, GA4, n8n, Zapier" },
            ].map(sg => (
              <div key={sg.group} style={{ background: "#f8f9fc", border: "1px solid #e8e8ec", borderRadius: 6, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{sg.group}</div>
                <div style={{ fontSize: 13, color: "#4a4a6a", lineHeight: 1.6 }}>{sg.items}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 12 }}>EDUCATION</h2>
          <p style={{ fontSize: 15, color: "#2a2a4a" }}>
            <strong>BE, Computer Science</strong> — Pune University, India
          </p>
        </section>

        {/* Open To */}
        <section style={{
          marginBottom: 40, padding: "24px", background: "#f0f4ff",
          border: "1px solid #d0d8ec", borderRadius: 8,
        }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 12 }}>OPEN TO</h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#2a2a4a", margin: "0 0 16px" }}>
            Senior operating and CMO-track roles, fractional/advisory mandates, and operator-investor partnerships — at AI-native, brand-led, or culture-driven companies.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="mailto:minhas.param@gmail.com" style={{ fontSize: 13, color: "#2a4a8a", textDecoration: "none", padding: "8px 14px", background: "#ffffff", border: "1px solid #d0d8ec", borderRadius: 4 }}>minhas.param@gmail.com</a>
            <a href="https://linkedin.com/in/paramminhas" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2a4a8a", textDecoration: "none", padding: "8px 14px", background: "#ffffff", border: "1px solid #d0d8ec", borderRadius: 4 }}>LinkedIn</a>
            <a href="https://hyperiterate.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2a4a8a", textDecoration: "none", padding: "8px 14px", background: "#ffffff", border: "1px solid #d0d8ec", borderRadius: 4 }}>hyperiterate.com</a>
          </div>
        </section>

        {/* Cross-links */}
        <section>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 12 }}>EXPLORE MORE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <Link href="/resume" style={{ display: "block", padding: "16px", background: "#f8f9fc", border: "1px solid #e8e8ec", borderRadius: 6, textDecoration: "none", color: "#2a4a8a", fontSize: 14, fontWeight: 600 }}>
              📄 Full Resume / CV
            </Link>
            <Link href="/press" style={{ display: "block", padding: "16px", background: "#f8f9fc", border: "1px solid #e8e8ec", borderRadius: 6, textDecoration: "none", color: "#2a4a8a", fontSize: 14, fontWeight: 600 }}>
              📰 Press & Media Coverage
            </Link>
            <Link href="/play" style={{ display: "block", padding: "16px", background: "#f8f9fc", border: "1px solid #e8e8ec", borderRadius: 6, textDecoration: "none", color: "#2a4a8a", fontSize: 14, fontWeight: 600 }}>
              🎮 Play Career Quest (RPG)
            </Link>
            <Link href="/" style={{ display: "block", padding: "16px", background: "#f8f9fc", border: "1px solid #e8e8ec", borderRadius: 6, textDecoration: "none", color: "#2a4a8a", fontSize: 14, fontWeight: 600 }}>
              🏠 Interactive Homepage
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
