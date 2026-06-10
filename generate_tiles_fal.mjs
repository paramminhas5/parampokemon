#!/usr/bin/env node
/**
 * Param Quest — FAL.ai Tile Asset Generator
 * Generates high-res painted tileset images for the game world.
 * Usage: FAL_KEY=your_key node generate_tiles_fal.mjs [tile_id]
 */

import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("Set FAL_KEY env var first");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const TILE_STYLE = `top-down view, seamless tileable texture, game asset, vibrant colors, soft painterly RPG style, no text, no UI, no characters, high detail, square aspect ratio`;

const TILES = {
  grass: {
    prompt: `${TILE_STYLE}, lush green grass ground tile, varied green tones with subtle blade texture, sunlit patches, tiny clover details, natural organic feel, Pokemon RPG overworld grass, emerald and lime palette`,
    size: 512,
  },
  tree: {
    prompt: `top-down view, single round tree with lush green canopy, dark outline around canopy, visible trunk from above, cast shadow on grass below, RPG game tree sprite, vibrant green foliage with dappled sunlight highlights, painterly style, no text, square, isolated on transparent or grass background`,
    size: 512,
  },
  water: {
    prompt: `${TILE_STYLE}, crystal clear blue water surface, subtle ripples and light caustics, slight depth gradient from dark blue to lighter cerulean, gentle foam edges, dreamy reflective Pokemon-style water, seamless tileable`,
    size: 512,
  },
  path: {
    prompt: `${TILE_STYLE}, dirt path ground tile, packed earth with small pebbles and gravel, warm brown tones, subtle footpath wear marks, natural earthy texture, RPG overworld walking path, tan and sienna palette`,
    size: 512,
  },
  building_wall: {
    prompt: `${TILE_STYLE}, painted house wall facade tile, cream colored plaster with wooden window frame containing blue glass panes, window sill with flower box, lap-board siding texture, cozy RPG town building, warm cream and brown palette`,
    size: 512,
  },
  building_roof: {
    prompt: `${TILE_STYLE}, red tile roof top-down view, overlapping clay shingles in warm terracotta red, ridge line detail, slight shadow between rows, classic Pokemon town rooftop, seamless tileable, red and brown palette`,
    size: 512,
  },
  flower: {
    prompt: `${TILE_STYLE}, grass tile with colorful flower cluster, red and yellow wildflowers scattered on green grass, small blooms with visible petals, cheerful garden RPG ground tile, vibrant colors on lush green base`,
    size: 512,
  },
};

async function generateTile(id) {
  const tile = TILES[id];
  if (!tile) {
    console.error(`Unknown tile: ${id}. Available: ${Object.keys(TILES).join(", ")}`);
    process.exit(1);
  }

  const outDir = "public/sprites/tiles";
  mkdirSync(outDir, { recursive: true });
  const outPath = `${outDir}/${id}.png`;

  console.log(`🎨 Generating tile: ${id}`);
  console.log(`   Prompt: ${tile.prompt.substring(0, 100)}...`);

  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: tile.prompt,
      image_size: { width: tile.size, height: tile.size },
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: false,
    },
  });

  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error("No image URL in response");

  const resp = await fetch(imageUrl);
  const buf = Buffer.from(await resp.arrayBuffer());
  writeFileSync(outPath, buf);
  console.log(`✅ Saved: ${outPath}`);
  console.log(`🔗 Source URL: ${imageUrl}`);
  return imageUrl;
}

// Run specific tile or all
const targetId = process.argv[2];
if (targetId) {
  generateTile(targetId).catch(console.error);
} else {
  console.log("Generating ALL tiles...\n");
  (async () => {
    for (const id of Object.keys(TILES)) {
      await generateTile(id);
      await new Promise(r => setTimeout(r, 500));
    }
    console.log("\n✨ All tiles generated!");
  })().catch(console.error);
}
