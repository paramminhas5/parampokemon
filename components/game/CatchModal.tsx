"use client";
import { useEffect, useState, useRef } from "react";
import type { Zone, Move } from "@/game/data";
import { STARTER_STAGES, stageForBadges, stageForSkills } from "@/game/data";
import { CREATURE_URL, POKEBALL_URL, PLAYER_BACK_URL, getSprite, isReady } from "@/game/sprite-registry";
import { playSound } from "@/lib/audio";

type Phase = "battle" | "weakened" | "throwing" | "caught" | "fled";

export function CatchModal({ zone, badges, skills, onCatch, onClose }: {
  zone: Zone;
  badges: Set<string>;
  skills?: Set<string>;
  onCatch: () => void;
  onClose: () => void;
}) {
  const cr = zone.creature!;
  const url = CREATURE_URL[zone.id];
  const stage = skills ? stageForSkills(skills.size) : stageForBadges(badges.size);

  const [phase, setPhase] = useState<Phase>("battle");
  const [creatureHp, setCreatureHp] = useState(cr.power * 2);
  const maxHp = cr.power * 2;
  const [myHp, setMyHp] = useState(stage.hp);
  const [log, setLog] = useState<string[]>([`A wild ${cr.name} appeared!`, `Type: ${cr.type} · Power: ${cr.power}`]);
  const [animating, setAnimating] = useState(false);
  const [shake, setShake] = useState(false);

  const meRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const loop = (now: number) => {
      if (meRef.current) {
        const c = meRef.current.getContext("2d")!;
        c.clearRect(0, 0, 96, 96);
        // Use HD PNG sprite — BACK view (facing the enemy)
        const spriteUrl = PLAYER_BACK_URL[stage.id] ?? PLAYER_BACK_URL.mermander;
        const img = getSprite(spriteUrl);
        if (img && isReady(img)) {
          c.imageSmoothingEnabled = true;
          c.imageSmoothingQuality = "high";
          const bob = Math.sin(now / 350) * 2;
          c.drawImage(img, 4, 4 + bob, 88, 88);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage.id]);

  useEffect(() => {
    if (phase !== "throwing") return;
    const t = setTimeout(() => {
      setPhase("caught");
      onCatch();
      playSound("catch");
    }, 2000);
    return () => clearTimeout(t);
  }, [phase, onCatch]);

  // Quick moves for catching
  const quickMoves: Move[] = [
    { id: "tackle", name: "Tackle", type: "Normal", power: Math.round(cr.power * 0.8), pp: 10, accuracy: 100, category: "physical", flavor: "A standard strike." },
    { id: "water", name: "Water Pulse", type: stage.baseMoves[0]?.type ?? "Search", power: cr.power, pp: 8, accuracy: 95, category: "special", flavor: "A focused pulse." },
  ];

  function attack(move: Move) {
    if (animating || phase !== "battle") return;
    setAnimating(true);
    const miss = Math.random() * 100 > move.accuracy;
    const dmg = miss ? 0 : Math.max(1, Math.round(move.power * (0.8 + Math.random() * 0.4)));
    const next = Math.max(0, creatureHp - dmg);

    setShake(true);
    setTimeout(() => setShake(false), 400);
    playSound("hit");

    if (miss) {
      setLog(l => [...l.slice(-4), `${stage.name} used ${move.name}… missed!`]);
    } else {
      setLog(l => [...l.slice(-4), `${stage.name} used ${move.name}! Dealt ${dmg} damage.`]);
    }

    setTimeout(() => {
      setCreatureHp(next);
      if (next === 0 || next <= maxHp * 0.25) {
        setLog(l => [...l.slice(-4), `${cr.name} is weakened! Now's your chance!`]);
        setPhase("weakened");
        setAnimating(false);
        return;
      }
      // Creature counter
      const counterDmg = Math.max(1, Math.round(cr.power * 0.3));
      const nextMy = Math.max(1, myHp - counterDmg); // can't faint catching
      setTimeout(() => {
        setLog(l => [...l.slice(-4), `${cr.name} fights back! You take ${counterDmg}.`]);
        setMyHp(nextMy);
        setAnimating(false);
      }, 500);
    }, 400);
  }

  const pct = Math.max(0, creatureHp / maxHp);
  const hpColor = pct > 0.5 ? "#4ade80" : pct > 0.25 ? "#facc15" : "#ef4444";

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 40,
      background: "rgba(4,8,20,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
      padding: 12,
    }} onClick={(phase === "caught" || phase === "fled") ? onClose : undefined}>
      <div style={{
        width: "100%", maxWidth: 400,
        border: `2px solid ${zone.theme.accent}60`,
        background: `linear-gradient(180deg, ${zone.theme.accent}08 0%, #050c18 100%)`,
        boxShadow: `0 0 30px ${zone.theme.accent}20`,
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: "10px 14px",
          borderBottom: `1px solid ${zone.theme.accent}30`,
          fontFamily: "var(--font-pixel)", fontSize: 8,
          color: zone.theme.accent,
        }}>★ WILD {cr.name.toUpperCase()}</div>

        {/* Battle area — Player LEFT (back), Creature RIGHT */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          padding: "12px 16px", gap: 12, alignItems: "center",
        }}>
          {/* Player side (LEFT — facing right toward creature) */}
          <div style={{ textAlign: "center" }}>
            <canvas ref={meRef} width={96} height={96}
              style={{ imageRendering: "pixelated", width: 100, height: 100 }} />
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: stage.color, marginTop: 3 }}>
              {stage.name}
            </div>
            <div style={{ height: 5, background: "#0d1527", border: "1px solid #1a2a4a", overflow: "hidden", marginTop: 4 }}>
              <div style={{ height: "100%", width: `${(myHp / stage.hp) * 100}%`, background: "#4ade80", transition: "width 0.4s" }} />
            </div>
          </div>

          {/* Creature side (RIGHT — the wild encounter) */}
          <div style={{ textAlign: "center" }}>
            {url && (
              <div style={{
                display: "inline-block",
                transform: shake ? "translateX(6px) rotate(5deg)" : "translateX(0)",
                transition: "transform 0.08s",
                filter: `drop-shadow(0 0 14px ${zone.theme.accent}60)`,
              }}>
                <img src={url} alt={cr.name}
                  style={{ width: 100, height: 100, imageRendering: "pixelated",
                           opacity: phase === "weakened" || creatureHp <= maxHp * 0.25 ? 0.6 : 1 }} />
              </div>
            )}
            <div style={{ marginTop: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 3 }}>
                <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: zone.theme.accent }}>{cr.name}</span>
                <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070" }}>{cr.type}</span>
              </div>
              <div style={{ height: 5, background: "#0d1527", border: "1px solid #1a2a4a", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct * 100}%`, background: hpColor, transition: "width 0.4s" }} />
              </div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070", marginTop: 3 }}>
                {creatureHp}/{maxHp} HP
              </div>
            </div>
          </div>
        </div>

        {/* Log */}
        <div style={{
          margin: "0 12px", padding: "8px 10px",
          background: "rgba(3,6,14,0.9)", border: "1px solid #0d1a2a",
          minHeight: 52,
        }}>
          {log.slice(-2).map((l, i) => (
            <div key={i} style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: i === 0 ? "#3a5070" : "#c8d8f0", lineHeight: 1.7 }}>
              {l}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {phase === "battle" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {quickMoves.map(m => (
                  <button key={m.id} onClick={() => attack(m)} disabled={animating}
                    style={{
                      background: animating ? "#060c18" : "rgba(124,224,255,0.08)",
                      border: `1px solid ${animating ? "#1a2040" : "#2a4060"}`,
                      color: animating ? "#2a3a50" : "#7ce0ff",
                      padding: "8px 6px", cursor: animating ? "not-allowed" : "pointer",
                      fontFamily: "var(--font-pixel)", fontSize: 8,
                    }}>
                    {m.name.toUpperCase()}
                    <div style={{ fontSize: 6, color: "#3a5070", marginTop: 2 }}>PWR {m.power}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => { setPhase("fled"); setLog(l => [...l, `${cr.name} got away.`]); }}
                style={{
                  background: "transparent", border: "1px solid #1a2a3a",
                  color: "#3a5070", padding: "6px", cursor: "pointer",
                  fontFamily: "var(--font-pixel)", fontSize: 7,
                }}>RUN</button>
            </>
          )}

          {phase === "weakened" && (
            <>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#ffd24a", textAlign: "center", marginBottom: 4 }}>
                {cr.name} is weakened! Throw a pokéball!
              </div>
              <button onClick={() => { setPhase("throwing"); playSound("catch"); }}
                style={{
                  background: "linear-gradient(135deg, rgba(124,224,255,0.15) 0%, rgba(58,120,216,0.1) 100%)",
                  border: "1px solid #7ce0ff", color: "#7ce0ff",
                  padding: "12px", cursor: "pointer",
                  fontFamily: "var(--font-pixel)", fontSize: 10,
                }}>▶ THROW POKÉBALL</button>
            </>
          )}

          {phase === "throwing" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <img src={POKEBALL_URL} alt="" style={{ width: 48, height: 48, imageRendering: "pixelated", animation: "pq-shake 0.4s ease-in-out 4" }} />
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#7ce0ff", marginTop: 8 }}>
                Shake… shake… shake…
              </div>
            </div>
          )}

          {phase === "caught" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#4ade80", marginBottom: 8 }}>★ GOTCHA!</div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#c8d8f0", marginBottom: 12 }}>
                {cr.name} joined the team.
              </div>
              <button onClick={onClose} style={{
                background: "#4ade8018", border: "1px solid #4ade80",
                color: "#4ade80", padding: "10px 20px",
                fontFamily: "var(--font-pixel)", fontSize: 9, cursor: "pointer",
              }}>CONTINUE ▶</button>
            </div>
          )}

          {phase === "fled" && (
            <button onClick={onClose} style={{
              background: "transparent", border: "1px solid #1a2a3a",
              color: "#3a5070", padding: "10px",
              fontFamily: "var(--font-pixel)", fontSize: 8, cursor: "pointer",
            }}>GOT AWAY — CONTINUE</button>
          )}
        </div>
      </div>
    </div>
  );
}
