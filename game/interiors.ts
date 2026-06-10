// Interior maps for every zone building.
// Each interior is a 12-wide × 9-tall tile grid (indices from T).
// Row 0 = top wall, row 8 = bottom wall with exit door at col 5.
// NPCs are placed by { x, y } in interior-tile coords.

import { T, type TileCode } from "./tiles";
import type { NpcKind } from "./data";

export type InteriorNpc = {
  x: number; y: number;
  name: string; role: string; quote: string;
  kind: NpcKind;
};

export type Interior = {
  id: string;
  label: string;
  floor: TileCode;         // base floor tile
  tiles: TileCode[][];     // 9 rows × 12 cols — override spots (0 = use floor)
  npcs: InteriorNpc[];
  accentColor: string;
};

const W = 12;   // interior width in tiles
const H = 9;    // interior height in tiles

// Helper — build a blank interior grid (all 0 = use floor)
function blank(): TileCode[][] {
  return Array.from({ length: H }, () => new Array<TileCode>(W).fill(0));
}

// Place wall tiles along top + sides, exit door at bottom-center
function withWalls(tiles: TileCode[][], doorCol = 5): TileCode[][] {
  // Top wall
  for (let x = 0; x < W; x++) tiles[0][x] = T.BUILDING_WALL;
  // Left + right walls
  for (let y = 0; y < H; y++) {
    tiles[y][0] = T.BUILDING_WALL;
    tiles[y][W - 1] = T.BUILDING_WALL;
  }
  // Bottom wall with door gap
  for (let x = 0; x < W; x++) {
    tiles[H - 1][x] = x === doorCol ? T.DOOR : T.BUILDING_WALL;
  }
  return tiles;
}

// ─── HOME — Cozy bedroom ──────────────────────────────────────────────────
function makeHome(): Interior {
  const t = withWalls(blank());
  // Rug center
  t[3][4] = T.STUDIO_FLOOR; t[3][5] = T.STUDIO_FLOOR; t[3][6] = T.STUDIO_FLOOR;
  t[4][4] = T.STUDIO_FLOOR; t[4][5] = T.STUDIO_FLOOR; t[4][6] = T.STUDIO_FLOOR;
  // CRT desk top-left (server = glowing screen, the first computer)
  t[1][2] = T.BUILDING_WALL; // back shelf
  t[2][2] = T.PROP_SERVER;
  t[2][3] = T.PROP_SERVER;
  // Guitar / speaker top-right
  t[2][9] = T.PROP_SPEAKER;
  // Bed right side — two deckchair tiles side by side
  t[3][8] = T.PROP_DECKCHAIR;
  t[4][8] = T.PROP_DECKCHAIR;
  // Flower pot bottom-left
  t[6][2] = T.PROP_BRICK_PLANT;
  // Vinyl / book stack bottom-right
  t[6][9] = T.PROP_CART;
  return {
    id: "home",
    label: "Home — Param's Bedroom",
    floor: T.STUDIO_FLOOR,
    tiles: t,
    accentColor: "#9ad6e8",
    npcs: [
      // Mom stands at (5,6) — two tiles above the door at (5,8).
      // Player spawns at (5,6) so Mom is placed at (5,3) — visible and reachable.
      { x: 5, y: 3, name: "Mom", role: "Pallet Town",
        kind: "mom",
        quote: "This is where it all started, Param.\n\nLate nights, early mornings. Code on one screen, music on another.\n\nYou've been building since before you knew what to call it.\n\nNow go — the world's waiting." },
    ],
  };
}

// ─── ORIGIN TOWN — Builder's workshop ────────────────────────────────────
function makeOrigin(): Interior {
  const t = withWalls(blank());
  // Drafting tables
  t[2][3] = T.PROP_SERVER;  // computer / drafting tool
  t[2][4] = T.PROP_PRICETAG; // sketchbook / notes
  t[2][7] = T.PROP_SERVER;
  t[2][8] = T.PROP_PRICETAG;
  // Crates + market stalls (cart props)
  t[5][3] = T.PROP_CART;
  t[5][8] = T.PROP_CART;
  // Brick plants in corners
  t[4][2] = T.PROP_BRICK_PLANT;
  t[4][9] = T.PROP_BRICK_PLANT;
  // Open window shelf (prop rack)
  t[1][5] = T.BUILDING_WALL;
  t[1][6] = T.BUILDING_WALL;
  return {
    id: "origin",
    label: "Origin Workshop",
    floor: T.SAND,
    tiles: t,
    accentColor: "#f5b78a",
    npcs: [
      { x: 6, y: 3, name: "The Throughline", role: "Origin Town",
        kind: "celeb",
        quote: "First product at 19. First company at 21.\n\nBuilt before there was a scene.\n\nCode, design, music — all from this room." },
    ],
  };
}

// ─── GRP MARKET — Price comparison office ────────────────────────────────
function makeGrp(): Interior {
  const t = withWalls(blank());
  // Catalog shelves (rack props along top)
  t[2][2] = T.PROP_RACK;
  t[2][4] = T.PROP_RACK;
  t[2][6] = T.PROP_RACK;
  t[2][8] = T.PROP_RACK;
  // Price boards
  t[4][3] = T.PROP_PRICETAG;
  t[4][7] = T.PROP_PRICETAG;
  // Counter (server as workstation)
  t[5][5] = T.PROP_SERVER;
  // Cart with goods
  t[6][2] = T.PROP_CART;
  t[6][8] = T.PROP_CART;
  // Floor accents
  t[3][5] = T.FLOWER_Y;
  return {
    id: "grp",
    label: "GRP Market — Catalog Room",
    floor: T.GRASS,
    tiles: t,
    accentColor: "#a8d39a",
    npcs: [
      { x: 5, y: 4, name: "GetRightPrice", role: "First Startup · 2010",
        kind: "investor",
        quote: "India's first price comparison engine for electronics.\n\nAngel-backed. Built in college.\n\nThe catalog never lied — only the margins did." },
    ],
  };
}

// ─── HAB DISTRICT — Property management office ───────────────────────────
function makeHab(): Interior {
  const t = withWalls(blank());
  // Lease paper piles (pricetag)
  t[2][3] = T.PROP_PRICETAG;
  t[2][4] = T.PROP_PRICETAG;
  t[2][7] = T.PROP_PRICETAG;
  // Key hooks on wall (trophy = key board)
  t[1][8] = T.BUILDING_WALL;
  t[2][8] = T.PROP_TROPHY;
  // Brick plants in corners
  t[3][2] = T.PROP_BRICK_PLANT;
  t[6][9] = T.PROP_BRICK_PLANT;
  // Office desk
  t[4][5] = T.PROP_SERVER;
  // Waiting area deckchairs
  t[6][3] = T.PROP_DECKCHAIR;
  t[6][4] = T.PROP_DECKCHAIR;
  return {
    id: "hab",
    label: "Hab Housing — Property Office",
    floor: T.STONE,
    tiles: t,
    accentColor: "#f6a268",
    npcs: [
      { x: 5, y: 5, name: "Hab Housing", role: "Founder · 2012",
        kind: "tenant",
        quote: "Every tenant was a real person with a real problem.\n\nStandardised budget rentals — same problem as OYO.\nNo VC money. ₹1 crore revenue on operations alone." },
    ],
  };
}

// ─── QUARTIC LAB — AI server room ────────────────────────────────────────
function makeAi(): Interior {
  const t = withWalls(blank());
  // Server racks lining the walls
  t[2][2] = T.PROP_SERVER; t[2][3] = T.PROP_SERVER;
  t[2][7] = T.PROP_SERVER; t[2][8] = T.PROP_SERVER;
  t[3][2] = T.PROP_SERVER; t[3][3] = T.PROP_SERVER;
  t[3][7] = T.PROP_SERVER; t[3][8] = T.PROP_SERVER;
  // Neon pylons — glowing lab ambience
  t[5][2] = T.PROP_NEON_PYLON;
  t[5][9] = T.PROP_NEON_PYLON;
  // Terminal workstation
  t[4][5] = T.PROP_SERVER;
  t[4][6] = T.PROP_SERVER;
  // Floor: neon grid
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (t[y][x] === 0) t[y][x] = T.NEON_FLOOR;
    }
  }
  return {
    id: "ai",
    label: "Quartic Lab — Server Room",
    floor: T.NEON_FLOOR,
    tiles: t,
    accentColor: "#9fe8ff",
    npcs: [
      { x: 6, y: 5, name: "Octo → Quartic", role: "2013 · AI Before AI",
        kind: "engineer",
        quote: "One of India's first AI chatbots. 2013.\n\nWe didn't call it AI. We called it a conversation engine.\n\nOcto got acquired. The lab lives on." },
    ],
  };
}

// ─── INVESTOPAD TOWER — VC boardroom ─────────────────────────────────────
function makeInvestopad(): Interior {
  const t = withWalls(blank());
  // Long conference table (server props in a row)
  t[3][3] = T.PROP_SERVER; t[3][4] = T.PROP_SERVER;
  t[3][5] = T.PROP_SERVER; t[3][6] = T.PROP_SERVER;
  t[3][7] = T.PROP_SERVER; t[3][8] = T.PROP_SERVER;
  // Trophy shelf (right wall)
  t[2][9] = T.PROP_TROPHY;
  t[4][9] = T.PROP_TROPHY;
  t[6][9] = T.PROP_TROPHY;
  // Whiteboard / pricetag wall
  t[2][2] = T.PROP_PRICETAG;
  t[2][3] = T.PROP_PRICETAG;
  // Neon pylon — dusk ambience
  t[5][2] = T.PROP_NEON_PYLON;
  // Deckchairs around table
  t[5][4] = T.PROP_DECKCHAIR; t[5][6] = T.PROP_DECKCHAIR;
  // Marble dusk floor
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (t[y][x] === 0) t[y][x] = T.DUSK_FLOOR;
    }
  }
  return {
    id: "investopad",
    label: "Investopad — Boardroom",
    floor: T.DUSK_FLOOR,
    tiles: t,
    accentColor: "#f0c4ff",
    npcs: [
      { x: 5, y: 5, name: "Investopad", role: "Partner · Growth & Tech",
        kind: "investor",
        quote: "I didn't write the cheques.\n\nBut I was in the room while most of our portfolio companies raised theirs.\n\nMeesho, Entri, Simsim, Amazon, Forbes." },
    ],
  };
}

// ─── SOLESEARCH MALL — Store back room ───────────────────────────────────
function makeSole(): Interior {
  const t = withWalls(blank());
  // Sneaker racks all along top wall
  t[2][2] = T.PROP_RACK; t[2][3] = T.PROP_RACK;
  t[2][5] = T.PROP_RACK; t[2][6] = T.PROP_RACK;
  t[2][8] = T.PROP_RACK; t[2][9] = T.PROP_RACK;
  // Display plinth (server)
  t[4][5] = T.PROP_SERVER;
  // Box stacks (cart props)
  t[4][2] = T.PROP_CART;
  t[4][9] = T.PROP_CART;
  // Neon pylon — pink ambience
  t[5][2] = T.PROP_NEON_PYLON;
  t[5][9] = T.PROP_NEON_PYLON;
  // Price tags
  t[6][4] = T.PROP_PRICETAG;
  t[6][7] = T.PROP_PRICETAG;
  // Mall floor throughout
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (t[y][x] === 0) t[y][x] = T.MALL_FLOOR;
    }
  }
  return {
    id: "sole",
    label: "SoleSearch — Store Back",
    floor: T.MALL_FLOOR,
    tiles: t,
    accentColor: "#ff9fd4",
    npcs: [
      { x: 5, y: 5, name: "SoleSearch", role: "Co-founder & CEO · 2020-24",
        kind: "celeb",
        quote: "₹26cr+ in annual sales.\n30+ live events. Retail in Mumbai and Hyderabad.\nCNBC-TV18 called it India's sneaker moment.\n\nWe built the culture first. The sales followed." },
    ],
  };
}

// ─── FERE DISTRICT — Crypto trading floor ────────────────────────────────
function makeFere(): Interior {
  const t = withWalls(blank());
  // Candlestick chart terminals
  t[2][2] = T.PROP_CANDLESTICK; t[2][3] = T.PROP_CANDLESTICK;
  t[2][6] = T.PROP_CANDLESTICK; t[2][7] = T.PROP_CANDLESTICK;
  // Agent terminals
  t[3][4] = T.PROP_SERVER;
  t[3][5] = T.PROP_SERVER;
  t[3][7] = T.PROP_SERVER;
  t[3][8] = T.PROP_SERVER;
  // Neon pylons
  t[5][2] = T.PROP_NEON_PYLON;
  t[5][9] = T.PROP_NEON_PYLON;
  // Crypto floor throughout
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (t[y][x] === 0) t[y][x] = T.CRYPTO_FLOOR;
    }
  }
  return {
    id: "fere",
    label: "Fere.ai — Trading Floor",
    floor: T.CRYPTO_FLOOR,
    tiles: t,
    accentColor: "#00e8a0",
    npcs: [
      { x: 5, y: 5, name: "Fere.ai", role: "Head of Growth · 2024-25",
        kind: "engineer",
        quote: "Autonomous AI agents for financial markets.\n\n$1.3M raised. 10M+ actions live at launch.\n\nFull circle — back with Akshaya, a decade later." },
    ],
  };
}

// ─── CATS CAN DANCE — Recording studio ───────────────────────────────────
function makeCcd(): Interior {
  const t = withWalls(blank());
  // Mixing desk (server props)
  t[2][4] = T.PROP_SERVER;
  t[2][5] = T.PROP_SERVER;
  t[2][6] = T.PROP_SERVER;
  // Speakers flanking
  t[2][2] = T.PROP_SPEAKER;
  t[2][9] = T.PROP_SPEAKER;
  t[4][2] = T.PROP_SPEAKER;
  t[4][9] = T.PROP_SPEAKER;
  // Vinyl record stacks (cart)
  t[5][3] = T.PROP_CART;
  t[5][8] = T.PROP_CART;
  // Deckchair — listening couch
  t[6][5] = T.PROP_DECKCHAIR;
  t[6][6] = T.PROP_DECKCHAIR;
  // Brick plant in corner (different corner — don't overwrite speaker at [4][2])
  t[3][2] = T.PROP_BRICK_PLANT;
  // Studio floor throughout
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (t[y][x] === 0) t[y][x] = T.STUDIO_FLOOR;
    }
  }
  return {
    id: "ccd",
    label: "Cats Can Dance — Studio",
    floor: T.STUDIO_FLOOR,
    tiles: t,
    accentColor: "#ffd29a",
    npcs: [
      { x: 6, y: 4, name: "A Cat", role: "Studio Resident",
        kind: "fan",
        quote: "Mrrrp.\n\n( The cat stares at you with complete authority. )\n\n( Behind it: original music. Pet-forward brand. Live events. )\n( No brief. No client. Just the work that has to exist. )" },
    ],
  };
}

// ─── ITERATE HQ — Agency headquarters ────────────────────────────────────
function makeIterate(): Interior {
  const t = withWalls(blank());
  // Strategy boards (pricetag = whiteboard)
  t[2][2] = T.PROP_PRICETAG;
  t[2][3] = T.PROP_PRICETAG;
  t[2][7] = T.PROP_PRICETAG;
  t[2][8] = T.PROP_PRICETAG;
  // Trophy wall (right side)
  t[2][9] = T.PROP_TROPHY;
  t[4][9] = T.PROP_TROPHY;
  t[6][9] = T.PROP_TROPHY;
  // Big desk (server row)
  t[3][4] = T.PROP_SERVER;
  t[3][5] = T.PROP_SERVER;
  t[3][6] = T.PROP_SERVER;
  // Neon pylons — agency vibe
  t[5][2] = T.PROP_NEON_PYLON;
  // Deckchair (thinking chair)
  t[6][4] = T.PROP_DECKCHAIR;
  // Night floor throughout
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (t[y][x] === 0) t[y][x] = T.NIGHT_FLOOR;
    }
  }
  return {
    id: "iterate",
    label: "Iterate HQ — Agency",
    floor: T.NIGHT_FLOOR,
    tiles: t,
    accentColor: "#7ce0ff",
    npcs: [
      { x: 5, y: 4, name: "Iterate", role: "Founder · AI-native Agency",
        kind: "trainer-m",
        quote: "AI-native marketing agency.\n\nThe full stack — strategy, creative, growth — rebuilt for the AI era.\n\nThis is the chapter being written right now." },
    ],
  };
}

// ─── Registry ─────────────────────────────────────────────────────────────
export const INTERIORS: Record<string, Interior> = {
  home:       makeHome(),
  origin:     makeOrigin(),
  grp:        makeGrp(),
  hab:        makeHab(),
  ai:         makeAi(),
  investopad: makeInvestopad(),
  sole:       makeSole(),
  fere:       makeFere(),
  ccd:        makeCcd(),
  iterate:    makeIterate(),
};

export const INTERIOR_W = W;
export const INTERIOR_H = H;
// Exit door is always at bottom row, col 5
export const INTERIOR_EXIT_X = 5;
export const INTERIOR_EXIT_Y = H - 1;
