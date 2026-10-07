import { useState } from 'react';
import { EARS, STAGE_COUNT, STAGE_NAMES, TOOLS, TOOL_ORDER, stageParams } from '../game/config';
import { synth } from '../game/AsmrSynth';
import { actions, useSave } from '../game/store';
import type { GameMode } from '../game/types';
import type { Tab } from '../hooks';
import { cn } from '../utils/cn';
import { Btn, Card, EarAvatar, HeroCanal, SectionTitle } from './ui';

interface Props {
  onStart: (mode: GameMode, stage: number) => void;
  goTab: (t: Tab) => void;
}

// remembers the last selection while the hub is unmounted during a run
const lastSel: { mode: GameMode; stage: number } = { mode: 'STAGE', stage: 0 };

function stageFeatures(n: number) {
  const p = stageParams(n);
  const f: string[] = [];
  if (p.canalCurve > 1) f.push('🌀 Winding canal');
  if (p.canalWidth < 1) f.push('🕳️ Narrow passage');
  if (p.whisper > 0) f.push('🔊 Whispering wind');
  if (p.corePulse) f.push('💓 Core pulse · loose wax surges to exit');
  if (p.hairs > 0) f.push(`🧶 Fur ${p.hairs}`);
  if (p.gold > 0) f.push('✨ Golden wax');
  if (p.hard > 0) f.push('🪨 Lime wax');
  if (p.plugs > 0) f.push(`🪨 Large embedded plug ×${p.plugs}`);
  if (p.danger > 0) f.push('🎯 Drum-side wax');
  if (p.flinch > 0) f.push('🤧 Sneezing');
  if (p.sway > 0) f.push('🌪️ Gravity sway');
  return f;
}

export function MissionTab({ onStart, goTab }: Props) {
  const save = useSave();
  const [mode, setModeState] = useState<GameMode>(lastSel.mode);
  const [stage, setStageState] = useState(() =>
    lastSel.stage > save.stageCleared ? lastSel.stage : Math.min(STAGE_COUNT, save.stageCleared + 1),
  );
  const setMode = (m: GameMode) => {
    lastSel.mode = m;
    setModeState(m);
  };
  const setStage = (n: number) => {
    lastSel.stage = n;
    setStageState(n);
  };
  const ear = EARS[save.selectedEar];
  const bossUnlocked = save.ownedTools.includes('TWEEZER');
  const canStart = mode !== 'BOSS' || bossUnlocked;

  const modes: { id: GameMode; icon: string; name: string; desc: string; extra?: string }[] = [
    {
      id: 'STAGE',
      icon: '🧪',
      name: 'Expedition',
      desc: `${STAGE_COUNT} stages! Drag the chunks out past the exit (left).`,
      extra: `Progress ${save.stageCleared}/${STAGE_COUNT}`,
    },
    {
      id: 'BOSS',
      icon: '🪨',
      name: 'Lime Boulder Boss',
      desc: 'A boulder by the eardrum! Buzz it 3× → tweeze it out.',
      extra: save.bossDefeated ? 'Defeated ✔' : bossUnlocked ? 'Ready to fight' : '🔒 Needs Micro Tweezers',
    },
    {
      id: 'ENDLESS',
      icon: '♾️',
      name: 'Endless Earwax Mine',
      desc: 'Wax bubbles up forever and the ear keeps swaying. Dig before it clogs!',
      extra: `Best depth Lv.${save.bestDepth}`,
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          <HeroCanal />
        </div>
        <div className="mt-3 text-center">
          <div className="text-xs font-semibold tracking-[0.35em] text-pink-300">SATISFYING CLEANING ASMR</div>
          <h1 className="mt-1 bg-gradient-to-r from-amber-200 via-pink-200 to-amber-300 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
            Earwax Extractor 🧼
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-pink-100/80 sm:text-base">
            Carefully pop out glowing jelly wax without bumping the sensitive eardrum. Plug in headphones for sweet ASMR sensations! 🎧✨
          </p>
        </div>
      </div>

      <section>
        <SectionTitle sub="Pick a run">Launch mode</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {modes.map((m) => {
            const locked = m.id === 'BOSS' && !bossUnlocked;
            return (
              <button
                key={m.id}
                onClick={() => {
                  synth.unlock();
                  synth.click();
                  setMode(m.id);
                }}
                className={cn(
                  'rounded-2xl border p-4 text-left transition-all',
                  mode === m.id
                    ? 'border-amber-300 bg-amber-300/15 shadow-[0_0_0_2px_rgba(252,211,77,0.5)]'
                    : 'border-white/10 bg-white/[0.05] hover:bg-white/10',
                  locked && 'opacity-70',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{m.icon}</span>
                  <div>
                    <div className="text-lg font-bold">{m.name}</div>
                    <div className="text-xs text-amber-200/80">{m.extra}</div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-white/70">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {mode === 'STAGE' && (
        <section>
          <SectionTitle sub={`${STAGE_NAMES[stage - 1]}`}>Select stage</SectionTitle>
          <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-white/[0.04] px-2 py-1.5 text-[11px] text-white/70">
            <span>
              <b className="text-emerald-200">🎯 Optional flawless:</b> no ear damage → +
              {Math.round((25 + 15 * stage) * 0.5)} wax, +500 score
            </span>
            <span>
              <b className="text-amber-200">⚡ Optional speed:</b> under {stageParams(stage).parTime}s → extra wax and score
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {Array.from({ length: STAGE_COUNT }, (_, i) => i + 1).map((n) => {
              const unlocked = n <= save.stageCleared + 1;
              const cleared = n <= save.stageCleared;
              return (
                <button
                  key={n}
                  disabled={!unlocked}
                  onClick={() => {
                    synth.click();
                    setStage(n);
                  }}
                  className={cn(
                    'relative aspect-square rounded-xl border text-xl font-bold transition-all',
                    stage === n ? 'border-amber-300 bg-amber-300/20' : 'border-white/10 bg-white/[0.06] hover:bg-white/10',
                    !unlocked && 'cursor-not-allowed opacity-35',
                  )}
                >
                  {unlocked ? n : '🔒'}
                  {cleared && <span className="absolute right-1 top-0.5 text-xs">⭐</span>}
                </button>
              );
            })}
          </div>
          <Card className="mt-3 !p-3 text-sm text-white/80">
            <b className="text-amber-200">
              STAGE {stage} · {STAGE_NAMES[stage - 1]}
            </b>{' '}
            — extract {stageParams(stage).target} chunks
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/70">
              {stageFeatures(stage).map((f) => (
                <span key={f} className="rounded-full bg-white/10 px-2 py-0.5">
                  {f}
                </span>
              ))}
              {stageFeatures(stage).length === 0 && <span>Standard layout — warm-up!</span>}
            </div>
          </Card>
        </section>
      )}

      <section>
        <SectionTitle sub="Unlock tools in the lab">Gear</SectionTitle>
        <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
          <Card className="flex items-center gap-4">
            <EarAvatar ear={save.selectedEar} size={68} />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-white/50">Ear owner</div>
              <div className="truncate text-lg font-bold">{ear.name}</div>
              <div className="text-xs text-amber-200/80">{ear.perks.slice(-1)[0]}</div>
              <button onClick={() => goTab('ears')} className="mt-1 text-xs text-rose-300 underline underline-offset-2">
                Change ear owner
              </button>
            </div>
          </Card>

          {mode === 'BOSS' ? (
            <Card className="text-sm text-white/80">
              <div className="mb-1 text-lg font-bold text-amber-200">🔧 Boss-only gear</div>
              <p>
                <b>Phase 1</b> 📳 Sonic Vibrator — park it on the boss and <b>hold click</b>. Three cracks!
                <br />
                <b>Phase 2</b> 🥢 Micro Tweezers — pull 3 broken pieces out without scratching the eardrum.
              </p>
              {!bossUnlocked && (
                <Btn variant="pink" className="mt-2" onClick={() => goTab('lab')}>
                  Buy Micro Tweezers in the lab
                </Btn>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {TOOL_ORDER.map((t) => {
                const owned = save.ownedTools.includes(t);
                const active = save.extractorToolType === t && owned;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      if (owned) {
                        synth.click();
                        actions.equipTool(t);
                      } else goTab('lab');
                    }}
                    className={cn(
                      'rounded-2xl border p-3 text-center transition-all',
                      active ? 'border-amber-300 bg-amber-300/15' : 'border-white/10 bg-white/[0.05] hover:bg-white/10',
                      !owned && 'opacity-60',
                    )}
                  >
                    <div className="text-3xl">{TOOLS[t].emoji}</div>
                    <div className="mt-1 text-sm font-bold leading-tight">{TOOLS[t].name}</div>
                    <div className="mt-0.5 text-[11px] text-white/50">{owned ? (active ? 'Equipped' : 'Tap to equip') : '🔒 Locked'}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {mode !== 'BOSS' && (
          <p className="mt-2 text-xs text-white/60">
            {TOOLS[save.ownedTools.includes(save.extractorToolType) ? save.extractorToolType : 'COTTON'].how}
          </p>
        )}
      </section>

      <div className="sticky bottom-2 z-10">
        <Btn
          variant="primary"
          disabled={!canStart}
          className="w-full py-4 text-xl"
          onClick={() => {
            synth.unlock();
            synth.click();
            // Music needs the same first gesture as the AudioContext itself.
            synth.startMusic();
            onStart(mode, stage);
          }}
        >
          {canStart ? '🚀 Start mining' : '🔒 Micro Tweezers required'}
        </Btn>
      </div>
    </div>
  );
}
