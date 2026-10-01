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
  if (p.hairs > 0) f.push(`🧶 털 ${p.hairs}`);
  if (p.gold > 0) f.push('✨ 황금 귓밥');
  if (p.hard > 0) f.push('🪨 석회 귓밥');
  if (p.danger > 0) f.push('🎯 고막 앞 귓밥');
  if (p.flinch > 0) f.push('🤧 재채기');
  if (p.sway > 0) f.push('🌪️ 중력 흔들림');
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
      name: '탐사 모드',
      desc: '8개 스테이지! 귓밥을 출구(왼쪽)로 꺼내자.',
      extra: `진행 ${save.stageCleared}/${STAGE_COUNT}`,
    },
    {
      id: 'BOSS',
      icon: '🪨',
      name: '석회화 보스전',
      desc: '고막 앞 돌덩이! 진동으로 균열 3회 → 집게로 적출.',
      extra: save.bossDefeated ? '처치 완료 ✔' : bossUnlocked ? '도전 가능' : '🔒 미세 집게 필요',
    },
    {
      id: 'ENDLESS',
      icon: '♾️',
      name: '무한 귓속 광산',
      desc: '귓밥이 끝없이 솟구치고 귀가 흔들린다. 막히기 전에 파내라!',
      extra: `최고 깊이 Lv.${save.bestDepth}`,
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          <HeroCanal />
        </div>
        <div className="mt-3 text-center">
          <div className="text-xs tracking-[0.35em] text-rose-300/80">EXTREME EARWAX MINER</div>
          <h1 className="mt-1 bg-gradient-to-b from-amber-200 to-amber-400 bg-clip-text text-3xl font-bold text-transparent sm:text-5xl">
            지옥의 귓밥 파기 스나이퍼
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/70 sm:text-base">
            떨리는 손으로 고막을 건드리지 않고 귓밥을 캐내라. 이어폰을 끼면 ASMR이 더 짜릿하다 🎧
          </p>
        </div>
      </div>

      <section>
        <SectionTitle sub="모드를 선택하세요">출격 모드</SectionTitle>
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
          <SectionTitle sub={`${STAGE_NAMES[stage - 1]}`}>스테이지 선택</SectionTitle>
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
            — 귓밥 {stageParams(stage).target}개 적출
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/70">
              {stageFeatures(stage).map((f) => (
                <span key={f} className="rounded-full bg-white/10 px-2 py-0.5">
                  {f}
                </span>
              ))}
              {stageFeatures(stage).length === 0 && <span>기본 코스 — 워밍업!</span>}
            </div>
          </Card>
        </section>
      )}

      <section>
        <SectionTitle sub="연구소에서 도구를 해금하세요">출격 장비</SectionTitle>
        <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
          <Card className="flex items-center gap-4">
            <EarAvatar ear={save.selectedEar} size={68} />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-white/50">귀 주인</div>
              <div className="truncate text-lg font-bold">{ear.name}</div>
              <div className="text-xs text-amber-200/80">{ear.perks.slice(-1)[0]}</div>
              <button onClick={() => goTab('ears')} className="mt-1 text-xs text-rose-300 underline underline-offset-2">
                귀 주인 바꾸기
              </button>
            </div>
          </Card>

          {mode === 'BOSS' ? (
            <Card className="text-sm text-white/80">
              <div className="mb-1 text-lg font-bold text-amber-200">🔧 보스전 전용 장비</div>
              <p>
                <b>1단계</b> 📳 음파 진동기 — 보스에 가만히 대고 <b>클릭 유지</b>. 균열 3회!
                <br />
                <b>2단계</b> 🥢 미세 집게 — 부서진 조각 3개를 고막을 피해 조심스럽게 꺼내기.
              </p>
              {!bossUnlocked && (
                <Btn variant="pink" className="mt-2" onClick={() => goTab('lab')}>
                  연구소에서 미세 집게 구입
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
                    <div className="mt-0.5 text-[11px] text-white/50">{owned ? (active ? '장착 중' : '탭하여 장착') : '🔒 미보유'}</div>
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
            onStart(mode, stage);
          }}
        >
          {canStart ? '🚀 출격! 귓속 탐사 시작' : '🔒 미세 집게가 필요합니다'}
        </Btn>
      </div>
    </div>
  );
}
