import type { AudioManager } from '../core/audio';
import type { ToastController } from '../core/toast';

export class HudController {
  private readonly element: HTMLDivElement;

  private muted = false;

  constructor(root: HTMLElement, private readonly audio: AudioManager, private readonly toast: ToastController) {
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.element.dataset.role = 'ui-block';
    const soundButton = document.createElement('button');
    soundButton.textContent = '🔊';
    soundButton.addEventListener('click', () => this.toggleSound(soundButton));
    this.element.appendChild(soundButton);
    root.appendChild(this.element);
  }

  private toggleSound(button: HTMLButtonElement): void {
    this.muted = !this.muted;
    this.audio.setVolume(this.muted ? 0 : 0.4);
    button.textContent = this.muted ? '🔇' : '🔊';
    this.toast.show(this.muted ? 'Звук отключён' : 'Звук включён');
  }
}
