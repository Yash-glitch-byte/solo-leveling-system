// SYSTEM REAWAKEN - Storage Engine & Data Migration Protocol (v2.5)

import {
  SystemReawakenState,
  Quest,
  DungeonSession,
  BossChallenge,
  SkillNode,
  Achievement,
  Campaign,
  EquipmentItem,
  EquippedGear,
  PseudoMonarchState,
  BleWearableState,
  CloudAccount
} from '../types';

export const STORAGE_KEY = 'SYSTEM_REAWAKEN_PLAYER_DATA_V1';
export const LEGACY_KEY_V1 = 'SOLO_LEVELING_PLAYER_DATA_V1';
export const LEGACY_KEY_V2 = 'SOLO_LEVELING_PLAYER_DATA_V2';

const getTodayString = (): string => new Date().toISOString().slice(0, 10);

// ==========================================
// DEFAULT GEAR & E-RING IMPLEMENTATION
// ==========================================
export const DEFAULT_E_RING: EquipmentItem = {
  id: 'item-e-ring-origin',
  name: 'The E-Ring (Awakened Ring of Origin)',
  slot: 'ring',
  rarity: 'rare',
  description: 'A sacred cyan ring bestowed upon newly awakened hunters in their darkest hour.',
  lore: 'Legend tells that when an E-Rank hunter refused to yield before the dual statues, this ring forged from obsidian and mana crystal materialized on their hand. It stabilizes neural vitals and shields the hunter from rapid exhaustion.',
  statBonus: { vitality: 2, focus: 2 },
  specialEffect: '-15% Fatigue accumulation on missed habits',
  isEquipped: true,
  icon: '💍',
  unlockedAtLevel: 1
};

export const DEFAULT_INVENTORY_ITEMS: EquipmentItem[] = [
  DEFAULT_E_RING,
  {
    id: 'item-kasaka-fang',
    name: "Kasaka's Poison Fang",
    slot: 'weapon',
    rarity: 'epic',
    description: 'A serrated venomous dagger forged from the blue scales of the Great Swamp Snake.',
    lore: 'Inflicts numbing paralysis on friction tasks. Equipping this increases your resolve to confront high-difficulty algorithmic challenges.',
    statBonus: { strength: 4, discipline: 2 },
    specialEffect: '+10% XP on Coding & Algorithm quests',
    isEquipped: true,
    icon: '🗡️',
    unlockedAtLevel: 1
  },
  {
    id: 'item-obsidian-chestplate',
    name: "Knight's Obsidian Chestplate",
    slot: 'armor',
    rarity: 'rare',
    description: 'Forged from tempered dungeon iron, radiating a protective midnight blue aura.',
    lore: 'Lightweight yet resilient against procrastination fatigue.',
    statBonus: { vitality: 4, strength: 2 },
    specialEffect: '+5% Max focus chamber stamina',
    isEquipped: true,
    icon: '🛡️',
    unlockedAtLevel: 1
  },
  {
    id: 'item-warden-choker',
    name: "Warden's Focus Choker",
    slot: 'accessory',
    rarity: 'epic',
    description: 'A silver collar with an embedded lapis focus core.',
    lore: 'Calibrates brainwave frequencies into continuous alpha state.',
    statBonus: { focus: 4, intelligence: 3 },
    specialEffect: '+2 Minutes bonus stamina per 25m Focus Chamber',
    isEquipped: true,
    icon: '📿',
    unlockedAtLevel: 2
  },
  {
    id: 'item-ring-deep-focus',
    name: 'Ring of Deep Sanctum',
    slot: 'ring',
    rarity: 'legendary',
    description: 'An ancient relic that bends subjective time during deep focus sessions.',
    lore: 'Forged by the ancient masters of deep work.',
    statBonus: { focus: 5, discipline: 3 },
    specialEffect: '+20% EXP from Instant Dungeons',
    isEquipped: false,
    icon: '💎',
    unlockedAtLevel: 5
  }
];

export const DEFAULT_EQUIPPED_GEAR: EquippedGear = {
  weapon: DEFAULT_INVENTORY_ITEMS[1],
  armor: DEFAULT_INVENTORY_ITEMS[2],
  ring: DEFAULT_E_RING,
  accessory: DEFAULT_INVENTORY_ITEMS[3]
};

// ==========================================
// DEFAULT PSEUDO MONARCH SYSTEM
// ==========================================
export const DEFAULT_PSEUDO_MONARCH_STATE: PseudoMonarchState = {
  unlocked: false,
  prestigeRank: 'Monarch Candidate',
  authorityActive: true,
  domainActive: true,
  shadows: [
    {
      id: 'shadow-igris',
      name: 'Igris, The Blood-Red Commander',
      title: 'Knight Sovereign of Loyalty',
      lore: 'A towering knight draped in crimson plume armor. His dual greatswords guard your daily discipline routine.',
      extracted: false,
      deployed: true,
      statBonus: { strength: 5, discipline: 4 },
      quote: '"My blade shall shield the Sovereign\'s path until the end of time."',
      icon: '⚔️',
      requiredLevel: 5
    },
    {
      id: 'shadow-tank',
      name: 'Tank, The Ice Bear Alpha',
      title: 'Beast Vanguard of Endurance',
      lore: 'A massive frost-infused ursine guardian whose unyielding resilience absorbs physical workout fatigue.',
      extracted: false,
      deployed: false,
      statBonus: { vitality: 5, strength: 3 },
      quote: '*A low, earth-shaking rumble of absolute obedience.*',
      icon: '🐻',
      requiredLevel: 8
    },
    {
      id: 'shadow-iron',
      name: 'Iron, The Obsidian Shield',
      title: 'Unbreakable Bastion',
      lore: 'A colossal heavy-armored vanguard who roars in the face of daunting career milestones.',
      extracted: false,
      deployed: false,
      statBonus: { vitality: 6, career: 4 },
      quote: '"RRAAAAGHHH! (The shield of the Monarch stands firm!)"',
      icon: '🛡️',
      requiredLevel: 12
    },
    {
      id: 'shadow-beru',
      name: 'Beru, King of the Swarm',
      title: 'Sovereign Shadow Marshal',
      lore: 'The apex biological predator awakened into dark shadow essence. Unrivaled speed, intellect, and razor-sharp execution.',
      extracted: false,
      deployed: false,
      statBonus: { strength: 10, intelligence: 8, focus: 8 },
      quote: '"My King! Grant me permission to eradicate all friction from your path!"',
      icon: '👑',
      requiredLevel: 25
    }
  ]
};

// ==========================================
// DEFAULT WEARABLE & CLOUD ACCOUNTS
// ==========================================
export const DEFAULT_WEARABLE_STATE: BleWearableState = {
  supported: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
  connected: false
};

export const DEFAULT_CLOUD_ACCOUNT: CloudAccount = {
  hunterId: `hunter-${Math.random().toString(36).slice(2, 9)}`,
  username: 'Hunter',
  cloudSyncEnabled: false
};

// ==========================================
// DUNGEONS, CAMPAIGNS, BOSSES, SKILLS, ACHIEVEMENTS
// ==========================================
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
    id: 'ach-ering-bearer',
    title: 'Bearer of the Ring',
    description: 'Equip The E-Ring and complete 3 habit quests without fatigue penalty.',
    category: 'quests',
    icon: '💍',
    unlocked: true,
    progressCurrent: 3,
    progressMax: 3,
    unlockedTitle: 'Ring-Bearer of Origin'
  },
  {
    id: 'ach-pseudo-monarch',
    title: 'Shadow Authority',
    description: 'Awaken the Pseudo Monarch system and extract your first Shadow Commander.',
    category: 'bosses',
    icon: '👑',
    unlocked: false,
    progressCurrent: 0,
    progressMax: 1,
    unlockedTitle: 'Monarch Aspirant'
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
    id: 'ach-boss-slayer',
    title: 'Monarch Vanquisher',
    description: 'Defeat your first Milestone Boss challenge.',
    category: 'bosses',
    icon: '🗡️',
    unlocked: false,
    progressCurrent: 0,
    progressMax: 1,
    unlockedTitle: 'Slayer of Monarchs'
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
    isDaily: true,
    verification: { tier: 'self_reported' }
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
    isDaily: true,
    verification: { tier: 'evidence_attached' },
    verificationStatus: 'supported',
    quiz: {
      question: 'What is the optimal time complexity of finding two numbers with a target sum in a sorted array using Two-Pointers?',
      options: ['O(N^2)', 'O(N log N)', 'O(N)', 'O(1)'],
      correctIndex: 2,
      explanation: 'Two pointers starting at opposite ends converge in a single pass O(N) without nested iterations.'
    }
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
    isDaily: true,
    verification: { tier: 'self_reported' },
    verificationStatus: 'self_reported'
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
    isDaily: true,
    verification: { tier: 'verified_milestone' },
    verificationStatus: 'supported',
    quiz: {
      question: 'What is the primary cognitive benefit of single-task 25-minute deep focus chambers?',
      options: [
        'Minimizing attention residue from task switching',
        'Bypassing the need for physical sleep',
        'Instant photographic memory',
        'Reducing physical calorie burn'
      ],
      correctIndex: 0,
      explanation: 'Unbroken single-task focus prevents cognitive residue from context switching, dramatically raising comprehension.'
    }
  }
];

export const DEFAULT_COMPETITIONS: any[] = [
  {
    id: 'comp-7day-sprint',
    title: '7-Day Code & Systems Marathon',
    description: 'Solve algorithmic challenges and ship verified software modules. Code links and knowledge quizzes score maximum points.',
    category: 'coding',
    startDate: getTodayString(),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    status: 'active',
    rules: 'Self-reported tasks award 30 pts. Supported tasks with problem summaries/quizzes award 70 pts. Sensor or verified code submissions award 100 pts.',
    scoringCriteria: 'Verified: 100 pts | Supported: 70 pts | Self-Report: 30 pts',
    rewardXp: 250,
    rewardTitle: 'Code Sovereign',
    joined: false,
    claimed: false,
    participants: []
  },
  {
    id: 'comp-focus-decathlon',
    title: 'Instant Dungeon Focus Decathlon',
    description: 'Sustain uninterrupted deep work focus blocks in Instant Dungeons without breaking cadence.',
    category: 'study',
    startDate: getTodayString(),
    endDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    status: 'active',
    rules: 'Each 25m cleared Instant Dungeon logs 100 competition points. Anti-cheat timers enforced.',
    scoringCriteria: 'Full Dungeon Clear: 100 pts | 15m Sprint: 50 pts',
    rewardXp: 300,
    rewardTitle: 'Deep Sovereign',
    joined: false,
    participants: [
      {
        hunterId: 'HNT-ME',
        name: 'You',
        avatarIcon: '⚡',
        rank: 'E-Rank',
        score: 0,
        verifiedActions: 0,
        selfReportedActions: 0,
        isCurrentUser: true
      }
    ]
  },
  {
    id: 'comp-fitness-circuit',
    title: 'Physical Might & Conditioning League',
    description: 'Complete push-up circuits and bodyweight conditioning sessions. Structured logs and verified sets award full points.',
    category: 'fitness',
    startDate: getTodayString(),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    status: 'active',
    rules: 'Complete 4/4 push-up sets for 100 pts. Structured logs required.',
    scoringCriteria: 'Logged 4-set Circuit: 100 pts | Self-report: 30 pts',
    rewardXp: 280,
    rewardTitle: 'Titan Candidate',
    joined: true,
    participants: [
      {
        hunterId: 'HNT-ME',
        name: 'You',
        avatarIcon: '⚡',
        rank: 'E-Rank',
        score: 100,
        verifiedActions: 1,
        selfReportedActions: 0,
        isCurrentUser: true
      }
    ]
  }
];

export const DEFAULT_STATE: SystemReawakenState = {
  version: 2,
  player: {
    hunterId: 'HNT-7790',
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
    isOnboarded: false,
    dungeonsClearedToday: 0,
    dailyDungeonQuota: 2,
    dungeonQuotaBonusClaimed: false,
    privacySettings: {
      isPublic: true,
      shareActivity: true,
      showOnlineStatus: true,
      shareStats: true
    },
    voiceCompanionOptIn: false,
    multiplayerOptIn: true,
    reminderSettings: {
      hydration: true,
      dailyQuests: true,
      review: true
    }
  },
  quests: DEFAULT_STARTER_QUESTS,
  inventory: DEFAULT_INVENTORY_ITEMS,
  equippedGear: DEFAULT_EQUIPPED_GEAR,
  monarch: DEFAULT_PSEUDO_MONARCH_STATE,
  wearable: DEFAULT_WEARABLE_STATE,
  cloudAccount: DEFAULT_CLOUD_ACCOUNT,
  syncStatus: 'local_only',
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
  friends: [],
  competitions: DEFAULT_COMPETITIONS,
  batchSubmissions: [],
  syncQueue: [],
  systemNotifications: [
    {
      id: 'sys-init',
      timestamp: Date.now(),
      text: '[SYSTEM] System Reawaken v2.5 initialized. E-Ring synchronized.',
      type: 'system'
    }
  ]
};

// ==========================================
// BACKWARD DATA MIGRATION ENGINE
// ==========================================
function migrateLegacyData(): Partial<SystemReawakenState> | null {
  try {
    // Check legacy v2 first, then legacy v1
    const rawV2 = localStorage.getItem(LEGACY_KEY_V2);
    const rawV1 = localStorage.getItem(LEGACY_KEY_V1);
    const candidate = rawV2 || rawV1;
    if (!candidate) return null;

    const legacy = JSON.parse(candidate);
    if (!legacy || !legacy.player) return null;

    console.log('[MIGRATION] Found legacy player data. Preserving hunter progress...');

    return {
      player: {
        ...DEFAULT_STATE.player,
        name: legacy.player.name || DEFAULT_STATE.player.name,
        alias: legacy.player.title || DEFAULT_STATE.player.alias,
        level: Math.max(1, legacy.player.level || 1),
        currentXp: legacy.player.currentXp || 0,
        requiredXp: legacy.player.requiredXp || 100,
        statPoints: legacy.player.statPoints || 0,
        stats: {
          strength: legacy.player.stats?.str || 10,
          vitality: legacy.player.stats?.vit || 10,
          intelligence: legacy.player.stats?.int || 10,
          focus: legacy.player.stats?.per || 10,
          discipline: 10,
          career: 10,
          communication: 10
        },
        isOnboarded: true
      }
    };
  } catch (err) {
    console.warn('[MIGRATION] Legacy migration note:', err);
    return null;
  }
}

// ==========================================
// Persistence Engine
// ==========================================
export function loadGameState(): SystemReawakenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let parsed: any = null;

    if (raw) {
      parsed = JSON.parse(raw);
    } else {
      // Attempt migration from legacy keys
      parsed = migrateLegacyData();
    }

    const todayStr = getTodayString();
    const isNewDay = parsed.player?.lastActiveDate && parsed.player.lastActiveDate !== todayStr;

    return {
      ...DEFAULT_STATE,
      ...parsed,
      player: {
        ...DEFAULT_STATE.player,
        ...parsed.player,
        dungeonsClearedToday: isNewDay ? 0 : (parsed.player?.dungeonsClearedToday ?? 0),
        dailyDungeonQuota: parsed.player?.dailyDungeonQuota || 2,
        dungeonQuotaBonusClaimed: isNewDay ? false : (parsed.player?.dungeonQuotaBonusClaimed ?? false),
        stats: {
          ...DEFAULT_STATE.player.stats,
          ...(parsed.player?.stats || {})
        }
      },
      inventory: Array.isArray(parsed.inventory) && parsed.inventory.length > 0
        ? parsed.inventory
        : DEFAULT_INVENTORY_ITEMS,
      equippedGear: {
        ...DEFAULT_EQUIPPED_GEAR,
        ...(parsed.equippedGear || {})
      },
      monarch: {
        ...DEFAULT_PSEUDO_MONARCH_STATE,
        ...(parsed.monarch || {}),
        shadows: Array.isArray(parsed.monarch?.shadows) && parsed.monarch.shadows.length > 0
          ? parsed.monarch.shadows
          : DEFAULT_PSEUDO_MONARCH_STATE.shadows
      },
      wearable: {
        ...DEFAULT_WEARABLE_STATE,
        ...(parsed.wearable || {})
      },
      cloudAccount: {
        ...DEFAULT_CLOUD_ACCOUNT,
        ...(parsed.cloudAccount || {})
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
      friends: Array.isArray(parsed.friends) ? parsed.friends : [],
      competitions: Array.isArray(parsed.competitions) && parsed.competitions.length > 0 ? parsed.competitions : DEFAULT_COMPETITIONS,
      batchSubmissions: Array.isArray(parsed.batchSubmissions) ? parsed.batchSubmissions : [],
      syncQueue: Array.isArray(parsed.syncQueue) ? parsed.syncQueue : [],
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
  localStorage.removeItem(LEGACY_KEY_V1);
  localStorage.removeItem(LEGACY_KEY_V2);
}
