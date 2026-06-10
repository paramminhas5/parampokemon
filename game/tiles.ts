// Procedural tile + sprite drawing for Param Quest.

import type { Dir, NpcKind, ZoneTheme } from "./data";

export const TILE = 16;

export const T = {
  EMPTY: 0,
  GRASS: 1,
  GRASS_DARK: 2,
  PATH: 3,
  SAND: 4,
  STONE: 5,
  WATER: 6,
  FLOWER_R: 7,
  FLOWER_Y: 8,
  TREE: 9,
  FENCE: 10,
  BUILDING_WALL: 11,
  BUILDING_ROOF: 12,
  DOOR: 13,
  SIGN: 14,
  BADGE: 15,
  TALL_GRASS: 16,
  NEON_FLOOR: 17,
  DUSK_FLOOR: 18,
  NIGHT_FLOOR: 19,
  MALL_FLOOR: 20,
  CRYPTO_FLOOR: 21,
  STUDIO_FLOOR: 22,
  SNOW: 23,
  ROUTE_GRASS: 24,
  MAT: 25,
  ARCH_L: 26,
  ARCH_M: 27,
  ARCH_R: 28,
  PROP_SERVER: 29,
  PROP_RACK: 30,
  PROP_SPEAKER: 31,
  PROP_PRICETAG: 32,
  PROP_BRICK_PLANT: 33,
  PROP_NEON_PYLON: 34,
  PROP_CANDLESTICK: 35,
  PROP_TROPHY: 36,
  PROP_CART: 37,
  PROP_DECKCHAIR: 38,
  WARPPAD: 39,
  TREE_TALL: 40,
} as const;
export type TileCode = number;

export const SOLID = new Set<TileCode>([
  T.TREE, T.TREE_TALL, T.FENCE, T.WATER, T.BUILDING_WALL, T.BUILDING_ROOF, T.SIGN,
  T.ARCH_L, T.ARCH_R, T.PROP_SERVER, T.PROP_RACK, T.PROP_SPEAKER,
  T.PROP_PRICETAG, T.PROP_BRICK_PLANT, T.PROP_NEON_PYLON, T.PROP_CANDLESTICK,
  T.PROP_TROPHY, T.PROP_CART, T.PROP_DECKCHAIR,
]);

export function groundTileFor(theme: ZoneTheme["ground"]): TileCode {
  switch (theme) {
    case "grass": return T.GRASS;
    case "sand": return T.SAND;
    case "stone": return T.STONE;
    case "neon": return T.NEON_FLOOR;
    case "dusk": return T.DUSK_FLOOR;
    case "night": return T.NIGHT_FLOOR;
    case "mall": return T.MALL_FLOOR;
    case "crypto": return T.CRYPTO_FLOOR;
    case "studio": return T.STUDIO_FLOOR;
    case "snow": return T.SNOW;
    default: return T.GRASS;
  }
}

function n(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

type Ctx = CanvasRenderingContext2D;

function fillRect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
}
function px(ctx: Ctx, x: number, y: number, color: string) {
  ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1);
}

export function drawTile(ctx: Ctx, code: TileCode, wx: number, wy: number, px0: number, py0: number, now: number = 0) {
  const r = n(wx, wy);
  switch (code) {
    case T.GRASS: {
      fillRect(ctx, px0, py0, TILE, TILE, "#5fb255");
      for (let i = 0; i < 5; i++) {
        const dx = (i * 7 + Math.floor(r * 13)) % TILE;
        const dy = (i * 5 + Math.floor(r * 11)) % TILE;
        px(ctx, px0 + dx, py0 + dy, "#4a9a44");
      }
      if (r > 0.85) px(ctx, px0 + 8, py0 + 8, "#79c46b");
      break;
    }
    case T.GRASS_DARK: {
      fillRect(ctx, px0, py0, TILE, TILE, "#3d7a3a");
      for (let i = 0; i < 4; i++) {
        const dx = (i * 5 + Math.floor(r * 11)) % TILE;
        const dy = (i * 7 + Math.floor(r * 13)) % TILE;
        px(ctx, px0 + dx, py0 + dy, "#2e5c2b");
      }
      break;
    }
    case T.ROUTE_GRASS: {
      fillRect(ctx, px0, py0, TILE, TILE, "#6cba60");
      for (let i = 0; i < 3; i++) {
        const dx = (i * 6 + Math.floor(r * 9)) % TILE;
        const dy = (i * 5 + Math.floor(r * 7)) % TILE;
        px(ctx, px0 + dx, py0 + dy, "#56a04a");
      }
      break;
    }
    case T.TALL_GRASS: {
      fillRect(ctx, px0, py0, TILE, TILE, "#5fb255");
      fillRect(ctx, px0, py0 + 8, TILE, 8, "#3d7a3a");
      for (let i = 0; i < 6; i += 2) px(ctx, px0 + i + 2, py0 + 7, "#79c46b");
      break;
    }
    case T.PATH: {
      fillRect(ctx, px0, py0, TILE, TILE, "#d8b888");
      for (let i = 0; i < 4; i++) {
        const dx = (i * 5 + Math.floor(r * 11)) % TILE;
        const dy = (i * 3 + Math.floor(r * 7)) % TILE;
        px(ctx, px0 + dx, py0 + dy, "#b89868");
      }
      // path edge highlight
      fillRect(ctx, px0, py0, TILE, 1, "#e8c898");
      break;
    }
    case T.SAND: {
      fillRect(ctx, px0, py0, TILE, TILE, "#e6c47a");
      for (let i = 0; i < 4; i++) {
        const dx = (i * 4 + Math.floor(r * 9)) % TILE;
        const dy = (i * 6 + Math.floor(r * 11)) % TILE;
        px(ctx, px0 + dx, py0 + dy, "#c4a25c");
      }
      break;
    }
    case T.STONE: {
      // brick courtyard for rentals (Hab)
      fillRect(ctx, px0, py0, TILE, TILE, "#a67855");
      fillRect(ctx, px0, py0 + 7, TILE, 1, "#6a4828");
      fillRect(ctx, px0, py0 + 15, TILE, 1, "#6a4828");
      const offset = (wy % 2 === 0) ? 0 : 8;
      fillRect(ctx, px0 + offset, py0, 1, 8, "#6a4828");
      fillRect(ctx, px0 + ((offset + 8) % 16), py0 + 8, 1, 8, "#6a4828");
      // mortar speckle
      px(ctx, px0 + 3, py0 + 3, "#c69878");
      px(ctx, px0 + 11, py0 + 11, "#c69878");
      break;
    }
    case T.WATER: {
      const t = now / 400;
      const wave = Math.floor(t) % 4;
      fillRect(ctx, px0, py0, TILE, TILE, "#2960a8");
      // Animated shimmer rows
      fillRect(ctx, px0, py0 + ((wave * 4) % TILE), TILE, 2, "#3b7fc4");
      fillRect(ctx, px0, py0 + ((wave * 4 + 8) % TILE), TILE, 1, "#4a90d4");
      // Sparkle highlights
      const sf = Math.sin(t * 0.7 + wx * 0.5) > 0.7;
      if (sf) {
        px(ctx, px0 + (Math.floor(t * 3 + wx) % 14), py0 + 5, "#a8d8f8");
        px(ctx, px0 + (Math.floor(t * 2 + wy) % 12) + 2, py0 + 11, "#c8e8ff");
      }
      // Deep water darkening at edges
      fillRect(ctx, px0, py0, TILE, 1, "#1a3a78");
      fillRect(ctx, px0, py0, 1, TILE, "#1a3a78");
      break;
    }
    case T.FLOWER_R:
    case T.FLOWER_Y: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0, now);
      const c = code === T.FLOWER_R ? "#e85e5e" : "#f5d24a";
      px(ctx, px0 + 7, py0 + 7, c); px(ctx, px0 + 8, py0 + 7, c);
      px(ctx, px0 + 7, py0 + 8, c); px(ctx, px0 + 8, py0 + 8, c);
      px(ctx, px0 + 6, py0 + 8, "#fff"); px(ctx, px0 + 9, py0 + 7, "#fff");
      break;
    }
    case T.TREE: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0, now);
      // Trunk with shading
      fillRect(ctx, px0 + 6, py0 + 11, 4, 5, "#5a3a1c");
      fillRect(ctx, px0 + 6, py0 + 11, 1, 5, "#3a2010");  // shadow side
      fillRect(ctx, px0 + 9, py0 + 11, 1, 5, "#7a5030");  // light side
      // Roots
      fillRect(ctx, px0 + 4, py0 + 14, 2, 2, "#5a3a1c");
      fillRect(ctx, px0 + 10, py0 + 14, 2, 2, "#5a3a1c");
      // Main foliage — layered for depth
      fillRect(ctx, px0 + 2, py0 + 4, 12, 8, "#2e6a2a");   // base
      fillRect(ctx, px0 + 3, py0 + 2, 10, 4, "#358030");   // mid layer
      fillRect(ctx, px0 + 5, py0 + 1, 6, 3, "#3a8a34");    // top cap
      // Highlight blobs (lighter green)
      fillRect(ctx, px0 + 4, py0 + 3, 3, 2, "#5ab850");
      fillRect(ctx, px0 + 9, py0 + 5, 3, 2, "#4ea845");
      fillRect(ctx, px0 + 6, py0 + 2, 2, 2, "#6ac858");
      // Shadow underside
      fillRect(ctx, px0 + 2, py0 + 11, 12, 1, "#1e4a1c");
      // Outline top pixels
      if (r > 0.6) {
        px(ctx, px0 + 2, py0 + 6, "#4fa844");
        px(ctx, px0 + 13, py0 + 8, "#4fa844");
      }
      break;
    }
    case T.TREE_TALL: {
      // Taller tree — crown extends 8px above tile top
      drawTile(ctx, T.GRASS, wx, wy, px0, py0, now);
      const crownTop = py0 - 8;
      // Trunk
      fillRect(ctx, px0 + 6, py0 + 8, 4, 8, "#3d2b0a");
      fillRect(ctx, px0 + 6, py0 + 8, 1, 8, "#2a1c05");
      fillRect(ctx, px0 + 9, py0 + 8, 1, 8, "#5a4020");
      // Roots
      fillRect(ctx, px0 + 4, py0 + 14, 2, 2, "#3d2b0a");
      fillRect(ctx, px0 + 10, py0 + 14, 2, 2, "#3d2b0a");
      // Foliage layers — taller
      fillRect(ctx, px0 + 2, crownTop + 4, 12, 12, "#1a5c2a");
      fillRect(ctx, px0 + 3, crownTop + 2, 10, 6, "#2a7a3a");
      fillRect(ctx, px0 + 5, crownTop - 2, 6, 8, "#3a9a4a");
      // Highlight blobs
      fillRect(ctx, px0 + 4, crownTop + 3, 3, 2, "#4ab858");
      fillRect(ctx, px0 + 9, crownTop + 5, 3, 2, "#3a9040");
      fillRect(ctx, px0 + 6, crownTop, 2, 3, "#5aca68");
      // Top highlight
      fillRect(ctx, px0 + 6, crownTop - 4, 4, 4, "#4ab858");
      // Shadow underside
      fillRect(ctx, px0 + 2, py0 + 8, 12, 1, "#0e3a18");
      break;
    }
    case T.FENCE: {      drawTile(ctx, T.GRASS, wx, wy, px0, py0, now);
      fillRect(ctx, px0, py0 + 7, TILE, 2, "#d8c098");
      fillRect(ctx, px0 + 3, py0 + 4, 2, 8, "#a88858");
      fillRect(ctx, px0 + 11, py0 + 4, 2, 8, "#a88858");
      break;
    }
    case T.BUILDING_WALL: {
      fillRect(ctx, px0, py0, TILE, TILE, "#e0d4b8");
      fillRect(ctx, px0, py0, TILE, 1, "#a08868");
      fillRect(ctx, px0, py0 + TILE - 1, TILE, 1, "#a08868");
      for (let y = 2; y < TILE; y += 4) {
        for (let x = 0; x < TILE; x += 8) {
          const ox = (y / 4) % 2 === 0 ? 0 : 4;
          fillRect(ctx, px0 + x + ox, py0 + y, 1, 2, "#a08868");
        }
      }
      break;
    }
    case T.BUILDING_ROOF: {
      fillRect(ctx, px0, py0, TILE, TILE, "#7a3024");
      for (let x = 0; x < TILE; x += 4) fillRect(ctx, px0 + x, py0, 1, TILE, "#5a1d18");
      fillRect(ctx, px0, py0, TILE, 1, "#3a0e0a");
      break;
    }
    case T.DOOR: {
      fillRect(ctx, px0, py0, TILE, TILE, "#3a2418");
      fillRect(ctx, px0 + 2, py0 + 2, TILE - 4, TILE - 2, "#6a4028");
      fillRect(ctx, px0 + 11, py0 + 9, 1, 2, "#f5d24a");
      fillRect(ctx, px0 + 2, py0 + 7, TILE - 4, 1, "#2a1810");
      // GYM placard
      fillRect(ctx, px0 + 4, py0 + 3, 8, 3, "#f5d24a");
      fillRect(ctx, px0 + 4, py0 + 3, 8, 1, "#a07820");
      break;
    }
    case T.MAT: {
      // red welcome mat (gym entry)
      fillRect(ctx, px0, py0, TILE, TILE, "#b8392a");
      fillRect(ctx, px0 + 1, py0 + 1, TILE - 2, TILE - 2, "#e85a3a");
      fillRect(ctx, px0 + 2, py0 + 2, TILE - 4, TILE - 4, "#b8392a");
      // GYM lettering
      fillRect(ctx, px0 + 3, py0 + 6, 2, 4, "#ffe8b8");
      px(ctx, px0 + 4, py0 + 6, "#ffe8b8");
      fillRect(ctx, px0 + 6, py0 + 6, 2, 4, "#ffe8b8");
      fillRect(ctx, px0 + 6, py0 + 6, 4, 1, "#ffe8b8");
      fillRect(ctx, px0 + 11, py0 + 6, 2, 4, "#ffe8b8");
      px(ctx, px0 + 10, py0 + 6, "#ffe8b8"); px(ctx, px0 + 12, py0 + 6, "#ffe8b8");
      break;
    }
    case T.SIGN: {
      // Sign always sits on whatever ground is below (use route grass as neutral base)
      drawTile(ctx, T.ROUTE_GRASS, wx, wy, px0, py0, now);
      // Post
      fillRect(ctx, px0 + 7, py0 + 9, 2, 7, "#4a2e14");
      fillRect(ctx, px0 + 8, py0 + 9, 1, 7, "#2e1c0a");
      // Board body
      fillRect(ctx, px0 + 1, py0 + 1, 14, 9, "#c8924a");
      fillRect(ctx, px0 + 1, py0 + 1, 14, 1, "#e6b060");  // top highlight
      fillRect(ctx, px0 + 1, py0 + 9, 14, 1, "#7a4a20");  // bottom shadow
      fillRect(ctx, px0 + 1, py0 + 1, 1, 9, "#7a4a20");   // left shadow
      fillRect(ctx, px0 + 14, py0 + 1, 1, 9, "#7a4a20");  // right shadow
      // Text lines
      fillRect(ctx, px0 + 3, py0 + 3, 10, 1, "#3a2010");
      fillRect(ctx, px0 + 3, py0 + 5, 8, 1, "#3a2010");
      fillRect(ctx, px0 + 3, py0 + 7, 6, 1, "#3a2010");
      // Corner nail heads
      px(ctx, px0 + 2, py0 + 2, "#e0a840");
      px(ctx, px0 + 13, py0 + 2, "#e0a840");
      px(ctx, px0 + 2, py0 + 8, "#e0a840");
      px(ctx, px0 + 13, py0 + 8, "#e0a840");
      break;
    }
    case T.NEON_FLOOR: {
      // Dark tech floor with animated circuit traces
      const base2 = ((wx + wy) % 2 === 0) ? "#1e2c4c" : "#243558";
      fillRect(ctx, px0, py0, TILE, TILE, base2);
      // Grid seams
      fillRect(ctx, px0, py0, TILE, 1, "#2a3a5a");
      fillRect(ctx, px0, py0, 1, TILE, "#2a3a5a");
      // Circuit traces (seeded per tile)
      if (r > 0.65) {
        // Horizontal trace
        const ty3 = py0 + (Math.floor(r * 12) % 12) + 2;
        fillRect(ctx, px0 + 2, ty3, 12, 1, "#9fe8ff");
        px(ctx, px0 + 13, ty3, "#00e8a0");
      }
      if (r > 0.82) {
        // Vertical trace
        const tx3 = px0 + (Math.floor(r * 9) % 9) + 3;
        fillRect(ctx, tx3, py0 + 3, 1, 9, "#3a78d8");
      }
      // Blinking node
      const nodeOn = Math.floor(now / 500 + wx * 3 + wy) % 7 === 0;
      if (r > 0.9 && nodeOn) {
        px(ctx, px0 + Math.floor(r * 12) + 2, py0 + Math.floor(r * 12) + 2, "#00ffcc");
      }
      break;
    }
    case T.DUSK_FLOOR: {
      // Rich marble lobby — deep purple with veining
      const mc = ((wx + wy) % 2 === 0) ? "#30205a" : "#3c2868";
      fillRect(ctx, px0, py0, TILE, TILE, mc);
      // Marble veining (diagonal streaks)
      fillRect(ctx, px0, py0 + 4, TILE, 1, "#6040a0");
      fillRect(ctx, px0 + 4, py0, 1, TILE, "#6040a0");
      // Cross highlight at vein intersections
      if (r > 0.75) {
        px(ctx, px0 + 4, py0 + 4, "#c8a0f0");
        px(ctx, px0 + 5, py0 + 5, "#9070c8");
      }
      // Reflective sheen
      fillRect(ctx, px0, py0, TILE, 1, "#5040a0");
      if (r > 0.88) fillRect(ctx, px0 + 6, py0 + 7, 4, 1, "#a080e0");
      break;
    }
    case T.NIGHT_FLOOR: {
      // Glassy tech lobby for Iterate HQ
      const nc = ((wx + wy) % 2 === 0) ? "#081428" : "#0d1e38";
      fillRect(ctx, px0, py0, TILE, TILE, nc);
      // Illuminated seams every 2 rows
      if (wy % 2 === 0) fillRect(ctx, px0, py0, TILE, 1, "#1a4088");
      if (wx % 2 === 0) fillRect(ctx, px0, py0, 1, TILE, "#1a3060");
      // Reflective sparkles
      if (r > 0.90) {
        px(ctx, px0 + Math.floor(r * TILE), py0 + Math.floor(r * TILE), "#7ce0ff");
      }
      // Blue glow patches
      if (r > 0.78 && r < 0.82) {
        ctx.fillStyle = "rgba(60,120,220,0.2)";
        ctx.fillRect(px0, py0, TILE, TILE);
      }
      break;
    }
    case T.MALL_FLOOR: {
      // Upscale checker mall floor with pink neon grid
      const isA = (Math.floor(wx / 2) + Math.floor(wy / 2)) % 2 === 0;
      fillRect(ctx, px0, py0, TILE, TILE, isA ? "#1e0c30" : "#2a1440");
      // Neon grid lines (every 2 tiles aligning)
      if (wx % 2 === 0) fillRect(ctx, px0, py0, 1, TILE, "#ff9fd430");
      if (wy % 2 === 0) fillRect(ctx, px0, py0, TILE, 1, "#ff9fd430");
      // Gloss highlight corner
      if (r > 0.88) {
        ctx.fillStyle = "rgba(255,200,230,0.12)";
        ctx.fillRect(px0, py0, TILE, TILE);
      }
      break;
    }
    case T.CRYPTO_FLOOR: {
      // Animated PCB circuit board
      fillRect(ctx, px0, py0, TILE, TILE, "#021a10");
      // Board grid
      fillRect(ctx, px0, py0, TILE, 1, "#043a20");
      fillRect(ctx, px0, py0, 1, TILE, "#043a20");
      // PCB traces
      fillRect(ctx, px0 + 3, py0 + 4, 9, 1, "#00e8a0");
      fillRect(ctx, px0 + 3, py0 + 4, 1, 9, "#00e8a0");
      // Via pads
      ctx.fillStyle = "#00e8a0";
      ctx.fillRect(px0 + 3, py0 + 4, 2, 2);
      ctx.fillRect(px0 + 11, py0 + 4, 2, 2);
      ctx.fillRect(px0 + 3, py0 + 12, 2, 2);
      // Animated signal pulse
      const pulsePos = Math.floor(now / 80 + wx * 5 + wy * 3) % 10;
      px(ctx, px0 + 3 + pulsePos, py0 + 4, "#9fffd0");
      // Silkscreen label blobs
      if (r > 0.85) {
        fillRect(ctx, px0 + 7, py0 + 9, 5, 2, "#034020");
      }
      break;
    }
    case T.STUDIO_FLOOR: {
      // Warm parquet hardwood stage
      const plankDir = (wy % 2 === 0);
      fillRect(ctx, px0, py0, TILE, TILE, "#4a2410");
      const plankColor = plankDir ? "#5a3018" : "#623820";
      fillRect(ctx, px0, py0, TILE, 8, plankColor);
      // Wood grain lines
      fillRect(ctx, px0, py0 + 7, TILE, 1, "#321608");
      fillRect(ctx, px0, py0 + 15, TILE, 1, "#321608");
      // Knot / grain detail
      if (r > 0.88) {
        ctx.fillStyle = "#382010";
        ctx.beginPath();
        ctx.ellipse(px0 + Math.floor(r * 10) + 3, py0 + 4, 2, 1, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Stage spotlight bokeh
      if (r > 0.94) {
        ctx.fillStyle = "rgba(255,210,120,0.3)";
        ctx.beginPath();
        ctx.arc(px0 + 8, py0 + 8, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case T.SNOW: {
      fillRect(ctx, px0, py0, TILE, TILE, "#e8eef4");
      for (let i = 0; i < 3; i++) {
        const dx = (i * 4 + Math.floor(r * 9)) % TILE;
        const dy = (i * 6 + Math.floor(r * 7)) % TILE;
        px(ctx, px0 + dx, py0 + dy, "#c8d0d8");
      }
      break;
    }
    case T.ARCH_L:
    case T.ARCH_M:
    case T.ARCH_R: {
      // Base: route grass ground
      drawTile(ctx, T.ROUTE_GRASS, wx, wy, px0, py0, now);
      if (code === T.ARCH_L) {
        // Left pillar — dark stone with highlight edge
        fillRect(ctx, px0 + 4, py0, 8, TILE, "#2a2440");
        fillRect(ctx, px0 + 4, py0, 2, TILE, "#3a3458");   // left edge highlight
        fillRect(ctx, px0 + 11, py0, 1, TILE, "#1a1830");  // right edge shadow
        // Glowing accent strip on top
        fillRect(ctx, px0 + 5, py0, 6, 2, "#5a4080");
        // Bracket arm reaching right
        fillRect(ctx, px0 + 12, py0 + 1, 4, 3, "#2a2440");
      } else if (code === T.ARCH_R) {
        // Right pillar — mirror of left
        fillRect(ctx, px0 + 4, py0, 8, TILE, "#2a2440");
        fillRect(ctx, px0 + 10, py0, 2, TILE, "#3a3458");
        fillRect(ctx, px0 + 4, py0, 1, TILE, "#1a1830");
        fillRect(ctx, px0 + 5, py0, 6, 2, "#5a4080");
        // Bracket arm reaching left
        fillRect(ctx, px0, py0 + 1, 4, 3, "#2a2440");
      } else {
        // ARCH_M: overhead banner spanning between pillars
        // Support bar top
        fillRect(ctx, px0, py0, TILE, 3, "#2a2440");
        fillRect(ctx, px0, py0, TILE, 1, "#5a4080");
        // Hanging banner (colored per zone via accent — using purple default)
        fillRect(ctx, px0 + 1, py0 + 3, TILE - 2, 7, "#7a3090");
        fillRect(ctx, px0 + 1, py0 + 3, TILE - 2, 1, "#aa50c0");
        fillRect(ctx, px0 + 1, py0 + 9, TILE - 2, 1, "#3a1040");
        // Decorative dots on banner
        px(ctx, px0 + 4, py0 + 5, "#f0c4ff");
        px(ctx, px0 + 8, py0 + 5, "#f0c4ff");
        px(ctx, px0 + 12, py0 + 5, "#f0c4ff");
        px(ctx, px0 + 6, py0 + 7, "#c880ff");
        px(ctx, px0 + 10, py0 + 7, "#c880ff");
        // Fringe tassels
        for (let tx2 = 2; tx2 < TILE - 1; tx2 += 3) {
          fillRect(ctx, px0 + tx2, py0 + 10, 1, 3, "#aa50c0");
        }
      }
      break;
    }
    case T.PROP_SERVER: {
      drawTile(ctx, T.NEON_FLOOR, wx, wy, px0, py0, now);
      fillRect(ctx, px0 + 2, py0 + 1, 12, 14, "#1a2a3a");
      fillRect(ctx, px0 + 2, py0 + 1, 12, 1, "#3a78d8");
      // blinkenlights
      for (let i = 0; i < 4; i++) {
        const on = ((wx * 13 + wy * 7 + i) % 3 === 0);
        px(ctx, px0 + 4 + i * 2, py0 + 5, on ? "#00e8a0" : "#053d2c");
        px(ctx, px0 + 4 + i * 2, py0 + 9, on ? "#9fe8ff" : "#0a2a4a");
      }
      break;
    }
    case T.PROP_RACK: {
      drawTile(ctx, T.MALL_FLOOR, wx, wy, px0, py0, now);
      // shoe rack
      fillRect(ctx, px0 + 1, py0 + 4, 14, 1, "#5a1d40");
      fillRect(ctx, px0 + 1, py0 + 10, 14, 1, "#5a1d40");
      // two sneakers
      fillRect(ctx, px0 + 2, py0 + 1, 5, 3, "#ff9fd4");
      fillRect(ctx, px0 + 2, py0 + 3, 5, 1, "#fff");
      fillRect(ctx, px0 + 9, py0 + 1, 5, 3, "#7ce0ff");
      fillRect(ctx, px0 + 9, py0 + 3, 5, 1, "#fff");
      fillRect(ctx, px0 + 2, py0 + 7, 5, 3, "#f5d24a");
      fillRect(ctx, px0 + 9, py0 + 7, 5, 3, "#fff");
      break;
    }
    case T.PROP_SPEAKER: {
      drawTile(ctx, T.STUDIO_FLOOR, wx, wy, px0, py0, now);
      fillRect(ctx, px0 + 2, py0 + 1, 12, 14, "#1a0a06");
      ctx.fillStyle = "#3a1c14";
      ctx.beginPath(); ctx.arc(px0 + 8, py0 + 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath(); ctx.arc(px0 + 8, py0 + 11, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case T.PROP_PRICETAG: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0, now);
      // pole
      fillRect(ctx, px0 + 7, py0 + 6, 2, 10, "#5a3a1c");
      // tag
      fillRect(ctx, px0 + 1, py0 + 1, 11, 6, "#f5d24a");
      fillRect(ctx, px0 + 11, py0 + 1, 1, 6, "#c0a838");
      px(ctx, px0 + 10, py0 + 4, "#3a2010");
      fillRect(ctx, px0 + 3, py0 + 3, 6, 1, "#3a2010");
      fillRect(ctx, px0 + 3, py0 + 5, 4, 1, "#3a2010");
      break;
    }
    case T.PROP_BRICK_PLANT: {
      drawTile(ctx, T.STONE, wx, wy, px0, py0, now);
      // planter
      fillRect(ctx, px0 + 3, py0 + 9, 10, 6, "#5a2c0c");
      fillRect(ctx, px0 + 3, py0 + 9, 10, 1, "#3a1808");
      // plant
      fillRect(ctx, px0 + 5, py0 + 4, 6, 5, "#2e6a2a");
      fillRect(ctx, px0 + 4, py0 + 6, 8, 3, "#3d7a3a");
      px(ctx, px0 + 7, py0 + 3, "#4f9a48");
      break;
    }
    case T.PROP_NEON_PYLON: {
      drawTile(ctx, T.NEON_FLOOR, wx, wy, px0, py0, now);
      // Pylon housing
      fillRect(ctx, px0 + 5, py0, 6, TILE, "#162030");
      fillRect(ctx, px0 + 5, py0, 1, TILE, "#0a1520");  // left shadow
      fillRect(ctx, px0 + 10, py0, 1, TILE, "#2a3848"); // right highlight
      // Glowing energy strip
      const phase2 = now / 300 + wx * 0.8 + wy * 0.5;
      const pulseH = Math.floor(Math.sin(phase2) * 3 + 10);
      const col1 = Math.sin(phase2) > 0 ? "#00ffcc" : "#9fe8ff";
      const col2 = Math.sin(phase2) > 0 ? "#00e8a0" : "#3a78d8";
      fillRect(ctx, px0 + 7, py0 + 1, 2, TILE - 2, col2);
      fillRect(ctx, px0 + 7, py0 + TILE / 2 - pulseH / 2, 2, pulseH, col1);
      // Glow halo
      ctx.fillStyle = `${col1}30`;
      ctx.fillRect(px0 + 4, py0 + TILE / 2 - 5, 8, 10);
      break;
    }
    case T.PROP_CANDLESTICK: {
      drawTile(ctx, T.CRYPTO_FLOOR, wx, wy, px0, py0, now);
      const up = (wx + wy) % 2 === 0;
      fillRect(ctx, px0 + 7, py0 + 1, 2, 14, "#0a3d2c");
      fillRect(ctx, px0 + 5, py0 + 3, 6, 9, up ? "#00e8a0" : "#e83a3a");
      break;
    }
    case T.PROP_TROPHY: {
      drawTile(ctx, T.NIGHT_FLOOR, wx, wy, px0, py0, now);
      // pedestal
      fillRect(ctx, px0 + 4, py0 + 12, 8, 3, "#5a3a1c");
      fillRect(ctx, px0 + 3, py0 + 11, 10, 1, "#3a1c10");
      // cup
      fillRect(ctx, px0 + 5, py0 + 3, 6, 8, "#f5d24a");
      fillRect(ctx, px0 + 3, py0 + 5, 2, 3, "#f5d24a");
      fillRect(ctx, px0 + 11, py0 + 5, 2, 3, "#f5d24a");
      fillRect(ctx, px0 + 5, py0 + 3, 6, 2, "#ffe8b8");
      break;
    }
    case T.PROP_CART: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0, now);
      fillRect(ctx, px0 + 2, py0 + 5, 12, 6, "#c0a878");
      fillRect(ctx, px0 + 2, py0 + 5, 12, 1, "#7a5028");
      // wheels
      fillRect(ctx, px0 + 3, py0 + 12, 3, 3, "#1a1a1a");
      fillRect(ctx, px0 + 10, py0 + 12, 3, 3, "#1a1a1a");
      // produce
      px(ctx, px0 + 5, py0 + 7, "#e85e5e");
      px(ctx, px0 + 8, py0 + 6, "#f5d24a");
      px(ctx, px0 + 11, py0 + 7, "#7ac46a");
      break;
    }
    case T.PROP_DECKCHAIR: {
      drawTile(ctx, T.SAND, wx, wy, px0, py0, now);
      fillRect(ctx, px0 + 3, py0 + 4, 10, 8, "#e85a3a");
      fillRect(ctx, px0 + 3, py0 + 11, 10, 1, "#5a2418");
      fillRect(ctx, px0 + 3, py0 + 12, 1, 3, "#5a2418");
      fillRect(ctx, px0 + 12, py0 + 12, 1, 3, "#5a2418");
      break;
    }
    case T.WARPPAD: {
      // Warp pad — glowing circular portal on floor
      drawTile(ctx, T.ROUTE_GRASS, wx, wy, px0, py0, now);
      // Outer ring
      const pulse = Math.sin(now / 300 + wx * 0.5 + wy * 0.7) * 0.5 + 0.5;
      const r2 = 6 + pulse * 2;
      ctx.strokeStyle = `rgba(255,210,74,${0.5 + pulse * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px0 + 8, py0 + 8, r2, 0, Math.PI * 2);
      ctx.stroke();
      // Inner filled circle
      ctx.fillStyle = `rgba(255,210,74,${0.12 + pulse * 0.1})`;
      ctx.beginPath();
      ctx.arc(px0 + 8, py0 + 8, 4, 0, Math.PI * 2);
      ctx.fill();
      // Center dot
      ctx.fillStyle = `rgba(255,210,74,${0.8 + pulse * 0.2})`;
      ctx.fillRect(px0 + 7, py0 + 7, 2, 2);
      // Sparkle corners
      const sparkPhase = Math.floor(now / 200 + wx + wy) % 4;
      const corners = [[1,1],[14,1],[1,14],[14,14]];
      corners.forEach(([cx2, cy2], ci) => {
        if (ci === sparkPhase) {
          ctx.fillStyle = "#ffd24a";
          ctx.fillRect(px0 + cx2, py0 + cy2, 1, 1);
        }
      });
      break;
    }
    case T.EMPTY:
    default:
      fillRect(ctx, px0, py0, TILE, TILE, "#000");
      break;
  }
}

export function drawRoof(ctx: Ctx, px0: number, py0: number, color: string, shade: string, kind: "left" | "mid" | "right" | "solo") {
  // Rich tiled roof
  fillRect(ctx, px0, py0, TILE, TILE, color);
  // Tile ridge lines
  for (let x = 0; x < TILE; x += 4) fillRect(ctx, px0 + x, py0, 1, TILE, shade);
  // Top / bottom edges
  fillRect(ctx, px0, py0, TILE, 1, shade);
  fillRect(ctx, px0, py0 + TILE - 1, TILE, 1, shade);
  // Highlight strip near top
  fillRect(ctx, px0, py0 + 2, TILE, 1, lighten(color));
  // Side borders
  if (kind === "left" || kind === "solo") fillRect(ctx, px0, py0, 1, TILE, shade);
  if (kind === "right" || kind === "solo") fillRect(ctx, px0 + TILE - 1, py0, 1, TILE, shade);
}

function lighten(hex: string): string {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.split("").map(x=>x+x).join("") : c, 16);  const r2 = Math.min(255, ((n >> 16) & 255) + 40);
  const g2 = Math.min(255, ((n >> 8) & 255) + 40);
  const b2 = Math.min(255, (n & 255) + 40);
  return `#${((1<<24)+(r2<<16)+(g2<<8)+b2).toString(16).slice(1)}`;
}

export function drawGymWall(
  ctx: Ctx,
  px0: number, py0: number,
  wallColor: string, accentColor: string
) {
  const S = TILE;
  // Dark base
  ctx.fillStyle = wallColor + "cc"; // canvas-only
  ctx.fillRect(px0, py0, S, S);
  // Vertical pillar stripes every 4px
  ctx.fillStyle = accentColor + "30"; // canvas-only
  for (let x = 0; x < S; x += 4) {
    ctx.fillRect(px0 + x, py0, 1, S);
  }
  // Top accent glow strip
  ctx.fillStyle = accentColor + "80"; // canvas-only
  ctx.fillRect(px0, py0, S, 2);
  // Bottom shadow
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(px0, py0 + S - 1, S, 1);
}

export function drawBadge(ctx: Ctx, px0: number, py0: number, color: string, phase: number) {  const lift = Math.sin(phase) * 2.5;
  const liftI = Math.floor(lift);
  // Drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(px0 + 8, py0 + 14, 5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Outer glow ring
  ctx.fillStyle = color + "30";
  ctx.beginPath();
  ctx.arc(px0 + 8, py0 + 7 + liftI, 7, 0, Math.PI * 2);
  ctx.fill();
  // Gem body — diamond shape
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(px0 + 8, py0 + 2 + liftI);   // top
  ctx.lineTo(px0 + 13, py0 + 7 + liftI);  // right
  ctx.lineTo(px0 + 8, py0 + 13 + liftI);  // bottom
  ctx.lineTo(px0 + 3, py0 + 7 + liftI);   // left
  ctx.closePath();
  ctx.fill();
  // Inner facet highlight
  ctx.fillStyle = color + "cc";
  ctx.beginPath();
  ctx.moveTo(px0 + 8, py0 + 3 + liftI);
  ctx.lineTo(px0 + 11, py0 + 7 + liftI);
  ctx.lineTo(px0 + 8, py0 + 8 + liftI);
  ctx.lineTo(px0 + 5, py0 + 7 + liftI);
  ctx.closePath();
  ctx.fill();
  // White sparkle
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(px0 + 7, py0 + 3 + liftI, 2, 1);
  ctx.fillRect(px0 + 6, py0 + 4 + liftI, 1, 1);
  // Twinkle star at peak of orbit
  if (Math.floor(phase * 2) % 4 === 0) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(px0 + 14, py0 + 2 + liftI, 2, 2);
    ctx.fillRect(px0 + 1, py0 + 9 + liftI, 2, 2);
  }
}

// ─── Character sprite ──────────────────────────────────────
type Palette = { hair: string; skin: string; shirt: string; shirtAlt: string; pants: string; shoes: string };

const PALETTES: Record<NpcKind | "player", Palette> = {
  player:     { hair: "#1a0e08", skin: "#c8956a", shirt: "#1a1a2e", shirtAlt: "#0a0a1a", pants: "#2a3a5a", shoes: "#0a0808" },
  "trainer-m":{ hair: "#2a1810", skin: "#f0c9a0", shirt: "#3a78d8", shirtAlt: "#1f4a98", pants: "#2a2a2a", shoes: "#101010" },
  "trainer-f":{ hair: "#7a3a2a", skin: "#f0c9a0", shirt: "#d83a78", shirtAlt: "#981f4a", pants: "#3a2a4a", shoes: "#101010" },
  "route-trainer-m": { hair: "#3a2a18", skin: "#d4a060", shirt: "#2a5040", shirtAlt: "#1a3028", pants: "#3a3a2a", shoes: "#2a1a0a" },
  "route-trainer-f": { hair: "#c86040", skin: "#e8b890", shirt: "#7a3a58", shirtAlt: "#4a1a38", pants: "#3a2a3a", shoes: "#1a1010" },
  investor:   { hair: "#1a1a1a", skin: "#e8c098", shirt: "#202028", shirtAlt: "#0a0a10", pants: "#101018", shoes: "#3a3a3a" },
  engineer:   { hair: "#1a1a1a", skin: "#d8b890", shirt: "#3a8a6a", shirtAlt: "#1f5a40", pants: "#28384a", shoes: "#101010" },
  celeb:      { hair: "#202020", skin: "#d8a878", shirt: "#f0c870", shirtAlt: "#a08838", pants: "#2a2a2a", shoes: "#101010" },
  client:     { hair: "#4a3020", skin: "#e8c098", shirt: "#a06fc4", shirtAlt: "#5a3a78", pants: "#2a2a2a", shoes: "#1a1a1a" },
  fan:        { hair: "#d83a3a", skin: "#f0c9a0", shirt: "#f5d24a", shirtAlt: "#a08838", pants: "#3a2a1a", shoes: "#1a1a1a" },
  tenant:     { hair: "#2a1810", skin: "#c4986a", shirt: "#6a8a4a", shirtAlt: "#3a5028", pants: "#3a2a1a", shoes: "#1a1a1a" },
  professor:  { hair: "#d8d8e0", skin: "#f0c9a0", shirt: "#f5f0e0", shirtAlt: "#b8b0a0", pants: "#2a2a2a", shoes: "#3a3a3a" },
  mom:        { hair: "#a06038", skin: "#f0c9a0", shirt: "#e89ab8", shirtAlt: "#a0506a", pants: "#5a3a4a", shoes: "#3a2a1a" },
  rival:      { hair: "#f0c4ff", skin: "#f0c9a0", shirt: "#5a3a78", shirtAlt: "#2a1838", pants: "#1a1a1a", shoes: "#0a0a0a" },
};

export function drawCharacter(
  ctx: Ctx,
  kind: NpcKind | "player",
  dir: Dir,
  frame: 0 | 1 | 2,
  px0: number,
  py0: number,
) {
  const p = PALETTES[kind];

  // Special: Param (player) — taller, slimmer, South Asian appearance
  if (kind === "player") {
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(px0 + 8, py0 + 15, 4, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs with walk animation
    const stepL = frame === 1 ? -2 : 0;
    const stepR = frame === 2 ? -2 : 0;
    fillRect(ctx, px0 + 5, py0 + 11 + stepL, 2, 4, p.pants);
    fillRect(ctx, px0 + 9, py0 + 11 + stepR, 2, 4, p.pants);
    // Shoes
    fillRect(ctx, px0 + 5, py0 + 14, 2, 1, p.shoes);
    fillRect(ctx, px0 + 9, py0 + 14, 2, 1, p.shoes);

    // Torso — slim dark outfit
    fillRect(ctx, px0 + 5, py0 + 6, 6, 6, p.shirt);
    fillRect(ctx, px0 + 4, py0 + 7, 1, 4, p.shirt); // left arm
    fillRect(ctx, px0 + 11, py0 + 7, 1, 4, p.shirt); // right arm
    // Shirt collar detail
    fillRect(ctx, px0 + 6, py0 + 6, 4, 1, p.shirtAlt);

    // Head — slightly taller oval, South Asian skin tone
    fillRect(ctx, px0 + 5, py0 + 1, 6, 5, p.skin);
    // Hair — dark, short
    fillRect(ctx, px0 + 5, py0 + 1, 6, 2, p.hair);
    fillRect(ctx, px0 + 4, py0 + 2, 1, 2, p.hair);
    fillRect(ctx, px0 + 11, py0 + 2, 1, 2, p.hair);

    // Face features by direction
    if (dir === "down") {
      px(ctx, px0 + 6, py0 + 4, "#0a0a0a");
      px(ctx, px0 + 9, py0 + 4, "#0a0a0a");
      fillRect(ctx, px0 + 7, py0 + 5, 2, 1, "#8a3a2a"); // mouth
    } else if (dir === "up") {
      fillRect(ctx, px0 + 5, py0 + 1, 6, 2, p.hair);
      fillRect(ctx, px0 + 5, py0 + 3, 6, 1, p.hair);
    } else if (dir === "left") {
      px(ctx, px0 + 5, py0 + 4, "#0a0a0a");
      fillRect(ctx, px0 + 4, py0 + 2, 1, 2, p.hair);
    } else {
      px(ctx, px0 + 10, py0 + 4, "#0a0a0a");
      fillRect(ctx, px0 + 11, py0 + 2, 1, 2, p.hair);
    }
    return;
  }

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(px0 + 8, py0 + 15, 5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const legLeftY = py0 + 12 + (frame === 1 ? -1 : 0);
  const legRightY = py0 + 12 + (frame === 2 ? -1 : 0);
  fillRect(ctx, px0 + 5, legLeftY, 2, 3, p.pants);
  fillRect(ctx, px0 + 9, legRightY, 2, 3, p.pants);
  fillRect(ctx, px0 + 5, py0 + 14, 2, 1, p.shoes);
  fillRect(ctx, px0 + 9, py0 + 14, 2, 1, p.shoes);

  fillRect(ctx, px0 + 4, py0 + 8, 8, 5, p.shirt);
  fillRect(ctx, px0 + 4, py0 + 12, 8, 1, p.shirtAlt);
  fillRect(ctx, px0 + 4, py0 + 8, 1, 5, p.shirtAlt);
  fillRect(ctx, px0 + 11, py0 + 8, 1, 5, p.shirtAlt);

  fillRect(ctx, px0 + 3, py0 + 8, 1, 4, p.shirt);
  fillRect(ctx, px0 + 12, py0 + 8, 1, 4, p.shirt);
  fillRect(ctx, px0 + 3, py0 + 11, 1, 1, p.skin);
  fillRect(ctx, px0 + 12, py0 + 11, 1, 1, p.skin);

  fillRect(ctx, px0 + 4, py0 + 2, 8, 6, p.skin);
  fillRect(ctx, px0 + 4, py0 + 1, 8, 3, p.hair);
  fillRect(ctx, px0 + 3, py0 + 2, 1, 3, p.hair);
  fillRect(ctx, px0 + 12, py0 + 2, 1, 3, p.hair);

  if (dir === "down") {
    px(ctx, px0 + 6, py0 + 5, "#0a0a0a");
    px(ctx, px0 + 9, py0 + 5, "#0a0a0a");
    px(ctx, px0 + 7, py0 + 7, "#a04020");
    px(ctx, px0 + 8, py0 + 7, "#a04020");
  } else if (dir === "up") {
    fillRect(ctx, px0 + 4, py0 + 4, 8, 2, p.hair);
  } else if (dir === "left") {
    px(ctx, px0 + 5, py0 + 5, "#0a0a0a");
    fillRect(ctx, px0 + 4, py0 + 7, 3, 1, "#a04020");
    fillRect(ctx, px0 + 4, py0 + 5, 1, 2, p.hair);
  } else if (dir === "right") {
    px(ctx, px0 + 10, py0 + 5, "#0a0a0a");
    fillRect(ctx, px0 + 9, py0 + 7, 3, 1, "#a04020");
    fillRect(ctx, px0 + 11, py0 + 5, 1, 2, p.hair);
  }
}
