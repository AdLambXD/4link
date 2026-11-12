import type { Messages } from '../messages';

/** Русский */
export const ru = {
  'app.title': '4Link · Четыре в ряд',
  'app.description':
    '4Link: соберите четыре в ряд на поле 6×6 с гравитацией. Бросайте, складывайте, соединяйте.',
  'app.kicker': 'Четыре в ряд · поле с гравитацией · соедините четыре',

  'common.settings': 'Настройки',
  'common.closeSettings': 'Закрыть настройки',
  'common.reset': 'Сбросить',
  'common.remove': 'Удалить',
  'common.followTheme': 'Как в теме',
  'common.themeColor': 'Цвет темы',
  'common.processing': 'Обработка…',

  'menu.modeHeading': 'Режим игры',
  'menu.mode.pve': 'Против ИИ',
  'menu.mode.pvp': 'Локально',
  'menu.mode.puzzle': 'Задачи',
  'menu.mode.tutorial': 'Обучение',
  'menu.tutorialHeading': 'Выберите урок',
  'menu.puzzleHeading': 'Выберите задачу',
  'menu.learned': 'Изучено {done} / {total}',
  'menu.solved': 'Решено {done} / {total}',
  'menu.learnedYes': 'Изучено',
  'menu.learnedNo': 'Не изучено',
  'menu.solvedYes': 'Решено',
  'menu.solvedNo': 'Не решено',
  'menu.guidedSteps': {
    one: '{count} шаг с подсказками',
    few: '{count} шага с подсказками',
    many: '{count} шагов с подсказками',
    other: '{count} шагов с подсказками',
  },
  'menu.mateIn': 'Мат в {count}',
  'menu.bestMoves': {
    one: 'Рекорд: {count} ход',
    few: 'Рекорд: {count} хода',
    many: 'Рекорд: {count} ходов',
    other: 'Рекорд: {count} ходов',
  },
  'menu.playerHeading': 'Игроки',
  'menu.playerCount': '{count} игроков',
  'menu.boardHeading': 'Размер поля',
  'menu.connect': 'Соедините {count}',
  'menu.difficultyHeading': 'Сложность',
  'difficulty.easy': 'Лёгкая',
  'difficulty.normal': 'Обычная',
  'difficulty.hard': 'Сложная',
  'menu.firstHeading': 'Первый ход',
  'menu.firstMe': 'Я начинаю',
  'menu.firstAi': 'ИИ начинает',
  'menu.appearanceHeading': 'Внешний вид',
  'menu.skinTheme': 'Тема {name}',
  'menu.skinNote': '{name} · весь сайт',
  'menu.appearanceMeta': 'Тема, поле, цвета и изображения камней',
  'menu.customPieces': 'Свои камни',
  'menu.customBackground': 'Свой фон',
  'menu.customFace': 'Свой цвет поля',
  'menu.handdrawn': 'Рисованная сетка',
  'menu.startMatch': 'Начать партию',
  'menu.startPuzzle': 'Начать задачу',
  'menu.startTutorial': 'Начать обучение',
  'menu.tutorialProgress': 'Прогресс обучения',
  'menu.allDone': 'Всё пройдено',
  'menu.tutorialHint': 'Начните с бросания камня, затем проходите уроки по очереди',
  'menu.puzzleProgress': 'Прогресс задач',
  'menu.bestNone': 'Рекорд —',
  'menu.record': 'Личные встречи',
  'menu.clearStats': 'Очистить',
  'menu.howToPlay': 'Как играть',
  'menu.notes.tutorial1':
    'Обучение точно показывает, куда ставить камень. При ошибке камень не ставится, так что пробуйте смело.',
  'menu.notes.tutorial2':
    'Шесть уроков охватывают гравитацию, горизонтальные, вертикальные и диагональные линии, блокировку и приоритет победы.',
  'menu.notes.tutorial3':
    'Прогресс сохраняется на этом устройстве. Текущий урок можно перезапустить в любой момент.',
  'menu.notes.puzzle1':
    'Каждая задача — незавершённая позиция. Соберите нужное число в ряд в пределах лимита ходов.',
  'menu.notes.puzzle2':
    'Вы всегда ходите первым, ИИ защищается. Он будет оттягивать поражение как можно дольше.',
  'menu.notes.puzzle3':
    'Считаются только ваши ходы. Подсказки показывают форсированную победу, если она есть.',
  'menu.notes.puzzle4':
    'Решённые задачи и лучшие результаты сохраняются на этом устройстве.',
  'menu.notes.play1':
    'На квадратном поле игроки по очереди выбирают столбец. Камень падает до самого нижнего свободного места.',
  'menu.notes.play2':
    'От 2 до 6 игроков делят одно устройство. При 3 и более игроках ИИ и подсказки недоступны.',
  'menu.notes.play3':
    'Соберите 4 в ряд на 6×6 и 8×8; соберите 5 на 12×12 и 16×16.',
  'menu.notes.play4':
    'Сначала занимайте центральные столбцы. Диагонали и двойные угрозы пропустить проще всего.',
  'menu.notes.appearance':
    'Тему, цвета камней и изображения можно изменить в настройках. Выбор сохраняется на этом устройстве.',
  'menu.colophon': 'Клавиши 1–0 бросают · ESC отменяет · R перезапускает',

  'settings.title': 'Настройки',
  'settings.subtitle':
    'Тема, поле и внешний вид камней. Изменения применяются сразу.',
  'settings.languageHeading': 'Язык',
  'settings.languageNote': 'ИНТЕРФЕЙС / ЯЗЫК',
  'settings.languageHint':
    'По умолчанию следует браузеру. Ручной выбор сохраняется на этом устройстве.',
  'settings.themeHeading': 'Тема сайта',
  'settings.themeNote': 'ЦВЕТ / БУМАГА / ПОЛЕ',
  'settings.scheme.dark': 'Тёмная',
  'settings.scheme.light': 'Светлая',
  'settings.piecesHeading': 'Камни',
  'settings.piecesNote': 'ЦВЕТ / ИЗОБРАЖЕНИЕ',
  'settings.piecesHint':
    'Неизменённые цвета следуют теме. Изображения обрезаются в круг и сохраняются на этом устройстве.',
  'settings.role.first': 'Первый игрок',
  'settings.role.second': 'Второй игрок',
  'settings.role.player': 'Игрок {player}',
  'settings.color': 'Цвет',
  'settings.pieceColorAria': 'Цвет камня игрока {player}',
  'settings.image.upload': 'Загрузить изображение',
  'settings.image.change': 'Изменить изображение',
  'settings.imageSupport': 'PNG / JPG / WebP, до 8 МБ.',
  'settings.resetPieces': 'Вернуть всё к теме',
  'settings.boardHeading': 'Поле',
  'settings.boardNote': 'СЕТКА / ФОН',
  'settings.boardHint':
    'Стиль сетки меняет только внешний вид, но не пересечения и не ходы.',
  'settings.boardStyleAria': 'Стиль сетки поля',
  'settings.boardStyle.clean': 'Ровная',
  'settings.boardStyle.handdrawn': 'Рисованная',
  'settings.boardStyle.dotted': 'Точки',
  'settings.boardStyle.blueprint': 'Чертёж',
  'settings.boardStyle.neon': 'Неон',
  'settings.boardStyle.minimal': 'Минимал',
  'settings.boardBackground': 'Фон поля',
  'settings.boardImage': 'Своё изображение',
  'settings.boardFace': 'Свой цвет',
  'settings.boardFollow': 'Использовать цвет темы',
  'settings.boardColor': 'Цвет',
  'settings.boardColorAria': 'Цвет фона поля',
  'settings.uploadBackground': 'Загрузить фон',
  'settings.changeBackground': 'Изменить фон',
  'settings.veil': 'Затемнение фона',
  'settings.boardSupport':
    'PNG / JPG / WebP, до 12 МБ. Сохраняется на этом устройстве.',
  'settings.resetBoard': 'Сбросить поле',
  'settings.saved': 'Внешний вид сохранён на этом устройстве',
  'settings.done': 'Готово',
  'settings.errorFallback':
    'Не удалось обработать изображение. Попробуйте ещё раз.',

  'game.backAria': 'Назад в меню',
  'game.settingsAria': 'Открыть настройки',
  'game.mode.tutorial': 'Обучение · NO.{no} · {cols}×{rows}',
  'game.mode.puzzle': 'Задача · NO.{no} · {cols}×{rows}',
  'game.mode.pve': 'Против ИИ · {difficulty} · {cols}×{rows}',
  'game.mode.pvp': 'Локально · {players} · {cols}×{rows}',
  'game.turn.movesUsed': 'Ходы закончились',
  'game.turn.tutorialDone': 'Обучение завершено',
  'game.turn.opponentResponding': 'Соперник отвечает…',
  'game.turn.yours': 'Ваш ход',
  'game.turn.draw': 'Ничья',
  'game.turn.solved': 'Решено',
  'game.turn.defended': 'Защищено',
  'game.turn.over': 'Игра окончена',
  'game.turn.aiDefending': 'ИИ защищается…',
  'game.turn.aiTurn': 'Ход ИИ',
  'game.turn.aiThinking': 'ИИ думает…',
  'game.turn.first': 'Ход первого игрока',
  'game.turn.second': 'Ход второго игрока',
  'game.turn.player': 'Ход игрока {player}',
  'game.aria.tutorialProgress': 'Прогресс обучения',
  'game.aria.moveLimit': 'Лимит ходов',
  'game.aria.series': 'Победы в серии',
  'game.lesson': 'Урок {no} / {total}',
  'game.complete': 'Готово',
  'game.step': 'Шаг {current} / {total}',
  'game.limitMoves': {
    one: 'Лимит {count} ход',
    few: 'Лимит {count} хода',
    many: 'Лимит {count} ходов',
    other: 'Лимит {count} ходов',
  },
  'game.usedMoves': 'Использовано {used} / {limit}',
  'game.draws': 'Ничьи {count}',
  'game.tutorialWrongColumn': 'Попробуйте столбец {col}.',
  'game.puzzleNoWin':
    'Форсированной победы в пределах лимита нет. Перезапустите или нажмите R.',

  'board.defaultTitle': 'Четыре в ряд',
  'board.defaultMeta': '{cols} × {rows} · соедините {win}',
  'board.tutorialTitle': 'Обучение · {title}',
  'board.puzzleTitle': 'Задача · {title}',
  'board.tutorialMeta': '{size} × {size} · обучение',
  'board.puzzleMeta': '{size} × {size} · {limit}',
  'board.tutorialFooter': 'ОБУЧЕНИЕ · следуйте подсказкам',
  'board.puzzleFooter': 'ЗАДАЧА · вы ходите первым · победите в лимите',
  'board.pointEmpty': 'Столбец {col}, ряд {row}, пусто',
  'board.pointFirst': 'Столбец {col}, ряд {row}, камень первого игрока',
  'board.pointSecond': 'Столбец {col}, ряд {row}, камень второго игрока',
  'board.pointPlayer': 'Столбец {col}, ряд {row}, камень игрока {player}',

  'result.draw': 'Ничья',
  'result.youWin': 'Вы победили',
  'result.aiWins': 'ИИ победил',
  'result.firstWins': 'Первый игрок победил',
  'result.secondWins': 'Второй игрок победил',
  'result.playerWins': 'Игрок {player} победил',
  'result.move': 'Ход {count}',
  'result.boardFull': 'Поле заполнено. Никто не собрал {win}.',
  'result.line': '{win} в ряд',
  'result.again': 'Играть ещё',
  'result.swap': 'Поменяться и сыграть',
  'result.menu': 'Назад в меню',
  'result.stampWin': 'П',
  'result.stampDraw': 'Н',

  'puzzle.head': 'ЗАДАЧА NO.{no}',
  'puzzle.solved': 'Задача решена',
  'puzzle.exhausted': 'Ходы закончились',
  'puzzle.draw': 'Ничья',
  'puzzle.defended': 'Защищено',
  'puzzle.solvedIn': {
    one: 'Решено за {count} ход',
    few: 'Решено за {count} хода',
    many: 'Решено за {count} ходов',
    other: 'Решено за {count} ходов',
  },
  'puzzle.exhaustedDetail': 'Нет линии из {win} в пределах лимита ходов',
  'puzzle.drawDetail': 'Поле заполнено, а линия из {win} не собрана',
  'puzzle.defendedDetail': 'ИИ первым собрал {win}',
  'puzzle.hints': {
    one: 'Использована {count} подсказка',
    few: 'Использовано {count} подсказки',
    many: 'Использовано {count} подсказок',
    other: 'Использовано {count} подсказок',
  },
  'puzzle.next': 'Следующая задача',
  'puzzle.retrySolved': 'Решить снова',
  'puzzle.retry': 'Повторить',
  'puzzle.menu': 'Назад в меню',
  'puzzle.stampSolved': 'Р',
  'puzzle.stampFailed': 'X',

  'tutorial.head': 'ОБУЧЕНИЕ NO.{no}',
  'tutorial.nextUnlocked': 'Следующий урок открыт',
  'tutorial.allComplete': 'Всё пройдено',
  'tutorial.complete': 'Обучение завершено',
  'tutorial.nextLesson': 'Следующий урок: {title}',
  'tutorial.mastered':
    'Вы изучили бросание, соединение, блокировку и приоритет победы.',
  'tutorial.next': 'Следующий урок',
  'tutorial.practice': 'Повторить практику',
  'tutorial.menu': 'Назад в меню',
  'tutorial.stamp': '✓',
  'coach.responding': 'Соперник отвечает…',
  'coach.complete': 'Готово',
  'coach.steps': 'Шаг {current} / {total}',

  'controls.undo': 'Отменить',
  'controls.restart': 'Перезапустить',
  'controls.thinking': 'Думает',
  'controls.hint': 'Подсказка',
  'controls.soundOn': 'Выключить звук',
  'controls.soundOff': 'Включить звук',

  'language.groupAria': 'Язык интерфейса',
  'language.zhCN': '简体中文',
  'language.zhTW': '繁體中文',
  'language.en': 'English',
  'language.short.zhCN': '简',
  'language.short.zhTW': '繁',
  'language.short.en': 'EN',

  'errors.image.notImage': 'Выберите файл изображения (PNG / JPG / WebP)',
  'errors.image.tooLarge': 'Изображение должно быть меньше {maxMb} МБ',
  'errors.image.unreadable': 'Не удалось прочитать это изображение',
  'errors.image.invalidSize': 'Недопустимый размер изображения',
  'errors.image.unsupported': 'Этот браузер не может обрабатывать изображения',
  'errors.image.tooComplex':
    'Изображение слишком сложное. Попробуйте более простое.',
  'errors.image.failed':
    'Не удалось обработать изображение. Попробуйте ещё раз.',

  /* ---------- Rotation ---------- */
  'menu.mode.rotation': 'Вращение',
  'menu.rotationHeading': 'Режим вращения',
  'menu.rotationRule':
    'После каждого хода поле поворачивается на 90° по часовой стрелке, и камни падают к новой нижней стороне. Линии, возникшие при повороте или падении, тоже приносят победу.',
  'menu.rotationVsAi': 'Против ИИ',
  'menu.rotationVsLocal': 'Вдвоём локально',
  'menu.startRotation': 'Начать партию с вращением',
  'menu.notes.rotation1':
    'После каждого хода поле поворачивается на 90° по часовой стрелке, а камни оседают к новой нижней стороне.',
  'menu.notes.rotation2':
    'Линия, возникшая при повороте или падении, тоже приносит победу — любому игроку.',
  'menu.notes.rotation3':
    'Если оба игрока одновременно собрали линию, побеждает тот, кто только что сходил.',
  'menu.notes.rotation4':
    'Если ход сразу приносит победу или заполняет поле, вращения нет — партия сразу заканчивается.',
  'game.mode.rotation': 'Вращение · {cols}×{rows}',
  'game.rotationNotice.rotated': 'Поле повернулось на 90° по часовой стрелке',
  'game.rotationTurns': {
    one: 'Повёрнуто {count} раз',
    few: 'Повёрнуто {count} раза',
    many: 'Повёрнуто {count} раз',
    other: 'Повёрнуто {count} раз',
  },
  'game.aria.rotationProgress': 'Число поворотов',
  'board.rotationTitle': 'Режим вращения',
  'board.rotationMeta': '{cols} × {rows} · 90° по часовой за ход',
  'board.rotationFooter': 'ВРАЩЕНИЕ · каждый ход поворачивает поле на 90° по часовой',
  'result.rotations': {
    one: 'Поле повернулось {count} раз',
    few: 'Поле повернулось {count} раза',
    many: 'Поле повернулось {count} раз',
    other: 'Поле повернулось {count} раз',
  },

  /* ---------- Online ---------- */
  'menu.mode.online': 'Онлайн',
  'menu.onlineHeading': 'Онлайн-комната',
  'menu.onlineBoardHeading': 'Размер поля (выбирает хозяин)',
  'menu.onlineStatus': 'Состояние сети',
  'menu.online.idle': 'Не в сети',
  'menu.online.connecting': 'Подключение',
  'menu.online.waiting': 'Ожидание соперника',
  'menu.online.syncing': 'Синхронизация поля',
  'menu.online.playing': 'В игре',
  'menu.online.left': 'Соперник вышел',
  'menu.online.error': 'Ошибка подключения',
  'menu.onlineRoom': 'Комната {code}',
  'menu.notes.online1':
    'Создатель комнаты становится хозяином и ходит первым; соперник входит с тем же кодом.',
  'menu.notes.online2':
    'По умолчанию ходы идут напрямую между устройствами; если симметричный NAT или корпоративная сеть это блокируют, переключите комнату на ретранслятор WebSocket.',
  'menu.notes.online3':
    'Онлайн — это 1 на 1; размер поля выбирает хозяин комнаты.',
  'menu.notes.online4':
    'Если кто-то отключился, комната остаётся открытой — войдите с тем же кодом, чтобы продолжить.',

  'online.host': 'Создать комнату',
  'online.hostNote': 'ХОЗЯИН · вы ходите первым',
  'online.join': 'Войти в комнату',
  'online.joinNote': 'ВХОД · вы ходите вторым',
  'online.codeLabel': 'Код комнаты',
  'online.codePlaceholder': 'Введите код из 5 символов',
  'online.joinAction': 'Войти',
  'online.shareLink': 'Ссылка для друга',
  'online.copyLink': 'Копировать ссылку',
  'online.copied': 'Скопировано',
  'online.copyManual': 'Скопировать вручную',
  'online.note.idle':
    'Выберите способ подключения, затем создайте комнату или войдите. Хозяин ходит первым, а ссылка содержит код и способ подключения.',
  'online.connecting': 'Открываем соединение…',
  'online.cancel': 'Отмена',
  'online.waitingHost': 'Комната создана, ждём соперника…',
  'online.waitingGuest': 'Подключаемся к хозяину, ждём поле…',
  'online.note.waitingHost':
    'Отправьте код или ссылку сопернику; игра начнётся, как только он войдёт.',
  'online.note.waitingGuest':
    'Убедитесь, что соперник создал именно эту комнату; после подключения вы попадёте в игру.',
  'online.leave': 'Покинуть комнату',
  'online.syncing': 'Подключено, синхронизируем поле…',
  'online.note.syncing':
    'Игра откроется, когда поле придёт от хозяина. Если ничего не происходит, попробуйте синхронизировать заново.',
  'online.resync': 'Синхронизировать',
  'online.left': 'Соперник вышел',
  'online.note.left':
    'Комната всё ещё открыта — соперник может вернуться с тем же кодом.',
  'online.playing': 'Игра идёт',
  'online.back': 'Назад',
  'online.errorFallback': 'Что-то пошло не так. Попробуйте ещё раз.',

  'online.methodHeading': 'Подключение',
  'online.method.direct': 'Напрямую',
  'online.method.directNote': 'P2P · быстрее всего',
  'online.method.relay': 'Ретранслятор',
  'online.method.relayNote': 'WebSocket · любая сеть',
  'online.method.directHint':
    'Ходы идут напрямую между устройствами с минимальной задержкой. Симметричный NAT, корпоративные сети и некоторые мобильные точки доступа это блокируют — при сбое переключитесь на ретранслятор.',
  'online.method.relayHint':
    'Ходы передаются через сервер-ретранслятор, поэтому работает почти любая сеть. Задержка чуть выше; ретранслятор встроенный или свой.',
  'online.relayUrl': 'Адрес ретранслятора',
  'online.relayUrlPlaceholder': 'wss://relay.example.com/ws',
  'online.relayUrlHint':
    'Используйте адрес ws:// или wss://. Оставьте пустым для встроенного ретранслятора.',
  'online.usingDirect': 'Подключение: напрямую (P2P)',
  'online.usingRelay': 'Подключение: ретранслятор {host}',

  'online.notice.syncing': 'Подключено, синхронизируем поле…',
  'online.notice.peerLeft': 'Соперник покинул комнату. Ждём возвращения…',
  'online.notice.peerLeftWaiting':
    'Соперник вышел, но комната остаётся открытой: войдите с тем же кодом, чтобы продолжить.',
  'online.notice.probe':
    'Пришло новое подключение; проверяем, в сети ли текущий соперник…',
  'online.notice.kickedFull':
    'Комната заполнена — лишнего игрока попросили выйти.',
  'online.notice.syncTimeout':
    'Поле от хозяина всё ещё не пришло. Попробуйте синхронизировать заново или выйдите и войдите с тем же кодом.',
  'online.notice.resyncing': 'Синхронизируем поле заново…',
  'online.notice.reconnecting':
    'Соединение потеряно — переподключаемся к ретранслятору…',

  'online.error.roomFull': 'Комната заполнена: эта игра 1 на 1 уже началась.',
  'online.error.invalidCode':
    'Код комнаты состоит из 5 букв или цифр, например 4K7QP.',
  'online.error.connect':
    'Не удалось войти в комнату. Проверьте сеть и попробуйте снова.',
  'online.error.signal':
    'Ошибка сигнализации ({detail}). Проверьте сеть и попробуйте снова.',
  'online.error.relay':
    'Ретранслятор недоступен ({detail}). Проверьте адрес или переключитесь на прямое подключение.',
  'online.error.relayUrl':
    'Адрес ретранслятора должен начинаться с ws:// или wss://.',

  'game.mode.online': 'Онлайн · {code} · {cols}×{rows}',
  'game.turn.opponentTurn': 'Ход соперника',
  'game.turn.opponentLeft': 'Соперник вышел',
  'game.turn.waitingOpponent': 'Ждём соперника…',
  'game.aria.onlineRoom': 'Онлайн-комната',
  'game.online.hostSeat': 'Хозяин · первый',
  'game.online.guestSeat': 'Гость · второй',
  'game.online.connecting': 'Подключаемся к сопернику…',
  'game.online.directPath': 'напрямую',
  'game.online.relayPath': 'ретранслятор',

  'board.onlineMeta': '{cols} × {rows} · Комната {code}',
  'board.onlineFooterHost': 'ОНЛАЙН · хозяин ходит первым · P2P',
  'board.onlineFooterGuest': 'ОНЛАЙН · вы ходите вторым · P2P',
  'board.onlineFooterHostRelay':
    'ОНЛАЙН · хозяин ходит первым · ретранслятор WebSocket',
  'board.onlineFooterGuestRelay':
    'ОНЛАЙН · вы ходите вторым · ретранслятор WebSocket',

  'result.opponentWins': 'Соперник победил',
  'result.rematchPending': 'Запрошен матч-реванш — ждём соперника.',
  'result.waitingOpponent': 'Ждём соперника',

  /* ---------- Endless ---------- */
  'menu.mode.endless': 'Бесконечный',
  'menu.endlessHeading': 'Бесконечный режим',
  'menu.endlessRule':
    'ИИ всегда ходит первым. Ваши четвёрки не приносят победу; блокируйте его и держитесь как можно дольше.',
  'menu.endlessBest': {
    one: 'Рекорд: {count} ход',
    few: 'Рекорд: {count} хода',
    many: 'Рекорд: {count} ходов',
    other: 'Рекорд: {count} ходов',
  },
  'menu.endlessBestNone': 'Рекорд —',
  'menu.endlessScrolls': {
    one: 'Сдвиг {count} раз',
    few: 'Сдвига {count} раза',
    many: 'Сдвигов {count} раз',
    other: 'Сдвигов {count} раз',
  },
  'menu.startEndless': 'Начать защиту',
  'menu.notes.endless1':
    'ИИ всегда ходит первым и постоянно атакует. Вы защищаетесь, и ваши собственные четвёрки никогда не побеждают.',
  'menu.notes.endless2':
    'Когда поле заполняется, оно сдвигается на строку вверх, а верхняя строка уходит; игра продолжается.',
  'menu.notes.endless3':
    'Забег заканчивается, когда ИИ собирает четыре. Ваш счёт — число сделанных ходов; рекорд сохраняется на этом устройстве.',
  'menu.notes.endless4':
    'Бесконечный режим зафиксирован на «Сложной» и предлагает только 6×6 и 8×8.',
  'menu.colophonEndless':
    'Клавиши 1–0 бросают · R перезапускает · в бесконечном режиме отмены нет',

  'game.mode.endless': 'Бесконечный · {cols}×{rows}',
  'game.turn.defend': 'Ваш ход · защищайтесь',
  'game.turn.aiAttacking': 'ИИ атакует…',
  'game.turn.endlessOver': 'Забег окончен',
  'game.endlessMoves': {
    one: 'Продержались {count} ход',
    few: 'Продержались {count} хода',
    many: 'Продержались {count} ходов',
    other: 'Продержались {count} ходов',
  },
  'game.aria.endlessProgress': 'Прогресс бесконечного режима',
  'game.endlessNotice.ignoredWin':
    'Здесь четвёрки не побеждают — продолжайте блокировать ИИ.',
  'game.endlessNotice.scrolled':
    'Поле сдвинулось на строку вверх. Продолжайте.',
  'game.endlessNotice.winAndScroll':
    'Здесь четвёрки не побеждают — поле сдвинулось на строку вверх. Продолжайте.',

  'board.endlessTitle': 'Бесконечная защита',
  'board.endlessMeta': '{cols} × {rows} · Блокируйте ИИ',
  'board.endlessFooter':
    'БЕСКОНЕЧНО · ваши четвёрки не побеждают · держитесь как можно дольше',

  'endless.head': 'БЕСКОНЕЧНО · {size}×{size}',
  'endless.aiWins': 'ИИ собрал четыре',
  'endless.survived': {
    one: 'Вы продержались {count} ход',
    few: 'Вы продержались {count} хода',
    many: 'Вы продержались {count} ходов',
    other: 'Вы продержались {count} ходов',
  },
  'endless.scrolls': {
    one: 'Поле сдвинулось {count} раз',
    few: 'Поле сдвинулось {count} раза',
    many: 'Поле сдвинулось {count} раз',
    other: 'Поле сдвинулось {count} раз',
  },
  'endless.best': {
    one: 'Рекорд для этого размера: {count} ход',
    few: 'Рекорд для этого размера: {count} хода',
    many: 'Рекорд для этого размера: {count} ходов',
    other: 'Рекорд для этого размера: {count} ходов',
  },
  'endless.newBest': 'Новый рекорд',
  'endless.again': 'Играть ещё',
  'endless.menu': 'Назад в меню',
  'endless.stamp': 'Н',
} satisfies Messages;
