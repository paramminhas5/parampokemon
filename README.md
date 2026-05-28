# PARAM QUEST 🎮

> **A playable portfolio. Fifteen years of building, told as a Pokémon RPG.**

Walk through 10 worlds. Talk to the people. Fight the gym leaders. Collect the badges.  
Each boss is a **real challenge Param actually faced**. Defeat them to earn the badge and read what he learned.

**Stack:** Next.js 15 · TypeScript · Canvas 2D · Web Audio API · FAL.ai (flux/dev sprites)

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

| Stage | Name | Badges needed | HP | Colour |
|-------|------|---------------|----|--------|
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

### v2 — Creatures, Leaders, Player, Landmarks ✅

```bash
FAL_KEY=your_key node generate_sprites_v2.mjs

# One batch at a time (recommended)
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=creatures
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=leaders
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=player
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=landmarks

# Regenerate specific sprites
FAL_KEY=your_key node generate_sprites_v2.mjs --batch=creatures --only=grp,fere
```

### v3 — UI art, Zone Banners, Battle Backgrounds ✅

```bash
FAL_KEY=your_key node generate_sprites_v3.mjs            # all batches
FAL_KEY=your_key node generate_sprites_v3.mjs --batch=A  # UI/title art (3 imgs)
FAL_KEY=your_key node generate_sprites_v3.mjs --batch=B  # zone arrival banners (10 imgs)
FAL_KEY=your_key node generate_sprites_v3.mjs --batch=C  # battle backgrounds (10 imgs)
FAL_KEY=your_key node generate_sprites_v3.mjs --preview  # 1 per batch for approval
FAL_KEY=your_key node generate_sprites_v3.mjs --regen=title_bg --batch=A
```

**Fallback:** if any PNG fails to load, the engine renders procedural canvas pixel art from `game/sprites.ts` / `game/tiles.ts` — no blank spaces ever.

---

## ✅ Current State — What's Built and Working

### Core gameplay loop
- [x] Full overworld: 10 zones, 9 themed route corridors, 80×310 tile world
- [x] Smooth tile movement — WASD, click-to-walk (BFS), touch swipe, D-pad
- [x] Cinematic camera lerp — jitter-free sub-pixel smooth
- [x] 38 unique tile types — animated water, neon, crypto, pylon, candlestick tiles
- [x] **6-tile-wide linear path** — dense tree walls flank all corridors, one clear direction
- [x] Zone-entry arch gates span full 6-tile path
- [x] 9 route themes with thematic decorations scattered on-path

### Battle
- [x] Turn-based battle — type effectiveness (2×/0.5×), crits, miss, PP tracking
- [x] 8 move slots in battle (4 base + up to 4 skill berries visible at once)
- [x] Gym leader PNG portrait shown in opponent HP card during battle
- [x] Player pokemon PNG thumbnail shown in player HP card during battle
- [x] Zone-specific battle backgrounds (PNG canvas layer)
- [x] HP drain counter animation + shake + SUPER EFFECTIVE / CRITICAL HIT pop
- [x] Battle intro cinematic + Victory moment overlay
- [x] Flee button — costs no badges

### Narrative & characters
- [x] 3-stage evolution (Mermander → Mermalion → Merlord) with full cutscene
- [x] Wild creature catch system with pokéball animation
- [x] Skill berry system — NPCs teach moves, shown in BAG and usable in battle
- [x] 9 gym leaders, each with 4 real moves + intro/victory/defeat dialog
- [x] 3–4 NPCs per zone (investors, fans, clients, tenants, co-founders)
- [x] 9 route NPCs — one per corridor between zones, thematic flavor quotes
- [x] Rival NPC at home zone south of spawn
- [x] NPC dialog typewriter effect + portrait icons

### Visuals & cinematics
- [x] Title screen — `title_bg.png` cinematic background
- [x] Zone arrival cinematic (`ZoneTitle.tsx`) — full-screen 2.6s banner, accent particles, scanline. Fires on **first visit only** (fixed).
- [x] CliffNotes panel — fires on **first visit only** (fixed)
- [x] Champion card — `champion_bg.png` gold hall background on full completion
- [x] World Select galaxy view — SVG nodes, nebula, shooting stars, connection lines
- [x] Evolution cutscene — shake → flash → new sprite, sparkles, rings
- [x] Skill learn overlay — full-screen berry orb, type badge, sparkles
- [x] CatchModal, CliffNotes, ContactModal, PressModal

### Inventory & Pokédex
- [x] **Bag — Mermander tab**: real PNG sprite (with canvas fallback); evolution strip with all 3 follower PNGs + glow on current stage
- [x] **Bag — Pokédex tab**: two-panel layout, large sprite, type pill, power bar, description, zone hint; silhouettes for uncaught
- [x] Bag — Berries + Badges tabs
- [x] StartMenu trainer card: real Mermander/Mermalion/Merlord PNG; evolution strip with follower PNGs
- [x] Badge count shows X/9 (gym zones only) consistently across HUD, StartMenu, WorldMap

### World map
- [x] WorldMap: defeated zones now show **gym leader PNG thumbnail** (★ badge overlay)
- [x] WorldMap + WorldSelect fast-travel warp to any zone

### Building interiors
- [x] Every door opens a real 12×9 tile room — themed floor, props, 1 NPC, exit door
- [x] WASD movement inside, fade transitions in/out, themed per zone

### Audio (100% synthesized — zero files)
- [x] 10 unique zone BGMs (distinct melody per zone, not just by ground type)
- [x] Battle BGM + 10 SFX (step, hit, super, crit, victory, badge, catch, faint, menu, warp)
- [x] Fade in/out on transitions, mute toggle, localStorage persistence

### Sprites (all wired, all rendering)
- [x] 9 zone creatures (`/sprites/creatures/`)
- [x] 9 gym leaders (`/sprites/leaders/`) — visible in battle, WorldMap, BattleIntro, VictoryMoment
- [x] 12 player overworld sprites — Mermander/Mermalion/Merlord × 4 directions
- [x] 6 battle sprites — Mermander/Mermalion/Merlord × battle_back + battle_front — visible in battle arena, Bag, StartMenu
- [x] 4 Param player sprites — front/back/left/right
- [x] 10 landmark sprites (`/sprites/landmarks/`)
- [x] 10 zone arrival banners (`/sprites/banners/`)
- [x] 10 battle arena backgrounds (`/sprites/battle/`)
- [x] UI art: `title_bg.png`, `champion_bg.png`, `pokeball_hq.png`

### Save system
- [x] Full localStorage save/load — badges, creatures, skills, defeated gyms, visited zones
- [x] Player stage (Mermander/Mermalion/Merlord) correctly restores on reload (fixed)

---

## 🔜 Next Steps

### Sprint 1 — World Polish (zone by zone) 🏃

The path works, all zones are reachable, sprites are wired. The next quality lift is making **each zone feel truly unique and beautiful** — right now zones vary by floor tile and props but share the same building shape and layout structure.

**Do these world by world — finish one, approve, move to next.**

#### 1A. Zone layout redesign (world.ts + data.ts)
Each zone currently has a single building centred on a fixed grid. Goal: give each zone a **distinct spatial layout** that matches its real-world vibe.

| Zone | Target layout feel |
|------|--------------------|
| Home (Pallet Town) | Cozy: cottage top-left, Professor's lab top-right, garden path in between |
| Origin Town | Open workshop: drafting tables scattered, wide open floor |
| GRP Market | Marketplace grid: stalls flanking a central aisle, price board signs |
| Hab District | Courtyard apartments: two buildings facing each other, garden center |
| Quartic Lab | Server room L-shape: building fills left half, neon-lit open floor right |
| Investopad Tower | Tall tower center-stage, trophy wings left/right |
| SoleSearch Mall | Wide mall building top, sneaker racks as a second row of structures |
| Fere District | Trading floor right, candlestick forest left |
| Cats Can Dance | Studio top-left, speakers + record crates scattered across floor |
| Iterate HQ | Trophy wall right, strategy board left, champion archway center |

**Files:** `game/data.ts` (building x/y/w/h/doorX per zone), `game/world.ts` (prop density + border style)

#### 1B. Zone photo / banner quality check
Some zone arrival banners (`/sprites/banners/*.png`) may be thematically inconsistent with the zone identity. Audit each one and note which to regenerate:
```bash
# Regenerate specific banners
FAL_KEY=xxx node generate_sprites_v3.mjs --regen=home,grp,hab --batch=B
```

#### 1C. Gym size — make them smaller
Gyms are currently the same 26×20 tile zone as everywhere else. The gym building (`building.h`) is too large and the arena floor is padded. Reduce buildings to:
- `w: 8–10, h: 5–6` for most zones (currently 8–12 wide, 6–10 tall)
- Keep the MAT tile one tile south of the door — this is the battle trigger

---

### Sprint 2 — Narrative Closer 📖

#### 2A. Post-champion route
After beating all 9 gyms, the game currently just shows the Champion Card and stops. Close the loop:
- Short "Champion Route" — a small area north of Pallet Town, gated by all 9 badges
- Final NPC is Param himself, talking about what he's building right now
- Dialog ends with a button that opens `ContactModal` directly — the best possible CTA
- **Files:** `game/data.ts` (add champion zone), `game/engine.ts` (gate logic), `game/world.ts`

#### 2B. Rival return scene
The Rival at Home says *"when you come back with badges, I want to see them"* — but nothing happens when you do. Add a post-win return dialog: if `badges.size >= 9` and player walks to Rival's position, show a special "you did it" quote.
- **File:** `game/engine.ts` (condition check on autoInteractNear), `game/data.ts` (second quote on Rival NPC)

---

### Sprint 3 — Mobile & Feel 📱

#### 3A. Touch controls polish
- D-pad hit targets: minimum 54px (currently ~38px)
- Move D-pad lower on screen to the thumb zone
- `navigator.vibrate(20)` on each walk step
- `touch-action: none` on canvas to prevent pinch-to-zoom interrupting swipe walk

#### 3B. Homepage creature strip
- Increase creature opacity: 6% → 15%
- Add `@keyframes creature-drift` — slow independent float per creature (unique phase + speed so they never sync)
- **File:** `components/home/CareerCard.tsx`

---

### Sprint 4 — Assets & Polish 🎨

#### 4A. OG image
`/public/og.png` is referenced in `app/layout.tsx` but missing — every social share shows a blank card.
- **Content:** game title + Merlord sprite + zone mosaic + "A playable portfolio" tagline
- **Size:** 1200×630
- Can be generated with FAL or a simple canvas script

#### 4B. Interior art (Batch D)
Interiors currently use procedural tile rendering. For a premium feel, generate 10 room background PNGs and render them as a base canvas layer:
```bash
FAL_KEY=xxx node generate_sprites_v3.mjs --batch=D  # 10 top-down interior room PNGs
```
Then in `Interior.tsx`, draw the PNG before the tile layer — same pattern as battle backgrounds.

#### 4C. Press wall warppad tile
`public/sprites/ui/warppad.png` exists but isn't wired. Currently press walls use the BADGE tile visually.
- Add `WARP_PAD` to `T` in `tiles.ts`, draw the PNG on it
- Place at `zone.pressWall` coords in `world.ts`
- **Files:** `game/tiles.ts`, `game/world.ts`, `game/sprite-registry.ts`

#### 4D. Creature sprite quality pass
Some v2 creatures from early mixed-model runs lack crisp GBA silhouettes.
```bash
FAL_KEY=xxx node generate_sprites_v2.mjs --batch=creatures --only=iterate,origin
```

---

## 📊 Completion Status

| Area | Status |
|------|--------|
| Core gameplay loop | ✅ Complete |
| All 10 zones + routes reachable | ✅ Fixed |
| Building interiors (10 rooms) | ✅ Complete |
| Battle system + backgrounds | ✅ Complete |
| All sprites wired everywhere | ✅ Fixed |
| Zone arrival cinematics (first visit only) | ✅ Fixed |
| Player stage restore on reload | ✅ Fixed |
| Gym leader PNG in battle | ✅ Fixed |
| Player pokemon PNG in BAG + StartMenu | ✅ Fixed |
| Badge count consistency (X/9) | ✅ Fixed |
| Press modal wiring | ✅ Fixed |
| Battle move slots (8 visible) | ✅ Fixed |
| Zone layout redesign (world by world) | 🔜 Sprint 1 |
| Zone banner quality audit | 🔜 Sprint 1 |
| Gym building size reduction | 🔜 Sprint 1 |
| Post-champion narrative closer | 🔜 Sprint 2 |
| Rival return scene | 🔜 Sprint 2 |
| Mobile touch polish | 🔜 Sprint 3 |
| Homepage creature drift | 🔜 Sprint 3 |
| OG image | 🔜 Sprint 4 |
| Interior art (Batch D) | 🔜 Sprint 4 |
| Press wall warppad tile | 🔜 Sprint 4 |

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
│       ├── Battle.tsx                    # Turn-based battle (+ battle BG, leader PNG)
│       ├── ZoneTitle.tsx                 # Zone arrival cinematic (first visit only)
│       ├── Interior.tsx                  # Building interior renderer
│       ├── BattleIntro.tsx               # Pre-battle leader slide-in cinematic
│       ├── VictoryMoment.tsx             # Post-win overlay + badge award
│       ├── Bag.tsx                       # Inventory — Mermander PNG, Pokédex, Berries, Badges
│       ├── StartMenu.tsx                 # Trainer card with PNG sprites
│       ├── WorldMap.tsx                  # Timeline fast-travel + leader PNG on defeated zones
│       ├── WorldSelect.tsx               # Galaxy view fast-travel
│       ├── CliffNotes.tsx / CatchModal.tsx / ContactModal.tsx / PressModal.tsx
│       ├── EvolutionCutscene.tsx / SkillLearnOverlay.tsx / ChampionCard.tsx
│       ├── TitleScreen.tsx / GameBoot.tsx
│       ├── TouchControls.tsx / TransitionOverlay.tsx / ZoneAmbience.tsx
│       └── DialogBox.tsx
├── game/
│   ├── data.ts             # ALL content: zones, creatures, gyms, moves, NPCs
│   ├── engine.ts           # Game loop: input, movement, camera, render
│   ├── tiles.ts            # 38 tile types + procedural canvas drawing
│   ├── sprites.ts          # Mermander line + gym leaders (procedural fallback)
│   ├── landmarks.ts        # Landmark image renderer per zone
│   ├── interiors.ts        # 10 interior tile maps + NPC positions
│   ├── world.ts            # Tile grid builder
│   ├── pathfind.ts         # BFS click-to-walk
│   └── sprite-registry.ts  # Image cache + all PNG URL maps
├── lib/audio.ts            # Web Audio API: 10 unique zone BGMs + battle BGM + SFX
├── public/sprites/
│   ├── creatures/          # 9 zone creatures ✅
│   ├── leaders/            # 9 gym leaders ✅ (wired in battle, WorldMap, BattleIntro)
│   ├── player/             # Mermander × 3 stages × 4 dirs + 6 battle sprites ✅
│   ├── landmarks/          # 10 zone building icons ✅
│   ├── banners/            # 10 zone arrival banners ✅
│   ├── battle/             # 10 battle arena backgrounds ✅
│   └── ui/                 # title_bg, champion_bg, pokeball, pokeball_hq ✅
├── generate_sprites_v2.mjs # Original: creatures, leaders, player, landmarks
└── generate_sprites_v3.mjs # v3: UI art, banners, battle BGs
```

### Data flow
```
game/data.ts  →  ZONES[]  →  game/world.ts     →  TileCode[][]  →  engine render
                           →  allInteractives() →  NPCs / signs / badges / doors / pressWalls
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
6. Add interior map to `game/interiors.ts`

### Adding a tile type
1. Add to `T` in `game/tiles.ts`
2. Add `case T.MY_TILE:` to `drawTile()` — pass `now` for animations
3. Add to `SOLID` set if impassable
4. Place it in `game/world.ts`

### Sprite fallback chain
```
PNG from /public/sprites/ → if not loaded → procedural canvas art (always renders)
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
