# PARAM QUEST 🎮

> **A playable portfolio. Fifteen years of building, told as a Pokémon RPG.**

Walk through 10 worlds. Talk to the people. Fight the gym leaders. Collect the badges.  
Each boss is a **real challenge Param actually faced**. Defeat them to earn the badge and read what he learned.

**Live at:** [paramminhas.com](https://paramminhas.com) · **Stack:** Next.js 15 · TypeScript · Canvas 2D · FAL.ai

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

The player's starter — a merman creature that evolves as Param earns more badges.

| Stage | Name | Badges Required | HP | Palette |
|-------|------|----------------|----|---------|
| Stage 1 | **Mermander** | 0 | 60 | Aqua cyan `#7ce0ff` |
| Stage 2 | **Mermalion** | 4 | 110 | Violet lavender `#c89af0` |
| Stage 3 | **Merlord** | 8 | 180 | Champion gold `#ffd24a` |

**In the overworld:** Param (a human character) walks the map; Mermander/Mermalion/Merlord follows one tile behind.  
**In battle:** You fight *as* Mermander — the creature is the RPG stand-in for Param's career power.

---

## 🎮 How to Play

| Control | Action |
|---------|--------|
| `ARROWS` / `WASD` | Walk |
| `TAP` / `CLICK` | Walk to + auto-talk |
| `SPACE` / `Z` / `ENTER` | Talk to NPCs |
| `ESC` / `X` | Menu |
| `MAP` button | Fast travel |
| `⚡ WARP` button | World Select |
| **GYM MAT** tile | Enter gym battle |
| **BAG** button | View creatures, moves, badges |

---

## 🏗️ Architecture

```
parampokemon/
├── app/
│   ├── page.tsx              # Homepage (marketing, career zones, press)
│   ├── play/page.tsx         # Game entry (GameBoot → Game)
│   └── resume/page.tsx       # Printable CV
├── components/game/
│   ├── Game.tsx              # Root game component — modal/state orchestration
│   ├── Battle.tsx            # Turn-based battle system
│   ├── BattleIntro.tsx       # Cinematic battle opener
│   ├── Bag.tsx               # Items / creatures / badges inventory
│   ├── CliffNotes.tsx        # Zone cliff notes overlay
│   ├── CatchModal.tsx        # Wild creature encounter
│   ├── ChampionCard.tsx      # Final victory screen
│   ├── ContactModal.tsx      # Contact form overlay
│   ├── DialogBox.tsx         # NPC / sign dialog
│   ├── EvolutionCutscene.tsx # Evolution animation
│   ├── GameBoot.tsx          # Sprite preloader + boot screen
│   ├── PressModal.tsx        # Press wall overlay
│   ├── SkillLearnOverlay.tsx # Skill berry discovery
│   ├── StartMenu.tsx         # Pause menu
│   ├── TitleScreen.tsx       # Opening title + Prof. Iterate intro
│   ├── TouchControls.tsx     # On-screen D-pad (mobile)
│   ├── TransitionOverlay.tsx # Zone warp / battle fade
│   ├── VictoryMoment.tsx     # Gym win celebration
│   ├── WorldMap.tsx          # Fast-travel timeline map
│   ├── WorldSelect.tsx       # Zone selection screen
│   └── ZoneAmbience.tsx      # Per-zone ambient overlay
├── game/
│   ├── data.ts               # ALL game content: zones, creatures, gyms, moves, NPCs
│   ├── engine.ts             # Core game loop: input, movement, camera, render
│   ├── landmarks.ts          # Landmark sprite renderer per zone
│   ├── pathfind.ts           # A* click-to-walk pathfinding
│   ├── sprite-registry.ts    # Image cache + URL maps for all sprites
│   ├── sprites.ts            # Procedural pixel art: Mermander line + gym leaders
│   ├── tiles.ts              # Procedural tile drawing: 38 tile types + characters
│   └── world.ts              # Tile grid builder: zones, routes, buildings, props
├── lib/
│   └── audio.ts              # Web Audio API: BGM, SFX, zone music
└── public/sprites/
    ├── creatures/            # 9 zone creatures (PNG + SVG)
    ├── leaders/              # 9 gym leaders (PNG + SVG)
    ├── landmarks/            # 10 zone landmarks (PNG + SVG)
    ├── player/               # Mermander/Mermalion/Merlord × 4 dirs (PNG + SVG)
    └── ui/                   # Pokéball, UI elements
```

### Key Data Flow

```
game/data.ts  →  ZONES[]  →  game/world.ts  →  TileCode[][]
                          →  game/engine.ts  →  canvas render
                          →  allInteractives()  →  NPCs, signs, badges, doors
```

---

## 🎨 Sprite Pipeline

All sprites are generated via **FAL.ai** using `fal-ai/flux-lora` with a dedicated Pokémon pixel art LoRA.

### Regenerate sprites

```bash
FAL_KEY=your_key node generate_sprites_v2.mjs
```

The script generates:
- **9 creature sprites** — zone-specific wild Pokémon  
- **9 gym leader sprites** — boss characters  
- **12 player sprites** — Mermander/Mermalion/Merlord × 4 directions  
- **10 landmark sprites** — zone building overworld icons  
- **1 Pokéball UI sprite**

**Model:** `fal-ai/flux-lora` with `fal-ai/flux-lora/trained` LoRA weights tuned for GBA-era Pokémon sprites (96×96 pixel art, transparent background, crisp outlines).

### Sprite fallback system

If a sprite fails to load, the engine falls back to **procedural canvas art** defined in `game/sprites.ts` and `game/tiles.ts`. This means the game always looks complete even without FAL-generated assets.

---

## 🚀 Running Locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

**Requirements:** Node 18+, Next.js 15

---

## 📋 Current State — What Works

- [x] Full overworld: 10 zones, routes between them, 80×300 tile world
- [x] Smooth tile-based movement (WASD, click-to-walk, touch swipe, D-pad)
- [x] A* pathfinding for click-to-walk
- [x] Camera lerp (cinematic smooth follow)
- [x] 38 unique tile types with procedural pixel art
- [x] 9 zone-specific route themes (meadow, forest, stream, boulders, neon, mall, crypto, garden, skyline)
- [x] Zone-entry arch gates
- [x] Thematic props per zone (servers, racks, speakers, pylons, candlesticks, trophies)
- [x] Buildings with roof colors, door, gym mat
- [x] Turn-based battle system (type effectiveness, crits, miss, PP)
- [x] 3-stage evolution (Mermander → Mermalion → Merlord)
- [x] Evolution cutscene animation
- [x] Battle intro cinematic
- [x] Victory moment overlay
- [x] Wild creature catch system
- [x] Skill berry system (zone NPCs teach moves)
- [x] Full NPC dialog with typewriter effect
- [x] Start menu, Bag inventory, World Map fast-travel
- [x] Zone cliff notes (era, did, learned, metrics)
- [x] Champion card (final gym win)
- [x] Press wall overlay
- [x] Contact modal
- [x] localStorage save/load
- [x] Zone BGM system (Web Audio API procedural)
- [x] Battle BGM + SFX
- [x] Touch controls (D-pad overlay)
- [x] Responsive (mobile, tablet, desktop)
- [x] Title screen with Prof. Iterate intro
- [x] World Select + Warp transitions
- [x] Homepage with career zones, gym leaders strip, press
- [x] Resume/CV page

---

## 🔧 Known Issues

| Issue | Severity | Root Cause |
|-------|----------|-----------|
| **Screen jitter** | High | Double `Math.round()` on camera lerp + player pixel pos — independent rounding causes 1px jumps each frame |
| **SVG sprites look bad** | High | FAL schnell model generated with weak pixel art prompts; new `flux-lora` + pixel LoRA needed |
| **Buildings not enterable** | Medium | Door tile triggers gym battle only; no interior room system |
| **Too many signs** | Medium | Every zone has an auto-trigger sign; should be one sign in starting town only |
| **Worlds feel sparse** | Medium | Zone dimensions and prop density need tuning |
| **Resume not interactive** | Low | Career cards are static; no expand/collapse |

---

## 🗺️ Planned Improvements — Next Steps

### 🔴 Priority 1 — Fix Core Bugs

#### 1.1 Jitter Fix (`game/engine.ts`, `game/tiles.ts`)
- **Problem:** `offX = Math.round(-camXSmooth * TILE)` and `pbx = Math.round(state.px * TILE) + offX` both round independently → 1px staircase jitter every frame
- **Fix:** Compute one `subPixelOffX/Y` float, then render all world elements with `Math.floor()` consistently. Player position uses `state.px * TILE + offX` without extra rounding
- **Impact:** Entire game becomes butter-smooth

#### 1.2 Water/Neon Tile Flicker (`game/tiles.ts`)
- **Problem:** Animated tiles call `performance.now()` mid-draw; each tile gets a different timestamp in the same frame
- **Fix:** Pass `now` as a parameter to `drawTile()`, computed once per frame before the tile loop

---

### 🟠 Priority 2 — Interior Buildings

#### 2.1 Building Interiors (`game/engine.ts`, new `components/game/Interior.tsx`)
- Each building gets a small interior tile map (8×6 tiles)
- Interior contains: desk/props relevant to zone, 1–2 NPCs, walkable floor, exit door at south
- Transition: black fade in/out when entering/exiting
- Engine tracks `currentInterior: string | null` state
- Gym buildings keep their existing battle trigger via mat tile *outside*
- Non-gym buildings currently do nothing on door approach — interiors fix this

#### Interior layouts per zone
| Zone | Interior Theme | Props |
|------|---------------|-------|
| home | Cozy bedroom | CRT TV, bed, guitar |
| origin | Workshop | Desk, drafting table, sketchbook |
| grp | Market office | Price boards, catalog shelves |
| hab | Property office | Lease papers, key hooks, calendar |
| ai | Server room | Racks, screens, AI terminal |
| investopad | Boardroom | Long table, chairs, whiteboard |
| sole | Store back room | Shoe boxes, display racks, hangers |
| fere | Trading floor | Crypto screens, agent terminals |
| ccd | Recording studio | Mixing desk, mic stand, cat beds |
| iterate | Agency HQ | Strategy boards, macbooks, trophy |

---

### 🟡 Priority 3 — Richer World Design

#### 3.1 One Sign Rule
- Remove auto-trigger signs from all zones except `home`
- Home sign: brief intro to controls only
- NPCs carry all narrative weight — they already have rich dialog

#### 3.2 Denser Zone Layouts
- Increase zone width from 26 to 32 tiles
- Add second building per zone (a secondary structure — shop, annex, house)
- More prop variety: benches, lampposts, market stalls, vending machines
- Zone-specific ground details: water ponds in Hab, neon roads in AI, vinyl circles on ground in CCD

#### 3.3 Better Route Corridors
- Increase route height from 10 to 14 tiles
- Route NPCs (trainers who say something relevant)
- Rest benches mid-route
- Seasonal tone: early zones feel warm/day, later zones feel night/cold

---

### 🟢 Priority 4 — Sprite Quality

#### 4.1 Better FAL Generation (this sprint)
- Switch from `fal-ai/flux/schnell` to `fal-ai/flux-lora` + Pokémon pixel art LoRA
- LoRA: `https://huggingface.co/sWizad/pokemon-trainer-sprite-pixelart` (trained on 96×96 GBA sprites)
- Size: 256×256 (optimal for pixel art — large enough for detail, keeps true pixel feel)
- All sprites regenerated with new prompts calibrated to the LoRA trigger words

#### 4.2 Param as Human Overworld Character
- `drawCharacter("player")` redesigned: dark hair, Param's signature red/black outfit
- Proper 4-direction walk cycle (2 frames per direction)
- Param sprite: human. Mermander: the Pokémon follower behind him
- Battle: fight as Mermander (back view). Overworld: walk as Param (human front)

#### 4.3 Mermander Line Redesign
- Better proportions at 16px overworld scale
- More recognisably Pokémon — chubby silhouette, large eyes, clear colour blocks
- Merlord should feel like a final-form champion (bigger, more detail, intimidating)

---

### 🔵 Priority 5 — Homepage & Resume Polish

#### 5.1 Expand-on-Click Career Cards
- Each career zone card on homepage becomes interactive
- Collapsed: org name, role, years, one-line outcome
- Expanded (click to toggle): bullet points, cliff notes ("what I learned"), metrics, creature sprite, gym leader thumbnail
- Smooth CSS `max-height` transition
- Needs `"use client"` wrapper component

#### 5.2 Resume Expand-on-Click (same treatment)
- Mirror the homepage card behaviour on `/resume`

#### 5.3 Homepage Creature Strip
- Currently 6% opacity ghost sprites in hero background
- Increase to 15% and animate: slow horizontal drift
- Each creature has its own drift speed/phase

---

### ⚪ Priority 6 — Audio & Polish

#### 6.1 Better Zone BGM
- Current Web Audio API procedural music is functional but thin
- Add per-zone melody layers (lead synth on top of existing bass/rhythm)
- Different tempo per zone: home = slow pastoral, iterate = fast driving

#### 6.2 Battle Polish
- Show opponent's creature name + type badge above HP bar
- HP bar drain animation (current transition is instant)
- Screen shake on SUPER EFFECTIVE hits (CSS transform on arena)
- Win fanfare: brief confetti particle burst over victory screen

#### 6.3 Mobile Controls
- D-pad redesign: larger, more transparent, positioned better for thumb reach
- Haptic feedback on walk step (navigator.vibrate)
- Pinch-to-zoom disabled (prevent accidental zoom during swipe-to-walk)

---

### ⚫ Priority 7 — Content & Narrative

#### 7.1 More NPC Variety
- Each zone currently has 2 NPCs — increase to 3–4
- Add "trainer" NPCs mid-route who say one relevant quote
- Home zone: add a rival character

#### 7.2 Pokédex / Creature Dex
- In-game Pokédex accessible from Bag
- Each caught creature shows: sprite, name, type, power, description, zone found
- "Flavour text" from `creature.description` field

#### 7.3 Post-Champion Content
- After beating all 9 gyms: unlock "Champion Route" north of home town
- Param's current project as the final NPC conversation
- Champion NPC offers to contact Param directly (opens ContactModal)

---

## 🛠️ Development Notes

### Adding a new Zone
1. Add zone object to `Z[]` in `game/data.ts` with all required fields
2. Add zone to `ZONE_IDS_IN_ORDER` array
3. Add creature sprite to `public/sprites/creatures/{id}.png`
4. Add landmark sprite to `public/sprites/landmarks/{id}.png`
5. Add creature URL to `CREATURE_URL` in `game/sprite-registry.ts`
6. Add landmark URL to `LANDMARK_URL` in `game/sprite-registry.ts`
7. If gym leader: add leader sprite + entry to `LEADER_URL`

### Adding a new Tile Type
1. Add constant to `T` object in `game/tiles.ts`
2. Add draw case to `drawTile()` switch
3. If solid: add to `SOLID` set
4. Place via `game/world.ts` in appropriate builder function

### Sprite Fallback Chain
```
1. Load PNG/SVG from /public/sprites/{category}/{id}.png
2. If !isReady(img) → use procedural canvas art from game/sprites.ts or game/tiles.ts
3. Procedural art always renders — no blank spaces ever
```

---

## 🏆 Credits

- **Param Minhas** — concept, content, game design, career data
- **Next.js + Vercel** — hosting & framework
- **FAL.ai** — AI sprite generation (`fal-ai/flux-lora`)
- **sWizad/pokemon-trainer-sprite-pixelart** — pixel art LoRA weights
- **Canvas 2D API** — procedural tile/sprite rendering fallback
- Web Audio API — generative music system

---

## 📬 Contact

**param@catscandance.com** · [LinkedIn](https://www.linkedin.com/in/paramminhas/) · [catscandance.com](https://catscandance.com)

> *"Fifteen years of building. One game to show for it."*
