import type { Messages } from '../messages';

/** हिन्दी */
export const hi = {
  'app.title': '4Link · चार एक पंक्ति में',
  'app.description':
    '4Link: 6×6 गुरुत्व बोर्ड पर चार जोड़ें। गिराएँ, ढेर लगाएँ और जोड़ें।',
  'app.kicker': 'चार एक पंक्ति में · गुरुत्व बोर्ड · चार जोड़ें',

  'common.settings': 'सेटिंग्स',
  'common.closeSettings': 'सेटिंग्स बंद करें',
  'common.reset': 'रीसेट',
  'common.remove': 'हटाएँ',
  'common.followTheme': 'थीम इस्तेमाल करें',
  'common.themeColor': 'थीम रंग',
  'common.processing': 'प्रोसेस हो रहा है…',

  'menu.modeHeading': 'मैच मोड',
  'menu.mode.pve': 'AI के साथ',
  'menu.mode.pvp': 'लोकल',
  'menu.mode.puzzle': 'पहेलियाँ',
  'menu.mode.tutorial': 'ट्यूटोरियल',
  'menu.tutorialHeading': 'पाठ चुनें',
  'menu.puzzleHeading': 'पहेली चुनें',
  'menu.learned': 'सीखे {done} / {total}',
  'menu.solved': 'हल हुए {done} / {total}',
  'menu.learnedYes': 'सीखा',
  'menu.learnedNo': 'नहीं सीखा',
  'menu.solvedYes': 'हल हुआ',
  'menu.solvedNo': 'हल नहीं हुआ',
  'menu.guidedSteps': {
    one: '{count} निर्देशित चरण',
    other: '{count} निर्देशित चरण',
  },
  'menu.mateIn': '{count} में मात',
  'menu.bestMoves': {
    one: 'सर्वश्रेष्ठ: {count} चाल',
    other: 'सर्वश्रेष्ठ: {count} चालें',
  },
  'menu.playerHeading': 'खिलाड़ी',
  'menu.playerCount': '{count} खिलाड़ी',
  'menu.boardHeading': 'बोर्ड का आकार',
  'menu.connect': '{count} जोड़ें',
  'menu.difficultyHeading': 'कठिनाई',
  'difficulty.easy': 'आसान',
  'difficulty.normal': 'सामान्य',
  'difficulty.hard': 'कठिन',
  'menu.firstHeading': 'पहली चाल',
  'menu.firstMe': 'मैं पहले',
  'menu.firstAi': 'AI पहले',
  'menu.appearanceHeading': 'रूप',
  'menu.skinTheme': '{name} थीम',
  'menu.skinNote': '{name} · पूरी साइट',
  'menu.appearanceMeta': 'थीम, बोर्ड, गोटियों के रंग और चित्र',
  'menu.customPieces': 'कस्टम गोटियाँ',
  'menu.customBackground': 'कस्टम पृष्ठभूमि',
  'menu.customFace': 'कस्टम बोर्ड रंग',
  'menu.handdrawn': 'हाथ से बनी ग्रिड',
  'menu.startMatch': 'मैच शुरू करें',
  'menu.startPuzzle': 'पहेली शुरू करें',
  'menu.startTutorial': 'ट्यूटोरियल शुरू करें',
  'menu.tutorialProgress': 'ट्यूटोरियल प्रगति',
  'menu.allDone': 'सब पूरा',
  'menu.tutorialHint': 'पहले गोटी गिराना सीखें, फिर एक-एक पाठ करें',
  'menu.puzzleProgress': 'पहेली प्रगति',
  'menu.bestNone': 'सर्वश्रेष्ठ —',
  'menu.record': 'आमने-सामने',
  'menu.clearStats': 'साफ़ करें',
  'menu.howToPlay': 'कैसे खेलें',
  'menu.notes.tutorial1':
    'ट्यूटोरियल ठीक-ठीक बताता है कि कहाँ गोटी रखनी है। गलत क्लिक पर गोटी नहीं रखी जाती, इसलिए बेझिझक आज़माएँ।',
  'menu.notes.tutorial2':
    'छह पाठों में गुरुत्व, क्षैतिज, लंबवत और तिरछी पंक्तियाँ, रोकना और जीत की प्राथमिकता सिखाई जाती है।',
  'menu.notes.tutorial3':
    'प्रगति इस डिवाइस पर सहेजी जाती है। आप मौजूदा पाठ कभी भी दोबारा शुरू कर सकते हैं।',
  'menu.notes.puzzle1':
    'हर पहेली एक अधूरी स्थिति है। चालों की सीमा में लक्ष्य संख्या जोड़कर जीतें।',
  'menu.notes.puzzle2':
    'आप हमेशा पहले चलते हैं और AI बचाव करता है। वह हार को जितना हो सके टालता है।',
  'menu.notes.puzzle3':
    'सिर्फ़ आपकी चालें गिनी जाती हैं। कोई ज़बरदस्त जीत हो तो संकेत उसे दिखाते हैं।',
  'menu.notes.puzzle4':
    'हल हुई पहेलियाँ और सर्वश्रेष्ठ स्कोर इस डिवाइस पर सहेजे जाते हैं।',
  'menu.notes.play1':
    'वर्गाकार बोर्ड पर बारी-बारी से कॉलम चुनें। गोटी सबसे नीचे के खाली स्थान तक गिरती है।',
  'menu.notes.play2':
    '2–6 खिलाड़ी एक डिवाइस साझा करते हैं। 3 या अधिक खिलाड़ियों के साथ AI और संकेत उपलब्ध नहीं हैं।',
  'menu.notes.play3':
    '6×6 और 8×8 पर 4 जोड़ें; 12×12 और 16×16 पर 5 जोड़ें।',
  'menu.notes.play4':
    'पहले बीच के कॉलम लें। तिरछी पंक्तियाँ और दोहरी धमकियाँ सबसे ज़्यादा छूटती हैं।',
  'menu.notes.appearance':
    'सेटिंग्स में थीम, गोटियों के रंग और चित्र बदलें। चुनाव इस डिवाइस पर सहेजे जाते हैं।',
  'menu.colophon': 'की 1–0 गिराएँ · ESC पूर्ववत · R पुनः आरंभ',

  'settings.title': 'सेटिंग्स',
  'settings.subtitle':
    'थीम, बोर्ड और गोटियों का रूप। बदलाव तुरंत लागू होते हैं।',
  'settings.languageHeading': 'भाषा',
  'settings.languageNote': 'इंटरफ़ेस / भाषा',
  'settings.languageHint':
    'डिफ़ॉल्ट रूप से ब्राउज़र के अनुसार। मैन्युअल चुनाव इस डिवाइस पर सहेजा जाता है।',
  'settings.themeHeading': 'साइट थीम',
  'settings.themeNote': 'रंग / कागज़ / बोर्ड',
  'settings.scheme.dark': 'गहरा',
  'settings.scheme.light': 'हल्का',
  'settings.piecesHeading': 'गोटियाँ',
  'settings.piecesNote': 'रंग / चित्र',
  'settings.piecesHint':
    'जिन रंगों को आप नहीं बदलते वे थीम के अनुसार रहते हैं। चित्र गोल काटे जाते हैं और इस डिवाइस पर सहेजे जाते हैं।',
  'settings.role.first': 'पहला खिलाड़ी',
  'settings.role.second': 'दूसरा खिलाड़ी',
  'settings.role.player': 'खिलाड़ी {player}',
  'settings.color': 'रंग',
  'settings.pieceColorAria': 'खिलाड़ी {player} की गोटी का रंग',
  'settings.image.upload': 'चित्र अपलोड करें',
  'settings.image.change': 'चित्र बदलें',
  'settings.imageSupport': 'PNG / JPG / WebP, 8 MB तक।',
  'settings.resetPieces': 'सब थीम पर लौटाएँ',
  'settings.boardHeading': 'बोर्ड',
  'settings.boardNote': 'ग्रिड / पृष्ठभूमि',
  'settings.boardHint':
    'ग्रिड शैली सिर्फ़ चित्रण बदलती है, कटान बिंदु या चालें नहीं।',
  'settings.boardStyleAria': 'बोर्ड ग्रिड की शैली',
  'settings.boardStyle.clean': 'साफ़',
  'settings.boardStyle.handdrawn': 'हाथ से बनी',
  'settings.boardStyle.dotted': 'बिंदु',
  'settings.boardStyle.blueprint': 'ब्लूप्रिंट',
  'settings.boardStyle.neon': 'नियॉन',
  'settings.boardStyle.minimal': 'न्यूनतम',
  'settings.boardBackground': 'बोर्ड पृष्ठभूमि',
  'settings.boardImage': 'कस्टम चित्र',
  'settings.boardFace': 'कस्टम रंग',
  'settings.boardFollow': 'थीम रंग इस्तेमाल करें',
  'settings.boardColor': 'रंग',
  'settings.boardColorAria': 'बोर्ड पृष्ठभूमि का रंग',
  'settings.uploadBackground': 'पृष्ठभूमि अपलोड करें',
  'settings.changeBackground': 'पृष्ठभूमि बदलें',
  'settings.veil': 'पृष्ठभूमि पर परदा',
  'settings.boardSupport':
    'PNG / JPG / WebP, 12 MB तक। इस डिवाइस पर सहेजा जाता है।',
  'settings.resetBoard': 'बोर्ड रीसेट करें',
  'settings.saved': 'रूप इस डिवाइस पर सहेजा गया है',
  'settings.done': 'हो गया',
  'settings.errorFallback':
    'चित्र प्रोसेस नहीं हो सका। कृपया फिर से कोशिश करें।',

  'game.backAria': 'मेन्यू पर लौटें',
  'game.settingsAria': 'सेटिंग्स खोलें',
  'game.mode.tutorial': 'ट्यूटोरियल · NO.{no} · {cols}×{rows}',
  'game.mode.puzzle': 'पहेली · NO.{no} · {cols}×{rows}',
  'game.mode.pve': 'AI के साथ · {difficulty} · {cols}×{rows}',
  'game.mode.pvp': 'लोकल · {players} · {cols}×{rows}',
  'game.turn.movesUsed': 'चालें खत्म',
  'game.turn.tutorialDone': 'ट्यूटोरियल पूरा',
  'game.turn.opponentResponding': 'प्रतिद्वंद्वी जवाब दे रहा है…',
  'game.turn.yours': 'आपकी बारी',
  'game.turn.draw': 'बराबरी',
  'game.turn.solved': 'हल हुआ',
  'game.turn.defended': 'बचाव सफल',
  'game.turn.over': 'खेल खत्म',
  'game.turn.aiDefending': 'AI बचाव कर रहा है…',
  'game.turn.aiTurn': 'AI की बारी',
  'game.turn.aiThinking': 'AI सोच रहा है…',
  'game.turn.first': 'पहले खिलाड़ी की बारी',
  'game.turn.second': 'दूसरे खिलाड़ी की बारी',
  'game.turn.player': 'खिलाड़ी {player} की बारी',
  'game.aria.tutorialProgress': 'ट्यूटोरियल प्रगति',
  'game.aria.moveLimit': 'चाल सीमा',
  'game.aria.series': 'सीरीज़ जीत',
  'game.lesson': 'पाठ {no} / {total}',
  'game.complete': 'पूरा',
  'game.step': 'चरण {current} / {total}',
  'game.limitMoves': {
    one: 'सीमा {count} चाल',
    other: 'सीमा {count} चालें',
  },
  'game.usedMoves': 'इस्तेमाल {used} / {limit}',
  'game.draws': 'बराबरी {count}',
  'game.tutorialWrongColumn': 'इस बार कॉलम {col} आज़माएँ।',
  'game.puzzleNoWin':
    'चाल सीमा में कोई ज़बरदस्त जीत नहीं। रीसेट करें या R दबाएँ।',

  'board.defaultTitle': 'चार एक पंक्ति में',
  'board.defaultMeta': '{cols} × {rows} · {win} जोड़ें',
  'board.tutorialTitle': 'ट्यूटोरियल · {title}',
  'board.puzzleTitle': 'पहेली · {title}',
  'board.tutorialMeta': '{size} × {size} · ट्यूटोरियल',
  'board.puzzleMeta': '{size} × {size} · {limit}',
  'board.tutorialFooter': 'ट्यूटोरियल · निर्देशों का पालन करें',
  'board.puzzleFooter': 'पहेली · आप पहले चलते हैं · सीमा में जीतें',
  'board.pointEmpty': 'कॉलम {col}, पंक्ति {row}, खाली',
  'board.pointFirst': 'कॉलम {col}, पंक्ति {row}, पहले खिलाड़ी की गोटी',
  'board.pointSecond': 'कॉलम {col}, पंक्ति {row}, दूसरे खिलाड़ी की गोटी',
  'board.pointPlayer': 'कॉलम {col}, पंक्ति {row}, खिलाड़ी {player} की गोटी',

  'result.draw': 'बराबरी',
  'result.youWin': 'आप जीते',
  'result.aiWins': 'AI जीता',
  'result.firstWins': 'पहला खिलाड़ी जीता',
  'result.secondWins': 'दूसरा खिलाड़ी जीता',
  'result.playerWins': 'खिलाड़ी {player} जीता',
  'result.move': 'चाल {count}',
  'result.boardFull': 'बोर्ड भर गया। किसी ने {win} नहीं जोड़े।',
  'result.line': '{win} एक पंक्ति में',
  'result.again': 'फिर खेलें',
  'result.swap': 'बदलकर फिर खेलें',
  'result.menu': 'मेन्यू पर लौटें',
  'result.stampWin': 'J',
  'result.stampDraw': 'B',

  'puzzle.head': 'पहेली NO.{no}',
  'puzzle.solved': 'पहेली हल हुई',
  'puzzle.exhausted': 'चालें खत्म',
  'puzzle.draw': 'बराबरी',
  'puzzle.defended': 'बचाव हुआ',
  'puzzle.solvedIn': {
    one: '{count} चाल में हल',
    other: '{count} चालों में हल',
  },
  'puzzle.exhaustedDetail': 'चाल सीमा में {win} की पंक्ति नहीं बनी',
  'puzzle.drawDetail': 'बोर्ड भर गया और आप {win} नहीं जोड़ सके',
  'puzzle.defendedDetail': 'AI ने पहले {win} जोड़े',
  'puzzle.hints': {
    one: '{count} संकेत इस्तेमाल',
    other: '{count} संकेत इस्तेमाल',
  },
  'puzzle.next': 'अगली पहेली',
  'puzzle.retrySolved': 'फिर हल करें',
  'puzzle.retry': 'फिर कोशिश करें',
  'puzzle.menu': 'मेन्यू पर लौटें',
  'puzzle.stampSolved': 'S',
  'puzzle.stampFailed': 'X',

  'tutorial.head': 'ट्यूटोरियल NO.{no}',
  'tutorial.nextUnlocked': 'अगला पाठ खुल गया',
  'tutorial.allComplete': 'सब पूरा',
  'tutorial.complete': 'ट्यूटोरियल पूरा',
  'tutorial.nextLesson': 'अगला पाठ: {title}',
  'tutorial.mastered':
    'आपने गोटी गिराना, जोड़ना, रोकना और जीत की प्राथमिकता सीख ली है।',
  'tutorial.next': 'अगला पाठ',
  'tutorial.practice': 'फिर अभ्यास करें',
  'tutorial.menu': 'मेन्यू पर लौटें',
  'tutorial.stamp': '✓',
  'coach.responding': 'प्रतिद्वंद्वी जवाब दे रहा है…',
  'coach.complete': 'पूरा',
  'coach.steps': 'चरण {current} / {total}',

  'controls.undo': 'पूर्ववत',
  'controls.restart': 'पुनः आरंभ',
  'controls.thinking': 'सोच रहा है',
  'controls.hint': 'संकेत',
  'controls.soundOn': 'ध्वनि बंद करें',
  'controls.soundOff': 'ध्वनि चालू करें',

  'language.groupAria': 'इंटरफ़ेस भाषा',
  'language.zhCN': '简体中文',
  'language.zhTW': '繁體中文',
  'language.en': 'English',
  'language.short.zhCN': '简',
  'language.short.zhTW': '繁',
  'language.short.en': 'EN',

  'errors.image.notImage': 'कृपया चित्र फ़ाइल चुनें (PNG / JPG / WebP)',
  'errors.image.tooLarge': 'चित्र {maxMb} MB से कम होना चाहिए',
  'errors.image.unreadable': 'यह चित्र पढ़ा नहीं जा सका',
  'errors.image.invalidSize': 'चित्र का आकार मान्य नहीं है',
  'errors.image.unsupported': 'यह ब्राउज़र चित्र प्रोसेस नहीं कर सकता',
  'errors.image.tooComplex':
    'चित्र बहुत जटिल है। कोई सरल चित्र आज़माएँ।',
  'errors.image.failed':
    'चित्र प्रोसेस नहीं हो सका। कृपया फिर से कोशिश करें।',

  /* ---------- Rotation ---------- */
  'menu.mode.rotation': 'घूर्णन',
  'menu.rotationHeading': 'घूर्णन मोड',
  'menu.rotationRule':
    'हर चाल के बाद बोर्ड 90° दक्षिणावर्त घूमता है और गोटियाँ नई नीचे की ओर गिरती हैं। घूर्णन या गिरने से बनी पंक्ति भी जीत दिलाती है।',
  'menu.rotationVsAi': 'AI के साथ',
  'menu.rotationVsLocal': 'लोकल 2 खिलाड़ी',
  'menu.startRotation': 'घूर्णन मैच शुरू करें',
  'menu.notes.rotation1':
    'हर चाल के बाद बोर्ड 90° दक्षिणावर्त घूमता है और गोटियाँ नई नीचे की दिशा में बैठ जाती हैं।',
  'menu.notes.rotation2':
    'घूर्णन या गिरने के बाद बनी पंक्ति भी जीत दिलाती है — किसी भी खिलाड़ी के लिए।',
  'menu.notes.rotation3':
    'अगर दोनों खिलाड़ी एक साथ पंक्ति बनाएँ, तो जिसने अभी चाल चली है वह जीतता है।',
  'menu.notes.rotation4':
    'अगर चाल से तुरंत जीत हो या बोर्ड भर जाए, तो घूर्णन नहीं होता; खेल तुरंत खत्म होता है।',
  'game.mode.rotation': 'घूर्णन · {cols}×{rows}',
  'game.rotationNotice.rotated': 'बोर्ड 90° दक्षिणावर्त घूम गया',
  'game.rotationTurns': {
    one: '{count} बार घूमा',
    other: '{count} बार घूमा',
  },
  'game.aria.rotationProgress': 'घूर्णन की संख्या',
  'board.rotationTitle': 'घूर्णन मोड',
  'board.rotationMeta': '{cols} × {rows} · हर चाल 90° दक्षिणावर्त',
  'board.rotationFooter': 'ROTATE · हर चाल बोर्ड को 90° दक्षिणावर्त घुमाती है',
  'result.rotations': {
    one: 'बोर्ड {count} बार घूमा',
    other: 'बोर्ड {count} बार घूमा',
  },

  /* ---------- Online ---------- */
  'menu.mode.online': 'ऑनलाइन',
  'menu.onlineHeading': 'ऑनलाइन रूम',
  'menu.onlineBoardHeading': 'बोर्ड का आकार (होस्ट चुनता है)',
  'menu.onlineStatus': 'ऑनलाइन स्थिति',
  'menu.online.idle': 'ऑफ़लाइन',
  'menu.online.connecting': 'जुड़ रहा है',
  'menu.online.waiting': 'प्रतिद्वंद्वी का इंतज़ार',
  'menu.online.syncing': 'बोर्ड सिंक हो रहा है',
  'menu.online.playing': 'खेल में',
  'menu.online.left': 'प्रतिद्वंद्वी चला गया',
  'menu.online.error': 'कनेक्शन विफल',
  'menu.onlineRoom': 'रूम {code}',
  'menu.notes.online1':
    'जो रूम बनाता है वह होस्ट होता है और पहले चलता है; प्रतिद्वंद्वी उसी कोड से जुड़ता है।',
  'menu.notes.online2':
    'चालें डिफ़ॉल्ट रूप से डिवाइस-से-डिवाइस जाती हैं; अगर सिमेट्रिक NAT या कॉर्पोरेट नेटवर्क रोकें, तो रूम को WebSocket रिले पर बदलें।',
  'menu.notes.online3':
    'ऑनलाइन 1v1 है; होस्ट द्वारा चुना बोर्ड आकार इस खेल को तय करता है।',
  'menu.notes.online4':
    'अगर कोई कट जाए, रूम खुला रहता है — उसी कोड से फिर जुड़कर खेल जारी रखें।',

  'online.host': 'रूम बनाएँ',
  'online.hostNote': 'होस्ट · आप पहले चलते हैं',
  'online.join': 'रूम में जुड़ें',
  'online.joinNote': 'जुड़ें · आप दूसरे चलते हैं',
  'online.codeLabel': 'रूम कोड',
  'online.codePlaceholder': '5 अक्षरों का कोड डालें',
  'online.joinAction': 'जुड़ें',
  'online.shareLink': 'लिंक साझा करें',
  'online.copyLink': 'लिंक कॉपी करें',
  'online.copied': 'कॉपी हो गया',
  'online.copyManual': 'मैन्युअल कॉपी',
  'online.note.idle':
    'कनेक्शन तरीका चुनें, फिर रूम बनाएँ या जुड़ें। होस्ट पहले चलता है और साझा लिंक में कोड और तरीका दोनों होते हैं।',
  'online.connecting': 'कनेक्शन खुल रहा है…',
  'online.cancel': 'रद्द करें',
  'online.waitingHost': 'रूम बना, प्रतिद्वंद्वी का इंतज़ार…',
  'online.waitingGuest': 'होस्ट से जुड़ रहे हैं, बोर्ड का इंतज़ार…',
  'online.note.waitingHost':
    'रूम कोड या लिंक प्रतिद्वंद्वी को भेजें; वह जुड़ते ही खेल शुरू होगा।',
  'online.note.waitingGuest':
    'देखें कि प्रतिद्वंद्वी ने ठीक यही कोड बनाया है; जुड़ते ही आप खेल में आ जाएँगे।',
  'online.leave': 'रूम छोड़ें',
  'online.syncing': 'जुड़ गए, बोर्ड सिंक हो रहा है…',
  'online.note.syncing':
    'होस्ट से बोर्ड आते ही खेल खुलेगा। कुछ न हो तो फिर से सिंक करें।',
  'online.resync': 'फिर सिंक करें',
  'online.left': 'प्रतिद्वंद्वी चला गया',
  'online.note.left':
    'रूम अभी खुला है — प्रतिद्वंद्वी उसी कोड से लौटकर खेल जारी रख सकता है।',
  'online.playing': 'खेल चल रहा है',
  'online.back': 'वापस',
  'online.errorFallback': 'कुछ गड़बड़ हुई। कृपया फिर कोशिश करें।',

  'online.methodHeading': 'कनेक्शन',
  'online.method.direct': 'सीधा',
  'online.method.directNote': 'P2P · सबसे तेज़',
  'online.method.relay': 'रिले',
  'online.method.relayNote': 'WebSocket · किसी भी नेटवर्क पर',
  'online.method.directHint':
    'चालें दोनों डिवाइसों के बीच सीधे जाती हैं, इसलिए देरी सबसे कम होती है। सिमेट्रिक NAT, कॉर्पोरेट नेटवर्क और कुछ मोबाइल हॉटस्पॉट इसे रोकते हैं — विफल होने पर रिले पर बदलें।',
  'online.method.relayHint':
    'चालें रिले सर्वर से होकर जाती हैं, इसलिए लगभग हर नेटवर्क काम करता है। देरी थोड़ी बढ़ती है; रिले अंदरूनी या आपका अपना हो सकता है।',
  'online.relayUrl': 'रिले URL',
  'online.relayUrlPlaceholder': 'wss://relay.example.com/ws',
  'online.relayUrlHint':
    'ws:// या wss:// पता इस्तेमाल करें। अंदरूनी रिले के लिए खाली छोड़ें।',
  'online.usingDirect': 'कनेक्शन: सीधा (P2P)',
  'online.usingRelay': 'कनेक्शन: रिले {host}',

  'online.notice.syncing': 'जुड़ गए, बोर्ड सिंक हो रहा है…',
  'online.notice.peerLeft':
    'आपका प्रतिद्वंद्वी रूम छोड़ गया। उसके लौटने का इंतज़ार…',
  'online.notice.peerLeftWaiting':
    'प्रतिद्वंद्वी चला गया, लेकिन रूम खुला है: उसी कोड से फिर जुड़कर खेल जारी रखें।',
  'online.notice.probe':
    'नया कनेक्शन आया है; देख रहे हैं कि मौजूदा प्रतिद्वंद्वी अभी ऑनलाइन है या नहीं…',
  'online.notice.kickedFull':
    'रूम भर गया — अतिरिक्त खिलाड़ी को जाने के लिए कहा गया।',
  'online.notice.syncTimeout':
    'होस्ट से बोर्ड अभी नहीं आया। फिर सिंक करें, या रूम छोड़कर उसी कोड से फिर जुड़ें।',
  'online.notice.resyncing': 'बोर्ड फिर सिंक हो रहा है…',
  'online.notice.reconnecting':
    'कनेक्शन टूटा — रिले से फिर जुड़ रहे हैं…',

  'online.error.roomFull': 'रूम भरा है: यह 1v1 खेल पहले ही शुरू हो चुका है।',
  'online.error.invalidCode':
    'रूम कोड 5 अक्षर या अंक होते हैं, जैसे 4K7QP।',
  'online.error.connect':
    'रूम में नहीं जुड़ सके। अपना नेटवर्क जाँचें और फिर कोशिश करें।',
  'online.error.signal':
    'सिग्नलिंग विफल ({detail})। नेटवर्क जाँचें और फिर कोशिश करें।',
  'online.error.relay':
    'रिले तक नहीं पहुँचे ({detail})। पता जाँचें या सीधे कनेक्शन पर बदलें।',
  'online.error.relayUrl':
    'रिले पता ws:// या wss:// से शुरू होना चाहिए।',

  'game.mode.online': 'ऑनलाइन · {code} · {cols}×{rows}',
  'game.turn.opponentTurn': 'प्रतिद्वंद्वी की बारी',
  'game.turn.opponentLeft': 'प्रतिद्वंद्वी चला गया',
  'game.turn.waitingOpponent': 'प्रतिद्वंद्वी का इंतज़ार…',
  'game.aria.onlineRoom': 'ऑनलाइन रूम',
  'game.online.hostSeat': 'होस्ट · पहला',
  'game.online.guestSeat': 'मेहमान · दूसरा',
  'game.online.connecting': 'प्रतिद्वंद्वी से जुड़ रहे हैं…',
  'game.online.directPath': 'सीधा',
  'game.online.relayPath': 'रिले',

  'board.onlineMeta': '{cols} × {rows} · रूम {code}',
  'board.onlineFooterHost': 'ऑनलाइन · होस्ट पहले · P2P',
  'board.onlineFooterGuest': 'ऑनलाइन · आप दूसरे · P2P',
  'board.onlineFooterHostRelay': 'ऑनलाइन · होस्ट पहले · WebSocket रिले',
  'board.onlineFooterGuestRelay': 'ऑनलाइन · आप दूसरे · WebSocket रिले',

  'result.opponentWins': 'प्रतिद्वंद्वी जीता',
  'result.rematchPending': 'रीमैच माँगा — प्रतिद्वंद्वी का इंतज़ार।',
  'result.waitingOpponent': 'प्रतिद्वंद्वी का इंतज़ार',

  /* ---------- Endless ---------- */
  'menu.mode.endless': 'अंतहीन',
  'menu.endlessHeading': 'अंतहीन मोड',
  'menu.endlessRule':
    'AI हमेशा पहले चलता है। आपके चार जीत नहीं देते; उसे रोकें और जितना हो सके टिकें।',
  'menu.endlessBest': {
    one: 'सर्वश्रेष्ठ: {count} चाल',
    other: 'सर्वश्रेष्ठ: {count} चालें',
  },
  'menu.endlessBestNone': 'सर्वश्रेष्ठ —',
  'menu.endlessScrolls': {
    one: '{count} बार स्क्रॉल',
    other: '{count} बार स्क्रॉल',
  },
  'menu.startEndless': 'बचाव शुरू करें',
  'menu.notes.endless1':
    'AI हमेशा पहले चलता है और लगातार हमला करता है। आप बचाव करते हैं, और आपके चार कभी जीत नहीं देते।',
  'menu.notes.endless2':
    'बोर्ड भरने पर वह एक पंक्ति ऊपर स्क्रॉल होता है और ऊपर की पंक्ति निकल जाती है; खेल जारी रहता है।',
  'menu.notes.endless3':
    'जब AI चार जोड़ देता है तो दौर खत्म होता है। आपका स्कोर आपकी चालों की संख्या है; सर्वश्रेष्ठ इस डिवाइस पर सहेजा जाता है।',
  'menu.notes.endless4':
    'अंतहीन मोड कठिन पर तय है और केवल 6×6 और 8×8 देता है।',
  'menu.colophonEndless':
    'की 1–0 गिराएँ · R पुनः आरंभ · अंतहीन में पूर्ववत नहीं',

  'game.mode.endless': 'अंतहीन · {cols}×{rows}',
  'game.turn.defend': 'आपकी बारी · बचाव करें',
  'game.turn.aiAttacking': 'AI हमला कर रहा है…',
  'game.turn.endlessOver': 'दौर खत्म',
  'game.endlessMoves': {
    one: '{count} चाल टिके',
    other: '{count} चालें टिके',
  },
  'game.aria.endlessProgress': 'अंतहीन प्रगति',
  'game.endlessNotice.ignoredWin':
    'यहाँ चार जीत नहीं देते — AI को रोकते रहें।',
  'game.endlessNotice.scrolled':
    'बोर्ड एक पंक्ति ऊपर स्क्रॉल हुआ। जारी रखें।',
  'game.endlessNotice.winAndScroll':
    'यहाँ चार जीत नहीं देते — बोर्ड एक पंक्ति ऊपर स्क्रॉल हुआ। जारी रखें।',

  'board.endlessTitle': 'अंतहीन बचाव',
  'board.endlessMeta': '{cols} × {rows} · AI को रोकें',
  'board.endlessFooter':
    'अंतहीन · आपके चार जीत नहीं देते · जितना हो सके टिकें',

  'endless.head': 'अंतहीन · {size}×{size}',
  'endless.aiWins': 'AI ने चार जोड़े',
  'endless.survived': {
    one: 'आप {count} चाल टिके',
    other: 'आप {count} चालें टिके',
  },
  'endless.scrolls': {
    one: 'बोर्ड {count} बार स्क्रॉल हुआ',
    other: 'बोर्ड {count} बार स्क्रॉल हुआ',
  },
  'endless.best': {
    one: 'इस आकार का सर्वश्रेष्ठ: {count} चाल',
    other: 'इस आकार का सर्वश्रेष्ठ: {count} चालें',
  },
  'endless.newBest': 'नया सर्वश्रेष्ठ',
  'endless.again': 'फिर खेलें',
  'endless.menu': 'मेन्यू पर लौटें',
  'endless.stamp': 'B',
} satisfies Messages;
