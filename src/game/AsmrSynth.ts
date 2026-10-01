// ─────────────────────────────────────────────────────────────
//  ASMR Sound Synthesizer — everything is synthesized with the
//  Web Audio API (no audio assets): scraping, suction, crackles,
//  eardrum heartbeat, sonic buzz, pops and UI blips.
// ─────────────────────────────────────────────────────────────

interface BurstOpts {
  dur?: number;
  freq?: number;
  sweepTo?: number;
  q?: number;
  vol?: number;
  type?: BiquadFilterType;
  attack?: number;
  delay?: number;
}

interface ToneOpts {
  freq: number;
  to?: number;
  dur: number;
  vol: number;
  type?: OscillatorType;
  delay?: number;
}

interface Loop {
  src: AudioBufferSourceNode;
  filters: BiquadFilterNode[];
  gain: GainNode;
}

export class AsmrSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private loops: { scrape?: Loop; suction?: Loop; ambient?: Loop } = {};
  private buzz: { gain: GainNode; o1: OscillatorNode; o2: OscillatorNode } | null = null;
  muted = false;

  /** must be called from a user gesture */
  unlock() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private init() {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.85;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    master.connect(comp);
    comp.connect(ctx.destination);
    this.master = master;

    // pink noise buffer (2 s)
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
      b6 = w * 0.115926;
      d[i] = pink * 0.11;
    }
    this.noise = buf;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
  }

  setPaused(p: boolean) {
    if (!this.ctx) return;
    if (p) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  // ── continuous loops ──────────────────────────────────────
  private makeLoop(filters: { type: BiquadFilterType; freq: number; q: number }[]): Loop | undefined {
    if (!this.ctx || !this.noise || !this.master) return undefined;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    let node: AudioNode = src;
    const fs: BiquadFilterNode[] = [];
    for (const f of filters) {
      const bq = ctx.createBiquadFilter();
      bq.type = f.type;
      bq.frequency.value = f.freq;
      bq.Q.value = f.q;
      node.connect(bq);
      node = bq;
      fs.push(bq);
    }
    const gain = ctx.createGain();
    gain.gain.value = 0;
    node.connect(gain);
    gain.connect(this.master);
    src.start(0, Math.random() * 1.5);
    return { src, filters: fs, gain };
  }

  startLoops() {
    this.unlock();
    if (!this.ctx || !this.master) return;
    this.stopLoops();
    this.loops.scrape = this.makeLoop([
      { type: 'bandpass', freq: 2600, q: 0.8 },
      { type: 'highpass', freq: 900, q: 0.7 },
    ]);
    this.loops.suction = this.makeLoop([
      { type: 'bandpass', freq: 650, q: 1.6 },
      { type: 'lowpass', freq: 2000, q: 0.7 },
    ]);
    this.loops.ambient = this.makeLoop([{ type: 'lowpass', freq: 240, q: 0.7 }]);
    if (this.loops.ambient && this.ctx) {
      this.loops.ambient.gain.gain.setTargetAtTime(0.16, this.ctx.currentTime, 0.6);
    }
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sawtooth';
    o2.type = 'square';
    o1.frequency.value = 96;
    o2.frequency.value = 101;
    o1.connect(lp);
    o2.connect(lp);
    lp.connect(gain);
    gain.connect(this.master);
    o1.start();
    o2.start();
    this.buzz = { gain, o1, o2 };
  }

  stopLoops() {
    for (const k of ['scrape', 'suction', 'ambient'] as const) {
      const l = this.loops[k];
      if (l) {
        try {
          l.src.stop();
          l.src.disconnect();
          l.gain.disconnect();
        } catch {
          /* ignore */
        }
      }
      this.loops[k] = undefined;
    }
    if (this.buzz) {
      try {
        this.buzz.o1.stop();
        this.buzz.o2.stop();
        this.buzz.gain.disconnect();
      } catch {
        /* ignore */
      }
      this.buzz = null;
    }
  }

  setScrape(level: number, bright = 0.5) {
    const l = this.loops.scrape;
    if (!l || !this.ctx) return;
    const t = this.ctx.currentTime;
    const lv = Math.max(0, Math.min(1, level));
    l.gain.gain.setTargetAtTime(lv * 0.5, t, 0.035);
    l.filters[0].frequency.setTargetAtTime(1300 + bright * 3200 + lv * 1200, t, 0.05);
  }

  setSuction(level: number) {
    const l = this.loops.suction;
    if (!l || !this.ctx) return;
    const t = this.ctx.currentTime;
    l.gain.gain.setTargetAtTime(level * 0.42, t, 0.08);
    l.filters[0].frequency.setTargetAtTime(420 + level * 520, t, 0.1);
  }

  setBuzz(level: number, pitch = 1) {
    if (!this.buzz || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.buzz.gain.gain.setTargetAtTime(level * 0.09, t, 0.05);
    this.buzz.o1.frequency.setTargetAtTime(96 * pitch, t, 0.1);
    this.buzz.o2.frequency.setTargetAtTime(101 * pitch, t, 0.1);
  }

  // ── one-shots ─────────────────────────────────────────────
  private burst(o: BurstOpts) {
    if (!this.ctx || !this.noise || !this.master || this.muted) return;
    const ctx = this.ctx;
    const dur = o.dur ?? 0.08;
    const t = ctx.currentTime + (o.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = o.type ?? 'bandpass';
    f.frequency.setValueAtTime(o.freq ?? 2000, t);
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + dur);
    f.Q.value = o.q ?? 1;
    const g = ctx.createGain();
    const vol = Math.max(0.0002, o.vol ?? 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (o.attack ?? 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t, Math.random() * 1.5, dur + 0.05);
    src.stop(t + dur + 0.05);
  }

  private tone(o: ToneOpts) {
    if (!this.ctx || !this.master || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + (o.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'sine';
    osc.frequency.setValueAtTime(o.freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vol), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  crunch(power = 1) {
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      this.burst({
        dur: 0.03 + Math.random() * 0.04,
        freq: 2600 + Math.random() * 2600,
        q: 2 + Math.random() * 2,
        vol: 0.28 * power,
        delay: i * (0.025 + Math.random() * 0.03),
      });
    }
  }

  pop(pitch = 1) {
    this.tone({ freq: 460 * pitch, to: 120, dur: 0.13, vol: 0.34, type: 'sine' });
    this.burst({ dur: 0.09, freq: 900, type: 'lowpass', vol: 0.3 });
    this.burst({ dur: 0.05, freq: 5000, q: 2, vol: 0.16, delay: 0.02 });
  }

  squish() {
    this.burst({ dur: 0.2, freq: 480, sweepTo: 1500, q: 3, vol: 0.3 });
  }

  grab() {
    this.burst({ dur: 0.035, freq: 4200, q: 3, vol: 0.3 });
    this.tone({ freq: 520, to: 320, dur: 0.06, vol: 0.08, type: 'triangle' });
  }

  slip() {
    this.burst({ dur: 0.12, freq: 1300, sweepTo: 300, q: 1.5, vol: 0.3 });
  }

  crack() {
    this.burst({ dur: 0.16, freq: 3600, type: 'highpass', q: 0.7, vol: 0.6 });
    this.tone({ freq: 120, to: 42, dur: 0.3, vol: 0.55, type: 'triangle' });
    this.burst({ dur: 0.1, freq: 800, type: 'lowpass', vol: 0.5, delay: 0.03 });
  }

  hit() {
    this.tone({ freq: 84, to: 36, dur: 0.38, vol: 0.75, type: 'sine' });
    this.burst({ dur: 0.28, freq: 320, type: 'lowpass', vol: 0.55 });
    this.tone({ freq: 2700, dur: 0.6, vol: 0.05, type: 'sine', delay: 0.02 }); // tinnitus
  }

  thump(v = 1) {
    this.tone({ freq: 64, to: 38, dur: 0.17, vol: 0.5 * v, type: 'sine' });
    this.tone({ freq: 58, to: 34, dur: 0.2, vol: 0.34 * v, type: 'sine', delay: 0.17 });
  }

  coin(pitch = 1) {
    this.tone({ freq: 880 * pitch, to: 1180 * pitch, dur: 0.09, vol: 0.13, type: 'square' });
    this.tone({ freq: 1320 * pitch, dur: 0.16, vol: 0.12, type: 'square', delay: 0.07 });
  }

  tickle() {
    this.tone({ freq: 1900 + Math.random() * 500, to: 2700, dur: 0.06, vol: 0.05, type: 'sine' });
  }

  sneezeWarn() {
    this.tone({ freq: 300, to: 950, dur: 0.6, vol: 0.1, type: 'triangle' });
  }

  sneeze() {
    this.burst({ dur: 0.34, freq: 2400, sweepTo: 500, q: 0.8, vol: 0.75, attack: 0.01 });
    this.tone({ freq: 720, to: 180, dur: 0.28, vol: 0.2, type: 'sawtooth' });
  }

  click() {
    this.tone({ freq: 700, to: 520, dur: 0.05, vol: 0.09, type: 'triangle' });
  }

  buy() {
    this.coin(1);
    this.tone({ freq: 1760, dur: 0.2, vol: 0.09, type: 'triangle', delay: 0.16 });
  }

  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      this.tone({ freq: f, dur: 0.28, vol: 0.14, type: 'triangle', delay: i * 0.09 }),
    );
  }

  lose() {
    [392, 330, 262, 196].forEach((f, i) =>
      this.tone({ freq: f, to: f * 0.9, dur: 0.35, vol: 0.16, type: 'sawtooth', delay: i * 0.16 }),
    );
    this.tone({ freq: 2700, dur: 1.2, vol: 0.05, type: 'sine', delay: 0.1 });
  }
}

export const synth = new AsmrSynth();
