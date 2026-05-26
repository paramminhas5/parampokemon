# PARAM QUEST 🎮

> **A playable portfolio. Fifteen years of building, told as a Pokémon RPG.**

Walk through 10 worlds. Talk to the people. Fight the gym leaders. Collect the badges.  
Each boss is a **real challenge Param actually faced**. Defeat them to earn the badge and read what he learned.

**Stack:** Next.js 15 · TypeScript · Canvas 2D · FAL.ai (SDXL sprites)

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

All sprites are AI-generated via **FAL.ai** (SDXL pixel art model).

```bash
# Generate all 40 sprites in 4 batches
FAL_KEY=your_key node generate_sprites_v2.mjs

# One batch at a time (recommended — verify before continuing)
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=creatures --model=sdxl
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=leaders   --model=sdxl
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=player    --model=sdxl
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=landmarks --model=sdxl

# Regenerate specific sprites
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=creatures --only=grp,fere --model=sdxl

# Models: sdxl (default, best pixel art) | sd15 (true pixel, slower) | flux (high quality)
```

**Fallback:** if any PNG fails to load, the engine renders procedural canvas pixel art from `game/sprites.ts` / `game/tiles.ts` — no blank spaces ever.

---

## ✅ What's Been Built

### Core game
- [x] Full overworld: 10 zones, themed route corridors, 80×300 tile world
- [x] Smooth tile movement — WASD, click-to-walk (A\*), touch swipe, D-pad
- [x] Cinematic camera lerp — **jitter-free** (Math.floor, single timestamp per frame)
- [x] 38 unique tile types — animated water, neon, crypto, pylon tiles (flicker-free)
- [x] Turn-based battle — type effectiveness, crits, miss, PP tracking
- [x] 3-stage evolution (Mermander → Mermalion → Merlord) with cutscene
- [x] Wild creature catch system
- [x] Skill berry system (NPCs teach battle moves)
- [x] Full NPC dialog with typewriter effect
- [x] Building doors — facing a door greets you with the zone's first NPC
- [x] Zone BGM (Web Audio API procedural), battle BGM + SFX
- [x] Save/load via localStorage

### UI / overlays
- [x] Title screen with Prof. Iterate intro
- [x] World Select + Warp transitions
- [x] Bag inventory (creatures, moves, badges)
- [x] World Map fast-travel
- [x] Zone cliff notes overlay
- [x] Battle intro cinematic + Victory moment
- [x] Evolution cutscene
- [x] Skill learn overlay
- [x] Champion card (final gym win)
- [x] Press wall, Contact modal
- [x] Touch D-pad (mobile)

### Sprites
- [x] 9 zone creatures (SDXL pixel art PNGs)
- [x] 9 gym leaders (SDXL pixel art PNGs)
- [x] 12 player sprites — Mermander/Mermalion/Merlord × 4 directions (SDXL PNGs)
- [x] 10 landmark sprites (SDXL PNGs)
- [x] Param player character — South Asian skin tone, dark hair, slim navy outfit

### Homepage & Resume
- [x] Homepage career zone cards — **expand on click** (cliff notes, metrics, gym boss, creature)
- [x] Resume experience entries — **expand on click** (extra bullets, learned quotes, metrics, gym leader)
- [x] Gym leaders strip
- [x] Selected press section

### World feel
- [x] One sign rule — only Pallet Town has a tutorial sign; all other zones use NPCs
- [x] 9 route themes (meadow, forest, stream, boulders, neon, mall, crypto, garden, skyline)
- [x] Zone-entry arch gates
- [x] Thematic props per zone (servers, racks, speakers, pylons, candlesticks, trophies)
- [x] Zone ambient particles, NPC idle bob, wild creature bob + "!" marker

---

## 🔜 Next Steps

### 🔴 High priority

#### 1. Building interiors
Right now doors greet you with the first NPC's dialog. The real fix is **actual interior rooms** — small 8×6 tile maps per building with walkable floor, desks, props, and an exit door.

```
Engine change: add currentInterior: string | null to GameState
New component: components/game/Interior.tsx
Transition: black fade in/out on door cross
```

| Zone | Interior theme |
|------|---------------|
| home | Cozy bedroom — CRT TV, guitar, records |
| origin | Workshop — drafting table, sketchbook |
| grp | Market office — price boards, catalog shelves |
| hab | Property office — lease papers, key hooks |
| ai | Server room — racks, AI terminal |
| investopad | Boardroom — long table, whiteboard |
| sole | Store back room — shoe boxes, racks |
| fere | Trading floor — crypto screens, agent terminals |
| ccd | Recording studio — mixing desk, mic stand, cat |
| iterate | Agency HQ — strategy boards, trophy wall |

#### 2. Richer zone layouts
- Increase zone width from 26 → 32 tiles (more room to breathe)
- Add a second building per zone (annex, shop, or house)
- Zone-specific ground details: river in Hab, neon roads in AI, vinyl circles in CCD
- Route NPCs mid-corridor saying one thematic line
- Route height 10 → 14 tiles (less cramped between zones)

#### 3. Sprite quality pass
The SDXL sprites are good but some lack the crisp GBA silhouette. Options:
- Re-run with `fal-ai/flux-lora` + `sWizad/pokemon-trainer-sprite-pixelart` LoRA (trigger: `pkspr`) — this is trained specifically on GBA sprites
- Post-process: downscale to 96×96 then upscale 4× with nearest-neighbour to force true pixel grid
- Hand-polish specific creatures in any pixel editor (Aseprite) — creatures, leaders are 512px so there's room

---

### 🟠 Medium priority

#### 4. Battle polish
- HP bar drain animation — currently snaps instantly, should drain over 500ms
- Show type badge + creature name above opponent HP bar
- Screen shake on SUPER EFFECTIVE hits (`transform: translateX` on the arena)
- Win fanfare: particle burst over the victory screen

#### 5. Pokédex in Bag
- In-game Pokédex tab inside the Bag overlay
- Shows caught creatures: sprite, name, type, power, description, zone found
- "???" for uncaught — gives the player a reason to explore

#### 6. Mobile controls polish
- D-pad redesign: larger hit targets, semi-transparent, thumb-zone positioning
- `navigator.vibrate(20)` haptic on each walk step
- Prevent accidental pinch-to-zoom during swipe-to-walk (`touch-action: none` on canvas)

---

### 🟡 Lower priority

#### 7. More NPC variety
- 3–4 NPCs per zone instead of 2
- Route trainer NPCs between zones (walk up to them, they say one line)
- Home zone: add a rival character (kid who challenges you as you leave Pallet Town)

#### 8. Audio depth
- Per-zone melody layer on top of existing bass/rhythm procedural BGM
- Tempo variation: early zones = slow, Iterate HQ = fast
- Distinct battle intro SFX per gym leader type

#### 9. Post-champion content
- After beating all 9 gyms: unlock a "Champion Route" north of Pallet Town
- Final NPC = Param himself, talking about what he's working on now
- Champion NPC opens ContactModal directly

#### 10. Homepage creature strip
- Hero background creatures: opacity 6% → 15%, add slow drift animation
- Each creature drifts at its own speed/phase using CSS animation

---

## 🏗️ Architecture

```
parampokemon/
├── app/
│   ├── page.tsx                          # Homepage (Server Component)
│   ├── play/page.tsx                     # Game entry → GameBoot → Game
│   └── resume/page.tsx                   # CV (Server Component)
├── components/
│   ├── home/CareerCard.tsx               # ★ Expand-on-click career card (client)
│   ├── resume/ExperienceEntry.tsx        # ★ Expand-on-click resume entry (client)
│   └── game/                             # All game overlays (client)
│       ├── Game.tsx                      # Root — state + modal orchestration
│       ├── Battle.tsx                    # Turn-based battle system
│       ├── BattleIntro.tsx / VictoryMoment.tsx
│       ├── Bag.tsx / StartMenu.tsx / WorldMap.tsx / WorldSelect.tsx
│       ├── CliffNotes.tsx / CatchModal.tsx / ContactModal.tsx / PressModal.tsx
│       ├── EvolutionCutscene.tsx / SkillLearnOverlay.tsx / ChampionCard.tsx
│       ├── TitleScreen.tsx / GameBoot.tsx
│       ├── TouchControls.tsx / TransitionOverlay.tsx / ZoneAmbience.tsx
│       └── DialogBox.tsx
├── game/
│   ├── data.ts           # ALL content: zones, creatures, gyms, moves, NPCs
│   ├── engine.ts         # Game loop: input, movement, camera, render
│   ├── tiles.ts          # 38 tile types + character sprites (procedural canvas)
│   ├── sprites.ts        # Mermander line + gym leaders (procedural canvas)
│   ├── landmarks.ts      # Landmark image renderer per zone
│   ├── world.ts          # Tile grid builder
│   ├── pathfind.ts       # A* click-to-walk
│   └── sprite-registry.ts # Image cache + PNG URL maps
├── lib/audio.ts          # Web Audio API: BGM + SFX
├── public/sprites/
│   ├── creatures/        # 9 zone creatures (SDXL PNG)
│   ├── leaders/          # 9 gym leaders (SDXL PNG)
│   ├── player/           # Mermander × Mermalion × Merlord × 4 dirs (SDXL PNG)
│   ├── landmarks/        # 10 zone building icons (SDXL PNG)
│   └── ui/               # Pokéball + UI
└── generate_sprites_v2.mjs  # FAL.ai batch sprite generator
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
4. Add URLs to `CREATURE_URL` + `LANDMARK_URL` in `game/sprite-registry.ts`

### Adding a tile type
1. Add to `T` in `game/tiles.ts`
2. Add `case T.MY_TILE:` to `drawTile()` — remember to accept and pass `now` for animations
3. Add to `SOLID` set if impassable
4. Place it in `game/world.ts`

### Sprite fallback chain
```
PNG from /public/sprites → if not loaded → procedural canvas art (always renders)
```

---

## 📬 Contact

**param@catscandance.com** · [LinkedIn](https://linkedin.com/in/paramminhas) · [catscandance.com](https://catscandance.com)

> *"Fifteen years of building. One game to show for it."*
