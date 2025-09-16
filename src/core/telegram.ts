type TelegramUser = {
  id?: number;
  username?: string;
};

type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  ready?: () => void;
  expand?: () => void;
  enableClosingConfirmation?: () => void;
  themeParams?: {
    secondary_bg_color?: string;
    text_color?: string;
  };
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
    notificationOccurred(style: 'success' | 'warning' | 'error'): void;
  };
};

const resolveWebApp = (): TelegramWebApp | null => {
  const globalTelegram = (window as typeof window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram;
  return globalTelegram?.WebApp ?? null;
};

export interface TelegramContext {
  userId: string;
  username?: string;
  initDataRaw: string;
}

export class TelegramBridge {
  private webApp: TelegramWebApp | null = null;

  private ctx: TelegramContext | null = null;

  private createFallbackContext(): TelegramContext {
    return { userId: 'local-user', initDataRaw: '', username: undefined };
  }

  init(): Promise<TelegramContext> {
    const tg = resolveWebApp();
    const fallback = this.createFallbackContext();
    if (!tg) {
      this.ctx = fallback;
      return Promise.resolve(fallback);
    }
    try {
      this.webApp = tg;
      const raw = typeof tg.initData === 'string' ? tg.initData : '';
      const userId = tg.initDataUnsafe?.user?.id !== undefined ? tg.initDataUnsafe.user.id.toString() : fallback.userId;
      const username = tg.initDataUnsafe?.user?.username;
      this.ctx = { userId, username, initDataRaw: raw };
      if (typeof tg.ready === 'function') {
        tg.ready();
      }
      if (typeof tg.expand === 'function') {
        tg.expand();
      }
      if (typeof tg.enableClosingConfirmation === 'function') {
        tg.enableClosingConfirmation();
      }
      const theme = tg.themeParams;
      if (theme?.secondary_bg_color) {
        document.documentElement.style.setProperty('--tg-bg', theme.secondary_bg_color);
      }
      if (theme?.text_color) {
        document.documentElement.style.setProperty('--tg-text', theme.text_color);
      }
      return Promise.resolve(this.ctx);
    } catch (error) {
      console.warn('Telegram Web App initialization failed, falling back to local context.', error);
      this.webApp = null;
      this.ctx = fallback;
      return Promise.resolve(fallback);
    }
  }

  getContext(): TelegramContext {
    if (!this.ctx) {
      throw new Error('TelegramBridge not initialized');
    }
    return this.ctx;
  }

  vibrate(style: 'light' | 'medium' | 'heavy'): void {
    if (this.webApp?.HapticFeedback) {
      this.webApp.HapticFeedback.impactOccurred(style);
      return;
    }
    if (navigator.vibrate) {
      navigator.vibrate(style === 'heavy' ? 40 : style === 'medium' ? 28 : 16);
    }
  }

  notify(style: 'success' | 'warning' | 'error'): void {
    if (this.webApp?.HapticFeedback) {
      this.webApp.HapticFeedback.notificationOccurred(style);
      return;
    }
    if (navigator.vibrate) {
      navigator.vibrate([10, 20, 10]);
    }
  }
}
