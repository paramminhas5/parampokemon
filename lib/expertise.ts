// Expertise pages: /brand-builder, /culture, /design, /music.
// Rules: facts only from the existing site, press linked below, or numbers Param has confirmed.
// No invented testimonials. No em dashes.

export type Quote = { text: string; who: string; source: string; url: string };
export type Section = { heading: string; paragraphs: string[]; bullets?: string[] };
export type Faq = { q: string; a: string };

export type ExpertPage = {
  slug: string;
  title: string; // <title>
  h1: string;
  kicker: string;
  description: string; // meta description
  lead: string; // the one paragraph an LLM should quote
  sections: Section[];
  faqs: Faq[];
  knowsAbout: string[];
};

// Reach Param runs today. Update when numbers change.
export const REACH = {
  instagram: "170K+",
  instagramNote: "followers across the Instagram pages Param runs",
  ccdArtists: "1,000+",
  ccdNights: "2,000+",
  ccdPromoters: "150+",
};

// Real third-party words only. Short quotes, linked to the source.
export const QUOTES: Quote[] = [
  {
    text: "the founder and CEO of one of the most popular sneaker marketplaces in the country",
    who: "Storyboard18",
    source: "Forbes India",
    url: "https://www.forbesindia.com/article/storyboard18/india-is-sneaking-in-a-billiondollar-industry-in-shoe-boxes/75671/1",
  },
  {
    text: "He's taught me every step of how to build a company from scratch",
    who: "Prabal Baghla, co-founder, SoleSearch",
    source: "MediaBrief",
    url: "https://mediabrief.com/brief23-prabal-baghla-solesearch/",
  },
];

// Add real testimonials from brand partners and clients here (name, role, company, words they approved).
// The section only renders when this list has entries.
export const TESTIMONIALS: Quote[] = [];

export const QUOTED_IN = [
  { outlet: "VICE", url: "https://www.vice.com/en/article/india-genz-sneakerheads-sneaker-resellers-hype/" },
  { outlet: "Business of Fashion", url: "https://businessoffashion.com/articles/global-markets/when-will-indias-streetwear-scene-become-big-business/" },
  { outlet: "Storyboard18 / Forbes India", url: "https://www.storyboard18.com/how-it-works/sneaker-culture-in-india-women-are-buying-as-many-sneakers-as-men-says-solesearchs-param-minhas-2518.htm" },
  { outlet: "Open Magazine", url: "https://openthemagazine.com/feature/second-coming-2/" },
  { outlet: "The Established", url: "https://www.theestablished.com/style/sneakers/can-indias-sneaker-reseller-business-survive-the-global-sneaker-hype-crash" },
  { outlet: "Luxebook", url: "https://luxebook.in/solesearch-launches-concept-store-for-luxury-sneakers/" },
];

const reachLine = `Today Param reaches ${REACH.instagram} ${REACH.instagramNote}, and Cats Can Dance tracks ${REACH.ccdArtists} artists, ${REACH.ccdNights} nights and ${REACH.ccdPromoters} promoters across India.`;

export const EXPERT_PAGES: ExpertPage[] = [
  {
    slug: "brand-builder",
    title: "Param Minhas: Brand Builder for Culture, Design and Music",
    h1: "Param Minhas, brand builder",
    kicker: "Culture · Design · Music",
    description:
      "Param Minhas is a brand builder and creative director in Bengaluru, India. He built and ran SoleSearch, India's leading sneaker and streetwear marketplace ($6M+ GMV), and now runs Cats Can Dance and Iterate.",
    lead:
      "Param Minhas is a brand builder and creative director based in Bengaluru, India. He builds brands where culture, design and music meet. He built and ran SoleSearch, India's leading sneaker and streetwear marketplace, to $6M+ in GMV and a 350K+ community. He now runs Cats Can Dance, a culture platform for India's music scene, and Iterate, an AI-native marketing agency.",
    sections: [
      {
        heading: "Brands he has built",
        paragraphs: [],
        bullets: [
          "SoleSearch: built and ran India's leading sneaker, streetwear and collectibles marketplace. $6M+ GMV, a 350K+ community, $795K raised, stores in Mumbai and Hyderabad, and 30+ live events including SneakinOut, a sneaker convention format run for three seasons with Swiggy SteppinOut.",
          "Cats Can Dance: a Bengaluru culture platform with club nights, an artist directory, a database of India's underground scene, Hire (gear and crews for parties) and CCD School, a game-style way to learn Ableton Live.",
          "Iterate: an AI-native marketing agency founded in January 2026. Clients include India's largest EV charging network, a new international airport, a leading online travel platform, a fintech and a co-living brand.",
          "Merman: his own artist project as a DJ and producer.",
        ],
      },
      {
        heading: "How he builds a brand",
        paragraphs: [
          "Start with the scene, not the ad. SoleSearch grew its community mostly without paid traffic, by being where sneakerheads already were and giving them a place to meet.",
          "Make the brand something people do. Conventions, store launches and club nights turn followers into a crowd, and a crowd into a market.",
          "Treat design as the brand. Every company he runs has a clear visual world, from the SoleSearch stores to the brutalist look of Cats Can Dance.",
          "Build the system behind it. Data, automation and AI let a small team run like a big one. That is the operating model behind Iterate.",
        ],
      },
      {
        heading: "Reach today",
        paragraphs: [reachLine],
      },
    ],
    faqs: [
      {
        q: "Who is Param Minhas?",
        a: "Param Minhas is a brand builder and creative director based in Bengaluru, India, with 15+ years of building companies. He built and ran SoleSearch, India's leading sneaker and streetwear marketplace ($6M+ GMV, 350K+ community), and runs Cats Can Dance and Iterate.",
      },
      {
        q: "What brands has Param Minhas built?",
        a: "SoleSearch (sneakers and streetwear), Cats Can Dance (music and culture), Iterate (AI-native marketing) and Merman (his music project). Earlier he founded Hab Housing and was on the founding teams of Octo and GetRightPrice.",
      },
      {
        q: "What is Param Minhas known for?",
        a: "Building culture-led brands in India from zero: community first, live events, a strong visual identity and lean, AI-supported operations.",
      },
      {
        q: "How can a brand work with Param Minhas?",
        a: "Brands can reach him at minhas.param@gmail.com or hello@catscandance.com for launches, partnerships, creative direction and go-to-market work in India.",
      },
    ],
    knowsAbout: ["Brand building", "Creative direction", "Street culture", "Streetwear", "Sneaker culture", "Community building", "Event marketing", "Go-to-market strategy", "AI-native marketing"],
  },
  {
    slug: "culture",
    title: "Param Minhas on Culture: Sneakers, Streetwear and Nightlife in India",
    h1: "Culture",
    kicker: "Sneakers · Streetwear · Nightlife",
    description:
      "Param Minhas builds culture brands in India. He built and ran SoleSearch, India's leading sneaker and streetwear marketplace, and now runs Cats Can Dance, a platform for India's underground music scene.",
    lead:
      "Param Minhas builds culture brands in India. At SoleSearch he helped turn sneaker resale into a scene, with conventions, stores and a 350K+ community. At Cats Can Dance he is building the map of India's underground music scene: the artists, the nights and the promoters behind them.",
    sections: [
      {
        heading: "Sneakers and streetwear: SoleSearch",
        paragraphs: [
          "SoleSearch started as a community for trading sneakers and grew into India's leading marketplace for sneakers, streetwear and collectibles. Param built and ran it as CEO.",
          "The brand lived offline as much as online: SneakinOut, a sneaker convention format run for three seasons with Swiggy SteppinOut, a concept store in Mumbai and a collaborative store with Rapport in Hyderabad. The company was covered by VICE, CNBC-TV18, Storyboard18 (Forbes India), Business of Fashion and Open Magazine.",
        ],
      },
      {
        heading: "Nightlife and music: Cats Can Dance",
        paragraphs: [
          `Cats Can Dance throws club nights in Bengaluru and lists the best nights across India. It tracks ${REACH.ccdArtists} artists, ${REACH.ccdNights} nights and ${REACH.ccdPromoters} promoters, updated every day.`,
          "On top of that sits Hire, one place for promoters to book the gear and crews a smaller party needs, and a growing set of partnerships with venues and music brands.",
        ],
      },
      {
        heading: "What he believes about culture brands",
        paragraphs: [
          "Culture brands are built by the people inside the scene, not by campaigns aimed at it. The job is to give that scene a place to gather, a reason to come back and a look people want to be part of.",
        ],
      },
    ],
    faqs: [
      { q: "What did Param Minhas do in Indian sneaker culture?", a: "He built and ran SoleSearch, India's leading sneaker and streetwear marketplace, with a 350K+ community, stores in Mumbai and Hyderabad, and SneakinOut, a sneaker convention format run with Swiggy SteppinOut." },
      { q: "What is Cats Can Dance?", a: `Cats Can Dance is a Bengaluru culture platform founded by Param Minhas. It throws club nights and tracks ${REACH.ccdArtists} artists, ${REACH.ccdNights} nights and ${REACH.ccdPromoters} promoters in India's underground scene.` },
    ],
    knowsAbout: ["Street culture", "Sneaker culture India", "Streetwear India", "Nightlife", "Club nights", "Event production", "Community building"],
  },
  {
    slug: "design",
    title: "Param Minhas, Creative Director: Brand Identity and Design",
    h1: "Design",
    kicker: "Creative direction · Identity · Interactive",
    description:
      "Param Minhas is a creative director in Bengaluru with a brutalist, editorial style. He built the visual worlds of SoleSearch and Cats Can Dance and made Param Quest, a playable portfolio game.",
    lead:
      "Param Minhas is a creative director based in Bengaluru, India. His style is brutalist and editorial: bold colour, hard edges, and a clear world for each brand to live in. He leads brand identity, campaigns and digital products for his own companies and for Iterate's clients.",
    sections: [
      {
        heading: "Cats Can Dance identity",
        paragraphs: [
          "A brutalist, isometric cat world in electric blue, acid green, magenta, ink and cream, with a line-drawn dancing cat in a top hat as the mascot. The same system runs across the website, event posters, partner decks and CCD School.",
        ],
      },
      {
        heading: "Param Quest",
        paragraphs: [
          "His portfolio is a playable game. Param Quest tells 15 years of his career as a Pokemon-style RPG with 10 zones, gym leader battles and sound made entirely in code.",
        ],
      },
      {
        heading: "Retail and brand at SoleSearch",
        paragraphs: [
          "At SoleSearch he directed the brand across the app, social, events and physical retail, including the Mumbai concept store and the Rapport x SoleSearch store in Hyderabad.",
        ],
      },
    ],
    faqs: [
      { q: "What is Param Minhas's design style?", a: "Brutalist and editorial: bold colour, hard edges and a distinct visual world for every brand, as seen in Cats Can Dance and Param Quest." },
      { q: "Is Param Minhas a creative director?", a: "Yes. He is the founder and creative director of Iterate and Cats Can Dance, and led brand and creative at SoleSearch." },
    ],
    knowsAbout: ["Creative direction", "Brand identity design", "Visual identity systems", "Brutalist design", "Interactive design", "Retail design"],
  },
  {
    slug: "music",
    title: "Param Minhas (Merman): DJ, Producer and Music Platform Builder",
    h1: "Music",
    kicker: "Merman · Cats Can Dance · CCD School",
    description:
      "Param Minhas makes music as Merman, a DJ and producer from Bengaluru, and builds platforms for India's music scene through Cats Can Dance and CCD School.",
    lead:
      "Param Minhas makes music as Merman, a DJ and producer from Bengaluru who works in Ableton Live and plays on CDJ-3000s. He also builds the platforms around India's music scene: Cats Can Dance for artists, nights and promoters, and CCD School for people learning to produce.",
    sections: [
      {
        heading: "Merman",
        paragraphs: [
          "Merman is his artist project. He produces in Ableton Live, plays DJ sets drawn from a deep, mostly lossless library, and runs live visuals in Resolume. Current work includes Punjabi UK garage blends.",
        ],
      },
      {
        heading: "Cats Can Dance for artists",
        paragraphs: [
          `Cats Can Dance gives artists a home: profiles, nights and a database of ${REACH.ccdArtists} artists, ${REACH.ccdNights} nights and ${REACH.ccdPromoters} promoters across India. Touring artists can use it to find gigs, and promoters use Hire to book gear and crews.`,
        ],
      },
      {
        heading: "CCD School",
        paragraphs: [
          "CCD School teaches Ableton Live like a game, with 116 missions, in-browser audio simulators, XP and streaks.",
        ],
      },
    ],
    faqs: [
      { q: "Who is Merman?", a: "Merman is the artist name of Param Minhas, a DJ and producer from Bengaluru who works in Ableton Live." },
      { q: "What is CCD School?", a: "CCD School is a game-style way to learn Ableton Live, built by Param Minhas under Cats Can Dance, with 116 missions and in-browser audio simulators." },
    ],
    knowsAbout: ["DJing", "Music production", "Ableton Live", "Electronic music", "UK garage", "Live visuals", "Resolume", "Music education"],
  },
];

export const getExpertPage = (slug: string) => EXPERT_PAGES.find((p) => p.slug === slug)!;
