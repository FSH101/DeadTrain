type TapKind = 'tap' | 'double-tap' | 'long-press';

type TapHandler = (event: PointerEvent, kind: TapKind) => void;

const DOUBLE_TAP_DELAY = 300;
const LONG_PRESS_DELAY = 450;
const MOVE_THRESHOLD = 16;

export class TapRecognizer {
  private lastTapTime = 0;

  private lastTapPoint: { x: number; y: number } | null = null;

  private longPressTimer: ReturnType<typeof setTimeout> | null = null;

  private isPointerDown = false;

  constructor(private readonly handler: TapHandler) {}

  attach(element: HTMLElement): void {
    element.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
    element.addEventListener('pointerup', this.handlePointerUp, { passive: false });
    element.addEventListener('pointercancel', this.handlePointerCancel, { passive: false });
    element.addEventListener('pointermove', this.handlePointerMove, { passive: false });
  }

  detach(element: HTMLElement): void {
    element.removeEventListener('pointerdown', this.handlePointerDown);
    element.removeEventListener('pointerup', this.handlePointerUp);
    element.removeEventListener('pointercancel', this.handlePointerCancel);
    element.removeEventListener('pointermove', this.handlePointerMove);
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    this.isPointerDown = true;
    const point = { x: event.clientX, y: event.clientY };
    this.lastTapPoint = point;
    this.longPressTimer = setTimeout(() => {
      if (this.isPointerDown) {
        this.handler(event, 'long-press');
        this.clearLongPress();
      }
    }, LONG_PRESS_DELAY);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (!this.isPointerDown) {
      return;
    }
    const point = { x: event.clientX, y: event.clientY };
    if (this.lastTapPoint) {
      const dx = point.x - this.lastTapPoint.x;
      const dy = point.y - this.lastTapPoint.y;
      if (Math.hypot(dx, dy) > MOVE_THRESHOLD) {
        this.reset();
        return;
      }
    }
    const now = performance.now();
    const delta = now - this.lastTapTime;
    this.clearLongPress();
    this.isPointerDown = false;
    if (delta < DOUBLE_TAP_DELAY) {
      this.handler(event, 'double-tap');
      this.lastTapTime = 0;
      return;
    }
    this.lastTapTime = now;
    this.handler(event, 'tap');
  };

  private handlePointerCancel = (): void => {
    this.reset();
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.isPointerDown || !this.lastTapPoint) {
      return;
    }
    const dx = event.clientX - this.lastTapPoint.x;
    const dy = event.clientY - this.lastTapPoint.y;
    if (Math.hypot(dx, dy) > MOVE_THRESHOLD) {
      this.reset();
    }
  };

  private reset(): void {
    this.isPointerDown = false;
    this.clearLongPress();
  }

  private clearLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}
