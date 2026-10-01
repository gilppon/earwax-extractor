import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';
import { EARS } from '../game/config';
import type { EarId } from '../game/types';

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;

export function WaxDot({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <defs>
        <radialGradient id="wd" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff0a0" />
          <stop offset="1" stopColor="#d89a1e" />
        </radialGradient>
      </defs>
      <path
        d="M16 3c6 0 12 4 12 11s-4 14-12 14S4 22 4 15 10 3 16 3z"
        fill="url(#wd)"
        stroke="#8a5a0c"
        strokeWidth="2"
      />
      <ellipse cx="11" cy="10" rx="3.5" ry="2" fill="#fff" opacity="0.6" />
    </svg>
  );
}

export function Wax({ n, className, size = 16 }: { n: number; className?: string; size?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-1 font-bold text-amber-300', className)}>
      <WaxDot size={size} />
      {n.toLocaleString('en-US')}
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm', className)}>
      {children}
    </div>
  );
}

type Variant = 'primary' | 'pink' | 'ghost' | 'danger' | 'dark';

export function Btn({
  variant = 'primary',
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary:
      'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-[0_4px_0_#9a5b00] active:translate-y-[2px] active:shadow-[0_2px_0_#9a5b00]',
    pink: 'bg-gradient-to-b from-rose-300 to-rose-500 text-rose-950 shadow-[0_4px_0_#9f1239] active:translate-y-[2px] active:shadow-[0_2px_0_#9f1239]',
    danger:
      'bg-gradient-to-b from-red-400 to-red-600 text-white shadow-[0_4px_0_#7f1d1d] active:translate-y-[2px] active:shadow-[0_2px_0_#7f1d1d]',
    ghost: 'bg-white/10 text-white hover:bg-white/20 border border-white/15',
    dark: 'bg-black/40 text-white hover:bg-black/55 border border-white/10',
  };
  return (
    <button
      {...rest}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-bold transition-all duration-100 select-none',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0',
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Bar({
  value,
  color = 'bg-amber-400',
  className,
  height = 'h-3',
}: {
  value: number;
  color?: string;
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-black/45 ring-1 ring-white/10', height, className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-150', color)}
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
      />
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-xl font-bold tracking-wide text-amber-200">{children}</h2>
      {sub && <div className="text-sm text-white/60">{sub}</div>}
    </div>
  );
}

export function EarAvatar({ ear, size = 64, locked }: { ear: EarId; size?: number; locked?: boolean }) {
  const p = EARS[ear].palette;
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full ring-4 ring-black/30"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, ${hex(p.skin)}, ${hex(p.skinDark)})`,
        fontSize: size * 0.52,
      }}
    >
      <span className={locked ? 'opacity-40 grayscale' : ''}>{EARS[ear].emoji}</span>
      {locked && <span className="absolute -bottom-1 -right-1 text-base">🔒</span>}
    </div>
  );
}

export function HeroCanal() {
  return (
    <svg viewBox="0 0 640 170" className="h-auto w-full drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="hc-canal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d1f2f" />
          <stop offset="0.5" stopColor="#f2a59d" />
          <stop offset="1" stopColor="#6d1f2f" />
        </linearGradient>
        <radialGradient id="hc-wax" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff0a0" />
          <stop offset="1" stopColor="#c98a1c" />
        </radialGradient>
        <clipPath id="hc-clip">
          <rect width="640" height="170" rx="26" />
        </clipPath>
      </defs>
      <g clipPath="url(#hc-clip)">
        <rect width="640" height="170" fill="#7c4230" />
        <circle cx="90" cy="30" r="60" fill="#8f5238" opacity="0.5" />
        <circle cx="500" cy="150" r="80" fill="#8f5238" opacity="0.45" />
        <path
          d="M-10 26 C 110 12, 200 44, 320 52 S 520 30, 606 46 L 606 126 C 520 142, 420 122, 320 124 S 110 162, -10 148 Z"
          fill="url(#hc-canal)"
          stroke="#4b1420"
          strokeWidth="5"
        />
        <ellipse cx="606" cy="86" rx="13" ry="42" fill="#f0dcd6" stroke="#a46f6b" strokeWidth="3" />
        <line x1="602" y1="62" x2="601" y2="92" stroke="#c7a29a" strokeWidth="5" strokeLinecap="round" />
        {/* wax lumps */}
        <ellipse cx="236" cy="118" rx="19" ry="16" fill="url(#hc-wax)" stroke="#8a5a0c" strokeWidth="2" />
        <ellipse cx="380" cy="56" rx="15" ry="13" fill="url(#hc-wax)" stroke="#8a5a0c" strokeWidth="2" />
        <ellipse cx="470" cy="112" rx="22" ry="17" fill="url(#hc-wax)" stroke="#8a5a0c" strokeWidth="2" />
        <ellipse cx="540" cy="60" rx="13" ry="11" fill="#ffd23f" stroke="#a87400" strokeWidth="2" />
        <path d="M545 55l2 -5 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2z" fill="#fff" />
        {/* hairs */}
        <path d="M300 56 q 6 22 -4 34" stroke="#3b2418" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M312 56 q 10 16 4 28" stroke="#3b2418" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M420 120 q -8 -20 2 -32" stroke="#3b2418" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* swab */}
        <g className="hero-swab">
          <line x1="-150" y1="92" x2="100" y2="88" stroke="#5f4d31" strokeWidth="11" strokeLinecap="round" />
          <line x1="-150" y1="92" x2="100" y2="88" stroke="#f5ecd8" strokeWidth="7" strokeLinecap="round" />
          <circle cx="112" cy="88" r="17" fill="#d9d3c8" />
          <circle cx="107" cy="82" r="12" fill="#fff" />
          <circle cx="107" cy="95" r="12" fill="#fff" />
          <circle cx="118" cy="88" r="12" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}
