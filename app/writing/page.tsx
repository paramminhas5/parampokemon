import Link from "next/link";
import type { Metadata } from "next";
import { POSTS } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing by Param Minhas: AI marketing, community and building",
  description:
    "Notes from Param Minhas on AI-native marketing, GEO, community-led growth and building products, drawn from real work and sourced research.",
  alternates: { canonical: "https://paramminhas.com/writing" },
  openGraph: {
    title: "Writing by Param Minhas",
    description: "Notes on AI-native marketing, GEO, community-led growth and building products.",
    type: "website",
    url: "https://paramminhas.com/writing",
  },
};

const navLink = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#ffffff",
  color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11,
  fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4,
} as const;

export default function WritingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Writing by Param Minhas",
    url: "https://paramminhas.com/writing",
    author: { "@id": "https://paramminhas.com/#person" },
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      datePublished: p.date,
      url: `https://paramminhas.com/writing/${p.slug}`,
    })),
  };
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1a1a2e", fontFamily: "'Space Mono', monospace" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e8e8ec", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href="/" style={navLink}>← Home</Link>
        <Link href="/about" style={navLink}>About</Link>
        <Link href="/resume" style={navLink}>Resume</Link>
        <Link href="/press" style={navLink}>Press</Link>
      </nav>
      <main id="main-content" style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 64px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px", color: "#1a1a2e" }}>Writing</h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "#4a4a6a", margin: "0 0 32px" }}>
          Notes from real work and sourced research: AI-native marketing, GEO, community-led growth and building products.
        </p>
        <div style={{ display: "grid", gap: 16 }}>
          {POSTS.map((p) => (
            <Link key={p.slug} href={`/writing/${p.slug}`} style={{ display: "block", padding: "18px 20px", background: "#f8f9fc", border: "1px solid #e8e8ec", borderRadius: 6, textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: 11, color: "#6a7a9a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                {p.tag} · {p.date}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#2a4a8a", marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "#4a4a6a" }}>{p.description}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
