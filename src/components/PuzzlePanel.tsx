import type { Puzzle } from '../game/puzzle';
import type { GameState } from '../game/rules';

interface PuzzlePanelProps {
  puzzle: Puzzle;
  state: GameState;
  solved: boolean;
  moves: number;
  hints: number;
  nextPuzzle: Puzzle | null;
  visible: boolean;
  exhausted: boolean;
  onAgain: () => void;
  onNext: () => void;
  onMenu: () => void;
}

export function PuzzlePanel({
  puzzle,
  state,
  solved,
  moves,
  hints,
  nextPuzzle,
  visible,
  exhausted,
  onAgain,
  onNext,
  onMenu,
}: PuzzlePanelProps) {
  if ((state.status === 'playing' && !exhausted) || !visible) return null;

  const won = state.status === 'won' && state.winner === puzzle.human;
  const succeeded = solved || won;
  const draw = state.status === 'draw';
  const tone = succeeded ? 'p1' : draw ? 'draw' : 'p2';
  const title = succeeded ? '残局解开' : exhausted ? '步数用尽' : draw ? '和棋' : '防守成功';
  const detail = succeeded
    ? `用 ${moves} 步 · 限 ${puzzle.moveLimit} 步`
    : exhausted
      ? `限 ${puzzle.moveLimit} 步，本局没能连成 ${state.config.win} 子`
      : draw
        ? `棋盘已满，没能连成 ${state.config.win} 子`
        : `AI 先连成 ${state.config.win} 子`;

  return (
    <div className="result">
      <div className={`slip slip-${tone}`}>
        <div className="slip-head">
          <span>PUZZLE NO.{String(puzzle.no).padStart(2, '0')}</span>
          <span>限 {puzzle.moveLimit} 步</span>
        </div>

        <div className="slip-body">
          <span className={`slip-disc ${tone}`} />
          <h2>{title}</h2>
          <p>{detail}</p>
          {succeeded && hints > 0 && <p className="slip-note">用了 {hints} 次提示</p>}
          {!succeeded && <p className="slip-note">{puzzle.note}</p>}
        </div>

        <div className="slip-actions">
          {succeeded && nextPuzzle ? (
            <button className="btn-solid" onClick={onNext}>
              下一题
            </button>
          ) : (
            <button className="btn-solid" onClick={onAgain}>
              {succeeded ? '再解一次' : '重来'}
            </button>
          )}
          {succeeded && nextPuzzle && (
            <button className="btn-line" onClick={onAgain}>
              再解一次
            </button>
          )}
          <button className="btn-plain" onClick={onMenu}>
            返回菜单
          </button>
        </div>

        <span className="stamp">{succeeded ? '解' : '败'}</span>
      </div>
    </div>
  );
}
