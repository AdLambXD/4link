import { describe, expect, it } from 'vitest';
import { CELL_COUNT, COLS } from '../game/rules';
import { chooseMove, type Difficulty } from './engine';

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
  });

  it('满盘返回 -1', () => {
    const board = emptyBoard();
    for (let i = 0; i < CELL_COUNT; i++) board[i] = (i % 2) + 1;
    const result = chooseMove(board, [6, 6, 6, 6, 6, 6], 1, 'normal');
    expect(result.col).toBe(-1);
  });
});
