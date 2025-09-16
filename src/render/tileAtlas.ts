import type { GameConfig, LayerTile } from '../types';
import { isoToScreen } from './IsoMath';

type FillStyle = string | CanvasGradient | CanvasPattern;

const drawDiamond = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  fill: FillStyle,
  stroke?: string,
): void => {
  ctx.beginPath();
  ctx.moveTo(cx, cy - height / 2);
  ctx.lineTo(cx + width / 2, cy);
  ctx.lineTo(cx, cy + height / 2);
  ctx.lineTo(cx - width / 2, cy);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

const drawWall = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  elevation: number,
  tint: string,
): void => {
  const top = y - elevation;
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.moveTo(x, top - height / 2);
  ctx.lineTo(x + width / 2, top);
  ctx.lineTo(x + width / 2, y);
  ctx.lineTo(x, y + height / 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, top - height / 2);
  ctx.lineTo(x, y + height / 2);
  ctx.lineTo(x - width / 2, y);
  ctx.lineTo(x - width / 2, top);
  ctx.closePath();
  ctx.fillStyle = shadeColor(tint, -0.2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, top - height / 2);
  ctx.lineTo(x + width / 2, top);
  ctx.lineTo(x, top + height / 2);
  ctx.lineTo(x - width / 2, top);
  ctx.closePath();
  ctx.fillStyle = shadeColor(tint, 0.15);
  ctx.fill();
};

const shadeColor = (hex: string, percent: number): string => {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  const num = parseInt(normalized, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const newR = Math.min(255, Math.max(0, Math.round(r + r * percent)));
  const newG = Math.min(255, Math.max(0, Math.round(g + g * percent)));
  const newB = Math.min(255, Math.max(0, Math.round(b + b * percent)));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
};

const createNoiseGradient = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(x, y - height / 2, x, y + height / 2);
  gradient.addColorStop(0, shadeColor(color, 0.3));
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, shadeColor(color, -0.35));
  return gradient;
};

const drawDecal = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  tint: string,
): void => {
  ctx.save();
  ctx.globalAlpha = 0.55;
  drawDiamond(ctx, x, y, width * 0.9, height * 0.9, tint);
  ctx.restore();
};

export const drawTile = (
  ctx: CanvasRenderingContext2D,
  tile: LayerTile,
  config: GameConfig,
): void => {
  const { x, y } = isoToScreen(tile.position, config.tileWidth, config.tileHeight);
  const width = config.tileWidth;
  const height = config.tileHeight;
  if (tile.tileId.startsWith('wall')) {
    const elevation = tile.elevation ?? 96;
    drawWall(ctx, x, y, width, height, elevation, tile.tint ?? '#4d5975');
    return;
  }

  const fill = createNoiseGradient(ctx, x, y, width, height, tile.tint ?? '#1f2d48');
  drawDiamond(ctx, x, y, width, height, fill);

  if (tile.decalId) {
    const decalTint = tile.decalId === 'rust' ? '#b3543d' : '#526077';
    drawDecal(ctx, x, y, width, height, decalTint);
  }
};
