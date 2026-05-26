#!/usr/bin/env python3
"""
Generate player character sprites for Param Quest via Fal AI.

Generates Mermander / Mermalion / Merlord in all 4 directions (12 sprites total).
Uses fal-ai/flux/dev for highest quality.

Usage:
  FAL_KEY=your_key python3 generate_players.py
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
        print(f"  ❌ Error: {e}")

STYLE = (
    "Pokémon-style overworld player character sprite, classic 16-bit pixel art, "
    "clean crisp pixel outlines, limited color palette, cute chibi proportions, "
    "single character centered, transparent or very dark background. "
    "Top-down RPG game sprite. No text, no UI. High contrast clean pixels."
)

NEG = "blurry, noisy, photo-realistic, 3d, text, watermark, multiple characters, background"

SPRITES = [
  # ─── MERMANDER (Stage 1 — aqua blue mer-creature) ────────────────────────────
  ("player/mermander_front.png", "Mermander front",
   f"Cute small aqua-blue mer-creature RPG player sprite facing forward. "
   f"Small chibi humanoid with a bright aqua-blue fish tail instead of legs ({chr(35)}7ce0ff), "
   f"a small crest fin on top of the head, big expressive cartoon eyes, "
   f"tiny arms at sides, white belly, simple clean design. {STYLE}"),

  ("player/mermander_back.png", "Mermander back",
   f"Cute small aqua-blue mer-creature RPG player sprite facing away (back view). "
   f"Small chibi humanoid back view, bright aqua-blue fish tail ({chr(35)}7ce0ff), "
   f"dorsal crest fin visible from behind, small frame, clean simple design. {STYLE}"),

  ("player/mermander_left.png", "Mermander left",
   f"Cute small aqua-blue mer-creature RPG player sprite walking left (side view). "
   f"Small chibi humanoid facing left, bright aqua-blue fish tail ({chr(35)}7ce0ff), "
   f"one arm slightly raised, profile view, clean simple design. {STYLE}"),

  ("player/mermander_right.png", "Mermander right",
   f"Cute small aqua-blue mer-creature RPG player sprite walking right (side view). "
   f"Small chibi humanoid facing right, bright aqua-blue fish tail ({chr(35)}7ce0ff), "
   f"one arm slightly raised, profile view, clean simple design. {STYLE}"),

  # ─── MERMALION (Stage 2 — purple evolved form) ───────────────────────────────
  ("player/mermalion_front.png", "Mermalion front",
   f"Elegant medium-sized purple mer-creature RPG player sprite facing forward. "
   f"Medium chibi humanoid with a large shimmering lavender-purple fish tail ({chr(35)}c89af0), "
   f"flowing dark purple mane/hair, larger more regal bearing than stage 1, "
   f"bright expressive eyes, elegant pose. {STYLE}"),

  ("player/mermalion_back.png", "Mermalion back",
   f"Elegant medium-sized purple mer-creature RPG player sprite facing away. "
   f"Back view of medium chibi with large purple tail ({chr(35)}c89af0), "
   f"flowing dark purple mane visible from behind. {STYLE}"),

  ("player/mermalion_left.png", "Mermalion left",
   f"Elegant medium-sized purple mer-creature RPG player sprite walking left. "
   f"Profile view facing left, large purple tail ({chr(35)}c89af0), flowing mane. {STYLE}"),

  ("player/mermalion_right.png", "Mermalion right",
   f"Elegant medium-sized purple mer-creature RPG player sprite walking right. "
   f"Profile view facing right, large purple tail ({chr(35)}c89af0), flowing mane. {STYLE}"),

  # ─── MERLORD (Stage 3 — gold champion form) ───────────────────────────────────
  ("player/merlord_front.png", "Merlord front",
   f"Majestic large golden royal mer-creature RPG player sprite facing forward. "
   f"Large imposing chibi humanoid with a magnificent gleaming golden fish tail ({chr(35)}ffd24a), "
   f"a flowing deep crimson-red royal cape, a gleaming 3-spike gold crown, "
   f"powerful confident champion stance, intense bright eyes. "
   f"Champion energy. {STYLE}"),

  ("player/merlord_back.png", "Merlord back",
   f"Majestic large golden royal mer-creature RPG player sprite facing away. "
   f"Back view showing large golden tail ({chr(35)}ffd24a), crimson cape flowing, "
   f"gold crown with 3 spikes on head. Champion energy. {STYLE}"),

  ("player/merlord_left.png", "Merlord left",
   f"Majestic large golden royal mer-creature RPG player sprite walking left. "
   f"Profile view facing left, golden tail ({chr(35)}ffd24a), crimson cape billowing, "
   f"crown gleaming. Champion energy. {STYLE}"),

  ("player/merlord_right.png", "Merlord right",
   f"Majestic large golden royal mer-creature RPG player sprite walking right. "
   f"Profile view facing right, golden tail ({chr(35)}ffd24a), crimson cape billowing, "
   f"crown gleaming. Champion energy. {STYLE}"),
]

print(f"🚀 Generating {len(SPRITES)} player sprites (fal-ai/flux/dev)...\n")
for path, label, prompt in SPRITES:
    gen(label, prompt, f"{SPRITE_DIR}/{path}")

print(f"\n✅ Done! {len(SPRITES)} player sprites generated.")
print(f"📁 Saved to: {SPRITE_DIR}/player/")
print(f"\nNote: Run this script with FAL_KEY set to regenerate sprites.")
print(f"Higher quality requires more steps — increase num_inference_steps to 50 for best quality.")
