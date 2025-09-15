import { GameController } from './game/gameController.js';

function boot() {
  const stageElement = document.getElementById('iso-stage');
  const dialogueElement = document.getElementById('dialogue-panel');

  if (!stageElement) {
    throw new Error('Не найден контейнер изометрической сцены с id="iso-stage".');
  }

  if (!dialogueElement) {
    throw new Error('Не найден контейнер диалогов с id="dialogue-panel".');
  }

  const controller = new GameController({
    stageElement,
    dialogueElement,
    hud: {
      title: document.getElementById('hud-scene-title'),
      subtitle: document.getElementById('hud-scene-subtitle'),
      flagList: document.getElementById('hud-flags'),
    },
  });

  controller.start();
}

document.addEventListener('DOMContentLoaded', boot);
