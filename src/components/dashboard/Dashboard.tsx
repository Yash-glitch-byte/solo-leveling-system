import React from 'react';
import { PlayerProfile, Quest, AttributeKey, BossChallenge, Campaign, EquippedGear } from '../../types';
import { getAttributeDisplayName, getAttributeColor } from '../../game/progression';
import { generateAdvisorAdvice } from '../../game/advisor';
import { soundEngine } from '../../game/sound';

interface DashboardProps {
  player: PlayerProfile;
  quests: Quest[];
  bosses: BossChallenge[];
  activeCampaign: Campaign | undefined;
  equippedGear?: EquippedGear;
  onAllocateStat: (attribute: AttributeKey) => void;
  onToggleQuest: (questId: string) => void;
  onEnterDungeon: () => void;
  onOpenCreateQuest: () => void;
  onOpenEditProfile: () => void;
  setActiveTab: (tab: string) => void;
}

const ATTRIBUTE_DETAILS: Record<AttributeKey, { realLife: string; icon: string }> = {
  strength: { icon: '🏋️', realLife: 'Push-ups, workouts & physical energy' },
  vitality: { icon: '💧', realLife: 'Hydration, sleep & biological recovery' },
  intelligence: { icon: '💻', realLife: 'DSA, algorithmic problem solving & technical learning' },
  focus: { icon: '🧠', realLife: 'Deep study, zero distraction & concentration' },
  discipline: { icon: '⏰', realLife: 'Waking up, daily consistency & routine' },
  career: { icon: '💼', realLife: 'Resume, coding portfolio & career milestones' },
  communication: { icon: '🗣️', realLife: 'Reading, articulation & social confidence' }
};

export const Dashboard: React.FC<DashboardProps> = ({
  player,
  quests,
  bosses,
  activeCampaign,
  equippedGear,
  onAllocateStat,
  onToggleQuest,
  onEnterDungeon,
  onOpenCreateQuest,
  onOpenEditProfile,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="edit-profile-btn"
                onClick={onOpenEditProfile}
                title="Edit your Hunter name, title & avatar"
                style={{
                  background: 'rgba(0, 210, 255, 0.12)',
                  border: '1px solid rgba(0, 210, 255, 0.4)',
                  color: '#00f0ff',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ✏️ EDIT IDENTITY
              </button>
              <span className="hunter-rank-badge">{player.rank}</span>
            </div>
          </div>

          <div
            className="profile-identity-row"
            onClick={onOpenEditProfile}
            style={{ cursor: 'pointer' }}
            title="Click to edit your Hunter Name and Title"
          >
            <div className="avatar-frame">
              <span className="avatar-icon">{player.avatarIcon}</span>
              <div className="avatar-ring-glow"></div>
            </div>
            <div className="identity-details">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="player-display-name" style={{ margin: 0 }}>{player.name}</h2>
                <span style={{ fontSize: '0.78rem', color: '#00d2ff' }}>✏️</span>
              </div>
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

          {/* Core Attribute Grid with Real-Life Skill Reflection */}
          <div className="attributes-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attributeKeys.map(key => {
              const val = player.stats[key] || 10;
              const color = getAttributeColor(key);
              const details = ATTRIBUTE_DETAILS[key] || { icon: '⚡', realLife: 'Core life metric' };
              return (
                <div
                  key={key}
                  className="attribute-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(10, 20, 38, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div className="attr-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{details.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="attr-dot" style={{ backgroundColor: color }} />
                        <span className="attr-name" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                          {getAttributeDisplayName(key)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#7f9ebc', display: 'block', marginTop: '1px' }}>
                        {details.realLife}
                      </span>
                    </div>
                  </div>
                  <div className="attr-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="attr-value" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                      {val}
                    </span>
                    <button
                      className="add-stat-btn"
                      disabled={player.statPoints <= 0}
                      onClick={() => onAllocateStat(key)}
                      title={`Upgrade ${key} (+1)`}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '4px',
                        background: player.statPoints > 0 ? 'rgba(0, 210, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        border: player.statPoints > 0 ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: player.statPoints > 0 ? '#00f0ff' : '#4a627a',
                        cursor: player.statPoints > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-Life Self Improvement Breakdown */}
          <div style={{ marginTop: '14px', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '8px', padding: '12px 14px' }}>
            <span style={{ fontSize: '0.74rem', color: '#00f0ff', fontFamily: 'var(--font-display)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
              ✦ HOW YOUR REAL-LIFE ACTIONS LEVEL YOU UP
            </span>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#b9d2eb', fontSize: '0.76rem', lineHeight: '1.5' }}>
              <li><strong>Push-up Sets & Cardio</strong>: Directly upgrades your <strong>Strength (STR)</strong>.</li>
              <li><strong>DSA & Coding Challenges</strong>: Directly upgrades your <strong>Intelligence (INT)</strong>.</li>
              <li><strong>25-Min Focus Chambers</strong>: Directly upgrades your <strong>Focus (FOC)</strong>.</li>
              <li><strong>Hydration & Sleep Protocol</strong>: Directly upgrades your <strong>Vitality (VIT)</strong>.</li>
            </ul>
          </div>

          {/* Equipped Hunter Attires & E-Ring */}
          {equippedGear && (
            <div style={{ marginTop: '12px', background: 'rgba(14, 27, 54, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#ffd700', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  💍 EQUIPPED ATTIRE & RELICS
                </span>
                <button
                  onClick={() => setActiveTab('inventory')}
                  style={{ background: 'transparent', border: 'none', color: '#00d2ff', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Manage Loadout →
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.entries(equippedGear).map(([slotKey, item]) => (
                  <div
                    key={slotKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: item ? 'rgba(0, 210, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      border: item ? '1px solid rgba(0, 210, 255, 0.3)' : '1px dashed rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      color: item ? '#fff' : '#4a627a'
                    }}
                  >
                    <span>{item ? item.icon : '⚪'}</span>
                    <span>{item ? item.name : slotKey.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
