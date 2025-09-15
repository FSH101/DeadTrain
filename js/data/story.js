export const story = {
  start: { wagonId: 'awakening', nodeId: 'wakeUp' },
  wagons: {
    awakening: {
      id: 'awakening',
      title: 'Вагон 1: Пробуждение',
      subtitle: 'Пульс света подчёркивает пустоту вокруг тебя.',
      nodes: {
        wakeUp: {
          type: 'text',
          content:
            'Ты просыпаешься в тёмном вагоне. Лампочка мигает. За окном — ночь и редкие огни.',
          next: 'firstFeeling',
        },
        firstFeeling: {
          type: 'choice',
          prompt: 'Что ты чувствуешь первым делом?',
          options: [
            { text: 'Тревогу', next: 'distantNoise' },
            { text: 'Любопытство', next: 'distantNoise' },
            { text: 'Ничего', next: 'distantNoise' },
          ],
        },
        distantNoise: {
          type: 'text',
          content: 'Вдалеке слышен металлический скрежет. Кто-то мог выйти из соседнего вагона.',
          next: 'goOrStay',
        },
        goOrStay: {
          type: 'choice',
          prompt: 'Пойдёшь туда или осмотришься здесь?',
          options: [
            { text: 'Пойти в сторону звука', next: 'corridor' },
            { text: 'Остаться и прислушаться', next: 'stayPut' },
          ],
        },
        corridor: {
          type: 'text',
          content: 'Ты медленно идёшь по тёмному проходу. Вагон кажется бесконечным…',
          next: 'towardReflection',
        },
        stayPut: {
          type: 'text',
          content: 'Ты остаёшься на месте. Пытаешься понять, как ты здесь оказался.',
          next: 'towardReflection',
        },
        towardReflection: {
          type: 'transition',
          target: { wagonId: 'reflection', nodeId: 'entry' },
        },
      },
    },
    reflection: {
      id: 'reflection',
      title: 'Вагон 2: Личности в окне',
      subtitle: 'Стёкла работают как зеркала, отражая больше, чем просто тебя.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'Ты входишь в новый вагон. Здесь немного светлее. С одной стороны окна, но снаружи — лишь тьма и твоё отражение.',
          next: 'mirrorMoves',
        },
        mirrorMoves: {
          type: 'text',
          content: 'Ты замечаешь, что отражение… не повторяет твои движения.',
          next: 'whatNow',
        },
        whatNow: {
          type: 'choice',
          prompt: 'Что ты сделаешь?',
          options: [
            { text: 'Посмотреть внимательнее', next: 'approach' },
            { text: 'Отвернуться и идти дальше', next: 'turnAway' },
          ],
        },
        approach: {
          type: 'text',
          content:
            'Ты приближаешься к стеклу. Лицо в отражении говорит, но ты не слышишь слов. Оно что-то очень хочет донести.',
          next: 'interpret',
        },
        interpret: {
          type: 'choice',
          prompt: 'Попытаешься прочитать по губам или коснёшься стекла?',
          options: [
            { text: 'Прочитать слова', next: 'readLips' },
            { text: 'Коснуться стекла', next: 'touchGlass' },
          ],
        },
        turnAway: {
          type: 'text',
          content:
            'Ты отвернулся. Отражение за стеклом стало агрессивным, но ты не видишь этого. Вагон будто стал холоднее.',
          next: 'towardStranger',
        },
        readLips: {
          type: 'text',
          content: 'Ты различаешь фразу: «Ты знаешь, кто ты».',
          next: 'towardStranger',
        },
        touchGlass: {
          type: 'text',
          content: 'Когда ты прикасаешься к стеклу, оно становится жидким, и ты ощущаешь чьё-то присутствие внутри.',
          next: 'towardStranger',
        },
        towardStranger: {
          type: 'transition',
          target: { wagonId: 'stranger', nodeId: 'entry' },
        },
      },
    },
    stranger: {
      id: 'stranger',
      title: 'Вагон 3: Незнакомец',
      subtitle: 'Тусклый свет собирается в единственное пятно, где кто-то ждёт.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'Ты проходишь в следующий вагон. Здесь почти нет света, только тусклая лампа над одним из кресел.',
          next: 'watcher',
        },
        watcher: {
          type: 'text',
          content:
            'На кресле сидит человек в длинном пальто. Он смотрит в пол, и кажется, что его лицо смазано, будто замылено.',
          next: 'callOut',
        },
        callOut: {
          type: 'choice',
          prompt: 'Позовёшь его?',
          options: [
            { text: 'Позвать', next: 'answer' },
            { text: 'Пройти мимо', next: 'passBy' },
          ],
        },
        answer: {
          type: 'text',
          content: 'Он медленно поднимает голову. Его голос — скрип половиц: «Ты опять пришёл?»',
          next: 'question',
        },
        question: {
          type: 'choice',
          prompt: 'Что ты ответишь?',
          options: [
            { text: 'Я здесь впервые', next: 'denial' },
            { text: 'Кто ты?', next: 'identity' },
          ],
        },
        passBy: {
          type: 'text',
          content: 'Ты проходишь мимо, не привлекая его внимания. Он шепчет что-то себе под нос.',
          next: 'towardLoop',
        },
        denial: {
          type: 'text',
          content: '«Ты говоришь это каждый раз», — отвечает он. — «И каждый раз уходишь перед тем, как услышать правду».',
          next: 'towardLoop',
        },
        identity: {
          type: 'text',
          content: '«Я — тот, кем ты боишься стать, если не поймёшь, зачем ты здесь», — слышишь в ответ.',
          next: 'towardLoop',
        },
        towardLoop: {
          type: 'transition',
          target: { wagonId: 'loop', nodeId: 'entry' },
        },
      },
    },
    loop: {
      id: 'loop',
      title: 'Вагон 4: Сон внутри сна',
      subtitle: 'Каждый круг слегка смещён, но всё равно знаком.',
      nodes: {
        entry: {
          type: 'text',
          content: 'Ты снова закрываешь глаза… и просыпаешься в том же месте. Всё повторяется, но чуть иначе.',
          next: 'loopQuestion',
        },
        loopQuestion: {
          type: 'choice',
          prompt: 'Что ты чувствуешь в этой петле?',
          description: 'От выбора зависит, с какой мыслью ты выйдешь из вагона.',
          options: [
            { text: 'Отчаяние', description: 'Петля кажется тюрьмой.', next: 'endingDespair' },
            { text: 'Интерес', description: 'Каждый виток приносит новые детали.', next: 'endingCuriosity' },
            { text: 'Спокойствие', description: 'Ты принимаешь повторение как ритм.', next: 'endingCalm' },
          ],
        },
        endingDespair: {
          type: 'ending',
          content:
            'Петля затягивается, пока не остаётся лишь тяжесть. Ты понимаешь, что можешь проснуться, только если захочешь изменить ход событий.',
          note: 'Твоё отчаяние напоминает, что даже у тьмы есть выход.',
          actions: [
            { text: 'Попробовать снова', target: 'start' },
            { text: 'Остаться в темноте', target: null },
          ],
        },
        endingCuriosity: {
          type: 'ending',
          content:
            'Ты рассматриваешь петлю как загадку. Каждый повтор дарит подсказку, и поезд вдруг кажется лабораторией твоего сознания.',
          actions: [
            { text: 'Идти глубже в истории', target: { wagonId: 'reflection', nodeId: 'whatNow' } },
            { text: 'Вернуться к началу пути', target: 'start' },
          ],
        },
        endingCalm: {
          type: 'ending',
          content:
            'Ты позволяешь петле быть. Слышишь, как поезд выравнивается и растворяется. Тишина становится ответом.',
          actions: [
            { text: 'Проснуться с новым дыханием', target: 'start' },
            { text: 'Уснуть окончательно', target: null },
          ],
        },
      },
    },
  },
};
