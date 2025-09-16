export type DebugLevel = 'info' | 'warn' | 'error';

interface DebugEntry {
  id: string;
  timestamp: number;
  level: DebugLevel;
  message: string;
  details?: string;
}

export interface DebuggerApi {
  log: (message: string, payload?: unknown, level?: DebugLevel) => void;
  show: () => void;
  hide: () => void;
  entries: () => DebugEntry[];
  setStatus: (status: string, level?: DebugLevel) => void;
}

export class DebuggerOverlay {
  private readonly container: HTMLDivElement;

  private readonly toggleButton: HTMLButtonElement;

  private readonly panel: HTMLDivElement;

  private readonly statusElement: HTMLSpanElement;

  private readonly list: HTMLUListElement;

  private readonly maxEntries = 80;

  private entries: DebugEntry[] = [];

  private visible = false;

  constructor(root: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'debug-overlay';
    this.container.dataset.role = 'ui-block';
    this.container.style.pointerEvents = 'none';

    this.toggleButton = document.createElement('button');
    this.toggleButton.type = 'button';
    this.toggleButton.className = 'debug-toggle';
    this.toggleButton.textContent = '🐞';
    this.toggleButton.title = 'Показать отладчик';
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.toggleButton.addEventListener('click', () => this.toggle());

    this.panel = document.createElement('div');
    this.panel.className = 'debug-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('aria-hidden', 'true');

    const header = document.createElement('div');
    header.className = 'debug-panel__header';

    const summary = document.createElement('div');
    summary.className = 'debug-panel__summary';

    const title = document.createElement('span');
    title.className = 'debug-panel__title';
    title.textContent = 'Отладка';

    this.statusElement = document.createElement('span');
    this.statusElement.className = 'debug-panel__status';
    this.statusElement.textContent = 'Ожидание запуска';

    summary.append(title, this.statusElement);

    const actions = document.createElement('div');
    actions.className = 'debug-panel__actions';

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'debug-panel__action';
    copyButton.textContent = 'Скопировать лог';
    copyButton.addEventListener('click', () => this.copyEntries());

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'debug-panel__action';
    clearButton.textContent = 'Очистить';
    clearButton.addEventListener('click', () => this.clear());

    actions.append(copyButton, clearButton);

    header.append(summary, actions);

    this.list = document.createElement('ul');
    this.list.className = 'debug-panel__list';

    this.panel.append(header, this.list);

    this.container.append(this.toggleButton, this.panel);
    root.appendChild(this.container);

    this.exposeToWindow();
  }

  log(message: string, payload?: unknown, level: DebugLevel = 'info'): void {
    const entry: DebugEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: Date.now(),
      level,
      message,
      details: payload !== undefined ? this.stringifyPayload(payload) : undefined,
    };
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(this.entries.length - this.maxEntries);
    }
    this.renderEntry(entry);
    this.trimList();
  }

  setStatus(status: string, level: DebugLevel = 'info'): void {
    this.statusElement.textContent = status;
    this.statusElement.dataset.level = level;
  }

  show(): void {
    this.visible = true;
    this.panel.hidden = false;
    this.panel.setAttribute('aria-hidden', 'false');
    this.toggleButton.setAttribute('aria-expanded', 'true');
  }

  hide(): void {
    this.visible = false;
    this.panel.hidden = true;
    this.panel.setAttribute('aria-hidden', 'true');
    this.toggleButton.setAttribute('aria-expanded', 'false');
  }

  private toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private renderEntry(entry: DebugEntry): void {
    const item = document.createElement('li');
    item.className = `debug-panel__entry debug-panel__entry--${entry.level}`;

    const header = document.createElement('div');
    header.className = 'debug-panel__entry-header';

    const time = document.createElement('span');
    time.className = 'debug-panel__time';
    time.textContent = this.formatTime(entry.timestamp);

    const message = document.createElement('span');
    message.className = 'debug-panel__message';
    message.textContent = entry.message;

    header.append(time, message);
    item.appendChild(header);

    if (entry.details) {
      const details = document.createElement('pre');
      details.className = 'debug-panel__details';
      details.textContent = entry.details;
      item.appendChild(details);
    }

    this.list.prepend(item);
  }

  private trimList(): void {
    while (this.list.childElementCount > this.maxEntries) {
      const last = this.list.lastElementChild;
      if (!last) {
        break;
      }
      this.list.removeChild(last);
    }
  }

  private stringifyPayload(payload: unknown): string {
    if (payload instanceof Error) {
      return `${payload.name}: ${payload.message}` + (payload.stack ? `\n${payload.stack}` : '');
    }
    if (typeof payload === 'string') {
      return payload;
    }
    try {
      return JSON.stringify(payload, null, 2);
    } catch (error) {
      return String(payload);
    }
  }

  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour12: false });
  }

  private async copyEntries(): Promise<void> {
    const text = this.entries
      .map((entry) => {
        const isoTime = new Date(entry.timestamp).toISOString();
        const base = `[${isoTime}] ${entry.level.toUpperCase()} ${entry.message}`;
        return entry.details ? `${base}\n${entry.details}` : base;
      })
      .join('\n\n');
    const payload = text || 'Нет записей лога.';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = payload;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      this.log('debug.copy.success');
    } catch (error) {
      console.error('Failed to copy debug log', error);
      this.log('debug.copy.error', error instanceof Error ? error : String(error), 'warn');
    }
  }

  private clear(): void {
    this.entries = [];
    this.list.innerHTML = '';
    this.log('debug.log.cleared');
  }

  private exposeToWindow(): void {
    const globalWindow = window as typeof window & { deadTrainDebug?: DebuggerApi };
    const api: DebuggerApi = {
      log: (message, payload, level) => this.log(message, payload, level),
      show: () => this.show(),
      hide: () => this.hide(),
      entries: () => [...this.entries],
      setStatus: (status, level) => this.setStatus(status, level),
    };
    globalWindow.deadTrainDebug = api;
  }
}
