const buildRectTiles = (startX, startY, width, height, tint) => {
  const tiles = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      tiles.push({
        tileId: 'floor-metal',
        position: { x: startX + x, y: startY + y },
        tint,
      });
    }
  }
  return tiles;
};

const wagonAFloor = [
  ...buildRectTiles(0, 0, 4, 4, '#1e283d'),
  { tileId: 'floor-metal', position: { x: 4, y: 1 }, tint: '#1e283d', decalId: 'rust' },
  { tileId: 'floor-metal', position: { x: 4, y: 2 }, tint: '#1e283d' },
];

const wagonBFloor = [
  ...buildRectTiles(0, 0, 4, 4, '#141d31'),
  { tileId: 'floor-metal', position: { x: 4, y: 1 }, tint: '#19253b', decalId: 'rust' },
  { tileId: 'floor-metal', position: { x: 4, y: 2 }, tint: '#19253b' },
];

const wagonCFloor = [
  ...buildRectTiles(0, 0, 4, 3, '#233050'),
  { tileId: 'floor-metal', position: { x: 4, y: 1 }, tint: '#2c3f63', decalId: 'rust' },
];

export const trainDescriptor = {
  startWagonId: 'car-a',
  wagons: [
    {
      id: 'car-a',
      title: 'Вагон А — Отсек пассажиров',
      floor: wagonAFloor,
      walls: [
        { tileId: 'wall-metal', position: { x: -1, y: 0 }, tint: '#3a4660', elevation: 96 },
        { tileId: 'wall-metal', position: { x: -1, y: 1 }, tint: '#3a4660', elevation: 96 },
        { tileId: 'wall-metal', position: { x: -1, y: 2 }, tint: '#3a4660', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 0, y: -1 }, tint: '#3a4660', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 1, y: -1 }, tint: '#3a4660', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 2, y: -1 }, tint: '#3a4660', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 3, y: -1 }, tint: '#3a4660', elevation: 96 },
      ],
      decals: [
        { tileId: 'floor-metal', position: { x: 1, y: 2 }, tint: '#1e283d', decalId: 'grime' },
      ],
      navmesh: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
      ],
      spawn: { x: 1, y: 2 },
      doors: [
        {
          id: 'car-a-right',
          label: 'Перейти в тёмный вагон',
          position: { x: 4, y: 1 },
          radius: 48,
          targetWagonId: 'car-b',
          spawnPoint: { x: 0, y: 1 },
          lockedByFlag: 'doorAUnlocked',
        },
        {
          id: 'car-a-left',
          label: 'Закрытая дверь назад',
          position: { x: -1, y: 1 },
          radius: 48,
          targetWagonId: 'car-a',
          spawnPoint: { x: 0, y: 1 },
          blockedIfFlag: 'brokenBackDoor',
        },
      ],
      npcs: [
        {
          id: 'conductor',
          name: 'Дежурный',
          position: { x: 1, y: 1 },
          radius: 40,
          dialogueId: 'conductor',
          idleAnimation: 'loop',
        },
      ],
      objects: [
        {
          id: 'luggage',
          label: 'Багажная полка',
          position: { x: 2, y: 0 },
          radius: 40,
          onUse: 'luggage-check',
        },
        {
          id: 'bench',
          label: 'Пустое кресло',
          position: { x: 0, y: 2 },
          radius: 36,
          onUse: 'bench-search',
        },
      ],
      hints: [
        { position: { x: 3.6, y: 1.2 }, message: 'Дверь ведёт дальше' },
      ],
      lights: [
        { id: 'a-main', center: { x: 1.5, y: 1.5 }, radius: 1.4, intensity: 0.45, flicker: true },
      ],
      ambient: 'normal',
    },
    {
      id: 'car-b',
      title: 'Вагон B — Технический отсек',
      floor: wagonBFloor,
      walls: [
        { tileId: 'wall-metal', position: { x: -1, y: 0 }, tint: '#2c3b5a', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 0, y: -1 }, tint: '#2c3b5a', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 1, y: -1 }, tint: '#2c3b5a', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 2, y: -1 }, tint: '#2c3b5a', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 3, y: -1 }, tint: '#2c3b5a', elevation: 96 },
      ],
      decals: [
        { tileId: 'floor-metal', position: { x: 2, y: 2 }, tint: '#19253b', decalId: 'grime' },
      ],
      navmesh: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
      ],
      spawn: { x: 0, y: 1 },
      doors: [
        {
          id: 'car-b-left',
          label: 'Назад в салон',
          position: { x: 0, y: 1 },
          radius: 44,
          targetWagonId: 'car-a',
          spawnPoint: { x: 3, y: 1 },
          openByDefault: true,
        },
        {
          id: 'car-b-right',
          label: 'К кабине машиниста',
          position: { x: 4, y: 1 },
          radius: 48,
          targetWagonId: 'car-c',
          spawnPoint: { x: 0, y: 1 },
          lockedByFlag: 'powerRestored',
        },
      ],
      npcs: [
        {
          id: 'mechanic-echo',
          name: 'Эхо механика',
          position: { x: 2, y: 2 },
          radius: 36,
          dialogueId: 'mechanic',
          idleAnimation: 'static',
        },
      ],
      objects: [
        {
          id: 'fuse-crate',
          label: 'Ящик с запчастями',
          position: { x: 3, y: 0 },
          radius: 40,
          onUse: 'crate-fuse',
        },
        {
          id: 'power-panel',
          label: 'Электрощиток',
          position: { x: 1, y: 1 },
          radius: 44,
          onUse: 'panel-power',
        },
      ],
      hints: [
        { position: { x: 1, y: 1 }, message: 'Щиток без питания' },
      ],
      lights: [
        { id: 'b-lamp', center: { x: 1.5, y: 1.5 }, radius: 1.1, intensity: 0.35, flicker: true },
      ],
      ambient: 'dark',
    },
    {
      id: 'car-c',
      title: 'Кабина машиниста',
      floor: wagonCFloor,
      walls: [
        { tileId: 'wall-metal', position: { x: -1, y: 0 }, tint: '#324468', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 0, y: -1 }, tint: '#324468', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 1, y: -1 }, tint: '#324468', elevation: 96 },
        { tileId: 'wall-metal', position: { x: 2, y: -1 }, tint: '#324468', elevation: 96 },
      ],
      decals: [
        { tileId: 'floor-metal', position: { x: 1, y: 1 }, tint: '#233050', decalId: 'grime' },
      ],
      navmesh: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
      ],
      spawn: { x: 0, y: 1 },
      doors: [
        {
          id: 'car-c-left',
          label: 'Назад в техотсек',
          position: { x: 0, y: 1 },
          radius: 44,
          targetWagonId: 'car-b',
          spawnPoint: { x: 3, y: 1 },
          openByDefault: true,
        },
      ],
      npcs: [
        {
          id: 'engineer',
          name: 'Машинист',
          position: { x: 2, y: 1 },
          radius: 40,
          dialogueId: 'engineer',
          idleAnimation: 'loop',
        },
      ],
      objects: [
        {
          id: 'console',
          label: 'Пульт управления',
          position: { x: 1, y: 0 },
          radius: 36,
          onUse: 'console-scan',
        },
      ],
      hints: [
        { position: { x: 2, y: 1 }, message: 'Поговорить с машинистом' },
      ],
      lights: [
        { id: 'c-lamp', center: { x: 1.5, y: 0.8 }, radius: 1.1, intensity: 0.4, flicker: false },
      ],
      ambient: 'normal',
    },
  ],
};
