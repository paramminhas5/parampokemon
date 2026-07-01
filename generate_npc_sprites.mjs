#!/usr/bin/env node
/**
 * Generate unique NPC overworld sprites via FAL.ai (flux/dev model).
 * 
 * Usage:
 *   FAL_KEY=your_key node generate_npc_sprites.mjs
 *   FAL_KEY=your_key node generate_npc_sprites.mjs --preview  (generate 1 for approval)
 *   FAL_KEY=your_key node generate_npc_sprites.mjs --only=investor,mom
 * 
 * Each NPC kind gets a unique 512×512 PNG with transparent background,
 * pixel-art RPG style, consistent with the game's visual language.
 */

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

const ARGS = process.argv.slice(2);
const PREVIEW = ARGS.includes("--preview");
const ONLY = ARGS.find(a => a.startsWith("--only="))?.replace("--only=", "").split(",") ?? null;

const BASE_PROMPT = "pixel art RPG character sprite, GBA pokemon style, front-facing, chibi proportions, bold black outlines, transparent background, single centered character, clean limited color palette, 16-bit retro game aesthetic, no anti-aliasing on outlines";

const NEGATIVE_PROMPT = "photorealistic, 3d render, blurry, noisy, watermark, text, signature, multiple characters, background clutter, modern UI, anti-aliased, photograph, complex shading, gradient fills";

const NPC_PROMPTS = {
  trainer_m: {
    prompt: `${BASE_PROMPT}, young male trainer, blue jacket, dark pants, confident stance, backpack, sneakers, dark hair, adventure-ready`,
    filename: "trainer_m.png",
  },
  trainer_f: {
    prompt: `${BASE_PROMPT}, young female trainer, pink top, ponytail, dark pants, determined expression, sporty outfit, running shoes`,
    filename: "trainer_f.png",
  },
  investor: {
    prompt: `${BASE_PROMPT}, businessman in dark suit, glasses, holding briefcase, slicked hair, formal shoes, serious expression, venture capitalist look`,
    filename: "investor.png",
  },
  engineer: {
    prompt: `${BASE_PROMPT}, tech engineer, green hoodie, laptop sticker, headphones around neck, casual jeans, focused expression, coding posture`,
    filename: "engineer.png",
  },
  celeb: {
    prompt: `${BASE_PROMPT}, celebrity character, gold jacket, sunglasses, styled hair, flashy sneakers, charismatic pose, star quality`,
    filename: "celeb.png",
  },
  client: {
    prompt: `${BASE_PROMPT}, business client, purple blazer, smart casual, tablet in hand, friendly smile, polished shoes, professional`,
    filename: "client.png",
  },
  fan: {
    prompt: `${BASE_PROMPT}, enthusiastic young fan, yellow t-shirt with star, red beanie cap, jeans, excited expression, sneakers, holding phone`,
    filename: "fan.png",
  },
  tenant: {
    prompt: `${BASE_PROMPT}, casual tenant, green flannel shirt, relaxed pose, apartment keys in hand, comfortable clothes, friendly neighbor vibe`,
    filename: "tenant.png",
  },
  professor: {
    prompt: `${BASE_PROMPT}, wise professor character, white lab coat, grey hair, round glasses, holding book, kind expression, pokemon professor style`,
    filename: "professor.png",
  },
  mom: {
    prompt: `${BASE_PROMPT}, warm mother character, pink cardigan, medium brown hair, gentle smile, apron, caring expression, home-maker style`,
    filename: "mom.png",
  },
  rival: {
    prompt: `${BASE_PROMPT}, rival character, purple jacket, spiky lavender hair, smirk expression, crossed arms, edgy style, competitive energy`,
    filename: "rival.png",
  },
};

async function generateSprite(id, config) {
  console.log(`Generating: ${id}...`);
  
  const response = await fetch("https://fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: {
      "Authorization": `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: config.prompt,
      negative_prompt: NEGATIVE_PROMPT,
      image_size: "square_hd",
      num_inference_steps: 28,
      guidance_scale: 7.5,
      num_images: 1,
      enable_safety_checker: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`  FAILED: ${response.status} — ${err}`);
    return false;
  }

  const data = await response.json();
  const imageUrl = data.images?.[0]?.url;
  if (!imageUrl) {
    console.error(`  FAILED: No image URL in response`);
    return false;
  }

  // Download the image
  const imgResponse = await fetch(imageUrl);
  const buffer = Buffer.from(await imgResponse.arrayBuffer());
  const outPath = join(OUTPUT_DIR, config.filename);
  writeFileSync(outPath, buffer);
  console.log(`  ✓ Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
  return true;
}

async function main() {
  const entries = Object.entries(NPC_PROMPTS).filter(([id]) => {
    if (ONLY) return ONLY.includes(id);
    return true;
  });

  if (PREVIEW) {
    console.log("PREVIEW MODE — generating first sprite only for approval");
    const [id, config] = entries[0];
    await generateSprite(id, config);
    return;
  }

  console.log(`Generating ${entries.length} NPC sprites...`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  let success = 0;
  for (const [id, config] of entries) {
    const ok = await generateSprite(id, config);
    if (ok) success++;
    // Rate limit: wait 2s between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\nDone! ${success}/${entries.length} sprites generated.`);
}

main().catch(console.error);
