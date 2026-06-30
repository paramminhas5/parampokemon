#!/usr/bin/env node
import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";

fal.config({ credentials: process.env.FAL_KEY });

const BUILDINGS = [
  { id: "origin",     prompt: "top-down view of a sandy workshop building, warm tan plaster walls, dark brown tiled roof, wooden double doors, arched windows, startup studio feel, Indian market aesthetic, painterly RPG game art style, no text no characters, square format" },
  { id: "grp",        prompt: "top-down view of a market shop building, green striped awning over entrance, cream painted walls, display windows with items inside, cheerful merchant retail building, painterly RPG game art style, no text no characters, square format" },
  { id: "hab",        prompt: "top-down view of a brick apartment building, terracotta orange brick walls, dark brown flat roof, multiple lit windows on facade, front door with small steps, budget housing block, painterly RPG game art style, no text no characters, square format" },
  { id: "ai",         prompt: "top-down view of a futuristic AI tech lab building, dark navy walls, glowing blue cyan neon light trim, glass windows emitting cyan light, sci-fi research facility entrance, painterly RPG game art style, no text no characters, square format" },
  { id: "investopad", prompt: "top-down view of a luxury venture capital office building, deep purple polished walls, gold trim accents, grand arched entrance with columns, prestigious corporate building, painterly RPG game art style, no text no characters, square format" },
  { id: "sole",       prompt: "top-down view of a sneaker and streetwear shop, hot pink neon exterior, large glass display windows showing shoes, trendy graffiti art side panel, urban retail store, painterly RPG game art style, no text no characters, square format" },
  { id: "fere",       prompt: "top-down view of a crypto trading floor building, dark forest green walls, subtle circuit board pattern details, glowing green accent lights around entrance, fintech office building, painterly RPG game art style, no text no characters, square format" },
  { id: "ccd",        prompt: "top-down view of a cozy music studio building, warm amber and brown wood paneling exterior, vintage signholder above door, small stage light visible through window, creative studio feel, painterly RPG game art style, no text no characters, square format" },
  { id: "iterate",    prompt: "top-down view of a modern AI agency headquarters building, sleek midnight blue glass facade, electric white light accents, clean minimalist entrance, premium tech company office, painterly RPG game art style, no text no characters, square format" },
];

const TERRAIN = [
  { id: "tree",  prompt: "top-down view single round tree, lush dark green canopy with lighter dappled highlights, visible brown trunk from above, natural soft shadow, classic Pokemon RPG overworld tree, isolated on white background, painterly game art, no text, square format" },
  { id: "water", prompt: "seamless top-down water texture tile, deep blue water with animated shimmer ripple lines, light caustics and gentle foam, crystal clear Pokemon RPG river water feel, tileable game asset, painterly, no text no characters, square format" },
  { id: "path",  prompt: "seamless top-down dirt path tile, warm packed brown earth texture, small scattered pebbles and gravel, natural worn footpath, classic Pokemon RPG overworld walking path, tileable game asset, painterly, no text no characters, square format" },
  { id: "sand",  prompt: "seamless top-down sandy ground tile, warm golden sand texture, subtle ripple lines in sand, soft natural desert feel, Pokemon RPG town sand ground, tileable game asset, painterly, no text no characters, square format" },
  { id: "stone", prompt: "seamless top-down cobblestone tile, warm terracotta brick and mortar pattern, classic town courtyard paving, Pokemon RPG overworld stone floor, tileable game asset, painterly, no text no characters, square format" },
];

mkdirSync("public/sprites/tiles", { recursive: true });

async function gen(item, prefix = "") {
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
  const filename = `public/sprites/tiles/${prefix}${item.id}.png`;
  writeFileSync(filename, buf);
  console.log(`✅ ${filename}  →  ${url}`);
}

console.log("🏗  Generating buildings + terrain tiles in parallel...\n");
const all = [
  ...BUILDINGS.map(b => gen(b, "building_")),
  ...TERRAIN.map(t => gen(t, "")),
];
await Promise.all(all);
console.log("\n✨ All done!");
