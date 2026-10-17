// SYSTEM REAWAKEN — Shadow Army Voice Assistant Engine (Igris Voice Protocol)

export class ShadowVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  public enabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoice();
      }
    }
  }

  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer authoritative deep English male voices (Google UK Male, Microsoft David, Daniel, etc.)
    const preferred = voices.find(v => 
      (v.lang.startsWith('en')) && 
      (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Daniel') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en'));

    this.voice = preferred || voices[0] || null;
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.enabled || !this.synth) return;

    try {
      this.synth.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) utterance.voice = this.voice;
      
      // Pitch and rate tuned for a deep, knightly, dark-fantasy commander
      utterance.pitch = 0.72;
      utterance.rate = 0.94;
      utterance.volume = 1.0;

      if (onEnd) {
        utterance.onend = onEnd;
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[SHADOW VOICE NOTICE]', err);
    }
  }

  // Pre-configured Contextual Voice Directives
  public announceDungeonEntry(dungeonName: string) {
    this.speak(`Instant Dungeon activated: ${dungeonName}. Cast aside all distractions, My Lord.`);
  }

  public announceTaskComplete(taskName: string) {
    this.speak(`Objective conquered, My Lord. ${taskName} is complete.`);
  }

  public announceNextDirective(nextTask: string) {
    this.speak(`My Lord, the system advises we execute ${nextTask} next. Let us forge our strength.`);
  }

  public announceLevelUp(newLevel: number) {
    this.speak(`Your power ascends to Level ${newLevel}, My Monarch! All shadows bow before your will.`);
  }

  public announceCheatRejection() {
    this.speak(`My Lord, true strength cannot be forged in ten seconds. Endure the focus chamber to claim true victory.`);
  }

  public announceGreeting() {
    this.speak(`My Lord. Igris stands ready. What is your command?`);
  }
}

export const shadowVoice = new ShadowVoiceEngine();
