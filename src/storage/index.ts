// SYSTEM REAWAKEN - Storage Engine & Default State

import { SystemReawakenState, Quest, DungeonSession, BossChallenge, SkillNode, Achievement, Campaign } from '../types';

export const STORAGE_KEY = 'SYSTEM_REAWAKEN_PLAYER_DATA_V1';

const getTodayString = (): string => new Date().toISOString().slice(0, 10);

export const DEFAULT_DUNGEON_TEMPLATES: DungeonSession[] = [
  {
    id: 'dungeon-training-1',
    name: 'Instant Dungeon: Training Grounds',
    subtitle: 'Physical conditioning & mental endurance',
    category: 'fitness',
    difficulty: 'easy',
    durationMinutes: 20,
    elapsedSeconds: 0,
    remainingSeconds: 20 * 60,
    isRunning: false,
    objectives: [
      { id: 'dt-1', text: 'Dynamic warm-up & stretching (5 mins)', completed: false },
      { id: 'dt-2', text: 'Main workout circuit or cardio (12 mins)', completed: false },
      { id: 'dt-3', text: 'Cool-down & hydration recovery (3 mins)', completed: false }
    ],
    xpReward: 35,
    attributeBonus: 'strength',
    cleared: false
  },
  {
    id: 'dungeon-knowledge-1',
    name: 'Knowledge Dungeon: Deep Theory',
    subtitle: 'Focused reading, conceptual synthesis, & problem breakdown',
    category: 'study',
    difficulty: 'normal',
    durationMinutes: 30,
    elapsedSeconds: 0,
    remainingSeconds: 30 * 60,
    isRunning: false,
    objectives: [
      { id: 'dk-1', text: 'Review target core concepts & formulas', completed: false },
      { id: 'dk-2', text: 'Solve 3 practice exercises or summarize notes', completed: false },
      { id: 'dk-3', text: 'Document mistakes & insights in revision journal', completed: false }
    ],
    xpReward: 50,
    attributeBonus: 'intelligence',
    cleared: false
  },
  {
    id: 'dungeon-coding-1',
    name: 'Focus Sanctum: Algorithm Chamber',
    subtitle: 'Zero-distraction coding session & technical implementation',
    category: 'coding',
    difficulty: 'hard',
    durationMinutes: 45,
    elapsedSeconds: 0,
    remainingSeconds: 45 * 60,
    isRunning: false,
    objectives: [
      { id: 'dc-1', text: 'Isolate problem requirements & write edge-case tests', completed: false },
      { id: 'dc-2', text: 'Implement optimal data structure or code logic', completed: false },
      { id: 'dc-3', text: 'Refactor for clean readability & time complexity analysis', completed: false }
    ],
    xpReward: 75,
    attributeBonus: 'focus',
    cleared: false
  },
  {
    id: 'dungeon-career-1',
    name: 'Career Vault: Professional Forging',
    subtitle: 'Portfolio development, resume polish, & mock interview prep',
    category: 'career',
    difficulty: 'hard',
    durationMinutes: 40,
    elapsedSeconds: 0,
    remainingSeconds: 40 * 60,
    isRunning: false,
    objectives: [
      { id: 'dp-1', text: 'Audit 3 targeted job descriptions & keyword alignment', completed: false },
      { id: 'dp-2', text: 'Draft/refine a STAR story or portfolio project README', completed: false },
      { id: 'dp-3', text: 'Submit 1 high-quality tailored application or reach out', completed: false }
    ],
    xpReward: 70,
    attributeBonus: 'career',
    cleared: false
  }
];

export const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-21-awakening',
    type: '21-day',
    title: '21-Day Awakening: Habit Foundation',
    description: 'Establish rock-solid daily discipline, core health vitals, and unbreakable focus routines.',
    totalDays: 21,
    currentDay: 1,
    categories: ['fitness', 'discipline', 'study', 'coding'],
    startDate: getTodayString(),
    isCompleted: false,
    days: Array.from({ length: 21 }, (_, i) => ({
      dayNumber: i + 1,
      title: i % 7 === 6 ? 'Weekly Review & Active Recovery' : `Day ${i + 1}: Momentum Accelerator`,
      targetMinutes: i % 7 === 6 ? 15 : 45,
      requiredQuests: i % 7 === 6 ? 1 : 2,
      isRestDay: i % 7 === 6,
      completed: false
    }))
  },
  {
    id: 'camp-66-evolution',
    type: '66-day',
    title: '66-Day Evolution: Mastery Protocol',
    description: 'The definitive transformation journey based on cognitive habit automation science.',
    totalDays: 66,
    currentDay: 1,
    categories: ['career', 'coding', 'discipline', 'fitness'],
    startDate: getTodayString(),
    isCompleted: false,
    days: Array.from({ length: 66 }, (_, i) => ({
      dayNumber: i + 1,
      title: i % 7 === 6 ? 'Sovereign Rest & Strategic Reflection' : `Day ${i + 1}: Compound Mastery`,
      targetMinutes: i % 7 === 6 ? 20 : 60,
      requiredQuests: i % 7 === 6 ? 1 : 3,
      isRestDay: i % 7 === 6,
      completed: false
    }))
  }
];

export const DEFAULT_BOSSES: BossChallenge[] = [
  {
    id: 'boss-procrastination',
    name: 'Chronos, The Procrastination Monarch',
    title: 'Ruler of Stolen Hours & Stalled Ambition',
    rank: 'D-Rank',
    lore: 'A shadowy wraith that feeds on hesitation, unfinished drafts, and social media rabbit holes. Vanquish him by executing scheduled deep work without retreat.',
    hpTotal: 100,
    hpCurrent: 100,
    difficulty: 'normal',
    category: 'discipline',
    rewardXp: 150,
    rewardTitle: 'Vanquisher of Delay',
    rewardAttribute: 'discipline',
    objectives: [
      { id: 'bo-p1', title: 'Execute a 30-minute zero-phone focus session', description: 'Complete without touching phone or opening tab distractions', completed: false },
      { id: 'bo-p2', title: 'Complete today\'s highest-friction task first', description: 'Attack the task you were most tempted to delay', completed: false },
      { id: 'bo-p3', title: 'Plan tomorrow\'s top 3 priorities before sleep', description: 'Write exact time blocks and prepare workstation', completed: false }
    ],
    defeated: false
  },
  {
    id: 'boss-coding',
    name: 'Null, The Algorithmic Leviathan',
    title: 'Keeper of Complex Systems & Edge Cases',
    rank: 'C-Rank',
    lore: 'Lurking in the depths of infinite recursion and memory leaks, this mechanical beast challenges engineers to craft robust, tested code.',
    hpTotal: 200,
    hpCurrent: 200,
    difficulty: 'hard',
    category: 'coding',
    rewardXp: 250,
    rewardTitle: 'Code Architect',
    rewardAttribute: 'intelligence',
    objectives: [
      { id: 'bo-c1', title: 'Solve 3 medium data structure or algorithm problems', description: 'Write clean code and verify optimal time complexity', completed: false },
      { id: 'bo-c2', title: 'Implement a new feature or core module in a personal project', description: 'Commit working code with proper documentation', completed: false },
      { id: 'bo-c3', title: 'Perform a comprehensive code review & refactoring pass', description: 'Eliminate redundant loops and modularize functions', completed: false }
    ],
    defeated: false
  },
  {
    id: 'boss-interview',
    name: 'Vindicator, The Gatekeeper Sovereign',
    title: 'Warden of Professional Ascension',
    rank: 'B-Rank',
    lore: 'Standing before the gates of elite career opportunities, the Gatekeeper Sovereign tests your composure, technical articulation, and project depth.',
    hpTotal: 300,
    hpCurrent: 300,
    difficulty: 'epic',
    category: 'career',
    rewardXp: 350,
    rewardTitle: 'The Chosen Applicant',
    rewardAttribute: 'career',
    objectives: [
      { id: 'bo-i1', title: 'Conduct a recorded 45-minute technical mock interview', description: 'Answer behavioral STAR questions and walk through system design', completed: false },
      { id: 'bo-i2', title: 'Polish resume & portfolio with verified metrics', description: 'Ensure every bullet showcases tangible impact and tech stack', completed: false },
      { id: 'bo-i3', title: 'Send 5 personalized connection notes to mentors or recruiters', description: 'Reach out with genuine curiosity and articulate value', completed: false }
    ],
    defeated: false
  },
  {
    id: 'boss-titan',
    name: 'Aegis, The Iron Colossus',
    title: 'Embodiment of Unyielding Physical Might',
    rank: 'A-Rank',
    lore: 'A towering guardian forged of raw iron and discipline. He yields only to hunters who push their physical limits and honor the temple of the body.',
    hpTotal: 400,
    hpCurrent: 400,
    difficulty: 'hard',
    category: 'fitness',
    rewardXp: 300,
    rewardTitle: 'Titan of Iron',
    rewardAttribute: 'strength',
    objectives: [
      { id: 'bo-t1', title: 'Complete a full intense resistance or bodyweight session', description: 'Hit target rep goals with strict form across all sets', completed: false },
      { id: 'bo-t2', title: 'Achieve 10,000 steps or a 5km outdoor run', description: 'Maintain strong cardiovascular cadence', completed: false },
      { id: 'bo-t3', title: 'Hit daily hydration (3L) and 8 hours sleep hygiene', description: 'Power your biological recovery engine', completed: false }
    ],
    defeated: false
  }
];

export const DEFAULT_SKILL_TREES: SkillNode[] = [
  // Coding Tree
  {
    id: 'skill-code-fund',
    treeId: 'coding',
    title: 'Programming Core',
    description: 'Master variables, memory models, loops, and control flow in TypeScript & C++.',
    level: 1,
    maxLevel: 3,
    unlocked: true,
    prerequisites: [],
    attributeAffinities: ['intelligence', 'discipline'],
    milestones: ['Syntax proficiency', 'Debugger mastery', 'Memory management fundamentals']
  },
  {
    id: 'skill-dsa',
    treeId: 'coding',
    title: 'Data Structures & Algorithms',
    description: 'Arrays, Trees, Graphs, Dynamic Programming, and Big-O computational optimization.',
    level: 0,
    maxLevel: 5,
    unlocked: false,
    prerequisites: ['skill-code-fund'],
    attributeAffinities: ['intelligence', 'focus'],
    milestones: ['50 Problems Solved', 'Graph traversals (BFS/DFS)', 'DP memoization', '150 Problems Milestone']
  },
  {
    id: 'skill-sys-design',
    treeId: 'coding',
    title: 'System Architecture',
    description: 'Microservices, event-driven pipelines, caching, and scalable state machines.',
    level: 0,
    maxLevel: 4,
    unlocked: false,
    prerequisites: ['skill-dsa'],
    attributeAffinities: ['career', 'intelligence'],
    milestones: ['API Contract Design', 'Distributed Cache Layer', 'Database indexing', 'High Availability Arch']
  },
  // Career Tree
  {
    id: 'skill-career-resume',
    treeId: 'career',
    title: 'Resume & Brand Polish',
    description: 'Quantified impact statements, ATS optimization, and GitHub portfolio presence.',
    level: 1,
    maxLevel: 3,
    unlocked: true,
    prerequisites: [],
    attributeAffinities: ['career', 'communication'],
    milestones: ['Impact-driven bullet points', 'Live demo links', 'Professional LinkedIn bio']
  },
  {
    id: 'skill-interview-craft',
    treeId: 'career',
    title: 'Interview Articulation',
    description: 'STAR behavioral delivery, whiteboarding clarity, and compensation negotiation.',
    level: 0,
    maxLevel: 4,
    unlocked: false,
    prerequisites: ['skill-career-resume'],
    attributeAffinities: ['communication', 'discipline'],
    milestones: ['5 Recorded Mocks', 'System Design verbal walk', 'Reverse question mastery']
  },
  // Fitness Tree
  {
    id: 'skill-physique-found',
    treeId: 'fitness',
    title: 'Physical Foundation',
    description: 'Proper biomechanics, compound lifts, bodyweight strength, and tendon integrity.',
    level: 1,
    maxLevel: 3,
    unlocked: true,
    prerequisites: [],
    attributeAffinities: ['strength', 'vitality'],
    milestones: ['50 Push-ups milestone', 'Bodyweight squat form', 'Consistent 3x weekly workout']
  },
  {
    id: 'skill-endurance-engine',
    treeId: 'fitness',
    title: 'Cardio & Aerobic Engine',
    description: 'Zone 2 aerobic base, VO2 max sprints, and sustained energetic vitality.',
    level: 0,
    maxLevel: 3,
    unlocked: false,
    prerequisites: ['skill-physique-found'],
    attributeAffinities: ['vitality', 'discipline'],
    milestones: ['5k uninterrupted run', 'Zone 2 45-min session', 'Resting heart rate optimization']
  }
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-awakening',
    title: 'First Awakening',
    description: 'Complete your very first quest in SYSTEM REAWAKEN.',
    category: 'quests',
    icon: '⚡',
    unlocked: false,
    progressCurrent: 0,
    progressMax: 1,
    unlockedTitle: 'The Awakened Aspirant'
  },
  {
    id: 'ach-dungeon-initiate',
    title: 'Dungeon Diver',
    description: 'Successfully survive and clear your first Focus Dungeon chamber.',
    category: 'dungeons',
    icon: '🗝️',
    unlocked: false,
    progressCurrent: 0,
    progressMax: 1,
    unlockedTitle: 'Chamber Survivor'
  },
  {
    id: 'ach-dungeon-master',
    title: 'Domain Conqueror',
    description: 'Accumulate over 120 minutes of deep focus dungeon sessions.',
    category: 'dungeons',
    icon: '🏰',
    unlocked: false,
    progressCurrent: 0,
    progressMax: 120,
    unlockedTitle: 'Master of Deep Work'
  },
  {
    id: 'ach-streak-7',
    title: 'Iron Consistency I',
    description: 'Maintain a continuous 7-day completion streak.',
    category: 'streaks',
    icon: '🔥',
    unlocked: false,
    progressCurrent: 0,
    progressMax: 7,
    unlockedTitle: 'The Steadfast'
  },
  {
    id: 'ach-level-10',
    title: 'Ascendant Rank',
    description: 'Level up your Hunter character to Level 10.',
    category: 'levels',
    icon: '👑',
    unlocked: false,
    progressCurrent: 1,
    progressMax: 10,
    unlockedTitle: 'Ascendant Hunter'
  },
  {
    id: 'ach-boss-slayer',
    title: 'Monarch Vanquisher',
    description: 'Defeat your first Milestone Boss challenge.',
    category: 'bosses',
    icon: '🗡️',
    unlocked: false,
    progressCurrent: 0,
    progressMax: 1,
    unlockedTitle: 'Slayer of Monarchs'
  },
  {
    id: 'ach-campaign-21',
    title: 'New Dawn Protocol',
    description: 'Successfully conquer the 21-Day Awakening Campaign.',
    category: 'campaigns',
    icon: '🌅',
    unlocked: false,
    progressCurrent: 0,
    progressMax: 21,
    unlockedTitle: 'Reawakened Sovereign'
  }
];

export const DEFAULT_STARTER_QUESTS: Quest[] = [
  {
    id: 'q-starter-1',
    title: 'Physical Conditioning: 40 Push-ups & Core Circuit',
    description: 'Perform 4 sets of 10 push-ups with strict form, followed by a 60-second plank.',
    category: 'fitness',
    difficulty: 'normal',
    durationMinutes: 20,
    subtasks: [
      { id: 'st-1', title: 'Set 1: 10 push-ups (strict cadence)', completed: false },
      { id: 'st-2', title: 'Set 2: 10 push-ups', completed: false },
      { id: 'st-3', title: 'Set 3: 10 push-ups', completed: false },
      { id: 'st-4', title: 'Set 4: 10 push-ups + 60s plank', completed: false }
    ],
    attribute: 'strength',
    xpReward: 30,
    attributePoints: 2,
    status: 'available',
    isDaily: true
  },
  {
    id: 'q-starter-2',
    title: 'Algorithmic Mastery: Solve 2 DSA Problems',
    description: 'Choose 2 LeetCode/HackerRank problems (Array or Two-Pointers). Implement and analyze complexity.',
    category: 'coding',
    difficulty: 'normal',
    durationMinutes: 35,
    subtasks: [
      { id: 'st-2a', title: 'Problem 1: Write optimal solution & test bounds', completed: false },
      { id: 'st-2b', title: 'Problem 2: Explain logic & space complexity', completed: false }
    ],
    attribute: 'intelligence',
    xpReward: 35,
    attributePoints: 2,
    status: 'available',
    isDaily: true
  },
  {
    id: 'q-starter-3',
    title: 'Biological Restoration: Hydration & Sleep Protocol',
    description: 'Drink 2.5 Liters of pure water throughout the day and power down screens 30 mins before sleep.',
    category: 'discipline',
    difficulty: 'easy',
    durationMinutes: 10,
    subtasks: [
      { id: 'st-3a', title: 'Morning 500ml water immediately on waking', completed: false },
      { id: 'st-3b', title: '2 Liters reached by early evening', completed: false },
      { id: 'st-3c', title: 'No screens 30 mins before sleep', completed: false }
    ],
    attribute: 'vitality',
    xpReward: 20,
    attributePoints: 1,
    status: 'available',
    isDaily: true
  },
  {
    id: 'q-starter-4',
    title: 'Deep Chamber: 25-Min Zero-Distraction Focus Session',
    description: 'Silence notifications and accomplish your most critical study or project milestone.',
    category: 'study',
    difficulty: 'normal',
    durationMinutes: 25,
    subtasks: [
      { id: 'st-4a', title: 'Close unnecessary browser tabs and phone away', completed: false },
      { id: 'st-4b', title: 'Execute uninterrupted 25-minute study block', completed: false }
    ],
    attribute: 'focus',
    xpReward: 30,
    attributePoints: 2,
    status: 'available',
    isDaily: true
  },
  {
    id: 'q-starter-5',
    title: 'Career Advancement: Audit & Refine Portfolio Project',
    description: 'Review project README, add architecture diagram, or refine bullet points on resume.',
    category: 'career',
    difficulty: 'hard',
    durationMinutes: 40,
    subtasks: [
      { id: 'st-5a', title: 'Add clear problem & solution section to README', completed: false },
      { id: 'st-5b', title: 'Verify live deployment URL works smoothly', completed: false }
    ],
    attribute: 'career',
    xpReward: 45,
    attributePoints: 3,
    status: 'available',
    isDaily: false,
    isWeekly: true
  }
];

export const DEFAULT_STATE: SystemReawakenState = {
  version: 1,
  player: {
    name: 'Player',
    alias: 'Shadow Monarch',
    avatarSeed: 'reawaken-default',
    avatarIcon: '⚡',
    title: 'The Reawakened One',
    job: 'Hunter Aspirant',
    level: 1,
    currentXp: 0,
    requiredXp: 100,
    statPoints: 0,
    rank: 'E-Rank',
    mainGoal: 'Achieve elite discipline, high-tier software engineering skills, and peak physical conditioning.',
    secondaryGoals: [
      'Master Data Structures & Algorithms and C++/TypeScript systems',
      'Build a standout career portfolio and secure top software opportunities',
      'Maintain continuous workout routine and 8-hour sleep hygiene'
    ],
    preferredTimePerDayMinutes: 60,
    preferredDifficulty: 'normal',
    selectedCategories: ['fitness', 'coding', 'study', 'career', 'discipline'],
    stats: {
      strength: 10,
      vitality: 10,
      intelligence: 10,
      focus: 10,
      discipline: 10,
      career: 10,
      communication: 10
    },
    currentStreak: 1,
    bestStreak: 1,
    totalQuestsCompleted: 0,
    totalFocusMinutes: 0,
    fatigue: 0,
    lastActiveDate: getTodayString(),
    isOnboarded: false // will prompt onboarding if false
  },
  quests: DEFAULT_STARTER_QUESTS,
  activeDungeon: null,
  dungeonTemplates: DEFAULT_DUNGEON_TEMPLATES,
  campaigns: DEFAULT_CAMPAIGNS,
  activeCampaignId: 'camp-21-awakening',
  bosses: DEFAULT_BOSSES,
  skills: DEFAULT_SKILL_TREES,
  achievements: DEFAULT_ACHIEVEMENTS,
  workoutLogs: [],
  history: [
    {
      date: getTodayString(),
      xpGained: 0,
      questsCompleted: 0,
      focusMinutes: 0,
      categoriesActive: []
    }
  ],
  settings: {
    soundFxEnabled: true,
    musicEnabled: false,
    masterVolume: 0.7,
    reducedMotion: false,
    highContrast: false,
    compactHud: false,
    autoSaveIntervalSec: 10,
    accentColor: 'cyan'
  },
  systemNotifications: [
    {
      id: 'sys-init',
      timestamp: Date.now(),
      text: '[SYSTEM] System Reawaken initialized. Welcome, Player.',
      type: 'system'
    }
  ]
};

// ==========================================
// Persistence Engine
// ==========================================

export function loadGameState(): SystemReawakenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    
    // Ensure all required sub-objects exist even if schema evolved
    return {
      ...DEFAULT_STATE,
      ...parsed,
      player: {
        ...DEFAULT_STATE.player,
        ...parsed.player,
        stats: {
          ...DEFAULT_STATE.player.stats,
          ...(parsed.player?.stats || {})
        }
      },
      settings: {
        ...DEFAULT_STATE.settings,
        ...(parsed.settings || {})
      },
      quests: Array.isArray(parsed.quests) && parsed.quests.length > 0 ? parsed.quests : DEFAULT_STARTER_QUESTS,
      dungeonTemplates: Array.isArray(parsed.dungeonTemplates) && parsed.dungeonTemplates.length > 0 ? parsed.dungeonTemplates : DEFAULT_DUNGEON_TEMPLATES,
      campaigns: Array.isArray(parsed.campaigns) && parsed.campaigns.length > 0 ? parsed.campaigns : DEFAULT_CAMPAIGNS,
      bosses: Array.isArray(parsed.bosses) && parsed.bosses.length > 0 ? parsed.bosses : DEFAULT_BOSSES,
      skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : DEFAULT_SKILL_TREES,
      achievements: Array.isArray(parsed.achievements) && parsed.achievements.length > 0 ? parsed.achievements : DEFAULT_ACHIEVEMENTS,
      workoutLogs: Array.isArray(parsed.workoutLogs) ? parsed.workoutLogs : [],
      history: Array.isArray(parsed.history) ? parsed.history : DEFAULT_STATE.history,
      systemNotifications: Array.isArray(parsed.systemNotifications) ? parsed.systemNotifications : DEFAULT_STATE.systemNotifications
    };
  } catch (err) {
    console.error('Failed to load state from localStorage, falling back to default:', err);
    return DEFAULT_STATE;
  }
}

export function saveGameState(state: SystemReawakenState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
    return false;
  }
}

export function exportBackupJSON(state: SystemReawakenState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `system-reawaken-save-${getTodayString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importBackupJSON(jsonStr: string): SystemReawakenState {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object' || !parsed.player) {
    throw new Error('Invalid backup file structure: missing player profile data.');
  }
  return {
    ...DEFAULT_STATE,
    ...parsed,
    player: {
      ...DEFAULT_STATE.player,
      ...parsed.player,
      stats: {
        ...DEFAULT_STATE.player.stats,
        ...(parsed.player?.stats || {})
      }
    }
  };
}

export function resetGameStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
