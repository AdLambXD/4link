/**
 * AI 引擎：negamax + alpha-beta + Zobrist 置换表 + 迭代加深。
 *
 * 引擎按棋盘尺寸参数化：小盘深搜，大盘自动限深并靠评估函数收手。
 * 这里用 Uint8Array 做可变棋盘，和规则层的不可变状态分开，
 * 避免深搜时产生大量对象。
 */

import {
  DEFAULT_CONFIG,
  SIZE_WIN,
  other,
  type DuoPlayer,
  type GameConfig,
} from '../game/rules';

export type Difficulty = 'easy' | 'normal' | 'hard';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
};

export interface MoveResult {
  col: number;
  score: number;
  depth: number;
  nodes: number;
  ms: number;
}

const INF = 1_000_000;
const WIN_SCORE = 100_000;

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

interface Engine {
  id: string;
  cols: number;
  rows: number;
  win: number;
  cellCount: number;
  board: Uint8Array;
  heights: Uint8Array;
  /** 扁平化的所有 win 格窗口 */
  windows: Int32Array;
  windowCount: number;
  z1: Int32Array;
  z2: Int32Array;
  /** 中心优先的走法顺序 */
  order: number[];
}

let engine: Engine | null = null;

function build(config: GameConfig): Engine {
  const { cols, rows, win } = config;
  const cellCount = cols * rows;

  const list: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of DIRECTIONS) {
        const cells: number[] = [];
        for (let k = 0; k < win; k++) {
          const rr = r + dr * k;
          const cc = c + dc * k;
          if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) break;
          cells.push(rr * cols + cc);
        }
        if (cells.length === win) list.push(...cells);
      }
    }
  }

  const z1 = new Int32Array(cellCount * 2);
  const z2 = new Int32Array(cellCount * 2);
  let s = 0x2f6e2b1;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s | 0;
  };
  for (let i = 0; i < z1.length; i++) {
    z1[i] = rnd();
    z2[i] = rnd();
  }

  const mid = (cols - 1) / 2;
  const order = Array.from({ length: cols }, (_, c) => c).sort(
    (a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b,
  );

  return {
    id: `${cols}x${rows}x${win}`,
    cols,
    rows,
    win,
    cellCount,
    board: new Uint8Array(cellCount),
    heights: new Uint8Array(cols),
    windows: new Int32Array(list),
    windowCount: win > 0 ? list.length / win : 0,
    z1,
    z2,
    order,
  };
}

function getEngine(config: GameConfig): Engine {
  const safe: GameConfig = { ...config, players: 2 };
  if (!engine || engine.id !== `${safe.cols}x${safe.rows}x${safe.win}`) {
    engine = build(safe);
  }
  return engine;
}

/** 置换表 */
const TT_BITS = 18;
const TT_SIZE = 1 << TT_BITS;
const TT_MASK = TT_SIZE - 1;
const ttLock = new Int32Array(TT_SIZE);
const ttScore = new Int32Array(TT_SIZE);
const ttDepth = new Int8Array(TT_SIZE);
const ttFlag = new Uint8Array(TT_SIZE); // 1 精确 / 2 下界 / 3 上界

let h1 = 0;
let h2 = 0;
let nodes = 0;
let deadline = 0;
let aborted = false;
let salt = 1;

function reset(e: Engine, inputBoard: readonly number[], inputHeights: readonly number[]): void {
  for (let i = 0; i < e.cellCount; i++) e.board[i] = inputBoard[i] | 0;
  for (let c = 0; c < e.cols; c++) e.heights[c] = inputHeights[c] | 0;

  h1 = 0;
  h2 = 0;
  for (let i = 0; i < e.cellCount; i++) {
    const v = e.board[i];
    if (v === 1 || v === 2) {
      h1 ^= e.z1[i * 2 + v - 1];
      h2 ^= e.z2[i * 2 + v - 1];
    }
  }

  nodes = 0;
  aborted = false;
  salt = (Math.random() * 0x7fffffff) | 0;
  ttLock.fill(0);
}

function winsAt(e: Engine, row: number, col: number, player: DuoPlayer): boolean {
  const { board, cols, rows, win } = e;
  for (const [dr, dc] of DIRECTIONS) {
    let n = 1;
    for (const sign of [-1, 1] as const) {
      for (let i = 1; i < win; i++) {
        const r = row + dr * sign * i;
        const c = col + dc * sign * i;
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r * cols + c] !== player) break;
        n++;
      }
    }
    if (n >= win) return true;
  }
  return false;
}

/** 局面评估：站在 me 的视角 */
function evaluate(e: Engine, me: DuoPlayer): number {
  const opp = other(me);
  const { board, windows, windowCount, win, cols, heights } = e;
  let score = 0;

  const strongOne = win >= 5 ? 220 : 150;
  const weakOne = win >= 5 ? 18 : 12;
  const strongBlock = win >= 5 ? 230 : 170;
  const weakBlock = win >= 5 ? 20 : 14;

  for (let w = 0; w < windowCount; w++) {
    const base = w * win;
    let mine = 0;
    let theirs = 0;
    for (let k = 0; k < win; k++) {
      const v = board[windows[base + k]];
      if (v === me) mine++;
      else if (v === opp) theirs++;
    }

    if (mine === 0) {
      if (theirs === win - 1) score -= strongBlock;
      else if (theirs === win - 2) score -= weakBlock;
      else if (theirs === 1) score -= 1;
    } else if (theirs === 0) {
      if (mine === win - 1) score += strongOne;
      else if (mine === win - 2) score += weakOne;
      else score += 1;
    }
  }

  // 中心列位置分
  const mid = (cols - 1) / 2;
  for (let c = 0; c < cols; c++) {
    const dist = Math.abs(c - mid);
    const bonus = dist < 0.6 ? 2 : dist < 1.6 ? 1 : 0;
    if (bonus === 0) continue;
    const h = heights[c];
    for (let r = 0; r < h; r++) {
      score += board[r * cols + c] === me ? bonus : -bonus;
    }
  }

  return score;
}

function negamax(
  e: Engine,
  me: DuoPlayer,
  depth: number,
  alpha: number,
  beta: number,
  ply: number,
): number {
  nodes++;
  if ((nodes & 2047) === 0 && performance.now() > deadline) aborted = true;
  if (aborted) return 0;
  if (depth <= 0) return evaluate(e, me);

  const key = (h1 ^ h2) & TT_MASK;
  const lock = (h1 ^ salt) | 1;
  if (ttLock[key] === lock && ttDepth[key] >= depth) {
    const v = ttScore[key];
    const f = ttFlag[key];
    if (f === 1) return v;
    if (f === 2 && v >= beta) return v;
    if (f === 3 && v <= alpha) return v;
  }

  const startAlpha = alpha;
  let best = -INF;
  let any = false;

  for (const c of e.order) {
    const r = e.heights[c];
    if (r >= e.rows) continue;
    any = true;

    const i = r * e.cols + c;
    e.board[i] = me;
    e.heights[c] = r + 1;
    h1 ^= e.z1[i * 2 + me - 1];
    h2 ^= e.z2[i * 2 + me - 1];

    let value: number;
    if (winsAt(e, r, c, me)) {
      value = WIN_SCORE - ply;
    } else {
      value = -negamax(e, other(me), depth - 1, -beta, -alpha, ply + 1);
    }

    e.board[i] = 0;
    e.heights[c] = r;
    h1 ^= e.z1[i * 2 + me - 1];
    h2 ^= e.z2[i * 2 + me - 1];

    if (aborted) return 0;
    if (value > best) best = value;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }

  if (!any) return 0;

  ttLock[key] = lock;
  ttScore[key] = best;
  ttDepth[key] = depth;
  ttFlag[key] = best <= startAlpha ? 3 : best >= beta ? 2 : 1;

  return best;
}

interface RootResult {
  col: number;
  score: number;
}

function rootSearch(e: Engine, me: DuoPlayer, depth: number): RootResult {
  const opp = other(me);
  let bestCol = -1;
  let bestScore = -INF;
  let alpha = -INF;

  for (const c of e.order) {
    const r = e.heights[c];
    if (r >= e.rows) continue;

    const i = r * e.cols + c;
    e.board[i] = me;
    e.heights[c] = r + 1;
    h1 ^= e.z1[i * 2 + me - 1];
    h2 ^= e.z2[i * 2 + me - 1];

    let value: number;
    if (winsAt(e, r, c, me)) {
      value = WIN_SCORE;
    } else {
      value = -negamax(e, opp, depth - 1, -INF, -alpha, 1);
    }

    e.board[i] = 0;
    e.heights[c] = r;
    h1 ^= e.z1[i * 2 + me - 1];
    h2 ^= e.z2[i * 2 + me - 1];

    if (aborted) break;
    if (value > bestScore) {
      bestScore = value;
      bestCol = c;
    }
    if (value > alpha) alpha = value;
  }

  return { col: bestCol, score: bestScore };
}

function wouldWin(e: Engine, col: number, player: DuoPlayer): boolean {
  const row = e.heights[col];
  if (row >= e.rows) return false;
  const cell = row * e.cols + col;
  e.board[cell] = player;
  const win = winsAt(e, row, col, player);
  e.board[cell] = 0;
  return win;
}

/** 落下这一手之后，对手是否能立刻连成 win 个 */
function givesOpponentWin(e: Engine, col: number, player: DuoPlayer): boolean {
  const row = e.heights[col];
  const i = row * e.cols + col;
  e.board[i] = player;
  e.heights[col] = row + 1;

  const opp = other(player);
  let loses = false;
  for (let c = 0; c < e.cols && !loses; c++) {
    const r = e.heights[c];
    if (r >= e.rows) continue;
    const cell = r * e.cols + c;
    e.board[cell] = opp;
    if (winsAt(e, r, c, opp)) loses = true;
    e.board[cell] = 0;
  }

  e.heights[col] = row;
  e.board[i] = 0;
  return loses;
}

function maxDepth(difficulty: Difficulty, size: number): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'normal') return size <= 6 ? 6 : size <= 8 ? 6 : 4;
  return size <= 6 ? 14 : size <= 8 ? 9 : size <= 12 ? 6 : 5;
}

function timeBudget(difficulty: Difficulty, size: number): number {
  if (difficulty === 'easy') return 60;
  if (difficulty === 'normal') return size <= 8 ? 700 : 500;
  return size <= 6 ? 1400 : size <= 8 ? 1100 : size <= 12 ? 900 : 800;
}

/** 没传配置时按棋盘反推，方便老调用与测试。 */
function resolveConfig(
  board: readonly number[],
  heights: readonly number[],
  config?: GameConfig,
): GameConfig {
  if (
    config &&
    config.cols === heights.length &&
    config.cols * config.rows === board.length
  ) {
    return config;
  }
  const cols = heights.length || DEFAULT_CONFIG.cols;
  const rows = cols > 0 ? Math.round(board.length / cols) : DEFAULT_CONFIG.rows;
  const win =
    (SIZE_WIN as Record<number, number>)[cols] ??
    Math.min(4, Math.max(cols, rows));
  return { cols, rows, win: Math.min(win, Math.max(cols, rows)), players: 2 };
}

export function chooseMove(
  inputBoard: readonly number[],
  inputHeights: readonly number[],
  player: DuoPlayer,
  difficulty: Difficulty,
  inputConfig?: GameConfig,
): MoveResult {
  const started = performance.now();
  const config = resolveConfig(inputBoard, inputHeights, inputConfig);
  const e = getEngine(config);
  const size = Math.min(e.cols, e.rows);

  reset(e, inputBoard, inputHeights);

  const legal: number[] = [];
  for (let c = 0; c < e.cols; c++) {
    if (e.heights[c] < e.rows) legal.push(c);
  }

  if (legal.length === 0) {
    return { col: -1, score: 0, depth: 0, nodes: 0, ms: performance.now() - started };
  }

  // 空盘：直接走中心，省时间也符合开局直觉
  const empty = inputBoard.every((v) => v === 0);
  if (empty) {
    const near = e.order.slice(0, 2);
    const col = near[Math.floor(Math.random() * near.length)];
    return { col, score: 0, depth: 0, nodes: 0, ms: performance.now() - started };
  }

  // 能赢就赢；简单档有两成概率错过自己的一手胜
  const winning = legal.filter((c) => wouldWin(e, c, player));
  if (winning.length > 0) {
    if (difficulty !== 'easy' || Math.random() >= 0.2) {
      return {
        col: winning[0],
        score: WIN_SCORE,
        depth: 1,
        nodes: 0,
        ms: performance.now() - started,
      };
    }

    // 故意错过：排除所有一手胜列，优先选不会立刻输的着法
    const nonWinning = legal.filter((c) => !winning.includes(c));
    const safe = nonWinning.filter((c) => !givesOpponentWin(e, c, player));
    const pool = safe.length > 0 ? safe : nonWinning.length > 0 ? nonWinning : winning;
    const col = pool[Math.floor(Math.random() * pool.length)];
    return { col, score: 0, depth: 0, nodes: 0, ms: performance.now() - started };
  }

  // 对手下一手能赢就堵
  const opp = other(player);
  const threat = legal.find((c) => wouldWin(e, c, opp));
  if (threat !== undefined) {
    // 简单档偶尔漏看对手的一步胜，故意走出无法封堵的着法。
    if (difficulty === 'easy' && Math.random() < 0.4) {
      const blunders = legal.filter((c) => givesOpponentWin(e, c, player));
      if (blunders.length > 0) {
        const col = blunders[Math.floor(Math.random() * blunders.length)];
        return { col, score: 0, depth: 0, nodes: 0, ms: performance.now() - started };
      }
    }
    return { col: threat, score: 0, depth: 1, nodes: 0, ms: performance.now() - started };
  }

  // 简单档：偶尔故意走一步不是最优的（但不送四连）
  if (difficulty === 'easy' && Math.random() < 0.5) {
    const safe = legal.filter((c) => !givesOpponentWin(e, c, player));
    const pool = safe.length > 0 ? safe : legal;
    const col = pool[Math.floor(Math.random() * pool.length)];
    return { col, score: 0, depth: 0, nodes: 0, ms: performance.now() - started };
  }

  const budget = timeBudget(difficulty, size);
  const depthLimit = maxDepth(difficulty, size);
  deadline = started + budget;

  let best: RootResult = { col: legal[0], score: -INF };
  let reached = 0;

  for (let depth = 1; depth <= depthLimit; depth++) {
    const before = performance.now();
    const result = rootSearch(e, player, depth);
    if (aborted) break;

    if (result.col >= 0) best = result;
    reached = depth;

    const decided = Math.abs(result.score) >= WIN_SCORE - 100;
    if (decided) break;
    if (performance.now() - started > budget) break;
    // 这一层已经花掉超过 35% 预算，下一层大概率来不及
    if (performance.now() - before > budget * 0.35) break;
  }

  return {
    col: best.col,
    score: best.score,
    depth: reached,
    nodes,
    ms: performance.now() - started,
  };
}
