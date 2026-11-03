/**
 * 新手教程：用短关卡逐步介绍重力、横 / 竖 / 斜线、封堵和胜负优先级。
 *
 * 每一步都要求玩家落在指定列；走对后可以自动播放一步对手应手。
 * 和残局不同，教程不依赖求解器，盘面与步骤都是人工编排的。
 */

import { lt, type LocalizedText } from '../i18n';
import {
  createPositionState,
  type PositionDefinition,
} from './puzzle';
import type { GameState } from './rules';

export interface TutorialStep {
  /** 玩家必须点击的列 */
  readonly expect: number;
  /** 玩家走对后自动播放的对手落子列 */
  readonly reply?: number;
  /** 当前步骤的指导语 */
  readonly prompt: LocalizedText;
}

export interface TutorialLesson extends PositionDefinition {
  readonly no: number;
  readonly title: LocalizedText;
  readonly goal: LocalizedText;
  readonly tip: LocalizedText;
  /** 完成后的提示语 */
  readonly done: LocalizedText;
  /** 以连成目标数结束，还是走完全部步骤即结束 */
  readonly finish: 'win' | 'steps';
  readonly steps: readonly TutorialStep[];
}

export const TUTORIALS: readonly TutorialLesson[] = [
  {
    id: 'gravity',
    no: 1,
    title: lt('落子与重力', '落子與重力', 'Drop and gravity', '石を落とすと重力', 'Soltar y gravedad', 'Chute et gravité', 'Setzen und Schwerkraft', 'Ход и гравитация', 'गोटी गिराना और गुरुत्व', 'الإفلات والجذب'),
    goal: lt('把棋子放进井底，理解重力与叠子。', '把棋子放進井底，理解重力與疊子。', 'Drop a stone to the bottom and learn how gravity and stacking work.', '石を一番下まで落として、重力と積み重なりを学びます。', 'Suelta una ficha hasta el fondo y aprende cómo funcionan la gravedad y el apilado.', 'Lâchez un pion au fond et découvrez la gravité et l’empilement.', 'Lass einen Stein bis zum Grund fallen und lerne Schwerkraft und Stapeln kennen.', 'Бросьте камень на дно и узнайте, как работают гравитация и стопки.', 'गोटी को तल तक गिराएँ और गुरुत्व व ढेर लगने को समझें।', 'أفلِت حجرًا إلى القاع وتعلّم كيف يعمل الجذب والتكديس.'),
    tip: lt('列标 A–F 在棋盘上方；棋子永远落在该列最高的空位上。', '欄標 A–F 在棋盤上方；棋子永遠落在該欄最低的空位上。', 'Column labels A–F sit above the board. A stone always lands on the lowest empty point in its column.', '列ラベル A–F は盤の上にあります。石はその列の一番低い空きマスまで落ちます。', 'Las etiquetas A–F están sobre el tablero. La ficha siempre cae en el punto vacío más bajo de su columna.', 'Les étiquettes A–F sont au-dessus du plateau. Un pion tombe toujours sur le point libre le plus bas de sa colonne.', 'Die Spaltenlabels A–F stehen über dem Brett. Ein Stein fällt immer auf den tiefsten freien Punkt seiner Spalte.', 'Метки A–F находятся над полем. Камень всегда падает на самое нижнее свободное место в столбце.', 'कॉलम लेबल A–F बोर्ड के ऊपर हैं। गोटी हमेशा अपने कॉलम के सबसे निचले खाली स्थान पर गिरती है।', 'تسميات الأعمدة A–F فوق اللوح. يسقط الحجر دائمًا في أدنى نقطة فارغة في عموده.'),
    done: lt('你已经学会选列落子。棋子会一直落到该列最底部。', '你已經學會選欄落子。棋子會一直落到該欄最底部。', 'You can now choose a column. The stone falls all the way to the bottom.', '列を選んで石を落とせるようになりました。石はその列の一番下まで落ちます。', 'Ya sabes elegir una columna. La ficha cae hasta el fondo.', 'Vous savez maintenant choisir une colonne. Le pion tombe jusqu’au fond.', 'Du kannst jetzt eine Spalte wählen. Der Stein fällt bis zum Grund.', 'Теперь вы умеете выбирать столбец. Камень падает до самого низа.', 'अब आप कॉलम चुनकर गोटी गिरा सकते हैं। गोटी तल तक जाती है।', 'يمكنك الآن اختيار عمود وإفلات حجر. يسقط الحجر إلى القاع.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'steps',
    rows: ['......', '......', '......', '......', '......', '......'],
    steps: [
      {
        expect: 2,
        reply: 2,
        prompt: lt('点击 C 列，让棋子落到最底部。', '點擊 C 欄，讓棋子落到最底部。', 'Click column C to drop a stone to the bottom.', 'C 列をクリックして、石を一番下まで落とします。', 'Haz clic en la columna C para soltar una ficha hasta el fondo.', 'Cliquez sur la colonne C pour lâcher un pion jusqu’au fond.', 'Klicke auf Spalte C, um einen Stein bis zum Grund fallen zu lassen.', 'Нажмите на столбец C, чтобы бросить камень на дно.', 'कॉलम C पर क्लिक करके गोटी को तल तक गिराएँ।', 'انقر على العمود C لإفلات حجر إلى القاع.'),
      },
      {
        expect: 2,
        prompt: lt('再点一次 C 列，看棋子如何叠在上一步的棋子上。', '再點一次 C 欄，看棋子如何疊在上一步的棋子上。', 'Click column C again and see it stack on the previous stone.', 'もう一度 C 列をクリックして、前の石の上に積み重なるのを見ましょう。', 'Haz clic otra vez en C y verás cómo se apila sobre la ficha anterior.', 'Cliquez encore sur C et voyez-le s’empiler sur le pion précédent.', 'Klicke erneut auf C und sieh, wie er auf dem vorherigen Stein stapelt.', 'Нажмите C ещё раз — камень ляжет на предыдущий.', 'फिर C पर क्लिक करें और देखें कि गोटी पिछली गोटी पर कैसे चढ़ती है।', 'انقر على C مرة أخرى لترى الحجر يتراكم فوق الحجر السابق.'),
      },
    ],
  },
  {
    id: 'horizontal',
    no: 2,
    title: lt('横向四连', '橫向四連', 'Horizontal four', '横の四連', 'Cuatro horizontal', 'Quatre horizontal', 'Waagerechte Vier', 'Горизонтальная четвёрка', 'क्षैतिज चौकड़ी', 'أربعة أفقية'),
    goal: lt('横着连成四子。', '橫著連成四子。', 'Connect four stones horizontally.', '横に四つ並べます。', 'Conecta cuatro fichas en horizontal.', 'Alignez quatre pions horizontalement.', 'Verbinde vier Steine waagerecht.', 'Соберите четыре камня по горизонтали.', 'चार गोटियाँ क्षैतिज जोड़ें।', 'صِل أربعة أحجار أفقيًا.'),
    tip: lt('横线是最直观的胜利线，先数清缺口在哪一列。', '橫線是最直觀的勝利線，先數清缺口在哪一欄。', 'A horizontal line is the easiest to spot. First find which column has the gap.', '横線は一番わかりやすい勝利線です。まずどの列にすき間があるか数えましょう。', 'La línea horizontal es la más fácil de ver. Primero encuentra qué columna tiene el hueco.', 'La ligne horizontale est la plus facile à repérer. Trouvez d’abord la colonne du trou.', 'Eine waagerechte Linie ist am leichtesten zu sehen. Finde zuerst die Spalte mit der Lücke.', 'Горизонталь заметнее всего. Сначала найдите столбец с пробелом.', 'क्षैतिज पंक्ति सबसे आसानी से दिखती है। पहले वह कॉलम ढूँढें जिसमें खाली स्थान है।', 'الصف الأفقي أسهل رؤية. ابحث أولًا عن العمود الذي فيه الفراغ.'),
    done: lt('底行四子连成一条横线。', '底行四子連成一條橫線。', 'Four stones form a horizontal line on the bottom row.', '底行に四つ並び、横線が完成しました。', 'Cuatro fichas forman una línea horizontal en la fila inferior.', 'Quatre pions forment une ligne horizontale sur la rangée du bas.', 'Vier Steine bilden eine waagerechte Linie in der unteren Reihe.', 'Четыре камня образовали горизонтальную линию в нижнем ряду.', 'निचली पंक्ति में चार गोटियाँ क्षैतिज पंक्ति बनाती हैं।', 'تشكّل أربعة أحجار صفًا أفقيًا في الصف السفلي.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', '......', '......', '.....O', 'XXX.OO'],
    steps: [
      {
        expect: 3,
        prompt: lt('底行已有三枚先手棋子，点击 D 列补上第四枚。', '底行已有三枚先手棋子，點擊 D 欄補上第四枚。', 'Three first-player stones are on the bottom row. Click D to add the fourth.', '底行に先手の石が三つあります。D をクリックして四つ目を足します。', 'Hay tres fichas del primer jugador en la fila inferior. Haz clic en D para añadir la cuarta.', 'Trois pions du premier joueur sont sur la rangée du bas. Cliquez sur D pour ajouter le quatrième.', 'Drei Steine des ersten Spielers liegen in der unteren Reihe. Klicke auf D für den vierten.', 'В нижнем ряду три камня первого игрока. Нажмите D, чтобы добавить четвёртый.', 'निचली पंक्ति में पहले खिलाड़ी की तीन गोटियाँ हैं। चौथी जोड़ने के लिए D पर क्लिक करें।', 'ثلاثة أحجار للاعب الأول في الصف السفلي. انقر على D لإضافة الرابع.'),
      },
    ],
  },
  {
    id: 'vertical',
    no: 3,
    title: lt('竖向四连', '豎向四連', 'Vertical four', '縦の四連', 'Cuatro vertical', 'Quatre vertical', 'Senkrechte Vier', 'Вертикальная четвёрка', 'लंबवत चौकड़ी', 'أربعة عمودية'),
    goal: lt('竖着连成四子。', '豎著連成四子。', 'Connect four stones vertically.', '縦に四つ並べます。', 'Conecta cuatro fichas en vertical.', 'Alignez quatre pions verticalement.', 'Verbinde vier Steine senkrecht.', 'Соберите четыре камня по вертикали.', 'चार गोटियाँ लंबवत जोड़ें।', 'صِل أربعة أحجار عموديًا.'),
    tip: lt('同一列可以不断叠高，竖向四连同样有效。', '同一欄可以不斷疊高，豎向四連同樣有效。', 'A column can keep stacking, and vertical fours count too.', '同じ列に積み上げられ、縦の四連も有効です。', 'Una columna puede crecer y los cuatros verticales también cuentan.', 'Une colonne peut s’empiler, et les quatre verticaux comptent aussi.', 'Eine Spalte kann wachsen, und senkrechte Vieren zählen auch.', 'Столбец может расти, и вертикальные четвёрки тоже считаются.', 'एक कॉलम ऊपर बढ़ सकता है, और लंबवत चौकड़ी भी मान्य है।', 'يمكن للعمود أن يطول، والأربعة العمودية تُحتسب أيضًا.'),
    done: lt('C 列叠成四层，竖向连线成立。', 'C 欄疊成四層，豎向連線成立。', 'Column C is four high and the vertical line is complete.', 'C 列が四段に積み上がり、縦線が完成しました。', 'La columna C tiene cuatro y la línea vertical está completa.', 'La colonne C est haute de quatre et la ligne verticale est complète.', 'Spalte C ist vier hoch und die senkrechte Linie ist vollständig.', 'В столбце C четыре камня — вертикальная линия готова.', 'कॉलम C में चार गोटियाँ हैं और लंबवत पंक्ति पूरी है।', 'العمود C فيه أربعة والصف العمودي مكتمل.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', '......', '..X...', '..X.O.', '..X.OO'],
    steps: [
      {
        expect: 2,
        prompt: lt('C 列已有三枚先手棋子，点击 C 列把它补到四层。', 'C 欄已有三枚先手棋子，點擊 C 欄把它補到四層。', 'Column C already has three. Click C to make it four.', 'C 列には先手の石が三つあります。C をクリックして四段にします。', 'La columna C ya tiene tres. Haz clic en C para hacer cuatro.', 'La colonne C en a déjà trois. Cliquez sur C pour en faire quatre.', 'Spalte C hat schon drei. Klicke auf C, um vier daraus zu machen.', 'В столбец C уже три камня. Нажмите C, чтобы стало четыре.', 'कॉलम C में पहले से तीन हैं। चार करने के लिए C पर क्लिक करें।', 'العمود C فيه ثلاثة بالفعل. انقر على C ليصبح أربعة.'),
      },
    ],
  },
  {
    id: 'diagonal',
    no: 4,
    title: lt('斜线四连', '斜線四連', 'Diagonal four', '斜めの四連', 'Cuatro diagonal', 'Quatre diagonal', 'Diagonale Vier', 'Диагональная четвёрка', 'तिरछी चौकड़ी', 'أربعة قطرية'),
    goal: lt('斜着连成四子，同时封住对手。', '斜著連成四子，同時封住對手。', 'Connect four diagonally while blocking the opponent.', '斜めに四つ並べ、同時に相手を封じます。', 'Conecta cuatro en diagonal mientras bloqueas al rival.', 'Alignez quatre en diagonale tout en bloquant l’adversaire.', 'Verbinde vier diagonal und blocke dabei den Gegner.', 'Соберите четыре по диагонали и одновременно заблокируйте соперника.', 'तिरछे चार जोड़ें और साथ में प्रतिद्वंद्वी को रोकें।', 'صِل أربعة قطريًا مع صدّ الخصم.'),
    tip: lt('斜线穿过多个列，落点必须正好补齐缺口。', '斜線穿過多個欄，落點必須正好補齊缺口。', 'A diagonal crosses several columns, so the drop must fill the exact gap.', '斜めの線は複数の列をまたぐので、落とす場所がすき間と正確に合う必要があります。', 'Una diagonal cruza varias columnas, así que la ficha debe rellenar el hueco exacto.', 'Une diagonale traverse plusieurs colonnes : le pion doit combler le trou exact.', 'Eine Diagonale kreuzt mehrere Spalten; der Stein muss genau die Lücke füllen.', 'Диагональ проходит через несколько столбцов, поэтому камень должен попасть точно в пробел.', 'तिरछी पंक्ति कई कॉलम पार करती है, इसलिए गोटी ठीक खाली स्थान भरनी चाहिए।', 'يمر القطر عبر عدة أعمدة، لذا يجب أن يملأ الحجر الفراغ بدقة.'),
    done: lt(
      '斜线补齐的同时，也挡住了对手的竖三。',
      '斜線補齊的同時，也擋住了對手的豎三。',
      "The diagonal is complete, and the opponent's vertical three is blocked.",
      '斜めを完成させながら、相手の縦三も止めました。',
      'La diagonal está completa y el tres vertical del rival está bloqueado.',
      'La diagonale est complète et le trois vertical de l’adversaire est bloqué.',
      'Die Diagonale ist vollständig und die senkrechte Drei des Gegners blockiert.',
      'Диагональ собрана, а вертикальная тройка соперника заблокирована.',
      'तिरछी पंक्ति पूरी हुई और प्रतिद्वंद्वी की लंबवत तीन भी रुक गई।',
      'اكتمل القطر وصُدّت ثلاثية الخصم العمودية.',
    ),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', 'X.....', 'OX....', 'OOX...', 'OOO.X.'],
    steps: [
      {
        expect: 3,
        prompt: lt('先手三子已经排成斜线，点击 D 列补齐缺口。', '先手三子已經排成斜線，點擊 D 欄補齊缺口。', 'Three first-player stones already form a diagonal. Click D to fill the gap.', '先手の三石がすでに斜めに並んでいます。D をクリックしてすき間を埋めます。', 'Tres fichas del primer jugador ya forman una diagonal. Haz clic en D para llenar el hueco.', 'Trois pions du premier joueur forment déjà une diagonale. Cliquez sur D pour combler le trou.', 'Drei Steine des ersten Spielers bilden bereits eine Diagonale. Klicke auf D, um die Lücke zu füllen.', 'Три камня первого игрока уже образуют диагональ. Нажмите D, чтобы заполнить пробел.', 'पहले खिलाड़ी की तीन गोटियाँ पहले से तिरछी पंक्ति बनाती हैं। खाली स्थान भरने के लिए D पर क्लिक करें।', 'ثلاثة أحجار للاعب الأول تشكّل قطرًا بالفعل. انقر على D لملء الفراغ.'),
      },
    ],
  },
  {
    id: 'block',
    no: 5,
    title: lt('挡住对手', '擋住對手', 'Block the opponent', '相手を止める', 'Bloquea al rival', 'Bloquez l’adversaire', 'Blocke den Gegner', 'Заблокируйте соперника', 'प्रतिद्वंद्वी को रोकें', 'اصدّ الخصم'),
    goal: lt('在对手下一手成线前封住缺口。', '在對手下一手成線前封住缺口。', 'Block the gap before the opponent connects on the next move.', '相手が次の一手でつなぐ前に、すき間を埋めます。', 'Bloquea el hueco antes de que el rival conecte en la jugada siguiente.', 'Bloquez le trou avant que l’adversaire ne relie au coup suivant.', 'Blocke die Lücke, bevor der Gegner im nächsten Zug verbindet.', 'Закройте пробел до того, как соперник соберёт линию следующим ходом.', 'प्रतिद्वंद्वी की अगली चाल से पहले खाली स्थान रोकें।', 'اصدّ الفراغ قبل أن يصل الخصم في النقلة التالية.'),
    tip: lt('对手有三子时，先看它的缺口是否还能落子。', '對手有三子時，先看它的缺口是否還能落子。', 'When the opponent has three, check whether the gap is still playable.', '相手に三つ並んだら、そのすき間がまだ打てるか確認します。', 'Cuando el rival tiene tres, comprueba si el hueco sigue siendo jugable.', 'Quand l’adversaire en a trois, vérifiez si le trou est encore jouable.', 'Wenn der Gegner drei hat, prüfe, ob die Lücke noch spielbar ist.', 'Если у соперника три, проверьте, доступен ли ещё пробел.', 'जब प्रतिद्वंद्वी के पास तीन हों, देखें कि खाली स्थान अभी खेलने योग्य है या नहीं।', 'عندما يملك الخصم ثلاثة، تحقق مما إذا كان الفراغ ما زال قابلًا للعب.'),
    done: lt('底行的缺口已经封住，对手无法一手成线。', '底行的缺口已經封住，對手無法一手成線。', 'The bottom-row gap is blocked; the opponent cannot win in one move.', '底行のすき間を埋めたので、相手は一手では勝てません。', 'El hueco de la fila inferior está bloqueado; el rival no puede ganar en una jugada.', 'Le trou de la rangée du bas est bloqué ; l’adversaire ne peut pas gagner en un coup.', 'Die Lücke in der unteren Reihe ist blockiert; der Gegner kann nicht in einem Zug gewinnen.', 'Пробел в нижнем ряду закрыт; соперник не может победить одним ходом.', 'निचली पंक्ति का खाली स्थान रुक गया; प्रतिद्वंद्वी एक चाल में नहीं जीत सकता।', 'فراغ الصف السفلي مسدود؛ لا يمكن للخصم الفوز بنقلة واحدة.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'steps',
    rows: ['......', '......', '......', '......', '....X.', 'OOO.XX'],
    steps: [
      {
        expect: 3,
        prompt: lt('对手底行已经三连，点击 D 列封住缺口。', '對手底行已經三連，點擊 D 欄封住缺口。', 'The opponent has three on the bottom row. Click D to block the gap.', '相手は底行に三つ並んでいます。D をクリックしてすき間を埋めます。', 'El rival tiene tres en la fila inferior. Haz clic en D para bloquear el hueco.', 'L’adversaire a trois sur la rangée du bas. Cliquez sur D pour bloquer le trou.', 'Der Gegner hat drei in der unteren Reihe. Klicke auf D, um die Lücke zu blocken.', 'У соперника три в нижнем ряду. Нажмите D, чтобы закрыть пробел.', 'प्रतिद्वंद्वी की निचली पंक्ति में तीन हैं। खाली स्थान रोकने के लिए D पर क्लिक करें।', 'لدى الخصم ثلاثة في الصف السفلي. انقر على D لصدّ الفراغ.'),
      },
    ],
  },
  {
    id: 'win-first',
    no: 6,
    title: lt('先赢再挡', '先贏再擋', 'Win before you block', '勝てるなら先に勝つ', 'Gana antes de bloquear', 'Gagnez avant de bloquer', 'Erst gewinnen, dann blocken', 'Сначала победа, потом блок', 'पहले जीतें, फिर रोकें', 'افز أولًا ثم اصدّ'),
    goal: lt('在对手的威胁面前，优先完成自己的胜利。', '在對手的威脅面前，優先完成自己的勝利。', 'When the opponent threatens, finish your own win first.', '相手に脅威があっても、まず自分の勝利を完成させます。', 'Cuando el rival amenaza, completa primero tu propia victoria.', 'Quand l’adversaire menace, terminez d’abord votre propre victoire.', 'Wenn der Gegner droht, vollende zuerst deinen eigenen Sieg.', 'Когда соперник угрожает, сначала завершите свою победу.', 'जब प्रतिद्वंद्वी धमकी दे, पहले अपनी जीत पूरी करें।', 'عندما يهدد الخصم، أكمل فوزك أنت أولًا.'),
    tip: lt('能赢就先赢；挡棋只在没有胜着时才考虑。', '能贏就先贏；擋棋只在沒有勝著時才考慮。', 'If you can win, win. Only block when you have no winning move.', '勝てるなら勝ちましょう。ブロックは勝ち手がないときだけ考えます。', 'Si puedes ganar, gana. Solo bloquea cuando no tengas jugada ganadora.', 'Si vous pouvez gagner, gagnez. Ne bloquez que sans coup gagnant.', 'Wenn du gewinnen kannst, gewinne. Blocke nur ohne Gewinnzug.', 'Если можете победить — побеждайте. Блокируйте только без победного хода.', 'अगर जीत सकते हैं तो जीतें। रोकें केवल तब जब जीत की चाल न हो।', 'إن أمكنك الفوز فافز. اصدّ فقط عندما لا تملك نقلة فائزة.'),
    done: lt('你抢在对手之前完成了自己的四连。', '你搶在對手之前完成了自己的四連。', 'You completed your four before the opponent could.', '相手より先に自分の四連を完成させました。', 'Completaste tu cuatro antes que el rival.', 'Vous avez complété votre quatre avant l’adversaire.', 'Du hast deine Vier vor dem Gegner vollendet.', 'Вы собрали четвёрку раньше соперника.', 'आपने प्रतिद्वंद्वी से पहले अपनी चौकड़ी पूरी की।', 'أكملت أربعتك قبل الخصم.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', '......', '.....O', '.....O', 'XXX..O'],
    steps: [
      {
        expect: 3,
        prompt: lt('你的胜利点在 D 列；对手也有竖三，但先完成自己的连线。', '你的勝利點在 D 欄；對手也有豎三，但先完成自己的連線。', 'Your winning point is column D. The opponent also has a vertical three, but finish your own line first.', 'あなたの勝ち点は D 列です。相手にも縦三がありますが、自分の線を先に完成させます。', 'Tu punto ganador es la columna D. El rival también tiene un tres vertical, pero completa tu línea primero.', 'Votre point gagnant est la colonne D. L’adversaire a aussi un trois vertical, mais terminez d’abord votre ligne.', 'Dein Gewinnpunkt ist Spalte D. Der Gegner hat auch eine senkrechte Drei, aber vollende zuerst deine Linie.', 'Ваша победная точка — столбец D. У соперника тоже вертикальная тройка, но сначала завершите свою линию.', 'आपका जीत का स्थान कॉलम D है। प्रतिद्वंद्वी के पास भी लंबवत तीन हैं, पर पहले अपनी पंक्ति पूरी करें।', 'نقطة فوزك هي العمود D. لدى الخصم أيضًا ثلاثية عمودية، لكن أكمل صفك أنت أولًا.'),
      },
    ],
  },
];

export function getTutorial(id: string | null | undefined): TutorialLesson | null {
  if (!id) return null;
  return TUTORIALS.find((lesson) => lesson.id === id) ?? null;
}

export function getNextTutorial(id: string): TutorialLesson | null {
  const index = TUTORIALS.findIndex((lesson) => lesson.id === id);
  if (index < 0) return TUTORIALS[0] ?? null;
  return TUTORIALS[index + 1] ?? null;
}

export function createTutorialState(lesson: TutorialLesson): GameState {
  return createPositionState(lesson);
}

/** 走完全部步骤，或以玩家获胜结束。 */
export function isTutorialComplete(
  lesson: TutorialLesson,
  state: GameState,
  stepIndex: number,
): boolean {
  if (lesson.finish === 'win') {
    return state.status === 'won' && state.winner === lesson.human;
  }
  return state.status === 'playing' && stepIndex >= lesson.steps.length;
}
