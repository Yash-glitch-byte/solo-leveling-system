import React from 'react';
import { Campaign, CampaignDay } from '../../types';
import { soundEngine } from '../../game/sound';

interface CampaignViewProps {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  onSelectCampaign: (id: string) => void;
  onToggleDayCompleted: (campaignId: string, dayNumber: number) => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onToggleDayCompleted
}) => {
  const currentCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0];

  const completedDaysCount = currentCampaign ? currentCampaign.days.filter(d => d.completed).length : 0;
  const progressPct = currentCampaign ? Math.round((completedDaysCount / currentCampaign.totalDays) * 100) : 0;

  return (
    <div className="campaign-view-container">
      {/* Header */}
      <div className="campaign-header">
        <div>
          <span className="hud-tag">[HABIT AUTOMATION SCIENCE]</span>
          <h2 className="section-title">CHALLENGE CAMPAIGNS</h2>
        </div>

        {/* Campaign Switcher Tabs */}
        <div className="campaign-switcher">
          {campaigns.map(camp => (
            <button
              key={camp.id}
              className={`campaign-tab-btn ${camp.id === currentCampaign?.id ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playPing();
                onSelectCampaign(camp.id);
              }}
            >
              {camp.type === '21-day' ? '21-DAY AWAKENING' : '66-DAY EVOLUTION'}
            </button>
          ))}
        </div>
      </div>

      {currentCampaign && (
        <div className="campaign-body">
          {/* Active Campaign Status Hero Card */}
          <div className="hud-card campaign-hero-card">
            <div className="card-corner tl" />
            <div className="card-corner tr" />
            <div className="card-corner bl" />
            <div className="card-corner br" />

            <div className="hero-top-row">
              <div>
                <span className="campaign-type-badge">{currentCampaign.totalDays} DAYS PROTOCOL</span>
                <h3 className="hero-campaign-title">{currentCampaign.title}</h3>
                <p className="hero-campaign-desc">{currentCampaign.description}</p>
              </div>

              <div className="hero-progress-stat">
                <span className="hero-pct">{progressPct}%</span>
                <span className="hero-stat-label">
                  {completedDaysCount} / {currentCampaign.totalDays} DAYS CLEARED
                </span>
              </div>
            </div>

            <div className="hero-progress-track">
              <div className="hero-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="hero-domains-chips">
              <span>TARGET DOMAINS:</span>
              {currentCampaign.categories.map(cat => (
                <span key={cat} className="domain-chip">{cat.toUpperCase()}</span>
              ))}
            </div>
          </div>

          {/* Interactive Day Grid Roadmap */}
          <div className="days-roadmap-header">
            <h3 className="roadmap-title">CAMPAIGN TIMELINE ROADMAP</h3>
            <span className="roadmap-hint">Click any day tile to toggle milestone completion</span>
          </div>

          <div className="days-roadmap-grid">
            {currentCampaign.days.map(day => (
              <div
                key={day.dayNumber}
                className={`day-card ${day.completed ? 'completed' : ''} ${day.isRestDay ? 'rest-day' : ''}`}
                onClick={() => onToggleDayCompleted(currentCampaign.id, day.dayNumber)}
                role="button"
                tabIndex={0}
              >
                <div className="day-top">
                  <span className="day-num">DAY {day.dayNumber}</span>
                  <span className="day-status-icon">
                    {day.completed ? '✓' : day.isRestDay ? '☕' : '○'}
                  </span>
                </div>

                <div className="day-mid">
                  <h5 className="day-card-title">{day.title}</h5>
                  <span className="day-target">
                    {day.isRestDay ? 'Active Recovery' : `${day.targetMinutes}m Focus • ${day.requiredQuests} Quests`}
                  </span>
                </div>

                <div className="day-foot">
                  <span className="day-action-label">
                    {day.completed ? 'COMPLETED' : day.isRestDay ? 'REST & RESTORE' : 'MARK COMPLETE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
