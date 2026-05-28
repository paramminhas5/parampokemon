#!/usr/bin/env node
/**
 * Param Quest — Sprite Generator v3
 * ─────────────────────────────────────────────────────────────────────────
 * Generates NEW assets not covered by v2:
 *   BATCH A — UI art       (title_bg, champion_bg, pokeball_hq)          3 imgs
 *   BATCH B — Zone banners (wide cinematic arrival card per zone)        10 imgs
 *   BATCH C — Battle BGs   (arena background per zone)                  10 imgs
 *
 * All use flux/dev (28 steps) for maximum quality.
 * Banners and battle BGs use landscape_hd (1024×576).
 * UI art uses square_hd (1024×1024).
 *
 * USAGE:
 *   FAL_KEY=xxx node generate_sprites_v3.mjs                    # all batches
 *   FAL_KEY=xxx node generate_sprites_v3.mjs --batch=A          # UI art only
 *   FAL_KEY=xxx node generate_sprites_v3.mjs --batch=B          # banners only
 *   FAL_KEY=xxx node generate_sprites_v3.mjs --batch=C          # battle BGs only
 *   FAL_KEY=xxx node generate_sprites_v3.mjs --preview          # 1 per batch for approval
 *   FAL_KEY=xxx node generate_sprites_v3.mjs --only=home,grp    # specific IDs
 *   FAL_KEY=xxx node generate_sprites_v3.mjs --dry              # preview prompts, no API
 *   FAL_KEY=xxx node generate_sprites_v3.mjs --regen=title_bg   # regenerate specific ID
 */

import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync, existsSync } from "fs";

// ─── CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const arg  = (f) => { const m = args.find(a => a.startsWith(`--${f}=`)); return m ? m.split("=")[1] : null; };
const flag = (f) => args.includes(`--${f}`);

const FAL_KEY = process.env.FAL_KEY;
const DRY     = flag("dry");
const PREVIEW = flag("preview");  // 1 per batch
const BATCH   = arg("batch") ?? "all";
const ONLY    = arg("only")  ? new Set(arg("only").split(",").map(s => s.trim())) : null;
const REGEN   = arg("regen") ? new Set(arg("regen").split(",").map(s => s.trim())) : null;

if (!FAL_KEY && !DRY) {
  console.error("\n❌  Set FAL_KEY:  FAL_KEY=xxx node generate_sprites_v3.mjs\n");
  process.exit(1);
}
if (FAL_KEY) fal.config({ credentials: FAL_KEY });

// ─── Shared negative prompt ───────────────────────────────────────────────
const NEG = [
  "photorealistic, 3d render, photograph, blurry, noisy, noise, watermark,",
  "text, signature, logo, ui elements, hud, interface, multiple scenes,",
  "characters, people, faces, portraits, anti-aliased, modern photography,",
  "stock photo, shutterstock, jpeg artifacts, low quality, overexposed",
].join(" ");

// ─── Core generator ───────────────────────────────────────────────────────
let totalOk = 0, totalFail = 0;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function generate(spec) {
  const { id, dir, prompt, size = "square_hd", steps = 28, guidance = 3.5 } = spec;
  const outPath = `${dir}/${id}.png`;

  // Skip if already exists and not in --regen list
  if (!DRY && !REGEN && existsSync(outPath)) {
    console.log(`  ⏭   ${id.padEnd(26)} already exists — skipping`);
    return;
  }

  if (DRY) {
    console.log(`  [DRY] → ${outPath}`);
    console.log(`         size: ${size}, steps: ${steps}`);
    console.log(`         prompt: ${prompt.slice(0, 120)}...`);
    return;
  }

  process.stdout.write(`  ⏳  ${id.padEnd(26)}`);

  try {
    mkdirSync(dir, { recursive: true });

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt,
        negative_prompt:      NEG,
        image_size:           size,
        num_inference_steps:  steps,
        guidance_scale:       guidance,
        num_images:           1,
        enable_safety_checker: false,
        output_format:        "png",
      },
      logs: false,
      onQueueUpdate: (u) => {
        if (u.status === "IN_QUEUE") process.stdout.write(".");
        if (u.status === "IN_PROGRESS") process.stdout.write("▸");
      },
    });

    const url = result.data?.images?.[0]?.url;
    if (!url) throw new Error("No image URL in response");

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching image`);
    const buf = Buffer.from(await resp.arrayBuffer());

    writeFileSync(outPath, buf);
    const kb = Math.round(buf.length / 1024);
    process.stdout.write(`  ✅  ${kb}KB → ${outPath}\n`);
    totalOk++;
  } catch (err) {
    process.stdout.write(`  ❌  ${err.message}\n`);
    totalFail++;
  }

  await sleep(500);
}

// ─── BATCH A — UI / Title Art ─────────────────────────────────────────────
// Square 1024×1024. These are the most important visual upgrades.
const BATCH_A = [
  {
    id: "title_bg",
    dir: "public/sprites/ui",
    size: "square_hd",
    prompt: [
      "epic dark RPG title screen background, vast cosmic landscape,",
      "deep midnight blue and purple night sky, enormous aurora borealis sweeping across horizon,",
      "distant glowing mountain silhouettes, ancient pixel-art style world visible far below,",
      "scattered glowing fireflies and particles, dramatic atmospheric perspective,",
      "very detailed 16-bit JRPG concept art style, painterly pixel art, no characters,",
      "deep blacks and vivid accent colors cyan and purple, cinematic widescreen mood,",
      "reminiscent of FFVI and Chrono Trigger title screens, breathtaking, awe-inspiring",
    ].join(" "),
    steps: 30,
    guidance: 4.0,
  },
  {
    id: "champion_bg",
    dir: "public/sprites/ui",
    size: "square_hd",
    prompt: [
      "champion hall of fame background, grand celestial throne room,",
      "gold and deep purple color scheme, pillars of light streaming down,",
      "floating golden badges orbiting in constellation patterns,",
      "radiant energy beams, galaxy visible through grand arched windows,",
      "epic 16-bit JRPG final area art style, no characters,",
      "triumphant regal atmosphere, hall of champions, glowing gold light,",
      "reminiscent of Pokemon Hall of Fame and FFVI opera house in pixel art style",
    ].join(" "),
    steps: 30,
    guidance: 4.0,
  },
  {
    id: "pokeball_hq",
    dir: "public/sprites/ui",
    size: "square_hd",
    prompt: [
      "single pokeball centered on pure black transparent background,",
      "GBA pixel art style, crisp bold black outlines, clean limited color palette,",
      "red top half white bottom half black band and button,",
      "glossy sheen highlight on top dome, glowing inner light from button,",
      "perfectly centered, no background, isolated object,",
      "clean pixel art sprite, 16-bit video game item icon style",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
];

// ─── BATCH B — Zone Arrival Banners (10 zones) ────────────────────────────
// Landscape 1024×576. Shown full-screen for 2.5s on zone entry.
// No text, no characters — pure atmospheric world art.
const BATCH_B = [
  {
    id: "home",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, cozy childhood hometown at dusk,",
      "warm orange and blue twilight sky, small houses with glowing windows,",
      "grassy hills, white picket fence, fireflies beginning to emerge,",
      "nostalgic 1990s Indian suburb feel, 16-bit JRPG pixel art landscape,",
      "Pallet Town energy, warm safe beginning-of-adventure atmosphere,",
      "no characters, no text, painterly pixel art, wide panoramic view",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "origin",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, early startup workshop district at golden hour,",
      "warm sand-colored buildings, hand-painted wooden shop signs,",
      "creative market stalls, Pune Indian city energy, late afternoon sun,",
      "scrappy first-product builder vibe, 16-bit JRPG pixel art landscape,",
      "no characters, no text, painterly pixel art, wide panoramic",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "grp",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, bustling Indian market district, price comparison energy,",
      "green and gold color palette, shop awnings, price tag banners hanging between buildings,",
      "busy tech bazaar meets commerce, clear blue sky, vibrant energetic scene,",
      "16-bit JRPG pixel art landscape, no characters, no text, wide panoramic",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "hab",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, Bengaluru residential district, stone and terracotta buildings,",
      "warm orange tones, apartment blocks with lit windows, stone streets,",
      "bootstrapped real estate operator energy, humid warm night atmosphere,",
      "16-bit JRPG pixel art landscape, no characters, no text, wide panoramic",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "ai",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, futuristic AI research district at night,",
      "neon cyan glow, server rack silhouettes through glass walls,",
      "holographic data streams, circuit board patterns on buildings,",
      "dark navy background with electric blue accents, 2013 AI pioneer energy,",
      "16-bit JRPG pixel art landscape, no characters, no text, wide panoramic",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "investopad",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, luxury venture capital tower district at dusk,",
      "deep purple and gold sky, gleaming glass skyscrapers, marble plazas,",
      "powerful venture capital energy, premium corporate atmosphere,",
      "golden windows glowing, purple twilight sky,",
      "16-bit JRPG pixel art landscape, no characters, no text, wide panoramic",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "sole",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, vibrant sneaker and streetwear mall district,",
      "hot pink and black neon signs, graffiti murals on buildings,",
      "hype culture energy, fresh drops event atmosphere, velvet ropes,",
      "urban night scene, neon reflections on wet streets,",
      "16-bit JRPG pixel art landscape, no characters, no text, wide panoramic",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "fere",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, crypto AI trading district at night,",
      "neon green matrix data streams falling, candlestick charts on building facades,",
      "dark background with electric green accents, autonomous agent energy,",
      "blockchain and AI atmosphere, digital rain, mysterious and powerful,",
      "16-bit JRPG pixel art landscape, no characters, no text, wide panoramic",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "ccd",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, warm music studio and creative district at night,",
      "amber and warm wood tones, vinyl records on walls, spotlit stage through window,",
      "music label energy, cats and creativity, non-commercial art spirit,",
      "cozy warm glow in dark street, 16-bit JRPG pixel art landscape,",
      "no characters, no text, wide panoramic",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "iterate",
    dir: "public/sprites/banners",
    size: "landscape_16_9",
    prompt: [
      "wide cinematic banner, sleek AI-native agency headquarters at night,",
      "midnight blue and electric white, glowing glass facade, strategy boards visible inside,",
      "holographic campaign charts, final chapter energy, champion's home,",
      "dark sky with brilliant white accent lights, 16-bit JRPG pixel art landscape,",
      "no characters, no text, wide panoramic",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
];

// ─── BATCH C — Battle Backgrounds (10 zones) ──────────────────────────────
// Landscape 1024×576. Shown as battle arena background instead of CSS gradient.
const BATCH_C = [
  {
    id: "home",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, grassy meadow arena,",
      "soft daytime lighting, lush green grass floor, white dandelions scattered,",
      "wooden fence border, gentle hills in background, cozy hometown feel,",
      "GBA Pokemon FireRed battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "origin",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, sandy workshop courtyard,",
      "warm sand floor, hand-built market stall walls, golden afternoon light,",
      "crates and tools in background, first startup energy,",
      "GBA Pokemon battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "grp",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, green market floor,",
      "price tag banners overhead, shop awnings border, catalog shelves background,",
      "bright commercial energy, GBA Pokemon battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "hab",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, terracotta stone courtyard,",
      "brick wall border, apartment windows in background, warm orange evening light,",
      "Bengaluru housing estate feel, GBA Pokemon battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "ai",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, neon blue server room floor,",
      "glowing circuit board grid patterns, server racks in background, holographic aura,",
      "dark navy and electric cyan, AI lab energy, GBA Pokemon battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "investopad",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, polished marble boardroom floor,",
      "deep purple and gold, trophy case background, tall windows with dusk sky,",
      "luxury VC tower interior, GBA Pokemon battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "sole",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, pink sneaker store floor,",
      "neon sign glow, sneaker rack displays background, hot pink and black neon lighting,",
      "streetwear hype energy, GBA Pokemon battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "fere",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, neon green crypto trading floor,",
      "matrix data streams on walls, candlestick chart displays, dark floor with green glow,",
      "autonomous AI agent energy, GBA Pokemon battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "ccd",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, warm wood recording studio floor,",
      "spotlight glow, vinyl record wall, mixing desk in background, amber warm light,",
      "creative music studio energy, GBA Pokemon battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
  {
    id: "iterate",
    dir: "public/sprites/battle",
    size: "landscape_16_9",
    prompt: [
      "pokemon battle arena background, top-down perspective, dark strategy agency floor,",
      "electric white and midnight blue, holographic strategy charts on walls,",
      "trophy wall background, champion headquarters energy,",
      "GBA Pokemon battle background style, no characters, no text",
    ].join(" "),
    steps: 28,
    guidance: 3.5,
  },
];

// ─── Batch registry ───────────────────────────────────────────────────────
const BATCHES = {
  A: { label: "BATCH A — UI / Title Art         (3 images)",  specs: BATCH_A },
  B: { label: "BATCH B — Zone Arrival Banners  (10 images)", specs: BATCH_B },
  C: { label: "BATCH C — Battle Backgrounds    (10 images)", specs: BATCH_C },
};

async function runBatch(key) {
  const b = BATCHES[key];
  let specs = b.specs;

  if (ONLY)  specs = specs.filter(s => ONLY.has(s.id));
  if (REGEN) specs = specs.filter(s => REGEN.has(s.id));
  if (PREVIEW) specs = [specs[0]]; // one per batch for quick check

  if (!specs.length) { console.log(`  (no matching specs)\n`); return; }

  console.log(`\n${"─".repeat(62)}`);
  console.log(`  📦  ${b.label}`);
  console.log(`      Model : fal-ai/flux/dev`);
  console.log(`      Count : ${specs.length}`);
  console.log(`${"─".repeat(62)}`);

  for (const spec of specs) {
    await generate(spec);
  }
  console.log(`  Batch ${key} done — ok:${totalOk} fail:${totalFail}\n`);
}

async function main() {
  const keys = BATCH === "all"
    ? ["A", "B", "C"]
    : BATCH.split(",").map(s => s.trim().toUpperCase()).filter(k => BATCHES[k]);

  const unknown = BATCH === "all" ? [] : keys.filter(k => !BATCHES[k]);
  if (unknown.length) {
    console.error(`❌  Unknown batch: ${unknown.join(", ")}. Valid: A, B, C`);
    process.exit(1);
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         PARAM QUEST — Sprite Generator v3                    ║
╠══════════════════════════════════════════════════════════════╣
║  New assets: UI art · Zone Banners · Battle Backgrounds      ║
║  Model: fal-ai/flux/dev (28 steps, premium quality)          ║
╠══════════════════════════════════════════════════════════════╣
║  BATCH A → public/sprites/ui/          (title_bg, etc.)      ║
║  BATCH B → public/sprites/banners/     (per-zone arrival)    ║
║  BATCH C → public/sprites/battle/      (per-zone arena)      ║
╚══════════════════════════════════════════════════════════════╝
  FAL_KEY : ${FAL_KEY ? "✓ set" : "✗ missing (use --dry)"}
  Batches : ${keys.join(", ")}
  Preview : ${PREVIEW ? "YES (1 per batch)" : "no"}
  Filter  : ${ONLY ? [...ONLY].join(", ") : REGEN ? `regen: ${[...REGEN].join(", ")}` : "all"}
  Dry run : ${DRY ? "YES" : "no"}
`);

  for (const k of keys) await runBatch(k);

  console.log(`${"═".repeat(62)}`);
  console.log(`  ✅  Generated : ${totalOk}`);
  console.log(`  ❌  Failed    : ${totalFail}`);
  console.log(`${"═".repeat(62)}`);
  console.log(`
  Next steps:
    1. Check output PNGs in browser (npm run dev)
    2. Re-run specific IDs:  --regen=title_bg --batch=A
    3. Run remaining batches: --batch=B, --batch=C
    4. ZoneTitle.tsx uses banners, Battle.tsx uses battle BGs
`);
  if (totalFail > 0) process.exit(1);
}

main().catch(err => {
  console.error("\n💥  Fatal:", err.message);
  process.exit(1);
});
