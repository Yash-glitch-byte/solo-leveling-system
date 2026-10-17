import React, { useState, useRef } from 'react';
import { Quest } from '../../types';
import { soundEngine } from '../../game/sound';

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

  // Photo upload state
  const [photoEvidence, setPhotoEvidence] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workout state (starts empty - must complete all 4 sets)
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [activeRestTimer, setActiveRestTimer] = useState<number | null>(null);

  // Human self-report log state
  const [humanReportText, setHumanReportText] = useState('');
  const [showSelfReportBox, setShowSelfReportBox] = useState(false);

  // DSA state
  const [problemName, setProblemName] = useState('');
  const [complexity, setComplexity] = useState('O(N) Time, O(1) Space');
  const [solutionNote, setSolutionNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      soundEngine.playLevelUp();
      setPhotoEvidence(event.target?.result as string);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    soundEngine.playPing();
    setPhotoEvidence(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleToggleSet = (setNum: number) => {
    soundEngine.playPing();
    if (completedSets.includes(setNum)) {
      setCompletedSets(completedSets.filter(s => s !== setNum));
    } else {
      const nextSets = [...completedSets, setNum];
      setCompletedSets(nextSets);
      setValidationError(null);

      // Start 30s rest countdown between sets
      if (nextSets.length < 4) {
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
    }
  };

  // Proof Verification: Either a real Photo Evidence is uploaded, OR manual metrics pass!
  const hasPhoto = photoEvidence !== null;
  const isFitnessReady = hasPhoto || !isFitness || completedSets.length >= 4;
  const isCodingReady = hasPhoto || !isCoding || (problemName.trim().length >= 3 && complexity.trim().length >= 3 && solutionNote.trim().length >= 5);
  const isStudyReady = hasPhoto || (isFitness || isCoding) || solutionNote.trim().length >= 10;
  const canClaimVerified = hasPhoto || (isFitnessReady && isCodingReady && isStudyReady);

  const handleClaimVerified = () => {
    if (!canClaimVerified) {
      if (isFitness) {
        setValidationError(`Fitness Proof Incomplete: Attach a workout photo or complete all 4 sets (${completedSets.length}/4 completed).`);
      } else if (isCoding) {
        setValidationError('Coding Proof Incomplete: Attach a photo/screenshot of your code or provide problem name and complexity.');
      } else {
        setValidationError('Study Proof Incomplete: Attach a photo of your notes or write a 10+ character milestone summary.');
      }
      soundEngine.playPing();
      return;
    }

    soundEngine.playLevelUp();
    const proof = hasPhoto
      ? `[Verified Photo Evidence Attached] ${isFitness ? 'Workout Execution Photo' : isCoding ? `Code: ${problemName || 'Algorithmic Problem'}` : 'Study Milestone'}`
      : isFitness 
      ? `Completed 4/4 Sets (40 Reps Verified)`
      : isCoding
      ? `Problem: ${problemName.trim()} | Complexity: ${complexity.trim()} | Note: ${solutionNote.trim()}`
      : `Study Milestone: ${solutionNote.trim()}`;
    
    onVerifyAndComplete(quest.id, true, proof);
    onClose();
  };

  const handleClaimUnverified = () => {
    if (!showSelfReportBox) {
      setShowSelfReportBox(true);
      return;
    }
    if (humanReportText.trim().length < 15) {
      setValidationError('Human Verification Required: You must log at least 15 characters describing what you actually completed in the real world.');
      soundEngine.playPing();
      return;
    }
    soundEngine.playLevelUp();
    onVerifyAndComplete(quest.id, false, `[Human Self-Report] ${humanReportText.trim()}`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(3, 8, 18, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div
        className="hud-card quest-verification-modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderColor: canClaimVerified ? '#00f0ff' : '#ff3366',
          boxShadow: canClaimVerified ? '0 0 35px rgba(0, 210, 255, 0.35)' : '0 0 30px rgba(255, 51, 102, 0.25)',
          borderRadius: '12px',
          padding: '20px'
        }}
      >
        <div className="card-corner tl" style={{ borderColor: canClaimVerified ? '#00f0ff' : '#ff3366' }} />
        <div className="card-corner tr" style={{ borderColor: canClaimVerified ? '#00f0ff' : '#ff3366' }} />
        <div className="card-corner bl" style={{ borderColor: canClaimVerified ? '#00f0ff' : '#ff3366' }} />
        <div className="card-corner br" style={{ borderColor: canClaimVerified ? '#00f0ff' : '#ff3366' }} />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="hud-tag" style={{ borderColor: canClaimVerified ? '#00f0ff' : '#ff3366', color: canClaimVerified ? '#00f0ff' : '#ff3366' }}>
            ● COMBAT TASK VERIFICATION PROTOCOL
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7f9ebc',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', margin: '0 0 4px 0' }}>
          {quest.title}
        </h2>
        <p style={{ color: '#7f9ebc', fontSize: '0.84rem', margin: '0 0 16px 0', lineHeight: '1.4' }}>
          Real-life proof required to award 100% full Hunter EXP (+{quest.xpReward} EXP). Upload a photo or log your telemetry.
        </p>

        {/* Validation Alert Box if user fails validation */}
        {validationError && (
          <div style={{ background: 'rgba(255, 51, 102, 0.15)', border: '1px solid #ff3366', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px', color: '#ff6b81', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* SECTION 1: PHOTO EVIDENCE UPLOAD / CAMERA (PRIORITY PROOF) */}
        <div style={{ background: hasPhoto ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 210, 255, 0.05)', border: hasPhoto ? '1px solid #10b981' : '1px dashed rgba(0, 210, 255, 0.3)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ color: hasPhoto ? '#34d399' : '#00f0ff', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📸 REAL-WORLD PHOTO EVIDENCE (CAMERA / GALLERY)
            </strong>
            {hasPhoto && (
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                ✓ PHOTO SCANNED & VERIFIED
              </span>
            )}
          </div>

          <p style={{ color: '#7f9ebc', fontSize: '0.78rem', margin: '0 0 10px 0' }}>
            Attach a photo of your workout (sweat, gym, mat), code editor screen, or study textbook. A real photo serves as immediate 100% verification!
          </p>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />

          {!hasPhoto ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                background: 'rgba(0, 210, 255, 0.1)',
                border: '1px solid #00d2ff',
                color: '#00f0ff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>📷</span>
              <span>SNAP CAMERA / CHOOSE PHOTO PROOF</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(0, 0, 0, 0.4)', padding: '10px', borderRadius: '6px' }}>
              <img
                src={photoEvidence}
                alt="Verification Proof"
                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #10b981' }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ color: '#fff', fontSize: '0.84rem', display: 'block', fontWeight: 700 }}>
                  Real-World Proof Attached
                </span>
                <span style={{ color: '#34d399', fontSize: '0.74rem' }}>
                  Holographic image hash validated by the System
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemovePhoto}
                style={{
                  background: 'rgba(255, 51, 102, 0.15)',
                  border: '1px solid #ff3366',
                  color: '#ff3366',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                ✕ REMOVE
              </button>
            </div>
          )}
        </div>

        {/* WORKOUT SETS VERIFICATION (IF NO PHOTO) */}
        {isFitness && (
          <div style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.25)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong style={{ color: '#00f0ff', fontSize: '0.92rem' }}>
                🏋️ ACTIVE WORKOUT SETS ({completedSets.length}/4 COMPLETED)
              </strong>
              {activeRestTimer !== null && (
                <span style={{ color: '#ffd700', fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700 }}>
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
                    type="button"
                    onClick={() => handleToggleSet(s)}
                    style={{
                      padding: '14px 6px',
                      borderRadius: '6px',
                      background: done ? 'rgba(0, 240, 255, 0.25)' : 'rgba(14, 27, 54, 0.8)',
                      border: done ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: done ? '#00f0ff' : '#7f9ebc',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {done ? `SET ${s} ✓` : `SET ${s}`}
                  </button>
                );
              })}
            </div>
            <p style={{ color: completedSets.length === 4 ? '#34d399' : '#7f9ebc', fontSize: '0.78rem', margin: 0, fontWeight: completedSets.length === 4 ? 700 : 400 }}>
              {completedSets.length === 4
                ? '✦ All 4 workout sets logged! Physical proof verified.'
                : '✦ Tap each set as you execute it. You must complete all 4 sets or upload a photo to claim full EXP.'}
            </p>
          </div>
        )}

        {/* DSA / CODING VERIFICATION (IF NO PHOTO) */}
        {isCoding && (
          <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <strong style={{ color: '#38bdf8', fontSize: '0.92rem', display: 'block', marginBottom: '12px' }}>
              💻 ALGORITHMIC PROOF SUBMISSION (OR ATTACH PHOTO ABOVE)
            </strong>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>
                  Problem Solved (LeetCode / Codeforces / Title): <span style={{ color: '#ff3366' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. LeetCode #1 Two Sum or Valid Palindrome"
                  value={problemName}
                  onChange={e => {
                    setProblemName(e.target.value);
                    setValidationError(null);
                  }}
                  className="hud-input"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '10px 12px', background: 'rgba(6, 12, 26, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#fff', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>
                  Time & Space Complexity: <span style={{ color: '#ff3366' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. O(N) Time, O(1) Space"
                  value={complexity}
                  onChange={e => {
                    setComplexity(e.target.value);
                    setValidationError(null);
                  }}
                  className="hud-input"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '10px 12px', background: 'rgba(6, 12, 26, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#fff', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>
                  Key Algorithmic Logic / Data Structure Used: <span style={{ color: '#ff3366' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hash Map complement lookup / Two Pointers"
                  value={solutionNote}
                  onChange={e => {
                    setSolutionNote(e.target.value);
                    setValidationError(null);
                  }}
                  className="hud-input"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '10px 12px', background: 'rgba(6, 12, 26, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#fff', borderRadius: '6px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* GENERAL STUDY VERIFICATION (IF NO PHOTO) */}
        {!isFitness && !isCoding && (
          <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <strong style={{ color: '#a855f7', fontSize: '0.92rem', display: 'block', marginBottom: '8px' }}>
              📝 STUDY & FOCUS PROOF (OR ATTACH PHOTO ABOVE)
            </strong>
            <p style={{ color: '#e2f1ff', fontSize: '0.82rem', marginBottom: '8px' }}>
              What key insight, chapter, or milestone did you accomplish during this session?
            </p>
            <textarea
              placeholder="e.g. Completed Chapter 4 on Operating System Page Replacement algorithms..."
              value={solutionNote}
              onChange={e => {
                setSolutionNote(e.target.value);
                setValidationError(null);
              }}
              rows={3}
              style={{ width: '100%', fontSize: '0.86rem', padding: '10px', background: 'rgba(6, 12, 26, 0.9)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#fff', borderRadius: '6px' }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="hud-btn-primary"
            onClick={handleClaimVerified}
            disabled={!canClaimVerified}
            style={{
              padding: '14px',
              fontSize: '0.95rem',
              letterSpacing: '1px',
              background: canClaimVerified
                ? 'linear-gradient(135deg, #00b4d8, #0077b6)'
                : 'rgba(255, 255, 255, 0.05)',
              borderColor: canClaimVerified ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)',
              color: canClaimVerified ? '#fff' : '#4a627a',
              cursor: canClaimVerified ? 'pointer' : 'not-allowed',
              boxShadow: canClaimVerified ? '0 0 20px rgba(0, 210, 255, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {canClaimVerified
              ? `🛡️ SUBMIT PROOF & CLAIM FULL REWARDS (+${quest.xpReward} EXP)`
              : `🔒 PROOF REQUIRED (ATTACH PHOTO OR LOG METRICS)`}
          </button>

          {showSelfReportBox && (
            <div style={{ background: 'rgba(255, 170, 0, 0.06)', border: '1px solid rgba(255, 170, 0, 0.3)', borderRadius: '8px', padding: '12px' }}>
              <strong style={{ color: '#ffaa00', fontSize: '0.86rem', display: 'block', marginBottom: '6px' }}>
                ✍️ HUMAN EXECUTION LOG (REQUIRED)
              </strong>
              <p style={{ color: '#e2f1ff', fontSize: '0.78rem', marginBottom: '8px' }}>
                Describe what you accomplished in the real world (minimum 15 characters required to verify human completion):
              </p>
              <textarea
                placeholder="e.g. Completed 35 push-ups and 2-min plank on living room floor..."
                value={humanReportText}
                onChange={e => {
                  setHumanReportText(e.target.value);
                  setValidationError(null);
                }}
                rows={2}
                style={{ width: '100%', fontSize: '0.84rem', padding: '8px', background: 'rgba(6, 12, 26, 0.95)', border: '1px solid rgba(255, 170, 0, 0.4)', color: '#fff', borderRadius: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.72rem', color: humanReportText.trim().length >= 15 ? '#10b981' : '#f59e0b' }}>
                <span>{humanReportText.trim().length >= 15 ? '✓ Verified Human Log' : 'Minimum 15 characters required'}</span>
                <span>{humanReportText.trim().length}/15</span>
              </div>
            </div>
          )}

          <button
            className="hud-btn-secondary"
            onClick={handleClaimUnverified}
            style={{
              padding: '10px',
              fontSize: '0.82rem',
              color: showSelfReportBox && humanReportText.trim().length < 15 ? '#94a3b8' : '#ffaa00',
              borderColor: 'rgba(255, 170, 0, 0.3)',
              background: 'rgba(255, 170, 0, 0.05)',
              cursor: showSelfReportBox && humanReportText.trim().length < 15 ? 'not-allowed' : 'pointer'
            }}
          >
            {showSelfReportBox
              ? (humanReportText.trim().length >= 15 ? '🛡️ CONFIRM HUMAN LOG & CLAIM (30% EXP)' : '🔒 ENTER AT LEAST 15 CHARACTERS TO CLAIM')
              : '📝 Log Human Self-Report (Awards 30% EXP Baseline)'}
          </button>
        </div>
      </div>
    </div>
  );
};
