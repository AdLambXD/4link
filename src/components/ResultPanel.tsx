import type { GameState } from '../game/rules';
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
  if (state.status === 'playing' || !visible) return null;

  const { players, win } = state.config;
  const human = humanFirst ? 1 : 2;
  const draw = state.status === 'draw';
  const winner = state.winner;

  let title: string;
  let tone: string;
  if (draw || winner === null) {
    title = '和棋';
    tone = 'draw';
  } else if (mode === 'online') {
    title = seat !== null && winner === seat ? '你赢了' : '对手获胜';
    tone = `p${winner}`;
  } else if (mode === 'pve') {
    title = winner === human ? '你赢了' : 'AI 获胜';
    tone = `p${winner}`;
  } else if (players === 2) {
    title = winner === 1 ? '先手获胜' : '后手获胜';
    tone = `p${winner}`;
  } else {
    title = `玩家 ${winner} 获胜`;
    tone = `p${winner}`;
  }

  return (
    <div className="result">
      <div className={`slip slip-${tone}`}>
        <div className="slip-head">
          <span>RESULT</span>
          <span>{draw ? 'DRAW' : `第 ${state.count} 手`}</span>
        </div>

        <div className="slip-body">
          <span className={`slip-disc ${tone}`} />
          <h2>{title}</h2>
          <p>
            {draw ? `棋盘已满，无人连成 ${win} 子` : `${win} 子连线`}
          </p>
          {mode === 'online' && rematchPending && (
            <p className="slip-note">已发出「再来一局」，等对手确认。</p>
          )}
        </div>

        <div className="slip-actions">
          <button className="btn-solid" onClick={onAgain} disabled={rematchPending}>
            {rematchPending ? '等待对手' : '再来一局'}
          </button>
          {mode === 'pve' && (
            <button className="btn-line" onClick={onSwap}>
              换先再来
            </button>
          )}
          <button className="btn-plain" onClick={onMenu}>
            返回菜单
          </button>
        </div>

        <span className="stamp">{draw ? '和' : '胜'}</span>
      </div>
    </div>
  );
}
