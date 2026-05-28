import { useEffect, useRef, useState } from "react";
import { ZONES, STARTER_STAGES, stageForBadges } from "@/game/data";
import { drawStarter } from "@/game/sprites";
import { CREATURE_URL, PLAYER_FRONT_URL, FOLLOWER_SPRITE_URL } from "@/game/sprite-registry";

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
  const pngSrc = PLAYER_FRONT_URL[stage.id] ?? PLAYER_FRONT_URL.mermander;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="pq-panel-inner text-center">
        {/* Try PNG first, fallback to canvas */}
        <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
          <img
            src={pngSrc}
            alt={stage.name}
            style={{
              width: 160, height: 160, imageRendering: "pixelated",
              objectFit: "contain",
              background: stage.color + "22",
              border: "3px solid var(--color-dialog-border)",
              filter: `drop-shadow(0 0 16px ${stage.accent}80)`,
            }}
            onError={(e: { currentTarget: HTMLImageElement }) => {
              e.currentTarget.style.display = "none";
              if (ref.current) ref.current.style.display = "block";
            }}
          />
          <canvas ref={ref} width={128} height={128}
            style={{ width: 160, height: 160, imageRendering: "pixelated",
                     background: stage.color + "22",
                     border: "3px solid var(--color-dialog-border)",
                     position: "absolute", inset: 0,
                     display: "none" }} />
        </div>
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
                  height: 72, background: s.color + "22",
                  border: `2px solid ${s.id === stage.id ? s.accent : "var(--color-dialog-border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", position: "relative",
                  boxShadow: s.id === stage.id ? `0 0 12px ${s.accent}60` : "none",
                }}>
                  {unlocked ? (
                    <img
                      src={FOLLOWER_SPRITE_URL[s.id]}
                      alt={s.name}
                      style={{ width: 56, height: 56, imageRendering: "pixelated", objectFit: "contain" }}
                      onError={e => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: "var(--color-dialog)" }}>?????</span>
                  )}
                  {s.id === stage.id && (
                    <div style={{ position: "absolute", bottom: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: s.accent }} />
                  )}
                </div>
                <div className="pq-label" style={{ fontSize: 8, marginTop: 2 }}>
                  {unlocked ? s.name.toUpperCase() : "?????"}
                </div>
                <div className="pq-label" style={{ fontSize: 7, opacity: 0.6 }}>
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

// ─── Pokédex Tab ─────────────────────────────────────────────────────────────
const DEX_STYLES = `
@keyframes dex-slide-in  { from { opacity:0; transform:translateX(18px) } to { opacity:1; transform:translateX(0) } }
@keyframes dex-fade-in   { from { opacity:0 } to { opacity:1 } }
@keyframes dex-sprite-in { from { opacity:0; transform:scale(0.82) } to { opacity:1; transform:scale(1) } }
@keyframes dex-scan      { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
`;

function CreaturesTab({ caught }: { caught: Set<string> }) {
  const zonesWithCreature = ZONES.filter((z) => z.creature);
  const [selected, setSelected] = useState<string | null>(
    zonesWithCreature.find(z => caught.has(z.creature!.id))?.id ?? zonesWithCreature[0].id
  );

  const selZone = zonesWithCreature.find(z => z.id === selected) ?? zonesWithCreature[0];
  const selCr   = selZone.creature!;
  const selHas  = caught.has(selCr.id);
  const selUrl  = CREATURE_URL[selZone.id];
  const caught_count = zonesWithCreature.filter(z => caught.has(z.creature!.id)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <style>{DEX_STYLES}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 6, borderBottom: "1px solid var(--color-dialog-border)" }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: "var(--color-dialog-shadow)", letterSpacing: "0.12em" }}>
          POKÉDEX
        </span>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#ffd24a" }}>
          {caught_count} / {zonesWithCreature.length} CAUGHT
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 10, minHeight: 320 }}>

        {/* LEFT — list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", maxHeight: 400 }}>
          {zonesWithCreature.map((z, idx) => {
            const cr  = z.creature!;
            const has = caught.has(cr.id);
            const sel = z.id === selected;
            return (
              <button
                key={cr.id}
                onClick={() => setSelected(z.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px",
                  background: sel
                    ? `linear-gradient(135deg, ${z.theme.accent}28 0%, ${z.theme.accent}10 100%)`
                    : "transparent",
                  border: sel
                    ? `1px solid ${z.theme.accent}70`
                    : "1px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.1s",
                  borderRadius: 3,
                }}
              >
                {/* Mini sprite / silhouette */}
                <div style={{
                  width: 32, height: 32, flexShrink: 0,
                  background: has ? z.theme.accent + "22" : "#0a1020",
                  border: `1px solid ${sel ? z.theme.accent + "80" : "var(--color-dialog-border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", borderRadius: 2,
                  position: "relative",
                }}>
                  {has && selUrl !== undefined && CREATURE_URL[z.id] ? (
                    <img
                      src={CREATURE_URL[z.id]}
                      alt={cr.name}
                      width={28} height={28}
                      style={{ width: 28, height: 28, objectFit: "contain", imageRendering: "pixelated",
                               filter: has ? "none" : "grayscale(1) brightness(0.2)" }}
                    />
                  ) : (
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 14,
                                   color: has ? z.theme.accent : "#1a2a3a", opacity: has ? 0.8 : 1 }}>
                      {has ? "" : "?"}
                    </span>
                  )}
                  {!has && (
                    <div style={{ position: "absolute", inset: 0, background: "#0a1020cc",
                                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "var(--font-pixel)", fontSize: 12, color: "#1a2a3a" }}>?</span>
                    </div>
                  )}
                </div>

                {/* Name + number */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8,
                                color: sel ? z.theme.accent : has ? "var(--color-dialog)" : "#2a3a50",
                                letterSpacing: "0.04em" }}>
                    {has ? cr.name.toUpperCase() : "???"}
                  </div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6,
                                color: sel ? z.theme.accent + "aa" : "#1a2a3a", marginTop: 2 }}>
                    #{String(idx + 1).padStart(3, "0")} · {has ? cr.type : "?"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT — detail panel */}
        <div
          key={selected}
          style={{
            background: `linear-gradient(160deg, ${selZone.theme.accent}12 0%, #050c18 60%)`,
            border: `1px solid ${selHas ? selZone.theme.accent + "55" : "var(--color-dialog-border)"}`,
            borderRadius: 4,
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            animation: "dex-slide-in 0.22s ease-out",
            position: "relative",
          }}
        >
          {/* Scanline */}
          {selHas && (
            <div style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${selZone.theme.accent}60, transparent)`,
              animation: "dex-scan 3s linear infinite",
              pointerEvents: "none", zIndex: 1,
            }} />
          )}

          {/* Sprite area */}
          <div style={{
            flex: "0 0 160px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: selHas
              ? `radial-gradient(ellipse at 50% 60%, ${selZone.theme.accent}18 0%, transparent 70%)`
              : "#020408",
            borderBottom: `1px solid ${selZone.theme.accent}25`,
            position: "relative",
            overflow: "hidden",
          }}>
            {selHas && selUrl ? (
              <img
                src={selUrl}
                alt={selCr.name}
                width={128} height={128}
                style={{
                  width: 128, height: 128,
                  objectFit: "contain",
                  imageRendering: "pixelated",
                  filter: `drop-shadow(0 0 20px ${selZone.theme.accent}90)`,
                  animation: "dex-sprite-in 0.3s ease-out",
                }}
              />
            ) : (
              <div style={{
                width: 100, height: 100,
                background: "#050c18",
                border: "2px solid #0a1525",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 4,
              }}>
                <span style={{ fontFamily: "var(--font-pixel)", fontSize: 36, color: "#0a1525" }}>?</span>
              </div>
            )}

            {/* Zone + number badge */}
            <div style={{
              position: "absolute", top: 8, left: 8,
              background: "rgba(2,4,12,0.85)",
              border: `1px solid ${selZone.theme.accent}40`,
              padding: "2px 7px",
              fontFamily: "var(--font-pixel)", fontSize: 6,
              color: selZone.theme.accent, letterSpacing: "0.1em",
            }}>
              {selZone.org.toUpperCase()}
            </div>
          </div>

          {/* Info area */}
          <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Name */}
            <div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6,
                            color: "#3a5070", letterSpacing: "0.15em", marginBottom: 4 }}>
                {selHas ? `#${String(zonesWithCreature.findIndex(z=>z.id===selected)+1).padStart(3,"0")} · ${selZone.years}` : "NOT YET CAUGHT"}
              </div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: selHas ? 16 : 12,
                            color: selHas ? "#c8d8f0" : "#2a3a50", letterSpacing: "0.06em" }}>
                {selHas ? selCr.name.toUpperCase() : "???"}
              </div>
            </div>

            {/* Type + Power */}
            {selHas && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: 7,
                  background: selZone.theme.accent + "22",
                  border: `1px solid ${selZone.theme.accent}60`,
                  color: selZone.theme.accent,
                  padding: "3px 8px", borderRadius: 99,
                }}>
                  {selCr.type}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a3a50", marginBottom: 3 }}>
                    POWER {selCr.power}
                  </div>
                  <div style={{ height: 4, background: "#0d1527", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, selCr.power)}%`,
                      background: `linear-gradient(90deg, ${selZone.theme.accent}cc, ${selZone.theme.accent})`,
                      borderRadius: 2,
                      boxShadow: `0 0 6px ${selZone.theme.accent}80`,
                    }} />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {selHas && (
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 12,
                color: "#7a9ab8", lineHeight: 1.5,
                borderTop: `1px solid ${selZone.theme.accent}20`,
                paddingTop: 8,
              }}>
                {selCr.description}
              </div>
            )}

            {/* Catch hint */}
            {!selHas && (
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                color: "#1a2a3a", lineHeight: 1.6, marginTop: "auto",
              }}>
                FOUND IN:<br />
                <span style={{ color: "#2a3a50" }}>{selZone.name.toUpperCase()}</span>
                <br /><br />
                Walk near the wild creature<br />in {selZone.name} to catch it.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
