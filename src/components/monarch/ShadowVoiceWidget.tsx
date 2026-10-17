import React, { useState } from 'react';
import { shadowVoice } from '../../game/voiceAssistant';
import { PlayerProfile, Quest } from '../../types';
import { soundEngine } from '../../game/sound';

interface ShadowVoiceWidgetProps {
  player: PlayerProfile;
  quests: Quest[];
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const ShadowVoiceWidget: React.FC<ShadowVoiceWidgetProps> = ({
  player,
  quests,
  voiceEnabled,
  onToggleVoice
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSpoken, setLastSpoken] = useState<string>('“My Lord, Igris stands ready. What is your will?”');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const pendingQuests = quests.filter(q => q.status !== 'completed');
  const nextQuest = pendingQuests[0];

  const handleSpeak = (text: string) => {
    soundEngine.playPing();
    setLastSpoken(`“${text}”`);
    setIsSpeaking(true);
    shadowVoice.speak(text, () => setIsSpeaking(false));
  };

  const handleNextDirective = () => {
    if (nextQuest) {
      handleSpeak(`My Lord, our current priority is ${nextQuest.title}. Let us proceed without delay.`);
    } else {
      handleSpeak(`All daily quests are cleared, My Lord. Your discipline is absolute.`);
    }
  };

  const handleStatusReport = () => {
    handleSpeak(`Status report: Hunter Rank ${player.rank}, Level ${player.level}. Fatigue is at ${player.fatigue} percent. Your spirit remains unyielding.`);
  };

  const handleBattleCry = () => {
    soundEngine.playDungeonEnter();
    handleSpeak(`My blade shall carve your path forward to sovereignty. For the Shadow Monarch!`);
  };

  return (
    <div className="shadow-assistant-floating-container" style={{ position: 'fixed', right: '16px', bottom: '75px', zIndex: 990 }}>
      {/* Expanded Hologram Dialogue Bubble */}
      {isOpen && (
        <div
          className="hud-card shadow-dialogue-card"
          style={{
            position: 'absolute',
            bottom: '68px',
            right: '0',
            width: '320px',
            maxWidth: 'calc(100vw - 32px)',
            background: 'rgba(9, 18, 36, 0.95)',
            border: '1px solid #ff3366',
            boxShadow: '0 0 25px rgba(255, 51, 102, 0.35)',
            padding: '16px',
            borderRadius: '10px'
          }}
        >
          <div className="card-corner tl" style={{ borderColor: '#ff3366' }} />
          <div className="card-corner tr" style={{ borderColor: '#ff3366' }} />
          <div className="card-corner bl" style={{ borderColor: '#ff3366' }} />
          <div className="card-corner br" style={{ borderColor: '#ff3366' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#ff3366', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 800 }}>
              🛡️ [SHADOW COMMANDER IGRIS]
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#7f9ebc', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>

          <p style={{ color: '#f0f7ff', fontSize: '0.86rem', fontStyle: 'italic', margin: '8px 0 14px 0', minHeight: '44px', lineHeight: '1.4' }}>
            {lastSpoken}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="hud-btn-secondary"
              onClick={handleNextDirective}
              style={{ fontSize: '0.82rem', padding: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>📜</span>
              <span>Next Quest Directive</span>
            </button>

            <button
              className="hud-btn-secondary"
              onClick={handleStatusReport}
              style={{ fontSize: '0.82rem', padding: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>📊</span>
              <span>Commander Status Report</span>
            </button>

            <button
              className="hud-btn-primary"
              onClick={handleBattleCry}
              style={{
                fontSize: '0.82rem',
                padding: '8px',
                background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.3), rgba(139, 92, 246, 0.5))',
                borderColor: '#ff3366'
              }}
            >
              ⚔️ Command: Arise Battle Cry
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.72rem', color: '#7f9ebc' }}>Voice Synthesis:</span>
              <button
                onClick={onToggleVoice}
                style={{
                  background: voiceEnabled ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                  border: `1px solid ${voiceEnabled ? '#00f0ff' : '#ff3366'}`,
                  color: voiceEnabled ? '#00f0ff' : '#ff3366',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                {voiceEnabled ? '🔊 ACTIVE' : '🔇 MUTED'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Orb */}
      <button
        onClick={() => {
          soundEngine.playPing();
          setIsOpen(!isOpen);
          if (!isOpen && voiceEnabled) {
            shadowVoice.announceGreeting();
          }
        }}
        title="Command Shadow Commander Igris"
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e092b, #4a0e2e)',
          border: '2px solid #ff3366',
          boxShadow: isSpeaking ? '0 0 25px #ff3366' : '0 0 15px rgba(255, 51, 102, 0.5)',
          color: '#fff',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: isSpeaking ? 'pulse-glow 1s infinite alternate' : 'none'
        }}
      >
        🛡️
      </button>
    </div>
  );
};
