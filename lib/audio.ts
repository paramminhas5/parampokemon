// Web Audio API sound engine — no files, pure synthesis.
// Generates all game sounds programmatically.

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
  if (typeof localStorage !== "undefined") localStorage.setItem("pq_muted", m ? "1" : "0");
}

export function isMuted(): boolean { return muted; }

export function loadMutePref() {
  if (typeof localStorage !== "undefined") {
    muted = localStorage.getItem("pq_muted") === "1";
  }
  return muted;
}

function tone(frequency: number, duration: number, volume = 0.3, type: OscillatorType = "square", delay = 0) {
  const c = getCtx();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, c.currentTime + delay);
  gain.gain.setValueAtTime(0, c.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration + 0.01);
}

type SoundName = "step" | "hit" | "super" | "crit" | "victory" | "badge" | "catch" | "faint" | "menu" | "warp";

export function playSound(name: SoundName) {
  if (muted) return;
  switch (name) {
    case "step":
      tone(220, 0.04, 0.08, "square");
      break;
    case "hit":
      tone(180, 0.12, 0.25, "sawtooth");
      tone(140, 0.08, 0.2, "square", 0.05);
      break;
    case "super":
      tone(440, 0.08, 0.3, "square");
      tone(660, 0.08, 0.3, "square", 0.1);
      tone(880, 0.12, 0.25, "square", 0.2);
      break;
    case "crit":
      tone(660, 0.06, 0.4, "square");
      tone(880, 0.06, 0.4, "square", 0.06);
      tone(1100, 0.1, 0.35, "square", 0.12);
      break;
    case "victory":
      // Ascending fanfare
      [392, 440, 494, 523, 587, 659, 698, 784].forEach((f, i) => {
        tone(f, 0.12, 0.3, "square", i * 0.1);
      });
      break;
    case "badge":
      // Badge collect jingle
      [523, 659, 784, 1047].forEach((f, i) => {
        tone(f, 0.15, 0.35, "square", i * 0.12);
      });
      break;
    case "catch":
      tone(330, 0.08, 0.3, "square");
      tone(262, 0.08, 0.3, "square", 0.12);
      tone(330, 0.2, 0.25, "square", 0.24);
      break;
    case "faint":
      tone(440, 0.1, 0.3, "sawtooth");
      tone(330, 0.1, 0.3, "sawtooth", 0.12);
      tone(220, 0.1, 0.3, "sawtooth", 0.24);
      tone(165, 0.3, 0.25, "sawtooth", 0.36);
      break;
    case "menu":
      tone(440, 0.06, 0.15, "square");
      break;
    case "warp":
      // Ascending whoosh
      [196, 262, 330, 392, 494, 659].forEach((f, i) => {
        tone(f, 0.08, 0.2, "sine", i * 0.06);
      });
      break;
  }
}
