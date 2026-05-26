"use client";
import { useEffect, useRef, useState } from "react";
import { drawStarter } from "@/game/sprites";
import { drawCharacter } from "@/game/tiles";

// ─── Prof. Iterate's opening speech ────────────────────────────────────────
const INTRO_LINES = [
  {
    speaker: "Prof. Iterate",
    role: "Pokémon Professor",
    text: "Welcome to the world of PARAM QUEST.\n\nThis is a portfolio — but not a PDF you scroll past. It's a world you walk through.",
  },
  {
    speaker: "Prof. Iterate",
    role: "Pokémon Professor",
    text: "The player is PARAM MINHAS — builder, designer, director. Fifteen years across e-commerce, AI, real estate, sneakers, music, and marketing.",
  },
  {
    speaker: "Prof. Iterate",
    role: "Pokémon Professor",
    text: "Ten worlds. Nine gym leaders. Each one a real challenge he actually faced.\n\nDefeat them. Earn the badges. Read what he learned.",
  },
  {
    speaker: "Prof. Iterate",
    role: "Pokémon Professor",
    text: "Your adventure begins now.\n\nChoose a world — or start from the beginning. The whole map is open.",
  },
];

const STYLES = `
@keyframes ts-bg-pulse   { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
@keyframes ts-title-in   { 0%{opacity:0;transform:translateY(-20px) scale(0.92)} 100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes ts-sub-in     { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes ts-press-blink{ 0%,100%{opacity:1} 49%{opacity:1} 50%,99%{opacity:0} }
@keyframes ts-star-drift { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-8px) scale(1.05)} }
@keyframes ts-merman-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes ts-scanline   { 0%{transform:translateY(0)} 100%{transform:translateY(100vh)} }
@keyframes ts-dialog-in  { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes ts-char-in    { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
@keyframes ts-cursor     { 0%,100%{opacity:1} 50%{opacity:0} }
`;

const FRAME_MS = 22;

interface Props {
  onComplete: () => void;
  isFirstVisit: boolean;
}

export function TitleScreen({ onComplete, isFirstVisit }: Props) {
  const [phase, setPhase] = useState<"title" | "intro" | "done">(
    isFirstVisit ? "title" : "done"
  );
  const [lineIdx, setLineIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const [textDone, setTextDone] = useState(false);

  const mermanRef = useRef<HTMLCanvasElement>(null);
  const profRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  // Sprite animation
  useEffect(() => {
    const loop = (now: number) => {
      if (mermanRef.current) {
        const c = mermanRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 128, 128);
        drawStarter(c, "mermander", "front", 16, 8, 3.0, now / 100);
      }
      if (profRef.current) {
        const c = profRef.current.getContext("2d")!;
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 64, 64);
        drawCharacter(c, "professor", "down", 0, 8, 10);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // If not first visit, skip immediately
  useEffect(() => {
    if (!isFirstVisit) { onComplete(); }
  }, [isFirstVisit, onComplete]);

  // Typewriter for current line
  const currentLine = INTRO_LINES[lineIdx];
  useEffect(() => {
    if (phase !== "intro") return;
    setShown(0);
    setTextDone(false);
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i++;
      if (i >= currentLine.text.length) {
        setShown(currentLine.text.length);
        setTextDone(true);
        return;
      }
      setShown(i);
      setTimeout(tick, FRAME_MS);
    };
    const id = setTimeout(tick, FRAME_MS);
    return () => { cancelled = true; clearTimeout(id); };
  }, [lineIdx, phase, currentLine.text]);

  function advance() {
    if (phase === "title") {
      setPhase("intro");
      return;
    }
    if (phase === "intro") {
      if (!textDone) {
        // skip to end of current line
        setShown(currentLine.text.length);
        setTextDone(true);
        return;
      }
      if (lineIdx < INTRO_LINES.length - 1) {
        setLineIdx(l => l + 1);
      } else {
        setPhase("done");
        onComplete();
      }
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "z", "Z", "Escape"].includes(e.key)) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "done") return null;

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 100,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, #010208 0%, #040b1e 40%, #060d22 100%)",
        overflow: "hidden", cursor: "pointer",
        fontFamily: "var(--font-pixel)",
      }}
      onClick={advance}
    >
      <style>{STYLES}</style>

      {/* Starfield */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 80 }, (_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 43.1 + 5) % 100}%`,
            top:  `${(i * 67.3 + 3) % 100}%`,
            width:  i % 7 === 0 ? 2 : 1,
            height: i % 7 === 0 ? 2 : 1,
            background: i % 5 === 0 ? "#7ce0ff" : i % 3 === 0 ? "#c89af0" : "#fff",
            borderRadius: "50%",
            opacity: 0.06 + (i % 5) * 0.06,
            animation: `ts-star-drift ${3 + (i % 4)}s ease-in-out ${(i % 6) * 0.4}s infinite alternate`,
          }} />
        ))}
      </div>

      {/* Nebula blobs */}
      <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "50%", height: "60%", background: "radial-gradient(ellipse, rgba(124,100,255,0.12) 0%, transparent 70%)", filter: "blur(40px)", animation: "ts-bg-pulse 6s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "45%", height: "55%", background: "radial-gradient(ellipse, rgba(0,232,160,0.08) 0%, transparent 70%)", filter: "blur(50px)", animation: "ts-bg-pulse 8s ease-in-out 2s infinite alternate", pointerEvents: "none" }} />

      {/* Scanline */}
      <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(124,224,255,0.06),transparent)", animation: "ts-scanline 6s linear infinite", pointerEvents: "none" }} />

      {/* ── TITLE PHASE ── */}
      {phase === "title" && (
        <div style={{ textAlign: "center", position: "relative", zIndex: 5 }}>
          {/* Mermander sprite */}
          <div style={{ animation: "ts-merman-bob 2s ease-in-out infinite", marginBottom: 8 }}>
            <canvas ref={mermanRef} width={128} height={128}
              style={{ imageRendering: "pixelated", width: 160, height: 160, filter: "drop-shadow(0 0 30px rgba(124,224,255,0.5))" }} />
          </div>

          <div style={{ fontSize: 7, color: "#3a5a80", letterSpacing: "0.3em", marginBottom: 16, animation: "ts-sub-in 0.6s ease-out 0.2s both" }}>
            ★ A PLAYABLE PORTFOLIO
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 7vw, 52px)",
            lineHeight: 1.1,
            margin: "0 0 6px",
            color: "#7ce0ff",
            textShadow: "0 6px 0 #0a2040, 0 0 50px rgba(124,224,255,0.5)",
            animation: "ts-title-in 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
          }}>
            PARAM<br />QUEST
          </h1>

          <div style={{ fontSize: 7, color: "#5570aa", letterSpacing: "0.15em", marginTop: 10, animation: "ts-sub-in 0.5s ease-out 0.5s both" }}>
            FIFTEEN YEARS OF BUILDING
          </div>

          <div style={{
            marginTop: 36, fontSize: 8, color: "#7ce0ff",
            animation: "ts-press-blink 1.4s step-end infinite",
            letterSpacing: "0.1em",
          }}>
            ▶ PRESS START
          </div>

          <div style={{ fontSize: 6, color: "#1a2a3a", marginTop: 10, letterSpacing: "0.08em" }}>
            SPACE · ENTER · TAP
          </div>
        </div>
      )}

      {/* ── INTRO PHASE ── */}
      {phase === "intro" && (
        <div style={{
          position: "relative", zIndex: 5,
          width: "100%", maxWidth: 560,
          padding: "0 16px",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 20,
        }}>
          {/* Prof sprite */}
          <div style={{ animation: "ts-char-in 0.4s ease-out both" }}>
            <canvas ref={profRef} width={64} height={64}
              style={{ imageRendering: "pixelated", width: 80, height: 80, filter: "drop-shadow(0 0 12px rgba(168,211,154,0.5))" }} />
          </div>

          {/* Dialog box */}
          <div style={{
            width: "100%",
            background: "#07101e",
            border: "2px solid #2a3a5a",
            boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.4), 0 0 20px rgba(168,211,154,0.1)",
            animation: "ts-dialog-in 0.3s ease-out both",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px",
              borderBottom: "1px solid #1a3a2a",
              background: "linear-gradient(135deg, rgba(168,211,154,0.1) 0%, transparent 60%)",
            }}>
              <div style={{
                width: 44, height: 44, flexShrink: 0,
                border: "2px solid #a8d39a60",
                background: "#a8d39a10",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                <canvas ref={undefined} width={32} height={32}
                  style={{ imageRendering: "pixelated", width: 32, height: 32 }} />
                {/* inline mini-prof drawn */}
                <span style={{ fontSize: 18, color: "#a8d39a" }}>⚗</span>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "#a8d39a", letterSpacing: "0.06em" }}>
                  {currentLine.speaker}
                </div>
                <div style={{ fontSize: 7, color: "#5570aa", marginTop: 3 }}>
                  {currentLine.role}
                </div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 7, color: "#1a2a3a" }}>
                {lineIdx + 1}/{INTRO_LINES.length}
              </div>
            </div>

            {/* Text */}
            <div style={{ padding: "12px 14px 16px" }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 16,
                lineHeight: 1.55, color: "#c8d8f0",
                whiteSpace: "pre-wrap", minHeight: 80,
              }}>
                {currentLine.text.slice(0, shown)}
                {!textDone && <span style={{ animation: "ts-cursor 0.8s step-end infinite" }}>▌</span>}
              </div>
            </div>
          </div>

          {/* Advance hint */}
          {textDone && (
            <div style={{
              fontSize: 7, color: "#3a5070",
              letterSpacing: "0.1em",
              animation: "ts-press-blink 1.2s step-end infinite",
            }}>
              {lineIdx < INTRO_LINES.length - 1 ? "▶ NEXT" : "▶ BEGIN QUEST"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
