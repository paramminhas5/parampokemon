"use client";
import { useEffect, useState, useCallback } from "react";
import { ZONES } from "@/game/data";
import { LEADER_URL, LANDMARK_URL, CREATURE_URL } from "@/game/sprite-registry";
import { playSound } from "@/lib/audio";

const STYLES = `
@keyframes rsr-fade-in    { from{opacity:0} to{opacity:1} }
@keyframes rsr-slide-up   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes rsr-slide-left { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
@keyframes rsr-count-in   { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
@keyframes rsr-badge-pop  { 0%{transform:scale(0) rotate(-15deg)} 60%{transform:scale(1.2) rotate(3deg)} 100%{transform:scale(1) rotate(0deg)} }
@keyframes rsr-progress   { from{width:0%} to{width:100%} }
@keyframes rsr-pulse      { 0%,100%{opacity:0.7} 50%{opacity:1} }
@keyframes rsr-scan       { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }
@keyframes rsr-metric-pop { 0%{opacity:0;transform:scale(0.7) translateY(10px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
@keyframes rsr-zone-exit  { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-60px)} }
@keyframes rsr-cta-glow   {
  0%,100% { box-shadow: 0 0 10px rgba(124,224,255,0.3); }
  50%     { box-shadow: 0 0 30px rgba(124,224,255,0.6), 0 0 60px rgba(124,224,255,0.2); }
}
`;

// Career data for the speed run — key highlights per zone
const SPEED_RUN_ZONES = ZONES.filter(z => z.id !== "home").map(z => ({
  id: z.id,
  name: z.name,
  org: z.org,
  role: z.role,
  years: z.years,
  accent: z.theme.accent,
  metric: z.cliff.metrics[0],
  outcome: z.outcome,
  gym: z.gym ? { name: z.gym.opponentName, leader: z.gym.leader } : null,
  badge: z.badge,
}));

const TOTAL_DURATION = 60000; // 60 seconds total
const ZONE_DURATION = Math.floor(TOTAL_DURATION / SPEED_RUN_ZONES.length);

interface Props {
  onClose: () => void;
  onHire: () => void;
}

export function RecruiterSpeedRun({ onClose, onHire }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<"intro" | "zones" | "finale">("intro");
  const [elapsed, setElapsed] = useState(0);
  const [exiting, setExiting] = useState(false);

  const zone = SPEED_RUN_ZONES[currentIdx];

  // Intro → zones transition
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setPhase("zones"), 2500);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto-advance zones
  useEffect(() => {
    if (phase !== "zones") return;
    const interval = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setExiting(false);
        setCurrentIdx(prev => {
          if (prev >= SPEED_RUN_ZONES.length - 1) {
            setPhase("finale");
            return prev;
          }
          playSound("warp");
          return prev + 1;
        });
      }, 400);
    }, ZONE_DURATION);
    return () => clearInterval(interval);
  }, [phase]);

  // Progress timer
  useEffect(() => {
    if (phase !== "zones") return;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      setElapsed(performance.now() - start);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const progress = phase === "zones" ? Math.min(100, (elapsed / (ZONE_DURATION * SPEED_RUN_ZONES.length)) * 100) : phase === "finale" ? 100 : 0;

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 90,
      background: "linear-gradient(135deg, #020810 0%, #04101e 50%, #020810 100%)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      animation: "rsr-fade-in 0.3s ease-out",
    }}>
      <style>{STYLES}</style>

      {/* Scanline */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2, zIndex: 1,
        background: "linear-gradient(90deg, transparent, rgba(124,224,255,0.2), transparent)",
        animation: "rsr-scan 5s linear infinite", pointerEvents: "none",
      }} />

      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid #1a2a4a",
        background: "rgba(4,8,20,0.9)", backdropFilter: "blur(8px)",
        position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 7,
            color: "#7ce0ff", letterSpacing: "0.15em",
          }}>
            ⚡ SPEED RUN — RECRUITER MODE
          </div>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 6,
            color: "#3a5070", padding: "2px 6px",
            border: "1px solid #1a2a4a",
          }}>
            {Math.ceil((TOTAL_DURATION - elapsed) / 1000)}s
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "transparent", border: "1px solid #1a2a4a",
          color: "#3a5070", padding: "4px 10px",
          fontFamily: "var(--font-pixel)", fontSize: 6, cursor: "pointer",
        }}>SKIP ✕</button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#0a1525", position: "relative" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #7ce0ff, #00e8a0)",
          transition: "width 0.3s linear",
          boxShadow: "0 0 10px rgba(124,224,255,0.5)",
        }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>

        {/* ── INTRO PHASE ── */}
        {phase === "intro" && (
          <div style={{ textAlign: "center", animation: "rsr-slide-up 0.5s ease-out" }}>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 7,
              color: "#3a5a80", letterSpacing: "0.25em", marginBottom: 16,
            }}>★ 60-SECOND CAREER OVERVIEW</div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: "clamp(20px, 5vw, 36px)",
              color: "#7ce0ff",
              textShadow: "0 4px 0 #0a2040, 0 0 30px rgba(124,224,255,0.4)",
              marginBottom: 8,
            }}>PARAM MINHAS</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 16,
              color: "#8aa0c0", marginBottom: 20,
            }}>Builder · Designer · Creative Director</div>
            <div style={{
              display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
            }}>
              {[
                { label: "YEARS", value: "15+" },
                { label: "REVENUE", value: "$6M+" },
                { label: "COMMUNITY", value: "350K+" },
                { label: "NETWORK", value: "90+" },
              ].map((m, i) => (
                <div key={m.label} style={{
                  padding: "8px 14px",
                  background: "rgba(124,224,255,0.06)",
                  border: "1px solid rgba(124,224,255,0.2)",
                  animation: `rsr-count-in 0.4s ease-out ${i * 0.1 + 0.3}s both`,
                }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#4a6888", marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 14, color: "#c8d8f0" }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ZONES PHASE ── */}
        {phase === "zones" && zone && (
          <div
            key={zone.id}
            style={{
              width: "100%", maxWidth: 600,
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 20, alignItems: "center",
              animation: exiting ? "rsr-zone-exit 0.4s ease-in forwards" : "rsr-slide-left 0.4s ease-out",
            }}
          >
            {/* Left — landmark image + zone info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Landmark */}
              <div style={{
                height: 160, width: "100%",
                background: `radial-gradient(ellipse at center, ${zone.accent}15 0%, transparent 70%)`,
                border: `2px solid ${zone.accent}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", position: "relative",
              }}>
                <img
                  src={LANDMARK_URL[zone.id]}
                  alt={zone.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                  onError={e => (e.currentTarget.style.display = "none")}
                />
                {/* Zone number badge */}
                <div style={{
                  position: "absolute", top: 8, left: 8,
                  background: "rgba(2,4,12,0.9)",
                  border: `1px solid ${zone.accent}60`,
                  padding: "2px 8px",
                  fontFamily: "var(--font-pixel)", fontSize: 6, color: zone.accent,
                }}>
                  {currentIdx + 1}/{SPEED_RUN_ZONES.length}
                </div>
              </div>

              {/* Zone name + org */}
              <div>
                <div style={{
                  fontFamily: "var(--font-pixel)", fontSize: 6,
                  color: zone.accent, letterSpacing: "0.15em", marginBottom: 4,
                }}>{zone.years}</div>
                <div style={{
                  fontFamily: "var(--font-pixel)", fontSize: 14,
                  color: "#c8d8f0", marginBottom: 4,
                }}>{zone.org.toUpperCase()}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 13,
                  color: "#5a7898",
                }}>{zone.role}</div>
              </div>
            </div>

            {/* Right — metrics + outcome + gym */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Key metric */}
              {zone.metric && (
                <div style={{
                  padding: "12px 16px",
                  background: `${zone.accent}0c`,
                  border: `1px solid ${zone.accent}35`,
                  animation: "rsr-metric-pop 0.4s ease-out 0.2s both",
                }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: zone.accent, letterSpacing: "0.1em", marginBottom: 4 }}>
                    {zone.metric.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 18, color: "#c8d8f0" }}>
                    {zone.metric.value}
                  </div>
                </div>
              )}

              {/* Outcome */}
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 14,
                color: "#8aa0c0", lineHeight: 1.5,
                animation: "rsr-slide-left 0.4s ease-out 0.3s both",
              }}>
                {zone.outcome}
              </div>

              {/* Gym leader defeated */}
              {zone.gym && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px",
                  background: "rgba(4,8,20,0.8)",
                  border: "1px solid #1a2a4a",
                  animation: "rsr-slide-left 0.4s ease-out 0.4s both",
                }}>
                  <img
                    src={LEADER_URL[zone.gym.leader]}
                    alt={zone.gym.name}
                    style={{ width: 36, height: 36, imageRendering: "pixelated" }}
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                  <div>
                    <div style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#3a5070", marginBottom: 2 }}>GYM LEADER</div>
                    <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: zone.accent }}>{zone.gym.name}</div>
                  </div>
                  <div style={{
                    marginLeft: "auto",
                    width: 22, height: 22,
                    background: zone.badge.color,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#fff",
                    animation: "rsr-badge-pop 0.5s ease-out 0.6s both",
                    boxShadow: `0 0 8px ${zone.badge.color}80`,
                  }}>★</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FINALE PHASE ── */}
        {phase === "finale" && (
          <div style={{ textAlign: "center", animation: "rsr-slide-up 0.5s ease-out", maxWidth: 500 }}>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 7,
              color: "#ffd24a", letterSpacing: "0.2em", marginBottom: 12,
            }}>★ QUEST COMPLETE</div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: "clamp(16px, 4vw, 24px)",
              color: "#c8d8f0", marginBottom: 12,
              textShadow: "0 3px 0 #0a2040",
            }}>9 CHALLENGES. 15 YEARS. 1 BUILDER.</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 16,
              color: "#7a9ab8", lineHeight: 1.6, marginBottom: 24,
            }}>
              Param Minhas — Founder of Iterate (AI-native marketing agency, 90-person network).
              Previously CEO at SoleSearch ($6M+ revenue), CMO at Fere.ai,
              Partner at Good Capital (Meesho, Entri, Simsim).
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={onHire} style={{
                background: "linear-gradient(135deg, rgba(124,224,255,0.2) 0%, rgba(58,120,216,0.15) 100%)",
                border: "2px solid #7ce0ff",
                color: "#7ce0ff", padding: "14px 28px",
                fontFamily: "var(--font-pixel)", fontSize: 10,
                cursor: "pointer", letterSpacing: "0.06em",
                animation: "rsr-cta-glow 2s ease-in-out infinite",
              }}>
                LET&apos;S TALK →
              </button>
              <a href="/api/resume-pdf" style={{
                background: "rgba(4,8,20,0.8)",
                border: "2px solid #2a4060",
                color: "#8aa0c0", padding: "14px 28px",
                fontFamily: "var(--font-pixel)", fontSize: 10,
                textDecoration: "none", letterSpacing: "0.06em",
                display: "flex", alignItems: "center",
              }}>
                ⬇ DOWNLOAD CV
              </a>
              <button onClick={onClose} style={{
                background: "transparent",
                border: "2px solid #1a2a4a",
                color: "#3a5070", padding: "14px 28px",
                fontFamily: "var(--font-pixel)", fontSize: 10,
                cursor: "pointer", letterSpacing: "0.06em",
              }}>
                PLAY FULL GAME ▶
              </button>
            </div>

            {/* Contact links */}
            <div style={{
              marginTop: 20, display: "flex", gap: 16, justifyContent: "center",
              fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070",
            }}>
              <a href="mailto:minhas.param@gmail.com" style={{ color: "#5580aa", textDecoration: "none" }}>EMAIL</a>
              <a href="https://linkedin.com/in/paramminhas" target="_blank" rel="noreferrer" style={{ color: "#5580aa", textDecoration: "none" }}>LINKEDIN</a>
              <a href="https://hyperiterate.com" target="_blank" rel="noreferrer" style={{ color: "#5580aa", textDecoration: "none" }}>ITERATE</a>
            </div>
          </div>
        )}
      </div>

      {/* Bottom zone indicator strip (shows all zones with progress) */}
      {phase === "zones" && (
        <div style={{
          display: "flex", gap: 2, padding: "10px 16px",
          borderTop: "1px solid #0a1525",
          background: "rgba(4,8,20,0.9)",
        }}>
          {SPEED_RUN_ZONES.map((z, i) => (
            <div key={z.id} style={{
              flex: 1, height: 4,
              background: i < currentIdx ? z.accent : i === currentIdx ? z.accent + "88" : "#0a1525",
              transition: "background 0.3s",
              borderRadius: 1,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
