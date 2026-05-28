#!/usr/bin/env node
import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

fal.config({ credentials: process.env.FAL_KEY });

const SHARED = "GBA Pokemon FireRed style character sprite, 96x96 pixel art, single shadow tone cel shading, bold black outlines, no anti-aliasing, crisp pixel edges, transparent background, centered single character full body portrait facing camera, no text, no UI";

const LEADERS = [
  { id: "blankpage",  prompt: `${SHARED}, ghostly pale artist villain, holding a large blank white canvas in front, black beret hat, dark charcoal smock, hollow dark eyes, pale mist aura, monochrome charcoal and cream palette, intimidating creative block energy` },
  { id: "longtail",   prompt: `${SHARED}, cheerful green-aproned merchant character, warm brown hair, holding a catalog ledger book, multiple yellow price tags dangling from belt, kind but shrewd expression, earth-tone green and brown palette, shopkeeper boss energy` },
  { id: "zerorunway", prompt: `${SHARED}, stern stern landlord villain in dark bowler hat and brown waistcoat, holding a large brass keyring with many keys, furrowed brow severe expression, pocket watch chain, imposing stance, dark brown and black palette, zero mercy energy` },
  { id: "prehype",    prompt: `${SHARED}, excited scientist character in white lab coat, oversized round goggles, wild spiky hair, colorful data chart patterns printed on lab coat, bowtie, holding a glowing test tube, enthusiastic expression, white and cyan palette, chatbot AI pioneer energy` },
  { id: "termsheet",  prompt: `${SHARED}, sharp venture capitalist villain in dark navy suit, holding a rolled term sheet document scroll, rectangular black glasses, slicked back dark hair, evaluating cold expression, navy and gold palette, power stance investor energy` },
  { id: "noculture",  prompt: `${SHARED}, streetwear skeptic villain, backwards black cap, hot pink hoodie with gold chain necklace, dark sunglasses, arms folded dismissive pose, sneakers visible, cool dismissive expression, hot pink and black palette, hype culture gatekeeper energy` },
  { id: "blackbox",   prompt: `${SHARED}, mysterious hooded crypto figure, face entirely hidden in shadow under dark hood, two glowing green eyes visible in hood void, dark cloak with circuit board patterns, holographic green ticker symbols floating around body, black and matrix green palette, unknowable presence` },
  { id: "nobrief",    prompt: `${SHARED}, frustrated corporate manager in blue suit red tie, holding a clipboard with blank documents, pointed index finger lecturing pose, pen tucked behind ear, furrowed demanding expression, blue and red palette, demanding client villain energy` },
  { id: "statusquo",  prompt: `${SHARED}, imposing final boss king villain in golden crown and deep crimson cape, armored chest plate with three horizontal bars emblem, multiple medals on chest, glowing red eyes commanding expression, grand royal pose, gold and crimson palette, ultimate champion status quo villain` },
];

const OUT = "public/sprites/leaders";
const PREV = "public/sprites/_preview";
mkdirSync(OUT, { recursive: true });

async function gen(id, prompt) {
  console.log(`[${id}]`);
  const r = await fal.subscribe("fal-ai/flux/schnell", {
    input: { prompt, image_size: { width: 1024, height: 1024 }, num_inference_steps: 4, num_images: 1, enable_safety_checker: false },
  });
  const url = r.data?.images?.[0]?.url;
  const rawBuf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(join(PREV, `${id}_raw.png`), rawBuf);

  let cutUrl;
  try {
    const cut = await fal.subscribe("fal-ai/birefnet/v2", { input: { image_url: url } });
    cutUrl = cut.data?.image?.url || cut.data?.images?.[0]?.url;
  } catch (e) { console.log(`  bg-rem failed: ${e.message}`); }

  const finalBuf = cutUrl ? Buffer.from(await (await fetch(cutUrl)).arrayBuffer()) : rawBuf;
  writeFileSync(join(OUT, `${id}.png`), finalBuf);
  writeFileSync(join(PREV, `${id}.png`), finalBuf);
  console.log(`  ✓`);
}

(async () => {
  for (const l of LEADERS) await gen(l.id, l.prompt);
  console.log("done");
})().catch(e => { console.error(e); process.exit(1); });
