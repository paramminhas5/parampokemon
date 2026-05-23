// Vertical overworld: zones stacked top-to-bottom, connected by route bands.
// Each zone gets a distinct identity kit (extra prop clusters, varied path
// shape, decoration motif) so no two worlds feel the same.

import { ZONES, WORLD_W, WORLD_H } from "./data";
import { T, groundTileFor, type TileCode } from "./tiles";

// Per-zone prop cocktail. Each zone picks 2-3 signature prop tiles for its
// motif clusters, so e.g. Origin gets carts + flowers, Fere gets candlesticks
// + neon pylons, SoleSearch gets sneaker racks + speakers, etc.
const ZONE_PROPS: Record<string, TileCode[]> = {
  home:       [T.PROP_DECKCHAIR, T.FLOWER_Y, T.FLOWER_R],
  origin:     [T.PROP_CART, T.FLOWER_Y, T.PROP_DECKCHAIR],
  grp:        [T.PROP_PRICETAG, T.PROP_CART, T.FLOWER_Y],
  hab:        [T.PROP_BRICK_PLANT, T.PROP_BRICK_PLANT, T.TREE],
  ai:         [T.PROP_SERVER, T.PROP_NEON_PYLON, T.PROP_SERVER],
  investopad: [T.PROP_NEON_PYLON, T.PROP_TROPHY, T.PROP_NEON_PYLON],
  sole:       [T.PROP_RACK, T.PROP_SPEAKER, T.PROP_RACK],
  fere:       [T.PROP_CANDLESTICK, T.PROP_NEON_PYLON, T.PROP_CANDLESTICK],
  ccd:        [T.PROP_SPEAKER, T.PROP_TROPHY, T.PROP_SPEAKER],
  iterate:    [T.PROP_TROPHY, T.PROP_SERVER, T.PROP_NEON_PYLON],
};

// Per-zone decoration motif used to fill the apron with ground variety.
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

export function buildWorld(): TileCode[][] {
  const w = WORLD_W, h = WORLD_H;
  const grid: TileCode[][] = Array.from({ length: h }, () => new Array<TileCode>(w).fill(T.ROUTE_GRASS));

  // Base ground per zone band; routes between are grass
  for (const z of ZONES) {
    const base = groundTileFor(z.theme.ground);
    for (let y = z.oy; y < z.oy + z.h; y++) {
      for (let x = 0; x < w; x++) grid[y][x] = base;
    }
  }

  // World vertical borders (trees on left/right edges)
  for (let y = 0; y < h; y++) {
    grid[y][0] = T.TREE;
    grid[y][1] = T.TREE;
    grid[y][w - 1] = T.TREE;
    grid[y][w - 2] = T.TREE;
  }

  // Continuous 2-wide corridor straight down the centre so worlds stay
  // connected end-to-end no matter how interiors bend.
  const centerX = Math.floor(w / 2);
  for (let y = 0; y < h; y++) {
    grid[y][centerX] = T.PATH;
    grid[y][centerX - 1] = T.PATH;
  }

  // Additionally, carve a curved interior spur inside each zone leading to
  // the building door, so every world has a distinct path shape.
  for (const z of ZONES) {
    const b = z.building;
    const doorWX = z.ox + b.doorX;
    const baseGround = groundTileFor(z.theme.ground);
    for (let y = z.oy; y < z.oy + z.h; y++) {
      // interpolate x along the zone height
      const t = (y - z.oy) / Math.max(1, z.h - 1);
      const targetX = Math.round(centerX + (doorWX - centerX) * smoothstep(t));
      const px = Math.max(3, Math.min(w - 4, targetX));
      if (grid[y][px] === baseGround) grid[y][px] = T.PATH;
      if (grid[y][px - 1] === baseGround) grid[y][px - 1] = T.PATH;
    }
  }

  // Zone-entry arches at the route↔zone boundary (skip first zone).
  for (const z of ZONES) {
    if (z.index === 0) continue;
    const ay = z.oy - 1;
    if (ay < 0 || ay >= h) continue;
    // Place arch tiles in two columns flanking the central path (avoid path itself)
    const lx = centerX - 3;
    const rx = centerX + 2;
    if (lx > 1) grid[ay][lx] = T.ARCH_L;
    if (rx < w - 2) grid[ay][rx] = T.ARCH_R;
    // Hanging banner between (above the path columns) — render-only
    if (ay - 1 >= 0) {
      grid[ay - 1][centerX - 1] = T.ARCH_M;
      grid[ay - 1][centerX] = T.ARCH_M;
    }
  }

  // Zone interiors: fences/trees on north & south borders, building, sign,
  // signature prop clusters, decorative scatter.
  for (const z of ZONES) {
    const base = groundTileFor(z.theme.ground);
    const b = z.building;
    const doorWX = z.ox + b.doorX;

    // Fence/trees at zone north & south edges (open at any PATH tile)
    for (let x = 2; x < w - 2; x++) {
      if (z.index > 0 && grid[z.oy][x] !== T.PATH) grid[z.oy][x] = x % 4 === 0 ? T.TREE : T.FENCE;
      if (z.index < ZONES.length - 1 && grid[z.oy + z.h - 1][x] !== T.PATH) {
        grid[z.oy + z.h - 1][x] = x % 4 === 0 ? T.TREE : T.FENCE;
      }
    }

    // Building footprint
    for (let bx = 0; bx < b.w; bx++) {
      grid[z.oy + b.y][z.ox + b.x + bx] = T.BUILDING_ROOF;
    }
    for (let by = 1; by < b.h; by++) {
      for (let bx = 0; bx < b.w; bx++) {
        grid[z.oy + b.y + by][z.ox + b.x + bx] = T.BUILDING_WALL;
      }
    }
    grid[z.oy + b.y + b.h - 1][z.ox + b.doorX] = T.DOOR;

    // Sign
    grid[z.oy + z.sign.y][z.ox + z.sign.x] = T.SIGN;

    // Signature prop clusters (3 clusters of 2-3 tiles each, around building)
    const props = ZONE_PROPS[z.id] ?? [T.FLOWER_Y];
    const clusters: Array<[number, number]> = [
      [z.ox + b.x - 3, z.oy + b.y + 1],          // left of building
      [z.ox + b.x + b.w + 1, z.oy + b.y + 1],    // right of building
      [z.ox + b.x - 2, z.oy + b.y + b.h + 2],    // SW apron
      [z.ox + b.x + b.w, z.oy + b.y + b.h + 2],  // SE apron
    ];
    clusters.forEach((c, ci) => {
      const prop = props[ci % props.length];
      placeProp(grid, w, h, c[0], c[1], prop, base);
      placeProp(grid, w, h, c[0] + 1, c[1], prop, base);
      placeProp(grid, w, h, c[0], c[1] + 1, props[(ci + 1) % props.length], base);
    });

    // Decorative scatter — deterministic but varied per zone
    const seed = z.index * 91 + 13;
    const decoCount = 14;
    for (let i = 0; i < decoCount; i++) {
      const ax = 3 + ((seed * (i + 1) * 7) % (w - 6));
      const ay = z.oy + 2 + ((seed * (i + 3) * 5) % Math.max(1, z.h - 4));
      if (ay >= h - 1) continue;
      if (grid[ay][ax] !== base) continue;
      if (Math.abs(ax - doorWX) <= 1) continue; // keep door corridor clean
      grid[ay][ax] = decoFor(z.id, i);
    }
    // A few extra trees on the edges of the zone (skip path)
    for (let i = 0; i < 5; i++) {
      const ax = 3 + ((seed * (i + 2) * 11) % (w - 6));
      const ay = z.oy + 1 + ((seed * (i + 4) * 3) % 2);
      if (grid[ay][ax] === base && ax !== doorWX) grid[ay][ax] = T.TREE;
    }
  }

  // Ensure NPC + sign-front + badge + door-front tiles walkable; place MAT in front of door
  for (const z of ZONES) {
    const base = groundTileFor(z.theme.ground);
    for (const n of z.npcs) grid[z.oy + n.y][z.ox + n.x] = base;
    grid[z.oy + z.badge.y][z.ox + z.badge.x] = base;
    const sy = z.oy + z.sign.y + 1;
    if (sy < h) grid[sy][z.ox + z.sign.x] = base;
    const dy = z.oy + z.building.y + z.building.h;
    if (dy < h) {
      // Tile immediately south of door = gym MAT (only for zones that have a gym)
      grid[dy][z.ox + z.building.doorX] = z.gym ? T.MAT : base;
      // One more south is base ground
      if (dy + 1 < h) grid[dy + 1][z.ox + z.building.doorX] = base;
    }
  }

  return grid;
}

function placeProp(grid: TileCode[][], w: number, h: number, x: number, y: number, prop: TileCode, base: TileCode) {
  if (x < 2 || x >= w - 2 || y < 0 || y >= h) return;
  if (grid[y][x] !== base) return;
  grid[y][x] = prop;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

export { WORLD_W, WORLD_H };

