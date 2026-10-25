import { useState } from 'react';
import { DIFFICULTY_LABELS, type Difficulty } from '../ai/engine';
import type { Stats } from '../hooks/useStats';

export interface MatchConfig {
  mode: 'pvp' | 'pve';
  difficulty: Difficulty;
  humanFirst: boolean;
}

interface MenuProps {
  stats: Stats;
  onStart: (config: MatchConfig) => void;
  onResetStats: () => void;
}

export function Menu({ stats, onStart, onResetStats }: MenuProps) {
  const [mode, setMode] = useState<'pvp' | 'pve'>('pve');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [humanFirst, setHumanFirst] = useState(true);

  return (
    <main className="menu">
      <div className="brand">
        <div className="logo">
          <span className="logo-4">4</span>
          <span className="logo-link">Link</span>
        </div>
        <p className="tagline">四连引力 · Drop. Stack. Link.</p>
      </div>

      <div className="card">
        <section className="field">
          <h3>对战模式</h3>
          <div className="segmented">
            <button className={mode === 'pve' ? 'on' : ''} onClick={() => setMode('pve')}>
              人机对战
            </button>
            <button className={mode === 'pvp' ? 'on' : ''} onClick={() => setMode('pvp')}>
              本地双人
            </button>
          </div>
        </section>

        {mode === 'pve' && (
          <>
            <section className="field">
              <h3>难度</h3>
              <div className="segmented">
                {(['easy', 'normal', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    className={difficulty === level ? 'on' : ''}
                    onClick={() => setDifficulty(level)}
                  >
                    {DIFFICULTY_LABELS[level]}
                  </button>
                ))}
              </div>
            </section>

            <section className="field">
              <h3>谁先手</h3>
              <div className="segmented">
                <button className={humanFirst ? 'on' : ''} onClick={() => setHumanFirst(true)}>
                  我先手
                </button>
                <button className={!humanFirst ? 'on' : ''} onClick={() => setHumanFirst(false)}>
                  AI 先手
                </button>
              </div>
            </section>
          </>
        )}

        <button
          className="btn primary start"
          onClick={() => onStart({ mode, difficulty, humanFirst })}
        >
          开始对局
        </button>

        <div className="stats-row">
          <span className="stat-label">战绩</span>
          <span className="stat p1">● {stats.p1}</span>
          <span className="stat p2">○ {stats.p2}</span>
          <span className="stat">和 {stats.draws}</span>
          <button className="link" onClick={onResetStats}>
            清零
          </button>
        </div>
      </div>

      <details className="rules">
        <summary>怎么玩？</summary>
        <ul>
          <li>6×6 棋盘，轮流选一列落子，棋子会落到底。</li>
          <li>横、竖、两条斜线，任意方向连成 4 个即获胜。</li>
          <li>棋盘下满仍无人连成 4 个，判和棋。</li>
          <li>技巧：先抢中间两列，特别小心斜线和双威胁。</li>
        </ul>
      </details>

      <p className="footnote">键盘 1–6 落子 · Esc 悔棋 · R 重开</p>
    </main>
  );
}
