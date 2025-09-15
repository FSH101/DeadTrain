import { world } from './worldData.js';
import { GameState } from './gameState.js';
import { IsometricRenderer } from './isometricRenderer.js';
import { DialoguePanel } from './dialoguePanel.js';
import { ScriptEngine } from './scriptEngine.js';

export class GameController {
  constructor({ stageElement, dialogueElement, hud } = {}) {
    this.world = world;
    this.stageElement = stageElement;
    this.dialogueElement = dialogueElement;
    this.state = new GameState(this.world);
    this.renderer = new IsometricRenderer(this.stageElement, this.world, (objectId) =>
      this._handleObjectInteraction(objectId)
    );
    this.dialogue = new DialoguePanel(this.dialogueElement);
    this.activeScript = null;
    this.hudElements = {
      title: hud?.title ?? null,
      subtitle: hud?.subtitle ?? null,
      flagList: hud?.flagList ?? null,
    };
  }

  start() {
    this.restart();
  }

  restart() {
    this.dialogue.close();
    this.activeScript = null;
    this.state.reset();
    this._updateHudFlags();
    this._enterScene(this.state.getSceneId(), { runEntry: true });
  }

  _enterScene(sceneId, { runEntry = true } = {}) {
    const scene = this.world.scenes?.[sceneId];

    if (!scene) {
      return;
    }

    this.state.setScene(sceneId);
    this.state.markSceneVisited(sceneId);

    this.renderer.renderScene(scene, this.state);
    this._updateHudScene(scene);
    this._updateHudFlags();

    if (runEntry) {
      this._runSceneEntryScript(scene);
    }
  }

  _runSceneEntryScript(scene) {
    const entry = scene.entry;

    if (!entry?.scriptId) {
      return;
    }

    this.runScript(entry.scriptId, { once: Boolean(entry.once) });
  }

  runScript(scriptId, { once = false } = {}) {
    if (!scriptId) {
      return;
    }

    if (once && this.state.hasScriptCompleted(scriptId)) {
      return;
    }

    const script = this.world.scripts?.[scriptId];

    if (!script) {
      return;
    }

    this._cancelActiveScript();

    this.activeScript = new ScriptEngine(script, {
      dialogue: this.dialogue,
      state: this.state,
      applyEffect: (effect) => this._applyEffect(effect),
      onComplete: () => {
        this.state.markScriptCompleted(scriptId);
        this.activeScript = null;
        this._updateHudFlags();
      },
    });

    this.activeScript.start();
  }

  _handleObjectInteraction(objectId) {
    const sceneId = this.state.getSceneId();
    const scene = this.world.scenes?.[sceneId];

    if (!scene || !Array.isArray(scene.objects)) {
      return;
    }

    const object = scene.objects.find((item) => item.id === objectId);

    if (!object) {
      return;
    }

    const alreadyInteracted = this.state.hasObjectInteraction(objectId);
    let scriptId = object.scriptId;

    if (alreadyInteracted) {
      if (object.repeatScriptId) {
        scriptId = object.repeatScriptId;
      } else if (object.once) {
        return;
      }
    }

    this.state.markObjectInteracted(objectId);

    if (scriptId) {
      this.runScript(scriptId, { once: Boolean(object.once) });
    }
  }

  _applyEffect(effect) {
    if (!effect || typeof effect !== 'object') {
      return {};
    }

    switch (effect.type) {
      case 'setFlag':
        this.state.setFlag(effect.flag);
        this._updateHudFlags();
        this._refreshScene();
        return {};
      case 'clearFlag':
        this.state.clearFlag(effect.flag);
        this._updateHudFlags();
        this._refreshScene();
        return {};
      case 'goToScene':
        if (effect.sceneId) {
          this._enterScene(effect.sceneId, { runEntry: true });
          return { stopScript: true };
        }
        return {};
      case 'triggerEnding':
        if (effect.endingId) {
          this._showEnding(effect.endingId);
          return { stopScript: true };
        }
        return {};
      default:
        return {};
    }
  }

  _showEnding(endingId) {
    const ending = this.world.endings?.[endingId];

    if (!ending) {
      return;
    }

    this.state.setEnding(endingId);
    this._cancelActiveScript();

    this.dialogue.showEnding(ending, {
      onAction: (action) => {
        switch (action?.action) {
          case 'restart':
            this.restart();
            break;
          case 'close':
          default:
            this.dialogue.close();
            break;
        }
      },
    });
  }

  _cancelActiveScript() {
    if (this.activeScript) {
      this.activeScript = null;
    }

    this.dialogue.close();
  }

  _refreshScene() {
    const sceneId = this.state.getSceneId();
    const scene = this.world.scenes?.[sceneId];

    if (scene) {
      this.renderer.updateScene(scene, this.state);
    }
  }

  _updateHudScene(scene) {
    if (this.hudElements.title) {
      this.hudElements.title.textContent = scene.title ?? '';
    }

    if (this.hudElements.subtitle) {
      this.hudElements.subtitle.textContent = scene.subtitle ?? '';
    }
  }

  _updateHudFlags() {
    const container = this.hudElements.flagList;

    if (!container) {
      return;
    }

    container.replaceChildren();

    const activeFlags = this.state
      .getFlags()
      .map((flag) => ({ id: flag, meta: this.world.flags?.[flag] }))
      .filter((item) => item.meta?.visible !== false);

    if (activeFlags.length === 0) {
      const hint = document.createElement('span');
      hint.className = 'hud-flags__empty';
      hint.textContent = 'Следы ещё не найдены';
      container.appendChild(hint);
      return;
    }

    activeFlags.forEach(({ id, meta }) => {
      const badge = document.createElement('span');
      badge.className = 'hud-flag';
      badge.textContent = meta?.label ?? id;

      if (meta?.description) {
        badge.title = meta.description;
      }

      container.appendChild(badge);
    });
  }
}
