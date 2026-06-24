import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paramquest.vercel.app"),
  title: "Param Minhas — Builder · Designer · Creative Director | 15+ Years, $6M+ Revenue",
  description: "Founder of Iterate (AI-native marketing agency, 90-person network). 15+ years building across e-commerce, AI, sneakers, music. $6M+ revenue, 350K+ community, $795K raised. Previously CEO at SoleSearch, CMO at Fere.ai, Partner at Good Capital. Based in Bengaluru.",
  keywords: "Param Minhas, Iterate, AI-native marketing, creative director, growth marketing, GTM, SoleSearch, Fere.ai, Good Capital, Bengaluru, sneaker culture India, brand strategy, demand generation",
  authors: [{ name: "Param Minhas", url: "https://linkedin.com/in/paramminhas" }],
  creator: "Param Minhas",
  openGraph: {
    title: "Param Minhas — Builder · Designer · Creative Director",
    description: "15+ years building. $6M+ revenue. 350K+ community. Now running Iterate — an AI-native marketing agency with a 90-person network.",
    type: "website",
    url: "https://paramquest.vercel.app",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    siteName: "Param Quest",
  },
  twitter: {
    card: "summary_large_image",
    title: "Param Minhas — Builder · Designer · Creative Director",
    description: "15+ years building. $6M+ revenue. 350K+ community. AI-native marketing agency founder.",
    images: ["/og.png"],
    creator: "@paramminhas",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://paramquest.vercel.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1226",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Param Minhas",
    jobTitle: "Founder & Creative Director",
    description: "Builder, designer, and creative director with 15+ years across e-commerce, AI, real estate, sneakers, music, and AI-native marketing. $6M+ revenue generated, 350K+ community built, 90-person network led.",
    url: "https://paramquest.vercel.app",
    email: "minhas.param@gmail.com",
    address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
    worksFor: { "@type": "Organization", name: "Iterate", url: "https://hyperiterate.com", description: "AI-native marketing agency" },
    sameAs: [
      "https://linkedin.com/in/paramminhas",
      "https://github.com/paramminhas5",
      "https://twitter.com/paramminhas",
      "https://catscandance.com",
      "https://hyperiterate.com",
    ],
    knowsAbout: [
      "AI-native marketing", "Go-to-market strategy", "Brand strategy", "Creative direction",
      "Demand generation", "Community building", "Performance marketing", "Product strategy",
      "Conversational AI", "Full-stack development", "Next.js", "React",
      "Fundraising", "Team building", "Event marketing", "Sneaker culture",
    ],
    alumniOf: [
      { "@type": "Organization", name: "SoleSearch", description: "Sneaker & streetwear marketplace, $6M+ revenue" },
      { "@type": "Organization", name: "Fere.ai", description: "Autonomous AI agent platform" },
      { "@type": "Organization", name: "Good Capital", description: "Venture fund (portfolio: Meesho, Entri, Simsim)" },
      { "@type": "Organization", name: "Quartic.ai", description: "Enterprise AI platform" },
      { "@type": "Organization", name: "Octo", description: "Conversational AI platform, acquired by Quartic.ai" },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
