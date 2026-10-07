import { useSyncExternalStore } from 'react';
import {
  DRONE_CAP_SEC,
  EARS,
  STAGE_COUNT,
  TOOLS,
  UPGRADES,
  droneRate,
  upgradeCost,
  type UpgradeId,
} from './config';
import { insertScore, seedBoards } from './Leaderboard';
import type {
  EarId,
  EarwaxMinerData,
  GameMode,
  RunConfig,
  RunResult,
  ScoreEntry,
  ToolType,
} from './types';

// ─────────────────────────────────────────────────────────────
//  Meta-game store (Earwax Mining Corp.) — persisted in localStorage
// ─────────────────────────────────────────────────────────────

export interface SaveData extends EarwaxMinerData {
  version: 1;
  wax: number;
  ownedTools: ToolType[];
  precision: number;
  power: number;
  lungs: number;
  drone: number;
  selectedEar: EarId;
  stageCleared: number;
  bossDefeated: boolean;
  totalExtracted: number;
  totalWax: number;
  runs: number;
  clears: number; // total stage/boss clears
  bestDepth: number;
  nickname: string;
  lastCollect: number;
  muted: boolean;
  boards: Record<GameMode, ScoreEntry[]>;
  lowFx: boolean; // low-spec effects mode
  lastDaily: number; // timestamp of the last daily-bonus claim
  dailyStreak: number; // check-in streak (1~7)
  claimedMilestones: number[]; // milestone thresholds already claimed
  tutorialDone: boolean; // first-run coach marks finished
}

const KEY = 'extreme-earwax-miner-v1';

// ── Daily bonus / milestone tables ──
const DAILY_WAX = [20, 30, 45, 60, 90, 130, 200];

type MilestoneKind = 'extracted' | 'wins' | 'boss' | 'stages';

interface Milestone {
  kind: MilestoneKind;
  at: number;
  wax: number;
  label: string;
  emoji: string;
}

export const MILESTONES: Milestone[] = [
  { kind: 'extracted', at: 30, wax: 60, emoji: '🧹', label: 'Extract 30 chunks' },
  { kind: 'extracted', at: 120, wax: 180, emoji: '🧹', label: 'Extract 120 chunks' },
  { kind: 'wins', at: 5, wax: 100, emoji: '🎉', label: 'Clear 5 runs' },
  { kind: 'wins', at: 20, wax: 350, emoji: '🎉', label: 'Clear 20 runs' },
  { kind: 'stages', at: 4, wax: 200, emoji: '🗺️', label: 'Reach STAGE 4' },
  { kind: 'stages', at: 8, wax: 600, emoji: '🏆', label: 'Clear STAGE 8' },
  { kind: 'stages', at: 12, wax: 1000, emoji: '🏆', label: 'Clear STAGE 12' },
  { kind: 'boss', at: 1, wax: 500, emoji: '🪨', label: 'Defeat the Lime Boulder Boss' },
];

function achieved(m: Milestone): boolean {
  switch (m.kind) {
    case 'extracted':
      return state.totalExtracted >= m.at;
    case 'wins':
      return state.clears >= m.at;
    case 'stages':
      return state.stageCleared >= m.at;
    case 'boss':
      return state.bossDefeated;
  }
}

function defaults(): SaveData {
  return {
    version: 1,
    extractorToolType: 'COTTON',
    tympanicSensitivity: 1,
    unlockedEars: ['HUMAN'],
    wax: 60,
    ownedTools: ['COTTON'],
    precision: 1,
    power: 1,
    lungs: 1,
    drone: 0,
    selectedEar: 'HUMAN',
    stageCleared: 0,
    bossDefeated: false,
    totalExtracted: 0,
    totalWax: 0,
    runs: 0,
    clears: 0,
    bestDepth: 1,
    nickname: 'Wax Rookie',
    lastCollect: Date.now(),
    muted: false,
    boards: seedBoards(),
    lowFx: false,
    lastDaily: 0,
    dailyStreak: 0,
    claimedMilestones: [],
    tutorialDone: false,
  };
}

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const base = defaults();
    const merged = { ...base, ...parsed } as SaveData;
    merged.boards = { ...base.boards, ...(parsed.boards ?? {}) };
    if (!merged.unlockedEars.includes('HUMAN')) merged.unlockedEars.push('HUMAN');
    if (!merged.ownedTools.includes('COTTON')) merged.ownedTools.push('COTTON');
    merged.claimedMilestones = Array.isArray(parsed.claimedMilestones)
      ? parsed.claimedMilestones.filter((v: unknown) => typeof v === 'number')
      : [];
    return merged;
  } catch {
    return defaults();
  }
}

let state: SaveData = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / blocked */
  }
}

function set(patch: Partial<SaveData>) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const getSave = () => state;
export const useSave = () => useSyncExternalStore(subscribe, getSave, getSave);

// ── helpers ─────────────────────────────────────────────────
export function getLevel(s: SaveData, id: UpgradeId): number {
  switch (id) {
    case 'precision':
      return s.precision;
    case 'sensitivity':
      return s.tympanicSensitivity;
    case 'power':
      return s.power;
    case 'lungs':
      return s.lungs;
    case 'drone':
      return s.drone;
  }
}

export function pendingDrone(s: SaveData, now = Date.now()) {
  if (s.drone <= 0) return 0;
  const sec = Math.min(DRONE_CAP_SEC, Math.max(0, (now - s.lastCollect) / 1000));
  return Math.floor(sec * droneRate(s.drone));
}

export function makeRunConfig(s: SaveData, mode: GameMode, stage: number): RunConfig {
  return {
    mode,
    stage,
    ear: s.selectedEar,
    tool: s.ownedTools.includes(s.extractorToolType) ? s.extractorToolType : 'COTTON',
    precision: s.precision,
    power: s.power,
    sensitivity: s.tympanicSensitivity,
    lungs: s.lungs,
    firstBoss: !s.bossDefeated,
  };
}

// ── actions ─────────────────────────────────────────────────
export const actions = {
  buyTool(t: ToolType): boolean {
    const s = state;
    const cost = TOOLS[t].cost;
    if (s.ownedTools.includes(t) || s.wax < cost) return false;
    set({ wax: s.wax - cost, ownedTools: [...s.ownedTools, t], extractorToolType: t });
    return true;
  },

  equipTool(t: ToolType) {
    if (state.ownedTools.includes(t)) set({ extractorToolType: t });
  },

  buyUpgrade(id: UpgradeId): boolean {
    const s = state;
    const def = UPGRADES.find((u) => u.id === id)!;
    const lvl = getLevel(s, id);
    if (lvl >= def.max) return false;
    const cost = upgradeCost(def, lvl);
    if (s.wax < cost) return false;
    const patch: Partial<SaveData> = { wax: s.wax - cost };
    if (id === 'precision') patch.precision = lvl + 1;
    if (id === 'sensitivity') patch.tympanicSensitivity = lvl + 1;
    if (id === 'power') patch.power = lvl + 1;
    if (id === 'lungs') patch.lungs = lvl + 1;
    if (id === 'drone') {
      // bank whatever the old drones already collected
      patch.wax = (patch.wax ?? 0) + pendingDrone(s);
      patch.lastCollect = Date.now();
      patch.drone = lvl + 1;
    }
    set(patch);
    return true;
  },

  unlockEar(id: EarId): boolean {
    const s = state;
    const cost = EARS[id].cost;
    if (s.unlockedEars.includes(id) || s.wax < cost) return false;
    set({ wax: s.wax - cost, unlockedEars: [...s.unlockedEars, id], selectedEar: id });
    return true;
  },

  selectEar(id: EarId) {
    if (state.unlockedEars.includes(id)) set({ selectedEar: id });
  },

  collectDrone(): number {
    const n = pendingDrone(state);
    if (n > 0) set({ wax: state.wax + n, totalWax: state.totalWax + n, lastCollect: Date.now() });
    return n;
  },

  /** 2× ad reward (once per result; the caller guards it) */
  doubleWax(amount: number) {
    if (amount > 0) set({ wax: state.wax + amount, totalWax: state.totalWax + amount });
  },

  /** Tutorial completion reward */
  bonusWax(amount: number) {
    if (amount > 0) set({ wax: state.wax + amount, totalWax: state.totalWax + amount });
  },

  finishRun(r: RunResult): { rank: number; newStage: boolean; newBoss: boolean } {
    const s = state;
    const patch: Partial<SaveData> = {
      wax: s.wax + r.wax,
      totalWax: s.totalWax + r.wax,
      totalExtracted: s.totalExtracted + r.extracted,
      runs: s.runs + 1,
      clears: s.clears + (r.cleared ? 1 : 0),
    };
    let newStage = false;
    let newBoss = false;
    if (r.mode === 'STAGE' && r.cleared && r.stage > s.stageCleared) {
      patch.stageCleared = Math.min(STAGE_COUNT, r.stage);
      newStage = true;
    }
    if (r.mode === 'BOSS' && r.cleared && !s.bossDefeated) {
      patch.bossDefeated = true;
      newBoss = true;
    }
    if (r.mode === 'ENDLESS') patch.bestDepth = Math.max(s.bestDepth, r.depth);

    let rank = -1;
    if (r.score > 0) {
      const entry: ScoreEntry = { name: s.nickname, score: r.score, date: Date.now(), ear: r.ear, mine: true };
      const res = insertScore(s.boards[r.mode], entry);
      rank = res.rank;
      patch.boards = { ...s.boards, [r.mode]: res.list };
    }
    set(patch);
    return { rank, newStage, newBoss };
  },

  setLowFx(v: boolean) {
    set({ lowFx: v });
  },

  markTutorialDone() {
    if (state.tutorialDone) return;
    set({ tutorialDone: true });
  },

  // ── Daily bonus (7-day cycle) ──
  dailyStatus(): { available: boolean; day: number; wax: number } {
    const now = Date.now();
    const today = new Date(now).toDateString();
    if (state.lastDaily > 0 && new Date(state.lastDaily).toDateString() === today) {
      const day = Math.min(Math.max(state.dailyStreak, 1), 7);
      return { available: false, day, wax: DAILY_WAX[day - 1] ?? 20 };
    }
    const yesterday = new Date(now - 86400000).toDateString();
    const continued = state.lastDaily > 0 && new Date(state.lastDaily).toDateString() === yesterday;
    const next = continued ? (state.dailyStreak % 7) + 1 : 1;
    return { available: true, day: next, wax: DAILY_WAX[next - 1] ?? 20 };
  },

  claimDaily(): number {
    const st = actions.dailyStatus();
    if (!st.available) return 0;
    set({ wax: state.wax + st.wax, totalWax: state.totalWax + st.wax, lastDaily: Date.now(), dailyStreak: st.day });
    return st.wax;
  },

  // ── Milestones (lifetime extract / clear / score) ──
  claimableMilestone(): Milestone | null {
    for (const m of MILESTONES) {
      if (achieved(m) && !state.claimedMilestones.includes(m.at)) return m;
    }
    return null;
  },

  claimMilestone(at: number): number {
    const m = MILESTONES.find((x) => x.at === at);
    if (!m || state.claimedMilestones.includes(at) || !achieved(m)) return 0;
    set({
      wax: state.wax + m.wax,
      totalWax: state.totalWax + m.wax,
      claimedMilestones: [...state.claimedMilestones, at],
    });
    return m.wax;
  },

  setNickname(name: string) {
    const n = name.trim().slice(0, 12) || 'Wax Rookie';
    const mark = (list: ScoreEntry[]) => list.map((e) => (e.mine ? { ...e, name: n } : e));
    set({
      nickname: n,
      boards: { ENDLESS: mark(state.boards.ENDLESS), STAGE: mark(state.boards.STAGE), BOSS: mark(state.boards.BOSS) },
    });
  },

  setMuted(m: boolean) {
    set({ muted: m });
  },

  reset() {
    state = defaults();
    persist();
    listeners.forEach((l) => l());
  },
};
