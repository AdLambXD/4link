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
  readonly title: string;
  readonly note: string;
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
    title: '底行缺口',
    note: '对手的竖三已经听牌，你只有一手。',
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
    title: '双威胁',
    note: '一手落下，两个胜点。',
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
    title: '斜线缺口',
    note: '斜线穿过三列，缺口在最边上。',
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
    title: '叠子上爬',
    note: '对手的棋子也是你的台阶。',
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
    title: '边线陷阱',
    note: '最边上的一列，也能做杀。',
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
    title: '终局算术',
    note: '先手、次序、缺口，一个都不能错。',
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
    title: '八路斜线',
    note: '先填井，斜线才会出现。',
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
    title: '双线听牌',
    note: 'D 列一手落下，竖向与横向同时听牌。',
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
    title: '一子两用',
    note: '对手下一手落 C 就能横四；唯一能同时挡住并连成斜线的点。',
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
    title: '先封后杀',
    note: '先挡住对手的斜线，再用三手把横四补满。',
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
    title: '八路竖井',
    note: '中列补一手，竖四和 G–D 斜线同时听牌。',
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
    title: '斜线反杀',
    note: '对手在 H 列听牌；先封 H，再用三手反杀斜线。',
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
