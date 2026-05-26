"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Zone, Move } from "@/game/data";
import { ZONES, stageForBadges } from "@/game/data";
import { drawStarter } from "@/game/sprites";
import { CREATURE_URL, PLAYER_BACK_URL, getSprite, isReady } from "@/game/sprite-registry";
import { playSound } from "@/lib/audio";

// ─── Type colours ───────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Vision:"#f5b78a", Search:"#a8d39a", Ops:"#f6a268", AI:"#9fe8ff",
  Capital:"#f0c4ff", Brand:"#ff9fd4", Autonomy:"#00e8a0", Soul:"#ffd29a",
  Stack:"#7ce0ff", Ghost:"#8b6f9e", Dark:"#4a3a5a", Normal:"#8a8a8a",
  Fire:"#ff6b35", Steel:"#a8b8c8", Water:"#4a90d9", Bug:"#88b030",
  Poison:"#a040b0", Ice:"#98d8d8", Electric:"#f8d030", Psychic:"#f85888",
  Fighting:"#c03028", Sound:"#ff9fd4",
};

// ─── Zone-ground → arena background gradient ────────────────────────────────
const ARENA_BG: Record<string, string> = {
  grass:  "radial-gradient(ellipse at 50% 85%, #3d7a3a 0%, #5fb255 40%, #7ce0ff22 100%)",
  sand:   "radial-gradient(ellipse at 50% 85%, #3d7a3a 0%, #5fb255 40%, #7ce0ff22 100%)",
  stone:  "radial-gradient(ellipse at 50% 85%, #5a2c0c 0%, #a67855 40%, #f6a26822 100%)",
  neon:   "radial-gradient(ellipse at 50% 85%, #0a1428 0%, #1f3548 40%, #9fe8ff22 100%)",
  dusk:   "radial-gradient(ellipse at 50% 85%, #1a0a2a 0%, #3a2456 40%, #f0c4ff22 100%)",
  night:  "radial-gradient(ellipse at 50% 85%, #020814 0%, #0b1830 40%, #7ce0ff22 100%)",
  mall:   "radial-gradient(ellipse at 50% 85%, #1a0828 0%, #2a1238 40%, #ff9fd422 100%)",
  crypto: "radial-gradient(ellipse at 50% 85%, #010f06 0%, #03331f 40%, #00e8a022 100%)",
  studio: "radial-gradient(ellipse at 50% 85%, #1a0808 0%, #3a1c10 40%, #ffd29a22 100%)",
  snow:   "radial-gradient(ellipse at 50% 85%, #0d1a2a 0%, #1e3048 40%, #98d8d822 100%)",
};

// ─── CSS keyframes ──────────────────────────────────────────────────────────
const BATTLE_STYLES = `
@keyframes attack-slash {
  0%   { opacity: 1; transform: scaleX(1.2); }
  100% { opacity: 0; transform: scaleX(0.8); }
}
@keyframes sprite-enter-right {
  0%   { transform: translateX(80px); opacity: 0; }
  100% { transform: translateX(0);    opacity: 1; }
}
@keyframes sprite-enter-left {
  0%   { transform: translateX(-80px); opacity: 0; }
  100% { transform: translateX(0);     opacity: 1; }
}
@keyframes log-super { 0%,100%{opacity:1} 50%{opacity:0.7} }
`;

// ─── HP Bar ─────────────────────────────────────────────────────────────────
function HPBar({ current, max, label, color }: {
  current: number; max: number; label: string; color: string;
}) {
  const pct = Math.max(0, current / max);
  const barColor = pct > 0.5 ? "#4ade80" : pct > 0.25 ? "#facc15" : "#ef4444";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color }}>{label}</span>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070" }}>
          {current}/{max}
        </span>
      </div>
      <div style={{ height: 7, background: "#0d1527", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", borderRadius: 2 }}>
        <div style={{
          height: "100%", width: `${pct * 100}%`,
          background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 8px ${barColor}90`,
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
}

// ─── Move Button ─────────────────────────────────────────────────────────────
function MoveButton({ move, disabled, ppLeft, onClick }: {
  move: Move; disabled: boolean; ppLeft: number; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = TYPE_COLORS[move.type] ?? "#7ce0ff";
  const out = ppLeft === 0;
  const inactive = disabled || out;
  const powerPct = Math.min(100, move.power) / 100;

  return (
    <button
      onClick={onClick}
      disabled={inactive}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: inactive
          ? "#060c18"
          : hovered
            ? `linear-gradient(135deg, ${color}22 0%, ${color}0a 100%)`
            : `linear-gradient(135deg, ${color}14 0%, ${color}06 100%)`,
        border: `1px solid ${inactive ? "#1a2040" : hovered ? color + "90" : color + "50"}`,
        color: inactive ? "#2a3a50" : "var(--color-dialog)",
        padding: "10px 12px",
        cursor: inactive ? "not-allowed" : "pointer",
        textAlign: "left",
        transition: "all 0.12s",
        position: "relative",
        boxShadow: (!inactive && hovered) ? `0 0 12px ${color}40` : "none",
        borderRadius: 3,
      }}
    >
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: inactive ? "#2a3a50" : color, marginBottom: 4, letterSpacing: "0.05em" }}>
        {move.name.toUpperCase()}
      </div>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-pixel)", fontSize: 6,
          background: inactive ? "#1a2040" : color + "22",
          border: `1px solid ${inactive ? "#1a2040" : color + "50"}`,
          padding: "2px 5px",
          color: inactive ? "#2a3a50" : color,
          borderRadius: 99,
          letterSpacing: "0.04em",
        }}>{move.type}</span>
        <div style={{ flex: 1, height: 3, background: "#0d1527", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${powerPct * 100}%`,
            background: inactive ? "#1a2040" : color,
            opacity: inactive ? 0.3 : 0.7,
            borderRadius: 2,
          }} />
        </div>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: ppLeft < 3 ? "#ef4444" : "#2a3a50", marginLeft: 2 }}>
          {ppLeft}/{move.pp}
        </span>
      </div>
    </button>
  );
}

// ─── Arena Floor SVG ─────────────────────────────────────────────────────────
function ArenaFloor({ accent }: { accent: string }) {
  return (
    <svg style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, pointerEvents: "none" }}
      viewBox="0 0 400 60" preserveAspectRatio="none">
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={i*100} y1={0} x2={i*100-100} y2={60} stroke={accent} strokeOpacity={0.12} strokeWidth={1} />
      ))}
      {[0,1,2,3].map(i => (
        <line key={`h${i}`} x1={0} y1={i*20} x2={400} y2={i*20} stroke={accent} strokeOpacity={0.08} strokeWidth={0.5} />
      ))}
      <defs>
        <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.07" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="60" fill="url(#floorFade)" />
    </svg>
  );
}

type LogKind = "normal" | "super" | "notso" | "crit" | "info";
const LOG_COLORS: Record<LogKind, string> = {
  normal: "var(--color-dialog)", super: "#4ade80", notso: "#f87171", crit: "#ffd24a", info: "#7ce0ff",
};

// ─── Main Battle component ───────────────────────────────────────────────────
export function Battle({ zone, ownedSkills, badges, onWin, onFlee }: {
  zone: Zone; ownedSkills: Set<string>; badges: Set<string>; onWin: () => void; onFlee: () => void;
}) {
  const gym = zone.gym!;
  const stage = stageForBadges(badges.size);
  const accent = zone.theme.accent;
  const arenaBg = ARENA_BG[zone.theme.ground] ?? ARENA_BG.night;

  const [oppHp, setOppHp] = useState(gym.hp);
  const [myHp, setMyHp] = useState(stage.hp);
  const [log, setLog] = useState<{ text: string; kind: LogKind; type?: string }[]>([{ text: gym.intro, kind: "info" }]);
  const [turn, setTurn] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [oppShake, setOppShake] = useState(false);
  const [meShake, setMeShake] = useState(false);
  const [flash, setFlash] = useState<{ color: string; dir: "left" | "right" } | null>(null);
  const [done, setDone] = useState(false);
  const [ppUsed, setPpUsed] = useState<Record<string, number>>({});
  const [defeatQuote, setDefeatQuote] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const meRef = useRef<HTMLCanvasElement>(null);
  const oppRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const oppCreatureUrl = CREATURE_URL[zone.id];
  const oppCreatureImg = oppCreatureUrl ? getSprite(oppCreatureUrl) : null;
  const myBackImg = getSprite(PLAYER_BACK_URL[stage.id] ?? PLAYER_BACK_URL.mermander);

  useEffect(() => {
    const loop = (now: number) => {
      if (meRef.current) {
        const c = meRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false; c.clearRect(0, 0, 128, 128);
        if (isReady(myBackImg)) { const bob = Math.sin(now / 350) * 3; c.drawImage(myBackImg, 4, 4 + bob, 120, 120); }
        else drawStarter(c, stage.id, "back", 8, 8, 2.8, now / 100);
      }
      if (oppRef.current) {
        const c = oppRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false; c.clearRect(0, 0, 160, 160);
        if (oppCreatureImg && isReady(oppCreatureImg)) { const bob = Math.sin(now / 420) * 3; c.drawImage(oppCreatureImg, 8, 8 + bob, 144, 144); }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage.id, oppCreatureImg, myBackImg]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [log]);

  const allMoves: Move[] = [
    ...stage.baseMoves,
    ...ZONES.filter(z => z.skill && ownedSkills.has(z.skill.id)).map(z => ({
      id: z.skill!.id, name: z.skill!.name, type: z.skill!.type,
      power: z.skill!.power, pp: 15, accuracy: 100, category: "special" as const, flavor: z.skill!.description,
    })),
  ];

  const addLog = useCallback((text: string, kind: LogKind = "normal", type?: string) => {
    setLog(l => [...l.slice(-9), { text, kind, type }]);
  }, []);

  const useMove = useCallback((move: Move) => {
    if (animating || done) return;
    const ppNow = ppUsed[move.id] ?? 0;
    if (ppNow >= move.pp) { addLog(`${move.name} has no PP left!`, "info"); return; }
    setAnimating(true);
    setPpUsed(p => ({ ...p, [move.id]: ppNow + 1 }));

    const isSuper = gym.weakTo.includes(move.type);
    const isNotSo = gym.resists.includes(move.type);
    const isCrit = move.effect === "crit" && Math.random() < 0.18;
    const miss = Math.random() * 100 > move.accuracy;
    let dmg = move.power;
    if (isSuper) dmg = Math.round(dmg * 2);
    if (isNotSo) dmg = Math.round(dmg * 0.5);
    if (isCrit)  dmg = Math.round(dmg * 1.5);
    if (miss)    dmg = 0;

    const typeColor = TYPE_COLORS[move.type] ?? "#7ce0ff";
    setFlash({ color: typeColor + "28", dir: "left" });
    setTimeout(() => setFlash(null), 320);
    setTimeout(() => setOppShake(true), 120);
    setTimeout(() => setOppShake(false), 520);
    playSound(isSuper ? "super" : isCrit ? "crit" : "hit");

    if (miss) addLog(`${stage.name} used ${move.name}… missed!`, "info");
    else {
      addLog(`${stage.name} used ${move.name}!`, "normal", move.type);
      if (isCrit) addLog("⚡ CRITICAL HIT!", "crit");
      else if (isSuper) addLog("★ SUPER EFFECTIVE!", "super");
      else if (isNotSo) addLog("Not very effective…", "notso");
      addLog(`Dealt ${dmg} damage.`, "normal");
    }

    const nextOppHp = Math.max(0, oppHp - dmg);
    setTimeout(() => {
      setOppHp(nextOppHp);
      if (nextOppHp === 0) {
        addLog(`${gym.opponentName} was defeated!`, "super");
        addLog(gym.victory, "info");
        setDone(true); playSound("victory");
        setTimeout(onWin, 2000); setAnimating(false); return;
      }
      const leaderMove = gym.moves[turn % gym.moves.length];
      setTimeout(() => {
        const cd = Math.max(4, Math.round(leaderMove.power * 0.55));
        const nextMyHp = Math.max(0, myHp - cd);
        setFlash({ color: "#ef444428", dir: "right" });
        setTimeout(() => setFlash(null), 320);
        setMeShake(true); setTimeout(() => setMeShake(false), 400);
        playSound("hit");
        addLog(`${gym.opponentName}: "${leaderMove.name}"`, "normal");
        addLog(leaderMove.flavor, "info");
        addLog(`You take ${cd} damage.`, "normal");
        setMyHp(nextMyHp); setTurn(t => t + 1);
        if (nextMyHp === 0) {
          addLog(`${stage.name} fainted… HP restored.`, "notso");
          playSound("faint");
          // Show gym leader gloat quote
          const gloatMove = leaderMove;
          setDefeatQuote(`${gym.opponentName}: "${gloatMove.flavor}"\n\nYour ${stage.name} fainted. HP restored — try again.`);
          setTimeout(() => { setMyHp(stage.hp); setDefeatQuote(null); setAnimating(false); }, 2800);
        } else setAnimating(false);
      }, 900);
    }, 600);
  }, [animating, done, gym, stage, oppHp, myHp, turn, ppUsed, addLog, onWin]);

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50,
      display: "flex", flexDirection: "column",
      background: `linear-gradient(180deg, ${accent}0a 0%, #04080f 30%, #020508 100%)`,
      fontFamily: "var(--font-pixel)", overflow: "hidden",
    }}>
      <style>{BATTLE_STYLES}</style>

      {/* Attack flash overlay */}
      {flash && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 58, pointerEvents: "none",
          background: `linear-gradient(${flash.dir === "left" ? "135deg" : "225deg"}, ${flash.color} 0%, transparent 55%)`,
          animation: "attack-slash 0.32s ease-out forwards",
        }} />
      )}

      {/* Zone header */}
      <div style={{
        flexShrink: 0, padding: "5px 14px",
        background: `linear-gradient(90deg, ${accent}20 0%, transparent 70%)`,
        borderBottom: `1px solid ${accent}28`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 7, color: accent, letterSpacing: "0.12em" }}>⚔ {zone.name.toUpperCase()}</span>
        <span style={{ fontSize: 6, color: accent, opacity: 0.55 }}>{gym.opponentTitle.toUpperCase()}</span>
      </div>

      {/* Arena */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        flexShrink: 0, background: arenaBg,
        borderBottom: `2px solid ${accent}35`,
        minHeight: 210, position: "relative", overflow: "hidden",
      }}>
        <ArenaFloor accent={accent} />

        {/* Player side */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "8px 12px 0 16px" }}>
          <div style={{ background: "rgba(3,7,18,0.9)", border: "2px solid #1a2a4a", padding: "8px 10px", marginBottom: 4, backdropFilter: "blur(4px)", borderRadius: 3 }}>
            <HPBar current={myHp} max={stage.hp} label={stage.name} color={stage.color} />
            <div style={{ fontSize: 6, color: "#2a3a50", marginTop: 4 }}>{stage.tag} · {badges.size} BADGES</div>
          </div>
          <div style={{ alignSelf: "flex-end", transform: meShake ? "translateX(-9px)" : "translateX(0)", transition: "transform 0.08s", filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.5))", animation: "sprite-enter-left 0.45s cubic-bezier(0.2,0.8,0.4,1)" }}>
            <canvas ref={meRef} width={128} height={128} style={{ imageRendering: "pixelated", width: 112, height: 112 }} />
          </div>
        </div>

        {/* Opponent side */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "0 16px 8px 12px", justifyContent: "flex-start" }}>
          <div style={{ transform: oppShake ? "translateX(9px) rotate(4deg)" : "translateX(0)", transition: "transform 0.08s", filter: `drop-shadow(0 0 20px ${accent}70)`, animation: "sprite-enter-right 0.45s cubic-bezier(0.2,0.8,0.4,1)" }}>
            <canvas ref={oppRef} width={160} height={160} style={{ imageRendering: "pixelated", width: 148, height: 148 }} />
          </div>
          <div style={{ background: "rgba(3,7,18,0.9)", border: `2px solid ${accent}45`, padding: "8px 10px", width: "100%", backdropFilter: "blur(4px)", borderRadius: 3 }}>
            <div style={{ fontSize: 6, color: "#3a5070", marginBottom: 4 }}>{gym.opponentTitle.toUpperCase()}</div>
            <HPBar current={oppHp} max={gym.hp} label={gym.opponentName} color={accent} />
            <div style={{ fontSize: 6, color: "#2a3a50", marginTop: 4 }}>WEAK: {gym.weakTo.slice(0, 2).join(", ")}</div>
          </div>
        </div>
      </div>

      {/* Battle log */}
      <div style={{ height: 110, overflowY: "auto", padding: "6px 14px", borderBottom: "2px solid #0a1525", background: "rgba(2,5,12,0.88)", backdropFilter: "blur(6px)", flexShrink: 0 }}>
        {log.map((l, i) => (
          <div key={i} style={{
            fontSize: l.kind === "super" || l.kind === "crit" ? 11 : 10,
            lineHeight: 1.65, color: LOG_COLORS[l.kind],
            fontWeight: l.kind === "super" || l.kind === "crit" ? "bold" : "normal",
            animation: l.kind === "super" || l.kind === "crit" ? "log-super 1.4s ease-in-out infinite" : "none",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span>{l.kind === "crit" ? "⚡ " : l.kind === "super" ? "★ " : l.kind === "info" ? "  " : "▸ "}{l.text}</span>
            {l.type && (
              <span style={{
                fontSize: 7,
                background: (TYPE_COLORS[l.type] ?? "#7ce0ff") + "20",
                border: `1px solid ${(TYPE_COLORS[l.type] ?? "#7ce0ff")}45`,
                color: TYPE_COLORS[l.type] ?? "#7ce0ff",
                padding: "1px 5px", borderRadius: 99, flexShrink: 0,
              }}>{l.type}</span>
            )}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Moves */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 10px 10px", background: "#020508", overflow: "hidden" }}>
        <div style={{ fontSize: 7, color: done ? accent : animating ? "#2a3a50" : "#162030", marginBottom: 6, letterSpacing: "0.08em" }}>
          {done ? `— VICTORY · ${zone.name.toUpperCase()} —` : animating ? "— OPPONENT TURN —" : `▸ CHOOSE A MOVE · TURN ${turn + 1}`}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, flex: 1, alignContent: "start" }}>
          {allMoves.slice(0, 6).map(move => (
            <MoveButton key={move.id} move={move} disabled={animating || done} ppLeft={(move.pp) - (ppUsed[move.id] ?? 0)} onClick={() => useMove(move)} />
          ))}
        </div>
        <button
          onClick={onFlee}
          style={{ marginTop: 8, alignSelf: "flex-end", background: "transparent", border: "1px solid #0d1a2a", color: "#1a2a3a", padding: "6px 18px", fontFamily: "var(--font-pixel)", fontSize: 7, cursor: "pointer", borderRadius: 3, transition: "all 0.12s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef444450"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0d1a2a"; (e.currentTarget as HTMLButtonElement).style.color = "#1a2a3a"; }}
        >↩ FLEE</button>
      </div>

      {/* Defeat quote overlay */}
      {defeatQuote && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 60,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(2,4,12,0.88)",
          padding: 20,
          animation: "sprite-enter-right 0.3s ease-out",
        }}>
          <div style={{
            maxWidth: 320, width: "100%",
            background: "#050c18",
            border: `2px solid ${accent}40`,
            boxShadow: `0 0 30px ${accent}20`,
            padding: "18px 20px",
            textAlign: "center",
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: accent, letterSpacing: "0.15em", marginBottom: 10 }}>
              ✗ DEFEATED
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 14,
              color: "#c8d8f0", lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>
              {defeatQuote}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
