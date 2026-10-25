/**
 * AI 引擎：negamax + alpha-beta + Zobrist 置换表 + 迭代加深。
 *
 * 这里用 Uint8Array 做可变棋盘，和规则层的不可变状态分开，
 * 避免深搜时产生大量对象。
 */

import { CELL_COUNT, COLS, ROWS, WIN, other, type Player } from '../game/rules';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface MoveResult {
  col: number;
  score: number;
  depth: number;
  nodes: number;
  ms: number;
}

const INF = 1_000_000;
const WIN_SCORE = 100_000;

/** 中心优先的走法顺序 */
const ORDER = [2, 3, 1, 4, 0, 5];

/** 全部 54 条 4 格窗口 */
const WINDOWS: number[][] = [];
{
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ] as const;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        const cells: number[] = [];
        for (let k = 0; k < WIN; k++) {
          const rr = r + dr * k;
          const cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) break;
          cells.push(rr * COLS + cc);
        }
        if (cells.length === WIN) WINDOWS.push(cells);
      }
    }
  }
}

/** Zobrist 键（两个 32 位半区） */
const Z1 = new Int32Array(CELL_COUNT * 2);
const Z2 = new Int32Array(CELL_COUNT * 2);
{
  let s = 0x2f6e2b1;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s | 0;
  };
  for (let i = 0; i < Z1.length; i++) {
    Z1[i] = rnd();
    Z2[i] = rnd();
  }
}

/** 置换表 */
const TT_BITS = 18;
const TT_SIZE = 1 << TT_BITS;
const TT_MASK = TT_SIZE - 1;
const ttLock = new Int32Array(TT_SIZE);
const ttScore = new Int32Array(TT_SIZE);
const ttDepth = new Int8Array(TT_SIZE);
const ttFlag = new Uint8Array(TT_SIZE); // 1 精确 / 2 下界 / 3 上界

/** 搜索用可变状态 */
const board = new Uint8Array(CELL_COUNT);
const heights = new Uint8Array(COLS);
let h1 = 0;
let h2 = 0;
let nodes = 0;
let deadline = 0;
let aborted = false;
let salt = 1;

interface Level {
  /** 最大搜索深度 */
  depth: number;
  /** 时间预算（毫秒） */
  time: number;
  /** 随机走子概率（只对简单档） */
  random: number;
}

const LEVELS: Record<Difficulty, Level> = {
  easy: { depth: 2, time: 120, random: 0.32 },
  normal: { depth: 6, time: 700, random: 0 },
  hard: { depth: 14, time: 1400, random: 0 },
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
};

function reset(inputBoard: readonly number[], inputHeights: readonly number[]): void {
  for (let i = 0; i < CELL_COUNT; i++) board[i] = inputBoard[i] | 0;
  for (let c = 0; c < COLS; c++) heights[c] = inputHeights[c] | 0;

  h1 = 0;
  h2 = 0;
  for (let i = 0; i < CELL_COUNT; i++) {
    const v = board[i];
    if (v === 1 || v === 2) {
      h1 ^= Z1[i * 2 + v - 1];
      h2 ^= Z2[i * 2 + v - 1];
    }
  }

  nodes = 0;
  aborted = false;
  salt = (Math.random() * 0x7fffffff) | 0;
  ttLock.fill(0);
}

function winsAt(row: number, col: number, player: Player): boolean {
  // 横
  let n = 1;
  for (let i = 1; i < WIN; i++) {
    const c = col - i;
    if (c < 0 || board[row * COLS + c] !== player) break;
    n++;
  }
  for (let i = 1; i < WIN; i++) {
    const c = col + i;
    if (c >= COLS || board[row * COLS + c] !== player) break;
    n++;
  }
  if (n >= WIN) return true;

  // 竖
  n = 1;
  for (let i = 1; i < WIN; i++) {
    const r = row - i;
    if (r < 0 || board[r * COLS + col] !== player) break;
    n++;
  }
  for (let i = 1; i < WIN; i++) {
    const r = row + i;
    if (r >= ROWS || board[r * COLS + col] !== player) break;
    n++;
  }
  if (n >= WIN) return true;

  // ↗
  n = 1;
  for (let i = 1; i < WIN; i++) {
    const r = row - i;
    const c = col - i;
    if (r < 0 || c < 0 || board[r * COLS + c] !== player) break;
    n++;
  }
  for (let i = 1; i < WIN; i++) {
    const r = row + i;
    const c = col + i;
    if (r >= ROWS || c >= COLS || board[r * COLS + c] !== player) break;
    n++;
  }
  if (n >= WIN) return true;

  // ↘
  n = 1;
  for (let i = 1; i < WIN; i++) {
    const r = row - i;
    const c = col + i;
    if (r < 0 || c >= COLS || board[r * COLS + c] !== player) break;
    n++;
  }
  for (let i = 1; i < WIN; i++) {
    const r = row + i;
    const c = col - i;
    if (r >= ROWS || c < 0 || board[r * COLS + c] !== player) break;
    n++;
  }
  return n >= WIN;
}

/** 局面评估：站在 me 的视角 */
function evaluate(me: Player): number {
  const opp = other(me);
  let score = 0;

  for (let w = 0; w < WINDOWS.length; w++) {
    const win = WINDOWS[w];
    let mine = 0;
    let theirs = 0;
    for (let k = 0; k < WIN; k++) {
      const v = board[win[k]];
      if (v === me) mine++;
      else if (v === opp) theirs++;
    }

    if (mine === 0) {
      if (theirs === 3) score -= 170;
      else if (theirs === 2) score -= 14;
      else if (theirs === 1) score -= 1;
    } else if (theirs === 0) {
      if (mine === 3) score += 150;
      else if (mine === 2) score += 12;
      else score += 1;
    }
  }

  // 中心列位置分
  for (let c = 0; c < COLS; c++) {
    const bonus = c === 2 || c === 3 ? 2 : c === 1 || c === 4 ? 1 : 0;
    if (bonus === 0) continue;
    const h = heights[c];
    for (let r = 0; r < h; r++) {
      score += board[r * COLS + c] === me ? bonus : -bonus;
    }
  }

  return score;
}

function negamax(me: Player, depth: number, alpha: number, beta: number, ply: number): number {
  nodes++;
  if ((nodes & 2047) === 0 && performance.now() > deadline) aborted = true;
  if (aborted) return 0;
  if (depth <= 0) return evaluate(me);

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

  for (let k = 0; k < COLS; k++) {
    const c = ORDER[k];
    const r = heights[c];
    if (r >= ROWS) continue;
    any = true;

    const i = r * COLS + c;
    board[i] = me;
    heights[c] = r + 1;
    h1 ^= Z1[i * 2 + me - 1];
    h2 ^= Z2[i * 2 + me - 1];

    let value: number;
    if (winsAt(r, c, me)) {
      value = WIN_SCORE - ply;
    } else {
      value = -negamax(other(me), depth - 1, -beta, -alpha, ply + 1);
    }

    board[i] = 0;
    heights[c] = r;
    h1 ^= Z1[i * 2 + me - 1];
    h2 ^= Z2[i * 2 + me - 1];

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

function rootSearch(me: Player, depth: number): RootResult {
  const opp = other(me);
  let bestCol = -1;
  let bestScore = -INF;
  let alpha = -INF;

  for (let k = 0; k < COLS; k++) {
    const c = ORDER[k];
    const r = heights[c];
    if (r >= ROWS) continue;

    const i = r * COLS + c;
    board[i] = me;
    heights[c] = r + 1;
    h1 ^= Z1[i * 2 + me - 1];
    h2 ^= Z2[i * 2 + me - 1];

    let value: number;
    if (winsAt(r, c, me)) {
      value = WIN_SCORE;
    } else {
      value = -negamax(opp, depth - 1, -INF, -alpha, 1);
    }

    board[i] = 0;
    heights[c] = r;
    h1 ^= Z1[i * 2 + me - 1];
    h2 ^= Z2[i * 2 + me - 1];

    if (aborted) break;
    if (value > bestScore) {
      bestScore = value;
      bestCol = c;
    }
    if (value > alpha) alpha = value;
  }

  return { col: bestCol, score: bestScore };
}

/** 落下这一手之后，对手是否能立刻连四 */
function givesOpponentWin(col: number, player: Player): boolean {
  const row = heights[col];
  const i = row * COLS + col;
  board[i] = player;
  heights[col] = row + 1;

  const opp = other(player);
  let loses = false;
  for (let c = 0; c < COLS && !loses; c++) {
    const r = heights[c];
    if (r >= ROWS) continue;
    const cell = r * COLS + c;
    board[cell] = opp;
    if (winsAt(r, c, opp)) loses = true;
    board[cell] = 0;
  }

  heights[col] = row;
  board[i] = 0;
  return loses;
}

export function chooseMove(
  inputBoard: readonly number[],
  inputHeights: readonly number[],
  player: Player,
  difficulty: Difficulty,
): MoveResult {
  const started = performance.now();
  const level = LEVELS[difficulty];

  reset(inputBoard, inputHeights);

  const legal: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (heights[c] < ROWS) legal.push(c);
  }

  if (legal.length === 0) {
    return { col: -1, score: 0, depth: 0, nodes: 0, ms: performance.now() - started };
  }

  // 空盘：直接走中心，省时间也符合开局直觉
  const empty = inputBoard.every((v) => v === 0);
  if (empty) {
    const col = Math.random() < 0.5 ? 2 : 3;
    return { col, score: 0, depth: 0, nodes: 0, ms: performance.now() - started };
  }

  // 能赢就赢
  for (const c of legal) {
    const r = heights[c];
    const i = r * COLS + c;
    board[i] = player;
    const win = winsAt(r, c, player);
    board[i] = 0;
    if (win) {
      return { col: c, score: WIN_SCORE, depth: 1, nodes: 0, ms: performance.now() - started };
    }
  }

  // 简单档：偶尔故意走一步不是最优的（但不送四连）
  if (level.random > 0 && Math.random() < level.random) {
    const safe = legal.filter((c) => !givesOpponentWin(c, player));
    const pool = safe.length > 0 ? safe : legal;
    const col = pool[Math.floor(Math.random() * pool.length)];
    return { col, score: 0, depth: 0, nodes: 0, ms: performance.now() - started };
  }

  deadline = started + level.time;

  let best: RootResult = { col: legal[0], score: -INF };
  let reached = 0;

  for (let depth = 1; depth <= level.depth; depth++) {
    const before = performance.now();
    const result = rootSearch(player, depth);
    if (aborted) break;

    if (result.col >= 0) best = result;
    reached = depth;

    const decided = Math.abs(result.score) >= WIN_SCORE - 100;
    if (decided) break;
    if (performance.now() - started > level.time) break;
    // 这一层已经花掉超过 35% 预算，下一层大概率来不及
    if (performance.now() - before > level.time * 0.35) break;
  }

  return {
    col: best.col,
    score: best.score,
    depth: reached,
    nodes,
    ms: performance.now() - started,
  };
}
