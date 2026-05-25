#!/usr/bin/env python3
"""Batch sprite generator for Param Quest — regenerate all creatures + leaders via Fal AI."""
import os, sys, subprocess, fal_client

SPRITE_DIR = os.path.expanduser("~/parampokemon/public/sprites")

key = os.environ.get("FAL_KEY") or ""
if not key:
    print("ERROR: Set FAL_KEY env var (format: key_id:key_secret)")
    sys.exit(1)
os.environ["FAL_KEY"] = key

def dl(url, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(["curl", "-s", "-o", path, url], check=True)
    return os.path.getsize(path)

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print(f"  [fal] {log['message'].strip()}")

def gen(prompt: str, out_path: str):
    print(f"\n🎨 {os.path.basename(out_path)}")
    result = fal_client.subscribe(
        "fal-ai/nano-banana-2",
        arguments={"prompt": prompt},
        with_logs=True,
        on_queue_update=on_queue_update,
    )
    url = result["images"][0]["url"]
    size = dl(url, out_path)
    print(f"  ✅ saved {size:,} bytes → {out_path}")

SPRITES = [

  # ── CREATURES (9) ───────────────────────────────────────────────
  ("creatures/origin.png",
   "Pixel art RPG creature sprite, a glowing flame-wisp spirit with a wispy flame body "
   "in warm amber #f5b78a and bright yellow core, two large luminous eyes, small trailing flame tendrils, "
   "floating above ground with heat radiating shimmer. Dark warm background. "
   "Limited color palette: burnt orange, amber, golden yellow, dark brown shadow. "
   "Clean pixel art outlines, RPG creature proportions."),

  ("creatures/grp.png",
   "Pixel art RPG creature sprite, a giant multi-legged web crawler spider-robot in forest green #7ac46a "
   "and dark green, six articulated legs, multiple compound glowing eyes, trailing affiliate tag legs, "
   "an armored carapace marked with price tags and dollar signs in pixel detail. "
   "Dark green background shadow. "
   "Limited palette: bright green, dark green, yellow accents, dark shadow tones. "
   "Clean pixel art outlines, RPG creature proportions."),

  ("creatures/hab.png",
   "Pixel art RPG creature sprite, a massive heavy rhinoceros-like construct made of stone bricks and mortar "
   "in warm reddish-brown #c47833, sturdy four-legged stance, armored hide made of stacked bricks, "
   "one small glowing gold HUD light on its chest representing rent payment, small glowing windows for eyes. "
   "Dark stone ground background. "
   "Limited palette: brick red-brown, gold, dark shadow, mortar grey. "
   "Clean pixel art outlines, RPG creature proportions."),

  ("creatures/ai.png",
   "Pixel art RPG creature sprite, a sleek sentient AI chatbot bot in glowing electric cyan #9fe8ff "
   "and deep navy blue, faceted glass head with a glowing chat window inside, circuit-trace body, "
   "two floating holographic interface hands, standing pose on a subtle circuit-floor. "
   "Dark navy background with subtle light glow. "
   "Limited palette: electric cyan, deep navy, bright white highlights, subtle purple. "
   "Clean pixel art outlines, RPG creature proportions."),

  ("creatures/investopad.png",
   "Pixel art RPG creature sprite, a majestic financial growth-falcon made of polished dark navy #f0c4ff "
   "and shimmering gold, wide wings spread showing deal-flow graphs and circuit patterns, "
   "sharp intelligent eyes, talons gripping a glowing golden coin. "
   "Dark dusk background with subtle purple aurora. "
   "Limited palette: deep purple, gold, white highlights, dark shadow. "
   "Clean pixel art outlines, RPG creature proportions."),

  ("creatures/sole.png",
   "Pixel art RPG creature sprite, a sleek streetwear lynx-sneaker beast, hot pink #ff9fd4 body "
   "with white fur highlights, oversized exaggerated sneaker feet, sharp confident eyes, "
   "stylized brand logo markings on chest and forehead, a chain necklace with a sneaker pendant. "
   "Dark mall floor background. "
   "Limited palette: hot pink, white, subtle purple, dark background. "
   "Clean pixel art outlines, RPG creature proportions."),

  ("creatures/fere.png",
   "Pixel art RPG creature sprite, an autonomous AI agent wisp in glowing neon green #00e8a0 "
   "and dark green, a translucent ethereal humanoid form made of flowing light and code, "
   "a glowing terminal/code window on its chest, eyes like green data streams, "
   "tiny orbiting data-symbols around it. "
   "Dark crypto circuit-board background. "
   "Limited palette: neon green, dark green, white highlights, deep black-green. "
   "Clean pixel art outlines, RPG creature proportions."),

  ("creatures/ccd.png",
   "Pixel art RPG creature sprite, a smooth disc-wearing cat music producer in warm golden #ffd29a "
   "and beige, sitting coolly with oversized DJ headphones, a vinyl record disc on its body, "
   "half-open eyes, a tiny glowing speaker next to it. "
   "Dark studio parquet floor background. "
   "Limited palette: warm gold, beige, orange highlight, dark warm shadow. "
   "Clean pixel art outlines, RPG creature proportions."),

  ("creatures/iterate.png",
   "Pixel art RPG creature sprite, a digital iteration spirit fox made of flowing light数据和电路 patterns, "
   "glowing cyan and electric blue core with white highlights, wispy tail of pure light, "
   "sharp intelligent eyes, circuit-trace markings on its body. Floating slightly off the ground. "
   "Dark navy background with subtle glow. "
   "Limited palette: electric cyan, bright white, dark navy outlines, subtle purple accents. "
   "Clean pixel art outlines, RPG creature proportions."),

  # ── GYM LEADERS (regenerate all 9 for consistency) ──────────────
  ("leaders/blankpage.png",
   "Pixel art RPG battle sprite, a ghostly pale figure with flowing translucent hair, "
   "wearing a crimson beret and dark artist clothes, standing behind a large white blank canvas "
   "held in front like a shield. Pale skin, dark shadowy cape, determined blank stare expression. "
   "Standing pose facing viewer. Dark muted background. "
   "Limited palette: ghost white, crimson red beret, charcoal dark clothes, shadow purple. "
   "Clean pixel art outlines, RPG battle sprite proportions."),

  ("leaders/longtail.png",
   "Pixel art RPG battle sprite, a merchant with warm brown skin, styled brown hair, "
   "wearing a bright green merchant apron over dark pants, a price-tag belt with glowing yellow tags, "
   "holding a large golden ledger in one hand. Friendly but sharp-eyed expression. "
   "Standing pose facing viewer. Warm market background. "
   "Limited palette: bright green, golden yellow, warm brown skin, dark pants. "
   "Clean pixel art outlines, RPG battle sprite proportions."),

  ("leaders/zerorunway.png",
   "Pixel art RPG battle sprite, a stern landlord figure with warm skin, short black hair, "
   "wearing a dark warm brown suit with a black tie, holding a large set of golden keys hanging from one hand, "
   "wearing a classic bowler hat. Serious authoritative expression. "
   "Standing pose facing viewer. Office warm lighting background. "
   "Limited palette: dark brown suit, black bowler hat, gold keys, warm skin. "
   "Clean pixel art outlines, RPG battle sprite proportions."),

  ("leaders/prehype.png",
   "Pixel art RPG battle sprite, a scientist in a crisp white lab coat with blue lapels, "
   "dark hair, wearing glowing cyan swim-goggles pushed up on forehead like a headband, "
   "a small blue bowtie, holding a glowing test tube in one hand. Confident eager expression. "
   "Standing pose facing viewer. Lab tech background with faint circuits. "
   "Limited palette: white coat, cyan goggles, dark hair, blue lapels, teal glow. "
   "Clean pixel art outlines, RPG battle sprite proportions."),

  ("leaders/termsheet.png",
   "Pixel art RPG battle sprite, a sharp-dressed VC in a dark navy nearly-black suit, "
   "holding a large white term sheet document in one hand, wearing dark-framed glasses, "
   "pink pocket square on chest, dark polished shoes. Cool calculating expression. "
   "Standing pose facing viewer. Boardroom dark background. "
   "Limited palette: dark navy, near-black suit, white document, pink accent, silver glasses. "
   "Clean pixel art outlines, RPG battle sprite proportions."),

  ("leaders/noculture.png",
   "Pixel art RPG battle sprite, a streetwear skeptic with warm tan skin, "
   "wearing a hot pink oversized hoodie with dark pants and white high sneakers, "
   "a gold chain necklace visible, dark baseball cap pulled low, dark sunglasses. "
   "Arms crossed confidently. Cool skeptical expression. "
   "Standing pose facing viewer. Urban street dark background. "
   "Limited palette: hot pink hoodie, dark pants, gold chain, white sneakers, tan skin. "
   "Clean pixel art outlines, RPG battle sprite proportions."),

  ("leaders/blackbox.png",
   "Pixel art RPG battle sprite, a hooded faceless crypto-figure entirely wrapped in a dark navy hooded cloak, "
   "face hidden in deep shadow, only two glowing bright green phosphor eyes visible in the void of the hood, "
   "a small glowing green ticker-tape on the chest showing price data, hooded silhouette standing tall. "
   "Standing pose facing viewer. Dark crypto grid background. "
   "Limited palette: dark navy cloak, bright glowing green eyes, brighter green ticker, near-black shadow. "
   "Clean pixel art outlines, RPG battle sprite proportions."),

  ("leaders/nobrief.png",
   "Pixel art RPG battle sprite, a sleek corporate manager with warm skin, warm reddish-brown short hair, "
   "wearing a crisp deep blue button-up shirt with red tie, holding a large tan clipboard against chest, "
   "dark pants and black shoes. Angry determined expression with furrowed brow. "
   "Standing pose facing viewer. Corporate office background. "
   "Limited palette: deep blue shirt, red tie, tan clipboard, dark pants, warm skin. "
   "Clean pixel art outlines, RPG battle sprite proportions."),

  ("leaders/statusquo.png",
   "Pixel art RPG battle sprite, regal king warrior figure wearing ornate dark steel plate armor, "
   "flowing deep crimson red cape, a three-spike golden crown on head, "
   "holding an ornate golden scepter in left hand, right hand in power fist, "
   "facing forward in wide combat stance. Angry brow, intense regal expression. "
   "Dark steel armour, crimson cape, gold crown and scepter. "
   "Limited palette: dark steel grey, crimson red cape, gold accents, flesh tone face. "
   "Clean pixel art outlines, RPG battle sprite proportions."),
]

for path, prompt in SPRITES:
    out = f"{SPRITE_DIR}/{path}"
    gen(prompt, out)

print(f"\n✅ All {len(SPRITES)} sprites generated!")
