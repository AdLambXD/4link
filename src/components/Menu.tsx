import { useState } from 'react';
import type { Difficulty } from '../ai/engine';
import type { BoardCustomization } from '../board';
import { PUZZLES, getPuzzle } from '../game/puzzle';
import { TUTORIALS, getTutorial } from '../game/tutorial';
import { BOARD_SIZES, MAX_PLAYERS, SIZE_WIN, type BoardSize } from '../game/rules';
import type { PuzzleProgress, PuzzleRecord } from '../hooks/usePuzzleProgress';
import type { OnlinePhase } from '../hooks/useOnlineGame';
import type { TutorialProgress } from '../hooks/useTutorialProgress';
import type { Stats } from '../hooks/useStats';
import { useI18n, type StringKey } from '../i18n';
import { roomCodeFromUrl } from '../net/protocol';
import {
  PLAYER_NUMBERS,
  hasPieceCustomization,
  pieceColor,
  type PieceCustomization,
} from '../pieces';
import type { Skin } from '../skins';
import { ArrowRightIcon, SettingsIcon } from './Icons';
import { LanguageSwitch } from './LanguageSwitch';
import { OnlinePanel, type OnlinePanelProps } from './OnlinePanel';

export interface MatchConfig {
  mode: 'pvp' | 'pve' | 'puzzle' | 'tutorial' | 'online';
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
  online: OnlinePanelProps;
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

const DIFFICULTY_KEYS: Record<Difficulty, StringKey> = {
  easy: 'difficulty.easy',
  normal: 'difficulty.normal',
  hard: 'difficulty.hard',
};

const ONLINE_STATUS_KEYS: Record<OnlinePhase, StringKey> = {
  idle: 'menu.online.idle',
  connecting: 'menu.online.connecting',
  waiting: 'menu.online.waiting',
  syncing: 'menu.online.syncing',
  playing: 'menu.online.playing',
  left: 'menu.online.left',
  error: 'menu.online.error',
};

export function Menu({
  initial,
  stats,
  puzzleProgress,
  tutorialProgress,
  skin,
  pieces,
  board,
  online,
  onOpenSettings,
  onStart,
  onResetStats,
  onResetPuzzles,
  onResetTutorials,
}: MenuProps) {
  const { t, tp, text } = useI18n();
  const firstUnsolved = PUZZLES.find((puzzle) => !puzzleProgress[puzzle.id]?.solved) ?? PUZZLES[0];
  const firstUnsolvedTutorial =
    TUTORIALS.find((lesson) => !tutorialProgress[lesson.id]) ?? TUTORIALS[0];
  const [mode, setMode] = useState<MatchConfig['mode']>(() =>
    initial.mode === 'online' || roomCodeFromUrl(window.location.href)
      ? 'online'
      : initial.mode,
  );
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
    ? t('menu.customBackground')
    : board.face
      ? t('menu.customFace')
      : board.style === 'handdrawn'
        ? t('menu.handdrawn')
        : null;

  let step = 0;
  const num = () => String(++step).padStart(2, '0');

  const start = () => {
    if (mode === 'online') return;
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
            <LanguageSwitch />
            <button
              type="button"
              className="settings-trigger"
              onClick={onOpenSettings}
              aria-label={t('game.settingsAria')}
            >
              <SettingsIcon />
            </button>
          </div>
        </div>
        <p className="kicker">{t('app.kicker')}</p>
        <div className="rule" />
      </header>

      <section className="block">
        <div className="block-head">
          <span className="block-num">{num()}</span>
          <h2>{t('menu.modeHeading')}</h2>
        </div>
        <div className="choices mode-grid">
          <button
            className={`choice choice-compact choice-mode${mode === 'pve' ? ' is-on' : ''}`}
            onClick={() => setMode('pve')}
          >
            <span className="choice-main">{t('menu.mode.pve')}</span>
            <span className="choice-note">SOLO</span>
          </button>
          <button
            className={`choice choice-compact choice-mode${mode === 'pvp' ? ' is-on' : ''}`}
            onClick={() => setMode('pvp')}
          >
            <span className="choice-main">{t('menu.mode.pvp')}</span>
            <span className="choice-note">LOCAL</span>
          </button>
          <button
            className={`choice choice-compact choice-mode${mode === 'tutorial' ? ' is-on' : ''}`}
            onClick={() => setMode('tutorial')}
          >
            <span className="choice-main">{t('menu.mode.tutorial')}</span>
            <span className="choice-note">GUIDE</span>
          </button>
          <button
            className={`choice choice-compact choice-mode${mode === 'puzzle' ? ' is-on' : ''}`}
            onClick={() => setMode('puzzle')}
          >
            <span className="choice-main">{t('menu.mode.puzzle')}</span>
            <span className="choice-note">PUZZLE</span>
          </button>
          <button
            className={`choice choice-compact choice-mode${mode === 'online' ? ' is-on' : ''}`}
            onClick={() => setMode('online')}
          >
            <span className="choice-main">{t('menu.mode.online')}</span>
            <span className="choice-note">ONLINE</span>
          </button>
        </div>
      </section>

      {mode === 'online' && (
        <section className="block">
          <div className="block-head">
            <span className="block-num">{num()}</span>
            <h2>{t('menu.onlineHeading')}</h2>
            <span className="puzzle-head-meta">
              <span className="puzzle-count">1v1 · P2P</span>
            </span>
          </div>
          <OnlinePanel {...online} />
        </section>
      )}

      {mode === 'tutorial' && (
        <section className="block">
          <div className="block-head">
            <span className="block-num">{num()}</span>
            <h2>{t('menu.tutorialHeading')}</h2>
            <span className="puzzle-head-meta">
              <span className="puzzle-count">
                {t('menu.learned', {
                  done: tutorialSolvedCount,
                  total: TUTORIALS.length,
                })}
              </span>
              {tutorialSolvedCount > 0 && (
                <button className="text-btn puzzle-reset" onClick={onResetTutorials}>
                  {t('common.reset')}
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
                    <span className="puzzle-check" aria-label={done ? t('menu.learnedYes') : t('menu.learnedNo')}>
                      {done ? '✓' : ''}
                    </span>
                  </span>
                  <span className="puzzle-title">{text(lesson.title)}</span>
                  <span className="puzzle-meta">
                    {lesson.size}×{lesson.size} ·{' '}
                    {tp('menu.guidedSteps', lesson.steps.length)}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="puzzle-brief">
            {text(selectedTutorial.goal)} {text(selectedTutorial.tip)}
          </p>
        </section>
      )}

      {mode === 'puzzle' && (
        <section className="block">
          <div className="block-head">
            <span className="block-num">{num()}</span>
            <h2>{t('menu.puzzleHeading')}</h2>
            <span className="puzzle-head-meta">
              <span className="puzzle-count">
                {t('menu.solved', {
                  done: solvedCount,
                  total: PUZZLES.length,
                })}
              </span>
              {solvedCount > 0 && (
                <button className="text-btn puzzle-reset" onClick={onResetPuzzles}>
                  {t('common.reset')}
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
                    <span className="puzzle-check" aria-label={record?.solved ? t('menu.solvedYes') : t('menu.solvedNo')}>
                      {record?.solved ? '✓' : ''}
                    </span>
                  </span>
                  <span className="puzzle-title">{text(puzzle.title)}</span>
                  <span className="puzzle-meta">
                    {puzzle.size}×{puzzle.size} ·{' '}
                    {t('menu.mateIn', { count: puzzle.moveLimit })}
                  </span>
                  {record?.solved && (
                    <span className="puzzle-best">
                      {tp('menu.bestMoves', record.best)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="puzzle-brief">{text(selectedPuzzle.note)}</p>
        </section>
      )}

      {mode === 'pvp' && (
        <section className="block">
          <div className="block-head">
            <span className="block-num">{num()}</span>
            <h2>{t('menu.playerHeading')}</h2>
          </div>
          <div className="choices choices-5">
            {PLAYER_COUNTS.map((count) => (
              <button
                key={count}
                className={`choice choice-compact${players === count ? ' is-on' : ''}`}
                onClick={() => setPlayers(count)}
              >
                <span className="choice-main">
                  {t('menu.playerCount', { count })}
                </span>
                <span className="choice-note">{PLAYER_NOTES[count - 2]}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {(mode === 'pve' || mode === 'pvp' || mode === 'online') && (
        <section className="block">
          <div className="block-head">
            <span className="block-num">{num()}</span>
            <h2>{mode === 'online' ? t('menu.onlineBoardHeading') : t('menu.boardHeading')}</h2>
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
                <span className="choice-note">
                  {t('menu.connect', { count: SIZE_WIN[boardSize] })}
                </span>
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
              <h2>{t('menu.difficultyHeading')}</h2>
            </div>
            <div className="choices choices-3">
              {(['easy', 'normal', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  className={`choice${difficulty === level ? ' is-on' : ''}`}
                  onClick={() => setDifficulty(level)}
                >
                  <span className="choice-main">{t(DIFFICULTY_KEYS[level])}</span>
                  <span className="choice-note">{level.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <span className="block-num">{num()}</span>
              <h2>{t('menu.firstHeading')}</h2>
            </div>
            <div className="choices choices-2">
              <button
                className={`choice${humanFirst ? ' is-on' : ''}`}
                onClick={() => setHumanFirst(true)}
              >
                <span className="choice-main">{t('menu.firstMe')}</span>
                <span className="choice-note">FIRST</span>
              </button>
              <button
                className={`choice${!humanFirst ? ' is-on' : ''}`}
                onClick={() => setHumanFirst(false)}
              >
                <span className="choice-main">{t('menu.firstAi')}</span>
                <span className="choice-note">SECOND</span>
              </button>
            </div>
          </section>
        </>
      )}

      <section className="block">
        <div className="block-head">
          <span className="block-num">{num()}</span>
          <h2>{t('menu.appearanceHeading')}</h2>
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
            <span className="choice-main">
              {t('menu.skinTheme', { name: text(skin.name) })}
            </span>
            <span className="choice-note">
              {t('menu.skinNote', { name: skin.note })}
            </span>
            <span className="appearance-meta">
              {boardNote || customPieces
                ? [
                    boardNote,
                    customPieces ? t('menu.customPieces') : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : t('menu.appearanceMeta')}
            </span>
          </span>
          <span className="appearance-open">
            <SettingsIcon size={14} />
            {t('common.settings')}
          </span>
        </button>
      </section>

      {mode !== 'online' && (
        <button className="start-btn" onClick={start}>
          <span>
            {mode === 'puzzle'
              ? t('menu.startPuzzle')
              : mode === 'tutorial'
                ? t('menu.startTutorial')
                : t('menu.startMatch')}
          </span>
          <ArrowRightIcon />
        </button>
      )}

      {mode === 'online' ? (
        <div className="scorecard">
          <span className="scorecard-title">{t('menu.onlineStatus')}</span>
          <span className="score-item">
            <span
              className={`online-dot${
                online.phase === 'playing' || online.phase === 'waiting'
                  ? ' is-on'
                  : online.phase === 'connecting' || online.phase === 'syncing'
                    ? ' is-busy'
                    : ''
              }`}
            />
            {t(ONLINE_STATUS_KEYS[online.phase])}
          </span>
          <span className="score-draw">
            {online.code
              ? t('menu.onlineRoom', { code: online.code })
              : '1v1 · WebRTC'}
          </span>
        </div>
      ) : mode === 'tutorial' ? (
        <div className="scorecard">
          <span className="scorecard-title">{t('menu.tutorialProgress')}</span>
          <span className="score-item">
            <span className="puzzle-check">✓</span>
            {tutorialSolvedCount} / {TUTORIALS.length}
          </span>
          <span className="score-draw">
            {tutorialSolvedCount === TUTORIALS.length
              ? t('menu.allDone')
              : t('menu.tutorialHint')}
          </span>
        </div>
      ) : mode === 'puzzle' ? (
        <div className="scorecard">
          <span className="scorecard-title">{t('menu.puzzleProgress')}</span>
          <span className="score-item">
            <span className="puzzle-check">✓</span>
            {solvedCount} / {PUZZLES.length}
          </span>
          <span className="score-draw">
            {bestSolved === null
              ? t('menu.bestNone')
              : tp('menu.bestMoves', bestSolved)}
          </span>
        </div>
      ) : (
        <div className="scorecard">
          <span className="scorecard-title">{t('menu.record')}</span>
          <span className="score-item">
            <i className="chip chip-p1" />
            {stats.p1}
          </span>
          <span className="score-item">
            <i className="chip chip-p2" />
            {stats.p2}
          </span>
          <span className="score-item score-draw">
            {t('game.draws', { count: stats.draws })}
          </span>
          <button className="text-btn" onClick={onResetStats}>
            {t('menu.clearStats')}
          </button>
        </div>
      )}

      <details className="notes">
        <summary>{t('menu.howToPlay')}</summary>
        <ul>
          {mode === 'tutorial' ? (
            <>
              <li>{t('menu.notes.tutorial1')}</li>
              <li>{t('menu.notes.tutorial2')}</li>
              <li>{t('menu.notes.tutorial3')}</li>
            </>
          ) : mode === 'puzzle' ? (
            <>
              <li>{t('menu.notes.puzzle1')}</li>
              <li>{t('menu.notes.puzzle2')}</li>
              <li>{t('menu.notes.puzzle3')}</li>
              <li>{t('menu.notes.puzzle4')}</li>
            </>
          ) : mode === 'online' ? (
            <>
              <li>{t('menu.notes.online1')}</li>
              <li>{t('menu.notes.online2')}</li>
              <li>{t('menu.notes.online3')}</li>
              <li>{t('menu.notes.online4')}</li>
            </>
          ) : (
            <>
              <li>{t('menu.notes.play1')}</li>
              <li>{t('menu.notes.play2')}</li>
              <li>{t('menu.notes.play3')}</li>
              <li>{t('menu.notes.play4')}</li>
            </>
          )}
          <li>{t('menu.notes.appearance')}</li>
        </ul>
      </details>

      <p className="colophon">{t('menu.colophon')}</p>
    </main>
  );
}
