// portal ad adapter (Poki / CrazyGames / auto-fallback to mock)
// On failure or when blocked, a timeout fallback keeps the game from stalling.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { synth } from './AsmrSynth';

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
    // full init also gets an 8s timeout (prevents a hang when ads are blocked)
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
        await withTimeout(
          window.PokiSDK.commercialBreak(() => synth.setAdMuted(true)),
          10000,
          undefined,
        );
      } catch {
        /* ignore */
      } finally {
        synth.setAdMuted(false);
      }
      return;
    }
    if (provider === 'crazy' && ready) {
      try {
        await withTimeout(
          window.CrazyGames?.SDK?.ad?.requestAd('midgame', {
            adStarted: () => synth.setAdMuted(true),
            adFinished: () => synth.setAdMuted(false),
            adError: () => synth.setAdMuted(false),
          }),
          10000,
          undefined,
        );
      } catch {
        /* ignore */
      } finally {
        synth.setAdMuted(false);
      }
      return;
    }
    if (!adUI) return;
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
        return Boolean(
          await withTimeout(
            window.PokiSDK.rewardedBreak({ onStart: () => synth.setAdMuted(true) }),
            15000,
            false,
          ),
        );
      } catch {
        return false;
      } finally {
        synth.setAdMuted(false);
      }
    }
    if (provider === 'crazy' && ready) {
      try {
        let ok = false;
        await withTimeout(
          window.CrazyGames?.SDK?.ad?.requestAd('rewarded', {
            adStarted: () => synth.setAdMuted(true),
            adFinished: () => {
              synth.setAdMuted(false);
              ok = true;
            },
            adError: () => {
              synth.setAdMuted(false);
              ok = false;
            },
          }),
          20000,
          undefined,
        );
        return ok;
      } catch {
        return false;
      } finally {
        synth.setAdMuted(false);
      }
    }
    if (!adUI) return true;
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
