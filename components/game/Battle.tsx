"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Zone, Move, Gym } from "@/game/data";
import { ZONES, stageForBadges } from "@/game/data";
import { CREATURE_URL, PLAYER_BACK_URL, PLAYER_FRONT_URL, BATTLE_BG_URL, LEADER_URL, getSprite, isReady } from "@/game/sprite-registry";
import { playSound } from "@/lib/audio";

// ─── Gym Leader AI — personality-driven move selection ──────────────────────
type StrategyCtx = {
  turn: number;
  myHp: number;   myMaxHp: number;   // player HP
  oppHp: number;  oppMaxHp: number;  // leader HP (unused by most strategies but available)
  playerStageId: string;
};

function withPPFallback(preferred: number, moves: Move[]): number {
  // Leaders have unlimited PP in this system; just validate index
  return Math.max(0, Math.min(preferred, moves.length - 1));
}

function pickLeaderMove(gym: Gym, ctx: StrategyCtx): number {
  const { turn, myHp, myMaxHp } = ctx;
  const moves = gym.moves;
  if (!moves.length) return 0;

  const highestPowerIdx = () => {
    let best = 0;
    for (let i = 1; i < moves.length; i++) if (moves[i].power > moves[best].power) best = i;
    return best;
  };
  const lowestPowerIdx = () => {
    let best = 0;
    for (let i = 1; i < moves.length; i++) if (moves[i].power < moves[best].power) best = i;
    return best;
  };

  switch (gym.leader) {
    case "blankpage":
      // Stall: low power when player is healthy; escalate when wounded
      return withPPFallback(myHp / myMaxHp > 0.6 ? lowestPowerIdx() : highestPowerIdx(), moves);

    case "longtail":
      // Flood: alternate 0/2 every turn; every 4th use move 3
      if (turn % 4 === 3) return withPPFallback(Math.min(3, moves.length - 1), moves);
      return withPPFallback(turn % 2 === 0 ? 0 : Math.min(2, moves.length - 1), moves);

    case "zerorunway":
      // Fast-pressure: always highest power
      return withPPFallback(highestPowerIdx(), moves);

    case "prehype":
      // Educational: cycle all 4 in order so player sees every type
      return withPPFallback(turn % moves.length, moves);

    case "termsheet": {
      // Probe: turn 0 → Normal, turn 1 → 2nd move, turn 2+ → weakness match or highest power
      if (turn === 0) return withPPFallback(0, moves);
      if (turn === 1) return withPPFallback(1, moves);
      // From turn 2: prefer moves that match any weakness keyword in the move's type
      const weakIdx = moves.findIndex(m =>
        m.type === "Search" || m.type === "Vision" || m.type === "Ops"
      );
      return withPPFallback(weakIdx >= 0 ? weakIdx : highestPowerIdx(), moves);
    }

    case "noculture":
      // Hype-build: soft start, escalate
      if (turn < 2) return withPPFallback(Math.min(turn, moves.length - 1), moves);
      if (turn === 2) return withPPFallback(Math.min(2, moves.length - 1), moves);
      return withPPFallback(Math.min(3, moves.length - 1), moves);

    case "blackbox":
      // Unpredictable: random
      return withPPFallback(Math.floor(Math.random() * moves.length), moves);

    case "nobrief":
      // Artistic: pick the move with the longest flavor text
      return withPPFallback(
        moves.reduce((best, m, i) => m.flavor.length > moves[best].flavor.length ? i : best, 0),
        moves
      );

    case "statusquo": {
      // Champion: even rotation first 2 turns; then highest power when player < 50% HP
      if (turn < 2) return withPPFallback(turn % moves.length, moves);
      if (myHp / myMaxHp < 0.5) return withPPFallback(highestPowerIdx(), moves);
      return withPPFallback(turn % moves.length, moves);
    }

    default:
      return withPPFallback(turn % moves.length, moves);
  }
}

// ─── Type colours ───────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Vision:"#f5b78a", Search:"#a8d39a", Ops:"#f6a268", AI:"#9fe8ff",
  Capital:"#f0c4ff", Brand:"#ff9fd4", Autonomy:"#00e8a0", Soul:"#ffd29a",
  Stack:"#7ce0ff", Ghost:"#8b6f9e", Dark:"#4a3a5a", Normal:"#8a8a8a",
  Fire:"#ff6b35", Steel:"#a8b8c8", Water:"#4a90d9", Bug:"#88b030",
  Poison:"#a040b0", Ice:"#98d8d8", Electric:"#f8d030", Psychic:"#f85888",
  Fighting:"#c03028", Sound:"#ff9fd4",
};

// ─── Zone-ground → arena background gradient (fallback when PNG not loaded) ──
const ARENA_BG: Record<string, string> = {
  grass:  "radial-gradient(ellipse at 50% 85%, #3d7a3a 0%, #5fb255 40%, #7ce0ff22 100%)",
  sand:   "radial-gradient(ellipse at 50% 85%, #6b5a2a 0%, #a8955a 40%, #f5b78a22 100%)",
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
@keyframes hp-shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}
@keyframes opp-shake {
  0%,100% { transform: translateX(0) translateY(0); }
  20% { transform: translateX(-9px) translateY(-4px); }
  40% { transform: translateX(9px) translateY(2px); }
  60% { transform: translateX(-6px) translateY(-2px); }
  80% { transform: translateX(4px) translateY(1px); }
}
@keyframes super-flash {
  0%   { opacity: 0; transform: scale(0.7); }
  30%  { opacity: 1; transform: scale(1.08); }
  70%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.9); }
}
`;

// ─── HP Bar with animated drain ─────────────────────────────────────────────
function HPBar({ current, max, label, color, shaking }: {
  current: number; max: number; label: string; color: string; shaking?: boolean;
}) {
  const [displayed, setDisplayed] = useState(current);
  const prevRef = useRef(current);
  useEffect(() => {
    const from = prevRef.current;
    const to   = current;
    prevRef.current = current;
    if (from === to) return;
    const steps    = 20;
    const stepMs   = 500 / steps;
    let   step     = 0;
    const id = setInterval(() => {
      step++;
      const t = step / steps;
      setDisplayed(Math.round(from + (to - from) * t));
      if (step % 3 === 0) playSound("hptick");
      if (step >= steps) { clearInterval(id); setDisplayed(to); }
    }, stepMs);
    return () => clearInterval(id);
  }, [current]);

  const pct      = Math.max(0, displayed / max);
  const barColor = pct > 0.5 ? "#4ade80" : pct > 0.25 ? "#facc15" : "#ef4444";
  return (
    <div style={{ animation: shaking ? "hp-shake 0.4s ease-out" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color }}>{label}</span>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070" }}>
          {displayed}/{max}
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
  const [superEffectText, setSuperEffectText] = useState<string | null>(null);
  const [oppHpShake, setOppHpShake] = useState(false);
  const [myHpShake, setMyHpShake] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const meRef = useRef<HTMLCanvasElement>(null);
  const oppRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const oppCreatureUrl = CREATURE_URL[zone.id];
  const oppCreatureImg = oppCreatureUrl ? getSprite(oppCreatureUrl) : null;
  const myBackImg = getSprite(PLAYER_BACK_URL[stage.id] ?? PLAYER_BACK_URL.mermander);
  const battleBgImg = BATTLE_BG_URL[zone.id] ? getSprite(BATTLE_BG_URL[zone.id]) : null;
  const leaderImg = LEADER_URL[gym.leader] ? getSprite(LEADER_URL[gym.leader]) : null;

  useEffect(() => {
    const loop = (now: number) => {
      // Draw battle background
      if (bgRef.current) {
        const c = bgRef.current.getContext("2d")!;
        c.clearRect(0, 0, bgRef.current.width, bgRef.current.height);
        if (battleBgImg && isReady(battleBgImg)) {
          const scale = Math.max(bgRef.current.width / battleBgImg.naturalWidth, bgRef.current.height / battleBgImg.naturalHeight);
          const sw = battleBgImg.naturalWidth * scale;
          const sh = battleBgImg.naturalHeight * scale;
          const sx = (bgRef.current.width - sw) / 2;
          const sy = (bgRef.current.height - sh) / 2;
          c.imageSmoothingEnabled = true;
          c.drawImage(battleBgImg, sx, sy, sw, sh);
          // Dark overlay
          c.fillStyle = "rgba(2,5,14,0.52)";
          c.fillRect(0, 0, bgRef.current.width, bgRef.current.height);
        }
      }
      if (meRef.current) {
        const c = meRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false; c.clearRect(0, 0, 128, 128);
        if (isReady(myBackImg)) {
          const bob = Math.sin(now / 350) * 3;
          c.drawImage(myBackImg, 4, 4 + bob, 120, 120);
        }
      }
      // oppRef now draws the LEADER PNG large — creature is shown as HP card thumbnail
      if (oppRef.current) {
        const c = oppRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false; c.clearRect(0, 0, 240, 240);
        if (leaderImg && isReady(leaderImg)) {
          const bob = Math.sin(now / 420) * 3;
          c.drawImage(leaderImg, 4, 4 + bob, 232, 232);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage.id, leaderImg, myBackImg, battleBgImg]);

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
      setOppHpShake(true);
      setTimeout(() => setOppHpShake(false), 500);
      if (isSuper) { setSuperEffectText("SUPER EFFECTIVE!"); setTimeout(() => setSuperEffectText(null), 900); }
      if (isCrit)  { setSuperEffectText("CRITICAL HIT!"); setTimeout(() => setSuperEffectText(null), 900); }
      if (nextOppHp === 0) {
        addLog(`${gym.opponentName} was defeated!`, "super");
        addLog(gym.victory, "info");
        setDone(true); playSound("victory");
        setTimeout(onWin, 2000); setAnimating(false); return;
      }
      const leaderMoveIdx = pickLeaderMove(gym, {
        turn, myHp, myMaxHp: stage.hp,
        oppHp: nextOppHp, oppMaxHp: gym.hp,
        playerStageId: stage.id,
      });
      const leaderMove = gym.moves[leaderMoveIdx];
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
        setMyHpShake(true); setTimeout(() => setMyHpShake(false), 500);
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
        flexShrink: 0,
        borderBottom: `2px solid ${accent}35`,
        minHeight: 260, position: "relative", overflow: "hidden",
      }}>
        {/* Battle background PNG (Batch C) */}
        <canvas ref={bgRef} width={800} height={260} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          zIndex: 0, background: arenaBg,
        }} />
        <ArenaFloor accent={accent} />

        {/* SUPER EFFECTIVE / CRITICAL HIT text pop */}
        {superEffectText && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 10, pointerEvents: "none",
            fontFamily: "var(--font-pixel)", fontSize: 13,
            color: superEffectText.includes("CRIT") ? "#ffd24a" : "#4ade80",
            textShadow: superEffectText.includes("CRIT")
              ? "0 0 20px #ffd24a, 0 0 40px #ffd24a88"
              : "0 0 20px #4ade80, 0 0 40px #4ade8088",
            animation: "super-flash 0.9s ease-out forwards",
            letterSpacing: "0.08em", whiteSpace: "nowrap",
          }}>{superEffectText}</div>
        )}

        {/* Player side */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "8px 12px 0 16px", position: "relative", zIndex: 2 }}>
          <div style={{ background: "rgba(3,7,18,0.92)", border: "2px solid #1a2a4a", padding: "8px 10px", marginBottom: 4, backdropFilter: "blur(4px)", borderRadius: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {/* Player pokemon PNG thumbnail in HP card */}
              <img
                src={PLAYER_FRONT_URL[stage.id] ?? PLAYER_FRONT_URL.mermander}
                alt={stage.name}
                style={{ width: 22, height: 22, imageRendering: "pixelated", border: "1px solid #1a2a4a", flexShrink: 0, borderRadius: 1 }}
                onError={e => (e.currentTarget.style.display = "none")}
              />
              <HPBar current={myHp} max={stage.hp} label={stage.name} color={stage.color} shaking={myHpShake} />
            </div>
            <div style={{ fontSize: 6, color: "#2a3a50", marginTop: 2 }}>{stage.tag} · {badges.size} BADGES</div>
          </div>
          <div style={{ alignSelf: "flex-end", transform: meShake ? "translateX(-9px)" : "translateX(0)", transition: "transform 0.08s", filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.5))", animation: "sprite-enter-left 0.45s cubic-bezier(0.2,0.8,0.4,1)" }}>
            <canvas ref={meRef} width={128} height={128} style={{ imageRendering: "pixelated", width: 112, height: 112 }} />
          </div>
        </div>

        {/* Opponent side */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "0 16px 8px 12px", justifyContent: "flex-start", position: "relative", zIndex: 2 }}>
          <div style={{ transform: oppShake ? "none" : "none", animation: `${oppShake ? "opp-shake 0.45s ease-out" : "sprite-enter-right 0.45s cubic-bezier(0.2,0.8,0.4,1)"}`, filter: `drop-shadow(0 0 28px ${accent}90)` }}>
            <canvas ref={oppRef} width={240} height={240} style={{ imageRendering: "pixelated", width: 240, height: 240 }} />
          </div>
          <div style={{ background: "rgba(3,7,18,0.92)", border: `2px solid ${accent}45`, padding: "8px 10px", width: "100%", backdropFilter: "blur(4px)", borderRadius: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {/* Creature PNG thumbnail in HP card */}
              {oppCreatureImg && isReady(oppCreatureImg) && oppCreatureUrl && (
                <img src={oppCreatureUrl} alt="" style={{ width: 22, height: 22, imageRendering: "pixelated", border: `1px solid ${accent}40`, flexShrink: 0, borderRadius: 1 }} />
              )}
              <div style={{ fontSize: 6, color: "#3a5070" }}>{gym.opponentTitle.toUpperCase()}</div>
            </div>
            <HPBar current={oppHp} max={gym.hp} label={gym.opponentName} color={accent} shaking={oppHpShake} />
            <div style={{ fontSize: 6, color: "#2a3a50", marginTop: 4 }}>WEAK: {gym.weakTo.slice(0, 2).join(", ")}</div>
          </div>
        </div>
      </div>

      {/* Battle log */}
      <div style={{ height: 120, overflowY: "auto", padding: "6px 14px", borderBottom: "2px solid #0a1525", background: "rgba(2,5,12,0.88)", backdropFilter: "blur(6px)", flexShrink: 0 }}>
        {log.map((l, i) => {
          const isAttack  = l.kind === "normal" && l.type !== undefined;
          const isFlavor  = l.kind === "info";
          const isSuper   = l.kind === "super";
          const isCrit    = l.kind === "crit";
          const isNotSo   = l.kind === "notso";
          return (
            <div key={i} style={{
              marginBottom: isAttack ? 0 : isFlavor ? 3 : 2,
              lineHeight: 1.5,
            }}>
              {isAttack ? (
                /* Attack name — largest, accent-coloured */
                <div style={{
                  fontFamily: "var(--font-pixel)", fontSize: 9,
                  color: l.type ? (TYPE_COLORS[l.type] ?? "#c8d8f0") : "#c8d8f0",
                  display: "flex", alignItems: "center", gap: 6, marginTop: 4,
                }}>
                  <span style={{ opacity: 0.5 }}>▸</span>
                  {l.text}
                  {l.type && (
                    <span style={{
                      fontSize: 6,
                      background: (TYPE_COLORS[l.type] ?? "#7ce0ff") + "20",
                      border: `1px solid ${(TYPE_COLORS[l.type] ?? "#7ce0ff")}45`,
                      color: TYPE_COLORS[l.type] ?? "#7ce0ff",
                      padding: "1px 5px", borderRadius: 99, flexShrink: 0,
                    }}>{l.type}</span>
                  )}
                </div>
              ) : isFlavor ? (
                /* Flavor text — italic, slightly smaller, muted — this is the story moment */
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 13,
                  color: "#6a88b0", fontStyle: "italic",
                  paddingLeft: 12, lineHeight: 1.55,
                  borderLeft: "2px solid #1a2a40",
                }}>
                  {l.text}
                </div>
              ) : (isSuper || isCrit) ? (
                /* Super / crit — BIG, glowing */
                <div style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: isCrit ? 12 : 11,
                  color: LOG_COLORS[l.kind],
                  textShadow: `0 0 12px ${LOG_COLORS[l.kind]}`,
                  animation: "log-super 1.4s ease-in-out infinite",
                  display: "flex", alignItems: "center", gap: 4,
                  marginTop: 2,
                }}>
                  {l.kind === "crit" ? "⚡" : "★"} {l.text}
                </div>
              ) : isNotSo ? (
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: LOG_COLORS.notso, opacity: 0.8 }}>
                  {l.text}
                </div>
              ) : (
                /* Generic system line — small, muted */
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", lineHeight: 1.6 }}>
                  {l.text}
                </div>
              )}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* Moves */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 10px 10px", background: "#020508", overflow: "hidden" }}>
        <div style={{ fontSize: 7, color: done ? accent : animating ? "#2a3a50" : "#162030", marginBottom: 6, letterSpacing: "0.08em" }}>
          {done ? `— VICTORY · ${zone.name.toUpperCase()} —` : animating ? "— OPPONENT TURN —" : `▸ CHOOSE A MOVE · TURN ${turn + 1}`}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, flex: 1, alignContent: "start", overflowY: "auto" }}>
          {allMoves.slice(0, 8).map(move => (
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
