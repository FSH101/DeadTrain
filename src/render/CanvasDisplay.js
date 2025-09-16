/** @typedef {import('../types.js').GameConfig} GameConfig */

export class CanvasDisplay {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
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
    this.scale = 1;
    this.configureSmoothing();
    this.resize();
  }

  configureSmoothing() {
    this.ctx.imageSmoothingEnabled = false;
    this.bufferCtx.imageSmoothingEnabled = false;
  }

  resize() {
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

  get context() {
    return this.bufferCtx;
  }

  clear() {
    this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
  }

  present() {
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.buffer, 0, 0);
    this.ctx.restore();
  }

  getScale() {
    return this.scale;
  }
}
