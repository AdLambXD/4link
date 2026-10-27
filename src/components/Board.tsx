import { useState, type CSSProperties } from 'react';
import type { BoardStyle } from '../board';
import { colLabel, idx, type GameState } from '../game/rules';

interface BoardProps {
  state: GameState;
  disabled: boolean;
  hint: number | null;
  onPlay: (col: number) => void;
  /** 棋盘上方的标题；默认为「四连引力」。 */
  title?: string;
  /** 标题右侧的规格文字；默认显示尺寸与连子数。 */
  meta?: string;
  /** 棋盘下方的页脚文字。 */
  footer?: string;
  /** 格线样式：规整或手绘。 */
  boardStyle?: BoardStyle;
}

/** 星位：按棋盘大小取靠边的四个点，偶数盘不强行放中心。 */
function starPoints(size: number): number[] {
  const q = size >= 12 ? 3 : size >= 8 ? 2 : 1;
  return [...new Set([q, size - 1 - q])].sort((a, b) => a - b);
}

/** 确定性噪声：同一盘面每次渲染得到相同的手绘抖动。 */
function noise(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

/** 一条略带弧度的手绘线段。 */
function roughSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
): string {
  const jitter = (n: number) => noise(seed + n) * 0.55;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const c1x = x1 + dx * 0.33 + jitter(1);
  const c1y = y1 + dy * 0.33 + jitter(2);
  const c2x = x1 + dx * 0.67 + jitter(3);
  const c2y = y1 + dy * 0.67 + jitter(4);
  return `M ${x1 + jitter(0)} ${y1 + jitter(5)} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2 + jitter(6)} ${y2 + jitter(7)}`;
}

/** 外框：四个角与边中点都轻微偏移，像一笔画出来的方框。 */
function roughRect(
  left: number,
  top: number,
  right: number,
  bottom: number,
  seed: number,
): string {
  const jitter = (n: number) => noise(seed + n) * 0.5;
  const corners: Array<[number, number]> = [
    [left + jitter(0), top + jitter(1)],
    [right + jitter(2), top + jitter(3)],
    [right + jitter(4), bottom + jitter(5)],
    [left + jitter(6), bottom + jitter(7)],
  ];
  const mids = corners.map(([x, y], i) => {
    const [nx, ny] = corners[(i + 1) % corners.length];
    return [
      (x + nx) / 2 + jitter(10 + i * 2),
      (y + ny) / 2 + jitter(11 + i * 2),
    ];
  });
  return `M ${corners[0][0]} ${corners[0][1]} Q ${mids[0][0]} ${mids[0][1]} ${corners[1][0]} ${corners[1][1]} Q ${mids[1][0]} ${mids[1][1]} ${corners[2][0]} ${corners[2][1]} Q ${mids[2][0]} ${mids[2][1]} ${corners[3][0]} ${corners[3][1]} Q ${mids[3][0]} ${mids[3][1]} ${corners[0][0]} ${corners[0][1]} Z`;
}

/** 手绘小圆点，半径轻微不均。 */
function roughDot(cx: number, cy: number, r: number, seed: number): string {
  const count = 10;
  const points = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = r * (1 + noise(seed + i) * 0.22);
    return `${(cx + Math.cos(angle) * radius).toFixed(2)} ${(cy + Math.sin(angle) * radius).toFixed(2)}`;
  });
  return `M ${points.join(' L ')} Z`;
}

export function Board({
  state,
  disabled,
  hint,
  onPlay,
  title = '四连引力',
  meta,
  footer,
  boardStyle = 'clean',
}: BoardProps) {
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
        <span className="board-title">{title}</span>
        <span>{meta ?? `${cols} × ${rows} · ${win} 连`}</span>
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
          <div className="board-veil" aria-hidden="true" />

          <svg
            className="board-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {boardStyle === 'handdrawn' ? (
              <g
                fill="none"
                stroke="var(--board-grid)"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d={roughRect(edge, edge, far, far, 3.1)}
                  strokeWidth={lineWidth * 1.9}
                />
                <path
                  d={roughRect(edge + 0.16, edge + 0.1, far + 0.1, far + 0.16, 9.7)}
                  strokeWidth={lineWidth * 0.55}
                  opacity={0.5}
                />
                {Array.from({ length: cols }, (_, i) => {
                  const p = edge + i * step;
                  return (
                    <g key={i}>
                      <path
                        d={roughSegment(p, edge, p, far, i * 13.7 + 1)}
                        strokeWidth={lineWidth}
                      />
                      <path
                        d={roughSegment(edge, p, far, p, i * 17.3 + 5)}
                        strokeWidth={lineWidth}
                      />
                    </g>
                  );
                })}
                {stars.map((r) =>
                  stars.map((c) => (
                    <path
                      key={`${r}-${c}`}
                      d={roughDot(
                        edge + c * step,
                        edge + r * step,
                        starRadius,
                        r * 31 + c * 7 + 2,
                      )}
                      fill="var(--board-dot)"
                      stroke="none"
                    />
                  )),
                )}
              </g>
            ) : (
              <>
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
              </>
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
        <span>{footer ?? `DROP · STACK · LINK${players > 2 ? ` · ${players}P` : ''}`}</span>
        <span className="board-diamond" />
      </div>
    </div>
  );
}
