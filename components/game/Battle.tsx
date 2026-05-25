"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Zone, Move } from "@/game/data";
import { ZONES, STARTER_STAGES, stageForBadges } from "@/game/data";
import { drawStarter } from "@/game/sprites";
import { CREATURE_URL, PLAYER_BACK_URL, getSprite, isReady } from "@/game/sprite-registry";
import { playSound } from "@/lib/audio";

const TYPE_COLORS: Record<string, string> = {
  Vision: "#f5b78a", Search: "#a8d39a", Ops: "#f6a268", AI: "#9fe8ff",
  Capital: "#f0c4ff", Brand: "#ff9fd4", Autonomy: "#00e8a0", Soul: "#ffd29a",
  Stack: "#7ce0ff", Ghost: "#8b6f9e", Dark: "#4a3a5a", Normal: "#8a8a8a",
  Fire: "#ff6b35", Steel: "#a8b8c8", Water: "#4a90d9", Bug: "#88b030",
  Poison: "#a040b0", Ice: "#98d8d8", Electric: "#f8d030", Psychic: "#f85888",
  Fighting: "#c03028", Sound: "#ff9fd4",
};

function HPBar({ current, max, label, color }: { current: number; max: number; label: string; color: string }) {
  const pct = Math.max(0, current / max);
  const barColor = pct > 0.5 ? "#4ade80" : pct > 0.25 ? "#facc15" : "#ef4444";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color }}>{label}</span>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070" }}>{current}/{max}</span>
      </div>
      <div style={{ height: 6, background: "#0d1527", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct * 100}%`,
          background: barColor, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 6px ${barColor}80`,
        }} />
      </div>
    </div>
  );
}

function MoveButton({ move, disabled, ppLeft, onClick }: {
  move: Move; disabled: boolean; ppLeft: number; onClick: () => void;
}) {
  const color = TYPE_COLORS[move.type] ?? "#7ce0ff";
  const out = ppLeft === 0;
  return (
    <button onClick={onClick} disabled={disabled || out} style={{
      background: (disabled || out) ? "#060c18" : `linear-gradient(135deg, ${color}14 0%, ${color}06 100%)`,
      border: `1px solid ${(disabled || out) ? "#1a2040" : color + "50"}`,
      color: (disabled || out) ? "#2a3a50" : "var(--color-dialog)",
      padding: "8px 10px", cursor: (disabled || out) ? "not-allowed" : "pointer",
      textAlign: "left", transition: "all 0.12s", position: "relative",
    }}>
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: (disabled || out) ? "#2a3a50" : color, marginBottom: 3 }}>
        {move.name.toUpperCase()}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-pixel)", fontSize: 6,
          background: color + "18", border: `1px solid ${color}30`,
          padding: "1px 4px", color: (disabled || out) ? "#2a3a50" : color,
        }}>{move.type}</span>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a3a50" }}>
          PWR {move.power}
        </span>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: ppLeft < 3 ? "#ef4444" : "#2a3a50", marginLeft: "auto" }}>
          PP {ppLeft}/{move.pp}
        </span>
      </div>
    </button>
  );
}

export function Battle({ zone, ownedSkills, badges, onWin, onFlee }: {
  zone: Zone;
  ownedSkills: Set<string>;
  badges: Set<string>;
  onWin: () => void;
  onFlee: () => void;
}) {
  const gym = zone.gym!;
  const stage = stageForBadges(badges.size);
  const [oppHp, setOppHp] = useState(gym.hp);
  const [myHp, setMyHp] = useState(stage.hp);
  const [log, setLog] = useState<{ text: string; kind: "normal" | "super" | "notso" | "crit" | "info" }[]>([
    { text: gym.intro, kind: "info" },
  ]);
  const [turn, setTurn] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [oppShake, setOppShake] = useState(false);
  const [meShake, setMeShake] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ppUsed, setPpUsed] = useState<Record<string, number>>({});
  const [oppBob, setOppBob] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Creature sprite refs
  const meRef = useRef<HTMLCanvasElement>(null);
  const oppCreatureRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  // Get opponent's creature sprite (the zone's creature)
  const oppCreatureUrl = CREATURE_URL[zone.id];
  const oppCreatureImg = oppCreatureUrl ? getSprite(oppCreatureUrl) : null;

  // Get player back sprite (PNG if available, fallback to procedural)
  const myBackImg = getSprite(PLAYER_BACK_URL[stage.id] ?? PLAYER_BACK_URL.mermander);

  useEffect(() => {
    const loop = (now: number) => {
      // Player side: PNG back sprite with bob, fallback to procedural
      if (meRef.current) {
        const c = meRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 128, 128);
        if (isReady(myBackImg)) {
          const bob = Math.sin(now / 350) * 3;
          c.drawImage(myBackImg, 4, 4 + bob, 120, 120);
        } else {
          drawStarter(c, stage.id, "back", 8, 8, 2.8, now / 100);
        }
      }
      // Opponent creature sprite
      if (oppCreatureRef.current) {
        const c = oppCreatureRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 160, 160);
        if (oppCreatureImg && isReady(oppCreatureImg)) {
          const bob = Math.sin(now / 420) * 3;
          c.drawImage(oppCreatureImg, 8, 8 + bob, 144, 144);
        }
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
      power: z.skill!.power, pp: 15, accuracy: 100,
      category: "special" as const, flavor: z.skill!.description,
    })),
  ];

  const addLog = useCallback((text: string, kind: "normal" | "super" | "notso" | "crit" | "info" = "normal") => {
    setLog(l => [...l.slice(-9), { text, kind }]);
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
    if (isCrit) dmg = Math.round(dmg * 1.5);
    if (miss) dmg = 0;

    const typeColor = TYPE_COLORS[move.type] ?? "#7ce0ff";
    setFlash(typeColor + "30");
    setTimeout(() => setFlash(null), 200);
    setTimeout(() => setOppShake(true), 120);
    setTimeout(() => setOppShake(false), 520);
    playSound(isSuper ? "super" : isCrit ? "crit" : "hit");

    if (miss) {
      addLog(`${stage.name} used ${move.name}… missed!`, "info");
    } else {
      addLog(`${stage.name} used ${move.name}!`, "normal");
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
        setDone(true);
        playSound("victory");
        setTimeout(onWin, 2000);
        setAnimating(false);
        return;
      }
      // Counter
      const leaderMove = gym.moves[turn % gym.moves.length];
      setTimeout(() => {
        const counterDmg = Math.max(4, Math.round(leaderMove.power * 0.55));
        const nextMyHp = Math.max(0, myHp - counterDmg);
        setMeShake(true);
        setTimeout(() => setMeShake(false), 400);
        playSound("hit");
        addLog(`${gym.opponentName}: "${leaderMove.name}"`, "normal");
        addLog(leaderMove.flavor, "info");
        addLog(`You take ${counterDmg} damage.`, "normal");
        setMyHp(nextMyHp);
        setTurn(t => t + 1);
        if (nextMyHp === 0) {
          addLog(`${stage.name} fainted… Full HP restored.`, "notso");
          playSound("faint");
          setTimeout(() => { setMyHp(stage.hp); setAnimating(false); }, 1200);
        } else {
          setAnimating(false);
        }
      }, 900);
    }, 600);
  }, [animating, done, gym, stage, oppHp, myHp, turn, ppUsed, addLog, onWin]);

  const logColors = { normal: "var(--color-dialog)", super: "#4ade80", notso: "#f87171", crit: "#ffd24a", info: "#7ce0ff" };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50,
      display: "flex", flexDirection: "column",
      background: `linear-gradient(180deg, ${zone.theme.accent}08 0%, #05091a 25%, #040810 100%)`,
      fontFamily: "var(--font-pixel)",
      overflow: "hidden",
    }}>
      {/* Flash */}
      {flash && <div style={{ position: "absolute", inset: 0, background: flash, zIndex: 60, pointerEvents: "none" }} />}

      {/* BATTLE ARENA - top half */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 0, flexShrink: 0,
        background: `linear-gradient(135deg, ${zone.theme.accent}06 0%, #030810 100%)`,
        borderBottom: `2px solid ${zone.theme.accent}30`,
        minHeight: 200,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Arena floor lines */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
          background: `linear-gradient(180deg, transparent 0%, ${zone.theme.accent}10 100%)`,
          pointerEvents: "none",
        }} />

        {/* PLAYER SIDE - bottom left */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "8px 12px 0 16px" }}>
          {/* HP card */}
          <div style={{
            background: "rgba(4,8,20,0.9)", border: "2px solid #1a2a4a",
            padding: "8px 10px", marginBottom: 4,
          }}>
            <HPBar current={myHp} max={stage.hp} label={stage.name} color={stage.color} />
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a3a50", marginTop: 4 }}>
              {stage.tag} · {badges.size} BADGES
            </div>
          </div>
          {/* Mermander sprite */}
          <div style={{
            alignSelf: "flex-end",
            transform: meShake ? "translateX(-8px)" : "translateX(0)",
            transition: "transform 0.08s",
            filter: `drop-shadow(0 4px 0 rgba(0,0,0,0.5))`,
          }}>
            <canvas ref={meRef} width={128} height={128}
              style={{ imageRendering: "pixelated", width: 112, height: 112 }} />
          </div>
        </div>

        {/* OPPONENT SIDE - top right */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "0 16px 8px 12px", justifyContent: "flex-start" }}>
          {/* Creature sprite */}
          <div style={{
            transform: oppShake ? "translateX(8px) rotate(3deg)" : "translateX(0)",
            transition: "transform 0.08s",
            filter: `drop-shadow(0 0 16px ${zone.theme.accent}50)`,
          }}>
            <canvas ref={oppCreatureRef} width={160} height={160}
              style={{ imageRendering: "pixelated", width: 140, height: 140 }} />
          </div>
          {/* HP card */}
          <div style={{
            background: "rgba(4,8,20,0.9)", border: `2px solid ${zone.theme.accent}40`,
            padding: "8px 10px", width: "100%",
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070", marginBottom: 4 }}>
              {gym.opponentTitle.toUpperCase()}
            </div>
            <HPBar current={oppHp} max={gym.hp} label={gym.opponentName} color={zone.theme.accent} />
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a3a50", marginTop: 4 }}>
              WEAK: {gym.weakTo.slice(0, 2).join(", ")}
            </div>
          </div>
        </div>
      </div>

      {/* BATTLE LOG */}
      <div style={{
        height: 100, overflowY: "auto", padding: "6px 14px",
        borderBottom: "2px solid #0d1a2a",
        background: "rgba(3,6,14,0.95)",
        flexShrink: 0,
      }}>
        {log.map((l, i) => (
          <div key={i} style={{
            fontSize: 9, lineHeight: 1.7,
            color: logColors[l.kind],
            fontWeight: (l.kind === "super" || l.kind === "crit") ? "bold" : "normal",
            textShadow: l.kind === "crit" ? "0 0 8px #ffd24a" : l.kind === "super" ? "0 0 8px #4ade80" : "none",
          }}>
            {l.kind === "crit" ? "⚡ " : l.kind === "super" ? "★ " : l.kind === "info" ? "  " : "▸ "}{l.text}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* MOVES */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 10px 10px", background: "#030810", overflow: "hidden" }}>
        <div style={{ fontSize: 7, color: "#1a2a40", marginBottom: 6 }}>
          {done ? "— VICTORY —" : animating ? "— OPPONENT TURN —" : `▸ CHOOSE A MOVE · TURN ${turn + 1}`}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, flex: 1, alignContent: "start" }}>
          {allMoves.slice(0, 6).map(move => (
            <MoveButton
              key={move.id} move={move}
              disabled={animating || done}
              ppLeft={(move.pp) - (ppUsed[move.id] ?? 0)}
              onClick={() => useMove(move)}
            />
          ))}
        </div>
        <button onClick={onFlee} style={{
          marginTop: 8, alignSelf: "flex-end",
          background: "transparent", border: "1px solid #1a2a3a",
          color: "#2a3a50", padding: "6px 14px",
          fontFamily: "var(--font-pixel)", fontSize: 7, cursor: "pointer",
        }}>↩ FLEE</button>
      </div>
    </div>
  );
}
