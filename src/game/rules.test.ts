import { describe, expect, it } from 'vitest';
import {
  CELL_COUNT,
  COLS,
  ROWS,
  createGame,
  drop,
  legalMoves,
  lineAt,
  type GameState,
} from './rules';

/** 依次落子，返回最终状态 */
function play(cols: number[]): GameState {
  let state = createGame();
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

  it('分出胜负后 turn 停留在获胜方', () => {
    const g = play([0, 5, 1, 5, 2, 5, 3]);
    expect(g.turn).toBe(1);
  });
});

describe('perft（前 6 层应为 6 的幂）', () => {
  function perft(state: GameState, depth: number): number {
    if (depth === 0 || state.status !== 'playing') return 1;
    let total = 0;
    for (const col of legalMoves(state)) total += perft(drop(state, col), depth - 1);
    return total;
  }

  it('1..6 层', () => {
    const g = createGame();
    const expected = [6, 36, 216, 1296, 7776, 46656];
    for (let d = 1; d <= expected.length; d++) {
      expect(perft(g, d)).toBe(expected[d - 1]);
    }
  });
});
