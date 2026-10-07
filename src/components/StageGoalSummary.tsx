import { stageParams } from '../game/config';
import type { RunResult } from '../game/types';
import { fmtTime } from '../hooks';
import { cn } from '../utils/cn';

export function StageGoalSummary({ result }: { result: RunResult }) {
  if (result.mode !== 'STAGE') return null;

  const par = stageParams(result.stage).parTime;
  const flawless = result.bonuses.some((bonus) => bonus.label.startsWith('Flawless'));
  const speed = result.bonuses.some((bonus) => bonus.label === 'Speed bonus');
  const goals = [
    {
      label: '🎯 Flawless · no ear damage',
      earned: flawless,
      detail: !result.cleared ? 'Not earned · stage not cleared' : flawless ? 'Ear canal untouched' : 'Ear canal was touched',
    },
    {
      label: '⚡ Speed · clear under target',
      earned: speed,
      detail: !result.cleared
        ? 'Not earned · stage not cleared'
        : speed
          ? `Finished in ${fmtTime(result.time)} · under ${fmtTime(par)}`
          : `Not earned · exceeded ${fmtTime(par)} target`,
    },
  ];

  return (
    <div className="mt-3 rounded-xl bg-white/[0.04] p-3">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-white/50">Optional stage goals</div>
      <div className="space-y-2">
        {goals.map((goal) => (
          <div key={goal.label} className="flex items-start justify-between gap-3 text-xs sm:text-sm">
            <span className="font-semibold text-white/80">{goal.label}</span>
            <span className={cn('shrink-0 text-right', goal.earned ? 'text-emerald-300' : 'text-white/55')}>
              {goal.earned ? '✓ Earned' : goal.detail}
              {goal.earned && <span className="block font-normal text-white/55">{goal.detail}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
