import { CrewId } from '../types/game';

export interface SubtitleEvent {
  speaker: CrewId;
  speakerName: string;
  text: string;
  durationMs: number;
}

type SubtitleListener = (event: SubtitleEvent | null) => void;

class NarrationSystem {
  private synth: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private isEnabled: boolean = true;
  private volume: number = 0.8;
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lastDialogue: { speaker: CrewId; text: string; name: string } | null = null;
  private subtitleListeners: Set<SubtitleListener> = new Set();
  private subtitleTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  public subscribeSubtitles(listener: SubtitleListener) {
    this.subtitleListeners.add(listener);
    return () => {
      this.subtitleListeners.delete(listener);
    };
  }

  private notifySubtitles(event: SubtitleEvent | null) {
    this.subtitleListeners.forEach((l) => l(event));
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public isVoiceMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public speak(speaker: CrewId, text: string, speakerName?: string) {
    const displayName = speakerName || this.getSpeakerDisplayName(speaker);
    this.lastDialogue = { speaker, text, name: displayName };

    // Duration estimate for subtitles: ~60ms per character, min 3.5s, max 10s
    const estDuration = Math.max(3500, Math.min(10000, text.length * 65));

    // Show subtitles immediately
    if (this.subtitleTimer) {
      window.clearTimeout(this.subtitleTimer);
      this.subtitleTimer = null;
    }

    this.notifySubtitles({
      speaker,
      speakerName: displayName,
      text,
      durationMs: estDuration,
    });

    this.subtitleTimer = window.setTimeout(() => {
      this.notifySubtitles(null);
      this.subtitleTimer = null;
    }, estDuration);

    // If speech disabled, muted or unsupported, subtitles alone suffice
    if (!this.isSupported || !this.synth || !this.isEnabled || this.isMuted) {
      return;
    }

    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;

      // Character voice personas
      switch (speaker) {
        case 'nova': // Commander Nova (Mission Control - authoritative, crisp)
          utterance.pitch = 0.95;
          utterance.rate = 1.0;
          break;
        case 'maya': // Maya (Engineer - enthusiastic, bright)
          utterance.pitch = 1.25;
          utterance.rate = 1.05;
          break;
        case 'leo': // Dr. Leo (Botanist - warm, thoughtful)
          utterance.pitch = 0.85;
          utterance.rate = 0.95;
          break;
        case 'robo': // Robo (AI assistant - playful high-tech robotic tone)
          utterance.pitch = 1.6;
          utterance.rate = 1.15;
          break;
        case 'alex': // Alex (Junior Commander)
        default:
          utterance.pitch = 1.1;
          utterance.rate = 1.0;
          break;
      }

      // Try selecting an English voice
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        const enVoices = voices.filter((v) => v.lang.startsWith('en'));
        if (enVoices.length > 0) {
          if (speaker === 'nova' || speaker === 'maya') {
            const femaleVoice = enVoices.find((v) => /female|samantha|zira|victoria|google us english/i.test(v.name));
            if (femaleVoice) utterance.voice = femaleVoice;
          } else if (speaker === 'leo') {
            const maleVoice = enVoices.find((v) => /male|david|daniel|george|alex/i.test(v.name));
            if (maleVoice) utterance.voice = maleVoice;
          }
        }
      }

      utterance.onend = () => {
        this.currentUtterance = null;
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch {
      // Audio safety fallback
    }
  }

  public replay() {
    if (this.lastDialogue) {
      this.speak(this.lastDialogue.speaker, this.lastDialogue.text, this.lastDialogue.name);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    if (this.subtitleTimer) {
      window.clearTimeout(this.subtitleTimer);
      this.subtitleTimer = null;
    }
    this.notifySubtitles(null);
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  private getSpeakerDisplayName(speaker: CrewId): string {
    switch (speaker) {
      case 'nova':
        return 'Cmdr. Nova (Expedition Lead)';
      case 'alex':
      case 'maya':
        return 'Dr. Alex Chen (ECLSS Engineer)';
      case 'leo':
        return 'Dr. Leo Vance (Space Botanist)';
      case 'robo':
      default:
        return 'Cmdr. Nova (Expedition Lead)';
    }
  }
}

export const narrationSystem = new NarrationSystem();
