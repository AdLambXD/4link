import type { Puzzle } from '../game/puzzle';
import type { GameState } from '../game/rules';
import { useI18n } from '../i18n';

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
  const { t, tp, text } = useI18n();
  if ((state.status === 'playing' && !exhausted) || !visible) return null;

  const won = state.status === 'won' && state.winner === puzzle.human;
  const succeeded = solved || won;
  const draw = state.status === 'draw';
  const tone = succeeded ? 'p1' : draw ? 'draw' : 'p2';
  const title = succeeded
    ? t('puzzle.solved')
    : exhausted
      ? t('puzzle.exhausted')
      : draw
        ? t('puzzle.draw')
        : t('puzzle.defended');
  const detail = succeeded
    ? tp('puzzle.solvedIn', moves)
    : exhausted
      ? t('puzzle.exhaustedDetail', {
          limit: puzzle.moveLimit,
          win: state.config.win,
        })
      : draw
        ? t('puzzle.drawDetail', { win: state.config.win })
        : t('puzzle.defendedDetail', { win: state.config.win });

  return (
    <div className="result">
      <div className={`slip slip-${tone}`}>
        <div className="slip-head">
          <span>
            {t('puzzle.head', {
              no: String(puzzle.no).padStart(2, '0'),
            })}
          </span>
          <span>
            {tp('game.limitMoves', puzzle.moveLimit)}
          </span>
        </div>

        <div className="slip-body">
          <span className={`slip-disc ${tone}`} />
          <h2>{title}</h2>
          <p>{detail}</p>
          {succeeded && hints > 0 && (
            <p className="slip-note">{tp('puzzle.hints', hints)}</p>
          )}
          {!succeeded && (
            <p className="slip-note">{text(puzzle.note)}</p>
          )}
        </div>

        <div className="slip-actions">
          {succeeded && nextPuzzle ? (
            <button className="btn-solid" onClick={onNext}>
              {t('puzzle.next')}
            </button>
          ) : (
            <button className="btn-solid" onClick={onAgain}>
              {succeeded ? t('puzzle.retrySolved') : t('puzzle.retry')}
            </button>
          )}
          {succeeded && nextPuzzle && (
            <button className="btn-line" onClick={onAgain}>
              {t('puzzle.retrySolved')}
            </button>
          )}
          <button className="btn-plain" onClick={onMenu}>
            {t('puzzle.menu')}
          </button>
        </div>

        <span className="stamp">
          {succeeded ? t('puzzle.stampSolved') : t('puzzle.stampFailed')}
        </span>
      </div>
    </div>
  );
}
