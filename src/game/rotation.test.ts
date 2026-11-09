import { describe, expect, it } from 'vitest';
import { createPositionState } from './puzzle';
import {
  findAnyLine,
  playRotation,
  rotateClockwise,
  settle,
} from './rotation';
import type { Cell, GameState } from './rules';
import { makeConfig } from './rules';

function fromRows(rows: readonly string[], human: 1 | 2 = 1): GameState {
  return createPositionState({
    id: 'rotation-test',
    size: 6,
    human,
    turn: human,
    rows,
  });
}

function isGravityValid(state: GameState): boolean {
  const { cols, rows } = state.config;
  for (let c = 0; c < cols; c++) {
    let height = 0;
    while (height < rows && state.board[height * cols + c] !== 0) height++;
    if (state.heights[c] !== height) return false;
    for (let r = height; r < rows; r++) {
      if (state.board[r * cols + c] !== 0) return false;
    }
  }
  return true;
}

describe('顺时针旋转', () => {
  it('3×3 的映射符合顺时针 90°', () => {
    const board: Cell[] = [1, 2, 3, 4, 5, 6, 0, 1, 2];
    expect(rotateClockwise(board, 3, 3)).toEqual([
      3, 6, 2,
      2, 5, 1,
      1, 4, 0,
    ]);
  });

  it('旋转四次回到原样', () => {
    const board: Cell[] = [1, 2, 0, 0, 1, 2, 2, 0, 1];
    let next = board;
    for (let i = 0; i < 4; i++) next = rotateClockwise(next, 3, 3);
    expect(next).toEqual(board);
  });

  it('旋转后塌落，悬空棋子落到底部并保持顺序', () => {
    // 第 0 列：底 1、中间空、顶 2 → 塌落后变成 1、2。
    const board: Cell[] = [1, 0, 0, 0, 0, 0, 2, 0, 0];
    const result = settle(board, 3, 3);
    expect(result.board).toEqual([1, 0, 0, 2, 0, 0, 0, 0, 0]);
    expect(result.heights).toEqual([2, 0, 0]);
  });
});

describe('旋转模式落子', () => {
  it('落子瞬间成四时直接结束，不再旋转', () => {
    const state = fromRows([
      '......',
      '......',
      '......',
      '......',
      '......',
      'XXX..O',
    ]);
    const applied = playRotation(state, 3);

    expect(applied.rotated).toBe(false);
    expect(applied.state.status).toBe('won');
    expect(applied.state.winner).toBe(1);
    expect(applied.state.board[3]).toBe(1);
  });

  it('普通落子后旋转并塌落，轮次顺延', () => {
    const state = fromRows([
      '......',
      '......',
      '......',
      '......',
      '......',
      '......',
    ]);
    const applied = playRotation(state, 0);

    expect(applied.rotated).toBe(true);
    expect(applied.rotationWin).toBeNull();
    expect(applied.state.status).toBe('playing');
    expect(applied.state.count).toBe(1);
    expect(applied.state.turn).toBe(2);
    // 左下角的棋子顺时针转到左上角，再塌落回左下角。
    expect(applied.state.board[0]).toBe(1);
    expect(applied.state.heights).toEqual([1, 0, 0, 0, 0, 0]);
    expect(isGravityValid(applied.state)).toBe(true);

    // 动画元数据：落子后的局面停在左下角，旋转后才到左上角并下落。
    expect(applied.dropped).not.toBeNull();
    expect(applied.dropped?.board[0]).toBe(1);
    expect(applied.dropped?.heights).toEqual([1, 0, 0, 0, 0, 0]);
    // 这一子从旋转后的第 5 行一路落到底部，共下落 5 格。
    expect(applied.falls).toEqual({ 0: 5 });
  });

  it('落子瞬间结束时不产生动画元数据', () => {
    const state = fromRows([
      '......',
      '......',
      '......',
      '......',
      '......',
      'XXX..O',
    ]);
    const applied = playRotation(state, 3);

    expect(applied.dropped).toBeNull();
    expect(applied.falls).toBeNull();
  });

  it('falls 让每颗棋子从旋转后的位置接着下落', () => {
    const state = fromRows([
      '......',
      '......',
      '..X...',
      '.XO...',
      'XOO...',
      'XOO..X',
    ]);
    const applied = playRotation(state, 2);
    expect(applied.dropped).not.toBeNull();
    expect(applied.falls).not.toBeNull();

    const { cols, rows } = state.config;
    const rotated = rotateClockwise(applied.dropped!.board, cols, rows);
    for (const [key, fall] of Object.entries(applied.falls!)) {
      const i = Number(key);
      const finalRow = Math.floor(i / cols);
      const col = i % cols;
      const rotatedIndex = (finalRow + fall) * cols + col;
      // 下落前的位置（旋转后棋盘）与最终位置上必须是同一颗棋子。
      expect(rotated[rotatedIndex]).toBe(applied.state.board[i]);
    }
  });

  it('旋转后形成的四连算胜利，并重新映射连线', () => {
    // 每一行的最左棋子都是先手；旋转 + 塌落后会拼成底行五连。
    const state = fromRows([
      '......',
      '......',
      '..X...',
      '.XO...',
      'XOO...',
      'XOO..X',
    ]);
    const applied = playRotation(state, 2);

    expect(applied.rotated).toBe(true);
    expect(applied.rotationWin).toBe(1);
    expect(applied.state.status).toBe('won');
    expect(applied.state.winner).toBe(1);
    expect(applied.state.winLine?.length).toBeGreaterThanOrEqual(4);
    expect(applied.state.turn).toBe(1);
    expect(isGravityValid(applied.state)).toBe(true);
  });

  it('旋转后形成的对手四连同样判对手胜利', () => {
    const state = fromRows(
      [
        '......',
        '......',
        '...O..',
        '...XO.',
        '...XXO',
        '...XXO',
      ],
      2,
    );
    const applied = playRotation(state, 3);

    expect(applied.rotationWin).toBe(2);
    expect(applied.state.winner).toBe(2);
  });

  it('双方同时成线时落子方优先', () => {
    const config = makeConfig(6, 2);
    const found = findAnyLine(
      // 让双方都有连线的盘面：第 0 行先手四连，第 1 行后手四连。
      [
        1, 1, 1, 1, 0, 0,
        2, 2, 2, 2, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
      ] as Cell[],
      config,
      [1, 2],
    );

    expect(found?.winner).toBe(1);
  });

  it('非法落子返回原状态', () => {
    const state = fromRows([
      '......',
      '......',
      '......',
      '......',
      '......',
      '......',
    ]);
    expect(playRotation(state, 9).state).toBe(state);
  });
});
