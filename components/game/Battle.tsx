"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Zone, Move } from "@/game/data";
import { ZONES, STARTER_STAGES, stageForBadges } from "@/game/data";
import { drawStarter, drawGymLeader } from "@/game/sprites";
import { LEADER_URL, PLAYER_BACK_URL, getSprite, isReady } from "@/game/sprite-registry";
import { playSound } from "@/lib/audio";

const TYPE_COLORS: Record<string, string> = {
  Vision: "#f5b78a", Search: "#a8d39a", Ops: "#f6a268", AI: "#9fe8ff",
  Capital: "#f0c4ff", Brand: "#ff9fd4", Autonomy: "#00e8a0", Soul: "#ffd29a",
  Stack: "#7ce0ff", Ghost: "#8b6f9e", Dark: "#4a3a5a", Normal: "#8a8a8a",
  Fire: "#ff6b35", Steel: "#a8b8c8", Water: "#4a90d9", Bug: "#88b030",
  Poison: "#a040b0", Ice: "#98d8d8", Electric: "#f8d030", Psychic: "#f85888",
  Fighting: "#c03028", Sound: "#ff9fd4",
};

function HPBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, current / max);
  const barColor = pct > 0.5 ? "#4ade80" : pct > 0.25 ? "#facc15" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1, height: 8, background: "#0d1527",
        border: "1px solid rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${pct * 100}%`,
          background: barColor,
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 6px ${barColor}`,
        }} />
      </div>
      <span style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: "#aac", minWidth: 52, textAlign: "right" }}>
        {current}/{max}
      </span>
    </div>
  );
}

function MoveButton({ move, disabled, onClick, typeColors }: {
  move: Move; disabled: boolean; onClick: () => void; typeColors: Record<string, string>;
}) {
  const color = typeColors[move.type] ?? "#7ce0ff";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#0d1020" : `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
        border: `1px solid ${disabled ? "#1a2040" : color + "60"}`,
        color: disabled ? "#333" : "var(--color-dialog)",
        padding: "10px 12px",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, marginBottom: 4, color: disabled ? "#333" : color }}>
        {move.name.toUpperCase()}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-pixel)", fontSize: 7,
          background: color + "22", border: `1px solid ${color}40`,
          padding: "1px 5px", color,
        }}>{move.type}</span>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#6680aa" }}>
          PWR {move.power} · PP {move.pp}
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
  const logEndRef = useRef<HTMLDivElement>(null);

  const oppRef = useRef<HTMLCanvasElement>(null);
  const meRef = useRef<HTMLCanvasElement>(null);

  // Build available moves: base moves + skill berries
  const bonusMoves: Move[] = ZONES
    .filter((z) => z.skill && ownedSkills.has(z.skill.id))
    .map((z) => ({
      id: z.skill!.id,
      name: z.skill!.name,
      type: z.skill!.type,
      power: z.skill!.power,
      pp: 15,
      accuracy: 100,
      category: "special" as const,
      flavor: z.skill!.description,
    }));

  const allMoves = [...stage.baseMoves, ...bonusMoves];

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  useEffect(() => {
    let raf = 0;
    const leaderImg = getSprite(LEADER_URL[gym.leader]);
    const meImg = getSprite(PLAYER_BACK_URL);
    const loop = (now: number) => {
      if (oppRef.current) {
        const c = oppRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 160, 160);
        if (isReady(leaderImg)) {
          const bob = Math.sin(now / 400) * 3;
          c.drawImage(leaderImg, 4, 4 + bob, 152, 152);
        } else {
          drawGymLeader(c, gym.leader, 20, 20, 3.5);
        }
      }
      if (meRef.current) {
        const c = meRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 128, 128);
        if (isReady(meImg)) {
          const bob = Math.sin(now / 350 + 1) * 2;
          c.drawImage(meImg, 4, 4 + bob, 120, 120);
        } else {
          drawStarter(c, stage.id, "back", 16, 16, 3, now / 100);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gym.leader, stage.id]);

  const addLog = useCallback((text: string, kind: "normal" | "super" | "notso" | "crit" | "info" = "normal") => {
    setLog(l => [...l.slice(-8), { text, kind }]);
  }, []);

  const useMove = useCallback((move: Move) => {
    if (animating || done) return;
    if ((ppUsed[move.id] ?? 0) >= move.pp) {
      addLog(`${move.name} has no PP left!`, "info");
      return;
    }
    setAnimating(true);
    setPpUsed(p => ({ ...p, [move.id]: (p[move.id] ?? 0) + 1 }));

    const isSuper = gym.weakTo.includes(move.type);
    const isNotSo = gym.resists.includes(move.type);
    const isCrit = move.effect === "crit" && Math.random() < 0.15;
    const missRoll = Math.random() * 100 > move.accuracy;

    let dmg = move.power;
    if (isSuper) dmg = Math.round(dmg * 2);
    if (isNotSo) dmg = Math.round(dmg * 0.5);
    if (isCrit) dmg = Math.round(dmg * 1.5);
    if (missRoll) dmg = 0;

    const effLabel = isCrit ? "CRITICAL HIT!" : isSuper ? "SUPER EFFECTIVE!" : isNotSo ? "Not very effective…" : "";
    const typeColor = TYPE_COLORS[move.type] ?? "#7ce0ff";

    // Flash + shake animation
    setFlash(typeColor + "40");
    setTimeout(() => setFlash(null), 180);
    setTimeout(() => setOppShake(true), 100);
    setTimeout(() => setOppShake(false), 500);

    playSound(isSuper ? "super" : isCrit ? "crit" : "hit");

    if (missRoll) {
      addLog(`${stage.name} used ${move.name}… but it missed!`, "info");
    } else {
      addLog(`${stage.name} used ${move.name}!`, "normal");
      if (effLabel) addLog(effLabel, isCrit ? "crit" : isSuper ? "super" : "notso");
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
        setTimeout(onWin, 2200);
        setAnimating(false);
        return;
      }

      // Leader counter-attack
      const leaderMove = gym.moves[turn % gym.moves.length];
      setTimeout(() => {
        const counterDmg = Math.max(4, Math.round(leaderMove.power * 0.6));
        const nextMyHp = Math.max(0, myHp - counterDmg);

        setMeShake(true);
        setTimeout(() => setMeShake(false), 400);
        playSound("hit");

        addLog(`${gym.opponentName} used ${leaderMove.name}!`, "normal");
        addLog(leaderMove.flavor, "info");
        addLog(`You take ${counterDmg} damage.`, "normal");

        setMyHp(nextMyHp);
        setTurn(t => t + 1);

        if (nextMyHp === 0) {
          addLog(`${stage.name} fainted! Regrouping…`, "notso");
          playSound("faint");
          setTimeout(() => {
            setMyHp(stage.hp);
            addLog("Full HP restored — try a different move.", "info");
            setAnimating(false);
          }, 1200);
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
      background: "linear-gradient(180deg, #050a18 0%, #080e22 40%, #0c1830 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-pixel)",
    }}>
      {/* Flash overlay */}
      {flash && (
        <div style={{ position: "absolute", inset: 0, background: flash, zIndex: 60, pointerEvents: "none", transition: "opacity 0.18s" }} />
      )}

      {/* OPPONENT SIDE */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        padding: "16px 20px 8px",
        background: "linear-gradient(135deg, #0a0e20 0%, #111830 100%)",
        borderBottom: "2px solid #1a2a4a",
      }}>
        {/* Opp info */}
        <div style={{ flex: 1, paddingRight: 16 }}>
          <div style={{ fontSize: 7, color: "#5570aa", marginBottom: 2 }}>
            {gym.opponentTitle.toUpperCase()}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-dialog)", marginBottom: 8 }}>
            {gym.opponentName.toUpperCase()}
          </div>
          <HPBar current={oppHp} max={gym.hp} color={zone.theme.accent} />
          <div style={{ fontSize: 7, color: "#5570aa", marginTop: 4 }}>
            WEAK TO: {gym.weakTo.join(", ")}
          </div>
        </div>
        {/* Opp sprite */}
        <div style={{
          position: "relative",
          transform: oppShake ? "translateX(8px) rotate(2deg)" : "translateX(0) rotate(0)",
          transition: "transform 0.08s",
        }}>
          <canvas ref={oppRef} width={160} height={160}
            style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 12px ${zone.theme.accent}60)` }} />
          {/* Type tags */}
          <div style={{ position: "absolute", bottom: 0, right: 0, display: "flex", gap: 3 }}>
            {gym.weakTo.slice(0, 2).map(t => (
              <span key={t} style={{
                fontFamily: "var(--font-pixel)", fontSize: 7, padding: "2px 5px",
                background: (TYPE_COLORS[t] ?? "#7ce0ff") + "22",
                border: `1px solid ${TYPE_COLORS[t] ?? "#7ce0ff"}50`,
                color: TYPE_COLORS[t] ?? "#7ce0ff",
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* MY SIDE */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        padding: "8px 20px",
        background: "#08101e",
        borderBottom: "2px solid #1a2a4a",
      }}>
        {/* Me sprite */}
        <div style={{
          transform: meShake ? "translateX(-6px)" : "translateX(0)",
          transition: "transform 0.08s",
        }}>
          <canvas ref={meRef} width={128} height={128}
            style={{ imageRendering: "pixelated" }} />
        </div>
        {/* My info */}
        <div style={{ flex: 1, paddingLeft: 16, paddingTop: 8 }}>
          <div style={{ fontSize: 7, color: stage.accent, marginBottom: 2 }}>
            {stage.tag.toUpperCase()}
          </div>
          <div style={{ fontSize: 11, color: stage.color, marginBottom: 8 }}>
            {stage.name.toUpperCase()}
          </div>
          <HPBar current={myHp} max={stage.hp} color={stage.color} />
          <div style={{ fontSize: 7, color: "#5570aa", marginTop: 4 }}>
            {badges.size} BADGES · STAGE {STARTER_STAGES.indexOf(stage) + 1}/3
          </div>
        </div>
      </div>

      {/* BATTLE LOG */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "10px 16px",
        borderBottom: "2px solid #1a2a4a",
        minHeight: 80, maxHeight: 120,
        background: "#060c16",
      }}>
        {log.map((l, i) => (
          <div key={i} style={{
            fontSize: 10, lineHeight: 1.6,
            color: logColors[l.kind],
            fontWeight: l.kind === "super" || l.kind === "crit" ? "bold" : "normal",
            textShadow: l.kind === "super" ? "0 0 8px #4ade80" : l.kind === "crit" ? "0 0 8px #ffd24a" : "none",
          }}>
            {l.kind === "crit" ? "⚡ " : l.kind === "super" ? "★ " : "▸ "}{l.text}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* MOVE GRID */}
      <div style={{ padding: "10px 12px 16px", background: "#060c16" }}>
        <div style={{ fontSize: 7, color: "#3a5070", marginBottom: 8 }}>
          {done ? "— BATTLE OVER —" : animating ? "— WAITING… —" : `▸ CHOOSE A MOVE · TURN ${turn + 1}`}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {allMoves.slice(0, 4).map(move => (
            <MoveButton
              key={move.id}
              move={move}
              disabled={animating || done || (ppUsed[move.id] ?? 0) >= move.pp}
              onClick={() => useMove(move)}
              typeColors={TYPE_COLORS}
            />
          ))}
        </div>
        {allMoves.length > 4 && (
          <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {allMoves.slice(4, 8).map(move => (
              <MoveButton
                key={move.id}
                move={move}
                disabled={animating || done || (ppUsed[move.id] ?? 0) >= move.pp}
                onClick={() => useMove(move)}
                typeColors={TYPE_COLORS}
              />
            ))}
          </div>
        )}
        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onFlee}
            style={{
              background: "transparent", border: "1px solid #2a3a5a",
              color: "#3a5070", padding: "8px 16px",
              fontFamily: "var(--font-pixel)", fontSize: 9, cursor: "pointer",
            }}
          >
            ↩ FLEE
          </button>
        </div>
      </div>
    </div>
  );
}
