# Design Document — Visual Polish Overhaul & Gameplay Fixes

> **Scope:** 13 visual polish requirements (Req 1–13) + 10 gameplay bug/gap fixes (Req 14–23) identified in user audit. PR #22 (branch `visual-polish-v1`) already implements Req 1, 2(partial), 3(partial), 4(partial), 5, 6(partial), 7(partial), 8, 13.

---

## 1. Overview

This document covers the complete technical design for all remaining visual polish work **plus** a set of gameplay/content defects discovered in a hands-on audit of the live build. The two groups are kept in the same spec because many fixes touch the same files and should ship together.

### 1.1 Visual Polish Group (Req 1–13)
These requirements come from the earlier `visual-polish-v1` PR. Most are fully done; the remaining delta is small targeted changes in 8 files.

### 1.2 Gameplay Fixes Group (Req 14–23)
These were identified via live play and user feedback:

| # | Problem |
|---|---------|
| 14 | In gym battles the large arena sprite shows the gym **leader portrait** instead of their **Pokémon**; should face the creature, not the trainer |
| 15 | In **random (wild) battles** the opponent attacks first instead of the player |
| 16 | Wild encounters show an early/wrong Mermander sprite instead of stage-appropriate back sprite |
| 17 | Route NPCs use gym-leader sprite palettes; they need distinct procedural character palettes |
| 18 | Gym buildings are visually indistinct (same shape, same roof as regular buildings); each gym needs a unique look |
| 19 | Gym text label is floating above the building; it must render **on** the building facade |
| 20 | Cannot enter buildings in the first zone (Pallet Town); door interaction is broken or mis-positioned |
| 21 | Berries / skill items cannot be collected (nothing triggers on item tiles) |
| 22 | Creature sprites (zone creatures + Mermander line) are low-resolution and look bad at display size |
| 23 | World path feels completely linear and same-looking; needs non-linear visual feel using trees for size variation and zone differentiation |

---

## 2. Implementation Status Matrix

| Req | Title | Status | Files Affected | Notes |
|-----|-------|--------|----------------|-------|
| 1 | Finishing-blow Drama | ✅ Done | `Battle.tsx`, `engine.ts` | `finishFlash` + `triggerShake` wired |
| 2 | Pixel-art Zero Border-radius | 🔧 Partial | `Battle.tsx` ✅, `WorldMap.tsx` ❌, `ZoneTitle.tsx` ❌ | `WorldMap` has `borderRadius:3/2/50%`; `ZoneTitle` particles use `borderRadius:50%` |
| 3 | Day/Night Ambient Tint | 🔧 Partial | `engine.ts` | Hard cuts between phases; no minute-level interpolation |
| 4 | Battle UI Visual Hierarchy | 🔧 Partial | `Battle.tsx` | HP bars ✅, move names need 11px (currently 9px), flavor text needs 13px (currently 11px), hover fill needs `${accent}33` |
| 5 | Canvas Edge Vignette | ✅ Done | `engine.ts` | Radial gradient at end of `render()` |
| 6 | Zone Accent Dominance | 🔧 Partial | `Battle.tsx` ✅, `Game.tsx` | Toast border is `${accent}50`, needs `${accent}80` |
| 7 | NPC Facing Direction | 🔧 Partial | `engine.ts` | Faces player ✅; no 2s revert timer |
| 8 | Dialog GBA Border | ✅ Done | `DialogBox.tsx` | 2px solid `${accent}cc` + outline |
| 9 | Square Particles | ❌ Not Started | `ZoneTitle.tsx` | Still `borderRadius:50%` |
| 10 | WorldMap Pixel Style | ❌ Not Started | `WorldMap.tsx` | `borderRadius:3/2/50%` throughout; gradient connectors; circular nodes |
| 11 | CSS Variable Consolidation | ❌ Not Started | `globals.css` + components | `#07101e`, `#0d1527`, `#020508`, `#060c18`, `#04080f` still hardcoded |
| 12 | Battle Transition Timing | ❌ Not Started | `TransitionOverlay.tsx`, `Game.tsx` | `battle` duration 800ms (needs 600ms), flash 0.7 (needs 0.9), no `onMidpoint` gate |
| 13 | Super-effective Arena Flash | ✅ Done | `Battle.tsx` | `arenaFlash` state + `${accent}18` background |
| 14 | Gym battle shows creature not leader | ❌ Not Started | `Battle.tsx` | Arena canvas draws leader portrait; must draw creature PNG |
| 15 | Wild battle: player attacks first | ❌ Not Started | `Battle.tsx`, `CatchModal.tsx` | Opponent fires first; turn order logic inverted for wild encounters |
| 16 | Wrong Mermander sprite in wild battles | ❌ Not Started | `Battle.tsx`, `CatchModal.tsx` | Hardcoded `mermander` back-sprite; should use `stageForBadges(badges.size)` |
| 17 | Route NPCs use leader palettes | ❌ Not Started | `tiles.ts`, `data.ts` | `ROUTE_NPCS` default to `trainer-m/f`; need distinct palette kinds |
| 18 | Gym buildings look identical | ❌ Not Started | `tiles.ts`, `engine.ts`, `data.ts` | All gyms use same `BUILDING_WALL`/roof; each needs accent-colored walls + unique roof color |
| 19 | Gym text floating above building | ❌ Not Started | `engine.ts` | Label `labelY` computation places text above rather than on building wall |
| 20 | Cannot enter buildings in Pallet Town | ❌ Not Started | `data.ts`, `world.ts`, `engine.ts` | Home zone building `doorX`/coordinates likely mis-aligned with world tile grid |
| 21 | Berries/skills not collectible | ❌ Not Started | `engine.ts`, `data.ts` | `onHiddenItem` fires but skill IDs may not match; `autoInteractNear` has ordering bug |
| 22 | Sprites low-res / bad quality | ❌ Not Started | `generate_sprites_v3.mjs`, `sprite-registry.ts` | Need hi-res regeneration script + `imageSmoothingEnabled: false` guard |
| 23 | World feels linear / same-looking | ❌ Not Started | `world.ts`, `data.ts` | Need tree-size variation, path curves, zone-differentiated floor decoration |

---

## 3. Component-Level Design

### 3.1 `components/game/ZoneTitle.tsx` — Req 9 (Square Particles)

**Change:** In the `particles.map()` render block:
- `borderRadius: "50%"` → `borderRadius: 0`
- `boxShadow: \`0 0 8px ${accent}\`` → `boxShadow: "none"` with `width: 2, height: 2`

Cap all particle `size` values at 2 to enforce the 2×2 requirement.

**Before:**
```tsx
borderRadius: "50%",
boxShadow: `0 0 8px ${accent}`,
```

**After:**
```tsx
borderRadius: 0,
boxShadow: "none",
width: 2,
height: 2,
```

---

### 3.2 `components/game/WorldMap.tsx` — Req 10 (WorldMap Pixel Style)

All `borderRadius` removals:

| Element | Old Value | New Value |
|---------|-----------|-----------|
| Map container `div` | `borderRadius: 3` | `borderRadius: 0` |
| Header sub-container | `"3px 3px 0 0"` | `0` |
| Footer sub-container | `"0 0 3px 3px"` | `0` |
| Timeline node | `"50%"` | `0` |
| Node dimensions | `14×14` | `8×8` |
| Zone card `<button>` | `2` | `0` |
| Landmark thumbnail container | `2` | `0` |
| Close button | `2` | `0` |
| Visited dot (5×5) | `"50%"` | `0` |
| CTA warp badge (22×22) | `"50%"` | `0` |
| "HERE" tag span | `1` | `0` |

**Connector lines:**
- **Before:** `background: isDefeated ? \`linear-gradient(to bottom, …)\` : "#0e1c2e"`
- **After:** `background: isDefeated ? z.theme.accent : "#0e1c2e"` — flat solid color, no gradient

---

### 3.3 `game/engine.ts` — Req 7 (NPC Revert Timer) + Req 3 (Smooth Day/Night)

**NPC 2s revert timer — add at top of `createEngine`:**
```typescript
const npcFacingState = new Map<string, { dir: Dir; until: number }>();
```

**In NPCs render loop, replace facing logic:**
```typescript
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
```
Apply same pattern to `ROUTE_NPCS` loop using `route:${rn.x}:${rn.y}` as key.

**Smooth day/night interpolation — replace hard-cut hour block:**
```typescript
const lerp = (a: number, b: number, f: number) => a + (b - a) * Math.max(0, Math.min(1, f));
type Tint = { r: number; g: number; b: number; a: number };
const NIGHT:   Tint = { r: 10,  g: 15,  b: 60,  a: 0.18 };
const SUNRISE: Tint = { r: 255, g: 180, b: 80,  a: 0.08 };
const DAY:     Tint = { r: 255, g: 255, b: 200, a: 0.02 };
const DUSK:    Tint = { r: 80,  g: 100, b: 220, a: 0.10 };

const hour = new Date().getHours();
const min  = new Date().getMinutes();
const t    = hour + min / 60;

let tint: Tint;
if (t < 6)       { tint = NIGHT; }
else if (t < 9)  { const f = (t-6)/3;  tint = { r:lerp(NIGHT.r,SUNRISE.r,f), g:lerp(NIGHT.g,SUNRISE.g,f), b:lerp(NIGHT.b,SUNRISE.b,f), a:lerp(NIGHT.a,SUNRISE.a,f) }; }
else if (t < 10) { const f = (t-9)/1;  tint = { r:lerp(SUNRISE.r,DAY.r,f), g:lerp(SUNRISE.g,DAY.g,f), b:lerp(SUNRISE.b,DAY.b,f), a:lerp(SUNRISE.a,DAY.a,f) }; }
else if (t < 17) { tint = DAY; }
else if (t < 18) { const f = (t-17)/1; tint = { r:lerp(DAY.r,DUSK.r,f), g:lerp(DAY.g,DUSK.g,f), b:lerp(DAY.b,DUSK.b,f), a:lerp(DAY.a,DUSK.a,f) }; }
else if (t < 20) { tint = DUSK; }
else if (t < 21) { const f = (t-20)/1; tint = { r:lerp(DUSK.r,NIGHT.r,f), g:lerp(DUSK.g,NIGHT.g,f), b:lerp(DUSK.b,NIGHT.b,f), a:lerp(DUSK.a,NIGHT.a,f) }; }
else             { tint = NIGHT; }

ctx.fillStyle = `rgba(${Math.round(tint.r)},${Math.round(tint.g)},${Math.round(tint.b)},${tint.a.toFixed(3)})`;
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

---

### 3.4 `components/game/Battle.tsx` — Req 4 remaining + Req 14 + Req 15 + Req 16

**Move name font size (Req 4):** `fontSize: 9` → `fontSize: 11` in `isAttack` log branch.

**Flavor text font size (Req 4):** `fontSize: 11` → `fontSize: 13` in `isFlavor` log branch.

**MoveButton hover fill (Req 4):** `${color}22` → `${color}33` and `${color}0a` → `${color}14`.

**Gym battle arena shows creature not leader (Req 14):**

In `oppRef` canvas loop, the draw order already tries creature first then leader as fallback. The issue is that `oppCreatureImg` resolves to the same `CREATURE_URL[zone.id]` which may be missing for some zones. Verify URL map covers all 9 zones. The arena large sprite must be the **zone creature**, not the leader. Leader portrait appears **only** in the HP card thumbnail.

Current code in the `useEffect` loop:
```typescript
const drawImg = oppCreatureImg && isReady(oppCreatureImg)
  ? oppCreatureImg
  : leaderImg;
```
This is correct if `CREATURE_URL[zone.id]` is populated. Audit `sprite-registry.ts` to confirm all 9 zones have a `CREATURE_URL` entry. Add fallback procedural creature rendering if PNG is absent.

**Player attacks first in wild encounters (Req 15):**

The `Battle` component always starts with the gym leader's `intro` text and the player choosing a move. This is correct for gyms. For wild encounters (`CatchModal`), the encounter should also give the player the first action — this is already the case in the current flow. However, if `CatchModal` shows a "wild attacked!" message before the player acts, review `CatchModal.tsx` for the `leaderMove` setTimeout that fires at `t=900ms`. The fix: ensure the player's first move fires before the wild creature's counter.

**Stage-correct back sprite in wild encounters (Req 16):**

`PLAYER_BACK_URL[stage.id]` is already used in `Battle.tsx` — confirm `stage` is derived from `stageForBadges(badges.size)` not hardcoded to `mermander`. If `CatchModal.tsx` hardcodes `mermander` back sprite, update to accept `badges` prop and derive stage dynamically.

---

### 3.5 `components/game/Game.tsx` — Req 6 Toast border + Req 12 Battle gate

**Toast border (Req 6):** `${accent}50` → `${accent}80`.

**Battle mount gate via `onMidpoint` (Req 12):**
```tsx
<TransitionOverlay
  trigger={transition}
  onMidpoint={() => {
    if (battleIntro) {
      const z = battleIntro;
      setBattleIntro(null);
      setBattle(z);
    }
  }}
/>
```
Remove `setBattle(battleIntro)` from `BattleIntro.onComplete`.

---

### 3.6 `components/game/TransitionOverlay.tsx` — Req 12 Timing

- `DURATION.battle`: `800` → `600`
- Color wash opacity: `phase === "in" ? 0.7 : 0` → `(phase === "in" || phase === "hold") ? 0.9 : 0`

---

### 3.7 `app/globals.css` — Req 11 CSS Variables

Add to `:root`:
```css
--color-bg-deep:    #07101e;
--color-bg-dark:    #0d1527;
--color-bg-darkest: #020508;
--color-bg-panel:   #060c18;
--color-bg-void:    #04080f;
```

Component replacement map:

| File | Old Value | CSS Variable |
|------|-----------|-------------|
| `Battle.tsx` | `#060c18` (inactive button bg) | `var(--color-bg-panel)` |
| `Battle.tsx` | `#0d1527` (HP bar track) | `var(--color-bg-dark)` |
| `WorldMap.tsx` | `#060e1e` | `var(--color-bg-deep)` |
| `WorldMap.tsx` | `#040a16` | `var(--color-bg-void)` |

---

### 3.8 `game/tiles.ts` — Req 17 (Route NPC Palettes) + Req 18 (Gym Building Style)

**Route NPC palettes (Req 17):**

Add two new `NpcKind` values: `"route-trainer-m"` and `"route-trainer-f"` with distinct palettes that don't look like gym leaders:
```typescript
"route-trainer-m": { hair: "#3a2a18", skin: "#d4a060", shirt: "#2a5040", shirtAlt: "#1a3028", pants: "#3a3a2a", shoes: "#2a1a0a" },
"route-trainer-f": { hair: "#c86040", skin: "#e8b890", shirt: "#7a3a58", shirtAlt: "#4a1a38", pants: "#3a2a3a", shoes: "#1a1010" },
```

Update `ROUTE_NPCS` in `data.ts` to use `kind: "route-trainer-m"` or `"route-trainer-f"` instead of `"trainer-m"` / `"trainer-f"`.

**Gym building visual differentiation (Req 18):**

Add a new export `drawGymWall(ctx, px0, py0, color, accent)` to `tiles.ts` that draws:
- A darker, more imposing wall with the zone accent as highlight trim
- Vertical stripe pattern (different from the plain `BUILDING_WALL` horizontal bricks)
- Accent color glow at the top of the tile

In `engine.ts`, in the roof/wall rendering loop, detect gym zones (`z.gym && !state.defeatedGyms.has(z.id)`) and call `drawGymWall` instead of `drawTile(ctx, T.BUILDING_WALL, ...)`.

Per-gym roof colors (add to `Zone.building.roof` or infer from leader):

| Zone | Roof color | Accent trim |
|------|-----------|-------------|
| origin | `#2a1830` | `#f5b78a` |
| grp | `#1a3010` | `#a8d39a` |
| hab | `#3a1800` | `#f6a268` |
| ai | `#0a1830` | `#9fe8ff` |
| investopad | `#2a1040` | `#f0c4ff` |
| sole | `#3a0828` | `#ff9fd4` |
| fere | `#003d2c` | `#00e8a0` |
| ccd | `#2a0808` | `#ffd29a` |
| iterate | `#060c1e` | `#7ce0ff` |

---

### 3.9 `game/engine.ts` — Req 19 (Gym Text On Building) + Req 20 (Door Fix)

**Gym text on building (Req 19):**

The current label `labelY` is:
```typescript
const labelY = (z.oy + z.building.y + 1) * TILE + offY + 4;
```

This places the text at `building.y + 1` which is the second tile of the building — correct conceptually but the font size 7 + offY calculation causes it to appear above the roof in some angles. Fix: clamp `labelY` to be within the building's visible front wall area and ensure the background strip overlaps wall tiles:

```typescript
const wallStartY = (z.oy + z.building.y + 1) * TILE + offY;
const labelX = (z.ox + z.building.x) * TILE + offX + 2;
const labelW = z.building.w * TILE - 4;
// Strip sits on the wall face
ctx.fillStyle = "rgba(0,0,0,0.82)";
ctx.fillRect(labelX, wallStartY + 2, labelW, 11);
ctx.fillStyle = z.theme.accent;
ctx.font = "bold 8px monospace";
ctx.textAlign = "center";
ctx.fillText(
  "⚔ GYM",
  labelX + labelW / 2,
  wallStartY + 11
);
```

**Building door fix for Pallet Town (Req 20):**

The home zone building is defined as `{ x: 1, y: 2, w: 9, h: 6, doorX: 4 }`. The door tile is placed at `building.x + building.doorX = 1 + 4 = 5` (tile column), `building.y + building.h - 1 = 2 + 6 - 1 = 7` (tile row) relative to zone origin (`ox`, `oy`).

In `world.ts`, the `DOOR` tile is written at `(z.ox + b.x + b.doorX, z.oy + b.y + b.h - 1)`. The `allInteractives()` door entry is registered at the same coordinate via:
```typescript
{ kind: "door", zone: z, x: z.ox + z.building.x + z.building.doorX, y: z.oy + z.building.y + z.building.h - 1 }
```

Bug: In `world.ts`, check that the MAT tile (placed one south of the door at `y + 1`) is **not** overwriting the door tile. Also verify the door coordinate for `home` zone falls within the zone's `oy..oy+h` bounds. The home zone `oy` is computed as 0 (first zone). Confirm `oy + building.y + building.h - 1 < worldH`.

Also check that `isSolid()` does not block the door tile position — the door is `T.DOOR` which is NOT in `SOLID`, so approach should work. Check `onClick` in engine: click-to-walk may stop at the tile adjacent to the door rather than stepping on it. Ensure `interactInFront()` is called when the facing tile is the door.

---

### 3.10 `game/engine.ts` + `game/data.ts` — Req 21 (Berry/Skill Collection)

**Root cause investigation:**

The `onHiddenItem` callback fires from `autoInteractNear` only when:
1. The player steps **directly** onto `i.kind === "hidden"` tile
2. The skill ID is not already in `state.collectedSkills`

Known issues:
- `hiddenItem` coordinates in `data.ts` may be on a `SOLID` tile (tree, fence) that the player can never reach
- The `skill?.id` check uses optional chaining; if `z.skill` is undefined, the item silently does nothing
- `lastAutoKey` throttle may be blocking re-fire after panel closes

**Fix:**
1. Audit all `hiddenItem: { x, y }` coordinates in `data.ts` — each must be on a walkable tile (`PATH`, `GRASS`, `ROUTE_GRASS`, etc.)
2. In `autoInteractNear`, add an explicit fallback: if `hidden.zone.skill` is null, still fire `onHiddenItem` so the player gets feedback
3. Add a visual indicator on hidden item tiles: a subtle shimmer pixel that flashes once every 3s to hint presence

---

### 3.11 `generate_sprites_v3.mjs` + `sprite-registry.ts` — Req 22 (Hi-res Sprites)

**Problem:** Current sprites rendered via `ctx.drawImage` with `imageSmoothingEnabled = true` at sizes larger than their native resolution results in blur. Two-part fix:

**Part A — `imageSmoothingEnabled` audit:**
All canvas draw calls for game sprites must use:
```typescript
ctx.imageSmoothingEnabled = false;
```
This is set in the engine's `createEngine` call but may be reset by `ctx.clearRect` or by sub-canvases in `Battle.tsx`. Ensure every `getContext("2d")` call is followed by `ctx.imageSmoothingEnabled = false`.

**Part B — Sprite regeneration:**
The `generate_sprites_v3.mjs` script should be enhanced with a `--batch=creatures-hq` option that regenerates all 9 creature PNGs and all Mermander-line sprites at `fal-ai/flux/dev`, 28 steps, `square_hd` (1024×1024), using the refined prompt:

```
Pokemon GBA sprite, bold black pixel outlines, transparent background,
single centered creature, chibi proportions, clean 16-color palette,
no anti-aliasing, no background, pure pixel art, high contrast
```

Negative:
```
photorealistic, 3d, blurry, watermark, text, multiple creatures,
complex background, gradient shading, painterly
```

Output path: `public/sprites/creatures/{id}.png` (overwrite existing).

---

### 3.12 `game/world.ts` + `game/data.ts` — Req 23 (Non-linear World Feel)

**Tree size variation:**

In `world.ts`, the current tree placement is uniform. Add a seeded random tree-size modifier: trees adjacent to zones should be placed in clusters of 2–3 forming **natural-looking borders** rather than single-tile walls. The approach:

1. Add `T.TREE_TALL` to `tiles.ts` — a 2-tile-tall tree that occupies the tile above it as well (`SOLID`). Draw it with a larger crown (16×24 effective). This creates height variation.
2. In `world.ts`, every third tree along the side border of a route is replaced with `T.TREE_TALL` (seeded per position).

**Path curves:**

The world is strictly vertical (south-flowing). Routes between zones currently place the 6-tile-wide path in a straight vertical strip. Add a subtle "S-curve" to each route corridor:
- The path center shifts left/right by 1–2 tiles as it descends through the route
- The surrounding trees follow the curve
- This gives a non-linear visual feel without breaking pathfinding (BFS handles any walkable tile)

Implementation in `world.ts`:
```typescript
// For each route corridor between zones i and i+1:
// pathCenterX starts at zone center, shifts ±2 tiles over the route height
const curveOffset = (y: number, routeTop: number, routeH: number, amp: number) => {
  const t = (y - routeTop) / routeH;
  return Math.round(Math.sin(t * Math.PI) * amp);
};
```

**Zone-differentiated floor decoration:**

Each zone's floor area should have unique scatter props matching its theme. This already exists for zones (PROP_SERVER, PROP_RACK, etc.) but the density is too uniform. Add 2–3 zone-specific decorative tiles scattered on non-path floor tiles:

| Zone | Scatter tile |
|------|-------------|
| home | `FLOWER_R`, `FLOWER_Y` |
| origin | `PROP_PRICETAG` (early drafting) |
| grp | `PROP_CART`, `PROP_PRICETAG` |
| hab | `PROP_BRICK_PLANT` |
| ai | `PROP_SERVER`, `PROP_NEON_PYLON` |
| investopad | `PROP_TROPHY` |
| sole | `PROP_RACK`, `PROP_DECKCHAIR` |
| fere | `PROP_CANDLESTICK` |
| ccd | `PROP_SPEAKER` |
| iterate | `PROP_TROPHY`, `PROP_SERVER` |

---

## 4. Data Flow

```
Player clock → render() tint computation → ctx.fillRect (canvas overlay)
                                         → ZoneAmbience HTML overlay

Player moves → engine NPC facing → npcFacingState map → drawCharacter(dir)

Battle zone (gym)  → TransitionOverlay → onMidpoint → setBattle(zone)
                  → arena draws CREATURE PNG (not leader)
                  → player moves FIRST each turn

Wild encounter    → CatchModal → player acts first → creature counters

Player step → autoInteractNear → hidden skill tile? → onHiddenItem → SkillLearnOverlay

Player faces door → interactInFront → door.zone.gym? → onGymEnter
                                    → else → onDoorEnter → Interior
```

---

## 5. Property-Based Testing Approach

| Property | Test Approach |
|----------|--------------|
| P3.1 Clock determinism | Same (hour, min) inputs → identical `rgba` string |
| P3.2 Phase coverage | All hours 0–23 → no undefined/NaN tint values |
| P3.3 Transition smoothness | Adjacent minute values → alpha delta < 0.02 |
| P4.1 Move name font | DOM query after render → `fontSize === "11px"` |
| P7.1 NPC proximity facing | Player at (5,4), NPC at (5,5) → `dir === "up"` |
| P9.1 Particle shape | All ZoneTitle particle divs → `borderRadius === 0` |
| P10.1 WorldMap nodes | All timeline nodes → `width === 8 && borderRadius === 0` |
| P12.2 Flash opacity | Battle transition at hold phase → opacity === 0.9 |
| P14.1 Creature visible | All 9 gym zones → `oppRef` canvas draws creature not leader |
| P15.1 Player first move | Wild battle init state → player move buttons enabled on frame 1 |
| P22.1 Pixel rendering | All sprite canvas contexts → `imageSmoothingEnabled === false` |

---

## 6. File Change Summary

| File | Changes | Req # |
|------|---------|-------|
| `components/game/ZoneTitle.tsx` | Square particles (borderRadius:0, size:2×2) | 9 |
| `components/game/WorldMap.tsx` | All borderRadius→0; 8×8 square nodes; flat connectors | 10 |
| `game/engine.ts` | npcFacingState map + 2s timer; smooth tint; gym label on wall; door fix; imageSmoothingEnabled | 3, 7, 18, 19, 20, 22 |
| `components/game/Battle.tsx` | Font sizes; hover fill; creature arena sprite; player-first wild; stage-correct sprite | 4, 14, 15, 16 |
| `components/game/Game.tsx` | Toast border `${accent}80`; onMidpoint gate | 6, 12 |
| `components/game/TransitionOverlay.tsx` | battle 600ms; flash 0.9 | 12 |
| `components/game/CatchModal.tsx` | Stage-correct back sprite; player-first turn | 15, 16 |
| `app/globals.css` | Add 5 CSS variables | 11 |
| `game/tiles.ts` | Route NPC palettes; `drawGymWall()`; `T.TREE_TALL` | 17, 18, 23 |
| `game/data.ts` | Route NPC kinds; hidden item coordinate audit; zone building coords | 17, 20, 21 |
| `game/world.ts` | Path S-curves; tree-size variation; zone scatter props | 23 |
| `generate_sprites_v3.mjs` | Hi-res creature batch; `imageSmoothingEnabled` docs | 22 |
| `game/sprite-registry.ts` | Verify all 9 CREATURE_URL entries populated | 14 |

---

## 7. Testing Strategy

All changes are tested via:
1. **Visual inspection** in browser at 1× and 2× zoom
2. **Unit/property tests** for pure functions (tint interpolation, facing logic)
3. **Interaction tests**: walk to door → interior opens; walk to hidden item → skill overlay fires; enter gym → creature visible in arena; wild battle → player acts first

Tests are co-located in `*.test.ts` files where practical. Property-based tests use `fast-check`.
