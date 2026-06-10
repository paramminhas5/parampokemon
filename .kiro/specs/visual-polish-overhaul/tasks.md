# Implementation Tasks — Visual Polish Overhaul & Gameplay Fixes

> Tasks are organized in dependency order. Phase 1–8 complete the original visual-polish spec. Phase 9–16 fix the gameplay bugs identified in the live-play audit.

---

## Task Dependency Graph

```
Phase 1 (CSS variables) → consumed by Phase 2, 5, 6
Phase 2 (ZoneTitle)     — independent
Phase 3 (WorldMap)      — independent
Phase 4 (engine NPC)    — independent
Phase 5 (engine tint)   — independent
Phase 6 (Battle fonts)  — independent
Phase 7 (toast border)  — independent
Phase 8 (transition)    → Phase 8.3 depends on 8.1+8.2
Phase 9 (gym sprite)    — independent (sprite-registry audit first)
Phase 10 (wild battle)  — independent
Phase 11 (route NPCs)   → depends on Phase 12 (tile changes)
Phase 12 (gym buildings)— independent (tiles.ts + engine.ts)
Phase 13 (gym text)     — independent (engine.ts label fix)
Phase 14 (door fix)     — independent (world + data audit)
Phase 15 (berries)      → depends on Phase 14 (coordinate audit)
Phase 16 (world feel)   → depends on Phase 12 (tree tile types)
```

---

## Phase 1 — CSS Foundation (Req 11)

- [-] **Task 1.1** — `app/globals.css`: Add 5 CSS variables under `:root`:
  ```css
  --color-bg-deep:    #07101e;
  --color-bg-dark:    #0d1527;
  --color-bg-darkest: #020508;
  --color-bg-panel:   #060c18;
  --color-bg-void:    #04080f;
  ```
  *Satisfies: Req 11 criterion 1*

- [~] **Task 1.2** — `components/game/Battle.tsx`: Replace `"#060c18"` (inactive MoveButton background) with `"var(--color-bg-panel)"`. Replace `"#0d1527"` (HP bar track background) with `"var(--color-bg-dark)"`.
  *Satisfies: Req 11 criterion 2*

- [~] **Task 1.3** — `components/game/WorldMap.tsx`: Replace `#060e1e` (outer container gradient start) with `var(--color-bg-deep)` and `#040a16` (gradient end) with `var(--color-bg-void)`.
  *Satisfies: Req 11 criterion 3*

- [~] **Task 1.4** — Grep all `.tsx` files for literal strings `#07101e`, `#0d1527`, `#020508`, `#060c18`, `#04080f`. Replace each occurrence with the mapped CSS variable. Document any canvas fill calls that cannot use CSS variables with a `// canvas-only` comment.
  *Satisfies: Req 11 criterion 2, P11.2*

---

## Phase 2 — ZoneTitle Square Particles (Req 9)

- [~] **Task 2.1** — `components/game/ZoneTitle.tsx`: In the `particles` array definition, change `size` values so every particle is `2`:
  - Before: `size: i % 3 === 0 ? 5 : 3`
  - After: `size: 2`
  *Satisfies: Req 9 criterion 2, P9.2*

- [~] **Task 2.2** — `components/game/ZoneTitle.tsx`: In the `particles.map()` render block, change:
  - `borderRadius: "50%"` → `borderRadius: 0`
  - `boxShadow: \`0 0 8px ${accent}\`` → `boxShadow: "none"`
  - Set explicit `width: p.size, height: p.size`
  *Satisfies: Req 9 criterion 1, P9.1*

---

## Phase 3 — WorldMap Pixel Style (Req 10)

- [~] **Task 3.1** — `components/game/WorldMap.tsx`: Outer container `div` — change `borderRadius: 3` → `borderRadius: 0`.
  *Satisfies: Req 10 criterion 5, P10.2*

- [~] **Task 3.2** — `components/game/WorldMap.tsx`: Header sub-container — change `borderRadius: "3px 3px 0 0"` → `borderRadius: 0`.
  *Satisfies: Req 10 criterion 6*

- [~] **Task 3.3** — `components/game/WorldMap.tsx`: Footer sub-container — change `borderRadius: "0 0 3px 3px"` → `borderRadius: 0`.
  *Satisfies: Req 10 criterion 6*

- [~] **Task 3.4** — `components/game/WorldMap.tsx`: Timeline node — change `borderRadius: "50%"` → `borderRadius: 0`. Change `width: 14, height: 14` → `width: 8, height: 8`.
  *Satisfies: Req 10 criterion 3, P10.1*

- [~] **Task 3.5** — `components/game/WorldMap.tsx`: Zone card `<button>` — change `borderRadius: 2` → `borderRadius: 0`.
  *Satisfies: Req 10 criterion 1, P10.2*

- [~] **Task 3.6** — `components/game/WorldMap.tsx`: Landmark thumbnail container `div` — change `borderRadius: 2` → `borderRadius: 0`.
  *Satisfies: Req 10 criterion 2*

- [~] **Task 3.7** — `components/game/WorldMap.tsx`: Close button — change `borderRadius: 2` → `borderRadius: 0`.
  *Satisfies: Req 10 criterion 5*

- [~] **Task 3.8** — `components/game/WorldMap.tsx`: Defeated CTA badge (22×22 `div`) — change `borderRadius: "50%"` → `borderRadius: 0`. Change `width: 22, height: 22` → `width: 18, height: 18`.
  *Satisfies: Req 10 criterion 1*

- [~] **Task 3.9** — `components/game/WorldMap.tsx`: Visited dot (5×5 `div`) — change `borderRadius: "50%"` → `borderRadius: 0`.
  *Satisfies: Req 2 criterion 1*

- [~] **Task 3.10** — `components/game/WorldMap.tsx`: "HERE" tag span — change `borderRadius: 1` → `borderRadius: 0`.
  *Satisfies: Req 2 criterion 3*

- [~] **Task 3.11** — `components/game/WorldMap.tsx`: Timeline connector lines — remove gradient; use flat solid color:
  - Before: `background: isDefeated ? \`linear-gradient(to bottom, ${ZONES[i-1].theme.accent}, ${z.theme.accent})\` : "#0e1c2e"`
  - After: `background: isDefeated ? z.theme.accent : "#0e1c2e"`
  *Satisfies: Req 10 criterion 4, P10.3*

---

## Phase 4 — NPC Facing Revert Timer (Req 7)

- [~] **Task 4.1** — `game/engine.ts`: Add `const npcFacingState = new Map<string, { dir: Dir; until: number }>()` at the top of `createEngine`, before the `state` object.
  *Satisfies: Req 7 criterion 5, P7.3*

- [~] **Task 4.2** — `game/engine.ts`: In the zone NPCs render loop (`for (const i of interactives)` block), replace the current facing logic with the full state machine:
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
  *Satisfies: Req 7 criteria 1–3, P7.1, P7.2*

- [~] **Task 4.3** — `game/engine.ts`: Apply the same facing state machine to the `ROUTE_NPCS` render loop, using `route:${rn.x}:${rn.y}` as the map key.
  *Satisfies: Req 7 criterion 4*

---

## Phase 5 — Smooth Day/Night Interpolation (Req 3)

- [~] **Task 5.1** — `game/engine.ts`: In `render()`, add a `lerp` helper at top of the function. Replace the hard-cut `if/else if` hour-based tint block with the interpolated version using 4 tint keyframes (NIGHT, SUNRISE, DAY, DUSK) with smooth transition windows at hours 6–9, 9–10, 17–18, 20–21.

  Implementation outline:
  ```typescript
  const lerp = (a: number, b: number, f: number) =>
    a + (b - a) * Math.max(0, Math.min(1, f));
  const hour = new Date().getHours();
  const min  = new Date().getMinutes();
  const t    = hour + min / 60;
  // ... tint computation per design.md section 3.3
  ctx.fillStyle = `rgba(${Math.round(tint.r)},${Math.round(tint.g)},${Math.round(tint.b)},${tint.a.toFixed(3)})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ```
  *Satisfies: Req 3 criteria 1–7, P3.1, P3.2, P3.3*

---

## Phase 6 — Battle UI Font Sizes + Hover (Req 4)

- [~] **Task 6.1** — `components/game/Battle.tsx`: Battle log `isAttack` branch — change `fontSize: 9` → `fontSize: 11`.
  *Satisfies: Req 4 criterion 2, P4.1*

- [~] **Task 6.2** — `components/game/Battle.tsx`: Battle log `isFlavor` branch — change `fontSize: 11` → `fontSize: 13`. Confirm `fontStyle: "italic"` is present.
  *Satisfies: Req 4 criterion 4, P4.3*

- [~] **Task 6.3** — `components/game/Battle.tsx`: `MoveButton` hover gradient:
  - `${color}22` → `${color}33`
  - `${color}0a` → `${color}14`
  *Satisfies: Req 4 criterion 6*

---

## Phase 7 — Toast Border Fix (Req 6)

- [~] **Task 7.1** — `components/game/Game.tsx`: Toast `div` inline style — change `border: \`2px solid ${currentZone.theme.accent}50\`` → `border: \`2px solid ${currentZone.theme.accent}80\``.
  *Satisfies: Req 6 criterion 3, P6.2*

---

## Phase 8 — Battle Transition Timing (Req 12)

- [~] **Task 8.1** — `components/game/TransitionOverlay.tsx`: Change `DURATION.battle` from `800` → `600`.
  *Satisfies: Req 12 criterion 1, P12.1*

- [~] **Task 8.2** — `components/game/TransitionOverlay.tsx`: Color-wash opacity:
  - Before: `opacity: phase === "in" ? 0.7 : 0`
  - After: `opacity: (phase === "in" || phase === "hold") ? 0.9 : 0`
  *Satisfies: Req 12 criteria 2–3, P12.2*

- [~] **Task 8.3** — `components/game/TransitionOverlay.tsx`: Verify `onMidpoint` fires at `DURATION[kind] / 2 = 300ms` for battle kind. The existing `setTimeout(() => { setPhase("hold"); onMidpoint?.(); }, half)` is correct — confirm the `half` variable references `DURATION[trigger.kind] / 2` after the Task 8.1 change.
  *Satisfies: Req 12 criterion 4*

- [~] **Task 8.4** — `components/game/Game.tsx`: Wire `TransitionOverlay.onMidpoint` to gate `Battle` mount:
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
  Remove the `setBattle(battleIntro)` call from `BattleIntro.onComplete` handler (it should only call `setBattleIntro(null)` after this change).
  *Satisfies: Req 12 criteria 4–5, P12.3*

---

## Phase 9 — Gym Battle Shows Creature (Req 14)

- [~] **Task 9.1** — `game/sprite-registry.ts`: Audit `CREATURE_URL` map. Confirm entries exist for all 9 zone IDs: `origin`, `grp`, `hab`, `ai`, `investopad`, `sole`, `fere`, `ccd`, `iterate`. Add any missing entries pointing to `/sprites/creatures/{id}.png`.
  *Satisfies: Req 14 criterion 1*

- [~] **Task 9.2** — `components/game/Battle.tsx`: In the `oppRef` canvas animation loop, confirm the draw priority is:
  1. `oppCreatureImg` (zone creature PNG) — drawn large (224×224)
  2. Fall back to procedural if PNG not ready

  The leader portrait (`leaderImg`) must **not** appear in the arena canvas. Leader portrait belongs only in the HP card thumbnail (`img` tag with `width: 22`). If the current code uses `leaderImg` as the arena fallback, replace with a procedural creature silhouette instead:
  ```typescript
  if (oppCreatureImg && isReady(oppCreatureImg)) {
    c.drawImage(oppCreatureImg, 8, 8 + bob, 224, 224);
  } else {
    // Procedural fallback: draw a placeholder silhouette, NOT the leader
    c.fillStyle = zone.theme.accent + "40";
    c.fillRect(24, 24 + bob, 192, 192);
  }
  ```
  *Satisfies: Req 14 criteria 1–2, P14.1*

---

## Phase 10 — Wild Battle Turn Order + Sprite (Req 15, 16)

- [~] **Task 10.1** — `components/game/Battle.tsx` + `components/game/CatchModal.tsx`: Audit wild encounter entry point. In `CatchModal.tsx`, confirm the component does not auto-fire a "wild attacked" turn before the player picks a move. If there is a `setTimeout` that triggers an opponent move on mount, remove it or gate it behind a player action.
  *Satisfies: Req 15 criterion 1, P15.1*

- [~] **Task 10.2** — `components/game/Battle.tsx`: Confirm `Battle` props include `badges: Set<string>`. Confirm `stage = stageForBadges(badges.size)` is computed at the top of the component. Confirm `PLAYER_BACK_URL[stage.id]` is used for the player's back sprite canvas, NOT a hardcoded `mermander` string.
  *Satisfies: Req 16 criterion 1*

- [~] **Task 10.3** — `components/game/CatchModal.tsx`: If `CatchModal` has its own sprite rendering, update it to accept a `badges` prop and derive `stage = stageForBadges(badges.size)`. Use `PLAYER_BACK_URL[stage.id]` for the player back sprite. Pass `badges={badges}` from `Game.tsx` where `<CatchModal>` is mounted.
  *Satisfies: Req 16 criteria 1–2*

---

## Phase 11 — Route NPC Distinct Palettes (Req 17)

- [~] **Task 11.1** — `game/tiles.ts`: Add two new `NpcKind` palette entries to `PALETTES`:
  ```typescript
  "route-trainer-m": {
    hair: "#3a2a18", skin: "#d4a060",
    shirt: "#2a5040", shirtAlt: "#1a3028",
    pants: "#3a3a2a", shoes: "#2a1a0a"
  },
  "route-trainer-f": {
    hair: "#c86040", skin: "#e8b890",
    shirt: "#7a3a58", shirtAlt: "#4a1a38",
    pants: "#3a2a3a", shoes: "#1a1010"
  },
  ```
  Also add these to the `NpcKind` union type in `game/data.ts`.
  *Satisfies: Req 17 criterion 1*

- [~] **Task 11.2** — `game/data.ts`: In the `ROUTE_NPCS` array, change the `kind` field of each route NPC from `"trainer-m"` / `"trainer-f"` to `"route-trainer-m"` / `"route-trainer-f"` as appropriate.
  *Satisfies: Req 17 criterion 2*

---

## Phase 12 — Gym Building Visual Differentiation (Req 18)

- [~] **Task 12.1** — `game/tiles.ts`: Add a new exported function `drawGymWall(ctx, px0, py0, wallColor, accentColor)` that renders a distinctive gym wall tile:
  - Dark base wall: `wallColor` (darker than `BUILDING_WALL`)
  - Vertical pillar stripes every 4px (using `accentColor + "30"`)
  - Top 2px accent glow strip: `accentColor + "80"`
  - Bottom 1px shadow: `rgba(0,0,0,0.5)`
  *Satisfies: Req 18 criterion 1*

- [~] **Task 12.2** — `game/engine.ts`: In the building render loop, detect gym zones (`z.gym && !state.defeatedGyms.has(z.id)`). For tiles that are `T.BUILDING_WALL` within a gym building footprint, call `drawGymWall(ctx, px, py, z.building.color, z.theme.accent)` instead of `drawTile(ctx, T.BUILDING_WALL, ...)`.

  Implementation note: the current loop calls `ctx.fillStyle = b.color + "22"` for the building body fill. For gym buildings, change this to `b.color + "40"` for a more imposing presence.
  *Satisfies: Req 18 criteria 1–2*

- [~] **Task 12.3** — `game/data.ts`: Update each gym zone's `building.roof` to a zone-specific dark accent value (rather than generic `#b0382c`):
  - `origin`: `#2a1830`
  - `grp`: `#1a3010`
  - `hab`: `#3a1800`
  - `ai`: `#0a1830`
  - `investopad`: `#2a1040`
  - `sole`: `#3a0828`
  - `fere`: `#003d2c`
  - `ccd`: `#2a0808`
  - `iterate`: `#060c1e`
  *Satisfies: Req 18 criterion 3*

---

## Phase 13 — Gym Text On Building Face (Req 19)

- [~] **Task 13.1** — `game/engine.ts`: In the gym label rendering block, replace the current label positioning with:
  ```typescript
  const wallStartY = (z.oy + z.building.y + 1) * TILE + offY;
  const labelX    = (z.ox + z.building.x) * TILE + offX + 2;
  const labelW    = z.building.w * TILE - 4;
  // Background strip on wall face
  ctx.fillStyle = "rgba(0,0,0,0.82)";
  ctx.fillRect(labelX, wallStartY + 2, labelW, 11);
  // GYM text
  ctx.fillStyle = z.theme.accent;
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "center";
  ctx.fillText("⚔ GYM", labelX + labelW / 2, wallStartY + 11);
  ctx.textAlign = "left";
  ```
  Remove the old `labelY` variable and the previous `fillText` call.
  *Satisfies: Req 19 criteria 1–2*

---

## Phase 14 — Building Door / Entry Fix (Req 20)

- [~] **Task 14.1** — `game/data.ts`: Audit the home zone (`id: "home"`) building definition. Verify:
  - `building.x + building.doorX` is within `0..w-1`
  - `building.y + building.h - 1` is within the zone's `h` bounds
  - The resulting world tile `(ox + building.x + building.doorX, oy + building.y + building.h - 1)` is a walkable adjacent cell (player can stand 1 tile south of the door at `y + building.h` and face up to trigger `interactInFront`)
  
  If the coordinates are off, adjust `doorX` so the player can walk up to the door from the south.
  *Satisfies: Req 20 criterion 1*

- [~] **Task 14.2** — `game/world.ts`: Confirm the `DOOR` tile is being placed at the correct coordinate for the home zone. Add a `console.assert` in development mode that the door tile coordinate matches `allInteractives()` door entry coordinates.
  *Satisfies: Req 20 criterion 2*

- [~] **Task 14.3** — `game/engine.ts`: In `interactInFront()`, ensure that when the player faces a tile containing `T.DOOR`, the `door` interactive is correctly found by matching `i.x === f.x && i.y === f.y` where `f` is the facing tile. Add a fallback: also check if the player is standing ON the door tile (not just facing it), since some layouts allow the player to step onto the door.
  *Satisfies: Req 20 criterion 3*

- [~] **Task 14.4** — Test all 10 zones: walk up to each building door and press action key. Confirm `Interior` component mounts. Fix any zone where door coordinates are mis-aligned (common issue: `doorX` off by 1, or building placed outside zone bounds).
  *Satisfies: Req 20 criterion 4*

---

## Phase 15 — Berry / Skill Item Collection Fix (Req 21)

- [~] **Task 15.1** — `game/data.ts`: For every zone with `hiddenItem: { x, y }`, verify the coordinate falls on a non-solid tile in the zone's tile grid. Cross-reference with `world.ts` to confirm the tile at `(zone.ox + hiddenItem.x, zone.oy + hiddenItem.y)` is walkable. Fix any coordinate that lands on a tree, fence, or building wall by moving it 1–2 tiles onto the nearest path tile.
  *Satisfies: Req 21 criterion 1*

- [~] **Task 15.2** — `game/engine.ts`: In `autoInteractNear()`, the hidden item detection block:
  ```typescript
  if (hidden && hidden.kind === "hidden" && !state.collectedSkills.has(hidden.zone.skill?.id ?? "")) {
  ```
  Add a guard: if `hidden.zone.skill` is undefined, still log to console (dev mode) so missing skills are caught during testing. Add the zone ID to the key to prevent cross-zone throttle collisions:
  ```typescript
  const key = `h:${hidden.zone.id}:${n.x},${n.y}`;
  ```
  *Satisfies: Req 21 criterion 2*

- [~] **Task 15.3** — `game/engine.ts`: Add a subtle shimmer/pulse visual on hidden item tiles in the render loop. When a hidden item exists at `(i.x, i.y)` and has not been collected, draw a 2×2 pixel pulse every 3 seconds:
  ```typescript
  for (const i of interactives) {
    if (i.kind !== "hidden") continue;
    if (state.collectedSkills.has(i.zone.skill?.id ?? "")) continue;
    if (i.x < tx0 - 1 || i.x > tx1 + 1 || i.y < ty0 - 1 || i.y > ty1 + 1) continue;
    const pulse = (Math.floor(now / 3000) % 2 === 0) &&
      ((now % 3000) < 400);
    if (pulse) {
      ctx.fillStyle = i.zone.theme.accent + "cc";
      ctx.fillRect(
        i.x * TILE + offX + TILE / 2 - 1,
        i.y * TILE + offY + TILE / 2 - 1,
        2, 2
      );
    }
  }
  ```
  *Satisfies: Req 21 criterion 3*

---

## Phase 16 — Sprite Quality (Req 22)

- [~] **Task 16.1** — `components/game/Battle.tsx`: In `useEffect` loop (canvas draw loop), ensure every sub-canvas context sets `imageSmoothingEnabled = false`:
  ```typescript
  // At top of loop callback for meRef, oppRef, bgRef:
  const c = meRef.current!.getContext("2d")!;
  c.imageSmoothingEnabled = false;
  ```
  *Satisfies: Req 22 criterion 1*

- [~] **Task 16.2** — `game/engine.ts`: At `createEngine`, confirm `ctx.imageSmoothingEnabled = false` is set once at creation. Also set it before every `ctx.drawImage` call for player sprite and follower sprite, since some browsers reset this after `clearRect`.
  *Satisfies: Req 22 criterion 2*

- [~] **Task 16.3** — `generate_sprites_v3.mjs`: Add a `--batch=creatures-hq` mode that regenerates all creature and player PNGs at `fal-ai/flux/dev`, 28 steps, `square_hd` (1024×1024) with the refined pixel-art prompt. Add `--batch=leaders-hq` for gym leader PNGs. Output overwrites `public/sprites/creatures/{id}.png` and `public/sprites/leaders/{id}.png`.

  Prompt for creatures:
  ```
  Pokemon GBA sprite style, bold black pixel outlines, transparent background,
  single centered creature, chibi proportions, clean 16-color palette,
  no anti-aliasing, no background, pure pixel art, high contrast, 1024x1024
  ```
  Negative:
  ```
  photorealistic, 3d render, blurry, watermark, text, multiple creatures,
  complex background, gradient shading, painterly, anti-aliased
  ```
  *Satisfies: Req 22 criterion 3*

---

## Phase 17 — World Non-Linear Feel (Req 23)

- [~] **Task 17.1** — `game/tiles.ts`: Add `T.TREE_TALL: 40` to the tile enum. Add `T.TREE_TALL` to `SOLID` set. Add `case T.TREE_TALL:` to `drawTile()`:
  - Draw the same tree as `T.TREE` but with an extra 8px taller crown (extend foliage upward)
  - The tile itself is 16×16 but the drawn art extends 8px above `py0` (use `py0 - 8` for crown top)
  *Satisfies: Req 23 criterion 1*

- [~] **Task 17.2** — `game/world.ts`: In the route corridor placement loop, replace every 3rd tree tile along the route side borders with `T.TREE_TALL` (seeded by position so it's deterministic). This creates height variation along corridors.
  *Satisfies: Req 23 criterion 2*

- [~] **Task 17.3** — `game/world.ts`: Add a `routePathOffset(y, routeTop, routeH)` helper function that returns a ±2 tile horizontal offset using a sine curve:
  ```typescript
  function routePathOffset(y: number, routeTop: number, routeH: number): number {
    const t = (y - routeTop) / routeH;
    return Math.round(Math.sin(t * Math.PI * 1.5) * 2);
  }
  ```
  Apply this offset to the center column of the path and the surrounding tree walls when building each route corridor, so the path gently curves left/right as the player walks south.
  *Satisfies: Req 23 criterion 3*

- [~] **Task 17.4** — `game/world.ts`: In the zone floor placement loop, scatter zone-specific decorative props on non-path, non-solid tiles using a seeded random:
  - `home`: 20% chance of `FLOWER_R`/`FLOWER_Y`
  - `grp`: 15% chance of `PROP_PRICETAG`
  - `hab`: 15% chance of `PROP_BRICK_PLANT`
  - `ai`: 10% chance of `PROP_NEON_PYLON`
  - `investopad`: 10% chance of `PROP_TROPHY`
  - `sole`: 15% chance of `PROP_RACK`
  - `fere`: 15% chance of `PROP_CANDLESTICK`
  - `ccd`: 10% chance of `PROP_SPEAKER`
  - `iterate`: 10% chance of `PROP_TROPHY`

  Use the existing seeded noise function `n(x, y)` to gate placement probability.
  *Satisfies: Req 23 criterion 4*

---

## Phase 18 — Final Verification & Commit

- [ ] **Task 18.1** — Visual regression check: Walk through all 10 zones in the browser. Verify:
  - [~] Gym text appears on building wall, not floating
  - [~] Route NPCs have distinct looks (not gym leader sprites)
  - [~] Gym buildings look different from regular buildings
  - [~] Entering a building opens Interior component
  - [~] Hidden item pulses; collecting it shows SkillLearnOverlay
  - [~] Gym battle arena shows zone creature PNG (not leader portrait)
  - [~] World path has visible curves; tree heights vary
  *Satisfies: All Req 17–23*

- [ ] **Task 18.2** — Battle check:
  - [~] Enter any gym: transition is 600ms, flash reaches 0.9 opacity
  - [~] Arena shows creature sprite large; leader is only in HP card thumbnail
  - [~] Move name text is readable (≥11px)
  - [~] Flavor/log text is italic and larger (13px)
  *Satisfies: Req 4, 12, 14*

- [~] **Task 18.3** — Grep verification: Run `grep -r "#07101e\|#0d1527\|#020508\|#060c18\|#04080f" --include="*.tsx" --include="*.css" .` — confirm zero matches outside of `globals.css` variable declarations.
  *Satisfies: Req 11*

- [~] **Task 18.4** — Commit all Phase 1–17 changes to branch `visual-polish-v2`. Push. Open PR targeting `visual-polish-v1`.

---

## Appendix — Quick Reference: Files Changed per Phase

| Phase | Files |
|-------|-------|
| 1 | `globals.css`, `Battle.tsx`, `WorldMap.tsx` |
| 2 | `ZoneTitle.tsx` |
| 3 | `WorldMap.tsx` |
| 4 | `engine.ts` |
| 5 | `engine.ts` |
| 6 | `Battle.tsx` |
| 7 | `Game.tsx` |
| 8 | `TransitionOverlay.tsx`, `Game.tsx` |
| 9 | `sprite-registry.ts`, `Battle.tsx` |
| 10 | `Battle.tsx`, `CatchModal.tsx`, `Game.tsx` |
| 11 | `tiles.ts`, `data.ts` |
| 12 | `tiles.ts`, `engine.ts`, `data.ts` |
| 13 | `engine.ts` |
| 14 | `data.ts`, `world.ts`, `engine.ts` |
| 15 | `data.ts`, `engine.ts` |
| 16 | `Battle.tsx`, `engine.ts`, `generate_sprites_v3.mjs` |
| 17 | `tiles.ts`, `world.ts` |
| 18 | (verification only) |
