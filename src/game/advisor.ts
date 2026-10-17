// SYSTEM REAWAKEN - Rule-Based System Advisor
// Provides intelligent workload balancing, recommendations, and motivational alerts

import { Quest, PlayerProfile, BossChallenge } from '../types';

export interface AdvisorRecommendation {
  type: 'info' | 'warning' | 'urgent' | 'success';
  headline: string;
  advice: string;
  actionQuestId?: string;
  actionLabel?: string;
}

export function generateAdvisorAdvice(
  player: PlayerProfile,
  quests: Quest[],
  bosses: BossChallenge[]
): AdvisorRecommendation[] {
  const recommendations: AdvisorRecommendation[] = [];

  const availableQuests = quests.filter(q => q.status === 'available');
  const activeQuests = quests.filter(q => q.status === 'active');
  const completedToday = quests.filter(q => q.status === 'completed');

  // 1. Fatigue & Burnout Check
  if (player.fatigue >= 70) {
    recommendations.push({
      type: 'urgent',
      headline: '[SYSTEM WARNING: High Fatigue Detected]',
      advice: 'Your biological fatigue is critically elevated (70%+). Schedule a light recovery day, drink water, and focus on Vitality/Discipline rest quests before attempting heavy Boss challenges.'
    });
  }

  // 2. Overloaded Schedule Check
  const totalEstimatedMinutes = availableQuests
    .filter(q => q.isDaily)
    .reduce((acc, q) => acc + q.durationMinutes, 0);

  if (totalEstimatedMinutes > player.preferredTimePerDayMinutes * 1.5) {
    recommendations.push({
      type: 'warning',
      headline: '[SYSTEM ADVICE: Workload Exceeds Capacity]',
      advice: `Today's planned quests total ${totalEstimatedMinutes} mins, exceeding your preferred daily target (${player.preferredTimePerDayMinutes} mins). Consider deferring secondary quests to preserve quality and prevent burnout.`
    });
  }

  // 3. Next Single Actionable Quest Recommendation (Anti-procrastination)
  const highPriority = availableQuests.find(q => q.isDaily && q.difficulty === 'normal' || q.difficulty === 'hard')
    || availableQuests[0];

  if (highPriority) {
    recommendations.push({
      type: 'info',
      headline: '[SYSTEM DIRECTIVE: Recommended Next Step]',
      advice: `Zero in on "${highPriority.title}" (${highPriority.durationMinutes} mins). Completing this yields +${highPriority.xpReward} XP towards Level ${player.level + 1}.`,
      actionQuestId: highPriority.id,
      actionLabel: 'Focus on this Quest'
    });
  }

  // 4. Milestone Boss Awareness
  const readyBoss = bosses.find(b => !b.defeated);
  if (readyBoss && player.level >= 3) {
    const readyCount = readyBoss.objectives.filter(o => o.completed).length;
    recommendations.push({
      type: 'info',
      headline: `[RAID ADVISORY: ${readyBoss.name}]`,
      advice: `Milestone Boss "${readyBoss.title}" is active. Progress: ${readyCount}/${readyBoss.objectives.length} objectives cleared. Triumph awards the title "${readyBoss.rewardTitle}".`
    });
  }

  // 5. Positive Momentum / Streak Acknowledgment
  if (player.currentStreak >= 3) {
    recommendations.push({
      type: 'success',
      headline: `[MOMENTUM RESONANCE: ${player.currentStreak}-Day Streak]`,
      advice: `Your consistency multiplier is active. Every completed quest reinforces synaptic discipline pathways. Keep the chain unbroken.`
    });
  } else if (completedToday.length === 0 && availableQuests.length > 0) {
    recommendations.push({
      type: 'info',
      headline: '[SYSTEM STANDBY: Daily Awakening Pending]',
      advice: 'No quests completed yet today. Enter a 20-minute Focus Dungeon chamber to spark daily momentum.'
    });
  }

  return recommendations;
}
