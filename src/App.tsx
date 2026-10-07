import { useCallback, useEffect, useState } from 'react';
import { synth } from './game/AsmrSynth';
import { Poki } from './game/poki';
import { STAGE_COUNT } from './game/config';
import { getSave, makeRunConfig, useSave } from './game/store';
import type { GameMode, RunConfig } from './game/types';
import type { Tab } from './hooks';
import { Hub } from './components/Hub';
import { PlayScreen } from './components/PlayScreen';
import { readEarwaxChallenge } from './game/share';

export default function App() {
  const save = useSave();
  const [screen, setScreen] = useState<'hub' | 'play'>('hub');
  const [tab, setTab] = useState<Tab>('mission');
  const [run, setRun] = useState<RunConfig | null>(null);
  const [runId, setRunId] = useState(0);
  const [challenge] = useState(readEarwaxChallenge);

  useEffect(() => {
    synth.setMuted(save.muted);
  }, [save.muted]);

  // Init the portal SDK (the game still runs fine if it fails)
  useEffect(() => {
    void Poki.init().then(() => Poki.loadingFinished());
  }, []);

  const start = useCallback((mode: GameMode, stage: number, reviveBuff = false) => {
    const cfg = makeRunConfig(getSave(), mode, stage);
    setRun(reviveBuff ? { ...cfg, reviveBuff: true } : cfg);
    setRunId((i) => i + 1);
    setScreen('play');
    Poki.gameplayStart();
  }, []);

  const exit = useCallback((t: Tab) => {
    synth.stopLoops();
    Poki.gameplayStop();
    setTab(t);
    setScreen('hub');
  }, []);

  if (screen === 'play' && run) {
    return (
      <PlayScreen
        key={runId}
        run={run}
        onExit={exit}
        onRetry={() => start(run.mode, run.stage)}
        onNextStage={() => start('STAGE', Math.min(STAGE_COUNT, run.stage + 1))}
        onReviveRun={() => start(run.mode, run.stage, true)}
      />
    );
  }

  return (
    <>
      <Hub tab={tab} setTab={setTab} onStart={start} />
      {challenge && (
        <div className="fixed left-1/2 top-3 z-[90] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-amber-300/50 bg-slate-950/95 p-3 text-center text-white shadow-xl">
          <div className="text-xs font-black tracking-widest text-amber-200">FRIEND’S EARWAX CHALLENGE</div>
          <div className="mt-1 text-sm font-bold">
            {challenge.mode} · {challenge.ear} ear · Stage {challenge.stage} · {challenge.score.toLocaleString('en-US')} score · {challenge.extracted} extracted · ×{challenge.maxCombo}
          </div>
          <button onClick={() => start(challenge.mode, challenge.stage)} className="mt-2 rounded-full bg-amber-300 px-4 py-1.5 text-xs font-black text-slate-950">
            Mine this stage
          </button>
        </div>
      )}
    </>
  );
}
