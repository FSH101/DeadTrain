/**
 * @typedef {Object} IsoPoint
 * @property {number} x
 * @property {number} y
 * @property {number} [z]
 */

/**
 * @typedef {Object} ScreenPoint
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} SpritePlacement
 * @property {string} id
 * @property {{ x: number, y: number }} [anchor]
 * @property {{ x: number, y: number }} [offset]
 * @property {number} [scale]
 */

/** @typedef {'MoveTo' | 'Interact' | 'Inspect'} IntentType */

/** @typedef {'door' | 'npc' | 'object'} InteractionKind */

/**
 * @typedef {Object} Intent
 * @property {IntentType} type
 * @property {InteractionTarget | null} target
 * @property {IsoPoint} [destination]
 */

/**
 * @typedef {Object} InteractionTarget
 * @property {string} id
 * @property {InteractionKind} kind
 * @property {IsoPoint} position
 * @property {number} radius
 * @property {Record<string, unknown>} [metadata]
 */

/**
 * @typedef {Object} LayerTile
 * @property {string} tileId
 * @property {IsoPoint} position
 * @property {number} [elevation]
 * @property {string} [decalId]
 * @property {number} [rotation]
 * @property {string} [tint]
 * @property {SpritePlacement} [sprite]
 * @property {boolean} [drawBase]
 */

/**
 * @typedef {Object} NavNode
 * @property {string} id
 * @property {IsoPoint} point
 * @property {string[]} neighbors
 */

/**
 * @typedef {Object} LightZone
 * @property {string} id
 * @property {IsoPoint} center
 * @property {number} radius
 * @property {number} intensity
 * @property {boolean} [flicker]
 */

/**
 * @typedef {Object} DoorDescriptor
 * @property {string} id
 * @property {string} label
 * @property {string} targetWagonId
 * @property {IsoPoint} spawnPoint
 * @property {IsoPoint} position
 * @property {number} radius
 * @property {string} [lockedByFlag]
 * @property {string} [blockedIfFlag]
 * @property {boolean} [openByDefault]
 * @property {SpritePlacement} [sprite]
 */

/**
 * @typedef {Object} NpcDescriptor
 * @property {string} id
 * @property {string} name
 * @property {IsoPoint} position
 * @property {number} radius
 * @property {string} dialogueId
 * @property {'static' | 'loop'} [idleAnimation]
 * @property {SpritePlacement} [sprite]
 */

/**
 * @typedef {Object} InteractiveObjectDescriptor
 * @property {string} id
 * @property {string} label
 * @property {IsoPoint} position
 * @property {number} radius
 * @property {string} onUse
 * @property {SpritePlacement} [sprite]
 */

/**
 * @typedef {Object} WagonLayerData
 * @property {string} id
 * @property {string} title
 * @property {LayerTile[]} floor
 * @property {LayerTile[]} walls
 * @property {LayerTile[]} decals
 * @property {IsoPoint[]} navmesh
 * @property {IsoPoint} spawn
 * @property {DoorDescriptor[]} doors
 * @property {NpcDescriptor[]} npcs
 * @property {InteractiveObjectDescriptor[]} objects
 * @property {{ position: IsoPoint, message: string }[]} [hints]
 * @property {LightZone[]} [lights]
 * @property {'dark' | 'normal'} [ambient]
 */

/**
 * @typedef {Object} TrainGraphDescriptor
 * @property {string} startWagonId
 * @property {WagonLayerData[]} wagons
 */

/**
 * @typedef {Object} DialogueChoice
 * @property {string} id
 * @property {string} label
 * @property {string | null} next
 * @property {string} [setFlag]
 * @property {string} [requiresFlag]
 * @property {string} [requiresItem]
 * @property {string} [giveItem]
 * @property {string} [removeItem]
 * @property {'success' | 'warning' | 'impact'} [haptic]
 */

/**
 * @typedef {(
 *   | {
 *       id: string;
 *       type: 'line';
 *       speaker: string;
 *       text: string;
 *       next: string | null;
 *       setFlag?: string;
 *       requiresFlag?: string;
 *       requiresItem?: string;
 *     }
 *   | {
 *       id: string;
 *       type: 'choice';
 *       speaker: string;
 *       text: string;
 *       options: DialogueChoice[];
 *     }
 *   | {
 *       id: string;
 *       type: 'ending';
 *       title: string;
 *       text: string;
 *       endingId: string;
 *     }
 * )} DialogueNode
 */

/**
 * @typedef {Object} DialogueScript
 * @property {string} id
 * @property {DialogueNode[]} nodes
 */

/** @typedef {Record<string, number>} Inventory */

/**
 * @typedef {Object} GameFlags
 * @property {Set<string>} story
 * @property {Set<string>} endings
 */

/**
 * @typedef {Object} GameSaveData
 * @property {string} wagonId
 * @property {IsoPoint} position
 * @property {string[]} flags
 * @property {string[]} endings
 * @property {Inventory} inventory
 * @property {number} timestamp
 */

/**
 * @typedef {Object} GameConfig
 * @property {number} virtualWidth
 * @property {number} virtualHeight
 * @property {number} tileWidth
 * @property {number} tileHeight
 */

/**
 * @typedef {Object} ToastMessage
 * @property {string} id
 * @property {string} text
 * @property {number} duration
 */

/**
 * @typedef {Object} TrainDoorState
 * @property {string} id
 * @property {'open' | 'locked' | 'blocked'} state
 */

/**
 * @typedef {Object} WagonState
 * @property {string} id
 * @property {TrainDoorState[]} doorStates
 */

/**
 * @typedef {Object} TrainState
 * @property {string} currentWagonId
 * @property {WagonState[]} wagons
 */

export {};
