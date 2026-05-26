// World builder: linear south-flowing layout with proper zone separation,
// tree-bordered routes, wild grass patches, and visible buildings.

import { ZONES, WORLD_W, WORLD_H } from "./data";
import { T, groundTileFor, type TileCode } from "./tiles";

// Zone width/height from data (26 × 20)
const ZONE_H  = 20;
const ROUTE_H = 10;  // tiles between zone bottom and next zone top

// The path runs down the CENTER of the world: column 38..41 (4 tiles wide)
const PATH_X1 = 38;
const PATH_X2 = 42;  // exclusive

// ─── Per-zone props ───────────────────────────────────────────────────────
const ZONE_PROPS: Record<string, TileCode[]> = {
  home:       [T.PROP_DECKCHAIR, T.FLOWER_Y, T.FLOWER_R, T.TREE],
  origin:     [T.PROP_CART, T.FLOWER_Y, T.FLOWER_R, T.PROP_DECKCHAIR],
  grp:        [T.PROP_PRICETAG, T.PROP_CART, T.FLOWER_Y, T.TREE],
  hab:        [T.PROP_BRICK_PLANT, T.PROP_BRICK_PLANT, T.TREE, T.FENCE],
  ai:         [T.PROP_SERVER, T.PROP_NEON_PYLON, T.PROP_SERVER, T.PROP_NEON_PYLON],
  investopad: [T.PROP_NEON_PYLON, T.PROP_TROPHY, T.PROP_NEON_PYLON],
  sole:       [T.PROP_RACK, T.PROP_SPEAKER, T.PROP_RACK, T.PROP_PRICETAG],
  fere:       [T.PROP_CANDLESTICK, T.PROP_NEON_PYLON, T.PROP_CANDLESTICK],
  ccd:        [T.PROP_SPEAKER, T.PROP_TROPHY, T.PROP_SPEAKER],
  iterate:    [T.PROP_TROPHY, T.PROP_SERVER, T.PROP_NEON_PYLON, T.PROP_TROPHY],
};


export function buildWorld(): TileCode[][] {
  const w = WORLD_W, h = WORLD_H;

  // ── Step 1: Fill world with dark empty border ──────────────────
  const grid: TileCode[][] = Array.from({ length: h }, () =>
    new Array<TileCode>(w).fill(T.EMPTY)
  );

  // ── Step 2: Route grass background (accessible world area) ──────
  // The entire world column from x=2 to x=w-3 is route grass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      grid[y][x] = T.ROUTE_GRASS;
    }
  }

  // ── Step 3: Hard world borders — impassable tree wall ───────────
  for (let y = 0; y < h; y++) {
    grid[y][0] = T.TREE; grid[y][1] = T.TREE;
    grid[y][w-1] = T.TREE; grid[y][w-2] = T.TREE;
  }
  for (let x = 0; x < w; x++) {
    grid[0][x] = T.TREE; grid[1][x] = T.TREE;
    grid[h-1][x] = T.TREE; grid[h-2][x] = T.TREE;
  }

  // ── Step 4: Zone interiors ──────────────────────────────────────
  for (const z of ZONES) {
    const base = groundTileFor(z.theme.ground);
    for (let y = z.oy; y < z.oy + z.h && y < h; y++) {
      for (let x = z.ox; x < z.ox + z.w && x < w; x++) {
        grid[y][x] = base;
      }
    }

    // Zone border: thick tree walls on left, right, and top edges
    // Left wall
    for (let y = z.oy; y < z.oy + z.h; y++) {
      if (z.ox - 1 >= 0) grid[y][z.ox - 1] = T.TREE;
      if (z.ox - 2 >= 0) grid[y][z.ox - 2] = T.TREE;
    }
    // Right wall
    for (let y = z.oy; y < z.oy + z.h; y++) {
      if (z.ox + z.w < w) grid[y][z.ox + z.w] = T.TREE;
      if (z.ox + z.w + 1 < w) grid[y][z.ox + z.w + 1] = T.TREE;
    }
    // Top wall (except don't block path entry from north)
    for (let x = z.ox; x < z.ox + z.w; x++) {
      if (z.oy - 1 >= 0) {
        // Only place tree if this column is not the path column
        const isPathCol = x >= PATH_X1 && x < PATH_X2;
        if (!isPathCol) grid[z.oy - 1][x] = T.TREE;
      }
    }
    // Bottom wall (except path exit)
    for (let x = z.ox; x < z.ox + z.w; x++) {
      const isPathCol = x >= PATH_X1 && x < PATH_X2;
      const byBottom = z.oy + z.h;
      if (byBottom < h && !isPathCol) grid[byBottom][x] = T.TREE;
    }
  }

  // ── Step 5: Central path corridor ─────────────────────────────
  // The 4-tile-wide path runs the full height of the world.
  // Inside zone areas it transitions to the zone ground.
  // In route areas it is PATH tile with tree walls flanking it.
  for (let y = 2; y < h - 2; y++) {
    // Determine what type of tile the path gets at this y
    let pathTile: TileCode = T.PATH;

    // Check if inside a zone
    for (const z of ZONES) {
      if (y >= z.oy && y < z.oy + z.h) {
        pathTile = groundTileFor(z.theme.ground);
        break;
      }
    }

    for (let x = PATH_X1; x < PATH_X2; x++) {
      grid[y][x] = pathTile;
    }

    // Path walls — only in route areas (not in zone interiors)
    let inZone = false;
    for (const z of ZONES) {
      if (y >= z.oy && y < z.oy + z.h) { inZone = true; break; }
    }
    if (!inZone) {
      if (PATH_X1 - 1 >= 0) grid[y][PATH_X1 - 1] = T.TREE;
      if (PATH_X2 < w)       grid[y][PATH_X2]     = T.TREE;
    }
  }

  // ── Step 6: Wild grass patches in route areas ──────────────────
  // Between each pair of zones, scatter tall grass for wild encounters
  for (let i = 0; i < ZONES.length - 1; i++) {
    const zoneBottom = ZONES[i].oy + ZONES[i].h;
    const nextTop    = ZONES[i + 1].oy;
    const routeMid   = Math.floor((zoneBottom + nextTop) / 2);

    // Place tall grass patches on both sides of the path
    // Left side patch
    for (let y = routeMid - 2; y <= routeMid + 2; y++) {
      for (let x = 10; x < PATH_X1 - 2; x++) {
        const seed = (x * 7 + y * 13) % 100;
        if (seed < 35) grid[y][x] = T.TALL_GRASS;
        else if (seed < 50) grid[y][x] = T.FLOWER_R;
        else if (seed < 55) grid[y][x] = T.FLOWER_Y;
        else if (seed < 62) grid[y][x] = T.TREE;
      }
    }
    // Right side patch
    for (let y = routeMid - 2; y <= routeMid + 2; y++) {
      for (let x = PATH_X2 + 2; x < w - 8; x++) {
        const seed = (x * 11 + y * 7) % 100;
        if (seed < 35) grid[y][x] = T.TALL_GRASS;
        else if (seed < 48) grid[y][x] = T.FLOWER_Y;
        else if (seed < 53) grid[y][x] = T.FLOWER_R;
        else if (seed < 62) grid[y][x] = T.TREE;
      }
    }
    // Dense tree strips at zone transitions (boundary feel)
    for (let x = 3; x < w - 3; x++) {
      const isPath = x >= PATH_X1 && x < PATH_X2;
      if (!isPath) {
        if (zoneBottom < h) grid[zoneBottom][x] = T.TREE;
        if (nextTop - 1 >= 0) grid[nextTop - 1][x] = T.TREE;
      }
    }
  }

  // ── Step 7: Zone buildings + content ──────────────────────────
  placeZoneContent(grid, w, h);

  return grid;
}

// ─── Building painter — uses proper WALL/ROOF tiles ───────────────────────
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

      const isRoof    = gy === b.y;
      const isFront   = gy === b.y + b.h - 1;
      const isDoor    = gx === b.x + b.doorX && isFront;
      const isMat     = gx === b.x + b.doorX && gy === b.y + b.h;
      const isSideWall = gx === b.x || gx === b.x + b.w - 1;

      if (isDoor)         grid[wy][wx] = T.DOOR;
      else if (isRoof)    grid[wy][wx] = T.BUILDING_ROOF;
      else if (isSideWall || isFront) grid[wy][wx] = T.BUILDING_WALL;
      else                grid[wy][wx] = T.BUILDING_WALL; // interior
    }
  }
  // Red mat tile right below the door
  const matWx = zoneOx + b.x + b.doorX;
  const matWy = zoneOy + b.y + b.h;
  if (matWx >= 0 && matWy >= 0 && matWx < worldW && matWy < worldH) {
    grid[matWy][matWx] = T.MAT;
  }
}

// ─── Zone content ─────────────────────────────────────────────────────────
function placeZoneContent(grid: TileCode[][], w: number, h: number) {
  for (const z of ZONES) {
    const base  = groundTileFor(z.theme.ground);
    const props = ZONE_PROPS[z.id] ?? [];

    // Building
    paintBuilding(grid, z.building, z.ox, z.oy, w, h);

    // Sign
    const sx = z.ox + z.sign.x, sy = z.oy + z.sign.y;
    if (sx >= 0 && sy >= 0 && sx < w && sy < h) grid[sy][sx] = T.SIGN;

    // Badge
    const bx = z.ox + z.badge.x, by = z.oy + z.badge.y;
    if (bx >= 0 && by >= 0 && bx < w && by < h) grid[by][bx] = T.BADGE;

    // Press wall
    if (z.pressWall) {
      const px = z.ox + z.pressWall.x, py = z.oy + z.pressWall.y;
      if (px >= 0 && py >= 0 && px < w && py < h) grid[py][px] = T.BADGE;
    }

    // NPCs — ensure tile is walkable
    for (const npc of z.npcs) {
      const nx = z.ox + npc.x, ny = z.oy + npc.y;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h) grid[ny][nx] = base;
    }

    // Random props scattered around zone interior (avoid near path/door)
    if (props.length > 0) {
      for (let py = z.oy + 2; py < z.oy + z.h - 2; py++) {
        for (let px = z.ox + 2; px < z.ox + z.w - 2; px++) {
          if (px < 0 || py < 0 || px >= w || py >= h) continue;
          if (grid[py][px] !== base) continue;
          // Don't place near path x
          if (px >= PATH_X1 - 2 && px < PATH_X2 + 2) continue;
          const seed = (px * 17 + py * 31 + z.id.charCodeAt(0)) % 100;
          if (seed < 12) {
            grid[py][px] = props[seed % props.length];
          }
        }
      }
    }

    // Decorative flowers / trees around zone perimeter (inside zone)
    for (let x = z.ox + 1; x < z.ox + z.w - 1; x++) {
      // Top inner row
      const ty = z.oy + 1;
      if (ty < h && grid[ty][x] === base) {
        const seed = (x * 13 + ty * 7) % 100;
        if (seed < 20 && !(x >= PATH_X1 && x < PATH_X2)) {
          grid[ty][x] = seed < 8 ? T.FLOWER_R : seed < 16 ? T.FLOWER_Y : T.TALL_GRASS;
        }
      }
    }
  }
}
