// Procedural Web Audio API sound system (Zero external 404 dependencies)

const AUDIO_STORAGE_KEY = 'lunabase_audio_settings';

interface AudioPreferences {
  masterVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  sfxEnabled: boolean;
  sfxVolume: number;
  ambientEnabled: boolean;
  ambientVolume: number;
}

class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterVolume: number = 0.75;
  private musicEnabled: boolean = true;
  private musicVolume: number = 0.6;
  private sfxEnabled: boolean = true;
  private sfxVolume: number = 0.8;
  private ambientEnabled: boolean = true;
  private ambientVolume: number = 0.55;

  // Ambient habitat hum nodes
  private ambientGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;

  // Soft space music pad nodes
  private musicGain: GainNode | null = null;
  private musicOsc1: OscillatorNode | null = null;
  private musicOsc2: OscillatorNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;

  private isAmbienceRunning: boolean = false;

  constructor() {
    this.loadPreferences();
  }

  private loadPreferences() {
    try {
      const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (!raw) return;
      const parsed: Partial<AudioPreferences> = JSON.parse(raw);
      if (typeof parsed.masterVolume === 'number') this.masterVolume = this.clamp(parsed.masterVolume);
      if (typeof parsed.musicEnabled === 'boolean') this.musicEnabled = parsed.musicEnabled;
      if (typeof parsed.musicVolume === 'number') this.musicVolume = this.clamp(parsed.musicVolume);
      if (typeof parsed.sfxEnabled === 'boolean') this.sfxEnabled = parsed.sfxEnabled;
      if (typeof parsed.sfxVolume === 'number') this.sfxVolume = this.clamp(parsed.sfxVolume);
      if (typeof parsed.ambientEnabled === 'boolean') this.ambientEnabled = parsed.ambientEnabled;
      if (typeof parsed.ambientVolume === 'number') this.ambientVolume = this.clamp(parsed.ambientVolume);
    } catch {
      // Ignore storage errors
    }
  }

  private savePreferences() {
    try {
      const prefs: AudioPreferences = {
        masterVolume: this.masterVolume,
        musicEnabled: this.musicEnabled,
        musicVolume: this.musicVolume,
        sfxEnabled: this.sfxEnabled,
        sfxVolume: this.sfxVolume,
        ambientEnabled: this.ambientEnabled,
        ambientVolume: this.ambientVolume,
      };
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage errors
    }
  }

  private clamp(v: number): number {
    return Math.max(0, Math.min(1, v));
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private getEffectiveSfxGain(): number {
    if (!this.sfxEnabled) return 0;
    return this.masterVolume * this.sfxVolume;
  }

  private updateBackgroundGains() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.ambientGain) {
      const targetAmb = this.ambientEnabled ? this.masterVolume * this.ambientVolume * 0.11 : 0;
      this.ambientGain.gain.setTargetAtTime(targetAmb, now, 0.08);
    }
    if (this.musicGain) {
      const targetMus = this.musicEnabled ? this.masterVolume * this.musicVolume * 0.08 : 0;
      this.musicGain.gain.setTargetAtTime(targetMus, now, 0.08);
    }
  }

  // Master Volume
  public setVolume(vol: number) {
    this.masterVolume = this.clamp(vol);
    this.updateBackgroundGains();
    this.savePreferences();
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  // Background Music
  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled && !this.isAmbienceRunning) {
      this.startAmbience();
    } else {
      this.updateBackgroundGains();
    }
    this.savePreferences();
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = this.clamp(vol);
    this.updateBackgroundGains();
    this.savePreferences();
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  // Sound Effects
  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    this.savePreferences();
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = this.clamp(vol);
    this.savePreferences();
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  // Ambient Audio
  public setAmbientEnabled(enabled: boolean) {
    this.ambientEnabled = enabled;
    if (enabled && !this.isAmbienceRunning) {
      this.startAmbience();
    } else {
      this.updateBackgroundGains();
    }
    this.savePreferences();
  }

  public isAmbientEnabled(): boolean {
    return this.ambientEnabled;
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = this.clamp(vol);
    this.updateBackgroundGains();
    this.savePreferences();
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  // UI Button Click
  public playClick() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(sfx * 0.22, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.045);
  }

  // Astronaut Footstep on Moon Soil
  public playFootstep() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320 + Math.random() * 60, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(sfx * 0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Equipment Interaction / Airlock hiss
  public playAirlock() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const duration = 0.6;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(sfx * 0.28, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Rocket Thrusters landing / launch
  public playThruster() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const duration = 2.2;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(450, this.ctx.currentTime + 0.8);
    filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(sfx * 0.42, this.ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Warning Siren for Space Weather / Oxygen fault
  public playWarning() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.25);
    osc.frequency.linearRampToValueAtTime(440, now + 0.5);
    osc.frequency.linearRampToValueAtTime(880, now + 0.75);
    osc.frequency.linearRampToValueAtTime(440, now + 1.0);

    gain.gain.setValueAtTime(sfx * 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 1.1);
  }

  // Objective Success Chime
  public playSuccess() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.09);

      gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.09);
      gain.gain.linearRampToValueAtTime(sfx * 0.2, this.ctx!.currentTime + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.09);
      osc.stop(this.ctx!.currentTime + idx * 0.09 + 0.4);
    });
  }

  // Water Bubbling / Filtration sound
  public playWaterFlow() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const startT = this.ctx.currentTime + i * 0.12;
      const freq = 400 + Math.random() * 300;
      osc.frequency.setValueAtTime(freq, startT);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startT + 0.1);

      gain.gain.setValueAtTime(sfx * 0.15, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.13);
    }
  }

  // Solar Dust Squeegee / Laser Wipe
  public playLaserWipe() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.18);

    gain.gain.setValueAtTime(sfx * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.22);
  }

  // Cosmic Radio Beacon Ping / Frequency Lock
  public playPing() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(1174.66, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.35);

    gain.gain.setValueAtTime(sfx * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.45);
  }

  // Urgent Low Oxygen Warning Beep (< 15%)
  public playLowOxygenBeep() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.14].forEach((delay) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.51, now + delay);
      gain.gain.setValueAtTime(sfx * 0.28, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });
  }

  // Harvest Fanfare / Stage Complete
  public playHarvestFanfare() {
    const sfx = this.getEffectiveSfxGain();
    if (sfx <= 0.001) return;
    this.initContext();
    if (!this.ctx) return;

    const arpeggio = [440, 554.37, 659.25, 880, 1108.73];
    arpeggio.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      const start = this.ctx!.currentTime + i * 0.1;
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(sfx * 0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(start);
      osc.stop(start + 0.55);
    });
  }

  // Ambient Lunar Base Drone & Soft Background Space Music
  public startAmbience() {
    if (this.isAmbienceRunning) {
      this.updateBackgroundGains();
      return;
    }
    this.initContext();
    if (!this.ctx) return;

    try {
      // 1. Ambient Audio: Gentle Lunar Habitat Circulation Hum
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientGain = this.ctx.createGain();

      this.ambientOsc.type = 'sawtooth';
      this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(115, this.ctx.currentTime);

      const ambVol = this.ambientEnabled ? this.masterVolume * this.ambientVolume * 0.11 : 0;
      this.ambientGain.gain.setValueAtTime(ambVol, this.ctx.currentTime);

      this.ambientOsc.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      this.ambientOsc.start();

      // 2. Background Music: Calm Fifth-Interval Space Pad
      this.musicOsc1 = this.ctx.createOscillator();
      this.musicOsc2 = this.ctx.createOscillator();
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicGain = this.ctx.createGain();

      this.musicOsc1.type = 'sine';
      this.musicOsc1.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3
      this.musicOsc2.type = 'triangle';
      this.musicOsc2.frequency.setValueAtTime(220.0, this.ctx.currentTime); // A3

      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(420, this.ctx.currentTime);

      const musVol = this.musicEnabled ? this.masterVolume * this.musicVolume * 0.08 : 0;
      this.musicGain.gain.setValueAtTime(musVol, this.ctx.currentTime);

      this.musicOsc1.connect(this.musicFilter);
      this.musicOsc2.connect(this.musicFilter);
      this.musicFilter.connect(this.musicGain);
      this.musicGain.connect(this.ctx.destination);

      this.musicOsc1.start();
      this.musicOsc2.start();

      this.isAmbienceRunning = true;
    } catch {
      // Ignored if autoplay policy limits
    }
  }

  public stopAmbience() {
    if (!this.isAmbienceRunning) return;
    try {
      this.ambientOsc?.stop();
      this.ambientOsc?.disconnect();
      this.musicOsc1?.stop();
      this.musicOsc1?.disconnect();
      this.musicOsc2?.stop();
      this.musicOsc2?.disconnect();
    } catch {
      // Ignore
    }
    this.isAmbienceRunning = false;
  }
}

export const audioSystem = new AudioSystem();
