import type { IsoPoint, ScreenPoint } from '../types';

export const isoToScreen = (point: IsoPoint, tileWidth: number, tileHeight: number): ScreenPoint => {
  const x = point.x - point.y;
  const y = point.x + point.y;
  const screenX = (x * tileWidth) / 2;
  const screenY = (y * tileHeight) / 2 - (point.z ?? 0);
  return { x: screenX, y: screenY };
};

export const screenToIso = (
  point: ScreenPoint,
  tileWidth: number,
  tileHeight: number,
): IsoPoint => {
  const isoX = point.x / (tileWidth / 2);
  const isoY = point.y / (tileHeight / 2);
  const x = (isoY + isoX) / 2;
  const y = (isoY - isoX) / 2;
  return { x, y };
};

export const isoDistance = (a: IsoPoint, b: IsoPoint): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const isoLerp = (from: IsoPoint, to: IsoPoint, t: number): IsoPoint => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
  z: (from.z ?? 0) + ((to.z ?? 0) - (from.z ?? 0)) * t,
});

export const isoFloor = (point: IsoPoint): IsoPoint => ({
  x: Math.round(point.x * 100) / 100,
  y: Math.round(point.y * 100) / 100,
  z: Math.round((point.z ?? 0) * 100) / 100,
});
