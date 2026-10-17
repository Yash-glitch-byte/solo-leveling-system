/**
 * SOLO LEVELING: THE SYSTEM v2.0
 * Personal Habit & Quest Leveling Application
 * Featuring:
 * - Tabbed Sci-Fi HUD Navigation
 * - Boss Raids & Dungeons with dynamic Boss HP bar
 * - Shadow Army Extraction ("ARISE") with authentic audio synthesis
 * - RPG Equipment & Inventory (Weapons, Armors, Accessories, Potions)
 * - The Penalty Zone (Emergency survival sprint for missed tasks)
 * - Complete data migration, persistence, and JSON backup/restore
 */

// ==========================================
// 1. STATE & STORAGE MANAGEMENT
// ==========================================
const STORAGE_KEY_V2 = 'SOLO_LEVELING_PLAYER_DATA_V2';
const STORAGE_KEY_V1 = 'SOLO_LEVELING_PLAYER_DATA_V1';

const DEFAULT_SHADOWS = [
  {
    id: 'igris',
    name: 'Igris (Blood-Red Commander)',
    rank: 'COMMANDER',
    reqDesc: 'Reach Level 10 or clear C-Rank Gate',
    reqLevel: 10,
    quote: '"My blade shall serve the Shadow Monarch until the end of time."',
    stats: { str: 10, agi: 10 },
    extracted: false,
    active: false,
  },
  {
    id: 'tank',
    name: 'Tank (Ice Bear Alpha)',
    rank: 'ELITE KNIGHT',
    reqDesc: 'Reach Level 15 or clear D-Rank Gate',
    reqLevel: 15,
    quote: '"*Roars with absolute loyalty, frost emitting from heavy claws.*"',
    stats: { vit: 15, str: 5 },
    extracted: false,
    active: false,
  },
  {
    id: 'iron',
    name: 'Iron (Heavy Armored Knight)',
    rank: 'ELITE KNIGHT',
    reqDesc: 'Reach Level 25',
    reqLevel: 25,
    quote: '"*Slams heavy shield to chest in solemn oath.*"',
    stats: { vit: 12, per: 8 },
    extracted: false,
    active: false,
  },
  {
    id: 'tusk',
    name: 'Tusk (High Orc Shaman)',
    rank: 'COMMANDER',
    reqDesc: 'Reach Level 35 or clear B-Rank Gate',
    reqLevel: 35,
    quote: '"The grand flames of destruction belong to my Sovereign."',
    stats: { int: 25, per: 10 },
    extracted: false,
    active: false,
  },
  {
    id: 'kaisel',
    name: 'Kaisel (Shadow Wyvern)',
    rank: 'BEAST COMMANDER',
    reqDesc: 'Reach Level 45 or clear A-Rank Gate',
    reqLevel: 45,
    quote: '"*Spreads wings of dark mist, ready to take flight.*"',
    stats: { agi: 20, per: 15 },
    extracted: false,
    active: false,
  },
  {
    id: 'beru',
    name: 'Beru (Ant King)',
    rank: 'MARSHAL',
    reqDesc: 'Reach Level 50 or clear S-Rank Gate',
    reqLevel: 50,
    quote: '"MY LIEGE! May all who stand before you be crushed beneath your feet!"',
    stats: { str: 20, agi: 20, vit: 20, int: 20, per: 20 },
    extracted: false,
    active: false,
  },
];

const DEFAULT_INVENTORY = [
  {
    id: 'item_dagger_1',
    name: "E-Rank Hunter's Dagger",
    type: 'weapon',
    rarity: 'common',
    stats: { str: 2 },
    desc: 'A basic steel hunting dagger provided to newly awakened hunters.',
    equipped: true,
  },
  {
    id: 'item_fang_1',
    name: "Kasaka's Poison Fang",
    type: 'weapon',
    rarity: 'rare',
    stats: { str: 6, agi: 4 },
    desc: 'Refined from the blue venomous fangs of Swamp Ruler Kasaka.',
    equipped: false,
  },
  {
    id: 'item_armor_1',
    name: "High Knight's Chestplate",
    type: 'armor',
    rarity: 'rare',
    stats: { vit: 8, hp: 40 },
    desc: 'Hardened armor imbued with mana to resist heavy physical impacts.',
    equipped: true,
  },
  {
    id: 'item_ring_1',
    name: "Warden's Choker",
    type: 'accessory',
    rarity: 'rare',
    stats: { per: 5, int: 5 },
    desc: 'Heightens concentration and expands perception of magical energy.',
    equipped: false,
  },
  {
    id: 'potion_full_1',
    name: 'Full Recovery Potion',
    type: 'potion',
    rarity: 'epic',
    quantity: 2,
    stats: { restoreAll: true },
    desc: 'Instantly restores 100% HP & MP and purges all accumulated fatigue.',
    equipped: false,
  },
];

const GATES_CONFIG = {
  E: {
    rank: 'E',
    time: 15,
    title: 'E-RANK GATE: ABANDONED SUBWAY',
    boss: 'Blue-Venom Fang Razan',
    bossDesc: 'A mutated giant beast dwelling within the forgotten tunnels.',
    xpReward: 35,
    statBonus: { per: 1 },
    lootItem: {
      name: "Razan's Claw",
      type: 'weapon',
      rarity: 'common',
      stats: { str: 3, agi: 2 },
      desc: 'Sharp claw carved from Razan.',
    },
  },
  D: {
    rank: 'D',
    time: 25,
    title: "D-RANK GATE: KASAKA'S LAIR",
    boss: 'Swamp Ruler Kasaka',
    bossDesc: 'A venomous giant serpent cloaked in hardened scales. Maintain deep focus to deliver steady damage and clear the gate!',
    xpReward: 65,
    statBonus: { str: 1 },
    lootItem: {
      name: "Kasaka's Poison Fang",
      type: 'weapon',
      rarity: 'rare',
      stats: { str: 6, agi: 4 },
      desc: 'Refined from the fangs of Kasaka.',
    },
  },
  C: {
    rank: 'C',
    time: 45,
    title: 'C-RANK GATE: FROZEN RED GATE',
    boss: 'Ice Elf Baruka',
    bossDesc: 'A lethal warlord commanding frost beasts in a blizzard-swept dimensional rift.',
    xpReward: 120,
    statBonus: { agi: 2 },
    unlockShadow: 'tank',
    lootItem: {
      name: "Baruka's Dagger",
      type: 'weapon',
      rarity: 'epic',
      stats: { agi: 12, str: 8 },
      desc: 'An ice-imbued dagger that increases attack speed.',
    },
  },
  B: {
    rank: 'B',
    time: 60,
    title: 'B-RANK GATE: HIGH ORC CRYPT',
    boss: 'Kargalgan the Great Shaman',
    bossDesc: 'Supreme spellcaster of the High Orcs wielding dark hymns and curse magic.',
    xpReward: 200,
    statBonus: { int: 3 },
    unlockShadow: 'tusk',
    lootItem: {
      name: 'Orb of Avarice',
      type: 'accessory',
      rarity: 'epic',
      stats: { int: 15, per: 8 },
      desc: 'Doubles the potency of offensive magic.',
    },
  },
  A: {
    rank: 'A',
    time: 90,
    title: 'A-RANK GATE: DEMON CASTLE FLOOR 100',
    boss: 'Demon King Baran',
    bossDesc: 'Ruler of the White Flames, riding the wyvern Kaisel in the storm.',
    xpReward: 350,
    statBonus: { str: 4, agi: 4 },
    unlockShadow: 'kaisel',
    lootItem: {
      name: "Demon King's Shortsword",
      type: 'weapon',
      rarity: 'legendary',
      stats: { str: 22, agi: 15 },
      desc: 'Summons violent lightning strikes upon impact.',
    },
  },
  S: {
    rank: 'S',
    time: 120,
    title: 'S-RANK GATE: JEJU ISLAND ANT NEST',
    boss: 'Ant King',
    bossDesc: 'The apex predator born with catastrophic speed, lethal poison, and insatiable hunger.',
    xpReward: 600,
    statBonus: { str: 5, agi: 5, vit: 5, int: 5, per: 5 },
    unlockShadow: 'beru',
    lootItem: {
      name: 'King of the Dead Crown',
      type: 'accessory',
      rarity: 'legendary',
      stats: { all: 10 },
      desc: 'An ancient relic resonating with the absolute ruler.',
    },
  },
};

const DEFAULT_STATE = {
  player: {
    name: 'Sung Jin-woo',
    title: 'The Awakened One',
    job: 'None',
    rank: 'E-Rank Hunter',
    level: 1,
    currentXp: 0,
    requiredXp: 100,
    statPoints: 0,
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    fatigue: 0,
    stats: {
      str: 10,
      agi: 10,
      vit: 10,
      int: 10,
      per: 10,
    },
  },
  quests: [
    { id: 1, text: 'Physical Training: 50 Push-ups / Workout', stat: 'str', xp: 30, completed: false },
    { id: 2, text: 'Intellect Training: Read or Study for 30 minutes', stat: 'int', xp: 30, completed: false },
    { id: 3, text: 'Vitality Boost: Drink 2 Liters of Water', stat: 'vit', xp: 20, completed: false },
    { id: 4, text: 'Agility Routine: Clear workspace & tidy room', stat: 'agi', xp: 20, completed: false },
    { id: 5, text: 'Mind Focus: 10 minutes Meditation / Deep Focus', stat: 'per', xp: 25, completed: false },
  ],
  shadows: DEFAULT_SHADOWS,
  inventory: DEFAULT_INVENTORY,
  claimedDailyBonus: false,
  soundEnabled: true,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  activeGateKey: 'D',
};

let state = loadState();

function loadState() {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      const today = new Date().toISOString().slice(0, 10);
      if (parsed.lastActiveDate !== today) {
        // Accumulate slight fatigue if daily tasks were missed
        const incompleteCount = (parsed.quests || []).filter(q => !q.completed).length;
        if (incompleteCount > 0) {
          parsed.player.fatigue = Math.min(100, (parsed.player.fatigue || 0) + incompleteCount * 10);
        }
        parsed.quests.forEach(q => (q.completed = false));
        parsed.claimedDailyBonus = false;
        parsed.lastActiveDate = today;
      }
      return mergeWithDefault(parsed);
    }

    // Attempt migration from V1
    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      const migrated = mergeWithDefault(parsedV1);
      saveState(migrated);
      return migrated;
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function mergeWithDefault(loaded) {
  const merged = { ...DEFAULT_STATE, ...loaded };
  merged.player = { ...DEFAULT_STATE.player, ...(loaded.player || {}) };
  merged.player.stats = { ...DEFAULT_STATE.player.stats, ...(loaded.player?.stats || {}) };

  // Ensure shadows list has all definitions
  const existingShadows = loaded.shadows || [];
  merged.shadows = DEFAULT_SHADOWS.map(def => {
    const found = existingShadows.find(s => s.id === def.id);
    return found ? { ...def, extracted: found.extracted, active: found.active } : def;
  });

  // Ensure inventory has at least defaults if empty
  merged.inventory = loaded.inventory && loaded.inventory.length ? loaded.inventory : DEFAULT_INVENTORY;
  return merged;
}

function saveState(data = state) {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

// ==========================================
// 2. SYNTHESIZED SOUND EFFECTS (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, delay = 0, gainLevel = 0.1) {
    if (!state.soundEnabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + delay;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainLevel, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Futuristic system alert ping
  ping() {
    this.playTone(880, 'sine', 0.12, 0, 0.08);
    this.playTone(1320, 'sine', 0.18, 0.08, 0.08);
  }

  // Quest completed chime
  questComplete() {
    this.playTone(523.25, 'triangle', 0.12, 0, 0.1);
    this.playTone(659.25, 'triangle', 0.12, 0.08, 0.1);
    this.playTone(783.99, 'triangle', 0.12, 0.16, 0.1);
    this.playTone(1046.5, 'triangle', 0.3, 0.24, 0.15);
  }

  // Epic Level Up Fanfare!
  levelUp() {
    const notes = [440, 554, 659, 880, 1108, 1318, 1760];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sawtooth', 0.22, idx * 0.07, 0.1);
    });
    setTimeout(() => {
      this.playTone(880, 'triangle', 0.8, 0, 0.2);
      this.playTone(1320, 'sine', 0.8, 0, 0.2);
    }, 550);
  }

  // Stat point allocation
  statAdd() {
    this.playTone(700, 'sine', 0.08, 0, 0.08);
    this.playTone(950, 'sine', 0.12, 0.06, 0.08);
  }

  // Epic "ARISE" dark harmonic summoning resonance
  arise() {
    if (!state.soundEnabled) return;
    this.init();
    try {
      // Deep sub-bass resonance
      this.playTone(55, 'sawtooth', 1.8, 0, 0.25);
      this.playTone(110, 'sine', 1.5, 0.1, 0.2);
      // Eerie rising minor chord
      const chords = [220, 261.63, 329.63, 440, 523.25];
      chords.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', 1.2, 0.2 + idx * 0.12, 0.12);
      });
    } catch (e) {
      console.warn('Arise sound error:', e);
    }
  }

  // Boss attack / slash sound
  bossSlash() {
    this.playTone(320, 'sawtooth', 0.15, 0, 0.12);
    this.playTone(160, 'square', 0.2, 0.05, 0.1);
  }

  // Emergency Penalty siren
  penaltyAlert() {
    this.playTone(880, 'sawtooth', 0.18, 0, 0.15);
    this.playTone(660, 'sawtooth', 0.18, 0.18, 0.15);
  }

  // Equip metal sheath sound
  equip() {
    this.playTone(1200, 'sine', 0.08, 0, 0.08);
    this.playTone(800, 'triangle', 0.12, 0.05, 0.08);
  }
}

const sfx = new SoundFX();

// Global click handler to unlock browser audio context
window.addEventListener('click', () => sfx.init(), { once: true });
window.addEventListener('touchstart', () => sfx.init(), { once: true });

// ==========================================
// 3. STAT & ATTRIBUTE CALCULATOR
// ==========================================
function getEffectiveStats() {
  const p = state.player;
  const effective = {
    str: p.stats.str,
    agi: p.stats.agi,
    vit: p.stats.vit,
    int: p.stats.int,
    per: p.stats.per,
  };

  const buffsList = [];

  // Add Equipment bonuses
  state.inventory.forEach(item => {
    if (item.equipped && item.stats) {
      Object.keys(item.stats).forEach(statKey => {
        if (effective[statKey] !== undefined) {
          effective[statKey] += item.stats[statKey];
          buffsList.push(`${item.name}: +${item.stats[statKey]} ${statKey.toUpperCase()}`);
        } else if (statKey === 'all') {
          Object.keys(effective).forEach(k => {
            effective[k] += item.stats[statKey];
          });
          buffsList.push(`${item.name}: +${item.stats[statKey]} to ALL STATS`);
        }
      });
    }
  });

  // Add Active Shadow Legion bonuses
  state.shadows.forEach(shadow => {
    if (shadow.active && shadow.stats) {
      Object.keys(shadow.stats).forEach(statKey => {
        if (effective[statKey] !== undefined) {
          effective[statKey] += shadow.stats[statKey];
          buffsList.push(`${shadow.name.split(' ')[0]}: +${shadow.stats[statKey]} ${statKey.toUpperCase()}`);
        }
      });
    }
  });

  return { effective, buffsList };
}

function getHunterRank(level) {
  if (level >= 100) return 'SHADOW MONARCH';
  if (level >= 75) return 'NATIONAL LEVEL HUNTER';
  if (level >= 50) return 'S-RANK HUNTER';
  if (level >= 35) return 'A-RANK HUNTER';
  if (level >= 20) return 'B-RANK HUNTER';
  if (level >= 10) return 'C-RANK HUNTER';
  if (level >= 5) return 'D-RANK HUNTER';
  return 'E-RANK HUNTER';
}

function getHunterTitle(level) {
  if (level >= 100) return 'Title: "Ruler of Shadows"';
  if (level >= 75) return 'Title: "Pinnacle of Mankind"';
  if (level >= 50) return 'Title: "Cataclysmic Hero"';
  if (level >= 35) return 'Title: "Demon Hunter"';
  if (level >= 20) return 'Title: "Dungeon Consecrator"';
  if (level >= 10) return 'Title: "Wolf Slayer"';
  if (level >= 5) return 'Title: "One Who Overcomes"';
  return 'Title: "The Awakened One"';
}

function getHunterJob(level) {
  if (level >= 70) return 'Shadow Monarch';
  if (level >= 40) return 'Necromancer';
  if (level >= 20) return 'Mage-Assassin';
  return 'None';
}

function addXp(amount) {
  state.player.currentXp += amount;
  logMessage(`[EXP GAINED] +${amount} EXP added to status.`, 'quest-done');

  let leveledUp = false;
  while (state.player.currentXp >= state.player.requiredXp) {
    state.player.currentXp -= state.player.requiredXp;
    state.player.level += 1;
    state.player.requiredXp = Math.floor(state.player.requiredXp * 1.35);
    state.player.statPoints += 5;
    state.player.maxHp += 25;
    state.player.hp = state.player.maxHp;
    state.player.maxMp += 20;
    state.player.mp = state.player.maxMp;
    state.player.fatigue = Math.max(0, state.player.fatigue - 30);
    leveledUp = true;
  }

  state.player.rank = getHunterRank(state.player.level);
  state.player.title = getHunterTitle(state.player.level);
  state.player.job = getHunterJob(state.player.level);

  if (leveledUp) {
    sfx.levelUp();
    showLevelUpModal(state.player.level);
    logMessage(`[SYSTEM ALERT] LEVEL UP! Player has reached Level ${state.player.level}!`, 'level-up');
    checkShadowExtractionEligibility();
  }

  saveState();
  render();
}

function checkShadowExtractionEligibility() {
  state.shadows.forEach(shadow => {
    if (!shadow.extracted && state.player.level >= shadow.reqLevel) {
      logMessage(`[SOUL RESONANCE] Soul of ${shadow.name} is ready for extraction!`, 'arise');
    }
  });
}

// ==========================================
// 4. DOM REFERENCES
// ==========================================
const DOM = {
  // Navigation & utilities
  backupBtn: document.getElementById('backupBtn'),
  restoreFileInput: document.getElementById('restoreFileInput'),
  installAppBtn: document.getElementById('installAppBtn'),
  soundToggleBtn: document.getElementById('soundToggleBtn'),
  soundIcon: document.getElementById('soundIcon'),
  soundStatus: document.getElementById('soundStatus'),
  ambientGlow: document.getElementById('ambientGlow'),
  questPendingBadge: document.getElementById('questPendingBadge'),
  shadowCountBadge: document.getElementById('shadowCountBadge'),

  // Status Window
  hunterRank: document.getElementById('hunterRank'),
  avatarFrame: document.getElementById('avatarFrame'),
  playerAvatar: document.getElementById('playerAvatar'),
  playerName: document.getElementById('playerName'),
  playerTitle: document.getElementById('playerTitle'),
  playerJob: document.getElementById('playerJob'),
  playerLevel: document.getElementById('playerLevel'),
  xpValues: document.getElementById('xpValues'),
  xpBarFill: document.getElementById('xpBarFill'),
  hpValues: document.getElementById('hpValues'),
  hpBarFill: document.getElementById('hpBarFill'),
  mpValues: document.getElementById('mpValues'),
  mpBarFill: document.getElementById('mpBarFill'),
  fatigueValues: document.getElementById('fatigueValues'),
  fatigueBarFill: document.getElementById('fatigueBarFill'),
  statPointsBadge: document.getElementById('statPointsBadge'),
  statPointsValue: document.getElementById('statPointsValue'),
  statStr: document.getElementById('statStr'),
  statAgi: document.getElementById('statAgi'),
  statVit: document.getElementById('statVit'),
  statInt: document.getElementById('statInt'),
  statPer: document.getElementById('statPer'),
  breakdownStr: document.getElementById('breakdownStr'),
  breakdownAgi: document.getElementById('breakdownAgi'),
  breakdownVit: document.getElementById('breakdownVit'),
  breakdownInt: document.getElementById('breakdownInt'),
  breakdownPer: document.getElementById('breakdownPer'),
  buffTagsList: document.getElementById('buffTagsList'),
  resetDayBtn: document.getElementById('resetDayBtn'),
  restartPlayerBtn: document.getElementById('restartPlayerBtn'),

  // Quests
  questList: document.getElementById('questList'),
  dailyPercent: document.getElementById('dailyPercent'),
  claimDailyBonusBtn: document.getElementById('claimDailyBonusBtn'),
  addQuestForm: document.getElementById('addQuestForm'),
  questInput: document.getElementById('questInput'),
  statAffinity: document.getElementById('statAffinity'),

  // Dungeon & Gates
  activeGateTitle: document.getElementById('activeGateTitle'),
  gatePillsRow: document.getElementById('gatePillsRow'),
  bossName: document.getElementById('bossName'),
  bossHpText: document.getElementById('bossHpText'),
  bossHpFill: document.getElementById('bossHpFill'),
  bossDesc: document.getElementById('bossDesc'),
  timerDisplay: document.getElementById('timerDisplay'),
  timerStartBtn: document.getElementById('timerStartBtn'),
  timerResetBtn: document.getElementById('timerResetBtn'),
  gateRewardText: document.getElementById('gateRewardText'),

  // Shadows
  shadowsGrid: document.getElementById('shadowsGrid'),

  // Inventory
  equippedWeapon: document.getElementById('equippedWeapon'),
  equippedArmor: document.getElementById('equippedArmor'),
  equippedAccessory: document.getElementById('equippedAccessory'),
  inventoryGrid: document.getElementById('inventoryGrid'),

  // Penalty Zone
  penaltyTimerDisplay: document.getElementById('penaltyTimerDisplay'),
  startPenaltyBtn: document.getElementById('startPenaltyBtn'),
  cancelPenaltyBtn: document.getElementById('cancelPenaltyBtn'),

  // Logs
  systemLogs: document.getElementById('systemLogs'),
  clearLogsBtn: document.getElementById('clearLogsBtn'),

  // Modals
  levelUpModal: document.getElementById('levelUpModal'),
  modalNewLevel: document.getElementById('modalNewLevel'),
  closeLevelUpBtn: document.getElementById('closeLevelUpBtn'),
  lootModal: document.getElementById('lootModal'),
  lootRewardText: document.getElementById('lootRewardText'),
  closeLootBtn: document.getElementById('closeLootBtn'),
  questAlertModal: document.getElementById('questAlertModal'),
  acceptQuestBtn: document.getElementById('acceptQuestBtn'),
  ariseModal: document.getElementById('ariseModal'),
  ariseModalTitle: document.getElementById('ariseModalTitle'),
  ariseShadowName: document.getElementById('ariseShadowName'),
  ariseSpeech: document.getElementById('ariseSpeech'),
  ariseRewardsText: document.getElementById('ariseRewardsText'),
  closeAriseBtn: document.getElementById('closeAriseBtn'),
  gateClearModal: document.getElementById('gateClearModal'),
  clearedGateName: document.getElementById('clearedGateName'),
  gateClearRewards: document.getElementById('gateClearRewards'),
  closeGateClearBtn: document.getElementById('closeGateClearBtn'),
};

// ==========================================
// 5. RENDERING & UI UPDATES
// ==========================================
function render() {
  const p = state.player;
  const { effective, buffsList } = getEffectiveStats();

  // Header & Identity
  if (DOM.hunterRank) DOM.hunterRank.textContent = p.rank;
  if (DOM.playerName) DOM.playerName.textContent = p.name;
  if (DOM.playerTitle) DOM.playerTitle.textContent = p.title;
  if (DOM.playerJob) DOM.playerJob.textContent = `Job: ${p.job}`;
  if (DOM.playerAvatar) {
    DOM.playerAvatar.textContent = p.name
      ? p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      : 'SL';
  }

  // Level & XP
  if (DOM.playerLevel) DOM.playerLevel.textContent = p.level;
  if (DOM.xpValues) DOM.xpValues.textContent = `${p.currentXp} / ${p.requiredXp} XP`;
  const xpPct = Math.min(100, Math.floor((p.currentXp / p.requiredXp) * 100));
  if (DOM.xpBarFill) DOM.xpBarFill.style.width = `${xpPct}%`;

  // Vitals
  if (DOM.hpValues) DOM.hpValues.textContent = `${p.hp} / ${p.maxHp}`;
  if (DOM.hpBarFill) DOM.hpBarFill.style.width = `${Math.min(100, (p.hp / p.maxHp) * 100)}%`;
  if (DOM.mpValues) DOM.mpValues.textContent = `${p.mp} / ${p.maxMp}`;
  if (DOM.mpBarFill) DOM.mpBarFill.style.width = `${Math.min(100, (p.mp / p.maxMp) * 100)}%`;
  if (DOM.fatigueValues) DOM.fatigueValues.textContent = `${p.fatigue || 0}%`;
  if (DOM.fatigueBarFill) DOM.fatigueBarFill.style.width = `${Math.min(100, p.fatigue || 0)}%`;

  // Stat Points
  if (DOM.statPointsValue) DOM.statPointsValue.textContent = p.statPoints;
  if (DOM.statPointsBadge) {
    if (p.statPoints > 0) DOM.statPointsBadge.classList.add('pulse');
    else DOM.statPointsBadge.classList.remove('pulse');
  }

  // Attributes (Effective vs Base Breakdown)
  if (DOM.statStr) DOM.statStr.textContent = effective.str;
  if (DOM.breakdownStr) DOM.breakdownStr.textContent = `Base: ${p.stats.str} ${effective.str > p.stats.str ? `(+${effective.str - p.stats.str})` : ''}`;

  if (DOM.statAgi) DOM.statAgi.textContent = effective.agi;
  if (DOM.breakdownAgi) DOM.breakdownAgi.textContent = `Base: ${p.stats.agi} ${effective.agi > p.stats.agi ? `(+${effective.agi - p.stats.agi})` : ''}`;

  if (DOM.statVit) DOM.statVit.textContent = effective.vit;
  if (DOM.breakdownVit) DOM.breakdownVit.textContent = `Base: ${p.stats.vit} ${effective.vit > p.stats.vit ? `(+${effective.vit - p.stats.vit})` : ''}`;

  if (DOM.statInt) DOM.statInt.textContent = effective.int;
  if (DOM.breakdownInt) DOM.breakdownInt.textContent = `Base: ${p.stats.int} ${effective.int > p.stats.int ? `(+${effective.int - p.stats.int})` : ''}`;

  if (DOM.statPer) DOM.statPer.textContent = effective.per;
  if (DOM.breakdownPer) DOM.breakdownPer.textContent = `Base: ${p.stats.per} ${effective.per > p.stats.per ? `(+${effective.per - p.stats.per})` : ''}`;

  // Stat point allocation buttons
  document.querySelectorAll('.add-stat-btn').forEach(btn => {
    btn.disabled = p.statPoints <= 0;
  });

  // Active Buffs Box
  if (DOM.buffTagsList) {
    if (buffsList.length === 0) {
      DOM.buffTagsList.innerHTML = '<span class="buff-tag default-tag">No equipment or shadow buffs active</span>';
    } else {
      DOM.buffTagsList.innerHTML = buffsList
        .map(b => `<span class="buff-tag ${b.includes('Igris') || b.includes('Tank') || b.includes('Iron') || b.includes('Tusk') || b.includes('Beru') || b.includes('Kaisel') ? 'shadow-tag' : ''}">${escapeHtml(b)}</span>`)
        .join('');
    }
  }

  // Sound toggle button
  if (DOM.soundStatus) DOM.soundStatus.textContent = state.soundEnabled ? 'ACTIVE' : 'MUTED';
  if (DOM.soundIcon) DOM.soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';

  renderQuests();
  renderGateSelection();
  renderShadows();
  renderInventory();
}

function renderQuests() {
  if (!DOM.questList) return;
  DOM.questList.innerHTML = '';

  const total = state.quests.length;
  const completedCount = state.quests.filter(q => q.completed).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (DOM.dailyPercent) DOM.dailyPercent.textContent = `${percent}%`;
  if (DOM.questPendingBadge) DOM.questPendingBadge.textContent = total - completedCount;

  // Claim Daily Box button
  if (DOM.claimDailyBonusBtn) {
    if (percent === 100 && !state.claimedDailyBonus) {
      DOM.claimDailyBonusBtn.disabled = false;
      DOM.claimDailyBonusBtn.textContent = '🎁 CLAIM BLESSED RANDOM BOX';
    } else {
      DOM.claimDailyBonusBtn.disabled = true;
      if (state.claimedDailyBonus) {
        DOM.claimDailyBonusBtn.textContent = '✔ DAILY REWARD CLAIMED';
      } else {
        DOM.claimDailyBonusBtn.textContent = '🎁 CLAIM BLESSED RANDOM BOX';
      }
    }
  }

  state.quests.forEach(quest => {
    const li = document.createElement('li');
    li.className = `quest-item ${quest.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div class="quest-left">
        <input type="checkbox" class="quest-checkbox" data-id="${quest.id}" ${quest.completed ? 'checked' : ''} aria-label="Complete quest">
        <div class="quest-text-block">
          <span class="quest-text">${escapeHtml(quest.text)}</span>
          <span class="quest-meta-tag">+${quest.xp} EXP • [${quest.stat.toUpperCase()}]</span>
        </div>
      </div>
      <div class="quest-right">
        <span class="quest-reward-pill">+${quest.xp} XP</span>
        <button class="delete-quest-btn" data-id="${quest.id}" title="Remove Quest">✕</button>
      </div>
    `;

    DOM.questList.appendChild(li);
  });
}

function renderGateSelection() {
  const gate = GATES_CONFIG[state.activeGateKey] || GATES_CONFIG.D;

  if (DOM.activeGateTitle) DOM.activeGateTitle.textContent = gate.title;
  if (DOM.bossName) DOM.bossName.textContent = gate.boss;
  if (DOM.bossDesc) DOM.bossDesc.textContent = gate.bossDesc;
  if (DOM.gateRewardText) {
    const statText = Object.entries(gate.statBonus).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
    DOM.gateRewardText.textContent = `+${gate.xpReward} EXP, ${statText}${gate.lootItem ? `, Chance of [${gate.lootItem.name}]` : ''}`;
  }

  // Update gate pills
  if (DOM.gatePillsRow) {
    DOM.gatePillsRow.querySelectorAll('.gate-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.gate === state.activeGateKey);
    });
  }
}

function renderShadows() {
  if (!DOM.shadowsGrid) return;
  DOM.shadowsGrid.innerHTML = '';

  const activeCount = state.shadows.filter(s => s.active).length;
  if (DOM.shadowCountBadge) DOM.shadowCountBadge.textContent = activeCount;

  state.shadows.forEach(shadow => {
    const isUnlocked = state.player.level >= shadow.reqLevel;
    const canArise = isUnlocked && !shadow.extracted;

    const div = document.createElement('div');
    div.className = `shadow-card-item ${shadow.extracted ? 'extracted' : ''} ${shadow.active ? 'active-legion' : ''}`;

    const statText = Object.entries(shadow.stats)
      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
      .join(' • ');

    div.innerHTML = `
      <div class="shadow-header-row">
        <span class="shadow-rank-tag">${shadow.rank}</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: ${shadow.active ? '#34d399' : shadow.extracted ? '#c084fc' : '#7f9ebc'};">
          ${shadow.active ? '● DEPLOYED' : shadow.extracted ? 'RESERVE' : 'LOCKED'}
        </span>
      </div>
      <h3 class="shadow-name">${escapeHtml(shadow.name)}</h3>
      <p class="shadow-desc">${escapeHtml(shadow.quote)}</p>
      <div class="shadow-passives">Buffs: ${statText}</div>
      <div class="shadow-footer-action">
        ${
          canArise
            ? `<button class="shadow-action-btn arise-action-btn" data-arise="${shadow.id}">⚡ ARISE (EXTRACT SHADOW)</button>`
            : shadow.extracted
            ? shadow.active
              ? `<button class="shadow-action-btn deployed-btn" data-toggle="${shadow.id}">✔ DEPLOYED (CLICK TO RECALL)</button>`
              : `<button class="shadow-action-btn deploy-btn" data-toggle="${shadow.id}">DEPLOY TO LEGION (${activeCount}/3)</button>`
            : `<button class="shadow-action-btn locked-btn" disabled>REQUIRES LVL ${shadow.reqLevel}</button>`
        }
      </div>
    `;

    DOM.shadowsGrid.appendChild(div);
  });
}

function renderInventory() {
  if (!DOM.inventoryGrid) return;
  DOM.inventoryGrid.innerHTML = '';

  // Current equipped gear display
  const equippedWeapon = state.inventory.find(i => i.type === 'weapon' && i.equipped);
  const equippedArmor = state.inventory.find(i => i.type === 'armor' && i.equipped);
  const equippedAcc = state.inventory.find(i => i.type === 'accessory' && i.equipped);

  if (DOM.equippedWeapon) DOM.equippedWeapon.textContent = equippedWeapon ? equippedWeapon.name : 'Empty';
  if (DOM.equippedArmor) DOM.equippedArmor.textContent = equippedArmor ? equippedArmor.name : 'Empty';
  if (DOM.equippedAccessory) DOM.equippedAccessory.textContent = equippedAcc ? equippedAcc.name : 'Empty';

  state.inventory.forEach(item => {
    const div = document.createElement('div');
    div.className = `item-tile rarity-${item.rarity || 'common'}`;

    const statText = item.stats
      ? Object.entries(item.stats)
          .map(([k, v]) => (k === 'restoreAll' ? 'Restores 100% HP & MP' : `+${v} ${k.toUpperCase()}`))
          .join(', ')
      : '';

    div.innerHTML = `
      <div class="item-name">${escapeHtml(item.name)} ${item.quantity ? `(x${item.quantity})` : ''}</div>
      <div class="item-type">${item.type.toUpperCase()} • ${item.rarity ? item.rarity.toUpperCase() : 'COMMON'}</div>
      <div class="item-stats">${statText}</div>
      <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 8px;">${escapeHtml(item.desc || '')}</p>
      <div class="item-action-link">
        ${
          item.type === 'potion'
            ? 'USE POTION 🧪'
            : item.equipped
            ? 'UNEQUIP ↩'
            : 'EQUIP ITEM ⚔'
        }
      </div>
    `;

    div.addEventListener('click', () => {
      handleInventoryAction(item);
    });

    DOM.inventoryGrid.appendChild(div);
  });
}

function handleInventoryAction(item) {
  if (item.type === 'potion') {
    // Consume potion
    state.player.hp = state.player.maxHp;
    state.player.mp = state.player.maxMp;
    state.player.fatigue = 0;
    if (item.quantity && item.quantity > 1) {
      item.quantity -= 1;
    } else {
      state.inventory = state.inventory.filter(i => i.id !== item.id);
    }
    sfx.levelUp();
    logMessage(`[POTION CONSUMED] Used ${item.name}! HP, MP & Fatigue fully restored.`, 'quest-done');
  } else {
    // Equip / Unequip
    if (item.equipped) {
      item.equipped = false;
      sfx.ping();
      logMessage(`[UNEQUIPPED] ${item.name} moved to bag.`);
    } else {
      // Unequip currently equipped item in the same slot
      state.inventory.forEach(other => {
        if (other.type === item.type && other.equipped) {
          other.equipped = false;
        }
      });
      item.equipped = true;
      sfx.equip();
      logMessage(`[EQUIPPED] ${item.name} equipped.`);
    }
  }

  saveState();
  render();
}

function logMessage(text, className = '') {
  if (!DOM.systemLogs) return;
  const entry = document.createElement('div');
  entry.className = `log-entry ${className}`;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  entry.textContent = `[${time}] ${text}`;
  DOM.systemLogs.prepend(entry);
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==========================================
// 6. TAB NAVIGATION LOGIC
// ==========================================
const tabButtons = document.querySelectorAll('.sys-tab-btn');
const tabPanes = {
  'tab-quests': document.getElementById('pane-quests'),
  'tab-dungeon': document.getElementById('pane-dungeon'),
  'tab-shadows': document.getElementById('pane-shadows'),
  'tab-inventory': document.getElementById('pane-inventory'),
  'tab-penalty': document.getElementById('pane-penalty'),
};
const statusColumn = document.getElementById('tab-status');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    sfx.ping();

    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // On mobile, if clicking 'tab-status'
    if (targetTab === 'tab-status') {
      if (statusColumn) statusColumn.classList.add('active');
      Object.values(tabPanes).forEach(pane => pane && pane.classList.remove('active'));
      return;
    }

    if (statusColumn) statusColumn.classList.remove('active');

    // Toggle corresponding right pane
    Object.entries(tabPanes).forEach(([tabKey, pane]) => {
      if (pane) {
        if (tabKey === targetTab) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      }
    });

    // Special ambient glow for Penalty or Shadows
    if (DOM.ambientGlow) {
      if (targetTab === 'tab-penalty') {
        DOM.ambientGlow.style.background = 'radial-gradient(circle, rgba(255, 51, 102, 0.25) 0%, transparent 70%)';
      } else if (targetTab === 'tab-shadows') {
        DOM.ambientGlow.style.background = 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)';
      } else {
        DOM.ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 210, 255, 0.12) 0%, transparent 70%)';
      }
    }
  });
});

// Default active tab: Quests pane
if (tabPanes['tab-quests']) {
  tabPanes['tab-quests'].classList.add('active');
}

// ==========================================
// 7. EVENT LISTENERS & USER ACTIONS
// ==========================================

// Sound Toggle
if (DOM.soundToggleBtn) {
  DOM.soundToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    if (state.soundEnabled) sfx.ping();
    saveState();
    render();
  });
}

// Edit Player Name
if (DOM.playerName) {
  DOM.playerName.addEventListener('blur', () => {
    const newName = DOM.playerName.textContent.trim();
    if (newName) {
      state.player.name = newName;
      saveState();
      render();
      logMessage(`[SYSTEM] Player identity recognized as: ${newName}`);
    }
  });
  DOM.playerName.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      DOM.playerName.blur();
    }
  });
}

// Stat Point Allocation
document.querySelectorAll('.add-stat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (state.player.statPoints > 0) {
      const statKey = btn.dataset.target;
      state.player.stats[statKey] += 1;
      state.player.statPoints -= 1;
      sfx.statAdd();
      logMessage(`[STAT ALLOCATED] +1 point invested in ${statKey.toUpperCase()}.`);
      saveState();
      render();
    }
  });
});

// Toggle Quest Completion
if (DOM.questList) {
  DOM.questList.addEventListener('change', e => {
    if (e.target.classList.contains('quest-checkbox')) {
      const questId = Number(e.target.dataset.id);
      const quest = state.quests.find(q => q.id === questId);
      if (quest) {
        quest.completed = e.target.checked;
        if (quest.completed) {
          sfx.questComplete();
          addXp(quest.xp);
          // Reduce fatigue
          state.player.fatigue = Math.max(0, state.player.fatigue - 5);
          logMessage(`[AFFINITY] ${quest.stat.toUpperCase()} resonated with task completion!`);
        } else {
          state.player.currentXp = Math.max(0, state.player.currentXp - quest.xp);
          saveState();
          render();
        }
        saveState();
        render();
      }
    }
  });

  // Delete Quest
  DOM.questList.addEventListener('click', e => {
    if (e.target.classList.contains('delete-quest-btn')) {
      const questId = Number(e.target.dataset.id);
      state.quests = state.quests.filter(q => q.id !== questId);
      saveState();
      render();
    }
  });
}

// Add New Custom Quest
if (DOM.addQuestForm) {
  DOM.addQuestForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = DOM.questInput.value.trim();
    const stat = DOM.statAffinity.value;
    if (!text) return;

    const newQuest = {
      id: Date.now(),
      text: text,
      stat: stat,
      xp: 25,
      completed: false,
    };

    state.quests.push(newQuest);
    DOM.questInput.value = '';
    sfx.ping();
    logMessage(`[NEW QUEST REGISTERED] "${text}" assigned.`);
    saveState();
    render();
  });
}

// Reset Day's Quests
if (DOM.resetDayBtn) {
  DOM.resetDayBtn.addEventListener('click', () => {
    if (confirm("Reset today's daily quests checklist to uncompleted?")) {
      state.quests.forEach(q => (q.completed = false));
      state.claimedDailyBonus = false;
      saveState();
      render();
      logMessage('[SYSTEM] Daily quest checklist has been reset.');
    }
  });
}

// Full Reset All Data
if (DOM.restartPlayerBtn) {
  DOM.restartPlayerBtn.addEventListener('click', () => {
    if (confirm('WARNING: Are you sure you want to completely wipe all hunter levels, stats, shadows, and items?')) {
      localStorage.removeItem(STORAGE_KEY_V2);
      localStorage.removeItem(STORAGE_KEY_V1);
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
      render();
      logMessage('[SYSTEM] All player memory purged. System rebooted.');
    }
  });
}

// Clear Logs
if (DOM.clearLogsBtn) {
  DOM.clearLogsBtn.addEventListener('click', () => {
    if (DOM.systemLogs) DOM.systemLogs.innerHTML = '';
  });
}

// Level Up Modal Close
if (DOM.closeLevelUpBtn) {
  DOM.closeLevelUpBtn.addEventListener('click', () => {
    if (DOM.levelUpModal) DOM.levelUpModal.classList.remove('active');
    sfx.ping();
  });
}

function showLevelUpModal(level) {
  if (DOM.modalNewLevel) DOM.modalNewLevel.textContent = level;
  if (DOM.levelUpModal) DOM.levelUpModal.classList.add('active');
}

// Daily Loot Reward Box (Fixed & Expanded!)
const RANDOM_LOOT_ITEMS = [
  { text: 'Elixir of Life: 1x Full Recovery Potion added to inventory!', type: 'potion' },
  { text: 'Demon Monarch Feast: Enjoy a high-protein guilt-free banquet!', stat: 'str' },
  { text: 'Wisdom of the Vault: Read a non-fiction chapter or article!', stat: 'int' },
  { text: "Kasaka's Venom Vial: +150 EXP and +3 Free Stat Points!", bonusXp: 150 },
  { text: 'Blessing of Vitality: Enjoy 8 hours of restorative deep sleep!', stat: 'vit' },
];

if (DOM.claimDailyBonusBtn) {
  DOM.claimDailyBonusBtn.addEventListener('click', () => {
    if (DOM.claimDailyBonusBtn.disabled) return;
    state.claimedDailyBonus = true;
    addXp(100);
    state.player.statPoints += 2;
    state.player.fatigue = 0;
    sfx.levelUp();

    const selectedReward = RANDOM_LOOT_ITEMS[Math.floor(Math.random() * RANDOM_LOOT_ITEMS.length)];

    if (selectedReward.type === 'potion') {
      state.inventory.push({
        id: `potion_loot_${Date.now()}`,
        name: 'Full Recovery Potion',
        type: 'potion',
        rarity: 'epic',
        quantity: 1,
        stats: { restoreAll: true },
        desc: 'Restores 100% HP & MP and wipes all fatigue.',
        equipped: false,
      });
    }

    if (DOM.lootRewardText) {
      DOM.lootRewardText.innerHTML = `
        <strong>🎁 ITEM ACQUIRED:</strong><br><br>
        <span style="color: #00d2ff; font-size: 1.25rem;">${selectedReward.text}</span><br><br>
        <em>Bonus: +100 EXP, +2 Free Stat Points, and Fatigue Cleared!</em>
      `;
    }

    if (DOM.lootModal) DOM.lootModal.classList.add('active');
    saveState();
    render();
  });
}

if (DOM.closeLootBtn) {
  DOM.closeLootBtn.addEventListener('click', () => {
    if (DOM.lootModal) DOM.lootModal.classList.remove('active');
    sfx.ping();
  });
}

// ==========================================
// 8. DUNGEON GATES & BOSS RAIDS (FOCUS TIMER)
// ==========================================
let timerSeconds = 25 * 60;
let totalGateSeconds = 25 * 60;
let timerInterval = null;
let isTimerRunning = false;

function setGateDifficulty(gateKey) {
  const config = GATES_CONFIG[gateKey];
  if (!config) return;

  state.activeGateKey = gateKey;
  totalGateSeconds = config.time * 60;
  timerSeconds = totalGateSeconds;

  clearInterval(timerInterval);
  isTimerRunning = false;

  if (DOM.timerStartBtn) {
    DOM.timerStartBtn.textContent = 'ENTER GATE';
    DOM.timerStartBtn.style.background = '';
  }

  updateTimerDisplay();
  updateBossHealth(100);
  renderGateSelection();
  saveState();
}

if (DOM.gatePillsRow) {
  DOM.gatePillsRow.addEventListener('click', e => {
    const pill = e.target.closest('.gate-pill');
    if (pill && pill.dataset.gate) {
      sfx.ping();
      setGateDifficulty(pill.dataset.gate);
    }
  });
}

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const s = (timerSeconds % 60).toString().padStart(2, '0');
  if (DOM.timerDisplay) DOM.timerDisplay.textContent = `${m}:${s}`;
}

function updateBossHealth(percent) {
  if (DOM.bossHpText) DOM.bossHpText.textContent = `BOSS HP: ${Math.max(0, Math.round(percent))}%`;
  if (DOM.bossHpFill) DOM.bossHpFill.style.width = `${Math.max(0, percent)}%`;
}

if (DOM.timerStartBtn) {
  DOM.timerStartBtn.addEventListener('click', () => {
    if (!isTimerRunning) {
      isTimerRunning = true;
      DOM.timerStartBtn.textContent = 'PAUSE RAID';
      DOM.timerStartBtn.style.background = '#e11d48';
      sfx.ping();
      const currentGate = GATES_CONFIG[state.activeGateKey] || GATES_CONFIG.D;
      logMessage(`[GATE ENTERED] Entered ${currentGate.title}. Maintain focus to defeat ${currentGate.boss}!`);

      timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();

        // Drain Boss HP as timer ticks down!
        const remainingPct = (timerSeconds / totalGateSeconds) * 100;
        updateBossHealth(remainingPct);

        // Periodic slash sound every 5 minutes of focus
        if (timerSeconds % 300 === 0 && timerSeconds > 0) {
          sfx.bossSlash();
          logMessage(`[STRIKE] Critical hit delivered to ${currentGate.boss}!`);
        }

        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          isTimerRunning = false;
          timerSeconds = totalGateSeconds;
          updateTimerDisplay();
          updateBossHealth(0);

          DOM.timerStartBtn.textContent = 'ENTER GATE';
          DOM.timerStartBtn.style.background = '';

          // Defeat Boss and give Rewards
          handleGateCleared(currentGate);
        }
      }, 1000);
    } else {
      clearInterval(timerInterval);
      isTimerRunning = false;
      DOM.timerStartBtn.textContent = 'RESUME RAID';
      DOM.timerStartBtn.style.background = '';
      logMessage('[RAID PAUSED] Focus paused.');
    }
  });
}

if (DOM.timerResetBtn) {
  DOM.timerResetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSeconds = totalGateSeconds;
    updateTimerDisplay();
    updateBossHealth(100);
    if (DOM.timerStartBtn) {
      DOM.timerStartBtn.textContent = 'ENTER GATE';
      DOM.timerStartBtn.style.background = '';
    }
  });
}

function handleGateCleared(gate) {
  sfx.levelUp();
  addXp(gate.xpReward);

  // Apply stat bonuses
  Object.entries(gate.statBonus).forEach(([statKey, amount]) => {
    if (state.player.stats[statKey] !== undefined) {
      state.player.stats[statKey] += amount;
    }
  });

  // Award loot item
  if (gate.lootItem) {
    const existing = state.inventory.find(i => i.name === gate.lootItem.name);
    if (!existing) {
      state.inventory.push({ ...gate.lootItem, id: `loot_${Date.now()}`, equipped: false });
    }
  }

  // Check shadow unlocking
  if (gate.unlockShadow) {
    const targetShadow = state.shadows.find(s => s.id === gate.unlockShadow);
    if (targetShadow && !targetShadow.extracted) {
      logMessage(`[SHADOW MONARCH AWAKENING] The soul of ${targetShadow.name} is now available to ARISE!`, 'arise');
    }
  }

  // Populate Gate Clear Modal
  if (DOM.clearedGateName) DOM.clearedGateName.textContent = `${gate.boss} Defeated!`;
  if (DOM.gateClearRewards) {
    const statText = Object.entries(gate.statBonus).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
    DOM.gateClearRewards.innerHTML = `
      <p>✦ <strong>EXP:</strong> +${gate.xpReward} EXP</p>
      <p>✦ <strong>Attribute Boost:</strong> ${statText}</p>
      ${gate.lootItem ? `<p>✦ <strong>Item Acquired:</strong> [${gate.lootItem.name}]</p>` : ''}
      <p style="color: #34d399; margin-top: 8px;">✦ Fatigue Reduced by 25%!</p>
    `;
  }

  state.player.fatigue = Math.max(0, state.player.fatigue - 25);
  if (DOM.gateClearModal) DOM.gateClearModal.classList.add('active');
  saveState();
  render();
}

if (DOM.closeGateClearBtn) {
  DOM.closeGateClearBtn.addEventListener('click', () => {
    if (DOM.gateClearModal) DOM.gateClearModal.classList.remove('active');
    sfx.ping();
  });
}

// ==========================================
// 9. SHADOW ARMY & "ARISE" EXTRACTION
// ==========================================
if (DOM.shadowsGrid) {
  DOM.shadowsGrid.addEventListener('click', e => {
    // Check for "ARISE" button
    const ariseBtn = e.target.closest('[data-arise]');
    if (ariseBtn) {
      const shadowId = ariseBtn.dataset.arise;
      const shadow = state.shadows.find(s => s.id === shadowId);
      if (shadow) {
        performShadowExtraction(shadow);
      }
      return;
    }

    // Check for "DEPLOY / RECALL" button
    const toggleBtn = e.target.closest('[data-toggle]');
    if (toggleBtn) {
      const shadowId = toggleBtn.dataset.toggle;
      const shadow = state.shadows.find(s => s.id === shadowId);
      if (shadow) {
        toggleShadowDeployment(shadow);
      }
    }
  });
}

function performShadowExtraction(shadow) {
  sfx.arise();
  shadow.extracted = true;
  // Automatically activate if under limit of 3
  const activeCount = state.shadows.filter(s => s.active).length;
  if (activeCount < 3) {
    shadow.active = true;
  }

  if (DOM.ariseShadowName) DOM.ariseShadowName.textContent = shadow.name;
  if (DOM.ariseSpeech) DOM.ariseSpeech.textContent = shadow.quote;
  if (DOM.ariseRewardsText) {
    const statText = Object.entries(shadow.stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
    DOM.ariseRewardsText.innerHTML = `
      <p>✦ ${shadow.rank} extracted into your Shadow Army</p>
      <p>✦ Permanent passive stat boosts activated: <strong>${statText}</strong></p>
    `;
  }

  if (DOM.ariseModal) DOM.ariseModal.classList.add('active');
  logMessage(`[ARISE] The shadow of ${shadow.name} has been extracted to serve the Monarch!`, 'arise');
  saveState();
  render();
}

function toggleShadowDeployment(shadow) {
  if (shadow.active) {
    shadow.active = false;
    sfx.ping();
    logMessage(`[SHADOW RECALLED] ${shadow.name} returned to the shadows.`);
  } else {
    const activeCount = state.shadows.filter(s => s.active).length;
    if (activeCount >= 3) {
      alert('⚠️ Maximum of 3 Shadows can be deployed at once! Recall one first.');
      return;
    }
    shadow.active = true;
    sfx.arise();
    logMessage(`[SHADOW DEPLOYED] ${shadow.name} is now granting active stat boosts!`, 'arise');
  }

  saveState();
  render();
}

if (DOM.closeAriseBtn) {
  DOM.closeAriseBtn.addEventListener('click', () => {
    if (DOM.ariseModal) DOM.ariseModal.classList.remove('active');
    sfx.ping();
  });
}

// ==========================================
// 10. THE PENALTY ZONE (EMERGENCY SURVIVAL)
// ==========================================
let penaltySeconds = 10 * 60;
let penaltyInterval = null;
let isPenaltyRunning = false;

function updatePenaltyTimerDisplay() {
  const m = Math.floor(penaltySeconds / 60).toString().padStart(2, '0');
  const s = (penaltySeconds % 60).toString().padStart(2, '0');
  if (DOM.penaltyTimerDisplay) DOM.penaltyTimerDisplay.textContent = `${m}:${s}`;
}

if (DOM.startPenaltyBtn) {
  DOM.startPenaltyBtn.addEventListener('click', () => {
    if (!isPenaltyRunning) {
      isPenaltyRunning = true;
      DOM.startPenaltyBtn.textContent = 'SURVIVE (DO NOT STOP)';
      sfx.penaltyAlert();
      logMessage('[PENALTY ACTIVATED] Surviving Giant Centipede onslaught! Keep moving!', 'penalty');

      penaltyInterval = setInterval(() => {
        penaltySeconds--;
        updatePenaltyTimerDisplay();

        if (penaltySeconds % 60 === 0) {
          sfx.penaltyAlert();
        }

        if (penaltySeconds <= 0) {
          clearInterval(penaltyInterval);
          isPenaltyRunning = false;
          penaltySeconds = 10 * 60;
          updatePenaltyTimerDisplay();

          DOM.startPenaltyBtn.textContent = 'COMMENCE SURVIVAL SPRINT';

          // Penalty Survived Rewards!
          sfx.levelUp();
          addXp(100);
          state.player.fatigue = 0;
          state.player.title = 'Title: "Surviving Hunter"';
          saveState();
          render();
          alert('🔥 [PENALTY CLEARED!] You survived the Penalty Zone! Awarded +100 EXP and 100% Fatigue Purged!');
          logMessage('[PENALTY SURVIVED] Emerged victorious from the desert! Fatigue cleared.', 'level-up');
        }
      }, 1000);
    }
  });
}

if (DOM.cancelPenaltyBtn) {
  DOM.cancelPenaltyBtn.addEventListener('click', () => {
    clearInterval(penaltyInterval);
    isPenaltyRunning = false;
    penaltySeconds = 10 * 60;
    updatePenaltyTimerDisplay();
    if (DOM.startPenaltyBtn) DOM.startPenaltyBtn.textContent = 'COMMENCE SURVIVAL SPRINT';
  });
}

// ==========================================
// 11. PROFILE DATA EXPORT & IMPORT (BACKUP)
// ==========================================
if (DOM.backupBtn) {
  DOM.backupBtn.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `solo-leveling-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sfx.ping();
    logMessage('[DATA BACKUP] Hunter profile successfully exported as JSON.');
  });
}

if (DOM.restoreFileInput) {
  DOM.restoreFileInput.addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && imported.player) {
          state = mergeWithDefault(imported);
          saveState();
          render();
          sfx.levelUp();
          alert('✅ Hunter profile successfully restored!');
          logMessage('[DATA RESTORE] Backup restored. Level and status synchronized.', 'level-up');
        } else {
          alert('❌ Invalid backup file format.');
        }
      } catch (err) {
        alert('❌ Error reading backup JSON file.');
      }
    };
    reader.readAsText(file);
  });
}

// ==========================================
// 12. PWA SERVICE WORKER & INITIALIZATION
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('Service worker note:', err);
    });
  });
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (DOM.installAppBtn) {
    DOM.installAppBtn.style.display = 'inline-flex';
  }
});

if (DOM.installAppBtn) {
  DOM.installAppBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        DOM.installAppBtn.style.display = 'none';
      }
      deferredPrompt = null;
    } else {
      alert("📱 To install on smartphone:\n\n• Android Chrome: Tap ⋮ menu -> 'Install app' or 'Add to Home screen'\n• iOS Safari: Tap Share button -> 'Add to Home Screen'");
    }
  });
}

// Daily Quest arrival alert modal
if (DOM.acceptQuestBtn) {
  DOM.acceptQuestBtn.addEventListener('click', () => {
    if (DOM.questAlertModal) DOM.questAlertModal.classList.remove('active');
    sfx.questComplete();
    logMessage('[QUEST ACCEPTED] Daily quest "Preparing to Become Strong" is active!');
  });
}

// Show alert modal on fresh launch
setTimeout(() => {
  if (DOM.questAlertModal && !sessionStorage.getItem('QUEST_ALERT_SHOWN')) {
    DOM.questAlertModal.classList.add('active');
    sessionStorage.setItem('QUEST_ALERT_SHOWN', 'true');
    sfx.ping();
  }
}, 500);

// Initial start
render();
updateTimerDisplay();
updatePenaltyTimerDisplay();
logMessage('[SYSTEM] System protocol v2.0 initialized. Player status online.');
