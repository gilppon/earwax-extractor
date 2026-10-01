import { useState } from 'react';
import {
  DRONE_CAP_SEC,
  STAGE_COUNT,
  TOOLS,
  TOOL_ORDER,
  UPGRADES,
  droneRate,
  upgradeCost,
} from '../game/config';
import { synth } from '../game/AsmrSynth';
import { actions, getLevel, pendingDrone, useSave } from '../game/store';
import { useNow } from '../hooks';
import { cn } from '../utils/cn';
import { Bar, Btn, Card, SectionTitle, Wax } from './ui';

export function LabTab() {
  const save = useSave();
  const now = useNow(1000);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    window.setTimeout(() => setMsg((m) => (m && m.text === text ? null : m)), 1800);
  };

  const pending = pendingDrone(save, now);
  const cap = Math.floor(DRONE_CAP_SEC * droneRate(save.drone));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-amber-200 sm:text-3xl">🔬 귓밥 광산 연구소</h1>
        <p className="text-sm text-white/60">캐낸 귓밥으로 도구를 강화하고, 광산을 자동화하세요.</p>
      </div>

      {msg && (
        <div
          className={cn(
            'fixed left-1/2 top-20 z-30 -translate-x-1/2 animate-pop rounded-full px-5 py-2 text-sm font-bold shadow-lg',
            msg.ok ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950',
          )}
        >
          {msg.text}
        </div>
      )}

      {/* Drone / idle income */}
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="text-5xl">🤖</div>
        <div className="flex-1">
          <div className="text-lg font-bold">자동 채굴 드론 · Lv.{save.drone}</div>
          {save.drone === 0 ? (
            <p className="text-sm text-white/60">아래 강화 목록에서 드론을 설치하면 접속하지 않아도 귓밥이 쌓입니다.</p>
          ) : (
            <>
              <p className="text-sm text-white/70">
                분당 {(droneRate(save.drone) * 60).toFixed(0)} 귓밥 · 최대 {Math.round(DRONE_CAP_SEC / 60)}분 적재 ({cap.toLocaleString()})
              </p>
              <Bar value={cap ? pending / cap : 0} color="bg-gradient-to-r from-amber-300 to-orange-400" className="mt-2" />
            </>
          )}
        </div>
        {save.drone > 0 && (
          <Btn
            variant="primary"
            disabled={pending <= 0}
            onClick={() => {
              const n = actions.collectDrone();
              if (n > 0) {
                synth.unlock();
                synth.coin(1);
                flash(`드론 수확 +${n} 귓밥!`, true);
              }
            }}
          >
            수확 <Wax n={pending} className="!text-amber-900" />
          </Btn>
        )}
      </Card>

      {/* Tools */}
      <section>
        <SectionTitle sub="extractorToolType">탐사 도구</SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {TOOL_ORDER.map((t) => {
            const def = TOOLS[t];
            const owned = save.ownedTools.includes(t);
            const equipped = save.extractorToolType === t;
            return (
              <Card key={t} className={cn('flex flex-col gap-2', equipped && owned && 'border-amber-300/70 bg-amber-300/10')}>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{def.emoji}</div>
                  <div>
                    <div className="text-lg font-bold leading-tight">{def.name}</div>
                    <div className="text-xs text-white/50">{def.en}</div>
                  </div>
                </div>
                <p className="flex-1 text-sm text-white/70">{def.desc}</p>
                <div className="grid grid-cols-3 gap-1 text-center text-[11px] text-white/60">
                  <div className="rounded-lg bg-black/30 p-1">
                    팁 <b className="text-white">{def.radius * 2}px</b>
                  </div>
                  <div className="rounded-lg bg-black/30 p-1">
                    출력 <b className="text-white">×{def.power}</b>
                  </div>
                  <div className="rounded-lg bg-black/30 p-1">
                    떨림 <b className="text-white">×{def.tremor}</b>
                  </div>
                </div>
                {owned ? (
                  <Btn variant={equipped ? 'ghost' : 'primary'} disabled={equipped} onClick={() => actions.equipTool(t)}>
                    {equipped ? '✔ 장착 중' : '장착하기'}
                  </Btn>
                ) : (
                  <Btn
                    variant="pink"
                    onClick={() => {
                      synth.unlock();
                      if (actions.buyTool(t)) {
                        synth.buy();
                        flash(`${def.name} 구입 완료!`, true);
                      } else {
                        synth.click();
                        flash('귓밥이 부족해요…', false);
                      }
                    }}
                  >
                    구입 <Wax n={def.cost} className="!text-rose-950" />
                  </Btn>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Upgrades */}
      <section>
        <SectionTitle sub="영구 강화">연구 & 업그레이드</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {UPGRADES.map((u) => {
            const lvl = getLevel(save, u.id);
            const maxed = lvl >= u.max;
            const cost = upgradeCost(u, lvl);
            const can = save.wax >= cost;
            return (
              <Card key={u.id} className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{u.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold">{u.name}</div>
                      <div className="text-xs text-amber-200">
                        Lv.{lvl} / {u.max}
                      </div>
                    </div>
                    <div className="text-xs text-white/60">{u.blurb}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: u.max }, (_, i) => (
                    <div key={i} className={cn('h-2 flex-1 rounded-full', i < lvl ? 'bg-amber-400' : 'bg-black/40')} />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-white/80">
                    {u.effect(lvl)}
                    {!maxed && <span className="text-emerald-300"> → {u.effect(lvl + 1)}</span>}
                  </div>
                  <Btn
                    variant={can ? 'primary' : 'ghost'}
                    disabled={maxed}
                    className="shrink-0 !px-3 !py-1.5 text-sm"
                    onClick={() => {
                      synth.unlock();
                      if (actions.buyUpgrade(u.id)) {
                        synth.buy();
                        flash(`${u.name} 강화 완료!`, true);
                      } else {
                        synth.click();
                        flash('귓밥이 부족해요…', false);
                      }
                    }}
                  >
                    {maxed ? 'MAX' : (
                      <>
                        {u.id === 'drone' && lvl === 0 ? '설치' : '강화'} <Wax n={cost} size={14} className={can ? '!text-amber-900' : ''} />
                      </>
                    )}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section>
        <SectionTitle>광산 통계</SectionTitle>
        <Card>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            {[
              ['누적 귓밥 수익', save.totalWax.toLocaleString()],
              ['출격 횟수', save.runs.toLocaleString()],
              ['적출한 덩어리', save.totalExtracted.toLocaleString()],
              ['탐사 진행', `${save.stageCleared}/${STAGE_COUNT}`],
              ['보스 처치', save.bossDefeated ? '완료 ✔' : '미처치'],
              ['무한 최고 깊이', `Lv.${save.bestDepth}`],
              ['고막 보호막', `Lv.${save.tympanicSensitivity}`],
              ['해금한 귀', `${save.unlockedEars.length}/4`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-black/25 p-3">
                <div className="text-xs text-white/50">{k}</div>
                <div className="text-lg font-bold text-amber-200">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            {confirmReset ? (
              <span className="inline-flex items-center gap-2 text-sm">
                정말 초기화할까요?
                <Btn variant="danger" className="!px-3 !py-1" onClick={() => { actions.reset(); setConfirmReset(false); }}>
                  초기화
                </Btn>
                <Btn variant="ghost" className="!px-3 !py-1" onClick={() => setConfirmReset(false)}>
                  취소
                </Btn>
              </span>
            ) : (
              <button className="text-xs text-white/40 underline" onClick={() => setConfirmReset(true)}>
                세이브 데이터 초기화
              </button>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
