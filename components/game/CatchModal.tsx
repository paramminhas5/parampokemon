import { useEffect, useState } from "react";
import type { Zone } from "@/game/data";
import { CREATURE_URL, POKEBALL_URL, getSprite, isReady } from "@/game/sprite-registry";

type Phase = "intro" | "throwing" | "caught" | "fled";

export function CatchModal({ zone, onCatch, onClose }: {
  zone: Zone;
  onCatch: () => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const cr = zone.creature!;
  const url = CREATURE_URL[zone.id];
  const img = url ? getSprite(url) : null;

  useEffect(() => {
    if (phase !== "throwing") return;
    const t = setTimeout(() => {
      setPhase("caught");
      onCatch();
    }, 1600);
    return () => clearTimeout(t);
  }, [phase, onCatch]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3"
      onClick={phase === "caught" || phase === "fled" ? onClose : undefined}
      style={{ background: "rgba(8,16,26,0.85)" }}
    >
      <div className="pq-panel w-full" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="pq-panel-inner" style={{ padding: 16 }}>
          <div className="pq-label text-center" style={{ color: "var(--color-dialog-shadow)" }}>
            ★ WILD {cr.name.toUpperCase()} APPEARED
          </div>

          <div className="my-4 flex items-center justify-center" style={{
            height: 160, position: "relative",
            background: zone.theme.accent + "22",
            border: `2px solid ${zone.theme.accent}`,
            borderRadius: 4,
          }}>
            {url && img && (
              <img
                src={url}
                alt={cr.name}
                width={128}
                height={128}
                style={{
                  width: 128, height: 128, imageRendering: "pixelated",
                  opacity: phase === "throwing" ? 0.35 : phase === "fled" ? 0.6 : 1,
                  transition: "opacity 200ms",
                  filter: isReady(img) ? "none" : "grayscale(1)",
                }}
              />
            )}
            {phase === "throwing" && (
              <img
                src={POKEBALL_URL}
                alt=""
                width={48}
                height={48}
                style={{
                  position: "absolute",
                  width: 56, height: 56, imageRendering: "pixelated",
                  animation: "pq-shake 0.45s ease-in-out 3",
                  filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.4))",
                }}
              />
            )}
          </div>

          <div className="pq-text-sm text-center" style={{ fontSize: 14, lineHeight: 1.4 }}>
            {phase === "intro" && <>{cr.description}<br /><em style={{ opacity: 0.7 }}>Type: {cr.type} · PWR {cr.power}</em></>}
            {phase === "throwing" && <>You threw a POKÉBALL!<br />Shake… shake… shake…</>}
            {phase === "caught" && <><strong>Gotcha!</strong> {cr.name} joined the team.<br /><span style={{ opacity: 0.7 }}>+ unlocked in BAG</span></>}
            {phase === "fled" && <>{cr.name} got away.<br /><span style={{ opacity: 0.7 }}>(You can try again — just walk back.)</span></>}
          </div>

          <div className="flex gap-2 mt-4">
            {phase === "intro" && (
              <>
                <button className="pq-btn pq-btn-primary flex-1" onClick={() => setPhase("throwing")}>
                  ▶ THROW POKÉBALL
                </button>
                <button className="pq-btn" onClick={() => { setPhase("fled"); }}>RUN</button>
              </>
            )}
            {(phase === "caught" || phase === "fled") && (
              <button className="pq-btn pq-btn-primary flex-1" onClick={onClose}>CONTINUE</button>
            )}
            {phase === "throwing" && (
              <div className="pq-text-sm flex-1 text-center" style={{ opacity: 0.6 }}>…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}