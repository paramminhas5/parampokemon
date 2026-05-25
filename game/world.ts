// Non-linear overworld: 3-column zigzag layout with horizontal corridors.
// Col A: home → origin → grp → fere → iterate
// Col B: ai → sole → ccd
// Col C: investopad → hab

import { ZONES, WORLD_W, WORLD_H } from "./data";
import { T, groundTileFor, type TileCode } from "./tiles";

// Per-zone prop cocktail
const ZONE_PROPS: Record<string, TileCode[]> = {
  home:       [T.PROP_DECKCHAIR, T.FLOWER_Y, T.FLOWER_R],
  origin:     [T.PROP_CART,      T.FLOWER_Y, T.PROP_DECKCHAIR],
  grp:        [T.PROP_PRICETAG,  T.PROP_CART,      T.FLOWER_Y],
  hab:        [T.PROP_BRICK_PLANT, T.PROP_BRICK_PLANT, T.TREE],
  ai:         [T.PROP_SERVER,    T.PROP_NEON_PYLON, T.PROP_SERVER],
  investopad: [T.PROP_NEON_PYLON, T.PROP_TROPHY,   T.PROP_NEON_PYLON],
  sole:       [T.PROP_RACK,      T.PROP_SPEAKER,   T.PROP_RACK],
  fere:       [T.PROP_CANDLESTICK, T.PROP_NEON_PYLON, T.PROP_CANDLESTICK],
  ccd:        [T.PROP_SPEAKER,   T.PROP_TROPHY,    T.PROP_SPEAKER],
  iterate:    [T.PROP_TROPHY,    T.PROP_SERVER,    T.PROP_NEON_PYLON],
};

function decoFor(zoneId: string, i: number): TileCode {
  const grass = [T.FLOWER_R, T.FLOWER_Y, T.TALL_GRASS, T.TREE];
  switch (zoneId) {
    case "home":
    case "origin":
    case "grp":   return grass[i % grass.length];
    case "hab":   return i % 3 === 0 ? T.PROP_BRICK_PLANT : T.TREE;
    case "ai":    return i % 2 === 0 ? T.PROP_SERVER : T.PROP_NEON_PYLON;
    case "investopad": return T.PROP_NEON_PYLON;
    case "sole":  return i % 2 === 0 ? T.PROP_RACK : T.PROP_SPEAKER;
    case "fere":  return T.PROP_CANDLESTICK;
    case "ccd":   return T.PROP_SPEAKER;
    case "iterate": return i % 2 === 0 ? T.PROP_TROPHY : T.PROP_NEON_PYLON;
    default:      return T.TALL_GRASS;
  }
}

// ─── Corridor definitions ─────────────────────────────────────────
// Layout (WORLD_W=60, WORLD_H=160):
//   Col A (x=3..25): home(0) → origin(19) → grp(40) → fere(102) → iterate(140)
//   Col B (x=17..39): ai(62) → sole(84) → ccd(122)
//   Col C (x=34..56): investopad(19) → hab(84)
//
// Each corridor: { x1, x2, y1, y2, ground } fills tiles (x1..x2 excl, y1..y2 excl).
// Corridor tiles are placed after zone interiors and won't overwrite zone interiors.

type Corridor = { x1: number; x2: number; y1: number; y2: number; ground: TileCode };
const CORRIDORS: Corridor[] = [
  // ── Main south spine — Col A (x=9..11) ─────────────────────────
  { x1: 9,  x2: 11, y1: 18, y2: 21, ground: T.PATH  },  // Home → Origin
  { x1: 9,  x2: 11, y1: 37, y2: 41, ground: T.SAND  },  // Origin → GRP
  { x1: 9,  x2: 11, y1: 57, y2: 103,ground: T.SAND  },  // GRP → Fere
  { x1: 9,  x2: 11, y1: 120,y2: 141,ground: T.NIGHT_FLOOR }, // Fere → Iterate

  // ── Col B south spine (x=17..19) ────────────────────────────────
  { x1: 17, x2: 19, y1: 80, y2: 85, ground: T.NEON_FLOOR }, // AI → Sole
  { x1: 17, x2: 19, y1: 102,y2: 124,ground: T.STUDIO_FLOOR },// Sole → CCD

  // ── Horizontal branches ───────────────────────────────────────────
  // Origin → AI: x=11..17 at y=55..62 (origin bottom through AI top)
  { x1: 11, x2: 18, y1: 55, y2: 63, ground: T.SAND  },
  // GRP → Investopad: x=11..34 at y=57..61
  { x1: 11, x2: 36, y1: 57, y2: 61, ground: T.NEON_FLOOR },
  // Sole → Fere west: x=11..17 at y=80..84
  { x1: 11, x2: 18, y1: 80, y2: 85, ground: T.MALL_FLOOR },
  // Sole → HAB east: x=17..34 at y=80..84
  { x1: 17, x2: 36, y1: 80, y2: 85, ground: T.STUDIO_FLOOR },
  // Investopad south spine (col C, x=34..36): y=57..84
  { x1: 34, x2: 36, y1: 57, y2: 85, ground: T.NEON_FLOOR },
];

/** True if tile (x,y) is inside any zone's interior. */
function tileInZone(x: number, y: number): boolean {
  for (const z of ZONES) {
    if (y >= z.oy && y < z.oy + z.h && x >= z.ox && x < z.ox + z.w) return true;
  }
  return false;
}

/** True if tile (x,y) is inside any corridor strip. */
function tileInCorridor(x: number, y: number): boolean {
  for (const c of CORRIDORS) {
    if (x >= c.x1 && x < c.x2 && y >= c.y1 && y < c.y2) return true;
  }
  return false;
}

/** True if any orthogonal neighbour of (x,y) in grid is a path tile. */
function isPathAdjacent(grid: TileCode[][], x: number, y: number): boolean {
  const neighbors = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dx, dy] of neighbors) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && ny < grid.length && nx < grid[0].length) {
      const t = grid[ny][nx];
      if (t === T.PATH || t === T.SAND || t === T.NEON_FLOOR ||
          t === T.STUDIO_FLOOR || t === T.MALL_FLOOR || t === T.NIGHT_FLOOR ||
          t === T.DOOR) return true;
    }
  }
  return false;
}

export function buildWorld(): TileCode[][] {
  const w = WORLD_W, h = WORLD_H;

  // ─── Step 1: Fill entire world with route grass ─────────────────
  const grid: TileCode[][] = Array.from({ length: h },
    () => new Array<TileCode>(w).fill(T.ROUTE_GRASS));

  // ─── Step 2: World border columns (trees on both edges) ────────
  for (let y = 0; y < h; y++) {
    grid[y][0] = T.TREE;
    grid[y][1] = T.TREE;
    grid[y][w - 1] = T.TREE;
    grid[y][w - 2] = T.TREE;
  }

  // ─── Step 3: Zone interiors ─────────────────────────────────────
  for (const z of ZONES) {
    const base = groundTileFor(z.theme.ground);

    for (let y = z.oy; y < z.oy + z.h && y < h; y++) {
      for (let x = z.ox; x < z.ox + z.w && x < w; x++) {
        // Corridor tiles win — preserve them so zones don't overwrite walkways
        if (!tileInCorridor(x, y)) {
          grid[y][x] = base;
        }
      }
    }

    // Zone borders: trees/fences on left and right edges, unless a corridor touches it
    for (let y = z.oy; y < z.oy + z.h && y < h; y++) {
      const lx = z.ox - 1;
      if (lx >= 0 && !isPathAdjacent(grid, lx, y) && !tileInCorridor(lx, y)) {
        grid[y][lx] = y % 4 === 0 ? T.TREE : T.FENCE;
      }
      const rx = z.ox + z.w;
      if (rx < w && !isPathAdjacent(grid, rx, y) && !tileInCorridor(rx, y)) {
        grid[y][rx] = y % 4 === 0 ? T.TREE : T.FENCE;
      }
    }
  }

  // ─── Step 4: Corridors (on top of route grass) ───────────────────
  for (const c of CORRIDORS) {
    for (let y = Math.max(0, c.y1); y < Math.min(h, c.y2); y++) {
      for (let x = Math.max(0, c.x1); x < Math.min(w, c.x2); x++) {
        // Only paint route tiles, not zone interiors
        if (!tileInZone(x, y)) {
          grid[y][x] = c.ground;
        }
      }
    }
    placeArchAtCorridor(grid, c, w, h);
  }

  // ─── Step 5: Zone buildings, signs, NPCs, badge mats ─────────────
  placeZoneContent(grid, w, h);

  return grid;
}

// ─── Arch placement ──────────────────────────────────────────────
function placeArchAtCorridor(grid: TileCode[][], c: Corridor, w: number, h: number) {
  const midX = Math.floor((c.x1 + c.x2) / 2);
  for (const z of ZONES) {
    if (midX >= z.ox && midX < z.ox + z.w && c.y1 === z.oy + z.h) {
      const y = Math.max(0, c.y1 - 1);
      if (y < h) grid[y][midX] = T.DOOR;
    }
    if (midX >= z.ox && midX < z.ox + z.w && c.y2 === z.oy) {
      if (c.y1 < h) grid[c.y1][midX] = T.DOOR;
    }
  }
}

// ─── Zone content: building, sign, NPCs, badge mat ──────────────
function placeZoneContent(grid: TileCode[][], w: number, h: number) {
  for (const z of ZONES) {
    const props = ZONE_PROPS[z.id] ?? [];
    const base  = groundTileFor(z.theme.ground);

    // — Building ─────────────────────────────────────────────────
    paintBuilding(grid, z.building, base, w, h);

    // — Sign ────────────────────────────────────────────────────
    const { sign } = z;
    if (sign.y < h && sign.x < w) grid[sign.y][sign.x] = T.SIGN;

    // — NPCs ────────────────────────────────────────────────────
    for (const n of z.npcs) {
      if (n.y < h && n.x < w) grid[n.y][n.x] = base;
    }

    // — Badge ───────────────────────────────────────────────────
    const { badge } = z;
    if (badge.y < h && badge.x < w) grid[badge.y][badge.x] = T.BADGE;

    // — Press wall / battle mat ─────────────────────────────────
    if (z.pressWall && z.pressWall.y < h && z.pressWall.x < w) {
      grid[z.pressWall.y][z.pressWall.x] = T.BADGE;
    }

    // — Props & decorative tiles ────────────────────────────────
    const propSet = new Set(props);
    for (let py = z.oy + 2; py < z.oy + z.h - 2; py++) {
      for (let px = z.ox + 2; px < z.ox + z.w - 2; px++) {
        if (py < 0 || py >= h || px < 0 || px >= w) continue;
        if (grid[py][px] !== base) continue;
        const t = grid[py][px - 1];
        if (t === T.DOOR || t === T.SIGN || t === T.BADGE) continue;
        let propCount = 0;
        for (const p of props) if (propSet.has(p)) propCount++;
        if (propCount === 0) continue;
        if (Math.random() < 0.15) {
          const idx = Math.floor(Math.random() * props.length);
          grid[py][px] = props[idx];
        }
      }
    }
  }
}

// ─── Building painter ─────────────────────────────────────────────
function paintBuilding(
  grid: TileCode[][],
  b: { x: number; y: number; w: number; h: number; color: string; roof: string },
  base: TileCode,
  w: number, h: number,
) {
  const { x: bx, y: by, w: bw, h: bh } = b;
  for (let gy = by; gy < by + bh && gy < h; gy++) {
    for (let gx = bx; gx < bx + bw && gx < w; gx++) {
      const isWall   = gx === bx || gx === bx + bw - 1 || gy === by + bh - 1;
      const isWindow = !isWall && (gy === by + 1 || gy === by + 2);
      const isDoor   = gx === Math.floor(bx + bw / 2) && gy === by + bh - 1;
      const isRoof   = gy === by;

      if (isDoor)   grid[gy][gx] = T.DOOR;
      else if (isWindow) grid[gy][gx] = base;
      else if (isRoof)   grid[gy][gx] = base;
      else if (isWall)   grid[gy][gx] = base;
      else grid[gy][gx] = base;
    }
  }
}