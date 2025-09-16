import { createLogger } from './logging.js';

const createStepBuffer = (context) => {
  const duration = 0.12;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) {
    const t = i / channel.length;
    channel[i] = Math.sin(Math.PI * 2 * 80 * t) * Math.exp(-6 * t);
  }
  return buffer;
};

const logger = createLogger('core.audio');

export class AudioManager {
  constructor() {
    this.context = null;
    this.stepBuffer = null;
    this.initialized = false;
    this.volume = 0.6;
  }

  async init() {
    if (this.initialized) {
      return;
    }
    const audioWindow = window;
    const AudioCtx = window.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioCtx) {
      logger.warn('Web Audio API is unavailable; audio features are disabled');
      return;
    }
    this.context = new AudioCtx();
    this.stepBuffer = createStepBuffer(this.context);
    this.initialized = true;
    logger.debug('Audio context initialized');

    try {
      const resumePromise = this.context.resume();
      if (resumePromise instanceof Promise) {
        resumePromise.catch((error) => {
          logger.warn('AudioContext resume rejected', error);
        });
        await Promise.race([
          resumePromise,
          new Promise((resolve) => setTimeout(resolve, 250)),
        ]);
      }
    } catch (error) {
      logger.warn('AudioContext resume failed', error);
    }
  }

  async ensure() {
    if (!this.initialized) {
      await this.init();
    }
  }

  async playStep() {
    await this.ensure();
    if (!this.context || !this.stepBuffer || this.volume <= 0) {
      return;
    }
    const source = this.context.createBufferSource();
    source.buffer = this.stepBuffer;
    const gain = this.context.createGain();
    gain.gain.value = this.volume;
    source.connect(gain);
    gain.connect(this.context.destination);
    source.start();
  }

  setVolume(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return;
    }
    const clamped = Math.max(0, Math.min(1, value));
    this.volume = clamped;
    logger.debug('Audio volume updated', { volume: clamped });
  }

  getVolume() {
    return this.volume;
  }
}
