export class DomRenderer {
  constructor(container, engine) {
    if (!container) {
      throw new Error('DomRenderer requires a valid container element.');
    }

    this.container = container;
    this.engine = engine;
    this.currentWagonId = null;
    this._transitionCleanupHandle = null;
    this._motionQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    this._wagonPositions = this._buildWagonPositions();
  }

  render() {
    const previousWagonId = this.currentWagonId;

    this._clearTransitionState();
    this.container.innerHTML = '';
    this.container.removeAttribute('data-wagon-id');
    this.currentWagonId = null;

    if (!this.engine || this.engine.isFinished()) {
      this._renderFinishedState();
      this._applyWagonTransition(previousWagonId, this.currentWagonId);
      return;
    }

    const wagon = this.engine.getCurrentWagon();
    const node = this.engine.getCurrentNode();

    if (!node) {
      this._renderFinishedState();
      this._applyWagonTransition(previousWagonId, this.currentWagonId);
      return;
    }

    if (wagon?.id) {
      this.container.dataset.wagonId = wagon.id;
      this.currentWagonId = wagon.id;

      if (!this._wagonPositions.has(wagon.id)) {
        this._wagonPositions = this._buildWagonPositions();
      }
    }

    if (wagon?.title) {
      const title = document.createElement('h2');
      title.className = 'wagon-title';
      title.textContent = wagon.title;
      this.container.appendChild(title);
    }

    if (wagon?.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'wagon-subtitle';
      subtitle.textContent = wagon.subtitle;
      this.container.appendChild(subtitle);
    }

    switch (node.type) {
      case 'text':
        this._renderTextNode(node);
        break;
      case 'choice':
        this._renderChoiceNode(node);
        break;
      case 'ending':
        this._renderEndingNode(node);
        break;
      default:
        this._renderUnknownNode(node);
        break;
    }

    this._applyWagonTransition(previousWagonId, this.currentWagonId);
  }

  _renderTextNode(node) {
    this._appendParagraph(node.content, 'step-text');

    if (node.note) {
      this._appendParagraph(node.note, 'step-note');
    }

    const actions = this._createActionsContainer();
    const button = this._createButton(node.nextLabel ?? 'Далее');

    button.addEventListener('click', () => {
      this.engine.advance();
      this.render();
    });

    actions.appendChild(button);
    this.container.appendChild(actions);
  }

  _renderChoiceNode(node) {
    if (node.prompt) {
      this._appendParagraph(node.prompt, 'step-question');
    }

    if (node.description) {
      this._appendParagraph(node.description, 'step-note');
    }

    const options = Array.isArray(node.options) ? node.options : [];
    let hideActions = false;

    if (node.scene) {
      hideActions = Boolean(node.scene.hideActions);
      this._renderScene(node.scene, options);
    }

    const actions = this._createActionsContainer();

    if (hideActions) {
      actions.classList.add('story-actions--visually-hidden');
    }

    options.forEach((option, index) => {
      const button = this._createButton(option.text);

      button.addEventListener('click', () => {
        this.engine.choose(index);
        this.render();
      });

      actions.appendChild(button);

      if (option.description) {
        const hint = document.createElement('span');
        hint.className = 'option-description';
        hint.textContent = option.description;
        button.appendChild(hint);
      }
    });

    this.container.appendChild(actions);
  }

  _renderEndingNode(node) {
    this._appendParagraph(node.content, 'step-text');

    if (node.note) {
      this._appendParagraph(node.note, 'step-note');
    }

    const actions = this._createActionsContainer(true);
    const availableActions = Array.isArray(node.actions) && node.actions.length > 0
      ? node.actions
      : [{ text: 'Начать заново', target: 'start' }];

    availableActions.forEach((action) => {
      const button = this._createButton(action.text);

      button.addEventListener('click', () => {
        if (action.target === undefined || action.target === null) {
          this.engine.complete();
        } else {
          this.engine.goTo(action.target);
        }

        this.render();
      });

      actions.appendChild(button);
    });

    this.container.appendChild(actions);
  }

  _renderUnknownNode(node) {
    const message = document.createElement('p');
    message.className = 'step-text';
    message.textContent = `Неизвестный тип шага: ${node.type ?? '—'}.`;
    this.container.appendChild(message);

    const actions = this._createActionsContainer();
    const restartButton = this._createButton('Вернуться в начало');

    restartButton.addEventListener('click', () => {
      this.engine.restart();
      this.render();
    });

    actions.appendChild(restartButton);
    this.container.appendChild(actions);
  }

  _renderFinishedState() {
    const message = document.createElement('p');
    message.className = 'step-text';
    message.textContent = 'Путь завершён. Ты можешь вернуться к началу или закрыть глаза.';
    this.container.appendChild(message);

    const actions = this._createActionsContainer(true);
    const restartButton = this._createButton('Проснуться заново');

    restartButton.addEventListener('click', () => {
      this.engine.restart();
      this.render();
    });

    actions.appendChild(restartButton);
    this.container.appendChild(actions);
  }

  _appendParagraph(text, className) {
    const paragraph = document.createElement('p');
    paragraph.className = className;
    paragraph.textContent = text;
    this.container.appendChild(paragraph);
  }

  _createActionsContainer(isEnding = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'story-actions';

    if (isEnding) {
      wrapper.classList.add('story-actions--ending');
    }

    return wrapper;
  }

  _createButton(label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'story-action';
    button.textContent = label;
    return button;
  }

  _renderScene(scene, options) {
    if (!scene?.image) {
      return;
    }

    const figure = document.createElement('figure');
    figure.className = 'story-scene';

    if (scene.label) {
      figure.setAttribute('aria-label', scene.label);
    }

    const image = document.createElement('img');
    image.className = 'story-scene__image';
    image.src = scene.image;
    image.alt = scene.alt ?? '';
    figure.appendChild(image);

    const overlay = document.createElement('div');
    overlay.className = 'story-scene__overlay';
    figure.appendChild(overlay);

    if (Array.isArray(scene.hotspots)) {
      scene.hotspots.forEach((hotspot) => {
        if (typeof hotspot.optionIndex !== 'number') {
          return;
        }

        const option = options?.[hotspot.optionIndex];

        if (!option) {
          return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = ['scene-hotspot', hotspot.className].filter(Boolean).join(' ');

        const accessibleLabel = hotspot.label ?? option.text;

        if (accessibleLabel) {
          button.setAttribute('aria-label', accessibleLabel);
        }

        if (hotspot.left) {
          button.style.left = hotspot.left;
        }

        if (hotspot.right) {
          button.style.right = hotspot.right;
        }

        if (hotspot.top) {
          button.style.top = hotspot.top;
        }

        if (hotspot.bottom) {
          button.style.bottom = hotspot.bottom;
        }

        if (hotspot.width) {
          button.style.width = hotspot.width;
        }

        if (hotspot.height) {
          button.style.height = hotspot.height;
        }

        const alignment = hotspot.align;

        switch (alignment) {
          case 'center':
            button.style.transform = 'translate(-50%, -50%)';
            break;
          case 'center-right':
            button.style.transform = 'translate(0, -50%)';
            break;
          case 'center-left':
            button.style.transform = 'translate(-100%, -50%)';
            break;
          case 'top-center':
            button.style.transform = 'translate(-50%, 0)';
            break;
          case 'bottom-center':
            button.style.transform = 'translate(-50%, -100%)';
            break;
          case 'bottom-right':
            button.style.transform = 'translate(-100%, -100%)';
            break;
          default:
            break;
        }

        const label = document.createElement('span');
        label.className = 'scene-hotspot__label';
        label.textContent = hotspot.text ?? option.text ?? '';
        button.appendChild(label);

        button.addEventListener('click', () => {
          this.engine.choose(hotspot.optionIndex);
          this.render();
        });

        overlay.appendChild(button);
      });
    }

    this.container.appendChild(figure);

    if (scene.caption) {
      const caption = document.createElement('p');
      caption.className = 'step-note';
      caption.textContent = scene.caption;
      this.container.appendChild(caption);
    }
  }

  _applyWagonTransition(previousWagonId, currentWagonId) {
    if (!previousWagonId || !currentWagonId || previousWagonId === currentWagonId) {
      return;
    }

    this._ensureWagonKnown(previousWagonId);
    this._ensureWagonKnown(currentWagonId);

    const direction = this._inferWagonDirection(previousWagonId, currentWagonId);
    this._triggerWalkingAnimation(direction);
  }

  _triggerWalkingAnimation(direction) {
    if (this._prefersReducedMotion()) {
      return;
    }

    const directionClass = direction === 'back' ? 'story-panel--walk-back' : 'story-panel--walk-forward';
    const classList = this.container.classList;

    classList.remove('story-panel--walk-forward', 'story-panel--walk-back', 'story-panel--transitioning');

    void this.container.offsetWidth;

    classList.add('story-panel--transitioning', directionClass);

    const expectedAnimation = direction === 'back' ? 'corridorWalkBack' : 'corridorWalkForward';

    const clearClasses = () => {
      classList.remove('story-panel--transitioning', 'story-panel--walk-forward', 'story-panel--walk-back');
    };

    const finishTransition = () => {
      clearClasses();

      if (this._transitionCleanupHandle !== null) {
        clearTimeout(this._transitionCleanupHandle);
        this._transitionCleanupHandle = null;
      }
    };

    const handleAnimationEnd = (event) => {
      if (event.target !== this.container || event.animationName !== expectedAnimation) {
        return;
      }

      finishTransition();
    };

    this.container.addEventListener('animationend', handleAnimationEnd, { once: true });

    if (this._transitionCleanupHandle !== null) {
      clearTimeout(this._transitionCleanupHandle);
    }

    this._transitionCleanupHandle = setTimeout(() => {
      clearClasses();
      this._transitionCleanupHandle = null;
    }, 1200);
  }

  _inferWagonDirection(previousId, nextId) {
    const previousIndex = this._wagonPositions?.get(previousId);
    const nextIndex = this._wagonPositions?.get(nextId);

    if (previousIndex === undefined || nextIndex === undefined) {
      return 'forward';
    }

    return nextIndex >= previousIndex ? 'forward' : 'back';
  }

  _clearTransitionState() {
    if (this._transitionCleanupHandle !== null) {
      clearTimeout(this._transitionCleanupHandle);
      this._transitionCleanupHandle = null;
    }

    this.container.classList.remove('story-panel--transitioning', 'story-panel--walk-forward', 'story-panel--walk-back');
  }

  _prefersReducedMotion() {
    return Boolean(this._motionQuery?.matches);
  }

  _ensureWagonKnown(wagonId) {
    if (!wagonId || !this._wagonPositions) {
      return;
    }

    if (!this._wagonPositions.has(wagonId)) {
      this._wagonPositions = this._buildWagonPositions();
    }
  }

  _buildWagonPositions() {
    const wagons = this.engine?.story?.wagons ?? {};
    const entries = Object.keys(wagons).map((id, index) => [id, index]);
    return new Map(entries);
  }
}
