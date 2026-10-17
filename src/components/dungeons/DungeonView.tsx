import React, { useState, useEffect, useRef } from 'react';
import { DungeonSession, AttributeKey, PlayerProfile } from '../../types';
import { soundEngine } from '../../game/sound';

interface DungeonViewProps {
  dungeonTemplates: DungeonSession[];
  activeDungeon: DungeonSession | null;
  player?: PlayerProfile;
  onStartDungeon: (session: DungeonSession) => void;
  onUpdateActiveDungeon: (session: DungeonSession) => void;
  onCompleteDungeon: (session: DungeonSession) => void;
  onExitDungeon: () => void;
  onClaimDungeonQuotaBonus?: () => void;
}

export const DungeonView: React.FC<DungeonViewProps> = ({
  dungeonTemplates,
  activeDungeon,
  player,
  onStartDungeon,
  onUpdateActiveDungeon,
  onCompleteDungeon,
  onExitDungeon,
  onClaimDungeonQuotaBonus
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(dungeonTemplates[0]?.id || '');
  const [customMinutes, setCustomMinutes] = useState<number>(25);
  const [customName, setCustomName] = useState<string>('Custom Deep Work Chamber');
  const [customObjectives, setCustomObjectives] = useState<string>('Complete task block 1\nVerify solution\nReview notes');
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [isCheatWarningOpen, setIsCheatWarningOpen] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Active Dungeon Timer Hook using timestamp deltas (survives tab suspension)
  useEffect(() => {
    if (!activeDungeon || !activeDungeon.isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const last = activeDungeon.lastUpdatedAt || now;
      const deltaSec = Math.max(1, Math.floor((now - last) / 1000));

      const newRemaining = Math.max(0, activeDungeon.remainingSeconds - deltaSec);
      const newElapsed = activeDungeon.elapsedSeconds + deltaSec;

      if (newRemaining <= 0) {
        // Dungeon Cleared!
        if (timerRef.current) clearInterval(timerRef.current);
        soundEngine.playDungeonClear();
        setIsVictoryModalOpen(true);
        onUpdateActiveDungeon({
          ...activeDungeon,
          isRunning: false,
          remainingSeconds: 0,
          elapsedSeconds: newElapsed,
          cleared: true,
          lastUpdatedAt: now
        });
      } else {
        onUpdateActiveDungeon({
          ...activeDungeon,
          remainingSeconds: newRemaining,
          elapsedSeconds: newElapsed,
          lastUpdatedAt: now
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeDungeon, onUpdateActiveDungeon]);

  const handleLaunchTemplate = (tmpl: DungeonSession) => {
    soundEngine.playDungeonEnter();
    const newSession: DungeonSession = {
      ...tmpl,
      id: `session-${Date.now()}`,
      elapsedSeconds: 0,
      remainingSeconds: tmpl.durationMinutes * 60,
      isRunning: true,
      startedAt: Date.now(),
      lastUpdatedAt: Date.now(),
      cleared: false,
      objectives: tmpl.objectives.map(o => ({ ...o, completed: false }))
    };
    onStartDungeon(newSession);
  };

  const handleLaunchCustom = () => {
    soundEngine.playDungeonEnter();
    const objectivesList = customObjectives
      .split('\n')
      .map(o => o.trim())
      .filter(o => o.length > 0)
      .map((text, idx) => ({ id: `co-${idx}`, text, completed: false }));

    const newSession: DungeonSession = {
      id: `session-${Date.now()}`,
      name: customName.trim() || 'Custom Focus Chamber',
      subtitle: 'Zero-distraction deep immersion sprint',
      category: 'focus' as any,
      difficulty: 'normal',
      durationMinutes: customMinutes,
      elapsedSeconds: 0,
      remainingSeconds: customMinutes * 60,
      isRunning: true,
      startedAt: Date.now(),
      lastUpdatedAt: Date.now(),
      objectives: objectivesList,
      xpReward: Math.round(customMinutes * 1.5),
      attributeBonus: 'focus',
      cleared: false
    };
    onStartDungeon(newSession);
  };

  const togglePause = () => {
    if (!activeDungeon) return;
    soundEngine.playPing();
    const nextRunning = !activeDungeon.isRunning;
    onUpdateActiveDungeon({
      ...activeDungeon,
      isRunning: nextRunning,
      lastUpdatedAt: Date.now()
    });
  };

  const toggleObjective = (objId: string) => {
    if (!activeDungeon) return;
    soundEngine.playPing();
    const updated = activeDungeon.objectives.map(o =>
      o.id === objId ? { ...o, completed: !o.completed } : o
    );
    onUpdateActiveDungeon({
      ...activeDungeon,
      objectives: updated
    });
  };

  const handleClaimVictory = () => {
    if (!activeDungeon) return;
    setIsVictoryModalOpen(false);
    onCompleteDungeon(activeDungeon);
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If in an active dungeon session, render the dedicated Focus Chamber screen!
  if (activeDungeon) {
    const totalSec = activeDungeon.durationMinutes * 60;
    const progressPct = totalSec > 0 ? Math.min(100, Math.round((activeDungeon.elapsedSeconds / totalSec) * 100)) : 0;
    const allObjectivesDone = activeDungeon.objectives.length > 0 && activeDungeon.objectives.every(o => o.completed);

    return (
      <div className="active-dungeon-screen">
        <div className="dungeon-radar-ring"></div>

        <div className="dungeon-chamber-card hud-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          {/* Chamber Header */}
          <div className="chamber-header">
            <span className="hud-tag dungeon-pulse-tag">● INSTANT DUNGEON ACTIVE</span>
            <button className="exit-chamber-btn" onClick={onExitDungeon} title="Abandon chamber">
              EXIT DUNGEON ✕
            </button>
          </div>

          <div className="chamber-title-block">
            <h2 className="chamber-name">{activeDungeon.name}</h2>
            <p className="chamber-subtitle">{activeDungeon.subtitle}</p>
          </div>

          {/* Countdown Clock */}
          <div className="dungeon-timer-ring-container">
            <div className="timer-digital-display">
              <span className="digits">{formatTimer(activeDungeon.remainingSeconds)}</span>
              <span className="timer-status-hint">
                {activeDungeon.isRunning ? 'FOCUS CHAMBER SEALED' : 'SESSION PAUSED'}
              </span>
            </div>
            <div className="dungeon-progress-bar-wrapper">
              <div className="dungeon-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Chamber Controls */}
          {(() => {
            const minRequiredSeconds = Math.max(60, Math.floor((activeDungeon.durationMinutes * 60) * 0.7));
            const isTimeSatisfied = activeDungeon.elapsedSeconds >= minRequiredSeconds;

            return (
              <div className="chamber-controls-row">
                <button
                  className={`hud-btn-primary ${activeDungeon.isRunning ? 'pause-btn' : 'resume-btn'}`}
                  onClick={togglePause}
                >
                  {activeDungeon.isRunning ? '⏸ PAUSE FOCUS' : '▶ RESUME FOCUS'}
                </button>

                <button
                  className={isTimeSatisfied ? 'hud-btn-gold finish-early-btn' : 'hud-btn-secondary locked-dungeon-btn'}
                  onClick={() => {
                    if (!isTimeSatisfied) {
                      soundEngine.playPing();
                      setIsCheatWarningOpen(true);
                      return;
                    }
                    soundEngine.playDungeonClear();
                    setIsVictoryModalOpen(true);
                  }}
                  style={{
                    opacity: isTimeSatisfied ? 1 : 0.85,
                    border: isTimeSatisfied ? '1px solid #ffd700' : '1px dashed #ff3366',
                    color: isTimeSatisfied ? '#ffd700' : '#ff88a3'
                  }}
                >
                  {isTimeSatisfied
                    ? '✦ CLAIM DUNGEON VICTORY'
                    : `🔒 FOCUS LOCKED (${formatTimer(minRequiredSeconds - activeDungeon.elapsedSeconds)} LEFT)`}
                </button>
              </div>
            );
          })()}

          {/* Real-time Objectives Checklist */}
          <div className="chamber-objectives-box">
            <div className="objectives-header">
              <span className="objectives-title">CHAMBER OBJECTIVES ({activeDungeon.objectives.filter(o => o.completed).length}/{activeDungeon.objectives.length})</span>
            </div>
            <div className="chamber-objectives-list">
              {activeDungeon.objectives.map(obj => (
                <div
                  key={obj.id}
                  className={`chamber-obj-item ${obj.completed ? 'cleared' : ''}`}
                  onClick={() => toggleObjective(obj.id)}
                >
                  <span className="check-box">{obj.completed ? '✓' : '○'}</span>
                  <span className="obj-text">{obj.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chamber-reward-preview">
            <span>REWARDS ON SURVIVAL: <strong>+{activeDungeon.xpReward} EXP</strong> & <strong>+2 FOCUS ATTRIBUTE</strong></span>
          </div>
        </div>

        {/* ANTI-CHEAT & DURATION VERIFICATION MODAL */}
        {isCheatWarningOpen && (
          <div className="modal-backdrop">
            <div className="hud-card dungeon-cheat-modal" style={{ maxWidth: '520px', width: '92%', borderColor: '#ff3366', boxShadow: '0 0 35px rgba(255, 51, 102, 0.45)' }}>
              <div className="card-corner tl" style={{ borderColor: '#ff3366' }} />
              <div className="card-corner tr" style={{ borderColor: '#ff3366' }} />
              <div className="card-corner bl" style={{ borderColor: '#ff3366' }} />
              <div className="card-corner br" style={{ borderColor: '#ff3366' }} />

              <div style={{ color: '#ff3366', fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>
                ⚠️ [SYSTEM TELEMETRY REJECTION: INSUFFICIENT FOCUS]
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', marginBottom: '12px' }}>
                UNEARNED VICTORY DENIED
              </h2>
              <div style={{ background: 'rgba(255, 51, 102, 0.1)', border: '1px solid rgba(255, 51, 102, 0.3)', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                <p style={{ color: '#ff88a3', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                  You have only focused for <strong>{Math.floor(activeDungeon.elapsedSeconds / 60)}m {activeDungeon.elapsedSeconds % 60}s</strong> of this <strong>{activeDungeon.durationMinutes}-minute</strong> trial.
                </p>
                <p style={{ color: '#e2f1ff', fontSize: '0.84rem', marginTop: '8px', lineHeight: '1.5' }}>
                  The System only grants real EXP when you genuinely endure the trial. To claim rewards, you must maintain active focus for at least <strong>{Math.floor(Math.max(60, Math.floor((activeDungeon.durationMinutes * 60) * 0.7)) / 60)} minutes</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button
                  className="hud-btn-primary"
                  onClick={() => setIsCheatWarningOpen(false)}
                  style={{ width: '100%', padding: '12px' }}
                >
                  ▶ RESUME FOCUS SESSION
                </button>
                <button
                  className="hud-btn-danger"
                  onClick={() => {
                    setIsCheatWarningOpen(false);
                    onExitDungeon();
                  }}
                  style={{ width: '100%', padding: '10px' }}
                >
                  ABANDON TRIAL (0 EXP AWARDED)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VICTORY CEREMONY MODAL */}
        {isVictoryModalOpen && (
          <div className="modal-backdrop">
            <div className="hud-card dungeon-victory-modal">
              <div className="card-corner tl" />
              <div className="card-corner tr" />
              <div className="card-corner bl" />
              <div className="card-corner br" />

              <div className="victory-badge">[ DUNGEON CLEARED ]</div>
              <h1 className="victory-title">CHAMBER CONQUERED!</h1>
              <p className="victory-desc">
                You maintained intense focus for <strong>{Math.floor(activeDungeon.elapsedSeconds / 60)} minutes</strong> without succumbing to distraction.
              </p>

              <div className="victory-rewards-list">
                <div className="reward-item">
                  <span className="reward-icon">✦</span>
                  <span>+{activeDungeon.xpReward} Hunter Experience (EXP)</span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">✦</span>
                  <span>+2 Permanent Focus (FOC) Attribute Points</span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">✦</span>
                  <span>-20% Fatigue Relief Bonus</span>
                </div>
              </div>

              <button className="hud-btn-primary claim-reward-btn" onClick={handleClaimVictory}>
                CLAIM REWARDS & EXIT CHAMBER
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dungeon Selection & Launch Portal Screen
  return (
    <div className="dungeon-hub-container">
      <div className="dungeon-hub-header">
        <div>
          <span className="hud-tag">[FOCUS GATE PROTOCOL]</span>
          <h2 className="section-title">INSTANT DUNGEONS (FOCUS CHAMBER)</h2>
        </div>
        <p className="dungeon-hub-desc">
          Seal your focus into high-stakes timed chambers. Completing sessions earns bonus Hunter EXP, trains your Focus & Discipline attributes, and accelerates campaign velocity.
        </p>
      </div>

      {/* 2x-3x Daily Gate Mandate Card */}
      <div
        className="hud-card daily-gate-mandate-card"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 27, 54, 0.95), rgba(9, 18, 36, 0.95))',
          border: '1px solid #ffd700',
          boxShadow: '0 0 25px rgba(255, 215, 0, 0.25)',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}
      >
        <div className="card-corner tl" style={{ borderColor: '#ffd700' }} />
        <div className="card-corner tr" style={{ borderColor: '#ffd700' }} />
        <div className="card-corner bl" style={{ borderColor: '#ffd700' }} />
        <div className="card-corner br" style={{ borderColor: '#ffd700' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🗝️</span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#ffd700' }}>
              DAILY DUNGEON GATE MANDATE (2 GATES REQUIRED / DAY)
            </h3>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#ffd700', fontWeight: 800 }}>
            {player?.dungeonsClearedToday || 0} / 2 CLEARED
          </span>
        </div>

        <p style={{ color: '#e2f1ff', fontSize: '0.84rem', lineHeight: '1.5', margin: '0 0 12px 0' }}>
          To build unbreakable real-world focus, the System mandates entering an Instant Dungeon focus chamber at least <strong>twice a day</strong> (1 Morning Focus Sprint + 1 Evening Study Grind).
        </p>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
          <div
            style={{
              width: `${Math.min(100, ((player?.dungeonsClearedToday || 0) / 2) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00d2ff, #ffd700)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        {(player?.dungeonsClearedToday || 0) >= 2 && !player?.dungeonQuotaBonusClaimed ? (
          <button
            className="hud-btn-primary"
            onClick={onClaimDungeonQuotaBonus}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderColor: '#ffd700',
              fontWeight: 800
            }}
          >
            🎁 CLAIM GATE SOVEREIGN DAILY BONUS (+60 EXP & MYSTERY CRATE)
          </button>
        ) : (player?.dungeonsClearedToday || 0) >= 2 ? (
          <div style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 700 }}>
            ✓ Daily 2x Gate Mandate Fulfilled! Sovereign Bonus Claimed.
          </div>
        ) : (
          <div style={{ color: '#7f9ebc', fontSize: '0.8rem' }}>
            Complete {2 - (player?.dungeonsClearedToday || 0)} more dungeon session today to unlock the Gate Sovereign Bonus!
          </div>
        )}
      </div>

      {/* Preset Dungeon Templates */}
      <h3 className="section-subheading">AVAILABLE DUNGEON GATES</h3>
      <div className="dungeon-templates-grid">
        {dungeonTemplates.map(tmpl => (
          <div key={tmpl.id} className="hud-card dungeon-gate-card">
            <div className="card-corner tl" />
            <div className="card-corner tr" />
            <div className="card-corner bl" />
            <div className="card-corner br" />

            <div className="gate-card-header">
              <span className="gate-diff-badge diff-{tmpl.difficulty}">{tmpl.difficulty.toUpperCase()} GATE</span>
              <span className="gate-time">{tmpl.durationMinutes} MINS</span>
            </div>

            <h4 className="gate-name">{tmpl.name}</h4>
            <p className="gate-desc">{tmpl.subtitle}</p>

            <div className="gate-objectives-preview">
              <span className="preview-label">OBJECTIVES:</span>
              <ul>
                {tmpl.objectives.slice(0, 3).map(o => (
                  <li key={o.id}>{o.text}</li>
                ))}
              </ul>
            </div>

            <div className="gate-card-footer">
              <span className="gate-reward-text">+{tmpl.xpReward} EXP • +{tmpl.attributeBonus.toUpperCase()}</span>
              <button
                className="hud-btn-primary enter-gate-btn"
                onClick={() => handleLaunchTemplate(tmpl)}
              >
                ENTER GATE →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Dungeon Forge */}
      <div className="hud-card custom-dungeon-card">
        <div className="card-corner tl" />
        <div className="card-corner tr" />
        <div className="card-corner bl" />
        <div className="card-corner br" />

        <div className="custom-gate-header">
          <span className="hud-tag">[CUSTOM GATE FORGE]</span>
          <h3>CREATE CUSTOM FOCUS CHAMBER</h3>
        </div>

        <div className="custom-dungeon-grid">
          <div className="form-group">
            <label>Chamber Name</label>
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="hud-input"
            />
          </div>

          <div className="form-group">
            <label>Duration: {customMinutes} Minutes</label>
            <input
              type="range"
              min={15}
              max={120}
              step={5}
              value={customMinutes}
              onChange={e => setCustomMinutes(Number(e.target.value))}
              className="hud-slider"
            />
          </div>

          <div className="form-group full-width">
            <label>Session Objectives (One per line)</label>
            <textarea
              rows={3}
              value={customObjectives}
              onChange={e => setCustomObjectives(e.target.value)}
              className="hud-textarea"
            />
          </div>
        </div>

        <button className="hud-btn-primary launch-custom-btn" onClick={handleLaunchCustom}>
          ✦ INITIALIZE CUSTOM DUNGEON SPRINT ✦
        </button>
      </div>
    </div>
  );
};
