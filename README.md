# PARAM QUEST 🎮

> **A playable portfolio. Fifteen years of building, told as a Pokémon RPG.**

Walk through 10 worlds. Talk to the people. Fight the gym leaders. Collect the badges.  
Each boss is a **real challenge Param actually faced**. Defeat them to earn the badge and read what he learned.

**Stack:** Next.js 15 · TypeScript · Canvas 2D · FAL.ai (flux/dev sprites)

---

## 🗺️ The World

| # | Zone | Org | Years | Gym Boss |
|---|------|-----|-------|----------|
| 0 | Pallet Town | Home | Pre-2010 | — |
| 1 | Origin Town | Independent | Pre-2010 | The Blank Page |
| 2 | GRP Market | GetRightPrice | 2010 | The Long Tail |
| 3 | Hab District | Hab Housing | 2012–13 | Zero Runway |
| 4 | Quartic Lab | Octo → Quartic.ai | 2013–17 | Pre-Hype Market |
| 5 | Investopad Tower | Investopad | Post-Octo | Term Sheet |
| 6 | SoleSearch Mall | SoleSearch | 2020–24 | No Sneaker Culture |
| 7 | Fere District | Fere.ai | 2024–25 | The Black Box |
| 8 | Cats Can Dance | CCD | Now | No Brief |
| 9 | Iterate HQ | Iterate | Now | The Status Quo |

---

## 🐉 Mermander Line (Starter Pokémon)

| Stage | Name | Badges | HP | Colour |
|-------|------|--------|----|--------|
| 1 | **Mermander** | 0 | 60 | Aqua `#7ce0ff` |
| 2 | **Mermalion** | 4 | 110 | Violet `#c89af0` |
| 3 | **Merlord** | 8 | 180 | Gold `#ffd24a` |

Param walks the overworld as a human. Mermander follows one tile behind.  
In battle you fight *as* Mermander — the creature is the RPG stand-in for Param's career power.

---

## 🎮 Controls

| Input | Action |
|-------|--------|
| `ARROWS` / `WASD` | Walk |
| `TAP` / `CLICK` | Walk-to + auto-talk |
| `SPACE` / `Z` / `ENTER` | Talk / action |
| `ESC` / `X` | Menu |
| `MAP` | Fast travel |
| `⚡ WARP` | World select |
| **GYM MAT** | Enter gym battle |
| **BAG** | Inventory |

---

## 🚀 Running Locally

```bash
npm install
npm run dev        # → http://localhost:3000
```

---

## 🎨 Sprite Generation

All sprites are AI-generated via **FAL.ai** using `flux/dev` (28 steps, premium quality).

### v2 — Creatures, Leaders, Player, Landmarks (already generated ✅)

```bash
FAL_KEY=your_key node generate_sprites_v2.mjs

# One batch at a time (recommended)
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=creatures --model=sdxl
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=leaders   --model=sdxl
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=player    --model=sdxl
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=landmarks --model=sdxl

# Regenerate specific sprites
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=creatures --only=grp,fere
```

### v3 — New assets: UI art, Zone Banners, Battle Backgrounds (already generated ✅)

```bash
FAL_KEY=your_key node generate_sprites_v3.mjs            # all batches
FAL_KEY=your_key node generate_sprites_v3.mjs --batch=A  # UI/title art (3 imgs)
FAL_KEY=your_key node generate_sprites_v3.mjs --batch=B  # zone arrival banners (10 imgs)
FAL_KEY=your_key node generate_sprites_v3.mjs --batch=C  # battle backgrounds (10 imgs)
FAL_KEY=your_key node generate_sprites_v3.mjs --preview  # 1 per batch for approval
FAL_KEY=your_key node generate_sprites_v3.mjs --regen=title_bg --batch=A  # redo one
```

**Fallback:** if any PNG fails to load, the engine renders procedural canvas pixel art from `game/sprites.ts` / `game/tiles.ts` — no blank spaces ever.

---

## ✅ What's Built (Complete)

### Core game
- [x] Full overworld: 10 zones, themed route corridors, 80×300 tile world
- [x] Smooth tile movement — WASD, click-to-walk (BFS), touch swipe, D-pad
- [x] Cinematic camera lerp — jitter-free
- [x] 38 unique tile types — animated water, neon, crypto, pylon tiles
- [x] Turn-based battle — type effectiveness, crits, miss, PP tracking
- [x] 3-stage evolution (Mermander → Mermalion → Merlord) with cutscene
- [x] Wild creature catch system
- [x] Skill berry system (NPCs teach battle moves)
- [x] Full NPC dialog with typewriter effect
- [x] **Building interiors** — every door opens a real 12×9 tile room, WASD movement, NPC dialog, themed props, fade transitions, exit back to overworld
- [x] **Rival NPC at Home** — Rival character at south of spawn, challenges you before you leave Pallet Town
- [x] **Per-zone unique BGM** — all 10 zones have distinct melodies; GRP and Iterate HQ get unique tracks instead of shared ground-type BGM
- [x] Zone BGM (Web Audio API procedural, zero audio files), battle BGM + SFX
- [x] Save/load via localStorage

### Visual / Cinematic
- [x] **Title screen** — `title_bg.png` cinematic background with vignette
- [x] **Zone arrival cinematic** (`ZoneTitle.tsx`) — full-screen 2.6s banner on zone enter, accent particles, shimmer, scanline
- [x] **Battle backgrounds** — zone-specific PNG canvas behind every battle arena
- [x] **Battle HP drain counter** — number counts down over 500ms, HP bar shakes on hit
- [x] **SUPER EFFECTIVE / CRITICAL HIT** — glowing text pop centered on battle arena
- [x] **Champion card** — `champion_bg.png` gold hall background on completion
- [x] World Select galaxy view (SVG, nebula, shooting stars, connection lines)
- [x] Battle intro cinematic + Victory moment + Evolution cutscene
- [x] Skill learn overlay + CliffNotes slide-up + CatchModal

### World design
- [x] Linear path — 6 tiles wide (widened from 4), clear forced direction
- [x] Dense tree walls flanking all route corridors — no wandering off
- [x] Zone-entry arch gates span full 6-tile path
- [x] 9 route themes (meadow, forest, stream, boulders, neon, mall, crypto, garden, skyline) with decorations scattered ON the path
- [x] Thematic props per zone (servers, racks, speakers, pylons, candlesticks, trophies)
- [x] Zone ambient particles, NPC idle bob, wild creature bob + "!" marker
- [x] Zone glow underfoot for player

### Inventory & Pokédex
- [x] **Pokédex tab** — two-panel layout: scrollable list with mini sprites + full entry panel (large sprite, accent glow, scanline, type pill, power bar, description, zone hint)
- [x] Bag inventory — Mermander tab, Creatures/Pokédex, Berries, Badges
- [x] Caught counter `X / 9 CAUGHT` in header; silhouette + hint for uncaught

### Sprites (all AI-generated, all wired)
- [x] 9 zone creatures (`/sprites/creatures/`)
- [x] 9 gym leaders (`/sprites/leaders/`)
- [x] 12 player overworld sprites — Mermander/Mermalion/Merlord × 4 directions
- [x] 6 battle sprites — Mermander/Mermalion/Merlord × battle_back + battle_front
- [x] 4 Param player sprites — front/back/left/right
- [x] 10 landmark sprites (`/sprites/landmarks/`)
- [x] 10 zone arrival banners (`/sprites/banners/`) — wide cinematic art per zone
- [x] 10 battle backgrounds (`/sprites/battle/`) — arena art per zone
- [x] UI art: `title_bg.png`, `champion_bg.png`, `pokeball_hq.png`

### Homepage & Resume
- [x] Homepage career zone cards — expand on click
- [x] Resume experience entries — expand on click
- [x] Gym leaders strip, press section

---

## 🔜 Next Steps

### 🔴 High Priority

#### 1. Route NPCs
Every route corridor between zones is currently empty. 9 NPCs, one per route, make the world feel lived-in:
- Positioned beside the path, mid-route
- One thematic flavor line each (about the transition from one era to the next)
- No battle, just texture

**Files:** `game/data.ts` (add `routeNpcs` array), `game/world.ts` (place them), `game/engine.ts` (include in interactives)

#### 2. More NPCs Per Zone
Currently 2–3 NPCs per zone. Adding 1–2 more per zone (fan, client, engineer, tenant) makes each world feel populated rather than sparse.

**Files:** `game/data.ts` — add to each zone's `npcs[]`

#### 3. Interior Art (Batch D)
Interiors use procedural tile rendering. For a premium look, generate actual room background art:
```bash
# Add Batch D to generate_sprites_v3.mjs (10 interior room PNGs)
FAL_KEY=xxx node generate_sprites_v3.mjs --batch=D
```
Then render as background canvas layer in `Interior.tsx` — same pattern as battle backgrounds.

---

### 🟠 Medium Priority

#### 4. Mobile Polish
- D-pad: larger hit targets (min 54px), better thumb-zone positioning (lower on screen)
- `navigator.vibrate(20)` haptic on each walk step
- `touch-action: none` on game canvas prevents accidental pinch-to-zoom during swipe-to-walk
- Ensure Interior touch controls work well on small screens

#### 5. Post-Champion Content
After beating all 9 gyms, unlock something worth finding:
- "Champion Route" — a short path north of Pallet Town, only accessible after full completion
- One final NPC = Param himself, talking about what he's building right now
- Triggers `ContactModal` directly — the best possible CTA ending

**Files:** `game/data.ts`, `game/world.ts`, `game/engine.ts` (completion check)

#### 6. Homepage Creature Strip
- Increase creature opacity: 6% → 15%
- Add `@keyframes creature-drift` — slow independent float per creature
- Each creature has a unique phase + speed so they never sync

**Files:** `components/home/CareerCard.tsx`, `app/page.tsx`

---

### 🟡 Lower Priority

#### 7. OG Image
`/public/og.png` is referenced in `app/layout.tsx` but doesn't exist — every social share shows a blank card.
- Content: game title + Merlord sprite + zone mosaic + "A playable portfolio" tagline
- Size: 1200×630
- Can be generated via FAL (`fal-ai/flux/dev`) or a simple canvas script

#### 8. Press Wall Warppad
`public/sprites/ui/warppad.png` exists but isn't wired as a tile. Press wall positions currently use the BADGE tile.
- Add a `WARP_PAD` tile type in `tiles.ts`
- Draw the `warppad.png` image on it
- Place at `zone.pressWall` position in `world.ts`

#### 9. Sprite Quality Pass
Some sprites from v2 (especially creatures) lack the crisp GBA silhouette — mixed model quality from early generation runs.
- Re-run specific weak ones with `--model=sdxl` and updated prompts
- Or re-run all creatures with `fal-ai/flux-lora` + a Pokemon GBA LoRA for maximum accuracy
```bash
FAL_KEY=xxx node generate_sprites_v2.mjs --batch=creatures --only=iterate,origin --model=sdxl
```

---

## 📊 Completion Status

| Area | Status |
|------|--------|
| Core gameplay loop | ✅ Complete |
| All 10 zones + routes | ✅ Complete |
| Building interiors | ✅ Complete |
| Battle system | ✅ Complete |
| All sprites generated + wired | ✅ Complete |
| Zone arrival cinematics | ✅ Complete |
| Battle backgrounds | ✅ Complete |
| Pokédex tab | ✅ Complete |
| Rival NPC | ✅ Complete |
| Per-zone unique BGM | ✅ Complete |
| Route NPCs | 🔜 Next |
| Post-champion content | 🔜 Planned |
| OG image | 🔜 Planned |
| Mobile polish | 🔜 Planned |

---

## 🏗️ Architecture

```
parampokemon/
├── app/
│   ├── page.tsx                          # Homepage (Server Component)
│   ├── play/page.tsx                     # Game entry → GameBoot → Game
│   └── resume/page.tsx                   # CV (Server Component)
├── components/
│   ├── home/CareerCard.tsx               # Expand-on-click career card
│   ├── resume/ExperienceEntry.tsx        # Expand-on-click resume entry
│   └── game/
│       ├── Game.tsx                      # Root — state + modal orchestration
│       ├── Battle.tsx                    # Turn-based battle (+ battle BG canvas)
│       ├── ZoneTitle.tsx                 # ★ Zone arrival cinematic
│       ├── Interior.tsx                  # ★ Building interior renderer
│       ├── BattleIntro.tsx / VictoryMoment.tsx
│       ├── Bag.tsx / StartMenu.tsx / WorldMap.tsx / WorldSelect.tsx
│       ├── CliffNotes.tsx / CatchModal.tsx / ContactModal.tsx / PressModal.tsx
│       ├── EvolutionCutscene.tsx / SkillLearnOverlay.tsx / ChampionCard.tsx
│       ├── TitleScreen.tsx / GameBoot.tsx
│       ├── TouchControls.tsx / TransitionOverlay.tsx / ZoneAmbience.tsx
│       └── DialogBox.tsx
├── game/
│   ├── data.ts             # ALL content: zones, creatures, gyms, moves, NPCs, rival
│   ├── engine.ts           # Game loop: input, movement, camera, render, onDoorEnter
│   ├── tiles.ts            # 38 tile types + character sprites (procedural canvas)
│   ├── sprites.ts          # Mermander line + gym leaders (procedural canvas)
│   ├── landmarks.ts        # Landmark image renderer per zone
│   ├── interiors.ts        # ★ 10 interior tile maps + NPC positions
│   ├── world.ts            # Tile grid builder (6-tile path, dense route walls)
│   ├── pathfind.ts         # BFS click-to-walk
│   └── sprite-registry.ts  # Image cache + all PNG URL maps
├── lib/audio.ts            # Web Audio API: 10 unique zone BGMs + battle BGM + SFX
├── public/sprites/
│   ├── creatures/          # 9 zone creatures (flux/dev PNG) ✅
│   ├── leaders/            # 9 gym leaders (flux/dev PNG) ✅
│   ├── player/             # Mermander × 3 stages × 4 dirs + 6 battle sprites ✅
│   ├── landmarks/          # 10 zone building icons ✅
│   ├── banners/            # 10 zone arrival banners (wide cinematic) ✅
│   ├── battle/             # 10 battle arena backgrounds ✅
│   └── ui/                 # title_bg, champion_bg, pokeball, pokeball_hq ✅
├── generate_sprites_v2.mjs # Original: creatures, leaders, player, landmarks
└── generate_sprites_v3.mjs # New: UI art, banners, battle BGs
```

### Data flow
```
game/data.ts  →  ZONES[]  →  game/world.ts     →  TileCode[][]  →  engine render
                           →  allInteractives() →  NPCs / signs / badges / doors
                           →  game/engine.ts    →  canvas 2D game loop
```

---

## 🛠️ Dev Notes

### Adding a zone
1. Add to `Z[]` in `game/data.ts`
2. Add to `ZONE_IDS_IN_ORDER`
3. Drop `public/sprites/creatures/{id}.png` + `public/sprites/landmarks/{id}.png`
4. Add to `CREATURE_URL` + `LANDMARK_URL` in `game/sprite-registry.ts`
5. Add banner to `BANNER_URL` + battle BG to `BATTLE_BG_URL`

### Adding a tile type
1. Add to `T` in `game/tiles.ts`
2. Add `case T.MY_TILE:` to `drawTile()` — pass `now` for animations
3. Add to `SOLID` set if impassable
4. Place it in `game/world.ts`

### Sprite fallback chain
```
PNG from /public/sprites → if not loaded → procedural canvas art (always renders)
```

### Re-generating specific sprites
```bash
# Redo one banner
FAL_KEY=xxx node generate_sprites_v3.mjs --regen=sole --batch=B

# Redo one battle background
FAL_KEY=xxx node generate_sprites_v3.mjs --regen=ai --batch=C

# Preview mode (1 per batch)
FAL_KEY=xxx node generate_sprites_v3.mjs --batch=B --preview
```

---

## 📬 Contact

**param@catscandance.com** · [LinkedIn](https://linkedin.com/in/paramminhas) · [catscandance.com](https://catscandance.com)

> *"Fifteen years of building. One game to show for it."*
