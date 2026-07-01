# Design Document

## Overview

This design covers four targeted polish fixes for the Param Quest game prior to release. Each fix is a small, isolated change to an existing component or module. The architecture remains unchanged — no new modules or data flows are introduced. The fixes touch CSS layout (CliffNotes), animation timing (TransitionOverlay), game-logic collision/interaction (engine.ts), and world-generation placement (world.ts).

## Architecture

The existing game architecture consists of:
- **React UI layer** — components like `CliffNotes.tsx` and `TransitionOverlay.tsx` that render overlays on top of the canvas
- **Game Engine** (`engine.ts`) — manages game state, input, collision detection (`isSolid`), proximity interaction (`autoInteractNear`), and rendering
- **World Builder** (`world.ts`) — procedurally generates the tile grid at startup, placing buildings, props, badges, creatures, and hidden items
- **Data Layer** (`data.ts`) — static zone/NPC/creature definitions and coordinate formulas

No new components are added. All changes are modifications to existing logic within these modules.

---

## Component Changes

### 1. CliffNotes Modal Centering

**File:** `components/game/CliffNotes.tsx`

**Current behavior:** The backdrop flex container uses `alignItems: "flex-end"` which anchors the modal card to the bottom of the viewport (mobile sheet pattern).

**Target behavior:** Center the modal both vertically and horizontally. Increase `maxWidth` for desktop readability.

```typescript
// Before
style={{
  position: "fixed", inset: 0, zIndex: 30,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
  background: "rgba(4,8,20,0.72)",
  backdropFilter: "blur(3px)",
}}

// After
style={{
  position: "fixed", inset: 0, zIndex: 30,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(4,8,20,0.72)",
  backdropFilter: "blur(3px)",
}}
```

On the modal card itself:

```typescript
// Before
width: "92%", maxWidth: 440,

// After
width: "92%", maxWidth: 560,
```

All other card properties (`maxHeight: "70dvh"`, border-radius, etc.) remain unchanged.

---

### 2. Zone Transition Timing Reduction

**File:** `components/game/TransitionOverlay.tsx`

**Current behavior:** The `DURATION` map stores total animation budget per kind. For `zone`, the current value is `400` but the internal timer logic adds `+80ms` hold and `+120ms` tail, producing ~600ms total elapsed time.

**Target behavior:** Reduce internal delays so total elapsed ≤ 400ms for zone transitions. The `half` calculation becomes the in-phase duration; the hold gap and tail are minimized.

```typescript
// Current timer logic
const half = DURATION[trigger.kind] / 2;  // 200ms for zone
const t1 = setTimeout(..., half);          // hold at 200ms
const t2 = setTimeout(..., half + 80);     // out at 280ms
const t3 = setTimeout(..., DURATION[trigger.kind] + 120); // idle at 520ms

// Revised timer logic for "zone" kind
const dur = DURATION[trigger.kind];  // 400ms
const inPhase = 180;
const holdGap = 40;
const t1 = setTimeout(..., inPhase);            // hold at 180ms
const t2 = setTimeout(..., inPhase + holdGap);  // out at 220ms
const t3 = setTimeout(..., dur);                // idle at 400ms
```

The `DURATION` map values for `battle` (500) and `warp` (350) are **not** modified. Only the zone transition internal scheduling changes.

---

### 3. Badge/Orb Collectibility

**File:** `game/engine.ts`

#### 3a. Remove badge from `isSolid`

**Current behavior:** The `isSolid` function treats badge positions as solid when the badge is uncollected:

```typescript
if (i.kind === "badge" && i.x === x && i.y === y && !state.collectedBadges.has(i.zone.badge.id)) return true;
```

**Target behavior:** Remove this condition entirely. Badges should be walk-through-able so the player can step onto them and auto-collect.

```typescript
// Remove this line from isSolid:
// if (i.kind === "badge" && ...) return true;
```

#### 3b. Add badge to `autoInteractNear`

**Current behavior:** `autoInteractNear` handles wild creatures, signs, NPCs, and hidden items — but not badges. The comment says "badges auto-collect on contact only" but there's no code implementing this in the proximity scan.

**Target behavior:** Add a badge proximity check in `autoInteractNear`, after the wild check and before (or after) the sign check:

```typescript
// Badge auto-collect — triggers when player is adjacent to or standing on the badge
const badge = interactives.find((i) => i.kind === "badge" && i.x === n.x && i.y === n.y);
if (badge && badge.kind === "badge" && !state.collectedBadges.has(badge.zone.badge.id)) {
  const key = `b:${badge.zone.id}:${badge.zone.badge.id}`;
  if (key !== lastAutoKey || performance.now() - lastAutoAt > 8000) {
    lastAutoKey = key; lastAutoAt = performance.now();
    state.collectedBadges.add(badge.zone.badge.id);
    cb.onBadge(badge.zone.badge.id);
    return;
  }
}
```

#### 3c. Protect interactive positions in World Builder

**File:** `game/world.ts`

**Current behavior:** The `addZoneTreeClusters`, dense prop placement, and perimeter flower logic in `placeZoneContent` can overwrite badge, wild creature, or hidden item tiles with solid props (trees, fences, etc.) because the safety checks don't account for all interactive positions.

**Target behavior:** Add coordinate protection in the `safe()` helper within `addZoneTreeClusters` and in the dense prop/flower loops to skip:
- Badge position: `(zone.ox + zone.badge.x, zone.oy + zone.badge.y)`
- Wild creature position: result of `wildPositionFor(zone)`
- Hidden item position: `(zone.ox + zone.hiddenItem.x, zone.oy + zone.hiddenItem.y)` if defined

```typescript
// In addZoneTreeClusters safe() function, add:
// Never on wild creature position
const wildPos = wildPositionFor(z);
if (gx === wildPos.x && gy === wildPos.y) return false;
// Never on hidden item position
if (z.hiddenItem) {
  const hx = z.ox + z.hiddenItem.x, hy = z.oy + z.hiddenItem.y;
  if (gx === hx && gy === hy) return false;
}
```

In the dense prop placement loop, add similar skip conditions for badge, wild, and hidden-item world coordinates.

---

### 4. Gym Mat Placement

**File:** `game/world.ts` — `paintBuilding` function

**Current behavior:** The mat is placed at `(zoneOx + b.x + b.doorX, zoneOy + b.y + b.h)`, which is one tile **below** the building footprint. The building sprite covers rows `b.y` to `b.y + b.h - 1`, so the mat sits one tile south of the sprite — creating a visual gap.

**Target behavior:** Place the mat at `(zoneOx + b.x + b.doorX, zoneOy + b.y + b.h - 1)`, which is the bottom row of the building footprint. This makes the mat visually adjoin the building sprite (it's rendered under the sprite's bottom edge).

```typescript
// Before
const matWy = zoneOy + b.y + b.h;

// After
const matWy = zoneOy + b.y + b.h - 1;
```

**File:** `game/engine.ts` — mat detection in the frame loop

**Current behavior:** The engine detects the mat tile using:

```typescript
const my = zz.oy + zz.building.y + zz.building.h; // mat is one south of door
```

**Target behavior:** Update to match the new placement:

```typescript
const my = zz.oy + zz.building.y + zz.building.h - 1; // mat adjoins building bottom
```

**Conflict avoidance:** The door interactive is placed at `(zone.ox + building.x + building.doorX, zone.oy + building.y + building.h - 1)` in `allInteractives()` in `data.ts`. With the mat now at the same Y coordinate, we must ensure that:
1. The door tile in the world grid (`T.DOOR`) remains at its current position (`b.y + b.h - 1` relative to building, at `doorX`)
2. The mat tile (`T.MAT`) is placed at the same world position — this means we paint `T.MAT` there **after** painting the building walls/door, effectively overwriting `T.DOOR` with `T.MAT` for gym buildings
3. The engine's `interactInFront` still finds the door interactive at this position for non-gym buildings, but for gym buildings the mat takes visual priority and the mat-stepping logic handles the gym entry

Alternatively, the mat can share the coordinate with the door since the mat detection triggers on `world[state.ty][state.tx] === T.MAT` (tile-based), while door interaction triggers via `interactInFront` (facing-tile check). Since the player steps **onto** the mat (tile check) but would only interact with the door by pressing action while **facing** it, these two systems coexist at the same tile without conflict. The `paintBuilding` function should paint the mat tile **after** painting the door tile to ensure it takes visual priority.

---

## Data Models

No changes to data models. The `Zone`, `GameBadge`, `Creature`, `Skill`, `Interactive`, and `GameState` types remain unchanged.

---

## Error Handling

- **CliffNotes:** No error cases — purely visual CSS change.
- **TransitionOverlay:** Timer cleanup on unmount/re-trigger already exists. No new error paths.
- **Badge collection:** The `collectedBadges` Set prevents double-collection. The throttle key (`lastAutoKey`) prevents repeated callbacks within 8 seconds.
- **World Builder:** If a badge/wild/hidden position happens to fall on a protected tile that can't be cleared (e.g., the path corridor boundary), the existing `safe()` checks return false and no overwrite occurs — the original tile remains. The interactive will still be reachable because `isSolid` no longer blocks badges, and the engine auto-interact proximity scan handles adjacency.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Badge tiles are never solid

*For any* zone and its badge position, `isSolid(badge.x, badge.y)` SHALL return `false` regardless of whether the badge has been collected or not.

**Validates: Requirements 3.1**

### Property 2: Badge auto-collection on proximity

*For any* uncollected badge and any player position adjacent to (within 1 tile of) or on the badge tile, executing `autoInteractNear` SHALL invoke the `onBadge` callback with the correct badge ID, provided the throttle cooldown has expired.

**Validates: Requirements 3.2, 3.6**

### Property 3: Interactive positions remain non-solid in generated world

*For any* zone's badge position, wild creature position (computed by `wildPositionFor`), or hidden item position, after `buildWorld()` completes, the tile at that coordinate in the generated grid SHALL NOT be a member of the `SOLID` set.

**Validates: Requirements 3.3, 3.4, 3.5**

### Property 4: Badge collection idempotence

*For any* badge, after it has been collected (added to `collectedBadges`), subsequent proximity scans via `autoInteractNear` SHALL NOT invoke `onBadge` again for the same badge ID.

**Validates: Requirements 3.6**

### Property 5: Gym mat placement correctness

*For any* zone with a gym, after `buildWorld()` completes, the tile at position `(zone.ox + zone.building.x + zone.building.doorX, zone.oy + zone.building.y + zone.building.h - 1)` SHALL be `T.MAT`.

**Validates: Requirements 4.1**

### Property 6: Gym mat detection/placement formula consistency

*For any* zone with a gym, the coordinate formula used by the engine's mat-detection logic SHALL produce the same `(x, y)` pair as the coordinate formula used by the World Builder's mat-placement logic.

**Validates: Requirements 4.2, 4.3**

### Property 7: Defeated gym mat passthrough

*For any* gym zone where `defeatedGyms` contains the zone ID, stepping on the mat tile SHALL NOT trigger `onGymEnter`.

**Validates: Requirements 4.5**

### Property 8: No door/mat functional conflict for gym buildings

*For any* gym zone, when the mat tile and door tile share a coordinate, the engine SHALL handle the mat via tile-stepping detection (`world[ty][tx] === T.MAT`) and the door via facing-tile interaction (`interactInFront`), ensuring both systems coexist without either blocking the other.

**Validates: Requirements 4.4**
