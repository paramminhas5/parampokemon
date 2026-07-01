// Layer stack: manages three stacked canvases (bg, entity, effects).

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
  // Ensure container is positioned for absolute children
  const pos = getComputedStyle(container).position;
  if (pos === "static" || pos === "") {
    container.style.position = "relative";
  }

  function makeCanvas(zIndex: number, alpha: boolean): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const c = document.createElement("canvas");
    c.style.position = "absolute";
    c.style.top = "0";
    c.style.left = "0";
    c.style.width = "100%";
    c.style.height = "100%";
    c.style.imageRendering = "pixelated";
    c.style.zIndex = String(zIndex);
    container.appendChild(c);
    const ctx = c.getContext("2d", { alpha })!;
    ctx.imageSmoothingEnabled = false;
    return [c, ctx];
  }

  const [bg, bgCtx] = makeCanvas(0, false);
  const [entity, entityCtx] = makeCanvas(1, true);
  const [effects, effectsCtx] = makeCanvas(2, true);

  let ro: ResizeObserver | null = null;

  function resize(width: number, height: number): void {
    bg.width = width;
    bg.height = height;
    entity.width = width;
    entity.height = height;
    effects.width = width;
    effects.height = height;
  }

  function applyShake(x: number, y: number): void {
    bg.style.transform = `translate(${x}px, ${y}px)`;
  }

  function clearShake(): void {
    bg.style.transform = "translate(0, 0)";
  }

  function destroy(): void {
    if (ro) {
      ro.disconnect();
      ro = null;
    }
    bg.remove();
    entity.remove();
    effects.remove();
  }

  return {
    bg,
    entity,
    effects,
    bgCtx,
    entityCtx,
    effectsCtx,
    resize,
    applyShake,
    clearShake,
    destroy,
  };
}
