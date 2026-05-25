#!/usr/bin/env python3
"""
Generate missing sprites for Param Quest using Fal AI (nano-banana-2).
Run: FAL_KEY="..." python generate_sprites.py
"""

import os
import sys
import fal_client

SPRITE_DIR = os.path.expanduser("~/parampokemon/public/sprites")
FAL_KEY = os.environ.get("FAL_KEY", "")

key = FAL_KEY
if not key:
    print("ERROR: Set FAL_KEY env var (format: key_id:key_secret)")
    sys.exit(1)

os.environ["FAL_KEY"] = key

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print(f"  [fal] {log['message'].strip()}")

def generate(prompt: str, out_path: str, style: str = "pixel art"):
    print(f"\n🎨 Generating: {out_path}")
    print(f"   Prompt: {prompt[:100]}...")

    result = fal_client.subscribe(
        "fal-ai/nano-banana-2",
        arguments={"prompt": prompt},
        with_logs=True,
        on_queue_update=on_queue_update,
    )

    url = result["images"][0]["url"]
    print(f"   URL: {url}")

    # Download
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    os.system(f"curl -s -o '{out_path}' '{url}'")
    size = os.path.getsize(out_path)
    print(f"   Saved: {out_path} ({size:,} bytes)")
    return url

# ─── SPRITE 1: statusquo — Gym Leader (final boss, CCD Gym)
# "The Champion King of the Status Quo"
generate(
    prompt=(
        "Pixel art sprite, 16-bit era RPG style, a regal king figure wearing ornate dark armor "
        "with a flowing deep crimson cape, a golden crown with three spikes on his head, "
        "holding a golden scepter. Intense expression with angry eyebrows. "
        "Chest has a three-horizontal-lines emblem. "
        "Standing in battle pose facing the viewer. "
        "Limited color palette: dark steel greys, crimson red cape, gold accents, dark purple shadows. "
        "Clean outlines, RPG battle sprite proportions, centered on transparent background."
    ),
    out_path=f"{SPRITE_DIR}/leaders/statusquo.png",
)

# ─── SPRITE 2: iterate — Creature (Iterate zone)
# "A digital iteration spirit"
generate(
    prompt=(
        "Pixel art sprite, 16-bit era RPG style, a small ethereal digital fox-spirit creature "
        "made of flowing light数据和电路 patterns, glowing cyan and electric blue core with white highlights, "
        "wispy tail of pure light, sharp intelligent eyes, circuit-trace markings on its body. "
        "Floating slightly off the ground with energy wisps beneath. "
        "Limited color palette: deep navy background tones, electric cyan #00e8ff, "
        "bright white highlights, subtle purple accent. "
        "Clean pixel art outlines, RPG creature sprite proportions, centered on dark background."
    ),
    out_path=f"{SPRITE_DIR}/creatures/iterate.png",
)

print("\n✅ All sprites generated!")
