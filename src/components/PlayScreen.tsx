import { useCallback, useEffect, useRef, useState } from 'react';
import { EARS, STAGE_COUNT, STAGE_NAMES, TOOLS, stageParams } from '../game/config';
import { synth } from '../game/AsmrSynth';
import { createGame, type GameHandle } from '../game/createGame';
import { Poki, registerAdUI, rewardedBreak } from '../game/poki';
import { actions, getSave, useSave } from '../game/store';
import type { HudState, RunConfig, RunResult } from '../game/types';
import { fmtTime, useIsTouch, usePortrait, type Tab } from '../hooks';
import { cn } from '../utils/cn';
import { Hud } from './Hud';
import { Btn, Card, EarAvatar, Wax } from './ui';
import AdOverlay, { type AdState } from './AdOverlay';

interface Props {
  run: RunConfig;
  onExit: (tab: Tab) => void;
  onRetry: () => void;
  onNextStage: () => void;
  onReviveRun: () => void;
}

interface Summary {
  rank: number;
  newStage: boolean;
  newBoss: boolean;
}

const REASONS: Record<string, string> = {
  CLEAR: '완벽하게 적출했습니다!',
  DRUM: '고막이 파열되었습니다… 귀 주인이 기절했어요.',
  CLOG: '귓구멍이 귓밥으로 꽉 막혀버렸어요!',
};

function HoldButton({
  onChange,
  className,
  children,
}: {
  onChange: (down: boolean) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onChange(true);
      }}
      onPointerUp={() => onChange(false)}
      onPointerCancel={() => onChange(false)}
      onLostPointerCapture={() => onChange(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        'pointer-events-auto flex touch-none select-none items-center justify-center rounded-full border-2 border-white/40 bg-black/50 text-center font-bold text-white shadow-lg backdrop-blur active:scale-95 active:bg-amber-400/70',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PlayScreen({ run, onExit, onRetry, onNextStage, onReviveRun }: Props) {
  const save = useSave();
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const touchRef = useRef({ grab: false, breath: false });
  const summaryRef = useRef<Summary | null>(null);

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState<HudState | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [ad, setAd] = useState<AdState | null>(null);
  const [adBusy, setAdBusy] = useState(false);
  const [doubled, setDoubled] = useState(false);

  // 모의광고 UI 등록
  useEffect(() => {
    registerAdUI((kind, done) => setAd({ kind, done }));
    return () => registerAdUI(null);
  }, []);

  const watchDouble = async () => {
    if (!result || doubled || adBusy || result.wax <= 0) return;
    setAdBusy(true);
    try {
      if (await rewardedBreak()) {
        actions.doubleWax(result.wax);
        setDoubled(true);
        synth.click();
      }
    } finally {
      setAdBusy(false);
    }
  };

  const watchRevive = async () => {
    if (!result || result.cleared || adBusy) return;
    setAdBusy(true);
    try {
      if (await rewardedBreak()) onReviveRun();
    } finally {
      setAdBusy(false);
    }
  };

  const isTouch = useIsTouch();
  const portrait = usePortrait();
  const tool = TOOLS[run.mode === 'BOSS' ? 'VIBRATOR' : run.tool];
  const ear = EARS[run.ear];

  // boot Phaser once the player presses "start" (also unlocks audio)
  useEffect(() => {
    if (!started || !hostRef.current) return;
    const h = createGame(
      hostRef.current,
      run,
      { onHud: (s) => setHud(s), onEnd: (r) => setResult(r) },
      synth,
    );
    handleRef.current = h;
    h.setLowFx(getSave().lowFx);
    return () => {
      h.destroy();
      handleRef.current = null;
    };
  }, [started, run]);

  // apply results to the meta-game exactly once
  useEffect(() => {
    if (!result || summaryRef.current) return;
    const s = actions.finishRun(result);
    summaryRef.current = s;
    setSummary(s);
    Poki.gameplayStop();
  }, [result]);

  const doPause = useCallback(() => {
    if (!started || result) return;
    setPaused(true);
    handleRef.current?.pause();
    Poki.gameplayStop();
  }, [started, result]);

  const doResume = useCallback(() => {
    setPaused(false);
    handleRef.current?.resume();
    Poki.gameplayStart();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (paused) doResume();
        else doPause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paused, doPause, doResume]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) doPause();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', doPause);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', doPause);
    };
  }, [doPause]);

  const setTouch = (k: 'grab' | 'breath', v: boolean) => {
    touchRef.current[k] = v;
    handleRef.current?.setTouch(touchRef.current.grab, touchRef.current.breath);
  };

  // 첫판 강제 미션 3스텝 (클릭 유지 → 적출 1개 → 적출 3개), 완료 시 +30 wax
  const [missionStep, setMissionStep] = useState(0); // 0 대기, 1~3 진행, 4 완료
  const missionDoneRef = useRef(false);

  useEffect(() => {
    if (!hud || result || missionDoneRef.current) return;
    if (missionStep === 0 && hud.energy > 0.05) setMissionStep(1);
    else if (missionStep === 1 && hud.extracted >= 1) setMissionStep(2);
    else if (missionStep === 2 && hud.extracted >= 3) {
      missionDoneRef.current = true;
      setMissionStep(4);
      actions.bonusWax(30);
      synth.win();
    }
  }, [hud, missionStep, result]);

  useEffect(() => {
    if (missionStep === 4) actions.markTutorialDone();
  }, [missionStep]);

  const title =
    run.mode === 'STAGE'
      ? `STAGE ${run.stage} · ${STAGE_NAMES[run.stage - 1]}`
      : run.mode === 'ENDLESS'
        ? '무한 귓속 광산'
        : '석회화 귓밥 보스전';

  const goal =
    run.mode === 'STAGE'
      ? `귓밥 ${stageParams(run.stage).target}개를 왼쪽 출구 밖으로 꺼내세요.`
      : run.mode === 'ENDLESS'
        ? '귓밥이 끝없이 솟구칩니다. 귓구멍이 막히기 전에, 고막을 지키며 최대한 캐내세요!'
        : '① 음파 진동기로 보스에 균열 3회 → ② 집게로 조각 3개를 조심스럽게 적출!';

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1a0509]">
      {ad && (
        <AdOverlay
          kind={ad.kind}
          onDone={(ok) => {
            setAd(null);
            ad.done(ok);
          }}
        />
      )}
      <div ref={hostRef} className="absolute inset-x-0 bottom-0 top-[52px] cursor-crosshair" />

      {started && !result && <Hud hud={hud} run={run} onPause={doPause} />}

      {/* 첫판 강제 미션 오버레이 */}
      {started && !result && !paused && !save.tutorialDone && (
        <div className="pointer-events-none absolute inset-x-[4cqw] bottom-[16cqw] z-10 animate-pop rounded-2xl bg-slate-900/80 p-[3cqw] text-center leading-snug font-bold text-white" style={{ fontSize: '3.4cqw' }}>
          {missionStep === 4 ? (
            <div className="text-emerald-300">🎓 코치 완료! 귓밥 +30 보너스</div>
          ) : (
            <>
              <div className="mb-[1.5cqw] flex justify-center gap-[1.5cqw]">
                {['도구로 귓밥 집기', '귀밥 1개 적출', '귀밥 3개 적출'].map((s, i) => (
                  <span
                    key={s}
                    className={cn(
                      'rounded-full px-[2.4cqw] py-[0.6cqw]',
                      i < missionStep
                        ? 'bg-emerald-500/80'
                        : i === missionStep
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-white/15 text-white/60',
                    )}
                    style={{ fontSize: '2.8cqw' }}
                  >
                    {i < missionStep ? '✓' : `${i + 1}.`} {s}
                  </span>
                ))}
              </div>
              {missionStep === 0 && <div>👆 <span className="text-amber-300">화면을 클릭하고 유지</span>해 주세요!</div>}
              {missionStep === 1 && <div>🩸 귓밥을 <span className="text-amber-300">왼쪽 출구(◀)</span>까지 끌고 가세요!</div>}
              {missionStep === 2 && <div>👏 <span className="text-amber-300">귀밥 3개</span>를 더 적출해 보세요! (고막 주의)</div>}
            </>
          )}
        </div>
      )}

      {started && !result && portrait && (
        <div className="pointer-events-none absolute left-1/2 top-16 z-10 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 text-xs text-white/80">
          📱 가로 화면으로 돌리면 더 잘 보여요
        </div>
      )}

      {/* touch controls */}
      {started && !result && !paused && isTouch && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-end gap-3">
          <HoldButton onChange={(d) => setTouch('breath', d)} className="h-16 w-16 text-xs leading-tight">
            <span>
              💨
              <br />
              숨참기
            </span>
          </HoldButton>
          <HoldButton onChange={(d) => setTouch('grab', d)} className="h-24 w-24 border-amber-300 text-sm leading-tight">
            <span>
              {tool.emoji}
              <br />
              {run.tool === 'SONIC_VACUUM' && run.mode !== 'BOSS' ? '흡입' : run.mode === 'BOSS' ? '진동/집기' : '집기'}
            </span>
          </HoldButton>
        </div>
      )}

      {/* briefing */}
      {!started && (
        <div className="bg-ear absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-4">
          <Card className="animate-pop my-auto w-full max-w-xl !p-5">
            <div className="flex items-center gap-4">
              <EarAvatar ear={run.ear} size={64} />
              <div>
                <div className="text-xs tracking-widest text-rose-300/80">MISSION BRIEFING</div>
                <h2 className="text-2xl font-bold text-amber-200">{title}</h2>
                <div className="text-sm text-white/60">
                  {ear.name} · {tool.emoji} {tool.name}
                </div>
              </div>
            </div>
            <p className="mt-3 rounded-xl bg-black/30 p-3 text-sm text-white/90">🎯 {goal}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-white/80">
              <li>
                🖱️ <b>이동</b> — 도구 끝이 손가락/마우스를 따라갑니다. 손이 떨려요!
              </li>
              <li>
                👆 <b>클릭 유지</b> — {tool.how}
              </li>
              <li>
                💨 <b>Shift / 우클릭</b> — 숨 참기로 손떨림을 잡기 (게이지 소모)
              </li>
              <li>
                👂 <b>고막에 닿으면 큰 피해!</b> 고막 앞 귓밥은 보너스 ×1.6
              </li>
              <li>
                🤧 털을 건드리면 간지러움 → 재채기로 손이 튕깁니다.
              </li>
              <li>
                ⏸ <b>Esc / P</b> — 일시정지
              </li>
            </ul>
            {run.mode === 'BOSS' && (
              <p className="mt-2 rounded-xl bg-orange-400/10 p-2 text-xs text-orange-200">
                진동기를 보스 근처(하얀 원 안)에 대고 <b>클릭 유지</b>. 움직이면 충전이 느려져요. 균열 시 고막에 진동이 전해집니다.
              </p>
            )}
            <Btn
              variant="primary"
              className="mt-4 w-full py-3.5 text-lg"
              onClick={() => {
                synth.unlock();
                synth.click();
                setStarted(true);
              }}
            >
              🎧 이어폰 착용 완료 — 시작!
            </Btn>
            <button onClick={() => onExit('mission')} className="mt-2 w-full text-center text-sm text-white/50 underline">
              돌아가기
            </button>
          </Card>
        </div>
      )}

      {/* pause */}
      {paused && !result && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="animate-pop w-full max-w-xs text-center">
            <div className="mb-3 text-2xl font-bold text-amber-200">⏸ 일시정지</div>
            <div className="flex flex-col gap-2">
              <Btn variant="primary" onClick={doResume}>
                계속하기
              </Btn>
              <Btn variant="ghost" onClick={onRetry}>
                처음부터 다시
              </Btn>
              <Btn variant="danger" onClick={() => onExit('mission')}>
                포기하고 나가기
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* result */}
      {result && (
        <div className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <Card className="animate-pop my-auto w-full max-w-lg !p-5">
            <div className="text-center">
              <div className="text-5xl">{result.cleared ? (result.mode === 'BOSS' ? '🏆' : '🎉') : '💥'}</div>
              <h2 className={cn('mt-1 text-3xl font-bold', result.cleared ? 'text-amber-300' : 'text-rose-400')}>
                {result.cleared ? (result.mode === 'BOSS' ? '보스 격파!' : '클리어!') : result.mode === 'ENDLESS' ? '광산 붕괴' : '실패'}
              </h2>
              <p className="text-sm text-white/70">{REASONS[result.reason] ?? ''}</p>
              {summary && summary.rank > 0 && (
                <p className="mt-1 inline-block rounded-full bg-amber-300 px-3 py-0.5 text-sm font-bold text-amber-950">
                  🏆 랭킹 {summary.rank}위 진입!
                </p>
              )}
              {summary?.newStage && result.stage < STAGE_COUNT && (
                <p className="mt-1 text-sm text-emerald-300">🔓 STAGE {result.stage + 1} 해금!</p>
              )}
              {summary?.newBoss && <p className="mt-1 text-sm text-emerald-300">🪨 석회화 보스 최초 처치!</p>}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-black/30 p-2">
                <div className="text-xs text-white/50">점수</div>
                <div className="text-lg font-bold">{result.score.toLocaleString()}</div>
              </div>
              <div className="rounded-xl bg-black/30 p-2">
                <div className="text-xs text-white/50">적출</div>
                <div className="text-lg font-bold">{result.extracted}개</div>
              </div>
              <div className="rounded-xl bg-black/30 p-2">
                <div className="text-xs text-white/50">시간</div>
                <div className="text-lg font-bold">{fmtTime(result.time)}</div>
              </div>
              <div className="rounded-xl bg-black/30 p-2">
                <div className="text-xs text-white/50">최대 콤보</div>
                <div className="text-lg font-bold">{result.maxCombo}</div>
              </div>
              <div className="rounded-xl bg-black/30 p-2">
                <div className="text-xs text-white/50">고막 잔량</div>
                <div className="text-lg font-bold">{result.drumHp}%</div>
              </div>
              <div className="rounded-xl bg-black/30 p-2">
                <div className="text-xs text-white/50">{result.mode === 'ENDLESS' ? '도달 깊이' : '귀'}</div>
                <div className="text-lg font-bold">{result.mode === 'ENDLESS' ? `Lv.${result.depth}` : EARS[result.ear].emoji}</div>
              </div>
            </div>

            {result.bonuses.length > 0 && (
              <ul className="mt-3 space-y-1 rounded-xl bg-black/25 p-3 text-sm">
                {result.bonuses.map((b) => (
                  <li key={b.label} className="flex items-center justify-between text-white/80">
                    <span>{b.label}</span>
                    {b.wax > 0 ? <Wax n={b.wax} size={14} /> : <span className="text-white/40">—</span>}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-300/15 p-3 ring-1 ring-amber-300/40">
              <span className="font-bold">획득 귓밥</span>
              <Wax n={result.wax} size={22} className="text-2xl" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {result.cleared && result.mode === 'STAGE' && result.stage < STAGE_COUNT && (
                <Btn variant="primary" className="col-span-2" onClick={onNextStage}>
                  다음 스테이지 ▶
                </Btn>
              )}
              {!result.cleared && (
                <Btn variant="pink" className="col-span-2" disabled={adBusy} onClick={watchRevive}>
                  🎬 {adBusy ? '광고 로딩 중...' : '광고 보고 부활 재도전 (고막 +30%)'}
                </Btn>
              )}
              {result.wax > 0 && !doubled && (
                <Btn variant="primary" className="col-span-2" disabled={adBusy} onClick={watchDouble}>
                  🎬 {adBusy ? '광고 로딩 중...' : `광고 보고 귓밥 2배 (+${result.wax})`}
                </Btn>
              )}
              {doubled && (
                <p className="col-span-2 text-center text-sm font-bold text-emerald-300">✅ 광고 2배 보상 수령 완료!</p>
              )}
              <Btn variant={result.cleared && result.mode === 'STAGE' ? 'ghost' : 'primary'} onClick={onRetry}>
                🔁 다시 도전
              </Btn>
              <Btn variant="pink" onClick={() => onExit('lab')}>
                🔬 연구소
              </Btn>
              <Btn variant="ghost" className="col-span-2" onClick={() => onExit('mission')}>
                🏠 메인으로
              </Btn>
            </div>
            {!result.cleared && (
              <p className="mt-3 text-center text-xs text-white/50">
                💡 팁: 숨 참기(Shift)로 손떨림을 줄이고, 재채기 경고가 뜨면 고막에서 멀리 떨어지세요.
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
