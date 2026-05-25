#!/usr/bin/env python3
"""Regenerate all 10 landmark buildings for Param Quest via Fal AI."""
import os, sys, subprocess, fal_client

SPRITE_DIR = os.path.expanduser("~/parampokemon/public/sprites")
key = os.environ.get("FAL_KEY") or ""
if not key:
    print("ERROR: Set FAL_KEY env var")
    sys.exit(1)
os.environ["FAL_KEY"] = key

def dl(url, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(["curl", "-s", "-o", path, url], check=True)

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print(f"  [fal] {log['message'].strip()}")

def gen(prompt, out_path):
    print(f"\n🏛️ {os.path.basename(out_path)}")
    result = fal_client.subscribe(
        "fal-ai/nano-banana-2",
        arguments={"prompt": prompt},
        with_logs=True,
        on_queue_update=on_queue_update,
    )
    url = result["images"][0]["url"]
    dl(url, out_path)
    print(f"  ✅ saved → {out_path}")

LANDMARKS = [
    ("landmarks/home.png",
     "Pixel art game asset, a cozy small home exterior in a grassy field, warm cream-colored walls, "
     "red-tiled sloping roof, a small red door, a large bright window with warm golden light inside, "
     "a small chimney with wisps of smoke, surrounded by green grass and tiny flowers. "
     "Bright daytime scene. Warm inviting palette: cream walls, red roof, green grass, blue sky. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),

    ("landmarks/origin.png",
     "Pixel art game asset, a small humble creative studio building, warm sandy/stone exterior walls, "
     "a simple dark wood sloped roof, a large open window showing a desk with a glowing computer monitor, "
     "bookshelves on one wall, a guitar leaning against the corner, fairy lights around the window. "
     "Warm golden hour lighting. Palette: warm sand, golden light, dark wood, soft amber tones. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),

    ("landmarks/grp.png",
     "Pixel art game asset, a bustling e-commerce price comparison marketplace stall, "
     "bright green market awning with yellow price-tag decorations, wooden market counter stalls, "
     "screens showing product listings and price graphs, green dollar signs and deal tags everywhere, "
     "a small Indian street-market vibe. Bright energetic market atmosphere. "
     "Palette: bright green, yellow tags, warm brown wood, sky blue. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),

    ("landmarks/hab.png",
     "Pixel art game asset, a medium apartment building with stacked rental unit balconies, "
     "warm terracotta brick exterior, dark red-brown roof, small balconies with potted plants and laundry, "
     "a glowing gold rent-payment sign above the door, warm Bengaluru sunset lighting. "
     "Palette: warm terracotta red-brown, gold accents, green plant pots, dark roof, warm sky. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),

    ("landmarks/ai.png",
     "Pixel art game asset, a sleek tech lab headquarters building, dark navy blue glass exterior, "
     "glowing cyan circuit trace lines running along the facade, a large glowing AI chatbot icon above the door, "
     "small server room windows with blinking green lights, neon blue sign reading 'QUARTIC'. "
     "Dark cyberpunk tech atmosphere. Palette: deep navy blue, electric cyan, glowing white circuits, black glass. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),

    ("landmarks/investopad.png",
     "Pixel art game asset, an elegant venture capital tower building, dark dusk purple glass facade, "
     "glowing pink and violet neon accents on the edges, a golden trophy emblem above the entrance, "
     "tall prestigious corporate windows with warm interior lighting, a marble-style lobby visible through glass doors, "
     "twilight city atmosphere. Palette: deep purple, violet neon, gold accents, warm yellow interior glow. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),

    ("landmarks/sole.png",
     "Pixel art game asset, a stylish sneaker and streetwear boutique store building, "
     "dark charcoal and deep purple exterior walls, a huge glowing hot pink neon sign reading 'SOLE' in bold pixel font, "
     "large glass display windows showing shelves of colorful sneakers, a small sneaker logo above the door, "
     "pink welcome mat, potted plant beside entrance. Vibrant urban retail atmosphere. "
     "Palette: hot pink neon, deep purple walls, white sneakers, charcoal dark. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),

    ("landmarks/fere.png",
     "Pixel art game asset, a crypto AI trading platform headquarters, dark green dark glass building facade, "
     "glowing neon green circuit board traces running across the building, a large glowing green AI brain icon above the door, "
     "floating green data ticker symbols, a glowing green terminal window entrance. "
     "Dark crypto tech atmosphere with green neon glow. Palette: dark forest green glass, neon #00e8a0 green, black, white data. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),

    ("landmarks/ccd.png",
     "Pixel art game asset, a warm creative music studio and pet brand headquarters building, "
     "warm golden-amber wooden exterior, a large pixel art speaker symbol above the door, "
     "guitar and cat silhouette decorations, glowing warm studio window light inside, "
     "a small cat silhouette sitting outside, warm golden hour lighting. "
     "Palette: warm amber wood, golden light, dark wood accents, soft orange glow. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),

    ("landmarks/iterate.png",
     "Pixel art game asset, a modern AI-native marketing agency headquarters building, "
     "dark glass facade with deep blue and purple tones, glowing cyan circuit pattern lines on the exterior, "
     "a stylized iteration loop infinity symbol above the door, small glowing data nodes along the facade, "
     "tall dark glass windows with blue-white interior glow, a sleek futuristic entrance. "
     "Dark tech agency atmosphere with cyan neon accents. Palette: deep navy blue, electric cyan neon, dark glass, white data light. "
     "Clean pixel art, standalone building isolated on dark or transparent background."),
]

for path, prompt in LANDMARKS:
    gen(prompt, f"{SPRITE_DIR}/{path}")

print(f"\n✅ All {len(LANDMARKS)} landmarks generated!")