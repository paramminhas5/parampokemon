"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { INTERIORS, INTERIOR_W, INTERIOR_H, INTERIOR_EXIT_X, INTERIOR_EXIT_Y } from "@/game/interiors";
import { TILE, T, SOLID, drawTile, drawCharacter } from "@/game/tiles";
import type { Dir } from "@/game/data";
import { playSound } from "@/lib/audio";

// ─── Styles ───────────────────────────────────────────────────────────────
const STYLES = `
@keyframes int-fade-in  { from { opacity:0 } to { opacity:1 } }
@keyframes int-fade-out { from { opacity:1 } to { opacity:0 } }
@keyframes int-slide-up { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
@keyframes int-cursor   { 0%,100%{opacity:1} 50%{opacity:0} }
`;

const WALK_MS = 130;
const SCALE   = 3;   // render each 16-px tile at 3× = 48px on screen

type PlayerState = {
  px: number; py: number;   // smooth (float) position
  tx: number; ty: number;   // target tile
  walkFrom: { x: number; y: number };
  walkStart: number;
  dir: Dir;
  frame: 0 | 1 | 2;
  stepCount: number;
};

type DialogState = {
  name: string; role: string; quote: string;
  shown: number; done: boolean;
} | null;

export function Interior({
  zoneId,
  onExit,
}: {
  zoneId: string;
  onExit: () => void;
}) {
  const interior = INTERIORS[zoneId];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const inputRef  = useRef<Record<string, boolean>>({});

  const [fadeIn,  setFadeIn]  = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [dialog,  setDialog]  = useState<DialogState>(null);
  const dialogRef = useRef<DialogState>(null);

  const playerRef = useRef<PlayerState>({
    px: INTERIOR_EXIT_X, py: INTERIOR_EXIT_Y - 2,
    tx: INTERIOR_EXIT_X, ty: INTERIOR_EXIT_Y - 2,
    walkFrom: { x: INTERIOR_EXIT_X, y: INTERIOR_EXIT_Y - 2 },
    walkStart: 0,
    dir: "up",
    frame: 0,
    stepCount: 0,
  });

  // ─── Solid check ────────────────────────────────────────────────────────
  const isSolid = useCallback((x: number, y: number): boolean => {
    if (!interior) return true;
    if (x < 0 || y < 0 || x >= INTERIOR_W || y >= INTERIOR_H) return true;
    const code = interior.tiles[y][x];
    if (SOLID.has(code)) return true;
    // Exit door tile is passable
    if (code === T.DOOR) return false;
    // NPC positions are solid when dialog not open
    if (!dialogRef.current) {
      for (const npc of interior.npcs) {
        if (npc.x === x && npc.y === y) return true;
      }
    }
    return false;
  }, [interior]);

  // ─── Move ───────────────────────────────────────────────────────────────
  const tryMove = useCallback((dir: Dir) => {
    const s = playerRef.current;
    if (s.px !== s.tx || s.py !== s.ty) return;
    s.dir = dir;
    let nx = s.tx, ny = s.ty;
    if (dir === "up")    ny--;
    if (dir === "down")  ny++;
    if (dir === "left")  nx--;
    if (dir === "right") nx++;

    // Stepping on exit door → exit interior
    if (nx === INTERIOR_EXIT_X && ny === INTERIOR_EXIT_Y) {
      setFadeOut(true);
      setTimeout(() => onExit(), 350);
      playSound("warp");
      return;
    }

    if (isSolid(nx, ny)) { s.frame = 1; return; }

    s.walkFrom = { x: s.tx, y: s.ty };
    s.tx = nx; s.ty = ny;
    s.walkStart = performance.now();
    s.stepCount++;
    s.frame = (s.stepCount % 2 === 0 ? 1 : 2) as 1 | 2;
    if (s.stepCount % 2 === 0) playSound("step");
  }, [isSolid, onExit]);

  // ─── Interact ───────────────────────────────────────────────────────────
  const interact = useCallback(() => {
    if (!interior) return;
    if (dialogRef.current) {
      const d = dialogRef.current;
      if (!d.done) {
        // skip to end
        const updated = { ...d, shown: d.quote.length, done: true };
        dialogRef.current = updated;
        setDialog(updated);
      } else {
        dialogRef.current = null;
        setDialog(null);
      }
      return;
    }
    const s = playerRef.current;
    let fx = s.tx, fy = s.ty;
    if (s.dir === "up")    fy--;
    if (s.dir === "down")  fy++;
    if (s.dir === "left")  fx--;
    if (s.dir === "right") fx++;

    // Exit door interact
    if (fx === INTERIOR_EXIT_X && fy === INTERIOR_EXIT_Y) {
      setFadeOut(true);
      setTimeout(() => onExit(), 350);
      playSound("warp");
      return;
    }

    for (const npc of interior.npcs) {
      if (npc.x === fx && npc.y === fy) {
        const d: DialogState = { name: npc.name, role: npc.role, quote: npc.quote, shown: 0, done: false };
        dialogRef.current = d;
        setDialog(d);
        playSound("menu");
        // Start typewriter
        let i = 0;
        const tick = () => {
          i++;
          const current = dialogRef.current;
          if (!current) return;
          if (i >= npc.quote.length) {
            const done: DialogState = { ...current, shown: npc.quote.length, done: true };
            dialogRef.current = done;
            setDialog(done);
            return;
          }
          const next: DialogState = { ...current, shown: i };
          dialogRef.current = next;
          setDialog({ ...next });
          setTimeout(tick, 22);
        };
        setTimeout(tick, 22);
        return;
      }
    }
  }, [interior, onExit]);

  // ─── Keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      inputRef.current[e.key] = true;
      if ([" ", "Enter", "z", "Z"].includes(e.key)) { e.preventDefault(); interact(); }
      if (["Escape", "x", "X"].includes(e.key)) { e.preventDefault();
        setFadeOut(true); setTimeout(() => onExit(), 350); }
    };
    const onKeyUp = (e: KeyboardEvent) => { inputRef.current[e.key] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, [interact, onExit]);

  // ─── Fade-in ─────────────────────────────────────────────────────────────
  useEffect(() => { const t = setTimeout(() => setFadeIn(false), 350); return () => clearTimeout(t); }, []);

  // ─── Game loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!interior) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    const canvasW = INTERIOR_W * TILE * SCALE;
    const canvasH = INTERIOR_H * TILE * SCALE;
    canvas.width  = canvasW;
    canvas.height = canvasH;

    const loop = (now: number) => {
      const s = playerRef.current;

      // ── Movement ──────────────────────────────────────────────────────
      if (!dialogRef.current) {
        const inp = inputRef.current;
        if (s.px === s.tx && s.py === s.ty) {
          if (inp["ArrowUp"]    || inp["w"] || inp["W"]) tryMove("up");
          else if (inp["ArrowDown"]  || inp["s"] || inp["S"]) tryMove("down");
          else if (inp["ArrowLeft"]  || inp["a"] || inp["A"]) tryMove("left");
          else if (inp["ArrowRight"] || inp["d"] || inp["D"]) tryMove("right");
        }
      }

      // ── Walk interpolation ────────────────────────────────────────────
      if (s.px !== s.tx || s.py !== s.ty) {
        const t = Math.min(1, (now - s.walkStart) / WALK_MS);
        s.px = s.walkFrom.x + (s.tx - s.walkFrom.x) * t;
        s.py = s.walkFrom.y + (s.ty - s.walkFrom.y) * t;
        if (t >= 1) { s.px = s.tx; s.py = s.ty; s.frame = 0; }
      }

      // ── Render ────────────────────────────────────────────────────────
      ctx.save();
      ctx.scale(SCALE, SCALE);

      // Base tiles
      for (let ty2 = 0; ty2 < INTERIOR_H; ty2++) {
        for (let tx2 = 0; tx2 < INTERIOR_W; tx2++) {
          const code = interior.tiles[ty2][tx2];
          const tile  = code === 0 ? interior.floor : code;
          drawTile(ctx, tile, tx2, ty2, tx2 * TILE, ty2 * TILE, now);
        }
      }

      // Exit door label
      {
        const ex = INTERIOR_EXIT_X * TILE + 1;
        const ey = INTERIOR_EXIT_Y * TILE - 6;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(ex - 1, ey - 1, 20, 8);
        ctx.fillStyle = "#ffd24a";
        ctx.font = "5px monospace";
        ctx.fillText("EXIT", ex, ey + 5);
      }

      // NPCs — bob animation
      for (const npc of interior.npcs) {
        const bob = Math.round(Math.sin(now / 800 + npc.x * 1.3) * 1);
        drawCharacter(ctx, npc.kind, "down", 0, npc.x * TILE, npc.y * TILE + bob);
        // Exclamation bubble if not yet talked
        if (!dialogRef.current) {
          const pulse = Math.floor(now / 400) % 2 === 0;
          if (pulse) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(npc.x * TILE + TILE - 4, npc.y * TILE - 7 + bob, 2, 5);
            ctx.fillRect(npc.x * TILE + TILE - 4, npc.y * TILE - 1 + bob, 2, 2);
          }
        }
      }

      // Player (Param)
      {
        const px2 = Math.round(s.px * TILE);
        const py2 = Math.round(s.py * TILE);
        // Floor glow underfoot
        ctx.fillStyle = (interior.accentColor + "28");
        ctx.beginPath();
        ctx.ellipse(px2 + TILE / 2, py2 + TILE - 1, TILE * 0.55, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        drawCharacter(ctx, "player", s.dir, s.frame, px2, py2);
      }

      ctx.restore();

      // ── Ambient accent overlay ────────────────────────────────────────
      ctx.fillStyle = interior.accentColor + "08";
      ctx.fillRect(0, 0, canvasW, canvasH);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [interior, tryMove]);

  if (!interior) return null;

  const canvasW = INTERIOR_W * TILE * SCALE;
  const canvasH = INTERIOR_H * TILE * SCALE;
  const accent  = interior.accentColor;

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 55,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#020508",
      fontFamily: "var(--font-pixel)",
    }}>
      <style>{STYLES}</style>

      {/* Fade overlay */}
      {(fadeIn || fadeOut) && (
        <div style={{
          position: "absolute", inset: 0, background: "#000", zIndex: 70,
          animation: fadeIn ? "int-fade-out 0.35s ease forwards" : "int-fade-in 0.35s ease forwards",
          pointerEvents: "none",
        }} />
      )}

      {/* Header bar */}
      <div style={{
        width: canvasW,
        background: `linear-gradient(90deg, ${accent}22 0%, transparent 80%)`,
        border: `1px solid ${accent}30`,
        borderBottom: "none",
        padding: "5px 10px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 7, color: accent, letterSpacing: "0.12em" }}>
          🏠 {interior.label.toUpperCase()}
        </span>
        <span style={{ fontSize: 6, color: "#3a5070", letterSpacing: "0.1em" }}>
          ARROWS/WASD · SPACE to talk · ESC to exit
        </span>
      </div>

      {/* Canvas */}
      <div style={{ position: "relative", border: `1px solid ${accent}30` }}>
        <canvas
          ref={canvasRef}
          style={{
            imageRendering: "pixelated",
            display: "block",
            width: canvasW,
            height: canvasH,
          }}
        />

        {/* Dialog box */}
        {dialog && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(3,7,18,0.96)",
            border: `2px solid ${accent}55`,
            borderTop: `2px solid ${accent}88`,
            padding: "10px 14px 12px",
            animation: "int-slide-up 0.2s ease-out",
            zIndex: 10,
          }}>
            {/* Name/role header */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: 6,
              borderBottom: `1px solid ${accent}25`,
              paddingBottom: 5,
            }}>
              <span style={{ fontSize: 8, color: accent, letterSpacing: "0.06em" }}>
                {dialog.name}
              </span>
              <span style={{ fontSize: 6, color: "#3a5070" }}>{dialog.role}</span>
            </div>
            {/* Typewriter text */}
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 13,
              color: "#c8d8f0", lineHeight: 1.55,
              whiteSpace: "pre-wrap", minHeight: 52,
            }}>
              {dialog.quote.slice(0, dialog.shown)}
              {!dialog.done && (
                <span style={{ animation: "int-cursor 0.8s step-end infinite" }}>▌</span>
              )}
            </div>
            {/* Advance prompt */}
            {dialog.done && (
              <div style={{
                textAlign: "right", marginTop: 6,
                fontSize: 7, color: accent,
                animation: "int-cursor 1s step-end infinite",
              }}>
                ▶ CLOSE
              </div>
            )}
          </div>
        )}
      </div>

      {/* Touch controls — exit button always visible on mobile */}
      <div style={{
        width: canvasW,
        display: "flex", justifyContent: "space-between",
        padding: "6px 0 0",
        gap: 8,
      }}>
        <button
          onClick={() => { setFadeOut(true); setTimeout(() => onExit(), 350); }}
          style={{
            background: "transparent",
            border: `1px solid ${accent}30`,
            color: "#3a5070",
            fontFamily: "var(--font-pixel)", fontSize: 7,
            padding: "6px 14px",
            cursor: "pointer",
            transition: "all 0.12s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = accent; (e.currentTarget as HTMLButtonElement).style.borderColor = accent + "80"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#3a5070"; (e.currentTarget as HTMLButtonElement).style.borderColor = accent + "30"; }}
        >
          ← EXIT
        </button>
        <button
          onClick={interact}
          style={{
            background: `${accent}18`,
            border: `1px solid ${accent}50`,
            color: accent,
            fontFamily: "var(--font-pixel)", fontSize: 7,
            padding: "6px 14px",
            cursor: "pointer",
          }}
        >
          TALK (A)
        </button>
      </div>
    </div>
  );
}
