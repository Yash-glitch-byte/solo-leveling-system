import React, { useState } from 'react';
import { PlayerProfile, GameSettings } from '../../types';
import { soundEngine } from '../../game/sound';

interface HeaderProps {
  player: PlayerProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  player,
  activeTab,
  setActiveTab,
  settings,
  updateSettings,
  onOpenSettings
}) => {
  const [ambientActive, setAmbientActive] = useState<boolean>(false);

  const toggleSoundFx = () => {
    const nextVal = !settings.soundFxEnabled;
    soundEngine.enabled = nextVal;
    updateSettings({ soundFxEnabled: nextVal });
    if (nextVal) soundEngine.playPing();
  };

  const toggleAmbientMusic = () => {
    const nextVal = !ambientActive;
    setAmbientActive(nextVal);
    soundEngine.musicEnabled = nextVal;
    updateSettings({ musicEnabled: nextVal });
    if (nextVal) {
      soundEngine.startAmbientFocus();
    } else {
      soundEngine.stopAmbientFocus();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'STATUS', icon: '⚡' },
    { id: 'quests', label: 'QUESTS', icon: '📜' },
    { id: 'dungeons', label: 'DUNGEON', icon: '🗝️' },
    { id: 'campaigns', label: 'CAMPAIGN', icon: '🌌' },
    { id: 'bosses', label: 'BOSS RAIDS', icon: '🗡️' },
    { id: 'skill-tree', label: 'SKILLS', icon: '🌳' },
    { id: 'fitness', label: 'FITNESS', icon: '🏋️' },
    { id: 'analytics', label: 'ANALYTICS', icon: '📊' }
  ];

  return (
    <header className="system-header">
      {/* Top Banner Row */}
      <div className="header-top-row">
        {/* Brand / Logo */}
        <div className="system-brand" onClick={() => setActiveTab('dashboard')} role="button" tabIndex={0}>
          <div className="brand-gem"></div>
          <div className="brand-text-block">
            <h1 className="brand-title">SYSTEM REAWAKEN</h1>
            <span className="brand-subtitle">[HUNTER PROTOCOL v2.4]</span>
          </div>
        </div>

        {/* Player Mini Vitals Quick View */}
        <div className="header-player-quick">
          <div className="player-rank-chip">
            <span className="rank-badge">{player.rank}</span>
            <span className="level-badge">LV.{player.level}</span>
          </div>

          <div className="xp-mini-track">
            <div className="xp-mini-label">
              <span>EXP</span>
              <span>{player.currentXp} / {player.requiredXp}</span>
            </div>
            <div className="xp-mini-bar">
              <div
                className="xp-mini-fill"
                style={{ width: `${Math.min(100, Math.round((player.currentXp / player.requiredXp) * 100))}%` }}
              />
            </div>
          </div>

          <div className="streak-chip" title={`${player.currentStreak}-day active completion streak`}>
            <span className="flame-icon">🔥</span>
            <span className="streak-num">{player.currentStreak}d</span>
          </div>

          {player.statPoints > 0 && (
            <button
              className="stat-points-alert-btn"
              onClick={() => setActiveTab('dashboard')}
              title="You have unallocated stat points!"
            >
              +{player.statPoints} PTS
            </button>
          )}
        </div>

        {/* Audio & System Controls */}
        <div className="header-controls">
          <button
            className={`hud-icon-btn ${settings.soundFxEnabled ? 'active' : 'muted'}`}
            onClick={toggleSoundFx}
            title={settings.soundFxEnabled ? 'Sound FX: ACTIVE' : 'Sound FX: MUTED'}
            aria-label="Toggle Sound Effects"
          >
            {settings.soundFxEnabled ? '🔊 SFX' : '🔇 SFX'}
          </button>

          <button
            className={`hud-icon-btn ambient-btn ${ambientActive ? 'active' : ''}`}
            onClick={toggleAmbientMusic}
            title={ambientActive ? 'Ambient Focus Drone: ACTIVE' : 'Ambient Focus Drone: OFF'}
            aria-label="Toggle Ambient Focus Sound"
          >
            {ambientActive ? '🧘 AMBIENT ON' : '🧘 AMBIENT OFF'}
          </button>

          <button
            className="hud-icon-btn gear-btn"
            onClick={onOpenSettings}
            title="System Settings & Backup"
            aria-label="Open Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Main Navigation Bar (Desktop) */}
      <nav className="desktop-nav-bar" aria-label="Main Navigation">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-tab-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playPing();
              setActiveTab(item.id);
            }}
          >
            <span className="nav-tab-icon">{item.icon}</span>
            <span className="nav-tab-label">{item.label}</span>
            {activeTab === item.id && <span className="tab-neon-glow" />}
          </button>
        ))}
      </nav>
    </header>
  );
};
