import type { GameMode, ScoreEntry } from './types';

// Local leaderboard with a few rival miners so the board is never empty.

const RIVALS: Record<GameMode, [string, number][]> = {
  ENDLESS: [
    ['귓밥왕 김철수', 30000],
    ['면봉의 신', 21000],
    ['고막수호대장', 14500],
    ['Q-tip Queen', 9800],
    ['외계인 이발사', 6500],
    ['귀이개 장인', 4200],
    ['초보 광부', 2400],
    ['동네 이비인후과', 1100],
  ],
  STAGE: [
    ['정밀타격 박스나이퍼', 5600],
    ['숨참기 마스터', 4300],
    ['털숲 탐험가', 3300],
    ['집게손 장인', 2500],
    ['귓속의 광부', 1800],
    ['솜뭉치 수집가', 1200],
    ['손 떨리는 김대리', 800],
    ['급성 재채기', 400],
  ],
  BOSS: [
    ['석회 파괴자', 9000],
    ['진동의 마술사', 7200],
    ['고막 지킴이', 5800],
    ['미세집게 명인', 4600],
    ['균열 전문가', 3500],
    ['보스 사냥꾼', 2700],
    ['겁 없는 인턴', 2000],
    ['귀 청소 견습생', 1400],
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
