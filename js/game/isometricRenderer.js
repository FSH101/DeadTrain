export class IsometricRenderer {
  constructor(stageElement, world, onInteract) {
    this.stageElement = stageElement;
    this.world = world;
    this.onInteract = onInteract;
    this.tileWidth = world?.tileSize?.width ?? 104;
    this.tileHeight = world?.tileSize?.height ?? 60;
  }

  renderScene(scene, state) {
    if (!this.stageElement) {
      return;
    }

    this.stageElement.replaceChildren();

    if (!scene) {
      return;
    }

    const metrics = this._computeMetrics(scene);
    this.stageElement.style.width = `${metrics.width}px`;
    this.stageElement.style.height = `${metrics.height}px`;
    this.stageElement.dataset.sceneId = scene.id ?? '';

    const tilesFragment = document.createDocumentFragment();

    for (let y = 0; y < scene.height; y += 1) {
      for (let x = 0; x < scene.width; x += 1) {
        const tileType = scene.floor?.[y]?.[x] ?? 'floor-steel';
        const tileElement = this._createTile(tileType);
        const position = this._calculatePosition(x, y, metrics);

        tileElement.style.left = `${position.x}px`;
        tileElement.style.top = `${position.y}px`;
        tileElement.style.zIndex = `${position.z}`;
        tilesFragment.appendChild(tileElement);
      }
    }

    this.stageElement.appendChild(tilesFragment);

    if (!Array.isArray(scene.objects)) {
      return;
    }

    const objectsFragment = document.createDocumentFragment();

    scene.objects.forEach((object) => {
      if (!object || !object.position) {
        return;
      }

      const element = this._createObjectElement(object, metrics, state);
      objectsFragment.appendChild(element);
    });

    this.stageElement.appendChild(objectsFragment);
  }

  updateScene(scene, state) {
    this.renderScene(scene, state);
  }

  _createTile(tileType) {
    const tile = document.createElement('div');
    tile.className = `iso-tile iso-tile--${tileType}`;
    tile.setAttribute('aria-hidden', 'true');
    return tile;
  }

  _createObjectElement(object, metrics, state) {
    const isInteractive = Boolean(object.scriptId);
    const element = document.createElement(isInteractive ? 'button' : 'div');

    element.classList.add('iso-object', `iso-object--${object.sprite ?? 'generic'}`);

    if (isInteractive) {
      element.type = 'button';
      element.classList.add('iso-object--interactive');
      element.dataset.objectId = object.id;
      element.setAttribute('aria-label', object.label ?? '');
      element.title = object.label ?? '';
      element.addEventListener('pointerup', (event) => {
        event.preventDefault();
        this._notifyInteraction(element);
      });
      element.addEventListener('pointerdown', (event) => {
        event.preventDefault();
      });
    } else if (object.label) {
      element.setAttribute('aria-hidden', 'true');
      element.title = object.label;
    }

    const position = this._calculatePosition(object.position.x, object.position.y, metrics);
    const elevation = Number(object.position.z ?? 0);

    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
    element.style.zIndex = `${200 + position.z + elevation}`;

    if (Array.isArray(object.stateClasses) && state) {
      object.stateClasses.forEach((descriptor) => {
        if (!descriptor?.className) {
          return;
        }

        const requires = descriptor.requires ?? [];
        const forbids = descriptor.requiresNot ?? [];

        if (state.meetsRequirements(requires, forbids)) {
          element.classList.add(descriptor.className);
        }
      });
    }

    return element;
  }

  _notifyInteraction(element) {
    const objectId = element?.dataset?.objectId;

    if (!objectId) {
      return;
    }

    if (typeof this.onInteract === 'function') {
      this.onInteract(objectId);
    }
  }

  _computeMetrics(scene) {
    const width = (scene.width + scene.height) * (this.tileWidth / 2);
    const height = (scene.width + scene.height) * (this.tileHeight / 2) + this.tileHeight;
    const originX = width / 2;
    const originY = this.tileHeight / 2;

    return { width, height, originX, originY };
  }

  _calculatePosition(x, y, metrics) {
    const isoX = (x - y) * (this.tileWidth / 2);
    const isoY = (x + y) * (this.tileHeight / 2);

    return {
      x: metrics.originX + isoX,
      y: metrics.originY + isoY,
      z: Math.floor(x + y),
    };
  }
}
