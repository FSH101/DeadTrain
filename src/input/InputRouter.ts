import type { GameRuntimeState } from '../game/GameState';
import { HitTester } from '../game/HitTester';
import type { InteractionSystem } from '../systems/InteractionSystem';
import type { Intent } from '../types';
import { TapRecognizer } from './TapRecognizer';

export interface HapticsBridge {
  impact(style: 'light' | 'medium' | 'heavy'): void;
  notify(style: 'success' | 'warning' | 'error'): void;
}

export class InputRouter {
  private readonly recognizer: TapRecognizer;

  private readonly hitTester: HitTester;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly state: GameRuntimeState,
    private readonly interaction: InteractionSystem,
    private readonly haptics: HapticsBridge,
  ) {
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

  attach(): void {
    this.recognizer.attach(this.canvas);
  }

  detach(): void {
    this.recognizer.detach(this.canvas);
  }

  private toVirtualPoint(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;
    return {
      x: xRatio * this.state.config.virtualWidth,
      y: yRatio * this.state.config.virtualHeight,
    };
  }

  private handleTap(event: PointerEvent): void {
    if (this.state.isInputBlocked) {
      return;
    }
    const point = this.toVirtualPoint(event);
    const result = this.hitTester.hitTest(point, event);
    if (result.kind === 'ui') {
      return;
    }
    if (result.target) {
      const intent: Intent = { type: 'Interact', target: result.target };
      void this.interaction.handleIntent(intent);
      this.haptics.impact('light');
      return;
    }
    if (result.destination) {
      const intent: Intent = { type: 'MoveTo', target: null, destination: result.destination };
      void this.interaction.handleIntent(intent);
      this.haptics.impact('light');
    }
  }

  private handleDoubleTap(event: PointerEvent): void {
    if (this.state.isInputBlocked) {
      return;
    }
    const point = this.toVirtualPoint(event);
    const result = this.hitTester.hitTest(point, event);
    if (result.target) {
      const intent: Intent = { type: 'Interact', target: result.target };
      void this.interaction.handleIntent(intent);
      this.haptics.notify('success');
      return;
    }
    if (result.destination) {
      const intent: Intent = { type: 'MoveTo', target: null, destination: result.destination };
      void this.interaction.handleIntent(intent);
      this.haptics.impact('medium');
    }
  }

  private handleInspect(event: PointerEvent): void {
    if (this.state.isInputBlocked) {
      return;
    }
    const point = this.toVirtualPoint(event);
    const result = this.hitTester.hitTest(point, event);
    const intent: Intent = {
      type: 'Inspect',
      target: result.target,
      destination: result.destination ?? undefined,
    };
    void this.interaction.handleIntent(intent);
    this.haptics.notify('warning');
  }
}
