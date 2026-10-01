import { synth } from '../game/AsmrSynth';
import { actions, pendingDrone, useSave } from '../game/store';
import type { GameMode } from '../game/types';
import { useNow, type Tab } from '../hooks';
import { cn } from '../utils/cn';
import { EarsTab } from './EarsTab';
import { LabTab } from './LabTab';
import { MissionTab } from './MissionTab';
import { RankTab } from './RankTab';
import { Wax } from './ui';

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  onStart: (mode: GameMode, stage: number) => void;
}

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'mission', icon: '🚀', label: 'Expedition' },
  { id: 'lab', icon: '🔬', label: 'Lab' },
  { id: 'ears', icon: '👂', label: 'Ears' },
  { id: 'rank', icon: '🏆', label: 'Ranks' },
];

export function Hub({ tab, setTab, onStart }: Props) {
  const save = useSave();
  const now = useNow(5000);
  const pending = pendingDrone(save, now);
  const daily = actions.dailyStatus();
  const milestone = actions.claimableMilestone();

  return (
    <div className="bg-ear flex h-full flex-col">
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/30 px-3 py-2 backdrop-blur sm:px-5">
        <div className="flex items-center gap-2">
          <span className="animate-wobble inline-block text-2xl">👂</span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-amber-200 sm:text-base">Earwax Mining Corp.</div>
            <div className="hidden text-[10px] tracking-[0.25em] text-white/40 sm:block">EARWAX MINING CORP.</div>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => actions.claimDaily()}
            disabled={!daily.available}
            title="Daily check-in bonus"
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition',
              daily.available
                ? 'animate-pulse bg-amber-300 text-amber-950 ring-amber-200'
                : 'cursor-default bg-white/10 text-white/50 ring-white/10',
            )}
          >
            {daily.available ? `📅 Check in +${daily.wax} (day ${daily.day})` : `📅 Day ${daily.day} checked in`}
          </button>
          {milestone && (
            <button
              onClick={() => actions.claimMilestone(milestone.at)}
              title={milestone.label}
              className="animate-pulse rounded-full bg-emerald-300 px-3 py-1.5 text-sm font-bold text-emerald-950 ring-1 ring-emerald-200"
            >
              {milestone.emoji} +{milestone.wax}
            </button>
          )}
          <div className="rounded-full bg-black/40 px-3 py-1.5 ring-1 ring-amber-300/30">
            <Wax n={save.wax} size={18} className="text-base" />
          </div>
          <button
            aria-label="Toggle effects"
            title={save.lowFx ? 'Low effects on' : 'Full effects'}
            onClick={() => actions.setLowFx(!save.lowFx)}
            className={cn(
              'rounded-full px-3 py-1.5 text-base',
              save.lowFx ? 'bg-emerald-700/70' : 'bg-white/10 hover:bg-white/20',
            )}
          >
            {save.lowFx ? '✨' : '💥'}
          </button>
          <button
            aria-label="Toggle sound"
            onClick={() => {
              synth.unlock();
              const m = !save.muted;
              synth.setMuted(m);
              actions.setMuted(m);
            }}
            className="rounded-full bg-white/10 px-3 py-1.5 text-base hover:bg-white/20"
          >
            {save.muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      <main className="scroll-thin flex-1 overflow-y-auto p-3 pb-6 sm:p-5">
        {tab === 'mission' && <MissionTab onStart={onStart} goTab={setTab} />}
        {tab === 'lab' && <LabTab />}
        {tab === 'ears' && <EarsTab />}
        {tab === 'rank' && <RankTab />}
      </main>

      <nav className="grid grid-cols-4 border-t border-white/10 bg-black/50 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              synth.click();
              setTab(t.id);
            }}
            className={cn(
              'relative flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors sm:text-sm',
              tab === t.id ? 'bg-amber-300/15 text-amber-200' : 'text-white/60 hover:text-white',
            )}
          >
            <span className="text-xl sm:text-2xl">{t.icon}</span>
            <span className="font-bold">{t.label}</span>
            {t.id === 'lab' && pending >= 1 && (
              <span className="absolute right-[28%] top-1.5 h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-black/50" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
