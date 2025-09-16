import { isoToScreen } from '../render/IsoMath';
import type { GameRuntimeState } from './GameState';
import type { InteractionTarget, IsoPoint } from '../types';

const PRIORITY: Record<string, number> = {
  door: 3,
  npc: 2,
  object: 1,
};

const FORGIVENESS_PX = 28;

export type HitResult = {
  target: InteractionTarget | null;
  kind: 'ui' | 'world';
  destination: IsoPoint | null;
};

export class HitTester {
  constructor(private readonly state: GameRuntimeState) {}

  hitTest(point: { x: number; y: number }, event: PointerEvent): HitResult {
    if (this.state.isInputBlocked) {
      return { target: null, kind: 'ui', destination: null };
    }
    const path = event.composedPath();
    const hasUi = path.some((el) => el instanceof HTMLElement && el.dataset?.role === 'ui-block');
    if (hasUi) {
      return { target: null, kind: 'ui', destination: null };
    }

    let selected: InteractionTarget | null = null;
    let bestPriority = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    this.state.currentTargets.forEach((target) => {
      const screen = isoToScreen(target.position, this.state.config.tileWidth, this.state.config.tileHeight);
      const dx = point.x - screen.x;
      const dy = point.y - screen.y;
      const distance = Math.hypot(dx, dy);
      const forgiveness = FORGIVENESS_PX;
      if (distance <= target.radius + forgiveness) {
        const priority = PRIORITY[target.kind] ?? 0;
        if (priority > bestPriority || (priority === bestPriority && distance < bestDistance)) {
          bestPriority = priority;
          bestDistance = distance;
          selected = target;
        }
      }
    });

    if (selected) {
      return { target: selected, kind: 'world', destination: null };
    }

    return { target: null, kind: 'world', destination: this.screenPointToIso(point) };
  }

  private screenPointToIso(point: { x: number; y: number }): IsoPoint {
    const isoX = point.x / (this.state.config.tileWidth / 2);
    const isoY = point.y / (this.state.config.tileHeight / 2);
    const x = (isoY + isoX) / 2;
    const y = (isoY - isoX) / 2;
    return { x, y };
  }
}
