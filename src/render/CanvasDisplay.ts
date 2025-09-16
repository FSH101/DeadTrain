import type { GameConfig } from '../types';

export class CanvasDisplay {
  private readonly canvas: HTMLCanvasElement;

  private readonly ctx: CanvasRenderingContext2D;

  private readonly buffer: HTMLCanvasElement;

  private readonly bufferCtx: CanvasRenderingContext2D;

  private scale = 1;

  constructor(canvas: HTMLCanvasElement, private readonly config: GameConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    this.buffer = document.createElement('canvas');
    this.buffer.width = config.virtualWidth;
    this.buffer.height = config.virtualHeight;
    const bufferCtx = this.buffer.getContext('2d');
    if (!bufferCtx) {
      throw new Error('Failed to create buffer context');
    }
    this.bufferCtx = bufferCtx;
    this.configureSmoothing();
    this.resize();
  }

  private configureSmoothing(): void {
    this.ctx.imageSmoothingEnabled = false;
    this.bufferCtx.imageSmoothingEnabled = false;
  }

  resize(): void {
    const { innerWidth, innerHeight } = window;
    const scaleX = Math.floor(innerWidth / this.config.virtualWidth) || 1;
    const scaleY = Math.floor(innerHeight / this.config.virtualHeight) || 1;
    this.scale = Math.max(1, Math.min(scaleX, scaleY));
    this.canvas.width = this.config.virtualWidth * this.scale;
    this.canvas.height = this.config.virtualHeight * this.scale;
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;
    this.configureSmoothing();
  }

  get context(): CanvasRenderingContext2D {
    return this.bufferCtx;
  }

  clear(): void {
    this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
  }

  present(): void {
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.buffer, 0, 0);
    this.ctx.restore();
  }

  getScale(): number {
    return this.scale;
  }
}
