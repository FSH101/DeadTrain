/**
 * @typedef {Object} SpriteDefinition
 * @property {string} src
 * @property {{ x: number, y: number }} [anchor]
 * @property {{ x: number, y: number }} [offset]
 * @property {number} [scale]
 */

const toHex = (value) => value.toString(16).padStart(2, '0');

const shadeColor = (hex, percent) => {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  const num = parseInt(normalized, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const adjustChannel = (channel) => {
    if (percent < 0) {
      return Math.round(channel * (1 + percent));
    }
    return Math.round(channel + (255 - channel) * percent);
  };
  const newR = Math.min(255, Math.max(0, adjustChannel(r)));
  const newG = Math.min(255, Math.max(0, adjustChannel(g)));
  const newB = Math.min(255, Math.max(0, adjustChannel(b)));
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

const svgUri = (width, height, body) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="geometricPrecision">${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createTrainCarSprite = ({ body, floor, accent, window }) => {
  const bodyLight = shadeColor(body, 0.22);
  const bodyDark = shadeColor(body, -0.35);
  const floorLight = shadeColor(floor, 0.25);
  const floorDark = shadeColor(floor, -0.3);
  const accentDark = shadeColor(accent, -0.3);
  const windowDark = shadeColor(window, -0.35);
  return svgUri(
    640,
    360,
    `
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${floorLight}" />
          <stop offset="0.5" stop-color="${floor}" />
          <stop offset="1" stop-color="${floorDark}" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bodyLight}" />
          <stop offset="1" stop-color="${bodyDark}" />
        </linearGradient>
        <linearGradient id="window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${shadeColor(window, 0.25)}" />
          <stop offset="1" stop-color="${windowDark}" />
        </linearGradient>
      </defs>
      <g>
        <polygon points="320 52 612 188 320 324 28 188" fill="url(#floor)" stroke="${accentDark}" stroke-width="6" stroke-linejoin="round" />
        <polygon points="320 26 556 140 320 252 84 140" fill="url(#wall)" stroke="${accentDark}" stroke-width="5" stroke-linejoin="round" />
        <polygon points="320 26 556 140 612 188 320 324 28 188 84 140" fill="none" stroke="${shadeColor(body, -0.55)}" stroke-width="4" stroke-linejoin="round" stroke-opacity="0.8" />
        <polygon points="320 108 496 192 320 276 144 192" fill="${shadeColor(floor, -0.12)}" opacity="0.75" />
        <polyline points="320 104 496 188 320 272 144 188 320 104" fill="none" stroke="${shadeColor(floor, 0.35)}" stroke-width="6" stroke-opacity="0.35" />
        <g opacity="0.9">
          <polygon points="320 40 460 108 320 180 180 108" fill="url(#window)" stroke="${accentDark}" stroke-width="4" stroke-linejoin="round" />
          <line x1="320" y1="44" x2="320" y2="176" stroke="${shadeColor(accent, -0.1)}" stroke-width="4" stroke-linecap="round" />
          <line x1="268" y1="68" x2="268" y2="152" stroke="${shadeColor(accent, -0.1)}" stroke-width="4" stroke-linecap="round" />
          <line x1="372" y1="68" x2="372" y2="152" stroke="${shadeColor(accent, -0.1)}" stroke-width="4" stroke-linecap="round" />
        </g>
        <g opacity="0.85">
          <polygon points="458 146 520 176 458 206 396 176" fill="${shadeColor(accent, 0.1)}" stroke="${accentDark}" stroke-width="4" stroke-linejoin="round" />
          <polygon points="244 146 182 176 244 206 306 176" fill="${shadeColor(accent, 0.1)}" stroke="${accentDark}" stroke-width="4" stroke-linejoin="round" />
        </g>
        <g opacity="0.65">
          <line x1="246" y1="226" x2="394" y2="226" stroke="${shadeColor(body, -0.5)}" stroke-width="8" stroke-linecap="round" />
          <line x1="246" y1="246" x2="394" y2="246" stroke="${shadeColor(body, -0.6)}" stroke-width="6" stroke-linecap="round" />
        </g>
      </g>
    `,
  );
};

const createCharacterSprite = ({ coat, trim, hat, accessory, skin }) => {
  const coatLight = shadeColor(coat, 0.2);
  const coatDark = shadeColor(coat, -0.25);
  const trimDark = shadeColor(trim, -0.35);
  const hatDark = shadeColor(hat, -0.25);
  const hatLight = shadeColor(hat, 0.1);
  const skinShadow = shadeColor(skin, -0.2);
  return svgUri(
    128,
    192,
    `
      <defs>
        <linearGradient id="coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${coatLight}" />
          <stop offset="1" stop-color="${coatDark}" />
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="170" rx="34" ry="12" fill="#000000" opacity="0.25" />
      <g transform="translate(32 32)">
        <path d="M32 36 C20 36 10 48 10 68 L10 116 C10 126 18 134 28 134 L36 134 C46 134 54 126 54 116 L54 68 C54 48 44 36 32 36 Z" fill="url(#coat)" stroke="${trimDark}" stroke-width="4" stroke-linejoin="round" />
        <path d="M32 52 C40 52 46 58 46 66 L46 94 C46 104 40 112 32 112 C24 112 18 104 18 94 L18 66 C18 58 24 52 32 52 Z" fill="${trim}" />
        <circle cx="32" cy="20" r="16" fill="${skin}" stroke="${skinShadow}" stroke-width="4" />
        <path d="M20 18 C22 10 42 10 44 18" fill="none" stroke="${skinShadow}" stroke-width="3" stroke-linecap="round" />
        <circle cx="26" cy="22" r="3" fill="${skinShadow}" />
        <circle cx="38" cy="22" r="3" fill="${skinShadow}" />
        <path d="M26 30 Q32 36 38 30" fill="none" stroke="${skinShadow}" stroke-width="3" stroke-linecap="round" />
        <path d="M16 62 L48 62" stroke="${accessory}" stroke-width="4" stroke-linecap="round" />
        <circle cx="32" cy="78" r="4" fill="${accessory}" />
        <path d="M12 134 L16 154 C18 160 22 164 28 164 L36 164 C42 164 46 160 48 154 L52 134" fill="${coatDark}" stroke="${trimDark}" stroke-width="4" stroke-linecap="round" />
        <path d="M16 0 L48 0 L50 10 C38 20 26 20 14 10 Z" fill="${hatLight}" stroke="${hatDark}" stroke-width="4" stroke-linejoin="round" />
        <rect x="18" y="-8" width="28" height="10" rx="4" fill="${hatDark}" />
      </g>
    `,
  );
};

const createDoorIndicatorSprite = ({ primary, glow }) => {
  const primaryDark = shadeColor(primary, -0.2);
  const glowLight = shadeColor(glow, 0.3);
  return svgUri(
    96,
    128,
    `
      <defs>
        <radialGradient id="doorGlow" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stop-color="${glowLight}" stop-opacity="0.95" />
          <stop offset="1" stop-color="${shadeColor(glow, -0.4)}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="48" cy="96" rx="26" ry="10" fill="#000000" opacity="0.2" />
      <circle cx="48" cy="52" r="46" fill="url(#doorGlow)" opacity="0.6" />
      <path d="M48 12 L84 64 L60 64 L60 108 L36 108 L36 64 L12 64 Z" fill="${primary}" stroke="${primaryDark}" stroke-width="6" stroke-linejoin="round" />
    `,
  );
};

const createLuggageSprite = ({ shell, straps }) => {
  const shellLight = shadeColor(shell, 0.2);
  const shellDark = shadeColor(shell, -0.25);
  const strapDark = shadeColor(straps, -0.35);
  return svgUri(
    128,
    160,
    `
      <ellipse cx="64" cy="142" rx="38" ry="12" fill="#000" opacity="0.2" />
      <rect x="26" y="48" width="76" height="64" rx="12" fill="${shellLight}" stroke="${shellDark}" stroke-width="6" />
      <rect x="38" y="30" width="52" height="26" rx="10" fill="${shell}" stroke="${shellDark}" stroke-width="6" />
      <rect x="30" y="48" width="16" height="64" fill="${straps}" stroke="${strapDark}" stroke-width="4" />
      <rect x="82" y="48" width="16" height="64" fill="${straps}" stroke="${strapDark}" stroke-width="4" />
      <circle cx="64" cy="94" r="6" fill="${strapDark}" />
    `,
  );
};

const createPanelSprite = ({ body, glow, accent }) => {
  const bodyDark = shadeColor(body, -0.3);
  const glowDark = shadeColor(glow, -0.35);
  return svgUri(
    112,
    176,
    `
      <ellipse cx="56" cy="160" rx="32" ry="10" fill="#000" opacity="0.2" />
      <rect x="20" y="32" width="72" height="96" rx="14" fill="${body}" stroke="${bodyDark}" stroke-width="6" />
      <rect x="32" y="44" width="48" height="36" rx="8" fill="${glow}" stroke="${glowDark}" stroke-width="4" />
      <circle cx="40" cy="104" r="8" fill="${accent}" />
      <circle cx="72" cy="104" r="8" fill="${accent}" opacity="0.6" />
      <rect x="46" y="120" width="20" height="24" rx="6" fill="${shadeColor(body, -0.4)}" />
    `,
  );
};

const createSeatSprite = ({ cushion, frame, stripe }) => {
  const cushionDark = shadeColor(cushion, -0.35);
  const frameDark = shadeColor(frame, -0.35);
  return svgUri(
    140,
    160,
    `
      <ellipse cx="70" cy="140" rx="40" ry="12" fill="#000" opacity="0.22" />
      <rect x="32" y="60" width="76" height="52" rx="16" fill="${cushion}" stroke="${cushionDark}" stroke-width="6" />
      <rect x="38" y="32" width="64" height="40" rx="14" fill="${shadeColor(cushion, 0.2)}" stroke="${cushionDark}" stroke-width="5" />
      <rect x="30" y="108" width="80" height="20" rx="8" fill="${frame}" stroke="${frameDark}" stroke-width="5" />
      <rect x="32" y="80" width="72" height="8" fill="${stripe}" opacity="0.6" />
    `,
  );
};

const createConsoleSprite = ({ body, screen, trims }) => {
  const bodyDark = shadeColor(body, -0.35);
  const screenDark = shadeColor(screen, -0.3);
  const trimsLight = shadeColor(trims, 0.3);
  return svgUri(
    156,
    168,
    `
      <ellipse cx="78" cy="150" rx="44" ry="12" fill="#000" opacity="0.22" />
      <path d="M24 118 L132 118 C140 118 148 124 148 134 L148 144 C148 150 144 156 138 158 L18 158 C12 156 8 150 8 144 L8 134 C8 124 16 118 24 118 Z" fill="${body}" stroke="${bodyDark}" stroke-width="6" />
      <rect x="28" y="28" width="100" height="72" rx="14" fill="${screen}" stroke="${screenDark}" stroke-width="6" />
      <rect x="36" y="40" width="84" height="48" rx="10" fill="${shadeColor(screen, 0.2)}" opacity="0.85" />
      <rect x="20" y="94" width="32" height="18" rx="6" fill="${trims}" stroke="${trimsLight}" stroke-width="4" />
      <rect x="64" y="94" width="32" height="18" rx="6" fill="${shadeColor(trims, -0.2)}" stroke="${trimsLight}" stroke-width="4" />
      <rect x="108" y="94" width="28" height="18" rx="6" fill="${trims}" stroke="${trimsLight}" stroke-width="4" />
      <circle cx="46" cy="128" r="6" fill="${trimsLight}" />
      <circle cx="78" cy="128" r="6" fill="${trimsLight}" opacity="0.6" />
      <circle cx="110" cy="128" r="6" fill="${trimsLight}" opacity="0.4" />
    `,
  );
};

/** @type {Record<string, SpriteDefinition>} */
export const SPRITE_DEFINITIONS = {
  'train-car-main': {
    src: createTrainCarSprite({
      body: '#3b4a66',
      floor: '#222b3d',
      accent: '#7fc4ff',
      window: '#9dd2ff',
    }),
    anchor: { x: 0.397, y: 0.42 },
  },
  'train-car-dark': {
    src: createTrainCarSprite({
      body: '#2c3246',
      floor: '#181d2b',
      accent: '#ff8456',
      window: '#7aa5d6',
    }),
    anchor: { x: 0.397, y: 0.42 },
  },
  'train-car-light': {
    src: createTrainCarSprite({
      body: '#465b7b',
      floor: '#202c3c',
      accent: '#94f0c6',
      window: '#b1f6de',
    }),
    anchor: { x: 0.397, y: 0.42 },
  },
  player: {
    src: createCharacterSprite({
      coat: '#7a2f4b',
      trim: '#d67a8c',
      hat: '#2a1c30',
      accessory: '#f0d066',
      skin: '#f1c7a2',
    }),
    anchor: { x: 0.5, y: 0.88 },
    scale: 0.72,
  },
  'npc-conductor': {
    src: createCharacterSprite({
      coat: '#2f486f',
      trim: '#7fa6ff',
      hat: '#1f2d48',
      accessory: '#f0d066',
      skin: '#f2c89e',
    }),
    anchor: { x: 0.5, y: 0.88 },
    scale: 0.72,
  },
  'npc-mechanic': {
    src: createCharacterSprite({
      coat: '#72512c',
      trim: '#d9a164',
      hat: '#3b2816',
      accessory: '#f0d066',
      skin: '#f1c7a2',
    }),
    anchor: { x: 0.5, y: 0.88 },
    scale: 0.72,
  },
  'npc-engineer': {
    src: createCharacterSprite({
      coat: '#2f6a6a',
      trim: '#7fded1',
      hat: '#204747',
      accessory: '#f0d066',
      skin: '#f2c89e',
    }),
    anchor: { x: 0.5, y: 0.88 },
    scale: 0.72,
  },
  'door-indicator': {
    src: createDoorIndicatorSprite({
      primary: '#ffd166',
      glow: '#ffd166',
    }),
    anchor: { x: 0.5, y: 0.8 },
    scale: 0.7,
  },
  'object-luggage': {
    src: createLuggageSprite({
      shell: '#394760',
      straps: '#ffd166',
    }),
    anchor: { x: 0.5, y: 0.8 },
    scale: 0.68,
  },
  'object-panel': {
    src: createPanelSprite({
      body: '#293243',
      glow: '#55d0ff',
      accent: '#ffd166',
    }),
    anchor: { x: 0.5, y: 0.8 },
    scale: 0.68,
  },
  'object-seat': {
    src: createSeatSprite({
      cushion: '#7a2f4b',
      frame: '#394760',
      stripe: '#ffd166',
    }),
    anchor: { x: 0.5, y: 0.78 },
    scale: 0.68,
  },
  'object-console': {
    src: createConsoleSprite({
      body: '#2f3d56',
      screen: '#4cc0ff',
      trims: '#ffd166',
    }),
    anchor: { x: 0.5, y: 0.8 },
    scale: 0.7,
  },
};
