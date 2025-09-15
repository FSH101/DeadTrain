export const story = {
  start: { wagonId: 'ghostTrain', nodeId: 'wakeUp' },
  wagons: {
    ghostTrain: {
      id: 'ghostTrain',
      title: 'Вагон 1: Проснуться и не узнать путь',
      subtitle: 'Ночная электричка едет туда, где станций нет.',
      nodes: {
        wakeUp: {
          type: 'text',
          content:
            'Ты очнулся на жёстком сиденье. Вагон пуст. Лампы моргают. За окном — чёрная равнина без огней. Ты помнишь: ехал домой. Теперь — нет дома, нет времени.',
          next: 'firstMove',
        },
        firstMove: {
          type: 'choice',
          prompt: 'Что сделаешь первым делом?',
          options: [
            { text: 'Встать и оглядеться', next: 'hum' },
            { text: 'Крикнуть: «Есть кто живой?»', next: 'speakerReply' },
            { text: 'Проверить телефон', next: 'deadPhone' },
          ],
        },
        hum: {
          type: 'text',
          content:
            'Под потолком гудит трансформатор. Воздух пахнет озоном и мокрой шерстью. С переда вагона слышен тихий шорох, как бумага по стеклу.',
          next: 'fork',
        },
        speakerReply: {
          type: 'text',
          content:
            'Динамик трескается и отвечает чужим голосом: «Тихо едь — целым будешь». Голос смеётся сухо и отключается.',
          next: 'fork',
        },
        deadPhone: {
          type: 'text',
          content:
            'Экран чёрный. На миг вспыхивает индикатор — «0%» — и тухнет. В стекле отражается твоя бледная морда и пустой вагон позади.',
          next: 'fork',
        },
        fork: {
          type: 'choice',
          prompt: 'Куда пойдёшь?',
          options: [
            { text: 'Вперёд, к кабине машиниста', next: 'toEngine' },
            { text: 'Назад, в служебный отсек', next: 'toService' },
            { text: 'Между вагонами — посмотреть, что там', next: 'toGap' },
          ],
        },
        toEngine: { type: 'transition', target: { wagonId: 'engine', nodeId: 'entry' } },
        toService: { type: 'transition', target: { wagonId: 'service', nodeId: 'entry' } },
        toGap: { type: 'transition', target: { wagonId: 'chase', nodeId: 'entry' } },
      },
    },

    faceless: {
      id: 'faceless',
      title: 'Вагон 2: Пассажиры, которых не должно быть',
      subtitle: 'Они сидят тихо. У некоторых нет лиц. У других — слова вместо лиц.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'Вагон не пуст. Люди в старых пальто. Лица смазаны, как мел по дождю. Никто не шевелится. Только глаза следят.',
          next: 'choose',
        },
        choose: {
          type: 'choice',
          prompt: 'К кому подойти?',
          options: [
            { text: 'Женщина с детской коляской', next: 'woman' },
            { text: 'Контролёр в форменной фуражке', next: 'inspector' },
            { text: 'Парень у двери, дрожащие руки', next: 'boy' },
          ],
        },
        woman: {
          type: 'text',
          content:
            'Женщина держит пустую коляску. Голос ровный: «Укачала и потеряла. Если увидишь пустые двери — не смотри вниз».',
          next: 'womanChoice',
        },
        womanChoice: {
          type: 'choice',
          prompt: 'Спросить или уйти?',
          options: [
            { text: 'Где выход?', next: 'womanHint' },
            { text: 'Отойти', next: 'reselect' },
          ],
        },
        womanHint: {
          type: 'text',
          content:
            '«Кабина. Но ключ — у железа. Железо любит порядок: буфер — шина — блокировка. Запомнил?»',
          next: 'toService',
        },
        inspector: {
          type: 'text',
          content:
            'Контролёр не поднимает глаз: «Билеты не нужны. Нужны ответы. Один правильный — и живой. Остальные — корм».',
          next: 'inspectorChoice',
        },
        inspectorChoice: {
          type: 'choice',
          prompt: 'Что скажешь?',
          options: [
            { text: 'Проведи к кабине', next: 'inspectorGuide' },
            { text: 'Мне нужен ключ', next: 'inspectorKey' },
            { text: 'Отойти', next: 'reselect' },
          ],
        },
        inspectorGuide: {
          type: 'text',
          content:
            '«Иди сам. Я уже ходил». Он поднимает глаза. В зрачках — чёрные станции без названий.',
          next: 'reselect',
        },
        inspectorKey: {
          type: 'text',
          content:
            '«Ключ — не вещь. Ключ — последовательность». Он кивает в сторону служебного отсека.',
          next: 'toService',
        },
        boy: {
          type: 'text',
          content:
            'Парень шепчет, не глядя на тебя: «Тут бегают. Если услышишь много шагов — не стой. Держись света». Он протягивает маленький фонарик.',
          next: 'boyChoice',
        },
        boyChoice: {
          type: 'choice',
          prompt: 'Взять фонарик?',
          options: [
            { text: 'Взять', next: 'takeLight' },
            { text: 'Не брать', next: 'reselect' },
          ],
        },
        takeLight: {
          type: 'text',
          content:
            'Фонарик лёгкий. Свет короткий, но честный. «Служебный щиток отзывается на такой свет», — шепчет парень.',
          next: 'toService',
        },
        reselect: {
          type: 'choice',
          prompt: 'Дальше?',
          options: [
            { text: 'Поговорить с кем-то ещё', next: 'choose' },
            { text: 'Идти к кабине', next: 'toEngine' },
            { text: 'Назад, в служебный', next: 'toService' },
          ],
        },
        toService: { type: 'transition', target: { wagonId: 'service', nodeId: 'entry' } },
        toEngine: { type: 'transition', target: { wagonId: 'engine', nodeId: 'entry' } },
      },
    },

    service: {
      id: 'service',
      title: 'Вагон 3: Служебный отсек',
      subtitle: 'Щитки, провода, таблички. Здесь электричка слушает команды.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'Металлический шкаф, тумблеры с тугим ходом. Таблички: «ЖЁЛТЫЙ — БУФЕР», «ЗЕЛЁНЫЙ — ШИНА», «КРАСНЫЙ — БЛОКИРОВКА». За стенкой будто шоркают когти.',
          next: 'panelChoice',
        },
        panelChoice: {
          type: 'choice',
          prompt: 'Что сделать?',
          options: [
            { text: 'Ввести последовательность', next: 'sequence' },
            { text: 'Открыть шкаф с проводами', next: 'wires' },
            { text: 'Уйти к пассажирам', next: 'toFaceless' },
          ],
        },
        sequence: {
          type: 'choice',
          prompt: 'Какую?',
          description: 'Вспомни: буфер → шина → блокировка.',
          options: [
            { text: 'Жёлтый — Зелёный — Красный', next: 'goodSeq' },
            { text: 'Зелёный — Жёлтый — Красный', next: 'badSeq' },
            { text: 'Красный — Жёлтый — Зелёный', next: 'badSeq2' },
          ],
        },
        goodSeq: {
          type: 'text',
          content:
            'Щиток щёлкает. Где-то впереди отпираются двери. Динамик говорит твоим голосом: «Принят». На секунду поезд цепляется за реальность.',
          next: 'toQuickExit',
        },
        badSeq: {
          type: 'text',
          content:
            'Свет тухнет до темноты под кожей. Из-под пола ползёт холодный туман. Что-то просыпается.',
          next: 'toChase',
        },
        badSeq2: {
          type: 'text',
          content:
            'Красный первым — и поезд злится. Металл поёт, как нож по стеклу.',
          next: 'toChase',
        },
        wires: {
          type: 'text',
          content:
            'Внутри — обрезанные жилы. На изоляции следы зубов. Из щели тянется горячее дыхание.',
          next: 'toChase',
        },
        toFaceless: { type: 'transition', target: { wagonId: 'faceless', nodeId: 'entry' } },
        toChase: { type: 'transition', target: { wagonId: 'chase', nodeId: 'entry' } },
        toQuickExit: { type: 'transition', target: { wagonId: 'escape', nodeId: 'quick' } },
      },
    },

    chase: {
      id: 'chase',
      title: 'Вагон 4: Когда бегут не ноги, а страх',
      subtitle: 'Шагов много. Они не твои.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'Между вагонами вырастает фигура. Скелет из проводов, руки длинные, как поручни. Пахнет гарью и болотом. Она наклоняет голову. Слышит сердце.',
          next: 'runChoice',
        },
        runChoice: {
          type: 'choice',
          prompt: 'Действие?',
          options: [
            { text: 'Бежать вперёд', next: 'sprint' },
            { text: 'Под сиденья — спрятаться', next: 'hide' },
            { text: 'Дёрнуть стоп-кран', next: 'brake' },
          ],
        },
        sprint: {
          type: 'text',
          content:
            'Ты летишь по проходу. Существо цепляется, скрипит, отстаёт. Впереди — дверь в кабину.',
          next: 'toEngine',
        },
        hide: {
          type: 'text',
          content:
            'Ты замираешь под сиденьем. Руки с когтями шарят по ткани. Останавливаются в сантиметре. Уходят. Горло отпускает.',
          next: 'toFaceless',
        },
        brake: {
          type: 'ending',
          content:
            'Ты дёргаешь стоп-кран. Поезд глохнет и сваливается в пустоту. Долго падает. Звук обрывается, как нитка.',
          note: 'Остановить — не значит спастись.',
          actions: [
            { text: 'Начать заново', target: 'start' },
            { text: 'Больше не сопротивляться', target: null },
          ],
        },
        toEngine: { type: 'transition', target: { wagonId: 'engine', nodeId: 'entry' } },
        toFaceless: { type: 'transition', target: { wagonId: 'faceless', nodeId: 'entry' } },
      },
    },

    engine: {
      id: 'engine',
      title: 'Вагон 5: Кабина',
      subtitle: 'Где рельсы спорят с ночью.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'Дверь в кабину приоткрыта. Машинист сидит, руки на коленях. Лица не видно. Кепка закрывает глаза. Приборы гудят сами.',
          next: 'talk',
        },
        talk: {
          type: 'text',
          content:
            'Он говорит, не оборачиваясь: «Опять доехал. Опять забыл, где сходить». Голос уставший, как пустой перрон.',
          next: 'talkChoice',
        },
        talkChoice: {
          type: 'choice',
          prompt: 'Ответ:',
          options: [
            { text: 'Кто ты?', next: 'who' },
            { text: 'Мне нужен выход', next: 'out' },
            { text: 'Молчать', next: 'silent' },
          ],
        },
        who: {
          type: 'text',
          content:
            '«Я машинист тех дорог, откуда не возвращаются. Но у тебя — редкий билет. Вопрос выдержишь — выйдешь».',
          next: 'riddle',
        },
        out: {
          type: 'text',
          content:
            '«Двери открываются смыслом. Покажи, что понял».',
          next: 'riddle',
        },
        silent: {
          type: 'text',
          content:
            '«Ладно. Тогда коротко».',
          next: 'riddle',
        },
        riddle: {
          type: 'choice',
          prompt:
            '«Ночь катится без колёс, а утро приходит без шагов. Чем к утру становится ночь?»',
          options: [
            { text: 'Пеплом', next: 'wrong' },
            { text: 'Памятью', next: 'wrong' },
            { text: 'Рассветом', next: 'right' },
          ],
        },
        right: {
          type: 'text',
          content:
            'Он кивает. «Значит, видишь». Где-то щёлкают замки. Поезд на секунду звучит настоящими стыками.',
          next: 'toLongExit',
        },
        wrong: {
          type: 'text',
          content:
            'Машинист тяжело вздыхает: «Не сегодня». Сквозняк вышвыривает тебя обратно в тёмный состав.',
          next: 'toChase',
        },
        toLongExit: { type: 'transition', target: { wagonId: 'escape', nodeId: 'long' } },
        toChase: { type: 'transition', target: { wagonId: 'chase', nodeId: 'entry' } },
      },
    },

    escape: {
      id: 'escape',
      title: 'Вагон 6: Выход',
      subtitle: 'Если понял — двери вспомнят станцию.',
      nodes: {
        quick: {
          type: 'ending',
          content:
            'Тамбурные двери разъезжаются. Вместо пустоты — тусклая платформа. Табло мигает твоей фамилией. Ты выходишь. Воздух холодный и настоящий.',
          actions: [
            { text: 'Сыграть иначе', target: 'start' },
            { text: 'Остаться на платформе', target: null },
          ],
        },
        long: {
          type: 'ending',
          content:
            'Кабина открывается. Впереди — станция, где ты когда-то прошёл мимо. Теперь — выходишь. Поезд уходит пустой, а в небе сереет.',
          actions: [
            { text: 'Прожить ещё раз', target: 'start' },
            { text: 'Идти к свету', target: null },
          ],
        },
      },
    },

    hub: {
      id: 'hub',
      title: 'Развилка',
      subtitle: 'Если вернёшься, маршрут изменится.',
      nodes: {
        toFaceless: { type: 'transition', target: { wagonId: 'faceless', nodeId: 'entry' } },
        toService: { type: 'transition', target: { wagonId: 'service', nodeId: 'entry' } },
        toEngine: { type: 'transition', target: { wagonId: 'engine', nodeId: 'entry' } },
      },
    },
  },
};
