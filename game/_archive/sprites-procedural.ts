// Sprites for the player's starter line (Mermander → Mermalion → Merlord)
// and named gym leaders. All procedural pixel art.

import type { LeaderSprite, StarterStage } from "./data";

type Ctx = CanvasRenderingContext2D;

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
}
function px(ctx: Ctx, x: number, y: number, c: string) {
  ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1);
}

// ─── Player starter (front + back) ────────────────────────────
// Each stage shares the same merman silhouette, more elaborate per stage.
export function drawStarter(
  ctx: Ctx,
  stage: StarterStage["id"],
  facing: "front" | "back" | "side",
  x: number,
  y: number,
  scale: number,
  frame = 0,
) {
  const s = scale;
  const r = (dx: number, dy: number, w: number, h: number, c: string) =>
    rect(ctx, x + dx * s, y + dy * s, w * s, h * s, c);
  const p = (dx: number, dy: number, c: string) => px(ctx, x + dx * s, y + dy * s, c);

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(x + 16 * s, y + 30 * s, 10 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const bob = Math.sin(frame / 6) * 0.5;
  const yo = Math.round(bob);

  if (stage === "mermander") {
    // small aqua merman, 24px tall
    const body = "#7ce0ff", dark = "#2a78c0", belly = "#e8f8ff";
    if (facing === "front") {
      // tail fin
      r(11, 24 + yo, 10, 4, body);
      r(9, 22 + yo, 14, 3, body);
      r(8, 26 + yo, 4, 2, dark);
      r(20, 26 + yo, 4, 2, dark);
      // body
      r(12, 14 + yo, 8, 10, body);
      r(13, 13 + yo, 6, 1, body);
      r(13, 15 + yo, 6, 7, belly);
      // arms
      r(10, 16 + yo, 2, 5, body);
      r(20, 16 + yo, 2, 5, body);
      // head
      r(11, 6 + yo, 10, 8, body);
      r(12, 5 + yo, 8, 1, body);
      // crown fin
      r(15, 2 + yo, 2, 4, dark);
      r(13, 4 + yo, 2, 2, dark);
      r(17, 4 + yo, 2, 2, dark);
      // eyes
      p(14, 9 + yo, "#0a0a1a"); p(17, 9 + yo, "#0a0a1a");
      p(13, 9 + yo, "#fff"); p(18, 9 + yo, "#fff");
      // smile
      r(14, 11 + yo, 4, 1, "#1a4a8a");
      // cheek
      p(12, 10 + yo, "#e88aab"); p(19, 10 + yo, "#e88aab");
    } else if (facing === "back") {
      // tail fin
      r(11, 24 + yo, 10, 4, body);
      r(9, 22 + yo, 14, 3, body);
      // body back
      r(12, 14 + yo, 8, 10, body);
      r(13, 13 + yo, 6, 1, body);
      r(11, 16 + yo, 2, 5, body); r(19, 16 + yo, 2, 5, body);
      // head back
      r(11, 6 + yo, 10, 8, body);
      r(15, 2 + yo, 2, 4, dark);
      r(13, 4 + yo, 2, 2, dark);
      r(17, 4 + yo, 2, 2, dark);
      // dorsal stripe
      r(15, 7 + yo, 2, 6, dark);
    }
  } else if (stage === "mermalion") {
    // mid stage — purple, with mane
    const body = "#c89af0", dark = "#6f3aa0", belly = "#f0d4ff", mane = "#5a2a78";
    if (facing === "front") {
      // tail (bigger)
      r(8, 24 + yo, 16, 4, body);
      r(6, 22 + yo, 20, 3, body);
      r(5, 26 + yo, 5, 2, dark);
      r(22, 26 + yo, 5, 2, dark);
      // body
      r(10, 14 + yo, 12, 10, body);
      r(11, 13 + yo, 10, 1, body);
      r(12, 15 + yo, 8, 7, belly);
      // arms with cuffs
      r(8, 16 + yo, 2, 6, body); r(22, 16 + yo, 2, 6, body);
      r(8, 21 + yo, 2, 1, dark); r(22, 21 + yo, 2, 1, dark);
      // mane around neck
      r(9, 12 + yo, 14, 2, mane);
      // head
      r(11, 5 + yo, 10, 9, body);
      r(12, 4 + yo, 8, 1, body);
      // crown
      r(11, 1 + yo, 2, 4, mane);
      r(15, 0 + yo, 2, 5, mane);
      r(19, 1 + yo, 2, 4, mane);
      r(13, 3 + yo, 6, 1, mane);
      // eyes (more focused)
      p(14, 8 + yo, "#0a0a1a"); p(17, 8 + yo, "#0a0a1a");
      r(13, 8 + yo, 1, 1, "#fff"); r(18, 8 + yo, 1, 1, "#fff");
      // determined mouth
      r(14, 11 + yo, 4, 1, "#3a1c4a");
      p(13, 10 + yo, "#e88aab"); p(18, 10 + yo, "#e88aab");
    } else {
      r(8, 24 + yo, 16, 4, body);
      r(10, 14 + yo, 12, 10, body);
      r(9, 12 + yo, 14, 2, mane);
      r(11, 5 + yo, 10, 9, body);
      r(15, 1 + yo, 2, 5, mane);
      r(15, 7 + yo, 2, 8, dark);
    }
  } else {
    // merlord — gold with trident pattern
    const body = "#ffd24a", dark = "#a06820", belly = "#fff0c0", regal = "#e85a3a";
    if (facing === "front") {
      // huge tail
      r(6, 24 + yo, 20, 4, body);
      r(4, 22 + yo, 24, 3, body);
      r(2, 26 + yo, 5, 2, dark);
      r(25, 26 + yo, 5, 2, dark);
      // body
      r(9, 14 + yo, 14, 10, body);
      r(10, 13 + yo, 12, 1, body);
      r(11, 15 + yo, 10, 7, belly);
      // chest emblem
      r(14, 16 + yo, 4, 4, regal);
      px(ctx, x + 16 * s, y + (17 + yo) * s, "#fff");
      // arms
      r(7, 16 + yo, 2, 6, body); r(23, 16 + yo, 2, 6, body);
      // shoulder pads
      r(7, 14 + yo, 3, 2, regal); r(22, 14 + yo, 3, 2, regal);
      // head
      r(11, 5 + yo, 10, 9, body);
      r(12, 4 + yo, 8, 1, body);
      // crown (3 prongs)
      r(11, 0 + yo, 2, 5, regal);
      r(15, -1 + yo, 2, 6, regal);
      r(19, 0 + yo, 2, 5, regal);
      r(11, 3 + yo, 10, 1, regal);
      // gold jewel
      p(16, 1 + yo, "#fff");
      // eyes (intense)
      p(14, 8 + yo, "#1a0a1a"); p(17, 8 + yo, "#1a0a1a");
      r(13, 8 + yo, 1, 1, "#fff"); r(18, 8 + yo, 1, 1, "#fff");
      r(13, 11 + yo, 6, 1, "#5a2c1c");
      p(14, 12 + yo, "#5a2c1c"); p(17, 12 + yo, "#5a2c1c"); // fang
    } else {
      r(6, 24 + yo, 20, 4, body);
      r(9, 14 + yo, 14, 10, body);
      r(11, 5 + yo, 10, 9, body);
      r(15, -1 + yo, 2, 6, regal);
      r(11, 0 + yo, 2, 5, regal);
      r(19, 0 + yo, 2, 5, regal);
      r(15, 7 + yo, 2, 8, dark);
    }
  }
}

// ─── Gym leader sprites (front facing in battle) ──────────────
export function drawGymLeader(ctx: Ctx, leader: LeaderSprite, x: number, y: number, scale: number) {
  const s = scale;
  const r = (dx: number, dy: number, w: number, h: number, c: string) =>
    rect(ctx, x + dx * s, y + dy * s, w * s, h * s, c);
  const p = (dx: number, dy: number, c: string) => px(ctx, x + dx * s, y + dy * s, c);

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(x + 16 * s, y + 30 * s, 10 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const head = (skin: string, hair: string, hairTop = 2) => {
    r(11, 5, 10, 8, skin);
    r(11, hairTop, 10, 4, hair);
    r(10, 4, 1, 5, hair); r(21, 4, 1, 5, hair);
    p(14, 8, "#0a0a0a"); p(17, 8, "#0a0a0a");
    p(15, 11, "#5a2c1c"); p(16, 11, "#5a2c1c");
  };
  const body = (shirt: string, shirtAlt: string, pants: string) => {
    r(9, 13, 14, 10, shirt);
    r(9, 22, 14, 1, shirtAlt);
    r(9, 13, 1, 10, shirtAlt); r(22, 13, 1, 10, shirtAlt);
    // arms
    r(7, 13, 2, 8, shirt); r(23, 13, 2, 8, shirt);
    r(7, 20, 2, 1, "#f0c9a0"); r(23, 20, 2, 1, "#f0c9a0");
    // legs
    r(11, 23, 4, 6, pants); r(17, 23, 4, 6, pants);
    r(11, 28, 4, 1, "#0a0a0a"); r(17, 28, 4, 1, "#0a0a0a");
  };

  switch (leader) {
    case "blankpage": {
      // ghostly artist holding a blank canvas
      head("#f0e8e0", "#1a1a2a");
      body("#3a3848", "#1a1828", "#1a1a2a");
      // canvas held in front
      r(8, 16, 16, 8, "#fafafa");
      r(8, 16, 16, 1, "#666");
      r(8, 23, 16, 1, "#666");
      r(8, 16, 1, 8, "#666"); r(23, 16, 1, 8, "#666");
      // beret
      r(11, 0, 10, 3, "#7a1a1a");
      r(20, 1, 2, 1, "#a02a2a");
      break;
    }
    case "longtail": {
      // merchant with a tag belt and ledger
      head("#e8c098", "#3a2010");
      body("#7ac46a", "#3f7a3a", "#5a3a1c");
      // apron
      r(11, 14, 10, 8, "#f0e0a8");
      r(11, 14, 10, 1, "#a08858");
      // price tags hanging
      r(12, 22, 3, 3, "#f5d24a");
      r(17, 22, 3, 3, "#f5d24a");
      p(13, 23, "#3a2010"); p(18, 23, "#3a2010");
      break;
    }
    case "zerorunway": {
      // landlord with keys and bowler hat
      head("#e8c098", "#1a1a1a");
      body("#a06030", "#5a2c0c", "#2a1810");
      // tie
      r(15, 13, 2, 8, "#1a1a1a");
      r(15, 21, 2, 1, "#000");
      // bowler hat
      r(10, 0, 12, 4, "#1a1a1a");
      r(8, 3, 16, 1, "#1a1a1a");
      // keys
      p(7, 21, "#f5d24a"); p(7, 22, "#f5d24a");
      break;
    }
    case "prehype": {
      // pre-hype scientist with goggles
      head("#d8b890", "#1a1a1a");
      body("#f0f0f0", "#9fbfd8", "#28384a");
      // lab coat lapel
      r(13, 13, 6, 6, "#fafafa");
      r(13, 13, 1, 6, "#9fbfd8"); r(18, 13, 1, 6, "#9fbfd8");
      // bowtie
      r(15, 12, 2, 2, "#3a8acc");
      // goggles
      r(13, 7, 3, 3, "#1a1a2a"); r(16, 7, 3, 3, "#1a1a2a");
      r(13, 8, 3, 1, "#9fe8ff"); r(16, 8, 3, 1, "#9fe8ff");
      break;
    }
    case "termsheet": {
      // VC in dark suit, holding term sheet
      head("#e8c098", "#1a1a1a");
      body("#202028", "#0a0a10", "#101018");
      // pocket square
      r(11, 14, 3, 2, "#f0c4ff");
      // glasses
      r(13, 7, 3, 2, "#1a1a1a"); r(16, 7, 3, 2, "#1a1a1a");
      r(15, 7, 1, 1, "#1a1a1a");
      // term sheet
      r(20, 16, 6, 9, "#fafafa");
      r(20, 16, 6, 1, "#666");
      r(21, 18, 4, 1, "#666"); r(21, 20, 3, 1, "#666"); r(21, 22, 4, 1, "#666");
      break;
    }
    case "noculture": {
      // streetwear skeptic with cap and folded arms
      head("#d8a878", "#1a1a1a");
      // cap
      r(10, 2, 12, 3, "#1a1a1a");
      r(8, 4, 8, 1, "#1a1a1a");
      // hoodie
      body("#ff9fd4", "#a8527a", "#1a1a1a");
      // chain
      r(13, 14, 6, 1, "#f5d24a");
      p(16, 15, "#f5d24a");
      // shades
      r(13, 7, 3, 2, "#0a0a0a"); r(16, 7, 3, 2, "#0a0a0a");
      // sneakers
      r(11, 28, 4, 1, "#fff"); r(17, 28, 4, 1, "#fff");
      break;
    }
    case "blackbox": {
      // hooded crypto figure, faceless
      // body
      body("#0a1428", "#000814", "#000814");
      // hood covers head
      r(9, 0, 16, 12, "#0a1428");
      r(8, 3, 1, 8, "#0a1428"); r(24, 3, 1, 8, "#0a1428");
      // void face
      r(12, 6, 8, 6, "#000");
      // glowing eye slits
      const blink = Math.floor(performance.now() / 300) % 8 === 0 ? "#fff" : "#00e8a0";
      r(13, 8, 2, 1, blink); r(17, 8, 2, 1, blink);
      // ticker on chest
      r(11, 17, 10, 2, "#00e8a0");
      break;
    }
    case "nobrief": {
      // corporate manager with clipboard
      head("#e8c098", "#7a3a2a");
      body("#3a78d8", "#1f4a98", "#2a2a2a");
      // tie
      r(15, 13, 2, 6, "#e83a3a");
      // clipboard
      r(19, 16, 7, 10, "#c8a07a");
      r(19, 16, 7, 1, "#5a3a1c");
      r(20, 18, 5, 1, "#3a2010"); r(20, 20, 4, 1, "#3a2010"); r(20, 22, 5, 1, "#3a2010");
      // angry brow
      r(13, 7, 2, 1, "#000"); r(17, 7, 2, 1, "#000");
      break;
    }
    case "statusquo": {
      // champion king of the status quo — crown + cape
      head("#f0c9a0", "#3a2010");
      // cape
      r(7, 12, 18, 18, "#7a1a3a");
      r(7, 12, 18, 1, "#3a0a1a");
      // body armor over cape
      r(10, 14, 12, 12, "#5a5a6a");
      r(10, 14, 12, 1, "#3a3a4a");
      r(11, 15, 10, 10, "#7a7a8a");
      // chest emblem (status quo "≡")
      r(13, 17, 6, 1, "#f5d24a");
      r(13, 19, 6, 1, "#f5d24a");
      r(13, 21, 6, 1, "#f5d24a");
      // crown
      r(10, -1, 12, 4, "#f5d24a");
      r(11, -3, 2, 3, "#f5d24a"); r(15, -3, 2, 3, "#f5d24a"); r(19, -3, 2, 3, "#f5d24a");
      p(12, -2, "#fff"); p(16, -2, "#e85a3a"); p(20, -2, "#fff");
      // intense brow
      r(13, 6, 2, 1, "#000"); r(17, 6, 2, 1, "#000");
      // legs
      r(11, 26, 4, 3, "#2a2a2a"); r(17, 26, 4, 3, "#2a2a2a");
      break;
    }
  }
}

// ─── Sprite for the player-character (Mermander follower) on overworld ──
export function drawFollower(
  ctx: Ctx, stage: StarterStage["id"], px0: number, py0: number, frame: 0 | 1 | 2,
) {
  // Apply scale transform — drawing is authored at 16px, renders at TILE (48px)
  const S = 3; // TILE / 16 = 48 / 16
  ctx.save();
  ctx.translate(px0, py0);
  ctx.scale(S, S);
  px0 = 0;
  py0 = 0;

  // tiny 16x16 overworld sprite, same palette as starter
  const bob = (frame === 1 ? -1 : 0);
  const palette = stage === "mermander"
    ? { body: "#7ce0ff", dark: "#2a78c0", belly: "#e8f8ff" }
    : stage === "mermalion"
    ? { body: "#c89af0", dark: "#6f3aa0", belly: "#f0d4ff" }
    : { body: "#ffd24a", dark: "#a06820", belly: "#fff0c0" };

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(px0 + 8, py0 + 15, 4, 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail
  rect(ctx, px0 + 4, py0 + 11 + bob, 8, 3, palette.body);
  rect(ctx, px0 + 3, py0 + 12 + bob, 1, 2, palette.dark);
  rect(ctx, px0 + 12, py0 + 12 + bob, 1, 2, palette.dark);
  // body
  rect(ctx, px0 + 5, py0 + 6 + bob, 6, 6, palette.body);
  rect(ctx, px0 + 6, py0 + 8 + bob, 4, 3, palette.belly);
  // crown
  rect(ctx, px0 + 7, py0 + 3 + bob, 2, 3, palette.dark);
  // eyes
  px(ctx, px0 + 6, py0 + 7 + bob, "#0a0a1a");
  px(ctx, px0 + 9, py0 + 7 + bob, "#0a0a1a");

  ctx.restore();
}
