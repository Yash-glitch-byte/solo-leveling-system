import React, { useState, useEffect } from 'react';
import {
  SystemReawakenState,
  Quest,
  DungeonSession,
  AttributeKey,
  WorkoutLogEntry,
  PlayerProfile,
  EquipmentItem,
  EquippedGear,
  BleWearableState
} from './types';
import { loadGameState, saveGameState } from './storage';
import { processXpGain, LevelUpResult } from './game/progression';
import { soundEngine } from './game/sound';

import { Header } from './components/layout/Header';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { QuestHub } from './components/quests/QuestHub';
import { DungeonView } from './components/dungeons/DungeonView';
import { InventoryView } from './components/inventory/InventoryView';
import { PseudoMonarchView } from './components/monarch/PseudoMonarchView';
import { CampaignView } from './components/campaigns/CampaignView';
import { BossHub } from './components/bosses/BossHub';
import { SkillTreeView } from './components/skillTree/SkillTreeView';
import { FitnessTracker } from './components/fitness/FitnessTracker';
import { VerificationModule } from './components/verification/VerificationModule';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsModal } from './components/settings/SettingsModal';
import { LevelUpModal } from './components/common/LevelUpModal';
import { InteractiveTutorial } from './components/tutorial/InteractiveTutorial';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<SystemReawakenState>(() => loadGameState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCreateQuestOpen, setIsCreateQuestOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [pendingLevelUp, setPendingLevelUp] = useState<LevelUpResult | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Auto-save on every state change
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Synchronize sound settings on initial mount
  useEffect(() => {
    soundEngine.enabled = gameState.settings.soundFxEnabled;
    soundEngine.masterVolume = gameState.settings.masterVolume;
  }, []);

  // Register PWA Service Worker with non-intrusive update detection
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          setSwRegistration(reg);
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update is ready and waiting!
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((err) => console.log('SW registration note:', err));
    }
  }, []);

  // Trigger non-disruptive reload when player taps update banner
  const handleApplyUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  // Update game settings
  const handleUpdateSettings = (newSettings: Partial<SystemReawakenState['settings']>) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (updatedPlayer: Partial<PlayerProfile>) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        ...updatedPlayer,
        isOnboarded: true
      }
    }));
    // Suggest tutorial for new awakened hunters
    setIsTutorialOpen(true);
  };

  // Stat Point Allocation Handler
  const handleAllocateStat = (attribute: AttributeKey) => {
    if (gameState.player.statPoints <= 0) return;
    soundEngine.playPing();

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        statPoints: prev.player.statPoints - 1,
        stats: {
          ...prev.player.stats,
          [attribute]: (prev.player.stats[attribute] || 10) + 1
        }
      }
    }));
  };

  // Quest Toggle (Complete / Uncomplete) Handler
  const handleToggleQuest = (questId: string) => {
    const quest = gameState.quests.find(q => q.id === questId);
    if (!quest) return;

    const isMarkingComplete = quest.status !== 'completed';

    if (isMarkingComplete) {
      soundEngine.playQuestComplete();

      // Apply Monarch passive multiplier if Ruler's Authority is active
      const xpMultiplier = (gameState.monarch.unlocked && gameState.monarch.authorityActive) ? 1.15 : 1.0;
      const earnedXp = Math.round(quest.xpReward * xpMultiplier);

      const { didLevelUp, result } = processXpGain(
        gameState.player.level,
        gameState.player.currentXp,
        earnedXp
      );

      if (didLevelUp) {
        soundEngine.playLevelUp();
        setPendingLevelUp(result);
      }

      const todayStr = new Date().toISOString().slice(0, 10);

      setGameState(prev => {
        const updatedQuests = prev.quests.map(q =>
          q.id === questId
            ? { ...q, status: 'completed' as const, completedAt: new Date().toISOString() }
            : q
        );

        const currentAttrVal = prev.player.stats[quest.attribute] || 10;
        const newAttrVal = currentAttrVal + quest.attributePoints;

        // Update history
        const existingHistory = [...prev.history];
        const todayRecordIdx = existingHistory.findIndex(h => h.date === todayStr);

        if (todayRecordIdx >= 0) {
          existingHistory[todayRecordIdx] = {
            ...existingHistory[todayRecordIdx],
            xpGained: existingHistory[todayRecordIdx].xpGained + earnedXp,
            questsCompleted: existingHistory[todayRecordIdx].questsCompleted + 1
          };
        } else {
          existingHistory.push({
            date: todayStr,
            xpGained: earnedXp,
            questsCompleted: 1,
            focusMinutes: 0,
            categoriesActive: [quest.category]
          });
        }

        return {
          ...prev,
          quests: updatedQuests,
          history: existingHistory,
          syncStatus: prev.cloudAccount.cloudSyncEnabled ? 'sync_pending' : 'local_only',
          player: {
            ...prev.player,
            level: result.newLevel,
            rank: result.newRank,
            currentXp: result.remainingXp,
            requiredXp: result.newRequiredXp,
            statPoints: prev.player.statPoints + result.statPointsAwarded,
            totalQuestsCompleted: prev.player.totalQuestsCompleted + 1,
            fatigue: Math.max(0, prev.player.fatigue - 5),
            stats: {
              ...prev.player.stats,
              [quest.attribute]: newAttrVal
            }
          }
        };
      });
    } else {
      // Revert completed status
      soundEngine.playPing();
      setGameState(prev => ({
        ...prev,
        quests: prev.quests.map(q =>
          q.id === questId ? { ...q, status: 'available' as const, completedAt: undefined } : q
        ),
        player: {
          ...prev.player,
          currentXp: Math.max(0, prev.player.currentXp - quest.xpReward)
        }
      }));
    }
  };

  // Subtask Toggle Handler
  const handleToggleSubtask = (questId: string, subtaskId: string) => {
    soundEngine.playPing();
    setGameState(prev => ({
      ...prev,
      quests: prev.quests.map(q => {
        if (q.id !== questId) return q;
        const updatedSubs = q.subtasks.map(s =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...q, subtasks: updatedSubs };
      })
    }));
  };

  // Add Custom Quest
  const handleAddQuest = (newQuest: Quest) => {
    setGameState(prev => ({
      ...prev,
      quests: [newQuest, ...prev.quests]
    }));
  };

  // Delete Quest
  const handleDeleteQuest = (questId: string) => {
    soundEngine.playPing();
    setGameState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== questId)
    }));
  };

  // Dungeon Handlers
  const handleStartDungeon = (session: DungeonSession) => {
    setGameState(prev => ({
      ...prev,
      activeDungeon: session
    }));
    setActiveTab('dungeons');
  };

  const handleUpdateActiveDungeon = (session: DungeonSession) => {
    setGameState(prev => ({
      ...prev,
      activeDungeon: session
    }));
  };

  const handleCompleteDungeon = (session: DungeonSession) => {
    const xpMultiplier = (gameState.monarch.unlocked && gameState.monarch.authorityActive) ? 1.15 : 1.0;
    const finalRewardXp = Math.round(session.xpReward * xpMultiplier);

    const { didLevelUp, result } = processXpGain(
      gameState.player.level,
      gameState.player.currentXp,
      finalRewardXp
    );

    if (didLevelUp) {
      soundEngine.playLevelUp();
      setPendingLevelUp(result);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const sessionMins = Math.floor(session.elapsedSeconds / 60) || session.durationMinutes;

    setGameState(prev => {
      const existingHistory = [...prev.history];
      const todayRecordIdx = existingHistory.findIndex(h => h.date === todayStr);

      if (todayRecordIdx >= 0) {
        existingHistory[todayRecordIdx] = {
          ...existingHistory[todayRecordIdx],
          xpGained: existingHistory[todayRecordIdx].xpGained + finalRewardXp,
          focusMinutes: existingHistory[todayRecordIdx].focusMinutes + sessionMins
        };
      } else {
        existingHistory.push({
          date: todayStr,
          xpGained: finalRewardXp,
          questsCompleted: 0,
          focusMinutes: sessionMins,
          categoriesActive: [session.category]
        });
      }

      return {
        ...prev,
        activeDungeon: null,
        history: existingHistory,
        syncStatus: prev.cloudAccount.cloudSyncEnabled ? 'sync_pending' : 'local_only',
        player: {
          ...prev.player,
          level: result.newLevel,
          rank: result.newRank,
          currentXp: result.remainingXp,
          requiredXp: result.newRequiredXp,
          statPoints: prev.player.statPoints + result.statPointsAwarded,
          totalFocusMinutes: prev.player.totalFocusMinutes + sessionMins,
          fatigue: Math.max(0, prev.player.fatigue - 20),
          stats: {
            ...prev.player.stats,
            focus: (prev.player.stats.focus || 10) + 2
          }
        }
      };
    });
  };

  const handleExitDungeon = () => {
    soundEngine.playPing();
    setGameState(prev => ({
      ...prev,
      activeDungeon: null
    }));
  };

  // Equipment Handlers
  const handleEquipItem = (item: EquipmentItem) => {
    setGameState(prev => {
      const updatedInventory = prev.inventory.map(i =>
        i.id === item.id ? { ...i, isEquipped: true } : (i.slot === item.slot ? { ...i, isEquipped: false } : i)
      );
      const updatedGear: EquippedGear = {
        ...prev.equippedGear,
        [item.slot]: { ...item, isEquipped: true }
      };

      // Add attribute bonus
      const updatedStats = { ...prev.player.stats };
      Object.entries(item.statBonus).forEach(([attr, bonus]) => {
        const k = attr as AttributeKey;
        if (updatedStats[k] !== undefined && bonus) {
          updatedStats[k] += bonus;
        }
      });

      return {
        ...prev,
        inventory: updatedInventory,
        equippedGear: updatedGear,
        player: { ...prev.player, stats: updatedStats }
      };
    });
  };

  const handleUnequipItem = (slot: keyof EquippedGear) => {
    setGameState(prev => {
      const currentEquipped = prev.equippedGear[slot];
      if (!currentEquipped) return prev;

      const updatedInventory = prev.inventory.map(i =>
        i.id === currentEquipped.id ? { ...i, isEquipped: false } : i
      );
      const updatedGear: EquippedGear = {
        ...prev.equippedGear,
        [slot]: null
      };

      // Subtract attribute bonus
      const updatedStats = { ...prev.player.stats };
      Object.entries(currentEquipped.statBonus).forEach(([attr, bonus]) => {
        const k = attr as AttributeKey;
        if (updatedStats[k] !== undefined && bonus) {
          updatedStats[k] = Math.max(10, updatedStats[k] - bonus);
        }
      });

      return {
        ...prev,
        inventory: updatedInventory,
        equippedGear: updatedGear,
        player: { ...prev.player, stats: updatedStats }
      };
    });
  };

  // Pseudo Monarch Handlers
  const handleAwakenMonarch = () => {
    setGameState(prev => ({
      ...prev,
      monarch: {
        ...prev.monarch,
        unlocked: true,
        unlockedAt: new Date().toISOString()
      },
      player: {
        ...prev.player,
        title: 'Shadow Monarch Aspirant'
      }
    }));
  };

  const handleExtractShadow = (shadowId: string) => {
    setGameState(prev => {
      const updatedShadows = prev.monarch.shadows.map(s =>
        s.id === shadowId ? { ...s, extracted: true, deployed: true } : s
      );
      return {
        ...prev,
        monarch: { ...prev.monarch, shadows: updatedShadows }
      };
    });
  };

  const handleToggleDeployShadow = (shadowId: string) => {
    setGameState(prev => {
      const updatedShadows = prev.monarch.shadows.map(s =>
        s.id === shadowId ? { ...s, deployed: !s.deployed } : s
      );
      return {
        ...prev,
        monarch: { ...prev.monarch, shadows: updatedShadows }
      };
    });
  };

  // Wearable State Handler
  const handleUpdateWearable = (patch: Partial<BleWearableState>) => {
    setGameState(prev => ({
      ...prev,
      wearable: { ...prev.wearable, ...patch }
    }));
  };

  // Boss Objective Handler
  const handleToggleBossObjective = (bossId: string, objectiveId: string) => {
    setGameState(prev => {
      const updatedBosses = prev.bosses.map(boss => {
        if (boss.id !== bossId) return boss;

        const updatedObjectives = boss.objectives.map(o =>
          o.id === objectiveId ? { ...o, completed: !o.completed } : o
        );

        const allDone = updatedObjectives.every(o => o.completed);
        const damagePerObj = Math.round(boss.hpTotal / boss.objectives.length);
        const remainingHp = Math.max(
          0,
          boss.hpTotal - updatedObjectives.filter(o => o.completed).length * damagePerObj
        );

        return {
          ...boss,
          objectives: updatedObjectives,
          hpCurrent: allDone ? 0 : remainingHp,
          defeated: allDone,
          defeatedAt: allDone ? new Date().toISOString() : boss.defeatedAt
        };
      });

      const targetedBoss = updatedBosses.find(b => b.id === bossId);
      if (targetedBoss && targetedBoss.defeated) {
        soundEngine.playBossDefeat();
        const { didLevelUp, result } = processXpGain(
          prev.player.level,
          prev.player.currentXp,
          targetedBoss.rewardXp
        );

        if (didLevelUp) setPendingLevelUp(result);

        return {
          ...prev,
          bosses: updatedBosses,
          player: {
            ...prev.player,
            level: result.newLevel,
            rank: result.newRank,
            currentXp: result.remainingXp,
            requiredXp: result.newRequiredXp,
            statPoints: prev.player.statPoints + result.statPointsAwarded + 5,
            title: targetedBoss.rewardTitle,
            stats: {
              ...prev.player.stats,
              [targetedBoss.rewardAttribute]:
                (prev.player.stats[targetedBoss.rewardAttribute] || 10) + 5
            }
          }
        };
      }

      return { ...prev, bosses: updatedBosses };
    });
  };

  // Skill Tree Upgrade Handler
  const handleUpgradeSkill = (skillId: string) => {
    setGameState(prev => ({
      ...prev,
      skills: prev.skills.map(s => {
        if (s.id !== skillId) return s;
        const nextLvl = Math.min(s.maxLevel, s.level + 1);
        return { ...s, level: nextLvl };
      })
    }));
  };

  // Workout Log Entry Handler
  const handleAddWorkout = (entry: WorkoutLogEntry) => {
    const { didLevelUp, result } = processXpGain(
      gameState.player.level,
      gameState.player.currentXp,
      25
    );

    if (didLevelUp) {
      soundEngine.playLevelUp();
      setPendingLevelUp(result);
    }

    setGameState(prev => ({
      ...prev,
      workoutLogs: [entry, ...prev.workoutLogs],
      player: {
        ...prev.player,
        level: result.newLevel,
        rank: result.newRank,
        currentXp: result.remainingXp,
        requiredXp: result.newRequiredXp,
        statPoints: prev.player.statPoints + result.statPointsAwarded,
        fatigue: Math.max(0, prev.player.fatigue - 15),
        stats: {
          ...prev.player.stats,
          strength: (prev.player.stats.strength || 10) + 1,
          vitality: (prev.player.stats.vitality || 10) + 1
        }
      }
    }));
  };

  // Campaign Day Completion Handler
  const handleToggleCampaignDay = (campaignId: string, dayNumber: number) => {
    soundEngine.playPing();
    setGameState(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(c => {
        if (c.id !== campaignId) return c;
        const updatedDays = c.days.map(d =>
          d.dayNumber === dayNumber
            ? { ...d, completed: !d.completed, completedDate: !d.completed ? new Date().toISOString() : undefined }
            : d
        );
        const completedCount = updatedDays.filter(d => d.completed).length;
        return {
          ...c,
          currentDay: Math.min(c.totalDays, completedCount + 1),
          days: updatedDays,
          isCompleted: completedCount >= c.totalDays
        };
      })
    }));
  };

  const activeCampaign = gameState.campaigns.find(c => c.id === gameState.activeCampaignId) || gameState.campaigns[0];

  return (
    <div className={`system-app-root ${gameState.settings.reducedMotion ? 'reduced-motion' : ''}`}>
      {/* Background futuristic grid & vignette */}
      <div className="system-grid-bg" />
      <div className="system-vignette" />

      {/* Main HUD Header */}
      <Header
        player={gameState.player}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={gameState.settings}
        updateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        syncStatus={gameState.syncStatus}
        updateAvailable={updateAvailable}
        onApplyUpdate={handleApplyUpdate}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Main View Screen Container */}
      <main className="system-main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            player={gameState.player}
            quests={gameState.quests}
            bosses={gameState.bosses}
            activeCampaign={activeCampaign}
            onAllocateStat={handleAllocateStat}
            onToggleQuest={handleToggleQuest}
            onEnterDungeon={() => {
              soundEngine.playDungeonEnter();
              setActiveTab('dungeons');
            }}
            onOpenCreateQuest={() => setIsCreateQuestOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'quests' && (
          <QuestHub
            quests={gameState.quests}
            onToggleQuest={handleToggleQuest}
            onToggleSubtask={handleToggleSubtask}
            onAddQuest={handleAddQuest}
            onDeleteQuest={handleDeleteQuest}
            isCreateModalOpen={isCreateQuestOpen}
            setIsCreateModalOpen={setIsCreateQuestOpen}
          />
        )}

        {activeTab === 'dungeons' && (
          <DungeonView
            dungeonTemplates={gameState.dungeonTemplates}
            activeDungeon={gameState.activeDungeon}
            onStartDungeon={handleStartDungeon}
            onUpdateActiveDungeon={handleUpdateActiveDungeon}
            onCompleteDungeon={handleCompleteDungeon}
            onExitDungeon={handleExitDungeon}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventory={gameState.inventory}
            equippedGear={gameState.equippedGear}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
          />
        )}

        {activeTab === 'monarch' && (
          <PseudoMonarchView
            monarch={gameState.monarch}
            player={gameState.player}
            onExtractShadow={handleExtractShadow}
            onToggleDeployShadow={handleToggleDeployShadow}
            onAwakenMonarch={handleAwakenMonarch}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignView
            campaigns={gameState.campaigns}
            activeCampaignId={gameState.activeCampaignId}
            onSelectCampaign={id => setGameState(p => ({ ...p, activeCampaignId: id }))}
            onToggleDayCompleted={handleToggleCampaignDay}
          />
        )}

        {activeTab === 'bosses' && (
          <BossHub
            bosses={gameState.bosses}
            onToggleBossObjective={handleToggleBossObjective}
          />
        )}

        {activeTab === 'skill-tree' && (
          <SkillTreeView
            skills={gameState.skills}
            onUpgradeSkill={handleUpgradeSkill}
          />
        )}

        {activeTab === 'fitness' && (
          <FitnessTracker
            workoutLogs={gameState.workoutLogs}
            onAddWorkout={handleAddWorkout}
          />
        )}

        {activeTab === 'verification' && (
          <VerificationModule
            wearable={gameState.wearable}
            onUpdateWearable={handleUpdateWearable}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            player={gameState.player}
            history={gameState.history}
            quests={gameState.quests}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav-bar" aria-label="Mobile Navigation">
        <button
          className={`mob-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="mob-icon">⚡</span>
          <span className="mob-label">Status</span>
        </button>
        <button
          className={`mob-nav-btn ${activeTab === 'quests' ? 'active' : ''}`}
          onClick={() => setActiveTab('quests')}
        >
          <span className="mob-icon">📜</span>
          <span className="mob-label">Quests</span>
        </button>
        <button
          className={`mob-nav-btn ${activeTab === 'dungeons' ? 'active' : ''}`}
          onClick={() => setActiveTab('dungeons')}
        >
          <span className="mob-icon">🗝️</span>
          <span className="mob-label">Dungeon</span>
        </button>
        <button
          className={`mob-nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <span className="mob-icon">💍</span>
          <span className="mob-label">Loadout</span>
        </button>
        <button
          className={`mob-nav-btn ${activeTab === 'monarch' ? 'active' : ''}`}
          onClick={() => setActiveTab('monarch')}
        >
          <span className="mob-icon">👑</span>
          <span className="mob-label">Monarch</span>
        </button>
        <button
          className={`mob-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="mob-icon">📊</span>
          <span className="mob-label">Stats</span>
        </button>
      </nav>

      {/* First-Time Awakening Onboarding Modal */}
      {!gameState.player.isOnboarded && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Interactive System Tutorial */}
      {isTutorialOpen && (
        <InteractiveTutorial
          onClose={() => setIsTutorialOpen(false)}
          onCompleteTutorial={() => {
            soundEngine.playLevelUp();
            alert('✦ System Tutorial Completed! +50 Focus Mastery Bonus registered.');
          }}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={gameState.settings}
          updateSettings={handleUpdateSettings}
          fullState={gameState}
          onRestoreState={restored => setGameState(restored)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Level Up Celebration Modal */}
      {pendingLevelUp && (
        <LevelUpModal
          result={pendingLevelUp}
          onClose={() => setPendingLevelUp(null)}
        />
      )}
    </div>
  );
};
