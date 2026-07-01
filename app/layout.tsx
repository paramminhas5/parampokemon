import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paramquest.vercel.app"),
  title: {
    default: "Param Minhas — Builder · Designer · Creative Director | Founder of Iterate | 15+ Years, $6M+ Revenue",
    template: "%s | Param Minhas",
  },
  description: "Param Minhas is a founder, creative director, and growth operator with 15+ years across AI, e-commerce, sneakers, music, and marketing. Currently running Iterate — an AI-native marketing agency (90-person network). Previously CEO at SoleSearch ($6M+ revenue, 350K+ community), CMO at Fere.ai, Partner at Good Capital (Meesho, Entri, Simsim). Based in Bengaluru, India.",
  keywords: [
    // Name variations
    "Param Minhas", "Param Minhas resume", "Param Minhas portfolio", "Param Minhas LinkedIn",
    "Param Minhas Iterate", "Param Minhas SoleSearch", "Param Minhas Bengaluru",
    // Current roles
    "Iterate marketing agency", "hyperiterate.com", "AI-native marketing agency India",
    "Cats Can Dance", "catscandance.com",
    // Past roles
    "SoleSearch India", "SoleSearch sneakers", "Fere.ai CMO", "Good Capital India",
    "Investopad", "Quartic.ai marketing", "Octo AI chatbot India",
    // Skills & expertise
    "creative director India", "growth marketing leader", "GTM strategy",
    "AI-native marketing", "brand strategy India", "demand generation",
    "startup founder India", "marketing leader Bengaluru",
    "go-to-market strategy", "community building", "event marketing India",
    "performance marketing", "conversational AI India",
    // Industry terms
    "sneaker culture India", "streetwear India", "startup ecosystem India",
    "venture capital India", "AI marketing", "full-stack marketer",
    "fractional CMO India", "marketing agency AI",
    // Long-tail
    "who is Param Minhas", "Param Minhas career", "Param Minhas experience",
    "best AI marketing agency India", "creative director for startups",
  ],
  authors: [{ name: "Param Minhas", url: "https://linkedin.com/in/paramminhas" }],
  creator: "Param Minhas",
  publisher: "Param Minhas",
  category: "technology",
  classification: "Personal Portfolio",
  openGraph: {
    title: "Param Minhas — Builder · Designer · Creative Director",
    description: "15+ years building. $6M+ revenue. 350K+ community. 90-person network. Founder of Iterate (AI-native marketing agency) & Cats Can Dance (culture platform). Previously: SoleSearch, Fere.ai, Good Capital.",
    type: "profile",
    url: "https://paramquest.vercel.app",
    siteName: "Param Quest — Playable Portfolio",
    locale: "en_US",
    firstName: "Param",
    lastName: "Minhas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Param Minhas — Builder · Designer · Creative Director",
    description: "15+ years building. $6M+ revenue. 350K+ community. AI-native marketing agency founder. Playable portfolio RPG.",
    creator: "@paramminhas",
    site: "@paramminhas",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://paramquest.vercel.app",
  },
  verification: {
    // Add Google Search Console verification when available
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
  other: {
    "linkedin:owner": "paramminhas",
    "profile:first_name": "Param",
    "profile:last_name": "Minhas",
    "profile:username": "paramminhas",
    "og:email": "minhas.param@gmail.com",
    "og:locality": "Bengaluru",
    "og:country-name": "India",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a1226" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Primary Person schema — comprehensive
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://paramquest.vercel.app/#person",
    name: "Param Minhas",
    givenName: "Param",
    familyName: "Minhas",
    jobTitle: "Founder & Creative Director",
    description: "Founder, creative director, and growth operator with 15+ years across e-commerce, AI, real estate, sneakers, music, and AI-native marketing. $6M+ revenue generated, 350K+ community built, 90-person network led. Currently running Iterate (AI-native marketing agency) and Cats Can Dance (culture platform).",
    url: "https://paramquest.vercel.app",
    email: "minhas.param@gmail.com",
    image: "https://paramquest.vercel.app/opengraph-image",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    nationality: { "@type": "Country", name: "India" },
    worksFor: [
      {
        "@type": "Organization",
        "@id": "https://hyperiterate.com/#org",
        name: "Iterate",
        url: "https://hyperiterate.com",
        description: "AI-native marketing agency with a 90-person network across strategy, creative, and engineering",
        foundingDate: "2026-01",
        founder: { "@id": "https://paramquest.vercel.app/#person" },
        numberOfEmployees: { "@type": "QuantitativeValue", value: 90 },
      },
      {
        "@type": "Organization",
        "@id": "https://catscandance.com/#org",
        name: "Cats Can Dance",
        url: "https://catscandance.com",
        description: "Culture-discovery platform spanning music, fashion, and pet care",
        foundingDate: "2026-03",
        founder: { "@id": "https://paramquest.vercel.app/#person" },
      },
    ],
    sameAs: [
      "https://linkedin.com/in/paramminhas",
      "https://github.com/paramminhas5",
      "https://twitter.com/paramminhas",
      "https://catscandance.com",
      "https://hyperiterate.com",
      "https://open.spotify.com/artist/catscandance",
      "https://www.crunchbase.com/person/param-minhas",
      "https://tracxn.com/d/companies/hab-housing/__e1-Y8yk6fIQg8I52LcHihc_D17fv5S22nK1cO0xNuXA",
      "https://wellfound.com/company/investopad/people",
    ],
    knowsAbout: [
      "AI-native marketing", "Go-to-market strategy", "Brand strategy", "Creative direction",
      "Demand generation", "Community building", "Performance marketing", "Product strategy",
      "Conversational AI", "Full-stack development", "Next.js", "React", "TypeScript",
      "Fundraising", "Team building", "Event marketing", "Sneaker culture",
      "SEO", "Generative Engine Optimization", "Content strategy",
      "Startup operations", "Venture capital", "E-commerce",
    ],
    hasOccupation: [
      {
        "@type": "Occupation",
        name: "Founder & Creative Director",
        description: "AI-native marketing agency leadership",
        occupationLocation: { "@type": "City", name: "Bengaluru" },
        estimatedSalary: { "@type": "MonetaryAmountDistribution", currency: "USD" },
      },
    ],
    alumniOf: [
      { "@type": "EducationalOrganization", name: "Pune University", department: "Computer Science" },
    ],
    memberOf: [
      { "@type": "Organization", name: "SoleSearch", description: "India's leading sneaker & streetwear marketplace, $6M+ revenue, 350K+ community", url: "https://www.vice.com/en/article/india-genz-sneakerheads-sneaker-resellers-hype/" },
      { "@type": "Organization", name: "Fere.ai", description: "Autonomous AI agent platform, funded by Ethereal Ventures", url: "https://www.fereai.xyz/app" },
      { "@type": "Organization", name: "Good Capital", description: "Venture fund — portfolio includes Meesho, Entri, Simsim" },
      { "@type": "Organization", name: "Quartic.ai", description: "Enterprise AI platform", url: "https://www.quartic.ai" },
      { "@type": "Organization", name: "Octo", description: "Conversational AI platform, one of India's first chatbots (2013), acquired by Quartic.ai" },
      { "@type": "Organization", name: "Hab Housing", description: "India's first branded budget-hospitality startups, bootstrapped to $120K+" },
      { "@type": "Organization", name: "GetRightPrice", description: "India's first price-comparison engine, angel-backed by Sidharth Rao (Webchutney)" },
    ],
    award: [
      "Featured in VICE, CNBC-TV18, Storyboard18, Economic Times, Open Magazine, The Established, Business of Fashion",
      "SoleSearch — India's first sneaker convention format (SneakinOut, 3 seasons with Swiggy SteppinOut)",
    ],
  };

  // WebSite schema with search action
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://paramquest.vercel.app/#website",
    name: "Param Quest — Playable Portfolio",
    alternateName: ["Param Minhas Portfolio", "Param Minhas Resume", "Param Quest"],
    url: "https://paramquest.vercel.app",
    description: "A playable portfolio RPG — 15 years of Param Minhas's career told as a Pokemon-style game. Explore 10 zones, battle gym leaders, and discover the story.",
    publisher: { "@id": "https://paramquest.vercel.app/#person" },
    inLanguage: "en-US",
    copyrightHolder: { "@id": "https://paramquest.vercel.app/#person" },
    copyrightYear: 2026,
  };

  // ProfilePage schema
  const profilePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": "https://paramquest.vercel.app/#profilepage",
    name: "Param Minhas — Professional Profile",
    url: "https://paramquest.vercel.app",
    mainEntity: { "@id": "https://paramquest.vercel.app/#person" },
    dateCreated: "2025-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://paramquest.vercel.app" },
        { "@type": "ListItem", position: 2, name: "About", item: "https://paramquest.vercel.app/about" },
        { "@type": "ListItem", position: 3, name: "Resume", item: "https://paramquest.vercel.app/resume" },
        { "@type": "ListItem", position: 4, name: "Press", item: "https://paramquest.vercel.app/press" },
        { "@type": "ListItem", position: 5, name: "Play", item: "https://paramquest.vercel.app/play" },
      ],
    },
  };

  // FAQPage schema — answers common questions AI/Search engines ask
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#speakable-summary", "#speakable-current", "#speakable-known-for"],
    },
    mainEntity: [
      {
        "@type": "Question",
        name: "Who is Param Minhas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Param Minhas is a founder, creative director, and growth operator based in Bengaluru, India. He has 15+ years of experience across e-commerce, AI, real estate, sneakers, music, and AI-native marketing. He currently runs Iterate (an AI-native marketing agency with a 90-person network) and Cats Can Dance (a culture platform). Previously, he was CEO at SoleSearch ($6M+ revenue), CMO at Fere.ai, and Partner at Good Capital.",
        },
      },
      {
        "@type": "Question",
        name: "What is Iterate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Iterate (hyperiterate.com) is an AI-native marketing agency founded by Param Minhas in January 2026. It has a 90-person network across strategy, creative, and engineering. Clients include ChargeZone, Noida International Airport, PickYourTrail, Billione, and Monkspace.",
        },
      },
      {
        "@type": "Question",
        name: "What is SoleSearch?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SoleSearch was India's leading sneaker, streetwear, and collectibles marketplace, co-founded by Param Minhas, Prabal Baghla, and Rannvijay Singha. It generated $6M+ in revenue, built a 350K+ community, raised $795K, held 30+ live events, and operated retail stores in Mumbai and Hyderabad. It was featured in VICE, CNBC-TV18, and Economic Times.",
        },
      },
      {
        "@type": "Question",
        name: "What is Param Minhas's contact information?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Param Minhas can be reached at minhas.param@gmail.com. His LinkedIn is linkedin.com/in/paramminhas. His agency website is hyperiterate.com and his culture brand is at catscandance.com.",
        },
      },
      {
        "@type": "Question",
        name: "What is Param Quest?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Param Quest is a playable portfolio RPG that tells 15 years of Param Minhas's career as a Pokemon-style game. Built with Next.js 15, TypeScript, Canvas 2D, and Web Audio API. It features 10 explorable zones, 9 gym leader battles, a full evolution system, and synthesized audio with zero audio files.",
        },
      },
    ],
  };

  return (
    <html lang="en" dir="ltr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://paramquest.vercel.app" />
        <link rel="author" href="/humans.txt" />
        <meta name="author" content="Param Minhas" />
        <meta name="citation_author" content="Param Minhas" />
        <meta name="citation_title" content="Param Minhas — Professional Portfolio" />
        <meta name="citation_publication_date" content="2025/01/01" />
        <meta name="citation_online_date" content="2026/07/01" />
        <meta name="citation_language" content="en" />
        <meta name="geo.region" content="IN-KA" />
        <meta name="geo.placename" content="Bengaluru" />
        <meta name="geo.position" content="12.9716;77.5946" />
        <meta name="ICBM" content="12.9716, 77.5946" />
        <meta name="format-detection" content="telephone=no" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
