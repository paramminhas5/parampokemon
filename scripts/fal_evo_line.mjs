#!/usr/bin/env node
/**
 * Generate Mermander back + Mermalion front + Merlord front for evo line approval.
 */
import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const FAL_KEY = process.env.FAL_KEY;
fal.config({ credentials: FAL_KEY });

const SHARED = "GBA Pokemon FireRed style creature sprite, 96x96 pixel art, single shadow tone cel shading, bold black outlines, no anti-aliasing, crisp pixel edges, transparent background, centered single creature, no text, no UI";

const SHEET = [
  {
    id: "mermander_battle_back",
    prompt: `${SHARED}, small chubby aqua water-dragon creature named Mermander, baby dragon proportions with big round head, bright turquoise cyan blue body, soft white belly underneath, three-pointed fin crown on top of head, two small round cheek fins, short tail with paddle fin tip, water droplet pattern markings, facing directly away from camera back view showing back of head and dorsal fin and tail, three-quarter top-down body view`,
  },
  {
    id: "mermalion_battle_front",
    prompt: `${SHARED}, evolved teenage water-dragon creature named Mermalion, leaner taller proportions than baby form, deep teal turquoise body with white belly, prominent flowing wave-shaped fin mane around head and neck like a lion mane, two larger fin ears swept back, sharper eyes with confident expression, four small clawed limbs, longer paddle tail with two fin blades, water rune markings on flanks, standing facing camera three-quarter view`,
  },
  {
    id: "merlord_battle_front",
    prompt: `${SHARED}, champion final form water-dragon creature named Merlord, powerful muscular bipedal stance, deep teal body, gold armored chest plate, three-prong gold crown fin on head, flowing royal blue and gold cape-like dorsal fins, glowing amber eyes commanding expression, gold bracers on arms, long trident-tipped tail, regal champion aura, standing facing camera three-quarter heroic view`,
  },
];

const OUT_DIR = "public/sprites/_preview";
mkdirSync(OUT_DIR, { recursive: true });

async function gen(id, prompt) {
  console.log(`-> ${id}`);
  const r = await fal.subscribe("fal-ai/flux/schnell", {
    input: { prompt, image_size: { width: 1024, height: 1024 }, num_inference_steps: 4, num_images: 1, enable_safety_checker: false },
  });
  const url = r.data?.images?.[0]?.url;
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(join(OUT_DIR, `${id}_raw.png`), buf);

  const cut = await fal.subscribe("fal-ai/birefnet/v2", { input: { image_url: url } });
  const cutUrl = cut.data?.image?.url || cut.data?.images?.[0]?.url;
  if (cutUrl) {
    const cutBuf = Buffer.from(await (await fetch(cutUrl)).arrayBuffer());
    writeFileSync(join(OUT_DIR, `${id}.png`), cutBuf);
    console.log(`   cut saved`);
  } else {
    console.log(`   no cut url, raw only`);
  }
}

(async () => {
  for (const s of SHEET) await gen(s.id, s.prompt);
  console.log("done");
})().catch(e => { console.error(e); process.exit(1); });
