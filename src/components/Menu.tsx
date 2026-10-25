import { useState } from 'react';
import { DIFFICULTY_LABELS, type Difficulty } from '../ai/engine';
import { BOARD_SIZES, MAX_PLAYERS, SIZE_WIN, type BoardSize } from '../game/rules';
import type { Stats } from '../hooks/useStats';
import { SKINS, getSkin, type SkinId } from '../skins';
import { ArrowRightIcon } from './Icons';

export interface MatchConfig {
  mode: 'pvp' | 'pve';
  difficulty: Difficulty;
  humanFirst: boolean;
  players: number;
  size: BoardSize;
}

interface MenuProps {
  initial: MatchConfig;
  stats: Stats;
  skinId: SkinId;
  onSkinChange: (id: SkinId) => void;
  onStart: (config: MatchConfig) => void;
  onResetStats: () => void;
}

const PLAYER_COUNTS = Array.from(
  { length: MAX_PLAYERS - 1 },
  (_, i) => i + 2,
);

const PLAYER_NOTES = ['DUO', 'TRIO', 'SQUAD', 'FIVE', 'SIX'];

export function Menu({
  initial,
  stats,
  skinId,
  onSkinChange,
  onStart,
  onResetStats,
}: MenuProps) {
  const [mode, setMode] = useState<'pvp' | 'pve'>(initial.mode);
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [humanFirst, setHumanFirst] = useState(initial.humanFirst);
  const [players, setPlayers] = useState(initial.players);
  const [size, setSize] = useState<BoardSize>(initial.size);

  let step = 0;
  const num = () => String(++step).padStart(2, '0');

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
          <span className="block-num">{num()}</span>
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
            <span className="choice-main">本地多人</span>
            <span className="choice-note">LOCAL</span>
          </button>
        </div>
      </section>

      {mode === 'pvp' && (
        <section className="block">
          <div className="block-head">
            <span className="block-num">{num()}</span>
            <h2>玩家人数</h2>
          </div>
          <div className="choices choices-5">
            {PLAYER_COUNTS.map((count) => (
              <button
                key={count}
                className={`choice choice-compact${players === count ? ' is-on' : ''}`}
                onClick={() => setPlayers(count)}
              >
                <span className="choice-main">{count} 人</span>
                <span className="choice-note">{PLAYER_NOTES[count - 2]}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="block">
        <div className="block-head">
          <span className="block-num">{num()}</span>
          <h2>棋盘尺寸</h2>
        </div>
        <div className="choices choices-4">
          {BOARD_SIZES.map((boardSize) => (
            <button
              key={boardSize}
              className={`choice choice-compact${size === boardSize ? ' is-on' : ''}`}
              onClick={() => setSize(boardSize)}
            >
              <span className="choice-main">
                {boardSize} × {boardSize}
              </span>
              <span className="choice-note">{SIZE_WIN[boardSize]} 连</span>
            </button>
          ))}
        </div>
      </section>

      {mode === 'pve' && (
        <>
          <section className="block">
            <div className="block-head">
              <span className="block-num">{num()}</span>
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
              <span className="block-num">{num()}</span>
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

      <section className="block">
        <div className="block-head">
          <span className="block-num">{num()}</span>
          <h2>棋盘皮肤</h2>
        </div>
        <div className="choices choices-2">
          {SKINS.map((skin) => {
            const preview = getSkin(skin.id);
            return (
              <button
                key={skin.id}
                className={`choice choice-skin${skinId === skin.id ? ' is-on' : ''}`}
                onClick={() => onSkinChange(skin.id)}
              >
                <span className="skin-swatch" aria-hidden="true">
                  <i style={{ background: preview.vars['--board-face'] }} />
                  <i style={{ background: preview.vars['--p1'] }} />
                  <i style={{ background: preview.vars['--p2'] }} />
                  <i style={{ background: preview.vars['--p3'] }} />
                </span>
                <span className="skin-name">
                  <span className="choice-main">{skin.name}</span>
                  <span className="choice-note">{skin.note}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <button
        className="start-btn"
        onClick={() =>
          onStart({
            mode,
            difficulty,
            humanFirst,
            players: mode === 'pve' ? 2 : players,
            size,
          })
        }
      >
        <span>开始对局</span>
        <ArrowRightIcon />
      </button>

      <div className="scorecard">
        <span className="scorecard-title">双人战绩</span>
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
          <li>方形围棋盘，轮流选一列，棋子落到该列最底部的交叉点。</li>
          <li>2–6 人本地轮流；3 人以上不提供 AI 和提示。</li>
          <li>6×6、8×8 连 4 个获胜；12×12、16×16 连 5 个获胜。</li>
          <li>先抢中间列；斜线和双威胁最容易漏防。</li>
        </ul>
      </details>

      <p className="colophon">键盘 1–0 落子 · ESC 悔棋 · R 重开</p>
    </main>
  );
}
