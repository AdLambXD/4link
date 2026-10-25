/**
 * 4Link 规则核心（纯函数，无 DOM 依赖）。
 *
 * 棋盘是正方形（6 / 8 / 12 / 16），行号从下往上 0..rows-1，列号从左往右。
 * 单元格数组下标 = row * cols + col。
 * 2–6 人时按 turn 轮流落子，1 → 2 → … → players → 1。
 */

export const COLS = 6;
export const ROWS = 6;
export const WIN = 4;
export const CELL_COUNT = COLS * ROWS;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

/** 可选棋盘尺寸；小盘 4 连，大盘 5 连。 */
export const BOARD_SIZES = [6, 8, 12, 16] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];

export const SIZE_WIN: Record<BoardSize, number> = {
  6: 4,
  8: 4,
  12: 5,
  16: 5,
};

export interface GameConfig {
  readonly cols: number;
  readonly rows: number;
  readonly win: number;
  readonly players: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  cols: COLS,
  rows: ROWS,
  win: WIN,
  players: 2,
};

export type Player = 1 | 2 | 3 | 4 | 5 | 6;
/** AI 与双人战绩只处理两位玩家。 */
export type DuoPlayer = 1 | 2;
export type Cell = 0 | Player;
export type Status = 'playing' | 'won' | 'draw';

export interface GameState {
  readonly config: GameConfig;
  readonly board: readonly Cell[];
  /** 每列已落子数，heights[c] 同时也是该列的落点行号 */
  readonly heights: readonly number[];
  readonly turn: Player;
  readonly status: Status;
  readonly winner: Player | null;
  /** 获胜的格子下标（可能多于 win 个） */
  readonly winLine: readonly number[] | null;
  /** 最后一手落子的格子下标 */
  readonly last: number | null;
  readonly count: number;
}

/** 围棋式列标，跳过 I。 */
export const COL_LABELS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
] as const;

export function colLabel(col: number): string {
  return COL_LABELS[col] ?? String(col + 1);
}

export function makeConfig(size: BoardSize = 6, players = 2): GameConfig {
  return {
    cols: size,
    rows: size,
    win: SIZE_WIN[size],
    players: clampPlayers(players),
  };
}

function clampPlayers(players: number): number {
  if (!Number.isFinite(players)) return MIN_PLAYERS;
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.round(players)));
}

export function normalizeConfig(config: GameConfig): GameConfig {
  const cols = Math.max(3, Math.round(config.cols));
  const rows = Math.max(3, Math.round(config.rows));
  const win = Math.min(Math.max(2, Math.round(config.win)), Math.max(cols, rows));
  return { cols, rows, win, players: clampPlayers(config.players) };
}

export function sameConfig(a: GameConfig, b: GameConfig): boolean {
  return a.cols === b.cols && a.rows === b.rows && a.win === b.win && a.players === b.players;
}

export function idx(row: number, col: number, cols = COLS): number {
  return row * cols + col;
}

export function rowOf(cell: number, cols = COLS): number {
  return Math.floor(cell / cols);
}

export function colOf(cell: number, cols = COLS): number {
  return cell % cols;
}

export function other(player: DuoPlayer): DuoPlayer {
  return player === 1 ? 2 : 1;
}

export function nextPlayer(turn: Player, players: number): Player {
  return ((turn % players) + 1) as Player;
}

export function seatName(player: Player): string {
  if (player === 1) return '先手';
  if (player === 2) return '后手';
  return `玩家 ${player}`;
}

export function createGame(
  turn: Player = 1,
  config: GameConfig = DEFAULT_CONFIG,
): GameState {
  const safe = normalizeConfig(config);
  return {
    config: safe,
    board: new Array<Cell>(safe.cols * safe.rows).fill(0),
    heights: new Array<number>(safe.cols).fill(0),
    turn: Math.min(Math.max(1, turn), safe.players) as Player,
    status: 'playing',
    winner: null,
    winLine: null,
    last: null,
    count: 0,
  };
}

export function canDrop(state: GameState, col: number): boolean {
  const { cols, rows } = state.config;
  return (
    state.status === 'playing' &&
    Number.isInteger(col) &&
    col >= 0 &&
    col < cols &&
    state.heights[col] < rows
  );
}

export function legalMoves(state: GameState): number[] {
  if (state.status !== 'playing') return [];
  const moves: number[] = [];
  for (let c = 0; c < state.config.cols; c++) {
    if (state.heights[c] < state.config.rows) moves.push(c);
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
 * 以 (row, col) 为中心，检查该玩家是否连成 config.win 个。
 * 返回整条连线的格子下标（升序），否则返回 null。
 */
export function lineAt(
  board: readonly Cell[],
  row: number,
  col: number,
  player: Player,
  config: GameConfig = DEFAULT_CONFIG,
): number[] | null {
  const { cols, rows, win } = normalizeConfig(config);

  for (const [dr, dc] of DIRECTIONS) {
    const cells: number[] = [idx(row, col, cols)];

    for (const sign of [-1, 1] as const) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < rows && c >= 0 && c < cols && board[idx(r, c, cols)] === player) {
        cells.push(idx(r, c, cols));
        r += dr * sign;
        c += dc * sign;
      }
    }

    if (cells.length >= win) {
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

  const { cols, rows, players } = state.config;
  const row = state.heights[col];
  const cell = idx(row, col, cols);

  const board = state.board.slice();
  board[cell] = state.turn;

  const heights = state.heights.slice();
  heights[col] = row + 1;

  const line = lineAt(board, row, col, state.turn, state.config);
  const count = state.count + 1;
  const drawn = count === cols * rows;

  const status: Status = line ? 'won' : drawn ? 'draw' : 'playing';

  return {
    config: state.config,
    board,
    heights,
    // 分出胜负后不再换手，方便 UI 显示「谁赢的」
    turn: line || drawn ? state.turn : nextPlayer(state.turn, players),
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

export function createSession(
  turn: Player = 1,
  config: GameConfig = DEFAULT_CONFIG,
): Session {
  return { current: createGame(turn, config), past: [] };
}

export type SessionAction =
  | { type: 'play'; col: number }
  | { type: 'undo'; steps: number }
  | { type: 'reset'; turn?: Player; config?: GameConfig };

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
      return createSession(
        action.turn ?? 1,
        action.config ?? state.current.config,
      );
  }
}
