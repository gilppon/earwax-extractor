import { useEffect, useState } from 'react';

export type Tab = 'mission' | 'lab' | 'ears' | 'rank';

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function useIsTouch() {
  const [touch, setTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(pointer: coarse)');
    if (!mq) return;
    const fn = () => setTouch(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
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
