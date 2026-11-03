import {
  chooseMove,
  type Difficulty,
  type MoveOptions,
  type MoveResult,
} from './engine';
import { chooseRotationMove } from './rotation';
import type { DuoPlayer, GameConfig } from '../game/rules';

interface Request {
  id: number;
  board: number[];
  heights: number[];
  player: DuoPlayer;
  difficulty: Difficulty;
  config: GameConfig;
  options?: MoveOptions;
}

interface Response {
  id: number;
  result: MoveResult;
}

// 不引入 webworker lib，避免和 DOM lib 的全局声明冲突。
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage: (message: Response) => void;
};

ctx.onmessage = (event) => {
  const { id, board, heights, player, difficulty, config, options } =
    event.data;
  const result = options?.rotation
    ? chooseRotationMove(board, heights, player, difficulty, config)
    : chooseMove(board, heights, player, difficulty, config, options);
  ctx.postMessage({ id, result });
};
