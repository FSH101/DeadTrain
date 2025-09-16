import { createSaveFromState, persistSave } from '../core/save';
import type { AudioManager } from '../core/audio';
import type { ToastController } from '../core/toast';
import type { GameRuntimeState } from '../game/GameState';
import type { MovementSystem } from '../game/MovementSystem';
import type { TrainGraph } from '../game/TrainGraph';
import { getDialogue } from '../data/dialogues';
import type { DialogueChoice, DialogueNode, DoorDescriptor, Intent, InteractionTarget, IsoPoint } from '../types';
import type { DialogueController } from '../ui/dialogue';

interface InteractionSystemDeps {
  state: GameRuntimeState;
  movement: MovementSystem;
  train: TrainGraph;
  dialogue: DialogueController;
  toast: ToastController;
  audio: AudioManager;
  userId: string;
  onTravel: (wagonId: string, spawnPoint: IsoPoint) => Promise<void>;
  onStateChanged: () => void;
}

export class InteractionSystem {
  private readonly state: GameRuntimeState;

  private readonly movement: MovementSystem;

  private readonly train: TrainGraph;

  private readonly dialogue: DialogueController;

  private readonly toast: ToastController;

  private readonly audio: AudioManager;

  private readonly userId: string;

  private readonly onTravel: (wagonId: string, spawnPoint: IsoPoint) => Promise<void>;

  private readonly onStateChanged: () => void;

  constructor({ state, movement, train, dialogue, toast, audio, userId, onTravel, onStateChanged }: InteractionSystemDeps) {
    this.state = state;
    this.movement = movement;
    this.train = train;
    this.dialogue = dialogue;
    this.toast = toast;
    this.audio = audio;
    this.userId = userId;
    this.onTravel = onTravel;
    this.onStateChanged = onStateChanged;
  }

  async handleIntent(intent: Intent): Promise<void> {
    switch (intent.type) {
      case 'MoveTo':
        if (intent.destination) {
          this.handleMove(intent.destination);
        }
        break;
      case 'Interact':
        if (intent.target) {
          await this.handleInteraction(intent.target);
        }
        break;
      case 'Inspect':
        this.handleInspect(intent.target, intent.destination);
        break;
      default:
        break;
    }
  }

  private handleMove(destination: IsoPoint): void {
    this.state.marker.visible = true;
    this.state.marker.position = destination;
    this.movement.movePlayerTo(destination);
    void this.audio.playStep();
  }

  private async handleInteraction(target: InteractionTarget): Promise<void> {
    if (target.kind === 'door') {
      await this.handleDoorInteraction(target);
      return;
    }
    if (target.kind === 'npc') {
      this.handleNpcInteraction(target);
      return;
    }
    if (target.kind === 'object') {
      this.handleObjectInteraction(target);
    }
  }

  private async handleDoorInteraction(target: InteractionTarget): Promise<void> {
    const door = target.metadata?.door as { wagonId: string; descriptor: DoorDescriptor } | undefined;
    if (!door) {
      return;
    }
    const doorState = this.train.getDoorState(door.wagonId, door.descriptor.id);
    if (doorState.state === 'blocked') {
      this.toast.show('Дверь заклинило. Её не сдвинуть.');
      return;
    }
    if (doorState.state === 'locked') {
      if (door.descriptor.lockedByFlag && this.state.flags.story.has(door.descriptor.lockedByFlag)) {
        this.train.setDoorState(door.wagonId, door.descriptor.id, 'open');
      } else {
        this.toast.show('Механизм не реагирует. Нужно условие.');
        return;
      }
    }
    this.state.marker.visible = false;
    this.movement.stop();
    await this.onTravel(door.descriptor.targetWagonId, door.descriptor.spawnPoint);
    this.onStateChanged();
  }

  private handleNpcInteraction(target: InteractionTarget): void {
    const dialogueId = target.metadata?.dialogueId as string | undefined;
    if (!dialogueId) {
      return;
    }
    const dialogue = getDialogue(dialogueId);
    if (!dialogue) {
      this.toast.show('Этот персонаж молчит.');
      return;
    }
    const start = dialogue.nodes[0]?.id;
    if (!start) {
      return;
    }
    this.state.isInputBlocked = true;
    this.dialogue.open(dialogue, start, {
      onAdvance: (node, choice) => this.advanceDialogue(node, choice),
      canSelect: (choice) => this.canSelectChoice(choice),
      onClose: () => {
        this.state.isInputBlocked = false;
        this.onStateChanged();
        persistSave(this.userId, createSaveFromState(this.state));
      },
    });
  }

  private advanceDialogue(node: DialogueNode, choice?: DialogueChoice): string | null {
    if (node.type === 'ending') {
      this.state.flags.endings.add(node.endingId);
      this.toast.show(`Открыт финал: ${node.title}`);
      this.onStateChanged();
      persistSave(this.userId, createSaveFromState(this.state));
      return null;
    }
    if ('setFlag' in node && node.setFlag) {
      this.setFlag(node.setFlag);
    }
    if (node.type === 'choice') {
      if (choice) {
        this.applyChoice(choice);
        return choice.next;
      }
      return null;
    }
    return node.next ?? null;
  }

  private canSelectChoice(choice: DialogueChoice): { allowed: boolean; reason?: string } {
    if (choice.requiresFlag && !this.state.flags.story.has(choice.requiresFlag)) {
      return { allowed: false, reason: 'нужно доказательство' };
    }
    if (choice.requiresItem && !this.hasItem(choice.requiresItem)) {
      return { allowed: false, reason: 'не хватает предмета' };
    }
    return { allowed: true };
  }

  private applyChoice(choice: DialogueChoice): void {
    if (choice.setFlag) {
      this.setFlag(choice.setFlag);
    }
    if (choice.giveItem) {
      this.giveItem(choice.giveItem);
    }
    if (choice.removeItem) {
      this.removeItem(choice.removeItem);
    }
  }

  private handleObjectInteraction(target: InteractionTarget): void {
    const action = target.metadata?.onUse as string | undefined;
    switch (action) {
      case 'luggage-check':
        if (!this.state.flags.story.has('hasCrowbar')) {
          this.setFlag('hasCrowbar');
          this.toast.show('Ты нашёл ржавую монтировку.');
        } else {
          this.toast.show('Полка пустая.');
        }
        break;
      case 'bench-search':
        if (!this.hasItem('ticket')) {
          this.giveItem('ticket');
          this.setFlag('foundTicket');
          this.toast.show('В подлокотнике лежал билет.');
        } else {
          this.toast.show('Кресло уже проверено.');
        }
        break;
      case 'crate-fuse':
        if (!this.hasItem('fuse')) {
          this.giveItem('fuse');
          this.setFlag('foundFuse');
          this.toast.show('Нашёл предохранитель ОВ-17.');
        } else {
          this.toast.show('Больше подходящих деталей нет.');
        }
        break;
      case 'panel-power':
        if (this.state.flags.story.has('powerRestored')) {
          this.toast.show('Питание уже восстановлено.');
          break;
        }
        if (this.removeItem('fuse')) {
          this.setFlag('powerRestored');
          this.toast.show('Щиток зажужжал, свет вернулся.');
        } else {
          this.toast.show('Нужен целый предохранитель.');
        }
        break;
      case 'console-scan':
        if (this.state.flags.endings.size > 0) {
          this.toast.show('Пульт мигает: ты уже изменил судьбу состава.');
        } else {
          this.toast.show('Сенсоры ждут команды машиниста.');
        }
        break;
      default:
        this.toast.show('Здесь ничего не происходит.');
        break;
    }
    this.onStateChanged();
    persistSave(this.userId, createSaveFromState(this.state));
  }

  private handleInspect(target: InteractionTarget | null, destination?: IsoPoint): void {
    if (target) {
      if (target.kind === 'door') {
        const doorMeta = target.metadata as { door?: { descriptor?: { label?: string } } } | undefined;
        this.toast.show(doorMeta?.door?.descriptor?.label ?? 'Дверь в другой отсек.');
        return;
      }
      if (target.kind === 'npc') {
        this.toast.show('Можно поговорить.');
        return;
      }
      if (target.kind === 'object') {
        const objectMeta = target.metadata as { label?: string } | undefined;
        this.toast.show(objectMeta?.label ?? 'Старая деталь.');
        return;
      }
    }
    if (destination) {
      this.state.marker.visible = true;
      this.state.marker.position = destination;
      this.toast.show('Маршрут отмечен.');
    } else {
      this.toast.show('Проведи взглядом по тайлам, чтобы идти.');
    }
  }

  private setFlag(flag: string): void {
    if (this.state.flags.story.has(flag)) {
      return;
    }
    this.state.flags.story.add(flag);
    this.unlockDoorsForFlag(flag);
    this.onStateChanged();
  }

  private unlockDoorsForFlag(flag: string): void {
    this.train.getAllWagons().forEach((wagon) => {
      wagon.doors.forEach((door) => {
        if (door.lockedByFlag === flag) {
          this.train.setDoorState(wagon.id, door.id, 'open');
          this.toast.show('Сработал замок — дверь открыта.');
        }
      });
    });
  }

  private hasItem(item: string): boolean {
    return (this.state.inventory[item] ?? 0) > 0;
  }

  private giveItem(item: string): void {
    const count = this.state.inventory[item] ?? 0;
    this.state.inventory[item] = count + 1;
    this.onStateChanged();
  }

  private removeItem(item: string): boolean {
    const count = this.state.inventory[item] ?? 0;
    if (count <= 0) {
      return false;
    }
    if (count === 1) {
      delete this.state.inventory[item];
    } else {
      this.state.inventory[item] = count - 1;
    }
    this.onStateChanged();
    return true;
  }
}
