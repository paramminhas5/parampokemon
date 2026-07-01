"use client";
import { useEffect, useRef, useState } from "react";
import type { Zone } from "@/game/data";
import { LEADER_URL, getSprite, isReady } from "@/game/sprite-registry";
import { CONTACT } from "@/game/data";

const STYLES = `
@keyframes bsc-fade-in   { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes bsc-badge-pop { 0%{transform:scale(0) rotate(-20deg)} 60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0deg)} }
@keyframes bsc-shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes bsc-pulse     { 0%,100%{opacity:0.6} 50%{opacity:1} }
`;

interface Props {
  zone: Zone;
  badgeCount: number;
  totalGyms: number;
  onClose: () => void;
}

export function BadgeShareCard({ zone, badgeCount, totalGyms, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate share card image on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 600, H = 315;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#04080f");
    bg.addColorStop(0.5, "#0a1428");
    bg.addColorStop(1, "#0c1830");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid overlay
    ctx.strokeStyle = "rgba(124, 224, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Zone accent glow
    ctx.globalAlpha = 0.15;
    const glow = ctx.createRadialGradient(W * 0.7, H * 0.4, 0, W * 0.7, H * 0.4, 200);
    glow.addColorStop(0, zone.theme.accent);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // Badge color bar on left
    ctx.fillStyle = zone.badge.color;
    ctx.fillRect(0, 0, 4, H);

    // "GYM BADGE EARNED" header
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = zone.theme.accent;
    ctx.letterSpacing = "2px";
    ctx.fillText("★ GYM BADGE EARNED", 24, 36);

    // Badge name
    ctx.font = "bold 28px monospace";
    ctx.fillStyle = "#c8d8f0";
    ctx.fillText(zone.badge.label.toUpperCase(), 24, 72);

    // Zone org + years
    ctx.font = "14px monospace";
    ctx.fillStyle = "#5a7898";
    ctx.fillText(`${zone.org} · ${zone.years}`, 24, 100);

    // Victory quote
    if (zone.gym?.victory) {
      ctx.font = "italic 13px monospace";
      ctx.fillStyle = "#7a9ab8";
      const lines = wrapText(ctx, `"${zone.gym.victory}"`, 320);
      lines.forEach((line, i) => {
        ctx.fillText(line, 24, 130 + i * 18);
      });
    }

    // Badge count
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#ffd24a";
    ctx.fillText(`${badgeCount}/${totalGyms} BADGES`, 24, H - 50);

    // URL
    ctx.font = "12px monospace";
    ctx.fillStyle = "#3a5070";
    ctx.fillText("paramminhas.com/play", 24, H - 24);

    // Right side: badge circle
    const bx = W - 100, by = H / 2 - 30;
    ctx.beginPath();
    ctx.arc(bx, by, 40, 0, Math.PI * 2);
    ctx.fillStyle = zone.badge.color + "33";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx, by, 40, 0, Math.PI * 2);
    ctx.strokeStyle = zone.badge.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "bold 28px monospace";
    ctx.fillStyle = zone.badge.color;
    ctx.textAlign = "center";
    ctx.fillText("★", bx, by + 10);
    ctx.textAlign = "left";

    // "PARAM QUEST" branding
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "#2a4060";
    ctx.textAlign = "right";
    ctx.fillText("PARAM QUEST", W - 24, H - 24);
    ctx.textAlign = "left";

    // Generate image URL
    setImageUrl(canvas.toDataURL("image/png"));
  }, [zone, badgeCount, totalGyms]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line + (line ? " " : "") + word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  const shareText = `Just earned the ${zone.badge.label} in PARAM QUEST — a playable portfolio RPG.\n\n${badgeCount}/${totalGyms} badges collected. Play at paramminhas.com/play`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://paramminhas.com/play")}`;

  function handleCopy() {
    navigator.clipboard?.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `param-quest-badge-${zone.badge.id}.png`;
    a.click();
  }

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 80,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "rgba(2, 4, 10, 0.92)",
        animation: "bsc-fade-in 0.4s ease-out",
        padding: 16,
      }}
      onClick={onClose}
    >
      <style>{STYLES}</style>

      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 440,
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {/* Generated card preview */}
        <div style={{
          border: `2px solid ${zone.theme.accent}50`,
          boxShadow: `0 0 30px ${zone.theme.accent}20`,
          overflow: "hidden",
          background: "#04080f",
        }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* Share buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={twitterUrl} target="_blank" rel="noreferrer" style={{
            flex: 1, minWidth: 80,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "rgba(29,161,242,0.12)",
            border: "1px solid rgba(29,161,242,0.4)",
            color: "#1da1f2", padding: "10px 12px",
            fontFamily: "var(--font-pixel)", fontSize: 7,
            textDecoration: "none",
          }}>𝕏 SHARE</a>
          <a href={linkedinUrl} target="_blank" rel="noreferrer" style={{
            flex: 1, minWidth: 80,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "rgba(0,119,181,0.12)",
            border: "1px solid rgba(0,119,181,0.4)",
            color: "#0077b5", padding: "10px 12px",
            fontFamily: "var(--font-pixel)", fontSize: 7,
            textDecoration: "none",
          }}>IN LINKEDIN</a>
          <button onClick={handleDownload} style={{
            flex: 1, minWidth: 80,
            background: "rgba(74,222,128,0.1)",
            border: "1px solid rgba(74,222,128,0.4)",
            color: "#4ade80", padding: "10px 12px",
            fontFamily: "var(--font-pixel)", fontSize: 7,
            cursor: "pointer",
          }}>⬇ SAVE</button>
          <button onClick={handleCopy} style={{
            flex: 1, minWidth: 80,
            background: copied ? "rgba(0,232,160,0.15)" : "rgba(4,8,20,0.6)",
            border: `1px solid ${copied ? "rgba(0,232,160,0.5)" : "#1a2a3a"}`,
            color: copied ? "#00e8a0" : "#4a6080",
            padding: "10px 12px",
            fontFamily: "var(--font-pixel)", fontSize: 7,
            cursor: "pointer",
          }}>{copied ? "✓ COPIED" : "⎘ COPY"}</button>
        </div>

        {/* Close hint */}
        <div style={{
          textAlign: "center",
          fontFamily: "var(--font-pixel)", fontSize: 7,
          color: "#2a3a50", animation: "bsc-pulse 1.5s ease-in-out infinite",
        }}>
          TAP OUTSIDE TO CONTINUE
        </div>
      </div>
    </div>
  );
}
