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
      return withPPFallback(myHp / myMaxHp > 0.6 ? lowestPowerIdx() : highestPowerIdx(), moves);
    case "longtail":
      if (turn % 4 === 3) return withPPFallback(Math.min(3, moves.length - 1), moves);
      return withPPFallback(turn % 2 === 0 ? 0 : Math.min(2, moves.length - 1), moves);
    case "zerorunway":
      return withPPFallback(highestPowerIdx(), moves);
    case "prehype":
      return withPPFallback(turn % moves.length, moves);
    case "termsheet": {
      if (turn === 0) return withPPFallback(0, moves);
      if (turn === 1) return withPPFallback(1, moves);
      const weakIdx = moves.findIndex(m =>
        m.type === "Search" || m.type === "Vision" || m.type === "Ops"
      );
      return withPPFallback(weakIdx >= 0 ? weakIdx : highestPowerIdx(), moves);
    }
    case "noculture":
      if (turn < 2) return withPPFallback(Math.min(turn, moves.length - 1), moves);
      if (turn === 2) return withPPFallback(Math.min(2, moves.length - 1), moves);
      return withPPFallback(Math.min(3, moves.length - 1), moves);
    case "blackbox":
      return withPPFallback(Math.floor(Math.random() * moves.length), moves);
    case "nobrief":
      return withPPFallback(
        moves.reduce((best, m, i) => m.flavor.length > moves[best].flavor.length ? i : best, 0),
        moves
      );
    case "statusquo": {
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
@keyframes finish-flash {
  0%   { opacity: 0.85; }
  40%  { opacity: 0.92; }
  100% { opacity: 0; }
}
@keyframes arena-flash {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes dmg-float {
  0%   { opacity: 1; transform: translateY(0) scale(1.2); }
  60%  { opacity: 1; transform: translateY(-28px) scale(1); }
  100% { opacity: 0; transform: translateY(-42px) scale(0.8); }
}
@keyframes vfx-burst {
  0%   { opacity: 1; transform: scale(0.3); }
  50%  { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.4); }
}
@keyframes status-pulse {
  0%,100% { opacity: 0.7; }
  50% { opacity: 1; }
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
  // Use zone accent for high HP, yellow/red as warning zones
  const barColor = pct > 0.5 ? color : pct > 0.25 ? "#facc15" : "#ef4444";
  return (
    <div style={{ animation: shaking ? "hp-shake 0.4s ease-out" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color }}>{label}</span>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#4a6a8a" }}>
          {displayed}/{max}
        </span>
      </div>
      <div style={{ height: 7, background: "#0d1527", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", borderRadius: 0 }}>
        <div style={{
          height: "100%", width: `${pct * 100}%`,
          background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 8px ${barColor}90`,
          borderRadius: 0,
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
        borderRadius: 0,
      }}
    >
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: inactive ? "#2a3a50" : color, marginBottom: 4, letterSpacing: "0.05em" }}>
        {move.name.toUpperCase()}
      </div>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-pixel)", fontSize: 6,
          background: inactive ? "#1a2040" : color + "22",
          border: `1px solid ${inactive ? "#1a2040" : color + "50"}`,
          padding: "2px 5px",
          color: inactive ? "#2a3a50" : color,
          borderRadius: 0,
          letterSpacing: "0.04em",
        }}>{move.type}</span>
        <div style={{ flex: 1, height: 3, background: "#0d1527", borderRadius: 0, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${powerPct * 100}%`,
            background: inactive ? "#1a2040" : color,
            opacity: inactive ? 0.3 : 0.7,
            borderRadius: 0,
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

// ─── Floating Damage Number ──────────────────────────────────────────────────
function FloatingDmg({ value, color, side }: { value: string; color: string; side: "left" | "right" }) {
  return (
    <div style={{
      position: "absolute",
      top: side === "right" ? "30%" : "50%",
      left: side === "right" ? "65%" : "25%",
      zIndex: 15, pointerEvents: "none",
      fontFamily: "var(--font-pixel)", fontSize: 16, fontWeight: "bold",
      color, textShadow: `0 0 8px ${color}, 0 2px 4px rgba(0,0,0,0.8)`,
      animation: "dmg-float 1s ease-out forwards",
      letterSpacing: "0.05em",
    }}>{value}</div>
  );
}

// ─── Per-Type VFX Particles ──────────────────────────────────────────────────
const TYPE_VFX: Record<string, { emoji: string; count: number; color: string }> = {
  Vision:    { emoji: "✦", count: 5, color: "#f5b78a" },
  Search:    { emoji: "◎", count: 4, color: "#a8d39a" },
  Ops:       { emoji: "⚙", count: 5, color: "#f6a268" },
  AI:        { emoji: "⚡", count: 6, color: "#9fe8ff" },
  Capital:   { emoji: "◆", count: 4, color: "#f0c4ff" },
  Brand:     { emoji: "★", count: 5, color: "#ff9fd4" },
  Autonomy:  { emoji: "◈", count: 5, color: "#00e8a0" },
  Soul:      { emoji: "♪", count: 4, color: "#ffd29a" },
  Stack:     { emoji: "⬡", count: 6, color: "#7ce0ff" },
  Ghost:     { emoji: "◌", count: 5, color: "#8b6f9e" },
  Dark:      { emoji: "▲", count: 4, color: "#6a5a7a" },
  Normal:    { emoji: "●", count: 3, color: "#aaaaaa" },
  Fire:      { emoji: "🔥", count: 5, color: "#ff6b35" },
  Steel:     { emoji: "◇", count: 4, color: "#a8b8c8" },
  Water:     { emoji: "💧", count: 5, color: "#4a90d9" },
  Bug:       { emoji: "◉", count: 4, color: "#88b030" },
  Poison:    { emoji: "☠", count: 4, color: "#a040b0" },
  Ice:       { emoji: "❄", count: 5, color: "#98d8d8" },
  Electric:  { emoji: "⚡", count: 6, color: "#f8d030" },
  Psychic:   { emoji: "◎", count: 5, color: "#f85888" },
  Fighting:  { emoji: "✊", count: 4, color: "#c03028" },
  Sound:     { emoji: "♫", count: 4, color: "#ff9fd4" },
};

function AttackVFX({ type, side }: { type: string; side: "left" | "right" }) {
  const vfx = TYPE_VFX[type] ?? TYPE_VFX.Normal;
  return (
    <div style={{
      position: "absolute",
      top: side === "right" ? "20%" : "40%",
      left: side === "right" ? "55%" : "15%",
      width: 120, height: 120,
      zIndex: 12, pointerEvents: "none",
    }}>
      {Array.from({ length: vfx.count }).map((_, i) => {
        const angle = (i / vfx.count) * 360;
        const dist = 20 + Math.random() * 30;
        const dx = Math.cos(angle * Math.PI / 180) * dist;
        const dy = Math.sin(angle * Math.PI / 180) * dist;
        const delay = i * 0.05;
        return (
          <span key={i} style={{
            position: "absolute",
            left: `calc(50% + ${dx}px)`,
            top: `calc(50% + ${dy}px)`,
            fontSize: 16 + Math.random() * 8,
            color: vfx.color,
            textShadow: `0 0 12px ${vfx.color}`,
            animation: `vfx-burst 0.6s ${delay}s ease-out forwards`,
            opacity: 0,
          }}>{vfx.emoji}</span>
        );
      })}
    </div>
  );
}

// ─── Status Effect Indicators ────────────────────────────────────────────────
type StatusEffect = "burn" | "shield" | "haste";
const STATUS_DISPLAY: Record<StatusEffect, { icon: string; color: string; label: string }> = {
  burn:   { icon: "🔥", color: "#ff6b35", label: "BURN" },
  shield: { icon: "🛡", color: "#a8b8c8", label: "SHIELD" },
  haste:  { icon: "⚡", color: "#f8d030", label: "HASTE" },
};

function StatusBadges({ effects }: { effects: StatusEffect[] }) {
  if (!effects.length) return null;
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
      {effects.map(e => (
        <span key={e} style={{
          fontFamily: "var(--font-pixel)", fontSize: 6,
          background: STATUS_DISPLAY[e].color + "20",
          border: `1px solid ${STATUS_DISPLAY[e].color}60`,
          color: STATUS_DISPLAY[e].color,
          padding: "2px 5px", borderRadius: 0,
          animation: "status-pulse 2s ease-in-out infinite",
        }}>{STATUS_DISPLAY[e].icon} {STATUS_DISPLAY[e].label}</span>
      ))}
    </div>
  );
}

// ─── Main Battle component ───────────────────────────────────────────────────
export function Battle({ zone, ownedSkills, badges, onWin, onFlee, onFinishingBlow, opponentSpriteUrl, berries, onUseBerry }: {
  zone: Zone; ownedSkills: Set<string>; badges: Set<string>; onWin: () => void; onFlee: () => void;
  onFinishingBlow?: () => void;
  opponentSpriteUrl?: string; // For route trainer battles — shows the NPC sprite
  berries?: { heal: number; shield: number; speed: number };
  onUseBerry?: (type: string) => void;
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
  const [finishFlash, setFinishFlash] = useState(false);
  const [arenaFlash, setArenaFlash] = useState(false);
  // Phase 2: new state
  const [floatingDmg, setFloatingDmg] = useState<{ value: string; color: string; side: "left" | "right"; key: number } | null>(null);
  const [attackVfx, setAttackVfx] = useState<{ type: string; side: "left" | "right"; key: number } | null>(null);
  const [myStatuses, setMyStatuses] = useState<StatusEffect[]>([]);
  const [oppStatuses, setOppStatuses] = useState<StatusEffect[]>([]);
  const [phase, setPhase] = useState(1); // Status Quo has 2 phases
  const dmgKeyRef = useRef(0);
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
  // For route trainer battles: use the provided opponent sprite URL
  const npcBattleImg = opponentSpriteUrl ? getSprite(opponentSpriteUrl) : null;

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
        c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
        c.clearRect(0, 0, 200, 200);
        if (isReady(myBackImg)) {
          const bob = Math.sin(now / 350) * 3;
          c.drawImage(myBackImg, 10, 10 + bob, 180, 180);
        }
      }
      // oppRef draws the opponent large on the field
      if (oppRef.current) {
        const c = oppRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
        c.clearRect(0, 0, 400, 400);
        // Priority: creature sprite > leader portrait (NPC shown as portrait in HP card instead)
        const drawImg = (oppCreatureImg && isReady(oppCreatureImg)) ? oppCreatureImg
          : (npcBattleImg && isReady(npcBattleImg)) ? npcBattleImg
          : (leaderImg && isReady(leaderImg)) ? leaderImg : null;
        if (drawImg) {
          const bob = Math.sin(now / 420) * 3;
          c.drawImage(drawImg, 40, 40 + bob, 320, 320);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage.id, leaderImg, oppCreatureImg, myBackImg, battleBgImg]);

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
    // Haste: double hit
    if (myStatuses.includes("haste")) dmg = Math.round(dmg * 1.4);
    // Shield on opponent halves damage
    if (oppStatuses.includes("shield")) {
      dmg = Math.round(dmg * 0.5);
      setOppStatuses(s => s.filter(e => e !== "shield"));
    }
    if (miss) dmg = 0;

    const typeColor = TYPE_COLORS[move.type] ?? "#7ce0ff";

    // Step 1: Anticipation (200ms) — show attack name in log
    addLog(`${stage.name} used ${move.name}!`, "normal", move.type);

    // Step 2: VFX plays on target (after 200ms)
    setTimeout(() => {
      setAttackVfx({ type: move.type, side: "right", key: dmgKeyRef.current++ });
      setFlash({ color: typeColor + "28", dir: "left" });
      setTimeout(() => setFlash(null), 320);
      playSound(isSuper ? "super" : isCrit ? "crit" : "hit");
    }, 200);

    // Step 3: Shake target (after 350ms)
    setTimeout(() => {
      setOppShake(true);
      setTimeout(() => setOppShake(false), 450);
    }, 350);

    // Step 4: Damage number floats up (after 500ms)
    setTimeout(() => {
      if (miss) {
        setFloatingDmg({ value: "MISS", color: "#6a88b0", side: "right", key: dmgKeyRef.current++ });
        addLog(`${stage.name} missed!`, "info");
      } else {
        const dmgColor = isCrit ? "#ffd24a" : isSuper ? "#4ade80" : isNotSo ? "#f87171" : "#ffffff";
        const dmgText = isCrit ? `${dmg}!` : isSuper ? `${dmg}★` : `${dmg}`;
        setFloatingDmg({ value: dmgText, color: dmgColor, side: "right", key: dmgKeyRef.current++ });
        if (isCrit) addLog("⚡ CRITICAL HIT!", "crit");
        else if (isSuper) addLog("★ SUPER EFFECTIVE!", "super");
        else if (isNotSo) addLog("Not very effective…", "notso");
      }
      setTimeout(() => setFloatingDmg(null), 1000);
    }, 500);

    // Step 5: HP drains + effectiveness text (after 700ms)
    const nextOppHp = Math.max(0, oppHp - dmg);
    setTimeout(() => {
      setOppHp(nextOppHp);
      setOppHpShake(true);
      setTimeout(() => setOppHpShake(false), 500);
      setTimeout(() => setAttackVfx(null), 300);
      if (isSuper) {
        setSuperEffectText("SUPER EFFECTIVE!");
        setArenaFlash(true);
        setTimeout(() => setSuperEffectText(null), 900);
        setTimeout(() => setArenaFlash(false), 300);
      }
      if (isCrit) { setSuperEffectText("CRITICAL HIT!"); setTimeout(() => setSuperEffectText(null), 900); }

      // Apply status effects from player moves
      if (move.effect === "drain" && !oppStatuses.includes("burn")) {
        setOppStatuses(s => [...s, "burn"]);
        addLog(`${gym.opponentName} is BURNING!`, "super");
      }
      if (move.effect === "buff" && !myStatuses.includes("shield")) {
        setMyStatuses(s => [...s, "shield"]);
        addLog(`${stage.name} raised SHIELD!`, "info");
      }

      if (nextOppHp === 0) {
        // Phase 2 for Status Quo: revive at full HP with new strategy
        if (gym.leader === "statusquo" && phase === 1) {
          addLog(`${gym.opponentName} staggers... but rises again!`, "crit");
          addLog(`"You think one round ends this? I AM the status quo."`, "info");
          setPhase(2);
          setOppHp(Math.round(gym.hp * 0.6));
          setOppStatuses(["haste"]);
          setAnimating(false);
          return;
        }
        addLog(`${gym.opponentName} was defeated!`, "super");
        addLog(gym.victory, "info");
        setDone(true); playSound("victory");
        onFinishingBlow?.();
        setFinishFlash(true);
        setTimeout(() => setFinishFlash(false), 400);
        setTimeout(onWin, 1800);
        setAnimating(false); return;
      }

      // Burn DoT on opponent
      let burnDmg = 0;
      if (oppStatuses.includes("burn")) {
        burnDmg = Math.round(gym.hp * 0.05);
        const afterBurn = Math.max(0, nextOppHp - burnDmg);
        setTimeout(() => {
          addLog(`🔥 Burn deals ${burnDmg} damage!`, "notso");
          setOppHp(afterBurn);
          if (afterBurn === 0) {
            addLog(`${gym.opponentName} was defeated by burn!`, "super");
            setDone(true); playSound("victory");
            onFinishingBlow?.();
            setTimeout(onWin, 1800);
            setAnimating(false);
          }
        }, 400);
        if (nextOppHp - burnDmg <= 0) return;
      }

      // Leader counter-attack (after 1000ms delay — "thinking" pause)
      setTimeout(() => {
        // Leader AI: pick move, aggression scaling when below 50% HP
        const effectiveOppHp = nextOppHp - burnDmg;
        const stratCtx: StrategyCtx = {
          turn, myHp, myMaxHp: stage.hp,
          oppHp: effectiveOppHp, oppMaxHp: gym.hp,
          playerStageId: stage.id,
        };
        const leaderMoveIdx = pickLeaderMove(gym, stratCtx);
        const leaderMove = gym.moves[leaderMoveIdx];

        // Leader damage calculation
        let cd = Math.max(4, Math.round(leaderMove.power * 0.55));
        // Phase 2 aggression: +30% damage
        if (phase === 2) cd = Math.round(cd * 1.3);
        // Below 50% HP: leaders hit 20% harder
        if (effectiveOppHp < gym.hp * 0.5) cd = Math.round(cd * 1.2);
        // Haste on leader: extra hit
        if (oppStatuses.includes("haste")) cd = Math.round(cd * 1.3);
        // Shield on player halves incoming
        if (myStatuses.includes("shield")) {
          cd = Math.round(cd * 0.5);
          setMyStatuses(s => s.filter(e => e !== "shield"));
          addLog(`Shield absorbed the blow!`, "info");
        }

        const nextMyHp = Math.max(0, myHp - cd);

        // Leader attack VFX
        setAttackVfx({ type: leaderMove.type, side: "left", key: dmgKeyRef.current++ });
        setFlash({ color: "#ef444428", dir: "right" });
        setTimeout(() => setFlash(null), 320);
        setMeShake(true); setTimeout(() => setMeShake(false), 400);
        playSound("hit");
        addLog(`${gym.opponentName}: "${leaderMove.name}"`, "normal");
        addLog(leaderMove.flavor, "info");

        // Leader damage number
        setTimeout(() => {
          setFloatingDmg({ value: `-${cd}`, color: "#ef4444", side: "left", key: dmgKeyRef.current++ });
          setTimeout(() => setFloatingDmg(null), 1000);
          setMyHp(nextMyHp); setTurn(t => t + 1);
          setMyHpShake(true); setTimeout(() => setMyHpShake(false), 500);
          setTimeout(() => setAttackVfx(null), 400);

          // Leader applies status effects
          if (leaderMove.effect === "buff" && !oppStatuses.includes("shield")) {
            setOppStatuses(s => [...s, "shield"]);
            addLog(`${gym.opponentName} raised a shield!`, "info");
          }

          // Burn DoT on player
          if (myStatuses.includes("burn")) {
            const pBurn = Math.round(stage.hp * 0.04);
            setTimeout(() => {
              addLog(`🔥 You take ${pBurn} burn damage!`, "notso");
              setMyHp(h => Math.max(0, h - pBurn));
            }, 400);
          }

          if (nextMyHp === 0) {
            addLog(`${stage.name} fainted… HP restored.`, "notso");
            playSound("faint");
            setDefeatQuote(`${gym.opponentName}: "${leaderMove.flavor}"\n\nYour ${stage.name} fainted. HP restored — try again.`);
            setTimeout(() => { setMyHp(stage.hp); setDefeatQuote(null); setMyStatuses([]); setAnimating(false); }, 2800);
          } else setAnimating(false);
        }, 350);
      }, 1000);
    }, 700);
  }, [animating, done, gym, stage, oppHp, myHp, turn, ppUsed, addLog, onWin, onFinishingBlow, myStatuses, oppStatuses, phase]);

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50,
      display: "flex", flexDirection: "column",
      background: `linear-gradient(180deg, ${accent}0a 0%, #04080f 30%, #020508 100%)`,
      fontFamily: "var(--font-pixel)", overflow: "hidden",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
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

      {/* Finishing blow flash overlay */}
      {finishFlash && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 59, pointerEvents: "none",
          background: "rgba(255,255,255,0.85)",
          animation: "finish-flash 0.4s ease-out forwards",
        }} />
      )}

      {/* Zone header */}
      <div style={{
        flexShrink: 0, padding: "5px 14px",
        background: `linear-gradient(90deg, ${accent}20 0%, transparent 70%)`,
        borderBottom: `1px solid ${accent}50`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderRadius: 0,
      }}>
        <span style={{ fontSize: 7, color: accent, letterSpacing: "0.12em" }}>⚔ {zone.name.toUpperCase()}</span>
        <span style={{ fontSize: 6, color: accent, opacity: 0.55 }}>{gym.opponentTitle.toUpperCase()}</span>
      </div>

      {/* Arena */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        flexShrink: 0,
        borderBottom: `2px solid ${accent}80`,
        minHeight: "min(260px, 40dvh)", position: "relative", overflow: "hidden",
        background: arenaFlash ? `${accent}18` : "transparent",
        transition: "background 0.3s ease-out",
      }}>
        {/* Battle background PNG */}
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
            fontFamily: "var(--font-pixel)", fontSize: 11,
            color: superEffectText.includes("CRIT") ? "#ffd24a" : "#4ade80",
            textShadow: superEffectText.includes("CRIT")
              ? "0 0 20px #ffd24a, 0 0 40px #ffd24a88"
              : "0 0 20px #4ade80, 0 0 40px #4ade8088",
            animation: "super-flash 0.9s ease-out forwards",
            letterSpacing: "0.08em", whiteSpace: "nowrap",
          }}>{superEffectText}</div>
        )}

        {/* Floating damage number */}
        {floatingDmg && <FloatingDmg key={floatingDmg.key} value={floatingDmg.value} color={floatingDmg.color} side={floatingDmg.side} />}

        {/* Attack VFX particles */}
        {attackVfx && <AttackVFX key={attackVfx.key} type={attackVfx.type} side={attackVfx.side} />}

        {/* Player side */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "8px 12px 0 16px", position: "relative", zIndex: 2 }}>
          <div style={{ background: "rgba(3,7,18,0.92)", border: "2px solid #1a2a4a", padding: "8px 10px", marginBottom: 4, backdropFilter: "blur(4px)", borderRadius: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {/* Player pokemon PNG thumbnail in HP card */}
              <img
                src={PLAYER_FRONT_URL[stage.id] ?? PLAYER_FRONT_URL.mermander}
                alt={stage.name}
                style={{ width: 22, height: 22, imageRendering: "pixelated", border: "1px solid #1a2a4a", flexShrink: 0, borderRadius: 0 }}
                onError={e => (e.currentTarget.style.display = "none")}
              />
              <HPBar current={myHp} max={stage.hp} label={stage.name} color={stage.color} shaking={myHpShake} />
            </div>
            <div style={{ fontSize: 6, color: "#2a3a50", marginTop: 2 }}>{stage.tag} · {badges.size} BADGES</div>
            <StatusBadges effects={myStatuses} />
          </div>
          <div style={{ alignSelf: "flex-end", transform: meShake ? "translateX(-9px)" : "translateX(0)", transition: "transform 0.08s", filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.5))", animation: "sprite-enter-left 0.45s cubic-bezier(0.2,0.8,0.4,1)" }}>
            <canvas ref={meRef} width={200} height={200} style={{ imageRendering: "pixelated", width: 160, height: 160 }} />
          </div>
        </div>

        {/* Opponent side */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "0 16px 8px 12px", justifyContent: "flex-start", position: "relative", zIndex: 2 }}>
          {/* Leader portrait — large, behind the creature */}
          {leaderImg && isReady(leaderImg) && (
            <div style={{
              position: "absolute", top: 8, right: 16, opacity: 0.35,
              filter: `drop-shadow(0 0 20px ${accent})`,
              animation: "sprite-enter-right 0.6s cubic-bezier(0.2,0.8,0.4,1)",
              pointerEvents: "none",
            }}>
              <img src={LEADER_URL[gym.leader]} alt="" style={{
                width: 160, height: 160, imageRendering: "pixelated", objectFit: "contain",
              }} />
            </div>
          )}
          <div style={{ transform: oppShake ? "none" : "none", animation: `${oppShake ? "opp-shake 0.45s ease-out" : "sprite-enter-right 0.45s cubic-bezier(0.2,0.8,0.4,1)"}`, filter: `drop-shadow(0 0 28px ${accent}90)` }}>
            <canvas ref={oppRef} width={400} height={400} style={{ imageRendering: "pixelated", width: 200, height: 200 }} />
          </div>
          <div style={{ background: "rgba(3,7,18,0.92)", border: `2px solid ${accent}99`, padding: "8px 10px", width: "100%", backdropFilter: "blur(4px)", borderRadius: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              {/* Leader/NPC portrait — prominent in HP card */}
              {(() => {
                const portraitImg = (npcBattleImg && isReady(npcBattleImg)) ? opponentSpriteUrl
                  : (leaderImg && isReady(leaderImg) && LEADER_URL[gym.leader]) ? LEADER_URL[gym.leader]
                  : null;
                if (!portraitImg) return null;
                return (
                  <img src={portraitImg} alt="" style={{
                    width: 40, height: 40, imageRendering: "pixelated",
                    border: `2px solid ${accent}80`, flexShrink: 0, borderRadius: 0,
                    boxShadow: `0 0 12px ${accent}40`,
                  }} />
                );
              })()}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 7, color: accent, letterSpacing: "0.06em", marginBottom: 2 }}>{gym.opponentName.toUpperCase()}</div>
                <div style={{ fontSize: 6, color: "#3a5070" }}>{gym.opponentTitle.toUpperCase()}</div>
              </div>
            </div>
            <HPBar current={oppHp} max={gym.hp} label={gym.opponentName} color={accent} shaking={oppHpShake} />
            <div style={{ fontSize: 6, color: "#2a3a50", marginTop: 4 }}>WEAK: {gym.weakTo.slice(0, 2).join(", ")}</div>
            <StatusBadges effects={oppStatuses} />
          </div>
        </div>
      </div>

      {/* Battle log — compact */}
      <div style={{ height: "min(80px, 12dvh)", overflowY: "auto", padding: "4px 14px", borderBottom: "2px solid #0a1525", background: "rgba(2,5,12,0.92)", flexShrink: 0 }}>
        {log.slice(-3).map((l, i) => {
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
                      padding: "1px 5px", borderRadius: 0, flexShrink: 0,
                    }}>{l.type}</span>
                  )}
                </div>
              ) : isFlavor ? (
                /* Flavor text — italic, slightly smaller, muted — this is the story moment */
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
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
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: "#3a5070", lineHeight: 1.6 }}>
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
          {done ? `— VICTORY · ${zone.name.toUpperCase()} —` : animating ? "— OPPONENT TURN —" : `▸ CHOOSE A MOVE · TURN ${turn + 1}${phase > 1 ? " · PHASE 2" : ""}`}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, flex: 1, alignContent: "start", overflowY: "auto" }}>
          {allMoves.slice(0, 8).map(move => (
            <MoveButton key={move.id} move={move} disabled={animating || done} ppLeft={(move.pp) - (ppUsed[move.id] ?? 0)} onClick={() => useMove(move)} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          {/* Berry items */}
          {berries && onUseBerry && (
            <div style={{ display: "flex", gap: 4 }}>
              {([
                { type: "heal", label: "HEAL", icon: "💚", desc: "+30 HP", color: "#4ade80" },
                { type: "shield", label: "SHIELD", icon: "🛡", desc: "Block hit", color: "#a8b8c8" },
                { type: "speed", label: "SPEED", icon: "⚡", desc: "Act first", color: "#f8d030" },
              ] as const).map(b => {
                const count = berries[b.type as keyof typeof berries];
                const canUse = count > 0 && !animating && !done;
                return (
                  <button key={b.type}
                    disabled={!canUse}
                    onClick={() => {
                      if (!canUse) return;
                      onUseBerry(b.type);
                      if (b.type === "heal") {
                        const healAmt = Math.min(30, stage.hp - myHp);
                        setMyHp(h => Math.min(stage.hp, h + 30));
                        addLog(`Used Heal Berry! +${healAmt} HP`, "super");
                        playSound("catch");
                      } else if (b.type === "shield") {
                        setMyStatuses(s => s.includes("shield") ? s : [...s, "shield"]);
                        addLog("Used Shield Berry! Next hit blocked.", "info");
                        playSound("badge");
                      } else if (b.type === "speed") {
                        setMyStatuses(s => s.includes("haste") ? s : [...s, "haste"]);
                        addLog("Used Speed Berry! Acting faster!", "info");
                        playSound("super");
                      }
                    }}
                    style={{
                      background: canUse ? `${b.color}15` : "transparent",
                      border: `1px solid ${canUse ? b.color + "50" : "#0d1a2a"}`,
                      color: canUse ? b.color : "#1a2a3a",
                      padding: "4px 8px",
                      fontFamily: "var(--font-pixel)", fontSize: 6,
                      cursor: canUse ? "pointer" : "not-allowed",
                      borderRadius: 0, transition: "all 0.1s",
                    }}
                  >
                    {b.icon} {count}
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={onFlee}
            style={{ background: "transparent", border: "1px solid #0d1a2a", color: "#1a2a3a", padding: "6px 18px", fontFamily: "var(--font-pixel)", fontSize: 7, cursor: "pointer", borderRadius: 0, transition: "all 0.12s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef444450"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0d1a2a"; (e.currentTarget as HTMLButtonElement).style.color = "#1a2a3a"; }}
          >↩ FLEE</button>
        </div>
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
