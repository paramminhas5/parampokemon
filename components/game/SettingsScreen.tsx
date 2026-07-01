"use client";
import { useState, useEffect } from "react";
import { isMuted, setMuted } from "@/lib/audio";

export type GameSettings = {
  textSpeed: "slow" | "normal" | "fast";
  showControls: boolean;
  screenShake: boolean;
  particleEffects: boolean;
  highContrast: boolean;
};

const DEFAULTS: GameSettings = {
  textSpeed: "normal",
  showControls: true,
  screenShake: true,
  particleEffects: true,
  highContrast: false,
};

export function loadSettings(): GameSettings {
  if (typeof localStorage === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem("pq_settings");
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

export function saveSettings(s: GameSettings) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("pq_settings", JSON.stringify(s));
}

const STYLES = `
@keyframes settings-fade-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
body.pq-high-contrast [style*="border"] { border-width: 3px !important; }
body.pq-high-contrast .pq-panel { border-width: 3px !important; border-color: rgba(255,255,255,0.5) !important; }
body.pq-high-contrast [style*="font-pixel"] { text-shadow: 0 0 2px rgba(255,255,255,0.5); }
`;

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [muted, setMutedState] = useState(isMuted());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("pq-high-contrast", settings.highContrast);
  }, [settings.highContrast]);

  const toggle = (key: keyof GameSettings) => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  };

  const handleMuteToggle = () => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  };

  const textSpeeds: GameSettings["textSpeed"][] = ["slow", "normal", "fast"];
  const TEXT_SPEED_MS: Record<GameSettings["textSpeed"], string> = {
    slow: "35ms/char",
    normal: "22ms/char",
    fast: "10ms/char",
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
         onClick={onClose}
         style={{ background: "rgba(2,5,14,0.92)" }}>
      <style>{STYLES}</style>
      <div className="pq-panel w-full max-w-md"
           onClick={e => e.stopPropagation()}
           style={{ animation: "settings-fade-in 0.25s ease-out" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3"
             style={{ borderBottom: "2px solid var(--color-dialog-border)" }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 12, letterSpacing: "0.1em" }}>
            SETTINGS
          </div>
          <button onClick={onClose} className="pq-btn" style={{ padding: "4px 12px", fontSize: 10 }}>
            CLOSE
          </button>
        </div>

        {/* Settings body */}
        <div className="p-4 flex flex-col gap-4">

          {/* Audio */}
          <Section label="AUDIO">
            <ToggleRow label="Sound" description="Music + SFX" active={!muted} onToggle={handleMuteToggle} />
          </Section>

          {/* Display */}
          <Section label="DISPLAY">
            <ToggleRow label="Screen Shake" description="Camera shake on battle hits" active={settings.screenShake} onToggle={() => toggle("screenShake")} />
            <ToggleRow label="Particles" description="Ambient zone particles + sparkles" active={settings.particleEffects} onToggle={() => toggle("particleEffects")} />
            <ToggleRow label="Touch Controls" description="Show D-pad on mobile" active={settings.showControls} onToggle={() => toggle("showControls")} />
            <ToggleRow label="High Contrast" description="Enhanced borders + text visibility" active={settings.highContrast} onToggle={() => toggle("highContrast")} />
          </Section>

          {/* Text */}
          <Section label="TEXT SPEED">
            <div className="flex gap-2">
              {textSpeeds.map(speed => (
                <button
                  key={speed}
                  onClick={() => setSettings(s => ({ ...s, textSpeed: speed }))}
                  className="pq-btn flex-1"
                  style={{
                    padding: "8px 4px",
                    background: settings.textSpeed === speed ? "var(--color-primary)" : undefined,
                    color: settings.textSpeed === speed ? "var(--color-primary-foreground)" : undefined,
                  }}
                >
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>{speed.toUpperCase()}</div>
                  <div style={{ fontSize: 8, opacity: 0.6, marginTop: 2 }}>{TEXT_SPEED_MS[speed]}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Controls reference */}
          <Section label="CONTROLS">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1" style={{ fontSize: 11, opacity: 0.8 }}>
              <ControlRow keys="WASD / Arrows" action="Move" />
              <ControlRow keys="Space / Enter" action="Talk / Interact" />
              <ControlRow keys="Click / Tap" action="Walk to location" />
              <ControlRow keys="M" action="World Map" />
              <ControlRow keys="B" action="Open Bag" />
              <ControlRow keys="ESC" action="Pause Menu" />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, letterSpacing: "0.15em", color: "var(--color-dialog-shadow)", marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, active, onToggle }: {
  label: string; description: string; active: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--color-dialog-shadow)" }}>
      <div>
        <div style={{ fontSize: 12 }}>{label}</div>
        <div style={{ fontSize: 10, opacity: 0.6 }}>{description}</div>
      </div>
      <button onClick={onToggle} style={{
        width: 40, height: 22, borderRadius: 11,
        background: active ? "var(--color-primary)" : "#1a2a3a",
        border: `1px solid ${active ? "var(--color-primary)" : "#2a3a50"}`,
        position: "relative", cursor: "pointer", transition: "all 0.2s",
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          background: "#fff", position: "absolute", top: 2,
          left: active ? 21 : 3, transition: "left 0.2s",
        }} />
      </button>
    </div>
  );
}

function ControlRow({ keys, action }: { keys: string; action: string }) {
  return (
    <>
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "var(--color-primary)" }}>{keys}</div>
      <div style={{ fontSize: 11, opacity: 0.7 }}>{action}</div>
    </>
  );
}
