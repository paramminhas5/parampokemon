#!/usr/bin/env python3
"""
Generate premium landmark sprites for Param Quest via Fal AI.

Uses fal-ai/flux/dev for highest quality output.
Each landmark is a beautiful pixel-art RPG world building — Pokémon FireRed / HeartGold style.
Output: 512×512 PNG for each zone's landmark, saved to public/sprites/landmarks/

Usage:
  FAL_KEY=your_key python3 generate_landmarks_v2.py
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

def gen(label, prompt, out_path, negative=""):
    print(f"\n🏘️  Generating: {label}")
    try:
        args = {
            "prompt": prompt,
            "image_size": "square_hd",   # 1024×1024 — highest res
            "num_inference_steps": 28,
            "guidance_scale": 3.5,
            "num_images": 1,
            "enable_safety_checker": False,
        }
        if negative:
            args["negative_prompt"] = negative

        result = fal_client.subscribe(
            "fal-ai/flux/dev",
            arguments=args,
            with_logs=True,
            on_queue_update=on_queue_update,
        )
        url = result["images"][0]["url"]
        dl(url, out_path)
    except Exception as e:
        print(f"  ❌ Error: {e}")
        # Fallback to schnell if dev fails
        try:
            print("  ↩️  Falling back to flux/schnell...")
            result = fal_client.subscribe(
                "fal-ai/flux/schnell",
                arguments={"prompt": prompt, "image_size": "square_hd"},
                with_logs=False,
                on_queue_update=lambda u: None,
            )
            url = result["images"][0]["url"]
            dl(url, out_path)
        except Exception as e2:
            print(f"  ❌ Fallback also failed: {e2}")

# ─── Shared style suffix applied to every landmark prompt ─────────────────────
STYLE = (
    "Pokémon FireRed / HeartGold overworld building pixel art. "
    "Classic JRPG top-down RPG building sprite. "
    "Crisp clean pixel art outlines, limited warm color palette, "
    "charming cute proportions, bright cheerful colors, "
    "pixel art style, 16-bit retro RPG aesthetic, "
    "single building centered on transparent or simple sky background. "
    "No text or letters. No people. High contrast. Square composition."
)

NEG = (
    "photo-realistic, 3d render, blurry, noisy, watermark, text, "
    "signature, ugly, deformed, low quality, modern UI, UI elements, "
    "multiple buildings, cityscape panorama, street-level view"
)

LANDMARKS = [
    (
        "Home — Pallet Town",
        "landmarks/home.png",
        f"Cozy warm childhood home, small charming cottage with cream-yellow walls, "
        f"terracotta red sloped roof, glowing warm yellow square windows, small red front door, "
        f"white picket fence garden with red and yellow flowers, bright green grass, "
        f"a big leafy oak tree beside the house, soft blue sky with fluffy white clouds. "
        f"Warm nostalgic peaceful home feel. {STYLE}",
    ),
    (
        "Origin Town — Workshop",
        "landmarks/origin.png",
        f"Creative maker's home studio workshop, warm amber wooden building, "
        f"dark wood sloped roof, a big bright window with a glowing monitor visible inside, "
        f"an acoustic guitar leaning against the wall outside, open notebook on a bench, "
        f"warm fairy string lights across the eave, golden sunset sky background. "
        f"Maker/creative/founder vibe. Warm amber gold tones. {STYLE}",
    ),
    (
        "GRP Market",
        "landmarks/grp.png",
        f"Vibrant open-air Indian e-commerce market, colorful market stall building with "
        f"bright green awnings and striped canopies, wooden market counters with items displayed, "
        f"a big yellow price comparison signboard above the entrance with numbers, "
        f"green and yellow market colors, fruit carts and baskets outside, "
        f"bright sunny market day scene. {STYLE}",
    ),
    (
        "Hab District — Apartment",
        "landmarks/hab.png",
        f"Tall charming urban rental apartment building, warm terracotta brick-red facade, "
        f"3 floors with small balconies holding potted plants and laundry lines, "
        f"glowing golden FOR RENT sign above dark arched doorway, "
        f"stone-paved courtyard in front, warm Bengaluru sunset light, warm terracotta gold palette. {STYLE}",
    ),
    (
        "Quartic Lab — AI Lab",
        "landmarks/ai.png",
        f"Sleek AI technology research lab building, dark navy blue glass facade, "
        f"glowing electric cyan circuit trace lines running across the entire building exterior, "
        f"a large glowing cyan AI brain chip symbol above the main entrance, "
        f"small blinking green server indicator lights in narrow windows, "
        f"dark twilight sky with glowing cyan stars. Deep navy and electric cyan palette. {STYLE}",
    ),
    (
        "Investopad Tower",
        "landmarks/investopad.png",
        f"Elegant prestigious venture capital tower building, deep purple twilight glass facade, "
        f"tall corporate tower with glowing violet-pink neon accent edges on each floor, "
        f"a large gold trophy emblem above the grand entrance, "
        f"marble lobby visible through glass doors glowing warm gold, "
        f"purple twilight sky with stars. Deep purple, violet neon, warm gold palette. {STYLE}",
    ),
    (
        "SoleSearch Mall",
        "landmarks/sole.png",
        f"Vibrant streetwear sneaker boutique mall, dark charcoal exterior with deep purple trim, "
        f"a massive glowing hot pink neon SOLE sign across the storefront, "
        f"large glass display windows showing shelves of colorful sneakers, "
        f"a hot pink neon sneaker logo above the entrance door, "
        f"pink welcome mat on the ground, cool urban night sky. "
        f"Hot pink neon, dark charcoal, white sneaker displays. {STYLE}",
    ),
    (
        "Fere District — AI Crypto",
        "landmarks/fere.png",
        f"Crypto AI trading platform headquarters, dark forest green glass building, "
        f"glowing neon green (#00e8a0) circuit board traces across the entire facade like PCB lines, "
        f"a large glowing green AI agent symbol above the entrance, "
        f"floating green data ticker symbols along the building edge, "
        f"dark night sky with green data particle effects. "
        f"Deep forest green, neon #00e8a0 mint green, black glass. {STYLE}",
    ),
    (
        "Cats Can Dance Studio",
        "landmarks/ccd.png",
        f"Warm creative music studio and pet brand headquarters, "
        f"warm amber wood-paneled building, large studio speakers displayed beside the entrance, "
        f"a cute sleeping cat on the welcome mat by the door, "
        f"a glowing music note sign above the entrance, "
        f"string fairy lights across the front awning, golden hour warm glow inside. "
        f"Warm amber, golden honey, cozy creative vibes. {STYLE}",
    ),
    (
        "Iterate HQ",
        "landmarks/iterate.png",
        f"Modern AI-native marketing agency headquarters, dark navy blue and deep indigo glass tower, "
        f"glowing electric cyan circuit pattern lines on the facade forming a digital brain shape, "
        f"a stylized glowing infinity loop symbol above the grand entrance, "
        f"small glowing blue data nodes blinking along the building edges, "
        f"tall glass windows with cool cyan-white interior glow, "
        f"deep navy night sky with aurora and stars. Deep navy, electric cyan, glowing white. {STYLE}",
    ),
]

print(f"🚀 Generating {len(LANDMARKS)} landmark sprites (fal-ai/flux/dev, 1024×1024)...\n")
for label, path, prompt in LANDMARKS:
    gen(label, prompt, f"{SPRITE_DIR}/{path}", NEG)

print(f"\n✅ Done! {len(LANDMARKS)} landmark sprites generated.")
print(f"📁 Saved to: {SPRITE_DIR}/landmarks/")
