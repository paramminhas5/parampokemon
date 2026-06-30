#!/usr/bin/env node
import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";

fal.config({ credentials: process.env.FAL_KEY });
mkdirSync("public/sprites/tiles", { recursive: true });

// ── 4 tree variants ──────────────────────────────────────────────────────
// Generated on WHITE background — engine uses multiply blend so white = invisible
const TREES = [
  {
    id: "tree_a",
    prompt: "single top-down view round deciduous tree, lush rich green round canopy, visible brown tree trunk below, clean hard black outline around the entire tree, bright highlights on top-left of canopy, dark shadow on bottom-right, pure white background, clean 2D flat game sprite art, Pokemon GBA style, no text, square",
  },
  {
    id: "tree_b",
    prompt: "single top-down view pine conifer tree, dark forest green triangular pointed canopy from above, brown trunk stub visible at base center, clean black outline, lighter green highlights on canopy top, pure white background, clean 2D flat game sprite art, Pokemon GBA style, no text, square",
  },
  {
    id: "tree_c",
    prompt: "single top-down view wide bushy leafy tree, large round wide canopy with multiple green lobes like broccoli from above, chunky trunk visible in center, very clean black outline, lime green highlight patches, pure white background, clean 2D flat game sprite art, Pokemon GBA style, no text, square",
  },
  {
    id: "tree_d",
    prompt: "single top-down view cherry blossom tree, soft pink and white flower canopy from above, delicate pale pink petals, dark brown trunk center, clean black outline, pure white background, clean 2D flat game sprite art, Pokemon GBA style, no text, square",
  },
];

// ── Improved floor tiles ─────────────────────────────────────────────────
// Clean stylized 2D — NOT painterly or photorealistic
const TILES = [
  {
    id: "grass",
    prompt: "seamless top-down grass ground tile, clean flat stylized 2D game art, two slightly different shades of green in a subtle checker pattern, tiny simple grass blade shapes, Pokemon GBA FireRed overworld style, crisp clean edges, pure flat colors, no photo texture, no 3D, seamless tileable, square",
  },
  {
    id: "route_grass",
    prompt: "seamless top-down bright route grass tile, clean flat stylized 2D game art, slightly brighter and more saturated green than regular grass, simple minimal grass blade texture, Pokemon GBA route overworld style, pure flat colors, no photo texture, seamless tileable, square",
  },
  {
    id: "path",
    prompt: "seamless top-down dirt path tile, clean flat stylized 2D game art, warm sandy tan color, small simple rounded pebbles scattered, subtle two-tone ground shading, Pokemon GBA overworld walking path style, pure flat colors, crisp hard edges, no photo texture, seamless tileable, square",
  },
  {
    id: "water",
    prompt: "seamless top-down water tile, clean flat stylized 2D game art, deep cobalt blue, simple horizontal shimmer line stripes across the surface, tiny white sparkle dots, Pokemon GBA water tile style, pure flat colors, no photo texture, no 3D waves, seamless tileable, square",
  },
  {
    id: "sand",
    prompt: "seamless top-down sand ground tile, clean flat stylized 2D game art, warm golden yellow, subtle simple ripple lines pattern, Pokemon GBA sandy beach town style, pure flat colors, no photo texture, seamless tileable, square",
  },
  {
    id: "stone",
    prompt: "seamless top-down cobblestone brick tile, clean flat stylized 2D game art, warm terracotta orange-brown bricks, clear white mortar lines forming a brick grid pattern, slight highlight on top edge of each brick, Pokemon GBA stone courtyard style, pure flat colors, crisp hard edges, seamless tileable, square",
  },
];

async function gen(item, prefix = "") {
  try {
    const r = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: item.prompt,
        image_size: { width: 512, height: 512 },
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false,
      },
    });
    const url = r.data.images[0].url;
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const path = `public/sprites/tiles/${prefix}${item.id}.png`;
    writeFileSync(path, buf);
    console.log(`✅  ${path}`);
    console.log(`    ${url}`);
  } catch (e) {
    console.error(`❌  ${prefix}${item.id}: ${e.message}`);
  }
}

console.log("🌲  Generating 4 tree variants + 6 floor tiles in parallel...\n");
await Promise.all([
  ...TREES.map(t => gen(t, "")),
  ...TILES.map(t => gen(t, "")),
]);
console.log("\n✨  All done!");
