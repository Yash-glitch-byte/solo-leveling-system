import React, { useState } from 'react';
import { PlayerProfile, QuestCategory, QuestDifficulty } from '../../types';
import { soundEngine } from '../../game/sound';

interface OnboardingModalProps {
  onComplete: (updatedPlayer: Partial<PlayerProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('Sung Jin-woo');
  const [alias, setAlias] = useState<string>('Shadow Sovereign');
  const [avatarIcon, setAvatarIcon] = useState<string>('⚡');
  const [mainGoal, setMainGoal] = useState<string>('Master full-stack programming, crush DSA algorithms, and forge peak physical strength.');
  const [selectedCategories, setSelectedCategories] = useState<QuestCategory[]>([
    'fitness',
    'coding',
    'study',
    'discipline'
  ]);
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('normal');
  const [campaignChoice, setCampaignChoice] = useState<'21-day' | '66-day'>('21-day');

  const avatarOptions = ['⚡', '🗡️', '👑', '🔥', '🐺', '🛡️', '🧬', '🌌'];

  const categoryOptions: { key: QuestCategory; label: string; icon: string }[] = [
    { key: 'fitness', label: 'Fitness & Physical Health', icon: '🏋️' },
    { key: 'coding', label: 'Programming & Tech Systems', icon: '💻' },
    { key: 'study', label: 'Academic & Deep Study', icon: '📚' },
    { key: 'career', label: 'Career, Resume & Interviews', icon: '💼' },
    { key: 'discipline', label: 'Discipline, Sleep & Routine', icon: '⏱️' },
    { key: 'communication', label: 'Communication & Speaking', icon: '🎙️' }
  ];

  const toggleCategory = (cat: QuestCategory) => {
    soundEngine.playPing();
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleFinish = () => {
    soundEngine.playLevelUp();
    onComplete({
      name: name.trim() || 'Player',
      alias: alias.trim() || 'The Awakened One',
      avatarIcon,
      mainGoal,
      selectedCategories,
      preferredTimePerDayMinutes: dailyMinutes,
      preferredDifficulty: difficulty,
      isOnboarded: true
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="onboarding-modal-card">
        {/* Glow & Scanlines */}
        <div className="modal-glow-border"></div>

        {/* Header */}
        <div className="onboarding-header">
          <div className="system-pill">[ SYSTEM AWAKENING INITIATIVE ]</div>
          <h2 className="onboarding-title">
            {step === 1 && 'STEP 1: IDENTITY REGISTRATION'}
            {step === 2 && 'STEP 2: TARGET OBJECTIVES'}
            {step === 3 && 'STEP 3: COMMITMENT & CAMPAIGN'}
            {step === 4 && 'STEP 4: SYSTEM REAWAKEN INITIALIZATION'}
          </h2>
          <div className="step-indicator">
            <span className={`step-dot ${step >= 1 ? 'active' : ''}`} />
            <span className={`step-dot ${step >= 2 ? 'active' : ''}`} />
            <span className={`step-dot ${step >= 3 ? 'active' : ''}`} />
            <span className={`step-dot ${step >= 4 ? 'active' : ''}`} />
          </div>
        </div>

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="onboarding-body">
            <p className="onboarding-desc">
              Your previous chapter has ended. The System has chosen you. Register your hunter identity to calibrate progression parameters.
            </p>

            <div className="form-group">
              <label>Hunter Name / Real Name</label>
              <input
                type="text"
                className="hud-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label>Hunter Alias / Title</label>
              <input
                type="text"
                className="hud-input"
                value={alias}
                onChange={e => setAlias(e.target.value)}
                placeholder="e.g. Shadow Sovereign, The Awakened"
                maxLength={40}
              />
            </div>

            <div className="form-group">
              <label>Choose Crest Avatar</label>
              <div className="avatar-picker-row">
                {avatarOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`avatar-choice-btn ${avatarIcon === icon ? 'selected' : ''}`}
                    onClick={() => {
                      soundEngine.playPing();
                      setAvatarIcon(icon);
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Goal & Categories */}
        {step === 2 && (
          <div className="onboarding-body">
            <p className="onboarding-desc">
              Define your primary life vision and select the domains where you will focus your daily energy.
            </p>

            <div className="form-group">
              <label>Main Overarching Life Goal</label>
              <textarea
                className="hud-textarea"
                rows={3}
                value={mainGoal}
                onChange={e => setMainGoal(e.target.value)}
                placeholder="What is your most important transformation goal over the next 3-6 months?"
              />
            </div>

            <div className="form-group">
              <label>Select Focus Categories</label>
              <div className="category-selection-grid">
                {categoryOptions.map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    className={`category-pill-btn ${selectedCategories.includes(cat.key) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat.key)}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Commitment & Difficulty */}
        {step === 3 && (
          <div className="onboarding-body">
            <p className="onboarding-desc">
              Calibrate your daily commitment capacity. The System rewards consistency over reckless overexertion.
            </p>

            <div className="form-group">
              <label>Target Daily Focus Capacity: <strong>{dailyMinutes} Minutes/Day</strong></label>
              <input
                type="range"
                min={20}
                max={180}
                step={10}
                value={dailyMinutes}
                onChange={e => setDailyMinutes(Number(e.target.value))}
                className="hud-slider"
              />
              <div className="slider-hints">
                <span>20 mins (Light)</span>
                <span>60 mins (Balanced)</span>
                <span>120+ mins (Intense)</span>
              </div>
            </div>

            <div className="form-group">
              <label>Starting Challenge Campaign</label>
              <div className="campaign-choice-row">
                <button
                  type="button"
                  className={`campaign-card-btn ${campaignChoice === '21-day' ? 'selected' : ''}`}
                  onClick={() => {
                    soundEngine.playPing();
                    setCampaignChoice('21-day');
                  }}
                >
                  <div className="card-badge">21 DAYS</div>
                  <h4>Habit Awakening</h4>
                  <p>Establish indestructible morning discipline & momentum.</p>
                </button>

                <button
                  type="button"
                  className={`campaign-card-btn ${campaignChoice === '66-day' ? 'selected' : ''}`}
                  onClick={() => {
                    soundEngine.playPing();
                    setCampaignChoice('66-day');
                  }}
                >
                  <div className="card-badge">66 DAYS</div>
                  <h4>Complete Evolution</h4>
                  <p>Full cognitive rewiring and mastery-level compound growth.</p>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Starting Difficulty</label>
              <div className="difficulty-row">
                {(['easy', 'normal', 'hard'] as QuestDifficulty[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    className={`diff-btn ${difficulty === d ? 'selected' : ''}`}
                    onClick={() => {
                      soundEngine.playPing();
                      setDifficulty(d);
                    }}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {step === 4 && (
          <div className="onboarding-body ceremony-screen">
            <div className="ceremony-icon-glow">{avatarIcon}</div>
            <h3 className="ceremony-subtitle">HUNTER IDENTITY REGISTERED</h3>
            <p className="ceremony-text">
              Welcome, <strong>{name}</strong> [<em>{alias}</em>].
              <br />
              Starting Level: <strong>1 (E-Rank)</strong>. Your customized starter quests, Instant Dungeons, and habit campaigns have been provisioned in your local status matrix.
            </p>
            <div className="ceremony-quote">
              “Your previous limits no longer apply. Stand up and awaken.”
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="onboarding-footer">
          {step > 1 && (
            <button
              type="button"
              className="hud-btn-secondary"
              onClick={() => {
                soundEngine.playPing();
                setStep(step - 1);
              }}
            >
              PREVIOUS
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              className="hud-btn-primary next-btn"
              onClick={() => {
                soundEngine.playPing();
                setStep(step + 1);
              }}
            >
              PROCEED TO NEXT STEP →
            </button>
          ) : (
            <button
              type="button"
              className="hud-btn-primary arise-btn"
              onClick={handleFinish}
            >
              ✦ ARISE: INITIALIZE SYSTEM ✦
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
