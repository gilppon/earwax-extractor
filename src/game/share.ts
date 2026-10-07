import { EARS, STAGE_COUNT } from './config';
import type { GameMode, RunResult } from './types';

export interface EarwaxChallenge {
  mode: GameMode;
  stage: number;
  ear: RunResult['ear'];
  score: number;
  extracted: number;
  maxCombo: number;
}

function param(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  const sdk = window.PokiSDK as unknown as { getURLParam?: (name: string) => string | null } | undefined;
  return sdk?.getURLParam?.(key) || params.get(key) || params.get(`gd${key}`);
}

export function readEarwaxChallenge(): EarwaxChallenge | null {
  if (param('type') !== 'earwax_challenge') return null;
  const mode = param('mode');
  const stage = Number(param('stage'));
  const ear = param('ear');
  if (mode !== 'STAGE' && mode !== 'ENDLESS' && mode !== 'BOSS') return null;
  if (!Number.isInteger(stage) || stage < 1 || stage > STAGE_COUNT) return null;
  if (!ear || !Object.prototype.hasOwnProperty.call(EARS, ear)) return null;
  const numeric = (key: string) => {
    const value = Number(param(key));
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  };
  return { mode, stage, ear: ear as RunResult['ear'], score: numeric('score'), extracted: numeric('extracted'), maxCombo: numeric('combo') };
}

export async function createEarwaxShareUrl(result: RunResult): Promise<string> {
  const params = {
    type: 'earwax_challenge',
    mode: result.mode,
    stage: String(result.stage),
    ear: result.ear,
    score: String(result.score),
    extracted: String(result.extracted),
    combo: String(result.maxCombo),
  };
  const sdk = window.PokiSDK as unknown as { shareableURL?: (values: Record<string, string>) => Promise<string> } | undefined;
  try {
    const url = await sdk?.shareableURL?.(params);
    if (url) return url;
  } catch {
    // Keep the result challenge usable in local and non-Poki builds.
  }
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}
