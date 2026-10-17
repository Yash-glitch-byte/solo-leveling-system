import React from 'react';
import { PlayerProfile, Quest, AttributeKey, BossChallenge, Campaign } from '../../types';
import { getAttributeDisplayName, getAttributeColor } from '../../game/progression';
import { generateAdvisorAdvice } from '../../game/advisor';
import { soundEngine } from '../../game/sound';

interface DashboardProps {
  player: PlayerProfile;
  quests: Quest[];
  bosses: BossChallenge[];
  activeCampaign: Campaign | undefined;
  onAllocateStat: (attribute: AttributeKey) => void;
  onToggleQuest: (questId: string) => void;
  onEnterDungeon: () => void;
  onOpenCreateQuest: () => void;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  player,
  quests,
  bosses,
  activeCampaign,
  onAllocateStat,
  onToggleQuest,
  onEnterDungeon,
  onOpenCreateQuest,
  setActiveTab
}) => {
  const dailyQuests = quests.filter(q => q.isDaily);
  const completedDailyCount = dailyQuests.filter(q => q.status === 'completed').length;
  const dailyPct = dailyQuests.length > 0 ? Math.round((completedDailyCount / dailyQuests.length) * 100) : 0;

  const attributeKeys: AttributeKey[] = [
    'strength',
    'vitality',
    'intelligence',
    'focus',
    'discipline',
    'career',
    'communication'
  ];

  const recommendations = generateAdvisorAdvice(player, quests, bosses);
  const primaryAdvice = recommendations[0];

  return (
    <div className="dashboard-layout">
      {/* LEFT COLUMN: Holographic Hunter Status & Attribute Matrix */}
      <section className="dashboard-column status-column">
        {/* Profile Card */}
        <div className="hud-card hunter-profile-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <div className="profile-header">
            <span className="hud-tag">STATUS WINDOW</span>
            <span className="hunter-rank-badge">{player.rank}</span>
          </div>

          <div className="profile-identity-row">
            <div className="avatar-frame">
              <span className="avatar-icon">{player.avatarIcon}</span>
              <div className="avatar-ring-glow"></div>
            </div>
            <div className="identity-details">
              <h2 className="player-display-name">{player.name}</h2>
              <span className="player-title">“{player.title}”</span>
              <span className="player-job">{player.job}</span>
            </div>
          </div>

          {/* Level & XP Gauge */}
          <div className="level-progression-box">
            <div className="level-badge-large">
              <span className="label">LEVEL</span>
              <span className="value">{player.level}</span>
            </div>
            <div className="xp-details-track">
              <div className="xp-numeric-row">
                <span>EXPERIENCE</span>
                <span className="xp-digits">{player.currentXp} / {player.requiredXp} XP</span>
              </div>
              <div className="xp-bar-outer">
                <div
                  className="xp-bar-fill"
                  style={{ width: `${Math.min(100, Math.round((player.currentXp / player.requiredXp) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Free Stat Points Allocation Banner */}
          <div className="stat-points-banner">
            <div className="points-info">
              <span className="points-label">UNALLOCATED STAT POINTS:</span>
              <span className={`points-count ${player.statPoints > 0 ? 'pulse' : ''}`}>
                {player.statPoints}
              </span>
            </div>
            {player.statPoints > 0 && (
              <span className="points-hint">Click '+' on any attribute to upgrade</span>
            )}
          </div>

          {/* Core Attribute Grid */}
          <div className="attributes-grid">
            {attributeKeys.map(key => {
              const val = player.stats[key] || 10;
              const color = getAttributeColor(key);
              return (
                <div key={key} className="attribute-row">
                  <div className="attr-meta">
                    <span className="attr-dot" style={{ backgroundColor: color }} />
                    <span className="attr-name">{getAttributeDisplayName(key)}</span>
                  </div>
                  <div className="attr-right">
                    <span className="attr-value">{val}</span>
                    <button
                      className="add-stat-btn"
                      disabled={player.statPoints <= 0}
                      onClick={() => onAllocateStat(key)}
                      title={`Upgrade ${key} (+1)`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Biological Vitals & Fatigue */}
          <div className="vitals-row">
            <div className="vital-gauge">
              <div className="vital-label">
                <span>FATIGUE ACCUMULATION</span>
                <span style={{ color: player.fatigue >= 70 ? '#ff3366' : '#00d2ff' }}>
                  {player.fatigue}%
                </span>
              </div>
              <div className="vital-track">
                <div
                  className="vital-fill"
                  style={{
                    width: `${player.fatigue}%`,
                    backgroundColor: player.fatigue >= 70 ? '#ff3366' : '#00d2ff'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: Action Hub, Daily Quests, & Advisor */}
      <section className="dashboard-column actions-column">
        {/* Prominent Quick Actions Call to Action */}
        <div className="quick-action-cta-bar">
          <button className="primary-focus-dungeon-btn" onClick={onEnterDungeon}>
            <span className="btn-icon">🗝️</span>
            <div className="btn-text">
              <span className="btn-title">ENTER INSTANT DUNGEON</span>
              <span className="btn-subtitle">25-Min Deep Focus Chamber • +EXP & Focus Boost</span>
            </div>
            <span className="btn-arrow">→</span>
          </button>

          <button className="secondary-quest-add-btn" onClick={onOpenCreateQuest}>
            <span className="btn-icon">➕</span>
            <span>CREATE CUSTOM QUEST</span>
          </button>
        </div>

        {/* System Advisor Intelligent Advice Widget */}
        {primaryAdvice && (
          <div className={`system-advisor-card advice-${primaryAdvice.type}`}>
            <div className="advisor-header">
              <span className="advisor-chip">{primaryAdvice.headline}</span>
            </div>
            <p className="advisor-text">{primaryAdvice.advice}</p>
          </div>
        )}

        {/* Daily Quest Hub Card */}
        <div className="hud-card daily-quests-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <div className="quests-card-header">
            <div>
              <span className="hud-tag">TODAY'S MISSION LOG</span>
              <h3 className="section-title">DAILY HABIT QUESTS</h3>
            </div>
            <div className="daily-progress-badge">
              <span className="pct-num">{dailyPct}%</span>
              <span className="pct-label">COMPLETED</span>
            </div>
          </div>

          <div className="daily-progress-bar-container">
            <div className="daily-progress-fill" style={{ width: `${dailyPct}%` }} />
          </div>

          <div className="dashboard-quest-list">
            {dailyQuests.length === 0 ? (
              <div className="empty-state-notice">
                <p>No daily habit quests active. Click 'CREATE CUSTOM QUEST' above to assign missions.</p>
              </div>
            ) : (
              dailyQuests.map(quest => {
                const isDone = quest.status === 'completed';
                return (
                  <div
                    key={quest.id}
                    className={`quest-item-row ${isDone ? 'completed' : ''}`}
                    onClick={() => onToggleQuest(quest.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="checkbox-frame">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => onToggleQuest(quest.id)}
                        className="hud-checkbox"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <div className="quest-info">
                      <div className="quest-title-row">
                        <span className="quest-category-badge">{quest.category.toUpperCase()}</span>
                        <h4 className="quest-title">{quest.title}</h4>
                      </div>
                      <p className="quest-desc">{quest.description}</p>
                      {quest.subtasks && quest.subtasks.length > 0 && (
                        <div className="subtasks-summary">
                          <span>
                            {quest.subtasks.filter(s => s.completed).length}/{quest.subtasks.length} Subtasks
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="quest-reward-pill">
                      <span>+{quest.xpReward} XP</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="card-footer-action">
            <button className="view-all-quests-btn" onClick={() => setActiveTab('quests')}>
              VIEW ALL QUESTS & CATEGORIES →
            </button>
          </div>
        </div>

        {/* Active Campaign Tracker Summary */}
        {activeCampaign && (
          <div className="hud-card campaign-snippet-card" onClick={() => setActiveTab('campaigns')}>
            <div className="campaign-snippet-header">
              <span className="hud-tag">[ACTIVE CAMPAIGN]</span>
              <span className="campaign-days-badge">
                Day {activeCampaign.currentDay} / {activeCampaign.totalDays}
              </span>
            </div>
            <h4 className="campaign-title">{activeCampaign.title}</h4>
            <p className="campaign-desc">{activeCampaign.description}</p>
            <div className="campaign-bar-track">
              <div
                className="campaign-bar-fill"
                style={{
                  width: `${Math.round((activeCampaign.currentDay / activeCampaign.totalDays) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
