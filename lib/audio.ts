// Web Audio API sound engine — no files, pure synthesis.
// Generates all game sounds and background music programmatically.

let ctx: AudioContext | null = null;
let muted = false;

// ─── Master gain (controls BGM volume globally) ─────────────────
let masterGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function getMaster(): GainNode | null {
  getCtx();
  return masterGain;
}

export function setMuted(m: boolean) {
  muted = m;
  if (typeof localStorage !== "undefined") localStorage.setItem("pq_muted", m ? "1" : "0");
  if (masterGain) masterGain.gain.value = m ? 0 : 1;
  if (m) stopBGM(); else resumeBGM();
}

export function isMuted(): boolean { return muted; }

export function loadMutePref() {
  if (typeof localStorage !== "undefined") {
    muted = localStorage.getItem("pq_muted") === "1";
  }
  return muted;
}

// ─── SFX tone helper ────────────────────────────────────────────
function tone(
  frequency: number, duration: number,
  volume = 0.3, type: OscillatorType = "square", delay = 0,
  dest?: AudioNode,
) {
  const c = getCtx();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(dest ?? c.destination);
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
      tone(220, 0.04, 0.06, "square");
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
      [392, 440, 494, 523, 587, 659, 698, 784].forEach((f, i) => {
        tone(f, 0.12, 0.3, "square", i * 0.1);
      });
      break;
    case "badge":
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
      [196, 262, 330, 392, 494, 659].forEach((f, i) => {
        tone(f, 0.08, 0.2, "sine", i * 0.06);
      });
      break;
  }
}

// ─── BGM engine ────────────────────────────────────────────────
// Looping background music built entirely from Web Audio API oscillators.
// Each zone has a distinct mood: melody notes, bass line, beat pattern.
// All sequences loop via recursive setTimeout scheduling.

interface BgmTrack {
  melody: number[];    // note frequencies (0 = rest)
  bass: number[];      // bass line frequencies (0 = rest)
  tempo: number;       // ms per beat
  melodyVol: number;
  bassVol: number;
  melodyType: OscillatorType;
  bassType: OscillatorType;
  swing: boolean;      // slight swing/shuffle timing
}

// Zone ground → BGM track definition
const BGM_TRACKS: Record<string, BgmTrack> = {
  // HOME — gentle lullaby, slow, soft
  grass: {
    melody: [523, 587, 659, 698, 659, 587, 523, 494, 523, 0, 440, 494, 523, 587, 523, 0],
    bass:   [262, 0, 294, 0, 330, 0, 294, 0, 262, 0, 220, 0, 262, 0, 0, 0],
    tempo: 320, melodyVol: 0.09, bassVol: 0.06,
    melodyType: "triangle", bassType: "sine", swing: false,
  },
  // SAND — Pune morning, upbeat folk
  sand: {
    melody: [659, 698, 784, 659, 587, 523, 587, 659, 698, 784, 880, 784, 698, 659, 0, 0],
    bass:   [330, 0, 349, 0, 392, 0, 330, 0, 294, 0, 330, 0, 349, 0, 330, 0],
    tempo: 260, melodyVol: 0.1, bassVol: 0.07,
    melodyType: "square", bassType: "triangle", swing: true,
  },
  // STONE — brick, grounded, real-estate ops feel
  stone: {
    melody: [392, 440, 392, 370, 392, 415, 392, 0, 349, 392, 415, 392, 370, 349, 330, 0],
    bass:   [196, 0, 196, 0, 220, 0, 196, 0, 175, 0, 196, 0, 220, 0, 196, 0],
    tempo: 300, melodyVol: 0.08, bassVol: 0.07,
    melodyType: "square", bassType: "sawtooth", swing: false,
  },
  // NEON — synthwave AI lab, driving pulse
  neon: {
    melody: [880, 0, 988, 0, 1047, 0, 988, 880, 0, 784, 0, 880, 0, 988, 0, 0],
    bass:   [110, 110, 0, 0, 147, 147, 0, 0, 110, 110, 0, 0, 123, 123, 0, 0],
    tempo: 200, melodyVol: 0.1, bassVol: 0.09,
    melodyType: "sawtooth", bassType: "sawtooth", swing: false,
  },
  // DUSK — venture capital, sophisticated, minor key
  dusk: {
    melody: [622, 0, 554, 0, 466, 0, 554, 0, 622, 0, 698, 622, 554, 0, 466, 0],
    bass:   [311, 0, 0, 277, 233, 0, 0, 277, 311, 0, 349, 0, 311, 0, 233, 0],
    tempo: 280, melodyVol: 0.09, bassVol: 0.07,
    melodyType: "triangle", bassType: "sine", swing: true,
  },
  // NIGHT — Iterate HQ, atmospheric, sparse
  night: {
    melody: [784, 0, 0, 698, 0, 0, 784, 0, 880, 0, 784, 0, 698, 0, 0, 0],
    bass:   [196, 0, 0, 0, 220, 0, 0, 0, 196, 0, 0, 0, 175, 0, 0, 0],
    tempo: 350, melodyVol: 0.08, bassVol: 0.06,
    melodyType: "triangle", bassType: "sine", swing: false,
  },
  // MALL — SoleSearch, bright pop energy
  mall: {
    melody: [1047, 988, 880, 988, 1047, 0, 880, 0, 784, 880, 988, 1047, 988, 880, 784, 0],
    bass:   [262, 0, 294, 0, 330, 0, 294, 0, 262, 0, 220, 0, 262, 294, 0, 0],
    tempo: 220, melodyVol: 0.1, bassVol: 0.08,
    melodyType: "square", bassType: "triangle", swing: true,
  },
  // CRYPTO — Fere.ai, bass-heavy, tense
  crypto: {
    melody: [440, 0, 415, 0, 370, 0, 392, 0, 440, 0, 466, 440, 415, 0, 370, 0],
    bass:   [55, 55, 0, 55, 0, 55, 55, 0, 55, 55, 0, 55, 0, 55, 55, 0],
    tempo: 230, melodyVol: 0.09, bassVol: 0.1,
    melodyType: "sawtooth", bassType: "sawtooth", swing: false,
  },
  // STUDIO — CCD, lo-fi warmth, jazz-adjacent
  studio: {
    melody: [698, 0, 659, 0, 622, 0, 659, 698, 0, 784, 0, 698, 659, 0, 622, 0],
    bass:   [349, 0, 330, 0, 311, 0, 330, 0, 349, 0, 392, 0, 349, 0, 330, 0],
    tempo: 290, melodyVol: 0.09, bassVol: 0.07,
    melodyType: "triangle", bassType: "sine", swing: true,
  },
  // SNOW (unused ground but handle gracefully)
  snow: {
    melody: [659, 0, 587, 0, 523, 0, 587, 0, 659, 0, 698, 0, 659, 0, 587, 0],
    bass:   [330, 0, 294, 0, 262, 0, 294, 0, 330, 0, 349, 0, 330, 0, 294, 0],
    tempo: 340, melodyVol: 0.07, bassVol: 0.05,
    melodyType: "triangle", bassType: "sine", swing: false,
  },
};

// ─── Battle music track ─────────────────────────────────────────
const BATTLE_TRACK: BgmTrack = {
  melody: [784, 0, 880, 784, 698, 784, 0, 880, 988, 0, 880, 784, 698, 784, 0, 0,
           784, 880, 784, 0, 698, 0, 784, 880, 988, 880, 784, 698, 659, 698, 0, 0],
  bass:   [196, 0, 0, 196, 0, 220, 0, 0, 247, 0, 0, 220, 0, 196, 0, 0,
           196, 0, 220, 0, 196, 0, 247, 0, 196, 0, 220, 0, 196, 220, 0, 0],
  tempo: 175, melodyVol: 0.12, bassVol: 0.1,
  melodyType: "square", bassType: "sawtooth", swing: false,
};

// ─── BGM player state ───────────────────────────────────────────
let bgmTimer: ReturnType<typeof setTimeout> | null = null;
let bgmGain: GainNode | null = null;
let currentBgmId: string | null = null;
let bgmActive = false;
let bgmBeat = 0;
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
  if (!bgmActive || muted) return;
  const c = getCtx();
  if (!c || !bgmGain) return;

  const beat = bgmBeat % track.melody.length;
  const swingOffset = track.swing && beat % 2 === 1 ? track.tempo * 0.06 : 0;
  const beatDur = (track.tempo + swingOffset) / 1000;

  // Melody note
  const mFreq = track.melody[beat];
  if (mFreq > 0) {
    const osc = c.createOscillator();
    const g = c.createGain();
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

  // Bass note — plays every 2 beats for thickness
  const bFreq = track.bass[beat];
  if (bFreq > 0) {
    const osc = c.createOscillator();
    const g = c.createGain();
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

  stopBgmTimer();
  bgmActive = true;
  bgmBeat = 0;
  currentTrack = track;
  currentBgmId = trackId;

  if (!bgmGain) {
    bgmGain = c.createGain();
    bgmGain.connect(getMaster() ?? c.destination);
  }

  bgmGain.gain.cancelScheduledValues(c.currentTime);
  bgmGain.gain.setValueAtTime(0, c.currentTime);
  bgmGain.gain.linearRampToValueAtTime(1, c.currentTime + fadeInMs / 1000);

  scheduleBeat(track);
}

export function stopBGM(fadeOutMs = 400) {
  bgmActive = false;
  stopBgmTimer();
  fadeBgmGain(0, fadeOutMs);
  setTimeout(() => { currentBgmId = null; }, fadeOutMs + 50);
}

export function resumeBGM() {
  if (muted || !currentTrack || bgmActive) return;
  bgmActive = true;
  scheduleBeat(currentTrack);
}

// ─── Public BGM API ─────────────────────────────────────────────
type ZoneGround = "grass" | "sand" | "stone" | "neon" | "dusk" | "night" | "mall" | "crypto" | "studio" | "snow";

// Per-zone unique BGM overrides — zones that share a ground type
// get their own distinct melody so no two zones ever sound the same.
const ZONE_BGM_OVERRIDES: Partial<Record<string, BgmTrack>> = {
  // Home (grass) — gentle, nostalgic lullaby
  home: BGM_TRACKS.grass,

  // Origin (sand) — scrappy, upbeat builder energy
  origin: BGM_TRACKS.sand,

  // GRP (grass) — busier than home, market energy, upbeat
  grp: {
    melody: [784, 880, 784, 698, 784, 880, 988, 880, 784, 698, 659, 698, 784, 0, 659, 0],
    bass:   [392, 0, 440, 0, 392, 0, 349, 0, 392, 0, 330, 0, 392, 0, 330, 0],
    tempo: 245, melodyVol: 0.1, bassVol: 0.07,
    melodyType: "square", bassType: "triangle", swing: true,
  },

  // Hab (stone) — heavy, operational, rhythmic
  hab: BGM_TRACKS.stone,

  // AI / Quartic (neon) — synthwave, driving
  ai: BGM_TRACKS.neon,

  // Investopad (dusk) — sophisticated, minor key VC vibes
  investopad: BGM_TRACKS.dusk,

  // SoleSearch (mall) — hype, pop energy
  sole: BGM_TRACKS.mall,

  // Fere (crypto) — tense, bass-heavy trading floor
  fere: BGM_TRACKS.crypto,

  // CCD (studio) — lo-fi warmth, jazz-adjacent
  ccd: BGM_TRACKS.studio,

  // Iterate (night) — unique final zone: sparse, forward-looking
  iterate: {
    melody: [988, 0, 0, 880, 0, 784, 0, 880, 988, 0, 880, 0, 0, 784, 0, 0,
             880, 0, 784, 0, 698, 0, 784, 880, 988, 0, 0, 880, 784, 0, 0, 0],
    bass:   [247, 0, 0, 0, 262, 0, 0, 0, 247, 0, 0, 0, 220, 0, 0, 0,
             233, 0, 0, 0, 196, 0, 0, 0, 247, 0, 0, 0, 220, 0, 0, 0],
    tempo: 330, melodyVol: 0.09, bassVol: 0.065,
    melodyType: "triangle", bassType: "sine", swing: false,
  },
};

export function playZoneBGM(ground: ZoneGround, zoneId?: string) {
  if (muted) return;
  // Use zone-specific track if available, fall back to ground type
  const trackId = zoneId ? `zone:${zoneId}` : `zone:${ground}`;
  if (currentBgmId === trackId && bgmActive) return;
  const track = (zoneId !== undefined ? ZONE_BGM_OVERRIDES[zoneId] : undefined) ?? BGM_TRACKS[ground] ?? BGM_TRACKS.grass;
  startTrack(track, trackId, 500);
}

export function playBattleBGM() {
  if (muted) return;
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
