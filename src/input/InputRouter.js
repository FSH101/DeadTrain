/** @typedef {import('../game/GameState.js').GameRuntimeState} GameRuntimeState */
/** @typedef {import('../systems/InteractionSystem.js').InteractionSystem} InteractionSystem */
/** @typedef {import('../types.js').Intent} Intent */

import { HitTester } from '../game/HitTester.js';
import { TapRecognizer } from './TapRecognizer.js';

/**
 * @typedef {Object} HapticsBridge
 * @property {(style: 'light' | 'medium' | 'heavy') => void} impact
 * @property {(style: 'success' | 'warning' | 'error') => void} notify
 */

export class InputRouter {
  constructor(canvas, state, interaction, haptics) {
    this.canvas = canvas;
    this.state = state;
    this.interaction = interaction;
    this.haptics = haptics;
    this.hitTester = new HitTester(state);
    this.recognizer = new TapRecognizer((event, kind) => {
      event.preventDefault();
      if (kind === 'long-press') {
        this.handleInspect(event);
        return;
      }
      if (kind === 'double-tap') {
        this.handleDoubleTap(event);
        return;
      }
      this.handleTap(event);
    });
  }

  attach() {
    this.recognizer.attach(this.canvas);
  }

  detach() {
    this.recognizer.detach(this.canvas);
  }

  toVirtualPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;
    return {
      x: xRatio * this.state.config.virtualWidth,
      y: yRatio * this.state.config.virtualHeight,
    };
  }

  handleTap(event) {
    if (this.state.isInputBlocked) {
      return;
    }
    const point = this.toVirtualPoint(event);
    const result = this.hitTester.hitTest(point, event);
    if (result.kind === 'ui') {
      return;
    }
    if (result.target) {
      const intent = { type: 'Interact', target: result.target };
      void this.interaction.handleIntent(intent);
      this.haptics.impact('light');
      return;
    }
    if (result.destination) {
      const intent = { type: 'MoveTo', target: null, destination: result.destination };
      void this.interaction.handleIntent(intent);
      this.haptics.impact('light');
    }
  }

  handleDoubleTap(event) {
    if (this.state.isInputBlocked) {
      return;
    }
    const point = this.toVirtualPoint(event);
    const result = this.hitTester.hitTest(point, event);
    if (result.target) {
      const intent = { type: 'Interact', target: result.target };
      void this.interaction.handleIntent(intent);
      this.haptics.notify('success');
      return;
    }
    if (result.destination) {
      const intent = { type: 'MoveTo', target: null, destination: result.destination };
      void this.interaction.handleIntent(intent);
      this.haptics.impact('medium');
    }
  }

  handleInspect(event) {
    if (this.state.isInputBlocked) {
      return;
    }
    const point = this.toVirtualPoint(event);
    const result = this.hitTester.hitTest(point, event);
    const intent = {
      type: 'Inspect',
      target: result.target,
      destination: result.destination ?? undefined,
    };
    void this.interaction.handleIntent(intent);
    this.haptics.notify('warning');
  }
}
