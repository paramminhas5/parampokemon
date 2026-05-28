#!/usr/bin/env node
/**
 * Batch generate all remaining evo line sprites:
 * - mermalion_battle_back, merlord_battle_back
 * - mermander/mermalion/merlord overworld: front, back, left, right (12 sprites)
 * Total: 14 sprites
 */
import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const FAL_KEY = process.env.FAL_KEY;
fal.config({ credentials: FAL_KEY });

const SHARED = "GBA Pokemon FireRed style creature sprite, single shadow tone cel shading, bold black outlines, no anti-aliasing, crisp pixel edges, transparent background, centered single creature, no text, no UI";
const OW = "small overworld walking sprite, 64x64 pixel art, top-down perspective, simple clean shapes";

const MERMANDER = "small chubby aqua water-dragon Mermander, big round head, bright turquoise cyan body, white belly, three-pointed fin crown on head, two small round cheek fins, big expressive eyes, tiny clawed hands, short paddle fin tail, water droplet markings";
const MERMALION = "evolved teenage water-dragon Mermalion, leaner taller build, deep teal body white belly, flowing wave fin mane like a lion around head and neck, swept-back fin ears, confident sharp eyes, four clawed limbs, longer paddle tail with two fin blades, water rune markings";
const MERLORD = "champion final-form water-dragon Merlord, powerful muscular bipedal, deep teal body, gold armored chest plate, three-prong gold crown fin, flowing royal blue and gold cape-like dorsal fins, glowing amber eyes, gold bracers, trident-tipped tail";

const SPRITES = [
  // Battle backs
  { id: "mermalion_battle_back", size: 1024, prompt: `${SHARED}, 96x96 pixel art, ${MERMALION}, facing directly away from camera back view, top-down angle` },
  { id: "merlord_battle_back",   size: 1024, prompt: `${SHARED}, 96x96 pixel art, ${MERLORD}, facing directly away from camera back view showing gold armor and dorsal cape fins, top-down angle` },

  // Mermander overworld 4 dirs
  { id: "mermander_front", size: 512, prompt: `${SHARED}, ${OW}, ${MERMANDER}, facing forward toward camera` },
  { id: "mermander_back",  size: 512, prompt: `${SHARED}, ${OW}, ${MERMANDER}, facing away from camera back view` },
  { id: "mermander_left",  size: 512, prompt: `${SHARED}, ${OW}, ${MERMANDER}, side profile facing left walking` },
  { id: "mermander_right", size: 512, prompt: `${SHARED}, ${OW}, ${MERMANDER}, side profile facing right walking` },

  // Mermalion overworld 4 dirs
  { id: "mermalion_front", size: 512, prompt: `${SHARED}, ${OW}, ${MERMALION}, facing forward toward camera` },
  { id: "mermalion_back",  size: 512, prompt: `${SHARED}, ${OW}, ${MERMALION}, facing away from camera back view` },
  { id: "mermalion_left",  size: 512, prompt: `${SHARED}, ${OW}, ${MERMALION}, side profile facing left walking` },
  { id: "mermalion_right", size: 512, prompt: `${SHARED}, ${OW}, ${MERMALION}, side profile facing right walking` },

  // Merlord overworld 4 dirs
  { id: "merlord_front", size: 512, prompt: `${SHARED}, ${OW}, ${MERLORD}, facing forward toward camera` },
  { id: "merlord_back",  size: 512, prompt: `${SHARED}, ${OW}, ${MERLORD}, facing away from camera back view showing gold armor and cape fins` },
  { id: "merlord_left",  size: 512, prompt: `${SHARED}, ${OW}, ${MERLORD}, side profile facing left walking, gold armor visible` },
  { id: "merlord_right", size: 512, prompt: `${SHARED}, ${OW}, ${MERLORD}, side profile facing right walking, gold armor visible` },
];

const OUT = "public/sprites/player";
const PREV = "public/sprites/_preview";
mkdirSync(OUT, { recursive: true });
mkdirSync(PREV, { recursive: true });

async function gen(id, prompt, size) {
  console.log(`\n[${id}]`);
  const r = await fal.subscribe("fal-ai/flux/schnell", {
    input: { prompt, image_size: { width: size, height: size }, num_inference_steps: 4, num_images: 1, enable_safety_checker: false },
  });
  const url = r.data?.images?.[0]?.url;
  if (!url) throw new Error(`no url for ${id}`);

  // Save raw
  const rawBuf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(join(PREV, `${id}_raw.png`), rawBuf);

  // Background removal
  let cutUrl;
  try {
    const cut = await fal.subscribe("fal-ai/birefnet/v2", { input: { image_url: url } });
    cutUrl = cut.data?.image?.url || cut.data?.images?.[0]?.url;
  } catch (e) {
    console.log(`  birefnet failed: ${e.message}`);
  }

  if (cutUrl) {
    const cutBuf = Buffer.from(await (await fetch(cutUrl)).arrayBuffer());
    writeFileSync(join(OUT, `${id}.png`), cutBuf);
    writeFileSync(join(PREV, `${id}.png`), cutBuf);
    console.log(`  ✓ saved with transparent bg`);
  } else {
    writeFileSync(join(OUT, `${id}.png`), rawBuf);
    writeFileSync(join(PREV, `${id}.png`), rawBuf);
    console.log(`  ✓ saved (raw, no bg removal)`);
  }
}

(async () => {
  console.log(`Generating ${SPRITES.length} sprites...`);
  for (const s of SPRITES) {
    await gen(s.id, s.prompt, s.size);
  }
  console.log("\n✓ All done");
})().catch(e => { console.error(e); process.exit(1); });
