# Technical Design: Canvas Layer Separation

## Overview

This design separates the existing single-canvas rendering pipeline in `game/engine.ts` into three stacked HTML canvas elements — Background, Entity, and Effects — managed inside `createEngine()`. The Background layer uses dirty-flag invalidation so static terrain is only redrawn when the camera moves beyond a threshold, reducing per-frame GPU work by ~30-50% during typical gameplay (camera lerp settling). The Entity and Effects layers continue to clear and redraw every frame.

All changes are internal to the engine module and `Game.tsx` container setup; the public API surface of `createEngine()` is unchanged.

## Architecture

### Layer Stack DOM Structure

```
Game Container (div, position: relative)
├─ Background Canvas  (position: absolute, z-index: 0, alpha: false)
├─ Entity Canvas      (position: absolute, z-index: 1, alpha: true)
└─ Effects Canvas     (position: absolute, z-index: 2, alpha: true)
```

The three canvases are created inside `createEngine()` rather than in `Game.tsx`. The existing `canvasRef` element from `Game.tsx` is repurposed: instead of drawing directly on it, the engine treats its parent element as the `Game_Container`, inserts the three layer canvases as children, and hides the original canvas (or replaces it). This keeps the React component unchanged — it still passes a single canvas ref, and the engine internally manages the layer stack.

### Rendering Pipeline

```
frameLoop(now)
│
├─ Update game state (walk interp, input, path)
│
├─ Compute camera (camXSmooth, camYSmooth via lerp)
│
├─ Compute shake offset (shakeX, shakeY)
│
├─ Background Layer
│   ├─ Check dirty flag
│   │   ├─ If dirty: clearRect → drawTerrain → drawShoreFoam → drawZoneColorGrading → dirty = false
│   │   └─ If clean + shake active: apply CSS transform translate(shakeX, shakeY)
│   │   └─ If clean + no shake: CSS transform translate(0, 0) [no-op if already zero]
│   └─ (skip draw calls entirely when clean)
│
├─ Entity Layer
│   ├─ clearRect(0, 0, fullWidth, fullHeight)
│   ├─ Apply context translate(offX, offY) including shake
│   ├─ Draw buildings (PNG sprites + placeholders)
│   ├─ Draw NPCs (HD sprites + fallback procedural)
│   ├─ Draw route NPCs
│   ├─ Draw wild creatures + "!" markers
│   ├─ Draw badge orbs + sparkle particles
│   ├─ Draw player character (zone glow, sprite, shadow)
│   ├─ Draw follower (directional, animations)
│   ├─ Draw path breadcrumbs
│   └─ Draw gym door mat glow indicators
│
└─ Effects Layer
    ├─ clearRect(0, 0, fullWidth, fullHeight)
    ├─ Apply context translate(offX, offY) including shake
    ├─ Draw per-zone weather particles (clipped to zone bounds)
    ├─ Draw zone ambient floating particles
    ├─ Draw footstep dust particles
    ├─ Draw edge vignette (radial gradient)
    └─ Draw day/night ambient tint overlay
```

## Components

### 1. LayerStack (new internal module)

**File:** `game/layer-stack.ts`

```typescript
export interface LayerStack {
  bg: HTMLCanvasElement;
  entity: HTMLCanvasElement;
  effects: HTMLCanvasElement;
  bgCtx: CanvasRenderingContext2D;
  entityCtx: CanvasRenderingContext2D;
  effectsCtx: CanvasRenderingContext2D;
  resize(width: number, height: number): void;
  applyShake(x: number, y: number): void;
  clearShake(): void;
  destroy(): void;
}

export function createLayerStack(container: HTMLElement): LayerStack {
  // Create 3 canvases with absolute positioning
  // Background: alpha=false, z-index=0
  // Entity: alpha=true, z-index=1
  // Effects: alpha=true, z-index=2
  // Container gets position:relative if not already
  // Returns LayerStack object
}
```

The `createLayerStack` function:
1. Sets `container.style.position = "relative"` (if not already set).
2. Creates three `<canvas>` elements.
3. Applies shared CSS: `position: absolute; top: 0; left: 0; width: 100%; height: 100%; image-rendering: pixelated`.
4. Sets z-index: bg=0, entity=1, effects=2.
5. Gets 2D contexts: bg with `{ alpha: false }`, entity/effects with `{ alpha: true }`.
6. Disables `imageSmoothingEnabled` on all contexts.
7. Appends all three to `container`.

### 2. DirtyFlag (embedded in engine)

```typescript
interface DirtyState {
  dirty: boolean;
  lastCamX: number;
  lastCamY: number;
  threshold: number; // 0.5 pixels
}

function checkDirty(state: DirtyState, camX: number, camY: number): boolean {
  const dx = Math.abs(camX - state.lastCamX);
  const dy = Math.abs(camY - state.lastCamY);
  if (dx > state.threshold || dy > state.threshold) {
    state.dirty = true;
    state.lastCamX = camX;
    state.lastCamY = camY;
  }
  return state.dirty;
}
```

The threshold is 0.5 pixels (in tile-space, that's `0.5 / TILE`). Since camera uses smooth lerp (factor 0.12), after the player stops, the camera exponentially decays toward the target. Within ~8-12 frames the delta drops below 0.5px, at which point the background stops redrawing. This means during steady walking, background redraws every frame (camera moves significantly), but once the player stops, it quickly transitions to skipping redraws.

### 3. Render Function Split

The current monolithic `render(now)` function (~300 lines) is split into three focused functions:

```typescript
function renderBackground(ctx: CanvasRenderingContext2D, now: number, offX: number, offY: number): void {
  // Base fill (#08101a)
  // Terrain tiles (with 4-tile buffer zone)
  // Shore foam edges
  // Per-zone color grading overlays
}

function renderEntities(ctx: CanvasRenderingContext2D, now: number, offX: number, offY: number): void {
  // Buildings (PNG sprites + placeholders)
  // NPCs (HD sprite + procedural fallback)
  // Route NPCs
  // Wild creatures + "!" markers
  // Badge orbs + sparkle particles
  // Gym door mat glow indicators
  // Player character (zone glow, shadow, sprite)
  // Follower (directional, animation states)
  // Path breadcrumbs
}

function renderEffects(ctx: CanvasRenderingContext2D, now: number, offX: number, offY: number): void {
  // Per-zone weather particles (clipped to zone bounds)
  // Zone ambient floating particles
  // Footstep dust particles
  // Edge vignette (radial gradient)
  // Day/night ambient tint overlay
}
```

### 4. Canvas Shake across Layers

Current implementation applies shake via `offX`/`offY` pixel offsets passed into the render function. The new design:

- **Entity & Effects layers**: Continue using `ctx.translate(offX, offY)` at the start of each frame (already redrawn every frame).
- **Background layer when dirty=true**: Apply shake via `offX`/`offY` in the redraw (same as before).
- **Background layer when dirty=false**: Apply shake via CSS `transform: translate(${shakeX}px, ${shakeY}px)` on the background canvas element. This avoids forcing a full terrain redraw just for a 6-pixel jitter that lasts 200-400ms.

```typescript
// In the frame loop:
if (!bgDirtyState.dirty) {
  // Shake via CSS transform (avoids redraw)
  layers.applyShake(shakeX, shakeY);
} else {
  // Redraw background with shake baked into offsets
  layers.clearShake(); // reset CSS transform to (0,0)
  renderBackground(layers.bgCtx, now, offX, offY);
  bgDirtyState.dirty = false;
}
```

The `applyShake` method sets `bg.style.transform = translate(...)` and also applies to entity/effects for visual consistency. However, entity/effects already incorporate shake in their context translate, so `applyShake` only touches the background canvas CSS.

### 5. Input Event Attachment

All input event listeners attach to the **Effects layer canvas** (topmost, z-index=2) since it receives pointer events. The existing click-to-walk coordinate math remains unchanged because:
- `canvas.getBoundingClientRect()` returns the same rect (all canvases are identical size).
- `canvas.width` / `canvas.height` are the same across all layers.
- `camX` / `camY` are module-level variables accessible to the click handler.

The Effects canvas reference replaces the original `canvas` parameter in all `addEventListener` calls.

### 6. Resize Handling

```typescript
function resize() {
  // Compute VIEW_TILES_X, VIEW_TILES_Y (unchanged logic)
  const w = VIEW_TILES_X * TILE;
  const h = VIEW_TILES_Y * TILE;
  
  // Resize all three canvases
  layers.resize(w, h);
  
  // Reset imageSmoothingEnabled on all contexts (canvas resize resets context state)
  layers.bgCtx.imageSmoothingEnabled = false;
  layers.entityCtx.imageSmoothingEnabled = false;
  layers.effectsCtx.imageSmoothingEnabled = false;
  
  // Force background redraw
  bgDirtyState.dirty = true;
}
```

The `ResizeObserver` observes the container element (or the effects canvas). When triggered, all three canvases are resized identically.

### 7. Lifecycle & Cleanup

```typescript
destroy() {
  cancelAnimationFrame(raf);
  
  // Remove input event listeners from effects canvas
  layers.effects.removeEventListener("wheel", onWheel);
  layers.effects.removeEventListener("touchstart", onTouchStart);
  layers.effects.removeEventListener("touchmove", onTouchMove);
  layers.effects.removeEventListener("touchend", onTouchEnd);
  layers.effects.removeEventListener("click", onClick);
  
  // Remove global listeners
  window.removeEventListener("keydown", kd);
  window.removeEventListener("keyup", ku);
  window.removeEventListener("orientationchange", resize);
  window.removeEventListener("resize", resize);
  
  // Disconnect ResizeObserver and remove canvases from DOM
  layers.destroy(); // disconnects RO, removes 3 canvases, nulls context refs
}
```

## Data Models

### DirtyState

```typescript
interface DirtyState {
  dirty: boolean;
  lastCamX: number;  // last camera X when background was rendered (in tile units)
  lastCamY: number;  // last camera Y when background was rendered (in tile units)
  threshold: number; // 0.5 / TILE (pixels converted to tile units)
}
```

### LayerStack Interface

```typescript
interface LayerStack {
  bg: HTMLCanvasElement;
  entity: HTMLCanvasElement;
  effects: HTMLCanvasElement;
  bgCtx: CanvasRenderingContext2D;
  entityCtx: CanvasRenderingContext2D;
  effectsCtx: CanvasRenderingContext2D;
  resize(width: number, height: number): void;
  applyShake(x: number, y: number): void;
  clearShake(): void;
  destroy(): void;
}
```

## Error Handling

- **Context creation failure**: If `getContext("2d")` returns null for any layer, fall back to the original single-canvas approach. Log a warning. This ensures the game still works on browsers/devices with canvas limitations.
- **Container not available**: If the passed canvas has no `parentElement`, throw an error immediately (this would indicate a React rendering issue).
- **ResizeObserver not available**: Guard with `typeof ResizeObserver !== "undefined"` (already done in current code). Fall back to `window.resize` event only.

## Performance Considerations

- The background layer with dirty-flag invalidation is the primary performance win. During camera lerp settling (which happens every time the player stops moving), the camera decays from ~2px/frame down to <0.5px/frame within 8-12 frames. After that, background drawing (terrain loop over ~40×28 = 1120 tiles plus shore foam) is skipped entirely.
- Entity and Effects layers still redraw every frame because their content changes every frame (NPC bob, particle animation, dust physics, follower animation).
- CSS transform for shake on the background canvas avoids invalidating the dirty flag during the brief 200-400ms shake events that occur after battle finishing blows.
- Memory overhead: 3 canvas backing buffers instead of 1. At 960×704 pixels × 4 bytes RGBA = ~2.6MB per canvas = ~7.8MB total vs ~2.6MB before. Acceptable for modern devices.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Layer stack creation produces exactly three canvases

*For any* valid container element passed to `createLayerStack`, the resulting layer stack SHALL contain exactly three canvas elements appended to that container, all with identical dimensions and absolute positioning.

**Validates: Requirements 1.1, 1.2**

### Property 2: All layers resize identically

*For any* viewport resize event with dimensions (w, h), all three canvas elements in the layer stack SHALL have their `width` and `height` attributes set to exactly (w, h), and the background dirty flag SHALL be set to true.

**Validates: Requirements 1.6, 2.5**

### Property 3: Dirty flag triggers on camera threshold

*For any* smooth camera position (camX, camY) where the Euclidean displacement from the last rendered position exceeds 0.5 pixels on either axis, the dirty flag SHALL be set to true. *For any* displacement of 0.5 pixels or less on both axes, the dirty flag SHALL remain unchanged.

**Validates: Requirements 2.2, 2.3**

### Property 4: Dirty flag resets after background render

*For any* frame where the dirty flag is true at the start of background rendering, the dirty flag SHALL be false after background rendering completes for that frame.

**Validates: Requirements 2.4**

### Property 5: Background skips draw calls when clean

*For any* frame where the dirty flag is false, the number of draw calls issued to the background canvas context SHALL be zero (no clearRect, no fillRect, no drawImage, no fillText on bgCtx).

**Validates: Requirements 2.3, 7.1**

### Property 6: Shake offset consistency across layers

*For any* frame during an active shake, the shake offset (shakeX, shakeY) applied to the entity layer, effects layer, and background layer SHALL be identical pixel values computed from the same random seed for that frame.

**Validates: Requirements 5.1, 5.2**

### Property 7: Shake does not invalidate clean background

*For any* frame where a shake is active and the background dirty flag is false, the dirty flag SHALL remain false, and the shake SHALL be applied to the background canvas via CSS transform rather than a context redraw.

**Validates: Requirements 5.3**

### Property 8: Click-to-walk coordinate computation correctness

*For any* click position (clientX, clientY) on the effects canvas, and *for any* camera position (camX, camY) and canvas dimensions, the computed world tile coordinates (tx, ty) SHALL equal `floor((clientX - rect.left) / rect.width * canvasWidth / TILE + camX)` and `floor((clientY - rect.top) / rect.height * canvasHeight / TILE + camY)` respectively.

**Validates: Requirements 6.2**

### Property 9: Destroy removes all layer canvases

*For any* engine instance, after `destroy()` is called, the container element SHALL contain zero canvas elements that were created by the layer stack, and the requestAnimationFrame loop SHALL be cancelled.

**Validates: Requirements 8.1, 8.3**

### Property 10: Background skip rate during lerp settling

*For any* camera lerp settling sequence (player stationary, camera converging via 0.12 factor), the background layer SHALL skip draw calls for at least 80% of frames from the moment the camera displacement drops below the threshold until convergence.

**Validates: Requirements 7.1, 7.3**
