import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Param Quest — A portfolio you can walk through",
  description: "Fifteen years of building across e-commerce, AI, real estate, sneakers and music — told as a Pokémon-style RPG. $795K raised, ₹26cr+ sales, AI since 2013.",
  openGraph: {
    title: "Param Quest — Play the portfolio",
    description: "Builder. Designer. Director. Fifteen years compressed into one game.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Param Quest",
    description: "A playable portfolio. Walk through 15 years of building.",
    images: ["/og.png"],
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
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
