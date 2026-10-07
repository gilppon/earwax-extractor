import { useState } from 'react';
import { Hud } from './Hud';
import type { HudState, RunConfig } from '../game/types';

const run: RunConfig = {
  mode: 'STAGE',
  stage: 1,
  ear: 'HUMAN',
  tool: 'COTTON',
  precision: 1,
  power: 1,
  sensitivity: 1,
  lungs: 1,
  firstBoss: false,
};

const baseHud: HudState = {
  drumHp: 92,
  flawless: true,
  score: 1240,
  wax: 18,
  extracted: 2,
  target: 5,
  combo: 2,
  comboMult: 1.25,
  comboWindow: 0.5,
  breath: 0.78,
  breathLocked: false,
  energy: 1,
  grabbing: false,
  grabbed: false,
  tool: 'COTTON',
  phase: 'PLAY',
  clog: 0,
  depth: 1,
  time: 12,
  cracks: 0,
  charge: 0,
  hitFlash: 0,
  warn: false,
  sneeze: 0,
  gravAngle: 0,
  danger: 0.08,
};

const comboOptions = [0, 1, 2, 4];
const timeOptions = [6, 3, 1];

export function DevHudPreview() {
  const [combo, setCombo] = useState(2);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const hud: HudState = {
    ...baseHud,
    combo,
    comboMult: Math.min(3, 1 + 0.25 * Math.max(0, combo - 1)),
    comboWindow: combo > 0 ? secondsLeft / 6 : 0,
  };

  return (
    <main className="flex h-dvh w-full flex-col bg-[#1a0509] text-white">
      <header className="z-20 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-white/10 bg-zinc-950 px-2 py-1.5 text-[10px] sm:px-3 sm:text-xs">
        <strong className="text-amber-200">DEV HUD PREVIEW · unsaved</strong>
        <div className="flex items-center gap-2">
          <span className="text-white/60">Combo</span>
          {comboOptions.map((value) => (
            <button
              key={value}
              aria-pressed={combo === value}
              className={`rounded px-1.5 py-0.5 ${combo === value ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/70'}`}
              onClick={() => setCombo(value)}
            >
              {value}x
            </button>
          ))}
          <span className="ml-1 text-white/60">Time</span>
          {timeOptions.map((value) => (
            <button
              key={value}
              aria-pressed={secondsLeft === value}
              className={`rounded px-1.5 py-0.5 ${secondsLeft === value ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/70'}`}
              onClick={() => setSecondsLeft(value)}
            >
              {value}s
            </button>
          ))}
        </div>
      </header>
      <section className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_center,_#6b3036_0%,_#35151d_70%,_#1a0509_100%)]">
        <div className="pointer-events-none absolute inset-x-[5%] top-[28%] h-[42%] rounded-[50%] border-[18px] border-[#b05b60]/70 bg-[#7e303d]/60 shadow-[inset_0_0_36px_#17070d] sm:border-[28px]" />
        <Hud hud={hud} run={run} onPause={() => undefined} />
      </section>
    </main>
  );
}
