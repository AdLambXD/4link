import { describe, expect, it } from 'vitest';
import { drop } from './rules';
import {
  PUZZLES,
  createPuzzleState,
  findBestMove,
  inspectPuzzle,
  mateInMoves,
  scoreRootMoves,
} from './puzzle';

describe('残局谜题', () => {
  it('关卡编号和 id 唯一', () => {
    expect(new Set(PUZZLES.map((p) => p.id)).size).toBe(PUZZLES.length);
    expect(PUZZLES.map((p) => p.no)).toEqual(
      Array.from({ length: PUZZLES.length }, (_, i) => i + 1),
    );
  });

  for (const puzzle of PUZZLES) {
    it(`#${puzzle.no}「${puzzle.title}」是合法的 ${puzzle.moveLimit} 步杀`, () => {
      const { state, result, mateIn, legal } = inspectPuzzle(puzzle);

      // 当前 UI 固定玩家执先手；新增关卡若违反这个前提，必须同步改 App。
      expect(puzzle.human).toBe(1);
      expect(puzzle.turn).toBe(1);
      expect(legal).toBe(true);
      expect(mateIn).not.toBeNull();
      expect(mateIn).toBeLessThanOrEqual(puzzle.moveLimit);
      expect(result.col).not.toBeNull();
      expect(result.line.length).toBeGreaterThan(0);

      // 主线必须真的能走完，并由玩家连成目标数。
      let current = state;
      for (const col of result.line) {
        expect(current.status).toBe('playing');
        const next = drop(current, col);
        expect(next).not.toBe(current);
        current = next;
      }
      expect(current.status).toBe('won');
      expect(current.winner).toBe(puzzle.human);
      expect(current.winLine?.length ?? 0).toBeGreaterThanOrEqual(current.config.win);

      const humanMoves = result.line.filter((_, index) => index % 2 === 0).length;
      expect(humanMoves).toBe(mateIn);
      expect(humanMoves).toBeLessThanOrEqual(puzzle.moveLimit);

      // 首着唯一：避免提示和“标准答案”互相矛盾。
      const roots = scoreRootMoves(state, puzzle.moveLimit * 2 - 1);
      const bestScore = Math.max(...roots.map((root) => root.score));
      const bestCols = roots
        .filter((root) => root.score === bestScore)
        .map((root) => root.col);
      expect(bestScore).toBe(result.score);
      expect(bestCols).toEqual([result.col]);
    });
  }

  it('解析盘面时拒绝悬空棋子', () => {
    expect(() =>
      createPuzzleState({
        ...PUZZLES[0],
        id: 'floating',
        rows: ['X.....', '......', '......', '......', '......', '......'],
      }),
    ).toThrow(/悬空/);
  });

  it('解析盘面时拒绝已有连线', () => {
    expect(() =>
      createPuzzleState({
        ...PUZZLES[0],
        id: 'already-won',
        rows: ['......', '......', '......', '......', '......', 'XXXX..'],
      }),
    ).toThrow(/连/);
  });

  it('findBestMove 对非对局状态返回空', () => {
    const state = createPuzzleState(PUZZLES[0]);
    const won = drop(state, 3);
    expect(won.status).toBe('won');
    expect(findBestMove(won, 3).col).toBeNull();
  });

  it('mateInMoves 只对强制胜返回步数', () => {
    expect(mateInMoves(1_000_000)).toBe(0);
    expect(mateInMoves(999_999)).toBe(1);
    expect(mateInMoves(999_997)).toBe(2);
    expect(mateInMoves(0)).toBeNull();
    expect(mateInMoves(-999_999)).toBeNull();
  });
});
