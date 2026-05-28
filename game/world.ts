// World builder: hand-crafted per-zone layouts, unique buildings,
// themed route corridors, dense prop placement.

import { ZONES, WORLD_W, WORLD_H } from "./data";
import { T, groundTileFor, type TileCode } from "./tiles";

// Path corridor: 6 tiles wide, centre of world
const PATH_X1 = 37;
const PATH_X2 = 43; // exclusive

// ─── Route scenery type per pair of zones ─────────────────────
const ROUTE_THEMES = [
  "meadow",   // home → origin
  "forest",   // origin → grp
  "stream",   // grp → hab
  "boulders", // hab → ai
  "neon",     // ai → investopad
  "mall",     // investopad → sole
  "crypto",   // sole → fere
  "garden",   // fere → ccd
  "skyline",  // ccd → iterate
] as const;

// ─── seeded pseudo-random ──────────────────────────────────────
function sr(x: number, y: number, salt = 0): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + salt * 53.3) * 43758.5453;
  return s - Math.floor(s);
}

// ─── helpers ──────────────────────────────────────────────────
const isPath = (x: number) => x >= PATH_X1 && x < PATH_X2;

function fill(grid: TileCode[][], x0: number, y0: number, x1: number, y1: number, t: TileCode) {
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++)
      if (y >= 0 && x >= 0 && y < grid.length && x < grid[0].length) grid[y][x] = t;
}

function place(grid: TileCode[][], x: number, y: number, t: TileCode) {
  if (y >= 0 && x >= 0 && y < grid.length && x < grid[0].length) grid[y][x] = t;
}



// ─── Building painter (primary + optional second) ──────────────
function paintBuilding(
  grid: TileCode[][],
  b: { x: number; y: number; w: number; h: number; doorX: number; color: string; roof: string },
  ox: number, oy: number, ww: number, wh: number,
) {
  for (let gy = b.y; gy < b.y + b.h; gy++) {
    for (let gx = b.x; gx < b.x + b.w; gx++) {
      const wx = ox + gx, wy = oy + gy;
      if (wx < 0 || wy < 0 || wx >= ww || wy >= wh) continue;
      const isRoof  = gy === b.y;
      const isFront = gy === b.y + b.h - 1;
      const isDoor  = gx === b.x + b.doorX && isFront;
      if (isDoor)         grid[wy][wx] = T.DOOR;
      else if (isRoof)    grid[wy][wx] = T.BUILDING_ROOF;
      else                grid[wy][wx] = T.BUILDING_WALL;
    }
  }
  const matWx = ox + b.x + b.doorX;
  const matWy = oy + b.y + b.h;
  if (matWx >= 0 && matWy >= 0 && matWx < ww && matWy < wh) grid[matWy][matWx] = T.MAT;
}

function paintBuilding2(
  grid: TileCode[][],
  b: { x: number; y: number; w: number; h: number; doorX?: number; color: string; roof: string },
  ox: number, oy: number, ww: number, wh: number,
) {
  for (let gy = b.y; gy < b.y + b.h; gy++) {
    for (let gx = b.x; gx < b.x + b.w; gx++) {
      const wx = ox + gx, wy = oy + gy;
      if (wx < 0 || wy < 0 || wx >= ww || wy >= wh) continue;
      const isRoof  = gy === b.y;
      const isFront = gy === b.y + b.h - 1;
      const isDoor  = b.doorX !== undefined && gx === b.x + b.doorX && isFront;
      if (isDoor)         grid[wy][wx] = T.DOOR;
      else if (isRoof)    grid[wy][wx] = T.BUILDING_ROOF;
      else                grid[wy][wx] = T.BUILDING_WALL;
    }
  }
  if (b.doorX !== undefined) {
    const matWx = ox + b.x + b.doorX;
    const matWy = oy + b.y + b.h;
    if (matWx >= 0 && matWy >= 0 && matWx < ww && matWy < wh) grid[matWy][matWx] = T.MAT;
  }
}



// ─── Zone arch gates ───────────────────────────────────────────
function paintZoneArches(grid: TileCode[][], h: number) {
  for (let i = 1; i < ZONES.length; i++) {
    const z = ZONES[i];
    const archY = z.oy - 1;
    if (archY < 2 || archY >= h) continue;
    grid[archY][PATH_X1]     = T.ARCH_L;
    grid[archY][PATH_X1 + 1] = T.ARCH_M;
    grid[archY][PATH_X1 + 2] = T.ARCH_M;
    grid[archY][PATH_X1 + 3] = T.ARCH_M;
    grid[archY][PATH_X1 + 4] = T.ARCH_M;
    grid[archY][PATH_X1 + 5] = T.ARCH_R;
  }
}

// ─── Route scenery ─────────────────────────────────────────────
function paintRoutes(grid: TileCode[][], w: number, h: number) {
  for (let i = 0; i < ZONES.length - 1; i++) {
    const zoneBottom = ZONES[i].oy + ZONES[i].h;
    const nextTop    = ZONES[i + 1].oy;
    const theme      = ROUTE_THEMES[i];
    const routeMid   = Math.floor((zoneBottom + nextTop) / 2);

    // Dense tree edges at zone boundaries
    for (let x = 3; x < w - 3; x++) {
      if (!isPath(x)) {
        if (zoneBottom < h) grid[zoneBottom][x] = T.TREE;
        if (nextTop - 1 >= 0) grid[nextTop - 1][x] = T.TREE;
      }
    }

    // Forest walls flanking the corridor
    for (let y = zoneBottom + 1; y < nextTop - 1; y++) {
      for (let x = 3; x < PATH_X1 - 2; x++) {
        if (sr(x, y, i + 500) < 0.78) grid[y][x] = T.TREE;
      }
      for (let x = PATH_X1 - 2; x < PATH_X1; x++) {
        if (sr(x, y, i + 600) < 0.30) grid[y][x] = T.TREE;
      }
      for (let x = PATH_X2; x < PATH_X2 + 2; x++) {
        if (sr(x, y, i + 700) < 0.30) grid[y][x] = T.TREE;
      }
      for (let x = PATH_X2 + 2; x < w - 3; x++) {
        if (sr(x, y, i + 800) < 0.78) grid[y][x] = T.TREE;
      }
    }



    // Theme-specific path decoration
    for (let y = zoneBottom + 1; y < nextTop - 1; y++) {
      switch (theme) {
        case "meadow":
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1000);
            if (r < 0.10) grid[y][x] = T.FLOWER_R;
            else if (r < 0.22) grid[y][x] = T.FLOWER_Y;
          }
          break;
        case "forest":
          for (let x = PATH_X1; x < PATH_X2; x++) {
            if (sr(x, y, i + 1001) < 0.07) grid[y][x] = T.FLOWER_Y;
          }
          break;
        case "stream":
          if (y >= routeMid - 1 && y <= routeMid + 1) {
            for (let x = 3; x < w - 3; x++) {
              if (x >= PATH_X1 - 1 && x <= PATH_X2) continue;
              grid[y][x] = T.WATER;
            }
          }
          break;
        case "boulders":
          for (let x = PATH_X1; x < PATH_X2; x++) {
            if (sr(x, y, i + 1002) < 0.07) grid[y][x] = T.STONE;
          }
          break;
        case "neon":
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1003);
            if (r < 0.05) grid[y][x] = T.PROP_NEON_PYLON;
            else if (r < 0.14) grid[y][x] = T.NEON_FLOOR;
          }
          break;
        case "mall":
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1004);
            if (r < 0.05) grid[y][x] = T.PROP_RACK;
            else if (r < 0.12) grid[y][x] = T.MALL_FLOOR;
          }
          break;
        case "crypto":
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1005);
            if (r < 0.06) grid[y][x] = T.PROP_CANDLESTICK;
            else if (r < 0.16) grid[y][x] = T.CRYPTO_FLOOR;
          }
          break;
        case "garden":
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1006);
            if (r < 0.12) grid[y][x] = T.FLOWER_Y;
            else if (r < 0.22) grid[y][x] = T.FLOWER_R;
          }
          break;
        case "skyline":
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1007);
            if (r < 0.06) grid[y][x] = T.PROP_TROPHY;
            else if (r < 0.14) grid[y][x] = T.NIGHT_FLOOR;
          }
          break;
      }
    }
    void routeMid;
  }
}



// ─── Per-zone hand-crafted layout ──────────────────────────────
// ox=27, zone 26 wide × 20 tall. Path cols 37-42 = local x 10-15.
// All prop placement avoids local x 9-16 (path buffer).
function paintZoneLayout(grid: TileCode[][], w: number, h: number) {
  for (const z of ZONES) {
    const ox = z.ox, oy = z.oy;
    const base = groundTileFor(z.theme.ground);

    // Restore NPC standing tiles to base (NPCs are solid, clear them so walk works)
    for (const npc of z.npcs) {
      const nx = ox + npc.x, ny = oy + npc.y;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h) grid[ny][nx] = base;
    }

    // Sign + badge
    const sx = ox + z.sign.x, sy = oy + z.sign.y;
    if (sx >= 0 && sy >= 0 && sx < w && sy < h) grid[sy][sx] = T.SIGN;
    const bx = ox + z.badge.x, by = oy + z.badge.y;
    if (bx >= 0 && by >= 0 && bx < w && by < h) grid[by][bx] = T.BADGE;

    // Press wall
    if (z.pressWall) {
      const pwx = ox + z.pressWall.x, pwy = oy + z.pressWall.y;
      if (pwx >= 0 && pwy >= 0 && pwx < w && pwy < h) grid[pwy][pwx] = T.BADGE;
    }

    switch (z.id) {

      // ── HOME: Pallet Town ──────────────────────────────────────
      // Cottage top-left, Prof lab top-right, fenced garden between,
      // flower beds near cottage, tall grass patches by south fence.
      case "home": {
        // Fence row between cottage and lab (local y=7)
        for (let lx = 1; lx < 9; lx++) {
          if (!isPath(ox + lx)) place(grid, ox + lx, oy + 7, T.FENCE);
        }
        // Garden flowers top-center (local x 10-18 avoided — path starts at x=10 world)
        // local x 1-8 = world 28-35
        for (let lx = 1; lx <= 8; lx++) {
          const r = sr(lx, 8, 1);
          if (r < 0.35) place(grid, ox + lx, oy + 8, r < 0.17 ? T.FLOWER_R : T.FLOWER_Y);
        }
        // Tall grass clusters south area (local x 1-8, y 12-17)
        for (let ly = 12; ly <= 17; ly++) {
          for (let lx = 1; lx <= 8; lx++) {
            const r = sr(lx, ly, 2);
            if (r < 0.25) place(grid, ox + lx, oy + ly, r < 0.12 ? T.TALL_GRASS : T.FLOWER_Y);
          }
        }
        // Right side: open meadow with scattered flowers (local x 17-24, y 8-17)
        for (let ly = 8; ly <= 17; ly++) {
          for (let lx = 17; lx <= 24; lx++) {
            const r = sr(lx, ly, 3);
            if (r < 0.20) place(grid, ox + lx, oy + ly, r < 0.08 ? T.FLOWER_R : T.FLOWER_Y);
          }
        }
        break;
      }



      // ── ORIGIN TOWN ─────────────────────────────────────────────
      // Sandy workshop floor. Drafting tables + record crates right side.
      // Open window-like fence strip along top edge. Flower pots near walls.
      case "origin": {
        // Fence strip top-right as "open window ledge" (local x 10-24, y 1)
        for (let lx = 17; lx <= 24; lx++) place(grid, ox + lx, oy + 1, T.FENCE);
        // Record crates cluster (local x 17-24, y 4-6)
        for (let ly = 4; ly <= 6; ly++) {
          for (let lx = 17; lx <= 24; lx++) {
            const r = sr(lx, ly, 10);
            if (r < 0.30) place(grid, ox + lx, oy + ly, T.PROP_CART);
          }
        }
        // Drafting table row (local x 17-24, y 8-9)
        for (let lx = 17; lx <= 22; lx += 3) {
          place(grid, ox + lx, oy + 8, T.PROP_SERVER);
          place(grid, ox + lx + 1, oy + 8, T.PROP_PRICETAG);
        }
        // Flower pots along building wall (local x 2, y 10-16)
        for (let ly = 10; ly <= 16; ly += 2) place(grid, ox + 2, oy + ly, T.FLOWER_Y);
        // Speaker prop (music!) right side bottom
        place(grid, ox + 20, oy + 14, T.PROP_SPEAKER);
        place(grid, ox + 22, oy + 14, T.PROP_SPEAKER);
        // Deckchair near bottom (chilling, making music)
        place(grid, ox + 19, oy + 17, T.PROP_DECKCHAIR);
        break;
      }

      // ── GRP MARKET ──────────────────────────────────────────────
      // Open-air market. Left = stall building with cart/pricetag rows.
      // Right = office building. Centre = market floor with price boards.
      case "grp": {
        // Cart row in front of stall building (local y=8, x 1-9)
        for (let lx = 1; lx <= 8; lx += 2) place(grid, ox + lx, oy + 8, T.PROP_CART);
        // Price tag signs scattered (local x 1-8, y 10-16)
        for (let ly = 10; ly <= 16; ly += 2) {
          for (let lx = 1; lx <= 7; lx += 3) {
            const r = sr(lx, ly, 20);
            if (r < 0.55) place(grid, ox + lx, oy + ly, T.PROP_PRICETAG);
          }
        }
        // Flower beds along top stall row
        for (let lx = 1; lx <= 8; lx++) {
          if (sr(lx, 2, 21) < 0.28) place(grid, ox + lx, oy + 2, T.FLOWER_Y);
        }
        // Carts and price tags in market centre (local x 1-8, y 11-15)
        place(grid, ox + 4, oy + 12, T.PROP_CART);
        place(grid, ox + 7, oy + 11, T.PROP_PRICETAG);
        place(grid, ox + 3, oy + 15, T.PROP_PRICETAG);
        // Right side open grass with tall grass tufts
        for (let ly = 8; ly <= 17; ly++) {
          for (let lx = 17; lx <= 24; lx++) {
            if (sr(lx, ly, 22) < 0.15) place(grid, ox + lx, oy + ly, T.TALL_GRASS);
          }
        }
        break;
      }



      // ── HAB DISTRICT ────────────────────────────────────────────
      // Two apartment blocks left+right. Stone courtyard between them.
      // Brick planters line the courtyard. Fence separates front from back.
      case "hab": {
        // Courtyard fence row (local y=12, x 8-17 = between buildings)
        for (let lx = 8; lx <= 16; lx++) place(grid, ox + lx, oy + 12, T.FENCE);
        // Brick planters along left building wall (local x 8-9, y 3-11)
        for (let ly = 3; ly <= 10; ly += 2) place(grid, ox + 8, oy + ly, T.PROP_BRICK_PLANT);
        // Brick planters along right building wall (local x 17-17, y 3-11)
        for (let ly = 3; ly <= 10; ly += 2) place(grid, ox + 17, oy + ly, T.PROP_BRICK_PLANT);
        // Stone pavers in courtyard centre (local x 9-16, y 4-11)
        for (let ly = 4; ly <= 11; ly++) {
          for (let lx = 9; lx <= 16; lx++) {
            if (!isPath(ox + lx)) place(grid, ox + lx, oy + ly, T.STONE);
          }
        }
        // Scattered flowers south half (local x 1-7, y 13-17)
        for (let ly = 13; ly <= 17; ly++) {
          for (let lx = 1; lx <= 7; lx++) {
            if (sr(lx, ly, 30) < 0.22) place(grid, ox + lx, oy + ly, T.FLOWER_R);
          }
        }
        // Same right side
        for (let ly = 13; ly <= 17; ly++) {
          for (let lx = 18; lx <= 24; lx++) {
            if (sr(lx, ly, 31) < 0.22) place(grid, ox + lx, oy + ly, T.FLOWER_Y);
          }
        }
        break;
      }

      // ── QUARTIC LAB ─────────────────────────────────────────────
      // Server room left, neon pylon grid fills right 2/3.
      // Circuit-board floor throughout. Neon pylons in ordered rows.
      case "ai": {
        // Server rack row (local x 1-9, y 9-10 — below building exit)
        for (let lx = 1; lx <= 8; lx += 2) place(grid, ox + lx, oy + 9, T.PROP_SERVER);
        // Neon pylon grid right side (local x 17-24, y 2-16, every 3)
        for (let ly = 2; ly <= 16; ly += 3) {
          for (let lx = 17; lx <= 24; lx += 3) {
            place(grid, ox + lx, oy + ly, T.PROP_NEON_PYLON);
          }
        }
        // Neon floor strips in between pylons (right side)
        for (let ly = 3; ly <= 17; ly++) {
          for (let lx = 17; lx <= 24; lx++) {
            if (grid[oy + ly]?.[ox + lx] === groundTileFor("neon")) {
              const r = sr(lx, ly, 40);
              if (r < 0.18) place(grid, ox + lx, oy + ly, T.NEON_FLOOR);
            }
          }
        }
        // Two extra servers bottom-left
        place(grid, ox + 2, oy + 14, T.PROP_SERVER);
        place(grid, ox + 4, oy + 14, T.PROP_SERVER);
        break;
      }



      // ── INVESTOPAD TOWER ────────────────────────────────────────
      // Tall tower centre. Trophy clusters both wings. Dusk marble floor.
      // Side annex right. Water feature (moat strip) around tower base.
      case "investopad": {
        // Trophy cluster left wing (local x 1-5, y 13-17)
        for (let ly = 13; ly <= 17; ly++) {
          for (let lx = 1; lx <= 5; lx++) {
            if (sr(lx, ly, 50) < 0.40) place(grid, ox + lx, oy + ly, T.PROP_TROPHY);
          }
        }
        // Trophy cluster right of annex (local x 18-24, y 10-17)
        for (let ly = 10; ly <= 17; ly++) {
          for (let lx = 18; lx <= 24; lx++) {
            if (sr(lx, ly, 51) < 0.30) place(grid, ox + lx, oy + ly, T.PROP_TROPHY);
          }
        }
        // Neon pylon pair flanking tower entrance (local y=13)
        place(grid, ox + 5, oy + 13, T.PROP_NEON_PYLON);
        place(grid, ox + 13, oy + 13, T.PROP_NEON_PYLON);
        // Dusk floor strip around tower (local x 1-5 + 13-17, y 2-12)
        for (let ly = 2; ly <= 12; ly++) {
          for (let lx = 1; lx <= 5; lx++)
            if (grid[oy + ly]?.[ox + lx] === groundTileFor("dusk"))
              place(grid, ox + lx, oy + ly, T.DUSK_FLOOR);
        }
        break;
      }

      // ── SOLESEARCH MALL ─────────────────────────────────────────
      // Wide storefront top. Sneaker rack rows below. Neon pylons flank.
      // Speakers left side. Pink mall floor everywhere.
      case "sole": {
        // Sneaker rack rows (local y 7-8, x 1-8)
        for (let lx = 1; lx <= 8; lx += 2) {
          place(grid, ox + lx, oy + 7, T.PROP_RACK);
          place(grid, ox + lx, oy + 8, T.PROP_RACK);
        }
        // Neon pylons flanking (local x 1+16, y 10+13)
        place(grid, ox + 1,  oy + 10, T.PROP_NEON_PYLON);
        place(grid, ox + 1,  oy + 13, T.PROP_NEON_PYLON);
        place(grid, ox + 16, oy + 10, T.PROP_NEON_PYLON);
        place(grid, ox + 16, oy + 13, T.PROP_NEON_PYLON);
        // Speaker left side (local x 1-2, y 16)
        place(grid, ox + 1, oy + 16, T.PROP_SPEAKER);
        place(grid, ox + 3, oy + 16, T.PROP_SPEAKER);
        // Price tags scattered (local x 5-8, y 11-17)
        for (let ly = 11; ly <= 17; ly += 2) {
          for (let lx = 5; lx <= 8; lx += 2) {
            if (sr(lx, ly, 60) < 0.50) place(grid, ox + lx, oy + ly, T.PROP_PRICETAG);
          }
        }
        // Mall floor strip across display area (local x 1-8, y 10-17)
        for (let ly = 10; ly <= 17; ly++) {
          for (let lx = 1; lx <= 8; lx++) {
            if (grid[oy + ly]?.[ox + lx] === groundTileFor("mall"))
              place(grid, ox + lx, oy + ly, T.MALL_FLOOR);
          }
        }
        break;
      }



      // ── FERE DISTRICT ───────────────────────────────────────────
      // Trading floor right. Candlestick forest left (the market IS the world).
      // PCB circuit floor throughout. Agent terminal cluster centre.
      case "fere": {
        // Candlestick forest left (local x 1-8, y 2-17)
        for (let ly = 2; ly <= 17; ly++) {
          for (let lx = 1; lx <= 8; lx++) {
            const r = sr(lx, ly, 70);
            if (r < 0.45) place(grid, ox + lx, oy + ly, T.PROP_CANDLESTICK);
            else if (r < 0.60) place(grid, ox + lx, oy + ly, T.CRYPTO_FLOOR);
          }
        }
        // Agent terminal cluster (local x 9-16, y 10-14)
        for (let lx = 9; lx <= 9; lx++) {
          place(grid, ox + lx, oy + 10, T.PROP_SERVER);
          place(grid, ox + lx, oy + 12, T.PROP_SERVER);
          place(grid, ox + lx, oy + 14, T.PROP_SERVER);
        }
        // Neon pylon pair (local x 17+24, y 9+14)
        place(grid, ox + 17, oy + 9,  T.PROP_NEON_PYLON);
        place(grid, ox + 24, oy + 9,  T.PROP_NEON_PYLON);
        place(grid, ox + 17, oy + 14, T.PROP_NEON_PYLON);
        place(grid, ox + 24, oy + 14, T.PROP_NEON_PYLON);
        break;
      }

      // ── CATS CAN DANCE ──────────────────────────────────────────
      // Recording studio top-left. Speaker array centre-right.
      // Record crate stacks. Warm parquet floor. Cat roaming bottom.
      case "ccd": {
        // Speaker array right side (local x 16-24, y 4-14)
        for (let ly = 4; ly <= 14; ly += 3) {
          place(grid, ox + 17, oy + ly, T.PROP_SPEAKER);
          place(grid, ox + 20, oy + ly, T.PROP_SPEAKER);
          place(grid, ox + 23, oy + ly, T.PROP_SPEAKER);
        }
        // Record crate stacks (local x 10-16, y 7-10)
        for (let lx = 9; lx <= 9; lx++) {
          place(grid, ox + lx, oy + 7, T.PROP_CART);
          place(grid, ox + lx, oy + 9, T.PROP_CART);
        }
        // Deckchair listening area (local x 9-9, y 13-14)
        place(grid, ox + 9, oy + 13, T.PROP_DECKCHAIR);
        place(grid, ox + 9, oy + 14, T.PROP_DECKCHAIR);
        // Flower scatter bottom (local x 1-8, y 8-17)
        for (let ly = 8; ly <= 17; ly++) {
          for (let lx = 1; lx <= 8; lx++) {
            const r = sr(lx, ly, 80);
            if (r < 0.18) place(grid, ox + lx, oy + ly, r < 0.09 ? T.FLOWER_Y : T.FLOWER_R);
          }
        }
        break;
      }

      // ── ITERATE HQ ──────────────────────────────────────────────
      // HQ building right. Trophy wall structure left. Strategy boards
      // centre. Night-glass floor throughout. Champion arch centre-bottom.
      case "iterate": {
        // Trophy wall cluster on left structure (local x 1-6, y 8-16)
        for (let ly = 8; ly <= 16; ly++) {
          for (let lx = 1; lx <= 6; lx++) {
            if (sr(lx, ly, 90) < 0.40) place(grid, ox + lx, oy + ly, T.PROP_TROPHY);
          }
        }
        // Strategy boards centre (local x 9, y 9-15 every 2)
        for (let ly = 9; ly <= 15; ly += 2) place(grid, ox + 9, oy + ly, T.PROP_PRICETAG);
        // Neon pylon pair (local x 9+16, y 17)
        place(grid, ox + 9,  oy + 17, T.PROP_NEON_PYLON);
        place(grid, ox + 16, oy + 17, T.PROP_NEON_PYLON);
        // Server row in front of HQ (local x 17-24, y 9)
        for (let lx = 17; lx <= 24; lx += 2) place(grid, ox + lx, oy + 9, T.PROP_SERVER);
        // Night floor on HQ side
        for (let ly = 9; ly <= 17; ly++) {
          for (let lx = 17; lx <= 24; lx++) {
            if (grid[oy + ly]?.[ox + lx] === groundTileFor("night"))
              place(grid, ox + lx, oy + ly, T.NIGHT_FLOOR);
          }
        }
        break;
      }

    } // end switch
  } // end for zones
} // end paintZoneLayout



// ─── Main world builder ────────────────────────────────────────
export function buildWorld(): TileCode[][] {
  const w = WORLD_W, h = WORLD_H;

  // 1. Base fill
  const grid: TileCode[][] = Array.from({ length: h }, () =>
    new Array<TileCode>(w).fill(T.ROUTE_GRASS)
  );

  // 2. Hard world borders
  for (let y = 0; y < h; y++) {
    grid[y][0] = T.TREE; grid[y][1] = T.TREE;
    grid[y][w - 1] = T.TREE; grid[y][w - 2] = T.TREE;
  }
  for (let x = 0; x < w; x++) {
    grid[0][x] = T.TREE; grid[1][x] = T.TREE;
    grid[h - 1][x] = T.TREE; grid[h - 2][x] = T.TREE;
  }

  // 3. Zone ground fills + tree border walls
  for (const z of ZONES) {
    const base = groundTileFor(z.theme.ground);
    fill(grid, z.ox, z.oy, z.ox + z.w, z.oy + z.h, base);

    // Left/right tree walls
    for (let y = z.oy; y < z.oy + z.h; y++) {
      if (z.ox - 1 >= 0) grid[y][z.ox - 1] = T.TREE;
      if (z.ox - 2 >= 0) grid[y][z.ox - 2] = T.TREE;
      if (z.ox + z.w < w) grid[y][z.ox + z.w] = T.TREE;
      if (z.ox + z.w + 1 < w) grid[y][z.ox + z.w + 1] = T.TREE;
    }
    // Top/bottom tree walls (gap at path)
    for (let x = z.ox; x < z.ox + z.w; x++) {
      const pc = isPath(x);
      if (z.oy - 1 >= 0 && !pc) grid[z.oy - 1][x] = T.TREE;
      const bb = z.oy + z.h;
      if (bb < h && !pc) grid[bb][x] = T.TREE;
    }
  }

  // 4. Central path corridor
  for (let y = 2; y < h - 2; y++) {
    let pathTile: TileCode = T.PATH;
    for (const z of ZONES) {
      if (y >= z.oy && y < z.oy + z.h) { pathTile = groundTileFor(z.theme.ground); break; }
    }
    for (let x = PATH_X1; x < PATH_X2; x++) grid[y][x] = pathTile;
    let inZone = ZONES.some(z => y >= z.oy && y < z.oy + z.h);
    if (!inZone) {
      if (PATH_X1 - 1 >= 0) grid[y][PATH_X1 - 1] = T.TREE;
      if (PATH_X2 < w)       grid[y][PATH_X2]     = T.TREE;
    }
  }

  // 5. Route scenery
  paintRoutes(grid, w, h);

  // 6. Arch gates
  paintZoneArches(grid, h);

  // 7. Buildings (primary)
  for (const z of ZONES) {
    paintBuilding(grid, z.building, z.ox, z.oy, w, h);
    if (z.building2) paintBuilding2(grid, z.building2, z.ox, z.oy, w, h);
  }

  // 8. Hand-crafted per-zone content
  paintZoneLayout(grid, w, h);

  return grid;
}
