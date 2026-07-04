# CAREER QUEST

> A playable portfolio RPG — 15 years of Param Minhas's career told as a premium indie Pokemon-style game.

Built on **Next.js 15 · TypeScript · Canvas 2D · Web Audio API · Bria AI sprites**

[Play Now](https://parampokemon.vercel.app/play) · [Homepage](https://parampokemon.vercel.app)

---

## Overview

Career Quest is a full Pokemon-style RPG where each zone represents a chapter of a 15-year career in tech, startups, and creative industries. Players explore 10 themed zones, battle gym leaders representing real challenges, collect creatures and skills, and discover the story through NPC dialog and CliffNotes.

**This is not a portfolio hack.** It's a complete indie game with:
- 10 explorable zones with unique themes, tiles, and ambient music
- 9 gym leader battles with AI-driven move selection and type effectiveness
- 9 route trainer battles with progressive difficulty
- Full evolution system (Mermander → Mermalion → Merlord)
- Building interiors with NPCs and dialog
- Cinematic zone arrival cards
- Synthesized audio (zero audio files — all Web Audio API)
- Save/load system with localStorage persistence
- Mobile touch controls with haptic feedback
- Achievement system with 20 milestones
- High-contrast accessibility mode

---

## Game Features

### World & Overworld
- 10 zones (Home + 9 career zones), 80×300 tile world, linear south-flow layout
- 38 unique tile types — animated water, neon, crypto, candlestick, pylon tiles
- 9 themed route corridors (meadow, forest, stream, boulders, neon, mall, crypto, garden, skyline)
- Smooth camera with lerp, click-to-walk BFS pathfinding, WASD/arrows/touch/scroll input
- Zone ambient particles, NPC idle bob, wild creature markers
- Building interiors (10 unique maps with themed props and NPCs)
- All badges/orbs auto-collectible on proximity (no blocking walls)
- Wild creatures walkable (auto-trigger encounter on proximity)

### Battle System
- Turn-based battles with type effectiveness (2x/0.5x), crits (18%), miss, PP tracking
- Animated HP drain (500ms countdown with sound ticks)
- Floating damage numbers, attack VFX particles per type
- Status effects (burn, shield, haste)
- Leader AI with personality-driven move selection per gym leader
- Phase 2 mechanic for final boss (StatusQuo revives at 60% HP)
- 9 route trainer battles with progressive difficulty
- Distinct haptic feedback patterns for mobile (steps, hits, badges, gym entry)

### Narrative & UI
- Title screen with Prof. Iterate intro
- BattleIntro cinematic (2.8s, leader slides in, VS badge, quote)
- VictoryMoment overlay with badge pop and sparkles
- Evolution cutscene (shake → flash → new sprite)
- SkillLearnOverlay with type badge and sparkle effects
- CatchModal (mini-battle with pokeball animation)
- CliffNotes panel (era, DID, LEARNED, metrics per zone)
- ChampionCard (final stats + share buttons)
- WorldSelect galaxy view with nebula and shooting stars
- WorldMap fast-travel timeline
- Bag inventory (Mermander stats, Pokedex, Berries, Badges)
- StartMenu (Trainer, Badges, People, Contact)
- Zone arrival title cards with banner backgrounds
- Achievement system with 20 milestones (explore/battle/collect/special)
- Save confidence indicator ("✓ SAVED" flash after auto-save)
- High-contrast accessibility mode in Settings

### Audio (100% synthesized — zero files)
- 10 unique zone BGM tracks with distinct melodies per zone
- Battle BGM
- 11 SFX: step, hit, super, crit, victory, badge, catch, faint, menu, warp, hptick
- Crossfade transitions between zone BGM tracks (smooth audio handoffs)
- Fade in/out on zone transitions, mute toggle, localStorage persistence

### Sprites
- 9 creature PNGs (Bria/FAL.ai generated, 512×512 RGBA)
- 9 gym leader PNGs (512×512 RGBA)
- 11 unique NPC sprites (Bria-generated pixel art, 512×512 RGBA)
- 12 player follower sprites (Mermander/Mermalion/Merlord × 4 directions)
- 6 battle sprites (3 stages × front/back)
- 4 Param player sprites (front/back/left/right)
- 10 landmark PNGs
- 10 zone arrival banners
- 10 battle background PNGs
- 10 building sprites
- 10 tile textures (grass, paths, trees, water, sand, stone)
- UI sprites (pokeball, title BG, champion BG, warppad)

---

## Recent Improvements

### Release Polish (v2.0)
- ✅ CliffNotes modal centered on desktop (560px max-width, scale-pop animation)
- ✅ Zone transitions reduced from 600ms → 400ms (snappier navigation)
- ✅ All badges/orbs now auto-collectible on proximity (no longer blocking walls)
- ✅ Gym entrance mats visually adjoin buildings (no gap)
- ✅ Wild creatures walkable (auto-trigger encounter on proximity)
- ✅ Distinct haptic feedback patterns (steps, badges, gym entry, battle hits)
- ✅ Audio crossfade between zones (smooth BGM transitions)
- ✅ Save confidence indicator ("✓ SAVED" flash after auto-save)
- ✅ Follower idle sleep animation (shrinks after 30s inactivity)
- ✅ High-contrast accessibility mode in Settings
- ✅ Achievement system (20 milestones across explore/battle/collect/special)

---

## Accessibility

- High-contrast mode (enhanced borders + text visibility)
- Configurable screen shake, particles, and touch controls
- Adjustable text speed (slow/normal/fast)
- Full keyboard navigation (WASD, arrows, Space, ESC)
- Touch D-pad for mobile with haptic feedback

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Rendering | Canvas 2D (custom game engine) |
| Styling | Tailwind CSS |
| Audio | Web Audio API + Howler.js (context management) |
| Sprites | Bria AI + FAL.ai (generated) |
| Deployment | Vercel |
| State | React state + localStorage save system |

---

## Project Structure

```
parampokemon/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── play/page.tsx               # Game entry → GameBoot → Game
│   ├── resume/page.tsx             # CV page
│   └── api/                        # Resume PDF/1-pager endpoints
├── components/
│   ├── game/
│   │   ├── Game.tsx                # Root orchestrator (state + modals)
│   │   ├── Battle.tsx              # Turn-based battle system
│   │   ├── Interior.tsx            # Building interior renderer
│   │   ├── ZoneTitle.tsx           # Cinematic zone arrival cards
│   │   ├── GameBoot.tsx            # Preload gate + loading screen
│   │   ├── TitleScreen.tsx         # Prof. Iterate intro
│   │   ├── Bag.tsx                 # Inventory + Pokedex
│   │   ├── WorldSelect.tsx         # Galaxy map view
│   │   ├── SettingsScreen.tsx      # Settings with accessibility options
│   │   └── ... (20+ UI components)
│   ├── home/                       # Homepage components
│   └── resume/                     # Resume components
├── game/
│   ├── data.ts                     # All game content (zones, NPCs, gyms, creatures)
│   ├── engine.ts                   # Game loop, input, rendering, camera, haptics
│   ├── world.ts                    # Tile grid builder (80×300)
│   ├── tiles.ts                    # 38 tile types + procedural drawing
│   ├── achievements.ts            # 20 milestone achievements
│   ├── sprites.ts                  # Overworld follower sprite
│   ├── sprite-registry.ts         # All sprite URLs + preload system
│   ├── interiors.ts               # 10 interior tile maps
│   ├── landmarks.ts               # Zone landmark rendering
│   ├── pathfind.ts                # BFS navigation
│   └── _archive/                  # Archived procedural sprites
├── lib/
│   └── audio.ts                   # Web Audio BGM + SFX engine (crossfade)
├── public/sprites/
│   ├── creatures/     (9 files, 1.1MB)
│   ├── leaders/       (9 files, 1.3MB)
│   ├── npcs/          (11 files, 1.1MB)  ← Bria-generated
│   ├── player/        (22 files, 3.3MB)
│   ├── landmarks/     (10 files, 420KB)
│   ├── banners/       (10 files, 4.7MB)
│   ├── battle/        (10 files, 4.3MB)
│   ├── tiles/         (20 files, 328KB)
│   └── ui/            (6 files, 888KB)
├── docs/
│   └── BRIA_NPC_GENERATION_GUIDE.md
├── scripts/                       # FAL.ai generation helpers
├── generate_*.mjs                 # Asset generation scripts
└── NEXT_STEPS.md                  # Roadmap for continued development
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000/play](http://localhost:3000/play) to play.

---

## Sprite Generation

NPC sprites are generated via [Bria AI](https://bria.ai) API. See `docs/BRIA_NPC_GENERATION_GUIDE.md` for full specifications.

Other sprites (creatures, leaders, player, tiles, buildings) were generated via FAL.ai using scripts in the root directory:
- `generate_sprites_v3.mjs` — Banners, battle BGs, UI art
- `generate_buildings.mjs` — Zone building sprites
- `generate_tiles_fal.mjs` — Tile textures
- `generate_trees_and_tiles.mjs` — Tree variants
- `generate_landmarks_v2.py` — Zone landmark images
- `generate_npc_sprites.mjs` — NPC generation (now superseded by Bria)

---

## How to Play

| Input | Action |
|-------|--------|
| WASD / Arrow Keys | Move |
| Space / Enter | Talk / Interact |
| Click/Tap | Walk to location (pathfinding) |
| M | Open Map |
| B | Open Bag |
| ESC | Menu / Close |
| Scroll | Walk in scroll direction |

### Gameplay Loop
1. Start at **Pallet Town** — get Mermander from Prof. Iterate
2. Walk south through route corridors to reach each zone
3. In each zone: talk to NPCs, read signs, find the **wild creature** (walk near it)
4. Challenge the **gym leader** (enter the GYM building)
5. Earn badges → your Mermander evolves (4 badges → Mermalion, 8 → Merlord)
6. Collect **skill berries** from NPCs to learn new battle moves
7. Beat all 9 gyms → become Champion
8. Use **World Select** (galaxy map) to fast-travel anywhere

---

## Performance

| Metric | Value |
|--------|-------|
| Total sprite assets | 16 MB (optimized from 54 MB) |
| Game JS bundle | 73 KB (gzipped) |
| First Load JS | 195 KB |
| Sprite preload | Prioritized tiers (critical → important → optional) |
| Target FPS | 60 (Canvas 2D) |
| Audio files | 0 (all synthesized) |
| Zone transition | 400ms (optimized from 600ms) |
| BGM crossfade | 150–400ms smooth handoff |

---

## License

This project is a personal portfolio piece. All game content, design, and narrative are original work by Param Minhas. Sprites are AI-generated via Bria AI (commercially licensed) and FAL.ai.

---

## Contact

**Param Minhas** — param@catscandance.com

[LinkedIn](https://linkedin.com/in/paramminhas) · [Website](https://parampokemon.vercel.app)
