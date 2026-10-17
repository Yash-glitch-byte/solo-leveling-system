// SYSTEM REAWAKEN - Core Type Definitions (v2.5)

export type HunterRank = 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank' | 'National Level';

export type QuestCategory =
  | 'fitness'
  | 'study'
  | 'career'
  | 'coding'
  | 'discipline'
  | 'communication'
  | 'personal'
  | 'custom';

export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'epic' | 'boss';

export type QuestStatus = 'available' | 'active' | 'completed' | 'abandoned';

export type AttributeKey = 'strength' | 'vitality' | 'intelligence' | 'focus' | 'discipline' | 'career' | 'communication';

export interface AttributeStats {
  strength: number;      // Physical training & body fitness
  vitality: number;      // Health consistency, sleep, hydration, recovery
  intelligence: number;  // Learning, reading, deep study
  focus: number;         // Sustained deep focus chamber sessions
  discipline: number;    // Routine consistency, no missed habits
  career: number;        // Professional goals, portfolio, interview prep
  communication: number; // Public speaking, writing, networking, language
}

export interface QuestSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export type VerificationTier = 'self_reported' | 'evidence_attached' | 'sensor_supported' | 'verified_milestone';

export interface QuestVerification {
  tier: VerificationTier;
  evidenceUrl?: string;
  notes?: string;
  heartRateAvgBpm?: number;
  verifiedAt?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  durationMinutes: number;
  deadline?: string;           // ISO date string
  repeatSchedule?: 'daily' | 'weekly' | 'custom' | 'none';
  repeatDays?: number[];        // 0 = Sunday, 1 = Monday...
  subtasks: QuestSubtask[];
  attribute: AttributeKey;
  xpReward: number;
  attributePoints: number;
  status: QuestStatus;
  completedAt?: string;
  completionNotes?: string;
  verification?: QuestVerification;
  isDaily: boolean;
  isWeekly?: boolean;
  isMainQuest?: boolean;
}

export interface DungeonObjective {
  id: string;
  text: string;
  completed: boolean;
}

export interface DungeonSession {
  id: string;
  name: string;
  subtitle: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  durationMinutes: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startedAt?: number;
  lastUpdatedAt?: number;
  objectives: DungeonObjective[];
  associatedQuestId?: string;
  xpReward: number;
  attributeBonus: AttributeKey;
  cleared: boolean;
}

export interface CampaignDay {
  dayNumber: number;
  title: string;
  targetMinutes: number;
  requiredQuests: number;
  isRestDay: boolean;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

export interface Campaign {
  id: string;
  type: '21-day' | '66-day' | 'custom';
  title: string;
  description: string;
  totalDays: number;
  currentDay: number;
  categories: QuestCategory[];
  startDate: string;
  isCompleted: boolean;
  days: CampaignDay[];
}

export interface BossObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface BossChallenge {
  id: string;
  name: string;
  title: string;
  rank: HunterRank;
  lore: string;
  hpTotal: number;
  hpCurrent: number;
  difficulty: QuestDifficulty;
  category: QuestCategory;
  rewardXp: number;
  rewardTitle: string;
  rewardAttribute: AttributeKey;
  objectives: BossObjective[];
  defeated: boolean;
  defeatedAt?: string;
}

export interface SkillNode {
  id: string;
  treeId: 'coding' | 'engineering' | 'career' | 'fitness' | 'personal';
  title: string;
  description: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  prerequisites: string[]; // IDs of nodes required
  attributeAffinities: AttributeKey[];
  milestones: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'quests' | 'dungeons' | 'streaks' | 'levels' | 'campaigns' | 'bosses';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progressCurrent: number;
  progressMax: number;
  unlockedTitle?: string;
}

export interface WorkoutSet {
  reps: number;
  weightKg?: number;
  rpe?: number;
}

export interface WorkoutLogEntry {
  id: string;
  date: string;
  exerciseName: string;
  sets: WorkoutSet[];
  durationMinutes: number;
  avgHeartRate?: number;
  notes?: string;
}

export interface DailyActivityRecord {
  date: string; // YYYY-MM-DD
  xpGained: number;
  questsCompleted: number;
  focusMinutes: number;
  categoriesActive: QuestCategory[];
}

// ==========================================
// EQUIPMENT & INVENTORY SYSTEM (E-Ring, Weapons, Armor, Relics)
// ==========================================
export type EquipmentSlot = 'weapon' | 'armor' | 'ring' | 'accessory';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  description: string;
  lore: string;
  statBonus: Partial<AttributeStats>;
  specialEffect?: string;
  isEquipped: boolean;
  icon: string;
  unlockedAtLevel?: number;
}

export interface EquippedGear {
  weapon: EquipmentItem | null;
  armor: EquipmentItem | null;
  ring: EquipmentItem | null;
  accessory: EquipmentItem | null;
}

// ==========================================
// PSEUDO MONARCH SYSTEM
// ==========================================
export interface ShadowCommander {
  id: string;
  name: string;
  title: string;
  lore: string;
  extracted: boolean;
  deployed: boolean;
  statBonus: Partial<AttributeStats>;
  quote: string;
  icon: string;
  requiredBossId?: string;
  requiredLevel: number;
}

export interface PseudoMonarchState {
  unlocked: boolean;
  unlockedAt?: string;
  prestigeRank: string;
  authorityActive: boolean; // Ruler's Authority passive boost
  domainActive: boolean;    // Shadow Domain fatigue reduction
  shadows: ShadowCommander[];
}

// ==========================================
// WEARABLE & BLE HEART RATE SENSOR
// ==========================================
export interface BleWearableState {
  supported: boolean;
  connected: boolean;
  deviceName?: string;
  currentHeartRate?: number;
  batteryLevel?: number;
  lastReadingTime?: number;
}

// ==========================================
// CLOUD SYNCHRONIZATION & ACCOUNTS
// ==========================================
export type CloudSyncStatus = 'local_only' | 'sync_pending' | 'synced' | 'conflict' | 'offline';

export interface CloudAccount {
  hunterId: string;
  username: string;
  cloudSyncEnabled: boolean;
  lastSyncedAt?: string;
  endpointUrl?: string; // Optional custom/Supabase REST endpoint
  accessToken?: string;
}

export interface GameSettings {
  soundFxEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number; // 0.0 to 1.0
  reducedMotion: boolean;
  highContrast: boolean;
  compactHud: boolean;
  autoSaveIntervalSec: number;
  accentColor: 'cyan' | 'electric-purple' | 'amber' | 'emerald';
}

export interface PlayerProfile {
  name: string;
  alias: string;
  avatarSeed: string;
  avatarIcon: string;
  title: string;
  job: string;
  level: number;
  currentXp: number;
  requiredXp: number;
  statPoints: number;
  rank: HunterRank;
  mainGoal: string;
  secondaryGoals: string[];
  preferredTimePerDayMinutes: number;
  preferredDifficulty: QuestDifficulty;
  selectedCategories: QuestCategory[];
  stats: AttributeStats;
  currentStreak: number;
  bestStreak: number;
  totalQuestsCompleted: number;
  totalFocusMinutes: number;
  fatigue: number; // 0 to 100
  lastActiveDate: string; // YYYY-MM-DD
  isOnboarded: boolean;
  dungeonsClearedToday?: number;
  dailyDungeonQuota?: number;
  dungeonQuotaBonusClaimed?: boolean;
}

export interface SystemReawakenState {
  version: number;
  player: PlayerProfile;
  quests: Quest[];
  inventory: EquipmentItem[];
  equippedGear: EquippedGear;
  monarch: PseudoMonarchState;
  wearable: BleWearableState;
  cloudAccount: CloudAccount;
  syncStatus: CloudSyncStatus;
  activeDungeon: DungeonSession | null;
  dungeonTemplates: DungeonSession[];
  campaigns: Campaign[];
  activeCampaignId: string | null;
  bosses: BossChallenge[];
  skills: SkillNode[];
  achievements: Achievement[];
  workoutLogs: WorkoutLogEntry[];
  history: DailyActivityRecord[];
  settings: GameSettings;
  systemNotifications: Array<{
    id: string;
    timestamp: number;
    text: string;
    type: 'system' | 'levelup' | 'reward' | 'warning' | 'achievement';
  }>;
}
