"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createEngine, TILE } from "@/game/engine";
import { ZONES, type Interactive, type Zone, zoneAt, PLAYER_SPAWN } from "@/game/data";
import { DialogBox } from "./DialogBox";
import { StartMenu } from "./StartMenu";
import { Bag } from "./Bag";
import { CliffNotes } from "./CliffNotes";
import { Battle } from "./Battle";
import { CatchModal } from "./CatchModal";
import { WorldMap } from "./WorldMap";
import { ContactModal } from "./ContactModal";
import { PressModal } from "./PressModal";
import { playSound, setMuted, isMuted, loadMutePref } from "@/lib/audio";

const INIT_W = 20 * TILE;
const INIT_H = 14 * TILE;

export type GameDialog =
  | { type: "npc"; name: string; role: string; quote: string }
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
  const [battle, setBattle] = useState<Zone | null>(null);
  const [catchModal, setCatchModal] = useState<Zone | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [pressOpen, setPressOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(null);
  const [gotBadge, setGotBadge] = useState<{ label: string; color: string } | null>(null);
  const [muted, setMutedState] = useState(false);

  const [badges, setBadges] = useState<Set<string>>(new Set());
  const [creatures, setCreatures] = useState<Set<string>>(new Set());
  const [skills, setSkills] = useState<Set<string>>(new Set());
  const [defeated, setDefeated] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set([ZONES[0].id]));
  const [currentZoneId, setCurrentZoneId] = useState<string>(ZONES[0].id);
  const caughtRef = useRef<Set<string>>(new Set());

  // Load save on mount
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
      }
    } catch {}
  }, []);

  // Persist save on every state change
  useEffect(() => {
    try {
      localStorage.setItem("pq_save", JSON.stringify({
        badges: [...badges], creatures: [...creatures],
        skills: [...skills], defeated: [...defeated], visited: [...visited],
      }));
    } catch {}
  }, [badges, creatures, skills, defeated, visited]);

  const showToast = useCallback((title: string, sub?: string) => {
    setToast({ title, sub });
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, []);

  const isModalOpen = !!(dialog || menuOpen || bagOpen || cliffOpen || mapOpen || battle || catchModal || contactOpen || pressOpen);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = createEngine(canvasRef.current, {
      onInteract: (i: Interactive) => {
        if (i.kind === "npc") {
          // Handle special NPCs
          if (i.npc.special === "press-trigger") {
            setPressOpen(true);
            engine.setPaused(true);
            return;
          }
          if (i.npc.special === "contact") {
            setContactOpen(true);
            engine.setPaused(true);
            return;
          }
          setDialog({ type: "npc", name: i.npc.name, role: i.npc.role, quote: i.npc.quote });
          engine.setPaused(true);
          if (i.npc.beat === "did" && i.zone.creature) {
            if (!caughtRef.current.has(i.zone.creature.id)) {
              setTimeout(() => { setCatchModal(i.zone); }, 400);
            }
          }
          if (i.npc.beat === "learned" && i.zone.skill) {
            setSkills(prev => {
              if (prev.has(i.zone.skill!.id)) return prev;
              const n = new Set(prev); n.add(i.zone.skill!.id);
              engine.addSkill(i.zone.skill!.id);
              showToast(`✦ LEARNED ${i.zone.skill!.name.toUpperCase()}`, i.zone.skill!.description);
              return n;
            });
          }
        } else if (i.kind === "sign") {
          setDialog({ type: "sign", text: i.sign.text });
          engine.setPaused(true);
        }
      },
      onZoneEnter: (z: Zone) => {
        setCurrentZoneId(z.id);
        setVisited(prev => { const n = new Set(prev); n.add(z.id); return n; });
        showToast(z.name.toUpperCase(), z.subtitle);
        if (z.id !== "home") setCliffOpen(z);
        engine.setPaused(true);
      },
      onMenu: () => { setMenuOpen(true); engine.setPaused(true); },
      onBadge: (badgeId: string) => {
        const z = ZONES.find(x => x.badge.id === badgeId);
        if (!z) return;
        setBadges(prev => { const n = new Set(prev); n.add(badgeId); return n; });
        engine.markGymDefeated("", badgeId);
        setGotBadge({ label: z.badge.label, color: z.badge.color });
        playSound("badge");
        setTimeout(() => setGotBadge(null), 3000);
      },
      onGymEnter: (z: Zone) => { setBattle(z); engine.setPaused(true); },
      onWild: (z: Zone) => { setCatchModal(z); engine.setPaused(true); },
    });
    engineRef.current = engine;

    // Restore engine state from saved data
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

  // Sync paused state with modals
  useEffect(() => {
    engineRef.current?.setPaused(isModalOpen);
  }, [isModalOpen]);

  function closeDialog() {
    setDialog(null);
    engineRef.current?.setPaused(false);
  }

  function handleWarp(zoneId: string) {
    setMapOpen(false);
    engineRef.current?.warpTo(zoneId);
    engineRef.current?.setPaused(false);
    playSound("warp");
    const z = ZONES.find(x => x.id === zoneId);
    if (z) showToast(`⚡ WARPED TO ${z.name.toUpperCase()}`, z.subtitle);
  }

  function handleBattleWin(zone: Zone) {
    setBattle(null);
    engineRef.current?.markGymDefeated(zone.id, zone.badge.id);
    setBadges(prev => { const n = new Set(prev); n.add(zone.badge.id); return n; });
    setDefeated(prev => { const n = new Set(prev); n.add(zone.id); return n; });
    setGotBadge({ label: zone.badge.label, color: zone.badge.color });
    playSound("badge");
    setTimeout(() => setGotBadge(null), 3500);
    engineRef.current?.setPaused(false);
    showToast(`★ ${zone.badge.label.toUpperCase()} EARNED`, zone.gym?.victory);
  }

  const currentZone = ZONES.find(z => z.id === currentZoneId) ?? ZONES[0];
  const totalGyms = ZONES.filter(z => z.gym).length;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#08101a",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={INIT_W}
        height={INIT_H}
        style={{
          width: "100%", height: "100%",
          imageRendering: "pixelated",
          display: "block",
        }}
      />

      {/* HUD — TOP */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 8px",
        paddingTop: "calc(env(safe-area-inset-top) + 8px)",
        pointerEvents: "none",
        zIndex: 20,
      }}>
        {/* Zone name */}
        <div style={{
          flex: 1, minWidth: 0,
          background: "rgba(6,12,24,0.88)",
          border: "2px solid #1a2a4a",
          padding: "6px 10px",
          pointerEvents: "auto",
        }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", marginBottom: 2 }}>NOW IN</div>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 11, color: "#c8d8f0", lineHeight: 1 }}
               className="truncate">{currentZone.name.toUpperCase()}</div>
        </div>
        {/* Badge counter */}
        <div style={{
          background: "rgba(6,12,24,0.88)",
          border: "2px solid #1a2a4a",
          padding: "6px 10px",
          pointerEvents: "auto",
        }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 11, color: "#ffd24a" }}>
            ★ {defeated.size}/{totalGyms}
          </div>
        </div>
        {/* Mute toggle */}
        <button
          onClick={() => { const m = !muted; setMuted(m); setMutedState(m); }}
          style={{
            background: "rgba(6,12,24,0.88)",
            border: "2px solid #1a2a4a",
            padding: "6px 10px",
            color: muted ? "#3a5070" : "#7ce0ff",
            fontFamily: "var(--font-pixel)", fontSize: 11,
            cursor: "pointer", pointerEvents: "auto",
          }}
        >{muted ? "🔇" : "🔊"}</button>
        {/* Exit */}
        <Link href="/" style={{
          background: "rgba(6,12,24,0.88)",
          border: "2px solid #1a2a4a",
          padding: "6px 10px",
          fontFamily: "var(--font-pixel)", fontSize: 9,
          color: "#5580aa", textDecoration: "none",
          pointerEvents: "auto",
        }}>✕ EXIT</Link>
      </div>

      {/* HUD — BOTTOM RIGHT */}
      <div style={{
        position: "absolute", bottom: 0, right: 0,
        display: "flex", flexDirection: "column", gap: 6,
        padding: "8px",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
        zIndex: 20,
      }}>
        {[
          { label: "MAP ⚡", action: () => { setMapOpen(true); playSound("menu"); } },
          { label: "NOTES", action: () => { setCliffOpen(currentZone); playSound("menu"); } },
          { label: "BAG", action: () => { setBagOpen(true); playSound("menu"); } },
          { label: "☰ MENU", action: () => { setMenuOpen(true); playSound("menu"); }, primary: true },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            style={{
              background: btn.primary ? "#1a3060" : "rgba(6,12,24,0.88)",
              border: `2px solid ${btn.primary ? "#2a4a80" : "#1a2a4a"}`,
              color: btn.primary ? "#7ce0ff" : "#5580aa",
              padding: "10px 12px",
              fontFamily: "var(--font-pixel)", fontSize: 9,
              cursor: "pointer",
              minHeight: 40,
              letterSpacing: "0.05em",
            }}
          >{btn.label}</button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "absolute", top: 70, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 25, pointerEvents: "none",
          background: "rgba(6,12,24,0.95)",
          border: "2px solid #2a3a5a",
          padding: "10px 16px",
          textAlign: "center",
          maxWidth: 320,
          animation: "pq-fade-in 0.18s ease-out",
        }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#7ce0ff" }}>{toast.title}</div>
          {toast.sub && <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", marginTop: 4 }}>{toast.sub}</div>}
        </div>
      )}

      {/* Badge earned overlay */}
      {gotBadge && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 45,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          background: "rgba(4,8,16,0.7)",
        }}>
          <div style={{
            border: `3px solid ${gotBadge.color}`,
            background: `linear-gradient(135deg, ${gotBadge.color}22 0%, #060c18 100%)`,
            padding: "32px 48px",
            textAlign: "center",
            boxShadow: `0 0 40px ${gotBadge.color}40`,
            animation: "pq-badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: gotBadge.color,
              border: `3px solid ${gotBadge.color}`,
              boxShadow: `0 0 20px ${gotBadge.color}`,
              margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-pixel)", fontSize: 24,
            }}>★</div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: gotBadge.color, marginBottom: 8 }}>
              GYM BADGE EARNED
            </div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 13, color: "#fff" }}>
              {gotBadge.label.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      {dialog && <DialogBox dialog={dialog} onClose={closeDialog} />}
      {menuOpen && <StartMenu badges={badges} creatures={creatures} skills={skills} onClose={() => { setMenuOpen(false); }} />}
      {bagOpen && <Bag creatures={creatures} skills={skills} badges={badges} onClose={() => setBagOpen(false)} />}
      {cliffOpen && <CliffNotes zone={cliffOpen} onClose={() => setCliffOpen(null)} />}
      {mapOpen && (
        <WorldMap
          visited={visited} defeated={defeated} currentId={currentZoneId}
          onWarp={handleWarp}
          onClose={() => setMapOpen(false)}
        />
      )}
      {battle && (
        <Battle
          zone={battle} ownedSkills={skills} badges={badges}
          onWin={() => handleBattleWin(battle)}
          onFlee={() => { setBattle(null); engineRef.current?.setPaused(false); }}
        />
      )}
      {catchModal && (
        <CatchModal
          zone={catchModal}
          onCatch={() => {
            const id = catchModal.creature!.id;
            setCreatures(prev => { const n = new Set(prev); n.add(id); caughtRef.current = n; return n; });
            engineRef.current?.addCreature(id);
            playSound("catch");
            showToast(`✦ ${catchModal.creature!.name.toUpperCase()} CAUGHT`, catchModal.creature!.description);
          }}
          onClose={() => { setCatchModal(null); engineRef.current?.setPaused(false); }}
        />
      )}
      {contactOpen && <ContactModal onClose={() => { setContactOpen(false); engineRef.current?.setPaused(false); }} />}
      {pressOpen && <PressModal onClose={() => { setPressOpen(false); engineRef.current?.setPaused(false); }} />}
    </div>
  );
}
