import { useEffect, useState } from "react";
import type { GameDialog } from "./Game";

const CHARS_PER_FRAME = 1;
const FRAME_MS = 28;

export function DialogBox({ dialog, onClose }: { dialog: NonNullable<GameDialog>; onClose: () => void }) {
  const fullText = dialog.type === "npc" ? dialog.quote : dialog.type === "sign" ? dialog.text : `${dialog.label} obtained!\n\n${dialog.outcome}`;
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown(0);
    setDone(false);
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i += CHARS_PER_FRAME;
      if (i >= fullText.length) {
        setShown(fullText.length);
        setDone(true);
        return;
      }
      setShown(i);
      setTimeout(tick, FRAME_MS);
    };
    const id = setTimeout(tick, FRAME_MS);
    return () => { cancelled = true; clearTimeout(id); };
  }, [fullText]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === "Escape") {
        e.preventDefault();
        if (!done) { setShown(fullText.length); setDone(true); }
        else onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, fullText.length, onClose]);

  const header =
    dialog.type === "npc" ? `${dialog.name} — ${dialog.role}` :
    dialog.type === "badge" ? "★ BADGE GET" :
    "Sign";

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center"
      // Tap anywhere outside the dialog box to advance/close.
      onClick={() => done ? onClose() : (setShown(fullText.length), setDone(true))}
      style={{
        background: "rgba(0,0,0,0.25)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
        paddingLeft: 8,
        // Keep dialog clear of the right HUD column on mobile.
        paddingRight: 84,
      }}
    >
      <div className="pq-panel" style={{ maxWidth: 720, width: "100%" }}>
        <div className="pq-panel-inner">
          <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>{header}</div>
          <div className="pq-text" style={{ marginTop: 6, whiteSpace: "pre-wrap", minHeight: 64, fontSize: 18, lineHeight: 1.3 }}>
            {fullText.slice(0, shown)}
            {!done && <span className="pq-blink">▌</span>}
          </div>
        </div>
        {done && <div className="pq-dialog-arrow" />}
      </div>
    </div>
  );
}
