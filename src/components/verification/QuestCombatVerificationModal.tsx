import React, { useState } from 'react';
import { Quest } from '../../types';
import { soundEngine } from '../../game/sound';
import { shadowVoice } from '../../game/voiceAssistant';

interface QuestCombatVerificationModalProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
  onVerifyAndComplete: (questId: string, fullReward: boolean, proofDetails?: string) => void;
}

export const QuestCombatVerificationModal: React.FC<QuestCombatVerificationModalProps> = ({
  quest,
  isOpen,
  onClose,
  onVerifyAndComplete
}) => {
  if (!isOpen) return null;

  const isFitness = quest.category === 'fitness' || quest.title.toLowerCase().includes('push-up') || quest.title.toLowerCase().includes('workout');
  const isCoding = quest.category === 'coding' || quest.title.toLowerCase().includes('dsa') || quest.title.toLowerCase().includes('programming');

  // Workout state
  const [completedSets, setCompletedSets] = useState<number[]>([1]);
  const [activeRestTimer, setActiveRestTimer] = useState<number | null>(null);

  // DSA state
  const [problemName, setProblemName] = useState('');
  const [complexity, setComplexity] = useState('O(N) Time, O(1) Space');
  const [solutionNote, setSolutionNote] = useState('');

  const handleToggleSet = (setNum: number) => {
    soundEngine.playPing();
    if (completedSets.includes(setNum)) {
      setCompletedSets(completedSets.filter(s => s !== setNum));
    } else {
      setCompletedSets([...completedSets, setNum]);
      // Start 30s rest countdown
      setActiveRestTimer(30);
      const interval = setInterval(() => {
        setActiveRestTimer(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            soundEngine.playLevelUp();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleClaimVerified = () => {
    soundEngine.playLevelUp();
    const proof = isFitness 
      ? `Completed ${completedSets.length}/4 Workout Sets`
      : `DSA Problem: ${problemName || 'Two Sum'}, Complexity: ${complexity}`;
    
    shadowVoice.announceTaskComplete(quest.title);
    onVerifyAndComplete(quest.id, true, proof);
    onClose();
  };

  const handleClaimUnverified = () => {
    soundEngine.playPing();
    onVerifyAndComplete(quest.id, false, 'Unverified Self-Report (30% EXP)');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="hud-card quest-verification-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '92%', borderColor: '#00d2ff', boxShadow: '0 0 35px rgba(0, 210, 255, 0.35)' }}
      >
        <div className="card-corner tl" />
        <div className="card-corner tr" />
        <div className="card-corner bl" />
        <div className="card-corner br" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="hud-tag">● COMBAT TASK VERIFICATION</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#7f9ebc', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#fff', marginBottom: '4px' }}>
          {quest.title}
        </h2>
        <p style={{ color: '#7f9ebc', fontSize: '0.85rem', marginBottom: '18px' }}>
          Provide real-world proof or complete active telemetry to claim 100% full Hunter EXP (+{quest.xpReward} EXP).
        </p>

        {/* WORKOUT SETS VERIFICATION */}
        {isFitness && (
          <div style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ color: '#00f0ff', fontSize: '0.95rem' }}>🏋️ ACTIVE SETS LOG (4 SETS TOTAL)</strong>
              {activeRestTimer !== null && (
                <span style={{ color: '#ffd700', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
                  ⏳ REST: {activeRestTimer}s
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              {[1, 2, 3, 4].map(s => {
                const done = completedSets.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => handleToggleSet(s)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: '6px',
                      background: done ? 'rgba(0, 210, 255, 0.25)' : 'rgba(14, 27, 54, 0.7)',
                      border: done ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: done ? '#fff' : '#7f9ebc',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}
                  >
                    {done ? `SET ${s} ✓` : `SET ${s}`}
                  </button>
                );
              })}
            </div>
            <p style={{ color: '#7f9ebc', fontSize: '0.78rem', margin: 0 }}>
              ✦ Tap each set as you finish. Logging all 4 sets verifies your real-world workout.
            </p>
          </div>
        )}

        {/* DSA / CODING VERIFICATION */}
        {isCoding && (
          <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <strong style={{ color: '#38bdf8', fontSize: '0.95rem', display: 'block', marginBottom: '12px' }}>
              💻 ALGORITHMIC PROOF SUBMISSION
            </strong>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>
                  Problem Solved (LeetCode / Codeforces / Title):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Two Sum #1 or Valid Parentheses"
                  value={problemName}
                  onChange={e => setProblemName(e.target.value)}
                  className="hud-input"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '8px 12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>
                  Time & Space Complexity:
                </label>
                <input
                  type="text"
                  placeholder="e.g. O(N) Time, O(1) Space"
                  value={complexity}
                  onChange={e => setComplexity(e.target.value)}
                  className="hud-input"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '8px 12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>
                  Key Logic / Optimization Learned:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Used hash map complement for linear search"
                  value={solutionNote}
                  onChange={e => setSolutionNote(e.target.value)}
                  className="hud-input"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '8px 12px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* GENERAL VERIFICATION */}
        {!isFitness && !isCoding && (
          <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <strong style={{ color: '#a855f7', fontSize: '0.95rem', display: 'block', marginBottom: '8px' }}>
              📝 STUDY & FOCUS COMPLETION PROOF
            </strong>
            <p style={{ color: '#e2f1ff', fontSize: '0.85rem', marginBottom: '10px' }}>
              What key insight or milestone did you accomplish during this session?
            </p>
            <textarea
              placeholder="e.g. Finished chapter 3 of operating systems, revised virtual memory..."
              value={solutionNote}
              onChange={e => setSolutionNote(e.target.value)}
              className="hud-textarea"
              rows={3}
              style={{ width: '100%', fontSize: '0.88rem' }}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="hud-btn-primary"
            onClick={handleClaimVerified}
            style={{ padding: '14px', fontSize: '1rem', letterSpacing: '1px' }}
          >
            🛡️ SUBMIT PROOF & CLAIM FULL REWARDS (+{quest.xpReward} EXP)
          </button>

          <button
            className="hud-btn-secondary"
            onClick={handleClaimUnverified}
            style={{ padding: '10px', fontSize: '0.82rem', color: '#ffaa00', borderColor: 'rgba(255, 170, 0, 0.3)' }}
          >
            ⚠️ Quick Self-Claim (Unverified: Awards 30% EXP only)
          </button>
        </div>
      </div>
    </div>
  );
};
