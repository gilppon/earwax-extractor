// Poki ad adapter; retain a mock only for off-portal development.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { synth } from './AsmrSynth';

declare global {
  interface Window {
    PokiSDK?: any;
  }
}

export type AdKind = 'commercial' | 'rewarded';
type AdUI = (kind: AdKind, done: (ok: boolean) => void) => void;

const POKI_URL = 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js';

let adUI: AdUI | null = null;
let provider: 'poki' | null = null;
let ready = false;
let initPromise: Promise<void> | null = null;
let loadingFinishedSent = false;
let gameplayRequested = false;
let gameplayActive = false;

export function registerAdUI(fn: AdUI | null) {
  adUI = fn;
}

function env(): 'poki' | null {
  try {
    const host = window.location.hostname;
    const q = window.location.search;
    if (/poki(-gdn)?\.com$/.test(host) || q.includes('poki')) return 'poki';
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
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(fallback), ms);
    p.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
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
        }
      } catch {
        provider = null;
      }
      ready = true;
    })();
    // Script loading and SDK init each have their own timeout. Await both so loadingFinished cannot race ahead of ready.
    return initPromise;
  },

  loadingFinished() {
    if (!ready || loadingFinishedSent) return;
    try {
      if (provider === 'poki') window.PokiSDK?.gameLoadingFinished?.();
    } catch {
      /* ignore */
    }
    loadingFinishedSent = true;
    if (gameplayRequested) this.gameplayStart();
  },

  gameplayStart() {
    gameplayRequested = true;
    if (!ready || !loadingFinishedSent || gameplayActive || !provider) return;
    try {
      if (provider === 'poki') window.PokiSDK?.gameplayStart?.();
      gameplayActive = true;
    } catch {
      /* ignore */
    }
  },

  gameplayStop() {
    gameplayRequested = false;
    if (!ready || !loadingFinishedSent || !gameplayActive || !provider) return;
    try {
      if (provider === 'poki') window.PokiSDK?.gameplayStop?.();
    } catch {
      /* ignore */
    } finally {
      gameplayActive = false;
    }
  },

  async commercialBreak(): Promise<void> {
    if (provider === 'poki' && ready) {
      try {
        await window.PokiSDK.commercialBreak(() => synth.setAdMuted(true));
      } catch {
        /* ignore */
      } finally {
        synth.setAdMuted(false);
      }
      return;
    }
    // Only simulate commercial breaks in development. Never show a fake ad on a portal page.
    if (env() !== null || !adUI) return;
    synth.setAdMuted(true);
    try {
      await new Promise<void>((resolve) => adUI!('commercial', () => resolve()));
    } finally {
      synth.setAdMuted(false);
    }
  },

  async rewardedBreak(): Promise<boolean> {
    if (provider === 'poki' && ready) {
      try {
        return Boolean(await window.PokiSDK.rewardedBreak(() => synth.setAdMuted(true)));
      } catch {
        return false;
      } finally {
        synth.setAdMuted(false);
      }
    }
    // Never replace a failed or unavailable portal ad with a simulated reward.
    // Keep the mock ad only for ordinary off-portal development.
    if (env() !== null || !adUI) return false;
    synth.setAdMuted(true);
    try {
      return await new Promise<boolean>((resolve) => adUI!('rewarded', (ok) => resolve(ok)));
    } finally {
      synth.setAdMuted(false);
    }
  },
};

export const initPoki = () => Poki.init();
export const pokiGameplayStart = () => Poki.gameplayStart();
export const pokiGameplayStop = () => Poki.gameplayStop();
export const pokiRewarded = async (): Promise<boolean> => Poki.rewardedBreak();

/** Rewarded ad (used directly from the _play screen) */
export const rewardedBreak = async (): Promise<boolean> => Poki.rewardedBreak();
/** Interstitial ad */
export const commercialBreak = async (): Promise<void> => Poki.commercialBreak();
