# Technical Design — Game Design & Aesthetic Overhaul

## Overview

Ten surgical improvements to `parampokemon`. All changes are code-only (no new sprites required). The implementation is TypeScript/React on Next.js 15 with Canvas 2D. Files stay close to their existing patterns; no new dependencies are introduced.

---

## Architecture Map — What Changes Where

| Item | Files modified | Net new files |
|------|----------------|---------------|
| 1 Gym Leader AI | `game/data.ts`, `components/game/Battle.tsx` | none |
| 2 CliffNotes Auto-Surface | `components/game/Game.tsx` | none |
| 3 Hidden Items | `game/data.ts`, `game/engine.ts`, `components/game/Game.tsx` | none |
| 4 Multi-Beat Dialogue | `components/game/DialogBox.tsx`, `game/data.ts` | none |
| 5 Follower Reactions | `game/engine.ts` | none |
| 6 Route Trainer Battles | `game/data.ts`, `game/engine.ts`, `components/game/Game.tsx` | none |
| 7 Leader Sprite Scale | `components/game/Battle.tsx` | none |
| 8 Narrative Reframe | `game/data.ts` | none |
| 9 HUD Consistency | `components/game/Game.tsx` | none |
| 10 Zone Accent HUD Bleed | `components/game/Game.tsx` | none |

---

## Item 1 — Gym Leader Battle AI

### Approach

Replace `gym.moves[turn % gym.moves.length]` in `Battle.tsx`'s `useMove` callback with a `pickLeaderMove(gym, turn, oppHp, oppMaxHp, myHp, myMaxHp, playerStageId, ppRemaining)` function. This function lives in `data.ts` (or inlined in `Battle.tsx`) and is keyed off `gym.leader`.

### Strategy Definitions

```typescript
type StrategyCtx = {
  turn: number;
  oppHp: number; oppMaxHp: number;   // leader HP
  myHp: number;  myMaxHp: number;    // player HP
  playerStageId: string;
  ppRemaining: number[];             // pp left per move index
};

function pickLeaderMove(gym: Gym, ctx: StrategyCtx): number
```

**Per-leader strategies:**

| Leader | Strategy |
|--------|----------|
| `blankpage` | **Stall**: player HP > 60% → use lowest-power move with PP; player HP ≤ 60% → use highest-power move with PP. |
| `longtail` | **Flood**: alternate between move[0] (bulk/status) and move[2] (high power) every other turn; on turn divisible by 4 use move[3]. |
| `zerorunway` | **Fast-pressure**: always pick highest-power move that still has PP. |
| `prehype` | **Educational**: cycle through all 4 moves in order but skip any that are out of PP (so the player sees all move types). |
| `termsheet` | **Probe**: turn 0 → move[0] Normal; turn 1 → move[1]; turn 2+ → if any move type matches a player weakness, use it; else highest power. |
| `noculture` | **Hype-build**: turns 0–1 use lower-power moves; turn 2 uses move[2]; turn 3+ uses move[3] (highest power). |
| `blackbox` | **Unpredictable**: choose randomly from moves that still have PP (creates genuine uncertainty). |
| `nobrief` | **Artistic**: pick move whose `flavor` text is longest (thematic — the leader values expression over efficiency). |
| `statusquo` | **Champion**: first 2 turns rotate through all moves evenly; after player HP drops below 50% always use highest-power move with PP. |

### PP Guard

```typescript
function withPPFallback(preferred: number, ppRemaining: number[], moves: Move[]): number {
  if (ppRemaining[preferred] > 0) return preferred;
  // find next move with PP by rotating from preferred
  for (let i = 1; i < moves.length; i++) {
    const idx = (preferred + i) % moves.length;
    if (ppRemaining[idx] > 0) return idx;
  }
  return preferred; // all out — default to first (cosmetic)
}
```

### Battle.tsx integration

The existing leader-PP tracking (`ppUsed`) covers the player's moves. The leader doesn't have `ppUsed` tracking today — the simple `turn % moves.length` never exhausted PP. The new system doesn't need to track leader PP (leaders always have enough PP in practice; the guard is a safety net).

Replace in `useMove`:
```typescript
// OLD
const leaderMove = gym.moves[turn % gym.moves.length];

// NEW
const leaderMoveIdx = pickLeaderMove(gym, {
  turn, oppHp, oppMaxHp: gym.hp,
  myHp, myMaxHp: stage.hp,
  playerStageId: stage.id,
  ppRemaining: gym.moves.map(() => 99), // leaders have unlimited PP
});
const leaderMove = gym.moves[leaderMoveIdx];
```

---

## Item 2 — CliffNotes Auto-Surface

### Approach

In `Game.tsx`'s `handleVictoryContinue`, after the existing badge/evolution flow, set a timer to open CliffNotes for non-champion zones.

```typescript
function handleVictoryContinue(zone: Zone) {
  // ... existing badge award, evolution check ...

  if (!isLastGym) {
    // Auto-surface CliffNotes ~1.4s after badge flash
    setTimeout(() => {
      setGotBadge(null);
      setCliffOpen(zone);           // ← NEW
      engineRef.current?.setPaused(true);
    }, 1400);
  }
}
```

`CliffNotes.onClose` already calls `onClose` prop — in `Game.tsx` that prop must unpause the engine:
```tsx
{cliffOpen && (
  <CliffNotes
    zone={cliffOpen}
    onClose={() => {
      setCliffOpen(null);
      engineRef.current?.setPaused(false);  // ensure resume
    }}
  />
)}
```

The existing manual open from HUD ("NOTES" button) still works because `setCliffOpen` is independent of who triggered it.

---

## Item 3 — Hidden Items & Discovery

### Data shape

```typescript
// In Zone type (data.ts)
hiddenItem?: { x: number; y: number };
```

Each zone with a `skill` gets a `hiddenItem` at a position inside the zone's bounds that is not occupied by a building, NPC, badge, or wild creature. Coordinates are relative to zone origin (`ox`, `oy` are added in `allInteractives`).

### New interactive kind

```typescript
| { kind: "hidden"; zone: Zone; x: number; y: number }
```

Added to the `Interactive` union and emitted by `allInteractives()` if `zone.hiddenItem && zone.skill` and the zone's skill has not been collected. When collected the item disappears (same as badge/creature pattern).

### Engine discovery flow

In `frameLoop` after the player settles on a tile, check if the current tile matches any undiscovered `hidden` interactive. If yes:
1. Set `followerAnim = "jump"` (reuse item 5's animation).
2. Fire `cb.onHiddenItem(zone)` callback.

In `Game.tsx`, `onHiddenItem` handler:
```typescript
onHiddenItem: (z: Zone) => {
  if (!z.skill || skills.has(z.skill.id)) return;
  setSkills(prev => { const n = new Set(prev); n.add(z.skill!.id); return n; });
  engineRef.current?.addSkill(z.skill.id);
  pendingSkillLearnRef.current = { zone: z, npcName: "Hidden Discovery" };
  // Show SkillLearnOverlay via existing pending mechanism
  setTimeout(() => setSkillLearnZone(pendingSkillLearnRef.current!), 50);
  pendingSkillLearnRef.current = null;
  engine.setPaused(true);
}
```

The `EngineCallbacks` type gains `onHiddenItem: (zone: Zone) => void`.

---

## Item 4 — Multi-Beat Dialogue

### DialogBox changes

The component gains a `beats` prop. When `beats` is provided, it renders one beat at a time; the ▶ arrow says "advance" (not close) until the final beat.

```typescript
interface Props {
  dialog: NonNullable<GameDialog>;
  onClose: () => void;
}

// Internal state additions
const [beatIndex, setBeatIndex] = useState(0);

const beats: string[] = dialog.type === "npc" && dialog.beats
  ? dialog.beats
  : [fullText]; // single-beat fallback
const currentText = beats[beatIndex];
const isLastBeat = beatIndex === beats.length - 1;
```

On advance press:
```typescript
if (!done) { // finish typing current beat
  setShown(currentText.length); setDone(true);
} else if (!isLastBeat) { // advance to next beat
  setBeatIndex(b => b + 1);
  setShown(0); setDone(false);
} else {
  onClose(); // final beat done — close
}
```

### GameDialog type change

```typescript
| { type: "npc"; name: string; role: string; quote: string; beats?: string[]; kind?: NpcKind }
```

### GameNpc type change

```typescript
beats?: string[];
```

When `npc.beats` is present, `Game.tsx` passes it through:
```typescript
setDialog({ type: "npc", name: i.npc.name, role: i.npc.role,
  quote: i.npc.quote, beats: i.npc.beats, kind: i.npc.kind });
```

### Selected NPCs to refactor into beats

High-impact NPCs to split (long monologues → 2–3 beats):
- **Prof. Iterate** (home zone tutorial) — 3 beats
- **Blank Page gym intro** (via `gym.intro` displayed in BattleIntro)
- **Zero Runway** intro
- **Status Quo** intro (final boss)
- **Rival** (home zone)

> Note: Gym `intro` is shown by `BattleIntro.tsx` as a single string. We can extend `BattleIntro` to accept an optional `introBeat: string[]` — but that's an additive change. For this task, only `GameNpc.beats` is supported; gym intros remain single-string.

---

## Item 5 — Follower Creature Reactions

### Engine changes

Add to `GameState`:
```typescript
followerAnim: { kind: "idle" | "jump" | "spin"; startedAt: number };
```

Add engine methods:
```typescript
triggerFollowerAnim(kind: "jump" | "spin") {
  if (!state.followerUnlocked) return;
  state.followerAnim = { kind, startedAt: performance.now() };
}
```

### Render changes in `engine.ts`

In the follower rendering section:
```typescript
const now_ms = performance.now();
const anim = state.followerAnim;
let followerOffsetY = 0;
let followerRotation = 0;

if (anim.kind === "jump") {
  const elapsed = now_ms - anim.startedAt;
  if (elapsed < 120) followerOffsetY = -Math.sin((elapsed / 120) * Math.PI) * 10;
  else if (elapsed >= 240) state.followerAnim = { kind: "idle", startedAt: 0 };
} else if (anim.kind === "spin") {
  const elapsed = now_ms - anim.startedAt;
  if (elapsed < 400) followerRotation = (elapsed / 400) * Math.PI * 2;
  else state.followerAnim = { kind: "idle", startedAt: 0 };
}

// Idle bob — increased amplitude
const idleBob = anim.kind === "idle"
  ? Math.round(Math.sin(now_ms / 350) * 2.5)
  : 0;
```

Apply `followerOffsetY + idleBob` as Y offset and `followerRotation` as canvas rotation when drawing the follower sprite.

### Game.tsx integration

After `setBattleIntro(z)`:
```typescript
engineRef.current?.triggerFollowerAnim("jump");
```

After badge earned (in `handleVictoryContinue`):
```typescript
engineRef.current?.triggerFollowerAnim("spin");
```

---

## Item 6 — Route Trainer Battles

### Data changes

```typescript
export type RouteNpc = {
  x: number; y: number;
  name: string; role: string; quote: string; kind: NpcKind;
  trainer?: {
    hp: number;
    moves: Move[];
    weakTo: string[];
    resists: string[];
    victoryQuote: string;
    defeatQuote: string;
  };
};
```

Four route NPCs designated as trainers:
- **Wandering Kid** (Route 1) — low HP, 2 weak moves
- **Street Vendor** (Route 2) — medium HP, balanced moves
- **Angel Investor** (Route 6) — higher HP, capital-type moves
- **Sneaker Collector** (Route 7) — medium HP, brand/culture moves

### GameState addition

```typescript
defeatedTrainers: Set<string>;  // keyed by `${x},${y}` or npc.name
```

Persisted to save as `defeatedTrainers: [...state.defeatedTrainers]`.

### Engine callback

`EngineCallbacks` gains:
```typescript
onTrainerBattle: (npc: RouteNpc) => void;
```

In `autoInteractNear()` / NPC interaction, when the resolved NPC is a route trainer and not yet defeated:
```typescript
if (rn.trainer && !state.defeatedTrainers.has(rn.name)) {
  cb.onTrainerBattle(rn);
  return;
}
```

### Game.tsx integration

New state: `trainerBattle: RouteNpc | null`.

`onTrainerBattle` handler opens `Battle` with a synthetic `zone`-like object constructed from the trainer data:
```typescript
// Construct a minimal Zone-like object for Battle component
const syntheticZone: Zone = {
  ...currentZone,    // borrow theme/accent from current zone
  gym: {
    opponentName: npc.name,
    opponentTitle: npc.role,
    intro: npc.quote,
    hp: npc.trainer.hp,
    weakTo: npc.trainer.weakTo,
    resists: npc.trainer.resists,
    moves: npc.trainer.moves,
    victory: npc.trainer.victoryQuote,
    leader: "blankpage",  // fallback sprite — trainers use existing leader PNGs
  }
};
```

On player win: mark trainer defeated, show victoryQuote toast.  
On player lose: apply HP penalty, show defeatQuote dialog.

---

## Item 7 — Leader Sprite Scale

### Battle.tsx changes

1. `oppRef` canvas: `width={240} height={240}` backing buffer, `style={{ width: 140, height: 140 }}` → `style={{ width: 240, height: 240 }}`
2. Draw call: `c.drawImage(leaderImg, 4, 4 + bob, 232, 232)` (was 152×152)
3. Arena div: `minHeight: 210` → `minHeight: 260`
4. Shake animation: augment the existing `translateX(9px)` with `translateY(-4px)` to simulate parallax impact depth.

```typescript
// In oppRef drawing:
if (leaderImg && isReady(leaderImg)) {
  const bob = Math.sin(now / 420) * 3;
  c.drawImage(leaderImg, 4, 4 + bob, 232, 232);
}
```

```css
/* Existing hp-shake augmented for parallax: */
@keyframes opp-shake {
  0%,100% { transform: translateX(0) translateY(0); }
  20% { transform: translateX(-9px) translateY(-4px); }
  40% { transform: translateX(9px) translateY(2px); }
  60% { transform: translateX(-6px) translateY(-2px); }
  80% { transform: translateX(4px) translateY(1px); }
}
```

---

## Item 8 — Narrative Reframe

All changes are in `game/data.ts` — no code logic changes needed.

### Gym leader intro/victory rewrite pattern

**Before** (about Param): `"India's first AI chatbot. Nobody's heard of it yet. Change that."`  
**After** (to the player): `"Nobody's heard of chatbots yet — including you, maybe. That's what makes this the hardest sell. Change my mind."`

All 9 gym leaders' `intro` and `victory` strings are rewritten to second-person. Examples in tasks.md.

### NPC quote reframes

NPCs to rewrite (selected for highest narrative impact):
- Prof. Iterate (tutorial hook)
- Mom (emotional send-off)
- Rival (challenge framing)
- "The throughline" NPC in Origin Town
- Two investor NPCs in Investopad Tower
- Status Quo gym intro (final boss)

---

## Item 9 — HUD Consistency

### Game.tsx changes

Replace the three bottom-right buttons:
```tsx
// OLD
{ label: "NOTES", icon: "📋", ... }
{ label: "BAG",   icon: "🎒", ... }
{ label: "MENU",  icon: "☰",  ... }

// NEW — no icon span, just label
{ label: "NOTES", action: ... }
{ label: "BAG",   action: ... }
{ label: "MENU",  action: ... }
```

Replace mute button:
```tsx
// OLD
{muted ? "🔇" : "🔊"}

// NEW
<span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, letterSpacing: "0.05em" }}>
  {muted ? "SFX OFF" : "SFX ON"}
</span>
```

---

## Item 10 — Zone Accent HUD Bleed

### State

```typescript
const [hudAccentBleed, setHudAccentBleed] = useState<string | null>(null);
const bleedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

### On ZoneTitle completion

```typescript
// In ZoneTitle's onDone handler in Game.tsx:
setHudAccentBleed(zoneTitle.theme.accent);
if (bleedTimerRef.current) clearTimeout(bleedTimerRef.current);
bleedTimerRef.current = setTimeout(() => setHudAccentBleed(null), 12000); // 10s hold + 2s fade
```

### Game container style

```tsx
<div style={{
  // ...existing styles...
  border: `1px solid ${hudAccentBleed ? hudAccentBleed + "55" : "rgba(124,224,255,0.06)"}`,
  transition: hudAccentBleed
    ? "border-color 0.4s ease-out"
    : "border-color 2s ease-in",
}}>
```

---

## Correctness Properties

### P1 — Leader AI always produces a valid, PP-safe move
*For any* battle turn, `pickLeaderMove` SHALL return an index ∈ `[0, gym.moves.length)` corresponding to a move that either has PP remaining or is the only move available.

### P2 — CliffNotes fires after every non-champion gym victory
*For any* gym zone that is not the last gym, `cliffOpen` SHALL be set to that zone within 1.5 s of the player pressing CONTINUE on VictoryMoment.

### P3 — Hidden item fires exactly once per zone per save
*For any* hidden item tile, the `SkillLearnOverlay` SHALL fire at most once across all sessions (gated by `skills.has(zone.skill.id)`).

### P4 — Multi-beat dialogue advances correctly
*For any* dialogue with N beats, pressing advance N times SHALL fire `onClose` exactly once and SHALL NOT fire it on any earlier advance.

### P5 — Follower reactions respect followerUnlocked gate
*For any* `triggerFollowerAnim` call, the animation SHALL NOT play if `state.followerUnlocked === false`.

### P6 — Trainer battles mark defeat and never re-trigger
*For any* trainer NPC, after one defeat the interaction SHALL fall through to normal dialog — `onTrainerBattle` SHALL NOT fire again.

### P7 — Leader sprite never clips arena on any viewport
*For any* viewport width ≥ 320 px, the 240×240 leader canvas SHALL fit within the arena panel without horizontal overflow.

### P8 — HUD bleed timer resets on new zone arrival
*For any* second ZoneTitle completion within the bleed window, the `bleedTimerRef` SHALL be cleared and restarted with the new zone's accent.
