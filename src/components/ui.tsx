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
    <svg viewBox="0 0 640 170" className="h-auto w-full drop-shadow-[0_10px_24px_rgba(244,114,182,0.3)]">
      <defs>
        <linearGradient id="hc-canal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="0.3" stopColor="#fbcfe8" />
          <stop offset="0.5" stopColor="#fff1f2" />
          <stop offset="0.7" stopColor="#fbcfe8" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <radialGradient id="hc-wax" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="0.2" stopColor="#fef08a" />
          <stop offset="0.7" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
        <clipPath id="hc-clip">
          <rect width="640" height="170" rx="26" />
        </clipPath>
      </defs>
      <g clipPath="url(#hc-clip)">
        {/* Soft Peach Skin Background */}
        <rect width="640" height="170" fill="#ffdfba" />
        <circle cx="90" cy="30" r="60" fill="#fed7aa" opacity="0.6" />
        <circle cx="500" cy="150" r="80" fill="#fed7aa" opacity="0.6" />
        
        {/* Candy Pink Jelly Tunnel */}
        <path
          d="M-10 26 C 110 12, 200 44, 320 52 S 520 30, 606 46 L 606 126 C 520 142, 420 122, 320 124 S 110 162, -10 148 Z"
          fill="url(#hc-canal)"
          stroke="#fb7185"
          strokeWidth="6"
        />
        
        {/* Clean Shampoo Bubbles in Tunnel */}
        <circle cx="160" cy="85" r="9" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
        <circle cx="163" cy="82" r="3" fill="#ffffff" opacity="0.7" />
        <circle cx="280" cy="70" r="14" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.5" />
        <circle cx="284" cy="65" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="360" cy="98" r="11" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
        <circle cx="430" cy="68" r="8" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />

        {/* Jelly Eardrum with Neon Cyan Elastic Ring */}
        <ellipse cx="606" cy="86" rx="14" ry="42" fill="#fb7185" stroke="#38bdf8" strokeWidth="4" />
        <ellipse cx="604" cy="86" rx="9" ry="34" fill="#f43f5e" opacity="0.7" />
        <line x1="602" y1="62" x2="601" y2="92" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        
        {/* Golden Honey Jelly Wax Lumps with Pure White Glare */}
        <ellipse cx="236" cy="118" rx="20" ry="17" fill="url(#hc-wax)" stroke="#d97706" strokeWidth="2.5" />
        <ellipse cx="232" cy="113" rx="7" ry="5" fill="#ffffff" opacity="0.9" />

        <ellipse cx="380" cy="56" rx="16" ry="14" fill="url(#hc-wax)" stroke="#d97706" strokeWidth="2.5" />
        <ellipse cx="376" cy="52" rx="5" ry="4" fill="#ffffff" opacity="0.9" />

        <ellipse cx="470" cy="112" rx="23" ry="18" fill="url(#hc-wax)" stroke="#d97706" strokeWidth="2.5" />
        <ellipse cx="465" cy="107" rx="8" ry="6" fill="#ffffff" opacity="0.9" />

        <ellipse cx="540" cy="60" rx="14" ry="12" fill="url(#hc-wax)" stroke="#d97706" strokeWidth="2" />
        <ellipse cx="537" cy="57" rx="4" ry="3" fill="#ffffff" opacity="0.9" />
        <path d="M545 55l2 -5 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2z" fill="#ffffff" />
        
        {/* Cute Soft Curls */}
        <path d="M300 56 q 6 18 -4 28" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M420 120 q -8 -16 2 -26" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
        
        {/* Mint Candy Swab with Soft White Cloud Tip */}
        <g className="hero-swab">
          <line x1="-150" y1="92" x2="100" y2="88" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" />
          <line x1="-150" y1="90" x2="100" y2="86" stroke="#bae6fd" strokeWidth="4" strokeLinecap="round" />
          {/* Cloud cotton puffs */}
          <circle cx="112" cy="88" r="18" fill="#fbcfe8" opacity="0.7" />
          <circle cx="112" cy="88" r="16" fill="#ffffff" />
          <circle cx="104" cy="81" r="12" fill="#ffffff" />
          <circle cx="104" cy="95" r="12" fill="#ffffff" />
          <circle cx="120" cy="88" r="13" fill="#ffffff" />
          <circle cx="116" cy="84" r="5" fill="#f0fdf4" opacity="0.8" />
        </g>
      </g>
    </svg>
  );
}
