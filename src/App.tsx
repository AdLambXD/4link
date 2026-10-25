import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { DIFFICULTY_LABELS } from './ai/engine';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { ArrowLeftIcon } from './components/Icons';
import { Menu, type MatchConfig } from './components/Menu';
import { ResultPanel } from './components/ResultPanel';
import {
  createSession,
  makeConfig,
  sessionReducer,
  type DuoPlayer,
} from './game/rules';
import { useAiEngine } from './hooks/useAiEngine';
import { useSkin } from './hooks/useSkin';
import { useStats } from './hooks/useStats';
import { playDrop, playWin } from './lib/sound';

type Screen = 'menu' | 'game';

const DEFAULT_CONFIG: MatchConfig = {
  mode: 'pve',
  difficulty: 'normal',
  humanFirst: true,
  players: 2,
  size: 6,
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

  const requestMove = useAiEngine();
  const { skinId, setSkinId } = useSkin();
  const { stats, record, reset: resetStats } = useStats();

  const state = session.current;
  const game = state.config;
  const aiPlayer: DuoPlayer | null =
    match.mode === 'pve' ? ((match.humanFirst ? 2 : 1) as DuoPlayer) : null;
  const isAiTurn = aiPlayer !== null && state.turn === aiPlayer;
  const recordedRef = useRef(false);
  const prevCountRef = useRef(0);

  /* ---------- 结算 ---------- */
  useEffect(() => {
    if (screen !== 'game') return;
    if (state.status === 'playing') return;
    if (recordedRef.current) return;
    recordedRef.current = true;

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
  }, [screen, state.status, state.winner, state.config.players, record, soundOn]);

  /* ---------- 结算面板延迟出现，先让玩家看清连成的那条线 ---------- */
  useEffect(() => {
    if (state.status === 'playing') {
      setResultVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setResultVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, [state.status, state.count]);

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

  /* ---------- AI 行动 ---------- */
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

  /* ---------- 提示在落子后自动消失 ---------- */
  useEffect(() => {
    setHint(null);
  }, [state.count]);

  /* ---------- 操作 ---------- */
  const startMatch = useCallback((next: MatchConfig) => {
    const nextGame = makeConfig(next.size, next.mode === 'pve' ? 2 : next.players);
    setMatch(next);
    dispatch({ type: 'reset', config: nextGame });
    setSeries(emptySeries(nextGame.players));
    recordedRef.current = false;
    prevCountRef.current = 0;
    setHint(null);
    setThinking(false);
    setResultVisible(false);
    setScreen('game');
  }, []);

  const play = useCallback(
    (col: number) => {
      if (thinking) return;
      if (state.status !== 'playing') return;
      if (aiPlayer !== null && state.turn === aiPlayer) return;
      dispatch({ type: 'play', col });
    },
    [thinking, state.status, state.turn, aiPlayer],
  );

  const undo = useCallback(() => {
    if (thinking) return;
    if (state.status !== 'playing') return;
    const steps = match.mode === 'pve' ? 2 : 1;
    dispatch({ type: 'undo', steps });
  }, [thinking, state.status, match.mode]);

  const restart = useCallback(() => {
    dispatch({ type: 'reset' });
    recordedRef.current = false;
    prevCountRef.current = 0;
    setHint(null);
    setThinking(false);
    setResultVisible(false);
  }, []);

  const swap = useCallback(() => {
    setMatch((prev) => ({ ...prev, humanFirst: !prev.humanFirst }));
    dispatch({ type: 'reset' });
    recordedRef.current = false;
    prevCountRef.current = 0;
    setHint(null);
    setThinking(false);
    setResultVisible(false);
  }, []);

  const askHint = useCallback(async () => {
    if (state.status !== 'playing' || thinking || hintLoading) return;
    if (state.config.players !== 2) return;
    if (aiPlayer !== null && state.turn === aiPlayer) return;
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
  }, [state, thinking, hintLoading, aiPlayer, requestMove, game]);

  /* ---------- 键盘 ---------- */
  useEffect(() => {
    if (screen !== 'game') return;
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
  }, [screen, play, undo, restart, game.cols]);

  /* ---------- 渲染 ---------- */
  if (screen === 'menu') {
    return (
      <div className="app">
        <Menu
          initial={match}
          stats={stats}
          skinId={skinId}
          onSkinChange={setSkinId}
          onStart={startMatch}
          onResetStats={resetStats}
        />
      </div>
    );
  }

  const turnLabel = (() => {
    if (state.status === 'draw') return '和棋';
    if (state.status === 'won') return '对局结束';
    if (match.mode === 'pve') {
      if (thinking) return 'AI 思考中…';
      return state.turn === aiPlayer ? 'AI 回合' : '你的回合';
    }
    if (game.players === 2) return state.turn === 1 ? '先手回合' : '后手回合';
    return `玩家 ${state.turn} 回合`;
  })();

  const modeLabel =
    match.mode === 'pve'
      ? `人机 · ${DIFFICULTY_LABELS[match.difficulty]} · ${game.cols}×${game.rows}`
      : `本地 · ${game.players} 人 · ${game.cols}×${game.rows}`;

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
          </div>

          <div className="status-row">
            <div className="turn-chip">
              <span className={`turn-dot p${state.turn}`} />
              <span>{turnLabel}</span>
            </div>

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
          </div>
        </header>

        <div className="board-wrap">
          <Board
            state={state}
            disabled={thinking || isAiTurn}
            hint={game.players === 2 ? hint : null}
            onPlay={play}
          />
          <ResultPanel
            state={state}
            mode={match.mode}
            humanFirst={match.humanFirst}
            visible={resultVisible}
            onAgain={restart}
            onSwap={swap}
            onMenu={() => setScreen('menu')}
          />
        </div>

        <Controls
          onUndo={undo}
          onRestart={restart}
          onHint={askHint}
          onToggleSound={() => setSoundOn((v) => !v)}
          soundOn={soundOn}
          canUndo={state.status === 'playing' && session.past.length > 0 && !thinking}
          canHint={
            game.players === 2 &&
            state.status === 'playing' &&
            !thinking &&
            !hintLoading &&
            !isAiTurn
          }
          hintLoading={hintLoading}
          showHint={game.players === 2}
        />
      </main>
    </div>
  );
}
