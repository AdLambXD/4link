/**
 * 残局谜题：预设盘面 + 限定步数内的强制取胜。
 *
 * 求解器是纯输赢搜索（不做启发式评估）：
 * - 正值表示当前行棋方可以强制取胜，数值越大越快；
 * - 0 表示在搜索深度内没有强制结果；
 * - 负值表示当前行棋方会被强制击败。
 *
 * 残局盘面用自上而下的 ASCII 行描述：
 * `.` 空，`X` / `1` 先手，`O` / `2` 后手。棋子必须遵守重力。
 */

import { lt, type LocalizedText } from '../i18n';
import {
  drop,
  legalMoves,
  lineAt,
  makeConfig,
  type BoardSize,
  type Cell,
  type DuoPlayer,
  type GameState,
} from './rules';

export interface Puzzle {
  readonly id: string;
  readonly no: number;
  readonly title: LocalizedText;
  readonly note: LocalizedText;
  readonly size: BoardSize;
  /** 允许玩家行动的步数（只数玩家的落子） */
  readonly moveLimit: number;
  /** 玩家执子；目前所有关卡都是先手 */
  readonly human: DuoPlayer;
  /** 轮到谁走；谜题开始时必须是玩家 */
  readonly turn: DuoPlayer;
  /** 自上而下的盘面，长度 = size */
  readonly rows: readonly string[];
}

export interface PuzzleSearchResult {
  readonly col: number | null;
  readonly score: number;
  readonly line: readonly number[];
  readonly nodes: number;
}

export const MATE_SCORE = 1_000_000;

export function isForcedWin(score: number): boolean {
  return score > 0;
}

/** 强制取胜需要多少步（只数当前行棋方的落子）。 */
export function mateInMoves(score: number): number | null {
  if (score <= 0) return null;
  return Math.ceil((MATE_SCORE - score) / 2);
}

function parseCell(ch: string, puzzleId: string, row: number, col: number): Cell {
  if (ch === '.') return 0;
  if (ch === 'X' || ch === '1') return 1;
  if (ch === 'O' || ch === '2') return 2;
  throw new Error(`局面 ${puzzleId} 第 ${row + 1} 行第 ${col + 1} 格字符非法：${ch}`);
}

/** 预设盘面的公共定义：残局、教程等都从这里生成 GameState。 */
export interface PositionDefinition {
  readonly id: string;
  readonly size: BoardSize;
  readonly human: DuoPlayer;
  readonly turn: DuoPlayer;
  /** 自上而下的盘面，长度 = size */
  readonly rows: readonly string[];
}

/** 从 ASCII 盘面生成可玩的 GameState，同时校验重力、既有连线和手数奇偶。 */
export function createPositionState(position: PositionDefinition): GameState {
  const { id, size, turn } = position;
  const config = makeConfig(size, 2);

  if (position.rows.length !== size) {
    throw new Error(`局面 ${id} 需要 ${size} 行，实际 ${position.rows.length} 行`);
  }

  const board = new Array<Cell>(size * size).fill(0);
  for (let displayRow = 0; displayRow < size; displayRow++) {
    const line = position.rows[displayRow];
    if (line.length !== size) {
      throw new Error(
        `局面 ${id} 第 ${displayRow + 1} 行需要 ${size} 格，实际 ${line.length} 格`,
      );
    }
    const boardRow = size - 1 - displayRow;
    for (let col = 0; col < size; col++) {
      board[boardRow * size + col] = parseCell(line[col], id, displayRow, col);
    }
  }

  const heights = new Array<number>(size).fill(0);
  for (let col = 0; col < size; col++) {
    let foundEmpty = false;
    for (let row = 0; row < size; row++) {
      const value = board[row * size + col];
      if (value === 0) {
        foundEmpty = true;
      } else if (foundEmpty) {
        throw new Error(`局面 ${id} 的 ${col + 1} 列有悬空棋子`);
      }
    }
    while (heights[col] < size && board[heights[col] * size + col] !== 0) {
      heights[col]++;
    }
  }

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = board[row * size + col];
      if (value === 0) continue;
      if (lineAt(board, row, col, value as DuoPlayer, config)) {
        throw new Error(`局面 ${id} 开局已经存在 ${config.win} 连`);
      }
    }
  }

  const count = board.reduce<number>((sum, value) => sum + (value === 0 ? 0 : 1), 0);
  if (count % 2 !== (turn === 1 ? 0 : 1)) {
    throw new Error(`局面 ${id} 的手数奇偶不合法：${count} 子，轮到 ${turn} 号`);
  }
  if (position.human !== turn) {
    throw new Error(`局面 ${id} 开始时必须轮到玩家`);
  }

  return {
    config,
    board,
    heights,
    turn,
    status: 'playing',
    winner: null,
    winLine: null,
    last: null,
    count,
  };
}

export function createPuzzleState(puzzle: Puzzle): GameState {
  if (puzzle.moveLimit < 1) {
    throw new Error(`谜题 ${puzzle.id} 的步数限制必须大于 0`);
  }
  return createPositionState(puzzle);
}

/** 中心优先的走法顺序，和 AI 的直觉一致，也让同分时结果稳定。 */
function orderMoves(moves: readonly number[], cols: number): number[] {
  const mid = (cols - 1) / 2;
  return [...moves].sort(
    (a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b,
  );
}

interface SearchNode {
  score: number;
  line: number[];
}

let searchNodes = 0;

function search(state: GameState, depth: number, ply: number): SearchNode {
  searchNodes++;

  if (state.status === 'won') {
    // 当前行棋方刚刚被上一手击败；离根越近，分值绝对值越大。
    return { score: -(MATE_SCORE - ply), line: [] };
  }
  if (state.status === 'draw' || depth <= 0) {
    return { score: 0, line: [] };
  }

  const moves = legalMoves(state);
  if (moves.length === 0) {
    return { score: 0, line: [] };
  }

  let bestScore = -Infinity;
  let bestLine: number[] = [];

  for (const col of orderMoves(moves, state.config.cols)) {
    const next = drop(state, col);
    const child = search(next, depth - 1, ply + 1);
    const score = -child.score;

    if (score > bestScore) {
      bestScore = score;
      bestLine = [col, ...child.line];
    }
  }

  return { score: bestScore, line: bestLine };
}

export interface RootMove {
  readonly col: number;
  readonly score: number;
  readonly line: readonly number[];
}

/** 对每个合法首着评分，方便测试唯一解、做提示。 */
export function scoreRootMoves(state: GameState, maxPlies: number): RootMove[] {
  searchNodes = 0;
  if (state.status !== 'playing') return [];

  const depth = Math.max(0, Math.floor(maxPlies));
  const roots: RootMove[] = [];
  for (const col of orderMoves(legalMoves(state), state.config.cols)) {
    const next = drop(state, col);
    const child = search(next, depth - 1, 1);
    roots.push({ col, score: -child.score, line: [col, ...child.line] });
  }
  return roots;
}

/**
 * 搜索当前行棋方在 maxPlies 个半回合内的最优结果。
 * maxPlies 只影响搜索深度，不改变“步”的定义。
 */
export function findBestMove(state: GameState, maxPlies: number): PuzzleSearchResult {
  if (state.status !== 'playing') {
    return { col: null, score: 0, line: [], nodes: 0 };
  }
  const roots = scoreRootMoves(state, maxPlies);
  let best: RootMove | null = null;
  for (const root of roots) {
    if (best === null || root.score > best.score) best = root;
  }
  return {
    col: best?.col ?? null,
    score: best?.score ?? 0,
    line: best?.line ?? [],
    nodes: searchNodes,
  };
}

/** 校验关卡：开局合法、玩家能在限定步数内强制取胜。 */
export function inspectPuzzle(puzzle: Puzzle): {
  state: GameState;
  result: PuzzleSearchResult;
  mateIn: number | null;
  legal: boolean;
} {
  const state = createPuzzleState(puzzle);
  const result = findBestMove(state, puzzle.moveLimit * 2 - 1);
  const mateIn = mateInMoves(result.score);
  return {
    state,
    result,
    mateIn,
    legal: mateIn !== null && mateIn <= puzzle.moveLimit,
  };
}

/** 把 GameState 转成自上而下的 ASCII 行，方便测试和出题。 */
export function boardToRows(state: GameState): string[] {
  const { cols, rows } = state.config;
  const result: string[] = [];
  for (let row = rows - 1; row >= 0; row--) {
    let line = '';
    for (let col = 0; col < cols; col++) {
      const value = state.board[row * cols + col];
      line += value === 0 ? '.' : value === 1 ? 'X' : 'O';
    }
    result.push(line);
  }
  return result;
}

/**
 * 关卡表。数字越小越靠前；`moveLimit` 是玩家允许落子的次数。
 * 盘面由上到下书写，第一行是棋盘最上面一行。
 */
export const PUZZLES: readonly Puzzle[] = [
  {
    id: 'first-link',
    no: 1,
    title: lt('底行缺口', '底行缺口', 'Bottom-row gap', '最下行のすき間', 'Hueco en la fila inferior', 'Trou dans la rangée du bas', 'Lücke in der unteren Reihe', 'Пробел в нижнем ряду', 'निचली पंक्ति का खाली स्थान', 'فراغ الصف السفلي'),
    note: lt('对手的竖三已经听牌，你只有一手。', '對手的直三已經聽牌，你只有一手。', 'The opponent has three in a column and needs one more move. You only get one.', '相手は縦に三つ並んで待っています。あなたの手は一度だけ。', 'El rival tiene tres en columna y solo necesita una jugada. Tú solo tienes una.', 'L’adversaire a trois en colonne et n’a besoin que d’un coup. Vous n’en avez qu’un.', 'Der Gegner hat drei in einer Spalte und braucht nur einen Zug. Du hast nur einen.', 'У соперника три в столбце — ему нужен один ход. У вас только один.', 'प्रतिद्वंद्वी के एक कॉलम में तीन हैं और उसे बस एक चाल चाहिए। आपके पास सिर्फ़ एक चाल है।', 'لدى الخصم ثلاثة في عمود ويحتاج نقلة واحدة. لديك نقلة واحدة فقط.'),
    size: 6,
    moveLimit: 1,
    human: 1,
    turn: 1,
    rows: [
      '......',
      '......',
      '......',
      '.....O',
      '.....O',
      'XXX..O',
    ],
  },
  {
    id: 'double-threat',
    no: 2,
    title: lt('双威胁', '雙威脅', 'Double threat', '二重の脅威', 'Doble amenaza', 'Double menace', 'Doppelte Drohung', 'Двойная угроза', 'दोहरी धमकी', 'تهديد مزدوج'),
    note: lt('一手落下，两个胜点。', '一手落下，兩個勝點。', 'One move, two winning points.', '一手で二つの勝ち筋。', 'Una jugada, dos puntos ganadores.', 'Un coup, deux points gagnants.', 'Ein Zug, zwei Gewinnpunkte.', 'Один ход — две победные точки.', 'एक चाल, दो जीत के स्थान।', 'نقلة واحدة ونقطتا فوز.'),
    size: 6,
    moveLimit: 2,
    human: 1,
    turn: 1,
    rows: [
      '......',
      '...X..',
      'O.XO..',
      'OOOX..',
      'XXOX..',
      'OOXX..',
    ],
  },
  {
    id: 'diagonal',
    no: 3,
    title: lt('斜线缺口', '斜線缺口', 'Diagonal gap', '斜めのすき間', 'Hueco diagonal', 'Trou diagonal', 'Diagonale Lücke', 'Диагональный пробел', 'तिरछा खाली स्थान', 'فراغ قطري'),
    note: lt('斜线穿过三列，缺口在最边上。', '斜線穿過三欄，缺口在最邊上。', 'The diagonal crosses three columns, with the gap at the edge.', '斜めの線が三列をまたぎ、すき間は端にあります。', 'La diagonal cruza tres columnas y el hueco está en el borde.', 'La diagonale traverse trois colonnes, avec le trou au bord.', 'Die Diagonale kreuzt drei Spalten, die Lücke liegt am Rand.', 'Диагональ проходит через три столбца, пробел — у края.', 'तिरछी पंक्ति तीन कॉलम पार करती है, खाली स्थान किनारे पर है।', 'يمر القطر عبر ثلاثة أعمدة، والفراغ عند الحافة.'),
    size: 6,
    moveLimit: 2,
    human: 1,
    turn: 1,
    rows: [
      '......',
      '......',
      '......',
      '.OX...',
      '.XXX.O',
      '.XOO.O',
    ],
  },
  {
    id: 'stack',
    no: 4,
    title: lt('叠子上爬', '疊子往上爬', 'Climb the stack', '積み石を登る', 'Sube por la pila', 'Grimper la pile', 'Den Stapel hinauf', 'Взобраться по стопке', 'ढेर पर चढ़ें', 'اصعد فوق الكومة'),
    note: lt(
      '对手的棋子也是你的台阶。',
      '對手的棋子也是你的階梯。',
      "The opponent's stones are your stepping stones.",
      '相手の石もあなたの足がかりになります。',
      'Las fichas del rival también son tus escalones.',
      'Les pions de l’adversaire sont aussi vos marches.',
      'Auch die Steine des Gegners sind deine Stufen.',
      'Камни соперника — тоже ваши ступени.',
      'प्रतिद्वंद्वी की गोटियाँ भी आपकी सीढ़ी हैं।',
      'أحجار الخصم هي أيضًا درجاتك.',
    ),
    size: 6,
    moveLimit: 3,
    human: 1,
    turn: 1,
    rows: [
      '......',
      '......',
      '.XO...',
      '.XX...',
      '.OXO..',
      '.XOXOO',
    ],
  },
  {
    id: 'edge',
    no: 5,
    title: lt('边线陷阱', '邊線陷阱', 'Edge trap', '端の罠', 'Trampa del borde', 'Piège du bord', 'Falle am Rand', 'Ловушка на краю', 'किनारे का जाल', 'فخ الحافة'),
    note: lt('最边上的一列，也能做杀。', '最邊上的一欄，也能做殺。', 'Even the outermost column can set up a mate.', '一番端の列でも詰みを作れます。', 'Incluso la columna más exterior puede preparar un mate.', 'Même la colonne la plus extérieure peut préparer un mat.', 'Auch die äußerste Spalte kann ein Matt vorbereiten.', 'Даже самый крайний столбец может создать матовую угрозу.', 'सबसे बाहरी कॉलम भी मात की तैयारी कर सकता है।', 'حتى العمود الأقصى يمكنه تجهيز إماتة.'),
    size: 6,
    moveLimit: 3,
    human: 1,
    turn: 1,
    rows: [
      '......',
      '......',
      '...O..',
      '.O.X.O',
      '.XXX.O',
      '.OXX.O',
    ],
  },
  {
    id: 'finale',
    no: 6,
    title: lt('终局算术', '終局算術', 'Endgame arithmetic', '終盤の計算', 'Aritmética del final', 'Calcul de finale', 'Endspiel-Arithmetik', 'Арифметика эндшпиля', 'अंतिम चरण का गणित', 'حساب النهاية'),
    note: lt('先手、次序、缺口，一个都不能错。', '先手、次序、缺口，一個都不能錯。', 'First move, move order, and the gap: everything has to be exact.', '先手、順番、すき間、どれも正確でなければなりません。', 'Primer turno, orden de jugadas y hueco: todo tiene que ser exacto.', 'Premier coup, ordre des coups et trou : tout doit être exact.', 'Erster Zug, Zugreihenfolge und Lücke: alles muss stimmen.', 'Первый ход, порядок ходов и пробел — всё должно быть точно.', 'पहली चाल, चालों का क्रम और खाली स्थान — सब सही होना चाहिए।', 'النقلة الأولى وترتيب النقلات والفراغ: كل شيء يجب أن يكون دقيقًا.'),
    size: 6,
    moveLimit: 3,
    human: 1,
    turn: 1,
    rows: [
      '...O..',
      '..OX..',
      '..XO..',
      '..XX..',
      '.XOX.O',
      '.XOXOO',
    ],
  },
  {
    id: 'eight-diagonal',
    no: 7,
    title: lt('八路斜线', '八路斜線', 'Diagonal on eight', '8×8 の斜め', 'Diagonal en 8', 'Diagonale en 8', 'Diagonale auf 8', 'Диагональ на 8', '8 पर तिरछी पंक्ति', 'قطر على 8'),
    note: lt('先填井，斜线才会出现。', '先填井，斜線才會出現。', 'Fill the well first; then the diagonal appears.', 'まず井戸を埋めると、斜めの線が見えてきます。', 'Primero llena el pozo; luego aparece la diagonal.', 'Remplissez d’abord le puits ; la diagonale apparaîtra ensuite.', 'Fülle zuerst den Brunnen; dann entsteht die Diagonale.', 'Сначала заполните колодец — тогда появится диагональ.', 'पहले कुआँ भरें; तब तिरछी पंक्ति बनेगी।', 'املأ البئر أولًا؛ ثم يظهر القطر.'),
    size: 8,
    moveLimit: 2,
    human: 1,
    turn: 1,
    rows: [
      '..O.....',
      '..O.....',
      '..O..X..',
      '..X.OX..',
      '..O.XO..',
      '..O.XO..',
      '.XX.XX..',
      '.OX.OO.X',
    ],
  },
  {
    id: 'double-line',
    no: 8,
    title: lt('双线听牌', '雙線聽牌', 'Two lines ready', '二線待ち', 'Dos líneas listas', 'Deux lignes prêtes', 'Zwei Linien bereit', 'Две линии готовы', 'दो पंक्तियाँ तैयार', 'خطان جاهزان'),
    note: lt('D 列一手落下，竖向与横向同时听牌。', 'D 欄一手落下，縱向與橫向同時聽牌。', 'One drop in column D sets up both a vertical and a horizontal line.', 'D 列に一手置くと、縦と横の両方が待ちになります。', 'Una ficha en la columna D prepara a la vez una línea vertical y otra horizontal.', 'Un pion en la colonne D prépare à la fois une ligne verticale et une horizontale.', 'Ein Stein in Spalte D bereitet zugleich eine senkrechte und eine waagerechte Linie vor.', 'Один камень в столбце D готовит и вертикальную, и горизонтальную линию.', 'कॉलम D में एक गोटी लंबवत और क्षैतिज दोनों पंक्तियाँ तैयार करती है।', 'حجر واحد في العمود D يجهّز صفًا عموديًا وآخر أفقيًا معًا.'),
    size: 6,
    moveLimit: 2,
    human: 1,
    turn: 1,
    rows: [
      '......',
      '......',
      '......',
      '.XX...',
      'OOOX..',
      'OXXXOO',
    ],
  },
  {
    id: 'one-move-two-ways',
    no: 9,
    title: lt('一子两用', '一子兩用', 'One stone, two jobs', '一石二役', 'Una ficha, dos funciones', 'Un pion, deux rôles', 'Ein Stein, zwei Aufgaben', 'Один камень — две задачи', 'एक गोटी, दो काम', 'حجر واحد ووظيفتان'),
    note: lt('对手下一手落 C 就能横四；唯一能同时挡住并连成斜线的点。', '對手下一手落 C 就能橫四；唯一能同時擋住並連成斜線的點。', 'The opponent wins horizontally with C next. This is the only point that blocks it and completes your diagonal.', '相手は次に C で横四を作ります。それを防ぎながら斜めも完成させる唯一の点です。', 'El rival gana en horizontal con C. Este es el único punto que lo bloquea y completa tu diagonal.', 'L’adversaire gagne à l’horizontale avec C. C’est le seul point qui bloque et complète votre diagonale.', 'Der Gegner gewinnt waagerecht mit C. Dies ist der einzige Punkt, der blockt und deine Diagonale vollendet.', 'Соперник выигрывает по горизонтали ходом C. Это единственная точка, которая и блокирует, и завершает вашу диагональ.', 'प्रतिद्वंद्वी C में अगली चाल से क्षैतिज जीत जाएगा। यही एकमात्र स्थान है जो रोकता है और आपकी तिरछी पंक्ति पूरी करता है।', 'يفوز الخصم أفقيًا بالنقلة C. هذه النقطة الوحيدة التي تصدّه وتكمل قطرك.'),
    size: 6,
    moveLimit: 2,
    human: 1,
    turn: 1,
    rows: [
      '......',
      '......',
      '.....X',
      'O..XXX',
      'OO.OOO',
      'XXOXXO',
    ],
  },
  {
    id: 'block-then-link',
    no: 10,
    title: lt('先封后杀', '先封後殺', 'Block, then mate', '受けから詰みへ', 'Bloquea y luego remata', 'Bloquer, puis mater', 'Blocken, dann mattsetzen', 'Сначала блок, затем мат', 'पहले रोकें, फिर मात', 'اصدّ ثم أمِت'),
    note: lt('先挡住对手的斜线，再用三手把横四补满。', '先擋住對手的斜線，再用三手把橫四補滿。', 'Block the diagonal first, then complete your horizontal four in three moves.', 'まず相手の斜めを止め、その後三手で横四を完成させます。', 'Bloquea primero la diagonal y luego completa tu cuatro horizontal en tres jugadas.', 'Bloquez d’abord la diagonale, puis complétez votre quatre horizontal en trois coups.', 'Blocke zuerst die Diagonale und vervollständige dann deine waagerechte Vier in drei Zügen.', 'Сначала заблокируйте диагональ, затем завершите горизонтальную четвёрку за три хода.', 'पहले तिरछी पंक्ति रोकें, फिर तीन चालों में अपनी क्षैतिज चौकड़ी पूरी करें।', 'اصدّ القطر أولًا، ثم أكمل أربعتك الأفقية في ثلاث نقلات.'),
    size: 6,
    moveLimit: 3,
    human: 1,
    turn: 1,
    rows: [
      '......',
      '......',
      '...O..',
      '...X..',
      'XOXXOO',
      'OOXXOX',
    ],
  },
  {
    id: 'eight-vertical',
    no: 11,
    title: lt('八路竖井', '八路豎井', 'Vertical well on eight', '8×8 の縦井戸', 'Pozo vertical en 8', 'Puits vertical en 8', 'Senkrechter Brunnen auf 8', 'Вертикальный колодец на 8', '8 पर लंबवत कुआँ', 'بئر عمودي على 8'),
    note: lt('中列补一手，竖四和 G–D 斜线同时听牌。', '中欄補一手，豎四和 G–D 斜線同時聽牌。', 'One move in the middle column sets up a vertical four and a G–D diagonal.', '中央の列に一手置くと、縦四と G–D の斜めが同時に待ちになります。', 'Una jugada en la columna central prepara un cuatro vertical y una diagonal G–D.', 'Un coup dans la colonne centrale prépare un quatre vertical et une diagonale G–D.', 'Ein Zug in der mittleren Spalte bereitet eine senkrechte Vier und eine G–D-Diagonale vor.', 'Один ход в среднем столбце готовит вертикальную четвёрку и диагональ G–D.', 'बीच के कॉलम में एक चाल लंबवत चौकड़ी और G–D तिरछी पंक्ति तैयार करती है।', 'نقلة في العمود الأوسط تجهّز أربعة عمودية وقطرًا G–D.'),
    size: 8,
    moveLimit: 2,
    human: 1,
    turn: 1,
    rows: [
      '........',
      '........',
      '........',
      '.....O..',
      '.....X..',
      '..XO.O..',
      '..XOXX..',
      '.OOXXOXO',
    ],
  },
  {
    id: 'eight-finish',
    no: 12,
    title: lt('斜线反杀', '斜線反殺', 'Diagonal counterattack', '斜めの反撃', 'Contraataque diagonal', 'Contre-attaque diagonale', 'Diagonaler Gegenschlag', 'Диагональная контратака', 'तिरछा पलटवार', 'هجوم قطري مضاد'),
    note: lt('对手在 H 列听牌；先封 H，再用三手反杀斜线。', '對手在 H 欄聽牌；先封 H，再用三手反殺斜線。', 'The opponent is ready in column H. Block H, then finish the diagonal in three moves.', '相手は H 列で待っています。H を止めてから、三手で斜めを仕上げます。', 'El rival está listo en la columna H. Bloquea H y luego termina la diagonal en tres jugadas.', 'L’adversaire est prêt en colonne H. Bloquez H, puis terminez la diagonale en trois coups.', 'Der Gegner ist in Spalte H bereit. Blocke H und vollende dann die Diagonale in drei Zügen.', 'Соперник готов в столбце H. Заблокируйте H, затем завершите диагональ за три хода.', 'प्रतिद्वंद्वी कॉलम H में तैयार है। H रोकें, फिर तीन चालों में तिरछी पंक्ति पूरी करें।', 'الخصم جاهز في العمود H. اصدّ H ثم أكمل القطر في ثلاث نقلات.'),
    size: 8,
    moveLimit: 3,
    human: 1,
    turn: 1,
    rows: [
      '........',
      '........',
      '........',
      '......X.',
      '......X.',
      '.....XOX',
      'O.OXOOOX',
      'XXOXOXOO',
    ],
  },
];

export function getPuzzle(id: string | null | undefined): Puzzle | null {
  if (!id) return null;
  return PUZZLES.find((puzzle) => puzzle.id === id) ?? null;
}

export function getNextPuzzle(id: string): Puzzle | null {
  const index = PUZZLES.findIndex((puzzle) => puzzle.id === id);
  if (index < 0) return PUZZLES[0] ?? null;
  return PUZZLES[index + 1] ?? null;
}
