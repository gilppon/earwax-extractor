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
  glossySurface = false,
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
  // 부드러운 젤리 볼륨 & 반짝이는 하이라이트
  g.fillStyle(0xffffff, 0.85);
  g.fillEllipse(c - size * 0.14, c - size * 0.16, size * 0.16, size * 0.08);
  g.fillCircle(c - size * 0.22, c - size * 0.09, size * 0.035);

  // 쫀득한 젤리 투과 림라이트
  g.fillStyle(cols.light, 0.5);
  g.fillEllipse(c + size * 0.12, c + size * 0.14, size * 0.24, size * 0.09);

  if (glossySurface) {
    // 젤리 슬라임 특유의 찰랑이는 표면 광택 & 반짝이
    for (let i = 0; i < 3; i++) {
      const x = c + (rand() - 0.5) * size * 0.45;
      const y = c + (rand() - 0.55) * size * 0.4;
      const w = size * (0.04 + rand() * 0.03);
      g.fillStyle(0xffffff, 0.6);
      g.fillEllipse(x, y, w, w * 0.4);
    }
    sparkle(g, c + size * 0.18, c - size * 0.18, size * 0.06);
  }
  g.lineStyle(Math.max(2.5, size * 0.024), shade(cols.dark, 0.75), 0.95);
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
    g.lineStyle(width + 2, 0x451a03, 1);
    g.strokePoints(pts, false, false);
    if (glow) {
      g.lineStyle(Math.max(1, width - 1), 0xfef08a, 0.95);
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
    gen(scene, `wax_${i}`, S, (g) => drawBlob(g, S, waxCols, seed, 16, 0.88, true));
  });

  gen(scene, 'wax_gold', S, (g) => {
    drawBlob(g, S, { base: 0xfacc15, dark: 0xb45309, light: 0xfef08a }, 77, 14, 0.92, true);
    sparkle(g, S * 0.68, S * 0.28, 12);
    sparkle(g, S * 0.28, S * 0.65, 8);
    sparkle(g, S * 0.65, S * 0.72, 7);
  });

  gen(scene, 'wax_hard', S, (g) => {
    drawBlob(g, S, { base: 0xf59e0b, dark: 0x9a3412, light: 0xfde68a }, 91, 12, 0.82, true);
    sparkle(g, S * 0.65, S * 0.32, 9);
    crackLines(g, S, 2, 5, 2, true);
  });

  gen(scene, 'wax_plug', S, (g) => {
    drawBlob(g, S, waxCols, 137, 20, 0.78, true);
    for (let i = 0; i < 3; i++) {
      g.lineStyle(3, shade(pal.waxDark, 0.85), 0.65);
      g.beginPath();
      g.arc(S * 0.5, S * 0.52, S * (0.18 + i * 0.1), 0.25 + i * 0.32, 2.7 + i * 0.28, false);
      g.strokePath();
    }
    sparkle(g, S * 0.72, S * 0.26, 11);
    crackLines(g, S, 3, 149, 2, false);
  });

  gen(scene, 'wax_frag', S, (g) => {
    drawBlob(g, S, { base: 0xfbbf24, dark: 0xb45309, light: 0xfef9c3 }, 103, 10, 0.84, true);
    crackLines(g, S, 1, 9, 2, true);
  });

  const BS = 192;
  for (let cr = 0; cr <= 3; cr++) {
    gen(scene, `boss${cr}`, BS, (g) => {
      // 영롱한 대왕 황금 너겟 보석 (Golden Amber Boulder)
      drawBlob(g, BS, { base: 0xf59e0b, dark: 0x92400e, light: 0xfef3c7 }, 131, 18, 0.86, true);
      g.lineStyle(2.5, 0xfde047, 0.6);
      for (let k = 1; k <= 3; k++) {
        g.strokeCircle(BS / 2 - 4, BS / 2 - 2, BS * (0.13 * k));
      }
      sparkle(g, BS * 0.72, BS * 0.24, 16);
      sparkle(g, BS * 0.26, BS * 0.70, 12);
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
