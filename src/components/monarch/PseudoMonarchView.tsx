import React, { useState } from 'react';
import { PseudoMonarchState, ShadowCommander, PlayerProfile } from '../../types';
import { soundEngine } from '../../game/sound';

interface PseudoMonarchViewProps {
  monarch: PseudoMonarchState;
  player: PlayerProfile;
  onExtractShadow: (shadowId: string) => void;
  onToggleDeployShadow: (shadowId: string) => void;
  onAwakenMonarch: () => void;
}

export const PseudoMonarchView: React.FC<PseudoMonarchViewProps> = ({
  monarch,
  player,
  onExtractShadow,
  onToggleDeployShadow,
  onAwakenMonarch
}) => {
  const [selectedShadow, setSelectedShadow] = useState<ShadowCommander>(monarch.shadows[0]);
  const [ariseAnimating, setAriseAnimating] = useState<boolean>(false);

  const isEligibleToAwaken = player.level >= 5;

  const handleExtract = (shadow: ShadowCommander) => {
    soundEngine.playLevelUp();
    setAriseAnimating(true);
    setTimeout(() => {
      onExtractShadow(shadow.id);
      setAriseAnimating(false);
    }, 900);
  };

  const handleDeploy = (shadow: ShadowCommander) => {
    soundEngine.playPing();
    onToggleDeployShadow(shadow.id);
  };

  return (
    <div className="pseudo-monarch-container">
      {/* Top Header */}
      <div className="monarch-header">
        <div>
          <span className="hud-tag monarch-pill">[SHADOW SOVEREIGN PROTOCOL]</span>
          <h2 className="section-title">THE PSEUDO MONARCH SYSTEM</h2>
        </div>
        <div className="monarch-status-badge">
          <span className="status-label">AUTHORITY STATUS:</span>
          <span className={`status-val ${monarch.unlocked ? 'unlocked' : 'dormant'}`}>
            {monarch.unlocked ? 'AWAKENED (SHADOW DOMAIN ACTIVE)' : 'DORMANT (REQUIRES LEVEL 5)'}
          </span>
        </div>
      </div>

      {/* Awakening Callout if not yet unlocked */}
      {!monarch.unlocked ? (
        <div className="hud-card monarch-lock-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <div className="lock-icon-glow">👑</div>
          <h3 className="lock-heading">THE THRONE OF SHADOWS AWAITS</h3>
          <p className="lock-desc">
            To inherit the authority of the Pseudo Monarch, a hunter must prove their physical and mental endurance by attaining <strong>Level 5 (or defeating a Milestone Boss)</strong>.
          </p>

          <div className="level-requirement-gauge">
            <span>Progress: Level {player.level} / Level 5</span>
            <div className="req-bar-track">
              <div
                className="req-bar-fill"
                style={{ width: `${Math.min(100, Math.round((player.level / 5) * 100))}%` }}
              />
            </div>
          </div>

          <button
            className="hud-btn-primary awaken-monarch-btn"
            disabled={!isEligibleToAwaken}
            onClick={() => {
              soundEngine.playLevelUp();
              onAwakenMonarch();
            }}
          >
            {isEligibleToAwaken ? '✦ CLAIM SHADOW AUTHORITY: ARISE ✦' : 'LOCKED: REACH LEVEL 5'}
          </button>
        </div>
      ) : (
        <div className="monarch-awakened-content">
          {/* Active Passives Banner */}
          <div className="hud-card monarch-passives-card">
            <div className="card-corner tl" />
            <div className="card-corner tr" />
            <div className="card-corner bl" />
            <div className="card-corner br" />

            <h3 className="card-heading">ACTIVE SOVEREIGN DOMAINS</h3>
            <div className="passives-row">
              <div className="passive-box">
                <span className="passive-icon">🌌</span>
                <div className="passive-meta">
                  <span className="passive-name">Ruler's Authority</span>
                  <span className="passive-desc">+15% Focus Chamber EXP Multiplier</span>
                </div>
              </div>

              <div className="passive-box">
                <span className="passive-icon">🛡️</span>
                <div className="passive-meta">
                  <span className="passive-name">Shadow Domain</span>
                  <span className="passive-desc">-30% Biological Fatigue Accumulation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shadow Commanders Grid */}
          <h3 className="section-subheading">SHADOW COMMANDER ROSTER</h3>
          <div className="shadows-roster-grid">
            {monarch.shadows.map(shadow => {
              const canExtract = !shadow.extracted && player.level >= shadow.requiredLevel;
              return (
                <div
                  key={shadow.id}
                  className={`hud-card shadow-card ${shadow.extracted ? 'extracted' : 'dormant'} ${shadow.deployed ? 'deployed' : ''}`}
                  onClick={() => setSelectedShadow(shadow)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="shadow-top-row">
                    <span className="shadow-icon">{shadow.icon}</span>
                    <span className={`shadow-status-tag ${shadow.deployed ? 'active-vanguard' : shadow.extracted ? 'available' : 'locked'}`}>
                      {shadow.deployed ? 'DEPLOYED VANGUARD' : shadow.extracted ? 'EXTRACTED' : `LV.${shadow.requiredLevel} REQUIRED`}
                    </span>
                  </div>

                  <h4 className="shadow-name">{shadow.name}</h4>
                  <span className="shadow-title">{shadow.title}</span>

                  <p className="shadow-lore">{shadow.lore}</p>

                  <div className="shadow-bonuses-row">
                    <span>BUFF:</span>
                    {Object.entries(shadow.statBonus).map(([attr, val]) => (
                      <span key={attr} className="buff-tag">+{val} {attr.toUpperCase()}</span>
                    ))}
                  </div>

                  <div className="shadow-actions-row">
                    {canExtract && (
                      <button
                        className="hud-btn-primary arise-mini-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExtract(shadow);
                        }}
                      >
                        ✦ ARISE (EXTRACT)
                      </button>
                    )}

                    {shadow.extracted && (
                      <button
                        className={`hud-btn-secondary deploy-btn ${shadow.deployed ? 'deployed' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeploy(shadow);
                        }}
                      >
                        {shadow.deployed ? 'RECALL SHADOW' : 'DEPLOY TO VANGUARD'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Arise Animation Overlay */}
      {ariseAnimating && (
        <div className="arise-ceremony-overlay">
          <div className="arise-mist-glow"></div>
          <h1 className="arise-hero-text">“ A R I S E ”</h1>
          <p className="arise-subtext">The soul yields to the Sovereign.</p>
        </div>
      )}
    </div>
  );
};
