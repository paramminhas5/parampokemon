# Requirements Document

## Introduction

This document specifies four bug-fix and polish requirements for the Param Quest HTML5 Canvas game prior to release. The issues span UI layout (CliffNotes modal), animation timing (zone transitions), game mechanic functionality (badge/orb collection), and visual positioning (gym mat placement).

## Glossary

- **CliffNotes_Modal**: The overlay component (`CliffNotes.tsx`) that displays zone summary information (what the player did, learned, metrics, creature, skill, and gym boss details) when triggered in-game.
- **TransitionOverlay**: The component (`TransitionOverlay.tsx`) that renders screen-wipe animations when the player moves between zones.
- **Game_Engine**: The core game loop and state management module (`engine.ts`) responsible for movement, collision, interaction detection, and rendering.
- **World_Builder**: The module (`world.ts`) that procedurally generates the tile grid, places buildings, props, badges, creatures, and hidden items.
- **Badge**: A collectible orb placed at a specific tile position within each zone, rendered with orbiting sparkle particles. Collecting all badges progresses the player.
- **Zone_Transition**: The visual animation played when the player enters a new zone, consisting of an in-phase, hold, and out-phase.
- **Gym_Mat**: A special tile placed below a gym building door that triggers a gym battle when the player steps on it.
- **isSolid**: The function within Game_Engine that determines whether a tile is impassable to the player.
- **autoInteractNear**: The proximity-scan function within Game_Engine that automatically triggers interactions when the player settles adjacent to or on interactive tiles.
- **Wild_Tile**: The computed tile position where a wild creature is placed for encounter purposes.
- **Hidden_Item_Tile**: The tile position where an invisible skill berry is placed for discovery upon stepping on it.

## Requirements

### Requirement 1: CliffNotes Modal Centering on Desktop

**User Story:** As a player on a desktop viewport, I want the CliffNotes modal to appear centered both vertically and horizontally on screen, so that it reads as a proper modal rather than a bottom-anchored mobile sheet.

#### Acceptance Criteria

1. WHEN the CliffNotes_Modal is opened on any viewport, THE CliffNotes_Modal SHALL use `alignItems: "center"` on the backdrop container to vertically center the modal card.
2. THE CliffNotes_Modal SHALL use `justifyContent: "center"` on the backdrop container to horizontally center the modal card.
3. THE CliffNotes_Modal SHALL set `maxWidth` to `560px` on the modal card.
4. THE CliffNotes_Modal SHALL retain `width: "92%"` on the modal card so the layout remains responsive on narrow viewports.
5. THE CliffNotes_Modal SHALL retain `maxHeight: "70dvh"` on the modal card to prevent overflow on small screens.

### Requirement 2: Zone Transition Timing Reduction

**User Story:** As a player navigating between zones, I want zone transitions to complete in approximately 400ms total, so that movement feels crisp and responsive without losing cinematic quality.

#### Acceptance Criteria

1. WHEN a zone transition is triggered, THE TransitionOverlay SHALL complete the in-phase within 180ms.
2. WHEN the in-phase completes, THE TransitionOverlay SHALL fire the `onMidpoint` callback and hold for no more than 40ms before beginning the out-phase.
3. WHEN the out-phase begins, THE TransitionOverlay SHALL complete the out-phase and return to idle state within 180ms.
4. THE TransitionOverlay SHALL maintain the total zone transition duration (in-phase + hold + out-phase) at 400ms or less.
5. THE TransitionOverlay SHALL preserve the existing `DURATION` values for `battle` (500ms) and `warp` (350ms) transition kinds without modification.

### Requirement 3: Badge and Orb Collectibility

**User Story:** As a player exploring zones, I want badges, wild creatures, and hidden items to be reachable and automatically collectible, so that game progression is not blocked by impassable tiles or missing auto-interaction logic.

#### Acceptance Criteria

1. THE Game_Engine `isSolid` function SHALL treat badge tiles as non-solid (passable), allowing the player to walk onto badge positions regardless of collection state.
2. WHEN the player is adjacent to or standing on an uncollected badge tile, THE Game_Engine `autoInteractNear` function SHALL automatically collect the badge and trigger the `onBadge` callback.
3. THE World_Builder SHALL verify that badge tile positions are not overwritten by props, trees, fences, or other solid tiles during world generation.
4. THE World_Builder SHALL verify that Wild_Tile positions (computed by `wildPositionFor`) are not overwritten by props, trees, fences, or other solid tiles during world generation.
5. THE World_Builder SHALL verify that Hidden_Item_Tile positions are not overwritten by props, trees, fences, or other solid tiles during world generation.
6. WHEN a badge is auto-collected via `autoInteractNear`, THE Game_Engine SHALL add the badge ID to the `collectedBadges` set and invoke the `onBadge` callback exactly once per badge.

### Requirement 4: Gym Mat Placement Visual Alignment

**User Story:** As a player approaching a gym building, I want the gym mat to appear visually touching the building entrance with no gap, so that the entry point is clear and there are no empty tiles between the building and the mat.

#### Acceptance Criteria

1. THE World_Builder SHALL place the gym mat tile at the position `(zoneOx + building.x + building.doorX, zoneOy + building.y + building.h - 1)`, which is the same row as the door (last row of the building footprint), directly below the door tile within the building sprite footprint.
2. WHEN the player steps on the mat tile, THE Game_Engine SHALL detect the mat using the same coordinate formula used by World_Builder for placement, ensuring consistent detection.
3. IF the mat is placed at a revised coordinate, THEN THE Game_Engine mat-detection logic SHALL use the matching revised coordinate to trigger the gym battle.
4. THE World_Builder SHALL ensure that moving the mat position does not create a collision conflict with the door tile at the same coordinates.
5. WHEN a gym has already been defeated, THE Game_Engine SHALL skip the gym battle trigger on the mat tile and allow normal passage.
