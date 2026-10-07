import { useState } from 'react';
import { Card, Wax } from './ui';
import { StageGoalSummary } from './StageGoalSummary';
import type { RunResult } from '../game/types';

const cases: Record<string, RunResult> = {
  failed: {
    mode: 'STAGE', stage: 1, ear: 'HUMAN', cleared: false, reason: 'DRUM', score: 220, wax: 12,
    extracted: 2, time: 34, maxCombo: 1, drumHp: 0, depth: 1,
    bonuses: [{ label: 'Failed (only 60% recovered)', wax: 0 }],
  },
  flawless: {
    mode: 'STAGE', stage: 1, ear: 'HUMAN', cleared: true, reason: 'CLEAR', score: 860, wax: 66,
    extracted: 5, time: 70, maxCombo: 3, drumHp: 100, depth: 1,
    bonuses: [
      { label: 'Stage 1 clear', wax: 40 },
      { label: 'Flawless · drum untouched', wax: 20 },
    ],
  },
  speed: {
    mode: 'STAGE', stage: 1, ear: 'HUMAN', cleared: true, reason: 'CLEAR', score: 740, wax: 58,
    extracted: 5, time: 42, maxCombo: 2, drumHp: 72, depth: 1,
    bonuses: [
      { label: 'Stage 1 clear', wax: 40 },
      { label: 'Speed bonus', wax: 12 },
    ],
  },
  both: {
    mode: 'STAGE', stage: 1, ear: 'HUMAN', cleared: true, reason: 'CLEAR', score: 990, wax: 85,
    extracted: 5, time: 30, maxCombo: 4, drumHp: 100, depth: 1,
    bonuses: [
      { label: 'Stage 1 clear', wax: 40 },
      { label: 'Flawless · drum untouched', wax: 20 },
      { label: 'Speed bonus', wax: 19 },
    ],
  },
};

const options = [
  ['failed', 'Failed'],
  ['flawless', 'Flawless'],
  ['speed', 'Speed'],
  ['both', 'Both'],
] as const;

export function DevResultPreview() {
  const [selected, setSelected] = useState<keyof typeof cases>('failed');
  const result = cases[selected];

  return (
    <main className="flex h-dvh w-full flex-col bg-[#1a0509] text-white">
      <header className="z-20 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-zinc-950 px-2 py-1.5 text-[10px] sm:px-3 sm:text-xs">
        <strong className="text-amber-200">DEV RESULT PREVIEW · unsaved</strong>
        <div className="flex items-center gap-1">
          {options.map(([value, label]) => (
            <button
              key={value}
              aria-pressed={selected === value}
              className={`rounded px-1.5 py-1 ${selected === value ? 'bg-amber-300 text-amber-950' : 'bg-white/10 text-white/70'}`}
              onClick={() => setSelected(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <section className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_center,_#6b3036_0%,_#35151d_70%,_#1a0509_100%)] p-3 sm:p-5">
        <Card className="mx-auto my-auto w-full max-w-lg !p-4 sm:!p-5">
          <div className="text-center">
            <div className="text-5xl">{result.cleared ? '🎉' : '💥'}</div>
            <h1 className={`mt-1 text-3xl font-bold ${result.cleared ? 'text-amber-300' : 'text-rose-400'}`}>
              {result.cleared ? 'CLEAR!' : 'FAILED'}
            </h1>
            <p className="text-sm text-white/70">
              {result.cleared ? 'Clean run! You got every chunk out.' : 'Eardrum ruptured… the owner passed out.'}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            {[
              ['Score', result.score.toLocaleString('en-US')],
              ['Extracted', result.extracted],
              ['Time', `${Math.floor(result.time / 60)}:${String(result.time % 60).padStart(2, '0')}`],
              ['Best combo', result.maxCombo],
              ['Eardrum left', `${result.drumHp}%`],
              ['Ear', '👂'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-black/30 p-2">
                <div className="text-xs text-white/50">{label}</div>
                <div className="text-lg font-bold">{value}</div>
              </div>
            ))}
          </div>

          <StageGoalSummary result={result} />

          <ul className="mt-3 space-y-1 rounded-xl bg-black/25 p-3 text-sm">
            {result.bonuses.map((bonus) => (
              <li key={bonus.label} className="flex items-center justify-between gap-2 text-white/80">
                <span>{bonus.label}</span>
                {bonus.wax > 0 ? <Wax n={bonus.wax} size={14} /> : <span className="text-white/40">—</span>}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-300/15 p-3 ring-1 ring-amber-300/40">
            <span className="font-bold">Wax earned</span>
            <Wax n={result.wax} size={22} className="text-2xl" />
          </div>
        </Card>
      </section>
    </main>
  );
}
