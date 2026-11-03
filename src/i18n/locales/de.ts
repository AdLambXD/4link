import type { Messages } from '../messages';

/** Deutsch */
export const de = {
  'app.title': '4Link · Vier gewinnt',
  'app.description':
    '4Link: Verbinde vier auf einem 6×6-Schwerkraftbrett. Fallen lassen, stapeln, verbinden.',
  'app.kicker': 'Vier gewinnt · Schwerkraftbrett · vier verbinden',

  'common.settings': 'Einstellungen',
  'common.closeSettings': 'Einstellungen schließen',
  'common.reset': 'Zurücksetzen',
  'common.remove': 'Entfernen',
  'common.followTheme': 'Design verwenden',
  'common.themeColor': 'Designfarbe',
  'common.processing': 'Wird verarbeitet…',

  'menu.modeHeading': 'Spielmodus',
  'menu.mode.pve': 'Gegen KI',
  'menu.mode.pvp': 'Lokal',
  'menu.mode.puzzle': 'Rätsel',
  'menu.mode.tutorial': 'Tutorial',
  'menu.tutorialHeading': 'Lektion wählen',
  'menu.puzzleHeading': 'Rätsel wählen',
  'menu.learned': 'Gelernt {done} / {total}',
  'menu.solved': 'Gelöst {done} / {total}',
  'menu.learnedYes': 'Gelernt',
  'menu.learnedNo': 'Nicht gelernt',
  'menu.solvedYes': 'Gelöst',
  'menu.solvedNo': 'Nicht gelöst',
  'menu.guidedSteps': {
    one: '{count} geführter Schritt',
    other: '{count} geführte Schritte',
  },
  'menu.mateIn': 'Matt in {count}',
  'menu.bestMoves': {
    one: 'Bestwert: {count} Zug',
    other: 'Bestwert: {count} Züge',
  },
  'menu.playerHeading': 'Spieler',
  'menu.playerCount': '{count} Spieler',
  'menu.boardHeading': 'Brettgröße',
  'menu.connect': '{count} verbinden',
  'menu.difficultyHeading': 'Schwierigkeit',
  'difficulty.easy': 'Leicht',
  'difficulty.normal': 'Normal',
  'difficulty.hard': 'Schwer',
  'menu.firstHeading': 'Erster Zug',
  'menu.firstMe': 'Ich beginne',
  'menu.firstAi': 'KI beginnt',
  'menu.appearanceHeading': 'Aussehen',
  'menu.skinTheme': 'Design {name}',
  'menu.skinNote': '{name} · ganze Seite',
  'menu.appearanceMeta': 'Design, Brett, Steinfarben und Bilder',
  'menu.customPieces': 'Eigene Steine',
  'menu.customBackground': 'Eigener Hintergrund',
  'menu.customFace': 'Eigene Brettfarbe',
  'menu.handdrawn': 'Handgezeichnetes Gitter',
  'menu.startMatch': 'Partie starten',
  'menu.startPuzzle': 'Rätsel starten',
  'menu.startTutorial': 'Tutorial starten',
  'menu.tutorialProgress': 'Tutorial-Fortschritt',
  'menu.allDone': 'Alles erledigt',
  'menu.tutorialHint': 'Beginne mit dem Fallenlassen und lerne dann Lektion für Lektion',
  'menu.puzzleProgress': 'Rätsel-Fortschritt',
  'menu.bestNone': 'Bestwert —',
  'menu.record': 'Direktduell',
  'menu.clearStats': 'Löschen',
  'menu.howToPlay': 'So spielt man',
  'menu.notes.tutorial1':
    'Das Tutorial zeigt genau, wo du setzen sollst. Fehlklicks legen keinen Stein, also probiere frei aus.',
  'menu.notes.tutorial2':
    'Sechs Lektionen behandeln Schwerkraft, waagerechte, senkrechte und diagonale Linien, Blocken und die Siegpriorität.',
  'menu.notes.tutorial3':
    'Der Fortschritt wird auf diesem Gerät gespeichert. Du kannst die aktuelle Lektion jederzeit neu starten.',
  'menu.notes.puzzle1':
    'Jedes Rätsel ist eine unfertige Stellung. Verbinde die Zielzahl innerhalb des Zuglimits, um zu gewinnen.',
  'menu.notes.puzzle2':
    'Du ziehst immer zuerst, die KI verteidigt. Sie zögert die Niederlage so lange wie möglich hinaus.',
  'menu.notes.puzzle3':
    'Nur deine Züge zählen. Hinweise zeigen einen erzwungenen Sieg, falls es einen gibt.',
  'menu.notes.puzzle4':
    'Gelöste Rätsel und Bestwerte werden auf diesem Gerät gespeichert.',
  'menu.notes.play1':
    'Auf einem quadratischen Brett wählt ihr abwechselnd eine Spalte. Der Stein fällt bis zum tiefsten freien Punkt.',
  'menu.notes.play2':
    '2–6 Spieler teilen sich ein Gerät. Bei 3 oder mehr Spielern gibt es keine KI und keine Hinweise.',
  'menu.notes.play3':
    'Verbinde 4 auf 6×6 und 8×8; verbinde 5 auf 12×12 und 16×16.',
  'menu.notes.play4':
    'Nimm zuerst die mittleren Spalten. Diagonalen und doppelte Drohungen werden am leichtesten übersehen.',
  'menu.notes.appearance':
    'Passe Design, Steinfarben und Bilder in den Einstellungen an. Die Auswahl wird auf diesem Gerät gespeichert.',
  'menu.colophon': 'Tasten 1–0 setzen · ESC zurück · R neu starten',

  'settings.title': 'Einstellungen',
  'settings.subtitle':
    'Design, Brett und Steinaussehen. Änderungen gelten sofort.',
  'settings.languageHeading': 'Sprache',
  'settings.languageNote': 'OBERFLÄCHE / SPRACHE',
  'settings.languageHint':
    'Folgt standardmäßig deinem Browser. Eine manuelle Auswahl wird auf diesem Gerät gespeichert.',
  'settings.themeHeading': 'Seitendesign',
  'settings.themeNote': 'FARBE / PAPIER / BRETT',
  'settings.scheme.dark': 'Dunkel',
  'settings.scheme.light': 'Hell',
  'settings.piecesHeading': 'Steine',
  'settings.piecesNote': 'FARBE / BILD',
  'settings.piecesHint':
    'Nicht angepasste Farben folgen dem Design. Bilder werden rund zugeschnitten und auf diesem Gerät gespeichert.',
  'settings.role.first': 'Erster Spieler',
  'settings.role.second': 'Zweiter Spieler',
  'settings.role.player': 'Spieler {player}',
  'settings.color': 'Farbe',
  'settings.pieceColorAria': 'Steinfarbe für Spieler {player}',
  'settings.image.upload': 'Bild hochladen',
  'settings.image.change': 'Bild ändern',
  'settings.imageSupport': 'PNG / JPG / WebP, bis 8 MB.',
  'settings.resetPieces': 'Alles auf Design zurücksetzen',
  'settings.boardHeading': 'Brett',
  'settings.boardNote': 'GITTER / HINTERGRUND',
  'settings.boardHint':
    'Das handgezeichnete Gitter ändert nur die Zeichnung, nicht die Schnittpunkte oder Züge.',
  'settings.boardStyleAria': 'Gitterstil des Bretts',
  'settings.boardStyle.clean': 'Sauber',
  'settings.boardStyle.handdrawn': 'Skizze',
  'settings.boardBackground': 'Bretthintergrund',
  'settings.boardImage': 'Eigenes Bild',
  'settings.boardFace': 'Eigene Farbe',
  'settings.boardFollow': 'Designfarbe verwenden',
  'settings.boardColor': 'Farbe',
  'settings.boardColorAria': 'Hintergrundfarbe des Bretts',
  'settings.uploadBackground': 'Hintergrund hochladen',
  'settings.changeBackground': 'Hintergrund ändern',
  'settings.veil': 'Hintergrundschleier',
  'settings.boardSupport':
    'PNG / JPG / WebP, bis 12 MB. Wird auf diesem Gerät gespeichert.',
  'settings.resetBoard': 'Brett zurücksetzen',
  'settings.saved': 'Das Aussehen ist auf diesem Gerät gespeichert',
  'settings.done': 'Fertig',
  'settings.errorFallback':
    'Das Bild konnte nicht verarbeitet werden. Bitte versuche es erneut.',

  'game.backAria': 'Zurück zum Menü',
  'game.settingsAria': 'Einstellungen öffnen',
  'game.mode.tutorial': 'Tutorial · NO.{no} · {cols}×{rows}',
  'game.mode.puzzle': 'Rätsel · NO.{no} · {cols}×{rows}',
  'game.mode.pve': 'Gegen KI · {difficulty} · {cols}×{rows}',
  'game.mode.pvp': 'Lokal · {players} · {cols}×{rows}',
  'game.turn.movesUsed': 'Keine Züge mehr',
  'game.turn.tutorialDone': 'Tutorial abgeschlossen',
  'game.turn.opponentResponding': 'Gegner antwortet…',
  'game.turn.yours': 'Du bist dran',
  'game.turn.draw': 'Unentschieden',
  'game.turn.solved': 'Gelöst',
  'game.turn.defended': 'Verteidigt',
  'game.turn.over': 'Partie beendet',
  'game.turn.aiDefending': 'KI verteidigt…',
  'game.turn.aiTurn': 'KI ist dran',
  'game.turn.aiThinking': 'KI denkt…',
  'game.turn.first': 'Erster Spieler ist dran',
  'game.turn.second': 'Zweiter Spieler ist dran',
  'game.turn.player': 'Spieler {player} ist dran',
  'game.aria.tutorialProgress': 'Tutorial-Fortschritt',
  'game.aria.moveLimit': 'Zuglimit',
  'game.aria.series': 'Seriensiege',
  'game.lesson': 'Lektion {no} / {total}',
  'game.complete': 'Fertig',
  'game.step': 'Schritt {current} / {total}',
  'game.limitMoves': {
    one: 'Limit {count} Zug',
    other: 'Limit {count} Züge',
  },
  'game.usedMoves': 'Verbraucht {used} / {limit}',
  'game.draws': 'Unentschieden {count}',
  'game.tutorialWrongColumn': 'Versuche diesmal Spalte {col}.',
  'game.puzzleNoWin':
    'Kein erzwungener Sieg im Zuglimit. Starte neu oder drücke R.',

  'board.defaultTitle': 'Vier gewinnt',
  'board.defaultMeta': '{cols} × {rows} · {win} verbinden',
  'board.tutorialTitle': 'Tutorial · {title}',
  'board.puzzleTitle': 'Rätsel · {title}',
  'board.tutorialMeta': '{size} × {size} · Tutorial',
  'board.puzzleMeta': '{size} × {size} · {limit}',
  'board.tutorialFooter': 'TUTORIAL · folge den Hinweisen',
  'board.puzzleFooter': 'RÄTSEL · du beginnst · gewinne im Limit',
  'board.pointEmpty': 'Spalte {col}, Reihe {row}, leer',
  'board.pointFirst': 'Spalte {col}, Reihe {row}, Stein des ersten Spielers',
  'board.pointSecond': 'Spalte {col}, Reihe {row}, Stein des zweiten Spielers',
  'board.pointPlayer': 'Spalte {col}, Reihe {row}, Stein von Spieler {player}',

  'result.draw': 'Unentschieden',
  'result.youWin': 'Du gewinnst',
  'result.aiWins': 'KI gewinnt',
  'result.firstWins': 'Erster Spieler gewinnt',
  'result.secondWins': 'Zweiter Spieler gewinnt',
  'result.playerWins': 'Spieler {player} gewinnt',
  'result.move': 'Zug {count}',
  'result.boardFull': 'Das Brett ist voll. Niemand hat {win} verbunden.',
  'result.line': '{win} in einer Reihe',
  'result.again': 'Nochmal spielen',
  'result.swap': 'Tauschen und neu spielen',
  'result.menu': 'Zurück zum Menü',
  'result.stampWin': 'S',
  'result.stampDraw': 'U',

  'puzzle.head': 'RÄTSEL NO.{no}',
  'puzzle.solved': 'Rätsel gelöst',
  'puzzle.exhausted': 'Keine Züge mehr',
  'puzzle.draw': 'Unentschieden',
  'puzzle.defended': 'Verteidigt',
  'puzzle.solvedIn': {
    one: 'In {count} Zug gelöst',
    other: 'In {count} Zügen gelöst',
  },
  'puzzle.exhaustedDetail': 'Keine Linie aus {win} im Zuglimit',
  'puzzle.drawDetail': 'Das Brett ist voll und du hast {win} nicht verbunden',
  'puzzle.defendedDetail': 'Die KI hat zuerst {win} verbunden',
  'puzzle.hints': {
    one: '{count} Hinweis verwendet',
    other: '{count} Hinweise verwendet',
  },
  'puzzle.next': 'Nächstes Rätsel',
  'puzzle.retrySolved': 'Erneut lösen',
  'puzzle.retry': 'Erneut versuchen',
  'puzzle.menu': 'Zurück zum Menü',
  'puzzle.stampSolved': 'S',
  'puzzle.stampFailed': 'X',

  'tutorial.head': 'TUTORIAL NO.{no}',
  'tutorial.nextUnlocked': 'Nächste Lektion freigeschaltet',
  'tutorial.allComplete': 'Alles abgeschlossen',
  'tutorial.complete': 'Tutorial abgeschlossen',
  'tutorial.nextLesson': 'Nächste Lektion: {title}',
  'tutorial.mastered':
    'Du hast Setzen, Verbinden, Blocken und die Siegpriorität gelernt.',
  'tutorial.next': 'Nächste Lektion',
  'tutorial.practice': 'Nochmal üben',
  'tutorial.menu': 'Zurück zum Menü',
  'tutorial.stamp': '✓',
  'coach.responding': 'Gegner antwortet…',
  'coach.complete': 'Fertig',
  'coach.steps': 'Schritt {current} / {total}',

  'controls.undo': 'Zurück',
  'controls.restart': 'Neu starten',
  'controls.thinking': 'Denkt',
  'controls.hint': 'Hinweis',
  'controls.soundOn': 'Ton aus',
  'controls.soundOff': 'Ton an',

  'language.groupAria': 'Oberflächensprache',
  'language.zhCN': '简体中文',
  'language.zhTW': '繁體中文',
  'language.en': 'English',
  'language.short.zhCN': '简',
  'language.short.zhTW': '繁',
  'language.short.en': 'EN',

  'errors.image.notImage': 'Bitte wähle eine Bilddatei (PNG / JPG / WebP)',
  'errors.image.tooLarge': 'Das Bild muss kleiner als {maxMb} MB sein',
  'errors.image.unreadable': 'Dieses Bild konnte nicht gelesen werden',
  'errors.image.invalidSize': 'Die Bildgröße ist ungültig',
  'errors.image.unsupported': 'Dieser Browser kann keine Bilder verarbeiten',
  'errors.image.tooComplex':
    'Das Bild ist zu komplex. Versuche ein einfacheres.',
  'errors.image.failed':
    'Das Bild konnte nicht verarbeitet werden. Bitte versuche es erneut.',

  /* ---------- Rotation ---------- */
  'menu.mode.rotation': 'Rotation',
  'menu.rotationHeading': 'Rotationsmodus',
  'menu.rotationRule':
    'Jeder Stein dreht das Brett um 90° im Uhrzeigersinn, und die Steine fallen zum neuen Boden. Auch Linien, die durch Drehung oder Fall entstehen, gewinnen.',
  'menu.rotationVsAi': 'Gegen KI',
  'menu.rotationVsLocal': 'Lokal zu zweit',
  'menu.startRotation': 'Rotationspartie starten',
  'menu.notes.rotation1':
    'Nach jedem Zug dreht sich das Brett um 90° im Uhrzeigersinn und die Steine sacken zum neuen Boden.',
  'menu.notes.rotation2':
    'Eine Linie, die durch Drehung oder Fall entsteht, gewinnt ebenfalls – für beide Spieler.',
  'menu.notes.rotation3':
    'Wenn beide gleichzeitig eine Linie vervollständigen, gewinnt der Spieler, der gezogen hat.',
  'menu.notes.rotation4':
    'Gewinnt ein Zug sofort oder füllt das Brett, wird nicht gedreht; die Partie endet sofort.',
  'game.mode.rotation': 'Rotation · {cols}×{rows}',
  'game.rotationNotice.rotated': 'Das Brett wurde um 90° im Uhrzeigersinn gedreht',
  'game.rotationTurns': {
    one: '{count} Mal gedreht',
    other: '{count} Mal gedreht',
  },
  'game.aria.rotationProgress': 'Anzahl der Drehungen',
  'board.rotationTitle': 'Rotationsmodus',
  'board.rotationMeta': '{cols} × {rows} · 90° im Uhrzeigersinn pro Zug',
  'board.rotationFooter': 'ROTATION · jeder Zug dreht das Brett 90° im Uhrzeigersinn',
  'result.rotations': {
    one: 'Brett {count} Mal gedreht',
    other: 'Brett {count} Mal gedreht',
  },

  /* ---------- Online ---------- */
  'menu.mode.online': 'Online',
  'menu.onlineHeading': 'Onlineraum',
  'menu.onlineBoardHeading': 'Brettgröße (Gastgeber wählt)',
  'menu.onlineStatus': 'Onlinestatus',
  'menu.online.idle': 'Offline',
  'menu.online.connecting': 'Verbinden',
  'menu.online.waiting': 'Warte auf Gegner',
  'menu.online.syncing': 'Brett wird synchronisiert',
  'menu.online.playing': 'Im Spiel',
  'menu.online.left': 'Gegner hat verlassen',
  'menu.online.error': 'Verbindung fehlgeschlagen',
  'menu.onlineRoom': 'Raum {code}',
  'menu.notes.online1':
    'Wer den Raum erstellt, ist Gastgeber und beginnt; der Gegner tritt mit demselben Code bei.',
  'menu.notes.online2':
    'Züge gehen standardmäßig direkt von Gerät zu Gerät; wenn symmetrisches NAT oder ein Firmennetz das blockiert, stelle den Raum auf das WebSocket-Relay um.',
  'menu.notes.online3':
    'Online ist 1v1; die vom Gastgeber gewählte Brettgröße entscheidet die Partie.',
  'menu.notes.online4':
    'Wenn jemand ausfällt, bleibt der Raum offen – mit demselben Code wieder beitreten, um fortzusetzen.',

  'online.host': 'Raum erstellen',
  'online.hostNote': 'GASTGEBER · du beginnst',
  'online.join': 'Raum beitreten',
  'online.joinNote': 'BEITRETEN · du ziehst als Zweiter',
  'online.codeLabel': 'Raumcode',
  'online.codePlaceholder': '5-stelligen Code eingeben',
  'online.joinAction': 'Beitreten',
  'online.shareLink': 'Link teilen',
  'online.copyLink': 'Link kopieren',
  'online.copied': 'Kopiert',
  'online.copyManual': 'Manuell kopieren',
  'online.note.idle':
    'Wähle die Verbindungsart und erstelle oder betrete einen Raum. Der Gastgeber beginnt, und der Link enthält Code und Methode.',
  'online.connecting': 'Verbindung wird geöffnet…',
  'online.cancel': 'Abbrechen',
  'online.waitingHost': 'Raum erstellt, warte auf den Gegner…',
  'online.waitingGuest': 'Verbinde mit dem Gastgeber, warte auf das Brett…',
  'online.note.waitingHost':
    'Sende den Raumcode oder Link an deinen Gegner; das Spiel startet, sobald er beitritt.',
  'online.note.waitingGuest':
    'Prüfe, ob dein Gegner genau diesen Code erstellt hat; nach der Verbindung kommst du ins Spiel.',
  'online.leave': 'Raum verlassen',
  'online.syncing': 'Verbunden, Brett wird synchronisiert…',
  'online.note.syncing':
    'Das Spiel öffnet sich, sobald das Brett vom Gastgeber ankommt. Wenn nichts passiert, versuche Neu synchronisieren.',
  'online.resync': 'Neu synchronisieren',
  'online.left': 'Gegner hat verlassen',
  'online.note.left':
    'Der Raum bleibt offen – dein Gegner kann mit demselben Code wieder beitreten.',
  'online.playing': 'Partie läuft',
  'online.back': 'Zurück',
  'online.errorFallback':
    'Etwas ist schiefgelaufen. Bitte versuche es erneut.',

  'online.methodHeading': 'Verbindung',
  'online.method.direct': 'Direkt',
  'online.method.directNote': 'P2P · am schnellsten',
  'online.method.relay': 'Relay',
  'online.method.relayNote': 'WebSocket · jedes Netz',
  'online.method.directHint':
    'Züge gehen mit der geringsten Latenz direkt zwischen den beiden Geräten. Symmetrisches NAT, Firmennetze und manche Handy-Hotspots blockieren das – wechsle bei Fehlschlag zu Relay.',
  'online.method.relayHint':
    'Züge werden über einen Relay-Server geleitet, daher funktioniert fast jedes Netz. Etwas höhere Latenz; das Relay ist eingebaut oder selbst gehostet.',
  'online.relayUrl': 'Relay-URL',
  'online.relayUrlPlaceholder': 'wss://relay.example.com/ws',
  'online.relayUrlHint':
    'Verwende eine ws://- oder wss://-Adresse. Leer lassen für das eingebaute Relay.',
  'online.usingDirect': 'Verbindung: direkt (P2P)',
  'online.usingRelay': 'Verbindung: Relay {host}',

  'online.notice.syncing': 'Verbunden, Brett wird synchronisiert…',
  'online.notice.peerLeft':
    'Dein Gegner hat den Raum verlassen. Warte auf die Rückkehr…',
  'online.notice.peerLeftWaiting':
    'Dein Gegner ist gegangen, aber der Raum bleibt offen: mit demselben Code wieder beitreten, um fortzusetzen.',
  'online.notice.probe':
    'Eine neue Verbindung ist eingetroffen; prüfe, ob der aktuelle Gegner noch online ist…',
  'online.notice.kickedFull':
    'Der Raum ist voll – der zusätzliche Spieler wurde gebeten zu gehen.',
  'online.notice.syncTimeout':
    'Noch kein Brett vom Gastgeber. Versuche Neu synchronisieren oder verlasse den Raum und tritt mit demselben Code wieder bei.',
  'online.notice.resyncing': 'Brett wird neu synchronisiert…',
  'online.notice.reconnecting':
    'Verbindung verloren – verbinde erneut mit dem Relay…',

  'online.error.roomFull': 'Raum voll: Diese 1v1-Partie hat bereits begonnen.',
  'online.error.invalidCode':
    'Raumcodes haben 5 Buchstaben oder Ziffern, z. B. 4K7QP.',
  'online.error.connect':
    'Raum konnte nicht betreten werden. Prüfe dein Netz und versuche es erneut.',
  'online.error.signal':
    'Signalisierung fehlgeschlagen ({detail}). Prüfe dein Netz und versuche es erneut.',
  'online.error.relay':
    'Relay nicht erreichbar ({detail}). Prüfe die Adresse oder wechsle zu Direkt.',
  'online.error.relayUrl':
    'Die Relay-Adresse muss mit ws:// oder wss:// beginnen.',

  'game.mode.online': 'Online · {code} · {cols}×{rows}',
  'game.turn.opponentTurn': 'Gegner ist dran',
  'game.turn.opponentLeft': 'Gegner hat verlassen',
  'game.turn.waitingOpponent': 'Warte auf Gegner…',
  'game.aria.onlineRoom': 'Onlineraum',
  'game.online.hostSeat': 'Gastgeber · Erster',
  'game.online.guestSeat': 'Gast · Zweiter',
  'game.online.connecting': 'Verbinde mit deinem Gegner…',
  'game.online.directPath': 'direkt',
  'game.online.relayPath': 'Relay',

  'board.onlineMeta': '{cols} × {rows} · Raum {code}',
  'board.onlineFooterHost': 'ONLINE · Gastgeber beginnt · P2P',
  'board.onlineFooterGuest': 'ONLINE · du ziehst als Zweiter · P2P',
  'board.onlineFooterHostRelay':
    'ONLINE · Gastgeber beginnt · WebSocket-Relay',
  'board.onlineFooterGuestRelay':
    'ONLINE · du ziehst als Zweiter · WebSocket-Relay',

  'result.opponentWins': 'Gegner gewinnt',
  'result.rematchPending': 'Revanche angefragt – warte auf den Gegner.',
  'result.waitingOpponent': 'Warte auf Gegner',

  /* ---------- Endless ---------- */
  'menu.mode.endless': 'Endlos',
  'menu.endlessHeading': 'Endlosmodus',
  'menu.endlessRule':
    'Die KI beginnt immer. Deine Vieren gewinnen nicht; blockiere sie und überlebe so lange wie möglich.',
  'menu.endlessBest': {
    one: 'Bestwert: {count} Zug',
    other: 'Bestwert: {count} Züge',
  },
  'menu.endlessBestNone': 'Bestwert —',
  'menu.endlessScrolls': {
    one: '{count} Mal gescrollt',
    other: '{count} Mal gescrollt',
  },
  'menu.startEndless': 'Verteidigung starten',
  'menu.notes.endless1':
    'Die KI beginnt immer und greift weiter an. Du verteidigst, und deine eigenen Vieren gewinnen nie.',
  'menu.notes.endless2':
    'Wenn das Brett voll ist, scrollt es eine Reihe nach oben und die oberste Reihe verschwindet; das Spiel geht weiter.',
  'menu.notes.endless3':
    'Der Lauf endet, wenn die KI vier verbindet. Deine Punktzahl sind die gemachten Züge; der Bestwert wird auf diesem Gerät gespeichert.',
  'menu.notes.endless4':
    'Endlos ist auf Schwer festgelegt und bietet nur 6×6 und 8×8.',
  'menu.colophonEndless':
    'Tasten 1–0 setzen · R neu starten · kein Zurück in Endlos',

  'game.mode.endless': 'Endlos · {cols}×{rows}',
  'game.turn.defend': 'Du bist dran · verteidige',
  'game.turn.aiAttacking': 'KI greift an…',
  'game.turn.endlessOver': 'Lauf beendet',
  'game.endlessMoves': {
    one: '{count} Zug überlebt',
    other: '{count} Züge überlebt',
  },
  'game.aria.endlessProgress': 'Endlos-Fortschritt',
  'game.endlessNotice.ignoredWin':
    'Hier gewinnen Vieren nicht – blockiere die KI weiter.',
  'game.endlessNotice.scrolled':
    'Das Brett ist eine Reihe nach oben gescrollt. Weiter geht’s.',
  'game.endlessNotice.winAndScroll':
    'Hier gewinnen Vieren nicht – das Brett ist eine Reihe nach oben gescrollt. Weiter geht’s.',

  'board.endlessTitle': 'Endlosverteidigung',
  'board.endlessMeta': '{cols} × {rows} · Blockiere die KI',
  'board.endlessFooter':
    'ENDLOS · deine Vieren gewinnen nicht · überlebe so lange wie möglich',

  'endless.head': 'ENDLOS · {size}×{size}',
  'endless.aiWins': 'Die KI hat vier verbunden',
  'endless.survived': {
    one: 'Du hast {count} Zug überlebt',
    other: 'Du hast {count} Züge überlebt',
  },
  'endless.scrolls': {
    one: 'Brett {count} Mal gescrollt',
    other: 'Brett {count} Mal gescrollt',
  },
  'endless.best': {
    one: 'Bestwert für diese Größe: {count} Zug',
    other: 'Bestwert für diese Größe: {count} Züge',
  },
  'endless.newBest': 'Neuer Bestwert',
  'endless.again': 'Nochmal spielen',
  'endless.menu': 'Zurück zum Menü',
  'endless.stamp': 'U',
} satisfies Messages;
