import { useState, type CSSProperties } from 'react';
import { colLabel, idx, type GameState } from '../game/rules';

interface BoardProps {
  state: GameState;
  disabled: boolean;
  hint: number | null;
  onPlay: (col: number) => void;
}

/** 星位：按棋盘大小取靠边的四个点，偶数盘不强行放中心。 */
function starPoints(size: number): number[] {
  const q = size >= 12 ? 3 : size >= 8 ? 2 : 1;
  return [...new Set([q, size - 1 - q])].sort((a, b) => a - b);
}

export function Board({ state, disabled, hint, onPlay }: BoardProps) {
  const [hover, setHover] = useState<number | null>(null);

  const { cols, rows, win, players } = state.config;
  const rowOrder = Array.from({ length: rows }, (_, i) => rows - 1 - i);
  const playing = state.status === 'playing' && !disabled;
  const landingRow =
    hover !== null && state.heights[hover] < rows ? state.heights[hover] : null;

  const step = 100 / cols;
  const edge = step / 2;
  const far = 100 - edge;
  const lineWidth = cols >= 12 ? 0.13 : 0.18;
  const starRadius = cols >= 12 ? 0.55 : 0.75;
  const stars = starPoints(cols);

  return (
    <div className="board-frame">
      <div className="board-meta">
        <span className="board-title">四连引力</span>
        <span>
          {cols} × {rows} · {win} 连
        </span>
      </div>

      <div className="board-grid">
        <div className="col-labels" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }, (_, c) => (
            <span
              key={c}
              className={`col-label${hover === c ? ' active' : ''}${hint === c ? ' hint' : ''}`}
            >
              {colLabel(c)}
            </span>
          ))}
        </div>

        <div className="row-labels" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {rowOrder.map((r) => (
            <span key={r}>{r + 1}</span>
          ))}
        </div>

        <div
          className="board"
          onMouseLeave={() => setHover(null)}
        >
          <svg
            className="board-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect
              x={edge}
              y={edge}
              width={far - edge}
              height={far - edge}
              fill="none"
              stroke="var(--board-grid)"
              strokeWidth={lineWidth * 1.7}
            />
            {Array.from({ length: cols }, (_, i) => {
              const p = edge + i * step;
              return (
                <g key={i}>
                  <line
                    x1={p}
                    y1={edge}
                    x2={p}
                    y2={far}
                    stroke="var(--board-grid)"
                    strokeWidth={lineWidth}
                  />
                  <line
                    x1={edge}
                    y1={p}
                    x2={far}
                    y2={p}
                    stroke="var(--board-grid)"
                    strokeWidth={lineWidth}
                  />
                </g>
              );
            })}
            {stars.map((r) =>
              stars.map((c) => (
                <circle
                  key={`${r}-${c}`}
                  cx={edge + c * step}
                  cy={edge + r * step}
                  r={starRadius}
                  fill="var(--board-dot)"
                />
              )),
            )}
          </svg>

          {hover !== null && playing && (
            <div
              className={`column-wash p${state.turn}`}
              style={{
                left: `${(hover * 100) / cols}%`,
                width: `${100 / cols}%`,
              }}
            />
          )}

          {rowOrder.map((r) =>
            Array.from({ length: cols }, (_, c) => {
              const i = idx(r, c, cols);
              const value = state.board[i];
              const isWin = state.winLine?.includes(i) ?? false;
              const isLast = state.last === i;
              const isGhost = landingRow === r && hover === c && value === 0;
              const full = state.heights[c] >= rows;

              return (
                <button
                  key={i}
                  type="button"
                  className={`point${hover === c && playing ? ' hover' : ''}${
                    isWin ? ' win' : ''
                  }`}
                  aria-label={`${colLabel(c)} 列第 ${r + 1} 行${
                    value
                      ? `，${value === 1 ? '先手' : value === 2 ? '后手' : `${value} 号`}棋子`
                      : '，空'
                  }`}
                  disabled={!playing || full}
                  onClick={() => onPlay(c)}
                  onMouseEnter={() => setHover(c)}
                  onFocus={() => setHover(c)}
                  style={
                    {
                      width: `${100 / cols}%`,
                      height: `${100 / rows}%`,
                      left: `${((c + 0.5) * 100) / cols}%`,
                      top: `${((rows - 1 - r + 0.5) * 100) / rows}%`,
                      '--fall': rows - r,
                    } as CSSProperties
                  }
                >
                  {value !== 0 && (
                    <span
                      className={`stone p${value}${isLast ? ' dropping' : ''}`}
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
        <span>
          DROP · STACK · LINK{players > 2 ? ` · ${players}P` : ''}
        </span>
        <span className="board-diamond" />
      </div>
    </div>
  );
}
