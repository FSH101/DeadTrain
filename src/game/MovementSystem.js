/** @typedef {import('./GameState.js').GameRuntimeState} GameRuntimeState */
/** @typedef {import('../types.js').IsoPoint} IsoPoint */

import { isoDistance, isoLerp, isoToScreen } from '../render/IsoMath.js';
import { NavMesh } from './NavMesh.js';

const STOP_DISTANCE_PX = 10;

export class MovementSystem {
  constructor(state) {
    this.state = state;
    this.navMesh = null;
  }

  setNavMesh(points) {
    this.navMesh = new NavMesh(points);
  }

  movePlayerTo(target) {
    if (!this.navMesh) {
      return;
    }
    const player = this.state.player;
    const path = this.navMesh.findPath(player.position, target);
    if (path.length === 0) {
      player.path = [];
      player.isMoving = false;
      return;
    }
    const last = path[path.length - 1];
    const targetScreen = isoToScreen(target, this.state.config.tileWidth, this.state.config.tileHeight);
    const lastScreen = isoToScreen(last, this.state.config.tileWidth, this.state.config.tileHeight);
    const dx = targetScreen.x - lastScreen.x;
    const dy = targetScreen.y - lastScreen.y;
    const dist = Math.hypot(dx, dy);
    let stopPoint = target;
    if (dist > STOP_DISTANCE_PX) {
      const ratio = (dist - STOP_DISTANCE_PX) / dist;
      stopPoint = isoLerp(last, target, ratio);
    }
    path[path.length - 1] = stopPoint;
    player.path = path;
    player.isMoving = true;
  }

  update(deltaSeconds) {
    const player = this.state.player;
    if (player.path.length === 0) {
      player.isMoving = false;
      return;
    }
    const next = player.path[0];
    const distance = isoDistance(player.position, next);
    const maxStep = player.speed * deltaSeconds;
    if (distance <= maxStep) {
      player.position = { ...next };
      player.path.shift();
      if (player.path.length === 0) {
        player.isMoving = false;
      }
      return;
    }
    const t = maxStep / distance;
    player.position = isoLerp(player.position, next, t);
    player.isMoving = true;
    player.facing = Math.atan2(next.y - player.position.y, next.x - player.position.x);
  }

  stop() {
    const player = this.state.player;
    player.path = [];
    player.isMoving = false;
  }
}
