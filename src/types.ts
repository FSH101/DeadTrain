export type IsoPoint = {
  x: number;
  y: number;
  z?: number;
};

export type ScreenPoint = {
  x: number;
  y: number;
};

export type IntentType = 'MoveTo' | 'Interact' | 'Inspect';

export type InteractionKind = 'door' | 'npc' | 'object';

export interface Intent {
  type: IntentType;
  target: InteractionTarget | null;
  destination?: IsoPoint;
}

export interface InteractionTarget {
  id: string;
  kind: InteractionKind;
  position: IsoPoint;
  radius: number;
  metadata?: Record<string, unknown>;
}

export type LayerTile = {
  tileId: string;
  position: IsoPoint;
  elevation?: number;
  decalId?: string;
  rotation?: number;
  tint?: string;
};

export interface NavNode {
  id: string;
  point: IsoPoint;
  neighbors: string[];
}

export interface LightZone {
  id: string;
  center: IsoPoint;
  radius: number;
  intensity: number;
  flicker?: boolean;
}

export interface DoorDescriptor {
  id: string;
  label: string;
  targetWagonId: string;
  spawnPoint: IsoPoint;
  position: IsoPoint;
  radius: number;
  lockedByFlag?: string;
  blockedIfFlag?: string;
  openByDefault?: boolean;
}

export interface NpcDescriptor {
  id: string;
  name: string;
  position: IsoPoint;
  radius: number;
  dialogueId: string;
  idleAnimation?: 'static' | 'loop';
}

export interface InteractiveObjectDescriptor {
  id: string;
  label: string;
  position: IsoPoint;
  radius: number;
  onUse: string;
}

export interface WagonLayerData {
  id: string;
  title: string;
  floor: LayerTile[];
  walls: LayerTile[];
  decals: LayerTile[];
  navmesh: IsoPoint[];
  spawn: IsoPoint;
  doors: DoorDescriptor[];
  npcs: NpcDescriptor[];
  objects: InteractiveObjectDescriptor[];
  hints?: { position: IsoPoint; message: string }[];
  lights?: LightZone[];
  ambient?: 'dark' | 'normal';
}

export interface TrainGraphDescriptor {
  startWagonId: string;
  wagons: WagonLayerData[];
}

export type DialogueChoice = {
  id: string;
  label: string;
  next: string | null;
  setFlag?: string;
  requiresFlag?: string;
  requiresItem?: string;
  giveItem?: string;
  removeItem?: string;
  haptic?: 'success' | 'warning' | 'impact';
};

export type DialogueNode =
  | {
      id: string;
      type: 'line';
      speaker: string;
      text: string;
      next: string | null;
      setFlag?: string;
      requiresFlag?: string;
      requiresItem?: string;
    }
  | {
      id: string;
      type: 'choice';
      speaker: string;
      text: string;
      options: DialogueChoice[];
    }
  | {
      id: string;
      type: 'ending';
      title: string;
      text: string;
      endingId: string;
    };

export interface DialogueScript {
  id: string;
  nodes: DialogueNode[];
}

export type Inventory = Record<string, number>;

export interface GameFlags {
  story: Set<string>;
  endings: Set<string>;
}

export interface GameSaveData {
  wagonId: string;
  position: IsoPoint;
  flags: string[];
  endings: string[];
  inventory: Inventory;
  timestamp: number;
}

export interface GameConfig {
  virtualWidth: number;
  virtualHeight: number;
  tileWidth: number;
  tileHeight: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  duration: number;
}

export interface TrainDoorState {
  id: string;
  state: 'open' | 'locked' | 'blocked';
}

export interface WagonState {
  id: string;
  doorStates: TrainDoorState[];
}

export interface TrainState {
  currentWagonId: string;
  wagons: WagonState[];
}
