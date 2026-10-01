import { useCallback, useEffect, useState } from 'react';
import { synth } from './game/AsmrSynth';
import { Poki } from './game/poki';
import { getSave, makeRunConfig, useSave } from './game/store';
import type { GameMode, RunConfig } from './game/types';
import type { Tab } from './hooks';
import { Hub } from './components/Hub';
import { PlayScreen } from './components/PlayScreen';

export default function App() {
  const save = useSave();
  const [screen, setScreen] = useState<'hub' | 'play'>('hub');
  const [tab, setTab] = useState<Tab>('mission');
  const [run, setRun] = useState<RunConfig | null>(null);
  const [runId, setRunId] = useState(0);

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
        onNextStage={() => start('STAGE', Math.min(8, run.stage + 1))}
        onReviveRun={() => start(run.mode, run.stage, true)}
      />
    );
  }

  return <Hub tab={tab} setTab={setTab} onStart={start} />;
}
