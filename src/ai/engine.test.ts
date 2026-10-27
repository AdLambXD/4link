import { afterEach, describe, expect, it, vi } from 'vitest';
import { CELL_COUNT, COLS, makeConfig } from '../game/rules';
import { chooseMove, type Difficulty } from './engine';

afterEach(() => {
  vi.restoreAllMocks();
});

function emptyBoard(): number[] {
  return new Array<number>(CELL_COUNT).fill(0);
}

describe('chooseMove', () => {
  it('空盘返回合法列', () => {
    const result = chooseMove(emptyBoard(), new Array(6).fill(0), 1, 'normal');
    expect(result.col).toBeGreaterThanOrEqual(0);
    expect(result.col).toBeLessThan(COLS);
  });

  it('能一手赢时立刻赢', () => {
    const board = emptyBoard();
    board[0] = 1;
    board[1] = 1;
    board[2] = 1;
    const result = chooseMove(board, [1, 1, 1, 0, 0, 0], 1, 'normal');
    expect(result.col).toBe(3);
  });

  it('会挡对手的一手胜', () => {
    const board = emptyBoard();
    board[0] = 2;
    board[1] = 2;
    board[2] = 2;
    const result = chooseMove(board, [1, 1, 1, 0, 0, 0], 1, 'normal');
    expect(result.col).toBe(3);
  });

  it('简单档有概率错过自己的一手胜', () => {
    const board = emptyBoard();
    board[0] = 1;
    board[1] = 1;
    board[2] = 1;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = chooseMove(board, [1, 1, 1, 0, 0, 0], 1, 'easy');

    expect(result.col).not.toBe(3);
  });

  it('简单档通常会拿下自己的一手胜', () => {
    const board = emptyBoard();
    board[0] = 1;
    board[1] = 1;
    board[2] = 1;
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const result = chooseMove(board, [1, 1, 1, 0, 0, 0], 1, 'easy');

    expect(result.col).toBe(3);
  });

  it('简单档没有别的着法时仍然会赢', () => {
    const board = emptyBoard();
    board[30] = 1;
    board[31] = 1;
    board[32] = 1;
    for (let r = 0; r < 6; r++) {
      for (const c of [0, 1, 2, 4, 5]) {
        if (board[r * COLS + c] === 0) board[r * COLS + c] = 2;
      }
    }
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = chooseMove(board, [6, 6, 6, 5, 6, 6], 1, 'easy');

    expect(result.col).toBe(3);
  });

  it('普通档不会错过自己的一手胜', () => {
    const board = emptyBoard();
    board[0] = 1;
    board[1] = 1;
    board[2] = 1;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = chooseMove(board, [1, 1, 1, 0, 0, 0], 1, 'normal');

    expect(result.col).toBe(3);
  });

  it('简单档有概率漏挡对手的一手胜', () => {
    const board = emptyBoard();
    board[0] = 2;
    board[1] = 2;
    board[2] = 2;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = chooseMove(board, [1, 1, 1, 0, 0, 0], 1, 'easy');

    expect(result.col).not.toBe(3);
  });

  it('简单档通常会挡对手的一手胜', () => {
    const board = emptyBoard();
    board[0] = 2;
    board[1] = 2;
    board[2] = 2;
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const result = chooseMove(board, [1, 1, 1, 0, 0, 0], 1, 'easy');

    expect(result.col).toBe(3);
  });

  it('每一步都返回合法列（随机局面）', () => {
    const levels: Difficulty[] = ['easy', 'normal', 'hard'];
    for (let t = 0; t < 12; t++) {
      const board = emptyBoard();
      const heights = new Array(6).fill(0);
      const moves = Math.floor(Math.random() * 20);
      for (let m = 0; m < moves; m++) {
        const options: number[] = [];
        for (let c = 0; c < COLS; c++) if (heights[c] < 5) options.push(c);
        if (options.length === 0) break;
        const c = options[Math.floor(Math.random() * options.length)];
        board[heights[c] * COLS + c] = (m % 2) + 1;
        heights[c]++;
      }
      const player = ((moves % 2) + 1) as 1 | 2;
      const result = chooseMove(board, heights, player, levels[t % 3]);
      expect(result.col).toBeGreaterThanOrEqual(0);
      expect(result.col).toBeLessThan(COLS);
      expect(heights[result.col]).toBeLessThan(6);
    }
  }, 20_000);

  it('满盘返回 -1', () => {
    const board = emptyBoard();
    for (let i = 0; i < CELL_COUNT; i++) board[i] = (i % 2) + 1;
    const result = chooseMove(board, [6, 6, 6, 6, 6, 6], 1, 'normal');
    expect(result.col).toBe(-1);
  });

  it('8×8 仍能识别一手横四', () => {
    const config = makeConfig(8, 2);
    const board = new Array<number>(64).fill(0);
    board[0] = 1;
    board[1] = 1;
    board[2] = 1;
    const result = chooseMove(board, [1, 1, 1, 0, 0, 0, 0, 0], 1, 'normal', config);
    expect(result.col).toBe(3);
  });

  it('12×12 能识别第五子的一手胜', () => {
    const config = makeConfig(12, 2);
    const board = new Array<number>(144).fill(0);
    for (let c = 0; c < 4; c++) board[c] = 1;
    const result = chooseMove(
      board,
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      1,
      'normal',
      config,
    );
    expect(result.col).toBe(4);
  });

  it('16×16 空盘返回中心列', () => {
    const config = makeConfig(16, 2);
    const result = chooseMove(
      new Array<number>(256).fill(0),
      new Array<number>(16).fill(0),
      1,
      'easy',
      config,
    );
    expect(result.col).toBeGreaterThanOrEqual(6);
    expect(result.col).toBeLessThanOrEqual(9);
  });
});
