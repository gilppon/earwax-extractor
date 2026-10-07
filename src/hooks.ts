import { useEffect, useState } from 'react';

export type Tab = 'mission' | 'lab' | 'ears' | 'rank';

function hasTouchInput() {
  if (typeof window === 'undefined') return false;
  return (
    navigator.maxTouchPoints > 0 ||
    window.matchMedia?.('(pointer: coarse)').matches === true ||
    window.matchMedia?.('(any-pointer: coarse)').matches === true
  );
}

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function useIsTouch() {
  const [touch, setTouch] = useState(hasTouchInput);
  useEffect(() => {
    const queries = ['(pointer: coarse)', '(any-pointer: coarse)']
      .map((query) => window.matchMedia?.(query))
      .filter((query): query is MediaQueryList => !!query);
    const update = () => setTouch(hasTouchInput());
    queries.forEach((query) => query.addEventListener('change', update));
    return () => queries.forEach((query) => query.removeEventListener('change', update));
  }, []);
  return touch;
}

export function usePortrait() {
  const [p, setP] = useState(() => typeof window !== 'undefined' && window.innerHeight > window.innerWidth);
  useEffect(() => {
    const fn = () => setP(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return p;
}

export function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
