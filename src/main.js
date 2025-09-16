import { GameApp } from './app/GameApp.js';
import { ErrorScreen } from './ui/error.js';
import { DebuggerOverlay } from './ui/debugger.js';

const bootstrap = async () => {
  const canvas = document.querySelector('#game');
  const overlay = document.querySelector('#overlay-root');
  if (!canvas || !(canvas instanceof HTMLCanvasElement) || !overlay || !(overlay instanceof HTMLElement)) {
    throw new Error('Missing canvas or overlay root');
  }
  const debugOverlay = new DebuggerOverlay(overlay);
  const errorScreen = new ErrorScreen(overlay);
  let app = null;
  try {
    app = new GameApp(canvas, overlay, { errorScreen, debugOverlay });
  } catch (error) {
    const normalized = error instanceof Error ? error : new Error(String(error));
    console.error('Failed to construct game', normalized);
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
  } catch (error) {
    const normalized = error instanceof Error ? error : new Error(String(error));
    console.error('Failed to bootstrap game', normalized);
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
    console.error('Failed to bootstrap game', error);
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch((error) => {
      console.error('Failed to bootstrap game', error);
    });
  });
}
