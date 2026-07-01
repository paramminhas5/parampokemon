// Procedural tile + sprite drawing for Param Quest.

import type { Dir, NpcKind, ZoneTheme } from "./data";
import { TILE_TEXTURE_URL, getSprite, isReady } from "./sprite-registry";

// ── Shared helper: draw a tile texture (full image scaled to 16×16 in local coords) ──
// When called inside a scaled context, this draws at 16×16 local units which
// renders at TILE×TILE on screen thanks to the canvas transform.
function drawTexture(ctx: Ctx, key: string, _px0: number, _py0: number): boolean {
  const url = TILE_TEXTURE_URL[key];
  if (!url) return false;
  const img = getSprite(url);
  if (!isReady(img)) return false;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // Draw in local 16-unit coordinate space (scaled to TILE by canvas transform)
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, 16, 16);
  ctx.imageSmoothingEnabled = false;
  return true;
}

// ── Tree variant selector ──────────────────────────────────────────────────
// Picks one of 4 tree variants based on stable world-coord hash.
// Returns a key into TILE_TEXTURE_URL.
function treeVariant(wx: number, wy: number): string {
  const h = n(wx * 3.7, wy * 2.3);
  if (h < 0.25) return "tree_a";
  if (h < 0.50) return "tree_b";
  if (h < 0.75) return "tree_c";
  return "tree_d";
}

// ── Draw a tree image using multiply blend ────────────────
function drawTreeSprite(ctx: Ctx, key: string, _px0: number, _py0: number): boolean {
  const url = TILE_TEXTURE_URL[key];
  if (!url) return false;
  const img = getSprite(url);
  if (!isReady(img)) return false;
  // Draw slightly larger than 16 units so the canopy overlaps neighbors (depth)
  const size = 24; // 1.5× of 16
  const ox = (16 - size) / 2;
  const oy = (16 - size) / 2;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, ox, oy, size, size);
  ctx.restore();
  return true;
}

export const TILE = 48;
/** Internal unit size that all procedural drawing is authored at */
export const TILE_UNIT = 16;
/** Scale factor from TILE_UNIT → TILE */
export const TILE_SCALE = TILE / TILE_UNIT;

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
} as const;
export type TileCode = number;

export const SOLID = new Set<TileCode>([
  T.TREE, T.FENCE, T.WATER, T.BUILDING_WALL, T.BUILDING_ROOF,
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

// ─── Scale helper: converts a 16-px-grid offset to current TILE size ────────
// All procedural drawing is authored at a 16-unit grid then scaled to TILE.
// S maps a 0..16 value to 0..TILE in real canvas pixels.
const S = TILE / 16; // scale factor (1 at 16px, 3 at 48px …)

export function drawTile(ctx: Ctx, code: TileCode, wx: number, wy: number, px0: number, py0: number, now: number = 0) {
  const r = n(wx, wy);

  // Apply scale transform: all procedural drawing is authored at 16-unit grid.
  // Translate to tile position and scale up so 16px code renders at 48px (TILE).
  ctx.save();
  ctx.translate(px0, py0);
  ctx.scale(S, S);
  // Reset px0/py0 to 0 so all existing `px0 + offset` code works in local space
  px0 = 0;
  py0 = 0;

  switch (code) {
    case T.GRASS: {
      if (!drawTexture(ctx, "grass", px0, py0)) {
        const lightCell = ((Math.floor(wx / 2) + Math.floor(wy / 2)) % 2 === 0);
        fillRect(ctx, 0, 0, 16, 16, lightCell ? "#74c466" : "#68b85a");
        const tuft = lightCell ? "#5aaa4c" : "#549843";
        if (r > 0.30) { const tx = 3+Math.floor(r*6), ty = 4+Math.floor((r*13%1)*7); px(ctx,tx,ty,tuft); px(ctx,tx+1,ty+1,tuft); px(ctx,tx+2,ty,tuft); }
        if (lightCell) px(ctx, 1, 1, "#80cf72");
      }
      break;
    }
    case T.GRASS_DARK: {
      fillRect(ctx, px0, py0, 16, 16, "#3d7a3a");
      for (let i = 0; i < 4; i++) {
        const dx = (i * 5 + Math.floor(r * 11)) % 16;
        const dy = (i * 7 + Math.floor(r * 13)) % 16;
        px(ctx, px0 + dx, py0 + dy, "#2e5c2b");
      }
      break;
    }
    case T.ROUTE_GRASS: {
      if (!drawTexture(ctx, "route_grass", px0, py0)) {
        const lightCell = ((Math.floor(wx / 2) + Math.floor(wy / 2)) % 2 === 0);
        fillRect(ctx, px0, py0, 16, 16, lightCell ? "#7cc868" : "#70be5c");
        const tuft = lightCell ? "#63b052" : "#59a649";
        if (r > 0.4) { const tx = px0+4+Math.floor(r*6), ty = py0+5+Math.floor((r*11%1)*6); px(ctx,tx,ty,tuft); px(ctx,tx+1,ty+1,tuft); }
      }
      break;
    }
    case T.TALL_GRASS: {
      // Base ground matches the new checkerboard grass
      const lightCell = ((Math.floor(wx / 2) + Math.floor(wy / 2)) % 2 === 0);
      fillRect(ctx, px0, py0, 16, 16, lightCell ? "#74c466" : "#69ba5b");
      // Darker clumpy base (the "you can hide a creature here" look)
      fillRect(ctx, px0, py0 + 9, 16, 7, "#357a32");
      fillRect(ctx, px0, py0 + 9, 16, 1, "#2a6628");
      // Swaying blades — top half sways with wind
      const sway = Math.sin(now / 600 + wx * 0.7 + wy * 0.4) * 1.5;
      const swayI = Math.round(sway);
      ctx.fillStyle = "#79c46b";
      ctx.fillRect(px0 + 2 + swayI, py0 + 2, 1, 8);
      ctx.fillRect(px0 + 2 + swayI, py0 + 2, 2, 2);
      ctx.fillStyle = "#5fb255";
      ctx.fillRect(px0 + 7 - swayI, py0 + 1, 1, 9);
      ctx.fillRect(px0 + 6 - swayI, py0 + 1, 3, 2);
      ctx.fillStyle = "#8ad078";
      ctx.fillRect(px0 + 12 + swayI, py0 + 3, 1, 7);
      ctx.fillRect(px0 + 11 + swayI, py0 + 3, 2, 2);
      // bright blade tips
      px(ctx, px0 + 2 + swayI, py0 + 1, "#9cdc88");
      px(ctx, px0 + 12 + swayI, py0 + 2, "#9cdc88");
      break;
    }
    case T.PATH: {
      if (!drawTexture(ctx, "path", px0, py0)) {
        fillRect(ctx, px0, py0, 16, 16, "#dcbd8e");
        fillRect(ctx, px0, py0 + 8, 16, 8, "#d4b384");
        px(ctx, px0 + 2 + Math.floor(r * 4), py0 + 3, "#c0a070");
        px(ctx, px0 + 9, py0 + 6, "#c0a070");
        fillRect(ctx, px0, py0, 16, 1, "#ecd0a4");
      }
      break;
    }
    case T.SAND: {
      if (!drawTexture(ctx, "sand", px0, py0)) {
        fillRect(ctx, px0, py0, 16, 16, "#e8c982");
        fillRect(ctx, px0, py0 + 8, 16, 8, "#e0bf76");
        px(ctx, px0 + 3 + Math.floor(r * 4), py0 + 4, "#cda85e");
        px(ctx, px0 + 10, py0 + 9, "#cda85e");
      }
      break;
    }
    case T.STONE: {
      if (!drawTexture(ctx, "stone", px0, py0)) {
        fillRect(ctx, px0, py0, 16, 16, "#a67855");
        fillRect(ctx, px0, py0 + 7, 16, 1, "#6a4828");
        fillRect(ctx, px0, py0 + 15, 16, 1, "#6a4828");
        const offset = (wy % 2 === 0) ? 0 : 8;
        fillRect(ctx, px0 + offset, py0, 1, 8, "#6a4828");
        fillRect(ctx, px0 + ((offset + 8) % 16), py0 + 8, 1, 8, "#6a4828");
        px(ctx, px0 + 3, py0 + 3, "#c69878");
        px(ctx, px0 + 11, py0 + 11, "#c69878");
      }
      break;
    }
    case T.WATER: {
      if (!drawTexture(ctx, "water", px0, py0)) {
        const t = now / 400;
        fillRect(ctx, px0, py0, 16, 16, "#2558a8");
        fillRect(ctx, px0, py0 + 10, 16, 6, "#2d66b8");
        const b1y = py0 + (Math.floor(t * 4) % 16);
        const b2y = py0 + (Math.floor(t * 2 + 6) % 16);
        fillRect(ctx, px0, b1y, 16, 2, "#4a90d8");
        fillRect(ctx, px0, b2y, 16, 1, "#5ca4e8");
        const sf = Math.sin(t * 0.7 + wx * 0.5 + wy * 0.3) > 0.5;
        if (sf) {
          ctx.fillStyle = "#bfe4ff"; ctx.fillRect(px0 + Math.floor(t * 3 + wx) % 13 + 1, py0 + 4, 1, 1);
          ctx.fillStyle = "#dcf0ff"; ctx.fillRect(px0 + Math.floor(t * 2 + wy) % 11 + 3, py0 + 11, 1, 1);
        }
        fillRect(ctx, px0, py0, 16, 1, "#1a3a78");
      }
      break;
    }
    case T.FLOWER_R:
    case T.FLOWER_Y: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0, now);
      const c = code === T.FLOWER_R ? "#ec5a5a" : "#f5cf44";
      const cDark = code === T.FLOWER_R ? "#c43a3a" : "#d4a82a";
      const fBob = Math.round(Math.sin(now / 700 + wx * 0.8 + wy * 0.6) * 1);
      const cx = px0 + 8, cy = py0 + 7 + fBob;
      // 4 petals around a center (cross arrangement)
      fillRect(ctx, cx - 1, cy - 3, 2, 2, c);   // top
      fillRect(ctx, cx - 1, cy + 1, 2, 2, cDark); // bottom (shaded)
      fillRect(ctx, cx - 3, cy - 1, 2, 2, c);   // left
      fillRect(ctx, cx + 1, cy - 1, 2, 2, c);   // right
      // bright center
      fillRect(ctx, cx - 1, cy - 1, 2, 2, "#fff4c0");
      px(ctx, cx, cy, "#ffae3a");
      // tiny stem
      px(ctx, cx, cy + 3, "#3c8a36");
      break;
    }
    case T.TREE: {
      // Always draw the grass base first
      drawTile(ctx, T.GRASS, wx, wy, px0, py0, now);
      // Pick one of 4 tree variants based on stable world position hash
      const variant = treeVariant(wx, wy);
      if (!drawTreeSprite(ctx, variant, px0, py0)) {
        // Procedural fallback — round canopy with dark outline
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        ctx.beginPath();
        ctx.ellipse(px0 + 9, py0 + 14, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        fillRect(ctx, px0 + 6, py0 + 11, 4, 4, "#6a4420");
        fillRect(ctx, px0 + 6, py0 + 11, 1, 4, "#4a2c12");
        fillRect(ctx, px0 + 9, py0 + 11, 1, 4, "#85562e");
        fillRect(ctx, px0 + 4, py0 + 0, 8, 12, "#194a17");
        fillRect(ctx, px0 + 2, py0 + 2, 12, 8, "#194a17");
        fillRect(ctx, px0 + 3, py0 + 1, 10, 10, "#194a17");
        fillRect(ctx, px0 + 5, py0 + 1, 6, 10, "#2f7a2b");
        fillRect(ctx, px0 + 3, py0 + 3, 10, 6, "#2f7a2b");
        fillRect(ctx, px0 + 4, py0 + 2, 8, 8, "#2f7a2b");
        fillRect(ctx, px0 + 5, py0 + 3, 5, 5, "#3c9636");
        fillRect(ctx, px0 + 5, py0 + 2, 3, 3, "#5cbd4e");
        px(ctx, px0 + 5, py0 + 1, "#74cf64");
        fillRect(ctx, px0 + 4, py0 + 9, 8, 2, "#235e21");
      }
      break;
    }
    case T.FENCE: {
      drawTile(ctx, T.GRASS, wx, wy, px0, py0, now);
      fillRect(ctx, px0, py0 + 7, 16, 2, "#d8c098");
      fillRect(ctx, px0 + 3, py0 + 4, 2, 8, "#a88858");
      fillRect(ctx, px0 + 11, py0 + 4, 2, 8, "#a88858");
      break;
    }
    case T.BUILDING_WALL: {
      // Clean plaster siding with horizontal lap-board lines
      fillRect(ctx, px0, py0, 16, 16, "#ece0c6");
      // lap-board shadow lines
      fillRect(ctx, px0, py0 + 5, 16, 1, "#cdbd98");
      fillRect(ctx, px0, py0 + 11, 16, 1, "#cdbd98");
      // top/bottom trim
      fillRect(ctx, px0, py0, 16, 1, "#b6a17c");
      fillRect(ctx, px0, py0 + 16 - 1, 16, 1, "#b6a17c");
      // Framed window on ~half the wall tiles (seeded by tile position)
      if (r > 0.42) {
        const wxp = px0 + 4, wyp = py0 + 3;
        // outer frame
        fillRect(ctx, wxp - 1, wyp - 1, 9, 9, "#7a5a34");
        // glass
        fillRect(ctx, wxp, wyp, 7, 7, "#8fd0ef");
        // glass sheen (diagonal lighter wedge)
        fillRect(ctx, wxp, wyp, 3, 3, "#b8e6ff");
        px(ctx, wxp + 4, wyp + 1, "#b8e6ff");
        // muntin cross bars
        fillRect(ctx, wxp + 3, wyp, 1, 7, "#5f8fb0");
        fillRect(ctx, wxp, wyp + 3, 7, 1, "#5f8fb0");
        // sill
        fillRect(ctx, wxp - 1, wyp + 8, 9, 1, "#6a4a28");
      }
      break;
    }
    case T.BUILDING_ROOF: {
      // Sloped shingle roof (fallback; engine overlays per-zone colored roof)
      fillRect(ctx, px0, py0, 16, 16, "#a3382c");
      // shingle rows
      for (let yy = 0; yy < 16; yy += 4) {
        fillRect(ctx, px0, py0 + yy, 16, 1, "#7d241b");
        fillRect(ctx, px0, py0 + yy + 1, 16, 1, "#bd4438");
      }
      // ridge highlight
      fillRect(ctx, px0, py0, 16, 1, "#d05a4a");
      break;
    }
    case T.DOOR: {
      // Wall surround matches plaster siding
      fillRect(ctx, px0, py0, 16, 16, "#ece0c6");
      fillRect(ctx, px0, py0 + 5, 16, 1, "#cdbd98");
      // Striped awning over the door
      for (let i = 0; i < 16; i += 4) {
        fillRect(ctx, px0 + i, py0, 2, 3, "#c43a3a");
        fillRect(ctx, px0 + i + 2, py0, 2, 3, "#f0e8d0");
      }
      fillRect(ctx, px0, py0 + 3, 16, 1, "#8a2a2a");
      // Door frame
      fillRect(ctx, px0 + 2, py0 + 4, 16 - 4, 16 - 4, "#3a2418");
      // Door panel — warm wood
      fillRect(ctx, px0 + 3, py0 + 5, 16 - 6, 16 - 5, "#7a4a28");
      fillRect(ctx, px0 + 3, py0 + 5, 16 - 6, 1, "#9a6238");  // top highlight
      // panel split + inset lines
      fillRect(ctx, px0 + 3, py0 + 10, 16 - 6, 1, "#2a1810");
      fillRect(ctx, px0 + 5, py0 + 6, 1, 3, "#5a3418");
      fillRect(ctx, px0 + 10, py0 + 6, 1, 3, "#5a3418");
      // gold knob
      px(ctx, px0 + 11, py0 + 9, "#f5d24a");
      break;
    }
    case T.MAT: {
      // red welcome mat (gym entry)
      fillRect(ctx, px0, py0, 16, 16, "#b8392a");
      fillRect(ctx, px0 + 1, py0 + 1, 16 - 2, 16 - 2, "#e85a3a");
      fillRect(ctx, px0 + 2, py0 + 2, 16 - 4, 16 - 4, "#b8392a");
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
      fillRect(ctx, px0, py0, 16, 16, base2);
      // Grid seams
      fillRect(ctx, px0, py0, 16, 1, "#2a3a5a");
      fillRect(ctx, px0, py0, 1, 16, "#2a3a5a");
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
      // Subtle marble lobby — deep purple with fine veining
      const mc = ((wx + wy) % 2 === 0) ? "#28184a" : "#301e58";
      fillRect(ctx, px0, py0, 16, 16, mc);
      // Fine marble veining (thinner, more subtle)
      if ((wx + wy * 3) % 4 === 0) fillRect(ctx, px0 + 2, py0 + 6, 12, 1, "#4a3080");
      if ((wx * 2 + wy) % 5 === 0) fillRect(ctx, px0 + 7, py0 + 1, 1, 14, "#4a3080");
      // Subtle reflective sheen
      if (r > 0.88) px(ctx, px0 + Math.floor(r * 14) + 1, py0 + Math.floor(r * 14) + 1, "#8060b0");
      break;
    }
    case T.NIGHT_FLOOR: {
      // Glassy tech lobby for Iterate HQ
      const nc = ((wx + wy) % 2 === 0) ? "#081428" : "#0d1e38";
      fillRect(ctx, px0, py0, 16, 16, nc);
      // Illuminated seams every 2 rows
      if (wy % 2 === 0) fillRect(ctx, px0, py0, 16, 1, "#1a4088");
      if (wx % 2 === 0) fillRect(ctx, px0, py0, 1, 16, "#1a3060");
      // Reflective sparkles
      if (r > 0.90) {
        px(ctx, px0 + Math.floor(r * 16), py0 + Math.floor(r * 16), "#7ce0ff");
      }
      // Blue glow patches
      if (r > 0.78 && r < 0.82) {
        ctx.fillStyle = "rgba(60,120,220,0.2)";
        ctx.fillRect(px0, py0, 16, 16);
      }
      break;
    }
    case T.MALL_FLOOR: {
      // Upscale checker mall floor with pink neon grid
      const isA = (Math.floor(wx / 2) + Math.floor(wy / 2)) % 2 === 0;
      fillRect(ctx, px0, py0, 16, 16, isA ? "#1e0c30" : "#2a1440");
      // Neon grid lines (every 2 tiles aligning)
      if (wx % 2 === 0) fillRect(ctx, px0, py0, 1, 16, "#ff9fd430");
      if (wy % 2 === 0) fillRect(ctx, px0, py0, 16, 1, "#ff9fd430");
      // Gloss highlight corner
      if (r > 0.88) {
        ctx.fillStyle = "rgba(255,200,230,0.12)";
        ctx.fillRect(px0, py0, 16, 16);
      }
      break;
    }
    case T.CRYPTO_FLOOR: {
      // Subtle PCB circuit board — dark with muted traces
      fillRect(ctx, px0, py0, 16, 16, "#011408");
      // Faint board grid
      fillRect(ctx, px0, py0, 16, 1, "#02281a");
      fillRect(ctx, px0, py0, 1, 16, "#02281a");
      // Muted PCB traces (thinner, less bright)
      if ((wx + wy) % 3 === 0) {
        fillRect(ctx, px0 + 3, py0 + 7, 10, 1, "#00804a");
      }
      if ((wx * 2 + wy) % 4 === 0) {
        fillRect(ctx, px0 + 8, py0 + 2, 1, 12, "#00804a");
      }
      // Subtle via pad
      if (r > 0.85) {
        px(ctx, px0 + 8, py0 + 7, "#00c880");
      }
      // Faint animated signal pulse
      const pulsePos = Math.floor(now / 120 + wx * 3) % 14;
      if ((wx + wy) % 2 === 0) px(ctx, px0 + 1 + pulsePos, py0 + 7, "#00a06080");
      break;
    }
    case T.STUDIO_FLOOR: {
      // Warm parquet hardwood stage
      const plankDir = (wy % 2 === 0);
      fillRect(ctx, px0, py0, 16, 16, "#4a2410");
      const plankColor = plankDir ? "#5a3018" : "#623820";
      fillRect(ctx, px0, py0, 16, 8, plankColor);
      // Wood grain lines
      fillRect(ctx, px0, py0 + 7, 16, 1, "#321608");
      fillRect(ctx, px0, py0 + 15, 16, 1, "#321608");
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
      fillRect(ctx, px0, py0, 16, 16, "#e8eef4");
      for (let i = 0; i < 3; i++) {
        const dx = (i * 4 + Math.floor(r * 9)) % 16;
        const dy = (i * 6 + Math.floor(r * 7)) % 16;
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
        fillRect(ctx, px0 + 4, py0, 8, 16, "#2a2440");
        fillRect(ctx, px0 + 4, py0, 2, 16, "#3a3458");   // left edge highlight
        fillRect(ctx, px0 + 11, py0, 1, 16, "#1a1830");  // right edge shadow
        // Glowing accent strip on top
        fillRect(ctx, px0 + 5, py0, 6, 2, "#5a4080");
        // Bracket arm reaching right
        fillRect(ctx, px0 + 12, py0 + 1, 4, 3, "#2a2440");
      } else if (code === T.ARCH_R) {
        // Right pillar — mirror of left
        fillRect(ctx, px0 + 4, py0, 8, 16, "#2a2440");
        fillRect(ctx, px0 + 10, py0, 2, 16, "#3a3458");
        fillRect(ctx, px0 + 4, py0, 1, 16, "#1a1830");
        fillRect(ctx, px0 + 5, py0, 6, 2, "#5a4080");
        // Bracket arm reaching left
        fillRect(ctx, px0, py0 + 1, 4, 3, "#2a2440");
      } else {
        // ARCH_M: overhead banner spanning between pillars
        // Support bar top
        fillRect(ctx, px0, py0, 16, 3, "#2a2440");
        fillRect(ctx, px0, py0, 16, 1, "#5a4080");
        // Hanging banner (colored per zone via accent — using purple default)
        fillRect(ctx, px0 + 1, py0 + 3, 16 - 2, 7, "#7a3090");
        fillRect(ctx, px0 + 1, py0 + 3, 16 - 2, 1, "#aa50c0");
        fillRect(ctx, px0 + 1, py0 + 9, 16 - 2, 1, "#3a1040");
        // Decorative dots on banner
        px(ctx, px0 + 4, py0 + 5, "#f0c4ff");
        px(ctx, px0 + 8, py0 + 5, "#f0c4ff");
        px(ctx, px0 + 12, py0 + 5, "#f0c4ff");
        px(ctx, px0 + 6, py0 + 7, "#c880ff");
        px(ctx, px0 + 10, py0 + 7, "#c880ff");
        // Fringe tassels
        for (let tx2 = 2; tx2 < 16 - 1; tx2 += 3) {
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
      fillRect(ctx, px0 + 5, py0, 6, 16, "#162030");
      fillRect(ctx, px0 + 5, py0, 1, 16, "#0a1520");  // left shadow
      fillRect(ctx, px0 + 10, py0, 1, 16, "#2a3848"); // right highlight
      // Glowing energy strip
      const phase2 = now / 300 + wx * 0.8 + wy * 0.5;
      const pulseH = Math.floor(Math.sin(phase2) * 3 + 10);
      const col1 = Math.sin(phase2) > 0 ? "#00ffcc" : "#9fe8ff";
      const col2 = Math.sin(phase2) > 0 ? "#00e8a0" : "#3a78d8";
      fillRect(ctx, px0 + 7, py0 + 1, 2, 16 - 2, col2);
      fillRect(ctx, px0 + 7, py0 + 16 / 2 - pulseH / 2, 2, pulseH, col1);
      // Glow halo
      ctx.fillStyle = `${col1}30`;
      ctx.fillRect(px0 + 4, py0 + 16 / 2 - 5, 8, 10);
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
      fillRect(ctx, px0, py0, 16, 16, "#000");
      break;
  }
  ctx.restore(); // Restore scale transform applied at start of drawTile
}

export function drawRoof(ctx: Ctx, px0: number, py0: number, color: string, shade: string, kind: "left" | "mid" | "right" | "solo") {
  ctx.save();
  ctx.translate(px0, py0);
  ctx.scale(S, S);
  // Rich tiled roof (working in 16-unit local space)
  fillRect(ctx, 0, 0, 16, 16, color);
  // Tile ridge lines
  for (let x = 0; x < 16; x += 4) fillRect(ctx, x, 0, 1, 16, shade);
  // Top / bottom edges
  fillRect(ctx, 0, 0, 16, 1, shade);
  fillRect(ctx, 0, 15, 16, 1, shade);
  // Highlight strip near top
  fillRect(ctx, 0, 2, 16, 1, lighten(color));
  // Side borders
  if (kind === "left" || kind === "solo") fillRect(ctx, 0, 0, 1, 16, shade);
  if (kind === "right" || kind === "solo") fillRect(ctx, 15, 0, 1, 16, shade);
  ctx.restore();
}

function lighten(hex: string): string {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.split("").map(x=>x+x).join("") : c, 16);
  const r2 = Math.min(255, ((n >> 16) & 255) + 40);
  const g2 = Math.min(255, ((n >> 8) & 255) + 40);
  const b2 = Math.min(255, (n & 255) + 40);
  return `#${((1<<24)+(r2<<16)+(g2<<8)+b2).toString(16).slice(1)}`;
}

export function drawBadge(ctx: Ctx, px0: number, py0: number, color: string, phase: number) {
  ctx.save();
  ctx.translate(px0, py0);
  ctx.scale(S, S);
  const lift = Math.sin(phase) * 2.5;
  const liftI = Math.floor(lift);
  // Drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(8, 14, 5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Outer glow ring
  ctx.fillStyle = color + "30";
  ctx.beginPath();
  ctx.arc(8, 7 + liftI, 7, 0, Math.PI * 2);
  ctx.fill();
  // Gem body — diamond shape
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(8, 2 + liftI);   // top
  ctx.lineTo(13, 7 + liftI);  // right
  ctx.lineTo(8, 13 + liftI);  // bottom
  ctx.lineTo(3, 7 + liftI);   // left
  ctx.closePath();
  ctx.fill();
  // Inner facet highlight
  ctx.fillStyle = color + "cc";
  ctx.beginPath();
  ctx.moveTo(8, 3 + liftI);
  ctx.lineTo(11, 7 + liftI);
  ctx.lineTo(8, 8 + liftI);
  ctx.lineTo(5, 7 + liftI);
  ctx.closePath();
  ctx.fill();
  // White sparkle
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(7, 3 + liftI, 2, 1);
  ctx.fillRect(6, 4 + liftI, 1, 1);
  // Twinkle star at peak of orbit
  if (Math.floor(phase * 2) % 4 === 0) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(14, 2 + liftI, 2, 2);
    ctx.fillRect(1, 9 + liftI, 2, 2);
  }
  ctx.restore();
}

// ─── Character sprite ──────────────────────────────────────
type Palette = { hair: string; skin: string; shirt: string; shirtAlt: string; pants: string; shoes: string };

const PALETTES: Record<NpcKind | "player", Palette> = {
  player:      { hair: "#1a0e08", skin: "#c8956a", shirt: "#1a1a2e", shirtAlt: "#0a0a1a", pants: "#2a3a5a", shoes: "#0a0808" },
  "trainer-m": { hair: "#2a1810", skin: "#f0c9a0", shirt: "#3a78d8", shirtAlt: "#1f4a98", pants: "#2a2a2a", shoes: "#101010" },
  "trainer-m2":{ hair: "#8a7a6a", skin: "#e0b888", shirt: "#5a4030", shirtAlt: "#3a2818", pants: "#3a3028", shoes: "#1a1810" },
  "trainer-f": { hair: "#7a3a2a", skin: "#f0c9a0", shirt: "#d83a78", shirtAlt: "#981f4a", pants: "#3a2a4a", shoes: "#101010" },
  investor:    { hair: "#1a1a1a", skin: "#e8c098", shirt: "#202028", shirtAlt: "#0a0a10", pants: "#101018", shoes: "#3a3a3a" },
  "investor-f":{ hair: "#1a1a2a", skin: "#e8c098", shirt: "#1a2848", shirtAlt: "#0a1428", pants: "#1a1828", shoes: "#2a2a3a" },
  engineer:    { hair: "#1a1a1a", skin: "#d8b890", shirt: "#3a8a6a", shirtAlt: "#1f5a40", pants: "#28384a", shoes: "#101010" },
  "engineer-f":{ hair: "#3a2018", skin: "#f0c9a0", shirt: "#7a7a7a", shirtAlt: "#4a4a4a", pants: "#2a3040", shoes: "#101010" },
  celeb:       { hair: "#202020", skin: "#d8a878", shirt: "#f0c870", shirtAlt: "#a08838", pants: "#2a2a2a", shoes: "#101010" },
  "celeb-m":   { hair: "#3a2a1a", skin: "#d8a878", shirt: "#f0f0f0", shirtAlt: "#b0b0b0", pants: "#1a1a1a", shoes: "#101010" },
  client:      { hair: "#4a3020", skin: "#e8c098", shirt: "#a06fc4", shirtAlt: "#5a3a78", pants: "#2a2a2a", shoes: "#1a1a1a" },
  "client-f":  { hair: "#2a1a10", skin: "#f0c9a0", shirt: "#c85a3a", shirtAlt: "#8a3a1a", pants: "#3a2a1a", shoes: "#1a1a1a" },
  fan:         { hair: "#d83a3a", skin: "#f0c9a0", shirt: "#f5d24a", shirtAlt: "#a08838", pants: "#3a2a1a", shoes: "#1a1a1a" },
  "fan-f":     { hair: "#5a2a78", skin: "#f0c9a0", shirt: "#c870d8", shirtAlt: "#8a4098", pants: "#3a2a4a", shoes: "#1a1a1a" },
  tenant:      { hair: "#2a1810", skin: "#c4986a", shirt: "#6a8a4a", shirtAlt: "#3a5028", pants: "#3a2a1a", shoes: "#1a1a1a" },
  professor:   { hair: "#d8d8e0", skin: "#f0c9a0", shirt: "#f5f0e0", shirtAlt: "#b8b0a0", pants: "#2a2a2a", shoes: "#3a3a3a" },
  mom:         { hair: "#a06038", skin: "#f0c9a0", shirt: "#e89ab8", shirtAlt: "#a0506a", pants: "#5a3a4a", shoes: "#3a2a1a" },
  rival:       { hair: "#f0c4ff", skin: "#f0c9a0", shirt: "#5a3a78", shirtAlt: "#2a1838", pants: "#1a1a1a", shoes: "#0a0a0a" },
};

export function drawCharacter(
  ctx: Ctx,
  kind: NpcKind | "player",
  dir: Dir,
  frame: 0 | 1 | 2,
  px0: number,
  py0: number,
) {
  // Apply scale transform so all 16px-era drawing renders at TILE size
  ctx.save();
  ctx.translate(px0, py0);
  ctx.scale(S, S);
  px0 = 0;
  py0 = 0;
  const p = PALETTES[kind];

  // Special: Param (player) — taller, slimmer, South Asian appearance
  if (kind === "player") {
    // Drop shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(px0 + 8, py0 + 15, 4, 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Legs with walk cycle ──
    const legL = frame === 1 ? -2 : frame === 2 ? 1 : 0;
    const legR = frame === 2 ? -2 : frame === 1 ? 1 : 0;
    // Left leg
    fillRect(ctx, px0 + 5, py0 + 11 + legL, 3, 3, p.pants);
    fillRect(ctx, px0 + 5, py0 + 13 + legL, 3, 1, "#1a1a2a"); // shoe
    // Right leg
    fillRect(ctx, px0 + 8, py0 + 11 + legR, 3, 3, p.pants);
    fillRect(ctx, px0 + 8, py0 + 13 + legR, 3, 1, "#1a1a2a"); // shoe

    // ── Torso — dark hoodie/jacket look ──
    fillRect(ctx, px0 + 4, py0 + 6, 8, 6, p.shirt);
    // Collar crease
    fillRect(ctx, px0 + 6, py0 + 6, 4, 1, p.shirtAlt);
    // Arms
    if (dir === "left" || dir === "right") {
      // Show arm swing
      const armSwing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      fillRect(ctx, px0 + 3, py0 + 7 + armSwing, 1, 3, p.shirt);  // left arm
      fillRect(ctx, px0 + 12, py0 + 7 - armSwing, 1, 3, p.shirt); // right arm
    } else {
      fillRect(ctx, px0 + 3, py0 + 7, 1, 3, p.shirt);
      fillRect(ctx, px0 + 12, py0 + 7, 1, 3, p.shirt);
    }
    // Wrists / hands
    fillRect(ctx, px0 + 3, py0 + 10, 1, 1, p.skin);
    fillRect(ctx, px0 + 12, py0 + 10, 1, 1, p.skin);

    // ── Head — South Asian skin, strong jawline ──
    // Neck
    fillRect(ctx, px0 + 7, py0 + 4, 2, 2, p.skin);
    // Head shape — slightly wider at cheeks
    fillRect(ctx, px0 + 4, py0 + 1, 8, 4, p.skin);
    fillRect(ctx, px0 + 5, py0 + 0, 6, 1, p.skin); // top of head
    // Ear dots
    px(ctx, px0 + 4, py0 + 2, p.skin);
    px(ctx, px0 + 11, py0 + 2, p.skin);

    // ── Hair — dark, textured, modern cut ──
    fillRect(ctx, px0 + 4, py0 + 0, 8, 2, p.hair); // top
    fillRect(ctx, px0 + 3, py0 + 1, 2, 2, p.hair); // left side
    fillRect(ctx, px0 + 11, py0 + 1, 2, 2, p.hair); // right side
    // Hair texture highlights
    px(ctx, px0 + 6, py0 + 0, "#2a1810");
    px(ctx, px0 + 9, py0 + 0, "#2a1810");

    // ── Face by direction ──
    if (dir === "down") {
      // Eyes — dark brown, expressive
      fillRect(ctx, px0 + 5, py0 + 3, 2, 1, "#1a0a04");
      fillRect(ctx, px0 + 9, py0 + 3, 2, 1, "#1a0a04");
      // Eye whites
      px(ctx, px0 + 6, py0 + 3, "#fff");
      px(ctx, px0 + 10, py0 + 3, "#fff");
      // Nose bridge
      px(ctx, px0 + 7, py0 + 3, p.skin);
      // Mouth — slight confident smile
      px(ctx, px0 + 6, py0 + 4, "#7a3020");
      px(ctx, px0 + 7, py0 + 4, "#9a4030");
      px(ctx, px0 + 8, py0 + 4, "#9a4030");
      px(ctx, px0 + 9, py0 + 4, "#7a3020");
    } else if (dir === "up") {
      // Back of head — show hair only
      fillRect(ctx, px0 + 4, py0 + 1, 8, 3, p.hair);
      fillRect(ctx, px0 + 3, py0 + 2, 1, 2, p.hair);
      fillRect(ctx, px0 + 12, py0 + 2, 1, 2, p.hair);
    } else if (dir === "left") {
      // Left profile
      px(ctx, px0 + 5, py0 + 3, "#1a0a04");
      px(ctx, px0 + 6, py0 + 3, "#fff");
      px(ctx, px0 + 5, py0 + 4, "#7a3020"); // mouth
      // Hair profile
      fillRect(ctx, px0 + 3, py0 + 1, 2, 3, p.hair);
      // Nose
      px(ctx, px0 + 4, py0 + 3, p.skin);
    } else {
      // Right profile
      px(ctx, px0 + 10, py0 + 3, "#1a0a04");
      px(ctx, px0 + 9, py0 + 3, "#fff");
      px(ctx, px0 + 10, py0 + 4, "#7a3020"); // mouth
      // Hair profile
      fillRect(ctx, px0 + 11, py0 + 1, 2, 3, p.hair);
      // Nose
      px(ctx, px0 + 11, py0 + 3, p.skin);
    }
    ctx.restore();
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
  ctx.restore(); // Restore scale transform
}
