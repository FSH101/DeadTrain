export class GameState {
  constructor(world) {
    this.world = world;
    this.reset();
  }

  reset() {
    this.currentSceneId = this.world.startScene;
    this.flags = new Set();
    this.visitedScenes = new Set();
    this.objectInteractions = new Set();
    this.completedScripts = new Set();
    this.endingId = null;
  }

  getSceneId() {
    return this.currentSceneId;
  }

  setScene(sceneId) {
    this.currentSceneId = sceneId;
  }

  markSceneVisited(sceneId) {
    if (sceneId) {
      this.visitedScenes.add(sceneId);
    }
  }

  hasVisitedScene(sceneId) {
    return this.visitedScenes.has(sceneId);
  }

  setFlag(flag) {
    if (flag) {
      this.flags.add(flag);
    }
  }

  clearFlag(flag) {
    this.flags.delete(flag);
  }

  hasFlag(flag) {
    return this.flags.has(flag);
  }

  getFlags() {
    return Array.from(this.flags);
  }

  markObjectInteracted(objectId) {
    if (objectId) {
      this.objectInteractions.add(objectId);
    }
  }

  hasObjectInteraction(objectId) {
    return this.objectInteractions.has(objectId);
  }

  markScriptCompleted(scriptId) {
    if (scriptId) {
      this.completedScripts.add(scriptId);
    }
  }

  hasScriptCompleted(scriptId) {
    return this.completedScripts.has(scriptId);
  }

  meetsRequirements(requires = [], forbids = []) {
    if (requires && requires.some((flag) => !this.hasFlag(flag))) {
      return false;
    }

    if (forbids && forbids.some((flag) => this.hasFlag(flag))) {
      return false;
    }

    return true;
  }

  setEnding(endingId) {
    this.endingId = endingId ?? null;
  }

  getEnding() {
    return this.endingId;
  }
}
