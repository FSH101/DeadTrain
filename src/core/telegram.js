/**
 * @typedef {Object} TelegramUser
 * @property {number} [id]
 * @property {string} [username]
 */

/**
 * @typedef {Object} TelegramWebApp
 * @property {string} initData
 * @property {{ user?: TelegramUser }} [initDataUnsafe]
 * @property {() => void} ready
 * @property {() => void} expand
 * @property {() => void} enableClosingConfirmation
 * @property {{ secondary_bg_color?: string, text_color?: string }} [themeParams]
 * @property {{
 *   impactOccurred(style: 'light' | 'medium' | 'heavy'): void,
 *   notificationOccurred(style: 'success' | 'warning' | 'error'): void
 * }} [HapticFeedback]
 */

/**
 * @typedef {Object} TelegramContext
 * @property {string} userId
 * @property {string} [username]
 * @property {string} initDataRaw
 */

const resolveWebApp = () => {
  const globalTelegram = window.Telegram;
  return globalTelegram?.WebApp ?? null;
};

export class TelegramBridge {
  constructor() {
    this.webApp = null;
    this.ctx = null;
  }

  init() {
    const tg = resolveWebApp();
    if (!tg) {
      const fallback = { userId: 'local-user', initDataRaw: '', username: undefined };
      this.ctx = fallback;
      return Promise.resolve(fallback);
    }
    this.webApp = tg;
    const raw = tg.initData ?? '';
    const userId = tg.initDataUnsafe?.user?.id?.toString() ?? 'local-user';
    const username = tg.initDataUnsafe?.user?.username;
    this.ctx = { userId, username, initDataRaw: raw };
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    const theme = tg.themeParams;
    if (theme?.secondary_bg_color) {
      document.documentElement.style.setProperty('--tg-bg', theme.secondary_bg_color);
    }
    if (theme?.text_color) {
      document.documentElement.style.setProperty('--tg-text', theme.text_color);
    }
    return Promise.resolve(this.ctx);
  }

  getContext() {
    if (!this.ctx) {
      throw new Error('TelegramBridge not initialized');
    }
    return this.ctx;
  }

  vibrate(style) {
    if (this.webApp?.HapticFeedback) {
      this.webApp.HapticFeedback.impactOccurred(style);
      return;
    }
    if (navigator.vibrate) {
      navigator.vibrate(style === 'heavy' ? 40 : style === 'medium' ? 28 : 16);
    }
  }

  notify(style) {
    if (this.webApp?.HapticFeedback) {
      this.webApp.HapticFeedback.notificationOccurred(style);
      return;
    }
    if (navigator.vibrate) {
      navigator.vibrate([10, 20, 10]);
    }
  }
}
