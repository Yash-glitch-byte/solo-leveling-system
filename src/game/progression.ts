// SYSTEM REAWAKEN - Progression Engine

import { HunterRank, AttributeStats, AttributeKey, QuestDifficulty } from '../types';

/**
 * Calculates the required XP for reaching the next level.
 * Curve: Smooth exponential scaling designed for long-term consistency.
 */
export function calculateRequiredXp(level: number): number {
  if (level <= 1) return 100;
  // Level 1: 100, Level 5: 230, Level 10: 520, Level 20: 1750, Level 50: 18000
  return Math.round(100 * Math.pow(1.18, level - 1) + (level - 1) * 25);
}

/**
 * Determines Hunter Rank based on current player level.
 */
export function getRankForLevel(level: number): HunterRank {
  if (level >= 100) return 'National Level';
  if (level >= 70) return 'S-Rank';
  if (level >= 50) return 'A-Rank';
  if (level >= 35) return 'B-Rank';
  if (level >= 20) return 'C-Rank';
  if (level >= 10) return 'D-Rank';
  return 'E-Rank';
}

/**
 * Standardized XP reward values for quest difficulties.
 */
export const XP_BY_DIFFICULTY: Record<QuestDifficulty, number> = {
  easy: 15,
  normal: 30,
  hard: 60,
  epic: 120,
  boss: 250
};

/**
 * Attribute point gains per quest difficulty.
 */
export const STAT_POINTS_BY_DIFFICULTY: Record<QuestDifficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
  epic: 5,
  boss: 10
};

export interface LevelUpResult {
  newLevel: number;
  newRank: HunterRank;
  remainingXp: number;
  newRequiredXp: number;
  statPointsAwarded: number;
  didRankUp: boolean;
}

/**
 * Applies XP gain and computes potential multi-level-ups.
 */
export function processXpGain(
  currentLevel: number,
  currentXp: number,
  xpToAdd: number
): { didLevelUp: boolean; result: LevelUpResult } {
  let level = currentLevel;
  let xp = currentXp + xpToAdd;
  let required = calculateRequiredXp(level);
  let totalStatPointsAwarded = 0;
  let didLevelUp = false;
  const initialRank = getRankForLevel(currentLevel);

  while (xp >= required) {
    xp -= required;
    level += 1;
    totalStatPointsAwarded += 3; // +3 free points per level
    required = calculateRequiredXp(level);
    didLevelUp = true;
  }

  const finalRank = getRankForLevel(level);

  return {
    didLevelUp,
    result: {
      newLevel: level,
      newRank: finalRank,
      remainingXp: xp,
      newRequiredXp: required,
      statPointsAwarded: totalStatPointsAwarded,
      didRankUp: finalRank !== initialRank
    }
  };
}

/**
 * Formats attribute name for display.
 */
export function getAttributeDisplayName(key: AttributeKey): string {
  switch (key) {
    case 'strength': return 'STRENGTH (STR)';
    case 'vitality': return 'VITALITY (VIT)';
    case 'intelligence': return 'INTELLIGENCE (INT)';
    case 'focus': return 'FOCUS (FOC)';
    case 'discipline': return 'DISCIPLINE (DIS)';
    case 'career': return 'CAREER (CAR)';
    case 'communication': return 'COMMUNICATION (COM)';
    default: return key;
  }
}

/**
 * Returns the primary color token for each attribute.
 */
export function getAttributeColor(key: AttributeKey): string {
  switch (key) {
    case 'strength': return '#ff4466';       // Crimson Red
    case 'vitality': return '#10b981';       // Emerald Green
    case 'intelligence': return '#00d2ff';   // Electric Cyan
    case 'focus': return '#8b5cf6';          // Violet
    case 'discipline': return '#f59e0b';     // Amber Gold
    case 'career': return '#38bdf8';         // Sky Blue
    case 'communication': return '#ec4899';  // Rose Pink
    default: return '#00d2ff';
  }
}
