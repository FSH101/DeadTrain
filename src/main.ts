import { GameApp } from './app/GameApp';

const bootstrap = async () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#game');
  const overlay = document.querySelector<HTMLElement>('#overlay-root');
  if (!canvas || !overlay) {
    throw new Error('Missing canvas or overlay root');
  }
  const app = new GameApp(canvas, overlay);
  await app.init();
  window.addEventListener('beforeunload', () => app.destroy());
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
