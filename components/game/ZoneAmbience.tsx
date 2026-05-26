"use client";
import { useEffect, useRef } from "react";
import type { ZoneTheme } from "@/game/data";

interface Props {
  ground: ZoneTheme["ground"];
  accent: string;
}

const STYLES = `
@keyframes za-scanline    { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }
@keyframes za-matrix      { 0%{transform:translateY(-100%)} 100%{transform:translateY(200vh)} }
@keyframes za-spotlight   { 0%,100%{opacity:0.05;transform:rotate(-30deg) scaleX(0.8)} 50%{opacity:0.12;transform:rotate(-20deg) scaleX(1.1)} }
@keyframes za-pink-sweep  { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }
@keyframes za-glow-pulse  { 0%,100%{opacity:0.08} 50%{opacity:0.18} }
@keyframes za-float-up    { 0%{transform:translateY(0) scale(1);opacity:0.6} 100%{transform:translateY(-60px) scale(0.5);opacity:0} }
`;

export function ZoneAmbience({ ground, accent }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  // Matrix rain for crypto/neon
  useEffect(() => {
    if (ground !== "crypto" && ground !== "neon") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = canvas.offsetHeight || 300;

    const cols = Math.floor(canvas.width / 14);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ∞∑∆∇⊕".split("");

    const loop = () => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = ground === "crypto" ? "#00e8a0" : "#9fe8ff";
      ctx.font = "10px monospace";

      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.globalAlpha = 0.15 + Math.random() * 0.1;
        ctx.fillText(ch, i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.4;
      });
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ground, accent]);

  if (ground === "neon" || ground === "crypto") {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
        <style>{STYLES}</style>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.22 }} />
        {/* Edge glow */}
        <div style={{
          position: "absolute", inset: 0,
          boxShadow: `inset 0 0 60px ${accent}20`,
          pointerEvents: "none",
        }} />
        {/* Top scanline */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}50, transparent)`,
          animation: "za-scanline 4s linear infinite",
        }} />
      </div>
    );
  }

  if (ground === "mall") {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
        <style>{STYLES}</style>
        {/* Pink spotlight sweep */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, width: "30%",
          background: "linear-gradient(90deg, transparent, rgba(255,159,212,0.06), transparent)",
          animation: "za-pink-sweep 6s ease-in-out infinite",
        }} />
        {/* Corner glow */}
        <div style={{
          position: "absolute", inset: 0,
          boxShadow: "inset 0 0 80px rgba(255,159,212,0.08)",
        }} />
      </div>
    );
  }

  if (ground === "studio") {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
        <style>{STYLES}</style>
        {/* Warm spotlight */}
        <div style={{
          position: "absolute", top: "-20%", left: "30%",
          width: "40%", height: "80%",
          background: "radial-gradient(ellipse at top, rgba(255,210,154,0.06) 0%, transparent 70%)",
          animation: "za-spotlight 5s ease-in-out infinite",
          transformOrigin: "top center",
        }} />
        {/* Floating music notes */}
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            position: "absolute",
            left: `${20 + i * 22}%`,
            bottom: `${10 + (i % 3) * 8}%`,
            fontFamily: "var(--font-pixel)", fontSize: 9,
            color: accent, opacity: 0,
            animation: `za-float-up ${3 + i * 0.7}s ease-out ${i * 0.8}s infinite`,
          }}>{["♪","♫","♩","♬"][i]}</div>
        ))}
      </div>
    );
  }

  if (ground === "dusk") {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
        <style>{STYLES}</style>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${accent}0a 0%, transparent 60%)`,
          animation: "za-glow-pulse 3s ease-in-out infinite",
        }} />
        {/* Purple particle floaters */}
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            position: "absolute",
            left: `${15 + i * 18}%`,
            bottom: `${5 + (i % 4) * 12}%`,
            width: 3, height: 3, borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 6px ${accent}`,
            opacity: 0,
            animation: `za-float-up ${4 + i * 0.5}s ease-out ${i * 0.6}s infinite`,
          }} />
        ))}
      </div>
    );
  }

  if (ground === "night") {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
        <style>{STYLES}</style>
        <div style={{
          position: "absolute", inset: 0,
          boxShadow: `inset 0 0 100px ${accent}10`,
        }} />
        <div style={{
          position: "absolute", left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
          animation: "za-scanline 6s linear infinite 1s",
        }} />
      </div>
    );
  }

  // Default — subtle corner glow for remaining themes
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
      <div style={{
        position: "absolute", inset: 0,
        boxShadow: `inset 0 0 60px ${accent}08`,
      }} />
    </div>
  );
}
