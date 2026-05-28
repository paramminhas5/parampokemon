# PARAM QUEST — 2025 Premium Game Plan
> Last updated: May 2026 · Living document — update as features ship

---

## 1. What This Is

A playable portfolio RPG — 15 years of Param Minhas's career told as a Pokémon-style game.
Built on Next.js 15 · TypeScript · Canvas 2D · Web Audio API (zero audio files) · FAL.ai sprites.

The goal: **feel like a premium, polished 2025 indie Pokémon game** — not a portfolio hack.

---

## 2. Complete Current State

### ✅ Fully Done

**World & Overworld**
- 10 zones (Home + 9 career zones), 80×300 tile world, linear south-flow layout
- 38 unique tile types — animated water, neon, crypto, candlestick, pylon tiles
- 9 themed route corridors between zones (meadow, forest, stream, boulders, neon, mall, crypto, garden, skyline)
- Zone-entry arch gates, zone border treatments (fence/water/flowers/mixed)
- Smooth camera lerp (0.12 factor), jitter-free rendering
- WASD + arrow keys + click-to-walk (BFS pathfinding) + scroll-to-walk + touch swipe
- Zone ambient particles, NPC idle bob, wild creature bob + "!" marker
- Zone glow underfoot for player

**Battle System**
- Full turn-based battle — type effectiveness (2×/0.5×), crits (18%), miss, PP tracking
- 4-move gym leader set per zone
- Stage system: Mermander (0 badges) → Mermalion (4) → Merlord (8)
- Flash attack overlay, shake animations, defeat quote overlay
- Slide-in animations on enter (`sprite-enter-left` / `sprite-enter-right`)

**Narrative & UI**
- Title screen with Prof. Iterate 4-line typewriter intro
- BattleIntro cinematic (2.8s, leader slides in, VS badge, quote)
- VictoryMoment overlay (desaturated leader, badge pop, sparkles, victory quote)
- Evolution cutscene (shake → flash → new sprite, sparkles, rings)
- SkillLearnOverlay (full-screen, berry orb, type badge, sparkles)
- CatchModal (mini-battle, pokéball animation, GOTCHA)
- CliffNotes slide-up panel (era, DID, LEARNED, metrics, creature, skill)
- ChampionCard (Merlord sprite, stats, badge strip, share buttons)
- WorldSelect galaxy view (SVG nodes, nebula, shooting stars, connection lines, list view)
- WorldMap fast-travel (timeline with warp buttons)
- Bag inventory (4 tabs: Mermander, Creatures, Berries, Badges)
- StartMenu (4 tabs: Trainer, Badges, People, Contact)
- DialogBox with typewriter, NPC portrait, accent color
- TouchControls D-pad (mobile)
- TransitionOverlay (zone fade, battle speed lines, warp iris)
- ZoneAmbience overlays (crypto matrix rain, mall spotlight, studio notes, etc.)
- ContactModal, PressModal

**Audio (100% synthesized — zero files)**
- 10 zone BGM tracks (ground-type determined), battle BGM
- 10 SFX: step, hit, super, crit, victory, badge, catch, faint, menu, warp
- Fade in/out on zone transitions, mute toggle, localStorage persistence

**Sprites (AI-generated via FAL.ai)**
- 9 creature PNGs: origin, grp, hab, ai, investopad, sole, fere, ccd, iterate
- 9 gym leader PNGs: blankpage, longtail, zerorunway, prehype, termsheet, noculture, blackbox, nobrief, statusquo
- 12 player Mermander-line sprites: mermander/mermalion/merlord × front/back/left/right
- 6 battle sprites: mermander/mermalion/merlord × battle_back + battle_front
- 4 Param player sprites: front/back/left/right
- 10 landmark PNGs: home, origin, grp, hab, ai, investopad, sole, fere, ccd, iterate
- 3 UI sprites: pokeball, presswall, warppad

**Save system**
- Full localStorage save/load (badges, creatures, skills, defeated gyms, visited zones)
- Engine state restoration on page reload

---

## 3. Missing / Gaps

### 🔴 High Priority (biggest user-visible gaps)

| # | Gap | Why It Matters |
|---|-----|----------------|
| A | Building interiors | Doors currently just show first NPC dialog — pressing Enter on a door feels dead. Interiors are the #1 depth feature. |
| B | Linear path clarity | World is linear but no strong visual cue forces the player along the path. Should feel like a Pokémon route — one clear road with no ambiguity. |
| C | New graphic assets | No title screen background, no zone arrival banners, no battle background art, no interior sprites, no HQ exterior refinement. These are the biggest visual quality lifts. |
| D | Zone arrival title cards | No "YOU ARRIVED AT X" moment. Player warps or walks in and just gets a small toast. Should be a full cinematic beat. |
| E | Battle HP drain animation | HP bar width transitions but the number doesn't count down. Feels un-Pokémon. |

### 🟠 Medium Priority

| # | Gap | Notes |
|---|-----|-------|
| F | Pokédex tab in Bag | Creatures tab exists but is a basic grid. No flavor text, no zone info, no Pokédex entry feel. |
| G | Rival at Home zone | README spec calls for a rival character who challenges you as you leave Pallet Town. Not implemented. |
| H | Per-zone unique BGM | Two grass zones sound identical. Each zone should have its own melody layer. |
| I | Route NPCs | Empty corridors between zones. Should have 1-2 trainer NPCs per route who say one flavor line. |
| J | 3-4 NPCs per zone | Currently 2 per zone. 1 more per zone = much richer world feel. |
| K | Mobile haptics | No `navigator.vibrate()` on step. Small but adds to game feel. |
| L | Pokédex entry in Bag | Currently just a grid — should be a full entry with region found, type, quote, power. |

### 🟡 Lower Priority

| # | Gap | Notes |
|---|-----|-------|
| M | Post-champion content | Champion route north of Pallet Town, Param NPC talking about what he's building now, ContactModal trigger. |
| N | Homepage creature drift | Creature strip opacity 6% → 15%, slow drift animation per creature. |
| O | OG image | `/og.png` referenced in layout but doesn't exist. |
| P | Press wall sprite rendering | `presswall.png` and `warppad.png` exist but aren't being used — warppad should show as a special tile. |

---

## 4. New Assets Needed (generate_sprites_v3.mjs)

All to be generated with FAL.ai **flux/dev** (28 steps, 1024×1024). These are the assets that currently have no visual art:

### BATCH A — Title & UI Art
| ID | Path | Description |
|----|------|-------------|
| `title_bg` | `public/sprites/ui/title_bg.png` | Epic dark title screen background — starfield, silhouette world, aurora |
| `pokeball_hq` | `public/sprites/ui/pokeball_hq.png` | High-quality pokéball for battle (replaces 4KB one) |
| `champion_bg` | `public/sprites/ui/champion_bg.png` | Champion card background — galaxy, gold laurels |

### BATCH B — Zone Arrival Banners (10 zones)
| ID | Path | Description |
|----|------|-------------|
| `banner_home` → `banner_iterate` | `public/sprites/banners/{id}.png` | Each zone gets a wide cinematic banner (16:5 ratio) shown on arrival — atmospheric art for the zone's identity |

### BATCH C — Battle Backgrounds (10 zones)
| ID | Path | Description |
|----|------|-------------|
| `battle_home` → `battle_iterate` | `public/sprites/battle/{id}.png` | Rich battle arena backgrounds per zone, replacing the CSS gradient |

### BATCH D — Interior Scenes (10 zones)
| ID | Path | Description |
|----|------|-------------|
| `interior_home` → `interior_iterate` | `public/sprites/interiors/{id}.png` | 8×6 tile interior room art per zone building |

### BATCH E — Route Art (9 routes)
| ID | Path | Description |
|----|------|-------------|
| `route_meadow` → `route_skyline` | `public/sprites/routes/{theme}.png` | Background mood art for each route corridor (shown as subtle parallax layer) |

**Total new sprites: ~42 images**

---

## 5. Implementation Plan — Phases

### Phase 1 — Code (no FAL key needed) ✦ Do First

#### 1A. Zone Arrival Title Cards (`components/game/ZoneTitle.tsx`)
New component that fires when `onZoneEnter` is called. Shows for 2.5s:
- Full-width dark overlay with zone accent color
- Zone name in large pixel font
- Zone subtitle (org, years)
- Subtle zone accent particles
- Banner PNG (if generated) as background; falls back to gradient

**Touch point in Game.tsx:** replace `showToast` on zone enter with `setZoneTitle(z)`.

#### 1B. Battle HP Drain Animation
In `Battle.tsx`, replace instant `setOppHp(nextOppHp)` with a staged counter:
- Count down from current HP to new HP over 500ms
- Each tick: update displayed number + bar width
- Sound tick on each step (very low volume)

#### 1C. Linear Path Clarity (`game/world.ts`)
The path is there but not visually forceful enough. Changes:
- Widen the central path to 6 tiles (from 4)
- Add path edge markers — a 1-tile "kerb" of a distinct tile (FENCE or STONE) on each side of the path in routes
- Add direction arrows on path tiles as decorative markers every 8 tiles (canvas-drawn, subtle)
- Outside the path in routes: denser trees as walls (2-tile solid tree border on both sides of route)
- Force zone entries: arch gate is already there; add a 2-tile approach ramp (path widens at zone entry)

#### 1D. Building Interiors (`game/engine.ts` + `components/game/Interior.tsx`)
New subsystem:
- `GameState` gets `currentInterior: string | null`
- `Interior.tsx` renders a small 10×8 tile canvas map
- 10 unique interior maps defined in `game/interiors.ts` (tile arrays)
- Transition: black fade in/out on door cross
- Interior has exit door that returns to overworld
- Each interior: unique floor tile, 2-3 prop objects, 1 NPC (the building's first NPC, now properly inside)
- Interiors do NOT need AI sprites — they use the existing procedural tile renderer

Interior specs:
| Zone | Floor | Props | Vibe |
|------|-------|-------|------|
| home | STUDIO (wood) | CRT TV prop, guitar, records | Cozy bedroom |
| origin | SAND | Drafting table, sketchbook, window | Workshop |
| grp | GRASS | Price boards, catalog shelves, counter | Market office |
| hab | STONE | Lease papers pile, key hooks on wall | Property office |
| ai | NEON | Server rack × 2, terminal screen | Server room |
| investopad | DUSK | Long table, whiteboard, trophy | Boardroom |
| sole | MALL | Sneaker rack × 3, fitting room | Store back |
| fere | CRYPTO | Crypto screens × 2, agent terminal | Trading floor |
| ccd | STUDIO | Mixing desk, mic stand, cat NPC | Recording studio |
| iterate | NIGHT | Strategy boards, trophy wall, big desk | Agency HQ |

#### 1E. Pokédex Tab in Bag (`components/game/Bag.tsx`)
New 5th tab "POKÉDEX" replacing the creatures tab (or add as 5th):
- Full entry view per creature: large sprite, name, type pill, power bar, zone found, flavor description
- Unknown creatures show silhouette + "???" with zone locked indicator
- Scrollable list on left, detail panel on right (desktop) / stacked (mobile)

#### 1F. Rival at Home (`game/data.ts` + `game/world.ts`)
Add a rival NPC at Home zone:
- Position: south of player spawn, blocking the path exit
- Name: "Rival" — a startup peer character
- Dialog: challenges player to a quick "friendly" encounter before they can leave
- No actual battle (battle system is gym-only) — just a dialog gate
- After dialog: rival steps aside, path opens

### Phase 2 — Sprite Generation (needs FAL key)

Run `generate_sprites_v3.mjs` in batches, approve each before proceeding:

```
Batch A (UI/title) → approve → 
Batch B (zone banners) → approve → 
Batch C (battle backgrounds) → approve → 
Batch D (interiors) → approve → 
Batch E (routes) → approve
```

**Script improvements over v2:**
- All generation via `fal-ai/flux/dev` (not schnell) — 28 steps minimum
- Proper negative prompts tuned per category
- `--preview` flag: generates 1 per batch for quick approval
- `--regen` flag: regenerate specific IDs without rerunning all
- Width/height per category (banners = 1024×320, battle = 1024×384, squares = 1024×1024)
- Output to new subdirectory structure (`/sprites/banners/`, `/sprites/battle/`, etc.)

### Phase 3 — Audio (code only)

#### 3A. Per-Zone Unique BGM
Currently BGM is determined by `ground` type — two grass zones sound identical.
Fix: add `zone.bgm: { melody: number[]; bass: number[]; tempo: number }` to each zone in `data.ts`, or just add a `bgmId` that maps to a unique track in `audio.ts`.

Add 3 new zone-specific melody layers on top of existing base:
- Each is a 16-step melody sequence unique to that zone
- Mixes over the base bass track
- Fades in on zone enter, out on zone exit

#### 3B. Route NPCs
Add 1 NPC per route corridor (9 total) to `data.ts`:
- Position: middle of route, on or beside the path
- One flavor line each (thematic to the journey between zones)
- No battle, just character

### Phase 4 — Polish

#### 4A. Homepage Creature Strip
- `components/home/CareerCard.tsx` — increase creature opacity 6% → 15%
- Add `@keyframes creature-drift` with slow horizontal + vertical float per creature
- Each creature has unique phase offset

#### 4B. OG Image
Generate `/public/og.png` (1200×630):
- Game title, Merlord sprite, zone mosaic, "A playable portfolio" tagline
- Can be done with FAL or a simple canvas script

#### 4C. Press Wall Warppad
`warppad.png` exists — wire it as a visual tile at press wall positions (currently just a BADGE tile).

---

## 6. File Map — What Changes Where

| File | Changes |
|------|---------|
| `game/data.ts` | Add rival NPC to home zone; add route NPCs; add `bgmId` per zone |
| `game/world.ts` | Widen path (4→6 tiles); denser route tree walls; path kerb tiles; zone entry ramp |
| `game/engine.ts` | Interior subsystem (`currentInterior` state); door → interior transition logic |
| `game/interiors.ts` | NEW — 10 interior tile maps + NPC positions |
| `game/tiles.ts` | No changes needed (all tile types already exist) |
| `game/sprite-registry.ts` | Add banner URLs, battle BG URLs, interior scene URLs |
| `components/game/Game.tsx` | Wire ZoneTitle component; wire Interior component |
| `components/game/ZoneTitle.tsx` | NEW — zone arrival cinematic |
| `components/game/Interior.tsx` | NEW — interior renderer |
| `components/game/Battle.tsx` | HP drain counter animation |
| `components/game/Bag.tsx` | Add Pokédex tab (enhanced creature entries) |
| `lib/audio.ts` | Per-zone unique melody layers; route BGM transitions |
| `generate_sprites_v3.mjs` | NEW — all new asset batches |
| `README.md` | Update to reflect complete current state |

---

## 7. Decisions Made

| Decision | Rationale |
|----------|-----------|
| **Linear path, not zigzag** | User confirmed: one forced path, clear direction. Non-linear = confusion. |
| **Interiors = tile-based, no new sprites needed** | Procedural canvas tiles already cover all interior prop types. New interior art (BATCH D) is optional enhancement. |
| **Flux/dev for all new generation** | Schnell is fast but painterly. Dev = 28 steps, proper pixel art quality. |
| **Zone arrival cards replace toasts** | Small toast on zone enter is underwhelming. Full cinematic beat is the right call. |
| **Battle HP drain = number + bar** | HP number should visually count down — that's what makes it feel like a game, not an app. |
| **Rival = dialog gate, not real battle** | Battle system is gym-only. A rival battle would require a whole new flow. Dialog gate preserves the narrative moment without scope creep. |
| **Per-zone BGM via bgmId in data.ts** | More flexible than ground-type lookup. Zones can have unique vibes even if ground type matches. |
| **Pokédex as enhanced creatures tab** | Don't add a 5th tab — enhance the existing creatures tab to be a proper Pokédex. Less UI clutter. |

---

## 8. Sprite Generation Guide (v3)

### When to use what model:
- Creatures / Leaders / Player: `fal-ai/flux/dev` 28 steps, `square_hd` (1024×1024)
- Banners (wide): `fal-ai/flux/dev` 28 steps, `landscape_hd` (1024×576)
- Battle BGs: `fal-ai/flux/dev` 28 steps, `landscape_hd` (1024×576)
- UI (pokeball etc): `fal-ai/stable-diffusion-v15` + pixel LoRA (true pixel art)
- Interior scenes: `fal-ai/flux/dev` 28 steps, `square_hd`

### Key prompt ingredients:
- **Creatures**: `pokemon GBA sprite style, bold black pixel outlines, transparent background, single centered creature, chibi cute proportions, clean limited color palette, no anti-aliasing`
- **Banners**: `wide cinematic panorama, pixel art JRPG style, atmospheric mood, no text, no people, landscape orientation, 16-bit RPG aesthetic`
- **Battle BGs**: `pokemon battle arena background, top-down JRPG perspective, no characters, atmospheric lighting, [zone-specific elements]`
- **Interiors**: `top-down RPG interior room, pixel art, 16-bit, warm lit room, no characters, isometric-ish top-down view`

### Negative prompt (always include):
```
photorealistic, 3d render, blurry, noisy, watermark, text, signature, 
multiple characters, background clutter, modern UI, anti-aliased
```

---

## 9. Execution Order

```
IMMEDIATE (no FAL key):
  1. generate_sprites_v3.mjs (write script, run BATCH A preview for approval)
  2. ZoneTitle.tsx + wire in Game.tsx
  3. Battle HP drain animation
  4. Linear path clarity (world.ts changes)
  5. Building interiors (interiors.ts + Interior.tsx + engine.ts)
  6. Pokédex tab (Bag.tsx enhancement)
  7. Rival NPC at Home (data.ts)

WITH FAL KEY (run in approval batches):
  8. BATCH A — UI/title art
  9. BATCH B — Zone arrival banners (use in ZoneTitle.tsx)
  10. BATCH C — Battle backgrounds (use in Battle.tsx)
  11. BATCH D — Interior art (optional enhancement over tile rendering)
  12. BATCH E — Route art (optional parallax layer)

AUDIO:
  13. Per-zone unique BGM (audio.ts)
  14. Route NPCs (data.ts)

POLISH:
  15. Homepage creature drift
  16. OG image
  17. Press wall warppad tile
```

---

## 10. Architecture Reference

```
parampokemon/
├── app/
│   ├── page.tsx                          # Homepage (Server Component)
│   ├── play/page.tsx                     # Game → GameBoot → Game
│   └── resume/page.tsx                   # CV (Server Component)
├── components/
│   ├── home/CareerCard.tsx
│   ├── resume/ExperienceEntry.tsx
│   └── game/
│       ├── Game.tsx                      # Root state + modal orchestration
│       ├── Battle.tsx                    # Turn-based battle
│       ├── BattleIntro.tsx / VictoryMoment.tsx
│       ├── Bag.tsx / StartMenu.tsx / WorldMap.tsx / WorldSelect.tsx
│       ├── CliffNotes.tsx / CatchModal.tsx / ContactModal.tsx / PressModal.tsx
│       ├── EvolutionCutscene.tsx / SkillLearnOverlay.tsx / ChampionCard.tsx
│       ├── TitleScreen.tsx / GameBoot.tsx
│       ├── TouchControls.tsx / TransitionOverlay.tsx / ZoneAmbience.tsx
│       ├── DialogBox.tsx
│       ├── ZoneTitle.tsx                 ← NEW
│       └── Interior.tsx                  ← NEW
├── game/
│   ├── data.ts                           # All content
│   ├── engine.ts                         # Game loop + render (+ interior subsystem)
│   ├── tiles.ts                          # 38 tile types
│   ├── sprites.ts                        # Procedural Mermander-line + leaders
│   ├── landmarks.ts                      # Zone landmark art
│   ├── world.ts                          # Tile grid builder (widen path)
│   ├── pathfind.ts                       # BFS
│   ├── sprite-registry.ts                # Image cache + all URLs
│   └── interiors.ts                      ← NEW — 10 interior maps
├── lib/audio.ts                          # Web Audio BGM + SFX
├── public/sprites/
│   ├── creatures/                        # 9 zone creatures ✅
│   ├── leaders/                          # 9 gym leaders ✅
│   ├── player/                           # 16 player sprites ✅
│   ├── landmarks/                        # 10 landmarks ✅
│   ├── ui/                               # pokeball, presswall, warppad ✅
│   ├── banners/                          ← NEW (10 zone arrival banners)
│   ├── battle/                           ← NEW (10 battle backgrounds)
│   ├── interiors/                        ← NEW (10 interior scenes)
│   └── routes/                           ← NEW (9 route mood art)
├── generate_sprites_v2.mjs               # Existing generator
└── generate_sprites_v3.mjs              ← NEW — all new asset batches
```

---

## 11. Quality Bar

> "Does this feel like a 2025 indie Pokémon game or does it feel like a portfolio hack?"

For each feature, ask:
1. **Entry moment** — does entering the zone / battle / room have a cinematic beat?
2. **Feel** — does every interaction (move, walk, talk) have feedback?
3. **Depth** — is there always something new to see / discover?
4. **Narrative** — does the text / dialog serve the story?
5. **Visual** — are sprites consistent in style? No mixing of painterly + pixel-pure.

---

*Contact: param@catscandance.com*
