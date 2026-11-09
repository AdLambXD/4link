import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Difficulty } from './ai/engine';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { EndlessPanel } from './components/EndlessPanel';
import { ArrowLeftIcon, SettingsIcon } from './components/Icons';
import { Menu, type MatchConfig } from './components/Menu';
import { PuzzlePanel } from './components/PuzzlePanel';
import { ResultPanel } from './components/ResultPanel';
import { Settings } from './components/Settings';
import { TutorialCoach } from './components/TutorialCoach';
import { TutorialPanel } from './components/TutorialPanel';
import { isEndlessOver, playEndless } from './game/endless';
import { playRotation } from './game/rotation';
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
  type GameState,
} from './game/rules';
import { useAiEngine } from './hooks/useAiEngine';
import { useAppearance } from './hooks/useAppearance';
import { useEndlessBest, type EndlessSize } from './hooks/useEndlessBest';
import { useOnlineGame } from './hooks/useOnlineGame';
import { usePuzzleProgress } from './hooks/usePuzzleProgress';
import { useStats } from './hooks/useStats';
import { useTutorialProgress } from './hooks/useTutorialProgress';
import { useI18n, type StringKey } from './i18n';
import { playDrop, playWin } from './lib/sound';
import { ONLINE_ERROR_KEYS, ONLINE_NOTICE_KEYS } from './net/labels';

type Screen = 'menu' | 'game';

const DIFFICULTY_KEYS: Record<Difficulty, StringKey> = {
  easy: 'difficulty.easy',
  normal: 'difficulty.normal',
  hard: 'difficulty.hard',
};

const DEFAULT_CONFIG: MatchConfig = {
  mode: 'pve',
  opponent: 'ai',
  difficulty: 'normal',
  humanFirst: true,
  players: 2,
  size: 6,
  puzzleId: null,
  tutorialId: null,
};

/** 旋转模式的三段式过渡：落子 → 旋转 → 塌落。 */
interface RotationFx {
  phase: 'drop' | 'rotate' | 'settle';
  dropped: GameState;
  final: GameState;
  falls: Readonly<Record<number, number>>;
}

interface Series {
  wins: number[];
  draws: number;
}

function emptySeries(players: number): Series {
  return { wins: new Array<number>(players).fill(0), draws: 0 };
}

export default function App() {
  const { t, tp, text } = useI18n();
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
  const [puzzleNoWin, setPuzzleNoWin] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialReply, setTutorialReply] = useState<number | null>(null);
  const [tutorialFeedback, setTutorialFeedback] = useState<number | null>(null);
  const [endlessMoves, setEndlessMoves] = useState(0);
  const [endlessScrolls, setEndlessScrolls] = useState(0);
  const [endlessNewBest, setEndlessNewBest] = useState(false);
  const [endlessNotice, setEndlessNotice] = useState<{
    key: StringKey;
    id: number;
  } | null>(null);
  const [rotationTurns, setRotationTurns] = useState(0);
  const [rotationNotice, setRotationNotice] = useState<{
    key: StringKey;
    id: number;
  } | null>(null);
  const [rotationFx, setRotationFx] = useState<RotationFx | null>(null);

  const requestMove = useAiEngine();
  const {
    skin,
    pieces,
    board,
    setSkinId,
    setPieceColor,
    setPieceImage,
    resetPieces,
    setBoardStyle,
    setBoardFace,
    setBoardImage,
    setBoardVeil,
    resetBoard,
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
  const {
    best: endlessBest,
    recordBest: recordEndlessBest,
    reset: resetEndlessBest,
  } = useEndlessBest();

  const state = session.current;
  const game = state.config;
  const puzzle = match.mode === 'puzzle' ? getPuzzle(match.puzzleId) ?? PUZZLES[0] : null;
  const tutorial =
    match.mode === 'tutorial' ? getTutorial(match.tutorialId) ?? TUTORIALS[0] : null;
  const tutorialComplete = tutorial
    ? isTutorialComplete(tutorial, state, tutorialStep)
    : false;
  // 无尽模式固定 AI 先手，玩家永远执防守方。
  const human: DuoPlayer =
    match.mode === 'endless' ? 2 : match.humanFirst ? 1 : 2;
  const rotationLocal = match.mode === 'rotation' && match.opponent === 'local';
  const aiPlayer: DuoPlayer | null =
    match.mode === 'pve' ||
    match.mode === 'endless' ||
    (match.mode === 'rotation' && !rotationLocal)
      ? human === 1
        ? 2
        : 1
      : null;
  const isAiTurn = aiPlayer !== null && state.turn === aiPlayer;
  const endlessSize: EndlessSize = match.size === 8 ? 8 : 6;
  const endlessBestRecord = endlessBest[endlessSize];
  const humanMoves = Math.ceil(session.past.length / 2);
  const remainingMoves = puzzle ? Math.max(0, puzzle.moveLimit - humanMoves) : 0;
  const usedMoves = puzzle ? Math.min(humanMoves, puzzle.moveLimit) : humanMoves;
  const nextPuzzle = puzzle ? getNextPuzzle(puzzle.id) : null;
  const nextTutorial = tutorial ? getNextTutorial(tutorial.id) : null;
  const recordedRef = useRef(false);
  const prevCountRef = useRef(0);

  const showEndlessNotice = useCallback((key: StringKey) => {
    setEndlessNotice({ key, id: Date.now() });
  }, []);

  const showRotationNotice = useCallback((key: StringKey) => {
    setRotationNotice({ key, id: Date.now() });
  }, []);

  useEffect(() => {
    if (endlessNotice === null) return;
    const timer = window.setTimeout(() => setEndlessNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [endlessNotice]);

  useEffect(() => {
    if (rotationNotice === null) return;
    const timer = window.setTimeout(() => setRotationNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [rotationNotice]);

  // 旋转动画：先让落子动画播完，再旋转，最后让棋子落到新底部。
  useEffect(() => {
    if (rotationFx === null) return;
    const next =
      rotationFx.phase === 'drop'
        ? 'rotate'
        : rotationFx.phase === 'rotate'
          ? 'settle'
          : null;
    const delay =
      rotationFx.phase === 'drop'
        ? 320
        : rotationFx.phase === 'rotate'
          ? 470
          : 400;
    const timer = window.setTimeout(() => {
      setRotationFx((fx) => {
        if (fx !== rotationFx) return fx;
        return next === null ? null : { ...fx, phase: next };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [rotationFx]);

  /* ---------- 联机 ---------- */
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleOnlineState = useCallback((next: GameState) => {
    const entering = screenRef.current === 'menu';
    dispatch({ type: 'load', state: next });

    if (entering) {
      prevCountRef.current = next.count;
      setMatch((prev) => ({
        ...prev,
        mode: 'online',
        players: 2,
        size: next.config.cols as MatchConfig['size'],
        puzzleId: null,
        tutorialId: null,
      }));
      setSeries(emptySeries(2));
      recordedRef.current = false;
      setResultVisible(false);
      setHint(null);
      setThinking(false);
      setPuzzleSolved(false);
      setPuzzleHints(0);
      setPuzzleExhausted(false);
      setPuzzleNoWin(false);
      setTutorialStep(0);
      setTutorialReply(null);
      setTutorialFeedback(null);
      setScreen('game');
      return;
    }

    if (next.count === 0 && stateRef.current.count > 0) {
      // 房主开了新一局
      recordedRef.current = false;
      setResultVisible(false);
      setHint(null);
    }
  }, []);

  const online = useOnlineGame({ size: match.size, onState: handleOnlineState });

  /* ---------- 结算 ---------- */
  useEffect(() => {
    if (screen !== 'game') return;
    if (match.mode === 'tutorial' || match.mode === 'endless') return;
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

    if (players === 2 && match.mode !== 'online') {
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

  /* ---------- 无尽模式结算 ---------- */
  useEffect(() => {
    if (screen !== 'game' || match.mode !== 'endless') return;
    if (aiPlayer === null || !isEndlessOver(state, aiPlayer)) return;
    if (recordedRef.current) return;
    recordedRef.current = true;

    const previous = endlessBestRecord?.moves ?? 0;
    setEndlessNewBest(endlessMoves > previous);
    recordEndlessBest(endlessSize, endlessMoves, endlessScrolls);
    playWin(soundOn);
  }, [
    screen,
    match.mode,
    state.status,
    state.winner,
    aiPlayer,
    endlessMoves,
    endlessScrolls,
    endlessBestRecord,
    endlessSize,
    recordEndlessBest,
    soundOn,
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
    // 旋转模式要等旋转 + 塌落动画播完，再让结算面板盖上来。
    const delay = match.mode === 'rotation' ? 1250 : 900;
    const timer = window.setTimeout(() => setResultVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [
    screen,
    state.status,
    state.count,
    puzzleExhausted,
    tutorialComplete,
    match.mode,
  ]);

  /* ---------- 落子音效 ---------- */
  useEffect(() => {
    // 无尽模式会满盘上移，count 不再单调递增；音效在落子分支里单独播放。
    if (screen !== 'game' || match.mode === 'endless') {
      prevCountRef.current = state.count;
      return;
    }
    if (state.count > prevCountRef.current && state.last !== null) {
      const player = state.board[state.last];
      if (player >= 1 && player <= 6) playDrop(player, soundOn);
    }
    prevCountRef.current = state.count;
  }, [screen, state, soundOn, match.mode]);

  /* ---------- 常规 AI 行动 ---------- */
  useEffect(() => {
    if (screen !== 'game' || aiPlayer === null) return;
    // 旋转动画期间先别让 AI 落下下一手，否则画面会跳。
    if (rotationFx !== null) {
      setThinking(false);
      return;
    }
    if (state.status !== 'playing' || state.turn !== aiPlayer) {
      setThinking(false);
      return;
    }

    const endless = match.mode === 'endless';
    const rotation = match.mode === 'rotation';
    let cancelled = false;
    setThinking(true);

    const timer = window.setTimeout(() => {
      requestMove(
        state.board,
        state.heights,
        aiPlayer,
        endless ? 'hard' : match.difficulty,
        game,
        rotation
          ? { rotation: true }
          : endless
            ? { ignoreWinFor: human }
            : undefined,
      )
        .then((result) => {
          if (cancelled || result.col < 0) return;
          if (rotation) {
            const applied = playRotation(state, result.col);
            if (applied.state === state) return;
            dispatch({ type: 'step', state: applied.state });
            if (applied.rotated && applied.dropped) {
              setRotationTurns((count) => count + 1);
              showRotationNotice('game.rotationNotice.rotated');
              setRotationFx({
                phase: 'drop',
                dropped: applied.dropped,
                final: applied.state,
                falls: applied.falls ?? {},
              });
            }
          } else if (endless) {
            const applied = playEndless(state, result.col, human);
            if (applied.state === state) return;
            dispatch({ type: 'advance', state: applied.state });
            playDrop(aiPlayer, soundOn);
            if (applied.scrolled) {
              setEndlessScrolls((count) => count + 1);
              showEndlessNotice('game.endlessNotice.scrolled');
            }
          } else {
            dispatch({ type: 'play', col: result.col });
          }
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
  }, [
    screen,
    aiPlayer,
    state,
    game,
    match.mode,
    match.difficulty,
    human,
    requestMove,
    showEndlessNotice,
    showRotationNotice,
    soundOn,
    rotationFx,
  ]);

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
    // 联机对局由 useOnlineGame 的 onState 驱动，不走本地开局流程。
    if (next.mode === 'online') return;
    const nextPuzzle =
      next.mode === 'puzzle' ? getPuzzle(next.puzzleId) ?? PUZZLES[0] : null;
    const nextTutorial =
      next.mode === 'tutorial' ? getTutorial(next.tutorialId) ?? TUTORIALS[0] : null;
    const nextPlayers = next.mode === 'pvp' ? next.players : 2;
    const nextSize = nextPuzzle
      ? nextPuzzle.size
      : nextTutorial
        ? nextTutorial.size
        : next.mode === 'endless' && next.size !== 6 && next.size !== 8
          ? 6
          : next.mode === 'rotation' && next.size !== 6 && next.size !== 8
            ? 6
            : next.size;
    const nextGame = makeConfig(nextSize, nextPlayers);

    setMatch({
      ...next,
      difficulty: next.mode === 'endless' ? 'hard' : next.difficulty,
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
    setPuzzleNoWin(false);
    setTutorialStep(0);
    setTutorialReply(null);
    setTutorialFeedback(null);
    setEndlessMoves(0);
    setEndlessScrolls(0);
    setEndlessNewBest(false);
    setEndlessNotice(null);
    setRotationTurns(0);
    setRotationNotice(null);
    setRotationFx(null);
    setScreen('game');
  }, []);

  const play = useCallback(
    (col: number) => {
      if (thinking || puzzleExhausted || rotationFx) return;
      if (state.status !== 'playing') return;
      if (aiPlayer !== null && state.turn === aiPlayer) return;
      if (match.mode === 'puzzle' && state.turn !== 1) return;

      if (match.mode === 'online') {
        if (state.turn !== online.seat) return;
        online.play(col);
        return;
      }

      if (match.mode === 'endless') {
        const applied = playEndless(state, col, human);
        if (applied.state === state) return;
        dispatch({ type: 'advance', state: applied.state });
        playDrop(state.turn, soundOn);
        setEndlessMoves((count) => count + 1);
        if (applied.scrolled) setEndlessScrolls((count) => count + 1);
        if (applied.ignoredWin && applied.scrolled) {
          showEndlessNotice('game.endlessNotice.winAndScroll');
        } else if (applied.ignoredWin) {
          showEndlessNotice('game.endlessNotice.ignoredWin');
        } else if (applied.scrolled) {
          showEndlessNotice('game.endlessNotice.scrolled');
        }
        return;
      }

      if (match.mode === 'rotation') {
        const applied = playRotation(state, col);
        if (applied.state === state) return;
        dispatch({ type: 'step', state: applied.state });
        if (applied.rotated && applied.dropped) {
          setRotationTurns((count) => count + 1);
          showRotationNotice('game.rotationNotice.rotated');
          setRotationFx({
            phase: 'drop',
            dropped: applied.dropped,
            final: applied.state,
            falls: applied.falls ?? {},
          });
        }
        return;
      }

      if (match.mode === 'tutorial') {
        if (!tutorial || tutorialComplete || tutorialReply !== null) return;
        const step = tutorial.steps[tutorialStep];
        if (!step) return;
        if (col !== step.expect) {
          setTutorialFeedback(step.expect);
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

      setPuzzleNoWin(false);
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
      online.seat,
      online.play,
      human,
      showEndlessNotice,
      showRotationNotice,
      soundOn,
      rotationFx,
    ],
  );

  const undo = useCallback(() => {
    if (match.mode === 'online' || match.mode === 'endless') return;
    if (thinking || puzzleExhausted || match.mode === 'tutorial' || rotationFx) {
      return;
    }
    if (state.status !== 'playing') return;
    const steps =
      match.mode === 'pve' || match.mode === 'puzzle'
        ? 2
        : match.mode === 'rotation'
          ? rotationLocal
            ? 1
            : 2
          : 1;
    setPuzzleNoWin(false);
    if (match.mode === 'rotation') {
      setRotationTurns((count) => Math.max(0, count - steps));
    }
    dispatch({ type: 'undo', steps });
  }, [
    thinking,
    state.status,
    match.mode,
    puzzleExhausted,
    rotationLocal,
    rotationFx,
  ]);

  const restart = useCallback(() => {
    if (match.mode === 'online') {
      online.requestRematch();
      return;
    }
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
    setPuzzleNoWin(false);
    setTutorialStep(0);
    setTutorialReply(null);
    setTutorialFeedback(null);
    setEndlessMoves(0);
    setEndlessScrolls(0);
    setEndlessNewBest(false);
    setEndlessNotice(null);
    setRotationTurns(0);
    setRotationNotice(null);
    setRotationFx(null);
  }, [match.mode, online.requestRematch, puzzle, tutorial]);

  const swap = useCallback(() => {
    if (
      match.mode !== 'pve' &&
      !(match.mode === 'rotation' && match.opponent === 'ai')
    ) {
      return;
    }
    setMatch((prev) => ({ ...prev, humanFirst: !prev.humanFirst }));
    dispatch({ type: 'reset' });
    recordedRef.current = false;
    prevCountRef.current = 0;
    setHint(null);
    setThinking(false);
    setResultVisible(false);
    setRotationTurns(0);
    setRotationNotice(null);
    setRotationFx(null);
  }, [match.mode, match.opponent]);

  const askHint = useCallback(async () => {
    if (match.mode === 'online') return;
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
      setPuzzleNoWin(false);
      setHintLoading(true);
      try {
        const result = findBestMove(state, remainingMoves * 2 - 1);
        if (result.col !== null && result.score > 0) {
          setHint(result.col);
          setPuzzleHints((count) => count + 1);
        } else {
          setHint(null);
          setPuzzleNoWin(true);
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
        match.mode === 'rotation' ? { rotation: true } : undefined,
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
      board={board}
      onSkinChange={setSkinId}
      onPieceColorChange={setPieceColor}
      onPieceImageChange={setPieceImage}
      onResetPieces={resetPieces}
      onBoardStyleChange={setBoardStyle}
      onBoardFaceChange={setBoardFace}
      onBoardImageChange={setBoardImage}
      onBoardVeilChange={setBoardVeil}
      onResetBoard={resetBoard}
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
          board={board}
          online={{
            phase: online.phase,
            code: online.code,
            link: online.link,
            seat: online.seat,
            error: online.error,
            errorDetail: online.errorDetail,
            notice: online.notice,
            method: online.method,
            relayUrl: online.relayUrl,
            defaultRelayUrl: online.defaultRelayUrl,
            onMethodChange: online.setMethod,
            onRelayUrlChange: online.setRelayUrl,
            onHost: online.host,
            onJoin: online.join,
            onLeave: online.leave,
            onResync: online.resync,
          }}
          onOpenSettings={openSettings}
          onStart={startMatch}
          onResetStats={resetStats}
          onResetPuzzles={resetPuzzles}
          onResetTutorials={resetTutorials}
          endlessBest={endlessBest}
          onResetEndless={resetEndlessBest}
        />
        {settingsOverlay}
      </div>
    );
  }

  const turnLabel = (() => {
    if (puzzleExhausted) return t('game.turn.movesUsed');
    if (tutorialComplete) return t('game.turn.tutorialDone');
    if (tutorial)
      return thinking
        ? t('game.turn.opponentResponding')
        : t('game.turn.yours');
    if (state.status === 'draw') return t('game.turn.draw');
    if (match.mode === 'online') {
      if (state.status === 'won') {
        return state.winner === online.seat
          ? t('result.youWin')
          : t('result.opponentWins');
      }
      if (online.phase === 'left') return t('game.turn.opponentLeft');
      if (!online.peerConnected) return t('game.turn.waitingOpponent');
      return state.turn === online.seat
        ? t('game.turn.yours')
        : t('game.turn.opponentTurn');
    }
    if (state.status === 'won') {
      if (puzzle)
        return state.winner === puzzle.human
          ? t('game.turn.solved')
          : t('game.turn.defended');
      if (match.mode === 'endless') return t('game.turn.endlessOver');
      return t('game.turn.over');
    }
    if (match.mode === 'endless') {
      if (thinking) return t('game.turn.aiAttacking');
      return state.turn === aiPlayer
        ? t('game.turn.aiTurn')
        : t('game.turn.defend');
    }
    if (match.mode === 'puzzle') {
      if (thinking) return t('game.turn.aiDefending');
      return state.turn === 1
        ? t('game.turn.yours')
        : t('game.turn.aiTurn');
    }
    if (match.mode === 'pve' || match.mode === 'rotation') {
      if (thinking) return t('game.turn.aiThinking');
      if (match.mode === 'rotation' && rotationLocal) {
        return state.turn === 1
          ? t('game.turn.first')
          : t('game.turn.second');
      }
      return state.turn === aiPlayer
        ? t('game.turn.aiTurn')
        : t('game.turn.yours');
    }
    if (game.players === 2)
      return state.turn === 1
        ? t('game.turn.first')
        : t('game.turn.second');
    return t('game.turn.player', { player: state.turn });
  })();

  const modeLabel = tutorial
    ? t('game.mode.tutorial', {
        no: String(tutorial.no).padStart(2, '0'),
        cols: game.cols,
        rows: game.rows,
      })
    : puzzle
      ? t('game.mode.puzzle', {
          no: String(puzzle.no).padStart(2, '0'),
          cols: game.cols,
          rows: game.rows,
        })
      : match.mode === 'online'
        ? t('game.mode.online', {
            code: online.code ?? '1v1',
            cols: game.cols,
            rows: game.rows,
          })
        : match.mode === 'endless'
          ? t('game.mode.endless', {
              cols: game.cols,
              rows: game.rows,
            })
          : match.mode === 'rotation'
            ? t('game.mode.rotation', {
                cols: game.cols,
                rows: game.rows,
              })
            : match.mode === 'pve'
            ? t('game.mode.pve', {
                difficulty: t(DIFFICULTY_KEYS[match.difficulty]),
                cols: game.cols,
                rows: game.rows,
              })
            : t('game.mode.pvp', {
                players: t('menu.playerCount', { count: game.players }),
                cols: game.cols,
                rows: game.rows,
              });

  const canHint =
    match.mode === 'online' || match.mode === 'endless'
      ? false
      : match.mode === 'tutorial'
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
              onClick={() => {
                if (match.mode === 'online') online.leave();
                setScreen('menu');
              }}
              aria-label={t('game.backAria')}
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
              aria-label={t('game.settingsAria')}
            >
              <SettingsIcon size={15} />
            </button>
          </div>

          <div className="status-row">
            <div className="turn-chip">
              <span className={`turn-dot p${state.turn}`} />
              <span>{turnLabel}</span>
            </div>

            {match.mode === 'online' ? (
              <div className="score-inline online-inline" title={t('game.aria.onlineRoom')}>
                <span
                  className={`online-dot${
                    online.phase === 'playing'
                      ? ' is-on'
                      : online.phase === 'left'
                        ? ''
                        : ' is-busy'
                  }`}
                />
                <span className="online-inline-code">{online.code}</span>
                <span className="score-draws">
                  {online.seat === 1
                    ? t('game.online.hostSeat')
                    : t('game.online.guestSeat')}
                </span>
                <span className="online-inline-path">
                  {online.method === 'relay'
                    ? t('game.online.relayPath')
                    : t('game.online.directPath')}
                </span>
              </div>
            ) : match.mode === 'endless' ? (
              <div
                className="score-inline puzzle-limits"
                title={t('game.aria.endlessProgress')}
              >
                <span>{tp('game.endlessMoves', endlessMoves)}</span>
                <span className="score-draws">
                  {endlessBestRecord
                    ? tp('menu.endlessBest', endlessBestRecord.moves)
                    : t('menu.endlessBestNone')}
                </span>
                {endlessScrolls > 0 && (
                  <span className="score-draws">
                    {tp('menu.endlessScrolls', endlessScrolls)}
                  </span>
                )}
              </div>
            ) : match.mode === 'rotation' ? (
              <div
                className="score-inline puzzle-limits"
                title={t('game.aria.rotationProgress')}
              >
                <span>{tp('game.rotationTurns', rotationTurns)}</span>
              </div>
            ) : tutorial ? (
              <div
                className="score-inline puzzle-limits"
                title={t('game.aria.tutorialProgress')}
              >
                <span>
                  {t('game.lesson', {
                    no: tutorial.no,
                    total: TUTORIALS.length,
                  })}
                </span>
                <span className="score-draws">
                  {tutorialComplete
                    ? t('game.complete')
                    : t('game.step', {
                        current: Math.min(
                          tutorialStep + 1,
                          tutorial.steps.length,
                        ),
                        total: tutorial.steps.length,
                      })}
                </span>
              </div>
            ) : puzzle ? (
              <div
                className="score-inline puzzle-limits"
                title={t('game.aria.moveLimit')}
              >
                <span>
                  {tp('game.limitMoves', puzzle.moveLimit)}
                </span>
                <span className="score-draws">
                  {t('game.usedMoves', {
                    used: usedMoves,
                    limit: puzzle.moveLimit,
                  })}
                </span>
              </div>
            ) : (
              <div className="score-inline" title={t('game.aria.series')}>
                {series.wins.map((wins, i) => (
                  <span className="score-item" key={i}>
                    <i className={`chip chip-p${i + 1}`} />
                    {wins}
                  </span>
                ))}
                {series.draws > 0 && (
                  <span className="score-draws">
                    {t('game.draws', { count: series.draws })}
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {match.mode === 'online' && online.phase !== 'playing' && (
          <p className={`online-banner${online.phase === 'left' ? ' is-warn' : ''}`}>
            {online.error
              ? t(ONLINE_ERROR_KEYS[online.error], {
                  detail: online.errorDetail ?? '',
                })
              : online.notice
                ? t(ONLINE_NOTICE_KEYS[online.notice])
                : t('game.online.connecting')}
          </p>
        )}

        {tutorial && (
          <TutorialCoach
            lesson={tutorial}
            stepIndex={tutorialStep}
            thinking={thinking}
            feedback={
              tutorialFeedback === null
                ? null
                : t('game.tutorialWrongColumn', {
                    col: colLabel(tutorialFeedback),
                  })
            }
            complete={tutorialComplete}
          />
        )}

        <div className="board-wrap">
          <Board
            state={state}
            disabled={
              thinking ||
              isAiTurn ||
              puzzleExhausted ||
              tutorialComplete ||
              (match.mode === 'online' &&
                (online.phase !== 'playing' || state.turn !== online.seat))
            }
            hint={game.players === 2 ? hint : null}
            onPlay={play}
            title={
              tutorial
                ? t('board.tutorialTitle', { title: text(tutorial.title) })
                : puzzle
                  ? t('board.puzzleTitle', { title: text(puzzle.title) })
                  : match.mode === 'endless'
                    ? t('board.endlessTitle')
                    : match.mode === 'rotation'
                      ? t('board.rotationTitle')
                      : undefined
            }
            meta={
              tutorial
                ? t('board.tutorialMeta', { size: tutorial.size })
                : puzzle
                  ? t('board.puzzleMeta', {
                      size: puzzle.size,
                      limit: tp('game.limitMoves', puzzle.moveLimit),
                    })
                  : match.mode === 'online'
                    ? t('board.onlineMeta', {
                        cols: game.cols,
                        rows: game.rows,
                        code: online.code ?? '',
                      })
                    : match.mode === 'endless'
                      ? t('board.endlessMeta', {
                          cols: game.cols,
                          rows: game.rows,
                        })
                      : match.mode === 'rotation'
                        ? t('board.rotationMeta', {
                            cols: game.cols,
                            rows: game.rows,
                          })
                        : undefined
            }
            footer={
              tutorial
                ? t('board.tutorialFooter')
                : puzzle
                  ? t('board.puzzleFooter')
                  : match.mode === 'online'
                    ? t(
                        online.method === 'relay'
                          ? online.seat === 1
                            ? 'board.onlineFooterHostRelay'
                            : 'board.onlineFooterGuestRelay'
                          : online.seat === 1
                            ? 'board.onlineFooterHost'
                            : 'board.onlineFooterGuest',
                      )
                    : match.mode === 'endless'
                      ? t('board.endlessFooter')
                      : match.mode === 'rotation'
                        ? t('board.rotationFooter')
                        : undefined
            }
            boardStyle={board.style}
            rotationFx={
              rotationFx === null
                ? null
                : {
                    phase: rotationFx.phase,
                    board:
                      rotationFx.phase === 'settle'
                        ? rotationFx.final.board
                        : rotationFx.dropped.board,
                    heights:
                      rotationFx.phase === 'settle'
                        ? rotationFx.final.heights
                        : rotationFx.dropped.heights,
                    last:
                      rotationFx.phase === 'drop'
                        ? rotationFx.dropped.last
                        : null,
                    falls:
                      rotationFx.phase === 'settle'
                        ? rotationFx.falls
                        : null,
                  }
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
          ) : match.mode === 'endless' ? (
            <EndlessPanel
              size={endlessSize}
              moves={endlessMoves}
              scrolls={endlessScrolls}
              best={endlessBestRecord?.moves ?? endlessMoves}
              newBest={endlessNewBest}
              visible={resultVisible}
              onAgain={restart}
              onMenu={() => setScreen('menu')}
            />
          ) : (
            <ResultPanel
              state={state}
              mode={
                match.mode === 'pvp'
                  ? 'pvp'
                  : match.mode === 'online'
                    ? 'online'
                    : match.mode === 'rotation' && rotationLocal
                      ? 'pvp'
                      : 'pve'
              }
              note={
                match.mode === 'rotation' && rotationTurns > 0
                  ? tp('result.rotations', rotationTurns)
                  : undefined
              }
              seat={online.seat}
              rematchPending={online.rematchMine}
              humanFirst={match.humanFirst}
              visible={resultVisible}
              onAgain={restart}
              onSwap={swap}
              onMenu={() => {
                if (match.mode === 'online') online.leave();
                setScreen('menu');
              }}
            />
          )}
        </div>

        {puzzleNoWin && (
          <p className="puzzle-notice">{t('game.puzzleNoWin')}</p>
        )}

        {endlessNotice && (
          <p className="puzzle-notice" key={endlessNotice.id}>
            {t(endlessNotice.key)}
          </p>
        )}

        {rotationNotice && (
          <p className="puzzle-notice rotation-notice" key={rotationNotice.id}>
            {t(rotationNotice.key)}
          </p>
        )}

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
            match.mode !== 'online' &&
            match.mode !== 'endless' &&
            session.past.length > 0 &&
            !thinking
          }
          canHint={canHint}
          hintLoading={hintLoading}
          showHint={
            game.players === 2 &&
            match.mode !== 'online' &&
            match.mode !== 'endless'
          }
        />
      </main>
      {settingsOverlay}
    </div>
  );
}
