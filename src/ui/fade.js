export class FadeController {
  constructor(root) {
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.inset = '0';
    this.element.style.background = '#02040a';
    this.element.style.opacity = '0';
    this.element.style.transition = 'opacity 120ms ease';
    this.element.style.pointerEvents = 'none';
    root.appendChild(this.element);
    this.isActive = false;
  }

  async fadeOut() {
    if (this.isActive) {
      return;
    }
    this.isActive = true;
    this.element.style.opacity = '1';
    await new Promise((resolve) => setTimeout(resolve, 140));
  }

  async fadeIn() {
    this.element.style.opacity = '0';
    await new Promise((resolve) => setTimeout(resolve, 140));
    this.isActive = false;
  }
}
