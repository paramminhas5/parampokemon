#!/usr/bin/env python3
"""Generate player + creature sprites for Param Quest via Fal AI.
Cheapest model: fal-ai/flux/schnell (fast, cheap, great quality).
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
    print(f"\n🎨 {os.path.basename(out_path)}")
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

# ─── Player sprites (mermander/mermalion/merlord × 4 directions) ─
PLAYER_SPRITES = [
    # Mermander - stage 1
    ("player/mermander_front.png",
     "Pixel art RPG game sprite, a cute aqua-blue mer-creature standing facing forward. "
     "Small humanoid figure with a fish tail instead of legs, glowing cyan-blue skin, "
     "a small crest fin on the head, big expressive cartoon eyes, arms at sides. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Bright aqua-blue (#7ce0ff), white belly, dark blue fin details. "
     "Classic 16-bit RPG style like Pokémon. Standing pose, facing camera."),

    ("player/mermander_back.png",
     "Pixel art RPG game sprite, a cute aqua-blue mer-creature facing away (back view). "
     "Small humanoid figure with a fish tail, glowing cyan-blue skin, a dorsal fin crest on the head. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Bright aqua-blue (#7ce0ff), darker blue back highlights. "
     "Classic 16-bit RPG style like Pokémon. Back view showing tail and fin."),

    ("player/mermander_left.png",
     "Pixel art RPG game sprite, a cute aqua-blue mer-creature walking left. "
     "Small humanoid figure with fish tail, glowing cyan-blue skin, profile view facing left, "
     "one arm slightly forward, tail curving to the right behind. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Bright aqua-blue (#7ce0ff). Classic 16-bit RPG left-facing walk frame."),

    ("player/mermander_right.png",
     "Pixel art RPG game sprite, a cute aqua-blue mer-creature walking right. "
     "Small humanoid figure with fish tail, glowing cyan-blue skin, profile view facing right, "
     "one arm slightly forward, tail curving to the left behind. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Bright aqua-blue (#7ce0ff). Classic 16-bit RPG right-facing walk frame."),

    # Mermalion - stage 2
    ("player/mermalion_front.png",
     "Pixel art RPG game sprite, an elegant purple-violet evolved mer-creature standing facing forward. "
     "Medium-sized humanoid figure with a large fish tail, shimmering purple-violet scales, "
     "a flowing mane of dark purple hair, elegant royal bearing, big eyes, arms at sides. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Rich purple (#c89af0), lavender belly, deep violet mane. "
     "Classic 16-bit RPG style like Pokémon. Standing pose, facing camera."),

    ("player/mermalion_back.png",
     "Pixel art RPG game sprite, an elegant purple-violet evolved mer-creature, back view. "
     "Medium humanoid with large fish tail, shimmering purple-violet scales, flowing dark purple mane. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Rich purple (#c89af0), deep violet mane. "
     "Classic 16-bit RPG back view showing royal cape-like mane and tail."),

    ("player/mermalion_left.png",
     "Pixel art RPG game sprite, an elegant purple-violet evolved mer-creature walking left. "
     "Medium humanoid with fish tail, shimmering purple-violet scales, profile facing left, "
     "flowing mane, one arm forward, tail sweeping. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Rich purple (#c89af0). Classic 16-bit RPG left-facing walk frame."),

    ("player/mermalion_right.png",
     "Pixel art RPG game sprite, an elegant purple-violet evolved mer-creature walking right. "
     "Medium humanoid with fish tail, shimmering purple-violet scales, profile facing right, "
     "flowing mane, one arm forward, tail sweeping. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Rich purple (#c89af0). Classic 16-bit RPG right-facing walk frame."),

    # Merlord - stage 3
    ("player/merlord_front.png",
     "Pixel art RPG game sprite, a majestic golden royal mer-creature standing facing forward. "
     "Large imposing humanoid figure with a magnificent fish tail, glowing golden scales, "
     "a flowing royal purple cape, a gleaming gold crown with 3 prongs, intense eyes, powerful stance. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Brilliant gold (#ffd24a), crimson cape (#e85a3a), royal purple cape. "
     "Classic 16-bit RPG style like Pokémon champion sprites. Standing facing camera, regal pose."),

    ("player/merlord_back.png",
     "Pixel art RPG game sprite, a majestic golden royal mer-creature, back view. "
     "Large humanoid with magnificent fish tail, gleaming gold scales, royal purple flowing cape, "
     "gold crown with 3 prongs on head. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Brilliant gold (#ffd24a), royal purple cape. "
     "Classic 16-bit RPG back view showing cape flowing and tail."),

    ("player/merlord_left.png",
     "Pixel art RPG game sprite, a majestic golden royal mer-creature walking left. "
     "Large humanoid with fish tail, gleaming gold scales, royal purple cape billowing, "
     "profile facing left, powerful arm raised slightly, crown gleaming. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Brilliant gold (#ffd24a). Classic 16-bit RPG left-facing walk frame."),

    ("player/merlord_right.png",
     "Pixel art RPG game sprite, a majestic golden royal mer-creature walking right. "
     "Large humanoid with fish tail, gleaming gold scales, royal purple cape billowing, "
     "profile facing right, powerful arm raised slightly, crown gleaming. "
     "Clean pixel art on dark/transparent background. 64x64 sprite. "
     "Brilliant gold (#ffd24a). Classic 16-bit RPG right-facing walk frame."),
]

for path, prompt in PLAYER_SPRITES:
    gen(prompt, f"{SPRITE_DIR}/{path}")

print(f"\n✅ All {len(PLAYER_SPRITES)} player sprites generated!")
