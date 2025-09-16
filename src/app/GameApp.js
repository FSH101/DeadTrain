import { AudioManager } from '../core/audio.js';
import { applySaveToState, createSaveFromState, loadSave, persistSave } from '../core/save.js';
import { TelegramBridge } from '../core/telegram.js';
import { ToastController } from '../core/toast.js';
import { createRuntimeState } from '../game/GameState.js';
import { MovementSystem } from '../game/MovementSystem.js';
import { TrainGraph } from '../game/TrainGraph.js';
import { InputRouter } from '../input/InputRouter.js';
import { IsometricRenderer } from '../render/IsometricRenderer.js';
import { CanvasDisplay } from '../render/CanvasDisplay.js';
import { trainDescriptor } from '../data/wagons.js';
import { DialogueController } from '../ui/dialogue.js';
import { HudController } from '../ui/hud.js';
import { FadeController } from '../ui/fade.js';
import { ErrorScreen } from '../ui/error.js';
import { DebuggerOverlay } from '../ui/debugger.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';

const GAME_CONFIG = {
  virtualWidth: 360,
  virtualHeight: 200,
  tileWidth: 128,
  tileHeight: 64,
};

export class GameApp {
  constructor(canvas, overlayRoot, overlays) {
    this.canvas = canvas;
    this.overlayRoot = overlayRoot;
    this.display = new CanvasDisplay(canvas, GAME_CONFIG);
    this.telegram = new TelegramBridge();
    this.audio = new AudioManager();
    this.toast = new ToastController(this.overlayRoot);
    this.dialogue = new DialogueController(this.overlayRoot);
    this.fade = new FadeController(this.overlayRoot);
    this.hud = new HudController(this.overlayRoot, this.audio, this.toast);
    this.errorScreen = overlays?.errorScreen ?? new ErrorScreen(this.overlayRoot);
    this.debug = overlays?.debugOverlay ?? new DebuggerOverlay(this.overlayRoot);
    this.train = new TrainGraph(trainDescriptor);

    const wagon = this.train.getCurrentWagon();
    this.state = createRuntimeState(GAME_CONFIG, wagon, this.train.getState());
    this.movement = new MovementSystem(this.state);
    this.movement.setNavMesh(wagon.navmesh);
    this.renderer = new IsometricRenderer(this.display, this.state);
    this.interaction = null;
    this.inputRouter = null;
    this.lastTime = performance.now();
    this.userId = 'local-user';
    this.loopHandle = 0;
    this.fatalError = false;
    this.destroyed = false;

    this.buildTargetsForWagon(wagon);
    window.addEventListener('resize', () => this.display.resize());
    this.debug.setStatus('Создание приложения');
    this.debug.log('game.constructor', {
      startWagon: wagon.id,
      targets: this.state.currentTargets.length,
    });
  }

  async init() {
    this.debug.log('game.init.start');
    this.errorScreen.hide();
    try {
      const ctx = await this.guard('Получение контекста Telegram', () => this.telegram.init());
      this.userId = ctx.userId;
      this.debug.log('telegram.context', {
        userId: this.userId,
        hasInitData: Boolean(ctx.initDataRaw),
      });
      await this.guard('Проверка данных сессии', () => this.verifyInitData(ctx.initDataRaw));
      await this.guard('Инииализация аудио', () => this.audio.init());
      await this.guard('Запуск фонового звука', () => this.audio.playAmbient('train'));
      await this.guard('Подготовка систем взаимодействия', () => {
        this.interaction = new InteractionSystem({
          state: this.state,
          movement: this.movement,
          train: this.train,
          dialogue: this.dialogue,
          toast: this.toast,
          audio: this.audio,
          userId: this.userId,
          onTravel: async (wagonId, spawnPoint) => {
            await this.travelTo(wagonId, spawnPoint);
          },
          onStateChanged: () => this.saveGame(),
        });
        const haptics = {
          impact: (style) => this.telegram.vibrate(style),
          notify: (style) => this.telegram.notify(style),
        };
        this.inputRouter = new InputRouter(this.canvas, this.state, this.interaction, haptics);
        this.inputRouter.attach();
      });
      await this.guard('Загрузка сохранения', () => this.tryRestoreSave());
      this.startLoop();
      this.debug.setStatus('Игра запущена');
      this.debug.log('game.init.complete');
    } catch (error) {
      this.handleFatalError(error, 'инициализация');
      throw error;
    }
  }

  tryRestoreSave() {
    this.debug.log('save.restore.start');
    try {
      const save = loadSave(this.userId);
      if (!save) {
        this.debug.log('save.restore.empty');
        return;
      }
      applySaveToState(this.state, save);
      this.refreshDoorsFromFlags();
      const wagon = this.train.travelTo(save.wagonId);
      this.state.wagon = wagon;
      this.movement.setNavMesh(wagon.navmesh);
      this.state.player.position = save.position;
      this.state.player.path = [];
      this.buildTargetsForWagon(wagon);
      this.debug.log('save.restore.success', {
        wagonId: save.wagonId,
        flags: save.flags.length,
        endings: save.endings.length,
        inventory: Object.keys(save.inventory ?? {}).length,
      });
    } catch (error) {
      console.error('Failed to restore save', error);
      this.debug.log('save.restore.error', error instanceof Error ? error : String(error), 'warn');
      this.toast.show('Сохранение повреждено. Начинаем заново.');
    }
  }

  refreshDoorsFromFlags() {
    this.train.getAllWagons().forEach((wagon) => {
      wagon.doors.forEach((door) => {
        if (door.lockedByFlag && this.state.flags.story.has(door.lockedByFlag)) {
          this.train.setDoorState(wagon.id, door.id, 'open');
        }
      });
    });
  }

  buildTargetsForWagon(wagon) {
    const targets = [];
    const doors = wagon.doors ?? [];
    const npcs = wagon.npcs ?? [];
    const objects = wagon.objects ?? [];
    doors.forEach((door) => {
      targets.push({
        id: door.id,
        kind: 'door',
        position: door.position,
        radius: door.radius ?? 48,
        metadata: { door: { wagonId: wagon.id, descriptor: door } },
      });
    });
    npcs.forEach((npc) => {
      targets.push({
        id: npc.id,
        kind: 'npc',
        position: npc.position,
        radius: npc.radius,
        metadata: { dialogueId: npc.dialogueId, name: npc.name },
      });
    });
    objects.forEach((object) => {
      targets.push({
        id: object.id,
        kind: 'object',
        position: object.position,
        radius: object.radius,
        metadata: { onUse: object.onUse, label: object.label },
      });
    });
    this.state.currentTargets = targets;
    this.debug.log('targets.updated', { wagonId: wagon.id, targets: targets.length });
  }

  async travelTo(wagonId, spawnPoint) {
    await this.fade.fadeOut();
    const wagon = this.train.travelTo(wagonId);
    this.state.wagon = wagon;
    this.movement.setNavMesh(wagon.navmesh);
    this.state.player.position = { ...spawnPoint };
    this.state.player.path = [];
    this.state.player.isMoving = false;
    this.state.marker.visible = false;
    this.buildTargetsForWagon(wagon);
    await this.audio.playAmbient(wagon.ambient === 'dark' ? 'dark' : 'train');
    await this.fade.fadeIn();
    this.saveGame();
    this.debug.log('travel.complete', { wagonId, spawnPoint });
  }

  saveGame() {
    persistSave(this.userId, createSaveFromState(this.state));
  }

  async verifyInitData(raw) {
    if (!raw) {
      return;
    }
    try {
      const response = await fetch('/api/validate-init-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: raw }),
      });
      if (response.status !== 200) {
        this.toast.show('Не удалось проверить сессию Telegram.');
      }
    } catch (error) {
      console.error('InitData validation failed', error);
      this.toast.show('Проверка Telegram недоступна.');
      this.debug.log('telegram.validation.failed', error instanceof Error ? error : String(error), 'warn');
    }
  }

  startLoop() {
    const tick = (time) => {
      if (this.destroyed || this.fatalError) {
        return;
      }
      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;
      try {
        this.movement.update(delta);
        this.renderer.render(delta);
      } catch (error) {
        this.handleFatalError(error, 'игровой цикл');
        return;
      }
      this.loopHandle = requestAnimationFrame(tick);
    };
    this.loopHandle = requestAnimationFrame(tick);
  }

  destroy() {
    this.destroyed = true;
    if (this.loopHandle) {
      cancelAnimationFrame(this.loopHandle);
    }
    if (this.inputRouter) {
      this.inputRouter.detach();
    }
  }

  async guard(stage, task) {
    this.debug.setStatus(`${stage}...`);
    this.debug.log('stage.start', { stage });
    try {
      const result = await task();
      this.debug.log('stage.success', { stage });
      return result;
    } catch (error) {
      this.debug.setStatus(`Ошибка: ${stage}`, 'error');
      this.debug.log('stage.error', { stage, error: this.describeError(error) }, 'error');
      throw error;
    }
  }

  handleFatalError(error, stage) {
    if (this.fatalError) {
      return;
    }
    this.fatalError = true;
    this.destroy();
    const normalized = this.describeError(error);
    console.error(`Fatal error during ${stage}`, error);
    this.debug.setStatus(`Критическая ошибка: ${stage}`, 'error');
    this.debug.log('fatal', { stage, error: normalized }, 'error');
    this.errorScreen.show({
      title: 'Не удалось запустить игру',
      message: `Этап «${stage}» завершился с ошибкой.`,
      description:
        'Попробуйте перезагрузить приложение. Если проблема повторяется, откройте отладчик (кнопка 🐞) и отправьте лог разработчику.',
      details: normalized.stack ?? normalized.message,
      actionLabel: 'Перезагрузить приложение',
      onAction: () => window.location.reload(),
    });
  }

  describeError(error) {
    if (error instanceof Error) {
      return { message: error.message, stack: error.stack ?? undefined };
    }
    if (typeof error === 'string') {
      return { message: error };
    }
    try {
      return { message: JSON.stringify(error) };
    } catch (serializationError) {
      return { message: String(serializationError ?? error) };
    }
  }
}
