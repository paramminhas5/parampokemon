#!/usr/bin/env node
/**
 * Single-shot FAL sprite generator for iterative approval flow.
 * Usage: FAL_KEY=xxx node scripts/fal_one.mjs <id> "<prompt>" [outDir]
 */
import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("FAL_KEY not set");
  process.exit(1);
}
fal.config({ credentials: FAL_KEY });

const id = process.argv[2];
const prompt = process.argv[3];
const outDir = process.argv[4] || "public/sprites/_preview";
const size = parseInt(process.argv[5] || "1024", 10);

if (!id || !prompt) {
  console.error("usage: fal_one.mjs <id> <prompt> [outDir] [size]");
  process.exit(1);
}

const NEG = "blurry, painterly, soft edges, photorealistic, 3d render, anti-aliasing, gradient, smooth shading, multiple characters, anime, watermark, text, signature, noise, deformed, extra limbs, low quality";

console.log(`generating ${id} at ${size}x${size}...`);

try {
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt,
      image_size: { width: size, height: size },
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: false,
    },
    logs: false,
  });

  const url = result.data?.images?.[0]?.url;
  if (!url) throw new Error("no image url");

  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `${id}.png`);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(out, buf);
  console.log(`saved: ${out}`);
  console.log(`url: ${url}`);
} catch (e) {
  console.error("failed:", e.message);
  process.exit(1);
}
