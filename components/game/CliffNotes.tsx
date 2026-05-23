import type { Zone } from "@/game/data";
import { useEffect, useRef, useState } from "react";
import { CREATURE_URL, getSprite, isReady } from "@/game/sprite-registry";

const SHEET_STYLES = `
@keyframes pq-sheet-up { from { transform: translateY(24px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes pq-scroll-hint { 0%, 100% { transform: translateX(-50%) translateY(0) } 50% { transform: translateX(-50%) translateY(4px) } }
`;

export function CliffNotes({ zone, onClose }: { zone: Zone; onClose: () => void }) {
  const c = zone.cliff;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollHeight > el.clientHeight + 8);
    check();
    const onScroll = () => {
      if (el.scrollTop > 16) setScrolled(true);
    };
    el.addEventListener("scroll", onScroll);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", onScroll); ro.disconnect(); };
  }, []);

  const creatureUrl = zone.creature ? CREATURE_URL[zone.id] : undefined;
  const creatureImg = creatureUrl ? getSprite(creatureUrl) : null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end sm:items-center justify-center"
      onClick={onClose}
      style={{ background: "rgba(8,16,26,0.55)" }}
    >
      <div
        className="pq-panel w-full sm:max-w-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "85dvh",
          height: "85dvh",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingBottom: "env(safe-area-inset-bottom)",
          animation: "pq-sheet-up 220ms ease-out",
          position: "relative",
        }}
      >
        <style>{SHEET_STYLES}</style>

        {/* Sticky header */}
        <div style={{ flexShrink: 0 }}>
          <div className="mx-auto my-1" style={{ width: 40, height: 4, background: "var(--color-dialog-shadow)", borderRadius: 2, opacity: 0.5 }} />
          <div className="flex items-center justify-between px-3 py-2 gap-2" style={{ borderBottom: "2px solid var(--color-dialog-border)" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>CLIFFNOTES · #{zone.index + 1}</div>
              <div className="pq-text truncate" style={{ fontFamily: "var(--font-pixel)", fontSize: 14 }}>{zone.name.toUpperCase()}</div>
              <div className="pq-text-sm truncate" style={{ opacity: 0.7, fontSize: 13 }}>{c.era}</div>
            </div>
            <button className="pq-btn" onClick={onClose} style={{ padding: "8px 12px", fontSize: 10, flexShrink: 0 }} aria-label="Close">✕ CLOSE</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3"
          style={{ WebkitOverflowScrolling: "touch", minHeight: 0 }}
        >
          <div className="pq-panel-inner mb-3">
            <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>OUTCOME</div>
            <div className="pq-text" style={{ marginTop: 4 }}>{zone.outcome}</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="pq-panel-inner">
              <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>DID</div>
              <ul style={{ listStyle: "none", padding: 0, marginTop: 6 }}>
                {c.did.map((d, i) => <li key={i} className="pq-text-sm" style={{ marginTop: 4, fontSize: 15 }}>▸ {d}</li>)}
              </ul>
            </div>
            <div className="pq-panel-inner">
              <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>LEARNED</div>
              <ul style={{ listStyle: "none", padding: 0, marginTop: 6 }}>
                {c.learned.map((d, i) => <li key={i} className="pq-text-sm" style={{ marginTop: 4, fontSize: 15 }}>▸ {d}</li>)}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {c.metrics.map((m, i) => (
              <div key={i} className="pq-panel-inner text-center">
                <div className="pq-label" style={{ color: "var(--color-dialog-shadow)", fontSize: 9 }}>{m.label}</div>
                <div className="pq-text" style={{ fontSize: 18, marginTop: 2 }}>{m.value}</div>
              </div>
            ))}
          </div>
          {zone.creature && (
            <div className="pq-panel-inner mt-3 flex gap-3 items-center" style={{ borderColor: zone.theme.accent }}>
              {creatureImg && creatureUrl && (
                <img
                  src={creatureUrl}
                  alt={zone.creature.name}
                  width={72}
                  height={72}
                  loading="lazy"
                  style={{
                    width: 72, height: 72, imageRendering: "pixelated",
                    flexShrink: 0,
                    background: zone.theme.accent + "22",
                    border: `2px solid ${zone.theme.accent}`,
                    borderRadius: 4,
                    opacity: isReady(creatureImg) ? 1 : 0.6,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>CREATURE</div>
                <div className="pq-text" style={{ marginTop: 4 }}>{zone.creature.name} <span style={{ opacity: 0.6, fontSize: 14 }}>({zone.creature.type})</span></div>
                <div className="pq-text-sm" style={{ opacity: 0.7, fontSize: 14 }}>{zone.creature.description}</div>
              </div>
            </div>
          )}
          {zone.skill && (
            <div className="pq-panel-inner mt-2">
              <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>SKILL</div>
              <div className="pq-text" style={{ marginTop: 4 }}>{zone.skill.name} <span style={{ opacity: 0.6, fontSize: 14 }}>· PWR {zone.skill.power}</span></div>
              <div className="pq-text-sm" style={{ opacity: 0.7, fontSize: 14 }}>{zone.skill.description}</div>
            </div>
          )}
          <div style={{ height: 28 }} />
        </div>

        {/* Scroll hint affordance */}
        {hasOverflow && !scrolled && (
          <div
            className="pq-label"
            style={{
              position: "absolute",
              left: "50%",
              bottom: "calc(env(safe-area-inset-bottom) + 8px)",
              transform: "translateX(-50%)",
              padding: "4px 10px",
              background: "var(--color-dialog-border)",
              color: "var(--color-dialog-shadow)",
              borderRadius: 12,
              fontSize: 9,
              pointerEvents: "none",
              animation: "pq-scroll-hint 1.4s ease-in-out infinite",
            }}
          >
            ↓ SCROLL FOR MORE
          </div>
        )}
      </div>
    </div>
  );
}