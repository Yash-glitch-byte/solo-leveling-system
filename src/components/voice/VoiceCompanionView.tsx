import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, Quest } from '../../types';
import { soundEngine } from '../../game/sound';
import { shadowVoice, VOICE_PERSONAS, VoicePersona } from '../../game/voiceAssistant';
import { speechToMissionEngine, ConversationTurn, ParsedMissionProposal } from '../../game/speechToMission';

interface VoiceCompanionViewProps {
  player: PlayerProfile;
  quests: Quest[];
  onAddQuest: (newQuest: Quest) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const VoiceCompanionView: React.FC<VoiceCompanionViewProps> = ({
  player,
  quests,
  onAddQuest,
  voiceEnabled,
  onToggleVoice
}) => {
  const [conversationActive, setConversationActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [spokenAudioEnabled, setSpokenAudioEnabled] = useState<boolean>(true);
  const [textInput, setTextInput] = useState<string>('');
  const [persona, setPersona] = useState<VoicePersona>('jinwoo');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [history, setHistory] = useState<ConversationTurn[]>(() => speechToMissionEngine.getHistory());
  const [pendingProposal, setPendingProposal] = useState<ParsedMissionProposal | null>(() => speechToMissionEngine.getPendingProposal());
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [history, isListening, isSpeaking]);

  // Initialize Speech Recognition when conversation starts
  useEffect(() => {
    if (!conversationActive || micMuted) {
      stopListening();
      return;
    }

    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not natively supported in this browser. Use the instant text input bar below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        if (transcript.trim().length > 0) {
          handleIncomingTranscript(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('[SPEECH RECOGNITION ERROR]', e.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Restart if conversation is still active and not muted
        if (conversationActive && !micMuted) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      setMicError('Could not access microphone: ' + err.message);
      setIsListening(false);
    }

    return () => {
      stopListening();
    };
  }, [conversationActive, micMuted]);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleStartConversation = () => {
    soundEngine.playLevelUp();
    setConversationActive(true);
    setMicError(null);
    const greetingText =
      persona === 'jinwoo'
        ? "I'm listening, Hunter. Tell me what mission you're taking on, or ask for your next directive."
        : persona === 'system'
        ? "System Guide online. All hunter telemetry ready. What is your command?"
        : "Commander Igris stands ready. My blade and honor are yours, My Monarch.";

    if (history.length === 0) {
      const initTurn: ConversationTurn = {
        sender: 'assistant',
        text: greetingText,
        timestamp: Date.now()
      };
      setHistory([initTurn]);
      speakReply(greetingText);
    } else {
      speakReply("Conversation resumed. Ready for your command, Hunter.");
    }
  };

  const handleEndConversation = () => {
    soundEngine.playPing();
    stopListening();
    shadowVoice.stop();
    setIsSpeaking(false);
    setConversationActive(false);
  };

  const speakReply = (text: string) => {
    if (!spokenAudioEnabled || !voiceEnabled) return;
    setIsSpeaking(true);
    shadowVoice.speak(text, () => {
      setIsSpeaking(false);
    });
  };

  const handleIncomingTranscript = (rawText: string) => {
    const turn = speechToMissionEngine.processUserInput(rawText, quests, player.level);
    setHistory([...speechToMissionEngine.getHistory()]);
    setPendingProposal(speechToMissionEngine.getPendingProposal());

    // If turn has a confirmed mission, create it in state!
    if (turn.proposedMission && turn.text.includes('has been registered')) {
      createNewQuestFromProposal(turn.proposedMission);
    }

    speakReply(turn.text);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const msg = textInput.trim();
    setTextInput('');
    soundEngine.playPing();
    handleIncomingTranscript(msg);
  };

  const createNewQuestFromProposal = (proposal: ParsedMissionProposal) => {
    soundEngine.playLevelUp();
    const newQuest: Quest = {
      id: `quest-voice-${Date.now()}`,
      title: proposal.title,
      description: `Created via AI Voice Companion session [${proposal.durationMinutes}m target]`,
      category: proposal.category,
      difficulty: proposal.difficulty,
      durationMinutes: proposal.durationMinutes,
      attribute: proposal.attribute,
      xpReward: proposal.difficulty === 'hard' ? 45 : 30,
      attributePoints: proposal.difficulty === 'hard' ? 3 : 2,
      subtasks: proposal.subtasks,
      status: 'available',
      isDaily: true,
      verification: { tier: 'evidence_attached' },
      verificationStatus: 'supported'
    };
    onAddQuest(newQuest);
  };

  const handleConfirmProposal = () => {
    if (!pendingProposal) return;
    const p = { ...pendingProposal };
    createNewQuestFromProposal(p);
    speechToMissionEngine.clearProposal();
    setPendingProposal(null);

    const reply: ConversationTurn = {
      sender: 'assistant',
      text: `Mission "${p.title}" confirmed and added to your Quest Hub!`,
      timestamp: Date.now(),
      actionRequired: 'none'
    };
    setHistory([...speechToMissionEngine.getHistory(), reply]);
    speakReply(reply.text);
  };

  const handleDiscardProposal = () => {
    speechToMissionEngine.clearProposal();
    setPendingProposal(null);
    const reply: ConversationTurn = {
      sender: 'assistant',
      text: 'Proposal discarded. What else are we focusing on today?',
      timestamp: Date.now(),
      actionRequired: 'none'
    };
    setHistory([...speechToMissionEngine.getHistory(), reply]);
    speakReply(reply.text);
  };

  const currentPersona = VOICE_PERSONAS[persona];

  return (
    <div className="voice-companion-view-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '16px' }}>
      {/* Top Protocol Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="hud-tag" style={{ borderColor: '#00f0ff', color: '#00f0ff' }}>
            ● DEDICATED AI VOICE COMPANION [SILENT BY DEFAULT]
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '4px 0 0 0', color: '#fff', fontSize: '1.4rem' }}>
            CONVERSATIONAL VOICE & MISSION PROTOCOL
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#7f9ebc' }}>
            Speak naturally in English or Hinglish to declare goals, check mission counts, and convert intentions into verified quests.
          </span>
        </div>

        {/* Start / End Conversation Master Trigger */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!conversationActive ? (
            <button
              onClick={handleStartConversation}
              className="hud-btn-primary"
              style={{
                padding: '10px 18px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
              }}
            >
              <span>🎙️</span>
              <span>START CONVERSATION</span>
            </button>
          ) : (
            <button
              onClick={handleEndConversation}
              style={{
                padding: '10px 18px',
                fontSize: '0.88rem',
                borderRadius: '6px',
                background: 'rgba(255, 51, 102, 0.15)',
                border: '1px solid #ff3366',
                color: '#ff3366',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>⏹️</span>
              <span>END CONVERSATION</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Conversation Hub Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }} className="companion-grid">
        {/* LEFT: Live Interactive Chat & Proposal Stage */}
        <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', height: '560px', padding: '16px', position: 'relative' }}>
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          {/* Active Status Ribbon */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 210, 255, 0.15)', paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>{currentPersona.avatar}</span>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{currentPersona.name}</strong>
                <span style={{ fontSize: '0.72rem', color: '#00d2ff' }}>{currentPersona.title}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {conversationActive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid #00f0ff', padding: '4px 10px', borderRadius: '20px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isListening ? '#00f0ff' : '#a855f7', animation: isListening ? 'pulse-glow 1s infinite alternate' : 'none' }} />
                  <span style={{ fontSize: '0.72rem', color: '#00f0ff', fontWeight: 700 }}>
                    {isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING TO YOU...' : 'CONVERSATION ACTIVE'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mic Error Notice if applicable */}
          {micError && (
            <div style={{ background: 'rgba(255, 51, 102, 0.1)', border: '1px solid #ff3366', borderRadius: '6px', padding: '8px 12px', color: '#ff6b81', fontSize: '0.76rem', marginBottom: '8px' }}>
              ⚠️ {micError}
            </div>
          )}

          {/* Chat Messages Stream */}
          <div
            ref={chatScrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px'
            }}
          >
            {history.length === 0 && !conversationActive && (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#7f9ebc', maxWidth: '340px' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🎙️</span>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Silent by Default</strong>
                <p style={{ fontSize: '0.82rem', margin: '0 0 12px 0' }}>
                  The voice assistant never speaks unexpectedly. Click <strong>Start Conversation</strong> above or type your prompt below to interact.
                </p>
                <div style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px dashed rgba(0, 210, 255, 0.25)', borderRadius: '6px', padding: '8px', fontSize: '0.74rem' }}>
                  Try saying: <em>"I'm going to study DSP for 1 hour"</em> or <em>"Aaj mujhe chest workout karna hai"</em>
                </div>
              </div>
            )}

            {history.map((turn, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: turn.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: turn.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    background: turn.sender === 'user' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(15, 23, 42, 0.95)',
                    border: turn.sender === 'user' ? '1px solid #00d2ff' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: turn.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '10px 14px',
                    color: turn.sender === 'user' ? '#00f0ff' : '#f0f7ff',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                    boxShadow: turn.sender === 'user' ? '0 0 15px rgba(0, 210, 255, 0.15)' : 'none'
                  }}
                >
                  {turn.text}
                </div>
                <span style={{ fontSize: '0.65rem', color: '#7f9ebc', marginTop: '2px', padding: '0 4px' }}>
                  {turn.sender === 'user' ? 'Hunter' : currentPersona.name} • {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Pending Intention-to-Mission Proposal Card */}
            {pendingProposal && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(0, 210, 255, 0.08))',
                  border: '1px solid #10b981',
                  borderRadius: '10px',
                  padding: '14px',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
                  margin: '8px 0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#34d399', fontSize: '0.74rem', fontWeight: 800 }}>
                    ✦ PROPOSED INTENTION MISSION (CONFIRMATION REQUIRED)
                  </span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                    +{pendingProposal.durationMinutes} MINS
                  </span>
                </div>

                <h4 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
                  {pendingProposal.title}
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#7f9ebc', marginBottom: '10px' }}>
                  Domain: <strong style={{ color: '#00f0ff' }}>{pendingProposal.category.toUpperCase()}</strong> • Target: <strong style={{ color: '#00f0ff' }}>{pendingProposal.attribute.toUpperCase()}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleConfirmProposal}
                    className="hud-btn-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: '#10b981', borderColor: '#10b981', color: '#051810' }}
                  >
                    ✓ CONFIRM & CREATE MISSION
                  </button>
                  <button
                    onClick={handleDiscardProposal}
                    style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#7f9ebc', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    DISCARD
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Interactive Text Fallback Input Bar */}
          <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={isListening ? "Listening to your voice... (or type here)" : "Type prompt (e.g. 'I want to study DSP for 1 hour')..."}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(5, 12, 26, 0.95)',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="hud-btn-primary"
              style={{ padding: '12px 18px', fontSize: '0.86rem' }}
            >
              SEND
            </button>
          </form>
        </div>

        {/* RIGHT: Voice Controls, Persona & Cadence Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Persona Card */}
          <div className="hud-card" style={{ padding: '14px' }}>
            <span style={{ fontSize: '0.72rem', color: '#00d2ff', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Companion Persona
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(['jinwoo', 'system', 'igris'] as VoicePersona[]).map(pKey => {
                const info = VOICE_PERSONAS[pKey];
                const active = persona === pKey;
                return (
                  <button
                    key={pKey}
                    onClick={() => {
                      soundEngine.playPing();
                      setPersona(pKey);
                      shadowVoice.setPersona(pKey);
                    }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      background: active ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: active ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{info.avatar}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{info.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speech & Audio Controls */}
          <div className="hud-card" style={{ padding: '14px' }}>
            <span style={{ fontSize: '0.72rem', color: '#00d2ff', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              Audio & Speech Controls
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Spoken Response Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#e0f2fe' }}>Spoken Response</span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playPing();
                    setSpokenAudioEnabled(!spokenAudioEnabled);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: spokenAudioEnabled ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: spokenAudioEnabled ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.2)',
                    color: spokenAudioEnabled ? '#00f0ff' : '#7f9ebc',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {spokenAudioEnabled ? 'AUDIO ON' : 'TEXT ONLY'}
                </button>
              </div>

              {/* Mic Mute Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#e0f2fe' }}>Microphone</span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playPing();
                    setMicMuted(!micMuted);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: !micMuted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 51, 102, 0.15)',
                    border: !micMuted ? '1px solid #10b981' : '1px solid #ff3366',
                    color: !micMuted ? '#34d399' : '#ff6b81',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {!micMuted ? '🎙️ UNMUTED' : '🔇 MUTED'}
                </button>
              </div>

              {/* Master Voice Enable Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#e0f2fe' }}>Global Companion</span>
                <button
                  type="button"
                  onClick={onToggleVoice}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: voiceEnabled ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: voiceEnabled ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.2)',
                    color: voiceEnabled ? '#00f0ff' : '#7f9ebc',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {voiceEnabled ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Vocal Examples & Directives */}
          <div className="hud-card" style={{ padding: '14px' }}>
            <span style={{ fontSize: '0.72rem', color: '#00d2ff', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Natural Phrases to Try
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                "I'm going to study DSP for 1 hour",
                "Aaj mujhe chest workout karna hai",
                "I want to solve 20 C++ problems",
                "Show me how many missions I have left",
                "What should I do next?"
              ].map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => {
                    soundEngine.playPing();
                    handleIncomingTranscript(phrase);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    fontSize: '0.74rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  💬 “{phrase}”
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
