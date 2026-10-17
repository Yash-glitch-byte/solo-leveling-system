import React, { useState } from 'react';
import { Quest, BatchEvidenceSubmission, VerificationStatus } from '../../types';
import { soundEngine } from '../../game/sound';

interface BatchEvidenceModalProps {
  quests: Quest[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitBatch: (submission: BatchEvidenceSubmission) => void;
}

export const BatchEvidenceModal: React.FC<BatchEvidenceModalProps> = ({
  quests,
  isOpen,
  onClose,
  onSubmitBatch
}) => {
  if (!isOpen) return null;

  const availableQuests = quests.filter(q => q.status === 'available');

  const [selectedQuestIds, setSelectedQuestIds] = useState<string[]>([]);
  const [evidenceType, setEvidenceType] = useState<'quiz' | 'reflection' | 'code_url' | 'workout_log'>('reflection');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleSelectQuest = (qId: string) => {
    soundEngine.playPing();
    if (selectedQuestIds.includes(qId)) {
      setSelectedQuestIds(selectedQuestIds.filter(id => id !== qId));
    } else {
      setSelectedQuestIds([...selectedQuestIds, qId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestIds.length < 2) {
      setValidationError('Please select at least 2 related quests for batch verification.');
      return;
    }

    if (!title.trim()) {
      setValidationError('Please provide a descriptive title for this batch submission.');
      return;
    }

    if (evidenceType === 'code_url' && !details.includes('http') && details.length < 10) {
      setValidationError('Please enter a valid Git commit, PR, or repository URL.');
      return;
    }

    if (evidenceType === 'reflection' && details.trim().length < 20) {
      setValidationError('Please provide at least 20 characters summarizing the completed batch work.');
      return;
    }

    soundEngine.playLevelUp();

    // Determine status: Supported by default, or Verified if detailed code_url or structured log
    const status: VerificationStatus =
      evidenceType === 'code_url' || evidenceType === 'workout_log' || (evidenceType === 'quiz' && quizScore === 100)
        ? 'verified'
        : 'supported';

    const selectedQuests = quests.filter(q => selectedQuestIds.includes(q.id));
    const totalXp = selectedQuests.reduce((acc, q) => acc + q.xpReward, 0);

    const submission: BatchEvidenceSubmission = {
      id: `batch-${Date.now()}`,
      questIds: selectedQuestIds,
      evidenceType,
      title: title.trim(),
      details: details.trim(),
      timestamp: Date.now(),
      status,
      xpAwarded: totalXp
    };

    onSubmitBatch(submission);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(3, 8, 18, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div
        className="hud-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '20px',
          borderColor: '#00d2ff',
          boxShadow: '0 0 40px rgba(0, 210, 255, 0.3)',
          borderRadius: '12px',
          position: 'relative'
        }}
      >
        <div className="card-corner tl" style={{ borderColor: '#00d2ff' }} />
        <div className="card-corner tr" style={{ borderColor: '#00d2ff' }} />
        <div className="card-corner bl" style={{ borderColor: '#00d2ff' }} />
        <div className="card-corner br" style={{ borderColor: '#00d2ff' }} />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="hud-tag" style={{ borderColor: '#00d2ff', color: '#00d2ff' }}>
            ● BATCH EVIDENCE AUDIT & SHARED VERIFICATION
          </span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#7f9ebc', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        <h3 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
          SUBMIT SHARED EVIDENCE FOR MULTIPLE MISSIONS
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#7f9ebc', margin: '0 0 16px 0', lineHeight: '1.4' }}>
          Don't take repetitive photos. Complete multiple related study, coding, or workout missions and submit one consolidated proof (Git URL, study summary, quiz, or workout log).
        </p>

        {validationError && (
          <div style={{ background: 'rgba(255, 51, 102, 0.15)', border: '1px solid #ff3366', borderRadius: '6px', padding: '10px', color: '#ff6b81', fontSize: '0.8rem', marginBottom: '14px' }}>
            ⚠️ {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* STEP 1: Select Missions to verify */}
          <div>
            <label style={{ fontSize: '0.78rem', color: '#00d2ff', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              1. Select Covered Quests ({selectedQuestIds.length} Selected)
            </label>
            <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '8px' }}>
              {availableQuests.length === 0 ? (
                <span style={{ fontSize: '0.78rem', color: '#7f9ebc' }}>No active available quests to batch verify.</span>
              ) : (
                availableQuests.map(q => {
                  const isChecked = selectedQuestIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      onClick={() => toggleSelectQuest(q.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        background: isChecked ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: isChecked ? '1px solid #00d2ff' : '1px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ accentColor: '#00d2ff' }}
                        />
                        <span style={{ fontSize: '0.82rem', color: isChecked ? '#fff' : '#94a3b8' }}>
                          {q.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>
                        +{q.xpReward} EXP
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* STEP 2: Choose Evidence Format */}
          <div>
            <label style={{ fontSize: '0.78rem', color: '#00d2ff', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              2. Shared Evidence Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'reflection', label: '📝 Reflection', desc: 'Summary notes' },
                { id: 'code_url', label: '💻 Git / Repo', desc: 'PR or code link' },
                { id: 'workout_log', label: '🏋️ Workout Log', desc: 'Sets & reps table' },
                { id: 'quiz', label: '🧠 Concept Quiz', desc: 'Knowledge check' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { soundEngine.playPing(); setEvidenceType(t.id as any); }}
                  className={`diff-btn ${evidenceType === t.id ? 'selected' : ''}`}
                  style={{ padding: '8px 4px', fontSize: '0.74rem', textAlign: 'center' }}
                >
                  <strong style={{ display: 'block' }}>{t.label}</strong>
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Title & Evidence Input */}
          <div>
            <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>
              Batch Submission Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Completed Chapter 4 Study Block & Algorithm Solutions"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(5, 12, 26, 0.95)', border: '1px solid rgba(0, 210, 255, 0.3)', color: '#fff', fontSize: '0.84rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>
              {evidenceType === 'code_url'
                ? 'GitHub Repository, Commit, or Pull Request Link'
                : evidenceType === 'workout_log'
                ? 'Structured Workout Log (Exercises, Sets, Reps, RPE)'
                : 'Detailed Synthesis / Reflection / Summary of Work'}
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder={
                evidenceType === 'code_url'
                  ? 'https://github.com/user/project/pull/12 or commit hash with brief summary'
                  : evidenceType === 'workout_log'
                  ? '4 sets of 10 push-ups, 60s plank, 20 pull-ups. RPE: 8/10. Form maintained strict throughout.'
                  : 'Document the concepts learned, problems solved, or milestones hit across these selected missions...'
              }
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(5, 12, 26, 0.95)', border: '1px solid rgba(0, 210, 255, 0.3)', color: '#fff', fontSize: '0.84rem' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="submit"
              className="hud-btn-primary"
              style={{ flex: 1, padding: '12px', fontSize: '0.88rem' }}
              disabled={selectedQuestIds.length < 2}
            >
              ✓ VALIDATE & CLAIM BATCH MISSIONS
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '12px 18px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#7f9ebc', cursor: 'pointer', fontSize: '0.84rem' }}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
