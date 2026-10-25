import { useCallback, useEffect, useState } from 'react';
import type { DuoPlayer } from '../game/rules';

export interface Stats {
  p1: number;
  p2: number;
  draws: number;
}

const STORAGE_KEY = '4link.stats.v1';
const EMPTY: Stats = { p1: 0, p2: 0, draws: 0 };

function load(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return {
      p1: Number(parsed.p1) || 0,
      p2: Number(parsed.p2) || 0,
      draws: Number(parsed.draws) || 0,
    };
  } catch {
    return EMPTY;
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // 隐私模式下写不进去就算了
    }
  }, [stats]);

  const record = useCallback((winner: DuoPlayer | null) => {
    setStats((prev) => {
      if (winner === null) return { ...prev, draws: prev.draws + 1 };
      if (winner === 1) return { ...prev, p1: prev.p1 + 1 };
      return { ...prev, p2: prev.p2 + 1 };
    });
  }, []);

  const reset = useCallback(() => setStats(EMPTY), []);

  return { stats, record, reset };
}
