# Requirements — Game Design & Aesthetic Overhaul

## Introduction

Ten targeted improvements that elevate the Parampokemon portfolio RPG to world-class quality. The user prefers: core gameplay changes first (items 1–6), polish second (7–10); click/key to advance multi-beat dialogue; fully scripted personality-driven gym leader AI.

---

## Requirement 1 — Gym Leader Battle AI (Personality-Driven)

**User Story:** As a player, I want each gym leader to fight with a distinct, personality-driven strategy so that battles feel like unique confrontations rather than cycling through moves in order.

### Acceptance Criteria

1. WHEN it is the gym leader's turn, THE Battle system SHALL select the leader's next move using a personality strategy function specific to that leader — not simply `turn % moves.length`.
2. THE Blank Page leader SHALL use a stall/debuff strategy: prioritise status-category moves and lowest-power attacks when player HP is high; only escalate to high-power moves when player HP is below 40%.
3. THE Zero Runway leader SHALL use a fast-pressure strategy: always select the highest-power available move that still has PP remaining.
4. THE Term Sheet leader SHALL use a probe strategy: on turn 0 try Normal-type; on turn 1 try the player's current weakest type match; from turn 2 onward always use the move whose type is in `weakTo` of the current player stage if one exists, else fallback to highest power.
5. EACH of the remaining 6 leaders (Long Tail, Pre-Hype, No Culture, Black Box, No Brief, Status Quo) SHALL have a documented strategy with at least 2 distinct behavioural rules encoded in the strategy function.
6. THE strategy functions SHALL receive `(moves, turn, oppHp, oppMaxHp, myHp, myMaxHp, playerStageId)` as parameters and return the index of the chosen move.
7. IF a chosen move has 0 PP remaining, THE system SHALL fall back to the next move in the strategy's preference order that still has PP.

---

## Requirement 2 — CliffNotes Auto-Surface After Victory

**User Story:** As a player, I want the CliffNotes career chapter to slide in automatically as part of the victory flow so that winning a gym battle feels meaningfully connected to Param's career story.

### Acceptance Criteria

1. WHEN the player clicks "CONTINUE" on the VictoryMoment screen, THE system SHALL show CliffNotes for that zone automatically — the player SHALL NOT need to open it manually from the HUD.
2. THE CliffNotes panel SHALL appear with its existing slide-up animation directly after the badge-earned flash resolves (approximately 1.4 s after `handleVictoryContinue` fires).
3. THE auto-surfaced CliffNotes panel SHALL be dismissable via the existing ✕ EXIT button or Escape key.
4. AFTER the player dismisses CliffNotes, THE engine SHALL resume (unpause) and zone BGM SHALL resume as normal.
5. IF the zone is the last gym (champion), THE system SHALL show ChampionCard as it does today — CliffNotes auto-surface SHALL NOT fire for the champion zone.

---

## Requirement 3 — Hidden Items & Discovery (Tall Grass)

**User Story:** As a player, I want to discover hidden berry/item tiles when walking through tall grass so that exploration feels rewarding with a surprise loop.

### Acceptance Criteria

1. EACH zone that has a `skill` defined SHALL have one hidden item tile placed in a tall-grass or decorative region of that zone's world tile area.
2. WHEN the player steps onto a hidden item tile, THE engine SHALL display a `!` exclamation marker above the player for 600 ms then open a dialog awarding the zone's skill berry.
3. WHEN an item has already been collected, THE `!` marker and dialog SHALL NOT fire again.
4. THE hidden item tile SHALL NOT be visually distinct from surrounding tiles before discovery — it is invisible until stepped on.
5. THE awarded item SHALL be added to the player's `skills` set and trigger the existing `SkillLearnOverlay` flow (same as NPC-triggered skill acquisition).
6. Hidden item positions SHALL be stored in `data.ts` alongside each zone definition as an optional `hiddenItem?: { x: number; y: number }` field.

---

## Requirement 4 — Multi-Beat Dialogue with Pauses

**User Story:** As a player, I want NPCs to deliver dialogue in multiple pages with a ▶ prompt between beats so that dramatic moments feel cinematic rather than a wall of text.

### Acceptance Criteria

1. THE `DialogBox` component SHALL accept a `beats: string[]` prop — an array of text strings, one per page.
2. WHEN a beat finishes typing and the player presses Space, Enter, Z, or clicks the dialog box, THE component SHALL advance to the next beat (re-running the typewriter from scratch for that beat's text).
3. WHEN the final beat is done typing AND the player presses advance, THE `onClose` callback SHALL fire.
4. THE existing single-string `quote` field on `GameNpc` SHALL remain supported — `DialogBox` SHALL treat it as a single-beat dialogue for backward compatibility.
5. NPC definitions in `data.ts` that have long monologue quotes (more than ~180 characters) SHOULD be refactored into 2–3 `beats` entries with natural narrative pauses.
6. THE ▶ arrow prompt SHALL blink at the bottom-right of the dialog box when a beat is complete and awaiting input — identical to the current "done" arrow, but NOT triggering close until it is the final beat.
7. THE `GameNpc` type SHALL gain an optional `beats?: string[]` field; when present it overrides `quote` in `DialogBox`.

---

## Requirement 5 — Follower Creature Reactions

**User Story:** As a player, I want Mermander/Mermalion/Merlord to visually react to key game events so that the follower feels alive and emotionally present.

### Acceptance Criteria

1. WHEN the player enters a battle (BattleIntro begins), THE follower sprite on the overworld canvas SHALL play a "jump" animation: translate Y by −10 px over 120 ms, then return to baseline over 120 ms.
2. WHEN a badge is earned (after `handleVictoryContinue` fires), THE follower SHALL play a "spin" animation: rotate 360° over 400 ms using a CSS `transform: rotate()` applied to the follower canvas element.
3. THE follower's idle bob animation SHALL increase amplitude: from the current `Math.sin * 1` to `Math.sin * 2.5` px, giving a more expressive resting state.
4. ALL follower reaction animations SHALL only fire when `state.followerUnlocked` is true.
5. THE follower reaction state SHALL be managed by a new `followerAnim` state variable in `engine.ts` with values `"idle" | "jump" | "spin"` and a timestamp; the render loop SHALL apply the animation offset based on elapsed time since the timestamp.

---

## Requirement 6 — Route Trainer Battles

**User Story:** As a player, I want route NPCs to optionally challenge me to a battle so that travel between zones carries stakes and variety.

### Acceptance Criteria

1. EACH `RouteNpc` definition SHALL gain an optional `trainer?: { hp: number; moves: Move[]; weakTo: string[]; resists: string[]; victoryQuote: string; defeatQuote: string }` field.
2. AT LEAST 4 of the 9 existing route NPCs SHALL be designated as trainers with battle data.
3. WHEN the player interacts with a trainer-route NPC who has NOT been defeated, THE engine SHALL trigger a battle using the trainer's data (reusing the existing `Battle` component) instead of a plain dialog.
4. WHEN the player's HP reaches 0 in a trainer battle, THE player SHALL lose `10` HP from their base stage HP (capped at 1 — never kills) AND be shown the trainer's `defeatQuote`.
5. WHEN the player wins a trainer battle, THE trainer SHALL be marked defeated (stored in a `defeatedTrainers: Set<string>` in `GameState`) and show the trainer's `victoryQuote`.
6. AFTER a trainer is defeated, subsequent interactions with that NPC SHALL trigger normal dialog (not another battle).
7. Trainer battles SHALL use the same `Battle` component and turn logic as gym battles — no separate system required.

---

## Requirement 7 — Leader Sprite Scale in Battle

**User Story:** As a player, I want gym leader sprites to render at 240×240 px in battle so that they feel imposing and the confrontation has visual weight.

### Acceptance Criteria

1. THE leader sprite canvas in `Battle.tsx` (`oppRef`) SHALL be sized `240×240` CSS pixels (up from the current `148×148`).
2. THE canvas backing buffer SHALL also be `240×240` (was `160×160`).
3. THE leader sprite image SHALL be drawn to fill the canvas with a 4 px inset on all sides (i.e. drawn at 232×232 within the 240×240 canvas).
4. WHEN the leader takes damage (shake animation), THE sprite SHALL additionally apply a subtle parallax shift: translate X by 6 px on the X-axis, overlapping slightly with the arena floor — creating a sense of physical impact rather than just horizontal shaking.
5. THE HUD card layout SHALL reflow to accommodate the larger sprite without overflowing the arena panel height (210 px minimum height SHALL increase to 260 px).

---

## Requirement 8 — Narrative Reframe (Direct Address)

**User Story:** As a player (recruiter / founder / partner), I want gym leader dialogue and key NPC quotes to speak directly to ME — not about Param — so that the portfolio feels like it's reaching out rather than describing someone else.

### Acceptance Criteria

1. EACH gym leader's `intro` field SHALL be rewritten to address the player directly in second person ("You", "your", "You've walked").
2. EACH gym leader's `victory` field SHALL include a direct-address line acknowledging the player's achievement, not just Param's.
3. THE `Prof. Iterate` tutorial quote SHALL address the player directly: "You're holding Param's 15-year career in your hands. Walk through it."
4. THE `Mom` NPC quote SHALL be reframed as speaking to the portfolio reader as well as the character.
5. AT LEAST 5 other zone NPCs (across any zones) SHALL have their quotes rewritten to speak directly to the player/reader rather than purely about Param in third person.

---

## Requirement 9 — HUD Consistency (Pixel-Text Labels)

**User Story:** As a player, I want consistent pixel-text labels on HUD buttons instead of mixed emoji and text so that the UI has a single coherent design language.

### Acceptance Criteria

1. THE three HUD buttons currently labelled with emojis ("📋 NOTES", "🎒 BAG", "☰ MENU") SHALL be replaced with pixel-text-only labels: "NOTES", "BAG", "MENU".
2. THE mute toggle button ("🔊" / "🔇") SHALL be replaced with pixel-text labels: "SFX ON" / "SFX OFF".
3. ALL four replaced buttons SHALL maintain the same `onClick` behaviour, layout position, and hover effects as the originals.
4. THE overall button visual style (dark background, accent-on-hover border, `var(--font-pixel)` font) SHALL remain unchanged.
5. NO emoji characters SHALL appear in the primary HUD layer (top bar and bottom-right cluster).

---

## Requirement 10 — Zone Accent HUD Bleed

**User Story:** As a player, I want the zone accent colour to bleed into the HUD border for 10 seconds after a ZoneTitle cinematic so that the zone's identity lingers in the UI frame.

### Acceptance Criteria

1. WHEN `ZoneTitle.onDone` fires, THE game container's CSS border SHALL animate from its default `rgba(124,224,255,0.06)` to the zone's `theme.accent + "55"` over 0.4 s.
2. THE border SHALL hold at the zone accent value for 10 s, then fade back to the default over 2 s.
3. THE accent bleed SHALL apply to the game container `div` (the boxed desktop frame, `min(100vw, 960px)` × `min(100vh, 640px)`).
4. THE animation SHALL NOT interfere with or reset any existing game logic — it is purely a CSS-driven visual effect.
5. IF a second ZoneTitle fires before the first bleed finishes, THE timer SHALL reset to the new zone's accent.
