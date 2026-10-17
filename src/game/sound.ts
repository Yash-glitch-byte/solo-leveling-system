// SYSTEM REAWAKEN - Web Audio Procedural Synthesizer
// 100% Client-Side, Zero External Audio Files, High Performance

class SystemSoundEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSubOsc: OscillatorNode | null = null;
  public enabled: boolean = true;
  public musicEnabled: boolean = false;
  public masterVolume: number = 0.7;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // --- Sound Effects ---

  public playPing(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

      gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (_) {}
  }

  public playQuestComplete(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25 * this.masterVolume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (_) {}
  }

  public playLevelUp(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Deep sub-bass resonance
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(65, now);
      sub.frequency.exponentialRampToValueAtTime(130, now + 0.6);
      subGain.gain.setValueAtTime(0.4 * this.masterVolume, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 1.3);

      // Heroic triumphant fanfare chord
      const chords = [
        [261.63, 329.63, 392.00], // C4 major
        [329.63, 415.30, 493.88], // E4
        [392.00, 493.88, 587.33], // G4
        [523.25, 659.25, 783.99, 1046.50] // C5 glorious
      ];

      chords.forEach((chord, chordIdx) => {
        const tStart = now + chordIdx * 0.16;
        chord.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, tStart);

          gain.gain.setValueAtTime(0.18 * this.masterVolume, tStart);
          gain.gain.exponentialRampToValueAtTime(0.001, tStart + (chordIdx === 3 ? 0.8 : 0.25));

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(tStart);
          osc.stop(tStart + (chordIdx === 3 ? 0.85 : 0.28));
        });
      });
    } catch (_) {}
  }

  public playDungeonEnter(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Low portal hum & sweep
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(55, now + 0.8);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.8);

      gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch (_) {}
  }

  public playDungeonClear(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.55);
      });
    } catch (_) {}
  }

  public playBossHit(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

      gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_) {}
  }

  public playBossDefeat(): void {
    if (!this.enabled) return;
    this.playLevelUp();
  }

  public playAchievement(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Sparkle ping
      [1046.5, 1318.5, 1567.98, 2093.0].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (_) {}
  }

  // --- Procedural Focus Ambience (432Hz Alpha Waves) ---

  public startAmbientFocus(): void {
    if (!this.musicEnabled) return;
    if (this.ambientOsc) return; // already active

    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.ambientOsc = ctx.createOscillator();
      this.ambientSubOsc = ctx.createOscillator();
      this.ambientGain = ctx.createGain();

      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(216, now); // Alpha overtone harmonic
      this.ambientSubOsc.type = 'sine';
      this.ambientSubOsc.frequency.setValueAtTime(54, now); // Sub-bass foundation

      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.08 * this.masterVolume, now + 3.0);

      this.ambientOsc.connect(this.ambientGain);
      this.ambientSubOsc.connect(this.ambientGain);
      this.ambientGain.connect(ctx.destination);

      this.ambientOsc.start(now);
      this.ambientSubOsc.start(now);
    } catch (_) {}
  }

  public stopAmbientFocus(): void {
    if (!this.ctx || !this.ambientGain) return;
    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1.5);
      setTimeout(() => {
        if (this.ambientOsc) {
          this.ambientOsc.stop();
          this.ambientOsc.disconnect();
          this.ambientOsc = null;
        }
        if (this.ambientSubOsc) {
          this.ambientSubOsc.stop();
          this.ambientSubOsc.disconnect();
          this.ambientSubOsc = null;
        }
      }, 1600);
    } catch (_) {}
  }
}

export const soundEngine = new SystemSoundEngine();
