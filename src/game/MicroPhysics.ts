import Phaser from 'phaser';
import { DRUM_FACE, DRUM_X, EXIT_X, H, MOUTH_X, type EarDef } from './config';

// ─────────────────────────────────────────────────────────────
//  MicroPhysics — ear canal geometry, wall/drum bodies, earwax
//  chunk factory (Matter.js) and swaying hairs.
// ─────────────────────────────────────────────────────────────

export type MBody = MatterJS.BodyType;

type Keys = [number, number][];

function interp(keys: Keys, x: number) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [x0, y0] = keys[i];
    const [x1, y1] = keys[i + 1];
    if (x <= x1) {
      const t = (x - x0) / (x1 - x0);
      const s = (1 - Math.cos(t * Math.PI)) / 2;
      return y0 + (y1 - y0) * s;
    }
  }
  return keys[keys.length - 1][1];
}

/** Parametric ear canal: flared mouth → narrow isthmus → funnel to eardrum */
export class Canal {
  private half: Keys = [
    [MOUTH_X, 1.55],
    [40, 1.3],
    [200, 1.0],
    [300, 0.9],
    [430, 0.72],
    [560, 0.88],
    [700, 0.98],
    [800, 0.9],
    [DRUM_X, 0.78],
  ];
  private cen: Keys = [
    [MOUTH_X, 0],
    [100, 0],
    [260, -26],
    [430, 22],
    [600, -18],
    [760, 14],
    [DRUM_X, 0],
  ];

  constructor(
    private ear: EarDef,
    private curveMultiplier = 1,
    private widthMultiplier = 1,
  ) {}

  center(x: number) {
    return H / 2 + interp(this.cen, x) * this.ear.curve * this.curveMultiplier;
  }
  halfH(x: number) {
    return this.ear.base * interp(this.half, x) * this.widthMultiplier;
  }
  top(x: number) {
    return this.center(x) - this.halfH(x);
  }
  bottom(x: number) {
    return this.center(x) + this.halfH(x);
  }
  area() {
    let a = 0;
    for (let x = EXIT_X; x < DRUM_X; x += 10) a += (this.bottom(x) - this.top(x)) * 10;
    return a;
  }
}

export function buildWalls(scene: Phaser.Scene, canal: Canal) {
  const T = 80;
  const step = 14;
  const bodies: MBody[] = [];
  for (const side of [-1, 1]) {
    for (let x = MOUTH_X; x < DRUM_X; x += step) {
      const x2 = Math.min(x + step, DRUM_X);
      const y1 = side < 0 ? canal.top(x) : canal.bottom(x);
      const y2 = side < 0 ? canal.top(x2) : canal.bottom(x2);
      const dx = x2 - x;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      const nx = -dy / len;
      const ny = dx / len; // points "down"
      const off = (side * T) / 2; // bottom wall → +normal, top wall → −normal
      const cx = (x + x2) / 2 + nx * off;
      const cy = (y1 + y2) / 2 + ny * off;
      const body = scene.matter.add.rectangle(cx, cy, len + 3, T, {
        isStatic: true,
        angle: Math.atan2(dy, dx),
        label: 'wall',
        friction: 0.5,
        frictionStatic: 0.8,
        restitution: 0,
      } as never) as MBody;
      bodies.push(body);
    }
  }
  return bodies;
}

export function buildDrum(scene: Phaser.Scene) {
  return scene.matter.add.rectangle(DRUM_FACE + 30, H / 2, 60, H * 2, {
    isStatic: true,
    label: 'drum',
    friction: 0.2,
    restitution: 0,
  } as never) as MBody;
}

// ── Earwax chunks ───────────────────────────────────────────
export type ChunkKind = 'NORMAL' | 'GOLD' | 'HARD' | 'PLUG' | 'FRAG' | 'BOSS';

export interface Chunk {
  id: number;
  body: MBody;
  img: Phaser.GameObjects.Image;
  bonusTag?: Phaser.GameObjects.Text;
  r: number;
  baseR: number;
  sizeScale: number;
  kind: ChunkKind;
  hp: number;
  maxHp: number;
  stuck: boolean;
  held: boolean;
  value: number;
  removed: boolean;
  danger: boolean;
  optional: boolean;
}

let chunkSeq = 1;

export interface ChunkOpts {
  x: number;
  y: number;
  r: number;
  kind: ChunkKind;
  stuck: boolean;
  hpMul?: number;
  value: number;
  danger?: boolean;
  optional?: boolean;
  ignoreGravity?: boolean;
}

export function chunkTexture(kind: ChunkKind) {
  switch (kind) {
    case 'GOLD':
      return 'wax_gold';
    case 'HARD':
      return 'wax_hard';
    case 'PLUG':
      return 'wax_plug';
    case 'FRAG':
      return 'wax_frag';
    case 'BOSS':
      return 'boss0';
    default:
      return `wax_${Math.floor(Math.random() * 4)}`;
  }
}

export function createChunk(scene: Phaser.Scene, o: ChunkOpts): Chunk {
  const heavy = o.kind === 'HARD' || o.kind === 'PLUG' || o.kind === 'FRAG' || o.kind === 'BOSS';
  const sides = o.kind === 'BOSS' ? 11 : o.kind === 'PLUG' ? 12 : o.kind === 'HARD' || o.kind === 'FRAG' ? 8 : 7;
  const body = scene.matter.add.polygon(o.x, o.y, sides, o.r, {
    label: 'wax',
    friction: 0.85,
    frictionStatic: 1.6,
    frictionAir: 0.028,
    restitution: 0.08,
    density: heavy ? 0.004 : 0.0018,
    ignoreGravity: o.ignoreGravity ?? false,
    angle: Math.random() * Math.PI * 2,
  } as never) as MBody;

  const img = scene.add.image(o.x, o.y, chunkTexture(o.kind));
  const d = (o.r * 2) / (o.kind === 'BOSS' ? 0.88 : 0.86);
  img.setDisplaySize(d, d);
  img.setDepth(5);

  const hp = (o.hpMul ?? 1) * (1.4 + o.r * 0.06);
  const chunk: Chunk = {
    id: chunkSeq++,
    body,
    img,
    r: o.r,
    baseR: o.r,
    sizeScale: 1,
    kind: o.kind,
    hp,
    maxHp: hp,
    stuck: false,
    held: false,
    value: o.value,
    removed: false,
    danger: !!o.danger,
    optional: !!o.optional,
  };
  (body as unknown as { chunk: Chunk }).chunk = chunk;
  if (o.stuck) setStuck(scene, chunk, true);
  return chunk;
}

export function setStuck(scene: Phaser.Scene, c: Chunk, stuck: boolean) {
  c.stuck = stuck;
  scene.matter.body.setStatic(c.body, stuck);
}

export function setHeld(c: Chunk, held: boolean) {
  c.held = held;
  c.body.collisionFilter.group = held ? -1 : 0;
}

// ── Hairs ───────────────────────────────────────────────────
export interface Hair {
  rx: number;
  ry: number;
  dir: 1 | -1; // 1 = grows down from the top wall, −1 = up from the bottom wall
  len: number;
  base: number;
  phase: number;
  speed: number;
  amp: number;
  tipX: number;
  tipY: number;
  vx: number;
  vy: number;
  thick: number;
}

export function makeHair(canal: Canal, ear: EarDef, existing: Hair[]): Hair | null {
  for (let tries = 0; tries < 20; tries++) {
    const x = 150 + Math.random() * 640;
    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const clash = existing.some(
      (h) => (h.dir === dir && Math.abs(h.rx - x) < 22) || (h.dir !== dir && Math.abs(h.rx - x) < 60),
    );
    if (clash) continue;
    const gap = canal.halfH(x) * 2;
    const len = gap * (0.22 + Math.random() * 0.18);
    const ry = dir === 1 ? canal.top(x) + 4 : canal.bottom(x) - 4;
    const h: Hair = {
      rx: x,
      ry,
      dir,
      len,
      base: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.9 + Math.random() * 1.3,
      amp: 0.22 + Math.random() * 0.22,
      tipX: x,
      tipY: ry + dir * len,
      vx: 0,
      vy: 0,
      thick: ear.id === 'CAT' ? 5 : 4,
    };
    return h;
  }
  return null;
}

export function updateHair(h: Hair, t: number, sway: number) {
  const a = h.base + Math.sin(t * h.speed + h.phase) * h.amp * sway;
  const nx = h.rx + Math.sin(a) * h.len;
  const ny = h.ry + h.dir * Math.cos(a) * h.len;
  h.vx = nx - h.tipX;
  h.vy = ny - h.tipY;
  h.tipX = nx;
  h.tipY = ny;
}

export function distToHair(h: Hair, x: number, y: number) {
  const ax = h.rx;
  const ay = h.ry;
  const bx = h.tipX;
  const by = h.tipY;
  const abx = bx - ax;
  const aby = by - ay;
  const l2 = abx * abx + aby * aby || 1;
  let t = ((x - ax) * abx + (y - ay) * aby) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (ax + abx * t), y - (ay + aby * t));
}
