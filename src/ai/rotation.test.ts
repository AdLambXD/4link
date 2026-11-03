import { describe, expect, it } from 'vitest';
import { makeConfig, type Cell } from '../game/rules';
import { chooseRotationMove } from './rotation';

function emptyBoard(size: number): Cell[] {
  return new Array<Cell>(size * size).fill(0);
}

describe('旋转模式 AI', () => {
  it('空盘返回合法列', () => {
    const result = chooseRotationMove(
      emptyBoard(6),
      new Array(6).fill(0),
      1,
      'normal',
      makeConfig(6, 2),
    );

    expect(result.col).toBeGreaterThanOrEqual(0);
    expect(result.col).toBeLessThan(6);
  });

  it('有一手胜时立刻获胜', () => {
    const board = emptyBoard(6);
    board[0] = 1;
    board[1] = 1;
    board[2] = 1;

    const result = chooseRotationMove(
      board,
      [1, 1, 1, 0, 0, 0],
      1,
      'hard',
      makeConfig(6, 2),
    );

    expect(result.col).toBe(3);
  });

  it('8×8 困难档在时间预算内返回合法列', () => {
    const board = emptyBoard(8);
    const heights = new Array(8).fill(0);
    board[0] = 1;
    heights[0] = 1;
    board[0 * 8 + 1] = 2;
    heights[1] = 1;

    const started = performance.now();
    const result = chooseRotationMove(
      board,
      heights,
      1,
      'hard',
      makeConfig(8, 2),
    );

    expect(result.col).toBeGreaterThanOrEqual(0);
    expect(result.col).toBeLessThan(8);
    expect(performance.now() - started).toBeLessThan(3000);
  });
});
