# Implementation Tasks — Game Design & Aesthetic Overhaul

Delivery order: core gameplay (1–6) first, then polish (7–10).  
All tasks are code-only — no new sprites required.

---

## Wave 1 — Core Gameplay (Items 1–6)

### Task 1 — Gym Leader Battle AI

**File:** `components/game/Battle.tsx`, `game/data.ts`

- [ ] 1.1 Add `pickLeaderMove(gym, ctx)` function to `Battle.tsx` with a `StrategyCtx` type (`turn`, `oppHp`, `oppMaxHp`, `myHp`, `myMaxHp`, `playerStageId`, `ppRemaining: number[]`)
- [ ] 1.2 Implement `withPPFallback(preferred, ppRemaining, moves)` helper that falls back to the next move with PP if preferred has none
- [ ] 1.3 Implement **BlankPage** strategy: player HP > 60% → lowest-power move; ≤ 60% → highest-power move
- [ ] 1.4 Implement **ZeroRunway** strategy: always pick highest-power move with PP remaining
- [ ] 1.5 Implement **TermSheet** strategy: turn 0 → move[0]; turn 1 → move[1]; turn 2+ → move whose type is in player weakness if any, else highest-power
- [ ] 1.6 Implement **LongTail** strategy: alternate move[0]/move[2] every other turn; every 4th turn use move[3]
- [ ] 1.7 Implement **Pre-Hype** strategy: cycle through all 4 moves in order, skipping any with 0 PP
- [ ] 1.8 Implement **NoSneakerCulture** (sole) strategy: turns 0–1 use lower-power moves; turn 2 → move[2]; turn 3+ → move[3]
- [ ] 1.9 Implement **BlackBox** strategy: pick randomly from moves with PP remaining
- [ ] 1.10 Implement **NoBrief** strategy: pick the move whose `flavor` string is longest (with PP fallback)
- [ ] 1.11 Implement **StatusQuo** (champion) strategy: turns 0–1 rotate evenly; after player HP < 50% always use highest-power move with PP
- [ ] 1.12 Replace `gym.moves[turn % gym.moves.length]` in `useMove` with `gym.moves[pickLeaderMove(gym, ctx)]`, passing current `turn`, HP values, and `stage.id`

---

### Task 2 — CliffNotes Auto-Surface

**File:** `components/game/Game.tsx`

- [ ] 2.1 In `handleVictoryContinue`, after the existing badge/evolution logic and the `!isLastGym` guard, add a `setTimeout(..., 1400)` that calls `setCliffOpen(zone)` and `engineRef.current?.setPaused(true)`
- [ ] 2.2 Ensure the `CliffNotes` `onClose` prop in the JSX calls `engineRef.current?.setPaused(false)` so the engine resumes when the player dismisses the panel
- [ ] 2.3 Verify champion zone (`isLastGym === true`) path does NOT trigger CliffNotes (it should show ChampionCard as before — no change needed there, just ensure the guard is correct)

---

### Task 3 — Hidden Items & Discovery

**Files:** `game/data.ts`, `game/engine.ts`, `components/game/Game.tsx`

- [ ] 3.1 Add `hiddenItem?: { x: number; y: number }` to the `Zone` type in `data.ts`
- [ ] 3.2 Add `hiddenItem` coordinates to each zone that has a `skill` — pick positions inside the zone area, away from buildings/NPCs/badges (use tall-grass or open ground areas)
- [ ] 3.3 Add `| { kind: "hidden"; zone: Zone; x: number; y: number }` to the `Interactive` union in `data.ts`
- [ ] 3.4 In `allInteractives()`, emit a `hidden` interactive for each zone where `zone.hiddenItem && zone.skill` exist
- [ ] 3.5 Add `onHiddenItem: (zone: Zone) => void` to `EngineCallbacks` in `engine.ts`
- [ ] 3.6 In `engine.ts` frameLoop (after player settles on a tile), check if current tile coords match any undiscovered `hidden` interactive; if yes, call `cb.onHiddenItem(zone)` with a cooldown (same pattern as wild creature auto-trigger)
- [ ] 3.7 In `engine.ts`, mark the hidden item as collected (add zone skill id to `state.collectedSkills`) so it doesn't re-fire
- [ ] 3.8 In `Game.tsx`, implement `onHiddenItem` callback: guard against already-collected skill, add to `skills` state, add to engine via `addSkill`, trigger `SkillLearnOverlay` via the existing `pendingSkillLearnRef` mechanism

---

### Task 4 — Multi-Beat Dialogue

**Files:** `components/game/DialogBox.tsx`, `game/data.ts`

- [ ] 4.1 Add `beats?: string[]` to the `GameNpc` type in `data.ts`
- [ ] 4.2 Add `beats?: string[]` to the `GameDialog` npc variant type in `Game.tsx`
- [ ] 4.3 In `Game.tsx` `onInteract` handler for NPCs, pass `beats: i.npc.beats` into the dialog object
- [ ] 4.4 In `DialogBox.tsx`, derive `beats: string[]` from `dialog.beats ?? [fullText]`; add `beatIndex` state (`useState(0)`) and `isLastBeat = beatIndex === beats.length - 1`
- [ ] 4.5 Replace `fullText` references with `beats[beatIndex]` so each beat types out independently
- [ ] 4.6 In the keyboard/click handler: if not done → finish typing current beat; if done and not last beat → increment `beatIndex`, reset `shown`/`done`; if done and last beat → call `onClose()`
- [ ] 4.7 Render the existing ▶ arrow when a beat is done but NOT the last beat (same visual as today's done arrow — no close yet)
- [ ] 4.8 Split **Prof. Iterate**'s `quote` into 3 `beats` entries with natural narrative pauses
- [ ] 4.9 Split **Rival** NPC `quote` into 2 `beats`
- [ ] 4.10 Split **Mom** NPC `quote` into 2 `beats`
- [ ] 4.11 Split at least 2 other long NPC quotes (>180 chars) across zones into 2-beat entries

---

### Task 5 — Follower Creature Reactions

**File:** `game/engine.ts`

- [ ] 5.1 Add `followerAnim: { kind: "idle" | "jump" | "spin"; startedAt: number }` to `GameState` with initial value `{ kind: "idle", startedAt: 0 }`
- [ ] 5.2 Add `triggerFollowerAnim(kind: "jump" | "spin")` method on the engine return object that sets `state.followerAnim` (guarded by `state.followerUnlocked`)
- [ ] 5.3 In the render loop, compute `followerOffsetY` from the jump animation: `elapsed < 120 → -sin(elapsed/120 * π) * 10`; clear after 240 ms
- [ ] 5.4 In the render loop, compute `followerRotation` from the spin animation: `elapsed/400 * 2π`; clear after 400 ms
- [ ] 5.5 Increase idle bob amplitude from `Math.sin(...) * 1.5` to `Math.sin(...) * 2.5`
- [ ] 5.6 Apply the computed `followerOffsetY` and rotation when drawing the follower sprite (use `ctx.save/translate/rotate/restore` pattern)
- [ ] 5.7 In `Game.tsx`, call `engineRef.current?.triggerFollowerAnim("jump")` when `setBattleIntro(z)` is called
- [ ] 5.8 In `Game.tsx`, call `engineRef.current?.triggerFollowerAnim("spin")` in `handleVictoryContinue` after the badge is awarded

---

### Task 6 — Route Trainer Battles

**Files:** `game/data.ts`, `game/engine.ts`, `components/game/Game.tsx`

- [ ] 6.1 Add optional `trainer?: { hp: number; moves: Move[]; weakTo: string[]; resists: string[]; victoryQuote: string; defeatQuote: string }` to the `RouteNpc` type in `data.ts`
- [ ] 6.2 Add `defeatedTrainers: Set<string>` to `GameState` in `engine.ts` (keyed by `npc.name`); persist to localStorage save
- [ ] 6.3 Designate **Wandering Kid** (Route 1) as a trainer: hp=40, 2 moves (Vision + Normal), low power
- [ ] 6.4 Designate **Street Vendor** (Route 2) as a trainer: hp=55, 3 moves (Search + Ops), medium power
- [ ] 6.5 Designate **Angel Investor** (Route 6) as a trainer: hp=70, 3 moves (Capital + Psychic), higher power; victoryQuote speaks to player directly
- [ ] 6.6 Designate **Sneaker Collector** (Route 7) as a trainer: hp=60, 3 moves (Brand + Normal), culture-themed moves; victoryQuote speaks to player directly
- [ ] 6.7 Add `onTrainerBattle: (npc: RouteNpc) => void` to `EngineCallbacks`
- [ ] 6.8 In `engine.ts` NPC interaction: when interacting with a route NPC that has `trainer` data and `npc.name` is NOT in `state.defeatedTrainers`, call `cb.onTrainerBattle(rn)` instead of `cb.onInteract`
- [ ] 6.9 In `Game.tsx`, add `trainerBattle: RouteNpc | null` state and implement `onTrainerBattle` handler that constructs a synthetic zone-like object and sets `trainerBattle`; show `BattleIntro` then `Battle`
- [ ] 6.10 On trainer battle win: add npc.name to `defeatedTrainers` via `engine.state.defeatedTrainers.add(npc.name)`, show victory quote as toast
- [ ] 6.11 On trainer battle lose: do NOT restore full HP; subtract 10 from player HP (capped at 1); show defeatQuote dialog

---

## Wave 2 — Polish (Items 7–10)

### Task 7 — Leader Sprite Scale

**File:** `components/game/Battle.tsx`

- [ ] 7.1 Change `oppRef` canvas props: `width={240} height={240}` (was 160×160)
- [ ] 7.2 Change `oppRef` CSS style: `width: 240, height: 240` (was 148×148)
- [ ] 7.3 Update draw call inside the RAF: `c.drawImage(leaderImg, 4, 4 + bob, 232, 232)` (was 152×152)
- [ ] 7.4 Increase arena panel `minHeight` from `210` to `260`
- [ ] 7.5 Add `opp-shake` keyframe that includes a Y component for parallax (`translateY(-4px)` at 20%, `translateY(2px)` at 40%, etc.) and replace the inline shake `transform` style on the opponent container with `animation: opp-shake`

---

### Task 8 — Narrative Reframe

**File:** `game/data.ts` (string edits only)

- [ ] 8.1 Rewrite **BlankPage** `intro` to second-person direct address (e.g. "You want to build something where nothing was. Prove it.")
- [ ] 8.2 Rewrite **BlankPage** `victory` to address the player (e.g. "You made the first thing. That's the hardest one. Now keep going.")
- [ ] 8.3 Rewrite **ZeroRunway** `intro` + `victory` — direct address, stakes framing
- [ ] 8.4 Rewrite **TermSheet** `intro` + `victory` — speak to the player as if they are defending a thesis
- [ ] 8.5 Rewrite **NoSneakerCulture** `intro` + `victory` — challenge the player to build cultural demand
- [ ] 8.6 Rewrite **BlackBox** `intro` + `victory` — address the player as someone who must earn trust with invisible tech
- [ ] 8.7 Rewrite **NoBrief** `intro` + `victory` — speak to the player's own creative instincts
- [ ] 8.8 Rewrite **StatusQuo** (champion) `intro` + `victory` — final boss framing directed at the player
- [ ] 8.9 Rewrite **Pre-Hype** `intro` + `victory` (for completeness)
- [ ] 8.10 Rewrite **LongTail** `intro` + `victory`
- [ ] 8.11 Rewrite **Prof. Iterate** `quote` (beats, from Task 4.8) to open with direct address: "You're holding 15 years of Param's career in your hands."
- [ ] 8.12 Rewrite **Mom** NPC quote beats to speak partly to the portfolio reader
- [ ] 8.13 Rewrite **Rival** NPC quote beats to challenge the player directly
- [ ] 8.14 Rewrite **"The throughline"** NPC in Origin Town to address the player
- [ ] 8.15 Rewrite at least 2 investor NPC quotes in Investopad Tower to address the player as a decision-maker

---

### Task 9 — HUD Consistency

**File:** `components/game/Game.tsx`

- [ ] 9.1 Remove the `icon` field and `<span>{btn.icon}</span>` from the three bottom-right HUD buttons array; keep only `label` and `action`
- [ ] 9.2 Replace the mute button content — remove emoji, replace with `fontFamily: "var(--font-pixel)"` text `"SFX ON"` / `"SFX OFF"` (font-size 7, letterSpacing 0.05em)
- [ ] 9.3 Verify no other emoji appear in the top HUD bar or bottom-right cluster

---

### Task 10 — Zone Accent HUD Bleed

**File:** `components/game/Game.tsx`

- [ ] 10.1 Add `hudAccentBleed: string | null` state (useState, null = default) and `bleedTimerRef` (useRef for setTimeout handle)
- [ ] 10.2 In the `ZoneTitle` `onDone` handler (where `setZoneTitle(null)` is called), also: call `setHudAccentBleed(zoneTitle!.theme.accent)`, clear any existing bleed timer, set a new timer for 12 000 ms that calls `setHudAccentBleed(null)`
- [ ] 10.3 Update the game container `div` border style to use `hudAccentBleed ? hudAccentBleed + "55" : "rgba(124,224,255,0.06)"` with `transition: "border-color 0.4s ease-out"` when bleeding and `"border-color 2s ease-in"` when fading back

---

## Dependency Notes

- Task 4 (multi-beat) must be complete before Task 8 (narrative reframe) uses beats format
- Task 5 (follower reactions) methods are called by Tasks 3, 6 — implement Task 5 engine changes before Tasks 3 and 6 Game.tsx wiring
- Tasks 7, 9, 10 are fully independent and can be done in any order
- Task 2 (CliffNotes auto-surface) is independent; add it anytime after Wave 1 is started
