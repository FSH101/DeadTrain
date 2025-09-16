import { GameApp } from './app/GameApp.js';
import { ErrorScreen } from './ui/error.js';
import { DebuggerOverlay } from './ui/debugger.js';
import { createLogger, setLogLevel } from './core/logging.js';

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
if (isDev) {
  setLogLevel('debug');
}

const logger = createLogger('main');

const bootstrap = async () => {
  logger.info('Bootstrap sequence started');
  const canvas = document.querySelector('#game');
  const overlay = document.querySelector('#overlay-root');
  if (!canvas || !(canvas instanceof HTMLCanvasElement) || !overlay || !(overlay instanceof HTMLElement)) {
    const error = new Error('Missing canvas or overlay root');
    logger.error('Required DOM nodes not found', error);
    throw error;
  }
  const debugOverlay = new DebuggerOverlay(overlay);
  const errorScreen = new ErrorScreen(overlay);
  let app = null;
  try {
    app = new GameApp(canvas, overlay, { errorScreen, debugOverlay });
  } catch (error) {
    const normalized = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to construct game', normalized);
    debugOverlay.log('bootstrap.construct.failed', { message: normalized.message }, 'error');
    errorScreen.show({
      title: 'Ошибка запуска',
      message: 'Не удалось подготовить игровое приложение.',
      details: normalized.stack ?? normalized.message,
      actionLabel: 'Перезагрузить',
      onAction: () => window.location.reload(),
    });
    throw normalized;
  }
  try {
    await app.init();
    window.addEventListener('beforeunload', () => app?.destroy());
    logger.info('Bootstrap sequence completed');
  } catch (error) {
    const normalized = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to bootstrap game', normalized);
    debugOverlay.log('bootstrap.init.failed', { message: normalized.message }, 'error');
    if (!errorScreen.isVisible()) {
      errorScreen.show({
        title: 'Ошибка запуска',
        message: 'Не удалось инициализировать приложение.',
        details: normalized.stack ?? normalized.message,
        actionLabel: 'Перезагрузить',
        onAction: () => window.location.reload(),
      });
    }
    throw normalized;
  }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  bootstrap().catch((error) => {
    logger.error('Failed to bootstrap game', error);
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    logger.debug('DOMContentLoaded fired, starting bootstrap');
    bootstrap().catch((error) => {
      logger.error('Failed to bootstrap game', error);
    });
  });
}
