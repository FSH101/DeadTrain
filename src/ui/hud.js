export class HudController {
  constructor(root, audio, toast) {
    this.audio = audio;
    this.toast = toast;
    this.muted = false;
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.element.dataset.role = 'ui-block';
    const soundButton = document.createElement('button');
    soundButton.textContent = '🔊';
    soundButton.addEventListener('click', () => this.toggleSound(soundButton));
    this.element.appendChild(soundButton);
    root.appendChild(this.element);
  }

  toggleSound(button) {
    this.muted = !this.muted;
    this.audio.setVolume(this.muted ? 0 : 0.4);
    button.textContent = this.muted ? '🔇' : '🔊';
    this.toast.show(this.muted ? 'Звук отключён' : 'Звук включён');
  }
}
