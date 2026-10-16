/**
 * SOLO LEVELING: THE SYSTEM
 * Personal Habit & Quest Leveling Application
 * Fully persistent via localStorage, featuring Web Audio synthesized sound effects.
 */

// ==========================================
// 1. STATE & STORAGE MANAGEMENT
// ==========================================
const STORAGE_KEY = 'SOLO_LEVELING_PLAYER_DATA_V1';

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
    { id: 5, text: 'Mind Focus: 10 minutes Meditation / No-phone morning', stat: 'per', xp: 25, completed: false },
  ],
  claimedDailyBonus: false,
  soundEnabled: true,
  lastActiveDate: new Date().toISOString().slice(0, 10),
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Check if it's a new day to reset daily quests
      const today = new Date().toISOString().slice(0, 10);
      if (parsed.lastActiveDate !== today) {
        parsed.quests.forEach(q => q.completed = false);
        parsed.claimedDailyBonus = false;
        parsed.lastActiveDate = today;
      }
      return { ...DEFAULT_STATE, ...parsed, player: { ...DEFAULT_STATE.player, ...parsed.player } };
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

// ==========================================
// 2. SYNTHESIZED SOUND EFFECTS (Web Audio API)
// ==========================================
// Works offline without any mp3 files!
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, delay = 0, gainLevel = 0.1) {
    if (!state.soundEnabled) return;
    this.init();
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
  }

  // Futuristic system alert ping
  ping() {
    this.playTone(880, 'sine', 0.12, 0, 0.08);
    this.playTone(1320, 'sine', 0.18, 0.08, 0.08);
  }

  // Quest completed chime
  questComplete() {
    this.playTone(523.25, 'triangle', 0.15, 0, 0.1); // C5
    this.playTone(659.25, 'triangle', 0.15, 0.1, 0.1); // E5
    this.playTone(783.99, 'triangle', 0.15, 0.2, 0.1); // G5
    this.playTone(1046.50, 'triangle', 0.35, 0.3, 0.15); // C6
  }

  // Epic Level Up Fanfare!
  levelUp() {
    const notes = [440, 554, 659, 880, 1108, 1318, 1760];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sawtooth', 0.25, idx * 0.08, 0.1);
    });
    setTimeout(() => {
      this.playTone(880, 'triangle', 0.8, 0, 0.2);
      this.playTone(1320, 'sine', 0.8, 0, 0.2);
    }, 600);
  }

  // Stat point allocation
  statAdd() {
    this.playTone(700, 'sine', 0.08, 0, 0.08);
    this.playTone(950, 'sine', 0.12, 0.06, 0.08);
  }
}

const sfx = new SoundFX();

// ==========================================
// 3. HUNTER RANK & LEVELING LOGIC
// ==========================================
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

function addXp(amount) {
  state.player.currentXp += amount;
  logMessage(`[EXP GAINED] +${amount} EXP added to your status.`, 'quest-done');

  // Check for Level Up!
  let leveledUp = false;
  while (state.player.currentXp >= state.player.requiredXp) {
    state.player.currentXp -= state.player.requiredXp;
    state.player.level += 1;
    state.player.requiredXp = Math.floor(state.player.requiredXp * 1.35); // Smooth scaling
    state.player.statPoints += 5; // +5 points per level
    state.player.maxHp += 20;
    state.player.hp = state.player.maxHp;
    state.player.maxMp += 15;
    state.player.mp = state.player.maxMp;
    leveledUp = true;
  }

  // Update Rank & Titles
  state.player.rank = getHunterRank(state.player.level);
  state.player.title = getHunterTitle(state.player.level);

  if (leveledUp) {
    sfx.levelUp();
    showLevelUpModal(state.player.level);
    logMessage(`[SYSTEM ALERT] LEVEL UP! Player has reached Level ${state.player.level}!`, 'level-up');
  }

  saveState();
  render();
}

// ==========================================
// 4. UI RENDERING & DOM UPDATES
// ==========================================
const DOM = {
  hunterRank: document.getElementById('hunterRank'),
  playerName: document.getElementById('playerName'),
  playerTitle: document.getElementById('playerTitle'),
  playerJob: document.getElementById('playerJob'),
  playerAvatar: document.getElementById('playerAvatar'),
  playerLevel: document.getElementById('playerLevel'),
  xpValues: document.getElementById('xpValues'),
  xpBarFill: document.getElementById('xpBarFill'),
  hpValues: document.getElementById('hpValues'),
  hpBarFill: document.getElementById('hpBarFill'),
  mpValues: document.getElementById('mpValues'),
  mpBarFill: document.getElementById('mpBarFill'),
  statPointsBadge: document.getElementById('statPointsBadge'),
  statPointsValue: document.getElementById('statPointsValue'),
  statStr: document.getElementById('statStr'),
  statAgi: document.getElementById('statAgi'),
  statVit: document.getElementById('statVit'),
  statInt: document.getElementById('statInt'),
  statPer: document.getElementById('statPer'),
  questList: document.getElementById('questList'),
  dailyPercent: document.getElementById('dailyPercent'),
  claimDailyBonusBtn: document.getElementById('claimDailyBonusBtn'),
  systemLogs: document.getElementById('systemLogs'),
  levelUpModal: document.getElementById('levelUpModal'),
  modalNewLevel: document.getElementById('modalNewLevel'),
  closeLevelUpBtn: document.getElementById('closeLevelUpBtn'),
  lootModal: document.getElementById('lootModal'),
  lootRewardText: document.getElementById('lootRewardText'),
  closeLootBtn: document.getElementById('closeLootBtn'),
  soundToggleBtn: document.getElementById('soundToggleBtn'),
  soundStatus: document.getElementById('soundStatus'),
  addQuestForm: document.getElementById('addQuestForm'),
  questInput: document.getElementById('questInput'),
  statAffinity: document.getElementById('statAffinity'),
  resetDayBtn: document.getElementById('resetDayBtn'),
  restartPlayerBtn: document.getElementById('restartPlayerBtn'),
  // Timer elements
  timerDisplay: document.getElementById('timerDisplay'),
  timerStartBtn: document.getElementById('timerStartBtn'),
  timerResetBtn: document.getElementById('timerResetBtn'),
};

function render() {
  const p = state.player;

  // Header & Identity
  DOM.hunterRank.textContent = p.rank;
  DOM.playerName.textContent = p.name;
  DOM.playerTitle.textContent = p.title;
  DOM.playerJob.textContent = `Job: ${p.job}`;
  DOM.playerAvatar.textContent = p.name ? p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'SL';

  // Level & XP
  DOM.playerLevel.textContent = p.level;
  DOM.xpValues.textContent = `${p.currentXp} / ${p.requiredXp} XP`;
  const xpPct = Math.min(100, Math.floor((p.currentXp / p.requiredXp) * 100));
  DOM.xpBarFill.style.width = `${xpPct}%`;

  // Vitals
  DOM.hpValues.textContent = `${p.hp} / ${p.maxHp}`;
  DOM.hpBarFill.style.width = `${(p.hp / p.maxHp) * 100}%`;
  DOM.mpValues.textContent = `${p.mp} / ${p.maxMp}`;
  DOM.mpBarFill.style.width = `${(p.mp / p.maxMp) * 100}%`;

  // Stats & Stat Points
  DOM.statPointsValue.textContent = p.statPoints;
  if (p.statPoints > 0) {
    DOM.statPointsBadge.classList.add('pulse');
  } else {
    DOM.statPointsBadge.classList.remove('pulse');
  }

  DOM.statStr.textContent = p.stats.str;
  DOM.statAgi.textContent = p.stats.agi;
  DOM.statVit.textContent = p.stats.vit;
  DOM.statInt.textContent = p.stats.int;
  DOM.statPer.textContent = p.stats.per;

  // Enable/disable stat allocation '+' buttons
  document.querySelectorAll('.add-stat-btn').forEach(btn => {
    btn.disabled = p.statPoints <= 0;
  });

  // Sound toggle status
  DOM.soundStatus.textContent = state.soundEnabled ? 'ACTIVE' : 'MUTED';
  DOM.soundToggleBtn.style.borderColor = state.soundEnabled ? 'var(--border-neon)' : 'var(--text-dark)';

  renderQuests();
}

function renderQuests() {
  DOM.questList.innerHTML = '';

  const total = state.quests.length;
  const completedCount = state.quests.filter(q => q.completed).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  DOM.dailyPercent.textContent = `${percent}%`;

  // Daily Bonus Loot Button
  if (percent === 100 && !state.claimedDailyBonus) {
    DOM.claimDailyBonusBtn.disabled = false;
  } else {
    DOM.claimDailyBonusBtn.disabled = true;
    if (state.claimedDailyBonus) {
      DOM.claimDailyBonusBtn.textContent = '✔ DAILY REWARD CLAIMED';
    } else {
      DOM.claimDailyBonusBtn.textContent = '🎁 CLAIM DAILY REWARD BOX';
    }
  }

  state.quests.forEach(quest => {
    const li = document.createElement('li');
    li.className = `quest-item ${quest.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div class="quest-left">
        <input type="checkbox" class="quest-checkbox" data-id="${quest.id}" ${quest.completed ? 'checked' : ''}>
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

function logMessage(text, className = '') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${className}`;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  entry.textContent = `[${time}] ${text}`;
  DOM.systemLogs.prepend(entry);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==========================================
// 5. EVENT LISTENERS
// ==========================================

// Sound Toggle
DOM.soundToggleBtn.addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  if (state.soundEnabled) sfx.ping();
  saveState();
  render();
});

// Edit Player Name
DOM.playerName.addEventListener('blur', () => {
  const newName = DOM.playerName.textContent.trim();
  if (newName) {
    state.player.name = newName;
    saveState();
    render();
    logMessage(`[SYSTEM] Player identity recognized as: ${newName}`);
  }
});

// Stat Point Allocation
document.querySelectorAll('.add-stat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (state.player.statPoints > 0) {
      const statKey = btn.dataset.target;
      state.player.stats[statKey] += 1;
      state.player.statPoints -= 1;
      sfx.statAdd();
      logMessage(`[STAT INCREASED] +1 point assigned to ${statKey.toUpperCase()}.`);
      saveState();
      render();
    }
  });
});

// Toggle Quest Completion
DOM.questList.addEventListener('change', (e) => {
  if (e.target.classList.contains('quest-checkbox')) {
    const questId = Number(e.target.dataset.id);
    const quest = state.quests.find(q => q.id === questId);
    if (quest) {
      quest.completed = e.target.checked;
      if (quest.completed) {
        sfx.questComplete();
        addXp(quest.xp);
        // Also boost the specific stat slightly!
        if (state.player.stats[quest.stat] !== undefined) {
          // Stat boost bonus
          logMessage(`[AFFINITY] ${quest.stat.toUpperCase()} resonated with task completion!`);
        }
      } else {
        // Unchecked: subtract XP (floor at 0)
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
DOM.questList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-quest-btn')) {
    const questId = Number(e.target.dataset.id);
    state.quests = state.quests.filter(q => q.id !== questId);
    saveState();
    render();
  }
});

// Add New Custom Quest
DOM.addQuestForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = DOM.questInput.value.trim();
  const stat = DOM.statAffinity.value;
  if (!text) return;

  const newQuest = {
    id: Date.now(),
    text: text,
    stat: stat,
    xp: 25,
    completed: false
  };

  state.quests.push(newQuest);
  DOM.questInput.value = '';
  sfx.ping();
  logMessage(`[NEW QUEST REGISTERED] "${text}" assigned.`);
  saveState();
  render();
});

// Reset Day's Quests
DOM.resetDayBtn.addEventListener('click', () => {
  if (confirm('Reset today\'s quests checklist to uncompleted?')) {
    state.quests.forEach(q => q.completed = false);
    state.claimedDailyBonus = false;
    saveState();
    render();
    logMessage('[SYSTEM] Daily quest checklist has been reset.');
  }
});

// Full Reset
DOM.restartPlayerBtn.addEventListener('click', () => {
  if (confirm('WARNING: Are you sure you want to completely reset all your hunter level, stats, and data?')) {
    localStorage.removeItem(STORAGE_KEY);
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
    render();
    logMessage('[SYSTEM] All player memory purged. System rebooted.');
  }
});

// Level Up Modal Close
DOM.closeLevelUpBtn.addEventListener('click', () => {
  DOM.levelUpModal.classList.remove('active');
  sfx.ping();
});

function showLevelUpModal(level) {
  DOM.modalNewLevel.textContent = level;
  DOM.levelUpModal.classList.add('active');
}

// Daily Loot Reward Box
const RANDOM_LOOT_ITEMS = [
  'Elixir of Rest: Take a guilt-free 1-hour gaming/movie break!',
  'Shadow Monarch Feast: Enjoy your favorite high-protein meal or snack!',
  'Key to the Vault: Buy that book or personal item you have been eyeing!',
  'Mana Refresher: Go for a refreshing walk or listen to your favorite album!',
  'Blessing of Recovery: Sleep in for an extra 30 minutes tomorrow!'
];

DOM.claimDailyBonusBtn.addEventListener('click', () => {
  if (DOM.claimDailyBonusBtn.disabled) return;
  state.claimedDailyBonus = true;
  addXp(100); // 100 bonus XP for 100% daily completion!
  state.player.statPoints += 2; // +2 bonus stat points!
  sfx.levelUp();

  const reward = RANDOM_LOOT_ITEMS[Math.floor(Math.random() * RANDOM_LOOT_ITEMS.length)];
  DOM.lootRewardText.innerHTML = `
    <strong>🎁 ITEM ACQUIRED:</strong><br><br>
    <span style="color: #00d2ff; font-size: 1.25rem;">${reward}</span><br><br>
    <em>Bonus: +100 EXP & +2 Free Stat Points granted!</em>
  `;
  DOM.lootModal.classList.add('active');
  saveState();
  render();
});

DOM.closeLootBtn.addEventListener('click', () => {
  DOM.lootModal.classList.remove('active');
  sfx.ping();
});

// ==========================================
// 6. INSTANT DUNGEON (FOCUS / POMODORO TIMER)
// ==========================================
let timerSeconds = 25 * 60;
let timerInterval = null;
let isTimerRunning = false;

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const s = (timerSeconds % 60).toString().padStart(2, '0');
  DOM.timerDisplay.textContent = `${m}:${s}`;
}

DOM.timerStartBtn.addEventListener('click', () => {
  if (!isTimerRunning) {
    // Start Dungeon Timer
    isTimerRunning = true;
    DOM.timerStartBtn.textContent = 'PAUSE DUNGEON';
    DOM.timerStartBtn.style.background = '#e11d48';
    sfx.ping();
    logMessage('[DUNGEON ENTERED] 25-minute deep focus trial started. Do not break focus!');

    timerInterval = setInterval(() => {
      timerSeconds--;
      updateTimerDisplay();

      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerSeconds = 25 * 60;
        updateTimerDisplay();
        DOM.timerStartBtn.textContent = 'ENTER DUNGEON';
        DOM.timerStartBtn.style.background = '';

        // Dungeon Cleared Rewards!
        sfx.levelUp();
        addXp(40);
        state.player.stats.per += 1;
        saveState();
        render();
        alert('⚔️ [DUNGEON CLEARED!] You maintained focus for 25 minutes! Rewarded +40 EXP & +1 PER!');
        logMessage('[DUNGEON CLEARED] Deep focus trial survived! +40 EXP and +1 PER gained.', 'level-up');
      }
    }, 1000);
  } else {
    // Pause
    clearInterval(timerInterval);
    isTimerRunning = false;
    DOM.timerStartBtn.textContent = 'RESUME DUNGEON';
    DOM.timerStartBtn.style.background = '';
    logMessage('[DUNGEON PAUSED] Focus paused.');
  }
});

DOM.timerResetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerSeconds = 25 * 60;
  updateTimerDisplay();
  DOM.timerStartBtn.textContent = 'ENTER DUNGEON';
  DOM.timerStartBtn.style.background = '';
});

// Initialize on page load
render();
updateTimerDisplay();
logMessage('[SYSTEM] Connection established. Player status synced.');
