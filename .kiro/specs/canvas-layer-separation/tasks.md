# Implementation Plan: Canvas Layer Separation

## Overview

Split the monolithic single-canvas renderer in `game/engine.ts` into three stacked canvases (Background, Entity, Effects) managed by a new `game/layer-stack.ts` module. The Background layer uses dirty-flag invalidation to skip redraws when the camera is stationary, while Entity and Effects layers continue to redraw every frame. Input events attach to the topmost (Effects) canvas. All changes are internal to the engine; the public API remains unchanged.

## Tasks

- [ ] 1. Create LayerStack module
  - [x] 1.1 Create `game/layer-stack.ts` with `createLayerStack()` function and `LayerStack` interface
    - Export `LayerStack` interface with `bg`, `entity`, `effects` canvas refs, their contexts, `resize()`, `applyShake()`, `clearShake()`, and `destroy()` methods
    - `createLayerStack(container: HTMLElement)` creates 3 canvases with absolute positioning, z-index 0/1/2, alpha:false for bg, alpha:true for entity/effects
    - Sets `container.style.position = "relative"` if not already set
    - Disables `imageSmoothingEnabled` on all contexts
    - `resize(w, h)` sets `.width` and `.height` on all 3 canvases
    - `applyShake(x, y)` applies CSS `transform: translate(${x}px, ${y}px)` on the bg canvas only
    - `clearShake()` resets bg canvas transform to `translate(0, 0)`
    - `destroy()` removes all 3 canvases from DOM, disconnects any ResizeObserver
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.3, 8.1, 8.2_

  - [ ]* 1.2 Write unit tests for `createLayerStack()`
    - Test that 3 canvases are appended to the container with correct z-index order
    - Test resize sets identical width/height on all canvases
    - Test destroy removes all canvases from container
    - Test applyShake sets correct CSS transform on bg canvas
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 8.1_

  - [ ]* 1.3 Write property test for layer stack creation (Property 1)
    - **Property 1: Layer stack creation produces exactly three canvases**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 1.4 Write property test for identical resize (Property 2)
    - **Property 2: All layers resize identically**
    - **Validates: Requirements 1.6, 2.5**

- [ ] 2. Integrate LayerStack into engine and implement dirty-flag state
  - [x] 2.1 Refactor `createEngine()` to use `createLayerStack()` instead of drawing on the single canvas
    - Import `createLayerStack` from `game/layer-stack.ts`
    - Use `canvas.parentElement` as the container; hide or remove the original canvas
    - Replace single `ctx` with `layers.bgCtx`, `layers.entityCtx`, `layers.effectsCtx`
    - Add `DirtyState` interface and `checkDirty()` function inline in engine
    - Initialize dirty state with `dirty: true`, `lastCamX: 0`, `lastCamY: 0`, `threshold: 0.5`
    - _Requirements: 1.1, 2.1, 2.2, 2.3_

  - [x] 2.2 Update resize handler to resize all layers and set dirty flag
    - Call `layers.resize(w, h)` instead of setting single canvas dimensions
    - Reset `imageSmoothingEnabled` on all three contexts after resize
    - Set `bgDirtyState.dirty = true` on every resize
    - _Requirements: 1.6, 2.5_

  - [ ]* 2.3 Write property test for dirty flag threshold (Property 3)
    - **Property 3: Dirty flag triggers on camera threshold**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 2.4 Write property test for dirty flag reset (Property 4)
    - **Property 4: Dirty flag resets after background render**
    - **Validates: Requirements 2.4**

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Split render function into three layer renderers
  - [x] 4.1 Extract `renderBackground()` from the monolithic `render()` function
    - Move base fill (`#08101a`), terrain tile loop (with 4-tile buffer zone), shore foam edges, and per-zone color grading overlay into `renderBackground(ctx, now, offX, offY)`
    - Only call `renderBackground()` when `bgDirtyState.dirty` is true; reset dirty flag after render
    - When dirty is false and shake is active, use `layers.applyShake(shakeX, shakeY)` via CSS transform
    - When dirty is false and no shake, call `layers.clearShake()`
    - _Requirements: 2.1, 2.3, 2.4, 2.6, 5.3_

  - [x] 4.2 Extract `renderEntities()` from the monolithic `render()` function
    - Move buildings, NPCs, route NPCs, wild creatures, badge orbs, player character, follower, path breadcrumbs, and gym door mat glow into `renderEntities(ctx, now, offX, offY)`
    - Clear entity canvas at start of each frame with `clearRect`
    - Apply `ctx.translate(offX, offY)` including shake offset
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x] 4.3 Extract `renderEffects()` from the monolithic `render()` function
    - Move per-zone weather particles, zone ambient particles, footstep dust particles, edge vignette, and day/night tint into `renderEffects(ctx, now, offX, offY)`
    - Clear effects canvas at start of each frame with `clearRect`
    - Apply `ctx.translate(offX, offY)` including shake offset
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.4 Write property test for background skip when clean (Property 5)
    - **Property 5: Background skips draw calls when clean**
    - **Validates: Requirements 2.3, 7.1**

  - [ ]* 4.5 Write property test for shake consistency (Property 6)
    - **Property 6: Shake offset consistency across layers**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 4.6 Write property test for shake not invalidating clean background (Property 7)
    - **Property 7: Shake does not invalidate clean background**
    - **Validates: Requirements 5.3**

- [ ] 5. Wire input events to Effects canvas and update frame loop
  - [x] 5.1 Move all input event listeners from the original canvas to `layers.effects`
    - Move `click`, `wheel`, `touchstart`, `touchmove`, `touchend` listeners to effects canvas
    - Verify coordinate math uses `layers.effects.getBoundingClientRect()` and `layers.effects.width/height`
    - Keyboard listeners remain on `window` (unchanged)
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 5.2 Update the frame loop to orchestrate the three-layer rendering pipeline
    - Compute camera position and shake offset once per frame
    - Call dirty flag check with current smooth camera position
    - Conditionally call `renderBackground()` or apply CSS shake
    - Always call `renderEntities()` and `renderEffects()`
    - Apply canvas shake via context translate on entity and effects layers
    - _Requirements: 4.7, 5.1, 5.2, 7.2_

  - [ ]* 5.3 Write property test for click-to-walk coordinates (Property 8)
    - **Property 8: Click-to-walk coordinate computation correctness**
    - **Validates: Requirements 6.2**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement cleanup and lifecycle handling
  - [x] 7.1 Update `destroy()` to clean up all three canvases and layer stack resources
    - Cancel `requestAnimationFrame` loop
    - Remove all event listeners from `layers.effects` canvas
    - Remove global window listeners (keydown, keyup, resize, orientationchange)
    - Call `layers.destroy()` to remove canvases from DOM and disconnect ResizeObserver
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 7.2 Write property test for destroy cleanup (Property 9)
    - **Property 9: Destroy removes all layer canvases**
    - **Validates: Requirements 8.1, 8.3**

  - [ ]* 7.3 Write property test for background skip rate (Property 10)
    - **Property 10: Background skip rate during lerp settling**
    - **Validates: Requirements 7.1, 7.3**

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation language is TypeScript (matching the existing codebase)
- All changes are internal to `game/engine.ts` and the new `game/layer-stack.ts`; the public API of `createEngine()` is unchanged
- `Game.tsx` requires no modifications — it still passes a single canvas ref

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 4, "tasks": ["4.4", "4.5", "4.6", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3"] }
  ]
}
```
