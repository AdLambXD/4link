import { useState, type CSSProperties } from 'react';
import { COL_LABELS, COLS, ROWS, idx, type GameState } from '../game/rules';

interface BoardProps {
  state: GameState;
  disabled: boolean;
  hint: number | null;
  onPlay: (col: number) => void;
}

const ROW_ORDER = Array.from({ length: ROWS }, (_, i) => ROWS - 1 - i);

export function Board({ state, disabled, hint, onPlay }: BoardProps) {
  const [hover, setHover] = useState<number | null>(null);

  const playing = state.status === 'playing' && !disabled;
  const landingRow =
    hover !== null && state.heights[hover] < ROWS ? state.heights[hover] : null;

  return (
    <div className="board-frame">
      <div className="board-meta">
        <span className="board-title">四连引力</span>
        <span>6 × 6</span>
      </div>

      <div className="board-labels">
        <span />
        {COL_LABELS.map((label, c) => (
          <span
            key={label}
            className={`col-label${hover === c ? ' active' : ''}${hint === c ? ' hint' : ''}`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="board-field">
        <div className="row-labels">
          {ROW_ORDER.map((r) => (
            <span key={r}>{r + 1}</span>
          ))}
        </div>

        <div className="board" onMouseLeave={() => setHover(null)}>
          {ROW_ORDER.map((r) =>
            Array.from({ length: COLS }, (_, c) => {
              const i = idx(r, c);
              const value = state.board[i];
              const isWin = state.winLine?.includes(i) ?? false;
              const isLast = state.last === i;
              const isGhost = playing && landingRow === r && hover === c && value === 0;
              const full = state.heights[c] >= ROWS;

              return (
                <button
                  key={i}
                  type="button"
                  className={`slot${hover === c && playing ? ' hover' : ''}${
                    isWin ? ' win' : ''
                  }`}
                  aria-label={`${COL_LABELS[c]} 列第 ${r + 1} 行${
                    value ? `，${value === 1 ? '先手' : '后手'}棋子` : '，空'
                  }`}
                  disabled={!playing || full}
                  onClick={() => onPlay(c)}
                  onMouseEnter={() => setHover(c)}
                  onFocus={() => setHover(c)}
                >
                  {value !== 0 && (
                    <span
                      className={`stone p${value}${isLast ? ' dropping' : ''}`}
                      style={{ '--fall': r + 1 } as unknown as CSSProperties}
                    />
                  )}
                  {isGhost && <span className={`ghost p${state.turn}`} />}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="board-foot">
        <span>DROP · STACK · LINK</span>
        <span className="board-diamond" />
      </div>
    </div>
  );
}
