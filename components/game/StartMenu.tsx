import { useState } from "react";
import { ZONES, CONTACT, PRESS, STARTER_STAGES, stageForBadges } from "@/game/data";
import { PLAYER_FRONT_URL, FOLLOWER_SPRITE_URL } from "@/game/sprite-registry";

type Tab = "badges" | "trainer" | "people" | "contact";

export function StartMenu({ badges, creatures, skills, onClose }: {
  badges: Set<string>; creatures: Set<string>; skills: Set<string>; onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("trainer");
  const [selected, setSelected] = useState<string | null>(null);
  const gymZones = ZONES.filter((z) => z.gym);
  const completed = gymZones.filter((z) => badges.has(z.badge.id)).length;
  const stage = stageForBadges(badges.size);

  return (
    <div className="fixed inset-0 z-30 flex items-stretch justify-stretch p-2 sm:p-4" onClick={onClose}
         style={{ background: "rgba(8,16,26,0.92)",
                  paddingTop: "calc(env(safe-area-inset-top) + 8px)",
                  paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}>
      <div className="pq-panel w-full h-full flex flex-col max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "2px solid var(--color-dialog-border)" }}>
          <div className="pq-label">PARAM QUEST · PAUSE MENU</div>
          <button className="pq-label" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>✕ CLOSE</button>
        </div>
        <div className="flex flex-nowrap overflow-x-auto gap-2 px-3 py-2" style={{ borderBottom: "2px solid var(--color-dialog-shadow)", WebkitOverflowScrolling: "touch" }}>
          {([
            ["trainer", "TRAINER"],
            ["badges", `BADGES ${completed}/${gymZones.length}`],
            ["people", "PEOPLE"],
            ["contact", "CONTACT"],
          ] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => { setTab(k); setSelected(null); }} className="pq-btn whitespace-nowrap"
              style={tab === k ? { background: "var(--color-primary)", color: "var(--color-primary-foreground)" } : undefined}>{label}</button>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-3">
          {tab === "trainer" && (
            <div className="pq-panel-inner">
              <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>TRAINER CARD</div>
              <div className="grid grid-cols-[80px_1fr] gap-3 mt-2 items-center">
                <div style={{ width: 80, height: 80, background: stage.color + "22", border: `3px solid ${stage.accent}60`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  <img
                    src={PLAYER_FRONT_URL[stage.id] ?? PLAYER_FRONT_URL.mermander}
                    alt={stage.name}
                    style={{ width: 72, height: 72, imageRendering: "pixelated", objectFit: "contain" }}
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 14 }}>PARAM MINHAS</div>
                  <div className="pq-text-sm" style={{ opacity: 0.75 }}>Builder · Designer · Director</div>
                  <div className="pq-text-sm" style={{ opacity: 0.75 }}>Pune → Bengaluru → Mumbai → now</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                    {STARTER_STAGES.map((s) => {
                      const unlocked = badges.size >= s.minBadges;
                      return (
                        <div key={s.id} style={{ opacity: unlocked ? 1 : 0.3, textAlign: "center" }}>
                          <img
                            src={FOLLOWER_SPRITE_URL[s.id]}
                            alt={s.name}
                            style={{ width: 28, height: 28, imageRendering: "pixelated", border: `1px solid ${s.id === stage.id ? s.accent : "transparent"}`, borderRadius: 2 }}
                            onError={e => (e.currentTarget.style.display = "none")}
                          />
                        </div>
                      );
                    })}
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: stage.accent, marginLeft: 4 }}>{stage.name}</span>
                  </div>
                </div>
              </div>
              <hr style={{ borderColor: "var(--color-dialog-border)", margin: "12px 0", borderWidth: 1 }} />
              <div className="grid grid-cols-4 gap-3 text-center">
                <Stat label="YEARS" value="15+" />
                <Stat label="WORLDS" value={`${ZONES.length}`} />
                <Stat label="BADGES" value={`${completed}/${gymZones.length}`} />
                <Stat label="CREATURES" value={`${creatures.size}/${ZONES.filter(z=>z.creature).length}`} />
              </div>
              <hr style={{ borderColor: "var(--color-dialog-border)", margin: "12px 0", borderWidth: 1 }} />
              <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>SELECTED PRESS</div>
              <ul className="pq-text-sm" style={{ marginTop: 6, listStyle: "none", padding: 0 }}>
                {PRESS.map((p, i) => (
                  <li key={i} style={{ marginTop: 4 }}>▸ <span style={{ opacity: 0.7 }}>{p.outlet}:</span> {p.title}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/resume" className="pq-btn pq-btn-primary">FULL CV →</a>
                <a href="/" className="pq-btn">✕ EXIT TO HOME</a>
              </div>
            </div>
          )}

          {tab === "badges" && (
            <div className="flex flex-col gap-2">
              {ZONES.map((z) => {
                const has = badges.has(z.badge.id);
                const open = selected === z.id;
                return (
                  <div key={z.id} className="pq-panel-inner" style={{ padding: 0, opacity: has ? 1 : 0.7 }}>
                    <button
                      onClick={() => setSelected(open ? null : z.id)}
                      className="w-full text-left flex items-center gap-3"
                      style={{ background: "transparent", border: "none", padding: "10px 12px", cursor: "pointer" }}
                    >
                      <div style={{
                        width: 32, height: 32, flexShrink: 0,
                        background: has ? z.badge.color : "transparent",
                        border: `2px solid ${has ? "var(--color-dialog-border)" : "var(--color-muted-foreground)"}`,
                        boxShadow: has ? "inset 0 0 0 2px #fff8" : undefined,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="pq-label" style={{ fontSize: 9, color: "var(--color-dialog-shadow)" }}>
                          #{z.index + 1} · {z.years}
                        </div>
                        <div className="pq-text" style={{ fontFamily: "var(--font-pixel)", fontSize: 12, marginTop: 2 }}>
                          {has ? z.badge.label.toUpperCase() : "??? BADGE"}
                        </div>
                        <div className="pq-text-sm" style={{ fontSize: 12, opacity: 0.7 }}>{z.name}</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, opacity: 0.6 }}>{open ? "▲" : "▼"}</div>
                    </button>
                    {open && (
                      <div style={{ padding: "0 12px 12px", borderTop: "1px solid var(--color-dialog-shadow)" }}>
                        <div className="pq-label mt-3" style={{ color: "var(--color-dialog-shadow)" }}>WHAT I ACHIEVED</div>
                        <div className="pq-text-sm" style={{ marginTop: 4, fontSize: 13 }}>{z.outcome}</div>
                        <ul className="pq-text-sm" style={{ listStyle: "none", padding: 0, marginTop: 4 }}>
                          {z.cliff.did.map((d, i) => <li key={i} style={{ marginTop: 3, fontSize: 13 }}>▸ {d}</li>)}
                        </ul>
                        <div className="pq-label mt-3" style={{ color: "var(--color-dialog-shadow)" }}>WHAT I LEARNED</div>
                        <ul className="pq-text-sm" style={{ listStyle: "none", padding: 0, marginTop: 4 }}>
                          {z.cliff.learned.map((d, i) => <li key={i} style={{ marginTop: 3, fontSize: 13 }}>▸ {d}</li>)}
                        </ul>
                        <div className="pq-label mt-3" style={{ color: "var(--color-dialog-shadow)" }}>WHY IT MATTERED</div>
                        <div className="pq-text-sm" style={{ marginTop: 4, fontSize: 13 }}>
                          {z.subtitle}. The challenge — <em>{z.gym?.opponentName ?? "—"}</em>. {z.gym?.victory ?? ""}
                        </div>
                        {!has && (
                          <div className="pq-label mt-3" style={{ color: "var(--color-muted-foreground)" }}>
                            ✦ Defeat the gym to earn this badge
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "people" && (
            <div className="pq-panel-inner">
              <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>PEOPLE I'VE WORKED WITH</div>
              <ul className="pq-text-sm" style={{ marginTop: 8, listStyle: "none", padding: 0 }}>
                {ZONES.flatMap((z) => z.npcs.map((n) => ({ zone: z, n }))).map(({ zone, n }, i) => (
                  <li key={i} style={{ marginTop: 8, padding: "6px 8px", border: "1px solid var(--color-dialog-shadow)", borderRadius: 2 }}>
                    <div className="pq-label" style={{ fontSize: 9 }}>{zone.name.toUpperCase()} · {n.beat === "did" ? "DID" : "LEARNED"}</div>
                    <div className="pq-text" style={{ fontSize: 18 }}>{n.name}</div>
                    <div style={{ opacity: 0.7, fontSize: 16, fontFamily: "var(--font-mono)" }}>{n.role}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "contact" && (
            <div className="pq-panel-inner">
              <div className="pq-label" style={{ color: "var(--color-dialog-shadow)" }}>CONTACT</div>
              <div className="pq-text" style={{ marginTop: 8 }}>Working on something? Bring it.</div>
              <ul className="pq-text-sm" style={{ marginTop: 10, listStyle: "none", padding: 0 }}>
                <li>EMAIL: <a href={`mailto:${CONTACT.email}`} style={{ color: "var(--color-primary)" }}>{CONTACT.email}</a></li>
                <li>LINKEDIN: <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)" }}>paramminhas</a></li>
                <li>TWITTER: <a href={CONTACT.twitter} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)" }}>@paramminhas</a></li>
                <li>SITE: <a href={CONTACT.site} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)" }}>catscandance.com</a></li>
              </ul>
              <div className="pq-label mt-4" style={{ color: "var(--color-dialog-shadow)" }}>SKILLS LEARNED ({skills.size})</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><div className="pq-label">{label}</div><div className="pq-text">{value}</div></div>;
}
