import { nanoid } from 'nanoid';

export class ToastController {
  constructor(root) {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    root.appendChild(this.container);
    this.active = new Map();
  }

  show(text, duration = 2200) {
    const id = nanoid();
    const element = document.createElement('div');
    element.className = 'toast';
    element.textContent = text;
    this.container.appendChild(element);
    this.active.set(id, element);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id) {
    const element = this.active.get(id);
    if (!element) {
      return;
    }
    element.classList.add('hidden');
    element.addEventListener('transitionend', () => element.remove(), { once: true });
    element.remove();
    this.active.delete(id);
  }
}
