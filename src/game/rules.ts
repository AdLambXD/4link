/**
 * 4Link 规则核心（纯函数，无 DOM 依赖）。
 *
 * 棋盘 6 列 × 6 行，行号从下往上 0..5，列号从左往右 0..5。
 * 单元格数组下标 = row * COLS + col。
 */

export const COLS = 6;
export const ROWS = 6;
export const WIN = 4;
export const CELL_COUNT = COLS * ROWS;

export type Player = 1 | 2;
export type Cell = 0 | Player;
export type Status = 'playing' | 'won' | 'draw';

export interface GameState {
  readonly board: readonly Cell[];
  /** 每列已落子数，heights[c] 同时也是该列的落点行号 */
  readonly heights: readonly number[];
  readonly turn: Player;
  readonly status: Status;
  readonly winner: Player | null;
  /** 获胜的格子下标（可能多于 4 个） */
  readonly winLine: readonly number[] | null;
  /** 最后一手落子的格子下标 */
  readonly last: number | null;
  readonly count: number;
}

export const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export function idx(row: number, col: number): number {
  return row * COLS + col;
}

export function rowOf(cell: number): number {
  return Math.floor(cell / COLS);
}

export function colOf(cell: number): number {
  return cell % COLS;
}

export function other(player: Player): Player {
  return player === 1 ? 2 : 1;
}

export function createGame(turn: Player = 1): GameState {
  return {
    board: new Array<Cell>(CELL_COUNT).fill(0),
    heights: new Array<number>(COLS).fill(0),
    turn,
    status: 'playing',
    winner: null,
    winLine: null,
    last: null,
    count: 0,
  };
}

export function canDrop(state: GameState, col: number): boolean {
  return (
    state.status === 'playing' &&
    Number.isInteger(col) &&
    col >= 0 &&
    col < COLS &&
    state.heights[col] < ROWS
  );
}

export function legalMoves(state: GameState): number[] {
  if (state.status !== 'playing') return [];
  const moves: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (state.heights[c] < ROWS) moves.push(c);
  }
  return moves;
}

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // 横
  [1, 0], // 竖
  [1, 1], // ↗
  [1, -1], // ↘
];

/**
 * 以 (row, col) 为中心，检查该玩家是否连成 4 个。
 * 返回整条连线的格子下标（升序），否则返回 null。
 */
export function lineAt(
  board: readonly Cell[],
  row: number,
  col: number,
  player: Player,
): number[] | null {
  for (const [dr, dc] of DIRECTIONS) {
    const cells: number[] = [idx(row, col)];

    for (const sign of [-1, 1] as const) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[idx(r, c)] === player) {
        cells.push(idx(r, c));
        r += dr * sign;
        c += dc * sign;
      }
    }

    if (cells.length >= WIN) {
      return cells.sort((a, b) => a - b);
    }
  }
  return null;
}

/**
 * 落子。非法落子直接返回原状态（引用不变，方便上层判断）。
 */
export function drop(state: GameState, col: number): GameState {
  if (!canDrop(state, col)) return state;

  const row = state.heights[col];
  const cell = idx(row, col);

  const board = state.board.slice();
  board[cell] = state.turn;

  const heights = state.heights.slice();
  heights[col] = row + 1;

  const line = lineAt(board, row, col, state.turn);
  const count = state.count + 1;

  const status: Status = line ? 'won' : count === CELL_COUNT ? 'draw' : 'playing';

  return {
    board,
    heights,
    // 分出胜负后不再换手，方便 UI 显示「谁赢的」
    turn: line ? state.turn : other(state.turn),
    status,
    winner: line ? state.turn : null,
    winLine: line,
    last: cell,
    count,
  };
}

export interface Session {
  readonly current: GameState;
  readonly past: readonly GameState[];
}

export function createSession(turn: Player = 1): Session {
  return { current: createGame(turn), past: [] };
}

export type SessionAction =
  | { type: 'play'; col: number }
  | { type: 'undo'; steps: number }
  | { type: 'reset'; turn?: Player };

export function sessionReducer(state: Session, action: SessionAction): Session {
  switch (action.type) {
    case 'play': {
      const next = drop(state.current, action.col);
      if (next === state.current) return state;
      return { current: next, past: [...state.past, state.current] };
    }
    case 'undo': {
      if (state.past.length === 0) return state;
      const steps = Math.min(Math.max(1, action.steps), state.past.length);
      const cut = state.past.length - steps;
      return { current: state.past[cut], past: state.past.slice(0, cut) };
    }
    case 'reset':
      return createSession(action.turn ?? 1);
  }
}
