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

  private readonly train = new TrainGraph(trainDescriptor);

  private readonly movement: MovementSystem;

  private readonly renderer: IsometricRenderer;

  private interaction!: InteractionSystem;

  private inputRouter!: InputRouter;

  private state: GameRuntimeState;

  private lastTime = performance.now();

  private userId = 'local-user';

  private loopHandle = 0;

  constructor(canvas: HTMLCanvasElement, overlayRoot: HTMLElement) {
    this.canvas = canvas;
    this.overlayRoot = overlayRoot;
    this.display = new CanvasDisplay(canvas, GAME_CONFIG);
    this.toast = new ToastController(this.overlayRoot);
    this.dialogue = new DialogueController(this.overlayRoot);
    this.fade = new FadeController(this.overlayRoot);
    this.hud = new HudController(this.overlayRoot, this.audio, this.toast);

    const wagon = this.train.getCurrentWagon();
    this.state = createRuntimeState(GAME_CONFIG, wagon, this.train.getState());
    this.movement = new MovementSystem(this.state);
    this.movement.setNavMesh(wagon.navmesh);
    this.renderer = new IsometricRenderer(this.display, this.state);
    this.buildTargetsForWagon(wagon);
    window.addEventListener('resize', () => this.display.resize());
  }

  async init(): Promise<void> {
    const ctx = await this.telegram.init();
    this.userId = ctx.userId;
    await this.verifyInitData(ctx.initDataRaw);
    await this.audio.init();
    await this.audio.playAmbient('train');
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
    this.tryRestoreSave();
    this.startLoop();
  }

  private tryRestoreSave(): void {
    const save = loadSave(this.userId);
    if (!save) {
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
    wagon.doors.forEach((door) => {
      targets.push({
        id: door.id,
        kind: 'door',
        position: door.position,
        radius: door.radius ?? 48,
        metadata: { door: { wagonId: wagon.id, descriptor: door } },
      });
    });
    wagon.npcs.forEach((npc) => {
      targets.push({
        id: npc.id,
        kind: 'npc',
        position: npc.position,
        radius: npc.radius,
        metadata: { dialogueId: npc.dialogueId, name: npc.name },
      });
    });
    wagon.objects.forEach((object) => {
      targets.push({
        id: object.id,
        kind: 'object',
        position: object.position,
        radius: object.radius,
        metadata: { onUse: object.onUse, label: object.label },
      });
    });
    this.state.currentTargets = targets;
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
    }
  }

  private startLoop(): void {
    const tick = (time: number) => {
      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;
      this.movement.update(delta);
      this.renderer.render(delta);
      this.loopHandle = requestAnimationFrame(tick);
    };
    this.loopHandle = requestAnimationFrame(tick);
  }

  destroy(): void {
    if (this.loopHandle) {
      cancelAnimationFrame(this.loopHandle);
    }
    if (this.inputRouter) {
      this.inputRouter.detach();
    }
  }
}
