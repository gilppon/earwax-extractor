import Phaser from 'phaser';
import {
  DRUM_X,
  EARS,
  EXIT_X,
  H,
  MOUTH_X,
  W,
  damageMult,
  stageParams,
  type EarDef,
} from './config';
import {
  Canal,
  buildDrum,
  buildWalls,
  createChunk,
  distToHair,
  makeHair,
  setStuck,
  updateHair,
  type Chunk,
  type ChunkKind,
  type Hair,
} from './MicroPhysics';
import { SwabController, type SwabEnv } from './SwabController';
import { buildTextures } from './Textures';
import type { AsmrSynth } from './AsmrSynth';
import type { Bonus, GameCallbacks, HudState, PlayTool, RunConfig, RunResult } from './types';

const FONT = '"Jua","Noto Sans KR","Malgun Gothic",sans-serif';
const DRUM_HIT_X = DRUM_X - 10;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function shade(color: number, k: number) {
  const r = clamp(Math.round(((color >> 16) & 255) * k), 0, 255);
  const g = clamp(Math.round(((color >> 8) & 255) * k), 0, 255);
  const b = clamp(Math.round((color & 255) * k), 0, 255);
  return (r << 16) | (g << 8) | b;
}

function lerpColor(a: number, b: number, t: number) {
  const ar = (a >> 16) & 255,
    ag = (a >> 8) & 255,
    ab = a & 255;
  const br = (b >> 16) & 255,
    bg = (b >> 8) & 255,
    bb = b & 255;
  return (
    (Math.round(ar + (br - ar) * t) << 16) | (Math.round(ag + (bg - ag) * t) << 8) | Math.round(ab + (bb - ab) * t)
  );
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KIND_MULT: Record<ChunkKind, number> = { NORMAL: 1, GOLD: 3, HARD: 2, PLUG: 2.8, FRAG: 6, BOSS: 0 };

/** Low-spec mode: stop ambient particles + skip red flashes (set from GameHandle) */
let lowFxMode = false;
export function setSceneLowFx(v: boolean) {
  lowFxMode = v;
}

export class GameScene extends Phaser.Scene {
  private ear!: EarDef;
  private canal!: Canal;
  private chunks: Chunk[] = [];
  private hairs: Hair[] = [];
  private swab!: SwabController;
  private env!: SwabEnv;
  private boss: Chunk | null = null;
  private endlessGoldPending = false;

  private underG!: Phaser.GameObjects.Graphics;
  private hairG!: Phaser.GameObjects.Graphics;
  private drumG!: Phaser.GameObjects.Graphics;
  private toolG!: Phaser.GameObjects.Graphics;
  private fxG!: Phaser.GameObjects.Graphics;
  private vignette!: Phaser.GameObjects.Rectangle;
  private tint!: Phaser.GameObjects.Rectangle;
  private crumbs!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;

  private keys: { space?: Phaser.Input.Keyboard.Key; shift?: Phaser.Input.Keyboard.Key } = {};
  private ptr = { x: 40, y: H / 2 };
  private touchGrab = false;
  private canvasTouchGrab = false;
  private touchBreath = false;

  private over = false;
  private phase = 'PLAY';
  private animT = 0;
  private hudT = 0;
  private hbT = 0.5;
  private spawnT = 2;
  private flinchT = 8;
  private flinchInterval = 0;
  private warnT = 0;
  private sneezeMeter = 0;
  private sway = 0;
  private gm = 0.6;
  private gravAngle = 0;
  private fragsLeft = 0;
  private danger = 0;
  private corePulseTimer = 0;
  private corePulseWarning = false;
  private corePulseFx = 0;
  private hitFlashV = 0;
  private wallScrapeFxT = 0;
  private hairTarget = 0;
  private clogNow = 0;
  private canalArea = 1;
  private sensMult = 1;

  private st = {
    hp: 100,
    minHp: 100,
    score: 0,
    wax: 0,
    extracted: 0,
    target: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    hitCd: 0,
    hitFlash: 0,
    time: 0,
    depth: 1,
    cracks: 0,
    charge: 0,
  };

  constructor(
    private run: RunConfig,
    private cb: GameCallbacks,
    private synth: AsmrSynth,
  ) {
    super({ key: 'Game' });
  }

  // ═════════════════════════════ setup ═════════════════════════════
  create() {
    // revive retry: +30% eardrum durability
    if (this.run.reviveBuff) {
      this.st.hp = 130;
      this.st.minHp = 130;
    }
    this.ear = EARS[this.run.ear];
    const stageShape = this.run.mode === 'STAGE' ? stageParams(this.run.stage) : undefined;
    this.canal = new Canal(this.ear, stageShape?.canalCurve ?? 1, stageShape?.canalWidth ?? 1);
    this.canalArea = this.canal.area();
    this.sensMult = damageMult(this.run.sensitivity);
    const pal = this.ear.palette;

    buildTextures(this, pal);
    this.cameras.main.setBackgroundColor(pal.skinDark);

    this.gm = 0.6 * this.ear.gravity;
    this.matter.world.setGravity(0, this.gm, 0.001);

    this.drawBackground();
    this.createPatientAvatar();
    buildWalls(this, this.canal);
    buildDrum(this);

    this.underG = this.add.graphics().setDepth(4);
    this.hairG = this.add.graphics().setDepth(6);
    this.drumG = this.add.graphics().setDepth(2);
    this.toolG = this.add.graphics().setDepth(8);
    this.fxG = this.add.graphics().setDepth(9);
    this.tint = this.add.rectangle(W / 2, H / 2, W, H, 0x4a0018, 1).setDepth(3).setAlpha(0);
    this.vignette = this.add.rectangle(W / 2, H / 2, W, H, 0xff0000, 1).setDepth(15).setAlpha(0);

    this.crumbs = this.add
      .particles(0, 0, 'dot', {
        lifespan: { min: 300, max: 750 },
        speed: { min: 40, max: 190 },
        scale: { start: 0.75, end: 0 },
        alpha: { start: 1, end: 0 },
        gravityY: 260,
        tint: [pal.wax, pal.waxDark, pal.waxLight],
        emitting: false,
      })
      .setDepth(12);
    this.sparks = this.add
      .particles(0, 0, 'spark', {
        lifespan: { min: 400, max: 900 },
        speed: { min: 30, max: 140 },
        scale: { start: 0.9, end: 0 },
        alpha: { start: 1, end: 0 },
        blendMode: 'ADD',
        emitting: false,
      })
      .setDepth(13);
    this.add
      .particles(0, 0, 'dot', {
        x: { min: 60, max: 820 },
        y: { min: 130, max: 420 },
        lifespan: 4200,
        speedX: { min: -8, max: 8 },
        speedY: { min: -7, max: 7 },
        scale: { start: 0.35, end: 0 },
        alpha: { start: 0.35, end: 0 },
        frequency: lowFxMode ? 900 : 260,
        quantity: lowFxMode ? 1 : 2,
        tint: 0xffe6cc,
        blendMode: 'ADD',
      })
      .setDepth(3);

    this.add
      .text(EXIT_X + 8, this.canal.top(EXIT_X) + 8, '◀ EXIT', {
        fontFamily: FONT,
        fontSize: '15px',
        color: '#ffffff',
      })
      .setAlpha(0.45)
      .setDepth(1);

    // tool
    const startTool: PlayTool = this.run.mode === 'BOSS' ? 'VIBRATOR' : this.run.tool;
    this.swab = new SwabController(this, this.canal, this.run, startTool, 40, this.canal.center(40));
    this.ptr = { x: 90, y: this.canal.center(90) };
    this.swab.aim.x = this.ptr.x;
    this.swab.aim.y = this.ptr.y;

    this.env = {
      chunks: this.chunks,
      hairs: this.hairs,
      onFree: (c) => this.onFree(c),
      onCollect: (c) => this.collect(c, 'vacuum'),
      onGrab: () => this.synth.grab(),
      onSlip: () => {
        this.synth.slip();
        this.floatText(this.swab.x, this.swab.y - 24, 'Squelch!', '#ffffff');
      },
      onTickle: () => {
        this.synth.tickle();
        this.sneezeMeter = Math.min(100, this.sneezeMeter + 6);
      },
    };

    // input
    this.input.mouse?.disableContextMenu();
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.ptr.x = p.x;
      this.ptr.y = p.y;
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.ptr.x = p.x;
      this.ptr.y = p.y;
      if (p.wasTouch) this.canvasTouchGrab = true;
    });
    const releaseCanvasTouch = (p: Phaser.Input.Pointer) => {
      if (p.wasTouch) this.canvasTouchGrab = false;
    };
    this.input.on('pointerup', releaseCanvasTouch);
    this.input.on('pointerupoutside', releaseCanvasTouch);
    this.input.on('pointercancel', releaseCanvasTouch);
    if (this.input.keyboard) {
      this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    // mode init
    if (this.run.mode === 'STAGE') this.initStage();
    else if (this.run.mode === 'ENDLESS') this.initEndless();
    else this.initBoss();

    this.synth.startLoops();
    this.cameras.main.fadeIn(350, 0, 0, 0);
    this.emitHud();
  }

  setTouch(grab: boolean, breath: boolean) {
    this.touchGrab = grab;
    this.touchBreath = breath;
  }

  // ═════════════════════════════ background (포키 팝 ASMR 젤리 클리닉) ═════════════════════════════
  private drawBackground() {
    const p = this.ear.palette;
    const g = this.add.graphics().setDepth(0);
    
    // 1. 포근하고 화사한 캔디 파스텔 그라데이션 베이스
    g.fillStyle(p.skinDark, 1);
    g.fillRect(0, 0, W, H);
    
    // 2. 뽀송뽀송 샴푸/에어 버블 & 반짝이 파티클 (징그러운 모공 점 완전 제거!)
    const rand = mulberry(12);
    for (let i = 0; i < 45; i++) {
      const bx = rand() * W;
      const by = rand() * H;
      const br = 12 + rand() * 42;
      g.fillStyle(0xffffff, 0.08 + rand() * 0.12);
      g.fillCircle(bx, by, br);
      g.lineStyle(1.8, 0xffffff, 0.2 + rand() * 0.2);
      g.strokeCircle(bx, by, br);
      g.fillStyle(0xffffff, 0.35);
      g.fillCircle(bx - br * 0.35, by - br * 0.35, br * 0.18);
    }

    const xs: number[] = [];
    for (let x = MOUTH_X; x < DRUM_X; x += 8) xs.push(x);
    xs.push(DRUM_X);
    const poly = (k: number) => {
      const pts: { x: number; y: number }[] = [];
      for (const x of xs) pts.push({ x, y: this.canal.center(x) - this.canal.halfH(x) * k });
      for (let i = xs.length - 1; i >= 0; i--) {
        const x = xs[i];
        pts.push({ x, y: this.canal.center(x) + this.canal.halfH(x) * k });
      }
      return pts;
    };

    // 3. 쫀득한 젤리 외이도 터널 (부드러운 스트로베리 핑크 쉐이딩)
    g.fillStyle(shade(p.wall, 0.8), 1);
    g.fillPoints(poly(1.10), true, true);
    
    const N = 8;
    for (let i = 0; i < N; i++) {
      const k = 1.03 - i * (0.86 / N);
      g.fillStyle(lerpColor(p.wall, p.inner, i / (N - 1)), 1);
      g.fillPoints(poly(k), true, true);
    }

    // 4. 젤리 림 하이라이트 윤곽선 (징그러운 핏줄 대신 맑은 젤리 광택 라인)
    g.lineStyle(3.5, 0xffffff, 0.55);
    const topPts = xs.map(x => ({ x, y: this.canal.top(x) + 2 }));
    const btmPts = xs.map(x => ({ x, y: this.canal.bottom(x) - 2 }));
    g.strokePoints(topPts, false, false);
    g.strokePoints(btmPts, false, false);

    // 은은한 별빛 스파클
    for (let i = 0; i < 12; i++) {
      const sx = 120 + rand() * 680;
      const sy = this.canal.center(sx) + (rand() - 0.5) * this.canal.halfH(sx) * 1.2;
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(sx, sy, 2 + rand() * 2);
    }

    // 5. 깔끔한 EXIT 점선 가이드
    g.lineStyle(2.5, 0x38bdf8, 0.65);
    const y0 = this.canal.top(EXIT_X);
    const y1 = this.canal.bottom(EXIT_X);
    for (let y = y0; y < y1; y += 14) g.lineBetween(EXIT_X, y, EXIT_X, Math.min(y + 7, y1));
  }

  // ═════════════════════════════ mode init ═════════════════════════════
  private tryPlace(o: {
    kind: ChunkKind;
    stuck: boolean;
    xMin: number;
    xMax: number;
    danger?: boolean;
    hpMul?: number;
    grow?: boolean;
    optional?: boolean;
    preferTop?: boolean;
    preferCenter?: boolean;
    radiusMul?: number;
  }): Chunk | null {
    const cs = this.ear.chunkScale;
    for (let tries = 0; tries < 40; tries++) {
      const r =
        (o.kind === 'GOLD' ? rnd(12, 16) : o.kind === 'PLUG' ? rnd(36, 42) : o.kind === 'HARD' ? rnd(16, 22) : rnd(13, 21)) *
        cs *
        (o.radiusMul ?? 1);
      const x = rnd(o.xMin, o.xMax);
      const side = o.preferTop ? -1 : Math.random() < 0.5 ? -1 : 1;
      const y = o.preferCenter
        ? this.canal.center(x)
        : o.stuck
          ? side < 0
            ? this.canal.top(x) + r * 0.72
            : this.canal.bottom(x) - r * 0.72
          : this.canal.bottom(x) - r - 3;
      if (this.chunks.some((c) => Math.hypot(c.body.position.x - x, c.body.position.y - y) < c.r + r + 6)) continue;
      const zone = x > 700 ? 1.6 : 1;
      const value = Math.max(
        1,
        Math.round(r * 0.6 * KIND_MULT[o.kind] * this.ear.valueMult * zone * (cs > 1 ? 1 / Math.sqrt(cs) : 1)),
      );
      const c = createChunk(this, {
        x,
        y,
        r,
        kind: o.kind,
        stuck: o.stuck,
        hpMul: o.hpMul ?? (o.kind === 'PLUG' ? 4.8 : o.kind === 'HARD' ? 3 : o.kind === 'GOLD' ? 1.6 : 1),
        value,
        danger: !!o.danger || x > 720,
        optional: o.optional,
      });
      this.chunks.push(c);
      if (o.grow) {
        const s = c.img.scaleX;
        this.tweens.add({ targets: c.img, scaleX: { from: s * 0.2, to: s }, scaleY: { from: s * 0.2, to: s }, duration: 480, ease: 'Back.Out' });
        this.crumbs.emitParticleAt(x, y, lowFxMode ? 2 : 6);
      }
      return c;
    }
    return null;
  }

  private initStage() {
    const sp = stageParams(this.run.stage);
    const kinds: ChunkKind[] = [];
    if (this.run.stage === 1) kinds.push('PLUG');
    for (let i = 0; i < sp.plugs; i++) kinds.push('PLUG');
    for (let i = 0; i < sp.gold; i++) kinds.push('GOLD');
    for (let i = 0; i < sp.hard; i++) kinds.push('HARD');
    while (kinds.length < sp.target) kinds.push('NORMAL');
    kinds.sort(() => Math.random() - 0.5);
    if (this.run.stage === 1) {
      const starterIndex = kinds.indexOf('NORMAL');
      if (starterIndex > 0) kinds.unshift(kinds.splice(starterIndex, 1)[0]);
    }
    let placed = 0;
    let tutorialPickupPlaced = false;
    kinds.forEach((kind, i) => {
      const dangerous = i < sp.danger;
      const plug = kind === 'PLUG';
      const stageOnePlug = this.run.stage === 1 && plug;
      const stuck = kind !== 'NORMAL' ? true : Math.random() < sp.stuckRatio;
      const tutorialPickup = this.run.stage === 1 && kind === 'NORMAL' && !tutorialPickupPlaced;
      if (tutorialPickup) tutorialPickupPlaced = true;
      const c = this.tryPlace({
        kind,
        stuck: tutorialPickup ? true : dangerous ? true : stuck,
        xMin: tutorialPickup ? 160 : stageOnePlug ? 270 : plug ? 360 : dangerous ? 725 : 170,
        xMax: tutorialPickup ? 210 : stageOnePlug ? 350 : plug ? 620 : dangerous ? 805 : 700,
        danger: tutorialPickup ? false : dangerous,
        preferCenter: tutorialPickup,
        preferTop: stageOnePlug,
        radiusMul: stageOnePlug ? 0.82 : undefined,
      });
      if (c) placed++;
    });
    if (this.run.stage === 1) {
      const bonusGold = this.tryPlace({ kind: 'GOLD', stuck: true, xMin: 748, xMax: 805, danger: true, optional: true, preferTop: true });
      if (bonusGold) {
        bonusGold.bonusTag = this.add
          .text(0, 0, '3×', {
            fontFamily: FONT,
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffe066',
            stroke: '#2a0810',
            strokeThickness: 4,
            backgroundColor: '#5c3b00',
            padding: { x: 5, y: 2 },
          })
          .setOrigin(0.5)
          .setDepth(8);
        this.time.delayedCall(1900, () => {
          if (!bonusGold.removed) this.banner('BONUS GOLD BY THE DRUM · 3× WAX', '#ffe066', 24);
        });
      }
    }
    this.st.target = placed;
    this.hairTarget = Math.round(sp.hairs * this.ear.hairMult);
    for (let i = 0; i < this.hairTarget; i++) {
      const h = makeHair(this.canal, this.ear, this.hairs);
      if (h) this.hairs.push(h);
    }
    this.flinchInterval = sp.flinch;
    this.flinchT = sp.flinch || 999;
    this.sway = sp.sway * this.ear.wobble;
    this.corePulseTimer = sp.corePulse ? 12 : 0;
    this.corePulseWarning = false;
    this.corePulseFx = 0;
    this.time.delayedCall(500, () => this.banner(`STAGE ${this.run.stage}`, '#ffe58a', 40));
  }

  private initEndless() {
    this.st.target = 0;
    for (let i = 0; i < 5; i++) {
      this.tryPlace({ kind: 'NORMAL', stuck: Math.random() < 0.6, xMin: 180, xMax: 720 });
    }
    this.hairTarget = Math.round(2 * this.ear.hairMult);
    for (let i = 0; i < this.hairTarget; i++) {
      const h = makeHair(this.canal, this.ear, this.hairs);
      if (h) this.hairs.push(h);
    }
    this.flinchInterval = 13;
    this.flinchT = 12;
    this.sway = 0.12 * this.ear.wobble;
    this.spawnT = 2.2;
    this.time.delayedCall(500, () => this.banner('Endless Earwax Mine', '#ff9ec2', 38));
  }

  private initBoss() {
    this.phase = 'CRACK';
    const r = 46 * Math.pow(this.ear.chunkScale, 0.8);
    const x = DRUM_X - 14 - r;
    const y = this.canal.center(x);
    const boss = createChunk(this, { x, y, r, kind: 'BOSS', stuck: true, hpMul: 9999, value: 0 });
    this.boss = boss;
    this.chunks.push(boss);
    this.hairTarget = Math.round(3 * this.ear.hairMult);
    for (let i = 0; i < this.hairTarget; i++) {
      const h = makeHair(this.canal, this.ear, this.hairs);
      if (h) this.hairs.push(h);
    }
    this.st.target = 3;
    this.flinchInterval = 8;
    this.flinchT = 7;
    this.sway = 0.08;
    this.time.delayedCall(500, () => this.banner('Lime Wax Boulder', '#ffd180', 38));
  }

  // ═════════════════════════════ main loop ═════════════════════════════
  update(_time: number, delta: number) {
    const dt = Math.min(delta / 1000, 0.05);
    this.animT += dt;

    if (!this.over) {
      this.st.time += dt;
      const p = this.input.activePointer;
      const mouseGrab = !p.wasTouch && p.leftButtonDown();
      const grab = mouseGrab || !!this.keys.space?.isDown || this.touchGrab || this.canvasTouchGrab;
      const breath = (!p.wasTouch && p.rightButtonDown()) || !!this.keys.shift?.isDown || this.touchBreath;

      this.swab.update(dt, { px: this.ptr.x, py: this.ptr.y, grab, breath }, this.env);

      this.st.comboTimer = Math.max(0, this.st.comboTimer - dt);
      if (this.st.comboTimer <= 0) this.st.combo = 0;

      this.updateHairs();
      this.checkExits();
      this.updateMode(dt);
      this.updateCorePulse(dt);
      this.updateFlinch(dt);
      this.applySway();
      this.checkDrum(dt);
      this.checkWallScrape(dt);
      this.safety();
      this.updateAudio(dt);
    }

    this.render();

    this.hudT += dt;
    if (this.hudT >= 0.1) {
      this.hudT = 0;
      this.emitHud();
    }
  }

  private updateHairs() {
    const swayMult = this.run.mode === 'ENDLESS' ? 1 + this.st.depth * 0.06 : 1;
    for (const h of this.hairs) updateHair(h, this.animT, swayMult);
  }

  private updateCorePulse(dt: number) {
    this.corePulseFx = Math.max(0, this.corePulseFx - dt * 1.25);
    if (this.run.mode !== 'STAGE' || this.run.stage !== 12 || this.corePulseTimer <= 0) return;

    this.corePulseTimer -= dt;
    if (this.corePulseTimer > 0 && this.corePulseTimer <= 2 && !this.corePulseWarning) {
      this.corePulseWarning = true;
      this.synth.corePulseWarn();
      this.banner('CORE PULSE · LOOSE WAX WILL SURGE LEFT', '#8be9fd', 25);
    }
    if (this.corePulseTimer > 0) return;

    this.corePulseWarning = false;
    this.corePulseTimer = 22;
    this.corePulseFx = 1;
    this.synth.thump(1.05);
    for (const c of this.chunks) {
      if (c.removed || c.stuck || c.held || c.kind === 'BOSS') continue;
      const { x, y } = c.body.position;
      if (x <= EXIT_X + 20 || x >= DRUM_X - 35) continue;
      const velocity = c.body.velocity;
      this.matter.body.setVelocity(c.body, {
        x: clamp(Math.min(velocity.x - 3.2, -4.2), -8, -4.2),
        y: velocity.y * 0.45 + (y < this.canal.center(x) ? -0.35 : 0.35),
      });
    }
  }

  private checkExits() {
    for (const c of [...this.chunks]) {
      if (c.removed || c.stuck || c.kind === 'BOSS') continue;
      if (c.body.position.x < EXIT_X) this.collect(c, 'exit');
    }
  }

  private applySway() {
    if (this.sway <= 0) return;
    const a = Math.sin(this.animT * 0.36) * this.sway + Math.sin(this.animT * 0.93 + 1) * this.sway * 0.25;
    this.gravAngle = a;
    this.matter.world.setGravity(Math.sin(a) * this.gm * 1.1, Math.cos(a) * this.gm, 0.001);
  }

  private updateMode(dt: number) {
    if (this.run.mode === 'ENDLESS') {
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnEndless();
        this.spawnT = Math.max(1.1, 3.4 - this.st.depth * 0.28) * rnd(0.8, 1.2);
      }
      let area = 0;
      for (const c of this.chunks) area += Math.PI * c.r * c.r;
      this.clogNow = area / (this.canalArea * 0.14);
      if (this.clogNow >= 1) this.finish(false, 'CLOG');
    } else if (this.run.mode === 'BOSS' && this.phase === 'CRACK') {
      this.updateBoss(dt);
    }
  }

  private spawnEndless() {
    const d = this.st.depth;
    const goldVein = this.endlessGoldPending;
    const roll = Math.random();
    const kind: ChunkKind = goldVein ? 'GOLD' : roll < 0.08 ? 'GOLD' : roll < 0.18 + d * 0.02 ? 'HARD' : 'NORMAL';
    const stuck = goldVein ? false : kind !== 'NORMAL' || Math.random() < 0.7;
    const c = this.tryPlace({
      kind,
      stuck,
      xMin: goldVein ? 240 : 160,
      xMax: goldVein ? 620 : d >= 3 ? 800 : 740,
      hpMul: (kind === 'HARD' ? 3 : kind === 'GOLD' ? 1.6 : 1) * (1 + 0.12 * d),
      grow: true,
    });
    if (c) {
      this.synth.squish();
      if (goldVein) this.endlessGoldPending = false;
    }
  }

  private onDepthUp() {
    const goldVein = this.st.depth >= 3 && this.st.depth % 3 === 0;
    if (goldVein) {
      this.endlessGoldPending = true;
      this.banner('GOLDEN VEIN INCOMING!', '#ffe066', 32);
    } else {
      this.banner(`Depth Lv.${this.st.depth} — wax is getting tougher!`, '#ff8a80', 30);
    }
    this.synth.win();
    if (!lowFxMode) this.cameras.main.flash(200, 255, 120, 120);
    const want = Math.min(9, Math.round((2 + this.st.depth) * this.ear.hairMult));
    while (this.hairs.length < want) {
      const h = makeHair(this.canal, this.ear, this.hairs);
      if (!h) break;
      this.hairs.push(h);
    }
    this.sway = Math.min(0.85, 0.12 + 0.07 * this.st.depth) * this.ear.wobble;
    this.flinchInterval = Math.max(5, 13 - this.st.depth);
  }

  // ═════════════════════════════ boss ═════════════════════════════
  private updateBoss(dt: number) {
    const b = this.boss;
    if (!b) return;
    const sw = this.swab;
    const bp = b.body.position;
    const d = Math.hypot(sw.x - bp.x, sw.y - bp.y);
    const inRange = d < b.r + sw.R + 26;
    const steady = sw.speed < 2.2;
    const rate = (1 / 1.75) * (1 + 0.08 * (this.run.power - 1));
    if (sw.vibrating && inRange) {
      this.st.charge += dt * rate * (steady ? 1 : 0.25);
      if (Math.random() < dt * (lowFxMode ? 5 : 12)) {
        this.crumbs.emitParticleAt(bp.x + rnd(-b.r, b.r) * 0.6, bp.y + rnd(-b.r, b.r) * 0.6, lowFxMode ? 1 : 2);
      }
      if (Math.random() < dt * 9) this.synth.crunch(0.8);
    } else {
      this.st.charge = Math.max(0, this.st.charge - dt * 0.25);
    }
    // boss shivers under the vibration
    const sh = sw.vibrating && inRange ? 1.6 + this.st.charge * 2.4 : 0;
    b.img.setPosition(bp.x + rnd(-sh, sh), bp.y + rnd(-sh, sh));
    if (this.st.charge >= 1) this.crackBoss();
  }

  private crackBoss() {
    const b = this.boss;
    if (!b) return;
    this.st.cracks += 1;
    this.st.charge = 0;
    b.img.setTexture(`boss${this.st.cracks}`);
    this.synth.crack();
    if (!lowFxMode) this.cameras.main.shake(380, 0.02);
    this.crumbs.emitParticleAt(b.body.position.x, b.body.position.y, lowFxMode ? 12 : 26);
    this.sparks.emitParticleAt(b.body.position.x, b.body.position.y, lowFxMode ? 4 : 8);
    this.shockDrum(4.5);
    if (this.st.cracks >= 3) {
      this.breakBoss();
    } else {
      const secondPhase = this.st.cracks === 2;
      this.sway = secondPhase ? 0.34 : 0.16;
      this.flinchInterval = secondPhase ? 5.5 : 8;
      this.flinchT = secondPhase ? 3.2 : 5.5;
      this.banner(
        secondPhase ? 'Crack 2 / 3 · Violent pulse incoming!' : 'Crack 1 / 3 · Canal pulse incoming!',
        secondPhase ? '#ff8a80' : '#ffb74d',
        36,
      );
    }
  }

  private breakBoss() {
    const b = this.boss;
    if (!b) return;
    const bx = b.body.position.x;
    const by = b.body.position.y;
    this.boss = null;
    this.removeChunk(b);
    const cs = this.ear.chunkScale;
    const rs = [26, 22, 18].map((r) => r * Math.pow(cs, 0.85));
    rs.forEach((r, i) => {
      const value = Math.round(r * 0.6 * KIND_MULT.FRAG * this.ear.valueMult * (cs > 1 ? 1 / Math.sqrt(cs) : 1));
      const c = createChunk(this, {
        x: bx - 6 - i * 4,
        y: by + (i - 1) * 40 * Math.pow(cs, 0.7),
        r,
        kind: 'FRAG',
        stuck: false,
        value,
      });
      this.chunks.push(c);
      this.matter.body.setVelocity(c.body, { x: rnd(-2.5, -1), y: rnd(-1.5, 1.5) });
    });
    this.fragsLeft = 3;
    this.st.extracted = 0;
    this.phase = 'EXTRACT';
    this.swab.setTool('TWEEZER');
    this.sway = 0.28;
    this.synth.pop(0.5);
    this.sparks.emitParticleAt(bx, by, lowFxMode ? 4 : 16);
    this.banner('The boulder is cracked!\nNow tweeze the pieces out carefully', '#ffe082', 28);
    this.flinchInterval = 8;
    this.flinchT = 7;
  }

  // ═════════════════════════════ events ═════════════════════════════
  private onFree(c: Chunk) {
    if (c.kind === 'PLUG') {
      this.breakPlug(c);
      return;
    }
    setStuck(this, c, false);
    const cy = this.canal.center(c.body.position.x);
    const dir = cy > c.body.position.y ? 1 : -1;
    this.matter.body.setVelocity(c.body, { x: rnd(-1.2, 1.2), y: dir * 2.4 });
    this.crumbs.emitParticleAt(c.body.position.x, c.body.position.y, lowFxMode ? 4 : 10);
    this.synth.pop(0.85);
    this.synth.crunch(1.3);
    this.floatText(c.body.position.x, c.body.position.y - c.r - 6, 'Crack!', '#ffffff');
  }

  private breakPlug(c: Chunk) {
    const { x, y } = c.body.position;
    const guidedStageOne = this.run.mode === 'STAGE' && this.run.stage === 1;
    this.st.target += 2;
    this.removeChunk(c);
    const sizes = [0.52, 0.46, 0.4];
    const values = [0.42, 0.34, 0.24];
    sizes.forEach((size, i) => {
      const pieceX = x + (i - 1) * c.r * (guidedStageOne ? 1.35 : 0.48);
      const piece = createChunk(this, {
        x: pieceX,
        y: guidedStageOne ? this.canal.center(pieceX) : y + (i - 1) * c.r * 0.12,
        r: c.r * size,
        kind: 'NORMAL',
        stuck: false,
        value: Math.max(1, Math.round(c.value * values[i])),
        ignoreGravity: guidedStageOne,
      });
      this.chunks.push(piece);
      this.matter.body.setVelocity(
        piece.body,
        guidedStageOne ? { x: 0, y: 0 } : { x: rnd(-1.8, -0.8), y: rnd(-1.6, 1.6) },
      );
    });
    this.synth.crack();
    this.crumbs.emitParticleAt(x, y, lowFxMode ? 6 : 18);
    this.sparks.emitParticleAt(x, y, lowFxMode ? 2 : 6);
    this.banner('BIG PLUG CRACKED! · PULL OUT THE PIECES', '#ffe082', 27);
  }

  private collect(c: Chunk, via: 'exit' | 'vacuum') {
    if (c.removed) return;
    const st = this.st;
    st.combo = st.comboTimer > 0 ? st.combo + 1 : 1;
    st.comboTimer = 6;
    st.maxCombo = Math.max(st.maxCombo, st.combo);
    const mult = Math.min(3, 1 + 0.25 * (st.combo - 1));
    const pts = Math.round(c.value * 10 * mult);
    st.score += pts;
    st.wax += c.value;
    if (!c.optional) st.extracted += 1;

    const x = clamp(c.body.position.x, 50, W - 60);
    const y = c.body.position.y;
    const gold = c.kind === 'GOLD' || c.kind === 'FRAG';
    this.floatText(x, y - 10, `+${pts}${st.combo > 1 ? `  x${mult.toFixed(2)}` : ''}`, gold ? '#ffe066' : '#fff3c4');
    this.crumbs.emitParticleAt(x, y, lowFxMode ? 5 : 14);
    if (gold) this.sparks.emitParticleAt(x, y, lowFxMode ? 3 : 10);
    this.synth.pop(1 + Math.min(0.6, st.combo * 0.06));
    this.synth.coin(1 + Math.min(0.8, st.combo * 0.07));
    if (via === 'vacuum') this.synth.squish();

    const wasFrag = c.kind === 'FRAG';
    const compliments = ['POP! 🧼', 'SO CLEAN! ✨', 'HEAVEN! 🍯', 'SATISFYING! 💖', 'DELICIOUS! 🫧'];
    const cheer = compliments[Math.floor(Math.random() * compliments.length)];
    this.floatText(x, y - 36, cheer, '#38bdf8');
    this.triggerPatientPleasure();
    this.removeChunk(c);

    if (this.run.mode === 'STAGE') {
      if (st.extracted >= st.target) this.finish(true, 'CLEAR');
    } else if (this.run.mode === 'ENDLESS') {
      const nd = 1 + Math.floor(st.extracted / 6);
      if (nd !== st.depth) {
        st.depth = nd;
        this.onDepthUp();
      }
    } else if (wasFrag) {
      this.fragsLeft -= 1;
      if (this.fragsLeft <= 0) this.finish(true, 'CLEAR');
    }
  }

  private removeChunk(c: Chunk) {
    if (c.removed) return;
    c.removed = true;
    this.swab.drop(c);
    this.matter.world.remove(c.body);
    c.img.destroy();
    c.bonusTag?.destroy();
    const i = this.chunks.indexOf(c);
    if (i >= 0) this.chunks.splice(i, 1);
  }

  private hitDrum(base: number) {
    if (this.st.hitCd > 0 || this.over) return;
    const dmg = base * this.sensMult;
    this.st.hp -= dmg;
    this.triggerPatientHurt();
    this.st.minHp = Math.min(this.st.minHp, this.st.hp);
    this.st.hitCd = 0.3;
    this.st.combo = 0;
    this.st.comboTimer = 0;
    this.st.hitFlash += 1;
    this.hitFlashV = 1;
    if (!lowFxMode) {
      this.cameras.main.shake(240, 0.014);
      this.cameras.main.flash(150, 255, 40, 40);
    }
    this.synth.hit();
    this.floatText(this.swab.x - 30, this.swab.y - 30, 'Drum hit!', '#ff5252');
    if (this.st.hp <= 0) this.finish(false, 'DRUM');
  }

  private shockDrum(amount: number) {
    if (this.over) return;
    this.st.hp -= amount * this.sensMult;
    this.st.minHp = Math.min(this.st.minHp, this.st.hp);
    this.st.hitFlash += 1;
    this.hitFlashV = 0.7;
    this.synth.thump(1.6);
    if (this.st.hp <= 0) this.finish(false, 'DRUM');
  }

  private checkDrum(dt: number) {
    const sw = this.swab;
    this.st.hitCd = Math.max(0, this.st.hitCd - dt);
    this.hitFlashV = Math.max(0, this.hitFlashV - dt * 3);

    if (sw.x + sw.R >= DRUM_HIT_X) this.hitDrum(9 + sw.speed * 1.5);
    for (const h of sw.holds) {
      const c = h.chunk;
      if (!c.removed && c.held && c.body.position.x + c.r >= DRUM_HIT_X) this.hitDrum(6 + sw.speed);
    }

    const resonant = (sw.sucking && sw.x > DRUM_X - 135) || (sw.vibrating && sw.x > DRUM_X - 95);
    if (resonant) {
      this.st.hp -= dt * 7 * this.sensMult;
      this.st.minHp = Math.min(this.st.minHp, this.st.hp);
      this.hitFlashV = Math.max(this.hitFlashV, 0.35);
      if (Math.random() < dt * 2.5) this.floatText(sw.x - 10, sw.y - 28, 'Resonance!', '#ff8a65');
      if (this.st.hp <= 0) this.finish(false, 'DRUM');
    }

    const target = clamp((sw.x + sw.R - 700) / 150, 0, 1);
    this.danger += (target - this.danger) * Math.min(1, dt * 6);
  }

  private checkWallScrape(dt: number) {
    if (this.over) return;
    this.wallScrapeFxT = Math.max(0, this.wallScrapeFxT - dt);
    const sw = this.swab;
    const touchingWall =
      sw.x > 0 &&
      (sw.y - this.canal.top(sw.x) < sw.R + 3 || this.canal.bottom(sw.x) - sw.y < sw.R + 3);
    if (!touchingWall || sw.speed < 0.5) return;

    const scrapeStrength = clamp(sw.speed / 4, 0.2, 1);
    this.st.hp -= dt * 5 * scrapeStrength * this.sensMult;
    this.st.minHp = Math.min(this.st.minHp, this.st.hp);
    this.st.combo = 0;
    this.st.comboTimer = 0;

    if (this.wallScrapeFxT <= 0) {
      this.wallScrapeFxT = 0.8;
      this.floatText(sw.x, sw.y - 24, 'Wall scrape!', '#ff8a80');
    }
    if (this.st.hp <= 0) this.finish(false, 'WALL');
  }

  private updateFlinch(dt: number) {
    const sw = this.swab;
    if (sw.hairContact) this.sneezeMeter += dt * 22;
    else this.sneezeMeter = Math.max(0, this.sneezeMeter - dt * 10);

    if (this.warnT > 0) {
      this.warnT -= dt;
      if (this.warnT <= 0) this.doFlinch();
      return;
    }
    if (this.sneezeMeter >= 100) {
      this.sneezeMeter = 0;
      this.warnT = 0.7;
      this.synth.sneezeWarn();
      return;
    }
    if (this.flinchInterval > 0) {
      this.flinchT -= dt;
      if (this.flinchT <= 0) {
        this.warnT = 0.8;
        this.synth.sneezeWarn();
        this.flinchT = this.flinchInterval * rnd(0.8, 1.2);
      }
    }
  }

  private doFlinch() {
    const sw = this.swab;
    const a = rnd(0, Math.PI * 2);
    const str = rnd(7, 10) * (sw.holding ? 0.45 : 1);
    sw.jolt.x += Math.cos(a) * str;
    sw.jolt.y += Math.sin(a) * str;
    for (const c of this.chunks) {
      if (c.stuck || c.removed || c.held) continue;
      const v = c.body.velocity;
      this.matter.body.setVelocity(c.body, { x: v.x + rnd(-2.5, 2.5), y: v.y - rnd(0, 3) });
    }
    if (!lowFxMode) this.cameras.main.shake(300, 0.015);
    this.synth.sneeze();
    this.banner('ACHOO!!', '#ffffff', 42);
  }

  private safety() {
    for (const c of this.chunks) {
      if (c.removed || c.stuck) continue;
      const { x, y } = c.body.position;
      const outY = x > 20 && (y < this.canal.top(x) - 40 || y > this.canal.bottom(x) + 40);
      if (y > H + 60 || y < -60 || x > DRUM_X + 30 || outY) {
        const nx = clamp(x, EXIT_X + 50, DRUM_X - 80);
        this.matter.body.setPosition(c.body, { x: nx, y: this.canal.center(nx) });
        this.matter.body.setVelocity(c.body, { x: 0, y: 0 });
      }
    }
  }

  // ═════════════════════════════ audio ═════════════════════════════
  private updateAudio(dt: number) {
    const sw = this.swab;
    const sp = clamp(sw.speed / 7, 0, 1);
    const wall =
      sw.x > 0 &&
      (sw.y - this.canal.top(sw.x) < sw.R + 3 || this.canal.bottom(sw.x) - sw.y < sw.R + 3);
    let waxTouch = false;
    for (const c of this.chunks) {
      if (Math.hypot(c.body.position.x - sw.x, c.body.position.y - sw.y) < sw.R + c.r + 3) {
        waxTouch = true;
        break;
      }
    }
    const level = wall || waxTouch ? sp : 0;
    this.synth.setScrape(level * (waxTouch ? 1 : 0.7), waxTouch ? 0.85 : 0.25);
    if (waxTouch && sp > 0.25 && Math.random() < dt * 10 * sp) this.synth.crunch(0.6);
    if (sw.mining && Math.random() < dt * 8) this.synth.crunch(0.9);
    if (sw.miningTarget?.kind === 'PLUG' && Math.random() < dt * 8) {
      const c = sw.miningTarget;
      this.crumbs.emitParticleAt(
        sw.miningAt.x + rnd(-c.r * 0.3, c.r * 0.3),
        sw.miningAt.y + rnd(-c.r * 0.3, c.r * 0.3),
        lowFxMode ? 1 : 2,
      );
    }
    this.synth.setSuction(sw.sucking ? 1 : 0);
    this.synth.setBuzz(sw.vibrating ? 1 : 0, 1 + this.st.charge * 0.6);
    const whisper = this.run.mode === 'STAGE' ? stageParams(this.run.stage).whisper : 0;
    this.synth.setWhisper(whisper * (0.72 + 0.28 * Math.sin(this.animT * 0.82)), this.animT);

    const lowHp = 1 - clamp(this.st.hp / 100, 0, 1);
    const bpm = 62 + this.danger * 70 + lowHp * 40;
    this.hbT -= dt;
    if (this.hbT <= 0) {
      this.synth.thump(0.35 + this.danger * 0.6 + lowHp * 0.4);
      this.hbT = 60 / bpm;
    }
  }

  // ═════════════════════════════ finish ═════════════════════════════
  private finish(cleared: boolean, reason: string) {
    if (this.over) return;
    this.over = true;
    this.swab.releaseAll();
    this.matter.body.setVelocity(this.swab.tip, { x: 0, y: 0 });
    this.synth.setScrape(0);
    this.synth.setSuction(0);
    this.synth.setBuzz(0);

    const st = this.st;
    const bonuses: Bonus[] = [];
    let wax = st.wax;
    let score = st.score;
    const hpLeft = Math.max(0, Math.round(st.hp));

    if (cleared) {
      if (this.run.mode === 'STAGE') {
        const base = 25 + 15 * this.run.stage;
        bonuses.push({ label: `Stage ${this.run.stage} clear`, wax: base });
        if (st.minHp >= 99.5) {
          bonuses.push({ label: 'Flawless · no ear damage', wax: Math.round(base * 0.5) });
          score += 500;
        }
        const par = stageParams(this.run.stage).parTime;
        if (st.time < par) {
          const sb = Math.round((par - st.time) * 0.6);
          bonuses.push({ label: 'Speed bonus', wax: sb });
          score += sb * 8;
        }
        score += hpLeft * 5;
      } else if (this.run.mode === 'BOSS') {
        bonuses.push({ label: 'Lime boss defeated', wax: 350 });
        if (this.run.firstBoss) bonuses.push({ label: 'First blood bonus', wax: 250 });
        bonuses.push({ label: 'Eardrum spared', wax: hpLeft * 2 });
        const tb = Math.max(0, Math.round(120 - st.time));
        score += 1500 + hpLeft * 20 + tb * 15;
        if (tb > 0) bonuses.push({ label: 'Speed bonus', wax: Math.round(tb * 0.8) });
      }
    } else {
      if (this.run.mode === 'STAGE') {
        wax = Math.round(wax * 0.6);
        bonuses.push({ label: 'Failed (only 60% recovered)', wax: 0 });
      } else if (this.run.mode === 'BOSS') {
        wax = Math.round(wax * 0.5);
        bonuses.push({ label: 'Failed (only 50% recovered)', wax: 0 });
        score += st.cracks * 400;
      } else {
        const tb = Math.floor(st.time * 0.5);
        bonuses.push({ label: 'Survival time bonus', wax: tb });
        score += Math.floor(st.time) * 3 + st.depth * 100;
      }
    }
    if (this.run.mode === 'ENDLESS' && cleared) score += Math.floor(st.time) * 3;

    const total = wax + bonuses.reduce((a, b) => a + b.wax, 0);
    const result: RunResult = {
      mode: this.run.mode,
      stage: this.run.stage,
      ear: this.run.ear,
      cleared,
      reason,
      score: Math.round(score),
      wax: Math.max(0, Math.round(total)),
      extracted: st.extracted,
      time: st.time,
      maxCombo: st.maxCombo,
      drumHp: hpLeft,
      depth: st.depth,
      bonuses,
    };

    if (cleared) {
      this.synth.win();
      if (!lowFxMode) {
        this.cameras.main.flash(400, 255, 236, 160);
        this.sparks.emitParticleAt(W / 2, H / 2, 30);
      }
      this.banner(this.run.mode === 'BOSS' ? 'BOSS DOWN!' : 'CLEAR!', '#ffe066', 52);
    } else {
      this.synth.lose();
      if (!lowFxMode) {
        this.cameras.main.shake(500, 0.02);
        this.cameras.main.flash(300, 255, 30, 30);
      }
      this.banner(reason === 'CLOG' ? 'Canal clogged!' : reason === 'WALL' ? 'Canal scraped!' : 'Eardrum burst!', '#ff5252', 52);
    }
    this.time.delayedCall(1300, () => this.cb.onEnd(result));
  }

  // ═════════════════════════════ fx helpers ═════════════════════════════
  private banner(text: string, color = '#ffffff', size = 34) {
    const tx = this.add
      .text(W / 2, 100, text, {
        fontFamily: FONT,
        fontSize: `${size}px`,
        color,
        stroke: '#2a0810',
        strokeThickness: 7,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setAlpha(0);
    this.tweens.add({
      targets: tx,
      alpha: 1,
      y: 116,
      duration: 220,
      hold: 1100,
      yoyo: true,
      ease: 'Sine.Out',
      onComplete: () => tx.destroy(),
    });
  }

  private floatText(x: number, y: number, text: string, color: string) {
    const tx = this.add
      .text(x, y, text, {
        fontFamily: FONT,
        fontSize: '20px',
        color,
        stroke: '#2a0810',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(18);
    this.tweens.add({
      targets: tx,
      y: y - 46,
      alpha: 0,
      duration: 900,
      ease: 'Sine.Out',
      onComplete: () => tx.destroy(),
    });
  }

  // ═════════════════════════════ render ═════════════════════════════
  private render() {
    const p = this.ear.palette;
    const sw = this.swab;

    // chunk sprites + embedded shadows
    const u = this.underG;
    const f = this.fxG;
    u.clear();
    f.clear();
    for (const c of this.chunks) {
      const bp = c.body.position;
      if (c.kind === 'BOSS') {
        c.img.setRotation(0);
        u.fillStyle(shade(p.wall, 0.45), 0.6);
        u.fillCircle(bp.x, bp.y, c.r + 6);
        continue;
      }
      if (c.kind === 'PLUG' && c.stuck) {
        // Scraping removes visible and physical volume, not only HP.
        const progress = clamp(1 - c.hp / c.maxHp, 0, 1);
        // Make the remaining mass visibly shrink before it fractures into pieces.
        const targetScale = 1 - progress * 0.65;
        if (c.sizeScale - targetScale >= 0.01) {
          const ratio = targetScale / c.sizeScale;
          this.matter.body.scale(c.body, ratio, ratio);
          c.r = c.baseR * targetScale;
          c.sizeScale = targetScale;
          c.img.setScale(c.img.scaleX * ratio, c.img.scaleY * ratio);
        }
      }
      let jx = 0;
      let jy = 0;
      if (c.stuck) {
        u.fillStyle(shade(p.wall, 0.45), 0.55);
        u.fillCircle(bp.x, bp.y, c.r + 5);
        const wear = clamp(1 - c.hp / c.maxHp, 0, 1);
        if (wear > 0.02) {
          jx = rnd(-1, 1) * wear * 1.6;
          jy = rnd(-1, 1) * wear * 1.6;
          const isPlug = c.kind === 'PLUG';
          f.lineStyle(isPlug ? 3 + wear * 2 : 3, isPlug ? 0xffd166 : 0xffffff, isPlug ? 0.35 + wear * 0.6 : 0.75);
          f.beginPath();
          f.arc(bp.x, bp.y, c.r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (isPlug ? wear : 1 - wear), false);
          f.strokePath();
        }
      }
      if (c.danger && !c.held) {
        const pulse = 0.55 + 0.35 * Math.sin(this.animT * 4 + c.id);
        u.fillStyle(0xff5252, pulse * 0.12);
        u.fillCircle(bp.x, bp.y, c.r + 10);
        u.lineStyle(3, 0xff5252, pulse);
        u.strokeCircle(bp.x, bp.y, c.r + 7);
      }
      c.img.setPosition(bp.x + jx, bp.y + jy);
      c.img.setRotation(c.body.angle);
      c.bonusTag?.setPosition(bp.x + c.r + 17, bp.y - c.r - 4);
    }

    // boss charge ring
    if (this.boss && this.st.charge > 0.01) {
      const bp = this.boss.body.position;
      f.lineStyle(6, 0xffab40, 0.95);
      f.beginPath();
      f.arc(bp.x, bp.y, this.boss.r + 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.st.charge, false);
      f.strokePath();
    }
    if (this.boss) {
      const bp = this.boss.body.position;
      const crackSeverity = this.st.cracks / 3;
      f.lineStyle(2 + crackSeverity * 2, crackSeverity > 0.5 ? 0xff6b6b : 0xffffff, 0.2 + 0.25 * crackSeverity + 0.1 * Math.sin(this.animT * 3));
      f.strokeCircle(bp.x, bp.y, this.boss.r + 26 + sw.R);
    }

    if (this.run.mode === 'STAGE' && this.run.stage === 12) {
      const coreX = DRUM_X - 54;
      const coreY = this.canal.center(coreX);
      if (this.corePulseWarning) {
        const beat = 0.5 + 0.5 * Math.sin(this.animT * 9);
        f.lineStyle(3, 0x8be9fd, 0.48 + beat * 0.42);
        f.strokeCircle(coreX, coreY, 46 + beat * 9);
      }
      if (this.corePulseFx > 0) {
        f.lineStyle(5, 0x8be9fd, this.corePulseFx * 0.8);
        f.strokeCircle(coreX, coreY, 46 + (1 - this.corePulseFx) * 170);
      }
    }

    // hairs
    const hg = this.hairG;
    hg.clear();
    for (const h of this.hairs) {
      const mx = (h.rx + h.tipX) / 2;
      const my = (h.ry + h.tipY) / 2;
      const bend = Math.sin(this.animT * h.speed + h.phase + 1.2) * h.len * 0.16;
      const cx = mx + bend;
      const cy = my;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const a = (1 - t) * (1 - t);
        const b = 2 * (1 - t) * t;
        const c2 = t * t;
        pts.push({ x: a * h.rx + b * cx + c2 * h.tipX, y: a * h.ry + b * cy + c2 * h.tipY });
      }
      hg.lineStyle(h.thick + 1, shade(p.hair, 0.6), 1);
      hg.strokePoints(pts, false, false);
      hg.lineStyle(h.thick - 1, p.hair, 1);
      hg.strokePoints(pts, false, false);
      hg.lineStyle(1, shade(p.hair, 1.8), 0.6);
      hg.strokePoints(pts.slice(1), false, false);
      hg.fillStyle(shade(p.hair, 0.6), 1);
      hg.fillCircle(h.rx, h.ry, h.thick * 0.9);
      if (!this.over && distToHair(h, sw.x, sw.y) < sw.R + 8) {
        hg.lineStyle(2, 0xffee58, 0.7);
        hg.strokeCircle(h.tipX, h.tipY, 6);
      }
    }

    // tool
    this.toolG.clear();
    sw.draw(this.toolG, this.animT);

    // drum
    this.drawDrum();

    // atmosphere
    const depthTint = this.run.mode === 'ENDLESS' ? Math.min(0.38, (this.st.depth - 1) * 0.045) : 0;
    this.tint.setAlpha(depthTint);
    const lowHp = 1 - clamp(this.st.hp / 100, 0, 1);
    const pulse = 0.6 + 0.4 * Math.sin(this.animT * 7);
    this.vignette.setAlpha(clamp(this.danger * 0.1 * pulse + lowHp * 0.16 * pulse + this.hitFlashV * 0.25, 0, 0.5));
  }

  private drawDrum() {
    const g = this.drumG;
    g.clear();
    const cx = DRUM_X;
    const cy = this.canal.center(DRUM_X);
    const hh = this.canal.halfH(DRUM_X) + 4;
    const beat = Math.sin(this.animT * 5.2) * 1.3;
    const bulge = 8 + beat + this.hitFlashV * 6;
    const hpFrac = clamp(this.st.hp / 100, 0, 1);
    const w = bulge * 2 + 10;

    // 위험 경고 오로라 글로우
    if (this.danger > 0.02 || this.hitFlashV > 0) {
      const a = 0.08 + 0.22 * this.danger * (0.7 + 0.3 * Math.sin(this.animT * 9)) + this.hitFlashV * 0.35;
      g.fillStyle(0xef4444, a);
      g.fillEllipse(cx - 8, cy, 130, hh * 2 + 65);
    }

    // 💖 뽀송뽀송 캔디 핑크 젤리 고막 (포키 스타일)
    g.fillStyle(0xfb7185, 1);
    g.fillEllipse(cx + 2, cy, w, hh * 2);

    g.fillStyle(0xf472b6, 0.95);
    g.fillEllipse(cx, cy - hh * 0.04, w * 0.85, hh * 1.8);

    // 반투명 젤리 광택 층
    g.fillStyle(0xfff1f2, 0.85);
    g.fillEllipse(cx - 3, cy - hh * 0.22, w * 0.55, hh * 0.85);

    // 영롱한 사이언/오로라 탄력 링
    g.lineStyle(4, 0x38bdf8, 0.85);
    g.strokeEllipse(cx + 2, cy, w, hh * 2);
    
    // 별빛 십자 반사광
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(cx - 2, cy - hh * 0.22, 5);

    if (hpFrac < 1) {
      g.fillStyle(0xf43f5e, (1 - hpFrac) * 0.5);
      g.fillEllipse(cx + 2, cy, w, hh * 2);
    }
    if (hpFrac < 0.45) {
      g.lineStyle(2.5, 0x9f1239, 0.85);
      g.lineBetween(cx - 4, cy - hh * 0.4, cx + 4, cy - hh * 0.1);
      g.lineBetween(cx + 4, cy - hh * 0.1, cx - 3, cy + hh * 0.3);
      if (hpFrac < 0.25) g.lineBetween(cx - 3, cy + hh * 0.3, cx + 3, cy + hh * 0.6);
    }
  }

  // ═════════════════════════════ hud ═════════════════════════════
  // ═════════════════════════════ 환자 ASMR 리액션 아바타 시스템 ═════════════════════════════
  private patientMoodText!: Phaser.GameObjects.Text;
  private patientAvatarContainer!: Phaser.GameObjects.Container;

  private createPatientAvatar() {
    const c = this.add.container(78, 48).setDepth(15);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.92);
    bg.fillRoundedRect(-52, -22, 104, 44, 22);
    bg.lineStyle(2.5, 0xf472b6, 0.9);
    bg.strokeRoundedRect(-52, -22, 104, 44, 22);

    const emoji = this.add.text(-36, -14, this.ear.emoji, { fontSize: '20px' });
    this.patientMoodText = this.add.text(-8, -12, '( ˘▽˘ )', {
      fontSize: '14px',
      color: '#db2777',
      fontStyle: 'bold',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    });

    c.add([bg, emoji, this.patientMoodText]);
    this.patientAvatarContainer = c;
  }

  private triggerPatientPleasure() {
    if (!this.patientMoodText || !this.patientAvatarContainer) return;
    const faces = ['( ✪ω✪ )✨', '( ˘ ³˘)♥', '(*^▽^*)🍯', '( ≧ᗜ≦ )🎉'];
    this.patientMoodText.setText(faces[Math.floor(Math.random() * faces.length)]);
    this.tweens.add({
      targets: this.patientAvatarContainer,
      scaleX: 1.22,
      scaleY: 1.22,
      duration: 120,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1600, () => {
          if (this.patientMoodText) this.patientMoodText.setText('( ˘▽˘ )');
        });
      },
    });
  }

  private triggerPatientHurt() {
    if (!this.patientMoodText || !this.patientAvatarContainer) return;
    this.patientMoodText.setText('( > <; )!');
    this.tweens.add({
      targets: this.patientAvatarContainer,
      x: '+=6',
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          if (this.patientMoodText) this.patientMoodText.setText('( ˘▽˘ )');
        });
      },
    });
  }

  private emitHud() {
    const sw = this.swab;
    const st = this.st;
    const hud: HudState = {
      drumHp: Math.max(0, st.hp),
      flawless: st.minHp >= 99.5,
      score: st.score,
      wax: st.wax,
      extracted: st.extracted,
      target: st.target,
      combo: st.combo,
      comboMult: Math.min(3, 1 + 0.25 * Math.max(0, st.combo - 1)),
      comboWindow: clamp(st.comboTimer / 6, 0, 1),
      breath: sw.breath / sw.cap,
      breathLocked: sw.breathLocked,
      energy: sw.energy,
      grabbing: sw.grabbing,
      grabbed: sw.holds.length > 0,
      tool: sw.tool,
      phase: this.phase,
      clog: Math.min(1, this.clogNow),
      depth: st.depth,
      time: st.time,
      cracks: st.cracks,
      charge: st.charge,
      hitFlash: st.hitFlash,
      warn: this.warnT > 0,
      sneeze: this.sneezeMeter / 100,
      gravAngle: this.gravAngle,
      danger: this.danger,
    };
    this.cb.onHud(hud);
  }
}
