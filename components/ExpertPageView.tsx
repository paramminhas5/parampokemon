import Link from "next/link";
import { EXPERT_PAGES, QUOTES, QUOTED_IN, TESTIMONIALS, type ExpertPage } from "@/lib/expertise";

const BASE = "https://paramminhas.com";

const navLink = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 16px",
  background: "#ffffff",
  color: "#4a5a8a",
  border: "1.5px solid #d0d8e8",
  fontSize: 11,
  fontFamily: "'Press Start 2P', monospace",
  textDecoration: "none",
  borderRadius: 4,
} as const;

const label = {
  fontSize: 11,
  fontFamily: "'Press Start 2P', monospace",
  color: "#2a4a8a",
  letterSpacing: "0.1em",
  marginBottom: 16,
} as const;

export function ExpertPageView({ page }: { page: ExpertPage }) {
  const url = `${BASE}/${page.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${url}#page`,
      url,
      name: page.title,
      description: page.description,
      mainEntity: {
        "@type": "Person",
        "@id": `${BASE}/#person`,
        name: "Param Minhas",
        description: page.lead,
        knowsAbout: page.knowsAbout,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: page.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: page.h1, item: url },
      ],
    },
  ];

  const others = EXPERT_PAGES.filter((p) => p.slug !== page.slug);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1a1a2e", fontFamily: "'Space Mono', monospace" }}>
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}

      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e8e8ec", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href="/" style={navLink}>← Home</Link>
        <Link href="/about" style={navLink}>About</Link>
        <Link href="/press" style={navLink}>Press</Link>
        <Link href="/play" style={{ ...navLink, background: "#f0f4ff" }}>▶ Play</Link>
      </nav>

      <article style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 64px" }}>
        <header style={{ marginBottom: 36 }}>
          <p style={{ ...label, marginBottom: 12 }}>{page.kicker.toUpperCase()}</p>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 20px" }}>{page.h1}</h1>
          <p id="speakable-summary" style={{ fontSize: 17, lineHeight: 1.75, color: "#2a2a4a", margin: 0 }}>{page.lead}</p>
        </header>

        {page.sections.map((s) => (
          <section key={s.heading} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: "#2a2a4a", margin: "0 0 14px" }}>{p}</p>
            ))}
            {s.bullets && (
              <ul style={{ fontSize: 15, lineHeight: 1.8, color: "#2a2a4a", margin: 0, paddingLeft: 20 }}>
                {s.bullets.map((b, i) => (
                  <li key={i} style={{ marginBottom: 10 }}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section style={{ marginBottom: 36 }}>
          <h2 style={label}>WHAT OTHERS SAY</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[...TESTIMONIALS, ...QUOTES].map((q, i) => (
              <figure key={i} style={{ margin: 0, borderLeft: "3px solid #4a7adb", paddingLeft: 16 }}>
                <blockquote style={{ margin: "0 0 6px", fontSize: 16, lineHeight: 1.6 }}>&ldquo;{q.text}&rdquo;</blockquote>
                <figcaption style={{ fontSize: 13, color: "#6a6a8a" }}>
                  {q.who},{" "}
                  <a href={q.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a" }}>{q.source}</a>
                </figcaption>
              </figure>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "#6a6a8a", lineHeight: 1.8, marginTop: 20 }}>
            Quoted or featured in:{" "}
            {QUOTED_IN.map((o, i) => (
              <span key={o.outlet}>
                <a href={o.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a" }}>{o.outlet}</a>
                {i < QUOTED_IN.length - 1 ? ", " : "."}
              </span>
            ))}{" "}
            <Link href="/press" style={{ color: "#2a4a8a" }}>All press</Link>
          </p>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={label}>QUESTIONS</h2>
          {page.faqs.map((f) => (
            <div key={f.q} style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{f.q}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#2a2a4a", margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </section>

        <section style={{ padding: 24, background: "#f0f4ff", border: "1px solid #d0d8ec", borderRadius: 8, marginBottom: 36 }}>
          <h2 style={{ ...label, marginBottom: 10 }}>WORK WITH PARAM</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 12px" }}>Launches, partnerships, creative direction and go-to-market in India.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 13 }}>
            <a href="mailto:minhas.param@gmail.com" style={{ color: "#2a4a8a" }}>minhas.param@gmail.com</a>
            <a href="mailto:hello@catscandance.com" style={{ color: "#2a4a8a" }}>hello@catscandance.com</a>
            <a href="https://linkedin.com/in/paramminhas" target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a" }}>LinkedIn</a>
          </div>
        </section>

        <nav aria-label="More about Param">
          <h2 style={label}>MORE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {others.map((p) => (
              <Link key={p.slug} href={`/${p.slug}`} style={{ display: "block", padding: 16, background: "#f8f9fc", border: "1px solid #e8e8ec", borderRadius: 6, textDecoration: "none", color: "#2a4a8a", fontSize: 14, fontWeight: 600 }}>
                {p.h1 === "Param Minhas, brand builder" ? "Brand builder" : p.h1}
              </Link>
            ))}
            <Link href="/about" style={{ display: "block", padding: 16, background: "#f8f9fc", border: "1px solid #e8e8ec", borderRadius: 6, textDecoration: "none", color: "#2a4a8a", fontSize: 14, fontWeight: 600 }}>Full biography</Link>
          </div>
        </nav>
      </article>
    </div>
  );
}

export function expertMetadata(page: ExpertPage) {
  const url = `${BASE}/${page.slug}`;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: url },
    openGraph: { title: page.title, description: page.description, type: "profile" as const, url },
    twitter: { card: "summary_large_image" as const, title: page.title, description: page.description, creator: "@paramminhas" },
  };
}
