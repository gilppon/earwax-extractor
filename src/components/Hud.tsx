import { TOOLS } from '../game/config';
import type { HudState, RunConfig } from '../game/types';
import { fmtTime } from '../hooks';
import { cn } from '../utils/cn';
import { Bar, WaxDot } from './ui';

interface Props {
  hud: HudState | null;
  run: RunConfig;
  onPause: () => void;
}

export function Hud({ hud, run, onPause }: Props) {
  if (!hud) return null;
  const hpColor = hud.drumHp > 60 ? 'bg-emerald-400' : hud.drumHp > 30 ? 'bg-amber-400' : 'bg-red-500';
  const tool = TOOLS[hud.tool];

  return (
    <>
      <div className="absolute inset-x-0 top-0 z-10 flex h-[52px] items-center gap-2 border-b border-white/10 bg-black/70 px-2 backdrop-blur sm:gap-3 sm:px-3">
        {/* score */}
        <div className="shrink-0 leading-tight">
          <div className="text-sm font-bold text-white sm:text-base">⭐ {hud.score.toLocaleString('en-US')}</div>
          <div className="flex items-center gap-1 text-xs text-amber-300">
            <WaxDot size={12} /> {hud.wax.toLocaleString('en-US')}
          </div>
        </div>

        {hud.combo > 1 && (
          <div className="shrink-0 rounded-full bg-orange-500/90 px-2 py-0.5 text-xs font-bold text-white sm:text-sm">
            🔥 {hud.combo}x combo ×{hud.comboMult.toFixed(2)}
          </div>
        )}

        {/* eardrum */}
        <div key={hud.hitFlash} className={cn('min-w-[90px] flex-1', hud.hitFlash > 0 && 'animate-hit')}>
          <div className="flex items-center justify-between text-[11px] leading-none text-white/80 sm:text-xs">
            <span>👂 Eardrum</span>
            <span className={cn('font-bold', hud.drumHp <= 30 && 'text-red-400')}>{Math.ceil(hud.drumHp)}%</span>
          </div>
          <Bar value={hud.drumHp / 100} color={hpColor} height="h-3.5" className="mt-1" />
        </div>

        {/* mode info */}
        <div className="hidden shrink-0 items-center gap-2 text-xs sm:flex sm:text-sm">
          {run.mode === 'STAGE' && (
            <>
<span className="rounded-lg bg-white/10 px-2 py-1">
                Chunks <b className="text-amber-300">{hud.extracted}</b>/{hud.target}
              </span>
              <span className="rounded-lg bg-white/10 px-2 py-1">⏱ {fmtTime(hud.time)}</span>
            </>
          )}
          {run.mode === 'ENDLESS' && (
            <>
              <span className="rounded-lg bg-white/10 px-2 py-1">
                Depth <b className="text-rose-300">Lv.{hud.depth}</b>
              </span>
              <span className="rounded-lg bg-white/10 px-2 py-1">⏱ {fmtTime(hud.time)}</span>
              <div className="w-24">
                <div className="flex justify-between text-[10px] text-white/70">
                  <span>Clog</span>
                  <span className={cn(hud.clog > 0.8 && 'font-bold text-red-400')}>{Math.round(hud.clog * 100)}%</span>
                </div>
                <Bar value={hud.clog} color={hud.clog > 0.8 ? 'bg-red-500' : 'bg-orange-400'} height="h-2" />
              </div>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-base"
                title="Owner wobble (gravity direction)"
              >
                <span style={{ transform: `rotate(${(-hud.gravAngle * 180) / Math.PI}deg)`, display: 'inline-block' }}>⬇️</span>
              </div>
            </>
          )}
          {run.mode === 'BOSS' && (
            <>
              <div className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1">
                Cracks
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn('h-3 w-5 rounded-sm', i < hud.cracks ? 'bg-orange-400' : 'bg-black/50 ring-1 ring-white/20')}
                  />
                ))}
              </div>
              <span className="rounded-lg bg-white/10 px-2 py-1">
                {hud.phase === 'CRACK' ? 'Phase 1: Buzz' : `Phase 2: Pull ${hud.extracted}/3`}
              </span>
              <span className="rounded-lg bg-white/10 px-2 py-1">⏱ {fmtTime(hud.time)}</span>
            </>
          )}
        </div>

        <button
          onClick={onPause}
          className="pointer-events-auto ml-auto shrink-0 rounded-xl bg-white/15 px-3 py-1.5 text-base font-bold hover:bg-white/25 sm:ml-0"
          aria-label="Pause"
        >
          ⏸
        </button>
      </div>

      {/* mobile-only compact mode info */}
      <div className="pointer-events-none absolute left-2 top-[58px] z-10 flex flex-wrap gap-1.5 text-xs sm:hidden">
        {run.mode === 'STAGE' && (
          <span className="rounded-lg bg-black/60 px-2 py-1">
            Chunks <b className="text-amber-300">{hud.extracted}</b>/{hud.target}
          </span>
        )}
        {run.mode === 'ENDLESS' && (
          <>
            <span className="rounded-lg bg-black/60 px-2 py-1">Depth Lv.{hud.depth}</span>
            <span className="rounded-lg bg-black/60 px-2 py-1">Clog {Math.round(hud.clog * 100)}%</span>
          </>
        )}
        {run.mode === 'BOSS' && (
          <span className="rounded-lg bg-black/60 px-2 py-1">
            Cracks {hud.cracks}/3 · {hud.phase === 'CRACK' ? 'Buzz' : `Pull ${hud.extracted}/3`}
          </span>
        )}
      </div>

      {/* bottom-left gauges */}
      <div className="pointer-events-none absolute bottom-2 left-2 z-10 w-44 space-y-1.5 rounded-xl bg-black/55 p-2 backdrop-blur sm:w-56">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-200">
            {tool.emoji} {tool.name}
          </span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-sky-200">
            <span>💨 Hold breath (Shift / Right-click)</span>
            <span>{hud.breathLocked ? 'panting…' : ''}</span>
          </div>
          <Bar value={hud.breath} color={hud.breathLocked ? 'bg-slate-400' : 'bg-sky-400'} height="h-2" />
        </div>
        {hud.tool === 'SONIC_VACUUM' && (
          <div>
            <div className="text-[10px] text-cyan-200">🌀 Suction power</div>
            <Bar value={hud.energy} color="bg-cyan-300" height="h-2" />
          </div>
        )}
        {hud.tool === 'VIBRATOR' && (
          <div>
            <div className="text-[10px] text-orange-200">📳 Vibration (hold still!)</div>
            <Bar value={hud.charge} color="bg-orange-400" height="h-2" />
          </div>
        )}
        {hud.sneeze > 0.03 && (
          <div>
            <div className="text-[10px] text-yellow-200">🤧 Ticklish</div>
            <Bar value={hud.sneeze} color="bg-yellow-300" height="h-2" />
          </div>
        )}
      </div>

      {hud.warn && (
        <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 -translate-x-1/2 animate-warn rounded-full bg-yellow-300 px-5 py-2 text-base font-bold text-yellow-950 shadow-lg sm:text-lg">
          ⚠ Sneeze incoming! Hold your breath!
        </div>
      )}
    </>
  );
}
