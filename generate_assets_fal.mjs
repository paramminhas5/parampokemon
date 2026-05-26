#!/usr/bin/env node
/**
 * Param Quest — FAL.ai Asset Generator
 * Generates beautiful 64x64 pixel art sprites for all game assets.
 * Usage: FAL_KEY=your_key node generate_assets_fal.mjs
 */

import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("❌  Set FAL_KEY env var first:  FAL_KEY=xxx node generate_assets_fal.mjs");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const BASE_STYLE = `masterpiece pixel art, 64x64 resolution, transparent background, crisp clean pixels, GBA Game Boy Advance color palette, bold outlines, no anti-aliasing, isometric Pokemon-style sprite, vibrant colors, expressive character design`;

const PIXEL_LANDSCAPE = `masterpiece pixel art, 80x80 resolution, transparent background, crisp clean pixels, SNES 16-bit style, bold outlines, no anti-aliasing, isometric view, rich detailed environment scene, vibrant saturated colors, Pokemon overworld building landmark`;


// ─── CREATURE SPRITES ──────────────────────────────────────────────────────
const CREATURES = [
  {
    id: "origin",
    prompt: `${BASE_STYLE}, small golden spark creature, electric energy wisps, round body with lightning bolt tail, glowing amber eyes, startup energy aura, dynamic pose, warm orange-gold palette, tiny wings made of light rays`,
  },
  {
    id: "grp",
    prompt: `${BASE_STYLE}, small green blob creature, price tag antennae, two cute shopping cart wheels for feet, magnifying glass eye, catalog-scroll body markings, cheerful merchant expression, mint-green and forest-green palette`,
  },
  {
    id: "hab",
    prompt: `${BASE_STYLE}, sturdy brown rhino-like creature, brick-pattern skin texture, apartment windows on its back, tiny key hanging from horn, warm terracotta color palette, reliable heavy pose, small balcony detail on side`,
  },
  {
    id: "ai",
    prompt: `${BASE_STYLE}, glowing cyan robot-spirit creature, circuit board wing patterns, digital eye pupils with scan-line effect, holographic aura trails, sleek futuristic design, neon blue and electric cyan palette, floating slightly off ground`,
  },
  {
    id: "investopad",
    prompt: `${BASE_STYLE}, elegant purple falcon creature, term-sheet paper wings, monocle eye, sharp decisive talons, portfolio document tucked under wing, deep violet and gold palette, regal confident stance`,
  },
  {
    id: "sole",
    prompt: `${BASE_STYLE}, cool pink cat-lynx creature, fresh sneakers on all four paws, streetwear hoodie markings, chain necklace detail, graffiti tag markings on fur, hot pink and white palette, hip-hop swagger pose`,
  },
  {
    id: "fere",
    prompt: `${BASE_STYLE}, mysterious green wisp creature, crypto candlestick chart patterns floating around it, autonomous floating eye core, ghostly trailing data streams, matrix-green and black palette, glowing hovering orb form`,
  },
  {
    id: "ccd",
    prompt: `${BASE_STYLE}, golden dancing cat creature, vinyl record disc tail, music note ear tufts, disco ball reflection pattern on fur, warm amber-gold palette, joyful spinning dance pose, tiny paw microphone`,
  },
  {
    id: "iterate",
    prompt: `${BASE_STYLE}, powerful rotating core creature, multiple orbital rings of code text, six-armed star formation, electric blue and white palette, glowing inner energy reactor, champion final-form appearance, intense glowing eyes`,
  },
];


// ─── GYM LEADER SPRITES ───────────────────────────────────────────────────
const LEADERS = [
  {
    id: "blankpage",
    prompt: `${BASE_STYLE}, ghostly pale artist character standing, holding large blank white canvas, black beret hat, dark artistic smock, hollow void eyes, pale mist aura, monochrome palette with cream and charcoal, intimidating creative block villain`,
  },
  {
    id: "longtail",
    prompt: `${BASE_STYLE}, cheerful merchant shopkeeper character, green apron with price tags hanging off belt, warm brown hair, ledger book in hand, multiple catalog scrolls at waist, friendly but shrewd expression, earth-tone palette`,
  },
  {
    id: "zerorunway",
    prompt: `${BASE_STYLE}, stern landlord character in bowler hat and brown waistcoat, holding large keyring with many keys, stern furrowed expression, tie and vest, pocket watch, imposing pose, deep brown and black palette, zero mercy look`,
  },
  {
    id: "prehype",
    prompt: `${BASE_STYLE}, excited scientist character with oversized round goggles, white lab coat with data charts printed on it, bowtie, wild spiky hair, holding test tube with glowing AI formula, enthusiastic expression, white and cyan palette`,
  },
  {
    id: "termsheet",
    prompt: `${BASE_STYLE}, sharp VC investor character in dark navy suit, holding rolled term sheet document, black rectangular glasses, slicked back hair, pocket square, evaluating cold expression, dark navy and gold palette, power stance`,
  },
  {
    id: "noculture",
    prompt: `${BASE_STYLE}, streetwear skeptic character, backwards cap, pink hoodie with chain necklace, dark sunglasses, arms crossed skeptical pose, sneakers visible, dismissive cool expression, hot pink and black palette, hype villain energy`,
  },
  {
    id: "blackbox",
    prompt: `${BASE_STYLE}, mysterious hooded crypto figure, face entirely hidden in shadow, two glowing green eyes in hood void, dark cloak with circuit patterns, floating holographic ticker symbols around body, black and matrix-green palette, unknowable presence`,
  },
  {
    id: "nobrief",
    prompt: `${BASE_STYLE}, corporate manager character in blue suit, red tie, holding clipboard with blank documents, frustrated expression with furrowed brow, pen tucked behind ear, pointing finger pose, blue and red palette, demanding client energy`,
  },
  {
    id: "statusquo",
    prompt: `${BASE_STYLE}, final boss king character in full golden crown and purple cape, armored chest plate with three horizontal bars emblem, imposing stance, glowing red eyes, multiple medals on chest, grand royal palette of gold and crimson, ultimate champion villain`,
  },
];


// ─── LANDMARK SPRITES ─────────────────────────────────────────────────────
const LANDMARKS = [
  {
    id: "home",
    prompt: `${PIXEL_LANDSCAPE}, cozy childhood bedroom, CRT television with colorful screen, acoustic guitar leaning against wall, stacks of music records, notebooks and sketchbooks, warm lamp glow, nostalgic 90s bedroom aesthetic, yellow and blue palette`,
  },
  {
    id: "origin",
    prompt: `${PIXEL_LANDSCAPE}, early startup market stall, hand-painted wooden signs, bright awnings in orange and yellow, first product display table, bustling energy, Indian bazaar inspiration with modern tech twist, warm sand and orange palette`,
  },
  {
    id: "grp",
    prompt: `${PIXEL_LANDSCAPE}, price comparison market building, three colorful awning stalls, large price tags hanging, barcode decorations on walls, comparison chart windows, green and gold palette, India's first comparison engine aesthetic`,
  },
  {
    id: "hab",
    prompt: `${PIXEL_LANDSCAPE}, three-story apartment block buildings, warm terracotta brick facade, lit windows with different curtains, brass letterboxes, brick planters outside, Bengaluru budget housing aesthetic, warm brown and orange palette`,
  },
  {
    id: "ai",
    prompt: `${PIXEL_LANDSCAPE}, futuristic AI research lab building, glowing blue server racks visible through windows, neon circuit-board arch entrance, holographic AI logo sign, floating data streams, dark navy with neon cyan accents, 2013 chatbot era feeling`,
  },
  {
    id: "investopad",
    prompt: `${PIXEL_LANDSCAPE}, tall venture capital tower building, purple marble facade, floor-to-ceiling windows with city view, golden INVESTOPAD sign, antenna glowing at top, polished corporate luxury, deep purple and gold palette`,
  },
  {
    id: "sole",
    prompt: `${PIXEL_LANDSCAPE}, sneaker and streetwear store mall, neon SOLESEARCH pink sign, shoe display windows with fresh kicks, graffiti art on side walls, velvet rope entrance, Mumbai streetwear vibe, hot pink and black palette`,
  },
  {
    id: "fere",
    prompt: `${PIXEL_LANDSCAPE}, crypto AI trading floor building, candlestick chart patterns on glass walls, green matrix data streams falling, FERE.AI holographic sign, floating blockchain nodes, dark with neon green accents, autonomous agent headquarters`,
  },
  {
    id: "ccd",
    prompt: `${PIXEL_LANDSCAPE}, music studio and pet-forward creative space, vinyl records on wall, cats lounging on equipment, spotlit stage visible through window, warm wood parquet floor, CATS CAN DANCE neon sign, warm amber and gold palette`,
  },
  {
    id: "iterate",
    prompt: `${PIXEL_LANDSCAPE}, modern AI-native agency headquarters, sleek glass facade with ITERATE sign, holographic strategy charts in windows, rotating blue-white logo, city skyline backdrop, dark midnight blue with electric white light, the final destination`,
  },
];


// ─── PLAYER SPRITES ───────────────────────────────────────────────────────
const PLAYERS = [
  {
    id: "mermander_front",
    prompt: `${BASE_STYLE}, small cute aqua merman Pokemon creature, facing forward, friendly expression, turquoise body with fin crown on head, little tail fin, big expressive eyes with sparkle, chubby baby dragon proportions, water droplet markings, bright cyan palette`,
  },
  {
    id: "mermander_back",
    prompt: `${BASE_STYLE}, small cute aqua merman Pokemon creature, facing away from viewer, back view showing dorsal fin, crown fin on head, turquoise back, water ripple markings on back, tail fin visible, bright cyan palette`,
  },
  {
    id: "mermander_left",
    prompt: `${BASE_STYLE}, small cute aqua merman Pokemon creature, side profile left, determined walking pose, fin visible on side, chubby profile, crown fin, turquoise cyan palette, one foot forward walking animation frame`,
  },
  {
    id: "mermander_right",
    prompt: `${BASE_STYLE}, small cute aqua merman Pokemon creature, side profile right, determined walking pose, fin visible on side, chubby profile, crown fin, turquoise cyan palette, one foot forward walking animation frame`,
  },
  {
    id: "mermalion_front",
    prompt: `${BASE_STYLE}, evolved medium purple merman-lion Pokemon creature, facing forward, confident expression, purple body with flowing mane, trident crown on head, more muscular build, glowing violet eyes, regal operator pose, purple and lavender palette`,
  },
  {
    id: "mermalion_back",
    prompt: `${BASE_STYLE}, evolved medium purple merman-lion Pokemon creature, facing away, flowing purple mane visible from behind, dorsal spines, regal back view, purple and lavender palette, powerful stance`,
  },
  {
    id: "mermalion_left",
    prompt: `${BASE_STYLE}, evolved medium purple merman-lion Pokemon creature, side profile left, confident walking stride, flowing mane, purple lavender palette, mid-step walking pose`,
  },
  {
    id: "mermalion_right",
    prompt: `${BASE_STYLE}, evolved medium purple merman-lion Pokemon creature, side profile right, confident walking stride, flowing mane, purple lavender palette, mid-step walking pose`,
  },
  {
    id: "merlord_front",
    prompt: `${BASE_STYLE}, powerful golden merman-lord champion Pokemon creature, facing forward, intense commanding expression, gold armored scales, three-pronged crown, chest emblem, cape-like dorsal fins, champion aura glow, gold and amber palette, final evolution`,
  },
  {
    id: "merlord_back",
    prompt: `${BASE_STYLE}, powerful golden merman-lord champion Pokemon creature, facing away, gold armor on back, imposing crown from behind, champion back view, dramatic gold and amber palette, powerful final form`,
  },
  {
    id: "merlord_left",
    prompt: `${BASE_STYLE}, powerful golden merman-lord champion Pokemon creature, side profile left, commanding stride, crown visible from side, gold armor glinting, amber gold palette, champion walking pose`,
  },
  {
    id: "merlord_right",
    prompt: `${BASE_STYLE}, powerful golden merman-lord champion Pokemon creature, side profile right, commanding stride, crown visible from side, gold armor glinting, amber gold palette, champion walking pose`,
  },
];


// ─── Generator ────────────────────────────────────────────────────────────

async function generateSprite(prompt, outputPath, size = 512) {
  console.log(`  🎨 Generating: ${outputPath}`);
  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: { width: size, height: size },
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false,
      },
    });

    const imageUrl = result.data?.images?.[0]?.url;
    if (!imageUrl) throw new Error("No image URL in response");

    // Download image
    const resp = await fetch(imageUrl);
    const buf = Buffer.from(await resp.arrayBuffer());
    writeFileSync(outputPath, buf);
    console.log(`  ✅ Saved: ${outputPath}`);
  } catch (err) {
    console.error(`  ❌ Failed ${outputPath}: ${err.message}`);
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log("🚀 Param Quest — FAL Asset Generator\n");

  // Ensure dirs exist
  ["public/sprites/creatures", "public/sprites/leaders",
   "public/sprites/landmarks", "public/sprites/player"].forEach(d => {
    mkdirSync(d, { recursive: true });
  });

  console.log("\n📦 CREATURES (9 sprites)");
  for (const c of CREATURES) {
    await generateSprite(c.prompt, `public/sprites/creatures/${c.id}.png`, 512);
    await sleep(500);
  }

  console.log("\n🏆 GYM LEADERS (9 sprites)");
  for (const l of LEADERS) {
    await generateSprite(l.prompt, `public/sprites/leaders/${l.id}.png`, 512);
    await sleep(500);
  }

  console.log("\n🗺️  LANDMARKS (10 sprites)");
  for (const lm of LANDMARKS) {
    await generateSprite(lm.prompt, `public/sprites/landmarks/${lm.id}.png`, 512);
    await sleep(500);
  }

  console.log("\n🧙 PLAYER SPRITES (12 sprites)");
  for (const p of PLAYERS) {
    await generateSprite(p.prompt, `public/sprites/player/${p.id}.png`, 512);
    await sleep(500);
  }

  console.log("\n✨ Done! All sprites generated.");
  console.log("   Run `npm run dev` to see the game with new sprites.");
}

main().catch(console.error);
