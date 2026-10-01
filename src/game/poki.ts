// 포털 광고 통합 어댑터 (Poki / CrazyGames / 모의 자동 전환)
// 실패·차단 시 타임아웃 폴백으로 게임이 멈추지 않음.
/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    PokiSDK?: any;
    CrazyGames?: any;
  }
}

export type AdKind = 'commercial' | 'rewarded';
type AdUI = (kind: AdKind, done: (ok: boolean) => void) => void;

const POKI_URL = 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js';
const CRAZY_URL = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';

let adUI: AdUI | null = null;
let provider: 'poki' | 'crazy' | null = null;
let ready = false;
let initPromise: Promise<void> | null = null;

export function registerAdUI(fn: AdUI | null) {
  adUI = fn;
}

function env(): 'poki' | 'crazy' | null {
  try {
    const host = window.location.hostname;
    const q = window.location.search;
    if (/poki(-gdn)?\.com$/.test(host) || q.includes('poki')) return 'poki';
    if (/(^|\.)crazygames\.com$/.test(host) || q.includes('crazy')) return 'crazy';
  } catch {
    /* ignore */
  }
  return null;
}

function loadScript(src: string, timeout = 4000): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    const timer = window.setTimeout(() => reject(new Error('sdk timeout')), timeout);
    s.src = src;
    s.async = true;
    s.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    s.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error('sdk load error'));
    };
    document.head.appendChild(s);
  });
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), ms))]);
}

export const Poki = {
  get isReal() {
    return provider !== null;
  },

  init(): Promise<void> {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const e = env();
      try {
        if (e === 'poki') {
          await withTimeout(loadScript(POKI_URL), 5000, undefined as never).catch(() => {});
          await withTimeout(window.PokiSDK?.init() ?? Promise.resolve(), 5000, undefined);
          if (window.PokiSDK) provider = 'poki';
        } else if (e === 'crazy') {
          await withTimeout(loadScript(CRAZY_URL), 5000, undefined as never).catch(() => {});
          await withTimeout(window.CrazyGames?.SDK?.init() ?? Promise.resolve(), 5000, undefined);
          if (window.CrazyGames?.SDK) {
            provider = 'crazy';
            try {
              window.CrazyGames.SDK.game.loadingStart();
            } catch {
              /* ignore */
            }
          }
        }
      } catch {
        provider = null;
      }
      ready = true;
    })();
    // 전체 초기화도 8초 타임아웃 (광고 차단 환경에서 게임 멈춤 방지)
    return withTimeout(initPromise, 8000, undefined);
  },

  loadingFinished() {
    if (!ready) return;
    try {
      if (provider === 'poki') window.PokiSDK?.gameLoadingFinished?.();
      else if (provider === 'crazy') window.CrazyGames?.SDK?.game?.loadingStop();
    } catch {
      /* ignore */
    }
  },

  gameplayStart() {
    if (!ready) return;
    try {
      if (provider === 'poki') window.PokiSDK?.gameplayStart?.();
      else if (provider === 'crazy') window.CrazyGames?.SDK?.game?.gameplayStart();
    } catch {
      /* ignore */
    }
  },

  gameplayStop() {
    if (!ready) return;
    try {
      if (provider === 'poki') window.PokiSDK?.gameplayStop?.();
      else if (provider === 'crazy') window.CrazyGames?.SDK?.game?.gameplayStop();
    } catch {
      /* ignore */
    }
  },

  async commercialBreak(): Promise<void> {
    if (provider === 'poki' && ready) {
      try {
        await withTimeout(window.PokiSDK.commercialBreak(), 10000, undefined);
      } catch {
        /* 무시 */
      }
      return;
    }
    if (provider === 'crazy' && ready) {
      try {
        await withTimeout(
          window.CrazyGames?.SDK?.ad?.requestAd('midgame', { adStarted: () => {}, adFinished: () => {}, adError: () => {} }),
          10000,
          undefined,
        );
      } catch {
        /* 무시 */
      }
      return;
    }
    if (!adUI) return;
    await new Promise<void>((resolve) => adUI!('commercial', () => resolve()));
  },

  async rewardedBreak(): Promise<boolean> {
    if (provider === 'poki' && ready) {
      try {
        return Boolean(await withTimeout(window.PokiSDK.rewardedBreak(), 15000, false));
      } catch {
        return false;
      }
    }
    if (provider === 'crazy' && ready) {
      try {
        let ok = false;
        await withTimeout(
          window.CrazyGames?.SDK?.ad?.requestAd('rewarded', {
            adStarted: () => {},
            adFinished: () => {
              ok = true;
            },
            adError: () => {
              ok = false;
            },
          }),
          20000,
          undefined,
        );
        return ok;
      } catch {
        return false;
      }
    }
    if (!adUI) return true;
    return new Promise<boolean>((resolve) => adUI!('rewarded', (ok) => resolve(ok)));
  },
};

export const initPoki = () => Poki.init();
export const pokiGameplayStart = () => Poki.gameplayStart();
export const pokiGameplayStop = () => Poki.gameplayStop();
export const pokiRewarded = async (): Promise<boolean> => Poki.rewardedBreak();

/** 보상형 광고 (_play 화면에서 직접 사용) */
export const rewardedBreak = async (): Promise<boolean> => Poki.rewardedBreak();
/** 전면 광고 */
export const commercialBreak = async (): Promise<void> => Poki.commercialBreak();
