"use client";
import { useEffect, useRef, useState } from "react";

export type TransitionKind = "zone" | "battle" | "warp" | "none";

interface Props {
  trigger: { kind: TransitionKind; color: string; key: number } | null;
  onMidpoint?: () => void;
}

const DURATION: Record<TransitionKind, number> = {
  zone: 280,
  battle: 500,
  warp: 350,
  none: 0,
};

const STYLES = `
@keyframes tro-flash-in  { 0%{opacity:0} 30%{opacity:1} 100%{opacity:1} }
@keyframes tro-flash-out { 0%{opacity:1} 100%{opacity:0} }
@keyframes tro-iris-in   {
  0%   { clip-path: circle(100% at 50% 50%); opacity:1 }
  100% { clip-path: circle(0%   at 50% 50%); opacity:1 }
}
@keyframes tro-iris-out  {
  0%   { clip-path: circle(0%   at 50% 50%); opacity:1 }
  100% { clip-path: circle(100% at 50% 50%); opacity:1 }
}
@keyframes tro-scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
@keyframes tro-battle-lines {
  0%   { transform: scaleX(0); opacity:1 }
  60%  { transform: scaleX(1); opacity:1 }
  100% { transform: scaleX(1); opacity:0 }
}
`;

export function TransitionOverlay({ trigger, onMidpoint }: Props) {
  const [phase, setPhase] = useState<"idle" | "in" | "hold" | "out">("idle");
  const [activeKind, setActiveKind] = useState<TransitionKind>("none");
  const [activeColor, setActiveColor] = useState("#000");
  const midFired = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    if (!trigger || trigger.kind === "none") return;
    clear();
    midFired.current = false;
    setActiveKind(trigger.kind);
    setActiveColor(trigger.color);
    setPhase("in");

    if (trigger.kind === "zone") {
      // Faster zone transition: total ≤ 280ms
      const inPhase = 120;
      const t1 = setTimeout(() => {
        setPhase("hold");
        if (!midFired.current) { midFired.current = true; onMidpoint?.(); }
      }, inPhase);
      const t2 = setTimeout(() => setPhase("out"), inPhase + 30);
      const t3 = setTimeout(() => setPhase("idle"), DURATION[trigger.kind]);
      timers.current = [t1, t2, t3];
    } else {
      // battle / warp — original half-based logic
      const half = DURATION[trigger.kind] / 2;
      const t1 = setTimeout(() => {
        setPhase("hold");
        if (!midFired.current) { midFired.current = true; onMidpoint?.(); }
      }, half);
      const t2 = setTimeout(() => setPhase("out"), half + 80);
      const t3 = setTimeout(() => setPhase("idle"), DURATION[trigger.kind] + 120);
      timers.current = [t1, t2, t3];
    }
    return clear;
  }, [trigger?.key]);

  if (phase === "idle") return null;

  if (activeKind === "battle") {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 90, pointerEvents: "none", overflow: "hidden" }}>
        <style>{STYLES}</style>
        {/* Speed lines */}
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0,
            top: `${10 + i * 14}%`, height: `${4 + (i % 3) * 2}%`,
            background: i % 2 === 0 ? "#fff" : activeColor,
            transformOrigin: phase === "in" ? "left center" : "right center",
            animation: `tro-battle-lines ${0.35 + i * 0.04}s ease-out ${i * 0.03}s both`,
            opacity: phase === "out" ? 0 : 1,
            transition: phase === "out" ? "opacity 0.25s" : "none",
          }} />
        ))}
        {/* Color wash */}
        <div style={{
          position: "absolute", inset: 0,
          background: activeColor,
          opacity: phase === "in" ? 0.7 : 0,
          transition: phase === "in" ? "opacity 0.15s" : "opacity 0.4s",
        }} />
      </div>
    );
  }

  if (activeKind === "warp") {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 90, pointerEvents: "none" }}>
        <style>{STYLES}</style>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at center, ${activeColor}ee 0%, #000 100%)`,
          animation: phase === "in"
            ? "tro-iris-in 0.22s ease-in forwards"
            : "tro-iris-out 0.25s ease-out forwards",
        }} />
      </div>
    );
  }

  // zone transition — elegant fade with color strip
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 90, pointerEvents: "none", overflow: "hidden" }}>
      <style>{STYLES}</style>
      {/* Main dark wipe */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, #000 0%, ${activeColor}44 50%, #000 100%)`,
        opacity: phase === "in" ? 1 : phase === "hold" ? 1 : 0,
        transition: phase === "in" ? "opacity 0.15s ease-in" : "opacity 0.18s ease-out",
      }} />
      {/* Accent color horizontal stripe */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: "44%", height: "12%",
        background: activeColor,
        opacity: phase === "hold" ? 0.9 : 0,
        transition: "opacity 0.12s",
        boxShadow: `0 0 40px 10px ${activeColor}`,
      }} />
    </div>
  );
}
