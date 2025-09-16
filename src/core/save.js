/** @typedef {import('../game/GameState.js').GameRuntimeState} GameRuntimeState */
/** @typedef {import('../types.js').GameSaveData} GameSaveData */

const STORAGE_PREFIX = 'dead-train-save';

const buildKey = (userId) => `${STORAGE_PREFIX}:${userId}`;

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;

export const loadSave = (userId) => {
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(buildKey(userId));
    if (!raw) {
      return null;
    }
    const data = JSON.parse(raw);
    return data;
  } catch (error) {
    console.error('Failed to parse save data', error);
    return null;
  }
};

export const persistSave = (userId, data) => {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(buildKey(userId), JSON.stringify(data));
  } catch (error) {
    console.error('Failed to write save data', error);
  }
};

export const createSaveFromState = (state) => ({
  wagonId: state.train.currentWagonId,
  position: state.player.position,
  flags: Array.from(state.flags.story),
  endings: Array.from(state.flags.endings),
  inventory: state.inventory,
  timestamp: Date.now(),
});

export const applySaveToState = (state, save) => {
  state.train.currentWagonId = save.wagonId;
  state.player.position = save.position;
  state.flags.story = new Set(save.flags);
  state.flags.endings = new Set(save.endings);
  state.inventory = save.inventory;
};
