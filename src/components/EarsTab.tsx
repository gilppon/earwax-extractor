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
        <h1 className="text-2xl font-bold text-amber-200 sm:text-3xl">👂 귀 주인 도감</h1>
        <p className="text-sm text-white/60">
          귀마다 지형·중력·털·귓밥이 달라요. 기묘한 귀일수록 수익이 커집니다. (unlockedEars {save.unlockedEars.length}/4)
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
                  통로 <b className="block text-white">{ear.base < 100 ? '좁음' : ear.base > 130 ? '넓음' : '보통'}</b>
                </div>
                <div className="rounded-lg bg-black/25 p-1.5">
                  중력 <b className="block text-white">×{ear.gravity}</b>
                </div>
                <div className="rounded-lg bg-black/25 p-1.5">
                  털 <b className="block text-white">{ear.hairMult < 1 ? '적음' : ear.hairMult > 1.5 ? '북슬' : '보통'}</b>
                </div>
                <div className="rounded-lg bg-black/25 p-1.5">
                  수익 <b className="block text-amber-300">×{ear.valueMult}</b>
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
                  {selected ? '✔ 선택됨' : '이 귀로 출격'}
                </Btn>
              ) : (
                <Btn
                  variant="pink"
                  onClick={() => {
                    synth.unlock();
                    if (actions.unlockEar(id)) {
                      synth.buy();
                      setMsg(`${ear.name} 해금 완료!`);
                    } else {
                      synth.click();
                      setMsg('귓밥이 부족해요…');
                    }
                  }}
                >
                  해금 <Wax n={ear.cost} className="!text-rose-950" />
                </Btn>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
