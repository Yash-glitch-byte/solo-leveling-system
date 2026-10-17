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
    <div className="pseudo-monarch-container" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', paddingBottom: '90px' }}>
      {/* Top Header */}
      <div className="monarch-header" style={{ marginBottom: '16px' }}>
        <div>
          <span className="hud-tag monarch-pill" style={{ borderColor: '#a855f7', color: '#c084fc' }}>
            [JOB CHANGE & SHADOW SOVEREIGN PROTOCOL]
          </span>
          <h2 className="section-title" style={{ margin: '4px 0', fontSize: '1.6rem', color: '#fff' }}>
            THE SHADOW MONARCH SYSTEM
          </h2>
        </div>
        <div className="monarch-status-badge">
          <span className="status-label" style={{ fontSize: '0.75rem', color: '#7f9ebc' }}>AUTHORITY STATUS:</span>
          <span className={`status-val ${monarch.unlocked ? 'unlocked' : 'dormant'}`} style={{ color: monarch.unlocked ? '#a855f7' : '#ffd700', fontWeight: 700 }}>
            {monarch.unlocked ? 'AWAKENED (SHADOW DOMAIN ACTIVE)' : 'DORMANT (REQUIRES LEVEL 5)'}
          </span>
        </div>
      </div>

      {/* Solo Leveling Lore & Real-Life Explainer Banner */}
      <div
        className="hud-card"
        style={{
          background: 'linear-gradient(135deg, rgba(27, 14, 44, 0.95), rgba(12, 6, 26, 0.95))',
          border: '1px solid #a855f7',
          boxShadow: '0 0 25px rgba(168, 85, 247, 0.25)',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}
      >
        <div className="card-corner tl" style={{ borderColor: '#a855f7' }} />
        <div className="card-corner tr" style={{ borderColor: '#a855f7' }} />
        <div className="card-corner bl" style={{ borderColor: '#a855f7' }} />
        <div className="card-corner br" style={{ borderColor: '#a855f7' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>👑</span>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#c084fc' }}>
            WHAT IS THE SHADOW MONARCH SYSTEM?
          </h3>
        </div>

        <p style={{ margin: '0 0 12px 0', color: '#e2f1ff', fontSize: '0.88rem', lineHeight: '1.5' }}>
          In <em>Solo Leveling</em>, hunter Sung Jin-woo begins as the weakest E-Rank. Upon reaching <strong>Level 5</strong>, the System tests him in a legendary Job Change dungeon, where he unlocks the power of the <strong>Shadow Monarch</strong> and the ability to utter the command <strong>“ARISE”</strong> to build a loyal Shadow Army.
        </p>

        <p style={{ margin: '0 0 12px 0', color: '#c084fc', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: 600 }}>
          ⚡ <strong>In Real Life:</strong> Reaching Level 5 represents establishing an unbreakable foundation of daily habits. Unlocking the Shadow Monarch gives you permanent passive multipliers (extra XP on all tasks, faster fatigue recovery, and shadow companion voice guidance).
        </p>

        {/* Progress Ladder to Level 5 */}
        <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 700 }}>
              YOUR ASCENSION PROGRESS: LEVEL {player.level} / LEVEL 5
            </span>
            <span style={{ fontSize: '0.8rem', color: '#ffd700', fontFamily: 'var(--font-display)' }}>
              {player.level >= 5 ? '✦ ELIGIBLE TO ARISE' : `${5 - player.level} LEVELS REMAINING`}
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
            <div
              style={{
                width: `${Math.min(100, (player.level / 5) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00d2ff, #a855f7)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
            {[1, 2, 3, 4, 5].map(lvl => (
              <div
                key={lvl}
                style={{
                  padding: '6px 2px',
                  borderRadius: '4px',
                  background: player.level >= lvl ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: player.level >= lvl ? '1px solid #a855f7' : '1px dashed rgba(255, 255, 255, 0.1)',
                  color: player.level >= lvl ? '#fff' : '#4a627a',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {lvl === 5 ? '👑 LVL 5 (ARISE)' : `LVL ${lvl}`}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Awakening Callout if not yet unlocked */}
      {!monarch.unlocked ? (
        <div className="hud-card monarch-lock-card" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
          <div className="card-corner tl" style={{ borderColor: '#a855f7' }} />
          <div className="card-corner tr" style={{ borderColor: '#a855f7' }} />
          <div className="card-corner bl" style={{ borderColor: '#a855f7' }} />
          <div className="card-corner br" style={{ borderColor: '#a855f7' }} />

          <div className="lock-icon-glow" style={{ fontSize: '3rem', marginBottom: '10px' }}>👑</div>
          <h3 className="lock-heading" style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>
            THE THRONE OF SHADOWS AWAITS
          </h3>
          <p className="lock-desc" style={{ maxWidth: '600px', margin: '0 auto 16px auto', color: '#7f9ebc', fontSize: '0.88rem', lineHeight: '1.5' }}>
            Complete your daily Quests and Instant Dungeons to earn EXP. Once you cross Level 5, you can click the button below to claim Sovereign Authority!
          </p>

          <button
            className="hud-btn-primary awaken-monarch-btn"
            disabled={!isEligibleToAwaken}
            onClick={() => {
              soundEngine.playLevelUp();
              onAwakenMonarch();
            }}
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              letterSpacing: '1px',
              background: isEligibleToAwaken
                ? 'linear-gradient(135deg, #7928ca, #ff0080)'
                : 'rgba(255, 255, 255, 0.05)',
              borderColor: isEligibleToAwaken ? '#ff0080' : 'rgba(255, 255, 255, 0.1)',
              cursor: isEligibleToAwaken ? 'pointer' : 'not-allowed'
            }}
          >
            {isEligibleToAwaken ? '✦ CLAIM SHADOW AUTHORITY: ARISE ✦' : `🔒 LOCKED: REACH LEVEL 5 (CURRENT: LEVEL ${player.level})`}
          </button>
        </div>
      ) : (
        <div className="monarch-awakened-banner" style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
          <strong style={{ color: '#c084fc', display: 'block', fontSize: '1rem', marginBottom: '4px' }}>
            ✦ SHADOW SOVEREIGN STATUS: ACTIVE
          </strong>
          <span style={{ color: '#e2f1ff', fontSize: '0.84rem' }}>
            Ruler's Authority is active (+15% XP on all completed quests). You can extract and command your Shadow Army below.
          </span>
        </div>
      )}

      {/* Shadow Army Roster & Preview */}
      <div className="hud-card" style={{ padding: '20px' }}>
        <div className="card-corner tl" style={{ borderColor: '#a855f7' }} />
        <div className="card-corner tr" style={{ borderColor: '#a855f7' }} />
        <div className="card-corner bl" style={{ borderColor: '#a855f7' }} />
        <div className="card-corner br" style={{ borderColor: '#a855f7' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#fff' }}>
            SHADOW SOLDIER LEGION ({monarch.shadows.length} COMMANDERS)
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#c084fc' }}>
            {monarch.unlocked ? 'COMMANDERS AVAILABLE' : 'COMMANDER PREVIEW'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {monarch.shadows.map(shadow => (
            <div
              key={shadow.id}
              style={{
                background: shadow.extracted ? 'rgba(168, 85, 247, 0.1)' : 'rgba(10, 20, 38, 0.6)',
                border: shadow.extracted ? '1px solid #a855f7' : '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{shadow.icon}</span>
                  <div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>{shadow.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 700 }}>
                      {shadow.title}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: shadow.extracted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: shadow.extracted ? '#34d399' : '#7f9ebc',
                    fontWeight: 700
                  }}
                >
                  {shadow.extracted ? (shadow.deployed ? 'ACTIVE IN FIELD' : 'STANDBY') : 'UNEXTRACTED'}
                </span>
              </div>

              <p style={{ margin: 0, color: '#7f9ebc', fontSize: '0.8rem', lineHeight: '1.4' }}>
                {shadow.lore}
              </p>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.72rem', color: '#c084fc', display: 'block', fontWeight: 700 }}>
                  ✦ REAL-LIFE PASSIVE BUFF:
                </span>
                <span style={{ fontSize: '0.78rem', color: '#fff' }}>
                  {Object.entries(shadow.statBonus).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ') || 'Ruler Resonance'} — {shadow.quote}
                </span>
              </div>

              {monarch.unlocked && (
                <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                  {!shadow.extracted ? (
                    <button
                      className="hud-btn-primary"
                      onClick={() => handleExtract(shadow)}
                      disabled={ariseAnimating}
                      style={{ width: '100%', padding: '8px', fontSize: '0.82rem', borderColor: '#a855f7' }}
                    >
                      ✦ EXTRACT SHADOW: ARISE
                    </button>
                  ) : (
                    <button
                      className="hud-btn-secondary"
                      onClick={() => handleDeploy(shadow)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '0.82rem',
                        borderColor: shadow.deployed ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                        color: shadow.deployed ? '#34d399' : '#fff'
                      }}
                    >
                      {shadow.deployed ? '✓ DEPLOYED (ACTIVE PASSIVE)' : 'DEPLOY TO BATTLE'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
