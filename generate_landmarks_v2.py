#!/usr/bin/env python3
"""Generate landmark/world-building sprites for Param Quest via Fal AI.
Pokémon-style world artwork — cute town buildings, iconic landmarks per zone.
Uses fal-ai/flux/schnell (fast + cheap).
"""
import os, subprocess, fal_client

SPRITE_DIR = os.path.expanduser("~/parampokemon/public/sprites")
key = os.environ.get("FAL_KEY") or ""
if not key:
    print("ERROR: Set FAL_KEY env var (format: key_id:key_secret)")
    exit(1)
os.environ["FAL_KEY"] = key

def dl(url, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(["curl", "-s", "-o", path, url], check=True)
    size = os.path.getsize(path)
    print(f"  ✅ {size:,} bytes → {path}")

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            msg = log["message"].strip()
            if msg:
                print(f"  [fal] {msg}")

def gen(prompt, out_path):
    print(f"\n🏘️ {os.path.basename(out_path)}")
    try:
        result = fal_client.subscribe(
            "fal-ai/flux/schnell",
            arguments={"prompt": prompt},
            with_logs=True,
            on_queue_update=on_queue_update,
        )
        url = result["images"][0]["url"]
        dl(url, out_path)
    except Exception as e:
        print(f"  ❌ Error: {e}")

# ─── Landmark / world-building art per zone ───────────────────────
# Pokémon-style pixel art: cute, colorful, iconic per zone theme.
# Each sprite is a full "world scene" for that zone.
LANDMARKS = [
    ("landmarks/home.png",
     "Beautiful pixel art RPG world scene, a cozy warm childhood home in a peaceful green town. "
     "Charming small cottage with warm cream-yellow walls, terracotta red roof, glowing yellow windows, "
     "a small red door, a white picket fence in front, green grass lawn, flowers, blue sky with fluffy white clouds. "
     "Classic Pokémon-style overworld art. Bright, warm, nostalgic. "
     "Solo building scene on transparent/dark background."),

    ("landmarks/origin.png",
     "Beautiful pixel art RPG world scene, a creative maker's studio workshop in a warm town. "
     "Charming cottage with warm wood paneling, dark wood sloped roof, a large window showing a glowing computer monitor, "
     "shelves of books and guitars against the wall outside, string fairy lights, warm golden sunset sky. "
     "Classic Pokémon-style overworld art. Warm amber and golden tones. "
     "Solo building scene on transparent/dark background."),

    ("landmarks/grp.png",
     "Beautiful pixel art RPG world scene, a bustling Indian e-commerce marketplace in a green market town. "
     "Colorful market stalls with bright green awnings and yellow price tags, wooden market counters, "
     "a large glowing digital price comparison screen above the stalls showing product listings and prices, "
     "green and yellow market vibes, bustling energy. "
     "Classic Pokémon-style overworld art. Bright green market scene. "
     "Solo building scene on transparent/dark background."),

    ("landmarks/hab.png",
     "Beautiful pixel art RPG world scene, a tall charming apartment building in a warm stone town. "
     "Elegant 3-story apartment building with warm terracotta brick walls, dark brown roof, "
     "small balconies with potted plants and laundry, glowing golden 'FOR RENT' sign above the entrance, "
     "warm Bengaluru sunset light, stone-paved street. "
     "Classic Pokémon-style overworld art. Warm terracotta and gold. "
     "Solo building scene on transparent/dark background."),

    ("landmarks/ai.png",
     "Beautiful pixel art RPG world scene, a sleek AI tech lab headquarters in a cyber-neon town. "
     "Dark navy blue glass tower building, glowing cyan circuit trace lines running along the entire facade, "
     "a massive glowing cyan AI brain/chip icon above the main entrance, small blinking server-green lights in windows, "
     "neon cyan sign reading 'QUARTIC', dark blue twilight sky with stars. "
     "Classic Pokémon-style overworld art meets cyberpunk. Deep navy and electric cyan. "
     "Solo building scene on transparent/dark background."),

    ("landmarks/investopad.png",
     "Beautiful pixel art RPG world scene, an elegant venture capital tower in a purple twilight city. "
     "Tall prestigious corporate glass tower, deep purple dusk glass facade, glowing pink-violet neon accent edges, "
     "a massive glowing gold trophy emblem above the entrance, marble lobby visible through glass doors, "
     "golden warm interior light spilling from tall windows, purple twilight sky. "
     "Classic Pokémon-style overworld art. Deep purple, violet neon, gold. "
     "Solo building scene on transparent/dark background."),

    ("landmarks/sole.png",
     "Beautiful pixel art RPG world scene, a vibrant streetwear sneaker boutique in a cool urban town. "
     "Stylish modern shop with dark charcoal and deep purple exterior, "
     "a massive glowing hot pink neon sign reading 'SOLE' in bold pixel-style letters, "
     "large glass display windows showing shelves of colorful sneakers, a sneaker logo above the door, "
     "pink welcome mat, potted plants at entrance, cool purple-pink urban sunset sky. "
     "Classic Pokémon-style overworld art. Hot pink neon, cool purple, white sneakers. "
     "Solo building scene on transparent/dark background."),

    ("landmarks/fere.png",
     "Beautiful pixel art RPG world scene, a crypto AI trading platform headquarters in a dark green neon city. "
     "Dark forest green glass building with glowing neon #00e8a0 green circuit board traces across the entire facade, "
     "a large glowing green AI brain icon above the main entrance, floating green data ticker symbols, "
     "a glowing green terminal screen in the entrance, dark city night sky with green data particles. "
     "Classic Pokémon-style overworld art meets crypto. Deep forest green, neon #00e8a0 green, black glass. "
     "Solo building scene on transparent/dark background."),

    ("landmarks/ccd.png",
     "Beautiful pixel art RPG world scene, a warm creative music studio and pet brand headquarters in a golden hour town. "
     "Warm amber-wood creative studio building, a large glowing speaker icon above the door, "
     "a small cat sleeping outside the entrance, string fairy lights across the facade, "
     "warm golden studio glow from inside, guitars displayed outside, golden sunset sky. "
     "Classic Pokémon-style overworld art. Warm amber, golden light, cozy creative vibes. "
     "Solo building scene on transparent/dark background."),

    ("landmarks/iterate.png",
     "Beautiful pixel art RPG world scene, a modern AI-native marketing agency headquarters in a deep blue night city. "
     "Dark glass futuristic office tower, deep navy blue and purple tones, "
     "glowing cyan circuit pattern lines running across the facade like a digital brain, "
     "a stylized infinity loop symbol glowing above the main entrance, small blue data nodes blinking along the edges, "
     "tall dark glass windows with cool blue-white interior glow, sleek modern dark entrance, "
     "deep navy night sky with stars and cyan aurora. "
     "Classic Pokémon-style overworld art meets futuristic tech. Deep navy, electric cyan neon. "
     "Solo building scene on transparent/dark background."),
]

for path, prompt in LANDMARKS:
    gen(prompt, f"{SPRITE_DIR}/{path}")

print(f"\n✅ All {len(LANDMARKS)} landmarks generated!")