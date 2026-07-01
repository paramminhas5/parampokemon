#!/usr/bin/env node
/**
 * Generate unique NPC overworld sprites via FAL.ai (SD 1.5 — same pipeline as creatures/leaders).
 * Produces proper RGBA PNGs with transparent backgrounds.
 * 
 * Usage:
 *   FAL_KEY=your_key node generate_npc_sprites.mjs
 *   FAL_KEY=your_key node generate_npc_sprites.mjs --preview
 *   FAL_KEY=your_key node generate_npc_sprites.mjs --only=investor,mom
 */

import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "public", "sprites", "npcs");
mkdirSync(OUTPUT_DIR, { recursive: true });

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("ERROR: Set FAL_KEY environment variable");
  process.exit(1);
}
fal.config({ credentials: FAL_KEY });

const ARGS = process.argv.slice(2);
const PREVIEW = ARGS.includes("--preview");
const ONLY = ARGS.find(a => a.startsWith("--only="))?.replace("--only=", "").split(",") ?? null;

const NEG = "blurry, photograph, 3d render, realistic, watermark, text, signature, anti-aliased, soft edges, dark background, noise, grainy, low quality, jpeg artifacts, multiple characters, background scene";

// NPC sprite definitions — same style as gym leaders (front-facing, full body, transparent bg)
const NPC_SPRITES = [
  {
    id: "trainer_m",
    prompt: "young confident male pokemon trainer, blue jacket with white collar, dark jeans, red sneakers, short dark brown hair, backpack strap visible, determined expression, athletic build, full body front-facing standing battle pose, transparent background",
  },
  {
    id: "trainer_f",
    prompt: "young energetic female pokemon trainer, pink sporty top with white trim, dark leggings, ponytail hairstyle with red ribbon, running shoes, cheerful confident expression, full body front-facing standing battle pose, transparent background",
  },
  {
    id: "investor",
    prompt: "wealthy businessman character, sharp dark navy suit with gold pocket square, rectangular black glasses, slicked back hair, polished shoes, holding coffee cup, evaluating sharp expression, full body front-facing standing pose, transparent background",
  },
  {
    id: "engineer",
    prompt: "tech engineer character, dark green hoodie with laptop sticker, headphones around neck, messy dark hair, jeans and sneakers, holding tablet device, focused thoughtful expression, full body front-facing standing pose, transparent background",
  },
  {
    id: "celeb",
    prompt: "flashy celebrity character, gold bomber jacket open over black tee, styled quiff hair, designer sunglasses on head, gold chain necklace, fresh white sneakers, charismatic confident pose with one hand up, full body front-facing standing pose, transparent background",
  },
  {
    id: "client",
    prompt: "professional business client character, purple blazer over white shirt, neat short hair, holding tablet and stylus, polished loafers, friendly professional smile, smart casual corporate style, full body front-facing standing pose, transparent background",
  },
  {
    id: "fan",
    prompt: "enthusiastic young fan character, bright yellow graphic t-shirt with star print, red beanie cap, ripped jeans, colourful sneakers, excited wide-eyed expression, holding phone up, youthful energetic pose, full body front-facing standing pose, transparent background",
  },
  {
    id: "tenant",
    prompt: "casual relaxed tenant character, olive green flannel shirt unbuttoned over grey tee, comfortable jeans, apartment keys hanging from belt loop, stubble beard, easygoing friendly expression, full body front-facing standing pose, transparent background",
  },
  {
    id: "professor",
    prompt: "wise elderly pokemon professor character, long white lab coat, grey-white swept back hair, round wire-rim glasses, holding open notebook, kind wise smile, pokeball pin on lapel, scholarly gentle pose, full body front-facing standing pose, transparent background",
  },
  {
    id: "mom",
    prompt: "warm caring mother character, soft pink cardigan over white blouse, medium brown wavy hair to shoulders, gentle warm smile, floral apron, comfortable house slippers, caring supportive motherly pose, full body front-facing standing pose, transparent background",
  },
  {
    id: "rival",
    prompt: "edgy rival character, dark purple leather jacket with spikes, spiky lavender-silver hair swept to one side, smirking confident expression, arms crossed challenging pose, dark boots, punk aesthetic with cool demeanor, full body front-facing standing pose, transparent background",
  },
];

async function generateSprite(sprite) {
  console.log(`Generating: ${sprite.id}...`);
  
  try {
    const result = await fal.subscribe("fal-ai/stable-diffusion-v15", {
      input: {
        prompt: `pixel art sprite, GBA Pokemon style, bold black outlines, crisp clean pixels, no anti-aliasing, transparent background, ${sprite.prompt}`,
        negative_prompt: NEG,
        image_size: { width: 512, height: 512 },
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_images: 1,
        enable_safety_checker: false,
      },
    });

    const imageUrl = result.data?.images?.[0]?.url;
    if (!imageUrl) {
      console.error(`  FAILED: No image URL in response`);
      return false;
    }

    // Download the image
    const imgResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imgResponse.arrayBuffer());
    const outPath = join(OUTPUT_DIR, `${sprite.id}.png`);
    writeFileSync(outPath, buffer);
    console.log(`  \u2713 Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
    return true;
  } catch (err) {
    console.error(`  FAILED: ${err.message}`);
    return false;
  }
}

async function main() {
  const entries = NPC_SPRITES.filter(s => {
    if (ONLY) return ONLY.includes(s.id);
    return true;
  });

  if (PREVIEW) {
    console.log("PREVIEW MODE \u2014 generating first sprite only for approval");
    await generateSprite(entries[0]);
    return;
  }

  console.log(`Generating ${entries.length} NPC sprites (SD 1.5 + pixel LoRA)...`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  let success = 0;
  for (const sprite of entries) {
    const ok = await generateSprite(sprite);
    if (ok) success++;
    // Brief pause between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nDone! ${success}/${entries.length} sprites generated.`);
}

main().catch(console.error);
