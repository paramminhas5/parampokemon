# NPC Sprite Generation Guide (Bria)

## Overview

Generate 11 unique NPC sprites to replace the placeholder silhouettes in `public/sprites/npcs/`.
All sprites must match the existing game art style (FAL.ai flux/dev pixel-art RPG style).

## Requirements

- **Format**: PNG with transparent background (RGBA)
- **Size**: 512×512 or 1024×1024 pixels
- **Style**: Pokemon GBA sprite style, bold outlines, chibi proportions, clean limited palette
- **Perspective**: Front-facing, full body, single centered character
- **Background**: Transparent (no background)

## Negative Prompt (always include)

```
photorealistic, 3d render, blurry, noisy, watermark, text, signature,
multiple characters, background clutter, modern UI, anti-aliased, photograph
```

## NPC Sprites to Generate

| # | File | Character | Prompt Keywords |
|---|------|-----------|-----------------|
| 1 | `trainer_m.png` | Male Adventurer/Trainer | young male trainer, green bandana, backpack, adventurous pose, hiking boots, determined expression |
| 2 | `trainer_f.png` | Female Explorer/Trainer | young female trainer, red ponytail, sporty outfit, running shoes, confident stance, athletic |
| 3 | `investor.png` | Business Investor | middle-aged businessman, gray pinstripe suit, briefcase, glasses, serious expression, polished shoes |
| 4 | `engineer.png` | Tech Engineer | young tech worker, blue hoodie, laptop under arm, headphones around neck, casual stance, sneakers |
| 5 | `celeb.png` | Celebrity/Influencer | flashy performer, gold chains, sunglasses, designer jacket, confident swagger, star quality |
| 6 | `client.png` | Corporate Client/Manager | corporate woman, navy blazer, clipboard, pearl earrings, professional hairstyle, authoritative |
| 7 | `fan.png` | Excited Fan/Kid | enthusiastic young person, orange baseball cap worn backwards, big smile, waving, energetic pose |
| 8 | `tenant.png` | Working Class/Tenant | older working person, brown apron, keys on belt, rolled sleeves, friendly weathered face |
| 9 | `professor.png` | Professor/Scholar | elderly professor, white lab coat, round glasses, gray hair, holding book, wise expression |
| 10 | `mom.png` | Mom/Parent Figure | warm middle-aged woman, lavender cardigan, gentle smile, hands clasped, nurturing presence |
| 11 | `rival.png` | Rival/Challenger | confident young rival, spiky dark purple hair, leather jacket, arms crossed, smirking, bold pose |

## Style Reference

Look at the existing leader sprites for style consistency:
- `public/sprites/leaders/longtail.png` — merchant character
- `public/sprites/leaders/prehype.png` — scientist character
- `public/sprites/leaders/noculture.png` — streetwear character

These were generated with:
```
pokemon GBA sprite style, bold black pixel outlines, transparent background,
single centered creature, chibi cute proportions, clean limited color palette
```

## Base Prompt Template

```
[character description], pokemon GBA sprite style, pixel art RPG character,
bold black outlines, transparent background, single centered character,
chibi proportions, front-facing full body, clean limited color palette,
16-bit JRPG aesthetic, no anti-aliasing
```

## After Generation

1. Place generated PNGs in `public/sprites/npcs/` with the exact filenames listed above
2. Ensure they have transparent backgrounds (PNG RGBA, not JPEG)
3. Recommended final size: 512×512 (the engine will scale them)
4. The game will automatically use them — no code changes needed
