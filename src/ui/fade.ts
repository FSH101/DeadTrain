export class FadeController {
  private readonly element: HTMLDivElement;

  private isActive = false;

  constructor(root: HTMLElement) {
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.inset = '0';
    this.element.style.background = '#02040a';
    this.element.style.opacity = '0';
    this.element.style.transition = 'opacity 120ms ease';
    this.element.style.pointerEvents = 'none';
    root.appendChild(this.element);
  }

  async fadeOut(): Promise<void> {
    if (this.isActive) {
      return;
    }
    this.isActive = true;
    this.element.style.opacity = '1';
    await new Promise((resolve) => setTimeout(resolve, 140));
  }

  async fadeIn(): Promise<void> {
    this.element.style.opacity = '0';
    await new Promise((resolve) => setTimeout(resolve, 140));
    this.isActive = false;
  }
}
