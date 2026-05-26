// Per-zone large decorative landmark sprites drawn on top of the world.
// One landmark per zone, centered above the building.

import { TILE } from "./tiles";
import type { Zone } from "./data";
import { LANDMARK_URL, getSprite, isReady } from "./sprite-registry";

type Ctx = CanvasRenderingContext2D;

function r(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
}

/** Draw a landmark for a zone at the zone's pixel origin (top-left of zone). */
export function drawLandmark(ctx: Ctx, zone: Zone, offX: number, offY: number, now: number) {
  // Anchor: above the building, centred in world pixel space
  const cx = zone.ox * TILE + offX + (zone.building.x + zone.building.w / 2) * TILE;
  const baseY = zone.oy * TILE + offY + (zone.building.y - 1) * TILE;

  // Prefer the high-fidelity PNG landmark when loaded; fall back to the
  // procedural pixel illustration so nothing pops in/out empty.
  const url = LANDMARK_URL[zone.id];
  if (url) {
    const img = getSprite(url);
    if (isReady(img)) {
      // Render at ~5 tiles wide, anchored above the building roof.
      const w = TILE * 5;
      const h = TILE * 5;
      const dx = Math.round(cx - w / 2);
      const dy = Math.round(baseY - h + TILE * 0.5);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, dx, dy, w, h);
      return;
    }
  }

  const id = zone.theme.landmark;

  if (id === "home" || id === "bedroom") {
    // CRT TV + guitar + notebook stack
    r(ctx, cx - 36, baseY - 28, 28, 24, "#3a2a1a"); // tv case
    r(ctx, cx - 34, baseY - 26, 24, 18, "#1a2a3a"); // screen
    // scanline anim
    const sl = Math.floor((now / 200) % 18);
    r(ctx, cx - 34, baseY - 26 + sl, 24, 1, "#3a8acc");
    r(ctx, cx - 28, baseY - 6, 16, 3, "#2a1a10"); // stand
    // guitar
    r(ctx, cx + 6, baseY - 30, 4, 22, "#c47833");
    r(ctx, cx + 4, baseY - 10, 8, 10, "#7a4d28");
    // notebook
    r(ctx, cx + 18, baseY - 8, 14, 6, "#e8e0c8");
    r(ctx, cx + 18, baseY - 8, 14, 1, "#c0a868");
  } else if (id === "market") {
    // market awnings + price tags
    for (let i = -1; i <= 1; i++) {
      const x = cx + i * 26 - 16;
      r(ctx, x, baseY - 22, 32, 8, i === 0 ? "#7ac46a" : "#5fb255"); // awning
      r(ctx, x, baseY - 14, 32, 2, "#3f7a3a");
      // tag
      r(ctx, x + 8, baseY - 8, 10, 8, "#f5d24a");
      r(ctx, x + 9, baseY - 6, 6, 1, "#3a2010");
      r(ctx, x + 9, baseY - 4, 5, 1, "#3a2010");
    }
  } else if (id === "rentals") {
    // tall apartment block silhouettes
    for (let i = 0; i < 3; i++) {
      const x = cx - 30 + i * 22;
      const h = 30 + (i % 2) * 8;
      r(ctx, x, baseY - h, 18, h, "#c47833");
      r(ctx, x, baseY - h, 18, 2, "#5a2c0c");
      // windows
      for (let wy = 4; wy < h - 6; wy += 6) {
        for (let wx = 2; wx < 16; wx += 6) {
          const on = ((i * 7 + wx + wy) % 5) !== 0;
          r(ctx, x + wx, baseY - h + wy, 3, 3, on ? "#f5d24a" : "#3a2418");
        }
      }
    }
  } else if (id === "lab") {
    // server racks + neon arch
    r(ctx, cx - 40, baseY - 30, 16, 26, "#1f3548");
    r(ctx, cx + 24, baseY - 30, 16, 26, "#1f3548");
    for (let i = 0; i < 5; i++) {
      r(ctx, cx - 38, baseY - 28 + i * 5, 12, 1, "#9fe8ff");
      r(ctx, cx + 26, baseY - 28 + i * 5, 12, 1, "#9fe8ff");
      const blink = Math.floor(now / 300 + i) % 3 === 0;
      r(ctx, cx - 28, baseY - 28 + i * 5, 1, 1, blink ? "#00e8a0" : "#3a8acc");
      r(ctx, cx + 36, baseY - 28 + i * 5, 1, 1, blink ? "#00e8a0" : "#3a8acc");
    }
    // arch
    r(ctx, cx - 22, baseY - 24, 44, 2, "#9fe8ff");
  } else if (id === "tower") {
    // venture tower
    const tx = cx - 16;
    r(ctx, tx, baseY - 50, 32, 46, "#3f2266");
    r(ctx, tx, baseY - 50, 32, 4, "#9a6fc4");
    for (let wy = 6; wy < 44; wy += 6) {
      for (let wx = 4; wx < 28; wx += 6) {
        const lit = ((tx + wy + wx) * 7) % 3 !== 0;
        r(ctx, tx + wx, baseY - 50 + wy, 3, 3, lit ? "#f0c4ff" : "#1a0a2a");
      }
    }
    // antenna
    r(ctx, cx - 1, baseY - 60, 2, 10, "#f0c4ff");
  } else if (id === "mall") {
    // sneaker shelves + neon SOLE sign
    r(ctx, cx - 44, baseY - 24, 88, 4, "#ff9fd4"); // neon bar
    r(ctx, cx - 44, baseY - 24, 88, 1, "#fff");
    // shelves of sneakers
    for (let i = 0; i < 4; i++) {
      const x = cx - 36 + i * 20;
      r(ctx, x, baseY - 14, 16, 4, "#4a1240");
      // sneaker silhouette
      r(ctx, x + 2, baseY - 18, 12, 4, ["#fff", "#ff9fd4", "#7ce0ff", "#f5d24a"][i]);
      r(ctx, x + 2, baseY - 16, 12, 2, "#1a1a1a");
    }
  } else if (id === "trading") {
    // candlesticks + green matrix
    for (let i = 0; i < 8; i++) {
      const x = cx - 40 + i * 10;
      const up = (i % 3) !== 1;
      const h = 10 + ((i * 13) % 16);
      r(ctx, x + 4, baseY - 30, 2, 28, "#0a3d2c");
      r(ctx, x + 2, baseY - 4 - h, 6, h, up ? "#00e8a0" : "#e83a3a");
    }
  } else if (id === "studio") {
    // turntables + cat silhouette
    r(ctx, cx - 30, baseY - 14, 24, 10, "#1a1a1a");
    r(ctx, cx - 30, baseY - 14, 24, 1, "#ffd29a");
    // record
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath(); ctx.arc(cx - 18, baseY - 9, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffd29a"; ctx.beginPath(); ctx.arc(cx - 18, baseY - 9, 2, 0, Math.PI * 2); ctx.fill();
    // speakers
    r(ctx, cx - 4, baseY - 20, 12, 16, "#3a1c14");
    ctx.fillStyle = "#1a0a06"; ctx.beginPath(); ctx.arc(cx + 2, baseY - 12, 4, 0, Math.PI * 2); ctx.fill();
    // cat
    r(ctx, cx + 16, baseY - 12, 10, 8, "#ffd29a");
    r(ctx, cx + 16, baseY - 14, 2, 3, "#ffd29a"); // ear
    r(ctx, cx + 23, baseY - 14, 2, 3, "#ffd29a"); // ear
    r(ctx, cx + 18, baseY - 10, 1, 1, "#0a0a0a"); r(ctx, cx + 22, baseY - 10, 1, 1, "#0a0a0a");
  } else if (id === "agency") {
    // big neon "AI" logo + skyline
    for (let i = 0; i < 5; i++) {
      const x = cx - 40 + i * 18;
      const h = 18 + ((i * 11) % 14);
      r(ctx, x, baseY - h, 14, h, "#1a3858");
      // window grid
      for (let wy = 2; wy < h - 2; wy += 4) {
        for (let wx = 2; wx < 12; wx += 4) {
          r(ctx, x + wx, baseY - h + wy, 2, 2, "#7ce0ff");
        }
      }
    }
    // glowing "A"
    r(ctx, cx - 6, baseY - 44, 12, 2, "#7ce0ff");
    r(ctx, cx - 6, baseY - 44, 2, 14, "#7ce0ff");
    r(ctx, cx + 4, baseY - 44, 2, 14, "#7ce0ff");
    r(ctx, cx - 6, baseY - 38, 12, 2, "#7ce0ff");
  }
}

// ─── Creature sprite (used in bag + battle) ───────────────────
export function drawCreature(ctx: Ctx, shape: string, color: string, x: number, y: number, scale = 2) {
  const s = scale;
  const px = (dx: number, dy: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x + dx * s, y + dy * s, s, s); };
  const rect = (dx: number, dy: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x + dx * s, y + dy * s, w * s, h * s); };

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(x + 8 * s, y + 15 * s, 6 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const dark = shade(color, 0.6);
  switch (shape) {
    case "blob":
      rect(3, 6, 10, 8, color); rect(4, 5, 8, 1, color); rect(2, 8, 1, 4, color); rect(13, 8, 1, 4, color);
      px(5, 9, "#fff"); px(10, 9, "#fff"); px(5, 9, "#000"); px(10, 9, "#000");
      rect(6, 12, 4, 1, dark);
      break;
    case "spark":
      rect(6, 4, 4, 10, color); rect(4, 6, 8, 6, color); rect(7, 2, 2, 2, color);
      rect(7, 14, 2, 2, color); rect(2, 8, 2, 2, color); rect(12, 8, 2, 2, color);
      px(6, 8, "#000"); px(9, 8, "#000"); px(6, 8, "#fff"); px(9, 8, "#fff");
      break;
    case "rhino":
      rect(2, 8, 12, 6, color); rect(3, 7, 10, 1, color); rect(4, 14, 2, 1, dark); rect(10, 14, 2, 1, dark);
      rect(13, 9, 2, 3, color); // head
      rect(14, 8, 1, 2, "#fff"); // horn
      px(13, 10, "#000");
      break;
    case "bird":
      rect(5, 5, 6, 8, color); rect(4, 6, 1, 5, color); rect(11, 6, 1, 5, color);
      rect(7, 3, 2, 2, color); // head
      rect(8, 4, 2, 1, "#f5d24a"); // beak
      rect(3, 9, 2, 1, color); rect(11, 9, 2, 1, color); // wings
      px(7, 4, "#000");
      break;
    case "cat":
      rect(3, 7, 10, 7, color); rect(4, 6, 8, 1, color);
      rect(3, 5, 2, 2, color); rect(11, 5, 2, 2, color); // ears
      px(5, 9, "#000"); px(10, 9, "#000");
      rect(7, 10, 2, 1, dark); // nose
      rect(2, 13, 12, 1, dark);
      break;
    case "wisp":
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x + 8 * s, y + 8 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = shade(color, 1.3);
      ctx.beginPath(); ctx.arc(x + 6 * s, y + 6 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
      px(7, 8, "#000"); px(10, 8, "#000");
      break;
    case "lynx":
      rect(2, 8, 12, 6, color); rect(3, 7, 10, 1, color);
      rect(2, 5, 2, 3, color); rect(12, 5, 2, 3, color); // tall ears
      px(2, 5, dark); px(13, 5, dark);
      px(5, 10, "#000"); px(10, 10, "#000");
      rect(7, 11, 2, 1, dark);
      break;
    case "core":
      // rotating gradient core
      rect(4, 4, 8, 8, color);
      rect(5, 3, 6, 1, color); rect(5, 12, 6, 1, color);
      rect(3, 5, 1, 6, color); rect(12, 5, 1, 6, color);
      rect(6, 6, 4, 4, "#fff");
      rect(7, 7, 2, 2, color);
      // orbits
      px(2, 8, "#fff"); px(13, 8, "#fff"); px(8, 2, "#fff"); px(8, 13, "#fff");
      break;
  }
}

function shade(hex: string, amt: number) {
  const c = hex.replace("#", "");
  const n = parseInt(c, 16);
  const r1 = Math.max(0, Math.min(255, Math.floor(((n >> 16) & 255) * amt)));
  const g1 = Math.max(0, Math.min(255, Math.floor(((n >> 8) & 255) * amt)));
  const b1 = Math.max(0, Math.min(255, Math.floor((n & 255) * amt)));
  return `#${((1 << 24) + (r1 << 16) + (g1 << 8) + b1).toString(16).slice(1)}`;
}
