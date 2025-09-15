import { story } from './data/story.js';
import { StoryEngine } from './engine/storyEngine.js';
import { DomRenderer } from './ui/domRenderer.js';

function boot() {
  const container = document.getElementById('train-container');

  if (!container) {
    throw new Error('Не удалось найти контейнер истории с id="train-container".');
  }

  const engine = new StoryEngine(story);
  const renderer = new DomRenderer(container, engine);
  renderer.render();
}

document.addEventListener('DOMContentLoaded', boot);
