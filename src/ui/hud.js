export class HudController {
  constructor(root, audio, toast) {
    this.audio = audio;
    this.toast = toast;
    this.defaultVolume = Math.max(0, Math.min(1, this.audio.getVolume?.() ?? 0.6));
    if (this.defaultVolume === 0) {
      this.defaultVolume = 0.6;
      this.audio.setVolume?.(this.defaultVolume);
    }
    this.muted = false;
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.element.dataset.role = 'ui-block';
    const soundButton = document.createElement('button');
    soundButton.textContent = this.muted ? '🔇' : '🔊';
    soundButton.addEventListener('click', () => this.toggleSound(soundButton));
    this.element.appendChild(soundButton);
    root.appendChild(this.element);
  }

  toggleSound(button) {
    if (this.muted) {
      this.audio.setVolume(this.defaultVolume);
      this.muted = false;
      button.textContent = '🔊';
      this.toast.show('Звук включён');
    } else {
      this.audio.setVolume(0);
      this.muted = true;
      button.textContent = '🔇';
      this.toast.show('Звук отключён');
    }
  }
}
