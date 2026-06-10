"use client";
/**
 * PixiFilterOverlay
 *
 * Renders a transparent WebGL canvas on top of the game canvas using PixiJS.
 * Applies a CRT scanline + subtle bloom/glow post-processing effect
 * without touching the existing Canvas 2D game engine.
 *
 * Architecture:
 *  - Game canvas (Canvas 2D) renders the game normally underneath
 *  - This overlay canvas (WebGL via PixiJS) sits on top with pointer-events: none
 *  - PixiJS captures the game canvas as a texture each frame and runs GPU filters
 *  - The filtered result is drawn back, creating bloom + CRT on top of pixel art
 */

import { useEffect, useRef } from "react";

interface Props {
  /** The source game canvas to apply effects to */
  sourceCanvas: HTMLCanvasElement | null;
  /** Whether to show CRT scanlines */
  crt?: boolean;
  /** Whether to show bloom glow */
  bloom?: boolean;
  /** CRT line contrast 0–1, default 0.12 */
  lineContrast?: number;
  /** CRT vignetting strength 0–1, default 0.18 */
  vignetting?: number;
  /** Bloom strength, default 1.5 */
  bloomStrength?: number;
}

export function PixiFilterOverlay({
  sourceCanvas,
  crt = true,
  bloom = true,
  lineContrast = 0.12,
  vignetting = 0.18,
  bloomStrength = 1.5,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!sourceCanvas || !overlayRef.current) return;

    let destroyed = false;

    async function init() {
      if (!sourceCanvas || !overlayRef.current) return;

      // Dynamic import so PixiJS (heavy, WebGL) only loads client-side
      const [
        { Application, Sprite, Texture, RenderTexture },
        { CRTFilter },
        { BloomFilter },
      ] = await Promise.all([
        import("pixi.js"),
        import("pixi-filters/crt"),
        import("pixi-filters/bloom"),
      ]);

      if (destroyed) return;

      const app = new Application();
      await app.init({
        width:           sourceCanvas.width,
        height:          sourceCanvas.height,
        backgroundAlpha: 0,           // fully transparent — game canvas shows through
        antialias:       false,        // pixel art — no smoothing
        preference:      "webgl",
        resolution:      1,
      });

      if (destroyed) { app.destroy(); return; }

      // Mount PixiJS canvas over the game canvas
      const pixiCanvas = app.canvas as HTMLCanvasElement;
      pixiCanvas.style.cssText = [
        "position:absolute",
        "inset:0",
        "width:100%",
        "height:100%",
        "pointer-events:none",
        "image-rendering:pixelated",
        "z-index:5",                  // above game canvas (z:1) but below React UI (z:20+)
      ].join(";");
      overlayRef.current!.appendChild(pixiCanvas);

      // ── Sprite that shows a copy of the game canvas each frame ──────────
      // We snapshot the game canvas into a PixiJS texture every frame
      // and run GPU filters on it.
      const gameTexture  = Texture.from(sourceCanvas);
      const filterSprite = new Sprite(gameTexture);
      filterSprite.width  = sourceCanvas.width;
      filterSprite.height = sourceCanvas.height;

      // ── Filters ──────────────────────────────────────────────────────────
      const activeFilters: import("pixi.js").Filter[] = [];

      let crtFilter: InstanceType<typeof CRTFilter> | null = null;
      if (crt) {
        crtFilter = new CRTFilter({
          lineWidth:       1.0,
          lineContrast,
          verticalLine:    false,
          noise:           0.06,
          noiseSize:       1.2,
          seed:            0,
          vignetting,
          vignettingAlpha: 0.55,
          vignettingBlur:  0.25,
          curvature:       0.5,
          time:            0,
        });
        activeFilters.push(crtFilter);
      }

      if (bloom) {
        const bloomFilter = new BloomFilter({
          strength:   bloomStrength,
          quality:    3,
          resolution: 1,
          kernelSize: 5,
        });
        activeFilters.push(bloomFilter);
      }

      filterSprite.filters = activeFilters;
      app.stage.addChild(filterSprite);

      // ── Render loop ───────────────────────────────────────────────────────
      // Each frame: update the texture from the live game canvas, advance CRT time
      let frame = 0;
      app.ticker.add(() => {
        frame++;
        // Refresh texture from game canvas every frame
        gameTexture.source.update();

        // Animate CRT scanline scroll
        if (crtFilter) {
          crtFilter.time = frame * 0.5;
          crtFilter.seed = Math.random();
        }
      });

      // ── Resize handler ───────────────────────────────────────────────────
      function onResize() {
        if (!sourceCanvas) return;
        app.renderer.resize(sourceCanvas.width, sourceCanvas.height);
        filterSprite.width  = sourceCanvas.width;
        filterSprite.height = sourceCanvas.height;
      }
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(sourceCanvas);

      cleanupRef.current = () => {
        resizeObserver.disconnect();
        app.destroy(true);
        pixiCanvas.remove();
      };
    }

    init().catch(console.error);

    return () => {
      destroyed = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCanvas]);

  return (
    <div
      ref={overlayRef}
      style={{
        position:      "absolute",
        inset:         0,
        pointerEvents: "none",
        zIndex:        5,
      }}
    />
  );
}
