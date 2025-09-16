/** @typedef {import('../types.js').GameConfig} GameConfig */
/** @typedef {import('../types.js').GameFlags} GameFlags */
/** @typedef {import('../types.js').InteractionTarget} InteractionTarget */
/** @typedef {import('../types.js').Intent} Intent */
/** @typedef {import('../types.js').Inventory} Inventory */
/** @typedef {import('../types.js').IsoPoint} IsoPoint */
/** @typedef {import('../types.js').TrainState} TrainState */
/** @typedef {import('../types.js').WagonLayerData} WagonLayerData */

/**
 * @typedef {Object} PlayerState
 * @property {IsoPoint} position
 * @property {number} facing
 * @property {number} speed
 * @property {IsoPoint[]} path
 * @property {boolean} isMoving
 * @property {Intent | null} pendingIntent
 * @property {string} spriteId
 */

/**
 * @typedef {Object} MarkerState
 * @property {boolean} visible
 * @property {IsoPoint | null} position
 * @property {number} pulse
 */

/**
 * @typedef {Object} GameRuntimeState
 * @property {GameConfig} config
 * @property {TrainState} train
 * @property {WagonLayerData} wagon
 * @property {GameFlags} flags
 * @property {Inventory} inventory
 * @property {PlayerState} player
 * @property {MarkerState} marker
 * @property {InteractionTarget[]} currentTargets
 * @property {boolean} isInputBlocked
 */

export const createInitialPlayerState = (spawn) => ({
  position: { ...spawn },
  facing: 0,
  speed: 1.2,
  path: [],
  isMoving: false,
  pendingIntent: null,
  spriteId: 'player',
});

export const createMarkerState = () => ({
  visible: false,
  position: null,
  pulse: 0,
});

export const createRuntimeState = (config, wagon, train) => ({
  config,
  wagon,
  train,
  flags: { story: new Set(), endings: new Set() },
  inventory: {},
  player: createInitialPlayerState(wagon.spawn),
  marker: createMarkerState(),
  currentTargets: [],
  isInputBlocked: false,
});
