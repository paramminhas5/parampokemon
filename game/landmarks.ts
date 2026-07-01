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
  // Place landmark at the SOUTH ENTRANCE of the zone — at the path just below the building door
  // This creates a decorative gate/arch at the zone's main entrance
  const doorWorldX = zone.ox + zone.building.x + zone.building.doorX;
  const doorWorldY = zone.oy + zone.building.y + zone.building.h;
  const gateCx = doorWorldX * TILE + offX + TILE / 2;
  const gateY  = (doorWorldY - 1) * TILE + offY;

  const url = LANDMARK_URL[zone.id];
  if (url) {
    const img = getSprite(url);
    if (isReady(img)) {
      // Render as a decorative banner/sign above the door arch — 4×3 tiles, framed
      const w = TILE * 4;
      const h = TILE * 3;
      const dx = Math.round(gateCx - w / 2);
      const dy = Math.round(gateY - h - TILE * 0.5);

      // Gate pillar left
      r(ctx, dx - 6, dy + h * 0.2, 6, h * 0.8, "#0d1a30");
      r(ctx, dx - 5, dy + h * 0.2, 3, h * 0.8, "#1a2a40");
      // Gate pillar right
      r(ctx, dx + w, dy + h * 0.2, 6, h * 0.8, "#0d1a30");
      r(ctx, dx + w + 1, dy + h * 0.2, 3, h * 0.8, "#1a2a40");
      // Arch top bar
      r(ctx, dx - 6, dy + h * 0.15, w + 12, 4, zone.theme.accent + "99");
      r(ctx, dx - 6, dy + h * 0.15, w + 12, 2, zone.theme.accent);

      // Image frame background
      ctx.fillStyle = "rgba(2,5,14,0.65)";
      ctx.fillRect(dx - 1, dy - 1, w + 2, h + 2);
      // Accent border
      ctx.strokeStyle = zone.theme.accent + "90";
      ctx.lineWidth = 1;
      ctx.strokeRect(dx, dy, w, h);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, dx, dy, w, h);

      // Overlay to blend with pixel world — dark vignette + color tint
      const grad = ctx.createLinearGradient(dx, dy, dx, dy + h);
      grad.addColorStop(0, "rgba(2,5,14,0.35)");
      grad.addColorStop(0.5, "rgba(2,5,14,0.05)");
      grad.addColorStop(1, "rgba(2,5,14,0.50)");
      ctx.fillStyle = grad;
      ctx.fillRect(dx, dy, w, h);
      // Accent color tint
      ctx.fillStyle = zone.theme.accent + "18";
      ctx.fillRect(dx, dy, w, h);

      // Re-draw border on top
      ctx.strokeStyle = zone.theme.accent + "80";
      ctx.lineWidth = 1;
      ctx.strokeRect(dx, dy, w, h);
      // Corner dots
      ctx.fillStyle = zone.theme.accent;
      ctx.fillRect(dx - 1, dy - 1, 3, 3);
      ctx.fillRect(dx + w - 2, dy - 1, 3, 3);
      ctx.fillRect(dx - 1, dy + h - 2, 3, 3);
      ctx.fillRect(dx + w - 2, dy + h - 2, 3, 3);

      return;
    }
  }

  // ─── Fallback procedural landmarks (when PNG not yet loaded) ─────────
  const cx = zone.ox * TILE + offX + (zone.building.x + zone.building.w / 2) * TILE;
  const baseY = zone.oy * TILE + offY + (zone.building.y - 1) * TILE;
  const id = zone.theme.landmark;

  if (id === "home" || id === "bedroom") {
    // Cozy home: CRT monitor, guitar, notebook, warm glow
    r(ctx, cx - 44, baseY - 38, 38, 30, "#2c1e12"); // TV cabinet
    r(ctx, cx - 42, baseY - 36, 34, 24, "#0d1e38"); // screen
    // Scanline animation
    const sl = Math.floor((now / 180) % 22);
    r(ctx, cx - 42, baseY - 36 + sl, 34, 2, "#2a5a9a");
    r(ctx, cx - 42, baseY - 36 + (sl + 11) % 22, 34, 1, "#1a3a6a");
    r(ctx, cx - 34, baseY - 8, 20, 4, "#1c1208"); // TV stand
    // Screen glow
    ctx.fillStyle = "rgba(30,80,160,0.2)";
    ctx.fillRect(cx - 44, baseY - 40, 38, 34);
    // Guitar
    r(ctx, cx + 8, baseY - 44, 5, 32, "#b86828");
    r(ctx, cx + 6, baseY - 18, 10, 14, "#8a4a1c");
    r(ctx, cx + 8, baseY - 44, 5, 2, "#d88040"); // tuning head
    // Notebook
    r(ctx, cx + 26, baseY - 14, 18, 10, "#e8e0c4");
    r(ctx, cx + 26, baseY - 14, 18, 1, "#c8b890");
    r(ctx, cx + 28, baseY - 12, 14, 1, "#6a5030");
    r(ctx, cx + 28, baseY - 10, 10, 1, "#6a5030");
    // Warm floor glow
    ctx.fillStyle = "rgba(200,140,60,0.12)";
    ctx.beginPath(); ctx.ellipse(cx - 14, baseY, 40, 6, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === "market") {
    // Market stalls: awnings, price board, carts
    for (let i = -1; i <= 1; i++) {
      const x = cx + i * 32 - 18;
      const hue = i === 0 ? "#6ab85a" : i === 1 ? "#5fa04a" : "#7acc68";
      r(ctx, x, baseY - 28, 36, 10, hue); // awning
      // Awning stripes
      for (let s = 0; s < 36; s += 6) r(ctx, x + s, baseY - 28, 3, 10, hue === "#6ab85a" ? "#5aa04a" : "#4a8838");
      r(ctx, x, baseY - 18, 36, 2, "#3a6a2a");
      // Shelf
      r(ctx, x + 2, baseY - 10, 32, 6, "#a87840");
      // Price tag
      r(ctx, x + 6, baseY - 8, 14, 4, "#f5d24a");
      r(ctx, x + 7, baseY - 7, 8, 1, "#3a2010");
      r(ctx, x + 7, baseY - 6, 6, 1, "#3a2010");
    }
    // Central digital display board
    r(ctx, cx - 20, baseY - 42, 40, 14, "#1a2a1a");
    r(ctx, cx - 20, baseY - 42, 40, 1, "#4a8a3a");
    r(ctx, cx - 18, baseY - 40, 36, 10, "#0a1a0a");
    r(ctx, cx - 16, baseY - 38, 10, 2, "#7ac46a");
    r(ctx, cx - 4,  baseY - 38, 8, 2, "#f5d24a");
    r(ctx, cx + 6,  baseY - 38, 8, 2, "#7ac46a");
  } else if (id === "rentals") {
    // Tall apartment block with varied window lights
    for (let i = 0; i < 3; i++) {
      const x = cx - 38 + i * 26;
      const bh = 34 + (i % 2) * 10;
      const bw = 20;
      r(ctx, x, baseY - bh, bw, bh, ["#b06030", "#c47833", "#983810"][i]);
      r(ctx, x, baseY - bh, bw, 3, ["#7a3a18", "#8a4a20", "#6a2810"][i]); // roof line
      // Windows grid
      for (let wy = 4; wy < bh - 5; wy += 7) {
        for (let wx = 3; wx < bw - 3; wx += 7) {
          const on = ((i * 7 + wx + wy * 3) % 4) !== 0;
          const warm = ((i + wx) % 3) === 0;
          r(ctx, x + wx, baseY - bh + wy, 4, 4, on ? (warm ? "#ffe090" : "#f5d24a") : "#2a1810");
        }
      }
      // Ground floor arch entrance
      r(ctx, x + 5, baseY - 6, 10, 6, "#8a4820");
      r(ctx, x + 6, baseY - 5, 8, 5, "#1a0a06");
    }
    // FOR RENT sign
    r(ctx, cx - 12, baseY - 50, 24, 8, "#f5d24a");
    r(ctx, cx - 11, baseY - 49, 22, 6, "#c0a020");
    r(ctx, cx - 9, baseY - 48, 18, 1, "#3a2010");
    r(ctx, cx - 9, baseY - 46, 14, 1, "#3a2010");
  } else if (id === "lab") {
    // Server rack towers + neon arch + blinkenlights
    r(ctx, cx - 50, baseY - 42, 20, 38, "#0e2030");
    r(ctx, cx + 30, baseY - 42, 20, 38, "#0e2030");
    r(ctx, cx - 50, baseY - 42, 20, 3, "#1a4060"); // top accent
    r(ctx, cx + 30, baseY - 42, 20, 3, "#1a4060");
    // Rack lights
    for (let i = 0; i < 7; i++) {
      r(ctx, cx - 47, baseY - 38 + i * 5, 14, 1, "#9fe8ff");
      r(ctx, cx + 33, baseY - 38 + i * 5, 14, 1, "#9fe8ff");
      const blink = Math.floor(now / 250 + i * 3) % 4 === 0;
      r(ctx, cx - 38, baseY - 38 + i * 5, 2, 2, blink ? "#00e8a0" : "#053d2c");
      r(ctx, cx + 46, baseY - 38 + i * 5, 2, 2, blink ? "#9fe8ff" : "#0a2a4a");
    }
    // Overhead neon arch
    r(ctx, cx - 50, baseY - 44, 100, 3, "#9fe8ff");
    r(ctx, cx - 50, baseY - 44, 100, 1, "#7ce0ff");
    // Central glow
    ctx.fillStyle = "rgba(159,232,255,0.08)";
    ctx.beginPath(); ctx.ellipse(cx, baseY - 20, 30, 20, 0, 0, Math.PI * 2); ctx.fill();
    // AI brain symbol
    r(ctx, cx - 10, baseY - 56, 20, 12, "#1a3a58");
    r(ctx, cx - 8,  baseY - 54, 16, 8, "#0a2038");
    for (let i = 0; i < 4; i++) r(ctx, cx - 6 + i * 4, baseY - 52, 2, 4, "#9fe8ff");
  } else if (id === "tower") {
    // Venture capital skyscraper
    const tx = cx - 20;
    r(ctx, tx, baseY - 60, 40, 56, "#2a1448");
    r(ctx, tx, baseY - 60, 40, 4, "#7a40b0"); // roof accent bar
    // Glass window grid
    for (let wy = 6; wy < 52; wy += 7) {
      for (let wx = 4; wx < 36; wx += 8) {
        const lit = ((tx + wy * 2 + wx * 3) * 11) % 5 !== 0;
        const warm = ((wy + wx) % 4) === 0;
        r(ctx, tx + wx, baseY - 60 + wy, 5, 4, lit ? (warm ? "#ffd0ff" : "#e8b8ff") : "#14082a");
      }
    }
    // Antenna + beacon
    r(ctx, cx - 2, baseY - 74, 4, 14, "#c880ff");
    r(ctx, cx - 2, baseY - 74, 4, 2, "#e0a0ff");
    const anim = Math.floor(now / 500) % 2 === 0;
    ctx.fillStyle = anim ? "#ff80ff" : "#aa40aa";
    ctx.beginPath(); ctx.arc(cx, baseY - 76, 3, 0, Math.PI * 2); ctx.fill();
    // Purple glow
    ctx.fillStyle = "rgba(160,100,240,0.15)";
    ctx.beginPath(); ctx.ellipse(cx, baseY, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === "mall") {
    // Sneaker shelves + SOLE neon sign + entrance
    r(ctx, cx - 56, baseY - 30, 112, 5, "#ff9fd4"); // big neon bar
    r(ctx, cx - 56, baseY - 30, 112, 1, "#ffffff");
    r(ctx, cx - 56, baseY - 25, 112, 1, "#aa3070");
    // SOLE sign
    r(ctx, cx - 22, baseY - 44, 44, 12, "#3a0c28");
    r(ctx, cx - 22, baseY - 44, 44, 1, "#ff9fd4");
    r(ctx, cx - 22, baseY - 32, 44, 1, "#ff9fd4");
    // Sneaker shelves (4 columns)
    for (let i = 0; i < 5; i++) {
      const x = cx - 48 + i * 22;
      r(ctx, x, baseY - 22, 18, 18, "#2a0a1e"); // shelf unit
      r(ctx, x, baseY - 22, 18, 1, "#aa3070");
      // 2 sneakers per shelf
      const colors = ["#fff", "#ff9fd4", "#7ce0ff", "#f5d24a", "#00e8a0"];
      r(ctx, x + 2, baseY - 20, 14, 5, colors[i % colors.length]);
      r(ctx, x + 2, baseY - 19, 14, 2, "#1a1a1a"); // sole
      r(ctx, x + 2, baseY - 12, 14, 5, colors[(i + 2) % colors.length]);
      r(ctx, x + 2, baseY - 11, 14, 2, "#1a1a1a");
    }
    // Pink glow floor
    ctx.fillStyle = "rgba(255,159,212,0.08)";
    ctx.beginPath(); ctx.ellipse(cx, baseY, 55, 5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === "trading") {
    // Animated candlestick chart + trading floor
    for (let i = 0; i < 9; i++) {
      const x = cx - 44 + i * 10;
      const up = (i * 7 + 3) % 3 !== 0;
      const bh = 8 + ((i * 11) % 20);
      const wick = 4 + ((i * 7) % 8);
      // Wick
      r(ctx, x + 4, baseY - 4 - wick - bh, 2, wick + bh + 4, "#0a3d2c");
      // Candle body
      r(ctx, x + 2, baseY - 4 - bh, 6, bh, up ? "#00e8a0" : "#e83a3a");
      // Top highlight
      r(ctx, x + 2, baseY - 4 - bh, 6, 1, up ? "#80ffc0" : "#ff8080");
    }
    // Terminal screen
    r(ctx, cx - 26, baseY - 52, 52, 18, "#03180e");
    r(ctx, cx - 26, baseY - 52, 52, 1, "#00e8a0");
    r(ctx, cx - 26, baseY - 34, 52, 1, "#004820");
    for (let i = 0; i < 6; i++) {
      const pulse = (Math.floor(now / 100 + i * 2) % 10) < 7;
      r(ctx, cx - 24 + i * 8, baseY - 48, 6, 1, pulse ? "#00e8a0" : "#004820");
    }
    // Green floor glow
    ctx.fillStyle = "rgba(0,232,160,0.08)";
    ctx.beginPath(); ctx.ellipse(cx, baseY, 45, 5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === "studio") {
    // Turntable + speaker stack + dancing cat
    // Speaker cabinet
    r(ctx, cx - 4, baseY - 28, 18, 24, "#140804");
    r(ctx, cx - 3, baseY - 27, 16, 22, "#1a0c08");
    ctx.fillStyle = "#2a1008";
    ctx.beginPath(); ctx.arc(cx + 5, baseY - 18, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0a0804";
    ctx.beginPath(); ctx.arc(cx + 5, baseY - 18, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a0c08";
    ctx.beginPath(); ctx.arc(cx + 5, baseY - 8, 3, 0, Math.PI * 2); ctx.fill();
    // Turntable deck
    r(ctx, cx - 36, baseY - 22, 30, 18, "#0e0e0e");
    r(ctx, cx - 36, baseY - 22, 30, 1, "#ffd29a");
    // Spinning record
    const angle = now / 500;
    ctx.save();
    ctx.translate(cx - 21, baseY - 13);
    ctx.rotate(angle);
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffd29a";
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(0, 0); ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
    // Cat silhouette
    r(ctx, cx + 20, baseY - 18, 14, 12, "#ffd29a");
    r(ctx, cx + 20, baseY - 20, 3, 4, "#ffd29a"); // ear L
    r(ctx, cx + 30, baseY - 20, 3, 4, "#ffd29a"); // ear R
    r(ctx, cx + 23, baseY - 15, 1, 1, "#0a0a0a"); // eye L
    r(ctx, cx + 29, baseY - 15, 1, 1, "#0a0a0a"); // eye R
    // Spotlight bokeh
    const bob = Math.sin(now / 400) * 2;
    ctx.fillStyle = "rgba(255,210,100,0.18)";
    ctx.beginPath(); ctx.arc(cx + 27, baseY - 14 + bob, 8, 0, Math.PI * 2); ctx.fill();
  } else if (id === "agency") {
    // HQ building + glowing logo + data skyline
    // City skyline silhouette
    for (let i = 0; i < 6; i++) {
      const x = cx - 52 + i * 18;
      const bh = 20 + ((i * 11) % 18);
      const bw = 14;
      r(ctx, x, baseY - bh, bw, bh, "#0a1428");
      for (let wy = 3; wy < bh - 3; wy += 5) {
        for (let wx = 2; wx < bw - 2; wx += 5) {
          r(ctx, x + wx, baseY - bh + wy, 2, 3, "#7ce0ff");
        }
      }
    }
    // Central HQ building (taller)
    r(ctx, cx - 18, baseY - 52, 36, 48, "#0d1e38");
    r(ctx, cx - 18, baseY - 52, 36, 3, "#3a78d8");
    for (let wy = 4; wy < 44; wy += 6) {
      for (let wx = 3; wx < 30; wx += 6) {
        r(ctx, cx - 15 + wx, baseY - 52 + wy, 3, 4, "#7ce0ff");
      }
    }
    // Glowing ∞ infinity symbol
    const t2 = now / 600;
    const glow = 0.5 + Math.sin(t2) * 0.3;
    ctx.fillStyle = `rgba(124,224,255,${glow})`;
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText("∞", cx, baseY - 56);
    ctx.textAlign = "left";
    // Data beam
    r(ctx, cx - 1, baseY - 54, 2, 6, "#7ce0ff");
    // Cyan floor glow
    ctx.fillStyle = "rgba(124,224,255,0.10)";
    ctx.beginPath(); ctx.ellipse(cx, baseY, 30, 5, 0, 0, Math.PI * 2); ctx.fill();
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
