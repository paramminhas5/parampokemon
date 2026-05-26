#!/usr/bin/env node
/**
 * Param Quest — Sprite Generator v2
 * ───────────────────────────────────────────────────────────────────────────
 * Runs in BATCHES so you can review results and switch models if needed.
 *
 * USAGE:
 *   FAL_KEY=xxx node generate_sprites_v2.mjs                     # all batches, default model
 *   FAL_KEY=xxx node generate_sprites_v2.mjs --batch=creatures   # one category
 *   FAL_KEY=xxx node generate_sprites_v2.mjs --batch=leaders
 *   FAL_KEY=xxx node generate_sprites_v2.mjs --batch=player
 *   FAL_KEY=xxx node generate_sprites_v2.mjs --batch=landmarks
 *   FAL_KEY=xxx node generate_sprites_v2.mjs --model=sd15        # SD1.5 (best pixel art)
 *   FAL_KEY=xxx node generate_sprites_v2.mjs --model=sdxl        # SDXL (more detail)
 *   FAL_KEY=xxx node generate_sprites_v2.mjs --model=flux        # Flux-lora (highest quality)
 *   FAL_KEY=xxx node generate_sprites_v2.mjs --only=grp,hab,ai   # specific IDs only
 *   FAL_KEY=xxx node generate_sprites_v2.mjs --dry               # preview prompts, no API calls
 *
 * MODEL GUIDE (for pixel art sprites):
 *   --model=sd15   fal-ai/lora (SD 1.5) + pixel art LoRA
 *                  → TRUE pixel art, crisp edges, GBA-accurate. RECOMMENDED for sprites.
 *                  → ~$0.002/img
 *
 *   --model=sdxl   fal-ai/fast-sdxl + pixel art LoRA
 *                  → More detail, still pixel-accurate, better for landmarks.
 *                  → ~$0.004/img
 *
 *   --model=flux   fal-ai/flux-lora (FLUX.1 dev) + pixel LoRA
 *                  → Highest quality but tends to be painterly at large size.
 *                  → Best with low guidance (3.0) and pixel LoRA scale 1.2.
 *                  → ~$0.012/img
 */

import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync, existsSync } from "fs";

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const arg = (flag) => {
  const m = args.find(a => a.startsWith(`--${flag}=`));
  return m ? m.split("=")[1] : null;
};
const hasFlag = (flag) => args.includes(`--${flag}`);

const FAL_KEY   = process.env.FAL_KEY;
const DRY       = hasFlag("dry");
const BATCH     = arg("batch") ?? "all";               // creatures|leaders|player|landmarks|all
const MODEL_ARG = arg("model") ?? "sd15";              // sd15|sdxl|flux
const ONLY      = arg("only") ? new Set(arg("only").split(",").map(s => s.trim())) : null;

if (!FAL_KEY && !DRY) {
  console.error("\n❌  Set FAL_KEY env var:  FAL_KEY=xxx node generate_sprites_v2.mjs\n");
  process.exit(1);
}
if (FAL_KEY) fal.config({ credentials: FAL_KEY });

// ─── Model configs ────────────────────────────────────────────────────────────
const MODELS = {
  // ── SD 1.5 — BEST for true GBA-style pixel art ────────────────────────────
  // fal-ai/stable-diffusion-v15 is the fast hosted SD1.5 endpoint on fal.
  sd15: {
    label:    "SD 1.5 (fastest, true pixel art)",
    endpoint: "fal-ai/stable-diffusion-v15",
    buildInput: (prompt, size) => ({
      prompt:               `pixel art sprite, GBA style, bold outlines, transparent background, ${prompt}`,
      negative_prompt:      NEG,
      image_size:           size,
      num_inference_steps:  30,
      guidance_scale:       7.5,
      num_images:           1,
      enable_safety_checker: false,
    }),
    spriteSize:   { width: 512, height: 512 },
    landmarkSize: { width: 512, height: 512 },
  },

  // ── SDXL — more detail, still pixel-accurate ─────────────────────────────
  sdxl: {
    label:    "SDXL fast (more detail)",
    endpoint: "fal-ai/fast-sdxl",
    buildInput: (prompt, size) => ({
      prompt:               `pixel art sprite, GBA Game Boy Advance style, bold black outlines, no anti-aliasing, crisp clean pixels, transparent background, ${prompt}`,
      negative_prompt:      NEG,
      image_size:           size,
      num_inference_steps:  25,
      guidance_scale:       7.0,
      num_images:           1,
      enable_safety_checker: false,
    }),
    spriteSize:   { width: 512, height: 512 },
    landmarkSize: { width: 512, height: 512 },
  },

  // ── Flux schnell — fast, good quality ─────────────────────────────────────
  flux: {
    label:    "FLUX schnell (fast, high quality)",
    endpoint: "fal-ai/flux/schnell",
    buildInput: (prompt, size) => ({
      prompt:               `pixel art sprite, GBA Pokemon style, bold black outlines, crisp clean pixels, no anti-aliasing, white background, ${prompt}`,
      negative_prompt:      NEG,
      image_size:           size,
      num_inference_steps:  4,
      num_images:           1,
      enable_safety_checker: false,
      output_format: "png",
    }),
    spriteSize:   { width: 512, height: 512 },
    landmarkSize: { width: 512, height: 512 },
  },
};

const MODEL    = MODELS[MODEL_ARG] ?? MODELS.sd15;
const NEG      = "blurry, photograph, 3d render, realistic, watermark, text, signature, anti-aliased, soft edges, dark background, noise, grainy, low quality, jpeg artifacts";

// ─── Sprite definitions ────────────────────────────────────────────────────────
// Each has: id, dir (output path), prompt (character description only — style injected by model)

// BATCH A — CREATURES (9 wild Pokémon, one per career zone) ─────────────────
const CREATURES = [
  {
    id: "origin",
    dir: "public/sprites/creatures",
    prompt: "small round golden spark creature, lightning bolt tail, large sparkly amber eyes, tiny vestigial wings made of light beams, warm orange-gold colour palette, startup first-product energy, chubby baby pokemon proportions, front-facing standing pose, transparent background",
  },
  {
    id: "grp",
    dir: "public/sprites/creatures",
    prompt: "small round green blob pokemon, two price tag antennae on head, shopping cart wheel stubby feet, large magnifying glass eye, catalog scroll body markings, cheerful merchant expression, mint green and forest green colour palette, front-facing standing pose, transparent background",
  },
  {
    id: "hab",
    dir: "public/sprites/creatures",
    prompt: "small sturdy rhino-like pokemon, terracotta brick texture on skin, tiny apartment window shape on back, golden key hanging from horn, warm brown orange palette, solid heavy reliable pose, cute tiny eyes, front-facing standing pose, transparent background",
  },
  {
    id: "ai",
    dir: "public/sprites/creatures",
    prompt: "small glowing robot-spirit pokemon, circuit board wing patterns, digital square eye pupils with scanline glow, holographic aura trail, sleek futuristic design, bright neon cyan and electric blue palette, floating slightly above ground, front-facing floating pose, transparent background",
  },
  {
    id: "investopad",
    dir: "public/sprites/creatures",
    prompt: "small elegant purple falcon bird pokemon, paper document wings, monocle over one eye, sharp decisive talons, small rolled paper tucked under wing, deep violet and gold palette, regal confident proud stance, front-facing standing pose, transparent background",
  },
  {
    id: "sole",
    dir: "public/sprites/creatures",
    prompt: "small cool cat-lynx pokemon, fresh colourful sneakers on all four tiny paws, streetwear hoodie fur markings, tiny gold chain around neck, graffiti tag marking on cheek, hot pink and white palette, hip-hop swagger pose, large confident eyes, perky pointed ears, front-facing standing pose, transparent background",
  },
  {
    id: "fere",
    dir: "public/sprites/creatures",
    prompt: "small mysterious wisp ghost-type pokemon, glowing green central orb core body, autonomous floating ethereal form, candlestick chart markings, matrix green data stream trailing behind, dark emerald and neon green palette, large glowing single eye, front-facing floating pose, transparent background",
  },
  {
    id: "ccd",
    dir: "public/sprites/creatures",
    prompt: "golden dancing cat pokemon, spinning vinyl record disc as bushy tail, music note shaped ear tufts, disco sparkle dot pattern on fur, warm amber-gold and cream palette, joyful spinning playful pose, big bright happy eyes, tiny paw holding mini microphone, front-facing standing pose, transparent background",
  },
  {
    id: "iterate",
    dir: "public/sprites/creatures",
    prompt: "powerful rotating core final-form champion pokemon, multiple glowing orbital ring halos around body, six-pointed geometric star shape, electric blue and white palette, radiant inner energy reactor core, intense laser-focused eyes, champion aura glow, front-facing standing pose, transparent background",
  },
];

// BATCH B — GYM LEADERS (9 boss trainer characters) ─────────────────────────
const LEADERS = [
  {
    id: "blankpage",
    dir: "public/sprites/leaders",
    prompt: "ghostly pale artist villain trainer, holding large blank white canvas in both hands, black beret, dark artistic smock, hollow void eyes, pale mist aura, intimidating creative-block villain, monochrome grey and cream palette, full body standing battle pose, transparent background",
  },
  {
    id: "longtail",
    dir: "public/sprites/leaders",
    prompt: "cheerful merchant shopkeeper gym leader trainer, green apron with price tags dangling from belt, warm brown hair, holding open ledger book in one hand, catalog scrolls in pockets, friendly but shrewd expression, earth-tone green and brown palette, full body standing battle pose, transparent background",
  },
  {
    id: "zerorunway",
    dir: "public/sprites/leaders",
    prompt: "stern imposing landlord gym leader trainer, black bowler hat, brown waistcoat and tie, large keyring with many keys on belt, stern furrowed brow intense expression, pocket watch chain, imposing authoritative pose, dark brown and black palette, full body standing battle pose, transparent background",
  },
  {
    id: "prehype",
    dir: "public/sprites/leaders",
    prompt: "excited scientist gym leader trainer, large round goggles on face, white lab coat with data charts printed on it, bowtie, wild spiky dark hair, holding glowing test tube raised in hand, manic enthusiastic expression, white and cyan blue palette, full body standing battle pose, transparent background",
  },
  {
    id: "termsheet",
    dir: "public/sprites/leaders",
    prompt: "sharp cold VC investor gym leader trainer, dark navy pinstripe suit, holding rolled term sheet document, rectangular black-rim glasses, slicked back hair, pocket square, icy cold evaluating expression, power stance, dark navy and gold palette, full body standing battle pose, transparent background",
  },
  {
    id: "noculture",
    dir: "public/sprites/leaders",
    prompt: "streetwear skeptic gym leader trainer, backwards snapback cap, oversized pink hoodie, gold chain necklace, dark sunglasses, arms crossed dismissive attitude pose, fresh sneakers, hot pink and black palette, full body standing battle pose, transparent background",
  },
  {
    id: "blackbox",
    dir: "public/sprites/leaders",
    prompt: "mysterious hooded crypto villain gym leader, face entirely hidden in deep shadow hood, two glowing bright green eyes in darkness, long dark cloak with circuit board patterns, floating green holographic ticker symbols orbiting body, black and matrix neon-green palette, full body standing battle pose, transparent background",
  },
  {
    id: "nobrief",
    dir: "public/sprites/leaders",
    prompt: "corporate demanding manager gym leader trainer, blue business suit, red tie, holding large clipboard with blank pages, pointing finger accusatory frustrated pose, pen behind ear, blue and red palette, full body standing battle pose, transparent background",
  },
  {
    id: "statusquo",
    dir: "public/sprites/leaders",
    prompt: "final boss champion king villain, elaborate golden crown with three tall spikes, sweeping dark purple royal cape, silver chest armor with three horizontal gold bars emblem, glowing red intimidating eyes, multiple medals on chest, one arm raised commanding, regal gold and deep purple palette, full body standing battle pose, transparent background",
  },
];

// BATCH C — PLAYER SPRITES (Mermander / Mermalion / Merlord × 4 directions) ─
// These replace the broken SVG player sprites currently in /public/sprites/player/
const PLAYERS = [
  // Stage 1 — Mermander (aqua baby merman Pokémon)
  {
    id: "mermander_front",
    dir: "public/sprites/player",
    prompt: "small cute aqua merman baby pokemon, facing directly forward viewer, chubby baby pokemon proportions, turquoise-cyan body, small fin crown on head, stubby tail fin, large round sparkly eyes with white highlights, round chubby belly, happy friendly expression, water droplet spot markings, bright cyan and pale blue palette, transparent background",
  },
  {
    id: "mermander_back",
    dir: "public/sprites/player",
    prompt: "small cute aqua merman baby pokemon, facing directly away from viewer, back view, dorsal fin on spine, crown fin on head, round chubby back body, tail fin at bottom, water ripple markings on back, turquoise cyan palette, transparent background",
  },
  {
    id: "mermander_left",
    dir: "public/sprites/player",
    prompt: "small cute aqua merman baby pokemon, side profile facing left, walking pose one foot forward, fin visible on side, chubby round side silhouette, crown fin, bright turquoise cyan palette, transparent background",
  },
  {
    id: "mermander_right",
    dir: "public/sprites/player",
    prompt: "small cute aqua merman baby pokemon, side profile facing right, walking pose one foot forward, fin visible on side, chubby round side silhouette, crown fin, bright turquoise cyan palette, transparent background",
  },
  // Stage 2 — Mermalion (purple merman-lion evolved)
  {
    id: "mermalion_front",
    dir: "public/sprites/player",
    prompt: "evolved medium purple merman-lion pokemon, facing directly forward, confident regal expression, purple-violet body, flowing lavender lion mane, trident crown on head, muscular defined build, glowing violet eyes, purple and lavender palette, transparent background",
  },
  {
    id: "mermalion_back",
    dir: "public/sprites/player",
    prompt: "evolved medium purple merman-lion pokemon, facing directly away from viewer, flowing purple lavender mane from behind, dorsal spine fins on back, regal powerful back view, purple and lavender palette, transparent background",
  },
  {
    id: "mermalion_left",
    dir: "public/sprites/player",
    prompt: "evolved medium purple merman-lion pokemon, side profile facing left, confident walking stride, flowing mane visible from side, purple lavender palette, transparent background",
  },
  {
    id: "mermalion_right",
    dir: "public/sprites/player",
    prompt: "evolved medium purple merman-lion pokemon, side profile facing right, confident walking stride, flowing mane visible from side, purple lavender palette, transparent background",
  },
  // Stage 3 — Merlord (gold champion final form)
  {
    id: "merlord_front",
    dir: "public/sprites/player",
    prompt: "powerful large golden merman-lord champion final evolution pokemon, facing forward, commanding intense expression, brilliant gold and amber scales, three-pronged golden crown, gold armour plating on chest, cape-like dorsal fins spread wide, champion aura glow, large intense glowing eyes, gold and amber palette, transparent background",
  },
  {
    id: "merlord_back",
    dir: "public/sprites/player",
    prompt: "powerful large golden merman-lord champion final evolution pokemon, facing directly away viewer, gold armour plating on back, three-pronged crown from behind, cape-like dorsal fins spread wide, dramatic imposing champion back view, gold and amber palette, transparent background",
  },
  {
    id: "merlord_left",
    dir: "public/sprites/player",
    prompt: "powerful large golden merman-lord champion final evolution pokemon, side profile facing left, commanding regal stride, crown from side, gold armour detail, cape-fin visible, gold and amber palette, transparent background",
  },
  {
    id: "merlord_right",
    dir: "public/sprites/player",
    prompt: "powerful large golden merman-lord champion final evolution pokemon, side profile facing right, commanding regal stride, crown from side, gold armour detail, cape-fin visible, gold and amber palette, transparent background",
  },
];

// BATCH D — LANDMARKS (10 zone building overworld icons) ─────────────────────
const LANDMARKS = [
  {
    id: "home",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, cozy childhood house, CRT television visible in window, acoustic guitar leaning outside, vinyl records on porch, warm lamp light from windows, nostalgic 90s home, yellow walls blue roof, transparent background",
  },
  {
    id: "origin",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, early startup market stall shop, hand-painted wooden signs on facade, orange and yellow striped awning, first product display in window, Indian bazaar meets tech startup, warm sand and orange walls, transparent background",
  },
  {
    id: "grp",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, price comparison marketplace building, three stall awnings in green and gold, large price tag signs hanging from roof, barcode decoration on walls, green and gold colour palette, transparent background",
  },
  {
    id: "hab",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, three-storey apartment block, warm terracotta brick texture, lit windows with coloured curtains, brass letterbox on door, small brick planter outside, Bengaluru housing aesthetic, terracotta brown palette, transparent background",
  },
  {
    id: "ai",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, futuristic AI research lab, glowing blue server racks through windows, neon circuit board arch over entrance, holographic AI logo sign, dark navy exterior with neon cyan accent lights, transparent background",
  },
  {
    id: "investopad",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, tall venture capital tower, purple marble facade, floor-to-ceiling windows, golden INVESTOPAD sign on top, glowing antenna at peak, polished luxury corporate, deep purple and gold palette, transparent background",
  },
  {
    id: "sole",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, sneaker and streetwear store mall front, neon pink sign glowing, fresh sneaker display in shop window, graffiti art mural on side wall, velvet rope entrance, hot pink and black colour palette, transparent background",
  },
  {
    id: "fere",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, crypto AI trading floor building, candlestick chart bar patterns on glass walls, green matrix data streams falling down exterior, holographic sign above entrance, dark exterior with neon green accent glow, transparent background",
  },
  {
    id: "ccd",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, music studio and creative space, vinyl records on outside walls, small cat sitting on roof, spotlit stage through large window, warm wood floor inside, neon sign in warm amber glow, transparent background",
  },
  {
    id: "iterate",
    dir: "public/sprites/landmarks",
    prompt: "isometric pixel art building, modern AI agency headquarters, sleek glass facade, ITERATE glowing sign at top, holographic strategy chart in lobby window, rotating logo beacon on roof, dark midnight blue exterior with electric white light, transparent background",
  },
];

// ─── All batches map ──────────────────────────────────────────────────────────
const BATCHES = {
  creatures: { label: "CREATURES  (9 wild Pokémon)",           specs: CREATURES },
  leaders:   { label: "LEADERS    (9 gym boss trainers)",      specs: LEADERS   },
  player:    { label: "PLAYER     (12 Mermander-line sprites)", specs: PLAYERS   },
  landmarks: { label: "LANDMARKS  (10 zone building icons)",   specs: LANDMARKS  },
};

// ─── Core generator ───────────────────────────────────────────────────────────
let totalOk = 0, totalFail = 0;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generate(spec) {
  const outPath = `${spec.dir}/${spec.id}.png`;
  const isLandmark = spec.dir.includes("landmark");
  const size = isLandmark ? MODEL.landmarkSize : MODEL.spriteSize;

  if (DRY) {
    console.log(`  [DRY] → ${outPath}`);
    console.log(`        prompt: ${spec.prompt.slice(0, 100)}...`);
    return;
  }

  process.stdout.write(`  ⏳  ${spec.id.padEnd(22)}`);

  try {
    const input = MODEL.buildInput(spec.prompt, size);

    const result = await fal.subscribe(MODEL.endpoint, {
      input,
      logs: false,
      onQueueUpdate: (u) => {
        if (u.status === "IN_QUEUE") process.stdout.write(".");
      },
    });

    const url = result.data?.images?.[0]?.url;
    if (!url) throw new Error("No image URL in response");

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buf = Buffer.from(await resp.arrayBuffer());

    mkdirSync(spec.dir, { recursive: true });
    writeFileSync(outPath, buf);

    const kb = Math.round(buf.length / 1024);
    process.stdout.write(`  ✅  ${kb}KB  →  ${outPath}\n`);
    totalOk++;
  } catch (err) {
    process.stdout.write(`  ❌  ${err.message}\n`);
    totalFail++;
  }

  await sleep(400); // small backoff
}

async function runBatch(key) {
  const batch = BATCHES[key];
  const specs = ONLY ? batch.specs.filter(s => ONLY.has(s.id)) : batch.specs;
  if (!specs.length) { console.log(`  (no matching IDs for --only filter)\n`); return; }

  console.log(`\n${"─".repeat(58)}`);
  console.log(`  📦  ${batch.label}`);
  console.log(`      Model: ${MODEL.endpoint}`);
  console.log(`      Size:  ${MODEL.spriteSize.width}×${MODEL.spriteSize.height}px`);
  console.log(`      Count: ${specs.length}`);
  console.log(`${"─".repeat(58)}`);

  for (const spec of specs) {
    await generate(spec);
  }

  console.log(`  Done batch "${key}" — ok:${totalOk} fail:${totalFail} so far\n`);
}

async function main() {
  const batchKeys = BATCH === "all"
    ? Object.keys(BATCHES)
    : BATCH.split(",").map(s => s.trim()).filter(k => BATCHES[k]);

  const unknownBatches = BATCH === "all" ? [] : batchKeys.filter(k => !BATCHES[k]);
  if (unknownBatches.length) {
    console.error(`❌  Unknown batch(es): ${unknownBatches.join(", ")}`);
    console.error(`    Valid: ${Object.keys(BATCHES).join(", ")}`);
    process.exit(1);
  }

  console.log(`
╔══════════════════════════════════════════════════════════╗
║           PARAM QUEST — Sprite Generator v2              ║
╠══════════════════════════════════════════════════════════╣
║  Run batches one at a time to verify before continuing.  ║
║  Switch --model= if results aren't pixel-accurate.       ║
╠══════════════════════════════════════════════════════════╣
║  --model=sd15  → SD 1.5 + pixel LoRA  (BEST pixel art)  ║
║  --model=sdxl  → SDXL + pixel LoRA   (more detail)      ║
║  --model=flux  → Flux-lora            (highest quality)  ║
╚══════════════════════════════════════════════════════════╝
  FAL_KEY : ${FAL_KEY ? "✓ set" : "✗ missing — use --dry to preview"}
  Model   : ${MODEL.label}
  Batch   : ${BATCH}
  Filter  : ${ONLY ? [...ONLY].join(", ") : "all"}
  Dry run : ${DRY ? "YES" : "no"}
`);

  for (const key of batchKeys) {
    await runBatch(key);
  }

  console.log(`${"═".repeat(58)}`);
  console.log(`  ✅  Generated : ${totalOk}`);
  console.log(`  ❌  Failed    : ${totalFail}`);
  console.log(`${"═".repeat(58)}`);
  console.log(`
  Next steps:
    1. Check public/sprites/{category}/*.png in the browser
    2. If sprites look painterly/blurry → try --model=sd15
    3. If too low-res/blocky           → try --model=sdxl  
    4. If still wrong                  → edit prompts in this file
    5. Regenerate specific IDs:  --only=grp,hab --batch=creatures
    6. Run \`npm run dev\` to see in game
`);

  if (totalFail > 0) process.exit(1);
}

main().catch(err => {
  console.error("\n💥  Fatal:", err.message);
  process.exit(1);
});
