// World builder: linear south-flowing layout with rich zone variety,
// unique building layouts, decorative route corridors, water features,
// zone-entry arches, and dense thematic props.

import { ZONES, WORLD_W, WORLD_H } from "./data";
import { T, groundTileFor, type TileCode } from "./tiles";

const ZONE_H  = 20;
const ROUTE_H = 10;

// Path corridor: 6 tiles wide (widened from 4), center of world
const PATH_X1 = 37;
const PATH_X2 = 43; // exclusive — 6 tiles total

// ─── Per-zone props (thematic decorations) ─────────────────────────────────
const ZONE_PROPS: Record<string, TileCode[]> = {
  home:       [T.PROP_DECKCHAIR, T.FLOWER_Y, T.FLOWER_R, T.FENCE],
  origin:     [T.PROP_CART, T.FLOWER_Y, T.PROP_DECKCHAIR, T.FLOWER_R],
  grp:        [T.PROP_PRICETAG, T.PROP_CART, T.PROP_PRICETAG, T.FLOWER_Y],
  hab:        [T.PROP_BRICK_PLANT, T.PROP_BRICK_PLANT, T.FENCE, T.PROP_BRICK_PLANT],
  ai:         [T.PROP_SERVER, T.PROP_NEON_PYLON, T.PROP_SERVER, T.PROP_NEON_PYLON],
  investopad: [T.PROP_TROPHY, T.PROP_NEON_PYLON, T.PROP_TROPHY, T.PROP_NEON_PYLON],
  sole:       [T.PROP_RACK, T.PROP_SPEAKER, T.PROP_RACK, T.PROP_PRICETAG],
  fere:       [T.PROP_CANDLESTICK, T.PROP_NEON_PYLON, T.PROP_CANDLESTICK, T.PROP_NEON_PYLON],
  ccd:        [T.PROP_SPEAKER, T.PROP_TROPHY, T.PROP_SPEAKER, T.PROP_DECKCHAIR],
  iterate:    [T.PROP_TROPHY, T.PROP_SERVER, T.PROP_NEON_PYLON, T.PROP_TROPHY],
};

// ─── Per-zone unique fence / water / perimeter patterns ───────────────────
// Each zone gets a distinct "edge treatment" along its interior walls
const ZONE_BORDER_STYLE: Record<string, "fence" | "water" | "flowers" | "mixed" | "none"> = {
  home:       "fence",
  origin:     "flowers",
  grp:        "mixed",
  hab:        "fence",
  ai:         "none",      // neon pylons already do the job
  investopad: "water",
  sole:       "none",
  fere:       "none",
  ccd:        "flowers",
  iterate:    "mixed",
};

// ─── Route scenery type per pair of zones ─────────────────────────────────
// 0=home→origin, 1=origin→grp, ..., 8=ccd→iterate
const ROUTE_THEMES = [
  "meadow",   // home → origin  (flowers everywhere)
  "forest",   // origin → grp  (dense trees)
  "stream",   // grp → hab     (water strip)
  "boulders", // hab → ai      (stone pillars)
  "neon",     // ai → investopad (neon pylons in route)
  "mall",     // investopad → sole (price tags + racks)
  "crypto",   // sole → fere   (candlesticks)
  "garden",   // fere → ccd    (flowers + speakers)
  "skyline",  // ccd → iterate (trophies + pylons)
] as const;

// ─── seeded pseudo-random ─────────────────────────────────────────────────
function sr(x: number, y: number, salt = 0): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + salt * 53.3) * 43758.5453;
  return s - Math.floor(s);
}

export function buildWorld(): TileCode[][] {
  const w = WORLD_W, h = WORLD_H;

  // ── Step 1: Fill world with route grass ──────────────────────────────
  const grid: TileCode[][] = Array.from({ length: h }, () =>
    new Array<TileCode>(w).fill(T.ROUTE_GRASS)
  );

  // ── Step 2: Hard world borders ────────────────────────────────────────
  for (let y = 0; y < h; y++) {
    grid[y][0] = T.TREE; grid[y][1] = T.TREE;
    grid[y][w - 1] = T.TREE; grid[y][w - 2] = T.TREE;
  }
  for (let x = 0; x < w; x++) {
    grid[0][x] = T.TREE; grid[1][x] = T.TREE;
    grid[h - 1][x] = T.TREE; grid[h - 2][x] = T.TREE;
  }

  // ── Step 3: Zone interiors ────────────────────────────────────────────
  for (const z of ZONES) {
    const base = groundTileFor(z.theme.ground);
    for (let y = z.oy; y < z.oy + z.h && y < h; y++) {
      for (let x = z.ox; x < z.ox + z.w && x < w; x++) {
        grid[y][x] = base;
      }
    }

    // Zone border walls (tree walls left/right/top/bottom with path gap)
    for (let y = z.oy; y < z.oy + z.h; y++) {
      if (z.ox - 1 >= 0) grid[y][z.ox - 1] = T.TREE;
      if (z.ox - 2 >= 0) grid[y][z.ox - 2] = T.TREE;
      if (z.ox + z.w < w) grid[y][z.ox + z.w] = T.TREE;
      if (z.ox + z.w + 1 < w) grid[y][z.ox + z.w + 1] = T.TREE;
    }
    for (let x = z.ox; x < z.ox + z.w; x++) {
      const isPathCol = x >= PATH_X1 && x < PATH_X2;
      if (z.oy - 1 >= 0 && !isPathCol) grid[z.oy - 1][x] = T.TREE;
      const byBottom = z.oy + z.h;
      if (byBottom < h && !isPathCol) grid[byBottom][x] = T.TREE;
    }
  }

  // ── Step 4: Central path corridor ────────────────────────────────────
  for (let y = 2; y < h - 2; y++) {
    let pathTile: TileCode = T.PATH;
    for (const z of ZONES) {
      if (y >= z.oy && y < z.oy + z.h) {
        pathTile = groundTileFor(z.theme.ground);
        break;
      }
    }
    for (let x = PATH_X1; x < PATH_X2; x++) {
      grid[y][x] = pathTile;
    }
    let inZone = false;
    for (const z of ZONES) {
      if (y >= z.oy && y < z.oy + z.h) { inZone = true; break; }
    }
    if (!inZone) {
      if (PATH_X1 - 1 >= 0) grid[y][PATH_X1 - 1] = T.TREE;
      if (PATH_X2 < w)       grid[y][PATH_X2]     = T.TREE;
    }
  }

  // ── Step 5: Rich route scenery between zones ──────────────────────────
  paintRoutes(grid, w, h);

  // ── Step 6: Zone-entry arch gates ────────────────────────────────────
  paintZoneArches(grid, h);

  // ── Step 7: Zone buildings + content + unique border treatments ───────
  placeZoneContent(grid, w, h);

  return grid;
}

// ─── Route scenery painter ────────────────────────────────────────────────
function paintRoutes(grid: TileCode[][], w: number, h: number) {
  for (let i = 0; i < ZONES.length - 1; i++) {
    const zoneBottom = ZONES[i].oy + ZONES[i].h;
    const nextTop    = ZONES[i + 1].oy;
    const theme      = ROUTE_THEMES[i];
    const routeMid   = Math.floor((zoneBottom + nextTop) / 2);

    // Dense tree strips right at zone edges (creates a boundary feel)
    for (let x = 3; x < w - 3; x++) {
      const isPath = x >= PATH_X1 && x < PATH_X2;
      if (!isPath) {
        if (zoneBottom < h) grid[zoneBottom][x] = T.TREE;
        if (nextTop - 1 >= 0) grid[nextTop - 1][x] = T.TREE;
      }
    }

    // ── Dense tree walls flanking the path corridor ───────────────────────
    // Left wall: cols 3..PATH_X1-3 get solid trees except a decorative gap
    // Right wall: cols PATH_X2+2..w-3 get solid trees
    // This forces the player down the corridor — no wandering off
    for (let y = zoneBottom + 1; y < nextTop - 1; y++) {
      // Left dense forest wall (3 tiles deep)
      for (let x = 3; x < PATH_X1 - 2; x++) {
        const r = sr(x, y, i + 500);
        if (r < 0.78) grid[y][x] = T.TREE;
      }
      // Left shoulder (1-2 tile buffer next to path — light scatter)
      for (let x = PATH_X1 - 2; x < PATH_X1; x++) {
        const r = sr(x, y, i + 600);
        if (r < 0.30) grid[y][x] = T.TREE;
      }
      // Right shoulder
      for (let x = PATH_X2; x < PATH_X2 + 2; x++) {
        const r = sr(x, y, i + 700);
        if (r < 0.30) grid[y][x] = T.TREE;
      }
      // Right dense forest wall (3 tiles deep)
      for (let x = PATH_X2 + 2; x < w - 3; x++) {
        const r = sr(x, y, i + 800);
        if (r < 0.78) grid[y][x] = T.TREE;
      }
    }

    // Theme-specific route fill (path corridor only)
    for (let y = zoneBottom + 1; y < nextTop - 1; y++) {
      const inPath = (x: number) => x >= PATH_X1 && x < PATH_X2;

      switch (theme) {
        case "meadow": {
          // Scatter flowers on the path itself for beauty
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1000);
            if (r < 0.10) grid[y][x] = T.FLOWER_R;
            else if (r < 0.20) grid[y][x] = T.FLOWER_Y;
          }
          break;
        }
        case "forest": {
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1001);
            if (r < 0.06) grid[y][x] = T.FLOWER_Y;
          }
          break;
        }
        case "stream": {
          // Water strip crosses the path at mid
          if (y >= routeMid - 1 && y <= routeMid + 1) {
            for (let x = PATH_X1; x < PATH_X2; x++) {
              if (!inPath(x)) continue; // already done above
              grid[y][x] = T.WATER;
            }
          }
          break;
        }
        case "neon": {
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1003);
            if (r < 0.04) grid[y][x] = T.PROP_NEON_PYLON;
            else if (r < 0.12) grid[y][x] = T.NEON_FLOOR;
          }
          break;
        }
        case "mall": {
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1004);
            if (r < 0.04) grid[y][x] = T.PROP_RACK;
            else if (r < 0.10) grid[y][x] = T.MALL_FLOOR;
          }
          break;
        }
        case "crypto": {
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1005);
            if (r < 0.05) grid[y][x] = T.PROP_CANDLESTICK;
            else if (r < 0.14) grid[y][x] = T.CRYPTO_FLOOR;
          }
          break;
        }
        case "garden": {
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1006);
            if (r < 0.10) grid[y][x] = T.FLOWER_Y;
            else if (r < 0.18) grid[y][x] = T.FLOWER_R;
          }
          break;
        }
        case "skyline": {
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1007);
            if (r < 0.05) grid[y][x] = T.PROP_TROPHY;
            else if (r < 0.11) grid[y][x] = T.NIGHT_FLOOR;
          }
          break;
        }
        case "boulders": {
          for (let x = PATH_X1; x < PATH_X2; x++) {
            const r = sr(x, y, i + 1002);
            if (r < 0.06) grid[y][x] = T.STONE;
          }
          break;
        }
        default: break;
      }
    }
    // unused var suppression
    void routeMid;
  }
}

// ─── Zone-entry arch gates ─────────────────────────────────────────────────
// Place a 3-tile arch at the path entry of each zone (except home)
function paintZoneArches(grid: TileCode[][], h: number) {
  for (let i = 1; i < ZONES.length; i++) {
    const z = ZONES[i];
    const archY = z.oy - 1;
    if (archY < 2 || archY >= h) continue;
    // Arch spans the 6-tile path — L, 4×M, R
    grid[archY][PATH_X1]     = T.ARCH_L;
    grid[archY][PATH_X1 + 1] = T.ARCH_M;
    grid[archY][PATH_X1 + 2] = T.ARCH_M;
    grid[archY][PATH_X1 + 3] = T.ARCH_M;
    grid[archY][PATH_X1 + 4] = T.ARCH_M;
    grid[archY][PATH_X1 + 5] = T.ARCH_R;
  }
}

// ─── Building painter ─────────────────────────────────────────────────────
function paintBuilding(
  grid: TileCode[][],
  b: { x: number; y: number; w: number; h: number; doorX: number; color: string; roof: string },
  zoneOx: number, zoneOy: number,
  worldW: number, worldH: number,
) {
  for (let gy = b.y; gy < b.y + b.h; gy++) {
    for (let gx = b.x; gx < b.x + b.w; gx++) {
      const wx = zoneOx + gx, wy = zoneOy + gy;
      if (wx < 0 || wy < 0 || wx >= worldW || wy >= worldH) continue;

      const isRoof     = gy === b.y;
      const isFront    = gy === b.y + b.h - 1;
      const isDoor     = gx === b.x + b.doorX && isFront;
      const isSideWall = gx === b.x || gx === b.x + b.w - 1;

      if (isDoor)                        grid[wy][wx] = T.DOOR;
      else if (isRoof)                   grid[wy][wx] = T.BUILDING_ROOF;
      else if (isSideWall || isFront)    grid[wy][wx] = T.BUILDING_WALL;
      else                               grid[wy][wx] = T.BUILDING_WALL;
    }
  }
  // Mat tile right below the door
  const matWx = zoneOx + b.x + b.doorX;
  const matWy = zoneOy + b.y + b.h;
  if (matWx >= 0 && matWy >= 0 && matWx < worldW && matWy < worldH) {
    grid[matWy][matWx] = T.MAT;
  }
}

// ─── Unique zone border treatment ─────────────────────────────────────────
function paintZoneBorder(grid: TileCode[][], z: typeof ZONES[0], w: number, h: number) {
  const style = ZONE_BORDER_STYLE[z.id] ?? "none";
  if (style === "none") return;

  const base = groundTileFor(z.theme.ground);
  const isPathCol = (x: number) => x >= PATH_X1 && x < PATH_X2;

  // Paint inner perimeter (1 tile inside zone edge) with the chosen style
  for (let x = z.ox + 1; x < z.ox + z.w - 1; x++) {
    if (isPathCol(x)) continue;

    // Top inner row
    const ty = z.oy + 1;
    if (ty < h && grid[ty][x] === base) {
      const r = sr(x, ty, z.index);
      if (style === "fence" && (x - z.ox) % 3 !== 0) grid[ty][x] = T.FENCE;
      else if (style === "water" && r < 0.6) grid[ty][x] = T.WATER;
      else if (style === "flowers") {
        if (r < 0.25) grid[ty][x] = T.FLOWER_R;
        else if (r < 0.48) grid[ty][x] = T.FLOWER_Y;
      }
      else if (style === "mixed") {
        if (r < 0.2) grid[ty][x] = T.FLOWER_R;
        else if (r < 0.35) grid[ty][x] = T.TALL_GRASS;
        else if (r < 0.45) grid[ty][x] = T.FENCE;
      }
    }

    // Bottom inner row (above zone exit)
    const by = z.oy + z.h - 2;
    if (by >= 0 && by < h && grid[by][x] === base) {
      const r = sr(x, by, z.index + 100);
      if (style === "flowers") {
        if (r < 0.25) grid[by][x] = T.FLOWER_Y;
        else if (r < 0.48) grid[by][x] = T.FLOWER_R;
      } else if (style === "fence" && (x - z.ox) % 4 !== 0) {
        grid[by][x] = T.FENCE;
      }
    }
  }

  // Left inner column
  for (let y = z.oy + 2; y < z.oy + z.h - 2; y++) {
    const lx = z.ox + 1;
    if (lx >= 0 && lx < w && grid[y][lx] === base) {
      const r = sr(lx, y, z.index + 200);
      if (style === "fence" && (y - z.oy) % 3 !== 0) grid[y][lx] = T.FENCE;
      else if (style === "water" && r < 0.55) grid[y][lx] = T.WATER;
      else if (style === "flowers" && r < 0.35) {
        grid[y][lx] = r < 0.18 ? T.FLOWER_R : T.FLOWER_Y;
      }
    }
  }

  // Right inner column (only if it doesn't overlap path)
  for (let y = z.oy + 2; y < z.oy + z.h - 2; y++) {
    const rx = z.ox + z.w - 2;
    if (rx >= 0 && rx < w && !isPathCol(rx) && grid[y][rx] === base) {
      const r = sr(rx, y, z.index + 300);
      if (style === "fence" && (y - z.oy) % 3 !== 0) grid[y][rx] = T.FENCE;
      else if (style === "water" && r < 0.55) grid[y][rx] = T.WATER;
      else if (style === "flowers" && r < 0.35) {
        grid[y][rx] = r < 0.18 ? T.FLOWER_Y : T.FLOWER_R;
      }
    }
  }
}

// ─── Zone content placement ────────────────────────────────────────────────
function placeZoneContent(grid: TileCode[][], w: number, h: number) {
  for (const z of ZONES) {
    const base  = groundTileFor(z.theme.ground);
    const props = ZONE_PROPS[z.id] ?? [];

    // Building
    paintBuilding(grid, z.building, z.ox, z.oy, w, h);

    // Unique zone border treatment
    paintZoneBorder(grid, z, w, h);

    // Sign
    const sx = z.ox + z.sign.x, sy = z.oy + z.sign.y;
    if (sx >= 0 && sy >= 0 && sx < w && sy < h) grid[sy][sx] = T.SIGN;

    // Badge
    const bx = z.ox + z.badge.x, by = z.oy + z.badge.y;
    if (bx >= 0 && by >= 0 && bx < w && by < h) grid[by][bx] = T.BADGE;

    // Press wall
    if (z.pressWall) {
      const px2 = z.ox + z.pressWall.x, py2 = z.oy + z.pressWall.y;
      if (px2 >= 0 && py2 >= 0 && px2 < w && py2 < h) grid[py2][px2] = T.BADGE;
    }

    // NPCs — ensure standing tile is walkable ground
    for (const npc of z.npcs) {
      const nx = z.ox + npc.x, ny = z.oy + npc.y;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h) grid[ny][nx] = base;
    }

    // ── Dense thematic props (higher density than before) ────────────────
    if (props.length > 0) {
      for (let py = z.oy + 2; py < z.oy + z.h - 2; py++) {
        for (let px3 = z.ox + 2; px3 < z.ox + z.w - 2; px3++) {
          if (px3 < 0 || py < 0 || px3 >= w || py >= h) continue;
          if (grid[py][px3] !== base) continue;
          // Don't place on or adjacent to path corridor
          if (px3 >= PATH_X1 - 2 && px3 < PATH_X2 + 2) continue;
          const seed = sr(px3, py, z.id.charCodeAt(0));
          // 18% prop density (up from 12%)
          if (seed < 0.18) {
            const propIdx = Math.floor(seed * props.length / 0.18) % props.length;
            grid[py][px3] = props[propIdx];
          }
        }
      }
    }

    // ── Perimeter flowers / tall grass (inner zone beauty layer) ─────────
    for (let x = z.ox + 2; x < z.ox + z.w - 2; x++) {
      const ty = z.oy + 2;
      if (ty < h && grid[ty][x] === base && !(x >= PATH_X1 && x < PATH_X2)) {
        const seed = sr(x, ty, z.index * 7);
        if (seed < 0.22) {
          grid[ty][x] = seed < 0.09 ? T.FLOWER_R : seed < 0.16 ? T.FLOWER_Y : T.TALL_GRASS;
        }
      }
      // Second row of flowers for lush feel
      const ty2 = z.oy + 3;
      if (ty2 < h && grid[ty2][x] === base && !(x >= PATH_X1 && x < PATH_X2)) {
        const seed2 = sr(x, ty2, z.index * 11);
        if (seed2 < 0.12) {
          grid[ty2][x] = seed2 < 0.06 ? T.FLOWER_Y : T.FLOWER_R;
        }
      }
    }

    // ── Scattered tall grass clusters inside zone ─────────────────────────
    // Add 2-3 natural grass patches per zone (for zones with grass ground)
    if (z.theme.ground === "grass") {
      for (let cluster = 0; cluster < 3; cluster++) {
        const cx2 = z.ox + 3 + ((z.id.charCodeAt(0) * 7 + cluster * 13) % (z.w - 6));
        const cy2 = z.oy + 4 + ((z.id.charCodeAt(1) * 11 + cluster * 17) % (z.h - 7));
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const gx = cx2 + dx, gy = cy2 + dy;
            if (gx < 0 || gy < 0 || gx >= w || gy >= h) continue;
            if (gx >= PATH_X1 - 1 && gx < PATH_X2 + 1) continue;
            if (grid[gy][gx] === base) {
              const r = sr(gx, gy, cluster * 37);
              if (r < 0.55) grid[gy][gx] = T.TALL_GRASS;
              else if (r < 0.70) grid[gy][gx] = T.FLOWER_R;
            }
          }
        }
      }
    }
  }
}
