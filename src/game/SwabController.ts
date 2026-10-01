import Phaser from 'phaser';
import { DRUM_FACE, MOUTH_X, H, TOOLS, powerMult, tremorAmp, breathCap } from './config';
import type { PlayTool, RunConfig } from './types';
import { Canal, distToHair, setHeld, type Chunk, type Hair, type MBody } from './MicroPhysics';

// ─────────────────────────────────────────────────────────────
//  SwabController — the player's extractor tool.
//  A Matter.js circle servo-driven toward the pointer with hand
//  tremor ("sniper sway"), breath hold, grip/pinch/suction logic.
// ─────────────────────────────────────────────────────────────

interface Hold {
  chunk: Chunk;
  ox: number;
  oy: number;
  slip: number;
}

export interface SwabInput {
  px: number;
  py: number;
  grab: boolean;
  breath: boolean;
}

export interface SwabEnv {
  chunks: Chunk[];
  hairs: Hair[];
  onFree: (c: Chunk) => void;
  onCollect: (c: Chunk) => void;
  onGrab: () => void;
  onSlip: () => void;
  onTickle: () => void;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export class SwabController {
  tip!: MBody;
  tool: PlayTool;
  R: number;
  holds: Hold[] = [];
  speed = 0;
  jolt = { x: 0, y: 0 };
  breath: number;
  cap: number;
  breathLocked = false;
  holding = false;
  energy = 1;
  energyLocked = false;
  grabbing = false;
  vibrating = false;
  sucking = false;
  hairContact = false;
  mining = false;
  miningAt = { x: 0, y: 0 };
  aim = { x: 40, y: H / 2 };
  private amp = 5;
  private prevGrab = false;
  private prevHair = false;
  private grabAge = 0;
  private t = Math.random() * 50;

  constructor(
    private scene: Phaser.Scene,
    private canal: Canal,
    private run: RunConfig,
    tool: PlayTool,
    x: number,
    y: number,
  ) {
    this.tool = tool;
    this.R = TOOLS[tool].radius;
    this.cap = breathCap(run.lungs);
    this.breath = this.cap;
    this.build(x, y);
  }

  private build(x: number, y: number) {
    this.tip = this.scene.matter.add.circle(x, y, this.R, {
      label: 'tool',
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 0,
      density: 0.05,
      inertia: Infinity,
      ignoreGravity: true,
      collisionFilter: { category: 1, mask: 0xffffffff, group: -1 },
    } as never) as MBody;
  }

  get x() {
    return this.tip.position.x;
  }
  get y() {
    return this.tip.position.y;
  }

  vacRadius() {
    return 118 * (1 + 0.02 * (this.run.power - 1));
  }

  setTool(tool: PlayTool) {
    if (tool === this.tool) return;
    this.releaseAll();
    const { x, y } = this.tip.position;
    this.scene.matter.world.remove(this.tip);
    this.tool = tool;
    this.R = TOOLS[tool].radius;
    this.build(x, y);
  }

  drop(c: Chunk) {
    this.holds = this.holds.filter((h) => h.chunk !== c);
  }

  releaseAll() {
    for (const h of this.holds) {
      if (h.chunk.held && !h.chunk.removed) setHeld(h.chunk, false);
    }
    this.holds = [];
  }

  private addHold(c: Chunk, env: SwabEnv) {
    const pos = this.tip.position;
    const dx = c.body.position.x - pos.x;
    const dy = c.body.position.y - pos.y;
    const d = Math.hypot(dx, dy) || 1;
    const maxLen = this.R + c.r * 0.9 + 2;
    const k = d > maxLen ? maxLen / d : 1;
    this.holds.push({ chunk: c, ox: dx * k, oy: dy * k, slip: 0 });
    if (!c.stuck) setHeld(c, true);
    env.onGrab();
  }

  update(dt: number, input: SwabInput, env: SwabEnv) {
    const def = TOOLS[this.tool];
    const M = this.scene.matter.body;
    const pos = this.tip.position;
    this.t += dt;

    // ── breath hold (sniper steady) ──
    const want = input.breath && !this.breathLocked && this.breath > 0;
    if (want) {
      this.breath = Math.max(0, this.breath - dt);
      if (this.breath <= 0) this.breathLocked = true;
    } else {
      this.breath = Math.min(this.cap, this.breath + dt * 0.75);
      if (this.breathLocked && this.breath >= this.cap * 0.4) this.breathLocked = false;
    }
    this.holding = want;

    // ── grab state ──
    this.grabbing = input.grab;
    if (input.grab) this.grabAge += dt;
    else this.grabAge = 0;
    this.vibrating = this.tool === 'VIBRATOR' && input.grab;

    if (this.tool === 'SONIC_VACUUM') {
      this.sucking = input.grab && !this.energyLocked && this.energy > 0;
      if (this.sucking) {
        this.energy = Math.max(0, this.energy - dt * 0.26);
        if (this.energy <= 0) this.energyLocked = true;
      } else {
        this.energy = Math.min(1, this.energy + dt * 0.2);
        if (this.energyLocked && this.energy > 0.35) this.energyLocked = false;
      }
    } else {
      this.sucking = false;
    }

    // ── hair contact ──
    this.hairContact = false;
    for (const h of env.hairs) {
      if (distToHair(h, pos.x, pos.y) < this.R + h.thick * 0.5 + 1) {
        this.hairContact = true;
        this.jolt.x += h.vx * 0.25;
        this.jolt.y += h.vy * 0.25;
      }
    }
    if (this.hairContact && !this.prevHair) env.onTickle();
    this.prevHair = this.hairContact;

    // ── tremor ──
    const near = clamp((pos.x - 640) / 220, 0, 1);
    let amp = tremorAmp(this.run.precision) * def.tremor * (1 + 0.9 * near);
    if (this.holding) amp *= 0.12;
    if (this.vibrating) amp *= 2.4;
    if (this.hairContact) amp *= 2.2;
    if (this.tool === 'COTTON' && this.grabbing) amp *= 1.15;
    this.amp += (amp - this.amp) * Math.min(1, dt * 10);
    const t = this.t;
    const nx = Math.sin(t * 5.7 + 0.3) + 0.6 * Math.sin(t * 11.9 + 1.7) + 0.3 * Math.sin(t * 23.1);
    const ny = Math.sin(t * 6.3 + 2.1) + 0.6 * Math.sin(t * 10.7 + 0.4) + 0.3 * Math.sin(t * 19.3);

    this.aim.x = clamp(input.px, MOUTH_X + 60, DRUM_FACE - this.R + 6);
    this.aim.y = clamp(input.py, 0, H);
    const tx = this.aim.x + nx * this.amp * 0.55;
    const ty = this.aim.y + ny * this.amp * 0.55;

    // ── servo velocity ──
    this.speed = Math.hypot(this.tip.velocity.x, this.tip.velocity.y);
    let vx = (tx - pos.x) * 0.26;
    let vy = (ty - pos.y) * 0.26;
    const maxS = def.maxSpeed * (this.holding ? 0.5 : 1);
    const sp = Math.hypot(vx, vy);
    if (sp > maxS) {
      vx = (vx / sp) * maxS;
      vy = (vy / sp) * maxS;
    }
    vx += this.jolt.x;
    vy += this.jolt.y;
    const decay = Math.pow(0.86, dt * 60);
    this.jolt.x *= decay;
    this.jolt.y *= decay;
    M.setVelocity(this.tip, { x: vx, y: vy });

    // ── safety clamps ──
    if (pos.x > 0) {
      const top = this.canal.top(pos.x) + this.R * 0.5;
      const bot = this.canal.bottom(pos.x) - this.R * 0.5;
      if (pos.y < top || pos.y > bot) M.setPosition(this.tip, { x: pos.x, y: clamp(pos.y, top, bot) });
    }
    if (pos.x > DRUM_FACE - this.R + 2) M.setPosition(this.tip, { x: DRUM_FACE - this.R + 2, y: pos.y });

    // ── grab / hold logic ──
    const edge = input.grab && !this.prevGrab;
    this.prevGrab = input.grab;
    const heldSet = new Set(this.holds.map((h) => h.chunk));

    if (this.tool === 'COTTON') {
      if (input.grab) {
        for (const c of env.chunks) {
          if (this.holds.length >= 2) break;
          if (c.removed || c.held || c.kind === 'BOSS' || heldSet.has(c)) continue;
          const d = Math.hypot(c.body.position.x - pos.x, c.body.position.y - pos.y);
          if (d < this.R + c.r + 5) this.addHold(c, env);
        }
      } else if (this.holds.length) this.releaseAll();
    } else if (this.tool === 'TWEEZER') {
      if (input.grab && this.grabAge < 0.22 && this.holds.length === 0) {
        let best: Chunk | null = null;
        let bd = 1e9;
        for (const c of env.chunks) {
          if (c.removed || c.held || c.kind === 'BOSS') continue;
          const d = Math.hypot(c.body.position.x - pos.x, c.body.position.y - pos.y) - c.r;
          if (d < this.R + 9 && d < bd) {
            bd = d;
            best = c;
          }
        }
        if (best) this.addHold(best, env);
      } else if (!input.grab && this.holds.length) this.releaseAll();
      void edge;
    }

    // held chunk servo
    const tv = this.tip.velocity;
    for (let i = this.holds.length - 1; i >= 0; i--) {
      const h = this.holds[i];
      const c = h.chunk;
      if (c.removed) {
        this.holds.splice(i, 1);
        continue;
      }
      if (c.stuck) continue;
      if (!c.held) setHeld(c, true);
      const g = this.tool === 'TWEEZER' ? 0.55 : 0.34;
      const ex = pos.x + h.ox - c.body.position.x;
      const ey = pos.y + h.oy - c.body.position.y;
      const err = Math.hypot(ex, ey);
      let cvx = tv.x + ex * g;
      let cvy = tv.y + ey * g;
      const cs = Math.hypot(cvx, cvy);
      if (cs > 24) {
        cvx = (cvx / cs) * 24;
        cvy = (cvy / cs) * 24;
      }
      M.setVelocity(c.body, { x: cvx, y: cvy });
      M.setAngularVelocity(c.body, c.body.angularVelocity * 0.7);
      const slipDist = this.tool === 'TWEEZER' ? 60 : 30;
      if (err > slipDist) h.slip += dt;
      else h.slip = Math.max(0, h.slip - dt * 2);
      if (h.slip > 0.18) {
        this.holds.splice(i, 1);
        setHeld(c, false);
        env.onSlip();
      }
    }

    // ── vacuum suction ──
    if (this.sucking) {
      const VR = this.vacRadius();
      for (const c of [...env.chunks]) {
        if (c.removed || c.stuck || c.kind === 'BOSS') continue;
        const dx = pos.x - c.body.position.x;
        const dy = pos.y - c.body.position.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d >= VR) continue;
        if (d < this.R + c.r + 4) {
          env.onCollect(c);
          continue;
        }
        const f = 1 - d / VR;
        const heavy = c.kind === 'HARD' || c.kind === 'FRAG' ? 0.55 : 1;
        const s = (0.1 + 1.7 * f * f) * heavy;
        const bv = c.body.velocity;
        M.setVelocity(c.body, { x: bv.x * 0.9 + (dx / d) * s, y: bv.y * 0.9 + (dy / d) * s });
      }
    }

    // ── mining (detaching stuck wax) ──
    this.mining = false;
    const pw = powerMult(this.run.power) * def.power;
    for (const c of [...env.chunks]) {
      if (c.removed || !c.stuck || c.kind === 'BOSS') continue;
      const d = Math.hypot(c.body.position.x - pos.x, c.body.position.y - pos.y);
      let dmg = 0;
      if (this.sucking) {
        const VR = this.vacRadius();
        if (d < VR) dmg = dt * 4.4 * pw * (1 - d / VR);
      } else if (d < this.R + c.r + 3) {
        dmg = dt * pw * (0.45 + this.speed * 0.16);
        if (heldSet.has(c)) dmg *= 2.4;
      }
      if (dmg > 0) {
        c.hp -= dmg;
        this.mining = true;
        this.miningAt.x = c.body.position.x;
        this.miningAt.y = c.body.position.y;
        if (c.hp <= 0) env.onFree(c);
      }
    }
  }

  // ─────────────────────────── rendering ───────────────────────────
  draw(g: Phaser.GameObjects.Graphics, time: number) {
    const x = this.tip.position.x;
    const y = this.tip.position.y;
    const R = this.R;
    const cy0 = this.canal.center(0);
    const ax = -150;
    const ay = cy0 + (y - cy0) * 0.5 + 30;
    const ang = Math.atan2(y - ay, x - ax);
    const ux = Math.cos(ang);
    const uy = Math.sin(ang);
    const nx = -uy;
    const ny = ux;

    // sniper reticle (shows hand-sway radius around aim point)
    g.lineStyle(1.5, 0xffffff, this.holding ? 0.7 : 0.28);
    g.strokeCircle(this.aim.x, this.aim.y, 5 + this.amp * 0.9);
    g.lineStyle(1, 0xffffff, this.holding ? 0.6 : 0.2);
    g.lineBetween(this.aim.x - 3, this.aim.y, this.aim.x + 3, this.aim.y);
    g.lineBetween(this.aim.x, this.aim.y - 3, this.aim.x, this.aim.y + 3);

    switch (this.tool) {
      case 'COTTON': {
        const sx = x - ux * R * 0.5;
        const sy = y - uy * R * 0.5;
        g.lineStyle(10, 0x5f4d31, 1);
        g.lineBetween(ax, ay, sx, sy);
        g.lineStyle(7, 0xf5ecd8, 1);
        g.lineBetween(ax, ay, sx, sy);
        g.lineStyle(2, 0xffffff, 0.8);
        g.lineBetween(ax + nx * 1.6, ay + ny * 1.6, sx + nx * 1.6, sy + ny * 1.6);
        const sq = this.grabbing ? 0.93 : 1;
        g.fillStyle(0xd9d3c8, 1);
        g.fillCircle(x, y, R * sq);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(x + nx * R * 0.32, y + ny * R * 0.32, R * 0.72 * sq);
        g.fillCircle(x - nx * R * 0.32, y - ny * R * 0.32, R * 0.72 * sq);
        g.fillCircle(x + ux * R * 0.15, y + uy * R * 0.15, R * 0.68 * sq);
        g.fillStyle(0xf1eee8, 0.9);
        g.fillCircle(x - ux * R * 0.35 - nx * R * 0.1, y - uy * R * 0.35 - ny * R * 0.1, R * 0.35);
        g.lineStyle(1.5, 0xb3ac9f, 0.9);
        g.strokeCircle(x, y, R * sq);
        if (this.holds.length) {
          g.fillStyle(0xd9a441, 0.55);
          g.fillCircle(x + ux * R * 0.5, y + uy * R * 0.5, R * 0.42);
          g.fillCircle(x + nx * R * 0.4, y + ny * R * 0.4, R * 0.28);
        }
        break;
      }
      case 'TWEEZER': {
        const gap = this.grabbing ? 0.7 : 4.4;
        const mx = x - ux * 95;
        const my = y - uy * 95;
        for (const s of [-1, 1]) {
          const bx = ax + nx * s * 9;
          const by = ay + ny * s * 9;
          const m2x = mx + nx * s * (gap + 4.5);
          const m2y = my + ny * s * (gap + 4.5);
          const tx = x + nx * s * gap;
          const ty = y + ny * s * gap;
          g.lineStyle(6, 0x56626d, 1);
          g.lineBetween(bx, by, m2x, m2y);
          g.lineBetween(m2x, m2y, tx, ty);
          g.lineStyle(3.2, 0xe3e9ee, 1);
          g.lineBetween(bx, by, m2x, m2y);
          g.lineBetween(m2x, m2y, tx, ty);
          g.fillStyle(0x9aa7b3, 1);
          g.fillCircle(tx, ty, 2.6);
        }
        g.lineStyle(1, 0xffffff, this.grabbing ? 0.5 : 0.25);
        g.strokeCircle(x, y, R + 9);
        break;
      }
      case 'SONIC_VACUUM': {
        const bx = x - ux * 28;
        const by = y - uy * 28;
        g.lineStyle(22, 0x2b3a42, 1);
        g.lineBetween(ax, ay, bx, by);
        g.lineStyle(16, 0x607d8b, 1);
        g.lineBetween(ax, ay, bx, by);
        g.lineStyle(4, 0xb0bec5, 0.8);
        g.lineBetween(ax + nx * 4, ay + ny * 4, bx + nx * 4, by + ny * 4);
        g.fillStyle(0x455a64, 1);
        g.fillPoints(
          [
            { x: x - ux * 36 + nx * 10, y: y - uy * 36 + ny * 10 },
            { x: x + ux * R * 0.25 + nx * R, y: y + uy * R * 0.25 + ny * R },
            { x: x + ux * R * 0.25 - nx * R, y: y + uy * R * 0.25 - ny * R },
            { x: x - ux * 36 - nx * 10, y: y - uy * 36 - ny * 10 },
          ],
          true,
          true,
        );
        g.lineStyle(2.5, this.sucking ? 0x4dd0e1 : 0x90a4ae, 1);
        g.strokeCircle(x, y, R);
        if (this.sucking) {
          const VR = this.vacRadius();
          g.lineStyle(1.5, 0x80deea, 0.16);
          g.strokeCircle(x, y, VR);
          for (let k = 0; k < 3; k++) {
            const ph = (time * 1.6 + k / 3) % 1;
            g.lineStyle(2, 0x80deea, ph * 0.45);
            g.strokeCircle(x, y, VR * (1 - ph) + R);
          }
        }
        break;
      }
      case 'VIBRATOR': {
        const bx = x - ux * 8;
        const by = y - uy * 8;
        g.lineStyle(17, 0x1f2a30, 1);
        g.lineBetween(ax, ay, bx, by);
        g.lineStyle(12, 0x546e7a, 1);
        g.lineBetween(ax, ay, bx, by);
        g.lineStyle(12, 0xff7043, 1);
        g.lineBetween(x - ux * 52, y - uy * 52, x - ux * 38, y - uy * 38);
        g.fillStyle(0xcfd8dc, 1);
        g.fillCircle(x, y, R * 0.8);
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(x - R * 0.25, y - R * 0.25, R * 0.25);
        g.lineStyle(2, 0x455a64, 1);
        g.strokeCircle(x, y, R * 0.8);
        if (this.vibrating) {
          for (let k = 0; k < 3; k++) {
            const ph = (time * 2.4 + k / 3) % 1;
            g.lineStyle(3, 0xffab40, (1 - ph) * 0.8);
            g.strokeCircle(x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 2, R * 0.8 + ph * 46);
          }
        }
        break;
      }
    }
  }
}
