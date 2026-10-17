import React, { useState, useRef, useEffect } from 'react';
import { PlayerProfile, GameSettings, CloudSyncStatus } from '../../types';
import { soundEngine } from '../../game/sound';
import { notificationEngine } from '../../game/notificationSystem';

interface HeaderProps {
  player: PlayerProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenSettings: () => void;
  syncStatus: CloudSyncStatus;
  updateAvailable?: boolean;
  onApplyUpdate?: () => void;
  onOpenTutorial: () => void;
  onOpenInstall?: () => void;
  canInstall?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  player,
  activeTab,
  setActiveTab,
  settings,
  updateSettings,
  onOpenSettings,
  syncStatus,
  updateAvailable,
  onApplyUpdate,
  onOpenTutorial,
  onOpenInstall,
  canInstall
}) => {
  const [ambientActive, setAmbientActive] = useState<boolean>(false);
  const [notifGranted, setNotifGranted] = useState<boolean>(() => {
    return notificationEngine.getPermissionStatus() === 'granted';
  });

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
    { id: 'inventory', label: 'LOADOUT (E-RING)', icon: '💍' },
    { id: 'monarch', label: 'PSEUDO MONARCH', icon: '👑' },
    { id: 'campaigns', label: 'CAMPAIGN', icon: '🌌' },
    { id: 'bosses', label: 'BOSS RAIDS', icon: '🗡️' },
    { id: 'skill-tree', label: 'SKILLS', icon: '🌳' },
    { id: 'fitness', label: 'FITNESS', icon: '🏋️' },
    { id: 'multiplayer', label: 'ALLIES', icon: '👥' },
    { id: 'competitions', label: 'ARENA', icon: '🏆' },
    { id: 'companion', label: 'COMPANION', icon: '🎙️' },
    { id: 'verification', label: 'VERIFICATION', icon: '🛡️' },
    { id: 'analytics', label: 'ANALYTICS', icon: '📊' }
  ];

  const navContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active tab into center view whenever activeTab changes
  useEffect(() => {
    if (navContainerRef.current) {
      const activeEl = navContainerRef.current.querySelector('.nav-tab-btn.active') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  const scrollNav = (direction: 'left' | 'right') => {
    soundEngine.playPing();
    if (navContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      navContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <header className="system-header">
      {/* Update Available Notification Banner */}
      {updateAvailable && (
        <div className="update-notification-banner" onClick={onApplyUpdate} role="button" tabIndex={0}>
          <span>✦ NEW SYSTEM REAWAKEN UPDATE AVAILABLE — TAP TO RELOAD ✦</span>
        </div>
      )}

      {/* Top Banner Row */}
      <div className="header-top-row">
        {/* Brand / Logo */}
        <div className="system-brand" onClick={() => setActiveTab('dashboard')} role="button" tabIndex={0}>
          <div className="brand-gem"></div>
          <div className="brand-text-block">
            <h1 className="brand-title">SYSTEM REAWAKEN</h1>
            <span className="brand-subtitle">[HUNTER PROTOCOL v2.5]</span>
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

          {/* Sync Status Badge */}
          <div className={`sync-status-badge sync-${syncStatus}`} title={`Cloud state: ${syncStatus}`}>
            <span className="sync-dot" />
            <span className="sync-label">
              {syncStatus === 'synced' && 'CLOUD SYNCED'}
              {syncStatus === 'local_only' && 'SAVED LOCALLY'}
              {syncStatus === 'sync_pending' && 'SYNC PENDING'}
              {syncStatus === 'offline' && 'OFFLINE'}
            </span>
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

        {/* Audio, Tutorial & System Controls */}
        <div className="header-controls">
          {onOpenInstall && (
            <button
              className="hud-icon-btn install-header-btn"
              onClick={onOpenInstall}
              title="Install SYSTEM REAWAKEN as Mobile or PC App"
              aria-label="Install App"
              style={{
                borderColor: '#00f0ff',
                color: '#00f0ff',
                boxShadow: canInstall ? '0 0 14px rgba(0, 240, 255, 0.45)' : 'none'
              }}
            >
              📲 INSTALL
            </button>
          )}

          <button
            className="hud-icon-btn guide-btn"
            onClick={onOpenTutorial}
            title="Open Interactive Tutorial & System Guide"
            aria-label="Open Tutorial"
          >
            📖 GUIDE
          </button>

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
            className={`hud-icon-btn notif-btn ${notifGranted ? 'active' : ''}`}
            onClick={async () => {
              soundEngine.playPing();
              const granted = await notificationEngine.requestPermission();
              setNotifGranted(granted);
              if (granted) {
                soundEngine.playLevelUp();
                alert('✓ System Alerts Active! Biological reminders (drinking water every 45 mins) and daily task alerts are synchronized.');
              } else {
                alert('Notification permission was not enabled. Check browser permission settings if you wish to enable alerts.');
              }
            }}
            title={notifGranted ? 'System Alerts & Hydration: ACTIVE' : 'Enable System Push Notifications & Hydration Reminders'}
            aria-label="Toggle Notifications"
            style={{
              borderColor: notifGranted ? '#10b981' : 'rgba(0, 210, 255, 0.4)',
              color: notifGranted ? '#34d399' : '#7f9ebc'
            }}
          >
            {notifGranted ? '🔔 ALERTS ON' : '🔔 ALERTS'}
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

      {/* Main Navigation Bar with Swipe / Scroll Controls */}
      <div className="nav-bar-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
        {/* Left Scroll Arrow */}
        <button
          className="nav-scroll-btn left"
          onClick={() => scrollNav('left')}
          title="Scroll or swipe tabs left (Status / Quests / Dungeons)"
          aria-label="Scroll navigation left"
          style={{
            position: 'absolute',
            left: '4px',
            zIndex: 10,
            background: 'rgba(5, 12, 26, 0.95)',
            border: '1px solid #00f0ff',
            color: '#00f0ff',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
            fontSize: '0.75rem'
          }}
        >
          ◀
        </button>

        {/* Scrollable Nav Track */}
        <nav
          ref={navContainerRef}
          className="desktop-nav-bar"
          aria-label="Main Navigation"
          style={{
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            padding: '0 42px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            display: 'flex',
            gap: '8px'
          }}
        >
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-tab-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playPing();
                setActiveTab(item.id);
              }}
              style={{ flexShrink: 0 }}
            >
              <span className="nav-tab-icon">{item.icon}</span>
              <span className="nav-tab-label">{item.label}</span>
              {activeTab === item.id && <span className="tab-neon-glow" />}
            </button>
          ))}
        </nav>

        {/* Right Scroll Arrow */}
        <button
          className="nav-scroll-btn right"
          onClick={() => scrollNav('right')}
          title="Scroll or swipe tabs right (Allies / Arena / Companion / Verification)"
          aria-label="Scroll navigation right"
          style={{
            position: 'absolute',
            right: '4px',
            zIndex: 10,
            background: 'rgba(5, 12, 26, 0.95)',
            border: '1px solid #00f0ff',
            color: '#00f0ff',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
            fontSize: '0.75rem'
          }}
        >
          ▶
        </button>
      </div>
    </header>
  );
};
