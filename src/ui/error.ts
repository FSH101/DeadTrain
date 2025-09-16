export interface ErrorScreenOptions {
  title?: string;
  message: string;
  description?: string;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export class ErrorScreen {
  private readonly element: HTMLDivElement;

  private readonly content: HTMLDivElement;

  private readonly titleElement: HTMLHeadingElement;

  private readonly messageElement: HTMLParagraphElement;

  private readonly descriptionElement: HTMLParagraphElement;

  private readonly detailsElement: HTMLPreElement;

  private readonly actionButton: HTMLButtonElement;

  private actionHandler: (() => void) | null = null;

  private visible = false;

  constructor(root: HTMLElement) {
    this.element = document.createElement('div');
    this.element.className = 'error-screen';
    this.element.dataset.role = 'ui-block';
    this.element.hidden = true;
    this.element.style.pointerEvents = 'none';
    this.element.setAttribute('role', 'alertdialog');
    this.element.setAttribute('aria-live', 'assertive');

    this.content = document.createElement('div');
    this.content.className = 'error-screen__content';

    this.titleElement = document.createElement('h2');
    this.titleElement.className = 'error-screen__title';
    this.titleElement.textContent = 'Ошибка запуска';

    this.messageElement = document.createElement('p');
    this.messageElement.className = 'error-screen__message';

    this.descriptionElement = document.createElement('p');
    this.descriptionElement.className = 'error-screen__description';
    this.descriptionElement.hidden = true;

    this.detailsElement = document.createElement('pre');
    this.detailsElement.className = 'error-screen__details';
    this.detailsElement.hidden = true;

    this.actionButton = document.createElement('button');
    this.actionButton.type = 'button';
    this.actionButton.className = 'error-screen__button';
    this.actionButton.textContent = 'Перезагрузить';
    this.actionButton.addEventListener('click', () => {
      if (this.actionHandler) {
        this.actionHandler();
        return;
      }
      window.location.reload();
    });

    this.content.append(
      this.titleElement,
      this.messageElement,
      this.descriptionElement,
      this.detailsElement,
      this.actionButton,
    );

    this.element.appendChild(this.content);
    root.appendChild(this.element);
  }

  show(options: ErrorScreenOptions): void {
    this.titleElement.textContent = options.title ?? 'Что-то пошло не так';
    this.messageElement.textContent = options.message;

    if (options.description) {
      this.descriptionElement.textContent = options.description;
      this.descriptionElement.hidden = false;
    } else {
      this.descriptionElement.hidden = true;
      this.descriptionElement.textContent = '';
    }

    if (options.details) {
      this.detailsElement.textContent = options.details.trim();
      this.detailsElement.hidden = false;
    } else {
      this.detailsElement.hidden = true;
      this.detailsElement.textContent = '';
    }

    this.actionButton.textContent = options.actionLabel ?? 'Перезагрузить';
    this.actionHandler = options.onAction ?? null;

    this.visible = true;
    this.element.hidden = false;
    this.element.style.pointerEvents = 'auto';
    this.element.setAttribute('aria-hidden', 'false');
  }

  hide(): void {
    this.visible = false;
    this.element.hidden = true;
    this.element.style.pointerEvents = 'none';
    this.element.setAttribute('aria-hidden', 'true');
  }

  isVisible(): boolean {
    return this.visible;
  }
}
