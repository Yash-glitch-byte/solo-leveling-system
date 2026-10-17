import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, Quest, QuestCategory, QuestDifficulty } from '../../types';
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
  // Swipeable Chapter Pager State: 1 = Dialogue Chamber, 2 = Companions & Voices, 3 = Directives & Lore
  const [activeChapter, setActiveChapter] = useState<1 | 2 | 3>(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Conversational & Audio State
  const [conversationActive, setConversationActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [spokenAudioEnabled, setSpokenAudioEnabled] = useState<boolean>(true);
  const [listenMode, setListenMode] = useState<'tap_to_speak' | 'continuous'>('tap_to_speak');
  const [textInput, setTextInput] = useState<string>('');
  const [persona, setPersona] = useState<VoicePersona>(() => shadowVoice.getPersona());
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [history, setHistory] = useState<ConversationTurn[]>(() => speechToMissionEngine.getHistory());
  const [pendingProposal, setPendingProposal] = useState<ParsedMissionProposal | null>(() => speechToMissionEngine.getPendingProposal());
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);

  // Available System & Natural Voices
  const [deviceVoices, setDeviceVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => shadowVoice.getCustomVoice() || '');
  const [auditioningVoice, setAuditioningVoice] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Refresh and sort device voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const all = shadowVoice.getAvailableVoices();
      setDeviceVoices(all);
      if (!selectedVoiceName) {
        const best = shadowVoice.pickBestVoice(persona);
        if (best) setSelectedVoiceName(best.name);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [persona]);

  // Auto-scroll chat history on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [history, isListening, isSpeaking, pendingProposal]);

  // Touch swipe gesture handlers (swiping chapters like a manga/grimoire)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    // Minimum swipe threshold 50px
    if (diff < -50) {
      // Swiped Left -> Next Chapter
      nextChapter();
    } else if (diff > 50) {
      // Swiped Right -> Prev Chapter
      prevChapter();
    }
    setTouchStartX(null);
  };

  const nextChapter = () => {
    soundEngine.playPing();
    setActiveChapter(curr => (curr < 3 ? ((curr + 1) as 1 | 2 | 3) : 1));
  };

  const prevChapter = () => {
    soundEngine.playPing();
    setActiveChapter(curr => (curr > 1 ? ((curr - 1) as 1 | 2 | 3) : 3));
  };

  // Keyboard left/right arrow paging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') nextChapter();
      if (e.key === 'ArrowLeft') prevChapter();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clean Microphone Speech Recognition Handling (No repetitive notification spam)
  const startListening = () => {
    if (micMuted) return;

    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicStatusMsg('Microphone not supported by this browser. Type in the input bar below.');
      return;
    }

    // Stop existing instance before starting anew
    stopListening();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = listenMode === 'continuous';
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicStatusMsg(null);
      };

      recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript;
        if (transcript && transcript.trim().length > 0) {
          // If in tap-to-speak mode, stop listening immediately to avoid repeated OS mic notifications
          if (listenMode === 'tap_to_speak') {
            stopListening();
          }
          handleIncomingTranscript(transcript.trim());
        }
      };

      recognition.onerror = (e: any) => {
        // Normal silence timeout should not spam errors
        if (e.error !== 'no-speech') {
          console.log('[MIC STATUS]', e.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Only restart in continuous mode if conversation is still active AND assistant is not speaking
        if (listenMode === 'continuous' && conversationActive && !micMuted && !isSpeaking) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.warn('[MIC ERROR]', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Start & End Conversation
  const handleStartConversation = () => {
    soundEngine.playLevelUp();
    setConversationActive(true);
    setMicStatusMsg(null);

    const greetingText =
      persona === 'jinwoo'
        ? "I'm listening, Hunter. What mission are we conquering today?"
        : persona === 'system'
        ? "System Guide online. All hunter telemetry synchronized. Ready for your command."
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
      speakReply("Conversation active. Ready for your directive, Hunter.");
    }

    if (listenMode === 'continuous') {
      startListening();
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

    // Pause mic while assistant speaks to prevent feedback and echo restarts
    stopListening();
    setIsSpeaking(true);

    shadowVoice.speak(text, () => {
      setIsSpeaking(false);
      // If continuous mode is on, resume listening cleanly after speech completes
      if (conversationActive && listenMode === 'continuous' && !micMuted) {
        startListening();
      }
    });
  };

  const handleIncomingTranscript = (rawText: string) => {
    const turn = speechToMissionEngine.processUserInput(rawText, quests, player.level);
    setHistory([...speechToMissionEngine.getHistory()]);
    setPendingProposal(speechToMissionEngine.getPendingProposal());

    // If confirmed mission, automatically register in quest hub!
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
      id: `quest-${Date.now()}`,
      title: proposal.title,
      description: `Conversational directive registered via Voice Companion.`,
      category: proposal.category,
      difficulty: proposal.difficulty,
      durationMinutes: proposal.durationMinutes,
      attribute: proposal.attribute,
      xpReward: proposal.difficulty === 'hard' ? 120 : proposal.difficulty === 'epic' ? 250 : 60,
      attributePoints: proposal.difficulty === 'epic' ? 4 : proposal.difficulty === 'hard' ? 3 : 2,
      subtasks: proposal.subtasks,
      status: 'available',
      isDaily: true,
      verificationStatus: 'supported'
    };

    onAddQuest(newQuest);
    setPendingProposal(null);
  };

  const handleConfirmProposal = () => {
    if (pendingProposal) {
      createNewQuestFromProposal(pendingProposal);
      const confirmMsg = `Directive "${pendingProposal.title}" confirmed and assigned in your Quest Hub!`;
      const turn: ConversationTurn = {
        sender: 'assistant',
        text: confirmMsg,
        timestamp: Date.now()
      };
      setHistory(prev => [...prev, turn]);
      speakReply(confirmMsg);
    }
  };

  const handleDiscardProposal = () => {
    soundEngine.playPing();
    speechToMissionEngine.clearProposal();
    setPendingProposal(null);
    const discardMsg = 'Mission proposal discarded. What else shall we tackle?';
    setHistory(prev => [...prev, { sender: 'assistant', text: discardMsg, timestamp: Date.now() }]);
    speakReply(discardMsg);
  };

  const handleAuditionVoice = (voiceName: string) => {
    soundEngine.playPing();
    setAuditioningVoice(voiceName);
    shadowVoice.testVoice(voiceName, () => {
      setAuditioningVoice(null);
    });
  };

  const currentPersona = VOICE_PERSONAS[persona];
  const naturalVoices = deviceVoices.filter(v => shadowVoice.isNaturalVoice(v));
  const standardVoices = deviceVoices.filter(v => !shadowVoice.isNaturalVoice(v));

  return (
    <div
      className="voice-companion-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100%',
        maxWidth: '1240px',
        margin: '0 auto',
        paddingBottom: '80px',
        userSelect: 'none'
      }}
    >
      {/* CHAPTER SWIPER PAGER HEADER */}
      <div
        className="hud-card chapter-navigator-card"
        style={{
          padding: '12px 18px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(10, 20, 38, 0.95), rgba(5, 12, 26, 0.98))',
          border: '1px solid #00d2ff',
          boxShadow: '0 0 20px rgba(0, 210, 255, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Prev Chapter Arrow */}
          <button
            onClick={prevChapter}
            className="hud-btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Swipe or click to view previous chapter (← Left Arrow)"
          >
            <span>◀</span>
            <span className="hide-mobile">PREV CHAPTER</span>
          </button>

          {/* Chapter Title Badge & Swipe Dots */}
          <div style={{ textAlign: 'center' }}>
            <span className="hud-tag" style={{ fontSize: '0.68rem', letterSpacing: '1.2px' }}>
              [HUNTER COMPANION GRIMOIRE • CHAPTER {activeChapter} OF 3]
            </span>
            <h3 style={{ margin: '2px 0 6px 0', fontSize: '1.15rem', color: '#fff', fontFamily: 'var(--font-display)' }}>
              {activeChapter === 1 && '💬 CHAPTER 1: CONVERSATION CHAMBER'}
              {activeChapter === 2 && '👥 CHAPTER 2: COMPANION PERSONAS & HUMAN VOICES'}
              {activeChapter === 3 && '📜 CHAPTER 3: DIRECTIVES, DEDICATION & LORE'}
            </h3>
            {/* Chapter Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3].map(ch => (
                <button
                  key={ch}
                  onClick={() => {
                    soundEngine.playPing();
                    setActiveChapter(ch as 1 | 2 | 3);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: activeChapter === ch ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: activeChapter === ch ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: activeChapter === ch ? '#00f0ff' : '#7f9ebc',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {ch === 1 && '1. Dialog'}
                  {ch === 2 && '2. Voices'}
                  {ch === 3 && '3. Directives'}
                </button>
              ))}
            </div>
          </div>

          {/* Next Chapter Arrow */}
          <button
            onClick={nextChapter}
            className="hud-btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Swipe or click to view next chapter (→ Right Arrow)"
          >
            <span className="hide-mobile">NEXT CHAPTER</span>
            <span>▶</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.72rem', color: '#7f9ebc' }}>
          ✦ Swipe left or right anywhere on screen to flip chapters like a page in a grimoire ✦
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHAPTER 1: CONVERSATION CHAMBER                           */}
      {/* ========================================================= */}
      {activeChapter === 1 && (
        <div className="chapter-slide-enter">
          <div className="hud-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '600px', position: 'relative' }}>
            <div className="card-corner tl" />
            <div className="card-corner tr" />
            <div className="card-corner bl" />
            <div className="card-corner br" />

            {/* Conversation Status Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 210, 255, 0.15)', paddingBottom: '10px', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>{currentPersona.avatar}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#fff', fontSize: '0.98rem' }}>{currentPersona.name}</strong>
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(0, 240, 255, 0.15)', color: '#00d2ff', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
                      {currentPersona.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#7f9ebc' }}>
                    Voice: <strong style={{ color: '#38bdf8' }}>{selectedVoiceName ? selectedVoiceName.split('-')[0].trim() : 'Natural Human Audio'}</strong>
                  </span>
                </div>
              </div>

              {/* Controls Group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {conversationActive ? (
                  <button
                    onClick={handleEndConversation}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.78rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 51, 102, 0.15)',
                      border: '1px solid #ff3366',
                      color: '#ff3366',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⏹️ END CONVERSATION
                  </button>
                ) : (
                  <button
                    onClick={handleStartConversation}
                    className="hud-btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', boxShadow: '0 0 15px rgba(0, 240, 255, 0.35)' }}
                  >
                    🎙️ START CONVERSATION
                  </button>
                )}

                <button
                  onClick={() => {
                    soundEngine.playPing();
                    setActiveChapter(2);
                  }}
                  className="hud-btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.78rem' }}
                  title="Switch to Chapter 2 to choose personas and voices"
                >
                  ⚙️ VOICES
                </button>
              </div>
            </div>

            {/* Mic Status Banner if applicable */}
            {micStatusMsg && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '6px', padding: '6px 12px', color: '#fbbf24', fontSize: '0.74rem', marginBottom: '8px' }}>
                ℹ️ {micStatusMsg}
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
                <div style={{ margin: 'auto', textAlign: 'center', color: '#7f9ebc', maxWidth: '380px', padding: '20px' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>🎙️</span>
                  <strong style={{ color: '#fff', fontSize: '1.05rem', display: 'block', marginBottom: '6px' }}>
                    Silent by Default
                  </strong>
                  <p style={{ fontSize: '0.84rem', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    The assistant will never speak unexpectedly. Tap <strong>Start Conversation</strong> or use <strong>Tap-to-Speak</strong> below to converse naturally in English or Hinglish.
                  </p>
                  <div style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px dashed rgba(0, 210, 255, 0.25)', borderRadius: '8px', padding: '10px', fontSize: '0.76rem', color: '#94a3b8' }}>
                    Try saying: <br />
                    <span style={{ color: '#38bdf8' }}>"I am going to study DSP for 1 hour"</span><br />
                    <span style={{ color: '#34d399' }}>"Aaj mujhe chest workout karna hai"</span>
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
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(0, 210, 255, 0.09))',
                    border: '1px solid #10b981',
                    borderRadius: '10px',
                    padding: '14px',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
                    margin: '8px 0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#34d399', fontSize: '0.74rem', fontWeight: 800 }}>
                      ✦ PROPOSED MISSION (CONFIRMATION REQUIRED)
                    </span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                      +{pendingProposal.durationMinutes} MINS
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
                    {pendingProposal.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: '#7f9ebc', marginBottom: '10px' }}>
                    Domain: <strong style={{ color: '#00f0ff' }}>{pendingProposal.category.toUpperCase()}</strong> • Affinity: <strong style={{ color: '#00f0ff' }}>{pendingProposal.attribute.toUpperCase()}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleConfirmProposal}
                      className="hud-btn-primary"
                      style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: '#10b981', borderColor: '#10b981', color: '#051810' }}
                    >
                      ✓ CONFIRM & ASSIGN QUEST
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

            {/* Quick Prompt Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              {[
                "Study DSP for 1 hour",
                "Aaj mujhe chest workout karna hai",
                "Solve 10 C++ problems",
                "What should I do next?",
                "How many missions left?"
              ].map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    soundEngine.playPing();
                    handleIncomingTranscript(chip);
                  }}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'rgba(0, 210, 255, 0.08)',
                    border: '1px solid rgba(0, 210, 255, 0.2)',
                    color: '#7dd3fc',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Audio Interaction Dock: Tap-To-Speak & Text Bar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
              {/* Tap to Speak Tactile Button */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPing();
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  background: isListening ? 'linear-gradient(135deg, #ff0055, #ff3366)' : 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 150, 255, 0.2))',
                  border: isListening ? '1px solid #ff3366' : '1px solid #00f0ff',
                  color: isListening ? '#fff' : '#00f0ff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isListening ? '0 0 20px rgba(255, 51, 102, 0.6)' : '0 0 10px rgba(0, 240, 255, 0.2)',
                  animation: isListening ? 'pulse 1s infinite alternate' : 'none',
                  flexShrink: 0
                }}
                title="Tap to speak your intention in English or Hinglish"
              >
                <span>{isListening ? '🔴' : '🎙️'}</span>
                <span>{isListening ? 'LISTENING...' : 'TAP TO SPEAK'}</span>
              </button>

              {/* Text Fallback Input Bar */}
              <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Or type intention in English / Hinglish..."
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(5, 12, 26, 0.95)',
                    border: '1px solid rgba(0, 210, 255, 0.3)',
                    color: '#fff',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="hud-btn-primary"
                  style={{ padding: '12px 18px', fontSize: '0.84rem' }}
                >
                  SEND
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CHAPTER 2: COMPANION PERSONAS & HUMAN VOICES              */}
      {/* ========================================================= */}
      {activeChapter === 2 && (
        <div className="chapter-slide-enter">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Personas Showcase */}
            <div className="hud-card" style={{ padding: '20px' }}>
              <div className="card-corner tl" />
              <div className="card-corner tr" />
              <div className="card-corner bl" />
              <div className="card-corner br" />

              <span className="hud-tag" style={{ color: '#00d2ff', borderColor: '#00d2ff', display: 'block', marginBottom: '8px' }}>
                [COMPANION ARCHETYPES]
              </span>
              <h3 style={{ margin: '0 0 14px 0', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                CHOOSE YOUR SYSTEM GUIDE
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(['jinwoo', 'system', 'igris'] as VoicePersona[]).map(pKey => {
                  const pInfo = VOICE_PERSONAS[pKey];
                  const isSelected = persona === pKey;
                  return (
                    <div
                      key={pKey}
                      onClick={() => {
                        soundEngine.playLevelUp();
                        setPersona(pKey);
                        shadowVoice.setPersona(pKey);
                      }}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: isSelected ? '0 0 20px rgba(0, 240, 255, 0.25)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                    >
                      <span style={{ fontSize: '2.4rem' }}>{pInfo.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: '#fff', fontSize: '1rem' }}>{pInfo.name}</strong>
                          {isSelected && (
                            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: '#00f0ff', color: '#051226', fontWeight: 800 }}>
                              SELECTED
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#00d2ff', display: 'block', margin: '2px 0 4px 0' }}>
                          {pInfo.title}
                        </span>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#7f9ebc', lineHeight: '1.4' }}>
                          {pInfo.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Human Voice Model & Cadence Settings */}
            <div className="hud-card" style={{ padding: '20px' }}>
              <div className="card-corner tl" />
              <div className="card-corner tr" />
              <div className="card-corner bl" />
              <div className="card-corner br" />

              <span className="hud-tag" style={{ color: '#10b981', borderColor: '#10b981', display: 'block', marginBottom: '8px' }}>
                [NEURAL AUDIO SYNTHESIZER]
              </span>
              <h3 style={{ margin: '0 0 14px 0', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                FLUENT HUMAN VOICE TUNING
              </h3>

              {/* Natural Human Voice Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#e2f1ff', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                  Select Voice Model (Natural / Neural Voices Pinned First):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={selectedVoiceName}
                    onChange={e => {
                      const vName = e.target.value;
                      setSelectedVoiceName(vName);
                      shadowVoice.setCustomVoice(vName || null);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'rgba(5, 12, 26, 0.95)',
                      border: '1px solid rgba(0, 210, 255, 0.4)',
                      color: '#fff',
                      fontSize: '0.84rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">✦ System Auto-Pick (Highest Fidelity Human Voice)</option>
                    {naturalVoices.length > 0 && (
                      <optgroup label="🌟 RECOMMENDED NATURAL HUMAN VOICES">
                        {naturalVoices.map(v => (
                          <option key={v.name} value={v.name}>
                            🌟 {v.name} ({v.lang})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {standardVoices.length > 0 && (
                      <optgroup label="🌐 DEVICE SYSTEM VOICES">
                        {standardVoices.map(v => (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleAuditionVoice(selectedVoiceName)}
                    className="hud-btn-primary"
                    disabled={!!auditioningVoice}
                    style={{ padding: '10px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    title="Play audio sample with fluent human cadence"
                  >
                    {auditioningVoice ? '🔊 PLAYING...' : '▶ AUDITION'}
                  </button>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                  Natural Neural voices feature human breathing and realistic prosody.
                </span>
              </div>

              {/* Speaking Cadence / Rate Slider */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#e2f1ff', fontSize: '0.84rem', fontWeight: 700 }}>Speaking Speed:</span>
                  <span style={{ color: '#00f0ff', fontSize: '0.84rem', fontWeight: 700 }}>{speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={speechRate}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setSpeechRate(val);
                    VOICE_PERSONAS[persona].rate = val;
                  }}
                  style={{ width: '100%', accentColor: '#00f0ff' }}
                />
              </div>

              {/* Pitch Slider */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#e2f1ff', fontSize: '0.84rem', fontWeight: 700 }}>Vocal Resonance (Pitch):</span>
                  <span style={{ color: '#00f0ff', fontSize: '0.84rem', fontWeight: 700 }}>{speechPitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={speechPitch}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setSpeechPitch(val);
                    VOICE_PERSONAS[persona].pitch = val;
                  }}
                  style={{ width: '100%', accentColor: '#00f0ff' }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.82rem', color: '#fff', fontWeight: 700 }}>Spoken Voice Output</span>
                    <span style={{ fontSize: '0.72rem', color: '#7f9ebc' }}>Play companion audio aloud</span>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playPing();
                      setSpokenAudioEnabled(curr => !curr);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: spokenAudioEnabled ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: spokenAudioEnabled ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.2)',
                      color: spokenAudioEnabled ? '#00f0ff' : '#7f9ebc',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {spokenAudioEnabled ? 'AUDIO ON' : 'MUTED (TEXT ONLY)'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.82rem', color: '#fff', fontWeight: 700 }}>Listen Mode</span>
                    <span style={{ fontSize: '0.72rem', color: '#7f9ebc' }}>Tap-to-Speak avoids repeated mic notifications</span>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playPing();
                      setListenMode(curr => curr === 'tap_to_speak' ? 'continuous' : 'tap_to_speak');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: listenMode === 'tap_to_speak' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                      border: listenMode === 'tap_to_speak' ? '1px solid #10b981' : '1px solid #a855f7',
                      color: listenMode === 'tap_to_speak' ? '#34d399' : '#c084fc',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {listenMode === 'tap_to_speak' ? '🎙️ TAP TO SPEAK (CLEAN)' : '♾️ CONTINUOUS'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CHAPTER 3: DIRECTIVES, DEDICATION & SYSTEM LORE           */}
      {/* ========================================================= */}
      {activeChapter === 3 && (
        <div className="chapter-slide-enter">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Quick Dedication Directives */}
            <div className="hud-card" style={{ padding: '20px' }}>
              <div className="card-corner tl" />
              <div className="card-corner tr" />
              <div className="card-corner bl" />
              <div className="card-corner br" />

              <span className="hud-tag" style={{ color: '#ffd700', borderColor: '#ffd700', display: 'block', marginBottom: '8px' }}>
                [DIRECTIVES & DEDICATION PROTOCOL]
              </span>
              <h3 style={{ margin: '0 0 14px 0', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                DECLARE TODAY'S FOCUS AREA
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { id: 'fitness', title: 'FITNESS WARRIOR', desc: 'Push-ups, squats, core resistance', icon: '🏋️', mins: 45, prompt: 'Aaj mujhe chest workout karna hai' },
                  { id: 'coding', title: 'SYSTEMS & CODE', desc: 'Algorithms, projects, clean code', icon: '💻', mins: 60, prompt: 'I want to solve 10 coding problems' },
                  { id: 'study', title: 'DSP & DEEP STUDY', desc: 'Signal processing, revisions', icon: '📖', mins: 60, prompt: 'I am going to study DSP for 1 hour' },
                  { id: 'discipline', title: 'ROUTINE DISCIPLINE', desc: 'Hydration, meditation, habits', icon: '🧘', mins: 30, prompt: 'Create a mission for daily discipline' }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      soundEngine.playLevelUp();
                      handleIncomingTranscript(item.prompt);
                      setActiveChapter(1);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                    <strong style={{ color: '#fff', fontSize: '0.84rem' }}>{item.title}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#7f9ebc' }}>{item.desc}</span>
                    <span style={{ marginTop: 'auto', fontSize: '0.68rem', color: '#00f0ff', fontWeight: 700 }}>
                      +{item.mins} MINS • TAP TO ACTIVATE ➜
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Solo Leveling Mechanics & Explainer */}
            <div className="hud-card" style={{ padding: '20px' }}>
              <div className="card-corner tl" />
              <div className="card-corner tr" />
              <div className="card-corner bl" />
              <div className="card-corner br" />

              <span className="hud-tag" style={{ color: '#c084fc', borderColor: '#c084fc', display: 'block', marginBottom: '8px' }}>
                [SOLO LEVELING GAME MECHANICS]
              </span>
              <h3 style={{ margin: '0 0 14px 0', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                THE SYSTEM REAWAKEN RULES
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.15)', borderRadius: '6px', padding: '10px' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '0.84rem', display: 'block', marginBottom: '2px' }}>
                    💍 THE E-RING ORIGIN RELIC
                  </strong>
                  <span style={{ color: '#e2f1ff', fontSize: '0.76rem', lineHeight: '1.4' }}>
                    Equipped on your hunter finger. Grants +2 Vitality, +2 Focus, and -15% fatigue burnout protection.
                  </span>
                </div>

                <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '6px', padding: '10px' }}>
                  <strong style={{ color: '#c084fc', fontSize: '0.84rem', display: 'block', marginBottom: '2px' }}>
                    👑 PSEUDO MONARCH & ARISE (LEVEL 5)
                  </strong>
                  <span style={{ color: '#e2f1ff', fontSize: '0.76rem', lineHeight: '1.4' }}>
                    Awakens at Level 5. Unlocks extraction of Commander Igris and permanent +15% XP Ruler's Authority.
                  </span>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '6px', padding: '10px' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.84rem', display: 'block', marginBottom: '2px' }}>
                    🗝️ 2-GATE INSTANT DUNGEON QUOTA
                  </strong>
                  <span style={{ color: '#e2f1ff', fontSize: '0.76rem', lineHeight: '1.4' }}>
                    Complete 2 deep-focus dungeon chambers each day to claim the Sovereign Mystery Crate bonus.
                  </span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px' }}>
                  <strong style={{ color: '#ffd700', fontSize: '0.84rem', display: 'block', marginBottom: '2px' }}>
                    🛡️ TIERED VERIFICATION & ANTI-LOOPHOLE
                  </strong>
                  <span style={{ color: '#e2f1ff', fontSize: '0.76rem', lineHeight: '1.4' }}>
                    Self-reported claims give 30% points. Quizzes & code repos grant 70%. Sensor-verified grant 100%.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
