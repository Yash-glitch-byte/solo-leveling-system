import React, { useState } from 'react';
import { PlayerProfile, QuestCategory, QuestDifficulty } from '../../types';
import { soundEngine } from '../../game/sound';

interface OnboardingModalProps {
  onComplete: (updatedPlayer: Partial<PlayerProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('Hunter');
  const [alias, setAlias] = useState<string>('The Awakened One');
  const [avatarIcon, setAvatarIcon] = useState<string>('⚡');
  const [mainGoal, setMainGoal] = useState<string>('Master software engineering, crush daily workout circuits, and forge unbreakable personal discipline.');
  const [selectedCategories, setSelectedCategories] = useState<QuestCategory[]>([
    'fitness',
    'coding',
    'study',
    'discipline'
  ]);
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('normal');
  const [campaignChoice, setCampaignChoice] = useState<'21-day' | '66-day'>('21-day');
  const [routineFocus, setRoutineFocus] = useState<'morning_sprint' | 'balanced' | 'evening_flow'>('balanced');
  const [voiceCompanionOptIn, setVoiceCompanionOptIn] = useState<boolean>(false); // Silent by default as mandated
  const [multiplayerOptIn, setMultiplayerOptIn] = useState<boolean>(true);
  const [hydrationReminder, setHydrationReminder] = useState<boolean>(true);
  const [taskReminder, setTaskReminder] = useState<boolean>(true);

  const avatarOptions = ['⚡', '🗡️', '👑', '🔥', '🐺', '🛡️', '🧬', '🌌', '🏹', '💎'];

  const categoryOptions: { key: QuestCategory; label: string; icon: string }[] = [
    { key: 'fitness', label: 'Fitness & Physical Power', icon: '🏋️' },
    { key: 'coding', label: 'Programming & System Architecture', icon: '💻' },
    { key: 'study', label: 'Academic & Deep Study', icon: '📚' },
    { key: 'career', label: 'Career, Portfolio & Interviews', icon: '💼' },
    { key: 'discipline', label: 'Discipline, Routine & Sleep', icon: '⏱️' },
    { key: 'communication', label: 'Public Speaking & Writing', icon: '🎙️' }
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
      voiceCompanionOptIn,
      multiplayerOptIn,
      reminderSettings: {
        hydration: hydrationReminder,
        dailyQuests: taskReminder,
        review: true
      },
      privacySettings: {
        isPublic: multiplayerOptIn,
        shareActivity: multiplayerOptIn,
        showOnlineStatus: multiplayerOptIn,
        shareStats: true
      },
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
            {step === 3 && 'STEP 3: COMMITMENT & ROUTINE FOCUS'}
            {step === 4 && 'STEP 4: SYSTEM PREFERENCES & OPT-INS'}
            {step === 5 && 'STEP 5: SYSTEM MECHANICS & INITIALIZATION'}
          </h2>
          <div className="step-indicator">
            <span className={`step-dot ${step >= 1 ? 'active' : ''}`} />
            <span className={`step-dot ${step >= 2 ? 'active' : ''}`} />
            <span className={`step-dot ${step >= 3 ? 'active' : ''}`} />
            <span className={`step-dot ${step >= 4 ? 'active' : ''}`} />
            <span className={`step-dot ${step >= 5 ? 'active' : ''}`} />
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

        {/* Step 3: Commitment & Routine Focus */}
        {step === 3 && (
          <div className="onboarding-body">
            <p className="onboarding-desc">
              Calibrate your daily commitment capacity and optimal workflow rhythm. The System rewards consistency over reckless overexertion.
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
              <label>Daily Routine & Prime Energy Window</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  className={`diff-btn ${routineFocus === 'morning_sprint' ? 'selected' : ''}`}
                  onClick={() => {
                    soundEngine.playPing();
                    setRoutineFocus('morning_sprint');
                  }}
                  style={{ padding: '8px 4px', fontSize: '0.78rem' }}
                >
                  🌅 Morning Sprint
                </button>
                <button
                  type="button"
                  className={`diff-btn ${routineFocus === 'balanced' ? 'selected' : ''}`}
                  onClick={() => {
                    soundEngine.playPing();
                    setRoutineFocus('balanced');
                  }}
                  style={{ padding: '8px 4px', fontSize: '0.78rem' }}
                >
                  ⚖️ Balanced Flow
                </button>
                <button
                  type="button"
                  className={`diff-btn ${routineFocus === 'evening_flow' ? 'selected' : ''}`}
                  onClick={() => {
                    soundEngine.playPing();
                    setRoutineFocus('evening_flow');
                  }}
                  style={{ padding: '8px 4px', fontSize: '0.78rem' }}
                >
                  🌙 Evening Focus
                </button>
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
                  <p>Establish indestructible daily discipline & momentum.</p>
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
                  <p>Full cognitive rewiring and compound mastery.</p>
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

        {/* Step 4: System Preferences & Opt-Ins */}
        {step === 4 && (
          <div className="onboarding-body">
            <p className="onboarding-desc">
              Configure communication, notifications, and social competition preferences. You can adjust all settings at any time.
            </p>

            {/* Voice Companion Opt-In (Silent by Default) */}
            <div style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#00f0ff', fontSize: '0.88rem', display: 'block' }}>
                    🎙️ AI Voice Companion
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: '#7f9ebc' }}>
                    Conversational voice assistant with speech recognition. (Silent by default).
                  </span>
                </div>
                <button
                  type="button"
                  className={`diff-btn ${voiceCompanionOptIn ? 'selected' : ''}`}
                  onClick={() => {
                    soundEngine.playPing();
                    setVoiceCompanionOptIn(!voiceCompanionOptIn);
                  }}
                  style={{ minWidth: '70px', padding: '6px 12px' }}
                >
                  {voiceCompanionOptIn ? 'ENABLED' : 'OFF (SILENT)'}
                </button>
              </div>
            </div>

            {/* Multiplayer & Competitions Opt-In */}
            <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#c084fc', fontSize: '0.88rem', display: 'block' }}>
                    🏆 Multiplayer & Arena Competitions
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: '#7f9ebc' }}>
                    Participate in challenges, connect with friends, and view leaderboards.
                  </span>
                </div>
                <button
                  type="button"
                  className={`diff-btn ${multiplayerOptIn ? 'selected' : ''}`}
                  onClick={() => {
                    soundEngine.playPing();
                    setMultiplayerOptIn(!multiplayerOptIn);
                  }}
                  style={{ minWidth: '70px', padding: '6px 12px' }}
                >
                  {multiplayerOptIn ? 'OPT-IN' : 'SOLO ONLY'}
                </button>
              </div>
            </div>

            {/* Reminders & Notifications */}
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '12px' }}>
              <strong style={{ color: '#34d399', fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>
                🔔 Biological & Quest Reminders
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#e0f2fe', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hydrationReminder}
                    onChange={e => setHydrationReminder(e.target.checked)}
                  />
                  <span>💧 Hydration Alert: 250ml water reminders every 45 mins</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#e0f2fe', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={taskReminder}
                    onChange={e => setTaskReminder(e.target.checked)}
                  />
                  <span>📜 Daily Quests: Pending mission notices before evening</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: System Mechanics Briefing & Ceremony */}
        {step === 5 && (
          <div className="onboarding-body ceremony-screen">
            <div className="ceremony-icon-glow">{avatarIcon}</div>
            <h3 className="ceremony-subtitle">HUNTER MATRIX CALIBRATED</h3>
            <p className="ceremony-text" style={{ marginBottom: '12px' }}>
              Welcome, <strong>{name}</strong> [<em>{alias}</em>]. Starting Rank: <strong>E-Rank (LV.1)</strong>.
            </p>

            {/* Core Game Mechanics Briefing */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', textAlign: 'left', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '6px', padding: '8px' }}>
                <strong style={{ color: '#00f0ff', fontSize: '0.78rem', display: 'block' }}>⚡ XP & Levels</strong>
                <span style={{ color: '#7f9ebc', fontSize: '0.72rem' }}>Earn XP by completing real-world missions. Level up to increase ranks.</span>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '6px', padding: '8px' }}>
                <strong style={{ color: '#00f0ff', fontSize: '0.78rem', display: 'block' }}>💍 The E-Ring & Gear</strong>
                <span style={{ color: '#7f9ebc', fontSize: '0.72rem' }}>Auto-equipped origin relic shielding you against burnout fatigue.</span>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '6px', padding: '8px' }}>
                <strong style={{ color: '#00f0ff', fontSize: '0.78rem', display: 'block' }}>🗝️ Instant Dungeons</strong>
                <span style={{ color: '#7f9ebc', fontSize: '0.72rem' }}>Sealed 25m focus chambers for deep work and exam revision.</span>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '6px', padding: '8px' }}>
                <strong style={{ color: '#00f0ff', fontSize: '0.78rem', display: 'block' }}>🛡️ Honest Verification</strong>
                <span style={{ color: '#7f9ebc', fontSize: '0.72rem' }}>Quizzes, logs, and optional photos ensure genuine personal growth.</span>
              </div>
            </div>

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

          {step < 5 ? (
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
