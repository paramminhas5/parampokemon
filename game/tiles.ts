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
} as const;
export type TileCode = number;

export const SOLID = new Set<TileCode>([
  T.TREE, T.FENCE, T.WATER, T.BUILDING_WALL, T.BUILDING_ROOF, T.SIGN,
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

export function drawTile(ctx: Ctx, code: TileCode, wx: number, wy: number, px0: number, py0: number) {
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
      const t = Math.floor(performance.now() / 400) % 2;
      fillRect(ctx, px0, py0, TILE, TILE, "#3b7fc4");
      for (let i = 0; i < TILE; i += 4) {
        px(ctx, px0 + ((i + t * 2) % TILE), py0 + (i % TILE), "#7fb3e6");
      }
      fillRect(ctx, px0, py0, TILE, 1, "#2a5e9c");
      break;
    }
    case T.FLOWER_R:
    case T.FLOWER_Y: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0);
      const c = code === T.FLOWER_R ? "#e85e5e" : "#f5d24a";
      px(ctx, px0 + 7, py0 + 7, c); px(ctx, px0 + 8, py0 + 7, c);
      px(ctx, px0 + 7, py0 + 8, c); px(ctx, px0 + 8, py0 + 8, c);
      px(ctx, px0 + 6, py0 + 8, "#fff"); px(ctx, px0 + 9, py0 + 7, "#fff");
      break;
    }
    case T.TREE: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0);
      fillRect(ctx, px0 + 7, py0 + 11, 2, 5, "#5a3a1c");
      fillRect(ctx, px0 + 3, py0 + 2, 10, 10, "#2e6a2a");
      fillRect(ctx, px0 + 4, py0 + 1, 8, 1, "#2e6a2a");
      fillRect(ctx, px0 + 2, py0 + 4, 1, 6, "#2e6a2a");
      fillRect(ctx, px0 + 13, py0 + 4, 1, 6, "#2e6a2a");
      fillRect(ctx, px0 + 5, py0 + 3, 3, 2, "#4f9a48");
      fillRect(ctx, px0 + 9, py0 + 5, 2, 2, "#4f9a48");
      break;
    }
    case T.FENCE: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0);
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
      drawTile(ctx, T.GRASS, wx, wy, px0, py0);
      fillRect(ctx, px0 + 7, py0 + 9, 2, 6, "#5a3a1c");
      fillRect(ctx, px0 + 2, py0 + 2, 12, 8, "#c89a5a");
      fillRect(ctx, px0 + 2, py0 + 2, 12, 1, "#e6b878");
      fillRect(ctx, px0 + 2, py0 + 9, 12, 1, "#7a5028");
      fillRect(ctx, px0 + 4, py0 + 4, 8, 1, "#3a2010");
      fillRect(ctx, px0 + 4, py0 + 6, 6, 1, "#3a2010");
      break;
    }
    case T.NEON_FLOOR: {
      fillRect(ctx, px0, py0, TILE, TILE, "#1f2c4a");
      if ((wx + wy) % 2 === 0) fillRect(ctx, px0, py0, TILE, TILE, "#28365a");
      fillRect(ctx, px0, py0, TILE, 1, "#3a5a8a");
      fillRect(ctx, px0, py0, 1, TILE, "#3a5a8a");
      // circuit traces
      if (r > 0.7) {
        fillRect(ctx, px0 + 4, py0 + 8, 8, 1, "#9fe8ff");
        px(ctx, px0 + 12, py0 + 8, "#00e8a0");
      }
      break;
    }
    case T.DUSK_FLOOR: {
      // marble lobby floor for venture tower
      fillRect(ctx, px0, py0, TILE, TILE, "#3a2456");
      if ((wx + wy) % 2 === 0) fillRect(ctx, px0, py0, TILE, TILE, "#4a306a");
      // marble veining
      fillRect(ctx, px0 + 2, py0 + 5, 6, 1, "#7c5a98");
      fillRect(ctx, px0 + 10, py0 + 11, 4, 1, "#7c5a98");
      px(ctx, px0 + 8, py0 + 2, "#a888c8");
      break;
    }
    case T.NIGHT_FLOOR: {
      // glassy lobby for Iterate HQ
      fillRect(ctx, px0, py0, TILE, TILE, "#0b1830");
      if ((wx + wy) % 2 === 0) fillRect(ctx, px0, py0, TILE, TILE, "#173255");
      // glowing seam
      if (wy % 2 === 0) fillRect(ctx, px0, py0, TILE, 1, "#3a78d8");
      if (r > 0.92) px(ctx, px0 + Math.floor(r * TILE), py0 + Math.floor(r * TILE), "#7ce0ff");
      break;
    }
    case T.MALL_FLOOR: {
      // checker mall floor
      const a = "#2a1238", b = "#3a1a48";
      fillRect(ctx, px0, py0, TILE, TILE, a);
      fillRect(ctx, px0, py0, 8, 8, b);
      fillRect(ctx, px0 + 8, py0 + 8, 8, 8, b);
      // pink seam
      fillRect(ctx, px0, py0 + 8, TILE, 1, "#c0388c");
      fillRect(ctx, px0 + 8, py0, 1, TILE, "#c0388c");
      break;
    }
    case T.CRYPTO_FLOOR: {
      // circuit board
      fillRect(ctx, px0, py0, TILE, TILE, "#03331f");
      fillRect(ctx, px0, py0, TILE, 1, "#054a2a");
      fillRect(ctx, px0, py0, 1, TILE, "#054a2a");
      // PCB traces
      fillRect(ctx, px0 + 4, py0 + 4, 8, 1, "#00e8a0");
      fillRect(ctx, px0 + 4, py0 + 4, 1, 8, "#00e8a0");
      px(ctx, px0 + 12, py0 + 4, "#9fffd0");
      px(ctx, px0 + 4, py0 + 12, "#9fffd0");
      break;
    }
    case T.STUDIO_FLOOR: {
      // parquet stage
      fillRect(ctx, px0, py0, TILE, TILE, "#5a2c14");
      const stripe = ((wx + wy) % 2 === 0) ? "#6a3a20" : "#7a4a28";
      fillRect(ctx, px0, py0, TILE, 8, stripe);
      fillRect(ctx, px0, py0 + 7, TILE, 1, "#3a1c10");
      // spotlight bokeh
      if (r > 0.93) {
        ctx.fillStyle = "rgba(255,210,154,0.35)";
        ctx.beginPath(); ctx.arc(px0 + 8, py0 + 8, 4, 0, Math.PI * 2); ctx.fill();
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
      // base ground (route grass)
      drawTile(ctx, T.ROUTE_GRASS, wx, wy, px0, py0);
      // pylon / banner
      if (code === T.ARCH_L) {
        fillRect(ctx, px0 + 6, py0 + 2, 4, TILE - 2, "#2a2438");
        fillRect(ctx, px0 + 5, py0 + 2, 6, 2, "#444058");
      } else if (code === T.ARCH_R) {
        fillRect(ctx, px0 + 6, py0 + 2, 4, TILE - 2, "#2a2438");
        fillRect(ctx, px0 + 5, py0 + 2, 6, 2, "#444058");
      } else {
        // ARCH_M: hanging banner
        fillRect(ctx, px0, py0 + 1, TILE, 6, "#c0388c");
        fillRect(ctx, px0, py0 + 1, TILE, 1, "#5a1240");
        fillRect(ctx, px0, py0 + 6, TILE, 1, "#5a1240");
        // dotted "GATE"
        fillRect(ctx, px0 + 4, py0 + 3, 2, 2, "#ffe8b8");
        fillRect(ctx, px0 + 8, py0 + 3, 2, 2, "#ffe8b8");
      }
      break;
    }
    case T.PROP_SERVER: {
      drawTile(ctx, T.NEON_FLOOR, wx, wy, px0, py0);
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
      drawTile(ctx, T.MALL_FLOOR, wx, wy, px0, py0);
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
      drawTile(ctx, T.STUDIO_FLOOR, wx, wy, px0, py0);
      fillRect(ctx, px0 + 2, py0 + 1, 12, 14, "#1a0a06");
      ctx.fillStyle = "#3a1c14";
      ctx.beginPath(); ctx.arc(px0 + 8, py0 + 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath(); ctx.arc(px0 + 8, py0 + 11, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case T.PROP_PRICETAG: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0);
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
      drawTile(ctx, T.STONE, wx, wy, px0, py0);
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
      drawTile(ctx, T.NEON_FLOOR, wx, wy, px0, py0);
      fillRect(ctx, px0 + 6, py0 + 1, 4, 14, "#1f3548");
      // glowing strip
      const blink = Math.floor(performance.now() / 250 + wx) % 3 === 0;
      fillRect(ctx, px0 + 7, py0 + 2, 2, 12, blink ? "#00e8a0" : "#9fe8ff");
      break;
    }
    case T.PROP_CANDLESTICK: {
      drawTile(ctx, T.CRYPTO_FLOOR, wx, wy, px0, py0);
      const up = (wx + wy) % 2 === 0;
      fillRect(ctx, px0 + 7, py0 + 1, 2, 14, "#0a3d2c");
      fillRect(ctx, px0 + 5, py0 + 3, 6, 9, up ? "#00e8a0" : "#e83a3a");
      break;
    }
    case T.PROP_TROPHY: {
      drawTile(ctx, T.NIGHT_FLOOR, wx, wy, px0, py0);
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
      drawTile(ctx, T.GRASS, wx, wy, px0, py0);
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
      drawTile(ctx, T.SAND, wx, wy, px0, py0);
      fillRect(ctx, px0 + 3, py0 + 4, 10, 8, "#e85a3a");
      fillRect(ctx, px0 + 3, py0 + 11, 10, 1, "#5a2418");
      fillRect(ctx, px0 + 3, py0 + 12, 1, 3, "#5a2418");
      fillRect(ctx, px0 + 12, py0 + 12, 1, 3, "#5a2418");
      break;
    }
    case T.EMPTY:
    default:
      fillRect(ctx, px0, py0, TILE, TILE, "#000");
      break;
  }
}

export function drawRoof(ctx: Ctx, px0: number, py0: number, color: string, shade: string, kind: "left" | "mid" | "right" | "solo") {
  fillRect(ctx, px0, py0, TILE, TILE, color);
  for (let x = 0; x < TILE; x += 4) fillRect(ctx, px0 + x, py0, 1, TILE, shade);
  fillRect(ctx, px0, py0, TILE, 1, shade);
  fillRect(ctx, px0, py0 + TILE - 1, TILE, 1, shade);
  if (kind === "left") fillRect(ctx, px0, py0, 1, TILE, shade);
  if (kind === "right") fillRect(ctx, px0 + TILE - 1, py0, 1, TILE, shade);
}

export function drawBadge(ctx: Ctx, px0: number, py0: number, color: string, phase: number) {
  const lift = Math.floor(Math.sin(phase) * 1.5);
  fillRect(ctx, px0 + 4, py0 + 13, 8, 2, "rgba(0,0,0,0.35)");
  fillRect(ctx, px0 + 5, py0 + 4 + lift, 6, 6, color);
  fillRect(ctx, px0 + 4, py0 + 6 + lift, 8, 2, color);
  fillRect(ctx, px0 + 6, py0 + 3 + lift, 4, 1, color);
  fillRect(ctx, px0 + 6, py0 + 10 + lift, 4, 1, color);
  fillRect(ctx, px0 + 6, py0 + 5 + lift, 2, 2, "#fff");
  if (Math.floor(phase * 4) % 4 === 0) {
    px(ctx, px0 + 13, py0 + 3, "#fff"); px(ctx, px0 + 2, py0 + 9, "#fff");
  }
}

// ─── Character sprite ──────────────────────────────────────
type Palette = { hair: string; skin: string; shirt: string; shirtAlt: string; pants: string; shoes: string };

const PALETTES: Record<NpcKind | "player", Palette> = {
  player:     { hair: "#3a2010", skin: "#f0c9a0", shirt: "#e83a3a", shirtAlt: "#a01818", pants: "#2a4078", shoes: "#1a1a1a" },
  "trainer-m":{ hair: "#2a1810", skin: "#f0c9a0", shirt: "#3a78d8", shirtAlt: "#1f4a98", pants: "#2a2a2a", shoes: "#101010" },
  "trainer-f":{ hair: "#7a3a2a", skin: "#f0c9a0", shirt: "#d83a78", shirtAlt: "#981f4a", pants: "#3a2a4a", shoes: "#101010" },
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
