#!/usr/bin/env python3
"""
Generate all creature + gym leader sprites for Param Quest via Fal AI.

Uses fal-ai/flux/dev (highest quality).
All sprites are Pokémon-style pixel art battle sprites.

Usage:
  FAL_KEY=your_key python3 generate_all_sprites.py
"""
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
    size = os.path.getsize(path)
    print(f"  ✅ {size:,} bytes → {path}")
    return size

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            msg = log.get("message", "").strip()
            if msg:
                print(f"  [fal] {msg}")

def gen(label, prompt, out_path):
    print(f"\n🎨 {label}")
    try:
        result = fal_client.subscribe(
            "fal-ai/flux/dev",
            arguments={
                "prompt": prompt,
                "image_size": "square_hd",
                "num_inference_steps": 28,
                "guidance_scale": 3.5,
                "num_images": 1,
                "enable_safety_checker": False,
            },
            with_logs=True,
            on_queue_update=on_queue_update,
        )
        url = result["images"][0]["url"]
        dl(url, out_path)
    except Exception as e:
        print(f"  ❌ flux/dev error: {e}. Trying nano-banana-2...")
        try:
            result = fal_client.subscribe(
                "fal-ai/nano-banana-2",
                arguments={"prompt": prompt},
                with_logs=False,
                on_queue_update=lambda u: None,
            )
            url = result["images"][0]["url"]
            dl(url, out_path)
        except Exception as e2:
            print(f"  ❌ Fallback failed: {e2}")

# ─── Shared style tags ───────────────────────────────────────────────────────
CREATURE_STYLE = (
    "Pokémon-style RPG creature battle sprite. "
    "Classic 16-bit pixel art, crisp clean outlines, vibrant limited color palette, "
    "cute stylized monster proportions, single creature centered on plain dark background, "
    "no text, no UI, facing slightly left in classic Pokémon battle pose. "
    "High contrast, clean pixel edges, expressive eyes."
)

LEADER_STYLE = (
    "Pokémon-style RPG gym leader battle sprite, facing the viewer in battle stance. "
    "Classic 16-bit pixel art, crisp clean outlines, vibrant limited color palette, "
    "full human figure (head to feet), confident battle expression, "
    "single character centered on plain dark background, no text, no UI, "
    "high contrast, clean pixel edges. Pokémon FireRed/HeartGold art style."
)

NEG = (
    "photo-realistic, blurry, noisy, watermark, text, low quality, "
    "multiple characters, background details, UI elements, 3d render"
)

SPRITES = [

  # ── CREATURES (9 zones) ──────────────────────────────────────────────────────

  ("creatures/origin.png",
   "Origin — Spark",
   f"A glowing star-burst vision spirit creature. Warm golden amber body ({chr(35)}f5b78a) shaped like a "
   f"cross/star with a bright white-yellow glowing core. Large luminous sparkle eyes. "
   f"Radiating warmth and energy, four short pointed limbs, tiny flame wisps at tips. "
   f"Name: Sparkling. Type: Vision. Dark warm background. {CREATURE_STYLE}"),

  ("creatures/grp.png",
   "GRP — Crawler",
   f"A web-crawler spider-robot creature. Forest green ({chr(35)}7ac46a) armored carapace body, "
   f"six articulated mechanical legs with data-cable tendril ends, "
   f"six compound glowing yellow-green eyes, small price-tag icons embedded on shell, "
   f"affiliate links dangling as extra antennae. Dark background. {CREATURE_STYLE}"),

  ("creatures/hab.png",
   "Hab — Opsros (Rhino)",
   f"A heavy armored rhinoceros creature made of warm terracotta brick and mortar ({chr(35)}c47833). "
   f"Stocky powerful four-legged stance, hide made of stacked bricks with mortar lines, "
   f"a single glowing golden horn, small warm yellow windows for eyes. "
   f"Operator vibe — reliable and sturdy. Dark stone background. {CREATURE_STYLE}"),

  ("creatures/ai.png",
   "AI — Bottoflux",
   f"A sleek AI chatbot creature in electric cyan ({chr(35)}9fe8ff) and deep navy. "
   f"Smooth faceted crystalline head with a glowing blue chat-message window inside, "
   f"circuit-trace body with flowing energy lines, two floating holographic interface hands. "
   f"Intelligent and futuristic. Dark navy background with circuit glow. {CREATURE_STYLE}"),

  ("creatures/investopad.png",
   "Investopad — Capitalcon",
   f"A majestic capital falcon bird creature in deep purple ({chr(35)}f0c4ff) and gold. "
   f"Wide wings spread showing deal-flow bar chart patterns and deal memo lines, "
   f"sharp intelligent eyes, gold-tipped feathers, talons gripping a glowing golden coin stack. "
   f"Regal powerful venture energy. Dark purple dusk background. {CREATURE_STYLE}"),

  ("creatures/sole.png",
   "Sole — Sneakynx",
   f"A streetwear lynx-cat creature, hot pink ({chr(35)}ff9fd4) body with white fur belly, "
   f"oversized exaggerated sneaker feet and paws, sharp confident squinting eyes, "
   f"brand logo markings on chest, hype culture energy. "
   f"Cool and stylish. Dark mall floor background. {CREATURE_STYLE}"),

  ("creatures/fere.png",
   "Fere — Agentwisp",
   f"An autonomous AI agent wisp creature in neon mint green ({chr(35)}00e8a0). "
   f"Translucent ethereal humanoid form made of flowing light and scrolling code text, "
   f"a glowing green terminal window on its chest, eyes like bright data-streams, "
   f"tiny orbiting data symbols and crypto tokens around it. "
   f"Dark crypto PCB board background. {CREATURE_STYLE}"),

  ("creatures/ccd.png",
   "CCD — Discocat",
   f"A cool cat creature wearing oversized DJ headphones, warm golden ({chr(35)}ffd29a) and beige, "
   f"sitting coolly with a vinyl record disc incorporated in its body, "
   f"half-lidded knowing eyes, tiny glowing speaker next to it, "
   f"musical note tail curling up. Soul creative energy. Dark studio background. {CREATURE_STYLE}"),

  ("creatures/iterate.png",
   "Iterate — Iteratron (Core)",
   f"A digital iteration spirit fox, glowing electric cyan ({chr(35)}7ce0ff) and bright white, "
   f"geometric faceted crystal body with flowing data-stream tails, "
   f"circuit-trace markings, sharp intelligent eyes, floating slightly off ground, "
   f"aura of stacked hexagon data-layers surrounding it. "
   f"Champion energy — powerful and elegant. Dark navy background. {CREATURE_STYLE}"),


  # ── GYM LEADERS (9) ──────────────────────────────────────────────────────────

  ("leaders/blankpage.png",
   "Leader: The Blank Page",
   f"Gym leader: ghostly pale artist holding a blank white canvas shield. "
   f"Dark moody artist outfit — flowing dark cape, crimson beret, pale skin, dark hollow eyes, "
   f"expressive dramatic posture, holding the blank canvas in front. "
   f"Eerie creative dread energy. Dark muted grey background. {LEADER_STYLE}"),

  ("leaders/longtail.png",
   "Leader: The Long Tail",
   f"Gym leader: energetic young e-commerce merchant in bright green. "
   f"Warm skin, styled hair, bright green merchant vest over white shirt, "
   f"yellow price-tag belt with glowing tags, holding a golden ledger open, "
   f"confident excited expression. Market energy. {LEADER_STYLE}"),

  ("leaders/zerorunway.png",
   "Leader: Zero Runway",
   f"Gym leader: stern bootstrapped founder in a dark warm brown suit. "
   f"Short black hair, classic dark bowler hat, dark brown business suit, black tie, "
   f"holding a large golden key ring in one hand, serious authoritative expression, "
   f"real-estate operator energy. {LEADER_STYLE}"),

  ("leaders/prehype.png",
   "Leader: Pre-Hype Market",
   f"Gym leader: an excited AI researcher in a white lab coat. "
   f"Dark hair, glowing cyan goggle-glasses pushed up on forehead, blue lapels on coat, "
   f"holding a glowing electric blue test tube, small blue bowtie, eager confident expression. "
   f"Pre-AI-boom energy — early believer. {LEADER_STYLE}"),

  ("leaders/termsheet.png",
   "Leader: Term Sheet",
   f"Gym leader: sharp power-broker VC investor in dark navy almost-black suit. "
   f"Dark-framed glasses, slicked-back hair, pink pocket square, "
   f"holding a large white term sheet document, cool calculating expression, "
   f"one eyebrow raised in challenge. Boardroom energy. {LEADER_STYLE}"),

  ("leaders/noculture.png",
   "Leader: No Sneaker Culture",
   f"Gym leader: streetwear skeptic in an oversized hot pink hoodie. "
   f"Warm tan skin, dark baseball cap pulled low, dark sunglasses, "
   f"gold chain necklace, white high sneakers with dark pants, "
   f"arms crossed confidently with a smirk. Hype-culture energy. {LEADER_STYLE}"),

  ("leaders/blackbox.png",
   "Leader: The Black Box",
   f"Gym leader: mysterious faceless crypto figure in a dark hooded cloak. "
   f"Entire figure cloaked in deep dark navy, face completely hidden in shadow, "
   f"only two intensely bright glowing green phosphor-dot eyes visible in the void hood, "
   f"a glowing green price ticker on the chest, tall ominous silhouette. "
   f"Invisible autonomous AI energy. Dark background. {LEADER_STYLE}"),

  ("leaders/nobrief.png",
   "Leader: No Brief",
   f"Gym leader: frustrated corporate manager in a deep blue button shirt. "
   f"Warm skin, neat reddish-brown hair, deep blue shirt with red tie, "
   f"holding a large tan clipboard tight to their chest, "
   f"angry furrowed brow expression, looking for a brief that doesn't exist. "
   f"Creative/client energy. {LEADER_STYLE}"),

  ("leaders/statusquo.png",
   "Leader: The Status Quo (Champion)",
   f"Final champion: regal armored king warrior in dark steel plate armor. "
   f"Ornate dark steel full plate armor with engravings, flowing deep crimson cape, "
   f"a gleaming three-spike golden crown, holding a ornate golden scepter, "
   f"power fist raised, wide combat stance, intense regal expression. "
   f"Final boss champion energy — imposing and powerful. {LEADER_STYLE}"),
]

print(f"🚀 Generating {len(SPRITES)} sprites (fal-ai/flux/dev)...\n")
for path, label, prompt in SPRITES:
    gen(label, prompt, f"{SPRITE_DIR}/{path}")

print(f"\n✅ Done! {len(SPRITES)} sprites generated.")
print(f"📁 Saved to: {SPRITE_DIR}/")
