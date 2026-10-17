import React, { useRef } from 'react';
import { GameSettings, SystemReawakenState } from '../../types';
import { exportBackupJSON, importBackupJSON, resetGameStorage } from '../../storage';
import { soundEngine } from '../../game/sound';

interface SettingsModalProps {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  fullState: SystemReawakenState;
  onRestoreState: (restored: SystemReawakenState) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  updateSettings,
  fullState,
  onRestoreState,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    soundEngine.masterVolume = vol;
    updateSettings({ masterVolume: vol });
  };

  const handleExport = () => {
    soundEngine.playPing();
    exportBackupJSON(fullState);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const restored = importBackupJSON(text);
        if (confirm('Restore this backup save? Current local session will be updated.')) {
          soundEngine.playLevelUp();
          onRestoreState(restored);
          alert('✦ Hunter Progress Restored Successfully!');
          onClose();
        }
      } catch (err: any) {
        alert('Failed to restore backup: ' + (err.message || 'Invalid JSON format.'));
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (confirm('⚠️ DANGER: Completely wipe your character progress, levels, and quests? This action cannot be undone unless you have a backup.')) {
      resetGameStorage();
      window.location.reload();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="hud-card settings-modal-card">
        <div className="card-corner tl" />
        <div className="card-corner tr" />
        <div className="card-corner bl" />
        <div className="card-corner br" />

        <div className="modal-header">
          <span className="hud-tag">[SYSTEM PREFERENCES]</span>
          <h3>SETTINGS & SAVE DATA</h3>
          <button className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-body">
          {/* Sound Configuration */}
          <div className="settings-section">
            <h4 className="section-title">AUDIO CALIBRATION</h4>
            <div className="setting-row">
              <label htmlFor="soundFxCheck">Synthesized Sound Effects</label>
              <input
                id="soundFxCheck"
                type="checkbox"
                checked={settings.soundFxEnabled}
                onChange={e => {
                  soundEngine.enabled = e.target.checked;
                  updateSettings({ soundFxEnabled: e.target.checked });
                  if (e.target.checked) soundEngine.playPing();
                }}
                className="hud-checkbox"
              />
            </div>

            <div className="setting-row">
              <label htmlFor="masterVol">Master Volume: {Math.round(settings.masterVolume * 100)}%</label>
              <input
                id="masterVol"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.masterVolume}
                onChange={handleVolumeChange}
                className="hud-slider"
              />
            </div>
          </div>

          {/* Visual & Accessibility */}
          <div className="settings-section">
            <h4 className="section-title">ACCESSIBILITY & PERFORMANCE</h4>
            <div className="setting-row">
              <label htmlFor="reducedMotionCheck">Reduced Motion Mode (Low GPU / i3 Laptop)</label>
              <input
                id="reducedMotionCheck"
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={e => updateSettings({ reducedMotion: e.target.checked })}
                className="hud-checkbox"
              />
            </div>
          </div>

          {/* Data Portability (Backup & Restore) */}
          <div className="settings-section">
            <h4 className="section-title">DATA MANAGEMENT (100% OFFLINE)</h4>
            <p className="settings-desc">
              Your Hunter progress is saved locally in this browser. Export a portable JSON backup file to transfer between devices or restore anytime.
            </p>

            <div className="backup-actions-row">
              <button className="hud-btn-primary" onClick={handleExport}>
                ⬇ EXPORT BACKUP SAVE (JSON)
              </button>

              <button
                className="hud-btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                ⬆ RESTORE FROM BACKUP
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileInput}
              />
            </div>
          </div>

          {/* Destructive Action */}
          <div className="settings-section danger-zone">
            <h4 className="section-title danger">SYSTEM REBOOT PROTOCOL</h4>
            <button className="hud-btn-danger" onClick={handleFactoryReset}>
              ⚠️ REBOOT SYSTEM & RESET PLAYER DATA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
