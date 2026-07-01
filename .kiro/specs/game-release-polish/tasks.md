# Implementation Plan: Game Release Polish

## Overview

Four targeted polish fixes applied to existing files: CliffNotes modal centering, zone transition timing reduction, badge collectibility improvements, and gym mat placement alignment. All changes are small, isolated modifications to `CliffNotes.tsx`, `TransitionOverlay.tsx`, `engine.ts`, and `world.ts`.

## Tasks

- [x] 1. CliffNotes modal centering
  - [x] 1.1 Update CliffNotes backdrop and card styles
    - In `components/game/CliffNotes.tsx`, change `alignItems: "flex-end"` to `alignItems: "center"` on the backdrop flex container div
    - On the modal card div, change `maxWidth: 440` to `maxWidth: 560`
    - Verify that `width: "92%"`, `maxHeight: "70dvh"`, and all other card properties remain unchanged
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Zone transition timing reduction
  - [x] 2.1 Revise TransitionOverlay timer logic for zone transitions
    - In `components/game/TransitionOverlay.tsx`, replace the current timer scheduling inside the `useEffect` that handles `trigger`
    - Current logic: `half = DURATION[trigger.kind] / 2` (200ms), hold at `half + 80` (280ms), idle at `DURATION + 120` (520ms)
    - New logic: `inPhase = 180`, hold fires `onMidpoint` at 180ms, out-phase starts at `inPhase + 40` (220ms), idle at `DURATION[trigger.kind]` (400ms)
    - Only apply the revised timing when `trigger.kind === "zone"`; preserve existing half-based logic for `battle` and `warp` kinds
    - Do NOT modify the `DURATION` map values
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Badge collectibility improvements
  - [x] 3.1 Remove badge solid check from engine.ts `isSolid`
    - In `game/engine.ts`, remove the line `if (i.kind === "badge" && i.x === x && i.y === y && !state.collectedBadges.has(i.zone.badge.id)) return true;` from the `isSolid` function
    - _Requirements: 3.1_

  - [x] 3.2 Add badge auto-collection in engine.ts `autoInteractNear`
    - In `game/engine.ts`, inside the `autoInteractNear` function, add a badge proximity check before the sign check (after the wild creature check)
    - For each neighbour position, find an interactive with `kind === "badge"` at that position
    - If found and the badge is uncollected (`!state.collectedBadges.has(badge.zone.badge.id)`), generate a throttle key `b:{zone.id}:{badge.id}`, check the cooldown, then add to `collectedBadges` and call `cb.onBadge(badge.zone.badge.id)`
    - _Requirements: 3.2, 3.6_

  - [x] 3.3 Protect interactive positions in world.ts `addZoneTreeClusters`
    - In `game/world.ts`, within the `safe()` function inside `addZoneTreeClusters`, add protection for the wild creature position and hidden item position
    - Import or compute `wildPositionFor(z)` and check `if (gx === wildPos.x && gy === wildPos.y) return false`
    - Check `if (z.hiddenItem) { const hx = z.ox + z.hiddenItem.x, hy = z.oy + z.hiddenItem.y; if (gx === hx && gy === hy) return false; }`
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 3.4 Skip badge/wild/hidden positions in dense prop and perimeter loops
    - In `game/world.ts`, in the "Dense thematic props" loop inside `placeZoneContent`, add skip conditions for badge world coordinates (`z.ox + z.badge.x, z.oy + z.badge.y`), wild position, and hidden item position
    - In the "Perimeter flowers / tall grass" loops, add similar skip conditions for badge, wild, and hidden item positions
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]* 3.5 Write property test for badge non-solidity
    - **Property 1: Badge tiles are never solid**
    - **Validates: Requirements 3.1**

  - [ ]* 3.6 Write property test for badge auto-collection
    - **Property 2: Badge auto-collection on proximity**
    - **Validates: Requirements 3.2, 3.6**

  - [ ]* 3.7 Write property test for interactive position protection
    - **Property 3: Interactive positions remain non-solid in generated world**
    - **Validates: Requirements 3.3, 3.4, 3.5**

- [x] 4. Checkpoint - Ensure all changes compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Gym mat placement alignment
  - [x] 5.1 Fix mat Y-coordinate in world.ts `paintBuilding`
    - In `game/world.ts`, in the `paintBuilding` function, change `const matWy = zoneOy + b.y + b.h;` to `const matWy = zoneOy + b.y + b.h - 1;`
    - _Requirements: 4.1, 4.4_

  - [x] 5.2 Fix mat detection coordinate in engine.ts frame loop
    - In `game/engine.ts`, in the MAT auto-trigger section inside the frame loop, change `const my = zz.oy + zz.building.y + zz.building.h;` to `const my = zz.oy + zz.building.y + zz.building.h - 1;`
    - _Requirements: 4.2, 4.3_

  - [x] 5.3 Fix door/mat entry indicator coordinate in engine.ts render
    - In `game/engine.ts`, in the "Door/mat entry indicator" rendering section, change `const dy = (z.oy + z.building.y + z.building.h) * TILE + offY;` to `const dy = (z.oy + z.building.y + z.building.h - 1) * TILE + offY;`
    - Also update the "Gym door marker" section similarly: change `const dy = z.oy + z.building.y + z.building.h;` to `const dy = z.oy + z.building.y + z.building.h - 1;`
    - _Requirements: 4.2, 4.3_

  - [ ]* 5.4 Write property test for gym mat placement correctness
    - **Property 5: Gym mat placement correctness**
    - **Validates: Requirements 4.1**

  - [ ]* 5.5 Write property test for mat detection/placement formula consistency
    - **Property 6: Gym mat detection/placement formula consistency**
    - **Validates: Requirements 4.2, 4.3**

- [x] 6. Final checkpoint - Ensure all changes compile and no regressions
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- All changes are to existing files — no new files are created
- The implementation language is TypeScript (Next.js/React project)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["3.2", "3.3", "5.1"] },
    { "id": 2, "tasks": ["3.4", "5.2", "5.3"] },
    { "id": 3, "tasks": ["3.5", "3.6", "3.7", "5.4", "5.5"] }
  ]
}
```
