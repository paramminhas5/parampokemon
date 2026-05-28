// Sprite registry — all paths resolve to /public/sprites/ in Next.js.
// FAL-generated PNG sprites — Param the human as player, Mermander line as follower.

import type { LeaderSprite } from "./data";

export const LEADER_URL: Record<LeaderSprite, string> = {
  blankpage:  "/sprites/leaders/blankpage.png",
  longtail:   "/sprites/leaders/longtail.png",
  zerorunway: "/sprites/leaders/zerorunway.png",
  prehype:    "/sprites/leaders/prehype.png",
  termsheet:  "/sprites/leaders/termsheet.png",
  noculture:  "/sprites/leaders/noculture.png",
  blackbox:   "/sprites/leaders/blackbox.png",
  nobrief:    "/sprites/leaders/nobrief.png",
  statusquo:  "/sprites/leaders/statusquo.png",
};

export const CREATURE_URL: Record<string, string> = {
  origin:     "/sprites/creatures/origin.png",
  grp:        "/sprites/creatures/grp.png",
  hab:        "/sprites/creatures/hab.png",
  ai:         "/sprites/creatures/ai.png",
  investopad: "/sprites/creatures/investopad.png",
  sole:       "/sprites/creatures/sole.png",
  fere:       "/sprites/creatures/fere.png",
  ccd:        "/sprites/creatures/ccd.png",
  iterate:    "/sprites/creatures/iterate.png",
};

// ─── Param (human player) — same sprite regardless of evolution stage ─────
// The player is always Param. The follower changes as Mermander evolves.
export const PARAM_SPRITE_URL = {
  front: "/sprites/player/param_front.png",
  back:  "/sprites/player/param_back.png",
  left:  "/sprites/player/param_left.png",
  right: "/sprites/player/param_right.png",
};

// ─── Follower (Mermander line overworld sprites) ──────────────────────────
export const FOLLOWER_SPRITE_URL: Record<string, string> = {
  mermander: "/sprites/player/mermander_front.png",
  mermalion: "/sprites/player/mermalion_front.png",
  merlord:   "/sprites/player/merlord_front.png",
};
export const FOLLOWER_BACK_URL: Record<string, string> = {
  mermander: "/sprites/player/mermander_back.png",
  mermalion: "/sprites/player/mermalion_back.png",
  merlord:   "/sprites/player/merlord_back.png",
};
export const FOLLOWER_LEFT_URL: Record<string, string> = {
  mermander: "/sprites/player/mermander_left.png",
  mermalion: "/sprites/player/mermalion_left.png",
  merlord:   "/sprites/player/merlord_left.png",
};
export const FOLLOWER_RIGHT_URL: Record<string, string> = {
  mermander: "/sprites/player/mermander_right.png",
  mermalion: "/sprites/player/mermalion_right.png",
  merlord:   "/sprites/player/merlord_right.png",
};

// ─── Battle back sprites (what opponent sees when Param sends out creature) ─
export const PLAYER_BACK_URL: Record<string, string> = {
  mermander: "/sprites/player/mermander_battle_back.png",
  mermalion: "/sprites/player/mermalion_battle_back.png",
  merlord:   "/sprites/player/merlord_battle_back.png",
};

// Legacy aliases kept for Battle.tsx compatibility
export const PLAYER_SPRITE_URL = FOLLOWER_SPRITE_URL;
export const PLAYER_LEFT_URL   = FOLLOWER_LEFT_URL;
export const PLAYER_RIGHT_URL  = FOLLOWER_RIGHT_URL;

export const LANDMARK_URL: Record<string, string> = {
  home:       "/sprites/landmarks/home.png",
  origin:     "/sprites/landmarks/origin.png",
  grp:        "/sprites/landmarks/grp.png",
  hab:        "/sprites/landmarks/hab.png",
  ai:         "/sprites/landmarks/ai.png",
  investopad: "/sprites/landmarks/investopad.png",
  sole:       "/sprites/landmarks/sole.png",
  fere:       "/sprites/landmarks/fere.png",
  ccd:        "/sprites/landmarks/ccd.png",
  iterate:    "/sprites/landmarks/iterate.png",
};

export const POKEBALL_URL = "/sprites/ui/pokeball.png";

// ─── Image loader cache ───────────────────────────────────────
const cache = new Map<string, HTMLImageElement>();

export function getSprite(url: string): HTMLImageElement {
  let img = cache.get(url);
  if (img) return img;
  img = new Image();
  img.src = url;
  cache.set(url, img);
  return img;
}

export function isReady(img: HTMLImageElement): boolean {
  return img.complete && img.naturalWidth > 0;
}

if (typeof window !== "undefined") {
  Object.values(LEADER_URL).forEach(getSprite);
  Object.values(CREATURE_URL).forEach(getSprite);
  Object.values(LANDMARK_URL).forEach(getSprite);
  Object.values(PARAM_SPRITE_URL).forEach(getSprite);
  Object.values(FOLLOWER_SPRITE_URL).forEach(getSprite);
  Object.values(FOLLOWER_BACK_URL).forEach(getSprite);
  Object.values(FOLLOWER_LEFT_URL).forEach(getSprite);
  Object.values(FOLLOWER_RIGHT_URL).forEach(getSprite);
  Object.values(PLAYER_BACK_URL).forEach(getSprite);
  getSprite(POKEBALL_URL);
}

export function preloadAllSprites(): Promise<void> {
  const urls = [
    ...Object.values(LEADER_URL),
    ...Object.values(CREATURE_URL),
    ...Object.values(LANDMARK_URL),
    ...Object.values(PARAM_SPRITE_URL),
    ...Object.values(FOLLOWER_SPRITE_URL),
    ...Object.values(FOLLOWER_BACK_URL),
    ...Object.values(FOLLOWER_LEFT_URL),
    ...Object.values(FOLLOWER_RIGHT_URL),
    ...Object.values(PLAYER_BACK_URL),
    POKEBALL_URL,
  ];
  return new Promise((resolve) => {
    let remaining = urls.length;
    if (remaining === 0) { resolve(); return; }
    const done = () => { if (--remaining <= 0) resolve(); };
    for (const u of urls) {
      const img = getSprite(u);
      if (isReady(img)) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    }
    setTimeout(resolve, 5000);
  });
}
