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
} from "./sprite-registry";
import {
  TILE, SOLID, T, drawTile, drawBadge, drawCharacter, drawRoof, drawGymWall,
} from "./tiles";
import { drawLandmark } from "./landmarks";
import { drawFollower } from "./sprites";
import { playSound } from "../lib/audio";
import { findPath } from "./pathfind";

const DEFAULT_VIEW_TILES_X = 20;
const DEFAULT_VIEW_TILES_Y = 14;
const WALK_DURATION_MS = 140;

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
  const ctx = canvas.getContext("2d", { alpha: false })!;
  ctx.imageSmoothingEnabled = false;

  // Dynamic viewport: recomputed on resize based on canvas CSS size.
  let VIEW_TILES_X = DEFAULT_VIEW_TILES_X;
  let VIEW_TILES_Y = DEFAULT_VIEW_TILES_Y;

  // Canvas shake state
  let shakeUntil = 0;
  let shakeAmp = 0;

  // NPC facing state — remembers last facing dir for 2 seconds after player walks away
  const npcFacingState = new Map<string, { dir: Dir; until: number }>();

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

  const input: Input = { up: false, down: false, left: false, right: false, action: false, menu: false };

  function isSolid(x: number, y: number) {
    if (x < 0 || y < 0 || x >= worldW || y >= worldH) return true;
    if (SOLID.has(world[y][x])) return true;
    for (const i of interactives) {
      if (i.kind === "npc" && i.x === x && i.y === y) return true;
      if (i.kind === "badge" && i.x === x && i.y === y && !state.collectedBadges.has(i.zone.badge.id)) return true;
      if (i.kind === "wild" && i.x === x && i.y === y && !state.collectedCreatures.has(i.creature.id)) return true;
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
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
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
    // Also check if player is standing ON the door tile itself (some building layouts)
    const playerDoor = interactives.find((i) => i.kind === "door" && i.x === state.tx && i.y === state.ty);
    if (playerDoor && playerDoor.kind === "door") {
      if (playerDoor.zone.gym && !state.defeatedGyms.has(playerDoor.zone.id)) {
        if (gymUnlocked(playerDoor.zone.id, state.collectedBadges)) cb.onGymEnter(playerDoor.zone);
        else cb.onInteract({ kind: "sign", zone: playerDoor.zone, sign: { x: state.tx, y: state.ty, text: `${playerDoor.zone.name.toUpperCase()}\n\nThis gym is sealed.\nDefeat the previous champions first.` }, x: state.tx, y: state.ty });
      } else {
        cb.onDoorEnter(playerDoor.zone);
      }
      return;
    }
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
          } else {
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
  canvas.addEventListener("wheel", onWheel, { passive: false });

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
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: true });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });

  // Click / tap-to-walk (use pathfinding)
  function onClick(e: MouseEvent) {
    if (state.paused) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) / rect.width * canvas.width;
    const sy = (e.clientY - rect.top) / rect.height * canvas.height;
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
  canvas.addEventListener("click", onClick);

  // Touch input from on-screen controls
  function setTouch(name: InputName, value: boolean) { input[name] = value; if (value) state.path = []; }

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
            const my = zz.oy + zz.building.y + zz.building.h; // mat is one south of door
            return mx === state.tx && my === state.ty;
          });
          if (matZone) {
            if (matZone.gym && !state.defeatedGyms.has(matZone.id)) {
              if (gymUnlocked(matZone.id, state.collectedBadges)) {
                cb.onGymEnter(matZone);
              } else {
                cb.onInteract({
                  kind: "sign", zone: matZone,
                  sign: { x: state.tx, y: state.ty, text: `${matZone.name.toUpperCase()}\n\nThis gym is sealed.\nDefeat the previous champions first.` },
                  x: state.tx, y: state.ty,
                });
              }
            } else if (!matZone.gym) {
              // Non-gym building: also enter on mat step
              cb.onDoorEnter(matZone);
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

    render(now);
    raf = requestAnimationFrame(frameLoop);
  }

  function render(now: number) {
    // camera — raw position used for click-to-walk tile math
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

    ctx.fillStyle = "#08101a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Smooth day/night ambient tint based on local clock with minute-level interpolation
    {
      const lerp = (a: number, b: number, f: number) =>
        a + (b - a) * Math.max(0, Math.min(1, f));
      type Tint = { r: number; g: number; b: number; a: number };
      const TINT_NIGHT:   Tint = { r: 10,  g: 15,  b: 60,  a: 0.18 };
      const TINT_SUNRISE: Tint = { r: 255, g: 180, b: 80,  a: 0.08 };
      const TINT_DAY:     Tint = { r: 255, g: 255, b: 200, a: 0.02 };
      const TINT_DUSK:    Tint = { r: 80,  g: 100, b: 220, a: 0.10 };
      const hr = new Date().getHours();
      const mn = new Date().getMinutes();
      const tc = hr + mn / 60;
      let tint: Tint;
      if      (tc < 6)  { tint = TINT_NIGHT; }
      else if (tc < 9)  { const f = (tc-6)/3;  tint = { r:lerp(TINT_NIGHT.r,TINT_SUNRISE.r,f), g:lerp(TINT_NIGHT.g,TINT_SUNRISE.g,f), b:lerp(TINT_NIGHT.b,TINT_SUNRISE.b,f), a:lerp(TINT_NIGHT.a,TINT_SUNRISE.a,f) }; }
      else if (tc < 10) { const f = (tc-9)/1;  tint = { r:lerp(TINT_SUNRISE.r,TINT_DAY.r,f), g:lerp(TINT_SUNRISE.g,TINT_DAY.g,f), b:lerp(TINT_SUNRISE.b,TINT_DAY.b,f), a:lerp(TINT_SUNRISE.a,TINT_DAY.a,f) }; }
      else if (tc < 17) { tint = TINT_DAY; }
      else if (tc < 18) { const f = (tc-17)/1; tint = { r:lerp(TINT_DAY.r,TINT_DUSK.r,f), g:lerp(TINT_DAY.g,TINT_DUSK.g,f), b:lerp(TINT_DAY.b,TINT_DUSK.b,f), a:lerp(TINT_DAY.a,TINT_DUSK.a,f) }; }
      else if (tc < 20) { tint = TINT_DUSK; }
      else if (tc < 21) { const f = (tc-20)/1; tint = { r:lerp(TINT_DUSK.r,TINT_NIGHT.r,f), g:lerp(TINT_DUSK.g,TINT_NIGHT.g,f), b:lerp(TINT_DUSK.b,TINT_NIGHT.b,f), a:lerp(TINT_DUSK.a,TINT_NIGHT.a,f) }; }
      else              { tint = TINT_NIGHT; }
      ctx.fillStyle = `rgba(${Math.round(tint.r)},${Math.round(tint.g)},${Math.round(tint.b)},${tint.a.toFixed(3)})`; // canvas-only
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const tx0 = Math.max(0, Math.floor(cx));
    const ty0 = Math.max(0, Math.floor(cy));
    const tx1 = Math.min(worldW, tx0 + VIEW_TILES_X + 2);
    const ty1 = Math.min(worldH, ty0 + VIEW_TILES_Y + 2);

    for (let y = ty0; y < ty1; y++) {
      for (let x = tx0; x < tx1; x++) {
        drawTile(ctx, world[y][x], x, y, x * TILE + offX, y * TILE + offY, now);
      }
    }

    // roofs colored per zone
    for (const z of ZONES) {
      const b = z.building;
      const ry = z.oy + b.y;
      if (ry < ty0 - 1 || ry > ty1 + 1) continue;
      for (let bx = 0; bx < b.w; bx++) {
        const wx = b.x + bx + z.ox;
        const kind: "left" | "mid" | "right" | "solo" =
          b.w === 1 ? "solo" : bx === 0 ? "left" : bx === b.w - 1 ? "right" : "mid";
        drawRoof(ctx, wx * TILE + offX, ry * TILE + offY, b.color, b.roof, kind);
      }
      ctx.fillStyle = b.color + "22"; // canvas-only
      ctx.fillRect((b.x + z.ox) * TILE + offX, (b.y + 1 + z.oy) * TILE + offY, b.w * TILE, (b.h - 1) * TILE);

      // Gym buildings get distinctive accent walls
      if (z.gym && !state.defeatedGyms.has(z.id)) {
        // More imposing fill for gym buildings
        ctx.fillStyle = b.color + "40"; // canvas-only
        ctx.fillRect(
          (b.x + z.ox) * TILE + offX,
          (b.y + 1 + z.oy) * TILE + offY,
          b.w * TILE,
          (b.h - 1) * TILE
        );
        // Draw gym wall tiles over the building body
        for (let bx2 = 0; bx2 < b.w; bx2++) {
          for (let by2 = 1; by2 < b.h - 1; by2++) {
            drawGymWall(
              ctx,
              (b.x + bx2 + z.ox) * TILE + offX,
              (b.y + by2 + z.oy) * TILE + offY,
              b.color, z.theme.accent
            );
          }
        }
      }

      // landmark for this zone (only when on-screen)
      if (z.oy + z.h >= ty0 - 4 && z.oy <= ty1 + 4) {
        drawLandmark(ctx, z, offX, offY, now);
      }

      // GYM label painted on building front wall face
      if (z.gym && !state.defeatedGyms.has(z.id)) {
        const doorWx = z.ox + z.building.x + z.building.doorX;
        const buildFrontY = z.oy + z.building.y + z.building.h - 1;
        if (doorWx >= tx0 - 1 && doorWx <= tx1 + 1 && buildFrontY >= ty0 - 1 && buildFrontY <= ty1 + 1) {
          const wallStartY = (z.oy + z.building.y + 1) * TILE + offY;
          const labelX = (z.ox + z.building.x) * TILE + offX + 2;
          const labelW = z.building.w * TILE - 4;
          // Background strip on wall face
          ctx.fillStyle = "rgba(0,0,0,0.82)";
          ctx.fillRect(labelX, wallStartY + 2, labelW, 11);
          // GYM text
          ctx.fillStyle = z.theme.accent; // canvas-only
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.fillText("⚔ GYM", labelX + labelW / 2, wallStartY + 11);
          ctx.textAlign = "left";
        }
      }
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

    // NPCs — with idle bob animation, face toward player when nearby (with 2s revert timer)
    for (const i of interactives) {
      if (i.kind !== "npc") continue;
      if (i.x < tx0 - 1 || i.x > tx1 + 1 || i.y < ty0 - 1 || i.y > ty1 + 1) continue;
      const f = (Math.floor(now / 600 + i.x * 0.3) % 8 === 0 ? 1 : 0) as 0 | 1;
      const npcBob = Math.round(Math.sin(now / 800 + i.x * 1.3) * 1.5);
      // NPC facing with 2-second revert timer
      const npcKey = `${i.zone.id}:${i.x}:${i.y}`;
      const ndx = state.tx - i.x;
      const ndy = state.ty - i.y;
      const dist = Math.abs(ndx) + Math.abs(ndy);
      let npcDir: Dir = "down";
      if (dist <= 2) {
        const computed: Dir = Math.abs(ndx) >= Math.abs(ndy)
          ? (ndx > 0 ? "right" : "left")
          : (ndy > 0 ? "down" : "up");
        npcFacingState.set(npcKey, { dir: computed, until: now + 2000 });
        npcDir = computed;
      } else {
        const stored = npcFacingState.get(npcKey);
        if (stored && stored.until > now) npcDir = stored.dir;
      }
      drawCharacter(ctx, i.npc.kind, npcDir, f, i.x * TILE + offX, i.y * TILE + offY + npcBob);
    }

    // Route NPCs — rendered separately on the path between zones, face toward player
    for (const rn of ROUTE_NPCS) {
      if (rn.x < tx0 - 1 || rn.x > tx1 + 1 || rn.y < ty0 - 1 || rn.y > ty1 + 1) continue;
      const f = (Math.floor(now / 700 + rn.x * 0.4) % 8 === 0 ? 1 : 0) as 0 | 1;
      const bob = Math.round(Math.sin(now / 900 + rn.x * 1.1) * 1.5);
      // Route NPC facing with 2-second revert timer
      const rnKey = `route:${rn.x}:${rn.y}`;
      const rndx = state.tx - rn.x;
      const rndy = state.ty - rn.y;
      const rndist = Math.abs(rndx) + Math.abs(rndy);
      let rnDir: Dir = "down";
      if (rndist <= 2) {
        const computed: Dir = Math.abs(rndx) >= Math.abs(rndy)
          ? (rndx > 0 ? "right" : "left")
          : (rndy > 0 ? "down" : "up");
        npcFacingState.set(rnKey, { dir: computed, until: now + 2000 });
        rnDir = computed;
      } else {
        const stored = npcFacingState.get(rnKey);
        if (stored && stored.until > now) rnDir = stored.dir;
      }
      drawCharacter(ctx, rn.kind, rnDir, f, rn.x * TILE + offX, rn.y * TILE + offY + bob);
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
      const bob = Math.round(Math.sin(now / 240 + i.x) * 2);
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(bx + TILE / 2, by + TILE - 2, TILE * 0.35, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      const url = CREATURE_URL[i.zone.id];
      const img = url ? getSprite(url) : null;
      if (img && isReady(img)) {
        const size = Math.round(TILE * 1.4);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, bx + (TILE - size) / 2, by + (TILE - size) / 2 + bob, size, size);      } else {
        // fallback dot
        ctx.fillStyle = i.zone.theme.accent;
        ctx.fillRect(bx + 4, by + 4 + bob, TILE - 8, TILE - 8);
      }
      // "!" marker
      const pulse = (Math.floor(now / 300) % 2) === 0;
      if (pulse) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(bx + TILE - 6, by - 8 + bob, 3, 6);
        ctx.fillRect(bx + TILE - 6, by - 1 + bob, 3, 2);
        ctx.fillStyle = "#e83a3a";
        ctx.fillRect(bx + TILE - 5, by - 7 + bob, 1, 4);
        ctx.fillRect(bx + TILE - 5, by - 1 + bob, 1, 1);
      }
    }

    // Hidden item shimmer — subtle pulse so player can find items
    for (const i of interactives) {
      if (i.kind !== "hidden") continue;
      if (state.collectedSkills.has(i.zone.skill?.id ?? "")) continue;
      if (i.x < tx0 - 1 || i.x > tx1 + 1 || i.y < ty0 - 1 || i.y > ty1 + 1) continue;
      // Pulse once every 3 seconds for 400ms
      const pulsePhase = now % 3000;
      if (pulsePhase < 400) {
        const alpha = Math.sin((pulsePhase / 400) * Math.PI);
        const alphaHex = Math.round(alpha * 200).toString(16).padStart(2, "0");
        ctx.fillStyle = i.zone.theme.accent + alphaHex; // canvas-only
        ctx.fillRect(
          i.x * TILE + offX + TILE / 2 - 2,
          i.y * TILE + offY + TILE / 2 - 2,
          4, 4
        );
      }
    }

    // Gym door marker (glow effect on mat when unlocked and undefeated)
    for (const z of ZONES) {
      if (state.defeatedGyms.has(z.id)) continue;
      const dx = z.ox + z.building.x + z.building.doorX;
      const dy = z.oy + z.building.y + z.building.h;
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
        const size = Math.round(TILE * 1.5);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(paramImg, pbx + (TILE - size) / 2, pby + (TILE - size) / 2, size, size);
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
        const size = Math.round(TILE * 1.2);
        const drawX = fbx + (TILE - size) / 2;
        const drawY = fby + (TILE - size) / 2 + followerOffsetY + idleBob;

        if (followerImg && isReady(followerImg)) {
          ctx.imageSmoothingEnabled = false;
          if (followerRotation !== 0) {
            const cx2 = drawX + size / 2;
            const cy2 = drawY + size / 2;
            ctx.save();
            ctx.translate(cx2, cy2);
            ctx.rotate(followerRotation);
            ctx.drawImage(followerImg, -size / 2, -size / 2, size, size);
            ctx.restore();
          } else {
            ctx.drawImage(followerImg, drawX, drawY, size, size);
          }
        } else {
          const followerFrame = (state.stepCount % 2 === 0 ? 1 : 0) as 0 | 1 | 2;
          drawFollower(ctx, state.playerStage as "mermander" | "mermalion" | "merlord", fbx, fby, followerFrame);
        }
      }
    }

    // Edge vignette — subtle darkening at canvas borders
    const vgW = canvas.width;
    const vgH = canvas.height;
    const vg = ctx.createRadialGradient(vgW/2, vgH/2, vgH*0.3, vgW/2, vgH/2, vgH*0.85);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(2,5,14,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, vgW, vgH);
  }

  function resize() {
    // Match canvas backing buffer to its CSS-displayed size, in TILE units.
    const cssW = canvas.clientWidth || canvas.parentElement?.clientWidth || DEFAULT_VIEW_TILES_X * TILE;
    const cssH = canvas.clientHeight || canvas.parentElement?.clientHeight || DEFAULT_VIEW_TILES_Y * TILE;
    // Target a roomy on-screen tile size so the world feels close, not tiny:
    // ~36px/tile on phones (≈11 tiles across a 390px screen), 28px/tile on
    // tablets, 24px/tile on desktop. The canvas backing buffer is
    // VIEW_TILES * 16; CSS stretches it to fill.
    const targetTilePx = cssW < 520 ? 36 : cssW < 900 ? 30 : 26;
    VIEW_TILES_X = Math.max(9, Math.min(28, Math.floor(cssW / targetTilePx)));
    VIEW_TILES_Y = Math.max(11, Math.min(22, Math.floor(cssH / targetTilePx)));
    canvas.width = VIEW_TILES_X * TILE;
    canvas.height = VIEW_TILES_Y * TILE;
  }
  resize();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resize()) : null;
  ro?.observe(canvas);
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
    triggerShake(ms: number) { shakeUntil = performance.now() + ms; shakeAmp = ms; },
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
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("click", onClick);
      ro?.disconnect();
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("resize", resize);
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
