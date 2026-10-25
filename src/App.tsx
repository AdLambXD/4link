import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { DIFFICULTY_LABELS } from './ai/engine';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { ArrowLeftIcon } from './components/Icons';
import { Menu, type MatchConfig } from './components/Menu';
import { ResultPanel } from './components/ResultPanel';
import { createSession, sessionReducer, type Player } from './game/rules';
import { useAiEngine } from './hooks/useAiEngine';
import { useStats } from './hooks/useStats';
import { playDrop, playWin } from './lib/sound';

type Screen = 'menu' | 'game';

const DEFAULT_CONFIG: MatchConfig = {
  mode: 'pve',
  difficulty: 'normal',
  humanFirst: true,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [config, setConfig] = useState<MatchConfig>(DEFAULT_CONFIG);
  const [session, dispatch] = useReducer(sessionReducer, undefined, () => createSession());
  const [thinking, setThinking] = useState(false);
  const [hint, setHint] = useState<number | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [resultVisible, setResultVisible] = useState(false);

  const requestMove = useAiEngine();
  const { stats, record, reset: resetStats } = useStats();

  const state = session.current;
  const aiPlayer: Player | null =
    config.mode === 'pve' ? (config.humanFirst ? 2 : 1) : null;
  const isAiTurn = aiPlayer !== null && state.turn === aiPlayer;
  const recordedRef = useRef(false);
  const prevCountRef = useRef(0);

  /* ---------- 结算 ---------- */
  useEffect(() => {
    if (screen !== 'game') return;
    if (state.status === 'playing') return;
    if (recordedRef.current) return;
    recordedRef.current = true;
    record(state.winner);
    if (state.status === 'won') playWin(soundOn);
  }, [screen, state.status, state.winner, record, soundOn]);

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
      if (player === 1 || player === 2) playDrop(player, soundOn);
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
      requestMove(state.board, state.heights, aiPlayer, config.difficulty)
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
  }, [screen, aiPlayer, state, config.difficulty, requestMove]);

  /* ---------- 提示在落子后自动消失 ---------- */
  useEffect(() => {
    setHint(null);
  }, [state.count]);

  /* ---------- 操作 ---------- */
  const startMatch = useCallback((next: MatchConfig) => {
    setConfig(next);
    dispatch({ type: 'reset' });
    recordedRef.current = false;
    prevCountRef.current = 0;
    setHint(null);
    setThinking(false);
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
    const steps = config.mode === 'pve' ? 2 : 1;
    dispatch({ type: 'undo', steps });
  }, [thinking, state.status, config.mode]);

  const restart = useCallback(() => {
    dispatch({ type: 'reset' });
    recordedRef.current = false;
    prevCountRef.current = 0;
    setHint(null);
    setThinking(false);
  }, []);

  const swap = useCallback(() => {
    setConfig((prev) => ({ ...prev, humanFirst: !prev.humanFirst }));
    dispatch({ type: 'reset' });
    recordedRef.current = false;
    prevCountRef.current = 0;
    setHint(null);
    setThinking(false);
  }, []);

  const askHint = useCallback(async () => {
    if (state.status !== 'playing' || thinking || hintLoading) return;
    if (aiPlayer !== null && state.turn === aiPlayer) return;
    setHintLoading(true);
    try {
      const result = await requestMove(state.board, state.heights, state.turn, 'hard');
      if (result.col >= 0) setHint(result.col);
    } catch {
      /* 忽略 */
    } finally {
      setHintLoading(false);
    }
  }, [state, thinking, hintLoading, aiPlayer, requestMove]);

  /* ---------- 键盘 ---------- */
  useEffect(() => {
    if (screen !== 'game') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key >= '1' && event.key <= '6') {
        event.preventDefault();
        play(Number(event.key) - 1);
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
  }, [screen, play, undo, restart]);

  /* ---------- 渲染 ---------- */
  if (screen === 'menu') {
    return (
      <div className="app">
        <Menu stats={stats} onStart={startMatch} onResetStats={resetStats} />
      </div>
    );
  }

  const turnLabel = (() => {
    if (state.status === 'draw') return '和棋';
    if (state.status === 'won') return '对局结束';
    if (config.mode === 'pvp') return state.turn === 1 ? '先手回合' : '后手回合';
    if (thinking) return 'AI 思考中…';
    return state.turn === aiPlayer ? 'AI 回合' : '你的回合';
  })();

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
            <span className="head-mode">
              {config.mode === 'pve'
                ? `人机 · ${DIFFICULTY_LABELS[config.difficulty]}`
                : '本地双人'}
            </span>
          </div>

          <div className="status-row">
            <div className="turn-chip">
              <span className={`turn-dot p${state.turn}`} />
              <span>{turnLabel}</span>
            </div>

            <div className="score-inline" title="本机累计战绩">
              <span className="score-item">
                <i className="chip chip-p1" />
                {stats.p1}
              </span>
              <span className="score-sep">–</span>
              <span className="score-item">
                <i className="chip chip-p2" />
                {stats.p2}
              </span>
              <span className="score-draws">和 {stats.draws}</span>
            </div>
          </div>
        </header>

        <div className="board-wrap">
          <Board
            state={state}
            disabled={thinking || isAiTurn}
            hint={hint}
            onPlay={play}
          />
          <ResultPanel
            state={state}
            mode={config.mode}
            humanFirst={config.humanFirst}
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
          canHint={state.status === 'playing' && !thinking && !hintLoading && !isAiTurn}
          hintLoading={hintLoading}
        />
      </main>
    </div>
  );
}
