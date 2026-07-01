import type { Metadata } from "next";
import { GameBoot } from "@/components/game/GameBoot";
import { Game } from "@/components/game/Game";
import { PlayBodyClass } from "@/components/game/PlayBodyClass";

export const metadata: Metadata = {
  title: "Play Param Quest — A Playable Portfolio RPG by Param Minhas",
  description: "Play Param Quest — a full Pokemon-style RPG that tells 15 years of Param Minhas's career. 10 explorable zones, 9 gym leader battles, full evolution system, synthesized audio. Built with Next.js, TypeScript, Canvas 2D, and Web Audio API. No downloads needed — play instantly in your browser.",
  keywords: [
    "Param Quest", "playable portfolio", "portfolio RPG", "Pokemon-style game",
    "interactive resume", "career game", "indie game", "browser RPG",
    "Param Minhas game", "Next.js game", "Canvas 2D game",
    "creative portfolio", "developer portfolio game", "gamified resume",
    "pixel art RPG", "web game", "TypeScript game",
  ],
  alternates: {
    canonical: "https://paramquest.vercel.app/play",
  },
  openGraph: {
    title: "Play Param Quest — Playable Portfolio RPG",
    description: "15 years of career told as a Pokemon-style game. 10 zones. 9 gym battles. Full battle system. Play now in your browser.",
    type: "website",
    url: "https://paramquest.vercel.app/play",
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Param Quest — Playable Portfolio RPG",
    description: "Walk through 15 years of building. 10 worlds. 9 gym battles. Full Pokemon-style RPG in your browser.",
    creator: "@paramminhas",
  },
};

export default function PlayPage() {
  const videoGameJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Param Quest",
    alternateName: "Param Minhas Playable Portfolio",
    description: "A playable portfolio RPG — 15 years of Param Minhas's career told as a premium indie Pokemon-style game. 10 explorable zones, 9 gym leader battles, full evolution system, and synthesized audio.",
    url: "https://paramquest.vercel.app/play",
    image: "https://paramquest.vercel.app/play/opengraph-image",
    author: { "@type": "Person", name: "Param Minhas", url: "https://paramquest.vercel.app" },
    genre: ["RPG", "Indie", "Portfolio", "Educational"],
    gamePlatform: ["Web Browser", "Desktop", "Mobile"],
    applicationCategory: "Game",
    operatingSystem: "Any (Web Browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    playMode: "SinglePlayer",
    numberOfPlayers: { "@type": "QuantitativeValue", value: 1 },
    gameItem: [
      { "@type": "Thing", name: "Mermander", description: "Starter creature — evolves into Mermalion and Merlord" },
      { "@type": "Thing", name: "9 Gym Badges", description: "Earned by defeating gym leaders representing real career challenges" },
    ],
    aggregateRating: undefined,
    datePublished: "2025-01-01",
    inLanguage: "en",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://paramquest.vercel.app" },
      { "@type": "ListItem", position: 2, name: "Play", item: "https://paramquest.vercel.app/play" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoGameJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PlayBodyClass />
      <GameBoot>
        <Game />
      </GameBoot>
    </>
  );
}
