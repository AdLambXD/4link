import { describe, expect, it } from 'vitest';
import { createPositionState } from './puzzle';
import {
  isEndlessOver,
  playEndless,
  scrollBoard,
} from './endless';
import {
  makeConfig,
  type Cell,
  type GameState,
} from './rules';

const CHESS_ROWS = [
  '......',
  '......',
  '......',
  '......',
  'OOO...',
  'XXX...',
] as const;

function emptyState(): GameState {
  return createPositionState({
    id: 'endless-test',
    size: 6,
    human: 1,
    turn: 1,
    rows: CHESS_ROWS,
  });
}

/** 35 子、只差一格的棋盘；status 故意保持 playing，便于测试上移。 */
function almostFull(
  emptyCol: number,
  turn: 1 | 2,
  topRow: Partial<Record<number, Cell>> = {},
): GameState {
  const config = makeConfig(6, 2);
  const board: Cell[] = new Array<Cell>(36);
  for (let i = 0; i < 36; i++) {
    const row = Math.floor(i / 6);
    const col = i % 6;
    board[i] = (row + col) % 2 === 0 ? 1 : 2;
  }
  for (const [col, value] of Object.entries(topRow)) {
    if (value !== undefined) board[5 * 6 + Number(col)] = value;
  }
  board[5 * 6 + emptyCol] = 0;
  const heights = new Array<number>(6).fill(6);
  heights[emptyCol] = 5;
  return {
    config,
    board,
    heights,
    turn,
    status: 'playing',
    winner: null,
    winLine: null,
    last: null,
    count: 35,
  };
}

function isGravityValid(state: GameState): boolean {
  const { cols, rows } = state.config;
  for (let col = 0; col < cols; col++) {
    let height = 0;
    while (height < rows && state.board[height * cols + col] !== 0) height++;
    if (state.heights[col] !== height) return false;
    for (let row = height; row < rows; row++) {
      if (state.board[row * cols + col] !== 0) return false;
    }
  }
  return true;
}

describe('无尽模式', () => {
  it('玩家成四不算胜利，棋子留在盘上并换手', () => {
    const state = emptyState();
    const applied = playEndless(state, 3, 1);

    expect(applied.ignoredWin).toBe(true);
    expect(applied.scrolled).toBe(false);
    expect(applied.state.status).toBe('playing');
    expect(applied.state.winner).toBeNull();
    expect(applied.state.winLine).toBeNull();
    expect(applied.state.count).toBe(7);
    expect(applied.state.turn).toBe(2);
    expect(applied.state.board[3]).toBe(1);
  });

  it('玩家执后手时同样忽略自己的四连', () => {
    const base = createPositionState({
      id: 'endless-second',
      size: 6,
      human: 1,
      turn: 1,
      rows: ['......', '......', '......', '......', 'XXX...', 'OOO...'],
    });
    const state: GameState = { ...base, turn: 2 };

    const applied = playEndless(state, 3, 2);

    expect(applied.ignoredWin).toBe(true);
    expect(applied.state.status).toBe('playing');
    expect(applied.state.turn).toBe(1);
    expect(applied.state.board[3]).toBe(2);
  });

  it('AI 成四正常结束本局', () => {
    // 顶行 0–2 是 AI（2），第 3 格空着，落下即四连。
    const base = almostFull(3, 2, { 0: 2, 1: 2, 2: 2 });

    const applied = playEndless(base, 3, 1);

    expect(applied.state.status).toBe('won');
    expect(applied.state.winner).toBe(2);
    expect(isEndlessOver(applied.state, 2)).toBe(true);
    expect(applied.scrolled).toBe(false);
    expect(applied.state.count).toBe(36);
  });

  it('AI 在填满的一手成四时，胜利优先于上移', () => {
    const base = almostFull(3, 2, { 0: 2, 1: 2, 2: 2 });

    const applied = playEndless(base, 3, 1);

    expect(applied.state.count).toBe(36);
    expect(applied.state.board[5 * 6 + 3]).toBe(2);
  });

  it('满盘时清空顶行，其余棋子不动，回合顺延', () => {
    const before = almostFull(0, 1);
    const applied = playEndless(before, 0, 1);

    expect(applied.scrolled).toBe(true);
    expect(applied.state.status).toBe('playing');
    expect(applied.state.count).toBe(30);
    expect(applied.state.turn).toBe(2);
    expect(applied.state.last).toBeNull();
    expect(applied.state.heights).toEqual([5, 5, 5, 5, 5, 5]);
    for (let col = 0; col < 6; col++) {
      expect(applied.state.board[5 * 6 + col]).toBe(0);
      expect(applied.state.board[4 * 6 + col]).toBeGreaterThan(0);
    }
    expect(isGravityValid(applied.state)).toBe(true);
  });

  it('上移后棋盘仍然可以继续落子', () => {
    const applied = playEndless(almostFull(0, 1), 0, 1);
    const next = playEndless(applied.state, 5, 1);

    expect(next.state.count).toBe(31);
    expect(next.state.turn).toBe(1);
    expect(next.state.board[5 * 6 + 5]).toBe(2);
  });

  it('非满盘时 scrollBoard 不改动局面', () => {
    const state = emptyState();
    expect(scrollBoard(state)).toBe(state);
  });
});
