import React, { useState, useEffect, useRef } from 'react';
import { shadowVoice, VOICE_PERSONAS, VoicePersona } from '../../game/voiceAssistant';
import { PlayerProfile, Quest } from '../../types';
import { soundEngine } from '../../game/sound';

interface ShadowVoiceWidgetProps {
  player: PlayerProfile;
  quests: Quest[];
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onSelectFocusQuest?: (questId: string) => void;
}

export const ShadowVoiceWidget: React.FC<ShadowVoiceWidgetProps> = ({
  player,
  quests,
  voiceEnabled,
  onToggleVoice,
  onSelectFocusQuest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<VoicePersona>('jinwoo');
  const [spokenText, setSpokenText] = useState<string>(
    "Hunter, I am your System Guide. Tell me your dedication for today, or ask me for directives."
  );
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'dialogue' | 'dedication' | 'explainers'>('dialogue');
  const typewriterTimerRef = useRef<any>(null);

  // Sync persona changes
  const handleSelectPersona = (p: VoicePersona) => {
    soundEngine.playPing();
    setPersona(p);
    shadowVoice.setPersona(p);
    const welcome = p === 'jinwoo'
      ? "Sung Jin-woo reporting in. What is our focus for today, Hunter?"
      : p === 'system'
      ? "Architect System AI active. All neural telemetry synchronized. Ready for command."
      : "Commander Igris stands ready. My blade and honor are yours, My Monarch.";
    triggerSpeech(welcome);
  };

  // Word-by-word typewriter effect
  const triggerSpeech = (text: string) => {
    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
    }

    setSpokenText(text);
    const words = text.split(' ');
    setDisplayedWords([]);
    setIsSpeaking(true);

    let wordIdx = 0;
    const intervalTime = Math.max(70, Math.min(180, Math.floor(2500 / Math.max(1, words.length))));

    typewriterTimerRef.current = setInterval(() => {
      wordIdx++;
      if (wordIdx <= words.length) {
        setDisplayedWords(words.slice(0, wordIdx));
      } else {
        clearInterval(typewriterTimerRef.current);
      }
    }, intervalTime);

    shadowVoice.speak(text, () => {
      setIsSpeaking(false);
      setDisplayedWords(words);
    });
  };

  useEffect(() => {
    // Initial display text words
    setDisplayedWords(spokenText.split(' '));
    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, []);

  const pendingQuests = quests.filter(q => q.status !== 'completed');
  const currentPersonaInfo = VOICE_PERSONAS[persona];

  // Guided Dedication Actions
  const handleSetDedication = (focusArea: 'fitness' | 'coding' | 'study' | 'discipline') => {
    soundEngine.playLevelUp();
    if (focusArea === 'fitness') {
      const q = quests.find(q => q.category === 'fitness' || q.title.toLowerCase().includes('push-up'));
      if (q && onSelectFocusQuest) onSelectFocusQuest(q.id);
      triggerSpeech(
        "Dedication set: Physical Power. Execute your 4 sets of 10 push-ups with strict form. Real physical discipline builds an unbreakable core. I will record your progress."
      );
    } else if (focusArea === 'coding') {
      const q = quests.find(q => q.category === 'coding' || q.title.toLowerCase().includes('dsa'));
      if (q && onSelectFocusQuest) onSelectFocusQuest(q.id);
      triggerSpeech(
        "Dedication set: Technical & DSA Mastery. Open your code editor and solve your 2 algorithmic challenges. Focus on time and space complexity."
      );
    } else if (focusArea === 'study') {
      triggerSpeech(
        "Dedication set: Deep Focus. Enter the Instant Dungeon for a 25-minute sealed study session. Cast aside all notifications and conquer your material."
      );
    } else {
      triggerSpeech(
        "Dedication set: Routine & Vitality. Hydrate with 2.5 liters of clean water and power down screens early tonight. Recovery is the foundation of ascension."
      );
    }
  };

  const handleExplainLoadout = () => {
    soundEngine.playPing();
    triggerSpeech(
      "Your Loadout contains 4 gear slots: Weapon, Armor, Ring, and Accessory. Keep the E-Ring equipped on your finger for permanent Focus and fatigue resistance. Collect more gear from dungeons to boost your attributes!"
    );
  };

  const handleExplainMonarch = () => {
    soundEngine.playPing();
    triggerSpeech(
      `You are currently Level ${player.level}. At Level 5, you trigger your Job Change Quest to awaken the Shadow Monarch! You will unlock Shadow Extraction to command Shadow Soldiers like Igris and Iron for permanent passive multipliers.`
    );
  };

  const handleStatusReport = () => {
    soundEngine.playPing();
    triggerSpeech(
      `Hunter Status Report: Rank ${player.rank}, Level ${player.level}. Experience is at ${player.currentXp} of ${player.requiredXp} XP. Fatigue is at ${player.fatigue} percent. You have ${player.statPoints} unallocated stat points available in your status window.`
    );
  };

  const handleNextDirective = () => {
    soundEngine.playPing();
    if (pendingQuests.length > 0) {
      const next = pendingQuests[0];
      triggerSpeech(`Our immediate directive is: ${next.title}. Complete it to earn ${next.xpReward} EXP and boost your attributes.`);
    } else {
      triggerSpeech(`Magnificent work, Hunter! All active daily directives have been conquered. Your discipline today is absolute.`);
    }
  };

  return (
    <>
      {/* Floating System Guide Trigger Button */}
      <div
        className="shadow-assistant-floating-container"
        style={{
          position: 'fixed',
          right: '16px',
          bottom: '75px',
          zIndex: 990
        }}
      >
        <button
          onClick={() => {
            soundEngine.playPing();
            const nextOpen = !isOpen;
            setIsOpen(nextOpen);
            if (nextOpen && voiceEnabled) {
              triggerSpeech(
                persona === 'jinwoo'
                  ? "I'm with you, Hunter. What are we accomplishing today?"
                  : persona === 'system'
                  ? "System Guide online. All hunter telemetry ready. Select your directive."
                  : "My Lord, Igris stands ready. What is your will?"
              );
            }
          }}
          title="Open Voice Guide & Dedication Terminal"
          aria-label="Open Voice Guide"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #091b36, #1b0e2b)',
            border: isSpeaking ? '2px solid #00f0ff' : '2px solid #a855f7',
            boxShadow: isSpeaking
              ? '0 0 25px rgba(0, 240, 255, 0.8), inset 0 0 15px rgba(0, 240, 255, 0.4)'
              : '0 0 15px rgba(168, 85, 247, 0.5)',
            color: '#fff',
            fontSize: '1.6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            animation: isSpeaking ? 'pulse-glow 1.2s infinite alternate' : 'none'
          }}
        >
          {currentPersonaInfo.avatar}
        </button>
      </div>

      {/* Holographic Voice Guide Modal Pop-up */}
      {isOpen && (
        <div
          className="modal-backdrop voice-guide-backdrop"
          onClick={() => {
            shadowVoice.stop();
            setIsOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 8, 18, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div
            className="hud-card voice-terminal-modal"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'linear-gradient(180deg, rgba(10, 22, 44, 0.98), rgba(6, 12, 26, 0.98))',
              border: '1px solid #00d2ff',
              boxShadow: '0 0 40px rgba(0, 210, 255, 0.35)',
              borderRadius: '12px',
              padding: '20px',
              position: 'relative'
            }}
          >
            {/* Corner accoutrements */}
            <div className="card-corner tl" style={{ borderColor: '#00d2ff' }} />
            <div className="card-corner tr" style={{ borderColor: '#00d2ff' }} />
            <div className="card-corner bl" style={{ borderColor: '#00d2ff' }} />
            <div className="card-corner br" style={{ borderColor: '#00d2ff' }} />

            {/* Header & Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="hud-tag" style={{ borderColor: '#00d2ff', color: '#00d2ff' }}>
                  ● HUNTER VOICE GUIDE & DEDICATION TERMINAL
                </span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playPing();
                  shadowVoice.stop();
                  setIsOpen(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
                title="Close terminal"
              >
                ✕
              </button>
            </div>

            {/* Persona Switcher Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {(Object.keys(VOICE_PERSONAS) as VoicePersona[]).map(pKey => {
                const info = VOICE_PERSONAS[pKey];
                const active = persona === pKey;
                return (
                  <button
                    key={pKey}
                    onClick={() => handleSelectPersona(pKey)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      background: active ? 'rgba(0, 210, 255, 0.25)' : 'rgba(14, 27, 54, 0.6)',
                      border: active ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: active ? '#fff' : '#7f9ebc',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{info.avatar}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700 }}>
                      {info.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Speaking Character Info Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(0, 210, 255, 0.05)',
                border: '1px solid rgba(0, 210, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '14px'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(0, 210, 255, 0.15)',
                  border: '1px solid #00f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem'
                }}
              >
                {currentPersonaInfo.avatar}
              </div>
              <div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: '#fff' }}>
                  {currentPersonaInfo.name}
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#00d2ff' }}>
                  {currentPersonaInfo.title}
                </span>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={onToggleVoice}
                  style={{
                    background: voiceEnabled ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                    border: `1px solid ${voiceEnabled ? '#00f0ff' : '#ff3366'}`,
                    color: voiceEnabled ? '#00f0ff' : '#ff3366',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  {voiceEnabled ? '🔊 VOICE ON' : '🔇 MUTED'}
                </button>
              </div>
            </div>

            {/* Typewriter Spoken Dialogue Card */}
            <div
              style={{
                background: 'rgba(5, 12, 26, 0.85)',
                border: isSpeaking ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '14px 16px',
                minHeight: '80px',
                marginBottom: '16px',
                boxShadow: isSpeaking ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#00d2ff', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                {isSpeaking ? '⚡ SYSTEM VOICE TRANSMISSION IN PROGRESS...' : '✦ SYSTEM MESSAGE'}
              </div>
              <p
                style={{
                  margin: 0,
                  color: '#f0f7ff',
                  fontSize: '0.92rem',
                  lineHeight: '1.5',
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'normal'
                }}
              >
                “
                {displayedWords.map((w, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-block',
                      marginRight: '4px',
                      color: idx === displayedWords.length - 1 && isSpeaking ? '#00f0ff' : '#f0f7ff',
                      fontWeight: idx === displayedWords.length - 1 && isSpeaking ? 700 : 400
                    }}
                  >
                    {w}
                  </span>
                ))}
                ”
              </p>
            </div>

            {/* Navigation Tabs for Actions */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => {
                  soundEngine.playPing();
                  setActiveCategory('dialogue');
                }}
                className={`hud-tab-btn ${activeCategory === 'dialogue' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
              >
                🎯 Directives
              </button>
              <button
                onClick={() => {
                  soundEngine.playPing();
                  setActiveCategory('dedication');
                }}
                className={`hud-tab-btn ${activeCategory === 'dedication' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
              >
                ⚔️ Set Focus
              </button>
              <button
                onClick={() => {
                  soundEngine.playPing();
                  setActiveCategory('explainers');
                }}
                className={`hud-tab-btn ${activeCategory === 'explainers' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
              >
                📖 Explainers
              </button>
            </div>

            {/* TAB 1: Directives */}
            {activeCategory === 'dialogue' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="hud-btn-primary"
                  onClick={handleNextDirective}
                  style={{
                    padding: '12px 14px',
                    fontSize: '0.88rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>📜</span>
                  <div>
                    <strong style={{ display: 'block' }}>What should I do right now?</strong>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Spoken briefing on your next active quest</span>
                  </div>
                </button>

                <button
                  className="hud-btn-secondary"
                  onClick={handleStatusReport}
                  style={{
                    padding: '12px 14px',
                    fontSize: '0.88rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>📊</span>
                  <div>
                    <strong style={{ display: 'block' }}>Hunter Status & Rank Report</strong>
                    <span style={{ fontSize: '0.75rem', color: '#7f9ebc' }}>Spoken breakdown of Level, XP & Fatigue</span>
                  </div>
                </button>
              </div>
            )}

            {/* TAB 2: Set Today's Dedication */}
            {activeCategory === 'dedication' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#7f9ebc', marginBottom: '2px' }}>
                  Declare your dedication for today. The System will guide your session:
                </span>

                <button
                  className="hud-btn-secondary"
                  onClick={() => handleSetDedication('fitness')}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.86rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderColor: 'rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🏋️</span>
                  <div>
                    <strong style={{ display: 'block', color: '#ff6b81' }}>Focus on Physical Strength & Workout</strong>
                    <span style={{ fontSize: '0.74rem', color: '#7f9ebc' }}>40 Push-ups & Core circuit tracking (+30 EXP, +3 STR)</span>
                  </div>
                </button>

                <button
                  className="hud-btn-secondary"
                  onClick={() => handleSetDedication('coding')}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.86rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderColor: 'rgba(56, 189, 248, 0.4)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>💻</span>
                  <div>
                    <strong style={{ display: 'block', color: '#38bdf8' }}>Focus on DSA & Coding Challenges</strong>
                    <span style={{ fontSize: '0.74rem', color: '#7f9ebc' }}>Solve 2 algorithmic problems (+35 EXP, +3 INT)</span>
                  </div>
                </button>

                <button
                  className="hud-btn-secondary"
                  onClick={() => handleSetDedication('study')}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.86rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderColor: 'rgba(168, 85, 247, 0.4)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>📚</span>
                  <div>
                    <strong style={{ display: 'block', color: '#c084fc' }}>Focus on Deep Study / Exam Prep</strong>
                    <span style={{ fontSize: '0.74rem', color: '#7f9ebc' }}>25-Min sealed Instant Dungeon session (+30 EXP, +2 FOC)</span>
                  </div>
                </button>

                <button
                  className="hud-btn-secondary"
                  onClick={() => handleSetDedication('discipline')}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.86rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderColor: 'rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>💧</span>
                  <div>
                    <strong style={{ display: 'block', color: '#34d399' }}>Restore Hydration & Discipline</strong>
                    <span style={{ fontSize: '0.74rem', color: '#7f9ebc' }}>2.5L clean water & screen-off sleep recovery (+20 EXP, +2 VIT)</span>
                  </div>
                </button>
              </div>
            )}

            {/* TAB 3: System Explainers */}
            {activeCategory === 'explainers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#7f9ebc', marginBottom: '2px' }}>
                  Tap any topic for a spoken breakdown:
                </span>

                <button
                  className="hud-btn-secondary"
                  onClick={handleExplainLoadout}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.86rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>💍</span>
                  <div>
                    <strong style={{ display: 'block' }}>What is the Loadout & E-Ring?</strong>
                    <span style={{ fontSize: '0.74rem', color: '#7f9ebc' }}>How equipped gear gives you passive stat bonuses</span>
                  </div>
                </button>

                <button
                  className="hud-btn-secondary"
                  onClick={handleExplainMonarch}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.86rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>👑</span>
                  <div>
                    <strong style={{ display: 'block' }}>Why is the Monarch locked to Level 5?</strong>
                    <span style={{ fontSize: '0.74rem', color: '#7f9ebc' }}>Your First Job Change & Shadow Extraction preview</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
