/**
 * 旋转模式的规则包装。
 *
 * 每落一子，棋盘顺时针旋转 90°，棋子再朝新的“下方”塌落。
 * 旋转或塌落后形成的四连同样算胜利，任何一方都算；
 * 双方同时成线时，落子方优先。
 *
 * 与无尽模式一样，这里只做规则包装，`rules.ts` 保持通用。
 */

import {
  drop,
  idx,
  lineAt,
  type Cell,
  type GameState,
  type Player,
} from './rules';

export interface RotationMove {
  readonly state: GameState;
  /** 这一手之后棋盘是否旋转过 */
  readonly rotated: boolean;
  /** 旋转 / 塌落之后形成的胜者；落子瞬间直接获胜时为 null */
  readonly rotationWin: Player | null;
  /** 落子后、旋转前的局面；没有旋转时为 null。界面用它在旋转前先播放落子动画。 */
  readonly dropped: GameState | null;
  /** 每颗棋子在塌落阶段还要下落几格，键为最终棋盘索引；没有旋转时为 null。 */
  readonly falls: Readonly<Record<number, number>> | null;
}

/**
 * 顺时针旋转 90°。
 *
 * 行 0 是屏幕底部：左下角转到左上角，再沿新棋盘向下塌落。
 * 旋转后行列互换，新棋盘的列数等于原来的行数。
 */
export function rotateClockwise(
  board: readonly Cell[],
  cols: number,
  rows: number,
): Cell[] {
  const out = new Array<Cell>(cols * rows).fill(0);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 旧坐标 (r, c) → 新坐标 (行 = cols - 1 - c, 列 = r)。
      out[(cols - 1 - c) * rows + r] = board[r * cols + c];
    }
  }
  return out;
}

/**
 * 朝新的下方塌落：逐列把棋子压到底部，保持原来的上下顺序。
 *
 * 旋转会改变“下”的方向，所以原本贴在左边的棋子会变成新的底部。
 */
export function settle(
  board: readonly Cell[],
  cols: number,
  rows: number,
): { board: Cell[]; heights: number[] } {
  const out = new Array<Cell>(cols * rows).fill(0);
  const heights = new Array<number>(cols).fill(0);

  for (let c = 0; c < cols; c++) {
    let h = 0;
    for (let r = 0; r < rows; r++) {
      const value = board[r * cols + c];
      if (value !== 0) {
        out[h * cols + c] = value;
        h += 1;
      }
    }
    heights[c] = h;
  }

  return { board: out, heights };
}

/** 在棋盘上找任意一方的连线；`order` 决定扫描优先级。 */
export function findAnyLine(
  board: readonly Cell[],
  config: GameState['config'],
  order: readonly Player[],
): { winner: Player; line: number[] } | null {
  for (const player of order) {
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (board[idx(r, c, config.cols)] !== player) continue;
        const line = lineAt(board, r, c, player, config);
        if (line) return { winner: player, line };
      }
    }
  }
  return null;
}

/** 出牌顺序：落子方优先，然后其余玩家。 */
function scanOrder(mover: Player, players: number): Player[] {
  const order: Player[] = [mover];
  for (let p = 1; p <= players; p++) {
    if (p !== mover) order.push(p as Player);
  }
  return order;
}

/**
 * 旋转模式落子：落子 → 顺时针旋转 → 塌落 → 全场判胜。
 *
 * 落子瞬间已经分出胜负或满盘和棋时不再旋转，直接结算。
 */
export function playRotation(state: GameState, col: number): RotationMove {
  const mover = state.turn;
  const moved = drop(state, col);
  if (moved === state) {
    return {
      state,
      rotated: false,
      rotationWin: null,
      dropped: null,
      falls: null,
    };
  }

  // 落子瞬间就成四或满盘：对局结束，不再旋转。
  if (moved.status !== 'playing' || moved.last === null) {
    return {
      state: moved,
      rotated: false,
      rotationWin: null,
      dropped: null,
      falls: null,
    };
  }

  const { cols, rows, players } = moved.config;

  // 用哨兵标记刚落下的棋子，旋转 + 塌落后还能找到它。
  const marked: number[] = moved.board.slice();
  marked[moved.last] = 9;
  const rotated = rotateClockwise(marked as Cell[], cols, rows);
  const settled = settle(rotated, cols, rows);

  const board = settled.board.slice() as number[];
  let last: number | null = null;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === 9) {
      board[i] = mover;
      last = i;
    }
  }

  // 记录每颗棋子在塌落前的位置：键是最终索引，值是还要下落的格数。
  const falls: Record<number, number> = {};
  for (let c = 0; c < cols; c++) {
    let finalRow = 0;
    for (let r = 0; r < rows; r++) {
      if (rotated[r * cols + c] === 0) continue;
      falls[finalRow * cols + c] = r - finalRow;
      finalRow += 1;
    }
  }

  const found = findAnyLine(board as Cell[], moved.config, scanOrder(mover, players));

  if (found) {
    return {
      state: {
        ...moved,
        board: board as Cell[],
        heights: settled.heights,
        last,
        status: 'won',
        winner: found.winner,
        winLine: found.line,
        turn: found.winner,
      },
      rotated: true,
      rotationWin: found.winner,
      dropped: moved,
      falls,
    };
  }

  const drawn = moved.count === cols * rows;

  return {
    state: {
      ...moved,
      board: board as Cell[],
      heights: settled.heights,
      last,
      status: drawn ? 'draw' : 'playing',
      winner: null,
      winLine: null,
    },
    rotated: true,
    rotationWin: null,
    dropped: moved,
    falls,
  };
}
