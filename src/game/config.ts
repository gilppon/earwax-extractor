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
    name: '평범한 사람 귀',
    emoji: '👂',
    desc: '가장 평범하고 안정적인 귓구멍. 초보 광부의 첫 광산.',
    perks: ['표준 중력', '귓밥 수익 ×1.0'],
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
    name: '외계인 귀',
    emoji: '👽',
    desc: '저중력 귓구멍. 형광 귓밥이 둥둥 떠다니며 구불구불한 통로를 가졌다.',
    perks: ['저중력 (귓밥이 둥둥)', '구불구불 통로', '귓밥 수익 ×1.4'],
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
    name: '고양이 귀',
    emoji: '🐱',
    desc: '좁고 털이 북슬북슬한 귓구멍. 귀가 쫑긋거려서 자꾸 흔들린다!',
    perks: ['좁은 통로', '털 많음 (간지러움 주의)', '귀 쫑긋 흔들림', '귓밥 수익 ×1.9'],
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
    name: '거인 귀',
    emoji: '🗿',
    desc: '거대한 귓구멍에 거대한 귓밥. 무겁고 웅장하지만 수익은 최고!',
    perks: ['넓은 통로', '거대 귓밥 (무거움)', '중력 ×1.35', '귓밥 수익 ×2.8'],
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
    name: '마이크로 면봉',
    en: 'Cotton Swab',
    emoji: '🧻',
    desc: '끈적한 솜뭉치로 귓밥을 붙여 끌어낸다. 팁이 커서 다루기 쉽지만 손떨림이 크다.',
    how: '클릭 유지 = 귓밥 달라붙기 (최대 2개)',
    cost: 0,
    radius: 13,
    power: 1,
    maxSpeed: 13,
    tremor: 1,
  },
  TWEEZER: {
    id: 'TWEEZER',
    name: '미세 집게',
    en: 'Micro Tweezers',
    emoji: '🥢',
    desc: '끝이 아주 작고 정밀. 귓밥을 꽉 집어 안정적으로 뽑아낸다. 박힌 귓밥은 흔들어 뽑는다.',
    how: '클릭 유지 = 집게로 집기 (떼면 놓음, 1개)',
    cost: 350,
    radius: 7,
    power: 1.5,
    maxSpeed: 12,
    tremor: 0.75,
  },
  SONIC_VACUUM: {
    id: 'SONIC_VACUUM',
    name: '음파 흡입기',
    en: 'Sonic Vacuum',
    emoji: '🌀',
    desc: '음파로 귓밥을 진동시켜 떼어내고 흡입한다. 에너지 제한, 고막 근처 공명 주의!',
    how: '클릭 유지 = 흡입 (에너지 소모)',
    cost: 1400,
    radius: 15,
    power: 2.2,
    maxSpeed: 14,
    tremor: 1.15,
  },
  VIBRATOR: {
    id: 'VIBRATOR',
    name: '음파 진동기',
    en: 'Sonic Vibrator',
    emoji: '📳',
    desc: '석회화 덩어리에 균열을 내는 보스전 전용 도구.',
    how: '클릭 유지 = 진동 (가만히 대고 있어야 효과적)',
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
    name: '정밀도 보정 장갑',
    emoji: '🎯',
    max: 8,
    start: 1,
    base: 80,
    growth: 1.62,
    blurb: '손떨림을 줄여 스나이퍼처럼 정밀하게.',
    effect: (l) => `손떨림 ±${tremorAmp(l).toFixed(1)}px`,
  },
  {
    id: 'sensitivity',
    name: '고막 보호막',
    emoji: '🛡️',
    max: 8,
    start: 1,
    base: 120,
    growth: 1.7,
    blurb: '고막 충격 피해를 줄여준다. (tympanicSensitivity)',
    effect: (l) => `받는 피해 ${(damageMult(l) * 100).toFixed(0)}%`,
  },
  {
    id: 'power',
    name: '채굴 출력',
    emoji: '⛏️',
    max: 8,
    start: 1,
    base: 90,
    growth: 1.65,
    blurb: '박혀 있는 귓밥을 더 빨리 떼어낸다.',
    effect: (l) => `채굴력 ×${powerMult(l).toFixed(2)}`,
  },
  {
    id: 'lungs',
    name: '폐활량 (숨 참기)',
    emoji: '💨',
    max: 6,
    start: 1,
    base: 100,
    growth: 1.6,
    blurb: '숨을 더 오래 참아 손떨림을 잡는다.',
    effect: (l) => `숨 참기 ${breathCap(l).toFixed(1)}초`,
  },
  {
    id: 'drone',
    name: '자동 채굴 드론',
    emoji: '🤖',
    max: 10,
    start: 0,
    base: 200,
    growth: 1.7,
    blurb: '연구소 밖에서도 귓밥을 자동으로 모아온다.',
    effect: (l) => (l === 0 ? '미설치' : `분당 ${(droneRate(l) * 60).toFixed(0)} 귓밥`),
  },
];

export const upgradeCost = (u: UpgradeDef, currentLevel: number) =>
  Math.round(u.base * Math.pow(u.growth, Math.max(0, currentLevel - u.start)));

// ── Stages ──────────────────────────────────────────────────
export const STAGE_COUNT = 8;
export const STAGE_NAMES = [
  '입구 청소',
  '굴곡 구간',
  '털숲 지대',
  '석회 지층',
  '재채기 지진',
  '고막 앞 절벽',
  '중력 폭풍',
  '지옥의 심연',
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
