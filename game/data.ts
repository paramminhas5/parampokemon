// Param Quest — career data as a Pokémon-style RPG.

export type Beat = "did" | "learned";
export type NpcKind =
  | "trainer-m" | "trainer-f" | "investor" | "engineer"
  | "celeb" | "client" | "fan" | "tenant" | "professor" | "mom" | "rival";
export type Dir = "up" | "down" | "left" | "right";

export type LeaderSprite =
  | "blankpage" | "longtail" | "zerorunway" | "prehype"
  | "termsheet" | "noculture" | "blackbox" | "nobrief" | "statusquo";

export type GameNpc = {
  x: number; y: number;
  name: string;
  role: string;
  quote?: string;
  beats?: string[];
  kind: NpcKind;
  beat: Beat;
  special?: "press-trigger" | "contact";
};
export type GameSign = { x: number; y: number; text: string; pressWall?: boolean };
export type GameBadge = { x: number; y: number; id: string; label: string; color: string };

export type Creature = {
  id: string;
  name: string;
  type: string;
  power: number;
  color: string;
  shape: "blob" | "spark" | "rhino" | "bird" | "cat" | "wisp" | "lynx" | "core";
  description: string;
  from: string;
};

export type Skill = {
  id: string;
  name: string;
  type: string;
  power: number;
  description: string;
  from: string;
};

/** A single battle move — used both for Mermander's base kit and skill berries. */
export type Move = {
  id: string;
  name: string;
  type: string;
  power: number;
  pp: number;          // max uses per battle
  accuracy: number;    // 0–100
  category: "physical" | "special" | "status";
  flavor: string;      // shown in battle log
  effect?: "crit" | "drain" | "buff";
};

export type Gym = {
  opponentName: string;
  opponentTitle: string;
  intro: string;
  hp: number;
  weakTo: string[];
  resists: string[];
  /** Full move set for the gym leader — 4 moves with real PP/power. */
  moves: Move[];
  victory: string;
  leader: LeaderSprite;
};

export type CliffNotes = {
  era: string;
  did: string[];
  learned: string[];
  metrics: { label: string; value: string }[];
};

export type ZoneTheme = {
  ground: "grass" | "sand" | "stone" | "neon" | "snow" | "dusk" | "night" | "mall" | "crypto" | "studio";
  accent: string;
  landmark: "bedroom" | "market" | "rentals" | "lab" | "tower" | "mall" | "trading" | "studio" | "agency" | "home";
};

export type Zone = {
  id: string;
  index: number;
  name: string;
  role: string;
  org: string;
  subtitle: string;
  years: string;
  outcome: string;
  bullets: string[];
  theme: ZoneTheme;
  w: number; h: number;
  ox: number; oy: number;
  building: { x: number; y: number; w: number; h: number; doorX: number; color: string; roof: string };
  sign: GameSign;
  badge: GameBadge;
  npcs: GameNpc[];
  pressWall?: { x: number; y: number };
  creature?: Creature;
  skill?: Skill;
  gym?: Gym;
  cliff: CliffNotes;
  spawn?: { x: number; y: number };
  hiddenItem?: { x: number; y: number };
};

// ─── Zones ─────────────────────────────────────────────────────
const Z: Omit<Zone, "ox" | "oy">[] = [
  {
    id: "home", index: 0, name: "Pallet Town", org: "Home", role: "The Beginning",
    subtitle: "Home · The Prologue",
    years: "Pre-2010",
    outcome: "Where the curiosity began.",
    bullets: ["Got Mermander from Professor", "Mom's blessing", "Walk south to begin"],
    theme: { ground: "grass", accent: "#9ad6e8", landmark: "home" },
    w: 26, h: 20,
    // Cozy cottage top-left with fenced garden; Prof lab top-right
    building: { x: 1, y: 2, w: 9, h: 6, doorX: 4, color: "#d0d8e8", roof: "#b0382c" },
    sign: { x: 16, y: 16, text: "PARAM QUEST\nA career told as an RPG.\n\nYou are a recruiter.\nWalk through it.\n\nARROWS/WASD to move\nTAP to walk there\nSPACE to talk\nMAP to jump anywhere" },
    badge: { x: 22, y: 8, id: "curiosity", label: "Starter Token", color: "#9ad6e8" },
    spawn: { x: 13, y: 14 },
    npcs: [
      { x: 5, y: 15, name: "Mom", role: "Pallet Town", kind: "mom", beat: "did",
        quote: "Param. You're leaving already?",
        beats: [
          "Param. You're leaving already?\n\nI knew this day was coming. You've had that look since you were nine years old — always building something, always asking what's next.",
          "Take care of yourself out there.\n\nAnd come home with something to show me.\n\nI'll be right here."
        ] },
      { x: 23, y: 4, name: "Prof. Iterate", role: "Pokémon Professor", kind: "professor", beat: "learned",
        quote: "Ah — Param. I've been waiting.",
        beats: [
          "Ah — Param. I've been waiting.\n\nYou're about to step into something big. Not just one world — ten of them. Each one a real chapter. A real challenge.",
          "Every world has a gym. A boss that represents something you'll actually have to face.\n\nYou'll know it when you get there.\n\nHere — take MERMANDER. He starts small. So does every good thing.",
          "One more thing.\n\nWhen you beat a gym, read the CliffNotes. That's where the lesson lives.\n\nAnd use WORLD SELECT to jump anywhere — the whole map is open. This isn't linear. Neither is the journey."
        ] },
      { x: 9, y: 17, name: "Rival", role: "Childhood Friend", kind: "rival", beat: "did",
        quote: "You're actually doing this.",
        beats: [
          "You're actually doing this.\n\nI keep thinking you'll pick one thing and stick with it. Like a normal person.\n\nBut no. You're going to walk through ten worlds, aren't you.",
          "Fine. Go on then.\n\nBut when you come back — when you've got something real to show — I want to hear every chapter.\n\nI'll be watching."
        ] },
      { x: 18, y: 14, name: "Neighbour Kid", role: "Pallet Town", kind: "fan", beat: "did",
        quote: "Are you really leaving?",
        beats: [
          "Are you really leaving?\n\nMy brother says you wrote your first line of code when you were nine.\n\nIs that actually true?",
          "I want to build something too someday.\n\nMaybe I'll follow you out there."
        ] },
    ],
    cliff: {
      era: "Bedroom · Pre-2010",
      did: ["Got starter creature Mermander", "Self-taught code, design, music"],
      learned: ["Curiosity compounds", "Shipping beats waiting"],
      metrics: [{ label: "AGE", value: "9→19" }, { label: "STACK", value: "code · design · music" }],
    },
  },
  {
    id: "origin", index: 1, name: "Origin Town", org: "Independent", role: "Builder · Designer · Musician",
    subtitle: "Pune · Builder",
    years: "Pre-2010",
    outcome: "Self-taught code, design, music. Shipped early.",
    bullets: ["First product at 19", "First company at 21", "Built before Indian tech had a scene"],
    theme: { ground: "sand", accent: "#f5b78a", landmark: "bedroom" },
    w: 26, h: 20,
    // Workshop sprawling left side, open workshop feel
    building: { x: 2, y: 3, w: 10, h: 7, doorX: 5, color: "#e6c47a", roof: "#7a4d28" },
    sign: { x: 20, y: 16, text: "ORIGIN TOWN\nBuilder. Designer. Music producer.\n\nFirst product: 19.\nFirst company: 21.\nBuilt before Indian tech had a scene." },
    badge: { x: 22, y: 15, id: "vision", label: "Vision Badge", color: "#f5b78a" },
    npcs: [
      { x: 4, y: 16, name: "Param", role: "Builder · Designer · Director", kind: "trainer-m", beat: "did",
        quote: "Builder, designer, creative director, music producer.\n\nFifteen years across e-commerce, real estate, AI, sneakers, music, and AI-led marketing.\n\nEvery chapter compounds." },
      { x: 20, y: 12, name: "The Throughline", role: "What ties it together", kind: "celeb", beat: "learned",
        beats: [
          "Every skill you pick up here carries over, Param. The code, the design, the music — none of it was wasted.",
          "The through-line was never the industry. It was always you — the operator who ships.\n\nKeep going. The compounding gets more interesting from here."
        ] },
      { x: 8, y: 8, name: "Old Classmate", role: "Origin Town", kind: "trainer-f", beat: "did",
        quote: "You were building websites and making music while the rest of us figured out what to study.\n\nNobody called it a career back then. You just called it Tuesday." },
      { x: 22, y: 3, name: "Hidden Sign", role: "Easter egg", kind: "fan", beat: "did",
        quote: "★ EASTER EGG ★\n\nYou found the hidden corner.\n\nHere's the recruiter TL;DR:\n\nHire him.\n\nparam@catscandance.com" },
    ],
    creature: { id: "spark", name: "Sparkling", type: "Vision", power: 14, color: "#f5b78a", shape: "spark",
      description: "The Blank Page's only minion. Born from doubt.", from: "origin" },
    skill: { id: "ship", name: "Ship It", type: "Vision", power: 18,
      description: "Turns ambiguity into a thing you can hold.", from: "origin" },
    gym: {
      opponentName: "The Blank Page",
      opponentTitle: "Origin Gym Leader",
      intro: "You want to build something where nothing was. Go on then. Make it.",
      hp: 60,
      weakTo: ["Vision", "Brand"],
      resists: [],
      moves: [
        { id: "doubt", name: "Creeping Doubt", type: "Ghost", power: 12, pp: 20, accuracy: 95, category: "special", flavor: "The cursor blinks. Nothing comes. Sound familiar?" },
        { id: "procrastinate", name: "Procrastinate", type: "Normal", power: 8, pp: 30, accuracy: 100, category: "status", flavor: "'Just one more day of planning...' You know this voice.", effect: "buff" },
        { id: "early", name: "Too Early", type: "Ghost", power: 18, pp: 15, accuracy: 90, category: "special", flavor: "Nobody's done this before. Maybe there's a reason — or maybe you're just first." },
        { id: "noone", name: "Nobody Cares", type: "Dark", power: 22, pp: 10, accuracy: 85, category: "special", flavor: "The market is indifferent. It always is, at first. Ship anyway." },
      ],
      victory: "You made the first thing. That's the hardest one. Now keep going.",
      leader: "blankpage",
    },
    hiddenItem: { x: 18, y: 14 },
    cliff: {
      era: "Pune · Pre-2010",
      did: ["First product at 19", "First company at 21"],
      learned: ["Build before there's a scene", "Hands-on across code, design, music"],
      metrics: [{ label: "BUILT", value: "Solo" }, { label: "SCENE", value: "None yet" }],
    },
  },
  {
    id: "grp", index: 2, name: "GRP Market", org: "GetRightPrice", role: "Founding Team Member",
    subtitle: "2011-12 · First Startup",
    years: "2011–2012",
    outcome: "India's first price-comparison engine. Angel-backed by Sidharth Rao (Webchutney).",
    bullets: ["Founding team, joined in college", "Angel-backed by Sidharth Rao (founder, Webchutney)", "Built the product catalog and crawl pipeline"],
    theme: { ground: "grass", accent: "#a8d39a", landmark: "market" },
    w: 26, h: 20,
    // Market building top-right, stalls and price tags left side
    building: { x: 15, y: 1, w: 9, h: 7, doorX: 4, color: "#a8d39a", roof: "#3f7a3a" },
    sign: { x: 5, y: 17, text: "GRP MARKET\nIndia's first price-comparison engine.\n\nFounding team · In college.\nAngel-backed by Sidharth Rao (Webchutney).\nBuilt the catalog + crawl pipeline." },
    badge: { x: 3, y: 15, id: "ship", label: "Search Badge", color: "#a8d39a" },
    npcs: [
      { x: 8, y: 16, name: "GetRightPrice", role: "Founding team · 2010", kind: "trainer-m", beat: "did",
        quote: "Founding team. In college. One of India's first price-comparison engines for electronics.\n\nAngel-backed by Sidharth Rao of Webchutney. You catalogued thousands of SKUs before most people here had smartphones." },
      { x: 23, y: 14, name: "First-Mover Lessons", role: "What it taught you", kind: "investor", beat: "learned",
        quote: "Cataloguing. Pricing logic. Affiliate models. Crawling inventory at scale.\n\nFirst proof you could ship something real — in college, with no playbook." },
      { x: 5, y: 9, name: "Sidharth Rao", role: "Angel · Webchutney", kind: "investor", beat: "did",
        quote: "I backed GetRightPrice because the team was already building before they had a cheque.\n\nThat's always the signal. You had it." },
      { x: 17, y: 5, name: "College Batchmate", role: "GRP Market", kind: "fan", beat: "did",
        quote: "We were in college when this launched.\n\nMost of us were figuring out internships.\n\nYou were building India's first price comparison engine." },
    ],
    creature: { id: "crawler", name: "Crawlix", type: "Search", power: 16, color: "#7ac46a", shape: "blob",
      description: "Long Tail's web crawler. Indexes pennies.", from: "grp" },
    skill: { id: "catalog", name: "Catalog Crawl", type: "Search", power: 22,
      description: "Indexes a market overnight.", from: "grp" },
    gym: {
      opponentName: "The Long Tail",
      opponentTitle: "GRP Gym Leader",
      intro: "Millions of SKUs. Pennies of margin. You think you can index all of it? Move.",
      hp: 70,
      weakTo: ["Search", "Vision"],
      resists: ["Brand"],
      moves: [
        { id: "sku", name: "SKU Flood", type: "Normal", power: 15, pp: 25, accuracy: 100, category: "special", flavor: "Millions of products. Which one matters to your user? Pick fast." },
        { id: "margin", name: "Thin Margins", type: "Steel", power: 20, pp: 15, accuracy: 95, category: "physical", flavor: "Affiliate economics squeeze hard. You feel that yet?" },
        { id: "crawl", name: "Crawl Rate", type: "Bug", power: 25, pp: 10, accuracy: 90, category: "special", flavor: "The pipeline backs up. Inventory goes stale. Can you keep up?" },
        { id: "affiliate", name: "Affiliate Zero", type: "Poison", power: 30, pp: 5, accuracy: 85, category: "special", flavor: "Commissions disappear overnight. Now what?", effect: "crit" },
      ],
      victory: "You found the signal in the noise. First product surfaced. First check cleared.",
      leader: "longtail",
    },
    hiddenItem: { x: 5, y: 11 },
    cliff: {
      era: "College · 2010",
      did: ["India's first price-comparison engine for electronics", "Angel-backed by Sidharth Rao (Webchutney)"],
      learned: ["Cataloguing, pricing logic, crawl pipelines", "Affiliate model economics"],
      metrics: [{ label: "ROLE", value: "Founding team" }, { label: "STAGE", value: "Angel" }],
    },
  },
  {
    id: "hab", index: 3, name: "Hab District", org: "Hab Housing", role: "Founder & CEO",
    subtitle: "2012-15 · Hospitality",
    years: "2012–2015",
    outcome: "$120K+ revenue. Bootstrapped. 16-person team across three cities.",
    bullets: ["One of India's first branded budget-hospitality startups", "$120K+ in revenue, fully bootstrapped", "Grew from sole founder to 16-person team across three cities", "The category OYO later scaled nationally"],
    theme: { ground: "stone", accent: "#f6a268", landmark: "rentals" },
    w: 26, h: 20,
    // Apartment block center-right, brick plants + fences left side
    building: { x: 16, y: 3, w: 8, h: 8, doorX: 3, color: "#c47833", roof: "#5a2c0c" },
    sign: { x: 3, y: 17, text: "HAB DISTRICT\nBudget rentals. Bengaluru.\n\nSame problem as OYO.\nNo VC money. ₹1Cr revenue.\nBootstrapped. Sold operations." },
    badge: { x: 3, y: 16, id: "ops", label: "Operator Badge", color: "#f6a268" },
    npcs: [
      { x: 7, y: 17, name: "Hab Housing", role: "Founder · 2012", kind: "trainer-m", beat: "did",
        quote: "You built one of India's first branded budget-hospitality startups — the category OYO later scaled nationally.\n\n$120K+ in revenue, fully bootstrapped. Grew from sole founder to a 16-person team across three cities." },
      { x: 22, y: 8, name: "What $120K Taught You", role: "Bootstrapping", kind: "tenant", beat: "learned",
        quote: "Operations, unit economics, acquisition, retention — without a safety net.\n\nEvery decision hit different when it was your own money on the line." },
      { x: 4, y: 9, name: "Former Tenant", role: "Hab District", kind: "tenant", beat: "did",
        quote: "Hab was the only budget place in Bengaluru that felt professional.\n\nClean rooms. Fair pricing. No nonsense. I lived there for 18 months." },
    ],
    creature: { id: "rhino", name: "Opsros", type: "Ops", power: 20, color: "#c47833", shape: "rhino",
      description: "Heavy. Reliable. Pays rent on time.", from: "hab" },
    skill: { id: "unitecon", name: "Unit Economics", type: "Ops", power: 26,
      description: "Makes every rupee earn its keep.", from: "hab" },
    gym: {
      opponentName: "Zero Runway",
      opponentTitle: "Hab Gym Leader",
      intro: "No fund. No safety net. You want to build a real business? Prove it — with your own money on the line.",
      hp: 80,
      weakTo: ["Ops", "Search"],
      resists: ["AI"],
      moves: [
        { id: "cashburn", name: "Cash Burn", type: "Fire", power: 18, pp: 20, accuracy: 100, category: "special", flavor: "Wait — there is no cash. The burn still happens. Feel that pressure?" },
        { id: "tenant", name: "Tenant Left", type: "Ghost", power: 22, pp: 15, accuracy: 90, category: "physical", flavor: "Three units vacant. Rent day is tomorrow. What's your move?" },
        { id: "margins", name: "Margin Squeeze", type: "Steel", power: 26, pp: 10, accuracy: 90, category: "special", flavor: "Real estate margins are unforgiving. You knew that going in." },
        { id: "runway", name: "Zero Runway", type: "Dark", power: 32, pp: 5, accuracy: 80, category: "special", flavor: "Build a real business or the lights go out. Your choice.", effect: "crit" },
      ],
      victory: "₹1Cr in. Operations sold. You understand what bootstrapped actually means now.",
      leader: "zerorunway",
    },
    hiddenItem: { x: 6, y: 12 },
    cliff: {
      era: "Pune · 2012-13",
      did: ["One of India's first branded budget-hospitality startups", "Scaled to $120K+ revenue, fully bootstrapped", "16-person team across three cities"],
      learned: ["Unit economics in real time", "Acquisition + retention without a fund"],
      metrics: [{ label: "REVENUE", value: "$120K+" }, { label: "CAPITAL", value: "Bootstrapped" }, { label: "TEAM", value: "16" }],
    },
  },
  {
    id: "ai", index: 4, name: "Quartic Lab", org: "Octo.ai", role: "Head of Growth",
    subtitle: "2016-17 · Conversational AI",
    years: "2016–2017",
    outcome: "Co-built one of India's first conversational AI platforms in 2013. Octo acquired by Quartic.ai.",
    bullets: ["Co-built with Akshaya Aron, backed by Good Capital", "Built AI products before 'AI' was a category", "Built and ran entire marketing function from scratch", "Rebuilt product dashboard end-to-end, working directly with engineering", "Director of Marketing at Quartic.ai post-acquisition"],
    theme: { ground: "neon", accent: "#9fe8ff", landmark: "lab" },
    w: 26, h: 20,
    // Server room far-left, neon pylon grid fills center; entry from right
    building: { x: 1, y: 1, w: 10, h: 8, doorX: 5, color: "#4a6e9a", roof: "#1f3548" },
    sign: { x: 20, y: 16, text: "QUARTIC LAB\nBuilt AI before it was a category.\n\nOne of India's first chatbots: 2013.\nCo-built Octo · Acquired by Quartic.ai\nDirector of Marketing post-acquisition." },
    badge: { x: 22, y: 7, id: "ai", label: "Conversation Badge", color: "#9fe8ff" },
    npcs: [
      { x: 5, y: 16, name: "Octo → Quartic", role: "Founding team · 2013", kind: "engineer", beat: "did",
        quote: "In 2013 you helped build one of India's first AI chatbots — before the word was common.\n\nOn top of that: Octo, an AI marketing platform. Acquired by Quartic.ai. You led marketing as Director." },
      { x: 21, y: 10, name: "Akshaya Aron", role: "Co-founder Octo · CEO Quartic.ai", kind: "trainer-f", beat: "did",
        quote: "We built Octo together.\n\nA decade later — we're back again at Fere.ai. Some collaborations are just meant to keep going." },
      { x: 7, y: 5, name: "Early Beta User", role: "Quartic Lab · 2013", kind: "client", beat: "did",
        quote: "That chatbot felt like magic in 2013.\n\nWe didn't even have a word for conversational AI yet.\n\nYou built it anyway." },
    ],
    creature: { id: "botto", name: "Bottoflux", type: "AI", power: 22, color: "#9fe8ff", shape: "spark",
      description: "Pre-Hype's chatbot. Talks back.", from: "ai" },
    skill: { id: "translate", name: "Translate Tech", type: "AI", power: 28,
      description: "Turns engineering into something humans buy.", from: "ai" },
    gym: {
      opponentName: "Pre-Hype Market",
      opponentTitle: "Quartic Gym Leader",
      intro: "Nobody's heard of chatbots. Or AI. Or you. You're going to sell it anyway? Good luck.",
      hp: 90,
      weakTo: ["AI", "Vision"],
      resists: ["Ops"],
      moves: [
        { id: "whatis", name: "What's a Chatbot?", type: "Normal", power: 15, pp: 25, accuracy: 100, category: "status", flavor: "Market confusion is real. Nobody searched for this. How do you explain what doesn't exist yet?" },
        { id: "early2", name: "Too Early Again", type: "Psychic", power: 22, pp: 15, accuracy: 95, category: "special", flavor: "You're ahead of the curve. The curve doesn't care about your timeline." },
        { id: "nosearch", name: "Zero Search Volume", type: "Ghost", power: 28, pp: 10, accuracy: 90, category: "special", flavor: "No SEO. No ads. No playbook. Pure missionary selling. Still want to?" },
        { id: "adoption", name: "Adoption Gap", type: "Ice", power: 35, pp: 5, accuracy: 85, category: "special", flavor: "Even great tech needs a bridge to humans. You're that bridge.", effect: "crit" },
      ],
      victory: "You sold the invisible. Octo acquired. Your direction is set — keep going.",
      leader: "prehype",
    },
    hiddenItem: { x: 20, y: 14 },
    cliff: {
      era: "2013-17 · AI before AI",
      did: ["One of India's first chatbots in 2013", "Co-built Octo (acquired by Quartic.ai)", "Led marketing as Director"],
      learned: ["Translating deep tech into adoption", "Closing the engineer ↔ buyer gap"],
      metrics: [{ label: "EXIT", value: "Acquired" }, { label: "ROLE", value: "Director" }],
    },
  },
  {
    id: "investopad", index: 5, name: "Investopad Tower", org: "Investopad → Good Capital", role: "VP Growth → Partner, Technology & Marketing",
    subtitle: "2017-20 · Family Office → Fund I",
    years: "2017–2020",
    outcome: "Helped build the fund from family office to Fund I. Portfolio: Meesho, Entri, Simsim, Amazon, Forbes.",
    bullets: [
      "Partner for Tech & Growth as family office evolved into institutional Fund I",
      "Sourcing, diligence, founder support for portfolio companies",
      "Portfolio includes Meesho (now one of India's largest e-commerce companies), Entri, Simsim, Amazon, Forbes",
    ],
    theme: { ground: "dusk", accent: "#f0c4ff", landmark: "tower" },
    w: 26, h: 20,
    // Tower center, trophy room right, marble floor left
    building: { x: 5, y: 1, w: 8, h: 10, doorX: 2, color: "#9a6fc4", roof: "#3f2266" },
    sign: { x: 22, y: 17, text: "INVESTOPAD → GOOD CAPITAL\nFamily office turned venture fund.\n\nPartner, Growth & Technology · 2017-2020.\nPortfolio: Meesho, Entri, Simsim, Amazon, Forbes." },
    badge: { x: 23, y: 16, id: "fund", label: "Capital Badge", color: "#f0c4ff" },
    npcs: [
      { x: 3, y: 15, name: "Investopad", role: "Growth & Tech Partner · Fund I", kind: "investor", beat: "did",
        quote: "Partner for Growth and Technology.\n\nHelped build Fund I — deal sourcing, portfolio analysis, founder relationships, growth strategy. You didn't write the cheques, but you were in the room while most of the portfolio raised theirs." },
      { x: 22, y: 12, name: "Portfolio", role: "Companies worked with", kind: "client", beat: "did",
        quote: "Meesho, Entri, Simsim, Amazon, Forbes.\n\nAcross growth, brand, and product strategy. The range is the point." },
      { x: 9, y: 7, name: "Rohan Malhotra", role: "Investopad · Family Office", kind: "investor", beat: "learned",
        beats: [
          "Being on this side of the table changes how you see everything, Param.",
          "You understand how investors think now. You understand how founders look from the other side of the room.\n\nThat's not something you can learn from a book."
        ] },
    ],
    creature: { id: "falcon", name: "Capitalcon", type: "Capital", power: 24, color: "#f0c4ff", shape: "bird",
      description: "Term Sheet's falcon. Spots deals at a thousand decks.", from: "investopad" },
    skill: { id: "dealflow", name: "Deal Flow", type: "Capital", power: 30,
      description: "Reads cap tables the way others read tweets.", from: "investopad" },
    gym: {
      opponentName: "Term Sheet",
      opponentTitle: "Investopad Gym Leader",
      intro: "You're on the other side of the table now. Defend your thesis. I'm listening.",
      hp: 100,
      weakTo: ["Capital", "Ops"],
      resists: ["Brand"],
      moves: [
        { id: "moat", name: "Where's the Moat?", type: "Steel", power: 20, pp: 20, accuracy: 100, category: "special", flavor: "Every investor's first question. What's yours? Have it ready." },
        { id: "whynow", name: "Why Now?", type: "Psychic", power: 25, pp: 15, accuracy: 95, category: "special", flavor: "Timing is everything. Prove that your timing is right." },
        { id: "cohort", name: "Show the Cohort", type: "Water", power: 30, pp: 10, accuracy: 90, category: "special", flavor: "Retention curves don't lie. Neither do unit economics. Show me yours." },
        { id: "dilution", name: "Dilution Threat", type: "Dark", power: 38, pp: 5, accuracy: 85, category: "special", flavor: "The cap table is a weapon in the wrong hands. Do you know your numbers?", effect: "crit" },
      ],
      victory: "Fund 0 stood up. Reputation built. You understand the other side of the table now.",
      leader: "termsheet",
    },
    hiddenItem: { x: 20, y: 14 },
    cliff: {
      era: "Post-Octo · Venture",
      did: ["Helped build Fund I from scratch", "Worked with Meesho, Entri, Simsim, Amazon, Forbes", "In the room while portfolio companies raised"],
      learned: ["The other side of the cap table", "Partnership dynamics + early-stage evaluation"],
      metrics: [{ label: "ROLE", value: "Partner" }, { label: "FUND", value: "I" }],
    },
  },
  {
    id: "sole", index: 6, name: "SoleSearch Mall", org: "SoleSearch", role: "Founder & CEO",
    subtitle: "2022-24 · Sneakers & Streetwear",
    years: "2022–Dec 2024",
    outcome: "$6M+ revenue. 350K+ community. $795K raised. 30+ events. Team of 40.",
    bullets: [
      "Founded SoleSearch; joined by Prabal Baghla and Rannvijay Singha. Led a team of 40.",
      "$795K raised from Venture Catalysts, Anthill Ventures, Cornerstone Ventures",
      "Three pillars: (1) collectibles marketplace, (2) aggregated e-commerce brands under one store, (3) events",
      "$6M+ in total revenue over four years, omnichannel retail in Mumbai & Hyderabad",
      "350,000+ follower community. SneakinOut — India's first sneaker convention format, 3 seasons with Swiggy SteppinOut",
      "Press: VICE, CNBC-TV18, Storyboard18, Economic Times, Open Magazine, The Established, Business of Fashion",
    ],
    theme: { ground: "mall", accent: "#ff9fd4", landmark: "mall" },
    w: 26, h: 20,
    // Mall building center-wide, neon arches flank; sneaker racks behind sign
    building: { x: 3, y: 2, w: 12, h: 6, doorX: 3, color: "#c0388c", roof: "#4a1240" },
    sign: { x: 20, y: 17, text: "SOLESEARCH MALL\nIndia's leading sneaker platform.\n\n$795K raised · 30+ events\n₹26Cr+ yearly sales\nRetail: Mumbai & Hyderabad · CNBC-TV18" },
    badge: { x: 23, y: 10, id: "ceo", label: "Culture Badge", color: "#ff9fd4" },
    npcs: [
      { x: 4, y: 17, name: "SoleSearch", role: "Co-founder & CEO · 2020-24", kind: "celeb", beat: "did",
        quote: "You co-founded India's leading sneaker and streetwear platform with Prabal Baghla. Rannvijay Singha came on board. $795K raised.\n\nStores in Mumbai and Hyderabad. CNBC-TV18 feature. ₹26Cr+ yearly sales." },
      { x: 22, y: 16, name: "Prabal Baghla", role: "Co-founder · SoleSearch", kind: "trainer-m", beat: "learned",
        quote: "We built the operations and retail presence together.\n\nMumbai, Hyderabad, 30+ events, ₹26Cr+ — and you ran it all as CEO. That's the job." },
      { x: 8, y: 8, name: "Sneakerhead", role: "SoleSearch Mall", kind: "fan", beat: "did",
        quote: "I've been to 12 SoleSearch events.\n\nThe first one was 40 people in a parking lot.\n\nThe last one had a queue around the block. You built that." },
      { x: 18, y: 13, name: "Rannvijay Singha", role: "Brand Partner · SoleSearch", kind: "celeb", beat: "did",
        quote: "I joined because it was real.\n\nNot another influencer deal — an actual platform building India's streetwear culture from the ground up." },
    ],
    pressWall: { x: 23, y: 14 },
    creature: { id: "lynx", name: "Sneakynx", type: "Brand", power: 26, color: "#ff9fd4", shape: "lynx",
      description: "No Culture's hype creature.", from: "sole" },
    skill: { id: "culture", name: "Build Culture", type: "Brand", power: 32,
      description: "Manufactures want from scratch.", from: "sole" },
    gym: {
      opponentName: "No Sneaker Culture",
      opponentTitle: "SoleSearch Gym Leader",
      intro: "India doesn't have sneaker culture. You're going to build it from nothing. Tell me why you think you can.",
      hp: 110,
      weakTo: ["Brand", "Capital"],
      resists: ["Search"],
      moves: [
        { id: "whocare", name: "Who Cares About a Shoe?", type: "Normal", power: 18, pp: 25, accuracy: 100, category: "status", flavor: "The Indian market doesn't get hype culture. You're going to change that? Go on." },
        { id: "nopress", name: "Press Won't Show", type: "Ghost", power: 24, pp: 15, accuracy: 95, category: "special", flavor: "Media only covers what already has momentum. You'll have to earn it." },
        { id: "auth", name: "Authentication Nightmare", type: "Poison", power: 30, pp: 10, accuracy: 90, category: "physical", flavor: "Fakes flood the market. Trust is everything. Can you protect it?" },
        { id: "hype", name: "Hype Dies", type: "Dark", power: 40, pp: 5, accuracy: 85, category: "special", flavor: "Culture is fragile. You'd better have something real underneath.", effect: "crit" },
      ],
      victory: "₹26cr+ sold. CNBC on the wall. You walked in when there was no culture and walked out with one.",
      leader: "noculture",
    },
    hiddenItem: { x: 21, y: 15 },
    cliff: {
      era: "2020-24 · Sneakers + Streetwear",
      did: ["$6M+ total revenue", "$795K raised", "350K+ community", "30+ live events including SneakinOut", "Retail in Mumbai & Hyderabad", "Led team of 40"],
      learned: ["How to manufacture cultural demand", "Press, ops, retail, drops — at once"],
      metrics: [{ label: "REVENUE", value: "$6M+" }, { label: "RAISED", value: "$795K" }, { label: "COMMUNITY", value: "350K+" }],
    },
  },
  {
    id: "fere", index: 7, name: "Fere District", org: "Fere.ai", role: "CMO",
    subtitle: "Jan 2025 · AI Agents",
    years: "Jan 2025",
    outcome: "CMO at autonomous AI agent platform. Rejoined Akshaya Aron. Funded by Ethereal Ventures.",
    bullets: [
      "Rejoined long-time collaborator Akshaya Aron",
      "Built growth and marketing function from scratch",
      "Restructured marketing to run lean — sustained by AI systems and small team",
      "Used operating model as proving ground for launching Iterate",
      "Funded by Ethereal Ventures",
    ],
    theme: { ground: "crypto", accent: "#00e8a0", landmark: "trading" },
    w: 26, h: 20,
    // Trading floor right side; candlestick forest left; sign bottom-center
    building: { x: 16, y: 2, w: 9, h: 7, doorX: 4, color: "#1a8c6e", roof: "#053d2c" },
    sign: { x: 3, y: 17, text: "FERE DISTRICT\nAutonomous AI agent platform.\n\nCMO · Rejoined Akshaya Aron.\nFunded by Ethereal Ventures.\nfereai.xyz" },
    badge: { x: 5, y: 9, id: "agent", label: "Autonomy Badge", color: "#00e8a0" },
    npcs: [
      { x: 8, y: 17, name: "Fere.ai", role: "CMO · 2024-25", kind: "engineer", beat: "did",
        quote: "CMO at Fere.ai — autonomous AI agent platform funded by Ethereal Ventures.\n\nRejoined long-time collaborator Akshaya Aron. Restructured marketing to run lean, sustained by AI systems.\n\nUsed this operating model as the proving ground for launching Iterate." },
      { x: 24, y: 15, name: "Full Circle", role: "What Fere taught you", kind: "investor", beat: "learned",
        beats: [
          "When agents act autonomously, you're not selling a product. You're building trust in something invisible.",
          "That's exactly what you figured out here.\n\nTrust before demo. Not the other way around."
        ] },
      { x: 4, y: 10, name: "Ethereal Ventures", role: "Lead Investor · Fere $1.3M", kind: "investor", beat: "did",
        quote: "We led the round because the team understood both sides — the AI and the user.\n\nThat combination is rarer than most people think." },
    ],
    creature: { id: "wisp", name: "Agentwisp", type: "Autonomy", power: 28, color: "#00e8a0", shape: "wisp",
      description: "Black Box's agent. Acts on its own.", from: "fere" },
    skill: { id: "trust", name: "Build Trust", type: "Autonomy", power: 34,
      description: "Sells the invisible.", from: "fere" },
    gym: {
      opponentName: "The Black Box",
      opponentTitle: "Fere Gym Leader",
      intro: "Your product acts on its own. People can't see it. They can't touch it. Can you make them trust it?",
      hp: 120,
      weakTo: ["Autonomy", "AI"],
      resists: ["Ops"],
      moves: [
        { id: "dashboard", name: "Show the Dashboard", type: "Electric", power: 20, pp: 25, accuracy: 100, category: "special", flavor: "Users demand visibility. The black box gives none. What do you show them?" },
        { id: "trustagent", name: "Trust an Agent?", type: "Ghost", power: 28, pp: 15, accuracy: 95, category: "special", flavor: "Giving control to AI is a leap of faith. You need to earn that leap." },
        { id: "cryptoloud", name: "Crypto is Loud", type: "Sound", power: 34, pp: 10, accuracy: 90, category: "special", flavor: "Every scam makes your legitimate work harder to see. Break through." },
        { id: "invisible", name: "The Invisible Product", type: "Psychic", power: 42, pp: 5, accuracy: 85, category: "special", flavor: "Marketing something nobody can touch. That's your challenge.", effect: "crit" },
      ],
      victory: "$1.3M raised. 10M+ actions live. You made people trust the invisible — that's rare.",
      leader: "blackbox",
    },
    hiddenItem: { x: 5, y: 15 },
    cliff: {
      era: "2024-25 · AI Agents",
      did: ["CMO at Fere.ai, funded by Ethereal Ventures", "Restructured marketing to run lean with AI systems", "Proving ground for launching Iterate", "Full-circle with Akshaya Aron"],
      learned: ["Marketing invisible/autonomous products", "Trust > demo"],
      metrics: [{ label: "ROLE", value: "CMO" }, { label: "BACKER", value: "Ethereal" }],
    },
  },
  {
    id: "ccd", index: 8, name: "Cats Can Dance", org: "Cats Can Dance", role: "Founder · Culture Platform",
    subtitle: "Mar 2026 – Present · Music, Fashion & Pet Care",
    years: "Mar 2026–Present",
    outcome: "Culture-discovery platform. Artist directory, event booking, music-production learning. Live show series pan-India w/ Impresario.",
    bullets: ["Designed and built a culture-discovery platform end-to-end", "Artist directory, event booking, music-production learning product", "Produced a series of live shows pan-India, in partnership with Impresario", "Launched under Iterate"],
    theme: { ground: "studio", accent: "#ffd29a", landmark: "studio" },
    w: 26, h: 20,
    // Studio building top-left, speakers and record player scattered right
    building: { x: 1, y: 1, w: 9, h: 7, doorX: 4, color: "#c47844", roof: "#5a2c10" },
    sign: { x: 20, y: 16, text: "CATS CAN DANCE\nMusic label · Pet-forward brand.\n\nOriginal music · Brand world · Live events.\nNo brief. No client.\nThe work that has to exist." },
    badge: { x: 22, y: 15, id: "soul", label: "Soul Badge", color: "#ffd29a" },
    npcs: [
      { x: 3, y: 16, name: "Cats Can Dance", role: "Music label · Pet brand", kind: "client", beat: "did",
        quote: "A music label and pet-forward brand. Original music, brand world, live events.\n\nNo brief. No client. This is the work that exists because it has to — not because someone commissioned it." },
      { x: 21, y: 11, name: "A cat", role: "Studio resident", kind: "fan", beat: "did",
        quote: "Mrrrp." },
      { x: 8, y: 16, name: "Music Fan", role: "CCD Live Event", kind: "fan", beat: "did",
        quote: "I discovered Cats Can Dance at a live show.\n\nMusic made without a brief sounds different.\n\nMore honest. You can tell nobody told them what to make." },
    ],
    creature: { id: "cat", name: "Discocat", type: "Soul", power: 22, color: "#ffd29a", shape: "cat",
      description: "No Brief's loyal cat. Dances unprompted.", from: "ccd" },
    skill: { id: "taste", name: "Taste", type: "Soul", power: 30,
      description: "Knows what's good before the data does.", from: "ccd" },
    gym: {
      opponentName: "No Brief",
      opponentTitle: "CCD Gym Leader",
      intro: "No client. No deck. No permission. Make something that has to exist — if you can explain why.",
      hp: 90,
      weakTo: ["Soul", "Brand"],
      resists: ["Capital"],
      moves: [
        { id: "kpi", name: "What's the KPI?", type: "Normal", power: 15, pp: 25, accuracy: 100, category: "status", flavor: "Creative work that can't be measured makes everyone nervous. Including you, maybe?" },
        { id: "whofor", name: "Who's It For?", type: "Psychic", power: 22, pp: 15, accuracy: 95, category: "special", flavor: "The eternal question for non-commercial work. Your answer should be honest." },
        { id: "roi", name: "What's the ROI?", type: "Steel", power: 28, pp: 10, accuracy: 90, category: "special", flavor: "Some things exist because they have to. No spreadsheet required — but you still need conviction." },
        { id: "brief", name: "No Brief Accepted", type: "Ghost", power: 35, pp: 5, accuracy: 85, category: "special", flavor: "The hardest boss: creating without permission. This one's yours to answer.", effect: "crit" },
      ],
      victory: "The work exists. That's your answer. That's the only answer that matters.",
      leader: "nobrief",
    },
    hiddenItem: { x: 19, y: 14 },
    cliff: {
      era: "2026–Present · Culture Platform",
      did: ["Culture-discovery platform end-to-end", "Artist directory, event booking, music-production learning", "Series of live shows pan-India w/ Impresario"],
      learned: ["Every commercial career needs a non-commercial home", "Soul work compounds"],
      metrics: [{ label: "LAUNCHED", value: "2026" }, { label: "PARTNERSHIP", value: "Impresario" }],
    },
  },
  {
    id: "iterate", index: 9, name: "Iterate HQ", org: "Iterate", role: "Founder & Creative Director",
    subtitle: "Jan 2026 – Present · AI-native Marketing",
    years: "Jan 2026–Present",
    outcome: "AI-native marketing agency. 90-person network. Clients: ChargeZone, Noida Airport, PickYourTrail, Billione, Monkspace.",
    bullets: ["Leads a 90-person network across strategy, creative, and engineering", "Clients: ChargeZone, Noida International Airport, PickYourTrail, Billione, Monkspace", "Launched Cats Can Dance — culture platform (music, fashion & pet care)", "Built on 15 years of operator instinct"],
    theme: { ground: "night", accent: "#7ce0ff", landmark: "agency" },
    w: 26, h: 20,
    // HQ building top-right with trophy wall; champion archway center; contact left
    building: { x: 15, y: 1, w: 10, h: 8, doorX: 4, color: "#4a8cc4", roof: "#1a3858" },
    sign: { x: 3, y: 17, text: "ITERATE HQ\nAI-native marketing agency.\n\n90-person network · hyperiterate.com\nClients: ChargeZone, Noida Airport,\nPickYourTrail, Billione, Monkspace." },
    badge: { x: 4, y: 15, id: "champion", label: "Champion Badge", color: "#7ce0ff" },
    npcs: [
      { x: 6, y: 17, name: "Iterate", role: "Founder & Creative Director · 2024–Present", kind: "engineer", beat: "did",
        quote: "AI-native marketing agency. Leads a 90-person network across strategy, creative, and engineering.\n\nClients include ChargeZone, Noida International Airport, PickYourTrail, Billione, and Monkspace.\n\nhyperiterate.com" },
      { x: 22, y: 15, name: "Work with us", role: "Founder partners only", kind: "trainer-m", beat: "did",
        quote: "We take a small number of founder partners per quarter.\n\nTalk to me: param@catscandance.com",
        special: "contact" },
      { x: 22, y: 9, name: "param@catscandance.com", role: "Email", kind: "celeb", beat: "did",
        quote: "Send me something interesting.\n\nparam@catscandance.com",
        special: "contact" },
      { x: 7, y: 12, name: "Former Client", role: "Iterate Partner", kind: "client", beat: "did",
        quote: "We hired Iterate for a three-month sprint.\n\nThey moved faster than our internal team and shipped things we'd been planning for a year.\n\nAI-native isn't a pitch — it's how they actually work." },
      { x: 12, y: 15, name: "Rival", role: "Old friend · Final chapter", kind: "rival", beat: "did",
        quote: "...I've been watching the whole time.\n\nEvery world. Every boss. Every industry switch.\n\nOkay fine. I'll say it:\n\nYou were right. The range is the point.\n\nAnd whoever's reading this — so were you for making it this far." },
    ],
    creature: { id: "core", name: "Iteratron", type: "Stack", power: 40, color: "#7ce0ff", shape: "core",
      description: "Status Quo's last defense. The system itself.", from: "iterate" },
    skill: { id: "stack", name: "Full Stack", type: "Stack", power: 50,
      description: "Brand · Growth · Tech · Taste, deployed at once.", from: "iterate" },
    gym: {
      opponentName: "The Status Quo",
      opponentTitle: "Champion",
      intro: "You walked this far. Every chapter, every boss, every badge. Now tell me — what are you going to do with all of it?",
      hp: 180,
      weakTo: ["Stack", "Soul", "Brand", "AI", "Autonomy", "Capital", "Ops", "Search", "Vision"],
      resists: [],
      moves: [
        { id: "pickone", name: "Pick One Lane", type: "Normal", power: 25, pp: 20, accuracy: 100, category: "status", flavor: "Specialists beat generalists — or so they say. You've been both. Use that." },
        { id: "notboth", name: "Strategy OR Execution", type: "Fighting", power: 35, pp: 15, accuracy: 95, category: "physical", flavor: "You can't do both. Or can you? Prove it." },
        { id: "agencies", name: "Agencies Don't Move Fast", type: "Ice", power: 45, pp: 10, accuracy: 90, category: "special", flavor: "The industry playbook says slow down. You've been ignoring it for 15 years." },
        { id: "statusquo", name: "Status Quo", type: "Dark", power: 60, pp: 5, accuracy: 85, category: "special", flavor: "The hardest opponent: the way things are. You've beaten it before. One more time.", effect: "crit" },
      ],
      victory: "Champion. Quest complete. Now — what are you building next? Bring it to Param.",
      leader: "statusquo",
    },
    hiddenItem: { x: 6, y: 10 },
    cliff: {
      era: "2024–Present · The Full Stack",
      did: ["AI-native marketing agency", "90-person network across strategy, creative, engineering", "Clients: ChargeZone, Noida Airport, PickYourTrail, Billione, Monkspace", "Launched Cats Can Dance under Iterate"],
      learned: ["The full stack as competitive advantage", "Speed × taste compounds"],
      metrics: [{ label: "NETWORK", value: "90" }, { label: "CLIENTS", value: "5+" }],
    },
  },
];

// ─── Horizontal zone layout ──────────────────────────────────────
// Non-linear 3-column zigzag world:
//   Col A (left x=3-13): home→origin→grp→fere→iterate
//   Col B (center x=23-33): origin route→ai→sole→ccd → iterate
//   Col C (right x=43-53): grp→investopad→sole→ccd → iterate
// Corridors connect adjacent columns at the zone boundary.
//
//   y=0..17  HOME (col A, ox=3)
//   y=19..38  ORIGIN (col A, ox=3)  -- east corridor → col B at world y=19..38
//   y=40..59  GRP (col A, ox=3)     -- east corridor → col B+col C at y=40..59
//   y=0..18   B-ROUTE-ORIGIN (col B, ox=23, placeholder)
//   y=19..38  AI (col B, ox=23)     -- west → col A at y=19..38; east → col C at y=19..38
//   y=40..59  B-ROUTE-SOLE (col B, ox=23, placeholder)
//   y=60..79  SOLE (col B, ox=23)   -- west → col A at y=60..79 (connects Fere)
//   y=81..100 CCD (col B, ox=23)    -- west → col A at y=81..100 (connects Iterate)
//   y=19..38  C-ROUTE-GRP (col C, ox=43, placeholder)
//   y=40..59  INVESTOPAD (col C, ox=43)  -- west → col B at y=40..59
//   y=60..79  C-ROUTE-SOLE (col C, ox=43, placeholder)
//   y=19..38  A-ROUTE-GRP (col A, ox=3, placeholder reuses GRP world y)
//   y=40..59  A-ROUTE-FERE (col A, ox=3, placeholder)
//   y=60..79  SOLE (col A, ox=3, connects with col B Sole)
//   y=81..100 FERE (col A, ox=3)
//   y=102..121 ITERATE (col A, ox=3)  -- east corridor → col B at y=102..121

const ZONE_LAYOUT: Record<string, { ox: number; oy: number }> = {};

// Single linear south-flowing layout.
// World is 80 tiles wide.  All zones centred at ox=27 (zone w=26 → right edge at 53).
// Each zone is 26 wide × 20 tall.  Routes between zones are 10 tiles tall.
// Zone N top = N * (20 + 10) = N * 30
const ZONE_W  = 26;
const ZONE_H  = 20;
const ROUTE_H = 10;   // tiles between zone bottom and next zone top
const ZONE_OX = 27;   // left edge of all zones in world tile coords

const ZONE_IDS_IN_ORDER = [
  "home","origin","grp","hab","ai","investopad","sole","fere","ccd","iterate"
];

ZONE_IDS_IN_ORDER.forEach((id, i) => {
  ZONE_LAYOUT[id] = { ox: ZONE_OX, oy: i * (ZONE_H + ROUTE_H) };
});

const ROUTE_GAP = 2;
let cursorY = 0;
export const ZONES: Zone[] = Z.map((z, i) => {
  const pos = ZONE_LAYOUT[z.id];
  const ox = pos?.ox ?? ZONE_OX;
  const oy = pos?.oy ?? cursorY;
  if (!pos) {
    cursorY += z.h + ROUTE_GAP;
  }
  // Override zone dimensions for new layout
  return { ...z, ox, oy, w: ZONE_W, h: ZONE_H };
});

export const WORLD_W = 80;
export const WORLD_H = ZONE_IDS_IN_ORDER.length * (ZONE_H + ROUTE_H) + ROUTE_H;

export const CONTACT = {
  email: "minhas.param@gmail.com",
  site: "https://catscandance.com",
  linkedin: "https://linkedin.com/in/paramminhas",
  twitter: "https://twitter.com/paramminhas",
  github: "https://github.com/paramminhas5",
  iterate: "https://hyperiterate.com",
  iterateWork: "https://preview--iterateblack.lovable.app/work",
  fere: "https://www.fereai.xyz/app",
  quartic: "https://www.quartic.ai",
  investopad: "https://wellfound.com/company/investopad/people",
  spotify: "https://open.spotify.com/artist/catscandance",
};

export const PRESS: { outlet: string; title: string; url: string }[] = [
  { outlet: "VICE", title: "Inside the Secret Lives of India's Gen Z Sneaker Resellers",
    url: "https://www.vice.com/en/article/india-genz-sneakerheads-sneaker-resellers-hype/" },
  { outlet: "CNBC-TV18", title: "Broadcast interview — Param Minhas & Prabal Baghla on India's sneaker culture",
    url: "https://in.linkedin.com/company/solesearch" },
  { outlet: "Images BoF", title: "Rapport x SoleSearch collaborative store in Hyderabad",
    url: "https://www.imagesbof.in/rapport-x-solesearch-collaborative-store-in-hyderabad-brings-best-of-streetwear-footwear/" },
  { outlet: "Storyboard18", title: "Sneaker Culture in India: Women buying as many sneakers as men, says SoleSearch's Param Minhas",
    url: "https://www.storyboard18.com/how-it-works/sneaker-culture-in-india-women-are-buying-as-many-sneakers-as-men-says-solesearchs-param-minhas-2518.htm" },
  { outlet: "Storyboard18", title: "Sneakers are now collectibles — Rannvijay Singha on SoleSearch funding",
    url: "https://www.storyboard18.com/brand-makers/sneakers-are-now-considered-collectibles-with-a-passionate-following-among-gen-z-and-millennials-rannvijay-singha-8232.htm" },
  { outlet: "Open Magazine", title: "Second Coming — India's pre-owned luxury & sneaker resale",
    url: "https://openthemagazine.com/feature/second-coming-2/" },
  { outlet: "The Established", title: "Can India's sneaker reseller business survive the global hype crash?",
    url: "https://www.theestablished.com/style/sneakers/can-indias-sneaker-reseller-business-survive-the-global-sneaker-hype-crash" },
  { outlet: "Economic Times", title: "SoleSearch raises Rs 6 crore in debut funding round",
    url: "https://in.linkedin.com/posts/solesearch_solesearch-raises-rs-6-crore-funding-from-activity-7060149811924131841-k78l" },
  { outlet: "Entrackr", title: "Street culture brand SoleSearch raises maiden fund",
    url: "https://entrackr.com/2023/05/street-culture-brand-solesearch-raises-maiden-fund/" },
  { outlet: "Indian Retailer", title: "SoleSearch Bags $730,000 in Debut Funding Round",
    url: "https://www.indianretailer.com/news/funding-alert-solesearch-bags-730000-debut-funding-round" },
];

export const KEY_PEOPLE: Record<string, { name: string; relevance: string }[]> = {
  grp: [
    { name: "Sidharth Rao", relevance: "Angel investor — founder of Webchutney (India's first digital agency)" },
  ],
  hab: [
    { name: "16-person team", relevance: "Grew from sole founder across three cities, bootstrapped" },
  ],
  ai: [
    { name: "Akshaya Aron", relevance: "Co-builder of Octo — decade-long collaborator" },
    { name: "Good Capital (Rohan & Arjun Malhotra)", relevance: "Backers of Octo" },
  ],
  investopad: [
    { name: "Rohan & Arjun Malhotra", relevance: "Built the fund together — family office to institutional Fund I" },
    { name: "Portfolio founders (Meesho, Entri, Simsim)", relevance: "Sourced, supported, and grew alongside" },
  ],
  sole: [
    { name: "Prabal Baghla", relevance: "Joined as co-founder — built retail ops and community together" },
    { name: "Rannvijay Singha", relevance: "Joined as co-founder & advisor — brought brand and cultural reach" },
    { name: "Venture Catalysts, Anthill, Cornerstone", relevance: "Led the $795K raise" },
  ],
  fere: [
    { name: "Akshaya Aron", relevance: "Reunited a decade after Octo — long-time collaborator and co-founder" },
    { name: "Ethereal Ventures", relevance: "Lead investor" },
  ],
  ccd: [
    { name: "Impresario (Social)", relevance: "Partnership for pan-India live show series" },
  ],
  iterate: [
    { name: "90-person network", relevance: "Strategy, creative, and engineering across all client work" },
    { name: "ChargeZone, Noida Airport, PickYourTrail, Billione, Monkspace", relevance: "Current clients" },
  ],
};

export const COMPANY_LINKS: Record<string, { url: string; label?: string }[]> = {
  investopad: [
    { url: "https://wellfound.com/company/investopad/people", label: "Wellfound" },
  ],
  hab: [
    { url: "https://tracxn.com/d/companies/hab-housing/__e1-Y8yk6fIQg8I52LcHihc_D17fv5S22nK1cO0xNuXA#about-the-company", label: "Tracxn Profile" },
  ],
  ai: [
    { url: "https://www.slideshare.net/slideshow/param-minhas-octo-marketing-deck/71004948", label: "Octo Marketing Deck" },
    { url: "https://www.slideshare.net/slideshow/param-minhas-project-alia/71004863", label: "Project Alia" },
    { url: "https://www.slideshare.net/slideshow/param-minhas-sales-presentation/71004651", label: "Octo Sales Deck — Meet Joe" },
    { url: "https://www.quartic.ai", label: "Quartic.ai" },
  ],
  fere: [
    { url: "https://www.fereai.xyz/app", label: "Fere.ai App" },
  ],
  ccd: [
    { url: "https://catscandance.com", label: "catscandance.com" },
  ],
  iterate: [
    { url: "https://hyperiterate.com", label: "hyperiterate.com" },
    { url: "https://preview--iterateblack.lovable.app/work", label: "Our Work" },
  ],
  sole: [
    { url: "https://www.vice.com/en/article/india-genz-sneakerheads-sneaker-resellers-hype/", label: "VICE Feature" },
    { url: "https://www.storyboard18.com/how-it-works/sneaker-culture-in-india-women-are-buying-as-many-sneakers-as-men-says-solesearchs-param-minhas-2518.htm", label: "Storyboard18 Interview" },
    { url: "https://in.linkedin.com/company/solesearch", label: "CNBC-TV18" },
    { url: "https://openthemagazine.com/feature/second-coming-2/", label: "Open Magazine" },
    { url: "https://www.theestablished.com/style/sneakers/can-indias-sneaker-reseller-business-survive-the-global-sneaker-hype-crash", label: "The Established" },
    { url: "https://entrackr.com/2023/05/street-culture-brand-solesearch-raises-maiden-fund/", label: "Entrackr" },
    { url: "https://www.indianretailer.com/news/funding-alert-solesearch-bags-730000-debut-funding-round", label: "Indian Retailer" },
  ],
};

// ─── Starter creature + base moves ────────────────────────────
export type StarterStage = {
  id: "mermander" | "mermalion" | "merlord";
  name: string;
  tag: string;
  minBadges: number;
  color: string;
  accent: string;
  hp: number;
  baseMoves: Move[];
};

export const STARTER_STAGES: StarterStage[] = [
  {
    id: "mermander", name: "Mermander", tag: "Builder · Stage 1", minBadges: 0,
    color: "#7ce0ff", accent: "#3a78d8", hp: 60,
    baseMoves: [
      { id: "tackle", name: "Ship It", type: "Vision", power: 20, pp: 35, accuracy: 100, category: "physical", flavor: "Just ship it. The simplest and hardest move." },
      { id: "watergun", name: "Water Gun", type: "Search", power: 28, pp: 25, accuracy: 100, category: "special", flavor: "Classic. Reliable. Mermander's bread and butter." },
      { id: "quickstrike", name: "First Mover", type: "Vision", power: 18, pp: 30, accuracy: 100, category: "physical", flavor: "Speed is a moat." },
      { id: "curiosity", name: "Curious Strike", type: "Normal", power: 15, pp: 40, accuracy: 100, category: "status", flavor: "What if we tried...?" },
    ],
  },
  {
    id: "mermalion", name: "Mermalion", tag: "Operator · Stage 2", minBadges: 4,
    color: "#f0c4ff", accent: "#9a6fc4", hp: 110,
    baseMoves: [
      { id: "ops", name: "Ops Crush", type: "Ops", power: 40, pp: 20, accuracy: 100, category: "physical", flavor: "Real operations, no safety net." },
      { id: "brand", name: "Brand Wave", type: "Brand", power: 45, pp: 15, accuracy: 100, category: "special", flavor: "Culture manufactured from scratch." },
      { id: "captial", name: "Capital Call", type: "Capital", power: 35, pp: 20, accuracy: 95, category: "special", flavor: "Defend the thesis." },
      { id: "surge", name: "Operator Surge", type: "Ops", power: 50, pp: 10, accuracy: 90, category: "physical", flavor: "Fifteen years of operator instinct deployed at once.", effect: "crit" },
    ],
  },
  {
    id: "merlord", name: "Merlord", tag: "Champion · Stage 3", minBadges: 8,
    color: "#ffd24a", accent: "#e8852a", hp: 180,
    baseMoves: [
      { id: "fullstack", name: "Full Stack", type: "Stack", power: 70, pp: 15, accuracy: 100, category: "special", flavor: "Brand · Growth · Tech · Taste, deployed at once." },
      { id: "autonomous", name: "Autonomous Agent", type: "Autonomy", power: 65, pp: 10, accuracy: 100, category: "special", flavor: "The product moves on its own." },
      { id: "soulwork", name: "Soul Work", type: "Soul", power: 60, pp: 15, accuracy: 100, category: "special", flavor: "What exists because it has to." },
      { id: "champion", name: "Champion's Roar", type: "Stack", power: 90, pp: 5, accuracy: 90, category: "special", flavor: "Every chapter compounds.", effect: "crit" },
    ],
  },
];

export function stageForBadges(badges: number): StarterStage {
  let s = STARTER_STAGES[0];
  for (const stage of STARTER_STAGES) if (badges >= stage.minBadges) s = stage;
  return s;
}

export const PLAYER_SPAWN = {
  x: ZONES[0].ox + (ZONES[0].spawn?.x ?? 10),
  y: ZONES[0].oy + (ZONES[0].spawn?.y ?? 10),
  dir: "down" as Dir,
};

export type InteractiveKind = "npc" | "sign" | "badge" | "door" | "mat" | "wild" | "hidden";
export type Interactive =
  | { kind: "npc"; zone: Zone; npc: GameNpc; x: number; y: number }
  | { kind: "sign"; zone: Zone; sign: GameSign; x: number; y: number }
  | { kind: "badge"; zone: Zone; badge: GameBadge; x: number; y: number }
  | { kind: "door"; zone: Zone; x: number; y: number }
  | { kind: "mat"; zone: Zone; x: number; y: number }
  | { kind: "wild"; zone: Zone; creature: Creature; x: number; y: number }
  | { kind: "hidden"; zone: Zone; x: number; y: number };

export function wildPositionFor(zone: Zone): { x: number; y: number } {
  // Place wild creature in lower-right quadrant of zone, away from building
  const x = zone.ox + Math.min(zone.w - 3, zone.building.x + zone.building.w + 2);
  const y = zone.oy + Math.min(zone.h - 3, zone.building.y + zone.building.h + 3);
  return { x, y };
}

// ─── Route NPCs (one per corridor between zones) ──────────────
// World coords: route mid-y = zone[i].oy + ZONE_H + ROUTE_H/2 = i*30 + 20 + 5 = i*30 + 25
// x = 40 (middle of the 6-tile path, PATH_X1=37..PATH_X2=43)
export type RouteNpc = { x: number; y: number; name: string; role: string; quote: string; kind: NpcKind; trainer?: { hp: number; moves: Move[]; weakTo: string[]; resists: string[]; victoryQuote: string; defeatQuote: string } };

export const ROUTE_NPCS: RouteNpc[] = [
  // Route 1: Home → Origin (y = 0*30 + 25 = 25)
  { x: 40, y: 25,
    name: "Wandering Kid", role: "Route 1 · Pallet → Origin",
    kind: "fan",
    quote: "You're leaving already?\n\nMost people stay home.\n\nThe ones who leave are the ones who build things.",
    trainer: {
      hp: 40,
      moves: [
        { id: "wk1", name: "Curiosity Dash", type: "Vision", power: 14, pp: 20, accuracy: 100, category: "physical", flavor: "Runs toward the unknown without looking back." },
        { id: "wk2", name: "Beginner's Luck", type: "Normal", power: 18, pp: 15, accuracy: 90, category: "special", flavor: "Startling. Unrepeatable. But real." },
      ],
      weakTo: ["Ops", "AI"],
      resists: [],
      victoryQuote: "You beat me — but you had to try. That's the whole point. Now keep going.",
      defeatQuote: "See? Even a kid on a route can surprise you. Stay sharp.",
    }
  },

  // Route 2: Origin → GRP (y = 1*30 + 25 = 55)
  { x: 40, y: 55,
    name: "Street Vendor", role: "Route 2 · Origin → GRP",
    kind: "client",
    quote: "I've been selling here for ten years.\n\nYou know what every good product has in common?\n\nSomebody had to believe in it before anyone else did.",
    trainer: {
      hp: 55,
      moves: [
        { id: "sv1", name: "Hard Sell", type: "Normal", power: 20, pp: 20, accuracy: 100, category: "physical", flavor: "Persistent. Direct. Doesn't take no." },
        { id: "sv2", name: "First-Mover Price", type: "Search", power: 25, pp: 15, accuracy: 95, category: "special", flavor: "Under-price the market. Build the habit. Then raise it." },
        { id: "sv3", name: "Repeat Customer", type: "Ops", power: 22, pp: 10, accuracy: 90, category: "special", flavor: "The real metric was always retention." },
      ],
      weakTo: ["Brand", "Capital"],
      resists: ["Normal"],
      victoryQuote: "You're a quick study. Good. The market rewards people who learn fast.",
      defeatQuote: "Ten years on this route. I've seen faster. Come back stronger.",
    }
  },

  // Route 3: GRP → Hab (y = 2*30 + 25 = 85)
  { x: 40, y: 85,
    name: "Early Adopter", role: "Route 3 · GRP → Hab",
    kind: "trainer-m",
    quote: "I was the 12th user of GetRightPrice.\n\nI still remember comparing prices for a Nokia phone.\n\nFirst-mover energy is real. You can feel it." },

  // Route 4: Hab → AI (y = 3*30 + 25 = 115)
  { x: 40, y: 115,
    name: "Bengaluru Tenant", role: "Route 4 · Hab → AI",
    kind: "tenant",
    quote: "Hab Housing was the only budget rental that didn't feel like a scam.\n\nStandardised. Clean. Reliable.\n\nSame problem as OYO. No VC money. Still worked." },

  // Route 5: AI → Investopad (y = 4*30 + 25 = 145)
  { x: 40, y: 145,
    name: "Tech Journalist", role: "Route 5 · AI → Investopad",
    kind: "celeb",
    quote: "I wrote about chatbots in 2013 and nobody read it.\n\nNow everyone's an AI expert.\n\nThe people who were early rarely get the credit." },

  // Route 6: Investopad → SoleSearch (y = 5*30 + 25 = 175)
  { x: 40, y: 175,
    name: "Angel Investor", role: "Route 6 · Investopad → Sole",
    kind: "investor",
    quote: "I've seen a thousand decks.\n\nThe ones that work all have the same thing:\n\nAn operator who's already done the hard thing once.",
    trainer: {
      hp: 70,
      moves: [
        { id: "ai1", name: "Due Diligence", type: "Capital", power: 28, pp: 15, accuracy: 100, category: "special", flavor: "Scrutiny is the process. Every question has a purpose." },
        { id: "ai2", name: "Dilution Play", type: "Psychic", power: 32, pp: 10, accuracy: 90, category: "special", flavor: "The cap table is a tool. Know how it works." },
        { id: "ai3", name: "Pattern Match", type: "Search", power: 25, pp: 15, accuracy: 95, category: "special", flavor: "I've seen this before. Have you?" },
      ],
      weakTo: ["Vision", "Ops"],
      resists: ["Normal", "Ghost"],
      victoryQuote: "You defended your thesis under pressure. That's what I needed to see. Go build something worth backing.",
      defeatQuote: "The deal flow doesn't stop because you lost one round. Come back with better numbers.",
    }
  },

  // Route 7: SoleSearch → Fere (y = 6*30 + 25 = 205)
  { x: 40, y: 205,
    name: "Sneaker Collector", role: "Route 7 · Sole → Fere",
    kind: "fan",
    quote: "I bought my first pair at a SoleSearch event.\n\nThere were 40 people there. Maybe 50.\n\nNow everyone acts like they were always into sneakers.",
    trainer: {
      hp: 60,
      moves: [
        { id: "sc1", name: "Hype Drop", type: "Brand", power: 26, pp: 15, accuracy: 100, category: "special", flavor: "Scarcity manufactured. Demand real." },
        { id: "sc2", name: "Culture Check", type: "Soul", power: 24, pp: 20, accuracy: 95, category: "special", flavor: "You either get culture or you don't. It shows." },
        { id: "sc3", name: "Resale Value", type: "Normal", power: 20, pp: 15, accuracy: 90, category: "physical", flavor: "Everything is an asset if you know what you're holding." },
      ],
      weakTo: ["Ops", "Search"],
      resists: ["Brand"],
      victoryQuote: "You know what you're doing. Rare. Come to the next SoleSearch event — on me.",
      defeatQuote: "The culture always wins. I've been in rooms where you couldn't fake it. This was one.",
    }
  },

  // Route 8: Fere → CCD (y = 7*30 + 25 = 235)
  { x: 40, y: 235,
    name: "Crypto Trader", role: "Route 8 · Fere → CCD",
    kind: "engineer",
    quote: "Autonomous agents are the next interface.\n\nMost people don't know what that means yet.\n\nFere figured it out early. That counts for something." },

  // Route 9: CCD → Iterate (y = 8*30 + 25 = 265)
  { x: 40, y: 265,
    name: "Music Producer", role: "Route 9 · CCD → Iterate",
    kind: "celeb",
    quote: "Cats Can Dance is doing something real.\n\nOriginal music. Brand world. Events.\n\nNo brief. That's the hardest kind of work there is." },

  // Easter egg: Old Fisher at the very end of the last route
  { x: 40, y: 278,
    name: "Old Fisher", role: "Somewhere between worlds",
    kind: "fan",
    quote: "I've been watching builders come through here for years.\n\nMost of them know one thing very well.\n\nThis one knows six things well. That's different.\n\nJust saying." },
];

export function allInteractives(): Interactive[] {
  const list: Interactive[] = [];
  for (const zone of ZONES) {
    for (const npc of zone.npcs) {
      list.push({ kind: "npc", zone, npc, x: zone.ox + npc.x, y: zone.oy + npc.y });
    }
    // Only push sign if it has real coordinates (sentinel -99,-99 = no sign)
    if (zone.sign.x !== -99 && zone.sign.y !== -99) {
      list.push({ kind: "sign", zone, sign: zone.sign, x: zone.ox + zone.sign.x, y: zone.oy + zone.sign.y });
    }
    list.push({ kind: "badge", zone, badge: zone.badge, x: zone.ox + zone.badge.x, y: zone.oy + zone.badge.y });
    // Press wall — adds a sign Interactive with pressWall:true so Game.tsx opens PressModal
    if (zone.pressWall) {
      const pwx = zone.ox + zone.pressWall.x;
      const pwy = zone.oy + zone.pressWall.y;
      const pressSign: GameSign & { pressWall?: boolean } = { x: zone.pressWall.x, y: zone.pressWall.y, text: "", pressWall: true };
      list.push({ kind: "sign", zone, sign: pressSign, x: pwx, y: pwy });
    }
    const dx = zone.ox + zone.building.x + zone.building.doorX;
    const dy = zone.oy + zone.building.y + zone.building.h - 1;
    list.push({ kind: "door", zone, x: dx, y: dy });
    list.push({ kind: "mat", zone, x: dx, y: dy + 1 });
    if (zone.creature) {
      const w = wildPositionFor(zone);
      list.push({ kind: "wild", zone, creature: zone.creature, x: w.x, y: w.y });
    }
    // Hidden item tile — invisible until stepped on
    if (zone.hiddenItem && zone.skill) {
      list.push({ kind: "hidden", zone, x: zone.ox + zone.hiddenItem.x, y: zone.oy + zone.hiddenItem.y });
    }
  }
  // Route NPCs — use home zone as the zone reference (nearest zone above each NPC)
  for (const rn of ROUTE_NPCS) {
    // Find the zone immediately above this route NPC
    let nearestZone = ZONES[0];
    for (const z of ZONES) { if (z.oy <= rn.y) nearestZone = z; }
    const syntheticNpc: GameNpc = {
      x: rn.x - nearestZone.ox,
      y: rn.y - nearestZone.oy,
      name: rn.name, role: rn.role, quote: rn.quote,
      kind: rn.kind, beat: "did",
    };
    list.push({ kind: "npc", zone: nearestZone, npc: syntheticNpc, x: rn.x, y: rn.y });
  }
  return list;
}

export function zoneAt(wx: number, wy: number): Zone | null {
  for (const z of ZONES) {
    if (wy >= z.oy && wy < z.oy + z.h && wx >= z.ox && wx < z.ox + z.w) return z;
  }
  let near: Zone | null = null;
  for (const z of ZONES) if (z.oy <= wy) near = z;
  return near;
}

/** All gyms are accessible — no sequential lock. Player can tackle any order. */
export function gymUnlocked(_zoneId: string, _badges: Set<string>): boolean {
  return true;
}
