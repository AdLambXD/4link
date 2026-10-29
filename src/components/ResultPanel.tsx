import type { GameState } from '../game/rules';
import { useI18n } from '../i18n';
import type { Seat } from '../net/protocol';

interface ResultPanelProps {
  state: GameState;
  mode: 'pvp' | 'pve' | 'online';
  humanFirst: boolean;
  /** 联机模式下自己的座位。 */
  seat?: Seat | null;
  /** 联机模式下已经发出「再来一局」。 */
  rematchPending?: boolean;
  visible: boolean;
  onAgain: () => void;
  onSwap: () => void;
  onMenu: () => void;
}

export function ResultPanel({
  state,
  mode,
  humanFirst,
  seat = null,
  rematchPending = false,
  visible,
  onAgain,
  onSwap,
  onMenu,
}: ResultPanelProps) {
  const { t } = useI18n();
  if (state.status === 'playing' || !visible) return null;

  const { players, win } = state.config;
  const human = humanFirst ? 1 : 2;
  const draw = state.status === 'draw';
  const winner = state.winner;

  let title: string;
  let tone: string;
  if (draw || winner === null) {
    title = t('result.draw');
    tone = 'draw';
  } else if (mode === 'online') {
    title =
      seat !== null && winner === seat
        ? t('result.youWin')
        : t('result.opponentWins');
    tone = `p${winner}`;
  } else if (mode === 'pve') {
    title = winner === human ? t('result.youWin') : t('result.aiWins');
    tone = `p${winner}`;
  } else if (players === 2) {
    title = winner === 1 ? t('result.firstWins') : t('result.secondWins');
    tone = `p${winner}`;
  } else {
    title = t('result.playerWins', { player: winner });
    tone = `p${winner}`;
  }

  return (
    <div className="result">
      <div className={`slip slip-${tone}`}>
        <div className="slip-head">
          <span>RESULT</span>
          <span>{draw ? 'DRAW' : t('result.move', { count: state.count })}</span>
        </div>

        <div className="slip-body">
          <span className={`slip-disc ${tone}`} />
          <h2>{title}</h2>
          <p>
            {draw
              ? t('result.boardFull', { win })
              : t('result.line', { win })}
          </p>
          {mode === 'online' && rematchPending && (
            <p className="slip-note">{t('result.rematchPending')}</p>
          )}
        </div>

        <div className="slip-actions">
          <button className="btn-solid" onClick={onAgain} disabled={rematchPending}>
            {rematchPending ? t('result.waitingOpponent') : t('result.again')}
          </button>
          {mode === 'pve' && (
            <button className="btn-line" onClick={onSwap}>
              {t('result.swap')}
            </button>
          )}
          <button className="btn-plain" onClick={onMenu}>
            {t('result.menu')}
          </button>
        </div>

        <span className="stamp">
          {draw ? t('result.stampDraw') : t('result.stampWin')}
        </span>
      </div>
    </div>
  );
}
