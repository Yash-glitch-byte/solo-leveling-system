import React, { useState } from 'react';
import { BossChallenge, BossObjective } from '../../types';
import { soundEngine } from '../../game/sound';

interface BossHubProps {
  bosses: BossChallenge[];
  onToggleBossObjective: (bossId: string, objectiveId: string) => void;
}

export const BossHub: React.FC<BossHubProps> = ({ bosses, onToggleBossObjective }) => {
  const [selectedBossId, setSelectedBossId] = useState<string>(bosses[0]?.id || '');
  const [justDefeatedBoss, setJustDefeatedBoss] = useState<BossChallenge | null>(null);

  const selectedBoss = bosses.find(b => b.id === selectedBossId) || bosses[0];

  const handleObjectiveClick = (bossId: string, obj: BossObjective) => {
    soundEngine.playBossHit();
    onToggleBossObjective(bossId, obj.id);
  };

  return (
    <div className="boss-hub-container">
      {/* Header */}
      <div className="boss-hub-header">
        <div>
          <span className="hud-tag">[MILESTONE RAID PROTOCOL]</span>
          <h2 className="section-title">MONARCH BOSS BATTLES</h2>
        </div>
        <p className="boss-hub-desc">
          Milestone bosses embody major real-life friction points: procrastination, technical interviews, code architecture, and physical endurance. Strike them down by completing tangible real-world criteria.
        </p>
      </div>

      {/* Boss Selector Tabs */}
      <div className="boss-roster-row">
        {bosses.map(b => (
          <div
            key={b.id}
            className={`hud-card boss-roster-card ${b.id === selectedBoss?.id ? 'active' : ''} ${b.defeated ? 'defeated' : ''}`}
            onClick={() => {
              soundEngine.playPing();
              setSelectedBossId(b.id);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="roster-top">
              <span className={`boss-rank-badge ${b.defeated ? 'defeated' : ''}`}>{b.rank}</span>
              <span className="boss-status">{b.defeated ? 'DEFEATED ☠' : 'ACTIVE RAID'}</span>
            </div>
            <h4 className="roster-name">{b.name}</h4>
            <span className="roster-title">{b.title}</span>
            <div className="roster-hp-bar">
              <div
                className="roster-hp-fill"
                style={{ width: `${Math.round((b.hpCurrent / b.hpTotal) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Selected Boss Battle Arena */}
      {selectedBoss && (
        <div className={`hud-card boss-arena-card ${selectedBoss.defeated ? 'arena-cleared' : ''}`}>
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <div className="arena-header">
            <div>
              <span className="boss-raid-tag">
                {selectedBoss.defeated ? '✦ MONARCH CONQUERED' : '⚠️ ACTIVE RAID ENGAGEMENT'}
              </span>
              <h2 className="arena-boss-name">{selectedBoss.name}</h2>
              <span className="arena-boss-title">“{selectedBoss.title}”</span>
            </div>
            <div className="boss-reward-summary">
              <span className="reward-label">TRIUMPH REWARDS:</span>
              <span className="reward-val">+{selectedBoss.rewardXp} EXP • Title: “{selectedBoss.rewardTitle}”</span>
            </div>
          </div>

          <p className="arena-lore">{selectedBoss.lore}</p>

          {/* Boss HP Bar */}
          <div className="boss-hp-section">
            <div className="boss-hp-meta">
              <span>MONARCH VITALITY</span>
              <span className="hp-text">{selectedBoss.hpCurrent} / {selectedBoss.hpTotal} HP</span>
            </div>
            <div className="boss-hp-track-outer">
              <div
                className="boss-hp-track-fill"
                style={{ width: `${Math.round((selectedBoss.hpCurrent / selectedBoss.hpTotal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Battle Directives (Objectives) */}
          <div className="boss-directives-box">
            <h4 className="directives-heading">COMBAT OBJECTIVES (REAL-WORLD MILESTONES)</h4>
            <div className="directives-list">
              {selectedBoss.objectives.map(obj => (
                <div
                  key={obj.id}
                  className={`directive-item ${obj.completed ? 'struck' : ''}`}
                  onClick={() => handleObjectiveClick(selectedBoss.id, obj)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="strike-checkbox">
                    {obj.completed ? '⚔️ HIT' : '○'}
                  </div>
                  <div className="directive-content">
                    <h5 className="directive-title">{obj.title}</h5>
                    <p className="directive-desc">{obj.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedBoss.defeated && (
            <div className="boss-defeated-banner">
              <h3>☠ {selectedBoss.name.toUpperCase()} HAS BEEN VANQUISHED!</h3>
              <p>You have earned the permanent title: <strong>“{selectedBoss.rewardTitle}”</strong>.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
