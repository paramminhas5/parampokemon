import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press & Media — Param Minhas | VICE, CNBC-TV18, Storyboard18, Economic Times",
  description: "Param Minhas press coverage and media features. Featured in VICE, CNBC-TV18, Storyboard18 (Forbes India), Economic Times, Open Magazine, The Established, Business of Fashion, Entrackr, and Indian Retailer. Coverage of SoleSearch, sneaker culture in India, and startup funding.",
  keywords: [
    "Param Minhas press", "Param Minhas media", "Param Minhas VICE",
    "Param Minhas CNBC", "SoleSearch press", "SoleSearch VICE",
    "sneaker culture India media", "Param Minhas interviews",
    "SoleSearch funding news", "India sneaker resellers",
    "Param Minhas Storyboard18", "streetwear India press",
  ],
  alternates: { canonical: "https://paramquest.vercel.app/press" },
  openGraph: {
    title: "Press & Media — Param Minhas",
    description: "Featured in VICE, CNBC-TV18, Storyboard18, Economic Times, Open Magazine, The Established, Business of Fashion.",
    type: "website",
    url: "https://paramquest.vercel.app/press",
  },
  twitter: {
    card: "summary_large_image",
    title: "Press & Media — Param Minhas",
    description: "VICE, CNBC-TV18, Storyboard18, Economic Times, Open Magazine, The Established, Business of Fashion.",
    creator: "@paramminhas",
  },
};


const PRESS_ARTICLES = [
  {
    outlet: "VICE",
    title: "Inside the Secret Lives of India's Gen Z Sneaker Resellers",
    url: "https://www.vice.com/en/article/india-genz-sneakerheads-sneaker-resellers-hype/",
    date: "2023",
    description: "In-depth feature exploring India's sneaker resale market and SoleSearch's role in building the culture from the ground up.",
  },
  {
    outlet: "CNBC-TV18",
    title: "Broadcast interview — Param Minhas & Prabal Baghla on India's sneaker culture",
    url: "https://in.linkedin.com/company/solesearch",
    date: "2023",
    description: "Television broadcast interview discussing India's sneaker culture, market opportunity, and SoleSearch's growth trajectory.",
  },
  {
    outlet: "Storyboard18",
    title: "Sneaker Culture in India: Women buying as many sneakers as men, says SoleSearch's Param Minhas",
    url: "https://www.storyboard18.com/how-it-works/sneaker-culture-in-india-women-are-buying-as-many-sneakers-as-men-says-solesearchs-param-minhas-2518.htm",
    date: "2023",
    description: "Interview with Param Minhas on gender dynamics in Indian sneaker culture and SoleSearch's audience data.",
  },
  {
    outlet: "Storyboard18",
    title: "Sneakers are now collectibles — Rannvijay Singha on SoleSearch funding",
    url: "https://www.storyboard18.com/brand-makers/sneakers-are-now-considered-collectibles-with-a-passionate-following-among-gen-z-and-millennials-rannvijay-singha-8232.htm",
    date: "2023",
    description: "Coverage of SoleSearch's funding round and strategic direction, featuring co-founder Rannvijay Singha.",
  },
  {
    outlet: "Open Magazine",
    title: "Second Coming — India's pre-owned luxury & sneaker resale",
    url: "https://openthemagazine.com/feature/second-coming-2/",
    date: "2023",
    description: "Feature on the rise of India's resale economy, positioning SoleSearch within the broader luxury and streetwear market.",
  },
  {
    outlet: "The Established",
    title: "Can India's sneaker reseller business survive the global hype crash?",
    url: "https://www.theestablished.com/style/sneakers/can-indias-sneaker-reseller-business-survive-the-global-sneaker-hype-crash",
    date: "2023",
    description: "Analysis of market dynamics, global sneaker market correction, and SoleSearch's sustainability model.",
  },
  {
    outlet: "Economic Times",
    title: "SoleSearch raises Rs 6 crore in debut funding round",
    url: "https://in.linkedin.com/posts/solesearch_solesearch-raises-rs-6-crore-funding-from-activity-7060149811924131841-k78l",
    date: "2023",
    description: "Coverage of SoleSearch's debut funding milestone — Rs 6 crore ($795K) from Venture Catalysts, Anthill Ventures, and Cornerstone Ventures.",
  },
  {
    outlet: "Entrackr",
    title: "Street culture brand SoleSearch raises maiden fund",
    url: "https://entrackr.com/2023/05/street-culture-brand-solesearch-raises-maiden-fund/",
    date: "2023",
    description: "Startup funding coverage of SoleSearch's maiden raise and business model overview.",
  },
  {
    outlet: "Indian Retailer",
    title: "SoleSearch Bags $730,000 in Debut Funding Round",
    url: "https://www.indianretailer.com/news/funding-alert-solesearch-bags-730000-debut-funding-round",
    date: "2023",
    description: "Retail industry coverage of SoleSearch's funding and omnichannel expansion plans.",
  },
  {
    outlet: "Images Business of Fashion",
    title: "Rapport x SoleSearch collaborative store in Hyderabad brings best of streetwear & footwear",
    url: "https://www.imagesbof.in/rapport-x-solesearch-collaborative-store-in-hyderabad-brings-best-of-streetwear-footwear/",
    date: "2023",
    description: "Coverage of SoleSearch's retail partnership and collaborative store model in Hyderabad.",
  },
];


export default function PressPage() {
  const articlesJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Press & Media Coverage — Param Minhas",
    description: "All press and media features about Param Minhas and his companies.",
    url: "https://paramquest.vercel.app/press",
    about: { "@id": "https://paramquest.vercel.app/#person" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: PRESS_ARTICLES.length,
      itemListElement: PRESS_ARTICLES.map((article, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "NewsArticle",
          headline: article.title,
          url: article.url,
          publisher: { "@type": "Organization", name: article.outlet },
          datePublished: article.date,
          description: article.description,
          about: { "@id": "https://paramquest.vercel.app/#person" },
        },
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://paramquest.vercel.app" },
      { "@type": "ListItem", position: 2, name: "Press", item: "https://paramquest.vercel.app/press" },
    ],
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      color: "#1a1a2e",
      fontFamily: "'Space Mono', monospace",
    }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articlesJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Navigation */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e8e8ec", padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, flexWrap: "wrap",
      }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", background: "#ffffff", color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11, fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4 }}>← Home</Link>
        <Link href="/about" style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", background: "#ffffff", color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11, fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4 }}>About</Link>
        <Link href="/resume" style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", background: "#ffffff", color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11, fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4 }}>Resume</Link>
        <Link href="/play" style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", background: "#f0f4ff", color: "#4a5a8a", border: "1.5px solid #d0d8e8", fontSize: 11, fontFamily: "'Press Start 2P', monospace", textDecoration: "none", borderRadius: 4 }}>▶ Play</Link>
      </nav>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 64px" }}>
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>Press & Media Coverage</h1>
          <p style={{ fontSize: 15, color: "#4a5a7a", margin: 0, lineHeight: 1.6 }}>
            Param Minhas and his companies have been featured in major publications including VICE, CNBC-TV18, Storyboard18 (syndicated to Forbes India), Economic Times, Open Magazine, The Established, and Business of Fashion.
          </p>
        </header>

        {/* Articles list */}
        <section>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {PRESS_ARTICLES.map((article, i) => (
              <article key={i} style={{ borderLeft: "3px solid #4a7adb", paddingLeft: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6a7adb", textTransform: "uppercase", letterSpacing: "0.08em" }}>{article.outlet}</span>
                  <span style={{ fontSize: 12, color: "#8a8aa0" }}>{article.date}</span>
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a2e", textDecoration: "none" }}>
                    {article.title} ↗
                  </a>
                </h2>
                <p style={{ fontSize: 14, color: "#4a4a6a", margin: 0, lineHeight: 1.6 }}>
                  {article.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Additional databases */}
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 12 }}>DATABASES & PROFILES</h2>
          <p style={{ fontSize: 14, color: "#4a4a6a", lineHeight: 1.8 }}>
            Company profiles and data available on CB Insights, Crunchbase, PitchBook (SoleSearch),
            Tracxn (Hab Housing), Wellfound/AngelList (Investopad team),
            and SlideShare (Octo marketing decks, Project Alia).
          </p>
        </section>

        {/* CTA */}
        <section style={{ marginTop: 40, padding: "24px", background: "#f0f4ff", border: "1px solid #d0d8ec", borderRadius: 8 }}>
          <h2 style={{ fontSize: 11, fontFamily: "'Press Start 2P', monospace", color: "#2a4a8a", letterSpacing: "0.1em", marginBottom: 10 }}>MEDIA INQUIRIES</h2>
          <p style={{ fontSize: 14, color: "#2a2a4a", margin: "0 0 12px" }}>
            For interviews, quotes, or media inquiries, contact Param directly.
          </p>
          <a href="mailto:minhas.param@gmail.com" style={{ fontSize: 13, color: "#2a4a8a", textDecoration: "none", padding: "8px 14px", background: "#ffffff", border: "1px solid #d0d8ec", borderRadius: 4 }}>
            minhas.param@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
}
