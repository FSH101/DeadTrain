export type AmbientTrack = 'train' | 'dark';

type WebAudioWindow = typeof window & {
  webkitAudioContext?: typeof AudioContext;
};

const createNoiseBuffer = (context: AudioContext, lengthSeconds: number): AudioBuffer => {
  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, sampleRate * lengthSeconds, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.25;
  }
  return buffer;
};

const createStepBuffer = (context: AudioContext): AudioBuffer => {
  const duration = 0.12;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) {
    const t = i / channel.length;
    channel[i] = Math.sin(Math.PI * 2 * 80 * t) * Math.exp(-6 * t);
  }
  return buffer;
};

export class AudioManager {
  private context: AudioContext | null = null;

  private ambientSource: AudioBufferSourceNode | null = null;

  private gain: GainNode | null = null;

  private stepBuffer: AudioBuffer | null = null;

  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    const audioWindow = window as WebAudioWindow;
    const AudioCtx = window.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }
    this.context = new AudioCtx();
    this.gain = this.context.createGain();
    this.gain.gain.value = 0.4;
    this.gain.connect(this.context.destination);
    this.stepBuffer = createStepBuffer(this.context);
    this.initialized = true;
    await this.context.resume();
  }

  async ensure(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  async playAmbient(track: AmbientTrack): Promise<void> {
    await this.ensure();
    if (!this.context || !this.gain) {
      return;
    }
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource.disconnect();
    }
    const buffer = createNoiseBuffer(this.context, track === 'dark' ? 8 : 5);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.gain);
    source.start(0);
    this.ambientSource = source;
  }

  async playStep(): Promise<void> {
    await this.ensure();
    if (!this.context || !this.stepBuffer) {
      return;
    }
    const source = this.context.createBufferSource();
    source.buffer = this.stepBuffer;
    const gain = this.context.createGain();
    gain.gain.value = 0.6;
    source.connect(gain);
    gain.connect(this.context.destination);
    source.start();
  }

  setVolume(value: number): void {
    if (!this.gain) {
      return;
    }
    this.gain.gain.value = value;
  }
}
