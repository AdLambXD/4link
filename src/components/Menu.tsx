import { useState } from 'react';
import { DIFFICULTY_LABELS, type Difficulty } from '../ai/engine';
import type { Stats } from '../hooks/useStats';
import { ArrowRightIcon } from './Icons';

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
    <main className="poster">
      <header className="masthead">
        <div className="masthead-row">
          <h1 className="wordmark">
            <span className="wordmark-4">4</span>
            <span>LINK</span>
          </h1>
          <span className="issue">NO. 04</span>
        </div>
        <p className="kicker">Four in a row · 四连引力 · 重力棋盘</p>
        <div className="rule" />
      </header>

      <section className="block">
        <div className="block-head">
          <span className="block-num">01</span>
          <h2>对战模式</h2>
        </div>
        <div className="choices choices-2">
          <button
            className={`choice${mode === 'pve' ? ' is-on' : ''}`}
            onClick={() => setMode('pve')}
          >
            <span className="choice-main">人机对战</span>
            <span className="choice-note">SOLO</span>
          </button>
          <button
            className={`choice${mode === 'pvp' ? ' is-on' : ''}`}
            onClick={() => setMode('pvp')}
          >
            <span className="choice-main">本地双人</span>
            <span className="choice-note">LOCAL</span>
          </button>
        </div>
      </section>

      {mode === 'pve' && (
        <>
          <section className="block">
            <div className="block-head">
              <span className="block-num">02</span>
              <h2>难度</h2>
            </div>
            <div className="choices choices-3">
              {(['easy', 'normal', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  className={`choice${difficulty === level ? ' is-on' : ''}`}
                  onClick={() => setDifficulty(level)}
                >
                  <span className="choice-main">{DIFFICULTY_LABELS[level]}</span>
                  <span className="choice-note">{level.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <span className="block-num">03</span>
              <h2>谁先手</h2>
            </div>
            <div className="choices choices-2">
              <button
                className={`choice${humanFirst ? ' is-on' : ''}`}
                onClick={() => setHumanFirst(true)}
              >
                <span className="choice-main">我先手</span>
                <span className="choice-note">FIRST</span>
              </button>
              <button
                className={`choice${!humanFirst ? ' is-on' : ''}`}
                onClick={() => setHumanFirst(false)}
              >
                <span className="choice-main">AI 先手</span>
                <span className="choice-note">SECOND</span>
              </button>
            </div>
          </section>
        </>
      )}

      <button
        className="start-btn"
        onClick={() => onStart({ mode, difficulty, humanFirst })}
      >
        <span>开始对局</span>
        <ArrowRightIcon />
      </button>

      <div className="scorecard">
        <span className="scorecard-title">战绩</span>
        <span className="score-item">
          <i className="chip chip-p1" />
          {stats.p1}
        </span>
        <span className="score-item">
          <i className="chip chip-p2" />
          {stats.p2}
        </span>
        <span className="score-item score-draw">和 {stats.draws}</span>
        <button className="text-btn" onClick={onResetStats}>
          清零
        </button>
      </div>

      <details className="notes">
        <summary>怎么玩</summary>
        <ul>
          <li>6×6 棋盘，轮流选一列落子，棋子落到底。</li>
          <li>横、竖、两条斜线，任意方向连成 4 个即获胜。</li>
          <li>棋盘下满仍无人连成 4 个，判和棋。</li>
          <li>先抢中间两列；斜线和双威胁最容易漏防。</li>
        </ul>
      </details>

      <p className="colophon">键盘 1–6 落子 · ESC 悔棋 · R 重开</p>
    </main>
  );
}
