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
    description: 'Calm, focused, and fluent human hunter voice.',
    pitch: 1.0,
    rate: 1.0
  },
  system: {
    id: 'system',
    name: 'The System AI',
    title: 'Architect Guide Protocol',
    avatar: '🔮',
    description: 'Clear, smooth, futuristic holographic guide voice.',
    pitch: 1.0,
    rate: 1.0
  },
  igris: {
    id: 'igris',
    name: 'Commander Igris',
    title: 'The Bloodred Knight',
    avatar: '🛡️',
    description: 'Resonant, loyal, and fluent commander voice.',
    pitch: 0.96,
    rate: 0.98
  }
};

export class ShadowVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  public enabled: boolean = true;
  private currentPersona: VoicePersona = 'jinwoo';
  private customVoiceName: string | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('SYSTEM_VOICE_SELECTED');
        if (saved) this.customVoiceName = saved;
      } catch {}

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.refreshVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.refreshVoices();
        }
      }
    }
  }

  public refreshVoices() {
    if (!this.synth) return;
    this.cachedVoices = this.synth.getVoices();
  }

  public getPersona(): VoicePersona {
    return this.currentPersona;
  }

  public setPersona(persona: VoicePersona) {
    this.currentPersona = persona;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.cachedVoices.length && this.synth) {
      this.cachedVoices = this.synth.getVoices();
    }
    return this.cachedVoices.filter(v => v.lang.startsWith('en'));
  }

  public setCustomVoice(voiceName: string | null) {
    this.customVoiceName = voiceName;
    try {
      if (voiceName) {
        localStorage.setItem('SYSTEM_VOICE_SELECTED', voiceName);
      } else {
        localStorage.removeItem('SYSTEM_VOICE_SELECTED');
      }
    } catch {}
  }

  public getCustomVoice(): string | null {
    return this.customVoiceName;
  }

  private scoreVoice(v: SpeechSynthesisVoice, persona: VoicePersona): number {
    let score = 0;
    const name = v.name.toLowerCase();

    // Natural / Neural high-fidelity fluent models
    if (name.includes('natural') || name.includes('online')) score += 50;
    if (name.includes('neural')) score += 40;
    if (name.includes('google') || name.includes('android')) score += 35;
    if (name.includes('siri') || name.includes('apple')) score += 30;

    // Cloud / network synthesized voices often have higher human fluency
    if (!v.localService) score += 20;

    // Persona-specific preference matching
    if (persona === 'jinwoo') {
      if (name.includes('guy') || name.includes('ryan') || name.includes('david') || name.includes('male') || name.includes('christopher')) {
        score += 25;
      }
    } else if (persona === 'system') {
      if (name.includes('aria') || name.includes('jenny') || name.includes('female') || name.includes('zira') || name.includes('google us')) {
        score += 25;
      }
    } else if (persona === 'igris') {
      if (name.includes('george') || name.includes('guy') || name.includes('male') || name.includes('mark') || name.includes('david')) {
        score += 25;
      }
    }

    return score;
  }

  /**
   * Selects the highest quality natural human voice available on the host device.
   * Prioritizes Edge Neural / Google Natural / Apple Siri / Microsoft Natural voices.
   */
  public pickBestVoice(persona: VoicePersona): SpeechSynthesisVoice | null {
    if (!this.cachedVoices.length && this.synth) {
      this.cachedVoices = this.synth.getVoices();
    }
    const voices = this.cachedVoices;
    if (!voices || voices.length === 0) return null;

    // If user explicitly picked a custom voice, honor it
    if (this.customVoiceName) {
      const custom = voices.find(v => v.name === this.customVoiceName);
      if (custom) return custom;
    }

    // Filter for English voices
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    const sorted = [...pool].sort((a, b) => this.scoreVoice(b, persona) - this.scoreVoice(a, persona));
    return sorted[0] || voices[0];
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
