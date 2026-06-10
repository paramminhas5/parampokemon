"use client";
import { useEffect, useState, useRef } from "react";
import type { Zone } from "@/game/data";
import { BANNER_URL, getSprite, isReady } from "@/game/sprite-registry";

const DISPLAY_MS = 2600;

const STYLES = `
@keyframes zt-slide-up {
  0%   { opacity: 0; transform: translateY(28px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes zt-fade-out {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes zt-scan {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes zt-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes zt-particle {
  0%   { opacity: 0; transform: translateY(0) scale(0.5); }
  40%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-60px) scale(1.2); }
}
`;

export function ZoneTitle({ zone, onDone }: { zone: Zone; onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const accent    = zone.theme.accent;
  const bannerUrl = BANNER_URL[zone.id];

  // Auto-progress
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"),  DISPLAY_MS - 400);
    const t3 = setTimeout(() => onDone(),          DISPLAY_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  // Draw banner PNG into canvas with a dark gradient overlay for text legibility
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const img = bannerUrl ? getSprite(bannerUrl) : null;
      if (img && isReady(img)) {
        // Cover-fit the banner image
        const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
        const sw = img.naturalWidth * scale;
        const sh = img.naturalHeight * scale;
        const sx = (canvas.width - sw) / 2;
        const sy = (canvas.height - sh) / 2;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, sx, sy, sw, sh);
        // Dark overlay for text contrast
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0,   "rgba(2,4,12,0.55)");
        grad.addColorStop(0.4, "rgba(2,4,12,0.20)");
        grad.addColorStop(0.7, "rgba(2,4,12,0.55)");
        grad.addColorStop(1,   "rgba(2,4,12,0.82)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Accent color tint
        ctx.fillStyle = accent + "18";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Fallback gradient if image not yet loaded
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "#020408");
        grad.addColorStop(1, accent + "30");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // retry
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [bannerUrl, accent]);

  const isOut = phase === "out";

  // Generate stable particle positions
  const particles = Array.from({ length: 14 }, (_, i) => ({
    left: `${8 + (i * 37.1 + 3) % 84}%`,
    delay: `${(i * 0.18) % 1.4}s`,
    dur:   `${1.1 + (i % 5) * 0.22}s`,
    size:  2,
  }));

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 60,
      overflow: "hidden",
      animation: isOut ? "zt-fade-out 0.4s ease-in forwards" : "none",
      pointerEvents: "none",
    }}>
      <style>{STYLES}</style>

      {/* Banner background canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={640}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Scanline sweep */}
      <div style={{
        position: "absolute", inset: 0,
        background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
        animation: "zt-scan 1.8s ease-in-out",
        pointerEvents: "none",
      }} />

      {/* Accent border top + bottom */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent 0%, ${accent} 30%, ${accent} 70%, transparent 100%)`,
        opacity: 0.9,
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent 0%, ${accent} 30%, ${accent} 70%, transparent 100%)`,
        opacity: 0.9,
      }} />

      {/* Floating accent particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          bottom: "28%",
          left: p.left,
          width: p.size, height: p.size,
          background: accent,
          borderRadius: 0,
          boxShadow: "none",
          animation: `zt-particle ${p.dur} ${p.delay} ease-out infinite`,
          opacity: 0,
        }} />
      ))}

      {/* Main content — centered */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 0,
        animation: "zt-slide-up 0.45s cubic-bezier(0.2,0.8,0.4,1) forwards",
      }}>
        {/* ERA / ORG label */}
        <div style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 9,
          color: accent,
          letterSpacing: "0.22em",
          opacity: 0.85,
          marginBottom: 14,
          textShadow: `0 0 20px ${accent}`,
          textTransform: "uppercase",
        }}>
          {zone.subtitle}
        </div>

        {/* Divider line */}
        <div style={{
          width: 220, height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          marginBottom: 18,
        }} />

        {/* Zone name — big */}
        <div style={{
          fontFamily: "var(--font-pixel)",
          fontSize: "clamp(22px, 4vw, 38px)",
          color: "#ffffff",
          letterSpacing: "0.12em",
          textAlign: "center",
          lineHeight: 1.1,
          textShadow: `0 0 40px ${accent}cc, 0 2px 0 rgba(0,0,0,0.8)`,
          padding: "0 24px",
        }}>
          {zone.name.toUpperCase()}
        </div>

        {/* Shimmer underline */}
        <div style={{
          width: 160, height: 2, marginTop: 14,
          background: `linear-gradient(90deg, transparent, ${accent}aa, ${accent}, ${accent}aa, transparent)`,
          backgroundSize: "400px 100%",
          animation: "zt-shimmer 1.8s linear infinite",
        }} />

        {/* Org + years */}
        <div style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 8,
          color: "#7a9ab8",
          letterSpacing: "0.14em",
          marginTop: 16,
          textTransform: "uppercase",
        }}>
          {zone.org}  ·  {zone.years}
        </div>
      </div>
    </div>
  );
}
