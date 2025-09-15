export const world = {
  tileSize: { width: 104, height: 60 },
  introScript: 'awakeningIntro',
  startScene: 'awakening',
  flags: {
    hasLight: {
      label: 'Фонарик',
      description: 'Луч фонарика сдерживает тьму между вагонами.',
      visible: true,
    },
    knowsSequence: {
      label: 'Последовательность',
      description: 'Жёлтый → зелёный → красный — порядок железа.',
      visible: true,
    },
    heardRiddle: {
      label: 'Слова машиниста',
      description: 'Подсказывает ответ на вопрос о ночи.',
      visible: true,
    },
    engineUnlocked: {
      label: 'Замки отпёрты',
      description: 'Тамбуры к кабине разблокированы.',
      visible: true,
    },
    heardWarning: {
      label: 'Предупреждение',
      description: 'Динамик просил ехать тихо.',
      visible: false,
    },
  },
  scenes: {
    awakening: {
      id: 'awakening',
      title: 'Вагон 1: Пробуждение',
      subtitle: 'Ты очнулся один среди мерцающих ламп.',
      width: 6,
      height: 5,
      entry: { scriptId: 'awakeningIntro', once: true },
      floor: [
        ['floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow'],
        ['floor-shadow', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-shadow'],
        ['floor-shadow', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-shadow'],
        ['floor-shadow', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-shadow'],
        ['floor-shadow', 'floor-shadow', 'floor-warning', 'floor-warning', 'floor-shadow', 'floor-shadow'],
      ],
      objects: [
        {
          id: 'awakening-hero',
          sprite: 'hero',
          label: 'Ты',
          position: { x: 2, y: 3 },
          interactive: false,
        },
        {
          id: 'awakening-seat-left',
          sprite: 'seat-left',
          position: { x: 1, y: 2 },
          interactive: false,
        },
        {
          id: 'awakening-seat-right',
          sprite: 'seat-right',
          position: { x: 4, y: 2 },
          interactive: false,
        },
        {
          id: 'speaker',
          sprite: 'speaker',
          label: 'Динамик',
          position: { x: 1, y: 1 },
          scriptId: 'speaker',
          repeatScriptId: 'speakerRepeat',
        },
        {
          id: 'window',
          sprite: 'window',
          label: 'Окно в ночь',
          position: { x: 4, y: 1 },
          scriptId: 'awakeningWindow',
        },
        {
          id: 'forward-door',
          sprite: 'door-forward',
          label: 'Дверь вперёд',
          position: { x: 3, y: 0 },
          scriptId: 'forwardDoor',
        },
        {
          id: 'rear-door',
          sprite: 'door-rear',
          label: 'Стык вагонов',
          position: { x: 2, y: 4 },
          scriptId: 'rearDoor',
        },
        {
          id: 'ceiling-lamp',
          sprite: 'lamp',
          position: { x: 3, y: 2 },
          interactive: false,
        },
      ],
    },

    passengers: {
      id: 'passengers',
      title: 'Вагон 2: Пассажиры-призраки',
      subtitle: 'Немые лица ждут слов, которых не бывает.',
      width: 6,
      height: 6,
      entry: { scriptId: 'passengerEntry', once: false },
      floor: [
        ['floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow'],
        ['floor-shadow', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-shadow'],
        ['floor-shadow', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-shadow'],
        ['floor-shadow', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-shadow'],
        ['floor-shadow', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-steel', 'floor-shadow'],
        ['floor-shadow', 'floor-shadow', 'floor-warning', 'floor-warning', 'floor-shadow', 'floor-shadow'],
      ],
      objects: [
        {
          id: 'passengers-hero',
          sprite: 'hero',
          label: 'Ты',
          position: { x: 2, y: 4 },
          interactive: false,
        },
        {
          id: 'woman',
          sprite: 'npc-woman',
          label: 'Женщина с коляской',
          position: { x: 1, y: 2 },
          scriptId: 'passengerWoman',
          repeatScriptId: 'passengerWomanRepeat',
        },
        {
          id: 'inspector',
          sprite: 'npc-inspector',
          label: 'Контролёр',
          position: { x: 4, y: 1 },
          scriptId: 'passengerInspector',
        },
        {
          id: 'boy',
          sprite: 'npc-boy',
          label: 'Парень с фонариком',
          position: { x: 4, y: 4 },
          scriptId: 'passengerBoy',
          repeatScriptId: 'passengerBoyRepeat',
        },
        {
          id: 'door-service',
          sprite: 'door-service',
          label: 'Служебный отсек',
          position: { x: 0, y: 4 },
          scriptId: 'passengersToService',
        },
        {
          id: 'door-engine',
          sprite: 'door-engine',
          label: 'Дверь к кабине',
          position: { x: 5, y: 2 },
          scriptId: 'passengersToEngine',
          stateClasses: [
            { className: 'iso-object--door-open', requires: ['engineUnlocked'] },
          ],
        },
        {
          id: 'passenger-shadow-1',
          sprite: 'npc-shadow',
          position: { x: 2, y: 1 },
          interactive: false,
        },
        {
          id: 'passenger-shadow-2',
          sprite: 'npc-shadow',
          position: { x: 3, y: 3 },
          interactive: false,
        },
      ],
    },

    service: {
      id: 'service',
      title: 'Вагон 3: Служебный отсек',
      subtitle: 'Щитки, проводка и запах озона.',
      width: 5,
      height: 5,
      entry: { scriptId: 'serviceEntry', once: false },
      floor: [
        ['floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow'],
        ['floor-shadow', 'floor-panel', 'floor-panel', 'floor-panel', 'floor-shadow'],
        ['floor-shadow', 'floor-panel', 'floor-grid', 'floor-panel', 'floor-shadow'],
        ['floor-shadow', 'floor-panel', 'floor-panel', 'floor-panel', 'floor-shadow'],
        ['floor-shadow', 'floor-shadow', 'floor-warning', 'floor-shadow', 'floor-shadow'],
      ],
      objects: [
        {
          id: 'service-hero',
          sprite: 'hero',
          label: 'Ты',
          position: { x: 2, y: 3 },
          interactive: false,
        },
        {
          id: 'panel',
          sprite: 'panel',
          label: 'Командный щиток',
          position: { x: 2, y: 1 },
          scriptId: 'servicePanel',
          stateClasses: [
            { className: 'panel--activated', requires: ['engineUnlocked'] },
          ],
        },
        {
          id: 'wires',
          sprite: 'wires',
          label: 'Раскрытые провода',
          position: { x: 3, y: 2 },
          scriptId: 'serviceWires',
        },
        {
          id: 'door-passengers',
          sprite: 'door-service',
          label: 'Назад к пассажирам',
          position: { x: 0, y: 3 },
          scriptId: 'serviceToPassengers',
        },
        {
          id: 'door-gap',
          sprite: 'door-rear',
          label: 'Межвагонный переход',
          position: { x: 4, y: 2 },
          scriptId: 'serviceToChase',
        },
        {
          id: 'tool-crate',
          sprite: 'crate',
          position: { x: 1, y: 2 },
          interactive: false,
        },
      ],
    },

    chase: {
      id: 'chase',
      title: 'Вагон 4: Шаги в темноте',
      subtitle: 'Между вагонами шевелится проводная тень.',
      width: 5,
      height: 5,
      entry: { scriptId: 'chaseEncounter', once: false },
      floor: [
        ['floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow'],
        ['floor-shadow', 'floor-warning', 'floor-warning', 'floor-warning', 'floor-shadow'],
        ['floor-shadow', 'floor-warning', 'floor-gap', 'floor-warning', 'floor-shadow'],
        ['floor-shadow', 'floor-warning', 'floor-warning', 'floor-warning', 'floor-shadow'],
        ['floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow'],
      ],
      objects: [
        {
          id: 'chase-hero',
          sprite: 'hero',
          label: 'Ты',
          position: { x: 2, y: 3 },
          interactive: false,
        },
        {
          id: 'entity',
          sprite: 'entity',
          position: { x: 2, y: 2 },
          interactive: false,
        },
        {
          id: 'chase-light',
          sprite: 'lamp',
          position: { x: 2, y: 1 },
          interactive: false,
        },
      ],
    },

    engine: {
      id: 'engine',
      title: 'Вагон 5: Кабина',
      subtitle: 'Машинист ждёт ответ, чтобы остановить ночь.',
      width: 5,
      height: 4,
      entry: { scriptId: 'engineEntry', once: false },
      floor: [
        ['floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow', 'floor-shadow'],
        ['floor-shadow', 'floor-panel', 'floor-panel', 'floor-panel', 'floor-shadow'],
        ['floor-shadow', 'floor-panel', 'floor-panel', 'floor-panel', 'floor-shadow'],
        ['floor-shadow', 'floor-shadow', 'floor-warning', 'floor-shadow', 'floor-shadow'],
      ],
      objects: [
        {
          id: 'engine-hero',
          sprite: 'hero',
          label: 'Ты',
          position: { x: 2, y: 3 },
          interactive: false,
        },
        {
          id: 'engineer',
          sprite: 'engineer',
          label: 'Машинист',
          position: { x: 2, y: 1 },
          scriptId: 'engineer',
        },
        {
          id: 'engine-window',
          sprite: 'window-cabin',
          label: 'Лобовое стекло',
          position: { x: 4, y: 1 },
          scriptId: 'engineWindow',
        },
        {
          id: 'engine-door-back',
          sprite: 'door-rear',
          label: 'Назад',
          position: { x: 0, y: 2 },
          scriptId: 'engineBack',
        },
      ],
    },
  },

  scripts: {
    awakeningIntro: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content:
            'Жёсткое сиденье, чужой запах металла и мерцание ламп. Пальцы не помнят билета, но помнят путь.',
          note: 'Нажимай на объекты, чтобы осмотреться и принять решения.',
          next: null,
        },
      },
    },

    speaker: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content: 'Динамик трескается и чужим голосом шепчет: «Тихо едь — целым будешь».',
          effects: [{ type: 'setFlag', flag: 'heardWarning' }],
          next: null,
        },
      },
    },

    speakerRepeat: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content: 'Пластик корпуса холоден. Динамик молчит, будто уже сказал всё.',
          next: null,
        },
      },
    },

    awakeningWindow: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content:
            'За стеклом — равнина без огней. Рельсы исчезают в темноте, но поезд уверенно несётся вперёд.',
          next: null,
        },
      },
    },

    forwardDoor: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Передняя дверь приоткрыта. Слышны приглушённые голоса.',
          options: [
            {
              text: 'Войти к пассажирам',
              effects: [{ type: 'goToScene', sceneId: 'passengers' }],
            },
            { text: 'Пока посидеть', next: null },
          ],
        },
      },
    },

    rearDoor: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Стык вагонов дышит тьмой. За щелью гул и шорохи проводов.',
          options: [
            {
              text: 'Шагнуть в темноту',
              requiresNot: ['hasLight'],
              next: 'void',
            },
            {
              text: 'Посветить фонариком и пройти',
              requires: ['hasLight'],
              effects: [{ type: 'goToScene', sceneId: 'chase' }],
            },
            { text: 'Отойти', next: null },
          ],
        },
        void: {
          type: 'text',
          content:
            'Ты делаешь шаг — и пол исчезает. Холодное ничто тянет вниз, а поезд уезжает без тебя.',
          effects: [{ type: 'triggerEnding', endingId: 'void' }],
          next: null,
        },
      },
    },

    passengerEntry: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content:
            'Скамейки заняты безмолвными людьми. У одних вместо лиц — гладкая кожа, у других — буквы, шепчущиеся сами с собой.',
          next: null,
        },
      },
    },

    passengerWoman: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content:
            'Женщина качает пустую коляску. «Укачала — и вагон её съел. Если ищешь выход — слушай железо: буфер, шина, блокировка».',
          effects: [{ type: 'setFlag', flag: 'knowsSequence' }],
          next: null,
        },
      },
    },

    passengerWomanRepeat: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content: 'Коляска пустая, но она всё ещё укачивает её и шепчет про порядок железа.',
          next: null,
        },
      },
    },

    passengerInspector: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Контролёр не поднимает глаз. Его билет покрыт чужими именами.',
          options: [
            {
              text: 'Мне нужен выход',
              next: 'riddle',
            },
            {
              text: 'Покажи ключ',
              next: 'order',
            },
            { text: 'Отойти', next: null },
          ],
        },
        riddle: {
          type: 'text',
          content: '«Двери откроет тот, кто знает, чем ночь становится к рассвету».',
          effects: [{ type: 'setFlag', flag: 'heardRiddle' }],
          next: null,
        },
        order: {
          type: 'text',
          content: '«Железо любит порядок. Ошибёшься — и оно съест свет».',
          effects: [{ type: 'setFlag', flag: 'knowsSequence' }],
          next: null,
        },
      },
    },

    passengerBoy: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Парень у двери сжимает фонарик. Руки дрожат, но свет не гаснет.',
          options: [
            {
              text: 'Взять фонарик',
              requiresNot: ['hasLight'],
              next: 'take',
            },
            {
              text: 'Поблагодарить за свет',
              requires: ['hasLight'],
              next: 'thanks',
            },
            { text: 'Отойти', next: null },
          ],
        },
        take: {
          type: 'text',
          content: 'Он отдаёт фонарик. «Свет короткий, но честный. Тамбур слушается только его».',
          effects: [{ type: 'setFlag', flag: 'hasLight' }],
          next: null,
        },
        thanks: {
          type: 'text',
          content: '«Держи его ближе к полу», — шепчет парень, уже не глядя на тебя.',
          next: null,
        },
      },
    },

    passengerBoyRepeat: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content: 'Парень смотрит в окно. Фонарик в твоей руке отражается в стекле.',
          next: null,
        },
      },
    },

    passengersToService: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Дверь в служебный отсек скользит в сторону.',
          options: [
            {
              text: 'Зайти внутрь',
              effects: [{ type: 'goToScene', sceneId: 'service' }],
            },
            { text: 'Остаться с пассажирами', next: null },
          ],
        },
      },
    },

    passengersToEngine: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Стальная дверь ведёт к кабине машиниста.',
          options: [
            {
              text: 'Войти в кабину',
              requires: ['engineUnlocked'],
              effects: [{ type: 'goToScene', sceneId: 'engine' }],
            },
            {
              text: 'Дёрнуть запертую дверь',
              requiresNot: ['engineUnlocked'],
              next: 'locked',
            },
            { text: 'Отойти', next: null },
          ],
        },
        locked: {
          type: 'text',
          content: 'Дверь не двигается. Замки ждут правильной последовательности.',
          next: null,
        },
      },
    },

    serviceEntry: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content: 'В узком отсеке пахнет озоном. Таблички обещают порядок, а провода шепчутся в темноте.',
          next: null,
        },
      },
    },

    servicePanel: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Щиток ждёт последовательность.',
          options: [
            {
              text: 'Ввести последовательность',
              requiresNot: ['engineUnlocked'],
              next: 'sequence',
            },
            {
              text: 'Проверить огни',
              requires: ['engineUnlocked'],
              next: 'afterUnlock',
            },
            { text: 'Отойти', next: null },
          ],
        },
        sequence: {
          type: 'choice',
          prompt: 'Какие тумблеры щёлкнуть?',
          description: 'Жёлтый — буфер, зелёный — шина, красный — блокировка.',
          options: [
            {
              text: 'Жёлтый → Зелёный → Красный',
              next: 'unlock',
              description: 'Порядок, о котором шептали пассажиры.',
            },
            {
              text: 'Зелёный → Жёлтый → Красный',
              next: 'alarm',
            },
            {
              text: 'Красный → Жёлтый → Зелёный',
              next: 'alarm',
            },
          ],
        },
        unlock: {
          type: 'text',
          content: 'Щиток подтверждает выбор. Замки впереди щёлкают, а тьма на секунду отступает.',
          effects: [
            { type: 'setFlag', flag: 'engineUnlocked' },
            { type: 'setFlag', flag: 'knowsSequence' },
          ],
          next: 'afterUnlock',
        },
        alarm: {
          type: 'text',
          content: 'Свет тухнет почти до нуля. Между вагонами шуршат длинные шаги.',
          effects: [{ type: 'goToScene', sceneId: 'chase' }],
          next: null,
        },
        afterUnlock: {
          type: 'choice',
          prompt: 'Огни моргают в нужном порядке.',
          options: [
            {
              text: 'Проскочить в открытую дверь',
              next: 'quick',
            },
            {
              text: 'Вернуться к пассажирам',
              effects: [{ type: 'goToScene', sceneId: 'passengers' }],
            },
            {
              text: 'Идти к кабине',
              effects: [{ type: 'goToScene', sceneId: 'passengers' }],
              description: 'Дверь к кабине теперь поддастся.',
            },
          ],
        },
        quick: {
          type: 'text',
          content: 'Тамбуры раздвигаются, и вместо пустоты появляется платформа с тусклым светом.',
          effects: [{ type: 'triggerEnding', endingId: 'quickExit' }],
          next: null,
        },
      },
    },

    serviceWires: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content: 'Провода дрожат, будто живые. Из щели тянется горячее дыхание.',
          effects: [{ type: 'goToScene', sceneId: 'chase' }],
          next: null,
        },
      },
    },

    serviceToPassengers: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Вернуться к пассажирам?',
          options: [
            {
              text: 'Вернуться',
              effects: [{ type: 'goToScene', sceneId: 'passengers' }],
            },
            { text: 'Остаться здесь', next: null },
          ],
        },
      },
    },

    serviceToChase: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Стык вагонов подрагивает. Слышно дыхание тьмы.',
          options: [
            {
              text: 'Выйти между вагонами',
              effects: [{ type: 'goToScene', sceneId: 'chase' }],
            },
            { text: 'Закрыть дверь', next: null },
          ],
        },
      },
    },

    chaseEncounter: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Между вагонами сгущается фигура из проводов. Она слышит твой пульс.',
          options: [
            {
              text: 'Поднять фонарь и рвануть к кабине',
              requires: ['hasLight'],
              next: 'run',
            },
            {
              text: 'Вернуться к пассажирам под светом',
              requires: ['hasLight'],
              next: 'hide',
            },
            {
              text: 'Дёрнуть стоп-кран',
              next: 'brake',
            },
            {
              text: 'Замереть, надеясь, что пройдёт мимо',
              next: 'caught',
            },
            {
              text: 'Шагнуть вслепую',
              requiresNot: ['hasLight'],
              next: 'void',
            },
          ],
        },
        run: {
          type: 'text',
          content: 'Ты бежишь вперёд. Свет режет тьму, и тень отступает. Дверь кабины впереди.',
          effects: [{ type: 'goToScene', sceneId: 'engine' }],
          next: null,
        },
        hide: {
          type: 'text',
          content: 'Ты отступаешь под светом фонаря. Тень шипит, но отползает обратно.',
          effects: [{ type: 'goToScene', sceneId: 'passengers' }],
          next: null,
        },
        brake: {
          type: 'text',
          content: 'Рывок за стоп-кран — и поезд срывается в пустоту. Шум обрывается, как нитка.',
          effects: [{ type: 'triggerEnding', endingId: 'brake' }],
          next: null,
        },
        caught: {
          type: 'text',
          content: 'Проволочные руки обвивают тебя. Холод стягивает грудь, и тьма забирает дыхание.',
          effects: [{ type: 'triggerEnding', endingId: 'caught' }],
          next: null,
        },
        void: {
          type: 'text',
          content: 'Без света шаг превращается в падение. Поезд уезжает, оставляя тебя в пустоте.',
          effects: [{ type: 'triggerEnding', endingId: 'void' }],
          next: null,
        },
      },
    },

    engineEntry: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content: 'В кабине пахнет гарью и холодным ветром. Машинист сидит спиной и слушает каждый твой шаг.',
          next: null,
        },
      },
    },

    engineer: {
      start: 'greet',
      nodes: {
        greet: {
          type: 'choice',
          prompt: 'Машинист не поворачивается. Его руки лежат на коленях.',
          options: [
            { text: 'Кто ты?', next: 'who' },
            { text: 'Мне нужен выход', next: 'out' },
            { text: 'Молчать', next: 'silent' },
          ],
        },
        who: {
          type: 'text',
          content: '«Я машинист тех, кто забыл, где сходить. Но вопрос удержит дверь открытой.»',
          next: 'riddle',
        },
        out: {
          type: 'text',
          content: '«Двери слушают смысл. Ответь — и проснёшься не здесь.»',
          next: 'riddle',
        },
        silent: {
          type: 'text',
          content: '«Тогда слушай коротко», — голос сухой, как пустой перрон.',
          next: 'riddle',
        },
        riddle: {
          type: 'choice',
          prompt: '«Ночь катится без колёс, а утро приходит без шагов. Чем к утру становится ночь?»',
          options: [
            { text: 'Пеплом', next: 'wrong' },
            { text: 'Памятью', next: 'wrong' },
            { text: 'Рассветом', requires: ['heardRiddle'], next: 'right' },
            { text: 'Я не знаю', next: 'wrong' },
          ],
        },
        wrong: {
          type: 'text',
          content: 'Машинист долго молчит. «Не сегодня». Сквозняк вышвыривает тебя обратно.',
          effects: [{ type: 'goToScene', sceneId: 'chase' }],
          next: null,
        },
        right: {
          type: 'text',
          content: 'Он кивает. «Значит, видишь». Замки отпираются, и вдали сереет станция.',
          effects: [{ type: 'triggerEnding', endingId: 'longExit' }],
          next: null,
        },
      },
    },

    engineWindow: {
      start: 'start',
      nodes: {
        start: {
          type: 'text',
          content: 'Сквозь стекло — бесконечная темнота. Только рельсы вспыхивают искрами и исчезают.',
          next: null,
        },
      },
    },

    engineBack: {
      start: 'start',
      nodes: {
        start: {
          type: 'choice',
          prompt: 'Вернуться в тамбур?',
          options: [
            {
              text: 'Отступить',
              effects: [{ type: 'goToScene', sceneId: 'chase' }],
            },
            { text: 'Остаться', next: null },
          ],
        },
      },
    },
  },

  endings: {
    quickExit: {
      title: 'Платформа наяву',
      content:
        'Тамбуры раздвигаются. Впереди — пустая станция с тусклым табло. Ты выходишь, и воздух становится настоящим.',
      note: 'Иногда достаточно настроить железо.',
      actions: [
        { text: 'Проснуться снова', action: 'restart' },
        { text: 'Остаться на платформе', action: 'close' },
      ],
    },
    longExit: {
      title: 'Ответ рассвета',
      content:
        'Кабина открывается. Рельсы ведут к серому утру. Ты делаешь шаг — и поезд уходит пустым.',
      note: 'Слова машиниста ведут к свету.',
      actions: [
        { text: 'Пройти путь ещё раз', action: 'restart' },
        { text: 'Идти к свету', action: 'close' },
      ],
    },
    void: {
      title: 'Провал в никуда',
      content: 'Без света переход превращается в пропасть. Поезд уезжает, оставляя тебя в шепчущей пустоте.',
      note: 'Некоторые двери требуют терпения.',
      actions: [{ text: 'Попробовать снова', action: 'restart' }],
    },
    brake: {
      title: 'Срыв с рельс',
      content: 'Стоп-кран рвёт сцепления. Состав падает в темноту и растворяется без звука.',
      note: 'Не каждое торможение — спасение.',
      actions: [{ text: 'Вернуться к началу', action: 'restart' }],
    },
    caught: {
      title: 'Объятие проводов',
      content: 'Тень из кабелей находит тебя и стягивает до тишины. Поезд продолжает путь без машиниста и без тебя.',
      note: 'Страху нельзя служить молчанием.',
      actions: [{ text: 'Проснуться снова', action: 'restart' }],
    },
  },
};
