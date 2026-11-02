import { useCallback, useEffect, useState } from 'react';

/** 无尽模式只开放 6×6 与 8×8。 */
export type EndlessSize = 6 | 8;

export interface EndlessRecord {
  /** 玩家自己的落子手数 */
  readonly moves: number;
  /** 这一局棋盘的累计上移次数 */
  readonly scrolls: number;
}

export type EndlessBest = Partial<Record<EndlessSize, EndlessRecord>>;

export const ENDLESS_STORAGE_KEY = '4link.endless.v1';

const ENDLESS_SIZES: readonly EndlessSize[] = [6, 8];

function count(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

/** 读取时逐字段校验，非法或损坏的数据回退为空记录。 */
export function sanitizeEndlessBest(value: unknown): EndlessBest {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  const result: EndlessBest = {};

  for (const size of ENDLESS_SIZES) {
    const entry = source[String(size)];
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const moves = count(record.moves);
    const scrolls = count(record.scrolls);
    if (moves === 0 && scrolls === 0) continue;
    result[size] = { moves, scrolls };
  }

  return result;
}

function load(): EndlessBest {
  try {
    const raw = localStorage.getItem(ENDLESS_STORAGE_KEY);
    if (!raw) return {};
    return sanitizeEndlessBest(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function useEndlessBest() {
  const [best, setBest] = useState<EndlessBest>(load);

  useEffect(() => {
    try {
      localStorage.setItem(ENDLESS_STORAGE_KEY, JSON.stringify(best));
    } catch {
      // 隐私模式或配额不足时，本局仍然正常游玩
    }
  }, [best]);

  const recordBest = useCallback(
    (size: EndlessSize, moves: number, scrolls: number) => {
      setBest((prev) => {
        const current = prev[size];
        const next = { moves: count(moves), scrolls: count(scrolls) };
        if (current && current.moves >= next.moves) return prev;
        return { ...prev, [size]: next };
      });
    },
    [],
  );

  const reset = useCallback(() => setBest({}), []);

  return { best, recordBest, reset };
}
