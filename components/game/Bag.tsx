import { useEffect, useRef, useState } from "react";
import { ZONES, STARTER_STAGES, stageForBadges } from "@/game/data";
import { drawStarter } from "@/game/sprites";
import { CREATURE_URL, getSprite, isReady } from "@/game/sprite-registry";

type Tab = "mermander" | "creatures" | "berries" | "badges";

export function Bag({ creatures, skills, badges, onClose }: {
  creatures: Set<string>;
  skills: Set<string>;
  badges: Set<string>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("mermander");
  return (
    <div className="absolute inset-0 z-30 p-2 sm:p-4" onClick={onClose} style={{ background: "rgba(8,16,26,0.85)" }}>
      <div className="pq-panel w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "2px solid var(--color-dialog-border)" }}>
          <div className="pq-label">★ BAG</div>
          <button className="pq-label" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>✕ CLOSE</button>
        </div>
        <div className="flex gap-1 px-2 pt-2 flex-wrap">
          {(["mermander", "creatures", "berries", "badges"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="pq-btn"
              style={{ padding: "6px 10px", opacity: tab === t ? 1 : 0.55, fontSize: 11 }}>
              {t === "mermander" ? "MERMANDER"
                : t === "creatures" ? `CREATURES (${creatures.size})`
                : t === "berries" ? `BERRIES (${skills.size})`
                : `BADGES (${badges.size}/9)`}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-3">
          {tab === "mermander" && <MermanderTab badges={badges} skills={skills} />}
          {tab === "creatures" && <CreaturesTab caught={creatures} />}
          {tab === "berries" && <BerriesTab skills={skills} />}
          {tab === "badges" && <BadgesTab badges={badges} />}
        </div>
      </div>
    </div>
  );
}

function MermanderTab({ badges, skills }: { badges: Set<string>; skills: Set<string> }) {
  const stage = stageForBadges(badges.size);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (ref.current) {
        const c = ref.current.getContext("2d")!;
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 128, 128);
        drawStarter(c, stage.id, "front", 16, 16, 3, performance.now() / 100);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stage.id]);

  const knownMoves = ZONES.filter((z) => z.skill && skills.has(z.skill.id));

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="pq-panel-inner text-center">
        <canvas ref={ref} width={128} height={128}
          style={{ width: 160, height: 160, imageRendering: "pixelated", background: stage.color + "22",
                   border: "3px solid var(--color-dialog-border)", margin: "0 auto" }} />
        <div className="pq-label mt-2" style={{ color: "var(--color-dialog-shadow)" }}>{stage.tag}</div>
        <div style={{ fontFamily: "var(--font-pixel)", fontSize: 18, marginTop: 4 }}>{stage.name.toUpperCase()}</div>
        <div className="pq-text-sm" style={{ marginTop: 4, opacity: 0.7, fontSize: 13 }}>HP {stage.hp}</div>
      </div>

      <div className="pq-panel-inner">
        <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>EVOLUTION</div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {STARTER_STAGES.map((s) => {
            const unlocked = badges.size >= s.minBadges;
            return (
              <div key={s.id} className="text-center" style={{ opacity: unlocked ? 1 : 0.35 }}>
                <div style={{
                  height: 56, background: s.color + "22",
                  border: `2px solid ${s.id === stage.id ? s.accent : "var(--color-dialog-border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-pixel)", fontSize: 9, color: "var(--color-dialog)",
                }}>{unlocked ? s.name.toUpperCase() : "?????"}</div>
                <div className="pq-label" style={{ fontSize: 8, marginTop: 2 }}>
                  {s.minBadges === 0 ? "START" : `${s.minBadges} BADGES`}
                </div>
              </div>
            );
          })}
        </div>
        <div className="pq-label mt-4" style={{ color: "var(--color-dialog-shadow)" }}>KNOWN MOVES ({knownMoves.length})</div>
        <ul className="pq-text-sm mt-2" style={{ listStyle: "none", padding: 0, fontSize: 12 }}>
          {knownMoves.length === 0 && <li style={{ opacity: 0.6 }}>No moves yet. Collect SKILL BERRIES from NPCs in each world.</li>}
          {knownMoves.map((z) => (
            <li key={z.id} style={{ marginTop: 4 }}>
              ▸ <span style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>{z.skill!.name}</span>
              <span style={{ opacity: 0.65 }}> — {z.skill!.type} · PWR {z.skill!.power}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BerriesTab({ skills }: { skills: Set<string> }) {
  const all = ZONES.filter((z) => z.skill);
  return (
    <ul style={{ listStyle: "none", padding: 0 }} className="grid sm:grid-cols-2 gap-2">
      {all.map((z) => {
        const s = z.skill!;
        const has = skills.has(s.id);
        return (
          <li key={s.id} className="pq-panel-inner" style={{ opacity: has ? 1 : 0.45 }}>
            <div className="flex items-start gap-3">
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: has ? z.theme.accent : "transparent",
                border: "2px solid var(--color-dialog-border)",
                boxShadow: has ? "inset 0 -4px 0 rgba(0,0,0,0.25)" : undefined,
              }} />
              <div style={{ minWidth: 0 }}>
                <div className="pq-label" style={{ fontSize: 9 }}>{z.org} · {s.type} · PWR {s.power}</div>
                <div className="pq-text" style={{ fontSize: 14 }}>{has ? s.name : "???"}</div>
                {has && <div className="pq-text-sm" style={{ fontSize: 12, opacity: 0.7 }}>{s.description}</div>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function BadgesTab({ badges }: { badges: Set<string> }) {
  const gymZones = ZONES.filter((z) => z.gym);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {gymZones.map((z) => {
        const has = badges.has(z.badge.id);
        return (
          <div key={z.id} className="text-center pq-panel-inner" style={{ opacity: has ? 1 : 0.35, padding: 8 }}>
            <div style={{
              width: 44, height: 44, margin: "0 auto",
              background: has ? z.badge.color : "transparent",
              border: "2px solid var(--color-dialog-border)",
              boxShadow: has ? "inset 0 0 0 2px #fff8" : undefined,
            }} />
            <div className="pq-label" style={{ fontSize: 8, marginTop: 6 }}>{z.org.toUpperCase()}</div>
            <div className="pq-text-sm" style={{ fontSize: 10, opacity: 0.7 }}>{has ? z.badge.label : "—"}</div>
          </div>
        );
      })}
    </div>
  );
}

function CreaturesTab({ caught }: { caught: Set<string> }) {
  const zonesWithCreature = ZONES.filter((z) => z.creature);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {zonesWithCreature.map((z) => {
        const cr = z.creature!;
        const has = caught.has(cr.id);
        const url = CREATURE_URL[z.id];
        const img = url ? getSprite(url) : null;
        const ready = img ? isReady(img) : false;
        return (
          <div key={cr.id} className="pq-panel-inner text-center" style={{ opacity: has ? 1 : 0.45, padding: 8 }}>
            <div style={{
              width: "100%", aspectRatio: "1 / 1",
              background: z.theme.accent + (has ? "22" : "11"),
              border: `2px solid ${has ? z.theme.accent : "var(--color-dialog-border)"}`,
              borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {has && url ? (
                <img
                  src={url}
                  alt={cr.name}
                  loading="lazy"
                  width={128}
                  height={128}
                  style={{
                    width: "92%", height: "92%", objectFit: "contain",
                    imageRendering: "pixelated",
                    opacity: ready ? 1 : 0.5,
                    filter: has ? "none" : "grayscale(1) brightness(0.4)",
                  }}
                />
              ) : (
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 28, opacity: 0.5, color: "var(--color-dialog)" }}>?</div>
              )}
            </div>
            <div className="pq-label mt-2" style={{ fontSize: 9 }}>{z.org}</div>
            <div className="pq-text" style={{ fontSize: 13, marginTop: 2 }}>{has ? cr.name : "???"}</div>
            <div className="pq-text-sm" style={{ fontSize: 11, opacity: 0.7 }}>{cr.type} · PWR {cr.power}</div>
            {has && <div className="pq-text-sm" style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{cr.description}</div>}
          </div>
        );
      })}
    </div>
  );
}
