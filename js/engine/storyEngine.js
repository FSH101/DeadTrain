export class StoryEngine {
  constructor(story) {
    if (!story || !story.start || !story.wagons) {
      throw new Error('Story data must include "start" and "wagons" sections.');
    }

    this.story = story;
    this.finished = false;
    this.currentLocation = null;

    this.restart();
  }

  restart() {
    this.finished = false;
    this._setLocation(this.story.start);
    this._syncTransitions();
  }

  isFinished() {
    return this.finished;
  }

  getCurrentLocation() {
    if (!this.currentLocation) {
      return null;
    }

    return this._cloneLocation(this.currentLocation);
  }

  getStartLocation() {
    return this._cloneLocation(this.story.start);
  }

  getCurrentWagon() {
    if (this.finished || !this.currentLocation) {
      return null;
    }

    return this.story.wagons[this.currentLocation.wagonId] ?? null;
  }

  getCurrentNode() {
    if (this.finished || !this.currentLocation) {
      return null;
    }

    const wagon = this.getCurrentWagon();

    if (!wagon || !wagon.nodes) {
      throw new Error(`Wagon "${this.currentLocation.wagonId}" is not defined in the story data.`);
    }

    const node = wagon.nodes[this.currentLocation.nodeId];

    if (!node) {
      throw new Error(
        `Node "${this.currentLocation.nodeId}" is not defined in wagon "${this.currentLocation.wagonId}".`
      );
    }

    return node;
  }

  advance() {
    const node = this.getCurrentNode();

    if (!node) {
      return false;
    }

    if (node.type !== 'text') {
      throw new Error('advance() can only be used when the current node is of type "text".');
    }

    if (node.next === undefined || node.next === null) {
      this.complete();
      return false;
    }

    this._goTo(node.next);
    return true;
  }

  choose(optionIndex) {
    const node = this.getCurrentNode();

    if (!node) {
      return;
    }

    if (node.type !== 'choice') {
      throw new Error('choose() can only be used when the current node is of type "choice".');
    }

    const option = node.options?.[optionIndex];

    if (!option) {
      throw new Error(`Choice option with index ${optionIndex} is not defined.`);
    }

    if (option.next === undefined || option.next === null) {
      this.complete();
      return;
    }

    this._goTo(option.next);
  }

  goTo(reference) {
    if (reference === 'start') {
      this.restart();
      return;
    }

    this.finished = false;
    this._setLocation(this._resolveReference(reference));
    this._syncTransitions();
  }

  complete() {
    this.finished = true;
    this.currentLocation = null;
  }

  _goTo(reference) {
    this.finished = false;
    this._setLocation(this._resolveReference(reference));
    this._syncTransitions();
  }

  _setLocation(location) {
    const nextLocation = this._cloneLocation(location);
    this._assertLocation(nextLocation);
    this.currentLocation = nextLocation;
  }

  _cloneLocation(location) {
    return {
      wagonId: location.wagonId,
      nodeId: location.nodeId,
    };
  }

  _resolveReference(reference) {
    if (reference === 'start') {
      return this._cloneLocation(this.story.start);
    }

    if (typeof reference === 'string') {
      const inferredLocation = {
        wagonId: this.currentLocation?.wagonId ?? this.story.start.wagonId,
        nodeId: reference,
      };

      this._assertLocation(inferredLocation);
      return inferredLocation;
    }

    if (reference && typeof reference === 'object') {
      const wagonId = reference.wagonId ?? this.currentLocation?.wagonId ?? this.story.start.wagonId;
      const nodeId = reference.nodeId;

      if (!nodeId) {
        throw new Error('Node reference is missing required "nodeId" field.');
      }

      const resolvedLocation = { wagonId, nodeId };
      this._assertLocation(resolvedLocation);
      return resolvedLocation;
    }

    throw new Error('Unsupported reference type provided to the story engine.');
  }

  _assertLocation(location) {
    const wagon = this.story.wagons[location.wagonId];

    if (!wagon) {
      throw new Error(`Unknown wagon id "${location.wagonId}".`);
    }

    if (!wagon.nodes || !wagon.nodes[location.nodeId]) {
      throw new Error(`Unknown node id "${location.nodeId}" for wagon "${location.wagonId}".`);
    }
  }

  _syncTransitions() {
    while (!this.finished) {
      const node = this.getCurrentNode();

      if (!node || node.type !== 'transition') {
        break;
      }

      const target = node.target ?? node.next;

      if (target === undefined || target === null) {
        this.complete();
        break;
      }

      this._setLocation(this._resolveReference(target));
    }
  }
}
