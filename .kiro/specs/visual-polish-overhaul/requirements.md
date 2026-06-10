# Requirements Document

## Introduction

Param Quest is a Next.js 14 / TypeScript / Canvas 2D browser game used as an interactive career portfolio. The codebase currently mixes web-UI styling conventions (rounded corners, generic green/yellow/red HP colours, 2-second transition timers) with a pixel-art game aesthetic, resulting in a fragmented visual experience.

This feature, **Visual Polish Overhaul**, consolidates all visual systems into a single coherent pixel-art design language. The goal is for every screen — world map, battle arena, dialog boxes, HUD, toasts, zone transitions, and the overworld canvas — to feel as if it was designed as one unified "2025 premium indie browser game" rather than a collection of independently-styled React components.

Key concerns addressed:
- **Pixel-art visual language**: zero border-radius on all panels, buttons, cards, and containers; only 2–3 px radius on small inline tags/counters.
- **Zone accent colour dominance**: each zone's `theme.accent` drives borders, glows, HP bars, toasts, and HUD bleed across every component on screen.
- **CSS variable consolidation**: all hardcoded dark background hex values mapped to `globals.css` variables, consumed consistently by every component.
- **Battle drama**: finishing-blow screen shake + white flash; super-effective full-arena flash; correctly sized battle log typography; move button hover using sharper accent fills.
- **Canvas depth**: persistent edge vignette rendered on the overworld canvas.
- **Real-time day/night ambient tint**: canvas clear colour + HTML overlay driven by the local clock.
- **NPC interactivity**: NPCs face the player when within one tile; revert to default after 2 seconds.
- **GBA-style dialog border**: dual-border (outer accent, inner inset) on all `DialogBox` instances.
- **Square particles**: ZoneTitle floating particles are 2×2 px squares, not circles.
- **WorldMap pixel style**: zero border-radius on cards; 8×8 px square timeline nodes; 1 px solid connector lines.
- **Battle transition timing**: speed-lines at 600 ms; white flash opacity 0.9, held 80 ms; `Battle` component mounts only after transition midpoint fires.

---

## Glossary

- **Accent colour** (`accent`): The `zone.theme.accent` hex string (e.g., `"#9fe8ff"`) associated with the currently active zone; drives all per-zone colouring across both canvas and HTML layers.
- **Arena**: The upper half of the `Battle` component that contains the battle background canvas, player sprite, and opponent sprite.
- **Battle log**: The scrollable text panel below the arena in `Battle.tsx` that records move names, system lines, and flavor text.
- **CSS variable**: A custom property declared in `globals.css` under `:root { }` and referenced via `var(--name)` throughout component styles.
- **Dialog box**: The `DialogBox` component rendered at the bottom of the screen during NPC, sign, and badge interactions.
- **Engine**: `game/engine.ts` — the Canvas 2D game loop that handles input, movement, and rendering of the overworld.
- **HUD**: The heads-up display, comprising the zone-name card (top-left), badge counter (top-right), and action buttons (bottom-right) rendered in `Game.tsx`.
- **HUD accent bleed**: A CSS `border-color` and `background` tint applied to the game container border and HUD elements that transitions when the player changes zone.
- **Midpoint callback** (`onMidpoint`): The callback fired by `TransitionOverlay` at `DURATION / 2` ms into a transition; used to synchronise component mounting.
- **NPC**: A non-player character rendered in the overworld canvas by `engine.ts` via `drawCharacter`.
- **Pixel grid**: The 16×16 px tile grid on which all overworld sprites are aligned.
- **PP counter**: The small `ppLeft/move.pp` label on each `MoveButton`.
- **Screen shake**: A short CSS `animation` that translates the arena or HP bar to simulate physical impact.
- **Speed lines**: The horizontal stripe elements rendered in `TransitionOverlay` during `battle`-kind transitions.
- **Toast**: The transient notification overlay shown in `Game.tsx` when the player enters a zone, earns a badge, or triggers a major event.
- **Type tag**: The small pill/badge showing a move's type label (e.g., "AI", "Ops") inside `MoveButton` and the battle log.
- **Vignette**: A radial dark gradient rendered on the overworld `<canvas>` after all world elements, framing the viewport edges.
- **White flash**: A full-screen `rgba(255,255,255,N)` overlay displayed when a gym leader's HP reaches zero.
- **ZoneTitle**: The full-screen cinematic overlay shown on first zone entry (`ZoneTitle.tsx`).
- **Zone accent dominance**: The design principle that `accent` drives every coloured element on the current screen — borders, glows, HP bars, toasts, and HUD — at sufficient opacity to be visually legible.

---

## Requirements

### Requirement 1 — Finishing-blow Drama

**User Story:** As a player, I want the moment a gym leader's HP hits zero to feel viscerally climactic, so that defeating a boss feels like a meaningful achievement, not just a number reaching zero.

#### Acceptance Criteria

1. WHEN the gym leader's HP reaches 0, THE Battle System SHALL trigger a screen shake animation on the arena div with a duration of no more than 500 ms before the victory sequence begins.
2. WHEN the gym leader's HP reaches 0, THE Battle System SHALL render a white (`rgba(255,255,255,0.9)`) full-screen overlay for exactly 80 ms before fading out.
3. AFTER the white flash fades, THE Battle System SHALL immediately proceed to the victory sequence without any additional freeze-frame delay.
4. THE Battle System SHALL NOT display the finishing-blow white flash or screen shake for any hit that does not reduce the gym leader's HP to exactly 0.

#### Correctness Properties

- **P1.1 Flash opacity invariant**: For any finishing-blow event, the white flash overlay opacity at peak SHALL equal `0.9` ± `0.05`.
- **P1.2 Total drama duration**: The combined duration of screen shake + flash SHALL be ≤ 500 ms.
- **P1.3 No mid-battle flash**: A white flash SHALL NOT fire when `oppHp > 0` after a player move resolves.

---

### Requirement 2 — Pixel-art Visual Language (Zero Border-radius)

**User Story:** As a player, I want all UI panels, buttons, cards, and dialog boxes to have sharp, square corners, so that the entire interface feels like a pixel-art game rather than a web app.

#### Acceptance Criteria

1. THE Visual System SHALL render all panel elements — including `DialogBox`, `Battle` arena card, HP bar containers, `WorldMap` card, `WorldMap` header, `WorldMap` footer, `StartMenu`, `Bag`, `CliffNotes`, and `VictoryMoment` — with `borderRadius: 0`.
2. THE Visual System SHALL render all primary button elements — including `MoveButton`, HUD buttons, the flee button in `Battle`, map/warp buttons, and `WorldMap` zone card buttons — with `borderRadius: 0`.
3. WHERE an element is a small inline type tag (e.g., the move-type pill inside `MoveButton` or the battle log type badge), THE Visual System SHALL apply a `borderRadius` of no greater than 3 px.
4. WHERE an element is a small PP counter label, THE Visual System SHALL apply a `borderRadius` of no greater than 3 px.
5. THE Visual System SHALL apply `borderRadius: 0` to all `<canvas>`-adjacent overlay containers that currently carry a non-zero `borderRadius` value.
6. IF a new UI element is added to any game screen, THEN THE Visual System SHALL default to `borderRadius: 0` unless the element qualifies as a small inline tag or PP counter per criteria 3 and 4.

#### Correctness Properties

- **P2.1 Panel radius invariant**: For every panel element enumerated in criterion 1, `borderRadius` SHALL equal `0` (no exceptions for sub-pixel rounding).
- **P2.2 Button radius invariant**: For every primary button enumerated in criterion 2, `borderRadius` SHALL equal `0`.
- **P2.3 Tag radius ceiling**: For every inline type tag and PP counter, `borderRadius` SHALL be ≥ `0` and ≤ `3`.

---

### Requirement 3 — Real-time Day/Night Ambient Tint

**User Story:** As a player, I want the game's lighting to shift with the real local clock, so that the world feels alive and grounded in my actual time of day.

#### Acceptance Criteria

1. THE Ambient System SHALL read `new Date().getHours()` (local time, 0–23) to determine the current time phase.
2. WHEN the local hour is between 6 and 9 (inclusive), THE Ambient System SHALL apply a warm amber tint (`rgba(255,180,80,N)`) to both the canvas clear colour and the HTML ambient overlay.
3. WHEN the local hour is between 10 and 15 (inclusive), THE Ambient System SHALL apply a bright neutral tint (no colour cast; overlay opacity ≤ 0.05) representing midday.
4. WHEN the local hour is between 16 and 20 (inclusive), THE Ambient System SHALL apply a blue-violet dusk tint (`rgba(80,100,220,N)`) to both the canvas clear colour and the HTML ambient overlay.
5. WHEN the local hour is between 21 and 23 or between 0 and 5 (inclusive), THE Ambient System SHALL apply a deep navy night tint (`rgba(10,15,60,N)`) to both the canvas clear colour and the HTML ambient overlay.
6. THE Ambient System SHALL interpolate smoothly between adjacent phases over a transition window of no more than 30 minutes of real time (i.e., tint values SHALL NOT snap discontinuously at phase boundaries).
7. THE Ambient System SHALL derive the tint exclusively from `new Date().getHours()` and `new Date().getMinutes()`; THE Ambient System SHALL NOT depend on game state, zone, or any other variable.
8. WHERE the `ZoneAmbience` component already provides a zone-specific overlay, THE Ambient System SHALL composite the day/night tint on top of — not instead of — the zone overlay.

#### Correctness Properties

- **P3.1 Clock-only determinism**: For any fixed (hour, minute) pair, the resulting tint colour and opacity SHALL be identical regardless of current zone, badge count, or any other game state.
- **P3.2 Phase coverage**: Every integer hour 0–23 SHALL map to exactly one of the four defined phases (amber, neutral, dusk, night); no hour SHALL be unhandled.
- **P3.3 Transition smoothness**: The tint opacity SHALL be a continuous function of (hour + minute/60); no discontinuous jump SHALL exceed 0.02 opacity units.

---

### Requirement 4 — Battle UI Visual Hierarchy

**User Story:** As a player, I want the battle screen typography and HP bar colouring to use the zone's accent colour and a consistent three-tier font system, so that I can read combat information at a glance without visual noise.

#### Acceptance Criteria

1. THE Battle UI SHALL render HP bars using the zone's `accent` colour as the bar fill and label colour, replacing the current generic green/yellow/red fill logic.
2. THE Battle UI SHALL render move names in the battle log at exactly `11px` font size.
3. THE Battle UI SHALL render system lines (damage dealt, PP exhausted, miss messages, generic counters) in the battle log at exactly `9px` font size.
4. THE Battle UI SHALL render flavor text lines in the battle log at exactly `13px` font size, italic style.
5. THE Battle UI SHALL render `MoveButton` elements with `borderRadius: 0`.
6. WHEN a `MoveButton` is hovered and the move is available, THE Battle UI SHALL apply a sharper accent fill: `background: linear-gradient(135deg, ${accent}33 0%, ${accent}14 100%)` (replacing the existing `${color}22`/`${color}0a` values).
7. THE Battle UI SHALL NOT alter the `borderRadius` of the small move-type tag inside `MoveButton` (≤ 3 px remains acceptable).

#### Correctness Properties

- **P4.1 Font size invariant (move names)**: Every DOM element classified as a move-name log entry SHALL have `fontSize` equal to `11` (px).
- **P4.2 Font size invariant (system lines)**: Every DOM element classified as a system-line log entry SHALL have `fontSize` equal to `9` (px).
- **P4.3 Font size invariant (flavor text)**: Every DOM element classified as a flavor-text log entry SHALL have `fontSize` equal to `13` (px) and `fontStyle` equal to `"italic"`.
- **P4.4 HP bar colour source**: The HP bar fill SHALL reference `zone.theme.accent` and SHALL NOT contain any hard-coded green (`#4ade80`), yellow (`#facc15`), or red (`#ef4444`) value in the bar-fill path.

---

### Requirement 5 — Canvas Edge Vignette

**User Story:** As a player, I want a subtle dark vignette framing the edges of the overworld canvas, so that the game world feels contained and cinematic rather than floating on a flat background.

#### Acceptance Criteria

1. THE Engine SHALL render a persistent radial gradient vignette as the final draw call in each frame of the overworld render loop.
2. THE vignette SHALL be a `CanvasRenderingContext2D` radial gradient from `rgba(0,0,0,0)` at the centre to `rgba(0,0,0,0.45)` at the canvas edge.
3. THE vignette SHALL cover the full canvas width and height on every frame.
4. THE vignette SHALL NOT occlude interactive sprites or UI elements (it SHALL be drawn before `<canvas>`-adjacent HTML overlays, and after all world tiles and sprites on the canvas layer).
5. WHILE the `Battle` component is active, THE Engine SHALL NOT render the overworld vignette (the engine render loop is paused; the vignette is an overworld-only effect).

#### Correctness Properties

- **P5.1 Every-frame presence**: In every rendered frame where the engine loop is running and `state.paused === false`, a vignette draw call SHALL be present as the last canvas operation.
- **P5.2 Centre transparency**: The radial gradient stop at radius 0 SHALL have alpha = 0.
- **P5.3 Edge opacity ceiling**: The radial gradient stop at the canvas edge SHALL have alpha ≤ 0.55.

---

### Requirement 6 — Zone Accent Colour Dominance

**User Story:** As a player, I want every element on screen to visually reflect the current zone's accent colour at a noticeable intensity, so that each zone feels distinct and I always know where I am.

#### Acceptance Criteria

1. THE Visual System SHALL render the battle arena container's border glow using `${accent}99` opacity (not `${accent}45`) — i.e., the two-digit hex suffix for the border glow colour SHALL be `99`.
2. THE Visual System SHALL transition the HUD accent bleed (`border-color` on the game container) in `0.4s` (not the current `2s`) when the player moves to a new zone.
3. THE Visual System SHALL render the toast border colour as `${accent}80` (two-digit hex suffix `80`).
4. THE Ambient System SHALL apply the day/night tint composited with — not replacing — the zone accent overlay.
5. WHEN the player enters a new zone, THE HUD SHALL update the zone name card border colour to `${accent}35` within one animation frame.

#### Correctness Properties

- **P6.1 Arena border opacity**: For any zone, the arena border glow colour hex SHALL end in `99` (i.e., alpha channel = 153/255 ≈ 0.60). The suffix SHALL NOT be `45`.
- **P6.2 Toast border opacity**: For any zone, the toast border colour hex suffix SHALL be `80` (alpha = 128/255 ≈ 0.50). The suffix SHALL NOT be `50`.
- **P6.3 HUD bleed transition speed**: The CSS `transition` value for `border-color` on the game container SHALL be `"0.4s"`. It SHALL NOT be `"2s"`.

---

### Requirement 7 — NPC Facing Direction

**User Story:** As a player, I want NPCs to look at me when I walk up to them, so that interactions feel attentive and alive rather than NPCs staring into the void.

#### Acceptance Criteria

1. WHEN the player's tile position is exactly 1 tile away (Manhattan distance = 1) from an NPC's tile position, THE Engine SHALL render that NPC facing toward the player (i.e., the direction from the NPC to the player).
2. WHEN the player's tile position moves to more than 1 tile away from an NPC, THE Engine SHALL begin a 2-second countdown before reverting the NPC's rendered direction to `"down"`.
3. WHEN the 2-second revert timer elapses without the player re-entering the 1-tile proximity, THE Engine SHALL render the NPC facing `"down"`.
4. THE Engine SHALL apply facing-direction logic to all NPC interactives rendered via `drawCharacter` — both `ROUTE_NPCS` and `zone.npcs` entries — independently for each NPC.
5. THE Engine SHALL NOT alter an NPC's stored data object; the facing direction SHALL be computed and tracked in engine-local state only.

#### Correctness Properties

- **P7.1 Proximity facing**: For any NPC at `(nx, ny)` and player at `(px, py)` where `|px-nx| + |py-ny| === 1`, the NPC's rendered direction SHALL equal the direction vector from `(nx, ny)` toward `(px, py)`.
- **P7.2 Revert timing**: After the player exits 1-tile proximity, the NPC SHALL render as `"down"` after ≥ 2000 ms and ≤ 2200 ms.
- **P7.3 No data mutation**: `zone.npcs[i].kind`, `ROUTE_NPCS[i].kind`, and all other fields on NPC data objects SHALL be identical before and after a proximity-facing event.

---

### Requirement 8 — Dialog Box GBA-style Border

**User Story:** As a player, I want dialog boxes to have a distinctive dual-border that evokes a Game Boy Advance aesthetic, so that reading NPC dialogue feels like a native part of the game rather than a web modal.

#### Acceptance Criteria

1. THE DialogBox Component SHALL render an outer border of `2px solid ${accentColor}80` on the dialog container.
2. THE DialogBox Component SHALL render an inner inset border of `1px solid ${accentColor}20` via a CSS `outline` or a nested container border.
3. THE DialogBox Component SHALL apply `borderRadius: 0` to the dialog container.
4. THE DialogBox Component SHALL retain the existing `boxShadow: inset 0 -2px 0 rgba(0,0,0,0.4)` inner shadow.
5. THE DialogBox Component SHALL NOT add any additional `borderRadius` to the header sub-container or the text body sub-container.

#### Correctness Properties

- **P8.1 Outer border opacity**: The outer border colour SHALL end in hex suffix `80` (alpha = 128/255). For any `accentColor`, the computed border value SHALL match `${accentColor}80`.
- **P8.2 Inner border opacity**: The inner inset border colour SHALL end in hex suffix `20` (alpha = 32/255).
- **P8.3 Zero radius**: The dialog container `borderRadius` SHALL equal `0`.

---

### Requirement 9 — Square Particle System

**User Story:** As a player, I want the floating particles in the ZoneTitle cinematic to be pixel-art squares rather than circles, so that they are consistent with the game's pixel grid.

#### Acceptance Criteria

1. THE ZoneTitle Component SHALL render all floating accent particles with `borderRadius: 0`.
2. THE ZoneTitle Component SHALL render each particle as a 2×2 px square (`width: 2, height: 2`).
3. THE ZoneTitle Component SHALL NOT apply any `borderRadius` value greater than 0 to particle elements.
4. THE ZoneTitle Component SHALL NOT apply `border-radius` via `boxShadow` spread or any other indirect rounding technique that causes particles to appear circular.

#### Correctness Properties

- **P9.1 Particle shape**: For every particle element rendered by `ZoneTitle`, `borderRadius` SHALL equal `0`.
- **P9.2 Particle dimensions**: Every particle element SHALL have `width === 2` and `height === 2` (px).

---

### Requirement 10 — WorldMap Pixel Style

**User Story:** As a player, I want the World Map to look like a pixel-art timeline rather than a modern web dashboard, so that it matches the rest of the game's visual language.

#### Acceptance Criteria

1. THE WorldMap Component SHALL render all zone card `<button>` elements with `borderRadius: 0`.
2. THE WorldMap Component SHALL render all zone card thumbnail containers with `borderRadius: 0`.
3. THE WorldMap Component SHALL render timeline nodes as 8×8 px squares (`width: 8, height: 8`) with `borderRadius: 0` in place of the current circular (50% radius) nodes.
4. THE WorldMap Component SHALL render timeline connector lines as `1px solid` (not `2px gradient`); the current `linear-gradient` connector SHALL be replaced with a flat `background: ${accent}` or `background: #0e1c2e` solid colour at 1 px width.
5. THE WorldMap Component SHALL render the map container card with `borderRadius: 0` (replacing the current `borderRadius: 3`).
6. THE WorldMap Component SHALL render the map header and footer sub-containers with `borderRadius: 0`.

#### Correctness Properties

- **P10.1 Node shape**: For every timeline node element, `width` SHALL equal `8`, `height` SHALL equal `8`, and `borderRadius` SHALL equal `0`.
- **P10.2 Card button radius**: For every zone card `<button>`, `borderRadius` SHALL equal `0`.
- **P10.3 Connector line width**: For every connector line element, `width` SHALL equal `2` (the 2px container) with an inner bar of `width === 1` or a direct `width: 1px` rule; gradient backgrounds SHALL NOT be applied.

---

### Requirement 11 — CSS Variable Consolidation

**User Story:** As a developer, I want all hardcoded dark background colours to be centralised as CSS variables in `globals.css`, so that I can theme or adjust the palette from a single source of truth.

#### Acceptance Criteria

1. THE globals.css SHALL define CSS variables for each of the following hardcoded colour values currently scattered across components:
   - `--color-bg-deep: #07101e` (used as `var(--color-dialog-bg)` and inline)
   - `--color-bg-dark: #0d1527`
   - `--color-bg-darkest: #020508`
   - `--color-bg-panel: #060c18`
   - `--color-bg-void: #04080f`
2. WHEN a component currently uses any of the hardcoded values `#07101e`, `#0d1527`, `#020508`, `#060c18`, or `#04080f` as a string literal in an inline style or CSS class, THE component SHALL reference the corresponding CSS variable instead.
3. THE Visual System SHALL ensure that `--color-bg-deep` replaces all inline `#07101e` references in `Battle.tsx`, `DialogBox.tsx`, `WorldMap.tsx`, `TitleScreen.tsx`, `Game.tsx`, and `globals.css`.
4. THE Visual System SHALL ensure that `--color-bg-darkest` replaces all inline `#020508` and `#020508`-equivalent values used as the `Battle` component background gradient endpoint.
5. IF a component generates a colour value dynamically (e.g., via template literal concatenation), THE component SHALL use `var(--color-bg-panel)` in the CSS or a JS constant referencing a shared palette module — not a hardcoded hex string.

#### Correctness Properties

- **P11.1 Variable presence**: `globals.css` SHALL contain declarations for all five variables listed in criterion 1 under `:root`.
- **P11.2 No stray literals**: A static search of `.tsx` and `.css` source files for the string literals `#07101e`, `#0d1527`, `#020508`, `#060c18`, and `#04080f` SHALL return zero matches after this feature is implemented.

---

### Requirement 12 — Battle Transition Timing

**User Story:** As a player, I want the battle transition to feel punchy and intentional — with speed lines that linger long enough to register, and a bright white flash that holds for a beat before the battle loads — so that entering a gym battle is a dramatic moment.

#### Acceptance Criteria

1. THE TransitionOverlay Component SHALL extend the `battle` transition total duration to `600ms` (replacing the current implicit value derived from `DURATION.battle = 800ms`; the speed-line animation SHALL use `600ms` as the keyframe duration).
2. THE TransitionOverlay Component SHALL render the colour-wash overlay at `opacity: 0.9` during the `"in"` phase of a `battle`-kind transition (replacing the current `0.7`).
3. THE TransitionOverlay Component SHALL hold the colour-wash overlay at `opacity: 0.9` for exactly `80ms` before beginning the fade-out.
4. THE Game Component SHALL mount the `Battle` component only after the `onMidpoint` callback fires from `TransitionOverlay` — not before, and not independently of the transition.
5. THE Game Component SHALL NOT render the `Battle` component in the React tree before `onMidpoint` has been called for the current battle transition.

#### Correctness Properties

- **P12.1 Speed-line duration**: The CSS animation duration for each speed-line element SHALL be derived from the `600ms` base and SHALL NOT be less than `560ms` for the slowest line.
- **P12.2 Flash opacity**: The colour-wash overlay `opacity` at its peak SHALL equal `0.9`.
- **P12.3 Mount gate**: `setBattle(zone)` (or equivalent state update that renders `<Battle>`) SHALL be called inside or after the `onMidpoint` callback and SHALL NOT be called synchronously with `setBattleIntro`.

---

### Requirement 13 — Super-effective Full Arena Flash

**User Story:** As a player, I want the entire battle arena to pulse when I land a super-effective hit, so that the impact feels satisfying and I can immediately identify the hit type without reading the log.

#### Acceptance Criteria

1. WHEN a player move deals a super-effective hit (`isSuper === true`), THE Battle System SHALL apply a full-arena background pulse using `${accent}22` as the `backgroundColor` of the arena div for a duration of `200ms`.
2. THE Battle System SHALL NOT trigger the full-arena pulse for non-super-effective hits (normal hits, critical hits, not-very-effective hits, or misses).
3. THE Battle System SHALL implement the arena pulse as a CSS `animation` or a timed `background` state change — not as a permanent style change.
4. THE Battle System SHALL NOT remove or alter the existing `superEffectText` overlay animation; the full-arena pulse SHALL be additive to the existing "SUPER EFFECTIVE!" text pop.
5. WHEN the arena pulse completes (after 200 ms), THE Battle System SHALL revert the arena div `backgroundColor` to its pre-pulse value.

#### Correctness Properties

- **P13.1 Trigger condition**: The arena pulse SHALL fire if and only if `isSuper === true` for the resolving player move.
- **P13.2 Pulse colour format**: The arena background colour during the pulse SHALL be `${accent}22` where `accent` is `zone.theme.accent` for the current zone; the two-digit hex suffix SHALL be `22` (alpha = 34/255).
- **P13.3 Pulse duration**: The arena pulse SHALL last ≥ `180ms` and ≤ `220ms`.
- **P13.4 Non-interference**: After the pulse, the arena `background` or `backgroundColor` SHALL equal its original value (no residual colour change).
