// Web Audio sound engine — powered by Howler.js for audio context management,
// mobile unlock, and global volume/mute control.
// All sounds are synthesized via Web Audio API oscillators (no audio files).
// Howler provides: automatic mobile AudioContext unlock, global mute, master gain.

import { Howler } from "howler";

// ─── Howler bootstrap ───────────────────────────────────────────
// Touching Howler.ctx forces it to create + unlock the AudioContext
// on first user interaction. We wire our synth nodes through it.
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  // Howler lazily creates its AudioContext on first access
  const ctx = Howler.ctx as AudioContext | null;
  if (!ctx) return null;
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// Ensure Howler's AudioContext exists by creating a silent placeholder sound.
// Called on first user interaction so mobile browsers unlock audio.
let _bootstrapped = false;
function bootstrap() {
  if (_bootstrapped || typeof window === "undefined") return;
  _bootstrapped = true;
  // Warm up Howler's AudioContext without playing any audible sound
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Howler as any)._setupAudioContext?.();
  } catch {
    // Howler may not expose this — that's fine, ctx is created on first Howl
  }
}

// ─── Mute / volume — delegated entirely to Howler ───────────────
let _muted = false;

export function setMuted(m: boolean) {
  _muted = m;
  if (typeof localStorage !== "undefined") localStorage.setItem("pq_muted", m ? "1" : "0");
  Howler.mute(m);
  if (m) stopBGM(); else resumeBGM();
}

export function isMuted(): boolean { return _muted; }

export function loadMutePref() {
  if (typeof localStorage !== "undefined") {
    _muted = localStorage.getItem("pq_muted") === "1";
  }
  Howler.mute(_muted);
  return _muted;
}

// ─── Master gain helper ─────────────────────────────────────────
// Howler exposes masterGain — we connect our BGM gain chain through it
// so global mute/volume controls everything uniformly.
function getMasterGain(): GainNode | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (Howler as any).masterGain as GainNode | null ?? null;
}

// ─── SFX tone helper ────────────────────────────────────────────
// All SFX are pure oscillator synthesis — Howler manages the AudioContext
// so mobile unlock happens automatically before any tone plays.
function tone(
  frequency: number,
  duration: number,
  volume = 0.3,
  type: OscillatorType = "square",
  delay = 0,
  dest?: AudioNode,
) {
  bootstrap();
  const c = getCtx();
  if (!c || _muted) return;
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  // Route through Howler master gain so global mute/volume applies
  gain.connect(dest ?? getMasterGain() ?? c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, c.currentTime + delay);
  gain.gain.setValueAtTime(0,      c.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  osc.start(c.currentTime + delay);
  osc.stop( c.currentTime + delay + duration + 0.01);
}

type SoundName =
  | "step" | "hit" | "super" | "crit" | "victory"
  | "badge" | "catch" | "faint" | "menu" | "warp" | "hptick" | "evolve";

export function playSound(name: SoundName) {
  if (_muted) return;
  bootstrap();
  switch (name) {
    case "step":
      tone(220, 0.04, 0.06, "square");
      break;
    case "hit":
      tone(180, 0.12, 0.25, "sawtooth");
      tone(140, 0.08, 0.20, "square", 0.05);
      break;
    case "super":
      tone(440, 0.08, 0.30, "square");
      tone(660, 0.08, 0.30, "square", 0.10);
      tone(880, 0.12, 0.25, "square", 0.20);
      break;
    case "crit":
      tone(660,  0.06, 0.40, "square");
      tone(880,  0.06, 0.40, "square", 0.06);
      tone(1100, 0.10, 0.35, "square", 0.12);
      break;
    case "victory":
      [392, 440, 494, 523, 587, 659, 698, 784].forEach((f, i) => {
        tone(f, 0.12, 0.30, "square", i * 0.10);
      });
      break;
    case "badge":
      [523, 659, 784, 1047].forEach((f, i) => {
        tone(f, 0.15, 0.35, "square", i * 0.12);
      });
      break;
    case "catch":
      tone(330, 0.08, 0.30, "square");
      tone(262, 0.08, 0.30, "square", 0.12);
      tone(330, 0.20, 0.25, "square", 0.24);
      break;
    case "faint":
      tone(440, 0.10, 0.30, "sawtooth");
      tone(330, 0.10, 0.30, "sawtooth", 0.12);
      tone(220, 0.10, 0.30, "sawtooth", 0.24);
      tone(165, 0.30, 0.25, "sawtooth", 0.36);
      break;
    case "menu":
      tone(440, 0.06, 0.15, "square");
      break;
    case "warp":
      [196, 262, 330, 392, 494, 659].forEach((f, i) => {
        tone(f, 0.08, 0.20, "sine", i * 0.06);
      });
      break;
    case "hptick":
      tone(440 + Math.random() * 80, 0.03, 0.02, "square");
      break;
    case "evolve":
      // Ascending triumphant tones — evolution fanfare
      tone(330, 0.15, 0.08, "square");
      setTimeout(() => tone(440, 0.15, 0.08, "square"), 120);
      setTimeout(() => tone(550, 0.15, 0.08, "square"), 240);
      setTimeout(() => tone(660, 0.2, 0.1, "square"), 360);
      setTimeout(() => tone(880, 0.3, 0.15, "sawtooth"), 500);
      setTimeout(() => tone(1100, 0.25, 0.2, "sawtooth"), 650);
      break;
  }
}

// ─── BGM engine ────────────────────────────────────────────────
// Looping background music built entirely from Web Audio API oscillators.
// BGM gain node is connected through Howler's masterGain so global
// mute/volume from Howler applies to BGM automatically.

interface BgmTrack {
  melody:     number[];
  bass:       number[];
  tempo:      number;
  melodyVol:  number;
  bassVol:    number;
  melodyType: OscillatorType;
  bassType:   OscillatorType;
  swing:      boolean;
}

const BGM_TRACKS: Record<string, BgmTrack> = {
  grass: {
    melody: [523,587,659,698,659,587,523,494,523,0,440,494,523,587,523,0],
    bass:   [262,0,294,0,330,0,294,0,262,0,220,0,262,0,0,0],
    tempo: 320, melodyVol: 0.09, bassVol: 0.06,
    melodyType: "triangle", bassType: "sine", swing: false,
  },
  sand: {
    melody: [659,698,784,659,587,523,587,659,698,784,880,784,698,659,0,0],
    bass:   [330,0,349,0,392,0,330,0,294,0,330,0,349,0,330,0],
    tempo: 260, melodyVol: 0.10, bassVol: 0.07,
    melodyType: "square", bassType: "triangle", swing: true,
  },
  stone: {
    melody: [392,440,392,370,392,415,392,0,349,392,415,392,370,349,330,0],
    bass:   [196,0,196,0,220,0,196,0,175,0,196,0,220,0,196,0],
    tempo: 300, melodyVol: 0.08, bassVol: 0.07,
    melodyType: "square", bassType: "sawtooth", swing: false,
  },
  neon: {
    melody: [880,0,988,0,1047,0,988,880,0,784,0,880,0,988,0,0],
    bass:   [110,110,0,0,147,147,0,0,110,110,0,0,123,123,0,0],
    tempo: 200, melodyVol: 0.10, bassVol: 0.09,
    melodyType: "sawtooth", bassType: "sawtooth", swing: false,
  },
  dusk: {
    melody: [622,0,554,0,466,0,554,0,622,0,698,622,554,0,466,0],
    bass:   [311,0,0,277,233,0,0,277,311,0,349,0,311,0,233,0],
    tempo: 280, melodyVol: 0.09, bassVol: 0.07,
    melodyType: "triangle", bassType: "sine", swing: true,
  },
  night: {
    melody: [784,0,0,698,0,0,784,0,880,0,784,0,698,0,0,0],
    bass:   [196,0,0,0,220,0,0,0,196,0,0,0,175,0,0,0],
    tempo: 350, melodyVol: 0.08, bassVol: 0.06,
    melodyType: "triangle", bassType: "sine", swing: false,
  },
  mall: {
    melody: [1047,988,880,988,1047,0,880,0,784,880,988,1047,988,880,784,0],
    bass:   [262,0,294,0,330,0,294,0,262,0,220,0,262,294,0,0],
    tempo: 220, melodyVol: 0.10, bassVol: 0.08,
    melodyType: "square", bassType: "triangle", swing: true,
  },
  crypto: {
    melody: [440,0,415,0,370,0,392,0,440,0,466,440,415,0,370,0],
    bass:   [55,55,0,55,0,55,55,0,55,55,0,55,0,55,55,0],
    tempo: 230, melodyVol: 0.09, bassVol: 0.10,
    melodyType: "sawtooth", bassType: "sawtooth", swing: false,
  },
  studio: {
    melody: [698,0,659,0,622,0,659,698,0,784,0,698,659,0,622,0],
    bass:   [349,0,330,0,311,0,330,0,349,0,392,0,349,0,330,0],
    tempo: 290, melodyVol: 0.09, bassVol: 0.07,
    melodyType: "triangle", bassType: "sine", swing: true,
  },
  snow: {
    melody: [659,0,587,0,523,0,587,0,659,0,698,0,659,0,587,0],
    bass:   [330,0,294,0,262,0,294,0,330,0,349,0,330,0,294,0],
    tempo: 340, melodyVol: 0.07, bassVol: 0.05,
    melodyType: "triangle", bassType: "sine", swing: false,
  },
};

const BATTLE_TRACK: BgmTrack = {
  melody: [784,0,880,784,698,784,0,880,988,0,880,784,698,784,0,0,
           784,880,784,0,698,0,784,880,988,880,784,698,659,698,0,0],
  bass:   [196,0,0,196,0,220,0,0,247,0,0,220,0,196,0,0,
           196,0,220,0,196,0,247,0,196,0,220,0,196,220,0,0],
  tempo: 175, melodyVol: 0.12, bassVol: 0.10,
  melodyType: "square", bassType: "sawtooth", swing: false,
};

const ZONE_BGM_OVERRIDES: Partial<Record<string, BgmTrack>> = {
  home:   BGM_TRACKS.grass,
  origin: BGM_TRACKS.sand,
  grp: {
    melody: [784,880,784,698,784,880,988,880,784,698,659,698,784,0,659,0],
    bass:   [392,0,440,0,392,0,349,0,392,0,330,0,392,0,330,0],
    tempo: 245, melodyVol: 0.10, bassVol: 0.07,
    melodyType: "square", bassType: "triangle", swing: true,
  },
  hab:        BGM_TRACKS.stone,
  ai:         BGM_TRACKS.neon,
  investopad: BGM_TRACKS.dusk,
  sole:       BGM_TRACKS.mall,
  fere:       BGM_TRACKS.crypto,
  ccd:        BGM_TRACKS.studio,
  iterate: {
    melody: [988,0,0,880,0,784,0,880,988,0,880,0,0,784,0,0,
             880,0,784,0,698,0,784,880,988,0,0,880,784,0,0,0],
    bass:   [247,0,0,0,262,0,0,0,247,0,0,0,220,0,0,0,
             233,0,0,0,196,0,0,0,247,0,0,0,220,0,0,0],
    tempo: 330, melodyVol: 0.09, bassVol: 0.065,
    melodyType: "triangle", bassType: "sine", swing: false,
  },
};

// ─── BGM player state ───────────────────────────────────────────
let bgmTimer:    ReturnType<typeof setTimeout> | null = null;
let bgmGain:     GainNode | null = null;
let currentBgmId: string | null  = null;
let bgmActive    = false;
let bgmBeat      = 0;
let currentTrack: BgmTrack | null = null;

function stopBgmTimer() {
  if (bgmTimer !== null) { clearTimeout(bgmTimer); bgmTimer = null; }
}

function fadeBgmGain(targetVol: number, durationMs = 300) {
  const c = getCtx();
  if (!c || !bgmGain) return;
  const now = c.currentTime;
  bgmGain.gain.cancelScheduledValues(now);
  bgmGain.gain.setValueAtTime(bgmGain.gain.value, now);
  bgmGain.gain.linearRampToValueAtTime(targetVol, now + durationMs / 1000);
}

function scheduleBeat(track: BgmTrack) {
  if (!bgmActive || _muted) return;
  const c = getCtx();
  if (!c || !bgmGain) return;

  const beat        = bgmBeat % track.melody.length;
  const swingOffset = track.swing && beat % 2 === 1 ? track.tempo * 0.06 : 0;
  const beatDur     = (track.tempo + swingOffset) / 1000;

  // Melody note
  const mFreq = track.melody[beat];
  if (mFreq > 0) {
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.connect(g);
    g.connect(bgmGain);
    osc.type = track.melodyType;
    osc.frequency.value = mFreq;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(track.melodyVol, c.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + beatDur * 0.85);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + beatDur);
  }

  // Bass note
  const bFreq = track.bass[beat];
  if (bFreq > 0) {
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.connect(g);
    g.connect(bgmGain);
    osc.type = track.bassType;
    osc.frequency.value = bFreq;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(track.bassVol, c.currentTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + beatDur * 1.2);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + beatDur * 1.3);
  }

  bgmBeat++;
  bgmTimer = setTimeout(() => scheduleBeat(track), track.tempo + swingOffset);
}

function startTrack(track: BgmTrack, trackId: string, fadeInMs = 400) {
  const c = getCtx();
  if (!c) return;

  // Crossfade: if already playing, fade out first
  if (bgmActive && bgmGain) {
    fadeBgmGain(0, Math.min(fadeInMs, 300));
  }

  stopBgmTimer();
  bgmActive    = true;
  bgmBeat      = 0;
  currentTrack = track;
  currentBgmId = trackId;

  if (!bgmGain) {
    bgmGain = c.createGain();
    // Connect through Howler's masterGain so Howler.mute() silences BGM too
    bgmGain.connect(getMasterGain() ?? c.destination);
  }

  // Delay the new track start slightly so the fade-out has time to progress
  const crossfadeDelay = bgmGain.gain.value > 0.1 ? 150 : 0;

  setTimeout(() => {
    if (!bgmActive || _muted) return;
    const ctx = getCtx();
    if (!ctx || !bgmGain) return;
    bgmGain.gain.cancelScheduledValues(ctx.currentTime);
    bgmGain.gain.setValueAtTime(0, ctx.currentTime);
    bgmGain.gain.linearRampToValueAtTime(1, ctx.currentTime + fadeInMs / 1000);
    scheduleBeat(track);
  }, crossfadeDelay);
}

export function stopBGM(fadeOutMs = 400) {
  bgmActive = false;
  stopBgmTimer();
  fadeBgmGain(0, fadeOutMs);
  setTimeout(() => { currentBgmId = null; }, fadeOutMs + 50);
}

export function resumeBGM() {
  if (_muted || !currentTrack || bgmActive) return;
  bgmActive = true;
  scheduleBeat(currentTrack);
}

// ─── Public BGM API ─────────────────────────────────────────────
type ZoneGround = "grass" | "sand" | "stone" | "neon" | "dusk" | "night" | "mall" | "crypto" | "studio" | "snow";

export function playZoneBGM(ground: ZoneGround, zoneId?: string) {
  if (_muted) return;
  bootstrap();
  const trackId = zoneId ? `zone:${zoneId}` : `zone:${ground}`;
  if (currentBgmId === trackId && bgmActive) return;
  const track = (zoneId !== undefined ? ZONE_BGM_OVERRIDES[zoneId] : undefined)
    ?? BGM_TRACKS[ground]
    ?? BGM_TRACKS.grass;
  startTrack(track, trackId, 500);
}

export function playBattleBGM() {
  if (_muted) return;
  bootstrap();
  const trackId = "battle";
  if (currentBgmId === trackId && bgmActive) return;
  startTrack(BATTLE_TRACK, trackId, 200);
}

export function stopBattleBGM(zoneGround?: ZoneGround) {
  stopBGM(300);
  if (zoneGround) {
    setTimeout(() => playZoneBGM(zoneGround), 500);
  }
}
