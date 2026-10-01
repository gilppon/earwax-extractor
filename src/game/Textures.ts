import Phaser from 'phaser';
import type { EarPalette } from './config';

// Procedural vector-style sprites (earwax chunks, boss stone, sparkles)
// generated once per run so palettes can follow the selected ear.

type Pt = { x: number; y: number };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shade(color: number, k: number) {
  const r = Math.min(255, Math.max(0, Math.round(((color >> 16) & 255) * k)));
  const g = Math.min(255, Math.max(0, Math.round(((color >> 8) & 255) * k)));
  const b = Math.min(255, Math.max(0, Math.round((color & 255) * k)));
  return (r << 16) | (g << 8) | b;
}

function blob(c: number, R: number, n: number, minK: number, rand: () => number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = minK + rand() * (1 - minK);
    pts.push({ x: c + Math.cos(a) * R * k, y: c + Math.sin(a) * R * k });
  }
  return pts;
}

function scalePts(pts: Pt[], c: number, k: number, ox = 0, oy = 0): Pt[] {
  return pts.map((p) => ({ x: c + (p.x - c) * k + ox, y: c + (p.y - c) * k + oy }));
}

interface Cols {
  base: number;
  dark: number;
  light: number;
}

function drawBlob(
  g: Phaser.GameObjects.Graphics,
  size: number,
  cols: Cols,
  seed: number,
  n: number,
  minK: number,
) {
  const c = size / 2;
  const R = size * 0.46;
  const rand = rng(seed);
  const pts = blob(c, R, n, minK, rand);
  g.fillStyle(shade(cols.dark, 0.7), 1);
  g.fillPoints(scalePts(pts, c, 1.02, 0, 3), true, true);
  g.fillStyle(cols.dark, 1);
  g.fillPoints(scalePts(pts, c, 1, 0, 2), true, true);
  g.fillStyle(cols.base, 1);
  g.fillPoints(scalePts(pts, c, 0.93, -1, -2), true, true);
  g.fillStyle(cols.light, 0.85);
  g.fillPoints(scalePts(pts, c, 0.56, -size * 0.07, -size * 0.09), true, true);
  g.fillStyle(0xffffff, 0.55);
  g.fillEllipse(c - size * 0.13, c - size * 0.17, size * 0.13, size * 0.07);
  for (let i = 0; i < 8; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * R * 0.7;
    g.fillStyle(cols.dark, 0.35);
    g.fillCircle(c + Math.cos(a) * d, c + Math.sin(a) * d, size * (0.012 + rand() * 0.02));
  }
  g.lineStyle(Math.max(2, size * 0.022), shade(cols.dark, 0.55), 0.9);
  g.strokePoints(scalePts(pts, c, 0.985, -0.5, -1), true, true);
}

function sparkle(g: Phaser.GameObjects.Graphics, x: number, y: number, s: number) {
  g.fillStyle(0xffffff, 0.95);
  g.fillPoints(
    [
      { x, y: y - s },
      { x: x + s * 0.25, y: y - s * 0.25 },
      { x: x + s, y },
      { x: x + s * 0.25, y: y + s * 0.25 },
      { x, y: y + s },
      { x: x - s * 0.25, y: y + s * 0.25 },
      { x: x - s, y },
      { x: x - s * 0.25, y: y - s * 0.25 },
    ],
    true,
    true,
  );
}

function crackLines(
  g: Phaser.GameObjects.Graphics,
  size: number,
  count: number,
  seed: number,
  width: number,
  glow: boolean,
) {
  const c = size / 2;
  for (let i = 0; i < count; i++) {
    const r = rng(seed + i * 977);
    const a0 = (i / Math.max(count, 3)) * Math.PI * 2 + r() * 0.9 + 0.4;
    const pts: Pt[] = [];
    const steps = 6;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const rad = size * 0.44 * (1 - t) + size * 0.03;
      const a = a0 + (r() - 0.5) * 0.7;
      pts.push({ x: c + Math.cos(a) * rad, y: c + Math.sin(a) * rad });
    }
    g.lineStyle(width + 2, 0x2c241a, 1);
    g.strokePoints(pts, false, false);
    if (glow) {
      g.lineStyle(Math.max(1, width - 1), 0xffb74d, 0.95);
      g.strokePoints(pts, false, false);
    }
  }
}

function gen(scene: Phaser.Scene, key: string, size: number, draw: (g: Phaser.GameObjects.Graphics) => void) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const g = scene.make.graphics({}, false);
  draw(g);
  g.generateTexture(key, size, size);
  g.destroy();
}

export function buildTextures(scene: Phaser.Scene, pal: EarPalette) {
  const S = 128;
  const waxCols: Cols = { base: pal.wax, dark: pal.waxDark, light: pal.waxLight };
  [11, 23, 37, 59].forEach((seed, i) => {
    gen(scene, `wax_${i}`, S, (g) => drawBlob(g, S, waxCols, seed, 16, 0.84));
  });

  gen(scene, 'wax_gold', S, (g) => {
    drawBlob(g, S, { base: 0xffd23f, dark: 0xb87d00, light: 0xfff3a6 }, 77, 14, 0.9);
    sparkle(g, S * 0.68, S * 0.3, 9);
    sparkle(g, S * 0.32, S * 0.62, 6);
    sparkle(g, S * 0.62, S * 0.7, 5);
  });

  gen(scene, 'wax_hard', S, (g) => {
    drawBlob(g, S, { base: 0xb9ad98, dark: 0x6f6556, light: 0xe0d6c3 }, 91, 10, 0.72);
    crackLines(g, S, 2, 5, 2, false);
  });

  gen(scene, 'wax_frag', S, (g) => {
    drawBlob(g, S, { base: 0xa89f8d, dark: 0x5f574a, light: 0xd6cdb8 }, 103, 9, 0.74);
    crackLines(g, S, 1, 9, 2, true);
  });

  const BS = 192;
  for (let cr = 0; cr <= 3; cr++) {
    gen(scene, `boss${cr}`, BS, (g) => {
      drawBlob(g, BS, { base: 0xb8ab90, dark: 0x6b6050, light: 0xded4bd }, 131, 15, 0.8);
      // calcified strata rings
      g.lineStyle(2, 0x8a7d66, 0.5);
      for (let k = 1; k <= 3; k++) {
        g.strokeCircle(BS / 2 - 4, BS / 2 - 2, BS * (0.13 * k));
      }
      crackLines(g, BS, cr, 211, 4, cr > 0);
    });
  }

  gen(scene, 'dot', 16, (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 7);
  });
  gen(scene, 'spark', 32, (g) => {
    sparkle(g, 16, 16, 14);
  });
}
