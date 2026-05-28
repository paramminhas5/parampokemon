"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createEngine, TILE } from "@/game/engine";
import { ZONES, type Interactive, type Zone, type NpcKind, PLAYER_SPAWN, stageForBadges } from "@/game/data";
import { DialogBox } from "./DialogBox";
import { StartMenu } from "./StartMenu";
import { Bag } from "./Bag";
import { CliffNotes } from "./CliffNotes";
import { Battle } from "./Battle";
import { BattleIntro } from "./BattleIntro";
import { CatchModal } from "./CatchModal";
import { WorldMap } from "./WorldMap";
import { WorldSelect } from "./WorldSelect";
import { ContactModal } from "./ContactModal";
import { PressModal } from "./PressModal";
import { EvolutionCutscene, checkEvolution } from "./EvolutionCutscene";
import { TransitionOverlay, type TransitionKind } from "./TransitionOverlay";
import { ZoneAmbience } from "./ZoneAmbience";
import { TitleScreen } from "./TitleScreen";
import { VictoryMoment } from "./VictoryMoment";
import { SkillLearnOverlay } from "./SkillLearnOverlay";
import { TouchControls } from "./TouchControls";
import { ChampionCard } from "./ChampionCard";
import { playSound, playZoneBGM, playBattleBGM, stopBattleBGM, stopBGM, setMuted, isMuted, loadMutePref } from "@/lib/audio";
import { ZoneTitle } from "./ZoneTitle";
import { Interior } from "./Interior";

const INIT_W = 20 * TILE;
const INIT_H = 14 * TILE;

export type GameDialog =
  | { type: "npc"; name: string; role: string; quote: string; kind?: NpcKind }
  | { type: "sign"; text: string }
  | { type: "badge"; label: string; outcome: string }
  | null;

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);

  const [dialog, setDialog] = useState<GameDialog>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [cliffOpen, setCliffOpen] = useState<Zone | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [worldSelectOpen, setWorldSelectOpen] = useState(true); // open on launch
  const [battle, setBattle] = useState<Zone | null>(null);
  const [battleIntro, setBattleIntro] = useState<Zone | null>(null);
  const [evolution, setEvolution] = useState<{ from: ReturnType<typeof stageForBadges>; to: ReturnType<typeof stageForBadges> } | null>(null);
  const [catchModal, setCatchModal] = useState<Zone | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [pressOpen, setPressOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(null);
  const [gotBadge, setGotBadge] = useState<{ label: string; color: string } | null>(null);
  const [muted, setMutedState] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [transition, setTransition] = useState<{ kind: TransitionKind; color: string; key: number } | null>(null);
  const transKeyRef = useRef(0);

  // Phase 2: narrative state
  const [titleDone, setTitleDone] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [victoryZone, setVictoryZone] = useState<Zone | null>(null);
  const [skillLearnZone, setSkillLearnZone] = useState<{ zone: Zone; npcName: string } | null>(null);
  const [zoneTitle, setZoneTitle] = useState<Zone | null>(null);
  const [interiorZone, setInteriorZone] = useState<Zone | null>(null);
  // Phase 5: champion card
  const [championOpen, setChampionOpen] = useState(false);

  const [badges, setBadges] = useState<Set<string>>(new Set());
  const [creatures, setCreatures] = useState<Set<string>>(new Set());
  const [skills, setSkills] = useState<Set<string>>(new Set());
  const [defeated, setDefeated] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set([ZONES[0].id]));
  const [currentZoneId, setCurrentZoneId] = useState<string>(ZONES[0].id);
  const caughtRef = useRef<Set<string>>(new Set());

  // Load save
  useEffect(() => {
    loadMutePref();
    setMutedState(isMuted());
    try {
      const raw = localStorage.getItem("pq_save");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.badges) setBadges(new Set(s.badges));
        if (s.creatures) { setCreatures(new Set(s.creatures)); caughtRef.current = new Set(s.creatures); }
        if (s.skills) setSkills(new Set(s.skills));
        if (s.defeated) setDefeated(new Set(s.defeated));
        if (s.visited) setVisited(new Set(s.visited));
        // If they have a save, not a first visit
        setIsFirstVisit(false);
        setTitleDone(false); // still show title but skip professor
      } else {
        // Truly first visit — show full title + professor intro
        setIsFirstVisit(true);
        setTitleDone(false);
      }
    } catch {
      setIsFirstVisit(true);
      setTitleDone(false);
    }
  }, []);

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem("pq_save", JSON.stringify({
        badges: [...badges], creatures: [...creatures],
        skills: [...skills], defeated: [...defeated], visited: [...visited],
      }));
    } catch {}
  }, [badges, creatures, skills, defeated, visited]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((title: string, sub?: string) => {
    setToast({ title, sub });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const isModalOpen = !!(dialog || menuOpen || bagOpen || cliffOpen || mapOpen || worldSelectOpen || battle || battleIntro || catchModal || contactOpen || pressOpen || evolution || victoryZone || skillLearnZone || !titleDone || championOpen || interiorZone);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = createEngine(canvasRef.current, {
      onInteract: (i: Interactive) => {
        if (i.kind === "npc") {
          if (i.npc.special === "contact") { setContactOpen(true); engine.setPaused(true); return; }
          setDialog({ type: "npc", name: i.npc.name, role: i.npc.role, quote: i.npc.quote, kind: i.npc.kind });
          engine.setPaused(true);
          if (i.npc.beat === "did" && i.zone.creature && !caughtRef.current.has(i.zone.creature.id)) {
            setTimeout(() => setCatchModal(i.zone), 400);
          }
          if (i.npc.beat === "learned" && i.zone.skill) {
            setSkills(prev => {
              if (prev.has(i.zone.skill!.id)) return prev;
              const n = new Set(prev); n.add(i.zone.skill!.id);
              engine.addSkill(i.zone.skill!.id);
              // Show rich skill learn overlay instead of just a toast
              setSkillLearnZone({ zone: i.zone, npcName: i.npc.name });
              return n;
            });
          }
        } else if (i.kind === "sign") {
          // Check if this is a press wall sign
          if ((i.sign as { pressWall?: boolean }).pressWall) {
            setPressOpen(true); engine.setPaused(true); return;
          }
          setDialog({ type: "sign", text: i.sign.text });
          engine.setPaused(true);
        }
      },
      onZoneEnter: (z: Zone) => {
        setCurrentZoneId(z.id);
        setVisited(prev => { const n = new Set(prev); n.add(z.id); return n; });
        showToast(z.name.toUpperCase(), z.subtitle);
        // Fire zone transition + BGM
        transKeyRef.current += 1;
        setTransition({ kind: "zone", color: z.theme.accent, key: transKeyRef.current });
        playZoneBGM(z.theme.ground as Parameters<typeof playZoneBGM>[0]);
        // Zone arrival cinematic (skip for Home — player starts there)
        if (z.id !== "home") {
          setZoneTitle(z);
          engine.setPaused(true);
        }
        if (z.id !== "home") { setCliffOpen(z); }
      },
      onMenu: () => { setMenuOpen(true); engine.setPaused(true); },
      onBadge: (badgeId: string) => {
        setBadges(prev => { const n = new Set(prev); n.add(badgeId); return n; });
      },
      onGymEnter: (z: Zone) => {
        // Show battle intro first, then real battle + battle BGM
        setBattleIntro(z);
        playBattleBGM();
        engine.setPaused(true);
      },
      onWild: (z: Zone) => { setCatchModal(z); engine.setPaused(true); },
      onDoorEnter: (z: Zone) => {
        setInteriorZone(z);
        engine.setPaused(true);
        playSound("warp");
      },
    });
    engineRef.current = engine;
    setEngineReady(true);

    // Sync player stage to current badge progression
    engine.setPlayerStage(stageForBadges(badges.size).id);

    // Restore engine state
    try {
      const raw = localStorage.getItem("pq_save");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.badges) s.badges.forEach((id: string) => engine.state.collectedBadges.add(id));
        if (s.creatures) s.creatures.forEach((id: string) => engine.state.collectedCreatures.add(id));
        if (s.skills) s.skills.forEach((id: string) => engine.state.collectedSkills.add(id));
        if (s.defeated) s.defeated.forEach((id: string) => engine.state.defeatedGyms.add(id));
      }
    } catch {}

    return () => engine.destroy();
  }, [showToast]);

  useEffect(() => {
    engineRef.current?.setPaused(isModalOpen);
  }, [isModalOpen]);

  function handleWarp(zoneId: string) {
    setWorldSelectOpen(false);
    setMapOpen(false);
    // Fire warp transition
    transKeyRef.current += 1;
    const z = ZONES.find(x => x.id === zoneId);
    setTransition({ kind: "warp", color: z?.theme.accent ?? "#7ce0ff", key: transKeyRef.current });
    setTimeout(() => {
      engineRef.current?.warpTo(zoneId);
      engineRef.current?.setPaused(false);
    }, 260);
    playSound("warp");
    if (z) {
      setCurrentZoneId(zoneId);
      setVisited(prev => { const n = new Set(prev); n.add(zoneId); return n; });
      showToast(`⚡ ${z.name.toUpperCase()}`, z.subtitle);
      // Start zone BGM after warp completes
      setTimeout(() => playZoneBGM(z.theme.ground as Parameters<typeof playZoneBGM>[0]), 300);
    }
  }

  function handleBattleWin(zone: Zone) {
    setBattle(null);
    // Stop battle BGM — victory moment plays its own fanfare
    stopBattleBGM();
    // Show victory moment overlay FIRST, then award badge after player clicks continue
    setVictoryZone(zone);
    engineRef.current?.setPaused(true);
  }

  function handleVictoryContinue(zone: Zone) {
    setVictoryZone(null);
    engineRef.current?.markGymDefeated(zone.id, zone.badge.id);
    const prevBadgeCount = badges.size;
    const newBadgeCount = prevBadgeCount + 1;
    setBadges(prev => { const n = new Set(prev); n.add(zone.badge.id); return n; });
    setDefeated(prev => { const n = new Set(prev); n.add(zone.id); return n; });
    setGotBadge({ label: zone.badge.label, color: zone.badge.color });
    playSound("badge");
    // Resume zone BGM
    playZoneBGM(zone.theme.ground as Parameters<typeof playZoneBGM>[0]);
    // Champion card if this is the final gym (iterate = last zone with gym)
    const gymZones = ZONES.filter(z => z.gym);
    const isLastGym = zone.id === gymZones[gymZones.length - 1]?.id;
    if (isLastGym) {
      setTimeout(() => {
        setGotBadge(null);
        setChampionOpen(true);
        engineRef.current?.setPaused(true);
      }, 1500);
      setTimeout(() => setGotBadge(null), 1400);
      engineRef.current?.setPaused(false);
      showToast(`★ CHAMPION! ${zone.badge.label.toUpperCase()}`, "Quest complete.");
      return;
    }
    // Check for evolution
    const evo = checkEvolution(prevBadgeCount, newBadgeCount);
    if (evo) {
      setTimeout(() => {
        setGotBadge(null);
        setEvolution(evo);
        engineRef.current?.setPaused(true);
      }, 1800);
    }
    setTimeout(() => setGotBadge(null), 3500);
    engineRef.current?.setPaused(false);
    showToast(`★ ${zone.badge.label.toUpperCase()} EARNED`, zone.gym?.victory);
  }

  const currentZone = ZONES.find(z => z.id === currentZoneId) ?? ZONES[0];
  const totalGyms = ZONES.filter(z => z.gym).length;

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#020509",
      overflow: "hidden",
    }}>
      {/* Animated nebula + particle background — replaces flat black */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "linear-gradient(135deg, #0a0620 0%, #060d28 25%, #04121f 50%, #060a1a 75%, #0a0618 100%)",
        overflow: "hidden",
      }}>
        {/* Deep nebula blobs */}
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: "60%", height: "80%",
          background: "radial-gradient(ellipse at center, rgba(124,100,255,0.18) 0%, transparent 70%)",
          filter: "blur(40px)", animation: "nebula-drift 18s ease-in-out infinite alternate",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", right: "-5%",
          width: "55%", height: "70%",
          background: "radial-gradient(ellipse at center, rgba(0,232,160,0.12) 0%, transparent 65%)",
          filter: "blur(50px)", animation: "nebula-drift 22s ease-in-out infinite alternate-reverse",
        }} />
        <div style={{
          position: "absolute", top: "30%", left: "40%",
          width: "40%", height: "50%",
          background: "radial-gradient(ellipse at center, rgba(232,100,180,0.08) 0%, transparent 70%)",
          filter: "blur(60px)", animation: "nebula-drift 15s ease-in-out infinite alternate",
        }} />
        {/* Animated grid lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(124,224,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,224,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "grid-scroll 30s linear infinite",
        }} />
        {/* Stars */}
        {[...Array(120)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 37.1 + 5) % 100}%`,
            top: `${(i * 53.3 + 7) % 100}%`,
            width: i % 9 === 0 ? 3 : i % 4 === 0 ? 2 : 1,
            height: i % 9 === 0 ? 3 : i % 4 === 0 ? 2 : 1,
            background: i % 7 === 0 ? "#7ce0ff" : i % 5 === 0 ? "#c89af0" : i % 3 === 0 ? "#ffd24a" : "#fff",
            borderRadius: "50%",
            opacity: 0.08 + (i % 6) * 0.05,
            animation: `star-twinkle ${2 + (i % 4)}s ease-in-out ${(i % 5) * 0.4}s infinite alternate`,
          }} />
        ))}
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div key={`p${i}`} style={{
            position: "absolute",
            left: `${(i * 61.3) % 100}%`,
            top: `${(i * 41.7) % 100}%`,
            width: 4, height: 4,
            background: i % 3 === 0 ? "#7ce0ff" : i % 2 === 0 ? "#00e8a0" : "#c89af0",
            borderRadius: "50%",
            opacity: 0.15 + (i % 4) * 0.04,
            animation: `particle-float ${6 + (i % 6)}s ease-in-out ${(i % 4) * 0.5}s infinite alternate`,
            boxShadow: i % 3 === 0 ? `0 0 8px #7ce0ff` : i % 2 === 0 ? `0 0 8px #00e8a0` : `0 0 8px #c89af0`,
          }} />
        ))}
      </div>

      {/* Game container - boxed on desktop */}
      <div style={{
        position: "relative",
        width: "min(100vw, 960px)",
        height: "min(100vh, 640px)",
        zIndex: 1,
        display: "flex", flexDirection: "column",
        boxShadow: "0 0 80px rgba(0,0,0,0.8), 0 0 2px rgba(124,224,255,0.15)",
        border: "1px solid rgba(124,224,255,0.06)",
      }}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={INIT_W}
          height={INIT_H}
          style={{ width: "100%", height: "100%", imageRendering: "pixelated", display: "block" }}
        />

        {/* Zone ambient overlay */}
        <ZoneAmbience ground={currentZone.theme.ground} accent={currentZone.theme.accent} />

        {/* Title screen — shown first, gates WorldSelect */}
        {!titleDone && (
          <TitleScreen
            isFirstVisit={isFirstVisit}
            onComplete={() => {
              setTitleDone(true);
              // After title, always open WorldSelect
              setWorldSelectOpen(true);
            }}
          />
        )}

        {/* HUD — TOP */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px",
          paddingTop: "calc(env(safe-area-inset-top) + 8px)",
          pointerEvents: "none", zIndex: 20,
        }}>
          {/* Zone name card — accent-colored */}
          <div style={{
            flex: 1, minWidth: 0,
            background: `linear-gradient(135deg, ${currentZone.theme.accent}18 0%, rgba(4,8,20,0.88) 100%)`,
            border: `2px solid ${currentZone.theme.accent}35`,
            padding: "5px 10px", pointerEvents: "auto",
            backdropFilter: "blur(4px)",
            transition: "border-color 0.4s, background 0.4s",
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: currentZone.theme.accent, opacity: 0.7, letterSpacing: "0.1em" }}>NOW IN</div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#c8d8f0", lineHeight: 1, marginTop: 2 }}
                 className="truncate">{currentZone.name.toUpperCase()}</div>
          </div>

          {/* Badge counter */}
          <div style={{
            background: `linear-gradient(135deg, rgba(255,210,74,0.12) 0%, rgba(4,8,20,0.88) 100%)`,
            border: "2px solid rgba(255,210,74,0.25)",
            padding: "5px 10px", pointerEvents: "auto",
            backdropFilter: "blur(4px)",
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#ffd24a" }}>★ {defeated.size}/{totalGyms}</div>
          </div>

          {/* WORLD SELECT / MAP buttons */}
          <button
            onClick={() => { setMapOpen(true); playSound("menu"); }}
            style={{
              background: "rgba(4,8,20,0.88)",
              border: "2px solid #1a2a4a",
              color: "#4a6080", padding: "5px 10px",
              fontFamily: "var(--font-pixel)", fontSize: 8,
              cursor: "pointer", pointerEvents: "auto",
              backdropFilter: "blur(4px)",
              transition: "all 0.12s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#7ce0ff55"; (e.currentTarget as HTMLButtonElement).style.color = "#7ce0ff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a2a4a"; (e.currentTarget as HTMLButtonElement).style.color = "#4a6080"; }}
          >MAP</button>
          <button
            onClick={() => { setWorldSelectOpen(true); playSound("menu"); }}
            style={{
              background: "linear-gradient(135deg, rgba(124,224,255,0.15) 0%, rgba(58,120,216,0.08) 100%)",
              border: "2px solid #7ce0ff55",
              color: "#7ce0ff", padding: "5px 10px",
              fontFamily: "var(--font-pixel)", fontSize: 8,
              cursor: "pointer", pointerEvents: "auto",
              backdropFilter: "blur(4px)",
              transition: "all 0.12s",
            }}
          >⚡ WARP</button>

          <button onClick={() => { const m = !muted; setMuted(m); setMutedState(m); }} style={{
            background: "rgba(4,8,20,0.88)", border: "2px solid #1a2a4a",
            padding: "5px 8px", color: muted ? "#2a3a50" : "#5580aa",
            fontFamily: "var(--font-pixel)", fontSize: 11,
            cursor: "pointer", pointerEvents: "auto",
            backdropFilter: "blur(4px)",
          }}>{muted ? "🔇" : "🔊"}</button>

          <Link href="/" style={{
            background: "rgba(4,8,20,0.88)", border: "2px solid #1a2a4a",
            padding: "5px 8px", fontFamily: "var(--font-pixel)", fontSize: 8,
            color: "#3a5070", textDecoration: "none", pointerEvents: "auto",
            backdropFilter: "blur(4px)",
          }}>✕</Link>
        </div>

        {/* HUD — BOTTOM RIGHT */}
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          display: "flex", flexDirection: "column", gap: 5,
          padding: "8px", paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
          zIndex: 20,
        }}>
          {[
            { label: "NOTES", action: () => { setCliffOpen(currentZone); playSound("menu"); } },
            { label: "BAG",   action: () => { setBagOpen(true);          playSound("menu"); } },
            { label: "☰",    action: () => { setMenuOpen(true);         playSound("menu"); } },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{
              background: "rgba(4,8,20,0.88)", border: "2px solid #1a2a4a",
              color: "#4a6080", padding: "9px 11px",
              fontFamily: "var(--font-pixel)", fontSize: 9,
              cursor: "pointer", minHeight: 38,
              backdropFilter: "blur(4px)",
              transition: "all 0.12s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = currentZone.theme.accent + "60"; (e.currentTarget as HTMLButtonElement).style.color = currentZone.theme.accent; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a2a4a"; (e.currentTarget as HTMLButtonElement).style.color = "#4a6080"; }}
            >{btn.label}</button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: "absolute", top: 58, left: "50%",
            transform: "translateX(-50%)",
            zIndex: 25, pointerEvents: "none",
            background: "rgba(4,8,20,0.96)", border: "2px solid #1a2a4a",
            padding: "8px 14px", textAlign: "center", maxWidth: 300,
            animation: "pq-fade-in 0.18s ease-out",
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: "#7ce0ff" }}>{toast.title}</div>
            {toast.sub && <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a3a50", marginTop: 3 }}>{toast.sub}</div>}
          </div>
        )}

        {/* Badge earned */}
        {gotBadge && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 45,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none", background: "rgba(3,6,14,0.7)",
          }}>
            <div style={{
              border: `3px solid ${gotBadge.color}`,
              background: `linear-gradient(135deg, ${gotBadge.color}18 0%, #050c18 100%)`,
              padding: "28px 44px", textAlign: "center",
              boxShadow: `0 0 40px ${gotBadge.color}40`,
              animation: "pq-badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%", background: gotBadge.color,
                margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-pixel)", fontSize: 22,
                boxShadow: `0 0 20px ${gotBadge.color}`,
              }}>★</div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: gotBadge.color, marginBottom: 6 }}>
                GYM BADGE EARNED
              </div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 12, color: "#fff" }}>
                {gotBadge.label.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Overlays */}
        {titleDone && worldSelectOpen && (
          <WorldSelect
            onSelect={handleWarp}
            onClose={() => { setWorldSelectOpen(false); engineRef.current?.setPaused(false); }}
          />
        )}
        {mapOpen && (
          <WorldMap visited={visited} defeated={defeated} currentId={currentZoneId}
            onWarp={handleWarp} onClose={() => setMapOpen(false)} />
        )}
        {dialog && <DialogBox dialog={dialog} onClose={() => { setDialog(null); engineRef.current?.setPaused(false); }} />}
        {menuOpen && <StartMenu badges={badges} creatures={creatures} skills={skills} onClose={() => setMenuOpen(false)} />}
        {bagOpen && <Bag creatures={creatures} skills={skills} badges={badges} onClose={() => setBagOpen(false)} />}
        {cliffOpen && <CliffNotes zone={cliffOpen} onClose={() => setCliffOpen(null)} />}
        {/* Battle intro plays first, then real battle */}
        {battleIntro && (
          <BattleIntro
            zone={battleIntro}
            onComplete={() => { setBattleIntro(null); setBattle(battleIntro); }}
          />
        )}
        {battle && (
          <Battle zone={battle} ownedSkills={skills} badges={badges}
            onWin={() => handleBattleWin(battle)}
            onFlee={() => {
              setBattle(null);
              stopBattleBGM(battle.theme.ground as Parameters<typeof playZoneBGM>[0]);
              engineRef.current?.setPaused(false);
            }} />
        )}
        {catchModal && (
          <CatchModal
            zone={catchModal}
            badges={badges}
            onCatch={() => {
              const id = catchModal.creature!.id;
              setCreatures(prev => { const n = new Set(prev); n.add(id); caughtRef.current = n; return n; });
              engineRef.current?.addCreature(id);
              showToast(`✦ ${catchModal.creature!.name.toUpperCase()} CAUGHT!`, catchModal.creature!.description);
            }}
            onClose={() => { setCatchModal(null); engineRef.current?.setPaused(false); }}
          />
        )}
        {contactOpen && <ContactModal onClose={() => { setContactOpen(false); engineRef.current?.setPaused(false); }} />}
        {pressOpen && <PressModal onClose={() => { setPressOpen(false); engineRef.current?.setPaused(false); }} />}
        {evolution && (
          <EvolutionCutscene
            fromStage={evolution.from}
            toStage={evolution.to}
            onComplete={() => {
              setEvolution(null);
              engineRef.current?.setPaused(false);
              engineRef.current?.setPlayerStage(evolution.to.id);
            }}
          />
        )}

        {/* Victory moment — shown after gym win, before badge award */}
        {victoryZone && (
          <VictoryMoment
            zone={victoryZone}
            onContinue={() => handleVictoryContinue(victoryZone)}
          />
        )}

        {/* Skill learn overlay — replaces toast for skill berry discovery */}
        {skillLearnZone && (
          <SkillLearnOverlay
            zone={skillLearnZone.zone}
            npcName={skillLearnZone.npcName}
            onClose={() => {
              setSkillLearnZone(null);
              showToast(`✦ ${skillLearnZone.zone.skill!.name.toUpperCase()} READY`, "Use it in battle");
            }}
          />
        )}

        {/* Champion card — shown after beating the final gym */}
        {championOpen && (
          <ChampionCard
            badges={badges}
            defeated={defeated}
            creatures={creatures}
            onClose={() => { setChampionOpen(false); engineRef.current?.setPaused(false); }}
          />
        )}

        {/* Zone arrival cinematic */}
        {zoneTitle && (
          <ZoneTitle
            zone={zoneTitle}
            onDone={() => {
              setZoneTitle(null);
              // Open CliffNotes after banner
              setCliffOpen(zoneTitle);
            }}
          />
        )}

        {/* Building interior */}
        {interiorZone && (
          <Interior
            zoneId={interiorZone.id}
            onExit={() => {
              setInteriorZone(null);
              engineRef.current?.setPaused(false);
              playSound("warp");
            }}
          />
        )}

        {/* Screen transition overlay — always on top */}
        <TransitionOverlay trigger={transition} />

        {/* Touch D-pad — only visible on touch devices, hidden on desktop via CSS */}
        {!isModalOpen && (
          <>
            <style>{`
              .pq-touch-controls { display: flex; }
              @media (hover: hover) and (pointer: fine) { .pq-touch-controls { display: none; } }
            `}</style>
            <div className="pq-touch-controls">
              <TouchControls
                onDir={(dir, down) => engineRef.current?.setTouch(dir, down)}
                onAction={() => engineRef.current?.setTouch("action", true)}
                onMenu={() => { setMenuOpen(true); playSound("menu"); }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
