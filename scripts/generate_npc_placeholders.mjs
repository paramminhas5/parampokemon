#!/usr/bin/env node
/**
 * Generate placeholder NPC sprites as colored silhouettes.
 * These are temporary — replace with FAL.ai generated sprites.
 * 
 * Run: node scripts/generate_npc_placeholders.mjs
 * 
 * Each NPC kind gets a unique colored 512×512 PNG with a simple
 * silhouette shape and label text.
 */

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(import.meta.dirname, '..', 'public', 'sprites', 'npcs');
mkdirSync(OUTPUT_DIR, { recursive: true });

const NPC_KINDS = {
  trainer_m:  { color: '#3a78d8', label: 'TRAINER', shape: 'tall' },
  trainer_f:  { color: '#d83a78', label: 'TRAINER', shape: 'tall' },
  investor:   { color: '#202028', label: 'INVESTOR', shape: 'suit' },
  engineer:   { color: '#3a8a6a', label: 'ENGINEER', shape: 'tall' },
  celeb:      { color: '#f0c870', label: 'CELEB', shape: 'tall' },
  client:     { color: '#a06fc4', label: 'CLIENT', shape: 'suit' },
  fan:        { color: '#f5d24a', label: 'FAN', shape: 'short' },
  tenant:     { color: '#6a8a4a', label: 'TENANT', shape: 'tall' },
  professor:  { color: '#f5f0e0', label: 'PROF', shape: 'coat' },
  mom:        { color: '#e89ab8', label: 'MOM', shape: 'dress' },
  rival:      { color: '#5a3a78', label: 'RIVAL', shape: 'tall' },
};

function drawSilhouette(ctx, shape, color, size) {
  const cx = size / 2;
  const headR = size * 0.12;
  const headY = size * 0.22;
  
  // Head
  ctx.fillStyle = '#f0c9a0';
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.fillStyle = color;
  const bodyTop = headY + headR + size * 0.02;
  const bodyW = size * 0.35;
  const bodyH = size * 0.45;
  
  // Rounded body shape
  ctx.beginPath();
  ctx.ellipse(cx, bodyTop + bodyH * 0.5, bodyW / 2, bodyH / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Legs
  ctx.fillStyle = '#2a2a3a';
  const legTop = bodyTop + bodyH * 0.7;
  const legW = size * 0.08;
  const legH = size * 0.22;
  ctx.fillRect(cx - size * 0.08 - legW / 2, legTop, legW, legH);
  ctx.fillRect(cx + size * 0.08 - legW / 2, legTop, legW, legH);
  
  // Hair
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.arc(cx, headY - headR * 0.2, headR * 1.1, Math.PI, 0);
  ctx.fill();
}

for (const [id, { color, label, shape }] of Object.entries(NPC_KINDS)) {
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Transparent background
  ctx.clearRect(0, 0, size, size);
  
  // Draw character silhouette
  drawSilhouette(ctx, shape, color, size);
  
  // Label at bottom
  ctx.fillStyle = color;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, size / 2, size * 0.92);
  
  const filename = `${id}.png`;
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(join(OUTPUT_DIR, filename), buffer);
  console.log(`✓ ${filename} (${buffer.length} bytes)`);
}

console.log(`\nDone! ${Object.keys(NPC_KINDS).length} NPC placeholders generated.`);
console.log(`Output: ${OUTPUT_DIR}`);
