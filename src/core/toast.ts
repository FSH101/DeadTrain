import { nanoid } from 'nanoid';

export class ToastController {
  private readonly container: HTMLElement;

  private active: Map<string, HTMLDivElement> = new Map();

  constructor(root: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    root.appendChild(this.container);
  }

  show(text: string, duration = 2200): void {
    const id = nanoid();
    const element = document.createElement('div');
    element.className = 'toast';
    element.textContent = text;
    this.container.appendChild(element);
    this.active.set(id, element);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: string): void {
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
