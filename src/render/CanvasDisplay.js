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
    this.scaleX = 1;
    this.scaleY = 1;
    this.configureSmoothing();
    this.resize();
  }

  configureSmoothing() {
    this.ctx.imageSmoothingEnabled = false;
    this.bufferCtx.imageSmoothingEnabled = false;
  }

  resize() {
    const viewport = window.visualViewport;
    const cssWidth = Math.max(
      1,
      Math.ceil(viewport?.width ?? window.innerWidth ?? this.config.virtualWidth),
    );
    const cssHeight = Math.max(
      1,
      Math.ceil(viewport?.height ?? window.innerHeight ?? this.config.virtualHeight),
    );
    const pixelRatio = window.devicePixelRatio ?? 1;
    const pixelWidth = Math.max(1, Math.ceil(cssWidth * pixelRatio));
    const pixelHeight = Math.max(1, Math.ceil(cssHeight * pixelRatio));

    this.canvas.width = pixelWidth;
    this.canvas.height = pixelHeight;
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;

    this.scaleX = this.canvas.width / this.config.virtualWidth;
    this.scaleY = this.canvas.height / this.config.virtualHeight;
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
    this.ctx.scale(this.scaleX, this.scaleY);
    this.ctx.drawImage(this.buffer, 0, 0);
    this.ctx.restore();
  }

  getScale() {
    return { x: this.scaleX, y: this.scaleY };
  }
}
