import { nanoid } from 'nanoid';
import type {
  DoorDescriptor,
  TrainDoorState,
  TrainGraphDescriptor,
  TrainState,
  WagonLayerData,
  WagonState,
} from '../types';

export class TrainGraph {
  private readonly wagonsById: Map<string, WagonLayerData> = new Map();

  private state: TrainState;

  constructor(private readonly descriptor: TrainGraphDescriptor) {
    descriptor.wagons.forEach((wagon) => {
      this.wagonsById.set(wagon.id, wagon);
    });
    this.state = {
      currentWagonId: descriptor.startWagonId,
      wagons: descriptor.wagons.map((wagon) => ({
        id: wagon.id,
        doorStates: wagon.doors.map((door) => ({
          id: door.id,
          state: this.resolveDoorInitialState(door),
        })),
      })),
    };
  }

  getState(): TrainState {
    return this.state;
  }

  getCurrentWagon(): WagonLayerData {
    const wagon = this.wagonsById.get(this.state.currentWagonId);
    if (!wagon) {
      throw new Error(`Unknown wagon ${this.state.currentWagonId}`);
    }
    return wagon;
  }

  getWagon(id: string): WagonLayerData {
    const wagon = this.wagonsById.get(id);
    if (!wagon) {
      throw new Error(`Unknown wagon ${id}`);
    }
    return wagon;
  }

  getAllWagons(): WagonLayerData[] {
    return Array.from(this.wagonsById.values());
  }

  getDoorState(wagonId: string, doorId: string): TrainDoorState {
    const wagonState = this.state.wagons.find((w) => w.id === wagonId);
    if (!wagonState) {
      throw new Error(`Missing wagon state ${wagonId}`);
    }
    const doorState = wagonState.doorStates.find((door) => door.id === doorId);
    if (!doorState) {
      throw new Error(`Missing door state ${doorId}`);
    }
    return doorState;
  }

  setDoorState(wagonId: string, doorId: string, state: TrainDoorState['state']): void {
    const wagonState = this.state.wagons.find((w) => w.id === wagonId);
    if (!wagonState) {
      throw new Error(`Missing wagon state ${wagonId}`);
    }
    const doorState = wagonState.doorStates.find((door) => door.id === doorId);
    if (!doorState) {
      throw new Error(`Missing door state ${doorId}`);
    }
    doorState.state = state;
  }

  travelTo(wagonId: string): WagonLayerData {
    if (!this.wagonsById.has(wagonId)) {
      throw new Error(`Unknown wagon ${wagonId}`);
    }
    this.state.currentWagonId = wagonId;
    return this.getCurrentWagon();
  }

  rearrange(order: string[]): void {
    const unique = new Set(order);
    if (unique.size !== order.length) {
      throw new Error('Duplicate wagon ids in order');
    }
    this.state.wagons = order.map((id) => {
      const existing = this.state.wagons.find((w) => w.id === id);
      if (existing) {
        return existing;
      }
      const wagon = this.wagonsById.get(id);
      if (!wagon) {
        throw new Error(`Unknown wagon ${id}`);
      }
      return {
        id,
        doorStates: wagon.doors.map((door) => ({
          id: door.id,
          state: this.resolveDoorInitialState(door),
        })),
      } satisfies WagonState;
    });
  }

  registerDoorInstance(wagonId: string, door: DoorDescriptor): TrainDoorState {
    const wagonState = this.state.wagons.find((w) => w.id === wagonId);
    if (!wagonState) {
      throw new Error(`Missing wagon state for ${wagonId}`);
    }
    let doorState = wagonState.doorStates.find((d) => d.id === door.id);
    if (!doorState) {
      doorState = {
        id: door.id || nanoid(),
        state: this.resolveDoorInitialState(door),
      } satisfies TrainDoorState;
      wagonState.doorStates.push(doorState);
    }
    return doorState;
  }

  private resolveDoorInitialState(door: DoorDescriptor): TrainDoorState['state'] {
    if (door.blockedIfFlag) {
      return 'blocked';
    }
    if (door.lockedByFlag) {
      return door.openByDefault ? 'open' : 'locked';
    }
    return 'open';
  }
}
