import { useCallback, useEffect, useState } from 'react';

export type TutorialProgress = Record<string, true>;

const STORAGE_KEY = '4link.tutorial.v1';

function load(): TutorialProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result: TutorialProgress = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (value === true) result[id] = true;
    }
    return result;
  } catch {
    return {};
  }
}

export function useTutorialProgress() {
  const [progress, setProgress] = useState<TutorialProgress>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // 隐私模式下写不进去就算了
    }
  }, [progress]);

  const recordSolve = useCallback((id: string) => {
    setProgress((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  const reset = useCallback(() => setProgress({}), []);

  return { progress, recordSolve, reset };
}
