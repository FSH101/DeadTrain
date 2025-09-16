/** @typedef {import('../game/GameState.js').GameRuntimeState} GameRuntimeState */
/** @typedef {import('../types.js').DoorDescriptor} DoorDescriptor */
/** @typedef {import('../types.js').LightZone} LightZone */
/** @typedef {import('../types.js').NpcDescriptor} NpcDescriptor */

import { isoToScreen } from './IsoMath.js';
import { drawTile } from './tileAtlas.js';

const PLAYER_COLOR = '#f2f5ff';
const PLAYER_OUTLINE = '#1b2033';
const NPC_COLOR = '#e6b35c';
const DOOR_COLOR = '#6e8cff';
const OBJECT_COLOR = '#6bd6cb';

const drawLights = (ctx, lights, config, elapsed) => {
  if (!lights || lights.length === 0) {
    return;
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  lights.forEach((light) => {
    const screen = isoToScreen(light.center, config.tileWidth, config.tileHeight);
    const radius = light.radius * (config.tileWidth / 2);
    const gradient = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, radius);
    const flicker = light.flicker ? (Math.sin(elapsed * 2 + light.radius) + 1) * 0.04 : 0;
    const intensity = light.intensity + flicker;
    gradient.addColorStop(0, `rgba(110, 150, 255, ${intensity})`);
    gradient.addColorStop(1, 'rgba(20, 30, 50, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

const drawDoor = (ctx, door, config) => {
  const screen = isoToScreen(door.position, config.tileWidth, config.tileHeight);
  ctx.save();
  ctx.fillStyle = DOOR_COLOR;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(screen.x, screen.y - 12, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawNpc = (ctx, npc, config, elapsed) => {
  const screen = isoToScreen(npc.position, config.tileWidth, config.tileHeight);
  ctx.save();
  const bounce = npc.idleAnimation === 'loop' ? Math.sin(elapsed * 2) * 2 : 0;
  ctx.fillStyle = NPC_COLOR;
  ctx.strokeStyle = PLAYER_OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(screen.x, screen.y - 18 + bounce, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

const drawPlayer = (ctx, state, elapsed) => {
  const screen = isoToScreen(state.player.position, state.config.tileWidth, state.config.tileHeight);
  const wobble = state.player.isMoving ? Math.sin(elapsed * 8) * 2 : 0;
  ctx.save();
  ctx.fillStyle = PLAYER_COLOR;
  ctx.strokeStyle = PLAYER_OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(screen.x, screen.y - 18 + wobble, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

const drawMarker = (ctx, state, elapsed) => {
  if (!state.marker.visible || !state.marker.position) {
    return;
  }
  const screen = isoToScreen(state.marker.position, state.config.tileWidth, state.config.tileHeight);
  const pulse = (Math.sin(elapsed * 4) + 1) / 2;
  ctx.save();
  ctx.strokeStyle = `rgba(120, 180, 255, ${0.7 + pulse * 0.3})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(screen.x, screen.y - 16, 14 + pulse * 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const drawHints = (ctx, state) => {
  const hints = state.wagon.hints ?? [];
  hints.forEach((hint) => {
    const screen = isoToScreen(hint.position, state.config.tileWidth, state.config.tileHeight);
    ctx.save();
    ctx.fillStyle = 'rgba(120, 180, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y - 12);
    ctx.lineTo(screen.x + 8, screen.y + 8);
    ctx.lineTo(screen.x - 8, screen.y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
};

export class IsometricRenderer {
  constructor(display, state) {
    this.display = display;
    this.state = state;
    this.elapsed = 0;
  }

  render(deltaSeconds) {
    this.elapsed += deltaSeconds;
    const ctx = this.display.context;
    this.display.clear();
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, this.state.config.virtualWidth, this.state.config.virtualHeight);

    const tiles = [...this.state.wagon.floor, ...this.state.wagon.decals];
    tiles
      .sort(
        (a, b) =>
          a.position.x + a.position.y - (b.position.x + b.position.y) ||
          (a.position.z ?? 0) - (b.position.z ?? 0),
      )
      .forEach((tile) => drawTile(ctx, tile, this.state.config));

    drawLights(ctx, this.state.wagon.lights, this.state.config, this.elapsed);

    this.state.wagon.walls
      .slice()
      .sort((a, b) => a.position.x + a.position.y - (b.position.x + b.position.y))
      .forEach((tile) => drawTile(ctx, tile, this.state.config));

    this.state.wagon.doors.forEach((door) => drawDoor(ctx, door, this.state.config));
    this.state.wagon.npcs.forEach((npc) => drawNpc(ctx, npc, this.state.config, this.elapsed));

    this.state.wagon.objects.forEach((object) => {
      const screen = isoToScreen(object.position, this.state.config.tileWidth, this.state.config.tileHeight);
      ctx.save();
      ctx.fillStyle = OBJECT_COLOR;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.rect(screen.x - 8, screen.y - 12, 16, 12);
      ctx.fill();
      ctx.restore();
    });

    drawPlayer(ctx, this.state, this.elapsed);
    drawMarker(ctx, this.state, this.elapsed);
    drawHints(ctx, this.state);

    if (this.state.wagon.ambient === 'dark') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 4, 12, 0.55)';
      ctx.fillRect(0, 0, this.state.config.virtualWidth, this.state.config.virtualHeight);
      ctx.restore();
    }

    this.display.present();
  }
}
