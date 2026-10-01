import { useState } from 'react';
import { EARS } from '../game/config';
import { actions, useSave } from '../game/store';
import type { GameMode } from '../game/types';
import { cn } from '../utils/cn';
import { Btn, Card } from './ui';

const MODES: { id: GameMode; label: string; icon: string }[] = [
  { id: 'ENDLESS', label: 'Endless', icon: '♾️' },
  { id: 'BOSS', label: 'Boss', icon: '🪨' },
  { id: 'STAGE', label: 'Stages', icon: '🧪' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

export function RankTab() {
  const save = useSave();
  const [mode, setMode] = useState<GameMode>('ENDLESS');
  const [name, setName] = useState(save.nickname);
  const list = save.boards[mode];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-amber-200 sm:text-3xl">🏆 Earwax King Rankings</h1>
        <p className="text-sm text-white/60">A local leaderboard stored on this device. Beat the rival miners!</p>
      </div>

      <Card className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-white/70" htmlFor="nick">
          Nickname
        </label>
        <input
          id="nick"
          value={name}
          maxLength={12}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-base outline-none focus:border-amber-300"
        />
        <Btn variant="primary" className="!py-2" onClick={() => actions.setNickname(name)}>
          Save
        </Btn>
      </Card>

      <div className="flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'flex-1 rounded-xl border px-3 py-2 text-sm font-bold transition-all sm:text-base',
              mode === m.id ? 'border-amber-300 bg-amber-300/20' : 'border-white/10 bg-white/[0.05] hover:bg-white/10',
            )}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <Card className="!p-2">
        <ol className="divide-y divide-white/5">
          {list.map((e, i) => (
            <li
              key={`${e.name}-${e.date}-${i}`}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5',
                e.mine && 'bg-amber-300/15 ring-1 ring-amber-300/50',
              )}
            >
              <div className="w-9 text-center text-lg font-bold">{MEDAL[i] ?? i + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">
                  {e.name}
                  {e.mine && <span className="ml-2 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] text-amber-950">Me</span>}
                </div>
                <div className="text-xs text-white/40">
                  {e.rival ? 'Rival miner' : `${e.ear ? EARS[e.ear].emoji + ' ' + EARS[e.ear].name : ''} · ${new Date(e.date).toLocaleDateString('en-US')}`}
                </div>
              </div>
              <div className="text-lg font-bold text-amber-300">{e.score.toLocaleString()}</div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
