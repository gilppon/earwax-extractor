import type { EarId, PlayTool, ToolType } from './types';

// ── World constants (logical pixels) ────────────────────────
export const W = 960;
export const H = 540;
export const EXIT_X = 64; // wax that crosses this line is "extracted"
export const DRUM_X = 860; // eardrum surface
export const DRUM_FACE = DRUM_X + 8; // physical face of the drum body
export const MOUTH_X = -80; // canal continues off-screen to the left

// ── Ears (owner characters) ─────────────────────────────────
export interface EarPalette {
  skin: number;
  skinDark: number;
  wall: number;
  inner: number;
  wax: number;
  waxDark: number;
  waxLight: number;
  hair: number;
}

export interface EarDef {
  id: EarId;
  name: string;
  emoji: string;
  desc: string;
  perks: string[];
  cost: number;
  base: number; // canal half-height
  curve: number; // waviness of the canal
  gravity: number;
  chunkScale: number;
  valueMult: number;
  hairMult: number;
  wobble: number; // sway in endless / high stages
  palette: EarPalette;
}

export const EARS: Record<EarId, EarDef> = {
  HUMAN: {
    id: 'HUMAN',
    name: 'Human Ear',
    emoji: '👂',
    desc: 'The most ordinary, stable canal. Where rookie miners learn the trade.',
    perks: ['Standard gravity', 'Wax payout ×1.0'],
    cost: 0,
    base: 108,
    curve: 1,
    gravity: 1,
    chunkScale: 1,
    valueMult: 1,
    hairMult: 1,
    wobble: 1,
    palette: {
      skin: 0xc98462,
      skinDark: 0x8f5238,
      wall: 0x8a2c3c,
      inner: 0xf2a29a,
      wax: 0xe8b53a,
      waxDark: 0xa06a14,
      waxLight: 0xffe58a,
      hair: 0x3b2418,
    },
  },
  ALIEN: {
    id: 'ALIEN',
    name: 'Alien Ear',
    emoji: '👽',
    desc: 'Low-gravity canal. Glowing wax bobs through twisty tunnels.',
    perks: ['Low gravity (floaty wax)', 'Twisty tunnels', 'Wax payout ×1.4'],
    cost: 600,
    base: 104,
    curve: 1.7,
    gravity: 0.35,
    chunkScale: 1,
    valueMult: 1.4,
    hairMult: 0.6,
    wobble: 1.2,
    palette: {
      skin: 0x62b58a,
      skinDark: 0x2f6f55,
      wall: 0x1c5a68,
      inner: 0xa8f0d0,
      wax: 0x86ff5c,
      waxDark: 0x2c9a3c,
      waxLight: 0xe0ffb8,
      hair: 0x114a3a,
    },
  },
  CAT: {
    id: 'CAT',
    name: 'Cat Ear',
    emoji: '🐱',
    desc: 'Narrow and furry. The owner twitches, so it never stops wobbling!',
    perks: ['Narrow canal', 'Lots of hair (ticklish!)', 'Ear twitches', 'Wax payout ×1.9'],
    cost: 1500,
    base: 92,
    curve: 1.2,
    gravity: 1,
    chunkScale: 0.9,
    valueMult: 1.9,
    hairMult: 2.4,
    wobble: 1.6,
    palette: {
      skin: 0xf0b078,
      skinDark: 0xb87a45,
      wall: 0xb0506a,
      inner: 0xffc6c2,
      wax: 0xf5dca6,
      waxDark: 0xc39a55,
      waxLight: 0xfff6dc,
      hair: 0xd9791f,
    },
  },
  GIANT: {
    id: 'GIANT',
    name: 'Giant Ear',
    emoji: '🗿',
    desc: 'Huge canal, huge wax. Heavy and majestic — and the richest haul.',
    perks: ['Wide canal', 'Mega wax (heavy)', 'Gravity ×1.35', 'Wax payout ×2.8'],
    cost: 3200,
    base: 150,
    curve: 0.8,
    gravity: 1.35,
    chunkScale: 1.55,
    valueMult: 2.8,
    hairMult: 1.2,
    wobble: 0.9,
    palette: {
      skin: 0xa88f78,
      skinDark: 0x6a5546,
      wall: 0x6a2f34,
      inner: 0xd98f80,
      wax: 0xb87a2e,
      waxDark: 0x6d4210,
      waxLight: 0xe6b866,
      hair: 0x2a2a2a,
    },
  },
};

export const EAR_ORDER: EarId[] = ['HUMAN', 'ALIEN', 'CAT', 'GIANT'];

// ── Tools ───────────────────────────────────────────────────
export interface ToolDef {
  id: PlayTool;
  name: string;
  en: string;
  emoji: string;
  desc: string;
  how: string;
  cost: number;
  radius: number;
  power: number;
  maxSpeed: number;
  tremor: number;
}

export const TOOLS: Record<PlayTool, ToolDef> = {
  COTTON: {
    id: 'COTTON',
    name: 'Micro Swab',
    en: 'Cheap · shaky',
    emoji: '🧻',
    desc: 'Sticky cotton ball that grabs wax and drags it out. Big tip, easy to handle, terrible aim.',
    how: 'Stick to wax (up to 2 chunks)',
    cost: 0,
    radius: 13,
    power: 1,
    maxSpeed: 13,
    tremor: 1,
  },
  TWEEZER: {
    id: 'TWEEZER',
    name: 'Micro Tweezers',
    en: 'Precise · one at a time',
    emoji: '🥢',
    desc: 'Tiny, precise tips. Pinch a chunk tight and pull it out clean. Wiggle out the stuck ones.',
    how: 'Pinch a chunk (let go to release, 1)',
    cost: 350,
    radius: 7,
    power: 1.5,
    maxSpeed: 12,
    tremor: 0.75,
  },
  SONIC_VACUUM: {
    id: 'SONIC_VACUUM',
    name: 'Sonic Vacuum',
    en: 'Suction · burns power',
    emoji: '🌀',
    desc: 'Vibrates wax loose with sound, then sucks it up. Limited energy, and it resonates near the eardrum!',
    how: 'Suction (uses energy)',
    cost: 1400,
    radius: 15,
    power: 2.2,
    maxSpeed: 14,
    tremor: 1.15,
  },
  VIBRATOR: {
    id: 'VIBRATOR',
    name: 'Sonic Vibrator',
    en: 'Boss fight only',
    emoji: '📳',
    desc: 'Boss-only tool that cracks hardened lime chunks.',
    how: 'Vibrate (most effective held still)',
    cost: 0,
    radius: 13,
    power: 1,
    maxSpeed: 11,
    tremor: 1,
  },
};

export const TOOL_ORDER: ToolType[] = ['COTTON', 'TWEEZER', 'SONIC_VACUUM'];

// ── Upgrades (lab) ──────────────────────────────────────────
export type UpgradeId = 'precision' | 'sensitivity' | 'power' | 'lungs' | 'drone';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  emoji: string;
  max: number;
  start: number;
  base: number;
  growth: number;
  blurb: string;
  effect: (lvl: number) => string;
}

export const tremorAmp = (precision: number) => 5.5 / (1 + 0.28 * (precision - 1));
export const damageMult = (sensitivity: number) => 1 / (1 + 0.18 * (sensitivity - 1));
export const powerMult = (power: number) => 1 + 0.25 * (power - 1);
export const breathCap = (lungs: number) => 3 + 0.8 * (lungs - 1);
export const droneRate = (level: number) => 0.1 * level; // wax / sec
export const DRONE_CAP_SEC = 45 * 60;

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'precision',
    name: 'Steady Gloves',
    emoji: '🎯',
    max: 8,
    start: 1,
    base: 80,
    growth: 1.62,
    blurb: 'Cuts the hand tremor for sniper-grade aim.',
    effect: (l) => `Tremor ±${tremorAmp(l).toFixed(1)}px`,
  },
  {
    id: 'sensitivity',
    name: 'Eardrum Membrane',
    emoji: '🛡️',
    max: 8,
    start: 1,
    base: 120,
    growth: 1.7,
    blurb: 'Softens the damage your eardrum takes.',
    effect: (l) => `Damage taken ${(damageMult(l) * 100).toFixed(0)}%`,
  },
  {
    id: 'power',
    name: 'Mining Output',
    emoji: '⛏️',
    max: 8,
    start: 1,
    base: 90,
    growth: 1.65,
    blurb: 'Pries stuck wax loose much faster.',
    effect: (l) => `Mining power ×${powerMult(l).toFixed(2)}`,
  },
  {
    id: 'lungs',
    name: 'Lung Capacity',
    emoji: '💨',
    max: 6,
    start: 1,
    base: 100,
    growth: 1.6,
    blurb: 'Hold your breath longer to steady your hand.',
    effect: (l) => `Breath hold ${breathCap(l).toFixed(1)}s`,
  },
  {
    id: 'drone',
    name: 'Auto-Mining Drone',
    emoji: '🤖',
    max: 10,
    start: 0,
    base: 200,
    growth: 1.7,
    blurb: 'Hauls wax in for you, even while the lab is closed.',
    effect: (l) => (l === 0 ? 'Not installed' : `${(droneRate(l) * 60).toFixed(0)} wax/min`),
  },
];

export const upgradeCost = (u: UpgradeDef, currentLevel: number) =>
  Math.round(u.base * Math.pow(u.growth, Math.max(0, currentLevel - u.start)));

// ── Stages ──────────────────────────────────────────────────
export const STAGE_COUNT = 8;
export const STAGE_NAMES = [
  'Entrance Cleanup',
  'Curvy Section',
  'Fur Forest',
  'Lime Strata',
  'Sneeze Quake',
  'Eardrum Cliff',
  'Gravity Storm',
  'Hellish Chasm',
];

export interface StageParams {
  target: number;
  stuckRatio: number;
  hairs: number;
  gold: number;
  hard: number;
  danger: number;
  flinch: number; // seconds between sneezes (0 = none)
  sway: number;
  parTime: number;
}

export function stageParams(n: number): StageParams {
  return {
    target: 4 + n,
    stuckRatio: Math.min(0.85, 0.35 + 0.08 * n),
    hairs: n < 2 ? 0 : Math.min(8, n),
    gold: n >= 3 ? 1 + (n >= 6 ? 1 : 0) : 0,
    hard: n >= 4 ? (n >= 6 ? 2 : 1) : 0,
    danger: n >= 2 ? Math.min(3, 1 + Math.floor(n / 3)) : 0,
    flinch: n >= 5 ? 15 - (n - 5) * 1.6 : 0,
    sway: n >= 7 ? 0.22 + (n - 7) * 0.1 : 0,
    parTime: 50 + n * 12,
  };
}

export const toolLabel = (t: PlayTool) => TOOLS[t].name;
