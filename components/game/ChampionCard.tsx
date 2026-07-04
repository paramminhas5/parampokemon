"use client";
import { useEffect, useState } from "react";
import { ZONES, CONTACT } from "@/game/data";
import { PLAYER_FRONT_URL, CHAMPION_BG_URL, LEADER_URL, getSprite, isReady } from "@/game/sprite-registry";

const STYLES = `
@keyframes cc-bg-in      { from{opacity:0} to{opacity:1} }
@keyframes cc-card-in    { 0%{opacity:0;transform:scale(0.88) translateY(24px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
@keyframes cc-badge-in   { 0%{opacity:0;transform:scale(0) rotate(-20deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
@keyframes cc-title-in   { 0%{opacity:0;transform:translateY(-12px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes cc-sparkle    { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
@keyframes cc-ring       { 0%{transform:scale(0.4);opacity:0.8} 100%{transform:scale(3);opacity:0} }
@keyframes cc-scan       { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }
@keyframes cc-continue   { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes cc-star-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes cc-merlord-bob{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes cc-merlord-glow{ 0%,100%{filter:drop-shadow(0 0 20px rgba(255,210,74,0.6))} 50%{filter:drop-shadow(0 0 44px rgba(255,210,74,0.95))} }
`;

interface Props {
  badges: Set<string>;
  defeated: Set<string>;
  creatures: Set<string>;
  onClose: () => void;
}

const TOTAL_GYMS = ZONES.filter(z => z.gym).length;

function ChampionBgLayer() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const img = getSprite(CHAMPION_BG_URL);
    if (isReady(img)) { setReady(true); return; }
    const t = setInterval(() => { if (isReady(img)) { setReady(true); clearInterval(t); } }, 80);
    return () => clearInterval(t);
  }, []);
  if (!ready) return null;
  return (
    <img src={CHAMPION_BG_URL} alt="" style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      objectFit: "cover", objectPosition: "center",
      opacity: 0.28, pointerEvents: "none", zIndex: 0,
    }} />
  );
}

export function ChampionCard({ badges, defeated, creatures, onClose }: Props) {
  const [phase, setPhase] = useState<"rings" | "card" | "badges" | "share">("rings");
  const [copied, setCopied] = useState(false);
  const [merlordReady, setMerlordReady] = useState(false);

  // Pre-load Merlord PNG
  useEffect(() => {
    const img = getSprite(PLAYER_FRONT_URL.merlord);
    if (isReady(img)) { setMerlordReady(true); return; }
    const t = setInterval(() => { if (isReady(img)) { setMerlordReady(true); clearInterval(t); } }, 80);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("card"),   500);
    const t2 = setTimeout(() => setPhase("badges"), 1100);
    const t3 = setTimeout(() => setPhase("share"),  2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const shareText = `I just beat CAREER QUEST — the world's first playable CV.\n\n${defeated.size}/${TOTAL_GYMS} gym badges. 15 years of Param Minhas's career. Play it at paramminhas.com/play`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  function handleCopy() {
    navigator.clipboard?.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    x: 10 + (i * 7.3 * 11) % 80,
    y: 5  + (i * 5.7 * 13) % 90,
    delay: i * 0.18,
    color: ["#ffd24a", "#7ce0ff", "#c89af0", "#00e8a0", "#ff9fd4"][i % 5],
    size: 3 + (i % 3) * 2,
  }));

  const gymZones = ZONES.filter(z => z.gym);

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 95,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 30%, rgba(255,210,74,0.18) 0%, #020814 55%)",
        animation: "cc-bg-in 0.5s ease-out",
        overflow: "hidden",
        fontFamily: "var(--font-pixel)",
        padding: "16px 12px",
      }}
      onClick={phase === "share" ? onClose : undefined}
    >
      <style>{STYLES}</style>
      <ChampionBgLayer />

      {/* Scanline */}
      <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(255,210,74,0.3),transparent)", animation: "cc-scan 5s linear infinite", pointerEvents: "none", zIndex: 1 }} />

      {/* Sparkle particles */}
      {sparkles.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: s.color, boxShadow: `0 0 6px ${s.color}`,
          animation: `cc-sparkle ${1.6 + (i % 3) * 0.4}s ease-in-out ${s.delay}s infinite`,
          pointerEvents: "none", zIndex: 1,
        }} />
      ))}

      {/* Expanding rings */}
      {["#ffd24a", "#7ce0ff", "#c89af0"].map((c, i) => (
        <div key={i} style={{
          position: "absolute", width: 200, height: 200,
          borderRadius: "50%", border: `2px solid ${c}`,
          animation: `cc-ring 1.5s ease-out ${i * 0.3}s both`,
          pointerEvents: "none", zIndex: 1,
        }} />
      ))}

      {/* ── Main card ── */}
      {(phase === "card" || phase === "badges" || phase === "share") && (
        <div style={{
          width: "100%", maxWidth: 420,
          animation: "cc-card-in 0.55s cubic-bezier(0.2,0.8,0.4,1) both",
          position: "relative", zIndex: 5,
          display: "flex", flexDirection: "column",
          maxHeight: "calc(100vh - 32px)", overflow: "hidden",
        }}>
          {/* Gold header */}
          <div style={{
            background: "linear-gradient(135deg, rgba(255,210,74,0.2) 0%, rgba(232,133,42,0.15) 100%)",
            border: "2px solid rgba(255,210,74,0.6)",
            borderBottom: "none",
            padding: "14px 18px",
            textAlign: "center",
            boxShadow: "0 0 40px rgba(255,210,74,0.2)",
          }}>
            <div style={{ fontSize: 24, color: "#ffd24a", display: "inline-block", animation: "cc-star-spin 8s linear infinite", textShadow: "0 0 20px #ffd24a", marginBottom: 6 }}>★</div>
            <div style={{ fontSize: 6, color: "#ffd24a", letterSpacing: "0.25em", marginBottom: 6, animation: "cc-title-in 0.4s ease-out 0.2s both" }}>✦ QUEST COMPLETE ✦</div>
            <div style={{ fontSize: "clamp(14px, 4vw, 20px)", color: "#fff", textShadow: "0 4px 0 #7a4a00, 0 0 30px rgba(255,210,74,0.6)", animation: "cc-title-in 0.4s ease-out 0.3s both", lineHeight: 1.2 }}>
              MERLORD ACHIEVED
            </div>
            <div style={{ fontSize: 7, color: "rgba(255,210,74,0.7)", marginTop: 6, animation: "cc-title-in 0.4s ease-out 0.4s both", letterSpacing: "0.1em" }}>
              PARAM MINHAS · 15 YEARS OF BUILDING
            </div>
          </div>

          {/* Merlord PNG + stats */}
          <div style={{
            background: "#07101e",
            border: "2px solid rgba(255,210,74,0.4)",
            borderTop: "none", borderBottom: "none",
            padding: "12px 16px",
            display: "flex", gap: 16, alignItems: "center",
          }}>
            <div style={{ flexShrink: 0, animation: "cc-merlord-bob 2.4s ease-in-out infinite" }}>
              {merlordReady ? (
                <img
                  src={PLAYER_FRONT_URL.merlord}
                  alt="Merlord"
                  style={{
                    width: 96, height: 96,
                    imageRendering: "pixelated",
                    animation: "cc-merlord-glow 2.4s ease-in-out infinite",
                  }}
                />
              ) : (
                <div style={{ width: 96, height: 96, background: "rgba(255,210,74,0.08)", border: "1px solid rgba(255,210,74,0.2)" }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 6, color: "rgba(255,210,74,0.6)", letterSpacing: "0.1em", marginBottom: 8 }}>FINAL STATS</div>
              {[
                { label: "GYMS BEATEN", value: `${defeated.size}/${TOTAL_GYMS}` },
                { label: "CREATURES",   value: `${creatures.size}/${ZONES.filter(z => z.creature).length}` },
                { label: "STAGE",       value: "MERLORD" },
                { label: "YEARS",       value: "15+" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 6, color: "#3a5070" }}>{s.label}</span>
                  <span style={{ fontSize: 7, color: "#c8d8f0" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badge strip */}
          {(phase === "badges" || phase === "share") && (
            <div style={{
              background: "#07101e",
              border: "2px solid rgba(255,210,74,0.4)",
              borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "none",
              padding: "10px 16px",
            }}>
              <div style={{ fontSize: 6, color: "rgba(255,210,74,0.5)", marginBottom: 8, letterSpacing: "0.12em" }}>★ ALL BADGES</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {gymZones.map((z, i) => {
                  const earned = badges.has(z.badge.id);
                  const leaderUrl = LEADER_URL[z.gym!.leader];
                  return (
                    <div key={z.id} title={z.badge.label} style={{
                      width: 32, height: 32,
                      borderRadius: "50%",
                      background: earned ? z.badge.color + "22" : "transparent",
                      border: `2px solid ${earned ? z.badge.color : "#1a2a3a"}`,
                      boxShadow: earned ? `0 0 10px ${z.badge.color}80` : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                      animation: earned ? `cc-badge-in 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s both` : "none",
                      flexShrink: 0, position: "relative",
                    }}>
                      {earned ? (
                        <img src={leaderUrl} alt={z.gym!.opponentName} style={{ width: 28, height: 28, imageRendering: "pixelated", opacity: 0.9 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#1a2a3a" }}>·</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Share section */}
          {phase === "share" && (
            <div style={{
              background: "#07101e",
              border: "2px solid rgba(255,210,74,0.4)",
              borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "none",
              padding: "12px 16px 14px",
            }}>
              <div style={{ fontSize: 6, color: "rgba(255,210,74,0.5)", marginBottom: 10, letterSpacing: "0.12em" }}>SHARE YOUR RUN</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <a href={twitterUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{
                  flex: 1, minWidth: 100,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: "linear-gradient(135deg, rgba(29,161,242,0.2) 0%, rgba(29,161,242,0.1) 100%)",
                  border: "2px solid rgba(29,161,242,0.5)",
                  color: "#1da1f2", padding: "10px 12px",
                  fontFamily: "var(--font-pixel)", fontSize: 7,
                  textDecoration: "none", letterSpacing: "0.06em",
                }}>𝕏 SHARE</a>
                <button onClick={e => { e.stopPropagation(); handleCopy(); }} style={{
                  flex: 1, minWidth: 100,
                  background: copied ? "linear-gradient(135deg, rgba(0,232,160,0.2) 0%, rgba(0,232,160,0.1) 100%)" : "rgba(6,12,24,0.6)",
                  border: `2px solid ${copied ? "rgba(0,232,160,0.5)" : "#1a2a3a"}`,
                  color: copied ? "#00e8a0" : "#4a6080",
                  padding: "10px 12px",
                  fontFamily: "var(--font-pixel)", fontSize: 7,
                  cursor: "pointer", letterSpacing: "0.06em",
                  transition: "all 0.15s",
                }}>{copied ? "✓ COPIED" : "⎘ COPY"}</button>
              </div>
              <a href={`mailto:${CONTACT.email}?subject=I just completed Career Quest&body=${encodeURIComponent(shareText)}`} onClick={e => e.stopPropagation()} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, rgba(255,210,74,0.15) 0%, rgba(232,133,42,0.1) 100%)",
                border: "2px solid rgba(255,210,74,0.4)",
                color: "#ffd24a", padding: "10px 12px",
                fontFamily: "var(--font-pixel)", fontSize: 7,
                textDecoration: "none", letterSpacing: "0.04em",
              }}>✉ EMAIL PARAM</a>
            </div>
          )}

          {/* Continue */}
          {phase === "share" && (
            <div style={{
              background: "#07101e",
              border: "2px solid rgba(255,210,74,0.4)",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              padding: "10px", textAlign: "center",
            }}>
              <button onClick={e => { e.stopPropagation(); onClose(); }} style={{
                background: "linear-gradient(135deg, rgba(255,210,74,0.15) 0%, rgba(232,133,42,0.08) 100%)",
                border: "2px solid rgba(255,210,74,0.5)",
                color: "#ffd24a", padding: "10px 28px",
                fontFamily: "var(--font-pixel)", fontSize: 8,
                cursor: "pointer", letterSpacing: "0.08em",
                boxShadow: "0 0 20px rgba(255,210,74,0.15)",
                animation: "cc-continue 1.4s ease-in-out infinite",
              }}>CONTINUE PLAYING ▶</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
