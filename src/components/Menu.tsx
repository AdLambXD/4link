import { useState } from 'react';
import { DIFFICULTY_LABELS, type Difficulty } from '../ai/engine';
import type { BoardCustomization } from '../board';
import { PUZZLES, getPuzzle } from '../game/puzzle';
import { TUTORIALS, getTutorial } from '../game/tutorial';
import { BOARD_SIZES, MAX_PLAYERS, SIZE_WIN, type BoardSize } from '../game/rules';
import type { PuzzleProgress, PuzzleRecord } from '../hooks/usePuzzleProgress';
import type { TutorialProgress } from '../hooks/useTutorialProgress';
import type { Stats } from '../hooks/useStats';
import {
  PLAYER_NUMBERS,
  hasPieceCustomization,
  pieceColor,
  type PieceCustomization,
} from '../pieces';
import type { Skin } from '../skins';
import { ArrowRightIcon, SettingsIcon } from './Icons';

export interface MatchConfig {
  mode: 'pvp' | 'pve' | 'puzzle' | 'tutorial';
  difficulty: Difficulty;
  humanFirst: boolean;
  players: number;
  size: BoardSize;
  puzzleId: string | null;
  tutorialId: string | null;
}

interface MenuProps {
  initial: MatchConfig;
  stats: Stats;
  puzzleProgress: PuzzleProgress;
  tutorialProgress: TutorialProgress;
  skin: Skin;
  pieces: PieceCustomization;
  board: BoardCustomization;
  onOpenSettings: () => void;
  onStart: (config: MatchConfig) => void;
  onResetStats: () => void;
  onResetPuzzles: () => void;
  onResetTutorials: () => void;
}

const PLAYER_COUNTS = Array.from(
  { length: MAX_PLAYERS - 1 },
  (_, i) => i + 2,
);

const PLAYER_NOTES = ['DUO', 'TRIO', 'SQUAD', 'FIVE', 'SIX'];

export function Menu({
  initial,
  stats,
  puzzleProgress,
  tutorialProgress,
  skin,
  pieces,
  board,
  onOpenSettings,
  onStart,
  onResetStats,
  onResetPuzzles,
  onResetTutorials,
}: MenuProps) {
  const firstUnsolved = PUZZLES.find((puzzle) => !puzzleProgress[puzzle.id]?.solved) ?? PUZZLES[0];
  const firstUnsolvedTutorial =
    TUTORIALS.find((lesson) => !tutorialProgress[lesson.id]) ?? TUTORIALS[0];
  const [mode, setMode] = useState<MatchConfig['mode']>(initial.mode);
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [humanFirst, setHumanFirst] = useState(initial.humanFirst);
  const [players, setPlayers] = useState(initial.players);
  const [size, setSize] = useState<BoardSize>(initial.size);
  const [puzzleId, setPuzzleId] = useState(() => getPuzzle(initial.puzzleId)?.id ?? firstUnsolved.id);
  const [tutorialId, setTutorialId] = useState(
    () => getTutorial(initial.tutorialId)?.id ?? firstUnsolvedTutorial.id,
  );

  const selectedPuzzle = getPuzzle(puzzleId) ?? firstUnsolved;
  const selectedTutorial = getTutorial(tutorialId) ?? firstUnsolvedTutorial;
  const solvedCount = PUZZLES.filter((puzzle) => puzzleProgress[puzzle.id]?.solved).length;
  const tutorialSolvedCount = TUTORIALS.filter((lesson) => tutorialProgress[lesson.id]).length;
  const solvedRecords = PUZZLES.map((puzzle) => puzzleProgress[puzzle.id]).filter(
    (record): record is PuzzleRecord => Boolean(record?.solved),
  );
  const bestSolved = solvedRecords.length
    ? Math.min(...solvedRecords.map((record) => record.best))
    : null;
  const customPieces = hasPieceCustomization(pieces);
  const boardNote = board.image
    ? '自定义背景'
    : board.face
      ? '自定义底色'
      : board.style === 'handdrawn'
        ? '手绘格线'
        : null;

  let step = 0;
  const num = () => String(++step).padStart(2, '0');

  const start = () => {
    onStart({
      mode,
      difficulty,
      humanFirst,
      players: mode === 'pvp' ? players : 2,
      size:
        mode === 'puzzle'
          ? selectedPuzzle.size
          : mode === 'tutorial'
            ? selectedTutorial.size
            : size,
      puzzleId: mode === 'puzzle' ? selectedPuzzle.id : null,
      tutorialId: mode === 'tutorial' ? selectedTutorial.id : null,
    });
  };

  return (
    <main className="poster">
      <header className="masthead">
        <div className="masthead-row">
          <h1 className="wordmark">
            <span className="wordmark-4">4</span>
            <span>LINK</span>
          </h1>
          <div className="masthead-side">
            <span className="issue">NO. 06</span>
            <button
              type="button"
              className="settings-trigger"
              onClick={onOpenSettings}
              aria-label="打开设置"
            >
              <SettingsIcon />
            </button>
          </div>
        </div>
        <p className="kicker">Four in a row · 四连引力 · 重力棋盘</p>
        <div className="rule" />
      </header>

      <section className="block">
        <div className="block-head">
          <span className="block-num">{num()}</span>
          <h2>对战模式</h2>
        </div>
        <div className="choices choices-4">
          <button
            className={`choice choice-compact choice-mode${mode === 'pve' ? ' is-on' : ''}`}
            onClick={() => setMode('pve')}
          >
            <span className="choice-main">人机对战</span>
            <span className="choice-note">SOLO</span>
          </button>
          <button
            className={`choice choice-compact choice-mode${mode === 'pvp' ? ' is-on' : ''}`}
            onClick={() => setMode('pvp')}
          >
            <span className="choice-main">本地多人</span>
            <span className="choice-note">LOCAL</span>
          </button>
          <button
            className={`choice choice-compact choice-mode${mode === 'puzzle' ? ' is-on' : ''}`}
            onClick={() => setMode('puzzle')}
          >
            <span className="choice-main">残局谜题</span>
            <span className="choice-note">PUZZLE</span>
          </button>
          <button
            className={`choice choice-compact choice-mode${mode === 'tutorial' ? ' is-on' : ''}`}
            onClick={() => setMode('tutorial')}
          >
            <span className="choice-main">新手教程</span>
            <span className="choice-note">GUIDE</span>
          </button>
        </div>
      </section>

      {mode === 'tutorial' && (
        <section className="block">
          <div className="block-head">
            <span className="block-num">{num()}</span>
            <h2>选择课程</h2>
            <span className="puzzle-head-meta">
              <span className="puzzle-count">
                已学 {tutorialSolvedCount} / {TUTORIALS.length}
              </span>
              {tutorialSolvedCount > 0 && (
                <button className="text-btn puzzle-reset" onClick={onResetTutorials}>
                  重置
                </button>
              )}
            </span>
          </div>
          <div className="puzzle-grid">
            {TUTORIALS.map((lesson) => {
              const done = Boolean(tutorialProgress[lesson.id]);
              const isOn = lesson.id === selectedTutorial.id;
              return (
                <button
                  key={lesson.id}
                  className={`puzzle-card${isOn ? ' is-on' : ''}${done ? ' is-solved' : ''}`}
                  onClick={() => setTutorialId(lesson.id)}
                  aria-pressed={isOn}
                >
                  <span className="puzzle-card-top">
                    <span className="puzzle-no">
                      NO.{String(lesson.no).padStart(2, '0')}
                    </span>
                    <span className="puzzle-check" aria-label={done ? '已学习' : '未学习'}>
                      {done ? '✓' : ''}
                    </span>
                  </span>
                  <span className="puzzle-title">{lesson.title}</span>
                  <span className="puzzle-meta">
                    {lesson.size}×{lesson.size} · {lesson.steps.length} 步引导
                  </span>
                </button>
              );
            })}
          </div>
          <p className="puzzle-brief">
            {selectedTutorial.goal} {selectedTutorial.tip}
          </p>
        </section>
      )}

      {mode === 'puzzle' && (
        <section className="block">
          <div className="block-head">
            <span className="block-num">{num()}</span>
            <h2>选择残局</h2>
            <span className="puzzle-head-meta">
              <span className="puzzle-count">
                已解 {solvedCount} / {PUZZLES.length}
              </span>
              {solvedCount > 0 && (
                <button className="text-btn puzzle-reset" onClick={onResetPuzzles}>
                  重置
                </button>
              )}
            </span>
          </div>
          <div className="puzzle-grid">
            {PUZZLES.map((puzzle) => {
              const record = puzzleProgress[puzzle.id];
              const isOn = puzzle.id === selectedPuzzle.id;
              return (
                <button
                  key={puzzle.id}
                  className={`puzzle-card${isOn ? ' is-on' : ''}${
                    record?.solved ? ' is-solved' : ''
                  }`}
                  onClick={() => setPuzzleId(puzzle.id)}
                  aria-pressed={isOn}
                >
                  <span className="puzzle-card-top">
                    <span className="puzzle-no">NO.{String(puzzle.no).padStart(2, '0')}</span>
                    <span className="puzzle-check" aria-label={record?.solved ? '已解开' : '未解开'}>
                      {record?.solved ? '✓' : ''}
                    </span>
                  </span>
                  <span className="puzzle-title">{puzzle.title}</span>
                  <span className="puzzle-meta">
                    {puzzle.size}×{puzzle.size} · {puzzle.moveLimit} 步杀
                  </span>
                  {record?.solved && (
                    <span className="puzzle-best">最佳 {record.best} 步</span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="puzzle-brief">{selectedPuzzle.note}</p>
        </section>
      )}

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

      {(mode === 'pve' || mode === 'pvp') && (
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
      )}

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
          <h2>外观</h2>
        </div>
        <button
          type="button"
          className="appearance-card"
          onClick={onOpenSettings}
        >
          <span
            className="appearance-preview"
            style={{
              backgroundColor: skin.vars['--paper'],
              borderColor: skin.vars['--rule'],
            }}
            aria-hidden="true"
          >
            <span
              className={`appearance-board${board.style === 'handdrawn' ? ' is-hand' : ''}`}
              style={{
                backgroundColor: board.face ?? skin.vars['--board-face'],
                borderColor: skin.vars['--board-edge'],
                backgroundImage: board.image
                  ? `url("${board.image}")`
                  : undefined,
              }}
            >
              {PLAYER_NUMBERS.slice(0, 3).map((player) => {
                const image = pieces.images[player];
                return (
                  <i
                    key={player}
                    style={{
                      backgroundColor: pieceColor(skin, pieces, player),
                      backgroundImage: image ? `url("${image}")` : undefined,
                    }}
                  />
                );
              })}
            </span>
            <span className="appearance-type" aria-hidden="true">
              <i style={{ backgroundColor: skin.vars['--ink'] }} />
              <i style={{ backgroundColor: skin.vars['--accent'] }} />
            </span>
          </span>
          <span className="appearance-info">
            <span className="choice-main">{skin.name}主题</span>
            <span className="choice-note">{skin.note} · 整站风格</span>
            <span className="appearance-meta">
              {boardNote || customPieces
                ? [boardNote, customPieces ? '棋子已自定义' : null]
                    .filter(Boolean)
                    .join(' · ')
                : '主题、棋盘、棋子颜色与图片'}
            </span>
          </span>
          <span className="appearance-open">
            <SettingsIcon size={14} />
            设置
          </span>
        </button>
      </section>

      <button className="start-btn" onClick={start}>
        <span>
          {mode === 'puzzle' ? '开始解谜' : mode === 'tutorial' ? '开始教程' : '开始对局'}
        </span>
        <ArrowRightIcon />
      </button>

      {mode === 'tutorial' ? (
        <div className="scorecard">
          <span className="scorecard-title">教程进度</span>
          <span className="score-item">
            <span className="puzzle-check">✓</span>
            {tutorialSolvedCount} / {TUTORIALS.length}
          </span>
          <span className="score-draw">
            {tutorialSolvedCount === TUTORIALS.length
              ? '全部完成'
              : '从落子开始，一关一关学'}
          </span>
        </div>
      ) : mode === 'puzzle' ? (
        <div className="scorecard">
          <span className="scorecard-title">残局进度</span>
          <span className="score-item">
            <span className="puzzle-check">✓</span>
            {solvedCount} / {PUZZLES.length}
          </span>
          <span className="score-draw">
            {bestSolved === null ? '最佳 —' : `最佳 ${bestSolved} 步`}
          </span>
        </div>
      ) : (
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
      )}

      <details className="notes">
        <summary>怎么玩</summary>
        <ul>
          {mode === 'tutorial' ? (
            <>
              <li>教程会手把手指定落点；点错不会落子，可以放心尝试。</li>
              <li>6 节课依次介绍重力、横 / 竖 / 斜线、封堵和胜负优先级。</li>
              <li>完成进度保存在本机；随时可以重开当前课程。</li>
            </>
          ) : mode === 'puzzle' ? (
            <>
              <li>每个残局都是一个未完成的盘面，你在限定步数内连成目标数即胜。</li>
              <li>你固定执先手，AI 执后手；AI 会按最优防守尽量拖长战线。</li>
              <li>步数只计算你的落子；提示会指出当前可强制取胜的一手。</li>
              <li>解开的进度和最佳步数保存在本机。</li>
            </>
          ) : (
            <>
              <li>方形围棋盘，轮流选一列，棋子落到该列最底部的交叉点。</li>
              <li>2–6 人本地轮流；3 人以上不提供 AI 和提示。</li>
              <li>6×6、8×8 连 4 个获胜；12×12、16×16 连 5 个获胜。</li>
              <li>先抢中间列；斜线和双威胁最容易漏防。</li>
            </>
          )}
          <li>主题、棋子颜色和图片在设置中调整；选择会保存在本机。</li>
        </ul>
      </details>

      <p className="colophon">键盘 1–0 落子 · ESC 悔棋 · R 重开</p>
    </main>
  );
}
