"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { GameDialog } from "./Game";
import type { NpcKind } from "@/game/data";
import { drawCharacter } from "@/game/tiles";

const CHARS_PER_FRAME = 1;
const FRAME_MS = 26;

// Maps NPC kind → accent color for portrait border
const KIND_ACCENT: Partial<Record<NpcKind | "sign" | "badge", string>> = {
  investor:    "#f0c4ff",
  engineer:    "#9fe8ff",
  celeb:       "#ffd29a",
  client:      "#a06fc4",
  fan:         "#f5d24a",
  tenant:      "#f6a268",
  professor:   "#a8d39a",
  mom:         "#ff9fd4",
  rival:       "#f0c4ff",
  "trainer-m": "#7ce0ff",
  "trainer-f": "#ff9fd4",
  sign:        "#5570aa",
  badge:       "#ffd24a",
};
function NpcPortrait({ kind, accent }: { kind: NpcKind; accent: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const c = ref.current?.getContext("2d");
      if (c) {
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 48, 48);
        // Draw character centered in 48x48
        drawCharacter(c, kind, "down", 0, 8, 10);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [kind]);

  return (
    <div style={{
      width: 40, height: 40, flexShrink: 0,
      border: `2px solid ${accent}60`,
      background: `${accent}10`,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <canvas ref={ref} width={48} height={48}
        style={{ imageRendering: "pixelated", width: 36, height: 36 }} />
      {/* Corner glow */}
      <div style={{
        position: "absolute", inset: 0,
        boxShadow: `inset 0 0 12px ${accent}30`,
        pointerEvents: "none",
      }} />
    </div>
  );
}

export function DialogBox({ dialog, onClose }: { dialog: NonNullable<GameDialog>; onClose: () => void }) {
  const singleText = dialog.type === "npc"
    ? dialog.quote
    : dialog.type === "sign"
    ? dialog.text
    : `${dialog.label} obtained!\n\n${dialog.outcome}`;

  // Multi-beat support: npc dialogs can have a beats array
  const beats: string[] = (dialog.type === "npc" && dialog.beats && dialog.beats.length > 0)
    ? dialog.beats
    : [singleText];

  const [beatIndex, setBeatIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  const currentText = beats[beatIndex];
  const isLastBeat = beatIndex === beats.length - 1;

  // Reset typewriter whenever beat changes
  useEffect(() => {
    setShown(0);
    setDone(false);
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i += CHARS_PER_FRAME;
      if (i >= currentText.length) {
        setShown(currentText.length);
        setDone(true);
        return;
      }
      setShown(i);
      setTimeout(tick, FRAME_MS);
    };
    const id = setTimeout(tick, FRAME_MS);
    return () => { cancelled = true; clearTimeout(id); };
  }, [currentText, beatIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(() => {
    if (!done) {
      // Finish typing current beat instantly
      setShown(currentText.length);
      setDone(true);
    } else if (!isLastBeat) {
      // Advance to next beat
      setBeatIndex(b => b + 1);
    } else {
      // Final beat — close
      onClose();
    }
  }, [done, isLastBeat, currentText.length, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === "Escape") {
        e.preventDefault();
        advance();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  const isNpc   = dialog.type === "npc";
  const isBadge = dialog.type === "badge";
  const isSign  = dialog.type === "sign";

  const accentColor = isNpc
    ? (KIND_ACCENT[dialog.kind as NpcKind] ?? "#7ce0ff")
    : isBadge ? "#ffd24a" : "#5570aa";

  const headerLabel = isNpc
    ? dialog.name
    : isBadge ? "★ BADGE GET"
    : "★ NOTICE";

  const subLabel = isNpc ? dialog.role : undefined;

  // Beat progress indicator (e.g. "1 / 3") shown when more beats remain
  const showBeatCount = beats.length > 1;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center"
      onClick={() => advance()}
      style={{
        background: "rgba(0,0,0,0.28)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
        paddingLeft: 6,
        paddingRight: 6,
      }}
    >
      <div style={{
        maxWidth: 580, width: "100%",
        background: "var(--color-dialog-bg)",
        border: `2px solid ${accentColor}cc`,
        outline: `1px solid ${accentColor}25`,
        outlineOffset: `-4px`,
        boxShadow: `inset 0 -2px 0 rgba(0,0,0,0.4), 0 0 20px ${accentColor}15`,
        position: "relative",
      }}>
        {/* Header with portrait */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 10px",
          borderBottom: `1px solid ${accentColor}50`,
          background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 60%)`,
        }}>
          {isNpc && dialog.kind && (
            <NpcPortrait kind={dialog.kind as NpcKind} accent={accentColor} />
          )}
          {isBadge && (
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              background: `${accentColor}20`,
              border: `2px solid ${accentColor}60`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: accentColor,
            }}>★</div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 8,
              color: accentColor, letterSpacing: "0.06em",
            }}>{headerLabel}</div>
            {subLabel && (
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: "var(--color-dialog-shadow)", marginTop: 2,
              }}>{subLabel}</div>
            )}
          </div>
          {/* Beat indicator */}
          {showBeatCount && (
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 6,
              color: accentColor + "70", letterSpacing: "0.08em",
              flexShrink: 0,
            }}>{beatIndex + 1}/{beats.length}</div>
          )}
        </div>

        {/* Text body */}
        <div style={{ padding: "8px 10px 12px" }}>
          <div className="pq-text" style={{
            whiteSpace: "pre-wrap", minHeight: 40,
            fontSize: "clamp(13px, 3.5vw, 17px)", lineHeight: 1.45,
          }}>
            {currentText.slice(0, shown)}
            {!done && <span className="pq-blink">▌</span>}
          </div>
        </div>

        {/* Arrow: blinks when done. On last beat it means "close", otherwise "next" */}
        {done && <div className="pq-dialog-arrow" />}
      </div>
    </div>
  );
}
