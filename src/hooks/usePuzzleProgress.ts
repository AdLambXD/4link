import { useCallback, useEffect, useState } from 'react';

export interface PuzzleRecord {
  solved: boolean;
  /** 最少用了多少步（只数玩家落子） */
  best: number;
  /** 创造最佳成绩时用了几次提示 */
  hints: number;
}

export type PuzzleProgress = Record<string, PuzzleRecord>;

const STORAGE_KEY = '4link.puzzles.v1';

function load(): PuzzleProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<PuzzleRecord>>;
    const result: PuzzleProgress = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (!value || value.solved !== true) continue;
      const best = Math.max(1, Math.round(Number(value.best) || 1));
      const hints = Math.max(0, Math.round(Number(value.hints) || 0));
      result[id] = { solved: true, best, hints };
    }
    return result;
  } catch {
    return {};
  }
}

export function usePuzzleProgress() {
  const [progress, setProgress] = useState<PuzzleProgress>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // 隐私模式下写不进去就算了
    }
  }, [progress]);

  const recordSolve = useCallback((id: string, moves: number, hints: number) => {
    setProgress((prev) => {
      const old = prev[id];
      if (
        old?.solved &&
        (old.best < moves || (old.best === moves && old.hints <= hints))
      ) {
        return prev;
      }
      return {
        ...prev,
        [id]: {
          solved: true,
          best: Math.max(1, Math.round(moves)),
          hints: Math.max(0, Math.round(hints)),
        },
      };
    });
  }, []);

  const reset = useCallback(() => setProgress({}), []);

  const solvedCount = Object.values(progress).filter((record) => record.solved).length;

  return { progress, solvedCount, recordSolve, reset };
}
