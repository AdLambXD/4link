import { describe, expect, it } from 'vitest';
import { sanitizeEndlessBest } from './useEndlessBest';

describe('无尽模式最佳记录', () => {
  it('只保留 6×6 / 8×8 的合法整数记录', () => {
    expect(
      sanitizeEndlessBest({
        6: { moves: 12, scrolls: 2 },
        8: { moves: 30.8, scrolls: '3' },
        12: { moves: 99, scrolls: 9 },
      }),
    ).toEqual({
      6: { moves: 12, scrolls: 2 },
      8: { moves: 30, scrolls: 3 },
    });
  });

  it('损坏或负数回退为空', () => {
    expect(sanitizeEndlessBest(null)).toEqual({});
    expect(sanitizeEndlessBest('nope')).toEqual({});
    expect(sanitizeEndlessBest({ 6: { moves: -1, scrolls: -2 } })).toEqual({});
    expect(sanitizeEndlessBest({ 6: null })).toEqual({});
  });

  it('两种尺寸分别保存', () => {
    expect(
      sanitizeEndlessBest({
        6: { moves: 7, scrolls: 0 },
        8: { moves: 9, scrolls: 1 },
      }),
    ).toEqual({
      6: { moves: 7, scrolls: 0 },
      8: { moves: 9, scrolls: 1 },
    });
  });
});
