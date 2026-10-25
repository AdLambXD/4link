import type { GameState } from '../game/rules';

interface ResultPanelProps {
  state: GameState;
  mode: 'pvp' | 'pve';
  humanFirst: boolean;
  visible: boolean;
  onAgain: () => void;
  onSwap: () => void;
  onMenu: () => void;
}

export function ResultPanel({
  state,
  mode,
  humanFirst,
  visible,
  onAgain,
  onSwap,
  onMenu,
}: ResultPanelProps) {
  if (state.status === 'playing' || !visible) return null;

  const human = humanFirst ? 1 : 2;
  const draw = state.status === 'draw';
  const winner = state.winner;

  let title: string;
  let tone: 'p1' | 'p2' | 'draw';
  if (draw) {
    title = '和棋';
    tone = 'draw';
  } else if (mode === 'pve') {
    title = winner === human ? '你赢了' : 'AI 获胜';
    tone = winner === 1 ? 'p1' : 'p2';
  } else {
    title = winner === 1 ? '先手获胜' : '后手获胜';
    tone = winner === 1 ? 'p1' : 'p2';
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
          <p>{draw ? '棋盘已满，无人连成四子' : '四子连线'}</p>
        </div>

        <div className="slip-actions">
          <button className="btn-solid" onClick={onAgain}>
            再来一局
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
