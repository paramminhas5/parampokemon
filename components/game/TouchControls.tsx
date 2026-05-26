"use client";
import { useCallback } from "react";

type Dir = "up" | "down" | "left" | "right";

const STYLES = `
@keyframes tc-btn-press { 0%{transform:scale(1)} 50%{transform:scale(0.88)} 100%{transform:scale(1)} }
`;

interface DPadBtnProps {
  dir: Dir;
  onDir: (dir: Dir, down: boolean) => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function DPadBtn({ dir, onDir, style, children }: DPadBtnProps) {
  const down = useCallback(() => onDir(dir, true), [dir, onDir]);
  const up = useCallback(() => onDir(dir, false), [dir, onDir]);
  return (
    <div
      onPointerDown={e => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); down(); }}
      onPointerUp={e => { e.preventDefault(); up(); }}
      onPointerLeave={e => { e.preventDefault(); up(); }}
      onPointerCancel={e => { e.preventDefault(); up(); }}
      style={{
        width: 44, height: 44,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(10,16,36,0.82)",
        border: "2px solid rgba(124,224,255,0.25)",
        borderRadius: 6,
        color: "rgba(124,224,255,0.7)",
        fontSize: 16,
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        cursor: "pointer",
        boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.4), 0 0 8px rgba(124,224,255,0.08)",
        transition: "background 0.08s, border-color 0.08s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ActionBtn({
  label, color, onClick, style,
}: {
  label: string; color: string; onClick: () => void; style?: React.CSSProperties;
}) {
  return (
    <div
      onPointerDown={e => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); onClick(); }}
      style={{
        width: 44, height: 44,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${color}18`,
        border: `2px solid ${color}55`,
        borderRadius: "50%",
        color: color,
        fontSize: 9,
        fontFamily: "var(--font-pixel)",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        cursor: "pointer",
        boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.4), 0 0 10px ${color}15`,
        letterSpacing: "0.04em",
        ...style,
      }}
    >
      {label}
    </div>
  );
}

export function TouchControls({
  onDir, onAction, onMenu,
}: {
  onDir: (dir: Dir, down: boolean) => void;
  onAction: () => void;
  onMenu: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(env(safe-area-inset-bottom) + 8px)",
        left: 0, right: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: "0 12px",
        pointerEvents: "none",
        zIndex: 22,
      }}
    >
      <style>{STYLES}</style>

      {/* D-Pad — left side */}
      <div style={{ pointerEvents: "auto", position: "relative", width: 132, height: 132 }}>
        {/* Up */}
        <DPadBtn dir="up" onDir={onDir}
          style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }}>
          ▲
        </DPadBtn>
        {/* Down */}
        <DPadBtn dir="down" onDir={onDir}
          style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)" }}>
          ▼
        </DPadBtn>
        {/* Left */}
        <DPadBtn dir="left" onDir={onDir}
          style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }}>
          ◀
        </DPadBtn>
        {/* Right */}
        <DPadBtn dir="right" onDir={onDir}
          style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
          ▶
        </DPadBtn>
        {/* Centre dot */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 28, height: 28,
          background: "rgba(10,16,36,0.6)",
          border: "2px solid rgba(124,224,255,0.15)",
          borderRadius: 4,
        }} />
      </div>

      {/* Action buttons — right side */}
      <div style={{
        pointerEvents: "auto",
        display: "flex", flexDirection: "column",
        alignItems: "flex-end", gap: 10,
        paddingBottom: 4,
      }}>
        {/* A — Talk / interact */}
        <ActionBtn label="A" color="#7ce0ff" onClick={onAction} />
        {/* B — Menu */}
        <ActionBtn label="☰" color="#ffd24a" onClick={onMenu}
          style={{ width: 38, height: 38, fontSize: 13 }} />
      </div>
    </div>
  );
}
