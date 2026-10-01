import type { GameMode, ScoreEntry } from './types';

// Local leaderboard with a few rival miners so the board is never empty.

const RIVALS: Record<GameMode, [string, number][]> = {
  ENDLESS: [
    ['Wax King Kevin', 30000],
    ['Swab Sage', 21000],
    ['Eardrum Guardian', 14500],
    ['Q-tip Queen', 9800],
    ['Alien Barber', 6500],
    ['Earpick Artisan', 4200],
    ['Rookie Miner', 2400],
    ['Local ENT Clinic', 1100],
  ],
  STAGE: [
    ['Box Sniper', 5600],
    ['Breath-Hold Master', 4300],
    ['Fur Forest Explorer', 3300],
    ['Tweezer Artisan', 2500],
    ['Miner of the Deep', 1800],
    ['Cotton Ball Collector', 1200],
    ['Shaky Kevin', 800],
    ['Acute Sneeze', 400],
  ],
  BOSS: [
    ['Lime Breaker', 9000],
    ['Vibration Wizard', 7200],
    ['Eardrum Keeper', 5800],
    ['Master Tweezer', 4600],
    ['Crack Specialist', 3500],
    ['Boss Hunter', 2700],
    ['Fearless Intern', 2000],
    ['Ear-Cleaning Apprentice', 1400],
  ],
};

export function seedBoards(): Record<GameMode, ScoreEntry[]> {
  const make = (m: GameMode): ScoreEntry[] =>
    RIVALS[m].map(([name, score]) => ({ name, score, date: 0, rival: true }));
  return { ENDLESS: make('ENDLESS'), STAGE: make('STAGE'), BOSS: make('BOSS') };
}

export function insertScore(
  list: ScoreEntry[],
  entry: ScoreEntry,
  max = 10,
): { list: ScoreEntry[]; rank: number } {
  const next = [...list, entry].sort((a, b) => b.score - a.score || b.date - a.date);
  const idx = next.indexOf(entry);
  const trimmed = next.slice(0, max);
  return { list: trimmed, rank: idx < max ? idx + 1 : -1 };
}
