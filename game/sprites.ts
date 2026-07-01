// Overworld follower sprite (tiny 16px procedural pixel art).
// The large drawStarter / drawGymLeader procedural sprites have been archived
// to game/_archive/sprites-procedural.ts — replaced by HD PNG sprites.

import type { StarterStage } from "./data";

type Ctx = CanvasRenderingContext2D;

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
}
function px(ctx: Ctx, x: number, y: number, c: string) {
  ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1);
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
