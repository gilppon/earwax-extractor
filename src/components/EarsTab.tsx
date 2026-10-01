import { useState } from 'react';
import { EARS, EAR_ORDER } from '../game/config';
import { synth } from '../game/AsmrSynth';
import { actions, useSave } from '../game/store';
import { cn } from '../utils/cn';
import { Btn, Card, EarAvatar, Wax } from './ui';

export function EarsTab() {
  const save = useSave();
  const [msg, setMsg] = useState('');

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-amber-200 sm:text-3xl">👂 Ear Owner Codex</h1>
        <p className="text-sm text-white/60">
          Every ear has its own terrain, gravity, fur and wax. The weirder the ear, the fatter the payout. (unlockedEars {save.unlockedEars.length}/4)
        </p>
        {msg && <p className="mt-1 text-sm font-bold text-rose-300">{msg}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EAR_ORDER.map((id) => {
          const ear = EARS[id];
          const unlocked = save.unlockedEars.includes(id);
          const selected = save.selectedEar === id;
          return (
            <Card key={id} className={cn('flex flex-col gap-3', selected && 'border-amber-300/70 bg-amber-300/10')}>
              <div className="flex items-center gap-4">
                <EarAvatar ear={id} size={84} locked={!unlocked} />
                <div className="min-w-0">
                  <div className="text-xl font-bold">{ear.name}</div>
                  <div className="text-sm text-white/60">{ear.desc}</div>
                </div>
              </div>
              <ul className="flex flex-wrap gap-1.5 text-xs">
                {ear.perks.map((p) => (
                  <li key={p} className="rounded-full bg-black/30 px-2.5 py-1 text-amber-100">
                    {p}
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] text-white/60">
                <div className="rounded-lg bg-black/25 p-1.5">
                  Canal <b className="block text-white">{ear.base < 100 ? 'Narrow' : ear.base > 130 ? 'Wide' : 'Normal'}</b>
                </div>
                <div className="rounded-lg bg-black/25 p-1.5">
                  Gravity <b className="block text-white">×{ear.gravity}</b>
                </div>
                <div className="rounded-lg bg-black/25 p-1.5">
                  Fur <b className="block text-white">{ear.hairMult < 1 ? 'Sparse' : ear.hairMult > 1.5 ? 'Fluffy' : 'Normal'}</b>
                </div>
                <div className="rounded-lg bg-black/25 p-1.5">
                  Payout <b className="block text-amber-300">×{ear.valueMult}</b>
                </div>
              </div>
              {unlocked ? (
                <Btn
                  variant={selected ? 'ghost' : 'primary'}
                  disabled={selected}
                  onClick={() => {
                    synth.click();
                    actions.selectEar(id);
                  }}
                >
                  {selected ? '✔ Selected' : 'Mine with this ear'}
                </Btn>
              ) : (
                <Btn
                  variant="pink"
                  onClick={() => {
                    synth.unlock();
                    if (actions.unlockEar(id)) {
                      synth.buy();
                      setMsg(`${ear.name} unlocked!`);
                    } else {
                      synth.click();
                      setMsg('Not enough wax…');
                    }
                  }}
                >
                  Unlock <Wax n={ear.cost} className="!text-rose-950" />
                </Btn>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
