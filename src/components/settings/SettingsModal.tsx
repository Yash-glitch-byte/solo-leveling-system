import React, { useRef, useState } from 'react';
import { GameSettings, SystemReawakenState, CloudAccount } from '../../types';
import { exportBackupJSON, importBackupJSON, resetGameStorage } from '../../storage';
import { syncWithCloud } from '../../storage/cloudSync';
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
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Cloud Account local edits
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(fullState.cloudAccount.cloudSyncEnabled);
  const [endpointUrl, setEndpointUrl] = useState(fullState.cloudAccount.endpointUrl || '');
  const [accessToken, setAccessToken] = useState(fullState.cloudAccount.accessToken || '');

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    soundEngine.masterVolume = vol;
    updateSettings({ masterVolume: vol });
  };

  const handleExport = () => {
    soundEngine.playPing();
    exportBackupJSON(fullState);
  };

  const handleManualSync = async () => {
    soundEngine.playPing();
    setSyncing(true);
    setSyncFeedback(null);

    const updatedState: SystemReawakenState = {
      ...fullState,
      cloudAccount: {
        ...fullState.cloudAccount,
        cloudSyncEnabled,
        endpointUrl: endpointUrl.trim() || undefined,
        accessToken: accessToken.trim() || undefined
      }
    };

    const result = await syncWithCloud(updatedState);
    setSyncing(false);
    setSyncFeedback(result.message);

    if (result.success && result.mergedState) {
      soundEngine.playLevelUp();
      onRestoreState(result.mergedState);
    }
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
          <h3>SETTINGS & CLOUD SYNCHRONIZATION</h3>
          <button className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-body">
          {/* Cloud Sync & Cross-Device Continuation */}
          <div className="settings-section">
            <h4 className="section-title">CROSS-DEVICE CLOUD SYNCHRONIZATION</h4>
            <p className="settings-desc">
              Synchronize your hunter progression between your Phone and PC without losing levels or stat points.
            </p>

            <div className="setting-row">
              <label htmlFor="cloudSyncToggle">Enable Cloud Synchronization</label>
              <input
                id="cloudSyncToggle"
                type="checkbox"
                checked={cloudSyncEnabled}
                onChange={e => setCloudSyncEnabled(e.target.checked)}
                className="hud-checkbox"
              />
            </div>

            <div className="form-group">
              <label>Hunter Secret ID (Use same ID on Phone & PC to link saves)</label>
              <div className="id-copy-row">
                <input
                  type="text"
                  readOnly
                  value={fullState.cloudAccount.hunterId}
                  className="hud-input readonly"
                />
                <button
                  type="button"
                  className="hud-btn-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(fullState.cloudAccount.hunterId);
                    soundEngine.playPing();
                    alert('Hunter ID copied to clipboard!');
                  }}
                >
                  📋 COPY
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Optional Custom Supabase / REST Cloud Endpoint</label>
              <input
                type="url"
                value={endpointUrl}
                onChange={e => setEndpointUrl(e.target.value)}
                placeholder="https://your-project.supabase.co (Leave empty for default cloud vault)"
                className="hud-input"
              />
            </div>

            <button
              type="button"
              className="hud-btn-primary sync-now-btn"
              disabled={syncing}
              onClick={handleManualSync}
            >
              {syncing ? 'SYNCHRONIZING SAVE WITH CLOUD...' : '✦ SYNC HUNTER PROGRESS WITH CLOUD ✦'}
            </button>
            {syncFeedback && <p className="sync-feedback-text">{syncFeedback}</p>}
          </div>

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
              <label htmlFor="reducedMotionCheck">Reduced Motion Mode (Low GPU / Intel i3 Laptop)</label>
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
            <h4 className="section-title">OFFLINE DATA BACKUP & RESTORE</h4>
            <p className="settings-desc">
              Your hunter save is preserved locally. Export a portable JSON backup file to archive or restore anytime.
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
