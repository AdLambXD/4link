import type { Messages } from '../messages';

/** Español */
export const es = {
  'app.title': '4Link · Cuatro en línea',
  'app.description':
    '4Link: conecta cuatro en un tablero de gravedad 6×6. Suelta, apila y enlaza.',
  'app.kicker': 'Cuatro en línea · tablero de gravedad · conecta cuatro',

  'common.settings': 'Ajustes',
  'common.closeSettings': 'Cerrar ajustes',
  'common.reset': 'Restablecer',
  'common.remove': 'Quitar',
  'common.followTheme': 'Usar tema',
  'common.themeColor': 'Color del tema',
  'common.processing': 'Procesando…',

  'menu.modeHeading': 'Modo de partida',
  'menu.mode.pve': 'Contra la IA',
  'menu.mode.pvp': 'Local',
  'menu.mode.puzzle': 'Puzles',
  'menu.mode.tutorial': 'Tutorial',
  'menu.tutorialHeading': 'Elige una lección',
  'menu.puzzleHeading': 'Elige un puzle',
  'menu.learned': 'Aprendidas {done} / {total}',
  'menu.solved': 'Resueltos {done} / {total}',
  'menu.learnedYes': 'Aprendida',
  'menu.learnedNo': 'No aprendida',
  'menu.solvedYes': 'Resuelto',
  'menu.solvedNo': 'Sin resolver',
  'menu.guidedSteps': {
    one: '{count} paso guiado',
    other: '{count} pasos guiados',
  },
  'menu.mateIn': 'Mate en {count}',
  'menu.bestMoves': {
    one: 'Mejor: {count} jugada',
    other: 'Mejor: {count} jugadas',
  },
  'menu.playerHeading': 'Jugadores',
  'menu.playerCount': '{count} jugadores',
  'menu.boardHeading': 'Tamaño del tablero',
  'menu.connect': 'Conecta {count}',
  'menu.difficultyHeading': 'Dificultad',
  'difficulty.easy': 'Fácil',
  'difficulty.normal': 'Normal',
  'difficulty.hard': 'Difícil',
  'menu.firstHeading': 'Primer turno',
  'menu.firstMe': 'Empiezo yo',
  'menu.firstAi': 'Empieza la IA',
  'menu.appearanceHeading': 'Apariencia',
  'menu.skinTheme': 'Tema {name}',
  'menu.skinNote': '{name} · todo el sitio',
  'menu.appearanceMeta': 'Tema, tablero, colores e imágenes de fichas',
  'menu.customPieces': 'Fichas personalizadas',
  'menu.customBackground': 'Fondo personalizado',
  'menu.customFace': 'Color de tablero personalizado',
  'menu.handdrawn': 'Cuadrícula dibujada a mano',
  'menu.startMatch': 'Empezar partida',
  'menu.startPuzzle': 'Empezar puzle',
  'menu.startTutorial': 'Empezar tutorial',
  'menu.tutorialProgress': 'Progreso del tutorial',
  'menu.allDone': 'Todo completado',
  'menu.tutorialHint': 'Empieza soltando fichas y aprende una lección a la vez',
  'menu.puzzleProgress': 'Progreso de puzles',
  'menu.bestNone': 'Mejor —',
  'menu.record': 'Cara a cara',
  'menu.clearStats': 'Borrar',
  'menu.howToPlay': 'Cómo jugar',
  'menu.notes.tutorial1':
    'El tutorial te indica exactamente dónde soltar. Los clics equivocados no colocan ficha, así que prueba sin miedo.',
  'menu.notes.tutorial2':
    'Seis lecciones cubren la gravedad, las líneas horizontales, verticales y diagonales, el bloqueo y la prioridad de victoria.',
  'menu.notes.tutorial3':
    'El progreso se guarda en este dispositivo. Puedes reiniciar la lección actual cuando quieras.',
  'menu.notes.puzzle1':
    'Cada puzle es una posición sin terminar. Conecta el número objetivo dentro del límite de jugadas para ganar.',
  'menu.notes.puzzle2':
    'Siempre mueves primero y la IA defiende. Retrasará la derrota todo lo que pueda.',
  'menu.notes.puzzle3':
    'Solo cuentan tus jugadas. Las pistas señalan una victoria forzada si existe.',
  'menu.notes.puzzle4':
    'El progreso resuelto y las mejores puntuaciones se guardan en este dispositivo.',
  'menu.notes.play1':
    'En un tablero cuadrado, elegid columna por turnos. La ficha cae hasta el hueco más bajo.',
  'menu.notes.play2':
    'De 2 a 6 jugadores comparten un dispositivo. Con 3 o más no hay IA ni pistas.',
  'menu.notes.play3':
    'Conecta 4 en 6×6 y 8×8; conecta 5 en 12×12 y 16×16.',
  'menu.notes.play4':
    'Empieza por las columnas centrales. Las diagonales y las amenazas dobles son las más fáciles de pasar por alto.',
  'menu.notes.appearance':
    'Ajusta el tema, los colores de las fichas y las imágenes en Ajustes. Las elecciones se guardan en este dispositivo.',
  'menu.colophon': 'Teclas 1–0 sueltan · ESC deshace · R reinicia',

  'settings.title': 'Ajustes',
  'settings.subtitle':
    'Tema, tablero y aspecto de las fichas. Los cambios se aplican al instante.',
  'settings.languageHeading': 'Idioma',
  'settings.languageNote': 'INTERFAZ / IDIOMA',
  'settings.languageHint':
    'Sigue tu navegador por defecto. La elección manual se guarda en este dispositivo.',
  'settings.themeHeading': 'Tema del sitio',
  'settings.themeNote': 'COLOR / PAPEL / TABLERO',
  'settings.scheme.dark': 'Oscuro',
  'settings.scheme.light': 'Claro',
  'settings.piecesHeading': 'Fichas',
  'settings.piecesNote': 'COLOR / IMAGEN',
  'settings.piecesHint':
    'Los colores que no personalices siguen el tema. Las imágenes se recortan en círculo y se guardan en este dispositivo.',
  'settings.role.first': 'Primer jugador',
  'settings.role.second': 'Segundo jugador',
  'settings.role.player': 'Jugador {player}',
  'settings.color': 'Color',
  'settings.pieceColorAria': 'Color de ficha del jugador {player}',
  'settings.image.upload': 'Subir imagen',
  'settings.image.change': 'Cambiar imagen',
  'settings.imageSupport': 'PNG / JPG / WebP, hasta 8 MB.',
  'settings.resetPieces': 'Restablecer todo al tema',
  'settings.boardHeading': 'Tablero',
  'settings.boardNote': 'CUADRÍCULA / FONDO',
  'settings.boardHint':
    'La cuadrícula dibujada a mano solo cambia el dibujo, no las intersecciones ni las jugadas.',
  'settings.boardStyleAria': 'Estilo de cuadrícula del tablero',
  'settings.boardStyle.clean': 'Limpio',
  'settings.boardStyle.handdrawn': 'Dibujado a mano',
  'settings.boardBackground': 'Fondo del tablero',
  'settings.boardImage': 'Imagen personalizada',
  'settings.boardFace': 'Color personalizado',
  'settings.boardFollow': 'Usar color del tema',
  'settings.boardColor': 'Color',
  'settings.boardColorAria': 'Color de fondo del tablero',
  'settings.uploadBackground': 'Subir fondo',
  'settings.changeBackground': 'Cambiar fondo',
  'settings.veil': 'Velo del fondo',
  'settings.boardSupport':
    'PNG / JPG / WebP, hasta 12 MB. Se guarda en este dispositivo.',
  'settings.resetBoard': 'Restablecer tablero',
  'settings.saved': 'La apariencia se guarda en este dispositivo',
  'settings.done': 'Listo',
  'settings.errorFallback': 'No se pudo procesar la imagen. Inténtalo de nuevo.',

  'game.backAria': 'Volver al menú',
  'game.settingsAria': 'Abrir ajustes',
  'game.mode.tutorial': 'Tutorial · NO.{no} · {cols}×{rows}',
  'game.mode.puzzle': 'Puzle · NO.{no} · {cols}×{rows}',
  'game.mode.pve': 'Contra la IA · {difficulty} · {cols}×{rows}',
  'game.mode.pvp': 'Local · {players} · {cols}×{rows}',
  'game.turn.movesUsed': 'Sin jugadas',
  'game.turn.tutorialDone': 'Tutorial completado',
  'game.turn.opponentResponding': 'El rival responde…',
  'game.turn.yours': 'Tu turno',
  'game.turn.draw': 'Empate',
  'game.turn.solved': 'Resuelto',
  'game.turn.defended': 'Defendido',
  'game.turn.over': 'Partida terminada',
  'game.turn.aiDefending': 'La IA defiende…',
  'game.turn.aiTurn': 'Turno de la IA',
  'game.turn.aiThinking': 'La IA piensa…',
  'game.turn.first': 'Turno del primer jugador',
  'game.turn.second': 'Turno del segundo jugador',
  'game.turn.player': 'Turno del jugador {player}',
  'game.aria.tutorialProgress': 'Progreso del tutorial',
  'game.aria.moveLimit': 'Límite de jugadas',
  'game.aria.series': 'Victorias de la serie',
  'game.lesson': 'Lección {no} / {total}',
  'game.complete': 'Completado',
  'game.step': 'Paso {current} / {total}',
  'game.limitMoves': {
    one: 'Límite {count} jugada',
    other: 'Límite {count} jugadas',
  },
  'game.usedMoves': 'Usadas {used} / {limit}',
  'game.draws': 'Empates {count}',
  'game.tutorialWrongColumn': 'Prueba la columna {col} esta vez.',
  'game.puzzleNoWin':
    'No hay victoria forzada dentro del límite. Reinicia o pulsa R.',

  'board.defaultTitle': 'Cuatro en línea',
  'board.defaultMeta': '{cols} × {rows} · conecta {win}',
  'board.tutorialTitle': 'Tutorial · {title}',
  'board.puzzleTitle': 'Puzle · {title}',
  'board.tutorialMeta': '{size} × {size} · tutorial',
  'board.puzzleMeta': '{size} × {size} · {limit}',
  'board.tutorialFooter': 'TUTORIAL · sigue las indicaciones',
  'board.puzzleFooter': 'PUZLE · mueves primero · gana dentro del límite',
  'board.pointEmpty': 'Columna {col}, fila {row}, vacía',
  'board.pointFirst': 'Columna {col}, fila {row}, ficha del primer jugador',
  'board.pointSecond': 'Columna {col}, fila {row}, ficha del segundo jugador',
  'board.pointPlayer': 'Columna {col}, fila {row}, ficha del jugador {player}',

  'result.draw': 'Empate',
  'result.youWin': 'Ganas',
  'result.aiWins': 'Gana la IA',
  'result.firstWins': 'Gana el primer jugador',
  'result.secondWins': 'Gana el segundo jugador',
  'result.playerWins': 'Gana el jugador {player}',
  'result.move': 'Jugada {count}',
  'result.boardFull': 'El tablero está lleno. Nadie conectó {win}.',
  'result.line': '{win} en línea',
  'result.again': 'Jugar otra vez',
  'result.swap': 'Cambiar y repetir',
  'result.menu': 'Volver al menú',
  'result.stampWin': 'G',
  'result.stampDraw': 'E',

  'puzzle.head': 'PUZLE NO.{no}',
  'puzzle.solved': 'Puzle resuelto',
  'puzzle.exhausted': 'Sin jugadas',
  'puzzle.draw': 'Empate',
  'puzzle.defended': 'Defendido',
  'puzzle.solvedIn': {
    one: 'Resuelto en {count} jugada',
    other: 'Resuelto en {count} jugadas',
  },
  'puzzle.exhaustedDetail': 'No hay línea de {win} dentro del límite',
  'puzzle.drawDetail': 'El tablero está lleno y no conectaste {win}',
  'puzzle.defendedDetail': 'La IA conectó {win} primero',
  'puzzle.hints': {
    one: 'Usada {count} pista',
    other: 'Usadas {count} pistas',
  },
  'puzzle.next': 'Siguiente puzle',
  'puzzle.retrySolved': 'Resolver de nuevo',
  'puzzle.retry': 'Reintentar',
  'puzzle.menu': 'Volver al menú',
  'puzzle.stampSolved': 'S',
  'puzzle.stampFailed': 'X',

  'tutorial.head': 'TUTORIAL NO.{no}',
  'tutorial.nextUnlocked': 'Siguiente lección desbloqueada',
  'tutorial.allComplete': 'Todo completado',
  'tutorial.complete': 'Tutorial completado',
  'tutorial.nextLesson': 'Siguiente lección: {title}',
  'tutorial.mastered':
    'Has aprendido a soltar, enlazar, bloquear y la prioridad de victoria.',
  'tutorial.next': 'Siguiente lección',
  'tutorial.practice': 'Practicar otra vez',
  'tutorial.menu': 'Volver al menú',
  'tutorial.stamp': '✓',
  'coach.responding': 'El rival responde…',
  'coach.complete': 'Completado',
  'coach.steps': 'Paso {current} / {total}',

  'controls.undo': 'Deshacer',
  'controls.restart': 'Reiniciar',
  'controls.thinking': 'Pensando',
  'controls.hint': 'Pista',
  'controls.soundOn': 'Silenciar',
  'controls.soundOff': 'Activar sonido',

  'language.groupAria': 'Idioma de la interfaz',
  'language.zhCN': '简体中文',
  'language.zhTW': '繁體中文',
  'language.en': 'English',
  'language.short.zhCN': '简',
  'language.short.zhTW': '繁',
  'language.short.en': 'EN',

  'errors.image.notImage': 'Elige un archivo de imagen (PNG / JPG / WebP)',
  'errors.image.tooLarge': 'La imagen debe ser menor de {maxMb} MB',
  'errors.image.unreadable': 'No se pudo leer esta imagen',
  'errors.image.invalidSize': 'El tamaño de la imagen no es válido',
  'errors.image.unsupported': 'Este navegador no puede procesar imágenes',
  'errors.image.tooComplex':
    'La imagen es demasiado compleja. Prueba con una más sencilla.',
  'errors.image.failed': 'No se pudo procesar la imagen. Inténtalo de nuevo.',

  /* ---------- Rotation ---------- */
  'menu.mode.rotation': 'Rotación',
  'menu.rotationHeading': 'Modo rotación',
  'menu.rotationRule':
    'Cada ficha girada hace que el tablero gire 90° en sentido horario y las fichas caigan hacia el nuevo fondo. Las líneas formadas por el giro o la caída también ganan.',
  'menu.rotationVsAi': 'Contra la IA',
  'menu.rotationVsLocal': '2 jugadores locales',
  'menu.startRotation': 'Empezar partida con rotación',
  'menu.notes.rotation1':
    'Tras cada jugada el tablero gira 90° en sentido horario y las fichas se asientan hacia el nuevo fondo.',
  'menu.notes.rotation2':
    'Una línea formada por el giro o la caída también gana, para cualquiera de los dos.',
  'menu.notes.rotation3':
    'Si ambos jugadores completan una línea a la vez, gana quien acaba de mover.',
  'menu.notes.rotation4':
    'Si una jugada gana al instante o llena el tablero, no hay giro: la partida termina en ese momento.',
  'game.mode.rotation': 'Rotación · {cols}×{rows}',
  'game.rotationNotice.rotated': 'El tablero giró 90° en sentido horario',
  'game.rotationTurns': {
    one: 'Girado {count} vez',
    other: 'Girado {count} veces',
  },
  'game.aria.rotationProgress': 'Número de giros',
  'board.rotationTitle': 'Modo rotación',
  'board.rotationMeta': '{cols} × {rows} · 90° horario por jugada',
  'board.rotationFooter': 'ROTAR · cada jugada gira el tablero 90° en sentido horario',
  'result.rotations': {
    one: 'El tablero giró {count} vez',
    other: 'El tablero giró {count} veces',
  },

  /* ---------- Online ---------- */
  'menu.mode.online': 'En línea',
  'menu.onlineHeading': 'Sala en línea',
  'menu.onlineBoardHeading': 'Tamaño del tablero (elige el anfitrión)',
  'menu.onlineStatus': 'Estado en línea',
  'menu.online.idle': 'Sin conexión',
  'menu.online.connecting': 'Conectando',
  'menu.online.waiting': 'Esperando al rival',
  'menu.online.syncing': 'Sincronizando tablero',
  'menu.online.playing': 'En partida',
  'menu.online.left': 'El rival se fue',
  'menu.online.error': 'Conexión fallida',
  'menu.onlineRoom': 'Sala {code}',
  'menu.notes.online1':
    'Quien crea la sala es anfitrión y mueve primero; el rival entra con el mismo código.',
  'menu.notes.online2':
    'Las jugadas van de dispositivo a dispositivo por defecto; si un NAT simétrico o una red corporativa lo bloquean, cambia la sala al repetidor WebSocket.',
  'menu.notes.online3':
    'En línea es 1v1; el tamaño de tablero que elige el anfitrión decide la partida.',
  'menu.notes.online4':
    'Si alguien se cae, la sala sigue abierta: vuelve a entrar con el mismo código para continuar.',

  'online.host': 'Crear sala',
  'online.hostNote': 'ANFITRIÓN · tú mueves primero',
  'online.join': 'Unirse a sala',
  'online.joinNote': 'UNIRSE · tú mueves segundo',
  'online.codeLabel': 'Código de sala',
  'online.codePlaceholder': 'Introduce un código de 5 letras',
  'online.joinAction': 'Unirse',
  'online.shareLink': 'Enlace para compartir',
  'online.copyLink': 'Copiar enlace',
  'online.copied': 'Copiado',
  'online.copyManual': 'Copiar manualmente',
  'online.note.idle':
    'Elige cómo conectar y crea o únete a una sala. El anfitrión mueve primero y el enlace incluye el código y el método.',
  'online.connecting': 'Abriendo la conexión…',
  'online.cancel': 'Cancelar',
  'online.waitingHost': 'Sala creada, esperando al rival…',
  'online.waitingGuest': 'Conectando con el anfitrión, esperando el tablero…',
  'online.note.waitingHost':
    'Envía el código o el enlace a tu rival; la partida empieza en cuanto entre.',
  'online.note.waitingGuest':
    'Comprueba que tu rival creó exactamente este código; entrarás en la partida al conectar.',
  'online.leave': 'Salir de la sala',
  'online.syncing': 'Conectado, sincronizando el tablero…',
  'online.note.syncing':
    'La partida se abre cuando llega el tablero del anfitrión. Si no pasa nada, prueba a resincronizar.',
  'online.resync': 'Resincronizar',
  'online.left': 'El rival se fue',
  'online.note.left':
    'La sala sigue abierta: tu rival puede volver con el mismo código para continuar.',
  'online.playing': 'Partida en curso',
  'online.back': 'Atrás',
  'online.errorFallback': 'Algo salió mal. Inténtalo de nuevo.',

  'online.methodHeading': 'Conexión',
  'online.method.direct': 'Directa',
  'online.method.directNote': 'P2P · la más rápida',
  'online.method.relay': 'Repetidor',
  'online.method.relayNote': 'WebSocket · cualquier red',
  'online.method.directHint':
    'Las jugadas van directamente entre los dos dispositivos con la menor latencia. El NAT simétrico, las redes corporativas y algunos puntos de acceso móvil lo bloquean; si falla, cambia a Repetidor.',
  'online.method.relayHint':
    'Las jugadas pasan por un servidor repetidor, así que casi cualquier red funciona. La latencia sube un poco; el repetidor es interno o uno propio.',
  'online.relayUrl': 'URL del repetidor',
  'online.relayUrlPlaceholder': 'wss://relay.example.com/ws',
  'online.relayUrlHint':
    'Usa una dirección ws:// o wss://. Déjalo vacío para usar el repetidor interno.',
  'online.usingDirect': 'Conexión: directa (P2P)',
  'online.usingRelay': 'Conexión: repetidor {host}',

  'online.notice.syncing': 'Conectado, sincronizando el tablero…',
  'online.notice.peerLeft': 'Tu rival salió de la sala. Esperando a que vuelva…',
  'online.notice.peerLeftWaiting':
    'Tu rival se fue, pero la sala sigue abierta: vuelve a entrar con el mismo código para continuar.',
  'online.notice.probe':
    'Llegó una conexión nueva; comprobando si el rival actual sigue en línea…',
  'online.notice.kickedFull':
    'La sala está llena: se pidió al jugador extra que saliera.',
  'online.notice.syncTimeout':
    'Aún no llega el tablero del anfitrión. Prueba a resincronizar o sal y vuelve con el mismo código.',
  'online.notice.resyncing': 'Resincronizando el tablero…',
  'online.notice.reconnecting': 'Conexión perdida: reconectando al repetidor…',

  'online.error.roomFull': 'Sala llena: esta partida 1v1 ya empezó.',
  'online.error.invalidCode': 'Los códigos tienen 5 letras o dígitos, p. ej. 4K7QP.',
  'online.error.connect':
    'No se pudo entrar en la sala. Comprueba tu red e inténtalo de nuevo.',
  'online.error.signal':
    'Falló la señalización ({detail}). Comprueba tu red e inténtalo de nuevo.',
  'online.error.relay':
    'No se pudo alcanzar el repetidor ({detail}). Comprueba la dirección o cambia a conexión directa.',
  'online.error.relayUrl': 'La dirección del repetidor debe empezar por ws:// o wss://.',

  'game.mode.online': 'En línea · {code} · {cols}×{rows}',
  'game.turn.opponentTurn': 'Turno del rival',
  'game.turn.opponentLeft': 'El rival se fue',
  'game.turn.waitingOpponent': 'Esperando al rival…',
  'game.aria.onlineRoom': 'Sala en línea',
  'game.online.hostSeat': 'Anfitrión · primero',
  'game.online.guestSeat': 'Invitado · segundo',
  'game.online.connecting': 'Conectando con tu rival…',
  'game.online.directPath': 'directa',
  'game.online.relayPath': 'repetidor',

  'board.onlineMeta': '{cols} × {rows} · Sala {code}',
  'board.onlineFooterHost': 'EN LÍNEA · el anfitrión mueve primero · P2P',
  'board.onlineFooterGuest': 'EN LÍNEA · tú mueves segundo · P2P',
  'board.onlineFooterHostRelay': 'EN LÍNEA · el anfitrión mueve primero · repetidor WebSocket',
  'board.onlineFooterGuestRelay': 'EN LÍNEA · tú mueves segundo · repetidor WebSocket',

  'result.opponentWins': 'Gana el rival',
  'result.rematchPending': 'Revancha pedida: esperando al rival.',
  'result.waitingOpponent': 'Esperando al rival',

  /* ---------- Endless ---------- */
  'menu.mode.endless': 'Sin fin',
  'menu.endlessHeading': 'Modo sin fin',
  'menu.endlessRule':
    'La IA siempre mueve primero. Tus cuatros no ganan; bloquéala y aguanta todo lo que puedas.',
  'menu.endlessBest': {
    one: 'Mejor: {count} jugada',
    other: 'Mejor: {count} jugadas',
  },
  'menu.endlessBestNone': 'Mejor —',
  'menu.endlessScrolls': {
    one: 'Desplazado {count} vez',
    other: 'Desplazado {count} veces',
  },
  'menu.startEndless': 'Empezar a defender',
  'menu.notes.endless1':
    'La IA siempre mueve primero y sigue atacando. Tú defiendes y tus cuatros nunca ganan.',
  'menu.notes.endless2':
    'Cuando el tablero se llena, sube una fila y la fila superior sale; el juego continúa.',
  'menu.notes.endless3':
    'La ronda termina cuando la IA conecta cuatro. Tu puntuación es el número de jugadas; el mejor se guarda en este dispositivo.',
  'menu.notes.endless4':
    'Sin fin está fijado en Difícil y solo ofrece 6×6 y 8×8.',
  'menu.colophonEndless': 'Teclas 1–0 sueltan · R reinicia · sin deshacer en sin fin',

  'game.mode.endless': 'Sin fin · {cols}×{rows}',
  'game.turn.defend': 'Tu turno · defiende',
  'game.turn.aiAttacking': 'La IA ataca…',
  'game.turn.endlessOver': 'Ronda terminada',
  'game.endlessMoves': {
    one: 'Sobreviviste {count} jugada',
    other: 'Sobreviviste {count} jugadas',
  },
  'game.aria.endlessProgress': 'Progreso sin fin',
  'game.endlessNotice.ignoredWin':
    'Aquí los cuatros no ganan: sigue bloqueando a la IA.',
  'game.endlessNotice.scrolled': 'El tablero subió una fila. Continúa.',
  'game.endlessNotice.winAndScroll':
    'Aquí los cuatros no ganan: el tablero subió una fila. Continúa.',

  'board.endlessTitle': 'Defensa sin fin',
  'board.endlessMeta': '{cols} × {rows} · Bloquea a la IA',
  'board.endlessFooter':
    'SIN FIN · tus cuatros no ganan · aguanta todo lo que puedas',

  'endless.head': 'SIN FIN · {size}×{size}',
  'endless.aiWins': 'La IA conectó cuatro',
  'endless.survived': {
    one: 'Sobreviviste {count} jugada',
    other: 'Sobreviviste {count} jugadas',
  },
  'endless.scrolls': {
    one: 'El tablero se desplazó {count} vez',
    other: 'El tablero se desplazó {count} veces',
  },
  'endless.best': {
    one: 'Mejor para este tamaño: {count} jugada',
    other: 'Mejor para este tamaño: {count} jugadas',
  },
  'endless.newBest': 'Nuevo récord',
  'endless.again': 'Jugar otra vez',
  'endless.menu': 'Volver al menú',
  'endless.stamp': 'D',
} satisfies Messages;
