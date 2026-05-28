#!/usr/bin/env node
/**
 * Generate the full Param player sprite set (4 directions) using locked style.
 * Then run FAL background removal on each to get clean transparent PNGs.
 */
import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY missing"); process.exit(1); }
fal.config({ credentials: FAL_KEY });

const STYLE = "GBA Pokemon FireRed style overworld character sprite, 64x64 pixel art on transparent background, South Asian young man named Param, dark short hair, friendly determined expression, dark navy zip-up hoodie with white drawstrings, light blue jeans, white sneakers, small messenger bag strap on shoulder, bold black outlines, flat cel shading with one shadow tone, no anti-aliasing, crisp pixel edges, transparent background, centered single character, no text, no UI";

const POSES = [
  { id: "param_back",  pose: "facing directly away from camera, back view showing back of head and hoodie, three-quarter top-down body view" },
  { id: "param_left",  pose: "side profile facing left, left foot stepping forward, three-quarter top-down body view" },
  { id: "param_right", pose: "side profile facing right, right foot stepping forward, three-quarter top-down body view" },
];

const OUT_DIR = "public/sprites/_preview";
mkdirSync(OUT_DIR, { recursive: true });

async function generate(id, prompt) {
  console.log(`-> generating ${id}`);
  const r = await fal.subscribe("fal-ai/flux/schnell", {
    input: { prompt, image_size: { width: 1024, height: 1024 }, num_inference_steps: 4, num_images: 1, enable_safety_checker: false },
  });
  const url = r.data?.images?.[0]?.url;
  if (!url) throw new Error(`no url for ${id}`);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const rawPath = join(OUT_DIR, `${id}_raw.png`);
  writeFileSync(rawPath, buf);
  console.log(`   raw saved: ${rawPath}`);

  // Background removal via FAL
  console.log(`   removing background...`);
  const bgRem = await fal.subscribe("fal-ai/birefnet/v2", {
    input: { image_url: url },
  }).catch(async (e) => {
    console.log(`   birefnet failed (${e.message}), trying bria...`);
    return fal.subscribe("fal-ai/bria/background/remove", { input: { image_url: url } });
  });

  const cutUrl = bgRem.data?.image?.url || bgRem.data?.images?.[0]?.url;
  if (!cutUrl) {
    console.log(`   bg removal returned no url, keeping raw`);
    return;
  }
  const cutBuf = Buffer.from(await (await fetch(cutUrl)).arrayBuffer());
  writeFileSync(join(OUT_DIR, `${id}.png`), cutBuf);
  console.log(`   cut saved: ${join(OUT_DIR, id + ".png")}`);
}

(async () => {
  for (const p of POSES) {
    await generate(p.id, `${STYLE}, ${p.pose}`);
  }

  // Also re-process front sprite with bg removal
  console.log(`-> re-cutting param_front`);
  const frontPrompt = `${STYLE}, standing straight facing camera, three-quarter top-down body view`;
  await generate("param_front", frontPrompt);

  console.log("done");
})().catch(e => { console.error(e); process.exit(1); });
