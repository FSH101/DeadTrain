export class DialoguePanel {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  showText(node, callbacks = {}) {
    this._ensureVisible();

    const content = document.createElement('div');
    content.className = 'dialogue-panel__content';

    const paragraph = document.createElement('p');
    paragraph.className = 'dialogue-panel__text';
    paragraph.textContent = node.content ?? '';
    content.appendChild(paragraph);

    if (node.note) {
      const note = document.createElement('p');
      note.className = 'dialogue-panel__note';
      note.textContent = node.note;
      content.appendChild(note);
    }

    const controls = document.createElement('div');
    controls.className = 'dialogue-panel__actions';

    const button = this._createButton(node.nextLabel ?? 'Далее');
    button.addEventListener('click', () => {
      callbacks.onAdvance?.();
    });

    controls.appendChild(button);
    content.appendChild(controls);

    this._render(content);
  }

  showChoice(node, options, callbacks = {}) {
    this._ensureVisible();

    const content = document.createElement('div');
    content.className = 'dialogue-panel__content';

    if (node.prompt) {
      const prompt = document.createElement('p');
      prompt.className = 'dialogue-panel__text';
      prompt.textContent = node.prompt;
      content.appendChild(prompt);
    }

    if (node.description) {
      const description = document.createElement('p');
      description.className = 'dialogue-panel__note';
      description.textContent = node.description;
      content.appendChild(description);
    }

    const controls = document.createElement('div');
    controls.className = 'dialogue-panel__actions';

    options.forEach((option, index) => {
      const button = this._createButton(option.text);

      if (option.description) {
        const hint = document.createElement('span');
        hint.className = 'dialogue-panel__option-note';
        hint.textContent = option.description;
        button.appendChild(hint);
      }

      button.addEventListener('click', () => {
        callbacks.onSelect?.(index);
      });

      controls.appendChild(button);
    });

    if (controls.children.length === 0) {
      const placeholder = document.createElement('p');
      placeholder.className = 'dialogue-panel__note';
      placeholder.textContent = 'Здесь пока нечего сделать.';
      content.appendChild(placeholder);
    } else {
      content.appendChild(controls);
    }

    this._render(content);
  }

  showEnding(ending, callbacks = {}) {
    this._ensureVisible();

    const content = document.createElement('div');
    content.className = 'dialogue-panel__content dialogue-panel__content--ending';

    if (ending.title) {
      const title = document.createElement('h2');
      title.className = 'dialogue-panel__title';
      title.textContent = ending.title;
      content.appendChild(title);
    }

    const paragraph = document.createElement('p');
    paragraph.className = 'dialogue-panel__text';
    paragraph.textContent = ending.content ?? '';
    content.appendChild(paragraph);

    if (ending.note) {
      const note = document.createElement('p');
      note.className = 'dialogue-panel__note';
      note.textContent = ending.note;
      content.appendChild(note);
    }

    const controls = document.createElement('div');
    controls.className = 'dialogue-panel__actions';

    const actions = Array.isArray(ending.actions) && ending.actions.length > 0
      ? ending.actions
      : [{ text: 'Вернуться', action: 'close' }];

    actions.forEach((action) => {
      const button = this._createButton(action.text);
      button.addEventListener('click', () => {
        callbacks.onAction?.(action);
      });
      controls.appendChild(button);
    });

    content.appendChild(controls);
    this._render(content);
  }

  close() {
    if (!this.rootElement) {
      return;
    }

    this.rootElement.classList.add('dialogue-panel--hidden');
    this.rootElement.replaceChildren();
  }

  _render(content) {
    if (!this.rootElement) {
      return;
    }

    this.rootElement.replaceChildren(content);
  }

  _ensureVisible() {
    if (!this.rootElement) {
      return;
    }

    this.rootElement.classList.remove('dialogue-panel--hidden');
  }

  _createButton(label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dialogue-panel__button';
    button.textContent = label ?? '...';
    return button;
  }
}
