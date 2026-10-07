// ─────────────────────────────────────────────────────────────
//  Extreme Earwax Miner — shared types
// ─────────────────────────────────────────────────────────────

export type ToolType = 'COTTON' | 'TWEEZER' | 'SONIC_VACUUM';
/** VIBRATOR is only issued by the lab for boss fights */
export type PlayTool = ToolType | 'VIBRATOR';
export type GameMode = 'STAGE' | 'ENDLESS' | 'BOSS';
export type EarId = 'HUMAN' | 'ALIEN' | 'CAT' | 'GIANT';

/** Core meta-data contract from the design document */
export interface EarwaxMinerData {
  extractorToolType: ToolType;
  tympanicSensitivity: number; // Resistance to damage (level, 1 = base)
  unlockedEars: string[];
}

export interface RunConfig {
  mode: GameMode;
  stage: number;
  ear: EarId;
  tool: ToolType;
  precision: number;
  power: number;
  sensitivity: number;
  lungs: number;
  firstBoss: boolean;
  reviveBuff?: boolean; // retry with revive: +30% eardrum durability
}

export interface Bonus {
  label: string;
  wax: number;
}

export interface RunResult {
  mode: GameMode;
  stage: number;
  ear: EarId;
  cleared: boolean;
  reason: string;
  score: number;
  wax: number;
  extracted: number;
  time: number;
  maxCombo: number;
  drumHp: number;
  depth: number;
  bonuses: Bonus[];
}

export interface HudState {
  drumHp: number;
  flawless: boolean;
  score: number;
  wax: number;
  extracted: number;
  target: number;
  combo: number;
  comboMult: number;
  comboWindow: number; // 0..1, remaining time before combo resets
  breath: number; // 0..1
  breathLocked: boolean;
  energy: number; // 0..1  (vacuum)
  grabbing: boolean; // whether a grab input is currently held
  grabbed: boolean; // whether the tool is attached to a wax chunk
  tool: PlayTool;
  phase: string;
  clog: number; // 0..1  (endless)
  depth: number;
  time: number;
  cracks: number;
  charge: number;
  hitFlash: number;
  warn: boolean;
  sneeze: number; // 0..1
  gravAngle: number;
  danger: number; // 0..1
}

export interface ScoreEntry {
  name: string;
  score: number;
  date: number;
  ear?: EarId;
  rival?: boolean;
  mine?: boolean;
}

export interface GameCallbacks {
  onHud: (h: HudState) => void;
  onEnd: (r: RunResult) => void;
}
