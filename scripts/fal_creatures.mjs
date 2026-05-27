#!/usr/bin/env node
import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { join } from "path";

fal.config({ credentials: process.env.FAL_KEY });

const SHARED = "GBA Pokemon FireRed style creature sprite, 96x96 pixel art, single shadow tone cel shading, bold black outlines, no anti-aliasing, crisp pixel edges, transparent background, centered single creature, standing pose facing camera three-quarter view, no text, no UI";

const CREATURES = [
  { id: "grp",        prompt: `${SHARED}, mint green merchant blob creature named LongTail, round chubby body, two cute shopping cart wheels for feet, two long curly antennae each tipped with a yellow price tag, big magnifying glass eye on face, catalog scroll markings on body, cheerful merchant grin, mint green and forest green palette` },
  { id: "hab",        prompt: `${SHARED}, sturdy brown rhino-rock creature named Habby, brick-pattern skin texture, small apartment window decorations along its back, single horn with tiny brass key hanging from it, terracotta orange and brown palette, reliable heavy stance, square brick markings on flanks` },
  { id: "ai",         prompt: `${SHARED}, glowing cyan robot-spirit creature named Quartic, sleek floating body slightly off ground, holographic circuit board wing patterns extending sideways, large digital eye with green scanline pulse pattern, neon blue body glow, electric cyan trails behind it, futuristic chatbot AI vibe` },
  { id: "investopad", prompt: `${SHARED}, elegant purple falcon creature named Termsheet, sharp regal pose, wings spread showing term-sheet paper texture with gold ink lines, gold monocle over one eye, sharp talons gripping a tiny scroll, deep violet purple and gold palette, confident VC pose` },
  { id: "sole",       prompt: `${SHARED}, cool pink streetwear cat-lynx creature named Solecat, four paws each wearing fresh white sneakers with pink laces, pink hoodie pattern markings on body, gold chain necklace, graffiti tag fur markings, hot pink and white palette, hip-hop confident pose` },
  { id: "fere",       prompt: `${SHARED}, mysterious green ghost-orb creature named Ferebot, glowing translucent green orb body floating slightly, single autonomous floating eye core in center, candlestick crypto chart patterns trailing behind it like ribbons, matrix green and black palette, blockchain trader vibe` },
  { id: "ccd",        prompt: `${SHARED}, golden dancing cat creature named Disco, joyful spinning dance pose on hind legs, vinyl record disc as the tip of its tail, music note shaped ear tufts, disco ball reflection sparkles on golden fur, tiny paw holding a small microphone, warm amber gold palette` },
  { id: "iterate",    prompt: `${SHARED}, powerful champion star-core creature named Iterate, six glowing arms extending outward in a star formation, central rotating core with white energy reactor, holographic code text orbiting around body, electric blue and white palette, intense glowing eyes commanding presence, final boss zone aura` },
];

const OUT = "public/sprites/creatures";
const PREV = "public/sprites/_preview";
mkdirSync(OUT, { recursive: true });

async function gen(id, prompt) {
  console.log(`[${id}]`);
  const r = await fal.subscribe("fal-ai/flux/schnell", {
    input: { prompt, image_size: { width: 1024, height: 1024 }, num_inference_steps: 4, num_images: 1, enable_safety_checker: false },
  });
  const url = r.data?.images?.[0]?.url;
  const rawBuf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(join(PREV, `${id}_raw.png`), rawBuf);

  let cutUrl;
  try {
    const cut = await fal.subscribe("fal-ai/birefnet/v2", { input: { image_url: url } });
    cutUrl = cut.data?.image?.url || cut.data?.images?.[0]?.url;
  } catch (e) { console.log(`  bg-rem failed: ${e.message}`); }

  const finalBuf = cutUrl
    ? Buffer.from(await (await fetch(cutUrl)).arrayBuffer())
    : rawBuf;
  writeFileSync(join(OUT, `${id}.png`), finalBuf);
  writeFileSync(join(PREV, `${id}.png`), finalBuf);
  console.log(`  ✓`);
}

(async () => {
  for (const c of CREATURES) await gen(c.id, c.prompt);

  if (existsSync(join(PREV, "origin.png"))) {
    copyFileSync(join(PREV, "origin.png"), join(OUT, "origin.png"));
    console.log(`✓ origin copied to creatures dir`);
  }
  console.log("done");
})().catch(e => { console.error(e); process.exit(1); });
