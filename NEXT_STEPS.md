# PARAM QUEST — Next Steps for Continued Overhaul

> Prioritized roadmap for taking the game from "impressive portfolio piece" to "premium $100 indie release on Steam"

Last updated: July 2026

---

## Current State (Post-Overhaul)

### Done
- [x] Dead asset cleanup (54MB → 16MB, 131 files removed)
- [x] Building flicker fixed (preload gate + no procedural fallback)
- [x] 11 unique NPC sprites (Bria-generated, pixel art style)
- [x] Sprite preloading with priority tiers
- [x] All core features implemented (battles, interiors, pokedex, route NPCs, BGM)
- [x] Build passing with zero errors
- [x] All 105 sprite references resolve correctly

### Quality Bar
The game already has:
- 10 zones with full content
- 9 gym battles + 9 route trainer battles
- Building interiors for all zones
- Cinematic zone arrivals
- Full save/load system
- Synthesized audio (10 zone tracks + battle + 11 SFX)
- Mobile touch controls

---

## Priority 1: Visual Consistency (Next Sprint)

### 1A. Regenerate Building Sprites as Pixel Art
**Problem:** Building sprites are JPEG (no transparency, painterly style) while the rest of the game is pixel art.
**Fix:** Regenerate all 10 building sprites via Bria with pixel art style + transparent backgrounds.

```
Files to regenerate:
  public/sprites/tiles/house_home.png
  public/sprites/tiles/building_origin.png
  public/sprites/tiles/building_grp.png
  public/sprites/tiles/building_hab.png
  public/sprites/tiles/building_ai.png
  public/sprites/tiles/building_investopad.png
  public/sprites/tiles/building_sole.png
  public/sprites/tiles/building_fere.png
  public/sprites/tiles/building_ccd.png
  public/sprites/tiles/building_iterate.png

Style: Pokemon GBA building sprite, isometric top-down RPG building, pixel art,
       bold outlines, transparent background, [zone-specific description]
Size: 256×256 PNG RGBA
```

### 1B. Regenerate Tile Textures as Seamless Pixel Art
**Problem:** Tiles are JPEG (painterly AI art) which looks inconsistent next to pixel art characters.
**Fix:** Regenerate as seamless tileable pixel art textures.

```
Files to regenerate:
  public/sprites/tiles/grass.png
  public/sprites/tiles/route_grass.png
  public/sprites/tiles/path.png
  public/sprites/tiles/sand.png
  public/sprites/tiles/stone.png
  public/sprites/tiles/water.png
  public/sprites/tiles/tree_a.png through tree_d.png

Style: Seamless tileable pixel art texture, 16-bit RPG style, top-down view
Size: 64×64 or 128×128 PNG
```

### 1C. Regenerate Landmarks as Pixel Art with Transparency
**Problem:** Landmarks are JPEG (no transparency) which creates hard rectangles over the world.
**Fix:** Regenerate as pixel art illustrations with transparent backgrounds.

---

## Priority 2: Gameplay Polish

### 2A. Post-Champion Content
After beating StatusQuo (final boss), the game currently ends with ChampionCard.
**Add:**
- Champion route north of Pallet Town
- Final NPC (Param himself) discussing what's next
- ContactModal trigger from the final NPC
- Credits roll with zone/leader montage

### 2B. Difficulty Tuning
Route trainer battles scale from 40 HP → 95 HP. Verify:
- Early trainers aren't too hard for a fresh Mermander
- Mid-game trainers feel balanced after evolution to Mermalion
- Late trainers require collected skill berries to beat comfortably
- Status Quo phase 2 is beatable but challenging

### 2C. Mobile Polish
- Add `navigator.vibrate()` on step (subtle, 10ms)
- Haptic feedback on battle hits (50ms)
- Touch hold for continuous movement
- Pinch to zoom on world map
- Orientation lock to landscape on mobile

---

## Priority 3: Steam Packaging

### 3A. Desktop Wrapper
Choose between:
- **Tauri** (recommended): Rust-based, ~15MB bundle, native performance, modern
- **Electron**: Easier, ~150MB bundle, more community tooling

### 3B. Steam Integration
- Steamworks SDK integration
- 20+ achievements mapped to existing badges/events:
  - "First Steps" — Leave Pallet Town
  - "Evolution" — Evolve to Mermalion
  - "Final Form" — Evolve to Merlord
  - Per-zone badges (9 achievements)
  - "Champion" — Defeat StatusQuo
  - "Completionist" — All creatures + skills + badges
  - "Route Master" — Defeat all 9 route trainers
- Cloud saves via Steam Cloud
- Rich Presence ("Battling in AI Lab", "Exploring SoleSearch Mall")
- Trading cards (using creature/leader art)

### 3C. Store Assets
- Capsule images (hero, library, small)
- Screenshots (6-8 showing zones, battles, dialog, pokedex)
- Trailer video (30-60s gameplay montage)
- Store description + tags

---

## Priority 4: Content Expansion

### 4A. New Game+ Mode
After beating the champion:
- All zones accessible with harder trainer rematches
- Gym leaders have expanded move sets (6 moves instead of 4)
- Hidden bosses in each zone interior
- New dialog from all NPCs acknowledging your champion status

### 4B. Speed Run Mode
- Timer overlay
- Skip all cutscenes option
- Optimized routing (no forced dialogs)
- Leaderboard (local, stored in localStorage)

### 4C. Accessibility
- Color-blind mode (type colors → patterns/symbols)
- Screen reader support for battle log
- Adjustable text speed
- Configurable controls
- High contrast mode

---

## Priority 5: Performance & Scale

### 5A. Asset Loading
- Implement service worker for offline play
- Cache sprites in IndexedDB
- Progressive loading (load current zone + adjacent zones only)
- WebP format for browsers that support it (30-40% smaller)

### 5B. Rendering
- Off-screen canvas for tile pre-rendering
- RequestAnimationFrame budget monitoring
- Reduce redraws (dirty rectangle tracking)
- Canvas layer separation (background / entities / UI)

### 5C. Bundle
- Code-split game engine from homepage
- Lazy-load non-critical game components
- Tree-shake unused tile drawing functions

---

## Technical Debt

| Item | Priority | Effort |
|------|----------|--------|
| Remove `drawRoof` from tiles.ts (unused export) | Low | 5 min |
| Type-check all `any` casts in Game.tsx | Medium | 1 hour |
| Extract battle AI to separate module | Low | 30 min |
| Add error boundaries around game components | Medium | 1 hour |
| Write unit tests for battle damage calculation | Medium | 2 hours |
| Write integration test for save/load | Medium | 2 hours |
| Add proper loading states for sprite failures | Low | 30 min |
| Document the type effectiveness matrix | Low | 15 min |

---

## Asset Generation Quick Reference

### Bria API (NPCs, future sprites)
```bash
curl --request POST \
  --url "https://engine.prod.bria-api.com/v2/image/generate" \
  --header "api_token: YOUR_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "prompt": "...",
    "negative_prompt": "photorealistic, 3d render, blurry, noisy, watermark, text, signature, multiple characters, scenery, anti-aliased, photograph",
    "aspect_ratio": "1:1",
    "resolution": "1MP",
    "output_type": "png",
    "guidance_scale": 5,
    "steps_num": 50,
    "sync": true
  }'
```

### FAL.ai (existing creatures, leaders, backgrounds)
Use scripts in root directory:
- `generate_sprites_v3.mjs` for batch generation
- `scripts/fal_creatures.mjs` for individual creatures
- `scripts/fal_leaders.mjs` for individual leaders

### Post-processing
All generated images need:
1. Background removal (white → transparent via PIL/numpy)
2. Resize to target dimensions
3. PNG optimization

---

## Release Checklist

- [ ] Visual consistency pass (buildings + tiles as pixel art)
- [ ] Post-champion content
- [ ] Difficulty balance pass
- [ ] Mobile haptics
- [ ] Desktop wrapper (Tauri)
- [ ] Steam achievements (20+)
- [ ] Cloud saves
- [ ] Store assets (capsules, screenshots, trailer)
- [ ] Steam page live
- [ ] Launch marketing (tweet, LinkedIn, HN)
- [ ] Price point validation ($9.99-$14.99 recommended for content volume)

---

*Param Quest — shipping beats waiting.*
