export const story = {
  start: { wagonId: 'ghostAwakening', nodeId: 'wakeUp' },
  wagons: {
    ghostAwakening: {
      id: 'ghostAwakening',
      title: 'Вагон 1: Призрачная электричка',
      subtitle: 'Ты очнулся в ночной пригородной — но она, похоже, едет не по рельсам.',
      nodes: {
        wakeUp: {
          type: 'text',
          content:
            'Ты просыпаешься в тёмном вагоне электрички. Лампочки мигают в такт гулу трансформаторов. За окнами — не станции, а пустые поля тумана.',
          next: 'firstCheck',
        },
        firstCheck: {
          type: 'choice',
          prompt: 'Первое действие?',
          options: [
            { text: 'Осмотреться', next: 'flicker' },
            { text: 'Крикнуть «Эй!»', next: 'flicker' },
            { text: 'Проверить телефон', next: 'flicker' },
          ],
        },
        flicker: {
          type: 'text',
          content:
            'Экран телефона гаснет. По стеклу пробегают электрические «мурашки». Из глубины состава тянется низкий треск, словно кто-то шепчет через динамик.',
          next: 'goDirection',
        },
        goDirection: {
          type: 'choice',
          prompt: 'Куда двинешься?',
          options: [
            { text: 'Вперёд — к пассажирам', next: 'toPassengers' },
            { text: 'Назад — в служебный вагон', next: 'toService' },
            { text: 'Дёрнуть стоп-кран', next: 'pullBrake' },
          ],
        },
        pullBrake: {
          type: 'text',
          content:
            'Ты дёргаешь стоп-кран. Рывок. Свет вспыхивает и тухнет. В тумане между вагонами что-то просыпается.',
          next: 'toChase',
        },
        toPassengers: {
          type: 'transition',
          target: { wagonId: 'faceless', nodeId: 'entry' },
        },
        toService: {
          type: 'transition',
          target: { wagonId: 'service', nodeId: 'entry' },
        },
        toChase: {
          type: 'transition',
          target: { wagonId: 'chase', nodeId: 'entry' },
        },
      },
    },

    faceless: {
      id: 'faceless',
      title: 'Вагон 2: Пассажиры без лиц',
      subtitle: 'Их лица смазаны, как будто память стерла детали.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'На сиденьях — люди в старых пальто. Лица расплываются, как мокрые чернила. Динамик щёлкает и ловит шёпот: «Билеты… смысл… выход…»',
          next: 'chooseNPC',
        },
        chooseNPC: {
          type: 'choice',
          prompt: 'К кому подойдёшь?',
          options: [
            { text: 'Женщина с чемоданом', next: 'woman' },
            { text: 'Кондуктор без тени', next: 'conductor' },
            { text: 'Ребёнок с фонариком', next: 'child' },
          ],
        },
        woman: {
          type: 'text',
          content:
            'Женщина гладит потрёпанный чемодан. «Опоздали… все опаздываем… но кто-то прибывает», — шепчет она.',
          next: 'womanChoice',
        },
        womanChoice: {
          type: 'choice',
          prompt: 'Что спросишь?',
          options: [
            { text: 'Как найти выход?', next: 'womanHint' },
            { text: 'Отойти', next: 'backHall' },
          ],
        },
        womanHint: {
          type: 'text',
          content:
            '«Туда, где машинист разговаривает с тьмой. Если он признает тебя — двери вспомнят станцию».',
          next: 'toEngine',
        },
        conductor: {
          type: 'text',
          content:
            'Кондуктор протягивает компостер, но тень у его ног отсутствует. «Без билета всё равно проедете. Вопрос — до куда», — скрипит он.',
          next: 'conductorChoice',
        },
        conductorChoice: {
          type: 'choice',
          prompt: 'Твои действия?',
          options: [
            { text: 'Попросить провести к выходу', next: 'conductorHint' },
            { text: 'Протянуть несуществующий билет', next: 'ticket' },
            { text: 'Уйти от него', next: 'backHall' },
          ],
        },
        conductorHint: {
          type: 'text',
          content:
            '«Ищи служебный вагон. Электрика любит порядок. Если угадаешь последовательность — двери подчинятся».',
          next: 'toService',
        },
        ticket: {
          type: 'text',
          content:
            'Ты тянешь воздух. Кондуктор усмехается: «Пустой билет для пустых людей». Лампы мигают, за спиной шуршит туман.',
          next: 'toChase',
        },
        child: {
          type: 'text',
          content:
            'Мальчик протягивает маленький фонарик. «Он светит не вперёд, а внутрь. Берёшь?»',
          next: 'childChoice',
        },
        childChoice: {
          type: 'choice',
          prompt: 'Что сделать?',
          options: [
            { text: 'Взять фонарик', next: 'flashlight' },
            { text: 'Отказаться', next: 'backHall' },
          ],
        },
        flashlight: {
          type: 'text',
          content:
            'Фонарик тёплый, но луч направлен в стекло — и в отражении ты выглядишь смелее. «Служебный щиток любит такой свет», — шепчет ребёнок.',
          next: 'toService',
        },
        backHall: {
          type: 'text',
          content: 'Ты отступаешь в проход. Вагон дышит холодом.',
          next: 'rechoose',
        },
        rechoose: {
          type: 'choice',
          prompt: 'Куда дальше?',
          options: [
            { text: 'Поговорить с кем-то ещё', next: 'chooseNPC' },
            { text: 'Идти к кабине машиниста', next: 'toEngine' },
            { text: 'Вернуться в служебный вагон', next: 'toService' },
          ],
        },
        toEngine: {
          type: 'transition',
          target: { wagonId: 'engine', nodeId: 'entry' },
        },
        toService: {
          type: 'transition',
          target: { wagonId: 'service', nodeId: 'entry' },
        },
        toChase: {
          type: 'transition',
          target: { wagonId: 'chase', nodeId: 'entry' },
        },
      },
    },

    service: {
      id: 'service',
      title: 'Вагон 3: Служебный отсек',
      subtitle: 'Щитки, кабели, запах озона. Здесь электричка решает, кто свой.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'Ты входишь в служебный вагон. Металлический щиток с тумблерами, табличка «АВАРИЙНОЕ ПИТАНИЕ», рядом шкаф с кабелями.',
          next: 'panel',
        },
        panel: {
          type: 'text',
          content:
            'Подписи на тумблерах: «Жёлтый — буфер», «Зелёный — шина», «Красный — блокировка». Динамик щёлкает — кто-то слушает.',
          next: 'panelChoice',
        },
        panelChoice: {
          type: 'choice',
          prompt: 'Твои действия у щитка:',
          options: [
            { text: 'Ввести последовательность питания', next: 'sequence' },
            { text: 'Открыть шкаф с проводами', next: 'wires' },
            { text: 'Уйти обратно к людям', next: 'toPassengers' },
          ],
        },
        sequence: {
          type: 'choice',
          prompt: 'Какая последовательность?',
          description: 'Подсказка мелькала в надписях: буфер → шина → блокировка.',
          options: [
            { text: 'Зелёный — Жёлтый — Красный', next: 'wrongSeq' },
            { text: 'Жёлтый — Зелёный — Красный', next: 'override' },
            { text: 'Красный — Жёлтый — Зелёный', next: 'wrongSeq2' },
          ],
        },
        override: {
          type: 'text',
          content:
            'Щиток поёт. Замки щёлкают где-то впереди. Голос из динамика: «Признан». Поезд на секунду совпадает с реальностью.',
          next: 'toQuickExit',
        },
        wrongSeq: {
          type: 'text',
          content:
            'Треск. Лампы уходят в инфракрасную темноту. Из-под пола течёт холодный туман.',
          next: 'toChase',
        },
        wrongSeq2: {
          type: 'text',
          content:
            'Красный вперёд — плохая примета. По вагону ползёт шёпот: «Непорядок».',
          next: 'toChase',
        },
        wires: {
          type: 'text',
          content:
            'Ты открываешь шкаф. Там — обрезанные жилы и следы когтей. Что-то шевелится за перегородкой.',
          next: 'toChase',
        },
        toPassengers: {
          type: 'transition',
          target: { wagonId: 'faceless', nodeId: 'entry' },
        },
        toChase: {
          type: 'transition',
          target: { wagonId: 'chase', nodeId: 'entry' },
        },
        toQuickExit: {
          type: 'transition',
          target: { wagonId: 'escape', nodeId: 'quick' },
        },
      },
    },

    chase: {
      id: 'chase',
      title: 'Вагон 4: Преследование',
      subtitle: 'Туман собирается в зверя, у которого очень много рук.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'Из тумана между вагонами вырастает фигура — как будто из проводов и гари. Она движется рывками и знает твой запах.',
          next: 'runChoice',
        },
        runChoice: {
          type: 'choice',
          prompt: 'Что делаешь?',
          options: [
            { text: 'Бежать вперёд по составу', next: 'sprint' },
            { text: 'Спрятаться под сиденьями', next: 'hide' },
            { text: 'Дёрнуть стоп-кран и затаиться', next: 'brake' },
          ],
        },
        sprint: {
          type: 'text',
          content:
            'Ты несёшься по скрипящим сочленениям. Тварь цепляется за поручни, но отстаёт.',
          next: 'toEngine',
        },
        hide: {
          type: 'text',
          content:
            'Ты замираешь под сиденьем. Существо шарит когтями по обивке, но проходит мимо. Воздух пахнет ржавчиной и ладаном.',
          next: 'backToPassengers',
        },
        brake: {
          type: 'ending',
          content:
            'Ты дёргаешь стоп-кран. Поезд встаёт рывком — и падает в пустоту. Ты слышишь, как рвётся металл, а потом только гул в голове.',
          note: 'Иногда остановка — не выход.',
          actions: [
            { text: 'Попробовать снова', target: 'start' },
            { text: 'Сдаться тьме', target: null },
          ],
        },
        toEngine: {
          type: 'transition',
          target: { wagonId: 'engine', nodeId: 'entry' },
        },
        backToPassengers: {
          type: 'transition',
          target: { wagonId: 'faceless', nodeId: 'entry' },
        },
      },
    },

    engine: {
      id: 'engine',
      title: 'Вагон 5: Кабина машиниста',
      subtitle: 'Тут ведут переговоры ночь и рельсы.',
      nodes: {
        entry: {
          type: 'text',
          content:
            'Дверь в кабину приоткрыта. Внутри — силуэт машиниста. Лицо скрыто полумраком, а из-под кепки светится тонкая полоса неоновых глаз.',
          next: 'specter',
        },
        specter: {
          type: 'text',
          content:
            '«Опять ты», — скрипит он, не оборачиваясь. Стрелки приборов вращаются сами по себе. Снаружи по боковому стеклу течёт туман.',
          next: 'talkChoice',
        },
        talkChoice: {
          type: 'choice',
          prompt: 'Что скажешь?',
          options: [
            { text: 'Кто ты?', next: 'identity' },
            { text: 'Отпусти меня', next: 'release' },
            { text: 'Молчать и смотреть', next: 'silent' },
          ],
        },
        identity: {
          type: 'text',
          content:
            '«Я — маршрут, который ты отвернул. Если выдержишь вопрос — выберешься».',
          next: 'riddle',
        },
        release: {
          type: 'text',
          content:
            '«Двери слушаются не просьб, а смысла. Покажи, что видишь рассвет».',
          next: 'riddle',
        },
        silent: {
          type: 'text',
          content:
            'Он усмехается. «Тишина — тоже ответ. Но сейчас — вопрос».',
          next: 'riddle',
        },
        riddle: {
          type: 'choice',
          prompt:
            '«Поезд идёт без колёс, машиниста ведёт без руля. Чем к утру становится ночь?»',
          options: [
            { text: 'Пеплом', next: 'expel' },
            { text: 'Памятью', next: 'expel' },
            { text: 'Рассветом', next: 'permit' },
          ],
        },
        permit: {
          type: 'text',
          content:
            'Машинист кивает. «Видишь». За дверью щёлкают замки, состав выравнивается, и на мгновение ты слышишь реальный глухой стук стыков.',
          next: 'toLongExit',
        },
        expel: {
          type: 'text',
          content:
            'Стрелки приборов прыгают. «Не сегодня». Сквозняк вышвыривает тебя обратно в гул вагонов.',
          next: 'toChase',
        },
        toLongExit: {
          type: 'transition',
          target: { wagonId: 'escape', nodeId: 'long' },
        },
        toChase: {
          type: 'transition',
          target: { wagonId: 'chase', nodeId: 'entry' },
        },
      },
    },

    escape: {
      id: 'escape',
      title: 'Вагон 6: Выход',
      subtitle: 'Двери помнят станции, если ты помнишь себя.',
      nodes: {
        quick: {
          type: 'ending',
          content:
            'Двери в ближайшем тамбуре раздвигаются, и вместо пустоты — платформа-призрак. Табло мигает твоим именем. Ты ступаешь на бетон, и холод рассеивается.',
          actions: [
            { text: 'Вернуться к началу', target: 'start' },
            { text: 'Исчезнуть в тумане', target: null },
          ],
        },
        long: {
          type: 'ending',
          content:
            'Кабина распахивается. Впереди — станция, где ты однажды не сошёл. Теперь сходишь. Утро входит в лёгкие, и электричка отходит пустой.',
          actions: [
            { text: 'Прожить это ещё раз', target: 'start' },
            { text: 'Остаться на рассвете', target: null },
          ],
        },
      },
    },
  },
};
