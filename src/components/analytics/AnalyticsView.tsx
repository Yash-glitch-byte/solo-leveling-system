import React from 'react';
import { PlayerProfile, DailyActivityRecord, Quest } from '../../types';

interface AnalyticsViewProps {
  player: PlayerProfile;
  history: DailyActivityRecord[];
  quests: Quest[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ player, history, quests }) => {
  // Generate last 7 days metrics
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const record = history.find(h => h.date === dateStr);
    return {
      date: dateStr,
      label: dayName,
      xp: record ? record.xpGained : (i === 6 ? player.currentXp : 0),
      focusMins: record ? record.focusMinutes : 0,
      quests: record ? record.questsCompleted : 0
    };
  });

  const maxXp = Math.max(100, ...last7Days.map(d => d.xp));
  const maxFocus = Math.max(60, ...last7Days.map(d => d.focusMins));

  // Category distribution from all quests
  const categoryCounts: Record<string, number> = {};
  quests.forEach(q => {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  });

  return (
    <div className="analytics-view-container">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <span className="hud-tag">[BIOMETRIC & COGNITIVE TELEMETRY]</span>
          <h2 className="section-title">PROGRESS & METRIC ANALYTICS</h2>
        </div>
        <p className="analytics-subtitle">
          Real-time visualization of cognitive focus time, XP acquisition cadence, and habit consistency without external data transmission.
        </p>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="analytics-kpi-grid">
        <div className="hud-card kpi-card">
          <span className="kpi-label">TOTAL EXP ACCUMULATED</span>
          <span className="kpi-value cyan">{player.level * 100 + player.currentXp}</span>
          <span className="kpi-sub">Level {player.level} ({player.rank})</span>
        </div>

        <div className="hud-card kpi-card">
          <span className="kpi-label">TOTAL FOCUS MINUTES</span>
          <span className="kpi-value purple">{player.totalFocusMinutes}m</span>
          <span className="kpi-sub">Deep chamber focus</span>
        </div>

        <div className="hud-card kpi-card">
          <span className="kpi-label">QUESTS COMPLETED</span>
          <span className="kpi-value gold">{player.totalQuestsCompleted}</span>
          <span className="kpi-sub">All domains recorded</span>
        </div>

        <div className="hud-card kpi-card">
          <span className="kpi-label">ACTIVE STREAK</span>
          <span className="kpi-value green">{player.currentStreak} Days</span>
          <span className="kpi-sub">Best: {player.bestStreak} days</span>
        </div>
      </div>

      {/* SVG Charts Section */}
      <div className="charts-layout-grid">
        {/* Chart 1: 7-Day XP Acquisition Cadence (SVG Line/Area) */}
        <div className="hud-card chart-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <h3 className="chart-heading">7-DAY EXP ACQUISITION VELOCITY</h3>
          <div className="svg-chart-container">
            <svg viewBox="0 0 500 200" className="analytics-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#00d2ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(0, 210, 255, 0.15)" strokeDasharray="3 3" />
              <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(0, 210, 255, 0.15)" strokeDasharray="3 3" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(0, 210, 255, 0.25)" />

              {/* Data points */}
              {(() => {
                const points = last7Days.map((d, i) => {
                  const x = 50 + i * (420 / 6);
                  const y = 150 - (d.xp / maxXp) * 110;
                  return { x, y, label: d.label, xp: d.xp };
                });

                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaPath = `${linePath} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

                return (
                  <>
                    <path d={areaPath} fill="url(#xpGrad)" />
                    <path d={linePath} fill="none" stroke="#00d2ff" strokeWidth="3" />
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#00f0ff" stroke="#050811" strokeWidth="2" />
                        <text x={p.x} y="175" fill="#7f9ebc" fontSize="12" textAnchor="middle">
                          {p.label}
                        </text>
                        <text x={p.x} y={p.y - 10} fill="#e2f1ff" fontSize="11" textAnchor="middle">
                          {p.xp}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Chart 2: Daily Focus Chamber Minutes (SVG Bar Chart) */}
        <div className="hud-card chart-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <h3 className="chart-heading">FOCUS CHAMBER DURATION (MINS)</h3>
          <div className="svg-chart-container">
            <svg viewBox="0 0 500 200" className="analytics-svg" preserveAspectRatio="none">
              {/* Baseline */}
              <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(139, 92, 246, 0.3)" />

              {last7Days.map((d, i) => {
                const x = 55 + i * (420 / 6);
                const barHeight = Math.max(4, (d.focusMins / maxFocus) * 110);
                const y = 150 - barHeight;

                return (
                  <g key={i}>
                    <rect
                      x={x - 14}
                      y={y}
                      width="28"
                      height={barHeight}
                      rx="4"
                      fill="#8b5cf6"
                      opacity="0.85"
                    />
                    <text x={x} y="175" fill="#7f9ebc" fontSize="12" textAnchor="middle">
                      {d.label}
                    </text>
                    <text x={x} y={y - 8} fill="#c4b5fd" fontSize="11" textAnchor="middle">
                      {d.focusMins}m
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Domain Category Allocation Progress */}
      <div className="hud-card domain-breakdown-card">
        <h3 className="chart-heading">MISSION DOMAIN DISTRIBUTION</h3>
        <div className="domain-breakdown-list">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const pct = Math.round((count / quests.length) * 100);
            return (
              <div key={cat} className="domain-row">
                <div className="domain-meta">
                  <span className="cat-name">{cat.toUpperCase()}</span>
                  <span className="cat-count">{count} Quests ({pct}%)</span>
                </div>
                <div className="domain-track">
                  <div className="domain-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
