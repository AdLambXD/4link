/**
 * 无尽防守模式的规则包装。
 *
 * 与普通对局的差别只有两点：
 * 1. 玩家（防守方）连成四子不算胜利，棋子留在盘上继续当墙；
 * 2. 棋盘填满时整体上移一行：顶行被移出，其余棋子位置不变。
 *
 * 这两条都只作用于无尽模式，`rules.ts` 本身仍保持通用。
 */

import {
  drop,
  other,
  nextPlayer,
  type DuoPlayer,
  type GameState,
} from './rules';

export interface EndlessMove {
  readonly state: GameState;
  /** 这一手之后棋盘是否上移了一行 */
  readonly scrolled: boolean;
  /** 玩家这一手成四但被忽略 */
  readonly ignoredWin: boolean;
}

export function isEndlessOver(state: GameState, ai: DuoPlayer): boolean {
  return state.status === 'won' && state.winner === ai;
}

function isFull(state: GameState): boolean {
  return state.count === state.config.cols * state.config.rows;
}

/**
 * 满盘上移一行。
 *
 * 满盘时每一列都顶到最上面，所以“整盘上移 + 重力回落”的结果就是
 * 清空顶行、其余棋子不动。回合交给下一手。
 */
export function scrollBoard(state: GameState): GameState {
  if (!isFull(state)) return state;

  const { cols, rows } = state.config;
  const board = state.board.slice();
  const top = (rows - 1) * cols;
  for (let c = 0; c < cols; c++) board[top + c] = 0;

  return {
    ...state,
    board,
    heights: new Array<number>(cols).fill(rows - 1),
    turn: nextPlayer(state.turn, state.config.players),
    status: 'playing',
    winner: null,
    winLine: null,
    last: null,
    count: state.count - cols,
  };
}

/**
 * 无尽模式落子：正常落子后忽略防守方的成四，再处理满盘上移。
 *
 * AI 在填满棋盘的那一手上成四时，胜利优先，不触发上移。
 */
export function playEndless(
  state: GameState,
  col: number,
  human: DuoPlayer,
): EndlessMove {
  const mover = state.turn;
  const moved = drop(state, col);
  if (moved === state) {
    return { state, scrolled: false, ignoredWin: false };
  }

  if (isEndlessOver(moved, other(human))) {
    return { state: moved, scrolled: false, ignoredWin: false };
  }

  let next = moved;
  let ignoredWin = false;

  if (next.status === 'won') {
    // 到这里只可能是玩家成四：清掉胜利标记，对局继续。
    ignoredWin = true;
    next = {
      ...next,
      status: 'playing',
      winner: null,
      winLine: null,
    };
  }

  if (isFull(next)) {
    return { state: scrollBoard(next), scrolled: true, ignoredWin };
  }

  if (ignoredWin) {
    next = {
      ...next,
      turn: nextPlayer(mover, next.config.players),
    };
  }

  return { state: next, scrolled: false, ignoredWin };
}
