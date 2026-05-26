// Sprite registry — all paths resolve to /public/sprites/ in Next.js.
// Replace any PNG at the same path; no code change required.

import type { LeaderSprite } from "./data";

// SVG sprites: scalable, crisp at any resolution, no generation required.
// PNG fallbacks remain in place — browser will use SVG if it loads first.

export const LEADER_URL: Record<LeaderSprite, string> = {
  blankpage:  "/sprites/leaders/blankpage.svg",
  longtail:   "/sprites/leaders/longtail.svg",
  zerorunway: "/sprites/leaders/zerorunway.svg",
  prehype:    "/sprites/leaders/prehype.svg",
  termsheet:  "/sprites/leaders/termsheet.svg",
  noculture:  "/sprites/leaders/noculture.svg",
  blackbox:   "/sprites/leaders/blackbox.svg",
  nobrief:    "/sprites/leaders/nobrief.svg",
  statusquo:  "/sprites/leaders/statusquo.svg",
};

export const CREATURE_URL: Record<string, string> = {
  origin:     "/sprites/creatures/origin.svg",
  grp:        "/sprites/creatures/grp.svg",
  hab:        "/sprites/creatures/hab.svg",
  ai:         "/sprites/creatures/ai.svg",
  investopad: "/sprites/creatures/investopad.svg",
  sole:       "/sprites/creatures/sole.svg",
  fere:       "/sprites/creatures/fere.svg",
  ccd:        "/sprites/creatures/ccd.svg",
  iterate:    "/sprites/creatures/iterate.svg",
};

export const PLAYER_SPRITE_URL: Record<string, string> = {
  mermander: "/sprites/player/mermander_front.svg",
  mermalion:  "/sprites/player/mermalion_front.svg",
  merlord:    "/sprites/player/merlord_front.svg",
};
export const PLAYER_BACK_URL: Record<string, string> = {
  mermander: "/sprites/player/mermander_back.svg",
  mermalion:  "/sprites/player/mermalion_back.svg",
  merlord:    "/sprites/player/merlord_back.svg",
};
export const PLAYER_LEFT_URL: Record<string, string> = {
  mermander: "/sprites/player/mermander_left.svg",
  mermalion:  "/sprites/player/mermalion_left.svg",
  merlord:    "/sprites/player/merlord_left.svg",
};
export const PLAYER_RIGHT_URL: Record<string, string> = {
  mermander: "/sprites/player/mermander_right.svg",
  mermalion:  "/sprites/player/mermalion_right.svg",
  merlord:    "/sprites/player/merlord_right.svg",
};

export const LANDMARK_URL: Record<string, string> = {
  home:       "/sprites/landmarks/home.svg",
  origin:     "/sprites/landmarks/origin.svg",
  grp:        "/sprites/landmarks/grp.svg",
  hab:        "/sprites/landmarks/hab.svg",
  ai:         "/sprites/landmarks/ai.svg",
  investopad: "/sprites/landmarks/investopad.svg",
  sole:       "/sprites/landmarks/sole.svg",
  fere:       "/sprites/landmarks/fere.svg",
  ccd:        "/sprites/landmarks/ccd.svg",
  iterate:    "/sprites/landmarks/iterate.svg",
};

export const POKEBALL_URL = "/sprites/ui/pokeball.svg";

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
  Object.values(PLAYER_SPRITE_URL).forEach(getSprite);
  Object.values(PLAYER_BACK_URL).forEach(getSprite);
  Object.values(PLAYER_LEFT_URL).forEach(getSprite);
  Object.values(PLAYER_RIGHT_URL).forEach(getSprite);
  getSprite(POKEBALL_URL);
}

export function preloadAllSprites(): Promise<void> {
  const urls = [
    ...Object.values(LEADER_URL),
    ...Object.values(CREATURE_URL),
    ...Object.values(LANDMARK_URL),
    ...Object.values(PLAYER_SPRITE_URL),
    ...Object.values(PLAYER_BACK_URL),
    ...Object.values(PLAYER_LEFT_URL),
    ...Object.values(PLAYER_RIGHT_URL),
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
    setTimeout(resolve, 4000);
  });
}
