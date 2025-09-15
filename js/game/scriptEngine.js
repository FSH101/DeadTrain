export class ScriptEngine {
  constructor(script, context) {
    this.script = script;
    this.dialogue = context.dialogue;
    this.state = context.state;
    this.applyEffect = context.applyEffect;
    this.onComplete = context.onComplete;
    this.currentNodeId = null;
  }

  start() {
    if (!this.script?.nodes || !this.script.start) {
      this._finish();
      return;
    }

    this._goToNode(this.script.start);
  }

  _goToNode(nodeId) {
    if (!nodeId) {
      this._finish();
      return;
    }

    const node = this.script.nodes[nodeId];

    if (!node) {
      this._finish();
      return;
    }

    this.currentNodeId = nodeId;

    if (Array.isArray(node.effects) && node.effects.length > 0) {
      const stopHere = this._applyEffects(node.effects);
      if (stopHere) {
        return;
      }
    }

    if (node.type === 'choice') {
      this._showChoiceNode(node);
      return;
    }

    this._showTextNode(node);
  }

  _showTextNode(node) {
    this.dialogue?.showText(node, {
      onAdvance: () => {
        if (node.next === undefined || node.next === null) {
          this._finish();
        } else {
          this._goToNode(node.next);
        }
      },
    });
  }

  _showChoiceNode(node) {
    const options = Array.isArray(node.options) ? node.options : [];
    const filtered = options.filter((option) => this._isOptionAvailable(option));

    this.dialogue?.showChoice(node, filtered, {
      onSelect: (index) => {
        const option = filtered[index];

        if (!option) {
          return;
        }

        if (Array.isArray(option.effects) && option.effects.length > 0) {
          const stopHere = this._applyEffects(option.effects);
          if (stopHere) {
            return;
          }
        }

        if (option.next === undefined || option.next === null) {
          this._finish();
        } else {
          this._goToNode(option.next);
        }
      },
    });
  }

  _isOptionAvailable(option) {
    const requires = option.requires ?? [];
    const forbids = option.requiresNot ?? [];

    if (requires.length === 0 && forbids.length === 0) {
      return true;
    }

    if (!this.state) {
      return requires.length === 0;
    }

    return this.state.meetsRequirements(requires, forbids);
  }

  _applyEffects(effects) {
    if (!effects || effects.length === 0) {
      return false;
    }

    let stopScript = false;

    effects.forEach((effect) => {
      if (typeof this.applyEffect === 'function') {
        const result = this.applyEffect(effect) ?? {};
        if (result.stopScript) {
          stopScript = true;
        }
      }
    });

    if (stopScript) {
      this._finish();
    }

    return stopScript;
  }

  _finish() {
    this.dialogue?.close();
    this.onComplete?.();
  }
}
