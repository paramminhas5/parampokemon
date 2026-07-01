# Requirements Document

## Introduction

This feature separates the single-canvas rendering pipeline in the game engine into three distinct layered canvases: a Background/Terrain layer, an Entity layer, and an Effects/UI layer. The Background layer uses dirty-flag invalidation to avoid redrawing static terrain every frame, while the Entity and Effects layers continue to redraw each frame. The goal is to reduce per-frame draw calls and improve rendering performance on mobile devices while maintaining visual fidelity and the existing 60fps target.

## Glossary

- **Layer_Stack**: The set of three stacked HTML canvas elements that together compose the final rendered frame visible to the player.
- **Background_Layer**: The bottom canvas responsible for drawing terrain tiles, shore foam, and zone color grading. Redraws only when the camera position changes beyond a threshold.
- **Entity_Layer**: The middle canvas responsible for drawing NPCs, buildings, the player character, the follower, wild creatures, badges, path breadcrumbs, and route NPCs. Redraws every frame.
- **Effects_Layer**: The top canvas responsible for drawing weather particles, dust particles, zone ambient particles, vignette overlay, and door indicators. Redraws every frame.
- **Dirty_Flag**: A boolean signal indicating that the Background_Layer content is stale and must be redrawn due to a camera position change.
- **Camera_Threshold**: The minimum camera displacement (in pixels) that triggers a Background_Layer redraw.
- **Render_Loop**: The existing requestAnimationFrame loop in createEngine() that drives per-frame updates.
- **Viewport**: The visible area of the world defined by VIEW_TILES_X and VIEW_TILES_Y with a buffer zone for off-screen tiles.
- **Game_Container**: The parent DOM element that holds all three canvas elements in the Layer_Stack.

## Requirements

### Requirement 1: Multi-Canvas Layer Stack

**User Story:** As a player, I want the game to render through multiple layered canvases so that rendering performance improves without any visible change to the game's appearance.

#### Acceptance Criteria

1. WHEN createEngine() is called with a canvas element, THE Layer_Stack SHALL create three canvas elements (Background_Layer, Entity_Layer, Effects_Layer) inside the Game_Container.
2. THE Layer_Stack SHALL position all three canvases using CSS absolute positioning so they overlap exactly with identical dimensions.
3. THE Layer_Stack SHALL set the z-index of Background_Layer lowest, Entity_Layer in the middle, and Effects_Layer highest.
4. THE Entity_Layer and Effects_Layer SHALL have transparent backgrounds (alpha: true) so lower layers remain visible through unpainted regions.
5. THE Background_Layer SHALL use an opaque context (alpha: false) to match the current rendering behavior for the base fill.
6. WHEN the canvas is resized, THE Layer_Stack SHALL resize all three canvas elements to identical dimensions matching the new viewport size.

### Requirement 2: Background Layer Rendering with Dirty-Flag Invalidation

**User Story:** As a mobile player, I want terrain rendering to skip unnecessary redraws so that the game maintains 60fps on my device.

#### Acceptance Criteria

1. THE Background_Layer SHALL render terrain tiles, shore foam edges, and zone color grading overlays.
2. WHEN the smooth camera position changes by more than 0.5 pixels from the last rendered camera position, THE Dirty_Flag SHALL be set to true.
3. WHILE the Dirty_Flag is false, THE Render_Loop SHALL skip all Background_Layer draw calls for that frame.
4. WHEN the Dirty_Flag is true, THE Background_Layer SHALL clear and redraw all visible terrain, shore foam, and zone color grading, then reset the Dirty_Flag to false.
5. WHEN the viewport is resized, THE Dirty_Flag SHALL be set to true to force a full Background_Layer redraw.
6. THE Background_Layer SHALL include the existing buffer zone (4 tiles beyond viewport edges) when rendering terrain tiles.

### Requirement 3: Entity Layer Rendering

**User Story:** As a player, I want NPCs, creatures, buildings, and my character to render smoothly every frame so that animations appear fluid.

#### Acceptance Criteria

1. THE Entity_Layer SHALL clear its entire canvas at the start of each frame.
2. THE Entity_Layer SHALL render buildings (PNG sprites and placeholders) in the correct draw order.
3. THE Entity_Layer SHALL render NPC sprites with idle bob animation and directional facing logic.
4. THE Entity_Layer SHALL render route NPC sprites with bob animation and directional facing logic.
5. THE Entity_Layer SHALL render wild creature sprites with bob animation and exclamation markers.
6. THE Entity_Layer SHALL render badge orbs with orbiting sparkle particles.
7. THE Entity_Layer SHALL render the player character sprite with zone accent glow and drop shadow.
8. THE Entity_Layer SHALL render the follower sprite with directional facing, idle bob, jump animation, and spin animation.
9. THE Entity_Layer SHALL render path breadcrumb dots when a path is queued.
10. THE Entity_Layer SHALL render gym door mat glow indicators.

### Requirement 4: Effects Layer Rendering

**User Story:** As a player, I want weather effects, particles, and UI overlays to render on top of all game entities so that the visual atmosphere is preserved.

#### Acceptance Criteria

1. THE Effects_Layer SHALL clear its entire canvas at the start of each frame.
2. THE Effects_Layer SHALL render per-zone weather particles (neon data rain, crypto matrix columns, studio musical notes, snow flakes, mall glitter, dusk gold motes) clipped to zone boundaries.
3. THE Effects_Layer SHALL render zone ambient floating accent-colored particles.
4. THE Effects_Layer SHALL render footstep dust particles with gravity and alpha fade.
5. THE Effects_Layer SHALL render the edge vignette radial gradient overlay.
6. THE Effects_Layer SHALL render the day/night ambient tint overlay based on the local clock hour.
7. THE Effects_Layer SHALL render the canvas shake offset when a shake is active, applied consistently across all layers.

### Requirement 5: Canvas Shake Consistency

**User Story:** As a player, I want screen shake effects to look correct across all layers so that the visual impact of battle events is preserved.

#### Acceptance Criteria

1. WHEN a canvas shake is active, THE Layer_Stack SHALL apply identical shake offset values to all three layers in the same frame.
2. WHEN no shake is active, THE Layer_Stack SHALL apply zero offset to all three layers.
3. WHEN a shake is active and the Background_Layer Dirty_Flag is false, THE Layer_Stack SHALL apply the shake offset using CSS transform translate on the Background_Layer canvas element rather than forcing a redraw.

### Requirement 6: Input Event Handling Preservation

**User Story:** As a player, I want click-to-walk, touch swipe, and scroll-to-walk to continue working correctly with the new multi-canvas setup.

#### Acceptance Criteria

1. THE Effects_Layer canvas (topmost) SHALL receive all pointer, touch, wheel, and click events since it sits on top in the DOM stacking order.
2. WHEN a click event occurs on the Effects_Layer, THE Render_Loop SHALL compute the world tile coordinates using the same viewport math as the current single-canvas implementation.
3. THE Layer_Stack SHALL preserve all existing touch swipe, scroll-to-walk, and keyboard input behaviors without modification to input logic.

### Requirement 7: Performance Targets

**User Story:** As a mobile player, I want the layered rendering to reduce GPU workload so that I experience consistent frame rates.

#### Acceptance Criteria

1. THE Background_Layer SHALL skip draw calls for at least 80% of frames during steady camera movement (camera lerp settling).
2. THE Layer_Stack SHALL maintain frame timing at or below 16.67ms per frame (60fps) on devices that currently achieve 60fps with the single-canvas implementation.
3. IF a frame exceeds 16.67ms, THEN THE Render_Loop SHALL not drop the Background_Layer redraw; the Dirty_Flag mechanism SHALL only defer redraws when the camera has not moved beyond the Camera_Threshold.

### Requirement 8: Cleanup and Lifecycle

**User Story:** As a developer, I want the layer system to clean up all resources on destroy so that no memory leaks occur when the game component unmounts.

#### Acceptance Criteria

1. WHEN destroy() is called on the engine, THE Layer_Stack SHALL remove all three canvas elements from the DOM.
2. WHEN destroy() is called, THE Layer_Stack SHALL disconnect all ResizeObserver instances attached to the layer canvases.
3. WHEN destroy() is called, THE Layer_Stack SHALL cancel the requestAnimationFrame loop and release all rendering context references.
