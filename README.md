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
- [x] Building doors trigger first NPC dialog
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

#### 1. Building Interiors
**The biggest missing depth feature.** Doors currently trigger first NPC dialog. Real fix: actual interior tile maps per building.

```
Engine: add currentInterior: string | null to GameState
New file: game/interiors.ts — 10 interior tile maps + NPC positions
New component: components/game/Interior.tsx
Transition: black fade in/out on door cross
Exit tile returns to overworld
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

> All tiles already exist — no new sprites needed for MVP interiors. Optional: generate interior art with `generate_sprites_v3.mjs --batch=D` (not yet written).

#### 2. Pokédex Tab in Bag
Existing Creatures tab is a basic grid. Should be a proper Pokédex entry:
- Large sprite + name + type pill + power bar
- Zone found, flavor description  
- Silhouette + "???" for uncaught
- Gives players a reason to explore all zones

#### 3. Rival NPC at Home
- Character blocking path south of player spawn
- Dialog challenge before player can leave Pallet Town
- One-time gate — steps aside after talking
- Adds narrative tension to the opening

---

### 🟠 Medium Priority

#### 4. Per-Zone Unique BGM
Currently ground type determines BGM — two grass zones sound identical.
- Add `bgmId` per zone in `data.ts`  
- Add 3 new unique melody layers in `audio.ts`
- Each zone gets its own 16-step melody on top of the base track
- Fades in on zone enter

#### 5. Route NPCs
- 1 NPC per route corridor (9 total)
- Position: middle of route, beside the path
- One thematic flavor line each
- Makes empty corridors feel alive

#### 6. More NPCs Per Zone
- Currently 2 per zone — feels sparse
- Add 1–2 more per zone (fan, client, engineer)
- Rich enough to feel like a real world

#### 7. Mobile Polish
- D-pad: larger hit targets, better thumb-zone positioning
- `navigator.vibrate(20)` haptic on step
- `touch-action: none` on canvas prevents accidental pinch-to-zoom

---

### 🟡 Lower Priority

#### 8. Post-Champion Content
- Unlock "Champion Route" north of Pallet Town after beating all 9 gyms
- Final NPC = Param himself, talking about what he's building now
- Champion NPC triggers ContactModal directly

#### 9. Homepage Creature Strip
- Creature opacity: 6% → 15%
- Add `@keyframes creature-drift` with slow float per creature
- Each has unique phase offset

#### 10. OG Image
- `/public/og.png` referenced in layout but doesn't exist
- Generate: game title, Merlord sprite, zone mosaic, "A playable portfolio" tagline
- Can be done with FAL or a simple canvas script

#### 11. Press Wall Warppad
- `warppad.png` exists but isn't rendered as a distinct tile
- Wire as visual tile at press wall positions (currently uses BADGE tile)

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
│       ├── BattleIntro.tsx / VictoryMoment.tsx
│       ├── Bag.tsx / StartMenu.tsx / WorldMap.tsx / WorldSelect.tsx
│       ├── CliffNotes.tsx / CatchModal.tsx / ContactModal.tsx / PressModal.tsx
│       ├── EvolutionCutscene.tsx / SkillLearnOverlay.tsx / ChampionCard.tsx
│       ├── TitleScreen.tsx / GameBoot.tsx
│       ├── TouchControls.tsx / TransitionOverlay.tsx / ZoneAmbience.tsx
│       └── DialogBox.tsx
├── game/
│   ├── data.ts             # ALL content: zones, creatures, gyms, moves, NPCs
│   ├── engine.ts           # Game loop: input, movement, camera, render
│   ├── tiles.ts            # 38 tile types + character sprites (procedural canvas)
│   ├── sprites.ts          # Mermander line + gym leaders (procedural canvas)
│   ├── landmarks.ts        # Landmark image renderer per zone
│   ├── world.ts            # Tile grid builder (6-tile path, dense route walls)
│   ├── pathfind.ts         # BFS click-to-walk
│   └── sprite-registry.ts  # Image cache + all PNG URL maps
├── lib/audio.ts            # Web Audio API: 10 BGM tracks + SFX (zero audio files)
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
