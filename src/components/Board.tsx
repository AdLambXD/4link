import { useState, type CSSProperties } from 'react';
import type { BoardStyle } from '../board';
import { colLabel, idx, type GameState } from '../game/rules';
import { useI18n } from '../i18n';

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

interface Point {
  x: number;
  y: number;
}

function bezierPoint(
  a: Point,
  b: Point,
  c: Point,
  d: Point,
  t: number,
): Point {
  const u = 1 - t;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return {
    x: a.x * w0 + b.x * w1 + c.x * w2 + d.x * w3,
    y: a.y * w0 + b.y * w1 + c.y * w2 + d.y * w3,
  };
}

/**
 * 手绘墨线：沿三次贝塞尔采样，用「压力」改变线宽，输出填充多边形。
 *
 * 每条线单独倾斜一点、整体轻微弯曲，行笔中段加粗、两端收锋，
 * 再叠一点墨色不匀，模拟蘸墨画的格线。倾斜以线段中点为轴，
 * 所以交叉点仍在原位附近；落子坐标与判定完全不受影响。
 */
function roughRibbon(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  width: number,
  step: number,
): string {
  const amp = step * 0.035;
  const jitter = (n: number) => noise(seed + n) * amp;
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = -(y2 - y1) / length;
  const ny = (x2 - x1) / length;

  // 每条线有自己的倾斜量、平移量与弯度，格距因此不会完全均匀。
  const tilt = noise(seed + 11.3) * step * 0.05;
  const shift = noise(seed + 15.7) * step * 0.035;
  const bow = noise(seed + 5.3) * amp * 1.4;

  const start: Point = {
    x: x1 + nx * (tilt + shift) + jitter(0.3),
    y: y1 + ny * (tilt + shift) + jitter(1.7),
  };
  const end: Point = {
    x: x2 + nx * (shift - tilt) + jitter(2.4),
    y: y2 + ny * (shift - tilt) + jitter(3.9),
  };
  const c1: Point = {
    x: x1 + (x2 - x1) / 3 + nx * (bow + shift) + jitter(6.2),
    y: y1 + (y2 - y1) / 3 + ny * (bow + shift) + jitter(7.4),
  };
  const c2: Point = {
    x: x1 + ((x2 - x1) * 2) / 3 + nx * (bow + shift) + jitter(8.1),
    y: y1 + ((y2 - y1) * 2) / 3 + ny * (bow + shift) + jitter(9.6),
  };

  const samples = 8;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const point = bezierPoint(start, c1, c2, end, t);
    const ahead = bezierPoint(start, c1, c2, end, Math.min(1, t + 0.02));
    const dx = ahead.x - point.x;
    const dy = ahead.y - point.y;
    const d = Math.hypot(dx, dy) || 1;

    // 起笔收锋、行笔加重，再叠一点墨色不匀。
    const taper = 0.5 + 0.5 * Math.sin(Math.PI * t) ** 0.55;
    const pressure =
      taper * (0.78 + 0.5 * (0.5 + 0.5 * noise(seed + 20 + t * 6)));
    const half = (width * pressure) / 2;
    const ox = (-dy / d) * half;
    const oy = (dx / d) * half;

    left.push(`${(point.x + ox).toFixed(3)} ${(point.y + oy).toFixed(3)}`);
    right.push(`${(point.x - ox).toFixed(3)} ${(point.y - oy).toFixed(3)}`);
  }

  return `M ${left.join(' L ')} L ${right.reverse().join(' L ')} Z`;
}

/** 方框的四条手绘边；两端略微出头，转角像真的笔画一样交叠。 */
function roughFramePaths(
  inset: number,
  width: number,
  step: number,
  seed: number,
  over = 0.42,
): string[] {
  const a = inset;
  const b = 100 - inset;
  return [
    roughRibbon(a - over, a, b + over, a, seed, width, step),
    roughRibbon(b, a - over, b, b + over, seed + 2, width, step),
    roughRibbon(b + over, b, a - over, b, seed + 4, width, step),
    roughRibbon(a, b + over, a, a - over, seed + 6, width, step),
  ];
}

/** 手绘小圆点，半径与轮廓都不太规整。 */
function roughDot(cx: number, cy: number, r: number, seed: number): string {
  const count = 10;
  const points = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = r * (1 + noise(seed + i) * 0.3);
    return `${(cx + Math.cos(angle) * radius).toFixed(2)} ${(cy + Math.sin(angle) * radius).toFixed(2)}`;
  });
  return `M ${points.join(' L ')} Z`;
}

export function Board({
  state,
  disabled,
  hint,
  onPlay,
  title,
  meta,
  footer,
  boardStyle = 'clean',
}: BoardProps) {
  const { t } = useI18n();
  const [hover, setHover] = useState<number | null>(null);

  const { cols, rows, win, players } = state.config;
  const boardTitle = title ?? t('board.defaultTitle');
  const boardMeta = meta ?? t('board.defaultMeta', { cols, rows, win });
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
        <span className="board-title">{boardTitle}</span>
        <span>{boardMeta}</span>
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
              <g fill="var(--board-grid)" stroke="none">
                <g>
                  {roughFramePaths(edge, lineWidth * 3.6, step, 3.1).map(
                    (d, i) => (
                      <path key={i} d={d} />
                    ),
                  )}
                </g>
                <g opacity={0.55}>
                  {roughFramePaths(
                    edge - 0.3,
                    lineWidth * 1.2,
                    step,
                    9.7,
                    0.22,
                  ).map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
                {Array.from({ length: cols - 2 }, (_, index) => {
                  const i = index + 1;
                  const p = edge + i * step;
                  const over = step * 0.045;
                  const vWidth =
                    lineWidth *
                    (2.2 + 1.6 * (0.5 + 0.5 * noise(i * 3.3 + 0.7)));
                  const hWidth =
                    lineWidth *
                    (2.2 + 1.6 * (0.5 + 0.5 * noise(i * 4.7 + 2.1)));
                  return (
                    <g key={i}>
                      <path
                        d={roughRibbon(
                          p,
                          edge - over,
                          p,
                          far + over,
                          i * 13.7 + 1,
                          vWidth,
                          step,
                        )}
                        opacity={0.8 + 0.2 * (0.5 + 0.5 * noise(i * 2.9 + 4))}
                      />
                      <path
                        d={roughRibbon(
                          edge - over,
                          p,
                          far + over,
                          p,
                          i * 17.3 + 5,
                          hWidth,
                          step,
                        )}
                        opacity={0.8 + 0.2 * (0.5 + 0.5 * noise(i * 5.1 + 8))}
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
                  aria-label={t(
                    value === 0
                      ? 'board.pointEmpty'
                      : value === 1
                        ? 'board.pointFirst'
                        : value === 2
                          ? 'board.pointSecond'
                          : 'board.pointPlayer',
                    { col: colLabel(c), row: r + 1, player: value },
                  )}
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
