import type {
  GameConfig,
  GameFlags,
  InteractionTarget,
  Intent,
  Inventory,
  IsoPoint,
  TrainState,
  WagonLayerData,
} from '../types';

export interface PlayerState {
  position: IsoPoint;
  facing: number;
  speed: number;
  path: IsoPoint[];
  isMoving: boolean;
  pendingIntent: Intent | null;
}

export interface MarkerState {
  visible: boolean;
  position: IsoPoint | null;
  pulse: number;
}

export interface GameRuntimeState {
  config: GameConfig;
  train: TrainState;
  wagon: WagonLayerData;
  flags: GameFlags;
  inventory: Inventory;
  player: PlayerState;
  marker: MarkerState;
  currentTargets: InteractionTarget[];
  isInputBlocked: boolean;
}

export const createInitialPlayerState = (spawn: IsoPoint): PlayerState => ({
  position: { ...spawn },
  facing: 0,
  speed: 1.2,
  path: [],
  isMoving: false,
  pendingIntent: null,
});

export const createMarkerState = (): MarkerState => ({
  visible: false,
  position: null,
  pulse: 0,
});

export const createRuntimeState = (
  config: GameConfig,
  wagon: WagonLayerData,
  train: TrainState,
): GameRuntimeState => ({
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
