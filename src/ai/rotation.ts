/**
 * 旋转模式的 AI。
 *
 * 普通引擎假设“落子后不再移动”，而旋转模式每手都会旋转并塌落，
 * 所以这里单独做一个浅层 negamax：每个节点都完整模拟
 * 落子 → 判胜 → 旋转 → 塌落 → 全场判胜。
 *
 * 棋盘只有 6×6 / 8×8，浅层搜索已经够用，也不需要 Zobrist 表。
 */

import {
  lineAt,
  other,
  type Cell,
  type DuoPlayer,
  type GameConfig,
} from '../game/rules';
import { rotateClockwise, settle } from '../game/rotation';
import { staticScore, type Difficulty, type MoveResult } from './engine';

const WIN_SCORE = 100_000;
const INF = 1_000_000;

interface Position {
  readonly board: readonly Cell[];
  readonly heights: readonly number[];
}

interface Applied {
  readonly position: Position;
  readonly winner: DuoPlayer | null;
  readonly draw: boolean;
}

let nodes = 0;
let aborted = false;
let deadline = 0;

function legalMoves(pos: Position, config: GameConfig): number[] {
  const moves: number[] = [];
  for (let c = 0; c < config.cols; c++) {
    if (pos.heights[c] < config.rows) moves.push(c);
  }
  return moves;
}

/** 中心优先，和普通引擎的直觉一致。 */
function orderMoves(moves: readonly number[], cols: number): number[] {
  const mid = (cols - 1) / 2;
  return [...moves].sort(
    (a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b,
  );
}

function findWinner(
  board: readonly Cell[],
  config: GameConfig,
  mover: DuoPlayer,
): DuoPlayer | null {
  for (const player of [mover, other(mover)] as const) {
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (board[r * config.cols + c] !== player) continue;
        if (lineAt(board, r, c, player, config)) return player;
      }
    }
  }
  return null;
}

/** 模拟一手：落子 → 立即判胜 → 旋转 + 塌落 → 全场判胜。 */
function apply(
  pos: Position,
  col: number,
  player: DuoPlayer,
  config: GameConfig,
): Applied | null {
  const { cols, rows } = config;
  const row = pos.heights[col];
  if (row === undefined || row >= rows) return null;

  const board = pos.board.slice();
  board[row * cols + col] = player;
  const heights = pos.heights.slice();
  heights[col] = row + 1;

  if (lineAt(board, row, col, player, config)) {
    return { position: { board, heights }, winner: player, draw: false };
  }

  const count = heights.reduce((sum, value) => sum + value, 0);
  if (count === cols * rows) {
    return { position: { board, heights }, winner: null, draw: true };
  }

  const rotated = rotateClockwise(board, cols, rows);
  const settled = settle(rotated, cols, rows);
  const winner = findWinner(settled.board, config, player);
  const full = settled.board.every((value) => value !== 0);

  return {
    position: settled,
    winner,
    draw: winner === null && full,
  };
}

function search(
  pos: Position,
  me: DuoPlayer,
  depth: number,
  alpha: number,
  beta: number,
  config: GameConfig,
  ply: number,
): number {
  nodes += 1;
  if ((nodes & 255) === 0 && performance.now() > deadline) aborted = true;
  if (aborted) return staticScore(pos.board, pos.heights, config, me);
  if (depth <= 0) return staticScore(pos.board, pos.heights, config, me);

  const moves = orderMoves(legalMoves(pos, config), config.cols);
  let best = -INF;

  for (const col of moves) {
    const applied = apply(pos, col, me, config);
    if (!applied) continue;

    let value: number;
    if (applied.winner === me) value = WIN_SCORE - ply;
    else if (applied.winner !== null) value = -WIN_SCORE + ply;
    else if (applied.draw) value = 0;
    else {
      value = -search(
        applied.position,
        other(me),
        depth - 1,
        -beta,
        -alpha,
        config,
        ply + 1,
      );
    }

    if (value > best) best = value;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
    if (aborted) break;
  }

  return best === -INF ? 0 : best;
}

function depthFor(difficulty: Difficulty, size: number): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'normal') return size <= 6 ? 3 : 2;
  return size <= 6 ? 5 : 4;
}

function budgetFor(difficulty: Difficulty, size: number): number {
  if (difficulty === 'easy') return 80;
  if (difficulty === 'normal') return 420;
  return size <= 6 ? 800 : 700;
}

function result(
  col: number,
  score: number,
  depth: number,
  started: number,
): MoveResult {
  return {
    col,
    score,
    depth,
    nodes,
    ms: performance.now() - started,
  };
}

export function chooseRotationMove(
  board: readonly number[],
  heights: readonly number[],
  player: DuoPlayer,
  difficulty: Difficulty,
  config: GameConfig,
): MoveResult {
  const started = performance.now();
  nodes = 0;
  aborted = false;

  const pos: Position = { board: board as Cell[], heights };
  const moves = orderMoves(legalMoves(pos, config), config.cols);
  if (moves.length === 0) return result(-1, 0, 0, started);

  const size = Math.min(config.cols, config.rows);

  // 能一手赢就赢，任何难度都不错过。
  for (const col of moves) {
    const applied = apply(pos, col, player, config);
    if (applied?.winner === player) {
      return result(col, WIN_SCORE, 1, started);
    }
  }

  // 简单档偶尔随便走一步。
  if (difficulty === 'easy' && Math.random() < 0.45) {
    const col = moves[Math.floor(Math.random() * moves.length)];
    return result(col, 0, 0, started);
  }

  deadline = started + budgetFor(difficulty, size);
  const limit = depthFor(difficulty, size);

  let bestCol = moves[0];
  let bestScore = -INF;
  let reached = 0;

  for (let depth = 1; depth <= limit; depth++) {
    let alpha = -INF;
    let localBest = -INF;
    let localCol = moves[0];

    for (const col of moves) {
      const applied = apply(pos, col, player, config);
      if (!applied) continue;

      let value: number;
      if (applied.winner === player) value = WIN_SCORE;
      else if (applied.winner !== null) value = -WIN_SCORE;
      else if (applied.draw) value = 0;
      else {
        value = -search(
          applied.position,
          other(player),
          depth - 1,
          -INF,
          -alpha,
          config,
          1,
        );
      }

      if (value > localBest) {
        localBest = value;
        localCol = col;
      }
      if (value > alpha) alpha = value;
      if (aborted) break;
    }

    if (aborted) break;
    bestCol = localCol;
    bestScore = localBest;
    reached = depth;

    if (Math.abs(bestScore) >= WIN_SCORE - 100) break;
    if (performance.now() - started > budgetFor(difficulty, size) * 0.6) break;
  }

  return result(bestCol, bestScore, reached, started);
}
