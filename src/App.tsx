import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { DIFFICULTY_LABELS } from './ai/engine';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { ArrowLeftIcon, SettingsIcon } from './components/Icons';
import { Menu, type MatchConfig } from './components/Menu';
import { PuzzlePanel } from './components/PuzzlePanel';
import { ResultPanel } from './components/ResultPanel';
import { Settings } from './components/Settings';
import { TutorialCoach } from './components/TutorialCoach';
import { TutorialPanel } from './components/TutorialPanel';
import {
  PUZZLES,
  createPuzzleState,
  findBestMove,
  getNextPuzzle,
  getPuzzle,
} from './game/puzzle';
import {
  TUTORIALS,
  createTutorialState,
  getNextTutorial,
  getTutorial,
  isTutorialComplete,
} from './game/tutorial';
import {
  colLabel,
  createSession,
  drop,
  makeConfig,
  sessionReducer,
  type DuoPlayer,
} from './game/rules';
import { useAiEngine } from './hooks/useAiEngine';
import { useAppearance } from './hooks/useAppearance';
import { usePuzzleProgress } from './hooks/usePuzzleProgress';
import { useStats } from './hooks/useStats';
import { useTutorialProgress } from './hooks/useTutorialProgress';
import { playDrop, playWin } from './lib/sound';

type Screen = 'menu' | 'game';

const DEFAULT_CONFIG: MatchConfig = {
  mode: 'pve',
  difficulty: 'normal',
  humanFirst: true,
  players: 2,
  size: 6,
  puzzleId: null,
  tutorialId: null,
};

interface Series {
  wins: number[];
  draws: number;
}

function emptySeries(players: number): Series {
  return { wins: new Array<number>(players).fill(0), draws: 0 };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [match, setMatch] = useState<MatchConfig>(DEFAULT_CONFIG);
  const [session, dispatch] = useReducer(sessionReducer, undefined, () =>
    createSession(1, makeConfig(DEFAULT_CONFIG.size, 2)),
  );
  const [thinking, setThinking] = useState(false);
  const [hint, setHint] = useState<number | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [resultVisible, setResultVisible] = useState(false);
  const [series, setSeries] = useState<Series>(() => emptySeries(2));
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [puzzleHints, setPuzzleHints] = useState(0);
  const [puzzleExhausted, setPuzzleExhausted] = useState(false);
  const [puzzleNotice, setPuzzleNotice] = useState<string | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialReply, setTutorialReply] = useState<number | null>(null);
  const [tutorialFeedback, setTutorialFeedback] = useState<string | null>(null);

  const requestMove = useAiEngine();
  const {
    skin,
    pieces,
    setSkinId,
    setPieceColor,
    setPieceImage,
    resetPieces,
  } = useAppearance();
  const { stats, record, reset: resetStats } = useStats();
  const {
    progress: puzzleProgress,
    recordSolve,
    reset: resetPuzzles,
  } = usePuzzleProgress();
  const {
    progress: tutorialProgress,
    recordSolve: recordTutorialSolve,
    reset: resetTutorials,
  } = useTutorialProgress();

  const state = session.current;
  const game = state.config;
  const puzzle = match.mode === 'puzzle' ? getPuzzle(match.puzzleId) ?? PUZZLES[0] : null;
  const tutorial =
    match.mode === 'tutorial' ? getTutorial(match.tutorialId) ?? TUTORIALS[0] : null;
  const tutorialComplete = tutorial
    ? isTutorialComplete(tutorial, state, tutorialStep)
    : false;
  const aiPlayer: DuoPlayer | null =
    match.mode === 'pve' ? ((match.humanFirst ? 2 : 1) as DuoPlayer) : null;
  const isAiTurn = aiPlayer !== null && state.turn === aiPlayer;
  const humanMoves = Math.ceil(session.past.length / 2);
  const remainingMoves = puzzle ? Math.max(0, puzzle.moveLimit - humanMoves) : 0;
  const usedMoves = puzzle ? Math.min(humanMoves, puzzle.moveLimit) : humanMoves;
  const nextPuzzle = puzzle ? getNextPuzzle(puzzle.id) : null;
  const nextTutorial = tutorial ? getNextTutorial(tutorial.id) : null;
  const recordedRef = useRef(false);
  const prevCountRef = useRef(0);

  /* ---------- 结算 ---------- */
  useEffect(() => {
    if (screen !== 'game') return;
    if (match.mode === 'tutorial') return;
    if (state.status === 'playing' && !puzzleExhausted) return;
    if (recordedRef.current) return;
    recordedRef.current = true;

    if (match.mode === 'puzzle') {
      if (!puzzle) return;
      if (state.status === 'won' && state.winner === puzzle.human) {
        setPuzzleSolved(true);
        recordSolve(puzzle.id, Math.ceil(session.past.length / 2), puzzleHints);
        playWin(soundOn);
      }
      return;
    }

    const winner = state.winner;
    const players = state.config.players;
    setSeries((prev) => {
      const wins =
        prev.wins.length === players ? [...prev.wins] : emptySeries(players).wins;
      if (winner !== null) wins[winner - 1] += 1;
      return { wins, draws: prev.draws + (winner === null ? 1 : 0) };
    });

    if (players === 2) {
      record((winner ?? null) as DuoPlayer | null);
    }
    if (state.status === 'won') playWin(soundOn);
  }, [
    screen,
    state.status,
    state.winner,
    state.config.players,
    record,
    soundOn,
    match.mode,
    puzzle,
    puzzleExhausted,
    session.past.length,
    puzzleHints,
    recordSolve,
  ]);

  /* ---------- 教程完成 ---------- */
  useEffect(() => {
    if (screen !== 'game' || match.mode !== 'tutorial' || !tutorial || !tutorialComplete) {
      return;
    }
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordTutorialSolve(tutorial.id);
    playWin(soundOn);
  }, [
    screen,
    match.mode,
    tutorial,
    tutorialComplete,
    recordTutorialSolve,
    soundOn,
  ]);

  /* ---------- 结算面板延迟出现，先让玩家看清连成的那条线 ---------- */
  useEffect(() => {
    const ended = state.status !== 'playing' || puzzleExhausted || tutorialComplete;
    if (screen !== 'game' || !ended) {
      setResultVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setResultVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, [screen, state.status, state.count, puzzleExhausted, tutorialComplete]);

  /* ---------- 落子音效 ---------- */
  useEffect(() => {
    if (screen !== 'game') {
      prevCountRef.current = state.count;
      return;
    }
    if (state.count > prevCountRef.current && state.last !== null) {
      const player = state.board[state.last];
      if (player >= 1 && player <= 6) playDrop(player, soundOn);
    }
    prevCountRef.current = state.count;
  }, [screen, state, soundOn]);

  /* ---------- 常规 AI 行动 ---------- */
  useEffect(() => {
    if (screen !== 'game' || aiPlayer === null) return;
    if (state.status !== 'playing' || state.turn !== aiPlayer) {
      setThinking(false);
      return;
    }

    let cancelled = false;
    setThinking(true);

    const timer = window.setTimeout(() => {
      requestMove(state.board, state.heights, aiPlayer, match.difficulty, game)
        .then((result) => {
          if (!cancelled && result.col >= 0) dispatch({ type: 'play', col: result.col });
        })
        .catch(() => {
          /* 引擎失败就停在原地，用户可以重开 */
        })
        .finally(() => {
          if (!cancelled) setThinking(false);
        });
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [screen, aiPlayer, state, game, match.difficulty, requestMove]);

  /* ---------- 谜题 AI 防守 ---------- */
  useEffect(() => {
    if (screen !== 'game' || match.mode !== 'puzzle' || !puzzle || puzzleExhausted) {
      return;
    }
    if (state.status !== 'playing' || state.turn !== 2) {
      setThinking(false);
      return;
    }

    const used = Math.ceil(session.past.length / 2);
    if (used >= puzzle.moveLimit) {
      setThinking(false);
      return;
    }

    let cancelled = false;
    setThinking(true);

    const timer = window.setTimeout(() => {
      const remaining = Math.max(1, puzzle.moveLimit - used);
      const result = findBestMove(state, remaining * 2);
      if (!cancelled && result.col !== null) {
        dispatch({ type: 'play', col: result.col });
      }
      if (!cancelled) setThinking(false);
    }, 420);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    screen,
    match.mode,
    puzzle,
    puzzleExhausted,
    state,
    session.past.length,
  ]);

  /* ---------- 教程对手应手 ---------- */
  useEffect(() => {
    if (screen !== 'game' || match.mode !== 'tutorial' || tutorialReply === null) return;

    const timer = window.setTimeout(() => {
      if (state.heights[tutorialReply] < state.config.rows) {
        dispatch({ type: 'play', col: tutorialReply });
        setTutorialStep((step) => step + 1);
      }
      setTutorialReply(null);
      setThinking(false);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [screen, match.mode, tutorialReply, state.heights, state.config.rows]);

  /* ---------- 玩家用完限定步数时，立即结束本次尝试 ---------- */
  useEffect(() => {
    if (screen !== 'game' || match.mode !== 'puzzle' || !puzzle) return;
    if (state.status !== 'playing' || state.turn !== 2) return;
    if (Math.ceil(session.past.length / 2) >= puzzle.moveLimit) {
      setPuzzleExhausted(true);
      setThinking(false);
    }
  }, [screen, match.mode, puzzle, state.status, state.turn, session.past.length]);

  /* ---------- 提示在落子后自动消失 ---------- */
  useEffect(() => {
    setHint(null);
  }, [state.count]);

  /* ---------- 操作 ---------- */
  const startMatch = useCallback((next: MatchConfig) => {
    const nextPuzzle =
      next.mode === 'puzzle' ? getPuzzle(next.puzzleId) ?? PUZZLES[0] : null;
    const nextTutorial =
      next.mode === 'tutorial' ? getTutorial(next.tutorialId) ?? TUTORIALS[0] : null;
    const nextPlayers = next.mode === 'pvp' ? next.players : 2;
    const nextSize = nextPuzzle
      ? nextPuzzle.size
      : nextTutorial
        ? nextTutorial.size
        : next.size;
    const nextGame = makeConfig(nextSize, nextPlayers);

    setMatch({
      ...next,
      players: nextPlayers,
      size: nextSize,
      puzzleId: nextPuzzle?.id ?? null,
      tutorialId: nextTutorial?.id ?? null,
    });
    setSeries(emptySeries(nextPlayers));

    if (nextPuzzle) {
      const loaded = createPuzzleState(nextPuzzle);
      dispatch({ type: 'load', state: loaded });
      prevCountRef.current = loaded.count;
    } else if (nextTutorial) {
      const loaded = createTutorialState(nextTutorial);
      dispatch({ type: 'load', state: loaded });
      prevCountRef.current = loaded.count;
    } else {
      dispatch({ type: 'reset', config: nextGame });
      prevCountRef.current = 0;
    }

    recordedRef.current = false;
    setHint(null);
    setThinking(false);
    setResultVisible(false);
    setPuzzleSolved(false);
    setPuzzleHints(0);
    setPuzzleExhausted(false);
    setPuzzleNotice(null);
    setTutorialStep(0);
    setTutorialReply(null);
    setTutorialFeedback(null);
    setScreen('game');
  }, []);

  const play = useCallback(
    (col: number) => {
      if (thinking || puzzleExhausted) return;
      if (state.status !== 'playing') return;
      if (aiPlayer !== null && state.turn === aiPlayer) return;
      if (match.mode === 'puzzle' && state.turn !== 1) return;

      if (match.mode === 'tutorial') {
        if (!tutorial || tutorialComplete || tutorialReply !== null) return;
        const step = tutorial.steps[tutorialStep];
        if (!step) return;
        if (col !== step.expect) {
          setTutorialFeedback(`这一手试试 ${colLabel(step.expect)} 列。`);
          return;
        }
        setTutorialFeedback(null);
        const next = drop(state, col);
        dispatch({ type: 'play', col });
        if (next.status !== 'playing') return;
        if (step.reply !== undefined) {
          setThinking(true);
          setTutorialReply(step.reply);
        } else {
          setTutorialStep((current) => current + 1);
        }
        return;
      }

      setPuzzleNotice(null);
      dispatch({ type: 'play', col });
    },
    [
      thinking,
      state,
      aiPlayer,
      match.mode,
      puzzleExhausted,
      tutorial,
      tutorialStep,
      tutorialComplete,
      tutorialReply,
    ],
  );

  const undo = useCallback(() => {
    if (thinking || puzzleExhausted || match.mode === 'tutorial') return;
    if (state.status !== 'playing') return;
    const steps = match.mode === 'pve' || match.mode === 'puzzle' ? 2 : 1;
    setPuzzleNotice(null);
    dispatch({ type: 'undo', steps });
  }, [thinking, state.status, match.mode, puzzleExhausted]);

  const restart = useCallback(() => {
    if (tutorial) {
      const loaded = createTutorialState(tutorial);
      dispatch({ type: 'load', state: loaded });
      prevCountRef.current = loaded.count;
    } else if (puzzle) {
      const loaded = createPuzzleState(puzzle);
      dispatch({ type: 'load', state: loaded });
      prevCountRef.current = loaded.count;
    } else {
      dispatch({ type: 'reset' });
      prevCountRef.current = 0;
    }
    recordedRef.current = false;
    setHint(null);
    setThinking(false);
    setResultVisible(false);
    setPuzzleSolved(false);
    setPuzzleHints(0);
    setPuzzleExhausted(false);
    setPuzzleNotice(null);
    setTutorialStep(0);
    setTutorialReply(null);
    setTutorialFeedback(null);
  }, [puzzle, tutorial]);

  const swap = useCallback(() => {
    if (match.mode !== 'pve') return;
    setMatch((prev) => ({ ...prev, humanFirst: !prev.humanFirst }));
    dispatch({ type: 'reset' });
    recordedRef.current = false;
    prevCountRef.current = 0;
    setHint(null);
    setThinking(false);
    setResultVisible(false);
  }, [match.mode]);

  const askHint = useCallback(async () => {
    if (state.status !== 'playing' || thinking || hintLoading || puzzleExhausted) return;
    if (aiPlayer !== null && state.turn === aiPlayer) return;

    if (match.mode === 'tutorial') {
      const step = tutorial?.steps[tutorialStep];
      if (!step) return;
      setTutorialFeedback(null);
      setHint(step.expect);
      return;
    }

    if (match.mode === 'puzzle') {
      if (!puzzle || state.turn !== puzzle.human || remainingMoves <= 0) return;
      setPuzzleNotice(null);
      setHintLoading(true);
      try {
        const result = findBestMove(state, remainingMoves * 2 - 1);
        if (result.col !== null && result.score > 0) {
          setHint(result.col);
          setPuzzleHints((count) => count + 1);
        } else {
          setHint(null);
          setPuzzleNotice('当前局面已无法在限定步数内取胜，重开或按 R。');
        }
      } finally {
        setHintLoading(false);
      }
      return;
    }

    if (state.config.players !== 2) return;
    setHintLoading(true);
    try {
      const result = await requestMove(
        state.board,
        state.heights,
        state.turn as DuoPlayer,
        'hard',
        game,
      );
      if (result.col >= 0) setHint(result.col);
    } catch {
      /* 忽略 */
    } finally {
      setHintLoading(false);
    }
  }, [
    state,
    thinking,
    hintLoading,
    aiPlayer,
    match.mode,
    puzzle,
    remainingMoves,
    requestMove,
    game,
    puzzleExhausted,
    tutorial,
    tutorialStep,
  ]);

  /* ---------- 键盘 ---------- */
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  useEffect(() => {
    if (screen !== 'game' || settingsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key >= '0' && event.key <= '9') {
        const col = event.key === '0' ? 9 : Number(event.key) - 1;
        if (col < game.cols) {
          event.preventDefault();
          play(col);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        undo();
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        restart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, settingsOpen, play, undo, restart, game.cols]);

  /* ---------- 渲染 ---------- */
  const settingsOverlay = settingsOpen ? (
    <Settings
      skin={skin}
      pieces={pieces}
      onSkinChange={setSkinId}
      onPieceColorChange={setPieceColor}
      onPieceImageChange={setPieceImage}
      onResetPieces={resetPieces}
      onClose={closeSettings}
    />
  ) : null;

  if (screen === 'menu') {
    return (
      <div className="app">
        <Menu
          initial={match}
          stats={stats}
          puzzleProgress={puzzleProgress}
          tutorialProgress={tutorialProgress}
          skin={skin}
          pieces={pieces}
          onOpenSettings={openSettings}
          onStart={startMatch}
          onResetStats={resetStats}
          onResetPuzzles={resetPuzzles}
          onResetTutorials={resetTutorials}
        />
        {settingsOverlay}
      </div>
    );
  }

  const turnLabel = (() => {
    if (puzzleExhausted) return '步数用尽';
    if (tutorialComplete) return '教程完成';
    if (tutorial) return thinking ? '对手回应中…' : '你的回合';
    if (state.status === 'draw') return '和棋';
    if (state.status === 'won') {
      if (puzzle) return state.winner === puzzle.human ? '解开了' : '防守成功';
      return '对局结束';
    }
    if (match.mode === 'puzzle') {
      if (thinking) return 'AI 防守中…';
      return state.turn === 1 ? '你的回合' : 'AI 回合';
    }
    if (match.mode === 'pve') {
      if (thinking) return 'AI 思考中…';
      return state.turn === aiPlayer ? 'AI 回合' : '你的回合';
    }
    if (game.players === 2) return state.turn === 1 ? '先手回合' : '后手回合';
    return `玩家 ${state.turn} 回合`;
  })();

  const modeLabel = tutorial
    ? `教程 · NO.${String(tutorial.no).padStart(2, '0')} · ${game.cols}×${game.rows}`
    : puzzle
      ? `残局 · NO.${String(puzzle.no).padStart(2, '0')} · ${game.cols}×${game.rows}`
      : match.mode === 'pve'
        ? `人机 · ${DIFFICULTY_LABELS[match.difficulty]} · ${game.cols}×${game.rows}`
        : `本地 · ${game.players} 人 · ${game.cols}×${game.rows}`;

  const canHint =
    match.mode === 'tutorial'
      ? Boolean(tutorial) &&
        !tutorialComplete &&
        state.status === 'playing' &&
        !thinking &&
        !hintLoading
      : match.mode === 'puzzle'
        ? Boolean(puzzle) &&
          state.status === 'playing' &&
          state.turn === 1 &&
          !thinking &&
          !hintLoading &&
          !puzzleExhausted &&
          remainingMoves > 0
        : game.players === 2 &&
          state.status === 'playing' &&
          !thinking &&
          !hintLoading &&
          !isAiTurn;

  const startNextPuzzle = () => {
    if (!nextPuzzle) return;
    startMatch({
      ...match,
      mode: 'puzzle',
      puzzleId: nextPuzzle.id,
      size: nextPuzzle.size,
      players: 2,
    });
  };

  const startNextTutorial = () => {
    if (!nextTutorial) return;
    startMatch({
      ...match,
      mode: 'tutorial',
      tutorialId: nextTutorial.id,
      size: nextTutorial.size,
      players: 2,
    });
  };

  return (
    <div className="app">
      <main className="game">
        <header className="game-head">
          <div className="head-row">
            <button
              className="back-btn"
              onClick={() => setScreen('menu')}
              aria-label="返回菜单"
            >
              <ArrowLeftIcon />
            </button>
            <div className="head-brand">
              <span className="wordmark-4">4</span>
              <span>LINK</span>
            </div>
            <span className="head-rule" />
            <span className="head-mode">{modeLabel}</span>
            <button
              type="button"
              className="settings-trigger head-settings"
              onClick={openSettings}
              aria-label="打开设置"
            >
              <SettingsIcon size={15} />
            </button>
          </div>

          <div className="status-row">
            <div className="turn-chip">
              <span className={`turn-dot p${state.turn}`} />
              <span>{turnLabel}</span>
            </div>

            {tutorial ? (
              <div className="score-inline puzzle-limits" title="教程进度">
                <span>
                  课程 {tutorial.no} / {TUTORIALS.length}
                </span>
                <span className="score-draws">
                  {tutorialComplete
                    ? '完成'
                    : `步骤 ${Math.min(tutorialStep + 1, tutorial.steps.length)} / ${tutorial.steps.length}`}
                </span>
              </div>
            ) : puzzle ? (
              <div className="score-inline puzzle-limits" title="限定步数">
                <span>限 {puzzle.moveLimit} 步</span>
                <span className="score-draws">
                  已用 {usedMoves} / {puzzle.moveLimit}
                </span>
              </div>
            ) : (
              <div className="score-inline" title="本场胜局">
                {series.wins.map((wins, i) => (
                  <span className="score-item" key={i}>
                    <i className={`chip chip-p${i + 1}`} />
                    {wins}
                  </span>
                ))}
                {series.draws > 0 && (
                  <span className="score-draws">和 {series.draws}</span>
                )}
              </div>
            )}
          </div>
        </header>

        {tutorial && (
          <TutorialCoach
            lesson={tutorial}
            stepIndex={tutorialStep}
            thinking={thinking}
            feedback={tutorialFeedback}
            complete={tutorialComplete}
          />
        )}

        <div className="board-wrap">
          <Board
            state={state}
            disabled={thinking || isAiTurn || puzzleExhausted || tutorialComplete}
            hint={game.players === 2 ? hint : null}
            onPlay={play}
            title={
              tutorial
                ? `新手教程 · ${tutorial.title}`
                : puzzle
                  ? `残局 · ${puzzle.title}`
                  : undefined
            }
            meta={
              tutorial
                ? `${tutorial.size} × ${tutorial.size} · 教程`
                : puzzle
                  ? `${puzzle.size} × ${puzzle.size} · 限 ${puzzle.moveLimit} 步`
                  : undefined
            }
            footer={
              tutorial
                ? 'TUTORIAL · 跟着提示点击列'
                : puzzle
                  ? `PUZZLE · 你执先手 · ${puzzle.moveLimit} 步内取胜`
                  : undefined
            }
          />
          {tutorial ? (
            <TutorialPanel
              lesson={tutorial}
              nextLesson={nextTutorial}
              visible={resultVisible && tutorialComplete}
              onAgain={restart}
              onNext={startNextTutorial}
              onMenu={() => setScreen('menu')}
            />
          ) : puzzle ? (
            <PuzzlePanel
              puzzle={puzzle}
              state={state}
              solved={puzzleSolved}
              moves={usedMoves}
              hints={puzzleHints}
              nextPuzzle={nextPuzzle}
              visible={resultVisible}
              exhausted={puzzleExhausted}
              onAgain={restart}
              onNext={startNextPuzzle}
              onMenu={() => setScreen('menu')}
            />
          ) : (
            <ResultPanel
              state={state}
              mode={match.mode === 'pvp' ? 'pvp' : 'pve'}
              humanFirst={match.humanFirst}
              visible={resultVisible}
              onAgain={restart}
              onSwap={swap}
              onMenu={() => setScreen('menu')}
            />
          )}
        </div>

        {puzzleNotice && <p className="puzzle-notice">{puzzleNotice}</p>}

        <Controls
          onUndo={undo}
          onRestart={restart}
          onHint={askHint}
          onToggleSound={() => setSoundOn((v) => !v)}
          soundOn={soundOn}
          canUndo={
            state.status === 'playing' &&
            !puzzleExhausted &&
            !tutorial &&
            session.past.length > 0 &&
            !thinking
          }
          canHint={canHint}
          hintLoading={hintLoading}
          showHint={game.players === 2}
        />
      </main>
      {settingsOverlay}
    </div>
  );
}
