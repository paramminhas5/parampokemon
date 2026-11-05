import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { POSTS, getPost } from "@/lib/posts";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `https://paramminhas.com/writing/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: { title: post.title, description: post.description, type: "article", url, publishedTime: post.date, authors: ["Param Minhas"] },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, creator: "@paramminhas" },
  };
}

const navLink = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#ffffff",
  color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11,
  fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4,
} as const;

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const url = `https://paramminhas.com/writing/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: url,
    author: { "@id": "https://paramminhas.com/#person" },
    publisher: { "@id": "https://paramminhas.com/#person" },
  };
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1a1a2e", fontFamily: "'Space Mono', monospace" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e8e8ec", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href="/writing" style={navLink}>← Writing</Link>
        <Link href="/about" style={navLink}>About</Link>
        <Link href="/resume" style={navLink}>Resume</Link>
      </nav>
      <main id="main-content" style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 64px" }}>
        <article>
          <div style={{ fontSize: 11, color: "#6a7a9a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            {post.tag} · <time dateTime={post.date}>{post.date}</time>
          </div>
          <h1 style={{ fontSize: 30, lineHeight: 1.25, fontWeight: 700, margin: "0 0 24px", color: "#1a1a2e" }}>{post.title}</h1>
          <div style={{ fontSize: 16, lineHeight: 1.8, color: "#2a2a4a" }}>
            {post.body.map((para, i) => (
              <p key={i} style={{ margin: "0 0 18px" }}>{para}</p>
            ))}
          </div>
          {post.sources && (
            <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #e8e8ec", fontSize: 13, color: "#4a4a6a" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6a7a9a", marginBottom: 8 }}>Sources</div>
              {post.sources.map((s) => (
                <div key={s.url} style={{ marginBottom: 6 }}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2a4a8a" }}>{s.label}</a>
                </div>
              ))}
            </div>
          )}
          <p style={{ marginTop: 32, fontSize: 14, color: "#2a2a4a" }}>
            Param Minhas<br />
            <Link href="/about" style={{ color: "#2a4a8a" }}>paramminhas.com</Link>
          </p>
        </article>
      </main>
    </div>
  );
}
