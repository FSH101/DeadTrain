/** @typedef {import('../types.js').DialogueChoice} DialogueChoice */
/** @typedef {import('../types.js').DialogueNode} DialogueNode */
/** @typedef {import('../types.js').DialogueScript} DialogueScript */

import { createLogger } from '../core/logging.js';

/**
 * @typedef {Object} DialogueHandlers
 * @property {(node: DialogueNode, choice?: DialogueChoice) => string | null} onAdvance
 * @property {(choice: DialogueChoice) => { allowed: boolean, reason?: string }} [canSelect]
 * @property {() => void} onClose
 */

export class DialogueController {
  constructor(root) {
    this.container = document.createElement('div');
    this.container.dataset.role = 'ui-block';
    this.container.className = 'overlay';
    this.container.style.pointerEvents = 'none';
    this.panel = document.createElement('div');
    this.panel.className = 'dialogue-panel';
    this.panel.style.display = 'none';
    this.panel.dataset.role = 'ui-block';
    this.container.appendChild(this.panel);
    root.appendChild(this.container);

    this.currentScript = null;
    this.handlers = null;
    this.currentNodeId = null;
    this.logger = createLogger('ui.dialogue');
  }

  open(script, startId, handlers) {
    this.currentScript = script;
    this.handlers = handlers;
    this.currentNodeId = startId;
    this.container.style.pointerEvents = 'auto';
    this.renderCurrentNode();
  }

  close() {
    this.currentScript = null;
    this.handlers = null;
    this.currentNodeId = null;
    this.panel.style.display = 'none';
    this.container.style.pointerEvents = 'none';
  }

  renderCurrentNode() {
    if (!this.currentScript || !this.currentNodeId || !this.handlers) {
      return;
    }
    const node = this.currentScript.nodes.find((entry) => entry.id === this.currentNodeId);
    if (!node) {
      this.logger.error('Dialogue node not found', { nodeId: this.currentNodeId });
      this.close();
      return;
    }
    this.panel.innerHTML = '';
    this.panel.style.display = 'block';
    if (node.type === 'ending') {
      this.renderEnding(node);
      return;
    }
    const speaker = document.createElement('div');
    speaker.className = 'dialogue-speaker';
    speaker.textContent = node.type === 'line' ? node.speaker : `${node.speaker}`;
    const text = document.createElement('div');
    text.className = 'dialogue-text';
    text.textContent = node.text;
    this.panel.appendChild(speaker);
    this.panel.appendChild(text);

    if (node.type === 'line') {
      const button = document.createElement('button');
      button.className = 'dialogue-button';
      button.textContent = 'Далее';
      button.addEventListener('click', () => {
        const next = this.handlers?.onAdvance(node);
        if (next) {
          this.currentNodeId = next;
          this.renderCurrentNode();
        } else {
          this.handlers?.onClose();
          this.close();
        }
      });
      this.panel.appendChild(button);
    } else if (node.type === 'choice') {
      const options = document.createElement('div');
      options.className = 'dialogue-options';
      node.options.forEach((option) => {
        const button = document.createElement('button');
        button.className = 'dialogue-button';
        button.textContent = option.label;
        const state = this.handlers?.canSelect?.(option);
        if (state && !state.allowed) {
          button.disabled = true;
          button.classList.add('secondary');
          button.textContent = `${option.label} (${state.reason ?? 'недоступно'})`;
        }
        button.addEventListener('click', () => {
          if (button.disabled) {
            return;
          }
          const next = this.handlers?.onAdvance(node, option) ?? option.next;
          if (next) {
            this.currentNodeId = next;
            this.renderCurrentNode();
          } else {
            this.handlers?.onClose();
            this.close();
          }
        });
        options.appendChild(button);
      });
      this.panel.appendChild(options);
    }
  }

  renderEnding(node) {
    const title = document.createElement('div');
    title.className = 'dialogue-speaker';
    title.textContent = node.title;
    const text = document.createElement('div');
    text.className = 'dialogue-text';
    text.textContent = node.text;
    const button = document.createElement('button');
    button.className = 'dialogue-button';
    button.textContent = 'Завершить';
    button.addEventListener('click', () => {
      this.handlers?.onAdvance(node);
      this.handlers?.onClose();
      this.close();
    });
    this.panel.appendChild(title);
    this.panel.appendChild(text);
    this.panel.appendChild(button);
  }
}
