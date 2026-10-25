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
  let tone: string;
  if (draw) {
    title = '和棋';
    tone = 'draw';
  } else if (mode === 'pve') {
    title = winner === human ? '你赢了' : 'AI 获胜';
    tone = winner === 1 ? 'p1' : 'p2';
  } else {
    title = winner === 1 ? '先手 ● 获胜' : '后手 ○ 获胜';
    tone = winner === 1 ? 'p1' : 'p2';
  }

  return (
    <div className="result">
      <div className={`result-card ${tone}`}>
        <span className="result-glyph">4</span>
        <h2>{title}</h2>
        <p className="result-sub">{draw ? '棋盘已满，无人连成四子' : `共 ${state.count} 手`}</p>
        <div className="result-actions">
          <button className="btn primary" onClick={onAgain}>
            再来一局
          </button>
          {mode === 'pve' && (
            <button className="btn" onClick={onSwap}>
              换先再来
            </button>
          )}
          <button className="btn quiet" onClick={onMenu}>
            返回菜单
          </button>
        </div>
      </div>
    </div>
  );
}
