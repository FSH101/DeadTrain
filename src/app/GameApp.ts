import { AudioManager } from '../core/audio';
import { applySaveToState, createSaveFromState, loadSave, persistSave } from '../core/save';
import { TelegramBridge } from '../core/telegram';
import { ToastController } from '../core/toast';
import { createRuntimeState } from '../game/GameState';
import type { GameRuntimeState } from '../game/GameState';
import { MovementSystem } from '../game/MovementSystem';
import { TrainGraph } from '../game/TrainGraph';
import type { InteractionTarget, IsoPoint, WagonLayerData } from '../types';
import { InputRouter, type HapticsBridge } from '../input/InputRouter';
import { IsometricRenderer } from '../render/IsometricRenderer';
import { CanvasDisplay } from '../render/CanvasDisplay';
import { trainDescriptor } from '../data/wagons';
import { DialogueController } from '../ui/dialogue';
import { HudController } from '../ui/hud';
import { FadeController } from '../ui/fade';
import { ErrorScreen } from '../ui/error';
import { DebuggerOverlay } from '../ui/debugger';
import { InteractionSystem } from '../systems/InteractionSystem';

const GAME_CONFIG = {
  virtualWidth: 360,
  virtualHeight: 200,
  tileWidth: 128,
  tileHeight: 64,
} as const;

export class GameApp {
  private readonly canvas: HTMLCanvasElement;

  private readonly overlayRoot: HTMLElement;

  private readonly display: CanvasDisplay;

  private readonly telegram = new TelegramBridge();

  private readonly audio = new AudioManager();

  private readonly toast: ToastController;

  private readonly dialogue: DialogueController;

  private readonly hud: HudController;

  private readonly fade: FadeController;

  private readonly errorScreen: ErrorScreen;

  private readonly debug: DebuggerOverlay;

  private readonly train = new TrainGraph(trainDescriptor);

  private readonly movement: MovementSystem;

  private readonly renderer: IsometricRenderer;

  private interaction!: InteractionSystem;

  private inputRouter!: InputRouter;

  private state: GameRuntimeState;

  private lastTime = performance.now();

  private userId = 'local-user';

  private loopHandle = 0;

  private fatalError = false;

  private destroyed = false;

  constructor(
    canvas: HTMLCanvasElement,
    overlayRoot: HTMLElement,
    overlays?: { errorScreen?: ErrorScreen; debugOverlay?: DebuggerOverlay },
  ) {
    this.canvas = canvas;
    this.overlayRoot = overlayRoot;
    this.display = new CanvasDisplay(canvas, GAME_CONFIG);
    this.toast = new ToastController(this.overlayRoot);
    this.dialogue = new DialogueController(this.overlayRoot);
    this.fade = new FadeController(this.overlayRoot);
    this.hud = new HudController(this.overlayRoot, this.audio, this.toast);
    this.errorScreen = overlays?.errorScreen ?? new ErrorScreen(this.overlayRoot);
    this.debug = overlays?.debugOverlay ?? new DebuggerOverlay(this.overlayRoot);

    const wagon = this.train.getCurrentWagon();
    this.state = createRuntimeState(GAME_CONFIG, wagon, this.train.getState());
    this.movement = new MovementSystem(this.state);
    this.movement.setNavMesh(wagon.navmesh);
    this.renderer = new IsometricRenderer(this.display, this.state);
    this.buildTargetsForWagon(wagon);
    window.addEventListener('resize', () => this.display.resize());
    this.debug.setStatus('Создание приложения');
    this.debug.log('game.constructor', {
      startWagon: wagon.id,
      targets: this.state.currentTargets.length,
    });
  }

  async init(): Promise<void> {
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
      await this.guard('Инициализация аудио', () => this.audio.init());
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
          onTravel: async (wagonId: string, spawnPoint: IsoPoint) => {
            await this.travelTo(wagonId, spawnPoint);
          },
          onStateChanged: () => this.saveGame(),
        });
        const haptics: HapticsBridge = {
          impact: (style: 'light' | 'medium' | 'heavy') => this.telegram.vibrate(style),
          notify: (style: 'success' | 'warning' | 'error') => this.telegram.notify(style),
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

  private tryRestoreSave(): void {
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

  private refreshDoorsFromFlags(): void {
    this.train.getAllWagons().forEach((wagon) => {
      wagon.doors.forEach((door) => {
        if (door.lockedByFlag && this.state.flags.story.has(door.lockedByFlag)) {
          this.train.setDoorState(wagon.id, door.id, 'open');
        }
      });
    });
  }

  private buildTargetsForWagon(wagon: WagonLayerData): void {
    const targets: InteractionTarget[] = [];
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

  private async travelTo(wagonId: string, spawnPoint: IsoPoint): Promise<void> {
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

  private saveGame(): void {
    persistSave(this.userId, createSaveFromState(this.state));
  }

  private async verifyInitData(raw: string): Promise<void> {
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

  private startLoop(): void {
    const tick = (time: number) => {
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

  destroy(): void {
    this.destroyed = true;
    if (this.loopHandle) {
      cancelAnimationFrame(this.loopHandle);
    }
    if (this.inputRouter) {
      this.inputRouter.detach();
    }
  }

  private async guard<T>(stage: string, task: () => Promise<T> | T): Promise<T> {
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

  private handleFatalError(error: unknown, stage: string): void {
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

  private describeError(error: unknown): { message: string; stack?: string } {
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
