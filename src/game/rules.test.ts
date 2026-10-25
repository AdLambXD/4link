import { describe, expect, it } from 'vitest';
import {
  BOARD_SIZES,
  CELL_COUNT,
  COLS,
  ROWS,
  SIZE_WIN,
  createGame,
  drop,
  legalMoves,
  lineAt,
  makeConfig,
  normalizeConfig,
  type GameState,
} from './rules';

/** 依次落子，返回最终状态 */
function play(cols: number[], players = 2): GameState {
  let state = createGame(1, makeConfig(6, players));
  for (const col of cols) state = drop(state, col);
  return state;
}

describe('createGame', () => {
  it('生成空棋盘', () => {
    const g = createGame();
    expect(g.board).toHaveLength(CELL_COUNT);
    expect(g.board.every((c) => c === 0)).toBe(true);
    expect(g.heights).toEqual([0, 0, 0, 0, 0, 0]);
    expect(g.turn).toBe(1);
    expect(g.status).toBe('playing');
    expect(g.count).toBe(0);
    expect(g.config.win).toBe(4);
    expect(g.config.players).toBe(2);
  });

  it('按尺寸生成 8×8 / 16×16', () => {
    const g8 = createGame(1, makeConfig(8, 2));
    expect(g8.board).toHaveLength(64);
    expect(g8.heights).toHaveLength(8);
    expect(g8.config.win).toBe(4);

    const g16 = createGame(1, makeConfig(16, 4));
    expect(g16.board).toHaveLength(256);
    expect(g16.heights).toHaveLength(16);
    expect(g16.config.win).toBe(5);
    expect(g16.config.players).toBe(4);
  });

  it('配置会被收敛到合法范围', () => {
    const g = createGame(1, normalizeConfig({ cols: 10, rows: 10, win: 20, players: 99 }));
    expect(g.config.win).toBe(10);
    expect(g.config.players).toBe(6);
  });

  it('尺寸与连子数映射固定', () => {
    expect(BOARD_SIZES).toEqual([6, 8, 12, 16]);
    expect(SIZE_WIN[6]).toBe(4);
    expect(SIZE_WIN[8]).toBe(4);
    expect(SIZE_WIN[12]).toBe(5);
    expect(SIZE_WIN[16]).toBe(5);
  });
});

describe('重力落子', () => {
  it('落在该列最底部', () => {
    let g = createGame();
    g = drop(g, 2);
    expect(g.board[0 * COLS + 2]).toBe(1);
    expect(g.heights[2]).toBe(1);

    g = drop(g, 2);
    expect(g.board[1 * COLS + 2]).toBe(2);
    expect(g.heights[2]).toBe(2);
  });

  it('不修改原状态', () => {
    const g = createGame();
    const before = g.board.slice();
    const next = drop(g, 0);
    expect(next).not.toBe(g);
    expect(g.board).toEqual(before);
    expect(g.count).toBe(0);
    expect(next.count).toBe(1);
  });

  it('满列之后不能再落子，且返回同一引用', () => {
    let g = createGame();
    for (let i = 0; i < ROWS; i++) g = drop(g, 3);
    expect(g.heights[3]).toBe(ROWS);
    expect(drop(g, 3)).toBe(g);
    expect(legalMoves(g)).not.toContain(3);
  });

  it('列满 6 子后交替落子，双方各 3 个', () => {
    const g = play([0, 0, 0, 0, 0, 0]);
    let p1 = 0;
    let p2 = 0;
    for (let r = 0; r < ROWS; r++) {
      if (g.board[r * COLS + 0] === 1) p1++;
      else p2++;
    }
    expect(p1).toBe(3);
    expect(p2).toBe(3);
  });

  it('3 人按 1 → 2 → 3 → 1 轮转', () => {
    let g = createGame(1, makeConfig(6, 3));
    expect(g.turn).toBe(1);
    g = drop(g, 0);
    expect(g.turn).toBe(2);
    g = drop(g, 1);
    expect(g.turn).toBe(3);
    g = drop(g, 2);
    expect(g.turn).toBe(1);
    g = drop(g, 3);
    expect(g.turn).toBe(2);
  });

  it('6 人时轮转一整圈回到先手', () => {
    let g = createGame(1, makeConfig(6, 6));
    for (let i = 0; i < 5; i++) {
      g = drop(g, i);
      expect(g.turn).toBe(i + 2);
    }
    g = drop(g, 5);
    expect(g.turn).toBe(1);
  });
});

describe('胜负判定', () => {
  it('横向四连（文档示例 A，第 7 手）', () => {
    const g = play([0, 5, 1, 5, 2, 5, 3]);
    expect(g.status).toBe('won');
    expect(g.winner).toBe(1);
    expect(g.count).toBe(7);
    expect(g.winLine).toHaveLength(4);
    // 底行 A1-D1
    expect(g.winLine).toEqual([0, 1, 2, 3]);
  });

  it('竖向四连', () => {
    const g = play([2, 0, 2, 1, 2, 3, 2]);
    expect(g.status).toBe('won');
    expect(g.winner).toBe(1);
    expect(g.winLine).toEqual([2, 8, 14, 20]);
  });

  it('斜向四连 ↗（文档示例 B，第 11 手）', () => {
    const g = play([0, 1, 1, 2, 4, 2, 3, 3, 2, 3, 3]);
    expect(g.status).toBe('won');
    expect(g.winner).toBe(1);
    expect(g.count).toBe(11);
    // A1, B2, C3, D4
    expect(g.winLine).toEqual([0, 7, 14, 21]);
  });

  it('斜向四连 ↘（直接检查判线）', () => {
    // D1, C2, B3, A4
    const board = new Array<0 | 1 | 2>(36).fill(0);
    board[0 * COLS + 3] = 1;
    board[1 * COLS + 2] = 1;
    board[2 * COLS + 1] = 1;
    board[3 * COLS + 0] = 1;
    expect(lineAt(board, 1, 2, 1)).toEqual([3, 8, 13, 18]);
    expect(lineAt(board, 1, 2, 2)).toBeNull();
  });

  it('连成 5 个也算赢', () => {
    const board = new Array(36).fill(0) as (0 | 1 | 2)[];
    for (let c = 0; c < 5; c++) board[c] = 1;
    const line = lineAt(board, 0, 2, 1);
    expect(line).toHaveLength(5);
  });

  it('3 人局中 1 号玩家横四获胜', () => {
    const g = play([0, 5, 5, 1, 5, 4, 2, 4, 4, 3], 3);
    expect(g.status).toBe('won');
    expect(g.winner).toBe(1);
    expect(g.count).toBe(10);
    expect(g.winLine).toEqual([0, 1, 2, 3]);
    expect(g.turn).toBe(1);
  });

  it('12×12 需要连 5 个', () => {
    const config = makeConfig(12, 2);
    const board = new Array<0 | 1 | 2>(144).fill(0);
    for (let c = 0; c < 4; c++) board[c] = 1;
    expect(lineAt(board, 0, 1, 1, config)).toBeNull();
    board[4] = 1;
    expect(lineAt(board, 0, 2, 1, config)).toHaveLength(5);
  });

  it('分出胜负后 turn 停留在获胜方', () => {
    const g = play([0, 5, 1, 5, 2, 5, 3]);
    expect(g.turn).toBe(1);
  });
});

describe('perft', () => {
  function perft(state: GameState, depth: number): number {
    if (depth === 0 || state.status !== 'playing') return 1;
    let total = 0;
    for (const col of legalMoves(state)) total += perft(drop(state, col), depth - 1);
    return total;
  }

  it('6×6 前 6 层应为 6 的幂', () => {
    const g = createGame();
    const expected = [6, 36, 216, 1296, 7776, 46656];
    for (let d = 1; d <= expected.length; d++) {
      expect(perft(g, d)).toBe(expected[d - 1]);
    }
  });

  it('8×8 前 3 层应为 8 的幂', () => {
    const g = createGame(1, makeConfig(8, 2));
    const expected = [8, 64, 512];
    for (let d = 1; d <= expected.length; d++) {
      expect(perft(g, d)).toBe(expected[d - 1]);
    }
  });
});
