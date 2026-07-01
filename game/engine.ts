// Game engine: state, input, scroll/tap movement, pathfinding, rendering.

import {
  ZONES, PLAYER_SPAWN, allInteractives, zoneAt, gymUnlocked,
  ROUTE_NPCS,
  type Dir, type Interactive, type Zone, type RouteNpc,
} from "./data";
import { buildWorld } from "./world";
import {
  CREATURE_URL, getSprite, isReady,
  PARAM_SPRITE_URL,
  FOLLOWER_SPRITE_URL, FOLLOWER_BACK_URL, FOLLOWER_LEFT_URL, FOLLOWER_RIGHT_URL,
  BUILDING_SPRITE_URL, EXTRA_BUILDING_URL,
  NPC_SPRITE_URL,
} from "./sprite-registry";
import {
  TILE, SOLID, T, drawTile, drawBadge, drawCharacter,
} from "./tiles";
import { drawFollower } from "./sprites";
import { playSound } from "../lib/audio";
import { findPath } from "./pathfind";
import { createLayerStack } from "./layer-stack";

const DEFAULT_VIEW_TILES_X = 32;
const DEFAULT_VIEW_TILES_Y = 22;
const WALK_DURATION_MS = 140;

// Extra building positions per zone (4x4 tile decorative buildings)
const EXTRA_POS_MAP: Record<string, { x: number; y: number }> = {
  home: { x: 20, y: 9 }, origin: { x: 20, y: 9 },
  grp: { x: 2, y: 9 }, hab: { x: 2, y: 9 },
  ai: { x: 20, y: 9 }, investopad: { x: 20, y: 9 },
  sole: { x: 2, y: 9 }, fere: { x: 20, y: 9 },
  ccd: { x: 2, y: 9 }, iterate: { x: 2, y: 9 },
};

// ─── Smooth camera lerp state ────────────────────────────────
let camXSmooth = 0;
let camYSmooth = 0;
let camInitialized = false;


export type GameState = {
  px: number; py: number;
  tx: number; ty: number;
  dir: Dir;
  walkStart: number;
  walkFrom: { x: number; y: number };
  frame: 0 | 1 | 2;
  stepCount: number;
  collectedBadges: Set<string>;
  collectedCreatures: Set<string>;
  collectedSkills: Set<string>;
  defeatedGyms: Set<string>;
  defeatedTrainers: Set<string>;
  visitedZones: Set<string>;
  paused: boolean;
  path: { x: number; y: number }[];
  playerStage: string;
  /** Follower only shows after Prof. Iterate gives Mermander */
  followerUnlocked: boolean;
  /** Follower animation state */
  followerAnim: { kind: "idle" | "jump" | "spin"; startedAt: number };
};

type InputName = "up" | "down" | "left" | "right" | "action" | "menu";
export type Input = Record<InputName, boolean>;

export type EngineCallbacks = {
  onInteract: (i: Interactive) => void;
  onZoneEnter: (zone: Zone) => void;
  onMenu: () => void;
  onBadge: (badgeId: string) => void;
  onGymEnter: (zone: Zone) => void;
  onWild: (zone: Zone) => void;
  /** Called when player enters a non-gym building door — triggers interior */
  onDoorEnter: (zone: Zone) => void;
  /** Called when player steps on an undiscovered hidden item tile */
  onHiddenItem: (zone: Zone) => void;
  /** Called when player interacts with a route trainer NPC */
  onTrainerBattle: (npc: RouteNpc) => void;
};


export function createEngine(canvas: HTMLCanvasElement, cb: EngineCallbacks) {
  // Hide the original canvas (keep the ref for backwards compat) and create layer stack
  canvas.style.display = "none";
  const layers = createLayerStack(canvas.parentElement!);

  // Dynamic viewport: recomputed on resize based on canvas CSS size.
  let VIEW_TILES_X = DEFAULT_VIEW_TILES_X;
  let VIEW_TILES_Y = DEFAULT_VIEW_TILES_Y;

  // Canvas shake state
  let shakeUntil = 0;
  let shakeAmp = 0;

  // ── Dirty-flag state for background layer ───────────────────────────
  interface DirtyState {
    dirty: boolean;
    lastCamX: number;
    lastCamY: number;
    threshold: number; // 0.5 in pixel-space, compared against pixel displacement
  }
  const bgDirty: DirtyState = { dirty: true, lastCamX: 0, lastCamY: 0, threshold: 0.5 };

  function checkDirty(camPixX: number, camPixY: number): boolean {
    const dx = Math.abs(camPixX - bgDirty.lastCamX);
    const dy = Math.abs(camPixY - bgDirty.lastCamY);
    if (dx > bgDirty.threshold || dy > bgDirty.threshold) {
      bgDirty.dirty = true;
    }
    return bgDirty.dirty;
  }

  // ── Footstep dust particles ──────────────────────────────────
  type DustParticle = { x: number; y: number; vx: number; vy: number; alpha: number; size: number };
  const dustParticles: DustParticle[] = [];

  const world = buildWorld();
  const worldH = world.length;
  const worldW = world[0].length;
  const interactives = allInteractives();
  // Cooldown so auto-triggered dialogs don't re-fire every step while the
  // player lingers next to the same NPC/sign.
  let lastAutoKey = "";
  let lastAutoAt = 0;


  const state: GameState = {
    px: PLAYER_SPAWN.x,
    py: PLAYER_SPAWN.y,
    tx: PLAYER_SPAWN.x,
    ty: PLAYER_SPAWN.y,
    dir: PLAYER_SPAWN.dir,
    walkStart: 0,
    walkFrom: { x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y },
    frame: 0,
    stepCount: 0,
    collectedBadges: new Set(),
    collectedCreatures: new Set(),
    collectedSkills: new Set(),
    defeatedGyms: new Set(),
    defeatedTrainers: new Set(),
    visitedZones: new Set([ZONES[0].id]),
    paused: false,
    path: [],
    playerStage: "mermander",
    followerUnlocked: false,
    followerAnim: { kind: "idle", startedAt: 0 },
  };

  let lastPlayerMoveAt = performance.now();

  const input: Input = { up: false, down: false, left: false, right: false, action: false, menu: false };

  function isSolid(x: number, y: number) {
    if (x < 0 || y < 0 || x >= worldW || y >= worldH) return true;
    if (SOLID.has(world[y][x])) return true;
    for (const i of interactives) {
      if (i.kind === "npc" && i.x === x && i.y === y) return true;
    }
    return false;
  }

  function facingTile(): { x: number; y: number } {
    const x = state.tx, y = state.ty;
    if (state.dir === "up") return { x, y: y - 1 };
    if (state.dir === "down") return { x, y: y + 1 };
    if (state.dir === "left") return { x: x - 1, y };
    return { x: x + 1, y };
  }


  function tryMove(dir: Dir) {
    state.dir = dir;
    lastPlayerMoveAt = performance.now();
    if (state.px !== state.tx || state.py !== state.ty) return;
    const f = facingTile();
    if (isSolid(f.x, f.y)) {
      state.frame = ((state.frame + 1) % 2 + 1) as 1 | 2;
      return;
    }
    state.tx = f.x; state.ty = f.y;
    state.walkFrom = { x: state.px, y: state.py };
    state.walkStart = performance.now();
    state.stepCount++;
    state.frame = (state.stepCount % 2 === 0 ? 1 : 2) as 1 | 2;
    if (state.stepCount % 2 === 0) playSound("step");
    // Spawn footstep dust
    for (let d = 0; d < 3; d++) {
      dustParticles.push({
        x: state.tx * TILE + TILE / 2 + (Math.random() - 0.5) * TILE * 0.6,
        y: state.ty * TILE + TILE - 2,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 0.5 + 0.2),
        alpha: 0.55 + Math.random() * 0.2,
        size: 1 + Math.random() * 1.5,
      });
    }
    if (dustParticles.length > 60) dustParticles.splice(0, dustParticles.length - 60);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }

  function stepPath() {
    if (state.path.length === 0) return;
    const next = state.path[0];
    if (next.x === state.tx && next.y === state.ty) { state.path.shift(); return; }
    let dir: Dir | null = null;
    if (next.x > state.tx) dir = "right";
    else if (next.x < state.tx) dir = "left";
    else if (next.y > state.ty) dir = "down";
    else if (next.y < state.ty) dir = "up";
    if (dir) {
      tryMove(dir);
      // if it became solid (e.g. door target), stop path
      if (state.tx === state.px && state.ty === state.py) state.path = [];
      else state.path.shift();
    }
  }


  function interactInFront() {
    const f = facingTile();
    // door first
    const door = interactives.find((i) => i.kind === "door" && i.x === f.x && i.y === f.y);
    if (door && door.kind === "door") {
      if (door.zone.gym && !state.defeatedGyms.has(door.zone.id)) {
        if (gymUnlocked(door.zone.id, state.collectedBadges)) cb.onGymEnter(door.zone);
        else cb.onInteract({ kind: "sign", zone: door.zone, sign: { x: f.x, y: f.y, text: `${door.zone.name.toUpperCase()}\n\nThis gym is sealed.\nDefeat the previous champions first.` }, x: f.x, y: f.y });
      } else {
        // Non-gym building: enter the interior
        cb.onDoorEnter(door.zone);
      }
      return;
    }
    for (const i of interactives) {
      if (i.x === f.x && i.y === f.y) {
        if (i.kind === "badge") {
          if (!state.collectedBadges.has(i.zone.badge.id)) {
            state.collectedBadges.add(i.zone.badge.id);
            cb.onBadge(i.zone.badge.id);
          }
          return;
        }
        if (i.kind !== "door") cb.onInteract(i);
        return;
      }
    }
  }


  // Proximity scan: when the player settles on a tile, check the four
  // neighbours for a sign/NPC/badge and trigger it automatically. The
  // engine throttles by (zoneId+x+y) so the same orb doesn't loop.
  function autoInteractNear() {
    const here = { x: state.tx, y: state.ty };
    const neighbours = [
      { x: here.x, y: here.y },
      { x: here.x, y: here.y - 1 },
      { x: here.x, y: here.y + 1 },
      { x: here.x - 1, y: here.y },
      { x: here.x + 1, y: here.y },
    ];
    for (const n of neighbours) {
      // Wild creature has highest priority (it's the goal).
      const wild = interactives.find((i) => i.kind === "wild" && i.x === n.x && i.y === n.y);
      if (wild && wild.kind === "wild" && !state.collectedCreatures.has(wild.creature.id)) {
        const key = `w:${wild.zone.id}:${wild.creature.id}`;
        if (key !== lastAutoKey || performance.now() - lastAutoAt > 8000) {
          lastAutoKey = key; lastAutoAt = performance.now();
          cb.onWild(wild.zone);
          return;
        }
      }
      // Badge auto-collect — triggers when player is adjacent to or standing on the badge
      const badge = interactives.find((i) => i.kind === "badge" && i.x === n.x && i.y === n.y);
      if (badge && badge.kind === "badge" && !state.collectedBadges.has(badge.zone.badge.id)) {
        const key = `b:${badge.zone.id}:${badge.zone.badge.id}`;
        if (key !== lastAutoKey || performance.now() - lastAutoAt > 8000) {
          lastAutoKey = key; lastAutoAt = performance.now();
          state.collectedBadges.add(badge.zone.badge.id);
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 20, 30]);
          cb.onBadge(badge.zone.badge.id);
          return;
        }
      }
      // Signs auto-trigger; NPCs auto-trigger; badges auto-collect on contact only.
      const sign = interactives.find((i) => i.kind === "sign" && i.x === n.x && i.y === n.y);
      if (sign && sign.kind === "sign") {
        const key = `s:${sign.zone.id}:${n.x},${n.y}`;
        if (key !== lastAutoKey || performance.now() - lastAutoAt > 8000) {
          lastAutoKey = key; lastAutoAt = performance.now();
          cb.onInteract(sign);
          return;
        }
      }
      const npc = interactives.find((i) => i.kind === "npc" && i.x === n.x && i.y === n.y);
      if (npc && npc.kind === "npc") {
        const key = `n:${npc.zone.id}:${npc.npc.name}`;
        if (key !== lastAutoKey || performance.now() - lastAutoAt > 8000) {
          lastAutoKey = key; lastAutoAt = performance.now();
          // Check if this NPC is a route trainer that hasn't been defeated
          const routeNpc = ROUTE_NPCS.find(rn => rn.name === npc.npc.name && rn.trainer);
          if (routeNpc && routeNpc.trainer && !state.defeatedTrainers.has(routeNpc.name)) {
            cb.onTrainerBattle(routeNpc);
          } else if (npc.npc.kind !== "mom") {
            // Mom only responds to manual interact (Space/A), not auto-proximity
            cb.onInteract(npc);
          }
          return;
        }
      }
      // Hidden item detection — fires when player steps directly on the tile
      // Key is per-tile (zone + coordinates) so items in same zone don't share throttle
      if (n.x === here.x && n.y === here.y) {
        const hidden = interactives.find((i) => i.kind === "hidden" && i.x === n.x && i.y === n.y);
        if (hidden && hidden.kind === "hidden" && !state.collectedSkills.has(hidden.zone.skill?.id ?? "")) {
          const key = `h:${hidden.zone.id}:${n.x},${n.y}`;
          if (key !== lastAutoKey || performance.now() - lastAutoAt > 8000) {
            lastAutoKey = key; lastAutoAt = performance.now();
            state.collectedSkills.add(hidden.zone.skill!.id);
            cb.onHiddenItem(hidden.zone);
            return;
          }
        }
      }
    }
  }


  // ─── Input ────────────────────────────────────────────────
  const keyMap: Record<string, InputName | undefined> = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
  };
  function onKey(down: boolean, e: KeyboardEvent) {
    const k = keyMap[e.key];
    if (k) { input[k] = down; if (down) state.path = []; e.preventDefault(); return; }
    if (down && (e.key === " " || e.key === "Enter" || e.key === "z" || e.key === "Z")) { input.action = true; e.preventDefault(); }
    if (down && (e.key === "Escape" || e.key === "x" || e.key === "X")) { input.menu = true; e.preventDefault(); }
  }
  const kd = (e: KeyboardEvent) => onKey(true, e);
  const ku = (e: KeyboardEvent) => onKey(false, e);
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);

  // Scroll-to-walk: each wheel tick queues a step along the path (down by default)
  let scrollAccum = 0;
  function onWheel(e: WheelEvent) {
    if (state.paused) return;
    e.preventDefault();
    scrollAccum += e.deltaY;
    const threshold = 30;
    while (Math.abs(scrollAccum) >= threshold) {
      const dir: Dir = scrollAccum > 0 ? "down" : "up";
      scrollAccum += scrollAccum > 0 ? -threshold : threshold;
      // queue: directly try to move when next idle
      pendingScrollDir = dir;
    }
  }
  let pendingScrollDir: Dir | null = null;
  layers.effects.addEventListener("wheel", onWheel, { passive: false });


  // Touch swipe (vertical primarily) → walks toward swipe direction
  let touchStart: { x: number; y: number; t: number } | null = null;
  let lastSwipeStep: { dir: Dir; pixels: number } | null = null;
  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY, t: performance.now() };
    lastSwipeStep = null;
  }
  function onTouchMove(e: TouchEvent) {
    if (!touchStart || state.paused) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const stepPx = 28;
    if (Math.abs(dx) > Math.abs(dy)) {
      const steps = Math.floor(Math.abs(dx) / stepPx);
      const dir: Dir = dx > 0 ? "left" : "right"; // drag right → world moves right → player moves left? choose intuitive: drag = move character that way
      const dirMapped: Dir = dx > 0 ? "right" : "left";
      if (steps > 0 && (!lastSwipeStep || lastSwipeStep.dir !== dirMapped || steps > lastSwipeStep.pixels)) {
        pendingScrollDir = dirMapped;
        lastSwipeStep = { dir: dirMapped, pixels: steps };
      }
      void dir;
    } else {
      const steps = Math.floor(Math.abs(dy) / stepPx);
      const dirMapped: Dir = dy > 0 ? "down" : "up";
      if (steps > 0 && (!lastSwipeStep || lastSwipeStep.dir !== dirMapped || steps > lastSwipeStep.pixels)) {
        pendingScrollDir = dirMapped;
        lastSwipeStep = { dir: dirMapped, pixels: steps };
      }
    }
  }
  function onTouchEnd() { touchStart = null; lastSwipeStep = null; }
  layers.effects.addEventListener("touchstart", onTouchStart, { passive: true });
  layers.effects.addEventListener("touchmove", onTouchMove, { passive: true });
  layers.effects.addEventListener("touchend", onTouchEnd, { passive: true });


  // Click / tap-to-walk (use pathfinding)
  function onClick(e: MouseEvent) {
    if (state.paused) return;
    const rect = layers.effects.getBoundingClientRect();
    const sx = (e.clientX - rect.left) / rect.width * layers.effects.width;
    const sy = (e.clientY - rect.top) / rect.height * layers.effects.height;
    const tx = Math.floor(sx / TILE + camX);
    const ty = Math.floor(sy / TILE + camY);
    const p = findPath(state.tx, state.ty, tx, ty, isSolid, 3000);
    if (p && p.length) {
      state.path = p;
      // if goal is interactive (npc/sign/door/badge), drop final step and orient
      const last = p[p.length - 1];
      const inter = interactives.find((i) => i.x === last.x && i.y === last.y);
      if (inter) {
        state.path = p.slice(0, -1);
        state.path.push({ x: last.x, y: last.y, } as any); // we will orient at end via face-and-interact
        // simpler: after walking, auto-interact
        pendingInteractAt = { x: last.x, y: last.y };
        state.path = p.slice(0, -1);
      }
    }
  }
  let pendingInteractAt: { x: number; y: number } | null = null;
  layers.effects.addEventListener("click", onClick);

  // Touch input from on-screen controls
  function setTouch(name: InputName, value: boolean) { input[name] = value; if (value) state.path = []; }


  // ─── Render: Background Layer ─────────────────────────────────────
  function renderBackground(ctx: CanvasRenderingContext2D, now: number, offX: number, offY: number) {
    ctx.fillStyle = "#08101a";
    ctx.fillRect(0, 0, VIEW_TILES_X * TILE, VIEW_TILES_Y * TILE);

    // Day/night ambient tint based on local clock hour
    const hour = new Date().getHours();
    let ambientColor: string;
    let ambientAlpha: number;
    if (hour >= 6 && hour < 9) {
      ambientColor = "rgba(255,180,80,";
      ambientAlpha = 0.08;
    } else if (hour >= 9 && hour < 17) {
      ambientColor = "rgba(255,255,200,";
      ambientAlpha = 0.02;
    } else if (hour >= 17 && hour < 20) {
      ambientColor = "rgba(80,120,220,";
      ambientAlpha = 0.10;
    } else {
      ambientColor = "rgba(10,20,80,";
      ambientAlpha = 0.18;
    }
    if (ambientAlpha > 0) {
      ctx.fillStyle = `${ambientColor}${ambientAlpha})`;
      ctx.fillRect(0, 0, VIEW_TILES_X * TILE, VIEW_TILES_Y * TILE);
    }

    const cx = camXSmooth;
    const cy = camYSmooth;
    const tx0 = Math.max(0, Math.floor(cx) - 4);
    const ty0 = Math.max(0, Math.floor(cy) - 4);
    const tx1 = Math.min(worldW, Math.floor(cx) + VIEW_TILES_X + 5);
    const ty1 = Math.min(worldH, Math.floor(cy) + VIEW_TILES_Y + 5);


    // Pre-compute building footprint — draw ground tile instead of wall/roof tiles
    // when building sprite is loaded (prevents both black gaps AND superimposition)
    const buildingGroundMap = new Map<string, number>(); // "x,y" -> zone index for ground lookup
    for (let zi = 0; zi < ZONES.length; zi++) {
      const z = ZONES[zi];
      const buildingUrl = BUILDING_SPRITE_URL[z.id];
      const buildImg = buildingUrl ? getSprite(buildingUrl) : null;
      if (buildImg && isReady(buildImg)) {
        const b = z.building;
        for (let gy = b.y; gy < b.y + b.h; gy++) {
          for (let gx = b.x; gx < b.x + b.w; gx++) {
            buildingGroundMap.set(`${z.ox + gx},${z.oy + gy}`, zi);
          }
        }
      }
      // Also include extra building positions (4x4 tiles)
      const exUrl = EXTRA_BUILDING_URL[z.id];
      const exImg = exUrl ? getSprite(exUrl) : null;
      if (exImg && isReady(exImg)) {
        const epos = EXTRA_POS_MAP[z.id];
        if (epos) {
          for (let ey = 0; ey < 4; ey++) {
            for (let ex = 0; ex < 4; ex++) {
              buildingGroundMap.set(`${z.ox + epos.x + ex},${z.oy + epos.y + ey}`, zi);
            }
          }
        }
      }
    }

    for (let y = ty0; y < ty1; y++) {
      for (let x = tx0; x < tx1; x++) {
        // If this tile is under a building sprite, draw zone ground instead of wall tiles
        const bzIdx = buildingGroundMap.get(`${x},${y}`);
        if (bzIdx !== undefined) {
          const bz = ZONES[bzIdx];
          // Use the zone's proper ground tile type (not whatever happens to be at origin)
          const groundCode = bz.theme.ground === "grass" ? 1 : bz.theme.ground === "sand" ? 4 : bz.theme.ground === "stone" ? 5 : bz.theme.ground === "neon" ? 17 : bz.theme.ground === "dusk" ? 18 : bz.theme.ground === "night" ? 19 : bz.theme.ground === "mall" ? 20 : bz.theme.ground === "crypto" ? 21 : bz.theme.ground === "studio" ? 22 : bz.theme.ground === "snow" ? 23 : 1;
          drawTile(ctx, groundCode, x, y, x * TILE + offX, y * TILE + offY, now);
        } else {
          drawTile(ctx, world[y][x], x, y, x * TILE + offX, y * TILE + offY, now);
        }
      }
    }


    // ── Shore foam: where WATER meets land, draw an animated foam lip ──
    {
      const foamPhase = Math.sin(now / 500) * 0.5 + 0.5; // 0..1 breathing
      for (let y = ty0; y < ty1; y++) {
        for (let x = tx0; x < tx1; x++) {
          if (world[y][x] !== T.WATER) continue;
          const sx = x * TILE + offX;
          const sy = y * TILE + offY;
          const isLand = (gx: number, gy: number) =>
            gx < 0 || gy < 0 || gx >= worldW || gy >= worldH || world[gy][gx] !== T.WATER;
          const fa = (0.5 + foamPhase * 0.4).toFixed(2);
          ctx.fillStyle = `rgba(220,240,255,${fa})`;
          // top edge
          if (isLand(x, y - 1)) { ctx.fillRect(sx, sy, TILE, 2); ctx.fillStyle = `rgba(255,255,255,${(0.3+foamPhase*0.3).toFixed(2)})`; ctx.fillRect(sx + 2, sy, 4, 1); ctx.fillStyle = `rgba(220,240,255,${fa})`; }
          // bottom edge
          if (isLand(x, y + 1)) ctx.fillRect(sx, sy + TILE - 2, TILE, 2);
          // left edge
          if (isLand(x - 1, y)) ctx.fillRect(sx, sy, 2, TILE);
          // right edge
          if (isLand(x + 1, y)) ctx.fillRect(sx + TILE - 2, sy, 2, TILE);
        }
      }
    }

    // ── Per-zone color grading ────────────────────────────────────────────
    // Each zone gets its own ambient color wash painted only within its bounds.
    for (const z of ZONES) {
      if (z.oy + z.h < ty0 || z.oy > ty1) continue;
      const zx0 = (z.ox * TILE) + offX;
      const zy0 = (z.oy * TILE) + offY;
      const zw  = z.w * TILE;
      const zh  = z.h * TILE;
      let zoneColor = "";
      switch (z.theme.ground) {
        case "neon":   zoneColor = "rgba(30,60,120,0.10)"; break;
        case "crypto": zoneColor = "rgba(0,40,20,0.12)";   break;
        case "dusk":   zoneColor = "rgba(60,20,80,0.10)";  break;
        case "mall":   zoneColor = "rgba(60,0,40,0.09)";   break;
        case "studio": zoneColor = "rgba(60,30,0,0.10)";   break;
        case "night":  zoneColor = "rgba(0,20,60,0.12)";   break;
        case "sand":   zoneColor = "rgba(40,20,0,0.08)";   break;
        case "stone":  zoneColor = "rgba(20,10,0,0.08)";   break;
        case "snow":   zoneColor = "rgba(200,220,255,0.08)"; break;
        default: break;
      }
      if (zoneColor) {
        ctx.fillStyle = zoneColor;
        ctx.fillRect(zx0, zy0, zw, zh);
      }
    }
  }


  // ─── Render: Entity Layer ─────────────────────────────────────────
  function renderEntities(ctx: CanvasRenderingContext2D, now: number, offX: number, offY: number) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const cx = camXSmooth;
    const cy = camYSmooth;
    const tx0 = Math.max(0, Math.floor(cx) - 4);
    const ty0 = Math.max(0, Math.floor(cy) - 4);
    const tx1 = Math.min(worldW, Math.floor(cx) + VIEW_TILES_X + 5);
    const ty1 = Math.min(worldH, Math.floor(cy) + VIEW_TILES_Y + 5);

    // Buildings — PNG sprite only, no procedural fallback (eliminates flicker)
    for (const z of ZONES) {
      const b = z.building;
      const ry = z.oy + b.y;
      if (ry < ty0 - 1 || ry > ty1 + 1) continue;

      const buildingUrl = BUILDING_SPRITE_URL[z.id];
      const buildImg = buildingUrl ? getSprite(buildingUrl) : null;
      const hasBuildingSprite = buildImg !== null && isReady(buildImg);

      if (hasBuildingSprite) {
        // Draw the HD building sprite over the full footprint
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
          buildImg!,
          (b.x + z.ox) * TILE + offX,
          (b.y + z.oy) * TILE + offY,
          b.w * TILE,
          b.h * TILE,
        );
        ctx.imageSmoothingEnabled = false;
      } else {
        // Clean placeholder — solid zone-colored rectangle while loading
        const bx0 = (b.x + z.ox) * TILE + offX;
        const by0 = (b.y + z.oy) * TILE + offY;
        const bw = b.w * TILE;
        const bh = b.h * TILE;
        ctx.fillStyle = b.color;
        ctx.fillRect(bx0, by0, bw, bh);
        // Roof accent strip
        ctx.fillStyle = b.roof;
        ctx.fillRect(bx0, by0, bw, 4);
        // Subtle border
        ctx.strokeStyle = b.roof + "88";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx0, by0, bw, bh);
      }

      // GYM indicator — just a small accent glow on mat (building sprite already has GYM text)
      if (z.gym && !state.defeatedGyms.has(z.id)) {
        // Removed the procedural GYM text label — building PNG already shows it
      }
    }


    // ── Extra small buildings (isometric, decorative) ────────────────────
    for (const z of ZONES) {
      const pos = EXTRA_POS_MAP[z.id];
      if (!pos) continue;
      const exUrl = EXTRA_BUILDING_URL[z.id];
      const exImg = exUrl ? getSprite(exUrl) : null;
      if (!exImg || !isReady(exImg)) continue;
      const exX = (z.ox + pos.x) * TILE + offX;
      const exY = (z.oy + pos.y) * TILE + offY;
      // Check if within viewport
      if (z.ox + pos.x > tx1 + 1 || z.ox + pos.x + 3 < tx0 - 1) continue;
      if (z.oy + pos.y > ty1 + 1 || z.oy + pos.y + 3 < ty0 - 1) continue;
      // Draw at 4x4 tile size
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(exImg, exX, exY, TILE * 4, TILE * 4);
      ctx.imageSmoothingEnabled = false;
    }

    // ── Door/mat entry indicator — pulsing glow ────────────────────────
    for (const z of ZONES) {
      if (!z.gym || state.defeatedGyms.has(z.id)) continue;
      const dx = (z.ox + z.building.x + z.building.doorX) * TILE + offX;
      const dy = (z.oy + z.building.y + z.building.h - 1) * TILE + offY;
      if (dx < -TILE || dx > ctx.canvas.width + TILE) continue;
      if (dy < -TILE || dy > ctx.canvas.height + TILE) continue;
      const pulse = Math.sin(now / 300 + z.index) * 0.3 + 0.5;
      ctx.fillStyle = z.theme.accent + Math.round(pulse * 80).toString(16).padStart(2, "0");
      ctx.fillRect(dx, dy, TILE, TILE);
      // Small "ENTER" text hint
      ctx.fillStyle = z.theme.accent + "aa";
      ctx.font = "bold 5px monospace";
      ctx.textAlign = "center";
      ctx.fillText("▼", dx + TILE / 2, dy + TILE / 2 + 2);
      ctx.textAlign = "left";
    }


    // badges — with orbiting sparkle particles
    const phase = now / 250;
    for (const i of interactives) {
      if (i.kind !== "badge") continue;
      if (state.collectedBadges.has(i.zone.badge.id)) continue;
      if (i.x < tx0 - 1 || i.x > tx1 + 1 || i.y < ty0 - 1 || i.y > ty1 + 1) continue;
      drawBadge(ctx, i.x * TILE + offX, i.y * TILE + offY, i.zone.badge.color, phase + i.x);
      // Orbiting sparkle particles
      for (let sp = 0; sp < 4; sp++) {
        const sparkAngle = (sp / 4) * Math.PI * 2 + now / 600;
        const sparkR = TILE * 0.85 + Math.sin(now / 300 + sp) * 2;
        const sparkX = i.x * TILE + offX + TILE / 2 + Math.cos(sparkAngle) * sparkR;
        const sparkY = i.y * TILE + offY + TILE / 2 + Math.sin(sparkAngle) * sparkR;
        ctx.fillStyle = i.zone.badge.color + "cc";
        ctx.fillRect(Math.round(sparkX) - 1, Math.round(sparkY) - 1, 2, 2);
      }
    }


    // NPCs — HD sprite rendering with idle bob animation, face toward player when nearby
    for (const i of interactives) {
      if (i.kind !== "npc") continue;
      if (i.x < tx0 - 1 || i.x > tx1 + 1 || i.y < ty0 - 1 || i.y > ty1 + 1) continue;
      const f = (Math.floor(now / 600 + i.x * 0.3) % 8 === 0 ? 1 : 0) as 0 | 1;
      const npcBob = Math.round(Math.sin(now / 800 + i.x * 1.3) * 2.5);
      // Compute NPC facing direction toward player when nearby
      let npcDir: Dir = "down";
      const ndx = state.tx - i.x;
      const ndy = state.ty - i.y;
      if (Math.abs(ndx) <= 2 && Math.abs(ndy) <= 2) {
        if (Math.abs(ndx) >= Math.abs(ndy)) {
          npcDir = ndx > 0 ? "right" : "left";
        } else {
          npcDir = ndy > 0 ? "down" : "up";
        }
      }

      const npcPx = i.x * TILE + offX;
      const npcPy = i.y * TILE + offY + npcBob;

      // Try HD sprite first (must be a real sprite, not a 1px placeholder)
      const npcUrl = NPC_SPRITE_URL[i.npc.kind];
      const npcImg = npcUrl ? getSprite(npcUrl) : null;
      if (npcImg && isReady(npcImg) && npcImg.naturalWidth > 16) {
        // Render HD NPC sprite at 1.15x tile size — proportional to the world
        const npcSize = Math.round(TILE * 1.15);
        const npcOx = (TILE - npcSize) / 2;
        const npcOy = TILE - npcSize; // anchor at bottom of tile
        // Drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(npcPx + TILE / 2, npcPy + TILE - 2, TILE * 0.45, TILE * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Draw sprite normally (these are RGBA PNGs with proper transparency)
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        if (npcDir === "left") {
          ctx.translate(npcPx + TILE, npcPy);
          ctx.scale(-1, 1);
          ctx.drawImage(npcImg, -npcOx, npcOy, npcSize, npcSize);
        } else {
          ctx.drawImage(npcImg, npcPx + npcOx, npcPy + npcOy, npcSize, npcSize);
        }
        ctx.restore();
      } else {
        // Fallback to procedural drawing
        drawCharacter(ctx, i.npc.kind, npcDir, f, npcPx, npcPy);
      }
    }


    // Route NPCs — HD sprite rendering, face toward player
    for (const rn of ROUTE_NPCS) {
      if (rn.x < tx0 - 1 || rn.x > tx1 + 1 || rn.y < ty0 - 1 || rn.y > ty1 + 1) continue;
      const f = (Math.floor(now / 700 + rn.x * 0.4) % 8 === 0 ? 1 : 0) as 0 | 1;
      const bob = Math.round(Math.sin(now / 900 + rn.x * 1.1) * 2.5);
      let rnDir: Dir = "down";
      const rndx = state.tx - rn.x;
      const rndy = state.ty - rn.y;
      if (Math.abs(rndx) <= 2 && Math.abs(rndy) <= 2) {
        if (Math.abs(rndx) >= Math.abs(rndy)) {
          rnDir = rndx > 0 ? "right" : "left";
        } else {
          rnDir = rndy > 0 ? "down" : "up";
        }
      }

      const rnPx = rn.x * TILE + offX;
      const rnPy = rn.y * TILE + offY + bob;

      // Try HD sprite first (must be a real sprite, not a 1px placeholder)
      const rnUrl = NPC_SPRITE_URL[rn.kind];
      const rnImg = rnUrl ? getSprite(rnUrl) : null;
      if (rnImg && isReady(rnImg) && rnImg.naturalWidth > 16) {
        const rnSize = Math.round(TILE * 1.15);
        const rnOx = (TILE - rnSize) / 2;
        const rnOy = TILE - rnSize;
        // Drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(rnPx + TILE / 2, rnPy + TILE - 2, TILE * 0.45, TILE * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Draw sprite normally (RGBA PNGs with transparency)
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        if (rnDir === "left") {
          ctx.translate(rnPx + TILE, rnPy);
          ctx.scale(-1, 1);
          ctx.drawImage(rnImg, -rnOx, rnOy, rnSize, rnSize);
        } else {
          ctx.drawImage(rnImg, rnPx + rnOx, rnPy + rnOy, rnSize, rnSize);
        }
        ctx.restore();
      } else {
        drawCharacter(ctx, rn.kind, rnDir, f, rnPx, rnPy);
      }
    }


    // Zone ambient particles — floating accent-colored dots per zone
    for (const z of ZONES) {
      if (z.oy + z.h < ty0 - 2 || z.oy > ty1 + 2) continue;
      for (let pi = 0; pi < 3; pi++) {
        const seed = z.id.charCodeAt(0) * 7 + z.id.charCodeAt(1) * 13 + pi * 31;
        const px2 = z.ox + 2 + (seed * 17 % (z.w - 4));
        const py2 = z.oy + 2 + ((seed * 11 + Math.floor(now / 3000)) % (z.h - 4));
        const floatY = Math.sin(now / 1200 + pi * 2.1 + seed) * 3;
        const alpha = 0.15 + Math.sin(now / 700 + pi * 1.7) * 0.1;
        ctx.fillStyle = z.theme.accent + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.fillRect(px2 * TILE + offX + 6, Math.round(py2 * TILE + offY + floatY), 2, 2);
      }
    }

    // Wild creatures — visible, bobbing, with a "!" marker so the player
    // sees there's something to catch.
    for (const i of interactives) {
      if (i.kind !== "wild") continue;
      if (state.collectedCreatures.has(i.creature.id)) continue;
      if (i.x < tx0 - 1 || i.x > tx1 + 1 || i.y < ty0 - 1 || i.y > ty1 + 1) continue;
      const bx = i.x * TILE + offX;
      const by = i.y * TILE + offY;
      const bob = Math.round(Math.sin(now / 240 + i.x) * 3);
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(bx + TILE / 2, by + TILE - 3, TILE * 0.4, TILE * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      const url = CREATURE_URL[i.zone.id];
      const img = url ? getSprite(url) : null;
      if (img && isReady(img)) {
        const size = Math.round(TILE * 1.3);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, bx + (TILE - size) / 2, by + (TILE - size) / 2 + bob, size, size);
        ctx.imageSmoothingEnabled = false;
      } else {
        // fallback dot
        ctx.fillStyle = i.zone.theme.accent;
        ctx.fillRect(bx + TILE * 0.2, by + TILE * 0.2 + bob, TILE * 0.6, TILE * 0.6);
      }
      // "!" marker — scaled for new tile size
      const pulse = (Math.floor(now / 300) % 2) === 0;
      if (pulse) {
        const mx = bx + TILE - TILE * 0.15;
        const my = by - TILE * 0.2 + bob;
        ctx.fillStyle = "#fff";
        ctx.fillRect(mx, my, TILE * 0.08, TILE * 0.15);
        ctx.fillRect(mx, my + TILE * 0.18, TILE * 0.08, TILE * 0.05);
        ctx.fillStyle = "#e83a3a";
        ctx.fillRect(mx + 1, my + 1, TILE * 0.04, TILE * 0.1);
        ctx.fillRect(mx + 1, my + TILE * 0.18 + 1, TILE * 0.04, TILE * 0.03);
      }
    }


    // Gym door marker (glow effect on mat when unlocked and undefeated)
    for (const z of ZONES) {
      if (state.defeatedGyms.has(z.id)) continue;
      const dx = z.ox + z.building.x + z.building.doorX;
      const dy = z.oy + z.building.y + z.building.h - 1;
      if (dx < tx0 - 1 || dx > tx1 + 1 || dy < ty0 - 1 || dy > ty1 + 1) continue;
      // Pulsing glow on mat tile to indicate enterable gym
      const bob = Math.sin(now / 200 + z.index) * 1.5;
      ctx.fillStyle = z.theme.accent + "40";
      ctx.beginPath();
      ctx.ellipse(dx * TILE + offX + TILE / 2, dy * TILE + offY + TILE / 2 + bob, TILE * 0.7, TILE * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player on top — always Param the human, direction-aware
    {
      const pbx = Math.round(state.px * TILE) + offX;
      const pby = Math.round(state.py * TILE) + offY;

      // Zone accent glow under player
      const playerZone = zoneAt(state.tx, state.ty);
      if (playerZone && playerZone.id !== "home") {
        const glowAlpha = 0.18 + Math.sin(now / 400) * 0.06;
        ctx.fillStyle = playerZone.theme.accent + Math.round(glowAlpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.ellipse(Math.round(state.px * TILE) + offX + TILE / 2, Math.round(state.py * TILE) + offY + TILE - 2, TILE * 0.6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Param sprite — direction mapped to the 4 Param PNGs
      let paramUrl: string;
      if (state.dir === "up")         paramUrl = PARAM_SPRITE_URL.back;
      else if (state.dir === "left")  paramUrl = PARAM_SPRITE_URL.left;
      else if (state.dir === "right") paramUrl = PARAM_SPRITE_URL.right;
      else                            paramUrl = PARAM_SPRITE_URL.front;

      const paramImg = getSprite(paramUrl);
      if (paramImg && isReady(paramImg)) {
        // Render player at 1.5x tile — bigger than NPCs, clearly the hero
        const size = Math.round(TILE * 1.5);
        // Drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.ellipse(pbx + TILE / 2, pby + TILE - 1, TILE * 0.45, TILE * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(paramImg, pbx + (TILE - size) / 2, pby + TILE - size, size, size);
        ctx.imageSmoothingEnabled = false;
      } else {
        drawCharacter(ctx, "player", state.dir, state.frame, pbx, pby);
      }
    }


    // Path breadcrumbs (subtle dots along queued path)
    if (state.path.length) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      for (const p of state.path) {
        ctx.fillRect(p.x * TILE + offX + 7, p.y * TILE + offY + 7, 2, 2);
      }
    }

    // Follower sprite — only shown after followerUnlocked (Prof. Iterate gives Mermander)
    if (state.followerUnlocked) {
      const followerX = state.walkFrom.x;
      const followerY = state.walkFrom.y;
      const fbx = Math.round(followerX * TILE) + offX;
      const fby = Math.round(followerY * TILE) + offY;
      if (followerX !== state.tx || followerY !== state.ty) {
        // Compute follower animation offset
        const anim = state.followerAnim;
        const elapsed = now - anim.startedAt;
        let followerOffsetY = 0;
        let followerRotation = 0;

        if (anim.kind === "jump") {
          if (elapsed < 120) {
            followerOffsetY = -Math.sin((elapsed / 120) * Math.PI) * 10;
          } else if (elapsed < 240) {
            followerOffsetY = -Math.sin(((elapsed - 120) / 120) * Math.PI) * 10 * (1 - (elapsed - 120) / 120);
          } else {
            state.followerAnim = { kind: "idle", startedAt: 0 };
          }
        } else if (anim.kind === "spin") {
          if (elapsed < 400) {
            followerRotation = (elapsed / 400) * Math.PI * 2;
          } else {
            state.followerAnim = { kind: "idle", startedAt: 0 };
          }
        }

        // Increased idle bob: 2.5px amplitude
        const idleBob = anim.kind === "idle"
          ? Math.round(Math.sin(now / 350) * 2.5)
          : 0;

        // Pick directional follower sprite (faces toward player = opposite of player dir)
        let followerUrl: string | undefined;
        if (state.dir === "up")         followerUrl = FOLLOWER_BACK_URL[state.playerStage];
        else if (state.dir === "down")  followerUrl = FOLLOWER_SPRITE_URL[state.playerStage];
        else if (state.dir === "left")  followerUrl = FOLLOWER_LEFT_URL[state.playerStage];
        else                            followerUrl = FOLLOWER_RIGHT_URL[state.playerStage];

        const followerImg = followerUrl ? getSprite(followerUrl) : null;
        const size = Math.round(TILE * 0.9);
        const drawX = fbx + (TILE - size) / 2;
        const drawY = fby + (TILE - size) / 2 + followerOffsetY + idleBob;

        // Idle sleep: follower shrinks + fades after 30s of no input
        const idleTime = now - lastPlayerMoveAt;
        const idleSleep = idleTime > 30000;
        const followerScale = idleSleep ? 0.8 : 1.0;
        const followerAlpha = idleSleep ? 0.5 : 1.0;

        if (followerImg && isReady(followerImg)) {
          // Drop shadow for follower
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath();
          ctx.ellipse(fbx + TILE / 2, fby + TILE - 2, TILE * 0.35, TILE * 0.1, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = followerAlpha;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          const scaledSize = Math.round(size * followerScale);
          const scaleDrawX = fbx + (TILE - scaledSize) / 2;
          const scaleDrawY = fby + (TILE - scaledSize) / 2 + followerOffsetY + idleBob;
          if (followerRotation !== 0) {
            const cx2 = scaleDrawX + scaledSize / 2;
            const cy2 = scaleDrawY + scaledSize / 2;
            ctx.save();
            ctx.translate(cx2, cy2);
            ctx.rotate(followerRotation);
            ctx.drawImage(followerImg, -scaledSize / 2, -scaledSize / 2, scaledSize, scaledSize);
            ctx.restore();
          } else {
            ctx.drawImage(followerImg, scaleDrawX, scaleDrawY, scaledSize, scaledSize);
          }
          ctx.imageSmoothingEnabled = false;
          ctx.globalAlpha = 1.0;
        } else {
          ctx.globalAlpha = followerAlpha;
          const followerFrame = (state.stepCount % 2 === 0 ? 1 : 0) as 0 | 1 | 2;
          drawFollower(ctx, state.playerStage as "mermander" | "mermalion" | "merlord", fbx, fby, followerFrame);
          ctx.globalAlpha = 1.0;
        }
      }
    }
  }


  // ─── Render: Effects Layer ────────────────────────────────────────
  function renderEffects(ctx: CanvasRenderingContext2D, now: number, offX: number, offY: number) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const cx = camXSmooth;
    const cy = camYSmooth;
    const tx0 = Math.max(0, Math.floor(cx) - 4);
    const ty0 = Math.max(0, Math.floor(cy) - 4);
    const tx1 = Math.min(worldW, Math.floor(cx) + VIEW_TILES_X + 5);
    const ty1 = Math.min(worldH, Math.floor(cy) + VIEW_TILES_Y + 5);

    // ── Per-zone weather particles ────────────────────────────────────────
    for (const z of ZONES) {
      if (z.oy + z.h < ty0 - 2 || z.oy > ty1 + 2) continue;
      const zx0 = z.ox * TILE + offX;
      const zy0 = z.oy * TILE + offY;
      const zw  = z.w  * TILE;
      const zh  = z.h  * TILE;
      // Clip weather to zone bounds
      ctx.save();
      ctx.beginPath();
      ctx.rect(zx0, zy0, zw, zh);
      ctx.clip();
      switch (z.theme.ground) {
        case "neon": {
          // ai — falling hex/data rain
          for (let p = 0; p < 18; p++) {
            const seed = z.id.charCodeAt(0) * 31 + p * 17;
            const col  = zx0 + (seed * 53 % zw);
            const spd  = 0.04 + (seed % 5) * 0.012;
            const ypos = zy0 + ((now * spd + seed * 43) % zh);
            const chr  = ["0","1","#",">","<","[","]"][p % 7];
            ctx.fillStyle = `rgba(0,232,160,${0.18 + (p % 3) * 0.06})`;
            ctx.font = "bold 7px monospace";
            ctx.fillText(chr, col, ypos);
          }
          break;
        }
        case "crypto": {
          // fere — green matrix rain columns
          for (let p = 0; p < 14; p++) {
            const seed = z.id.charCodeAt(1) * 29 + p * 19;
            const col  = zx0 + (seed * 61 % zw);
            const spd  = 0.05 + (seed % 4) * 0.015;
            const ypos = zy0 + ((now * spd + seed * 37) % zh);
            ctx.fillStyle = `rgba(0,255,120,${0.10 + (p % 3) * 0.04})`;
            ctx.fillRect(col, ypos, 1, 6 + p % 8);
          }
          break;
        }
        case "studio": {
          // ccd — floating musical notes
          for (let p = 0; p < 8; p++) {
            const seed  = z.id.charCodeAt(0) * 23 + p * 41;
            const noteX = zx0 + (seed * 47 % zw);
            const floatY = Math.sin(now / 1800 + p * 0.9) * 12;
            const noteY  = zy0 + (seed * 31 % zh) + floatY;
            const alpha  = 0.12 + Math.sin(now / 900 + p) * 0.06;
            ctx.fillStyle = `rgba(255,210,140,${alpha})`;
            ctx.font = "10px serif";
            ctx.fillText(["♩","♪","♫","♬"][p % 4], noteX, noteY);
          }
          break;
        }


        case "snow": {
          // snow — falling snowflakes
          for (let p = 0; p < 22; p++) {
            const seed = z.id.charCodeAt(0) * 37 + p * 13;
            const spd  = 0.018 + (seed % 5) * 0.006;
            const wx2  = zx0 + (seed * 59 % zw) + Math.sin(now / 1200 + p) * 4;
            const wy2  = zy0 + ((now * spd + seed * 51) % zh);
            const alpha = 0.25 + (p % 3) * 0.08;
            ctx.fillStyle = `rgba(220,235,255,${alpha})`;
            ctx.fillRect(wx2, wy2, p % 3 === 0 ? 2 : 1, p % 3 === 0 ? 2 : 1);
          }
          break;
        }
        case "mall": {
          // sole mall — rising glitter/sparkle motes
          for (let p = 0; p < 12; p++) {
            const seed  = z.id.charCodeAt(0) * 43 + p * 23;
            const spd   = 0.015 + (seed % 4) * 0.007;
            const mx    = zx0 + (seed * 67 % zw);
            const my    = zy0 + zh - ((now * spd + seed * 29) % zh);
            const alpha = 0.10 + Math.sin(now / 400 + p * 1.3) * 0.07;
            ctx.fillStyle = `rgba(255,180,230,${alpha})`;
            ctx.fillRect(mx, my, 2, 2);
          }
          break;
        }
        case "dusk": {
          // investopad — slow drifting gold motes
          for (let p = 0; p < 8; p++) {
            const seed  = z.id.charCodeAt(0) * 53 + p * 31;
            const drift = Math.sin(now / 2200 + p * 1.1) * 8;
            const mx    = zx0 + (seed * 71 % zw) + drift;
            const my    = zy0 + (seed * 43 % zh) + Math.sin(now / 1600 + p) * 6;
            const alpha = 0.08 + Math.sin(now / 800 + p) * 0.04;
            ctx.fillStyle = `rgba(240,196,255,${alpha})`;
            ctx.fillRect(mx, my, 2, 2);
          }
          break;
        }
        default: break;
      }
      ctx.restore();
    }


    // ── Footstep dust particles ─────────────────────────────────────────
    for (let d = dustParticles.length - 1; d >= 0; d--) {
      const dp = dustParticles[d];
      dp.x     += dp.vx;
      dp.y     += dp.vy;
      dp.vy    += 0.04;   // gravity
      dp.alpha -= 0.028;
      if (dp.alpha <= 0) { dustParticles.splice(d, 1); continue; }
      ctx.fillStyle = `rgba(200,180,140,${dp.alpha.toFixed(2)})`;
      ctx.fillRect(
        Math.round(dp.x + offX - state.px * TILE + state.tx * TILE),
        Math.round(dp.y + offY - state.py * TILE + state.ty * TILE),
        Math.ceil(dp.size), Math.ceil(dp.size),
      );
    }

    // Edge vignette — subtle darkening at canvas borders
    const vgW = VIEW_TILES_X * TILE;
    const vgH = VIEW_TILES_Y * TILE;
    const vg = ctx.createRadialGradient(vgW/2, vgH/2, vgH*0.3, vgW/2, vgH/2, vgH*0.85);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(2,5,14,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, vgW, vgH);
  }


  // ─── Game loop ────────────────────────────────────────────
  let camX = 0, camY = 0;
  let raf = 0;
  function frameLoop() {
    const now = performance.now();

    // walk interp
    if (state.px !== state.tx || state.py !== state.ty) {
      const t = Math.min(1, (now - state.walkStart) / WALK_DURATION_MS);
      state.px = state.walkFrom.x + (state.tx - state.walkFrom.x) * t;
      state.py = state.walkFrom.y + (state.ty - state.walkFrom.y) * t;
      if (t >= 1) {
        state.px = state.tx; state.py = state.ty; state.frame = 0;
        const z = zoneAt(state.tx, state.ty);
        if (z && !state.visitedZones.has(z.id)) {
          state.visitedZones.add(z.id);
          cb.onZoneEnter(z);
        }
        // MAT auto-trigger: stepping on a gym mat enters the battle
        if (world[state.ty]?.[state.tx] === T.MAT) {
          const matZone = ZONES.find((zz) => {
            const mx = zz.ox + zz.building.x + zz.building.doorX;
            const my = zz.oy + zz.building.y + zz.building.h - 1;
            return mx === state.tx && my === state.ty;
          });
          if (matZone && matZone.gym && !state.defeatedGyms.has(matZone.id)) {
            if (gymUnlocked(matZone.id, state.collectedBadges)) {
              if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([40, 20, 60, 20, 80]);
              cb.onGymEnter(matZone);
            } else {
              cb.onInteract({
                kind: "sign", zone: matZone,
                sign: { x: state.tx, y: state.ty, text: `${matZone.name.toUpperCase()}\n\nThis gym is sealed.\nDefeat the previous champions first.` },
                x: state.tx, y: state.ty,
              });
            }
          }
        }
        // auto-interact if click target reached
        if (pendingInteractAt) {
          const goal = pendingInteractAt;
          const dx = goal.x - state.tx, dy = goal.y - state.ty;
          if (Math.abs(dx) + Math.abs(dy) === 1) {
            state.dir = dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up";
            pendingInteractAt = null;
            interactInFront();
          } else if (dx === 0 && dy === 0) {
            pendingInteractAt = null;
          }
        } else {
          // Walked into the world; check for nearby orbs.
          autoInteractNear();
        }
      }
    }

    if (!state.paused) {
      if (input.action) { input.action = false; interactInFront(); }
      if (input.menu) { input.menu = false; cb.onMenu(); }

      if (state.px === state.tx && state.py === state.ty) {
        if (pendingScrollDir) {
          tryMove(pendingScrollDir);
          pendingScrollDir = null;
        } else if (state.path.length) {
          stepPath();
        } else if (input.up) tryMove("up");
        else if (input.down) tryMove("down");
        else if (input.left) tryMove("left");
        else if (input.right) tryMove("right");
      }
    } else {
      input.action = false; input.menu = false; pendingScrollDir = null;
    }


    // ── Camera computation ──────────────────────────────────────────────
    let cx = state.px - VIEW_TILES_X / 2 + 0.5;
    let cy = state.py - VIEW_TILES_Y / 2 + 0.5;
    cx = Math.max(0, Math.min(Math.max(0, worldW - VIEW_TILES_X), cx));
    cy = Math.max(0, Math.min(Math.max(0, worldH - VIEW_TILES_Y), cy));
    camX = cx; camY = cy;

    // Smooth cinematic camera lerp
    if (!camInitialized) {
      camXSmooth = cx; camYSmooth = cy; camInitialized = true;
    } else {
      camXSmooth += (cx - camXSmooth) * 0.12;
      camYSmooth += (cy - camYSmooth) * 0.12;
    }

    // Canvas shake — triggered by finishing blow in Battle
    let shakeX = 0, shakeY = 0;
    if (now < shakeUntil) {
      const t = (shakeUntil - now) / shakeAmp;
      shakeX = Math.round((Math.random() * 2 - 1) * t * 6);
      shakeY = Math.round((Math.random() * 2 - 1) * t * 4);
    }

    const offX = Math.round(-camXSmooth * TILE) + shakeX;
    const offY = Math.round(-camYSmooth * TILE) + shakeY;

    // ── Dirty flag check for background ─────────────────────────────────
    const camPixX = camXSmooth * TILE;
    const camPixY = camYSmooth * TILE;
    checkDirty(camPixX, camPixY);

    // ── Background layer ────────────────────────────────────────────────
    if (bgDirty.dirty) {
      layers.clearShake();
      renderBackground(layers.bgCtx, now, offX, offY);
      bgDirty.dirty = false;
      bgDirty.lastCamX = camPixX;
      bgDirty.lastCamY = camPixY;
    } else if (shakeX !== 0 || shakeY !== 0) {
      layers.applyShake(shakeX, shakeY);
    } else {
      layers.clearShake();
    }

    // ── Entity layer (always redrawn) ───────────────────────────────────
    renderEntities(layers.entityCtx, now, offX, offY);

    // ── Effects layer (always redrawn) ──────────────────────────────────
    renderEffects(layers.effectsCtx, now, offX, offY);

    raf = requestAnimationFrame(frameLoop);
  }


  function resize() {
    // Match canvas backing buffer to its CSS-displayed size, in TILE units.
    // Use the actual CSS layout size (which is set by the parent container / CSS)
    const container = canvas.parentElement!;
    const cssW = container.clientWidth || DEFAULT_VIEW_TILES_X * TILE;
    const cssH = container.clientHeight || DEFAULT_VIEW_TILES_Y * TILE;
    // Target CSS pixels per tile — zoomed out for full world visibility
    // Desktop: ~37 tiles wide on 1200px, Mobile: ~21 tiles on 500px
    const targetTilePx = cssW < 520 ? 24 : cssW < 900 ? 28 : 32;
    VIEW_TILES_X = Math.max(12, Math.min(40, Math.floor(cssW / targetTilePx)));
    VIEW_TILES_Y = Math.max(10, Math.min(28, Math.floor(cssH / targetTilePx)));
    // Resize all layer canvases
    const w = VIEW_TILES_X * TILE;
    const h = VIEW_TILES_Y * TILE;
    layers.resize(w, h);
    // Reset imageSmoothingEnabled on all contexts (canvas resize resets context state)
    layers.bgCtx.imageSmoothingEnabled = false;
    layers.entityCtx.imageSmoothingEnabled = false;
    layers.effectsCtx.imageSmoothingEnabled = false;
    // Force background redraw
    bgDirty.dirty = true;
  }
  resize();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resize()) : null;
  ro?.observe(canvas.parentElement!);
  window.addEventListener("orientationchange", resize);
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(frameLoop);


  return {
    state,
    setTouch,
    markGymDefeated(zoneId: string, badgeId: string) {
      state.defeatedGyms.add(zoneId);
      state.collectedBadges.add(badgeId);
    },
    markTrainerDefeated(npcName: string) {
      state.defeatedTrainers.add(npcName);
    },
    addCreature(id: string) { state.collectedCreatures.add(id); },
    addSkill(id: string) { state.collectedSkills.add(id); },
    triggerFollowerAnim(kind: "jump" | "spin") {
      if (!state.followerUnlocked) return;
      state.followerAnim = { kind, startedAt: performance.now() };
    },
    triggerShake(ms: number) { shakeUntil = performance.now() + ms; shakeAmp = ms; if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([60, 30, 80]); },
    /** Fast-travel: teleport the player to a zone's spawn / landmark tile. */
    warpTo(zoneId: string) {
      const z = ZONES.find((x) => x.id === zoneId);
      if (!z) return;
      const sx = z.ox + (z.spawn?.x ?? Math.floor(z.w / 2));
      const sy = z.oy + (z.spawn?.y ?? Math.floor(z.h / 2));
      state.px = state.tx = sx;
      state.py = state.ty = sy;
      state.path = [];
      state.dir = "down";
      state.visitedZones.add(z.id);
      lastAutoKey = ""; // allow re-triggering after warp
    },
    setPaused(p: boolean) {
      state.paused = p;
      if (p) { input.up = input.down = input.left = input.right = false; state.path = []; }
    },
    destroy() {
      cancelAnimationFrame(raf);
      // Remove input event listeners from effects canvas (topmost layer)
      layers.effects.removeEventListener("wheel", onWheel);
      layers.effects.removeEventListener("touchstart", onTouchStart);
      layers.effects.removeEventListener("touchmove", onTouchMove);
      layers.effects.removeEventListener("touchend", onTouchEnd);
      layers.effects.removeEventListener("click", onClick);
      // Remove global window listeners
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("resize", resize);
      // Disconnect ResizeObserver
      ro?.disconnect();
      // Destroy layer stack (removes canvases from DOM)
      layers.destroy();
    },
    setPlayerStage(stage: string) { state.playerStage = stage; },
    unlockFollower() { state.followerUnlocked = true; },
    get VIEW_TILES_X() { return VIEW_TILES_X; },
    get VIEW_TILES_Y() { return VIEW_TILES_Y; },
    TILE_PX: TILE,
  };
}

export { TILE };
export { allInteractives, ZONES };
