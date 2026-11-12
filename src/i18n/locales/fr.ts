import type { Messages } from '../messages';

/** Français */
export const fr = {
  'app.title': '4Link · Puissance 4',
  'app.description':
    '4Link : alignez quatre pions sur un plateau à gravité 6×6. Lâchez, empilez, alignez.',
  'app.kicker': 'Puissance 4 · plateau à gravité · alignez quatre',

  'common.settings': 'Réglages',
  'common.closeSettings': 'Fermer les réglages',
  'common.reset': 'Réinitialiser',
  'common.remove': 'Retirer',
  'common.followTheme': 'Utiliser le thème',
  'common.themeColor': 'Couleur du thème',
  'common.processing': 'Traitement…',

  'menu.modeHeading': 'Mode de partie',
  'menu.mode.pve': 'Contre l’IA',
  'menu.mode.pvp': 'Local',
  'menu.mode.puzzle': 'Énigmes',
  'menu.mode.tutorial': 'Tutoriel',
  'menu.tutorialHeading': 'Choisir une leçon',
  'menu.puzzleHeading': 'Choisir une énigme',
  'menu.learned': 'Apprises {done} / {total}',
  'menu.solved': 'Résolues {done} / {total}',
  'menu.learnedYes': 'Apprise',
  'menu.learnedNo': 'Non apprise',
  'menu.solvedYes': 'Résolue',
  'menu.solvedNo': 'Non résolue',
  'menu.guidedSteps': {
    one: '{count} étape guidée',
    other: '{count} étapes guidées',
  },
  'menu.mateIn': 'Mat en {count}',
  'menu.bestMoves': {
    one: 'Record : {count} coup',
    other: 'Record : {count} coups',
  },
  'menu.playerHeading': 'Joueurs',
  'menu.playerCount': '{count} joueurs',
  'menu.boardHeading': 'Taille du plateau',
  'menu.connect': 'Alignez {count}',
  'menu.difficultyHeading': 'Difficulté',
  'difficulty.easy': 'Facile',
  'difficulty.normal': 'Normale',
  'difficulty.hard': 'Difficile',
  'menu.firstHeading': 'Premier coup',
  'menu.firstMe': 'Je commence',
  'menu.firstAi': 'L’IA commence',
  'menu.appearanceHeading': 'Apparence',
  'menu.skinTheme': 'Thème {name}',
  'menu.skinNote': '{name} · tout le site',
  'menu.appearanceMeta': 'Thème, plateau, couleurs et images des pions',
  'menu.customPieces': 'Pions personnalisés',
  'menu.customBackground': 'Fond personnalisé',
  'menu.customFace': 'Couleur de plateau personnalisée',
  'menu.handdrawn': 'Grille dessinée à la main',
  'menu.startMatch': 'Lancer la partie',
  'menu.startPuzzle': 'Lancer l’énigme',
  'menu.startTutorial': 'Lancer le tutoriel',
  'menu.tutorialProgress': 'Progression du tutoriel',
  'menu.allDone': 'Tout terminé',
  'menu.tutorialHint': 'Commencez par lâcher un pion, puis apprenez une leçon à la fois',
  'menu.puzzleProgress': 'Progression des énigmes',
  'menu.bestNone': 'Record —',
  'menu.record': 'Face-à-face',
  'menu.clearStats': 'Effacer',
  'menu.howToPlay': 'Comment jouer',
  'menu.notes.tutorial1':
    'Le tutoriel vous montre exactement où poser. Un clic erroné ne place pas de pion : essayez librement.',
  'menu.notes.tutorial2':
    'Six leçons couvrent la gravité, les lignes horizontales, verticales et diagonales, le blocage et la priorité de victoire.',
  'menu.notes.tutorial3':
    'La progression est enregistrée sur cet appareil. Vous pouvez relancer la leçon en cours à tout moment.',
  'menu.notes.puzzle1':
    'Chaque énigme est une position inachevée. Alignez le nombre cible dans la limite de coups pour gagner.',
  'menu.notes.puzzle2':
    'Vous jouez toujours en premier et l’IA défend. Elle repoussera la défaite autant que possible.',
  'menu.notes.puzzle3':
    'Seuls vos coups comptent. Les indices signalent une victoire forcée si elle existe.',
  'menu.notes.puzzle4':
    'La progression et les meilleurs scores sont enregistrés sur cet appareil.',
  'menu.notes.play1':
    'Sur un plateau carré, choisissez une colonne à tour de rôle. Le pion tombe jusqu’au point libre le plus bas.',
  'menu.notes.play2':
    'De 2 à 6 joueurs partagent un appareil. L’IA et les indices ne sont pas disponibles à 3 joueurs ou plus.',
  'menu.notes.play3':
    'Alignez 4 sur 6×6 et 8×8 ; alignez 5 sur 12×12 et 16×16.',
  'menu.notes.play4':
    'Prenez d’abord les colonnes centrales. Les diagonales et les doubles menaces sont les plus faciles à manquer.',
  'menu.notes.appearance':
    'Réglez le thème, les couleurs des pions et les images dans les Réglages. Les choix sont enregistrés sur cet appareil.',
  'menu.colophon': 'Touches 1–0 pour poser · ÉCHAP annuler · R recommencer',

  'settings.title': 'Réglages',
  'settings.subtitle':
    'Thème, plateau et apparence des pions. Les changements s’appliquent immédiatement.',
  'settings.languageHeading': 'Langue',
  'settings.languageNote': 'INTERFACE / LANGUE',
  'settings.languageHint':
    'Suit votre navigateur par défaut. Un choix manuel est enregistré sur cet appareil.',
  'settings.themeHeading': 'Thème du site',
  'settings.themeNote': 'COULEUR / PAPIER / PLATEAU',
  'settings.scheme.dark': 'Sombre',
  'settings.scheme.light': 'Clair',
  'settings.piecesHeading': 'Pions',
  'settings.piecesNote': 'COULEUR / IMAGE',
  'settings.piecesHint':
    'Les couleurs non personnalisées suivent le thème. Les images sont recadrées en cercle et enregistrées sur cet appareil.',
  'settings.role.first': 'Premier joueur',
  'settings.role.second': 'Second joueur',
  'settings.role.player': 'Joueur {player}',
  'settings.color': 'Couleur',
  'settings.pieceColorAria': 'Couleur du pion du joueur {player}',
  'settings.image.upload': 'Importer une image',
  'settings.image.change': 'Changer l’image',
  'settings.imageSupport': 'PNG / JPG / WebP, jusqu’à 8 Mo.',
  'settings.resetPieces': 'Tout réinitialiser au thème',
  'settings.boardHeading': 'Plateau',
  'settings.boardNote': 'GRILLE / FOND',
  'settings.boardHint':
    'Le style de grille ne change que le dessin, pas les intersections ni les coups.',
  'settings.boardStyleAria': 'Style de grille du plateau',
  'settings.boardStyle.clean': 'Net',
  'settings.boardStyle.handdrawn': 'Croquis',
  'settings.boardStyle.dotted': 'Points',
  'settings.boardStyle.blueprint': 'Plan',
  'settings.boardStyle.neon': 'Néon',
  'settings.boardStyle.minimal': 'Minimal',
  'settings.boardBackground': 'Fond du plateau',
  'settings.boardImage': 'Image personnalisée',
  'settings.boardFace': 'Couleur personnalisée',
  'settings.boardFollow': 'Utiliser la couleur du thème',
  'settings.boardColor': 'Couleur',
  'settings.boardColorAria': 'Couleur de fond du plateau',
  'settings.uploadBackground': 'Importer un fond',
  'settings.changeBackground': 'Changer le fond',
  'settings.veil': 'Voile du fond',
  'settings.boardSupport':
    'PNG / JPG / WebP, jusqu’à 12 Mo. Enregistré sur cet appareil.',
  'settings.resetBoard': 'Réinitialiser le plateau',
  'settings.saved': 'L’apparence est enregistrée sur cet appareil',
  'settings.done': 'Terminé',
  'settings.errorFallback': 'Impossible de traiter l’image. Veuillez réessayer.',

  'game.backAria': 'Retour au menu',
  'game.settingsAria': 'Ouvrir les réglages',
  'game.mode.tutorial': 'Tutoriel · NO.{no} · {cols}×{rows}',
  'game.mode.puzzle': 'Énigme · NO.{no} · {cols}×{rows}',
  'game.mode.pve': 'Contre l’IA · {difficulty} · {cols}×{rows}',
  'game.mode.pvp': 'Local · {players} · {cols}×{rows}',
  'game.turn.movesUsed': 'Plus de coups',
  'game.turn.tutorialDone': 'Tutoriel terminé',
  'game.turn.opponentResponding': 'L’adversaire répond…',
  'game.turn.yours': 'À vous de jouer',
  'game.turn.draw': 'Match nul',
  'game.turn.solved': 'Résolue',
  'game.turn.defended': 'Défendue',
  'game.turn.over': 'Partie terminée',
  'game.turn.aiDefending': 'L’IA défend…',
  'game.turn.aiTurn': 'Tour de l’IA',
  'game.turn.aiThinking': 'L’IA réfléchit…',
  'game.turn.first': 'Tour du premier joueur',
  'game.turn.second': 'Tour du second joueur',
  'game.turn.player': 'Tour du joueur {player}',
  'game.aria.tutorialProgress': 'Progression du tutoriel',
  'game.aria.moveLimit': 'Limite de coups',
  'game.aria.series': 'Victoires de la série',
  'game.lesson': 'Leçon {no} / {total}',
  'game.complete': 'Terminé',
  'game.step': 'Étape {current} / {total}',
  'game.limitMoves': {
    one: 'Limite {count} coup',
    other: 'Limite {count} coups',
  },
  'game.usedMoves': 'Utilisés {used} / {limit}',
  'game.draws': 'Nuls {count}',
  'game.tutorialWrongColumn': 'Essayez la colonne {col} cette fois.',
  'game.puzzleNoWin':
    'Aucune victoire forcée dans la limite. Recommencez ou appuyez sur R.',

  'board.defaultTitle': 'Puissance 4',
  'board.defaultMeta': '{cols} × {rows} · alignez {win}',
  'board.tutorialTitle': 'Tutoriel · {title}',
  'board.puzzleTitle': 'Énigme · {title}',
  'board.tutorialMeta': '{size} × {size} · tutoriel',
  'board.puzzleMeta': '{size} × {size} · {limit}',
  'board.tutorialFooter': 'TUTORIEL · suivez les consignes',
  'board.puzzleFooter': 'ÉNIGME · vous commencez · gagnez dans la limite',
  'board.pointEmpty': 'Colonne {col}, ligne {row}, vide',
  'board.pointFirst': 'Colonne {col}, ligne {row}, pion du premier joueur',
  'board.pointSecond': 'Colonne {col}, ligne {row}, pion du second joueur',
  'board.pointPlayer': 'Colonne {col}, ligne {row}, pion du joueur {player}',

  'result.draw': 'Match nul',
  'result.youWin': 'Vous gagnez',
  'result.aiWins': 'L’IA gagne',
  'result.firstWins': 'Le premier joueur gagne',
  'result.secondWins': 'Le second joueur gagne',
  'result.playerWins': 'Le joueur {player} gagne',
  'result.move': 'Coup {count}',
  'result.boardFull': 'Le plateau est plein. Personne n’a aligné {win}.',
  'result.line': '{win} alignés',
  'result.again': 'Rejouer',
  'result.swap': 'Échanger et rejouer',
  'result.menu': 'Retour au menu',
  'result.stampWin': 'V',
  'result.stampDraw': 'N',

  'puzzle.head': 'ÉNIGME NO.{no}',
  'puzzle.solved': 'Énigme résolue',
  'puzzle.exhausted': 'Plus de coups',
  'puzzle.draw': 'Match nul',
  'puzzle.defended': 'Défendue',
  'puzzle.solvedIn': {
    one: 'Résolue en {count} coup',
    other: 'Résolue en {count} coups',
  },
  'puzzle.exhaustedDetail': 'Aucune ligne de {win} dans la limite de coups',
  'puzzle.drawDetail': 'Le plateau est plein et vous n’avez pas aligné {win}',
  'puzzle.defendedDetail': 'L’IA a aligné {win} en premier',
  'puzzle.hints': {
    one: '{count} indice utilisé',
    other: '{count} indices utilisés',
  },
  'puzzle.next': 'Énigme suivante',
  'puzzle.retrySolved': 'Résoudre à nouveau',
  'puzzle.retry': 'Réessayer',
  'puzzle.menu': 'Retour au menu',
  'puzzle.stampSolved': 'S',
  'puzzle.stampFailed': 'X',

  'tutorial.head': 'TUTORIEL NO.{no}',
  'tutorial.nextUnlocked': 'Leçon suivante débloquée',
  'tutorial.allComplete': 'Tout terminé',
  'tutorial.complete': 'Tutoriel terminé',
  'tutorial.nextLesson': 'Leçon suivante : {title}',
  'tutorial.mastered':
    'Vous avez appris à poser, aligner, bloquer et la priorité de victoire.',
  'tutorial.next': 'Leçon suivante',
  'tutorial.practice': 'S’entraîner encore',
  'tutorial.menu': 'Retour au menu',
  'tutorial.stamp': '✓',
  'coach.responding': 'L’adversaire répond…',
  'coach.complete': 'Terminé',
  'coach.steps': 'Étape {current} / {total}',

  'controls.undo': 'Annuler',
  'controls.restart': 'Recommencer',
  'controls.thinking': 'Réflexion',
  'controls.hint': 'Indice',
  'controls.soundOn': 'Couper le son',
  'controls.soundOff': 'Activer le son',

  'language.groupAria': 'Langue de l’interface',
  'language.zhCN': '简体中文',
  'language.zhTW': '繁體中文',
  'language.en': 'English',
  'language.short.zhCN': '简',
  'language.short.zhTW': '繁',
  'language.short.en': 'EN',

  'errors.image.notImage': 'Choisissez un fichier image (PNG / JPG / WebP)',
  'errors.image.tooLarge': 'L’image doit faire moins de {maxMb} Mo',
  'errors.image.unreadable': 'Impossible de lire cette image',
  'errors.image.invalidSize': 'La taille de l’image est invalide',
  'errors.image.unsupported': 'Ce navigateur ne peut pas traiter les images',
  'errors.image.tooComplex':
    'L’image est trop complexe. Essayez-en une plus simple.',
  'errors.image.failed': 'Impossible de traiter l’image. Veuillez réessayer.',

  /* ---------- Rotation ---------- */
  'menu.mode.rotation': 'Rotation',
  'menu.rotationHeading': 'Mode rotation',
  'menu.rotationRule':
    'Chaque pion posé fait tourner le plateau de 90° dans le sens horaire, et les pions retombent vers le nouveau bas. Les lignes formées par la rotation ou la chute comptent aussi.',
  'menu.rotationVsAi': 'Contre l’IA',
  'menu.rotationVsLocal': '2 joueurs locaux',
  'menu.startRotation': 'Lancer la partie en rotation',
  'menu.notes.rotation1':
    'Après chaque coup, le plateau tourne de 90° dans le sens horaire et les pions se tassent vers le nouveau bas.',
  'menu.notes.rotation2':
    'Une ligne formée par la rotation ou la chute fait aussi gagner, pour l’un ou l’autre joueur.',
  'menu.notes.rotation3':
    'Si les deux joueurs complètent une ligne en même temps, celui qui vient de jouer gagne.',
  'menu.notes.rotation4':
    'Si un coup gagne immédiatement ou remplit le plateau, il n’y a pas de rotation : la partie se termine tout de suite.',
  'game.mode.rotation': 'Rotation · {cols}×{rows}',
  'game.rotationNotice.rotated': 'Le plateau a tourné de 90° dans le sens horaire',
  'game.rotationTurns': {
    one: 'Tourné {count} fois',
    other: 'Tourné {count} fois',
  },
  'game.aria.rotationProgress': 'Nombre de rotations',
  'board.rotationTitle': 'Mode rotation',
  'board.rotationMeta': '{cols} × {rows} · 90° horaire par coup',
  'board.rotationFooter': 'ROTATION · chaque coup tourne le plateau de 90° horaire',
  'result.rotations': {
    one: 'Plateau tourné {count} fois',
    other: 'Plateau tourné {count} fois',
  },

  /* ---------- Online ---------- */
  'menu.mode.online': 'En ligne',
  'menu.onlineHeading': 'Salon en ligne',
  'menu.onlineBoardHeading': 'Taille du plateau (choisie par l’hôte)',
  'menu.onlineStatus': 'État en ligne',
  'menu.online.idle': 'Hors ligne',
  'menu.online.connecting': 'Connexion',
  'menu.online.waiting': 'En attente de l’adversaire',
  'menu.online.syncing': 'Synchronisation du plateau',
  'menu.online.playing': 'En partie',
  'menu.online.left': 'L’adversaire a quitté',
  'menu.online.error': 'Échec de connexion',
  'menu.onlineRoom': 'Salon {code}',
  'menu.notes.online1':
    'Celui qui crée le salon héberge et commence ; l’adversaire rejoint avec le même code.',
  'menu.notes.online2':
    'Les coups passent d’appareil à appareil par défaut ; si un NAT symétrique ou un réseau d’entreprise les bloque, passez le salon au relais WebSocket.',
  'menu.notes.online3':
    'En ligne, c’est du 1v1 ; la taille choisie par l’hôte décide de la partie.',
  'menu.notes.online4':
    'Si quelqu’un se déconnecte, le salon reste ouvert : revenez avec le même code pour reprendre.',

  'online.host': 'Créer un salon',
  'online.hostNote': 'HÔTE · vous commencez',
  'online.join': 'Rejoindre un salon',
  'online.joinNote': 'REJOINDRE · vous jouez en second',
  'online.codeLabel': 'Code du salon',
  'online.codePlaceholder': 'Entrez un code de 5 lettres',
  'online.joinAction': 'Rejoindre',
  'online.shareLink': 'Lien de partage',
  'online.copyLink': 'Copier le lien',
  'online.copied': 'Copié',
  'online.copyManual': 'Copier manuellement',
  'online.note.idle':
    'Choisissez le mode de connexion, puis créez ou rejoignez un salon. L’hôte commence et le lien contient le code et la méthode.',
  'online.connecting': 'Ouverture de la connexion…',
  'online.cancel': 'Annuler',
  'online.waitingHost': 'Salon créé, en attente de l’adversaire…',
  'online.waitingGuest': 'Connexion à l’hôte, en attente du plateau…',
  'online.note.waitingHost':
    'Envoyez le code ou le lien à votre adversaire ; la partie démarre dès qu’il rejoint.',
  'online.note.waitingGuest':
    'Vérifiez que votre adversaire a créé exactement ce code ; vous entrerez en partie une fois connecté.',
  'online.leave': 'Quitter le salon',
  'online.syncing': 'Connecté, synchronisation du plateau…',
  'online.note.syncing':
    'La partie s’ouvre dès que le plateau arrive de l’hôte. Si rien ne se passe, essayez Resynchroniser.',
  'online.resync': 'Resynchroniser',
  'online.left': 'L’adversaire a quitté',
  'online.note.left':
    'Le salon reste ouvert : votre adversaire peut revenir avec le même code pour reprendre.',
  'online.playing': 'Partie en cours',
  'online.back': 'Retour',
  'online.errorFallback': 'Un problème est survenu. Veuillez réessayer.',

  'online.methodHeading': 'Connexion',
  'online.method.direct': 'Directe',
  'online.method.directNote': 'P2P · la plus rapide',
  'online.method.relay': 'Relais',
  'online.method.relayNote': 'WebSocket · tout réseau',
  'online.method.directHint':
    'Les coups passent directement entre les deux appareils avec la plus faible latence. Un NAT symétrique, les réseaux d’entreprise et certains partages de connexion mobile le bloquent ; en cas d’échec, passez au relais.',
  'online.method.relayHint':
    'Les coups passent par un serveur relais, donc presque tous les réseaux fonctionnent. Latence un peu plus élevée ; le relais est intégré ou le vôtre.',
  'online.relayUrl': 'URL du relais',
  'online.relayUrlPlaceholder': 'wss://relay.example.com/ws',
  'online.relayUrlHint':
    'Utilisez une adresse ws:// ou wss://. Laissez vide pour le relais intégré.',
  'online.usingDirect': 'Connexion : directe (P2P)',
  'online.usingRelay': 'Connexion : relais {host}',

  'online.notice.syncing': 'Connecté, synchronisation du plateau…',
  'online.notice.peerLeft':
    'Votre adversaire a quitté le salon. En attente de son retour…',
  'online.notice.peerLeftWaiting':
    'Votre adversaire est parti, mais le salon reste ouvert : revenez avec le même code pour reprendre.',
  'online.notice.probe':
    'Une nouvelle connexion est arrivée ; vérification si l’adversaire actuel est toujours en ligne…',
  'online.notice.kickedFull':
    'Le salon est plein : le joueur en trop a été invité à partir.',
  'online.notice.syncTimeout':
    'Toujours pas de plateau de l’hôte. Essayez Resynchroniser, ou quittez et revenez avec le même code.',
  'online.notice.resyncing': 'Resynchronisation du plateau…',
  'online.notice.reconnecting': 'Connexion perdue : reconnexion au relais…',

  'online.error.roomFull': 'Salon plein : cette partie 1v1 a déjà commencé.',
  'online.error.invalidCode':
    'Les codes font 5 lettres ou chiffres, par ex. 4K7QP.',
  'online.error.connect':
    'Impossible de rejoindre le salon. Vérifiez votre réseau et réessayez.',
  'online.error.signal':
    'Échec de la signalisation ({detail}). Vérifiez votre réseau et réessayez.',
  'online.error.relay':
    'Impossible d’atteindre le relais ({detail}). Vérifiez l’adresse ou passez en direct.',
  'online.error.relayUrl':
    'L’adresse du relais doit commencer par ws:// ou wss://.',

  'game.mode.online': 'En ligne · {code} · {cols}×{rows}',
  'game.turn.opponentTurn': 'Tour de l’adversaire',
  'game.turn.opponentLeft': 'L’adversaire a quitté',
  'game.turn.waitingOpponent': 'En attente de l’adversaire…',
  'game.aria.onlineRoom': 'Salon en ligne',
  'game.online.hostSeat': 'Hôte · premier',
  'game.online.guestSeat': 'Invité · second',
  'game.online.connecting': 'Connexion à votre adversaire…',
  'game.online.directPath': 'directe',
  'game.online.relayPath': 'relais',

  'board.onlineMeta': '{cols} × {rows} · Salon {code}',
  'board.onlineFooterHost': 'EN LIGNE · l’hôte commence · P2P',
  'board.onlineFooterGuest': 'EN LIGNE · vous jouez en second · P2P',
  'board.onlineFooterHostRelay':
    'EN LIGNE · l’hôte commence · relais WebSocket',
  'board.onlineFooterGuestRelay':
    'EN LIGNE · vous jouez en second · relais WebSocket',

  'result.opponentWins': 'L’adversaire gagne',
  'result.rematchPending': 'Revanche demandée : en attente de l’adversaire.',
  'result.waitingOpponent': 'En attente de l’adversaire',

  /* ---------- Endless ---------- */
  'menu.mode.endless': 'Sans fin',
  'menu.endlessHeading': 'Mode sans fin',
  'menu.endlessRule':
    'L’IA commence toujours. Vos alignements de quatre ne gagnent pas ; bloquez-la et survivez le plus longtemps possible.',
  'menu.endlessBest': {
    one: 'Record : {count} coup',
    other: 'Record : {count} coups',
  },
  'menu.endlessBestNone': 'Record —',
  'menu.endlessScrolls': {
    one: 'Défilé {count} fois',
    other: 'Défilé {count} fois',
  },
  'menu.startEndless': 'Commencer à défendre',
  'menu.notes.endless1':
    'L’IA commence toujours et attaque sans relâche. Vous défendez, et vos propres alignements ne gagnent jamais.',
  'menu.notes.endless2':
    'Quand le plateau se remplit, il monte d’une ligne et la ligne du haut disparaît ; la partie continue.',
  'menu.notes.endless3':
    'La série s’arrête quand l’IA aligne quatre. Votre score est le nombre de coups joués ; le record est enregistré sur cet appareil.',
  'menu.notes.endless4':
    'Sans fin est fixé en Difficile et ne propose que 6×6 et 8×8.',
  'menu.colophonEndless':
    'Touches 1–0 pour poser · R recommencer · pas d’annulation en sans fin',

  'game.mode.endless': 'Sans fin · {cols}×{rows}',
  'game.turn.defend': 'À vous · défendez',
  'game.turn.aiAttacking': 'L’IA attaque…',
  'game.turn.endlessOver': 'Série terminée',
  'game.endlessMoves': {
    one: 'Survécu {count} coup',
    other: 'Survécu {count} coups',
  },
  'game.aria.endlessProgress': 'Progression sans fin',
  'game.endlessNotice.ignoredWin':
    'Ici, les alignements de quatre ne gagnent pas : continuez à bloquer l’IA.',
  'game.endlessNotice.scrolled':
    'Le plateau a monté d’une ligne. Continuez.',
  'game.endlessNotice.winAndScroll':
    'Ici, les alignements de quatre ne gagnent pas : le plateau a monté d’une ligne. Continuez.',

  'board.endlessTitle': 'Défense sans fin',
  'board.endlessMeta': '{cols} × {rows} · Bloquez l’IA',
  'board.endlessFooter':
    'SANS FIN · vos quatre ne gagnent pas · survivez le plus longtemps possible',

  'endless.head': 'SANS FIN · {size}×{size}',
  'endless.aiWins': 'L’IA a aligné quatre',
  'endless.survived': {
    one: 'Vous avez survécu {count} coup',
    other: 'Vous avez survécu {count} coups',
  },
  'endless.scrolls': {
    one: 'Plateau défilé {count} fois',
    other: 'Plateau défilé {count} fois',
  },
  'endless.best': {
    one: 'Record pour cette taille : {count} coup',
    other: 'Record pour cette taille : {count} coups',
  },
  'endless.newBest': 'Nouveau record',
  'endless.again': 'Rejouer',
  'endless.menu': 'Retour au menu',
  'endless.stamp': 'N',
} satisfies Messages;
