/** @typedef {import('../types.js').DoorDescriptor} DoorDescriptor */
/** @typedef {import('../types.js').TrainDoorState} TrainDoorState */
/** @typedef {import('../types.js').TrainGraphDescriptor} TrainGraphDescriptor */
/** @typedef {import('../types.js').TrainState} TrainState */
/** @typedef {import('../types.js').WagonLayerData} WagonLayerData */

import { nanoid } from 'nanoid';

export class TrainGraph {
  constructor(descriptor) {
    this.descriptor = descriptor;
    this.wagonsById = new Map();
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

  getState() {
    return this.state;
  }

  getCurrentWagon() {
    const wagon = this.wagonsById.get(this.state.currentWagonId);
    if (!wagon) {
      throw new Error(`Unknown wagon ${this.state.currentWagonId}`);
    }
    return wagon;
  }

  getWagon(id) {
    const wagon = this.wagonsById.get(id);
    if (!wagon) {
      throw new Error(`Unknown wagon ${id}`);
    }
    return wagon;
  }

  getAllWagons() {
    return Array.from(this.wagonsById.values());
  }

  getDoorState(wagonId, doorId) {
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

  setDoorState(wagonId, doorId, state) {
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

  travelTo(wagonId) {
    if (!this.wagonsById.has(wagonId)) {
      throw new Error(`Unknown wagon ${wagonId}`);
    }
    this.state.currentWagonId = wagonId;
    return this.getCurrentWagon();
  }

  rearrange(order) {
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
      };
    });
  }

  registerDoorInstance(wagonId, door) {
    const wagonState = this.state.wagons.find((w) => w.id === wagonId);
    if (!wagonState) {
      throw new Error(`Missing wagon state for ${wagonId}`);
    }
    let doorState = wagonState.doorStates.find((d) => d.id === door.id);
    if (!doorState) {
      doorState = {
        id: door.id || nanoid(),
        state: this.resolveDoorInitialState(door),
      };
      wagonState.doorStates.push(doorState);
    }
    return doorState;
  }

  resolveDoorInitialState(door) {
    if (door.blockedIfFlag) {
      return 'blocked';
    }
    if (door.lockedByFlag) {
      return door.openByDefault ? 'open' : 'locked';
    }
    return 'open';
  }
}
