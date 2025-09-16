/** @typedef {import('./GameState.js').GameRuntimeState} GameRuntimeState */
/** @typedef {import('../types.js').InteractionTarget} InteractionTarget */
/** @typedef {import('../types.js').IsoPoint} IsoPoint */

import { isoToScreen } from '../render/IsoMath.js';

const PRIORITY = {
  door: 3,
  npc: 2,
  object: 1,
};

const FORGIVENESS_PX = 28;

export class HitTester {
  constructor(state) {
    this.state = state;
  }

  hitTest(point, event) {
    if (this.state.isInputBlocked) {
      return { target: null, kind: 'ui', destination: null };
    }
    const path = event.composedPath();
    const hasUi = path.some((el) => el instanceof HTMLElement && el.dataset?.role === 'ui-block');
    if (hasUi) {
      return { target: null, kind: 'ui', destination: null };
    }

    let selected = null;
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

  screenPointToIso(point) {
    const isoX = point.x / (this.state.config.tileWidth / 2);
    const isoY = point.y / (this.state.config.tileHeight / 2);
    const x = (isoY + isoX) / 2;
    const y = (isoY - isoX) / 2;
    return { x, y };
  }
}
