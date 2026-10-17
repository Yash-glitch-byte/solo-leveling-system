// SYSTEM REAWAKEN — High-Fidelity Voice Assistant & Guide Engine

export type VoicePersona = 'jinwoo' | 'system' | 'igris';

export interface VoicePersonaInfo {
  id: VoicePersona;
  name: string;
  title: string;
  avatar: string;
  description: string;
  pitch: number;
  rate: number;
}

export const VOICE_PERSONAS: Record<VoicePersona, VoicePersonaInfo> = {
  jinwoo: {
    id: 'jinwoo',
    name: 'Sung Jin-woo',
    title: 'The Reawakened Monarch',
    avatar: '⚡',
    description: 'Calm, focused, and determined human hunter voice.',
    pitch: 1.0,
    rate: 0.98
  },
  system: {
    id: 'system',
    name: 'The System AI',
    title: 'Architect Guide Protocol',
    avatar: '🔮',
    description: 'Clear, smooth, futuristic holographic guide voice.',
    pitch: 1.04,
    rate: 1.0
  },
  igris: {
    id: 'igris',
    name: 'Commander Igris',
    title: 'The Bloodred Knight',
    avatar: '🛡️',
    description: 'Resonant, loyal, and authoritative commander voice.',
    pitch: 0.92,
    rate: 0.94
  }
};

export class ShadowVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  public enabled: boolean = true;
  private currentPersona: VoicePersona = 'jinwoo';
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.refreshVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.refreshVoices();
      }
    }
  }

  private refreshVoices() {
    if (!this.synth) return;
    this.cachedVoices = this.synth.getVoices();
  }

  public getPersona(): VoicePersona {
    return this.currentPersona;
  }

  public setPersona(persona: VoicePersona) {
    this.currentPersona = persona;
  }

  /**
   * Selects the highest quality natural human voice available on the host device.
   * Prioritizes Edge Neural / Google Natural / Apple Siri / Microsoft Natural voices.
   */
  private pickBestVoice(persona: VoicePersona): SpeechSynthesisVoice | null {
    if (!this.cachedVoices.length && this.synth) {
      this.cachedVoices = this.synth.getVoices();
    }
    const voices = this.cachedVoices;
    if (!voices || voices.length === 0) return null;

    // Filter for English voices
    const enVoices = voices.filter(v => v.lang.startsWith('en'));

    if (persona === 'jinwoo') {
      // Prefer clear, warm, natural young male voices
      const preferred = enVoices.find(v => 
        v.name.includes('Natural') || 
        v.name.includes('Ryan') || 
        v.name.includes('Guy') || 
        v.name.includes('Google US English') ||
        v.name.includes('David') ||
        v.name.includes('Daniel')
      );
      return preferred || enVoices[0] || voices[0];
    } else if (persona === 'system') {
      // Prefer smooth, clean, pleasant female/neutral AI voice (Google UK, Jenny, Aria, Zira)
      const preferred = enVoices.find(v =>
        v.name.includes('Natural') ||
        v.name.includes('Jenny') ||
        v.name.includes('Aria') ||
        v.name.includes('Google UK English Female') ||
        v.name.includes('Zira') ||
        v.name.includes('Google US English')
      );
      return preferred || enVoices[0] || voices[0];
    } else {
      // Igris: deeper authoritative tone
      const preferred = enVoices.find(v =>
        v.name.includes('Natural') ||
        v.name.includes('Guy') ||
        v.name.includes('Christopher') ||
        v.name.includes('Google UK English Male') ||
        v.name.includes('George') ||
        v.name.includes('Mark') ||
        v.name.includes('David')
      );
      return preferred || enVoices[0] || voices[0];
    }
  }

  public speak(text: string, onEnd?: () => void, onBoundary?: (charIndex: number) => void) {
    if (!this.enabled || !this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel(); // Stop any pending audio immediately

      const utterance = new SpeechSynthesisUtterance(text);
      const personaInfo = VOICE_PERSONAS[this.currentPersona];
      const bestVoice = this.pickBestVoice(this.currentPersona);

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.pitch = personaInfo.pitch;
      utterance.rate = personaInfo.rate;
      utterance.volume = 1.0;

      if (onBoundary) {
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            onBoundary(e.charIndex);
          }
        };
      }

      if (onEnd) {
        utterance.onend = onEnd;
      }

      utterance.onerror = (e) => {
        console.warn('[VOICE ENGINE NOTIFICATION]', e);
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[VOICE ENGINE ERROR]', err);
      if (onEnd) onEnd();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Preset Contextual Guidance Calls
  public announceDungeonEntry(dungeonName: string) {
    this.speak(`Instant Dungeon activated: ${dungeonName}. Focus is your weapon. Stay disciplined until the chamber opens.`);
  }

  public announceTaskComplete(taskName: string) {
    this.speak(`Objective verified: ${taskName}. Your attributes have ascended.`);
  }

  public announceNextDirective(nextTask: string) {
    this.speak(`Your highest priority objective right now is: ${nextTask}. Let's conquer it.`);
  }

  public announceLevelUp(newLevel: number) {
    this.speak(`Level Up! You have reached Level ${newLevel}. Allocate your stat points in the status window.`);
  }

  public announceCheatRejection() {
    this.speak(`Hold on, Hunter. You cannot forge real power in 10 seconds. Complete the focus session to claim your rewards.`);
  }

  public announceGreeting() {
    const p = VOICE_PERSONAS[this.currentPersona];
    if (this.currentPersona === 'jinwoo') {
      this.speak(`I'm with you, Hunter. Every rep, every line of code, every minute of focus makes us stronger. What is our goal today?`);
    } else if (this.currentPersona === 'system') {
      this.speak(`System Guide online. All hunter vitals and progress tracking operational. Select your directive.`);
    } else {
      this.speak(`My Lord, Igris stands ready. Command me, and we shall conquer your objectives.`);
    }
  }
}

export const shadowVoice = new ShadowVoiceEngine();
