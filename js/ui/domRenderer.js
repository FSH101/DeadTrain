export class DomRenderer {
  constructor(container, engine) {
    if (!container) {
      throw new Error('DomRenderer requires a valid container element.');
    }

    this.container = container;
    this.engine = engine;
  }

  render() {
    this.container.innerHTML = '';
    this.container.removeAttribute('data-wagon-id');

    if (!this.engine || this.engine.isFinished()) {
      this._renderFinishedState();
      return;
    }

    const wagon = this.engine.getCurrentWagon();
    const node = this.engine.getCurrentNode();

    if (!node) {
      this._renderFinishedState();
      return;
    }

    if (wagon?.id) {
      this.container.dataset.wagonId = wagon.id;
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

    const actions = this._createActionsContainer();

    node.options.forEach((option, index) => {
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
}
