"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createEngine, TILE } from "@/game/engine";
import { ZONES, type Interactive, type Zone, type NpcKind, PLAYER_SPAWN, stageForBadges, stageForSkills, STARTER_STAGES, type RouteNpc } from "@/game/data";
import { DialogBox } from "./DialogBox";
import { StartMenu } from "./StartMenu";
import { Bag } from "./Bag";
import { CliffNotes } from "./CliffNotes";
import { Battle } from "./Battle";
import { BattleIntro } from "./BattleIntro";
import { CatchModal } from "./CatchModal";
import { WorldSelect } from "./WorldSelect";
import { ContactModal } from "./ContactModal";
import { PressModal } from "./PressModal";
import { EvolutionCutscene } from "./EvolutionCutscene";
import { TransitionOverlay, type TransitionKind } from "./TransitionOverlay";
import { ZoneAmbience } from "./ZoneAmbience";
import { TitleScreen } from "./TitleScreen";
import { VictoryMoment } from "./VictoryMoment";
import { SkillLearnOverlay } from "./SkillLearnOverlay";
import { TouchControls } from "./TouchControls";
import { ChampionCard } from "./ChampionCard";
import { playSound, playZoneBGM, playBattleBGM, stopBattleBGM, stopBGM, setMuted, isMuted, loadMutePref } from "@/lib/audio";
import { LEADER_URL, NPC_SPRITE_URL } from "@/game/sprite-registry";
import { ZoneTitle } from "./ZoneTitle";
import { Interior } from "./Interior";
import { SettingsScreen } from "./SettingsScreen";
import { CreditsScreen } from "./CreditsScreen";
import { WildEncounterIntro } from "./WildEncounterIntro";
import { RecruiterSpeedRun } from "./RecruiterSpeedRun";
import { BadgeShareCard } from "./BadgeShareCard";
import { OnboardingOverlay } from "./OnboardingOverlay";
import { MakingOfPanel, useKonamiCode } from "./MakingOfPanel";

const INIT_W = 20 * TILE;
const INIT_H = 14 * TILE;

export type GameDialog =
  | { type: "npc"; name: string; role: string; quote: string; beats?: string[]; kind?: NpcKind }
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
  const [worldSelectOpen, setWorldSelectOpen] = useState(true); // open on launch
  // True from the moment a warp is requested until engine.warpTo() has actually
  // repositioned the player. Keeps the engine paused across the whole warp
  // transition so an early keypress can't land on the stale pre-warp position
  // and get silently discarded once warpTo() resets it (this was the cause of
  // "player doesn't move" right after closing World Select / warping zones).
  const [isWarping, setIsWarping] = useState(false);
  const [battle, setBattle] = useState<Zone | null>(null);
  const [battleIntro, setBattleIntro] = useState<Zone | null>(null);
  const [evolution, setEvolution] = useState<{ from: ReturnType<typeof stageForSkills>; to: ReturnType<typeof stageForSkills> } | null>(null);
  const [catchModal, setCatchModal] = useState<Zone | null>(null);
  const [wildIntro, setWildIntro] = useState<Zone | null>(null);
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
  // Trainer battles
  const [trainerBattle, setTrainerBattle] = useState<RouteNpc | null>(null);
  const [trainerBattleIntro, setTrainerBattleIntro] = useState<RouteNpc | null>(null);
  // HUD accent bleed
  const [hudAccentBleed, setHudAccentBleed] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const bleedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Recruiter speed run mode
  const [speedRunOpen, setSpeedRunOpen] = useState(false);
  // Badge share card
  const [shareCardZone, setShareCardZone] = useState<Zone | null>(null);
  // Onboarding overlay (first-time non-gamers)
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Making Of easter egg (Konami code)
  const [makingOfOpen, setMakingOfOpen] = useState(false);
  useKonamiCode(useCallback(() => setMakingOfOpen(true), []));
  // Hire Me CTA auto-dismiss
  const [ctaDismissed, setCtaDismissed] = useState(false);
  const ctaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // pendingSkillLearn: queued after dialog closes — fired once dialog unmounts
  const pendingSkillLearnRef = useRef<{ zone: Zone; npcName: string } | null>(null);
  const pendingShareCardRef = useRef<(() => void) | null>(null);
  const [badges, setBadges] = useState<Set<string>>(new Set());
  const [creatures, setCreatures] = useState<Set<string>>(new Set());
  const [skills, setSkills] = useState<Set<string>>(new Set());
  // Berry inventory: heal (restore 30HP), shield (block next hit), speed (act first)
  const [berries, setBerries] = useState<{ heal: number; shield: number; speed: number }>({ heal: 2, shield: 1, speed: 1 });
  const [defeated, setDefeated] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set([ZONES[0].id]));
  const [currentZoneId, setCurrentZoneId] = useState<string>(ZONES[0].id);
  const caughtRef = useRef<Set<string>>(new Set());
  // Always-current mirror of `visited`. The engine callbacks are created once and
  // would otherwise close over a stale `visited` set, causing the zone arrival
  // cinematic to replay for zones already seen. This ref reflects the live set.
  const visitedRef = useRef<Set<string>>(new Set([ZONES[0].id]));
  // Baseline evolution stage, seeded from the save so we don't replay the
  // cutscene for already-earned stages. Never moved backward.
  const prevStageRef = useRef<string>((() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("pq_save") : null;
      if (raw) { const s = JSON.parse(raw); return stageForSkills((s.skills?.length as number) ?? 0).id; }
    } catch {}
    return STARTER_STAGES[0].id;
  })());

  // Load save
  useEffect(() => {
    loadMutePref();
    setMutedState(isMuted());
    try {
      const raw = localStorage.getItem("pq_save");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.badges)    setBadges(new Set(s.badges));
        if (s.creatures) { setCreatures(new Set(s.creatures)); caughtRef.current = new Set(s.creatures); }
        if (s.skills)    setSkills(new Set(s.skills));
        if (s.defeated)  setDefeated(new Set(s.defeated));
        if (s.visited)   { setVisited(new Set(s.visited)); visitedRef.current = new Set(s.visited); }
        if (s.berries)   setBerries(s.berries);
        setIsFirstVisit(false);
        setTitleDone(false);
        // ★ Show save-loaded toast so returning players know their progress is here
        const badgeCount    = (s.badges    as string[] | undefined)?.length ?? 0;
        const creatureCount = (s.creatures as string[] | undefined)?.length ?? 0;
        setTimeout(() => {
          showToast(`SAVE LOADED`, `${badgeCount} badge${badgeCount !== 1 ? "s" : ""} · ${creatureCount} creature${creatureCount !== 1 ? "s" : ""}`);
        }, 1400);
      } else {
        // Truly first visit — show full title + professor intro
        setIsFirstVisit(true);
        setTitleDone(false);
      }
    } catch {
      setIsFirstVisit(true);
      setTitleDone(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem("pq_save", JSON.stringify({
        badges: [...badges], creatures: [...creatures],
        skills: [...skills], defeated: [...defeated], visited: [...visited],
        defeatedTrainers: [...(engineRef.current?.state.defeatedTrainers ?? [])],
        collectedBerryItems: [...(engineRef.current?.state.collectedBerryItems ?? [])],
        berries,
      }));
    } catch {}
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  }, [badges, creatures, skills, defeated, visited, berries]);

  // Keep player stage in sync with skill count AND fire the evolution cutscene
  // whenever the stage advances. This is the single source of truth for
  // evolution — it reacts to the live `skills` state (no stale closures), so it
  // reliably triggers at the thresholds for every skill source.
  useEffect(() => {
    const stage = stageForSkills(skills.size);
    const order: string[] = STARTER_STAGES.map(s => s.id);
    const prevIdx = order.indexOf(prevStageRef.current);
    const newIdx = order.indexOf(stage.id);
    if (newIdx > prevIdx) {
      const from = STARTER_STAGES[prevIdx] ?? STARTER_STAGES[0];
      prevStageRef.current = stage.id;
      // Let any skill-learn overlay show first, then play the evolution cutscene.
      // playerStage stays on the OLD form until the cutscene reveals the new one.
      setTimeout(() => {
        setSkillLearnZone(null);
        setEvolution({ from, to: stage });
        engineRef.current?.setPaused(true);
        playSound("evolve");
      }, 2200);
    } else {
      // No evolution — keep the sprite in sync; never move the baseline backward.
      if (newIdx >= prevIdx) prevStageRef.current = stage.id;
      engineRef.current?.setPlayerStage(stage.id);
    }
  }, [skills]);

  // Mirror `visited` into a ref so the engine's onZoneEnter callback (created once)
  // always reads the live, persisted set instead of a stale closure.
  useEffect(() => { visitedRef.current = visited; }, [visited]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((title: string, sub?: string) => {
    setToast({ title, sub });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const isModalOpen = !!(dialog || menuOpen || bagOpen || cliffOpen || worldSelectOpen || battle || battleIntro || catchModal || wildIntro || contactOpen || pressOpen || evolution || victoryZone || skillLearnZone || !titleDone || championOpen || interiorZone || trainerBattle || trainerBattleIntro || settingsOpen || creditsOpen || isWarping);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = createEngine(canvasRef.current, {
      onInteract: (i: Interactive) => {
        if (i.kind === "npc") {
          if (i.npc.special === "contact") { setContactOpen(true); engine.setPaused(true); return; }
          setDialog({ type: "npc", name: i.npc.name, role: i.npc.role, quote: i.npc.quote ?? "", beats: i.npc.beats, kind: i.npc.kind });
          engine.setPaused(true);
          // Unlock follower the moment the professor is spoken to
          if (i.npc.kind === "professor") engine.unlockFollower();
          // NOTE: Talking to regular/route NPCs no longer triggers a wild-creature
          // catch encounter. Zone creatures are caught only via their dedicated wild
          // encounter tiles (onWild → WildEncounterIntro → CatchModal). The professor
          // still hands over Mermander through unlockFollower() above.
          if (i.npc.beat === "learned" && i.zone.skill) {
            setSkills(prev => {
              if (prev.has(i.zone.skill!.id)) return prev;
              const n = new Set(prev); n.add(i.zone.skill!.id);
              engine.addSkill(i.zone.skill!.id);
              // Queue — fires after dialog closes to avoid engine pause collision
              pendingSkillLearnRef.current = { zone: i.zone, npcName: i.npc.name };
              return n;
            });
          }
        } else if (i.kind === "sign") {
          if (i.sign.pressWall) { setPressOpen(true); engine.setPaused(true); return; }
          setDialog({ type: "sign", text: i.sign.text });
          engine.setPaused(true);
        }
      },
      onZoneEnter: (z: Zone) => {
        setCurrentZoneId(z.id);
        // Use the live ref (not a stale closure) so the arrival cinematic plays
        // only the FIRST time a zone is ever visited, across sessions.
        const isFirstTime = !visitedRef.current.has(z.id);
        visitedRef.current.add(z.id);
        setVisited(prev => { const n = new Set(prev); n.add(z.id); return n; });
        // Toast uses zone accent colour
        setToast({ title: z.name.toUpperCase(), sub: z.subtitle });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2800);
        // Fire zone transition + BGM
        transKeyRef.current += 1;
        setTransition({ kind: "zone", color: z.theme.accent, key: transKeyRef.current });
        playZoneBGM(z.theme.ground as Parameters<typeof playZoneBGM>[0], z.id);
        // Only show arrival cinematic on FIRST visit; CliffNotes fires from ZoneTitle.onDone
        if (z.id !== "home" && isFirstTime) {
          setZoneTitle(z);
          engine.setPaused(true);
          // ↑ DO NOT also call setCliffOpen here — ZoneTitle.onDone handles it
        }
      },
      onMenu: () => { setMenuOpen(true); engine.setPaused(true); },
      onBadge: (badgeId: string) => {
        // Find the zone this badge belongs to
        const badgeZone = ZONES.find(z => z.badge.id === badgeId);
        if (badgeZone) {
          // Non-gym zones (e.g. home Starter Token): award badge + flash directly
          // Gym badges are now ONLY awarded through battle victory — never via overworld pickup
          setBadges(prev => { const n = new Set(prev); n.add(badgeId); return n; });
          setDefeated(prev => { const n = new Set(prev); n.add(badgeZone.id); return n; });
          setGotBadge({ label: badgeZone.badge.label, color: badgeZone.badge.color });
          playSound("badge");
          engineRef.current?.triggerFollowerAnim("spin");
          showToast(`★ ${badgeZone.badge.label.toUpperCase()} EARNED`, badgeZone.outcome);
          setTimeout(() => setGotBadge(null), 1400);
          engine.setPaused(false);
        } else {
          // Fallback: award silently
          setBadges(prev => { const n = new Set(prev); n.add(badgeId); return n; });
        }
      },
      onGymEnter: (z: Zone) => {
        // Show battle intro first, then real battle + battle BGM
        setBattleIntro(z);
        playBattleBGM();
        engine.setPaused(true);
        // Follower jumps on battle entry
        engine.triggerFollowerAnim("jump");
      },
      onWild: (z: Zone) => { setWildIntro(z); engine.setPaused(true); },
      onDoorEnter: (z: Zone) => {
        setInteriorZone(z);
        engine.setPaused(true);
        playSound("warp");
      },
      onHiddenItem: (z: Zone) => {
        if (!z.skill) return;
        setSkills(prev => {
          if (prev.has(z.skill!.id)) return prev;
          const n = new Set(prev); n.add(z.skill!.id);
          engine.addSkill(z.skill!.id);
          pendingSkillLearnRef.current = { zone: z, npcName: "Hidden Discovery" };
          return n;
        });
        engine.triggerFollowerAnim("jump");
        engine.setPaused(true);
        setTimeout(() => {
          if (pendingSkillLearnRef.current) {
            const pending = pendingSkillLearnRef.current;
            pendingSkillLearnRef.current = null;
            setSkillLearnZone(pending);
          }
        }, 50);
      },
      onSkillOrb: (z: Zone) => {
        if (!z.skill) return;
        setSkills(prev => {
          if (prev.has(z.skill!.id)) return prev;
          const n = new Set(prev); n.add(z.skill!.id);
          engine.addSkill(z.skill!.id);
          return n;
        });
        playSound("catch");
        engine.triggerFollowerAnim("jump");
        engine.setPaused(true);
        // Show skill learn overlay directly (single overlay)
        showToast(`✦ SKILL ORB`, z.skill!.name);
        // Always show the overlay — even if skill was already collected, briefly show then unpause.
        // Evolution (if the stage advances) is handled centrally by the [skills] effect.
        setTimeout(() => {
          setSkillLearnZone({ zone: z, npcName: "Skill Orb" });
        }, 100);
      },
      onBerryItem: (z: Zone) => {
        // Award a random consumable berry
        const berryTypes = ["heal", "shield", "speed"] as const;
        const reward = berryTypes[Math.floor(Math.random() * berryTypes.length)];
        setBerries(b => ({ ...b, [reward]: b[reward] + 1 }));
        playSound("catch");
        engine.triggerFollowerAnim("jump");
        showToast(`+1 ${reward.toUpperCase()} BERRY`, "Use in battle for healing & buffs!");
      },
      onTrainerBattle: (npc: RouteNpc) => {
        setTrainerBattleIntro(npc);
        playBattleBGM();
        engine.setPaused(true);
      },
    });
    engineRef.current = engine;
    setEngineReady(true);

    // Sync player stage to current skill progression (evolution by Skill Orbs)
    engine.setPlayerStage(stageForSkills(skills.size).id);

    // Restore engine state from save
    try {
      const raw = localStorage.getItem("pq_save");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.badges)    s.badges.forEach((id: string) => engine.state.collectedBadges.add(id));
        if (s.creatures) s.creatures.forEach((id: string) => engine.state.collectedCreatures.add(id));
        if (s.skills)    s.skills.forEach((id: string) => engine.state.collectedSkills.add(id));
        if (s.defeated)  s.defeated.forEach((id: string) => engine.state.defeatedGyms.add(id));
        if (s.defeatedTrainers) s.defeatedTrainers.forEach((id: string) => engine.state.defeatedTrainers.add(id));
        if (s.collectedBerryItems) s.collectedBerryItems.forEach((id: string) => engine.state.collectedBerryItems.add(id));
        // Restore follower if player has already been through tutorial
        const hasMadeProgress = (s.badges?.length ?? 0) > 0 || (s.skills?.length ?? 0) > 0;
        if (hasMadeProgress) engine.unlockFollower();
      }
    } catch {}

    return () => engine.destroy();
  }, [showToast]);

  useEffect(() => {
    engineRef.current?.setPaused(isModalOpen);
  }, [isModalOpen]);

  function handleWarp(zoneId: string) {
    setWorldSelectOpen(false);
    // Keep the engine paused through the whole warp transition — cleared only
    // once warpTo() has actually placed the player, so no input lands on the
    // stale pre-warp position (see isWarping declaration for detail).
    setIsWarping(true);
    // Show onboarding for first-time players after their first warp
    if (isFirstVisit && !showOnboarding) {
      try {
        if (!localStorage.getItem("pq_onboarding_done")) {
          setTimeout(() => setShowOnboarding(true), 600);
        }
      } catch {}
    }
    // Fire warp transition
    transKeyRef.current += 1;
    const z = ZONES.find(x => x.id === zoneId);
    setTransition({ kind: "warp", color: z?.theme.accent ?? "#7ce0ff", key: transKeyRef.current });
    setTimeout(() => {
      engineRef.current?.warpTo(zoneId);
      setIsWarping(false);
    }, 260);
    playSound("warp");
    if (z) {
      setCurrentZoneId(zoneId);
      setVisited(prev => { const n = new Set(prev); n.add(zoneId); return n; });
      showToast(`⚡ ${z.name.toUpperCase()}`, z.subtitle);
      // Start zone BGM after warp completes
      setTimeout(() => playZoneBGM(z.theme.ground as Parameters<typeof playZoneBGM>[0], z.id), 300);
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
    // Follower spin on badge earn
    engineRef.current?.triggerFollowerAnim("spin");
    // Resume zone BGM
    playZoneBGM(zone.theme.ground as Parameters<typeof playZoneBGM>[0], zone.id);

    // Non-gym zones (e.g. home starter token) — just flash badge, unpause, done
    if (!zone.gym) {
      setTimeout(() => setGotBadge(null), 1400);
      engineRef.current?.setPaused(false);
      showToast(`★ ${zone.badge.label.toUpperCase()} EARNED`, zone.outcome);
      return;
    }

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
    // CliffNotes auto-surface ~1.4s after badge flash
    setTimeout(() => {
      setGotBadge(null);
      setCliffOpen(zone);
      engineRef.current?.setPaused(true);
    }, 1400);
    // Show share card ONLY after defeating all gyms (final victory)
    if (defeated.size >= totalGyms - 1) {
      const showShareAfterCliff = () => {
        setShareCardZone(zone);
      };
      pendingShareCardRef.current = showShareAfterCliff;
    }
    // Evolution is now triggered by Skill Orb collection, not badge count
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

      {/* Game container - full screen on mobile, boxed on desktop */}
      <div
        role="application"
        aria-label="Param Quest — A playable portfolio RPG game"
        style={{
          position: "relative",
          width: "min(100vw, 960px)",
          height: "min(100dvh, 640px)",
          zIndex: 1,
          display: "flex", flexDirection: "column",
          boxShadow: "0 0 80px rgba(0,0,0,0.8), 0 0 2px rgba(124,224,255,0.15)",
          border: `1px solid ${hudAccentBleed ? hudAccentBleed + "55" : "rgba(124,224,255,0.06)"}`,
          transition: "border-color 0.35s ease-out",
        }}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={INIT_W}
          height={INIT_H}
          style={{ width: "100%", height: "100%", imageRendering: "pixelated", display: "block" }}
          aria-label="Game world canvas — use arrow keys or WASD to move, Space to interact"
          tabIndex={0}
        />

        {/* ARIA live region for screen readers */}
        <div
          role="log"
          aria-live="polite"
          aria-atomic="false"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
        >
          {toast && <span>{toast.title}{toast.sub ? ` — ${toast.sub}` : ""}</span>}
        </div>

        {/* PixiJS post-processing: disabled — was causing overbright display */}

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
          display: "flex", alignItems: "center", gap: 4,
          padding: "6px",
          paddingTop: "calc(env(safe-area-inset-top) + 6px)",
          pointerEvents: "none", zIndex: 20,
        }}>
          {/* Zone name card — accent-colored */}
          <div style={{
            flex: 1, minWidth: 0,
            background: `linear-gradient(135deg, ${currentZone.theme.accent}18 0%, rgba(4,8,20,0.88) 100%)`,
            border: `1px solid ${currentZone.theme.accent}35`,
            padding: "4px 8px", pointerEvents: "auto",
            backdropFilter: "blur(4px)",
            transition: "border-color 0.4s, background 0.4s",
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 5, color: currentZone.theme.accent, opacity: 0.7, letterSpacing: "0.1em" }}>NOW IN</div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: "clamp(7px, 2.5vw, 10px)", color: "#c8d8f0", lineHeight: 1, marginTop: 1 }}
                 className="truncate">{currentZone.name.toUpperCase()}</div>
          </div>

          {/* Badge + Orb counters */}
          <div style={{
            background: `linear-gradient(135deg, rgba(255,210,74,0.12) 0%, rgba(4,8,20,0.88) 100%)`,
            border: "1px solid rgba(255,210,74,0.25)",
            padding: "4px 8px", pointerEvents: "auto",
            backdropFilter: "blur(4px)",
            display: "flex", gap: 6, alignItems: "center",
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#ffd24a" }}>★ {defeated.size}/{totalGyms}</div>
            <div style={{ width: 1, height: 10, background: "rgba(255,210,74,0.2)" }} />
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#7ce0ff" }}>✦ {skills.size}</div>
          </div>

          {/* WARP button (world select) */}
          <button
            onClick={() => { setWorldSelectOpen(true); playSound("menu"); }}
            style={{
              background: "linear-gradient(135deg, rgba(124,224,255,0.15) 0%, rgba(58,120,216,0.08) 100%)",
              border: "1px solid #7ce0ff55",
              color: "#7ce0ff", padding: "4px 8px",
              fontFamily: "var(--font-pixel)", fontSize: 7,
              cursor: "pointer", pointerEvents: "auto",
              backdropFilter: "blur(4px)",
              transition: "all 0.12s",
            }}
          >⚡ WARP</button>

          <button onClick={() => { const m = !muted; setMuted(m); setMutedState(m); }} style={{
            background: "rgba(4,8,20,0.88)", border: "1px solid #1a2a4a",
            padding: "4px 6px", color: muted ? "#2a3a50" : "#5580aa",
            fontFamily: "var(--font-pixel)", fontSize: 6,
            cursor: "pointer", pointerEvents: "auto",
            backdropFilter: "blur(4px)",
            letterSpacing: "0.05em",
          }}>{muted ? "OFF" : "SFX"}</button>

          <Link href="/" style={{
            background: "rgba(4,8,20,0.88)", border: "1px solid #1a2a4a",
            padding: "4px 6px", fontFamily: "var(--font-pixel)", fontSize: 7,
            color: "#3a5070", textDecoration: "none", pointerEvents: "auto",
            backdropFilter: "blur(4px)",
          }}>✕</Link>
        </div>

        {/* Save indicator */}
        {saveFlash && (
          <div style={{
            position: "absolute", top: 42, right: 10,
            zIndex: 21, pointerEvents: "none",
            fontFamily: "var(--font-pixel)", fontSize: 7,
            color: "#00e8a0", opacity: 0.7,
            animation: "pq-fade-in 0.2s ease-out",
          }}>
            ✓ SAVED
          </div>
        )}

        {/* HUD — BOTTOM LEFT: Career Progress Bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          padding: "8px", paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
          zIndex: 20, pointerEvents: "none",
          maxWidth: 160,
        }}>
          <div style={{
            background: "rgba(4,8,20,0.88)",
            border: "1px solid rgba(124,224,255,0.1)",
            padding: "6px 8px",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 3,
            }}>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: 4, color: "#3a5070", letterSpacing: "0.08em" }}>
                PROGRESS
              </span>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: 5, color: currentZone.theme.accent }}>
                {Math.round(((visited.size + defeated.size) / (ZONES.length + totalGyms)) * 100)}%
              </span>
            </div>
            <div style={{ height: 3, background: "#0a1525", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${((visited.size + defeated.size) / (ZONES.length + totalGyms)) * 100}%`,
                background: `linear-gradient(90deg, ${currentZone.theme.accent}cc, #00e8a0)`,
                transition: "width 0.6s ease-out",
                borderRadius: 2,
              }} />
            </div>
          </div>
        </div>

        {/* HUD — HIRE ME CTA: appears after exploring 3+ zones or winning 2+ battles, auto-dismisses after 12s */}
        {(visited.size >= 4 || defeated.size >= 2) && !contactOpen && !battle && !battleIntro && !ctaDismissed && (
          <div
            ref={el => {
              if (el && !ctaTimerRef.current) {
                ctaTimerRef.current = setTimeout(() => setCtaDismissed(true), 12000);
              }
            }}
            style={{
            position: "absolute", bottom: 70, left: "50%",
            transform: "translateX(-50%)",
            zIndex: 19, pointerEvents: "auto",
            animation: "pq-fade-in 0.5s ease-out",
          }}>
            <button
              onClick={() => { setContactOpen(true); setCtaDismissed(true); playSound("menu"); }}
              style={{
                background: "linear-gradient(135deg, rgba(124,224,255,0.08) 0%, rgba(4,8,20,0.9) 100%)",
                border: "1px solid rgba(124,224,255,0.25)",
                color: "#7ce0ff",
                padding: "8px 16px",
                fontFamily: "var(--font-pixel)", fontSize: 7,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                letterSpacing: "0.06em",
                opacity: 0.75,
                transition: "all 0.2s",
                boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "rgba(124,224,255,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "0.75"; e.currentTarget.style.borderColor = "rgba(124,224,255,0.25)"; }}
            >
              Impressed? Let&apos;s talk →
            </button>
          </div>
        )}

        {/* HUD — BOTTOM RIGHT */}
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          display: "flex", flexDirection: "column", gap: 6,
          padding: "10px", paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)",
          zIndex: 20,
        }}>
          {/* Speed Run button for recruiters */}
          <button onClick={() => { setSpeedRunOpen(true); playSound("menu"); }} style={{
            background: "linear-gradient(135deg, rgba(255,210,74,0.12) 0%, rgba(4,8,20,0.92) 100%)",
            border: "1px solid rgba(255,210,74,0.35)",
            color: "#ffd24a",
            padding: "6px 10px",
            fontFamily: "var(--font-pixel)", fontSize: 6,
            cursor: "pointer", minWidth: 54,
            backdropFilter: "blur(12px)",
            letterSpacing: "0.05em",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}>⚡ SPEED</button>
          {[
            { label: "NOTES", action: () => { setCliffOpen(currentZone); playSound("menu"); } },
            { label: "BAG",   action: () => { setBagOpen(true);          playSound("menu"); } },
            { label: "MENU",  action: () => { setMenuOpen(true);         playSound("menu"); } },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{
              background: `linear-gradient(135deg, rgba(4,8,20,0.92) 0%, rgba(10,16,36,0.88) 100%)`,
              border: `1px solid rgba(124,224,255,0.12)`,
              color: "#4a6888",
              padding: "8px 10px",
              fontFamily: "var(--font-pixel)", fontSize: 7,
              cursor: "pointer", minHeight: 36, minWidth: 50,
              backdropFilter: "blur(12px)",
              transition: "all 0.15s cubic-bezier(0.2,0,0,1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
              letterSpacing: "0.04em",
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = currentZone.theme.accent + "80";
                el.style.color = currentZone.theme.accent;
                el.style.background = `linear-gradient(135deg, ${currentZone.theme.accent}18 0%, rgba(4,8,20,0.92) 100%)`;
                el.style.boxShadow = `0 0 16px ${currentZone.theme.accent}25, 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = "rgba(124,224,255,0.12)";
                el.style.color = "#4a6888";
                el.style.background = "linear-gradient(135deg, rgba(4,8,20,0.92) 0%, rgba(10,16,36,0.88) 100%)";
                el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)";
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Toast — uses current zone accent colour */}
        {toast && (
          <div style={{
            position: "absolute", top: 58, left: "50%",
            transform: "translateX(-50%)",
            zIndex: 25, pointerEvents: "none",
            background: "rgba(4,8,20,0.96)",
            border: `2px solid ${currentZone.theme.accent}50`,
            padding: "8px 14px", textAlign: "center", maxWidth: 300,
            animation: "pq-fade-in 0.18s ease-out",
            boxShadow: `0 0 16px ${currentZone.theme.accent}20`,
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: currentZone.theme.accent }}>{toast.title}</div>
            {toast.sub && <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#2a3a50", marginTop: 3 }}>{toast.sub}</div>}
          </div>
        )}

        {/* Badge earned — shows defeated leader's portrait */}
        {gotBadge && (() => {
          const badgeZone = ZONES.find(z => z.badge.id === gotBadge.label.toLowerCase().replace(/ /g, "-") || z.badge.label === gotBadge.label);
          const leaderUrl = badgeZone?.gym ? LEADER_URL[badgeZone.gym.leader] : null;
          return (
            <div style={{
              position: "absolute", inset: 0, zIndex: 45,
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none", background: "rgba(3,6,14,0.72)",
            }}>
              <div style={{
                border: `3px solid ${gotBadge.color}`,
                background: `linear-gradient(135deg, ${gotBadge.color}18 0%, #050c18 100%)`,
                padding: "24px 36px", textAlign: "center",
                boxShadow: `0 0 40px ${gotBadge.color}40`,
                animation: "pq-badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                {/* Leader portrait or generic star */}
                {leaderUrl ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={leaderUrl}
                      alt=""
                      style={{
                        width: 64, height: 64,
                        imageRendering: "pixelated",
                        border: `2px solid ${gotBadge.color}80`,
                        filter: `drop-shadow(0 0 12px ${gotBadge.color})`,
                      }}
                    />
                    <div style={{
                      position: "absolute", bottom: -6, right: -6,
                      width: 20, height: 20, borderRadius: "50%",
                      background: gotBadge.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: "#fff",
                      boxShadow: `0 0 8px ${gotBadge.color}`,
                    }}>★</div>
                  </div>
                ) : (
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", background: gotBadge.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-pixel)", fontSize: 22,
                    boxShadow: `0 0 20px ${gotBadge.color}`,
                  }}>★</div>
                )}
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: gotBadge.color }}>
                  GYM BADGE EARNED
                </div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 12, color: "#fff", letterSpacing: "0.04em" }}>
                  {gotBadge.label.toUpperCase()}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Overlays */}
        {titleDone && worldSelectOpen && (
          <WorldSelect
            onSelect={handleWarp}
            onClose={() => { setWorldSelectOpen(false); engineRef.current?.setPaused(false); }}
          />
        )}
        {dialog && <DialogBox dialog={dialog} onClose={() => {
          setDialog(null);
          // Fire queued skill learn AFTER dialog is fully gone — avoids engine pause collision
          if (pendingSkillLearnRef.current) {
            const pending = pendingSkillLearnRef.current;
            pendingSkillLearnRef.current = null;
            // Small delay so dialog unmount is complete before overlay mounts
            setTimeout(() => setSkillLearnZone(pending), 50);
            // engine stays paused — SkillLearnOverlay.onClose will unpause
          } else {
            engineRef.current?.setPaused(false);
          }
        }} />}
        {menuOpen && <StartMenu badges={badges} creatures={creatures} skills={skills} onClose={() => setMenuOpen(false)} onSettings={() => { setMenuOpen(false); setSettingsOpen(true); }} onCredits={() => { setMenuOpen(false); setCreditsOpen(true); }} />}
        {bagOpen && <Bag creatures={creatures} skills={skills} badges={badges} onClose={() => setBagOpen(false)} />}
        {cliffOpen && <CliffNotes zone={cliffOpen} onClose={() => {
          setCliffOpen(null);
          engineRef.current?.setPaused(false);
          // Show share card if one was queued (after gym victory)
          if (pendingShareCardRef.current) {
            const fn = pendingShareCardRef.current;
            pendingShareCardRef.current = null;
            setTimeout(fn, 300);
          }
        }} />}
        {/* Battle intro plays first, then real battle */}
        {battleIntro && (
          <BattleIntro
            zone={battleIntro}
            onComplete={() => { setBattleIntro(null); setBattle(battleIntro); }}
          />
        )}
        {battle && (
          <Battle zone={battle} ownedSkills={skills} badges={badges}
            berries={berries} onUseBerry={(type) => setBerries(b => ({ ...b, [type]: Math.max(0, b[type as keyof typeof b] - 1) }))}
            onWin={() => handleBattleWin(battle)}
            onFinishingBlow={() => engineRef.current?.triggerShake(400)}
            onFlee={() => {
              setBattle(null);
              stopBattleBGM(battle.theme.ground as Parameters<typeof playZoneBGM>[0]);
              engineRef.current?.setPaused(false);
            }} />
        )}

        {/* Trainer battles — route NPC encounters */}
        {trainerBattleIntro && (() => {
          const npc = trainerBattleIntro;
          const syntheticZone: Zone = {
            ...currentZone,
            gym: {
              opponentName: npc.name,
              opponentTitle: npc.role,
              intro: npc.quote,
              hp: npc.trainer!.hp,
              weakTo: npc.trainer!.weakTo,
              resists: npc.trainer!.resists,
              moves: npc.trainer!.moves,
              victory: npc.trainer!.victoryQuote,
              leader: "none" as any, // No leader sprite for route trainers
            },
          };
          return (
            <BattleIntro
              zone={syntheticZone}
              opponentSpriteUrl={NPC_SPRITE_URL[npc.kind]}
              onComplete={() => { setTrainerBattleIntro(null); setTrainerBattle(npc); }}
            />
          );
        })()}
        {trainerBattle && (() => {
          const npc = trainerBattle;
          const syntheticZone: Zone = {
            ...currentZone,
            gym: {
              opponentName: npc.name,
              opponentTitle: npc.role,
              intro: npc.quote,
              hp: npc.trainer!.hp,
              weakTo: npc.trainer!.weakTo,
              resists: npc.trainer!.resists,
              moves: npc.trainer!.moves,
              victory: npc.trainer!.victoryQuote,
              leader: "none" as any, // No leader sprite for route trainers
            },
          };
          return (
            <Battle zone={syntheticZone} ownedSkills={skills} badges={badges}
              berries={berries} onUseBerry={(type) => setBerries(b => ({ ...b, [type]: Math.max(0, b[type as keyof typeof b] - 1) }))}
              opponentSpriteUrl={NPC_SPRITE_URL[npc.kind]}
              onWin={() => {
                setTrainerBattle(null);
                engineRef.current?.markTrainerDefeated(npc.name);
                stopBattleBGM(currentZone.theme.ground as Parameters<typeof playZoneBGM>[0]);
                engineRef.current?.setPaused(false);
                showToast(`★ ${npc.name.toUpperCase()} DEFEATED`, npc.trainer!.victoryQuote);
                // Award a random berry on trainer win
                const berryTypes = ["heal", "shield", "speed"] as const;
                const reward = berryTypes[Math.floor(Math.random() * berryTypes.length)];
                setBerries(b => ({ ...b, [reward]: b[reward] + 1 }));
                setTimeout(() => showToast(`+ ${reward.toUpperCase()} BERRY`, "Trainer reward!"), 1500);
              }}
              onFlee={() => {
                setTrainerBattle(null);
                stopBattleBGM(currentZone.theme.ground as Parameters<typeof playZoneBGM>[0]);
                engineRef.current?.setPaused(false);
              }}
            />
          );
        })()}

        {wildIntro && (
          <WildEncounterIntro
            zone={wildIntro}
            onComplete={() => { setWildIntro(null); setCatchModal(wildIntro); }}
          />
        )}
        {catchModal && (
          <CatchModal
            zone={catchModal}
            badges={badges}
            skills={skills}
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
        {settingsOpen && <SettingsScreen onClose={() => { setSettingsOpen(false); engineRef.current?.setPaused(false); }} />}
        {creditsOpen && <CreditsScreen onClose={() => { setCreditsOpen(false); engineRef.current?.setPaused(false); }} />}
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

        {/* Skill learn overlay — single quick overlay for skill orb collection */}
        {skillLearnZone && (
          <SkillLearnOverlay
            zone={skillLearnZone.zone}
            npcName={skillLearnZone.npcName}
            onClose={() => {
              const sz = skillLearnZone;
              setSkillLearnZone(null);
              engineRef.current?.setPaused(false);
              showToast(`✦ ${sz.zone.skill!.name.toUpperCase()} READY`, "Use it in battle");
            }}
          />
        )}

        {/* Champion card — shown after beating the final gym */}
        {championOpen && (
          <ChampionCard
            badges={badges}
            defeated={defeated}
            creatures={creatures}
            onClose={() => {
              setChampionOpen(false);
              // Post-champion: show credits after a beat
              setTimeout(() => {
                setCreditsOpen(true);
              }, 1200);
              // Show toast about post-game
              showToast("★ CHAMPION", "You've completed Param Quest. The journey continues.");
              engineRef.current?.setPaused(false);
            }}
          />
        )}

        {/* Zone arrival cinematic */}
        {zoneTitle && (
          <ZoneTitle
            zone={zoneTitle}
            onDone={() => {
              const zt = zoneTitle;
              setZoneTitle(null);
              // Zone accent HUD bleed
              setHudAccentBleed(zt.theme.accent);
              if (bleedTimerRef.current) clearTimeout(bleedTimerRef.current);
              bleedTimerRef.current = setTimeout(() => setHudAccentBleed(null), 12000);
              // Open CliffNotes after banner
              setCliffOpen(zt);
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

        {/* Recruiter Speed Run mode */}
        {speedRunOpen && (
          <RecruiterSpeedRun
            onClose={() => { setSpeedRunOpen(false); engineRef.current?.setPaused(false); }}
            onHire={() => { setSpeedRunOpen(false); setContactOpen(true); }}
          />
        )}

        {/* Badge Share Card — shows after gym victory + cliff notes */}
        {shareCardZone && (
          <BadgeShareCard
            zone={shareCardZone}
            badgeCount={badges.size}
            totalGyms={totalGyms}
            onClose={() => { setShareCardZone(null); engineRef.current?.setPaused(false); }}
          />
        )}

        {/* Making Of panel — Konami code easter egg */}
        {makingOfOpen && (
          <MakingOfPanel onClose={() => setMakingOfOpen(false)} />
        )}

        {/* Screen transition overlay — always on top */}
        <TransitionOverlay trigger={transition} />

        {/* Onboarding overlay for first-time players */}
        {showOnboarding && !isModalOpen && (
          <OnboardingOverlay
            onDismiss={() => {
              setShowOnboarding(false);
              engineRef.current?.setPaused(false);
            }}
          />
        )}

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
