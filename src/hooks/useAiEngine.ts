import { useCallback, useEffect, useRef } from 'react';
import type { Difficulty, MoveResult } from '../ai/engine';
import type { Player } from '../game/rules';

interface Pending {
  resolve: (result: MoveResult) => void;
  reject: (error: Error) => void;
}

interface WorkerResponse {
  id: number;
  result: MoveResult;
}

/**
 * 把 AI 搜索放进 Web Worker，避免困难档思考时卡住界面。
 */
export function useAiEngine() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, Pending>());
  const nextIdRef = useRef(1);

  useEffect(() => {
    const worker = new Worker(new URL('../ai/worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const item = pendingRef.current.get(event.data.id);
      if (!item) return;
      pendingRef.current.delete(event.data.id);
      item.resolve(event.data.result);
    };

    worker.onerror = (event) => {
      const error = new Error(event.message || 'AI worker error');
      for (const item of pendingRef.current.values()) item.reject(error);
      pendingRef.current.clear();
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
      for (const item of pendingRef.current.values()) item.reject(new Error('AI worker terminated'));
      pendingRef.current.clear();
    };
  }, []);

  return useCallback(
    (board: readonly number[], heights: readonly number[], player: Player, difficulty: Difficulty) => {
      return new Promise<MoveResult>((resolve, reject) => {
        const worker = workerRef.current;
        if (!worker) {
          reject(new Error('AI 引擎尚未就绪'));
          return;
        }
        const id = nextIdRef.current++;
        pendingRef.current.set(id, { resolve, reject });
        worker.postMessage({
          id,
          board: Array.from(board),
          heights: Array.from(heights),
          player,
          difficulty,
        });
      });
    },
    [],
  );
}
