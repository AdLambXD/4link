/**
 * 联机房间状态机。
 *
 * 房主（seat 1）持权威局面，访客（seat 2）只发落子请求。
 * 状态全部放在 ref 里，React 状态只负责渲染，避免回调里读到旧闭包。
 *
 * 提示与错误只保存「码」（见 net/labels.ts），具体文案交给 i18n，
 * 这样切换语言、甚至连接过程中切语言都能立刻生效。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  canDrop,
  createGame,
  drop,
  makeConfig,
  type BoardSize,
  type GameState,
} from '../game/rules';
import {
  hashState,
  makeRoomCode,
  normalizeRoomCode,
  roomCodeFromUrl,
  roomLink,
  sanitizeState,
  type NetMessage,
  type Seat,
} from '../net/protocol';
import { connect } from '../net/connect';
import type { OnlineError, OnlineNotice } from '../net/labels';
import type { NetStrategy, Transport } from '../net/transport';

export type OnlinePhase =
  | 'idle'
  | 'connecting'
  | 'waiting'
  /** 已连上对手，但还没收到第一份权威局面。 */
  | 'syncing'
  | 'playing'
  | 'left'
  | 'error';

export type OnlineRole = 'host' | 'guest';

export interface OnlineSnapshot {
  phase: OnlinePhase;
  code: string | null;
  seat: Seat | null;
  link: string | null;
  error: OnlineError | null;
  /** 仅 error === 'signal' 时带上底层原因。 */
  errorDetail: string | null;
  notice: OnlineNotice | null;
  peerConnected: boolean;
  /** 我已经点了「再来一局」。 */
  rematchMine: boolean;
  /** 对手已经点了「再来一局」。 */
  rematchPeer: boolean;
}

export interface UseOnlineGameOptions {
  /** 房主创建房间时使用的棋盘尺寸。 */
  size: BoardSize;
  strategy?: NetStrategy;
  /** 收到权威局面（首次同步、每一步、重开）。 */
  onState: (state: GameState) => void;
}

const IDLE: OnlineSnapshot = {
  phase: 'idle',
  code: null,
  seat: null,
  link: null,
  error: null,
  errorDetail: null,
  notice: null,
  peerConnected: false,
  rematchMine: false,
  rematchPeer: false,
};

/** 访客等待权威局面时重发 sync 的间隔与次数上限。 */
const SYNC_INTERVAL_MS = 1500;
const SYNC_MAX_TRIES = 8;

/** 开发环境允许用 ?net=local 走 BroadcastChannel，方便同一台机器开两个标签页调试。 */
function resolveStrategy(fallback: NetStrategy): NetStrategy {
  if (!import.meta.env.DEV) return fallback;
  try {
    const value = new URLSearchParams(window.location.search).get('net');
    if (value === 'local') return 'local';
  } catch {
    /* 忽略 */
  }
  return fallback;
}

export function useOnlineGame({
  size,
  strategy = 'nostr',
  onState,
}: UseOnlineGameOptions) {
  const [snapshot, setSnapshot] = useState<OnlineSnapshot>(IDLE);

  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const sizeRef = useRef(size);
  sizeRef.current = size;

  const onStateRef = useRef(onState);
  onStateRef.current = onState;

  const transportRef = useRef<Transport | null>(null);
  const gameRef = useRef<GameState | null>(null);
  const peerRef = useRef<string | null>(null);
  const probeRef = useRef<{ peerId: string; nonce: number; timer: number } | null>(null);
  const syncRef = useRef<{ peerId: string; tries: number; timer: number } | null>(null);
  const roleRef = useRef<OnlineRole | null>(null);
  const rematchMineRef = useRef(false);
  const rematchPeerRef = useRef(false);
  const generationRef = useRef(0);
  const autoJoinRef = useRef(false);
  const unmountTimerRef = useRef<number | null>(null);

  const patch = useCallback((next: Partial<OnlineSnapshot>) => {
    setSnapshot((prev) => ({ ...prev, ...next }));
  }, []);

  const debug = useCallback((...args: unknown[]) => {
    if (import.meta.env.DEV) console.debug('[4link/net]', ...args);
  }, []);

  /** 停止访客的周期性 sync 重试。 */
  const stopSync = useCallback(() => {
    if (syncRef.current) {
      window.clearTimeout(syncRef.current.timer);
      syncRef.current = null;
    }
  }, []);

  const send = useCallback(
    (message: NetMessage, peerId?: string) => {
      const transport = transportRef.current;
      if (!transport) {
        debug('传输未就绪，消息被丢弃：', message.t);
        return;
      }
      try {
        const result = transport.send(message, peerId);
        if (result && typeof result.then === 'function') {
          void result.catch((error: unknown) => {
            console.warn('[4link/net] 发送失败：', message.t, error);
          });
        }
      } catch (error) {
        console.warn('[4link/net] 发送失败：', message.t, error);
      }
    },
    [debug],
  );

  const publish = useCallback((state: GameState) => {
    gameRef.current = state;
    onStateRef.current(state);
  }, []);

  const sendState = useCallback(
    (state: GameState, peerId?: string) => {
      send({ t: 'state', state, hash: hashState(state) }, peerId);
    },
    [send],
  );

  /**
   * 访客反复请求局面，直到收到合法 state。
   *
   * WebRTC 数据通道刚建立时首条消息可能丢失，只发一次 sync 会永久卡住；
   * 这里按固定间隔重试，收到 state 或离开房间时由调用方 stopSync()。
   */
  const startSyncLoop = useCallback(
    (peerId: string) => {
      stopSync();
      let tries = 0;
      const tick = () => {
        send({ t: 'sync' }, peerId);
        tries += 1;
        if (tries >= SYNC_MAX_TRIES) {
          syncRef.current = null;
          patch({ notice: 'syncTimeout' });
          return;
        }
        const timer = window.setTimeout(tick, SYNC_INTERVAL_MS);
        syncRef.current = { peerId, tries, timer };
      };
      tick();
    },
    [patch, send, stopSync],
  );

  const clearRoom = useCallback(
    (next: Partial<OnlineSnapshot>) => {
      stopSync();
      if (probeRef.current) {
        window.clearTimeout(probeRef.current.timer);
        probeRef.current = null;
      }
      transportRef.current?.leave();
      transportRef.current = null;
      gameRef.current = null;
      peerRef.current = null;
      roleRef.current = null;
      rematchMineRef.current = false;
      rematchPeerRef.current = false;
      generationRef.current += 1;
      setSnapshot({ ...IDLE, ...next });
    },
    [stopSync],
  );

  const beginRematch = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    const fresh = createGame(1, game.config);
    rematchMineRef.current = false;
    rematchPeerRef.current = false;
    publish(fresh);
    sendState(fresh);
    patch({ rematchMine: false, rematchPeer: false, notice: null });
  }, [patch, publish, sendState]);

  const acceptPeer = useCallback(
    (peerId: string) => {
      peerRef.current = peerId;
      const role = roleRef.current;

      if (role === 'host') {
        patch({ peerConnected: true, phase: 'playing', notice: null });
        const game = gameRef.current;
        if (game) {
          // 让房主自己的界面也进入对局，并把局面发给刚加入的访客。
          publish(game);
          sendState(game, peerId);
        }
        return;
      }

      // 访客在收到第一份合法局面之前不能算「对局中」，
      // 否则会停在「对局进行中」但棋盘打不开的状态。
      patch({
        peerConnected: true,
        phase: 'syncing',
        notice: 'syncing',
      });
      startSyncLoop(peerId);
    },
    [patch, publish, sendState, startSyncLoop],
  );

  const handleMessage = useCallback(
    (message: NetMessage, peerId: string) => {
      const role = roleRef.current;
      if (!role) return;
      debug('←', message.t, peerId);

      if (message.t === 'bye') {
        if (probeRef.current?.peerId === peerId) {
          window.clearTimeout(probeRef.current.timer);
          probeRef.current = null;
        }

        if (message.reason === 'full') {
          clearRoom({ phase: 'error', error: 'roomFull' });
          return;
        }

        // 对手主动离开：保留房间和棋局，等对方用同一房间码回来。
        if (peerRef.current === peerId) {
          stopSync();
          peerRef.current = null;
          rematchMineRef.current = false;
          rematchPeerRef.current = false;
          patch({
            phase: 'left',
            peerConnected: false,
            notice: 'peerLeft',
            rematchMine: false,
            rematchPeer: false,
          });
        }
        return;
      }

      if (message.t === 'ping') {
        send({ t: 'pong', nonce: message.nonce }, peerId);
        return;
      }

      if (peerRef.current !== peerId) {
        // 访客在同步阶段只认「能给出合法局面」的对端（那就是房主）；
        // 房主在没有对手时把发来对局消息的对端认作对手（漏掉 onPeerJoin 也能自愈）。
        const canAdopt =
          peerRef.current === null ||
          (role === 'guest' &&
            message.t === 'state' &&
            snapshotRef.current.phase !== 'playing');

        if (!canAdopt) {
          debug('忽略其他对端的消息：', message.t, peerId);
          return;
        }

        if (role === 'host' && (message.t === 'sync' || message.t === 'play')) {
          acceptPeer(peerId);
          if (message.t === 'sync') return;
        } else if (role === 'guest' && message.t === 'state') {
          peerRef.current = peerId;
          stopSync();
        } else {
          debug('忽略未知对端的消息：', message.t, peerId);
          return;
        }
      }

      switch (message.t) {
        case 'sync': {
          if (role !== 'host') return;
          const game = gameRef.current;
          if (game) sendState(game, peerId);
          return;
        }

        case 'play': {
          if (role !== 'host') return;
          const game = gameRef.current;
          if (!game) return;

          const stale = message.count !== game.count;
          if (
            stale ||
            game.status !== 'playing' ||
            game.turn !== 2 ||
            !canDrop(game, message.col)
          ) {
            // 拒绝并把权威局面推回去，访客会自己纠正。
            sendState(game, peerId);
            return;
          }

          const next = drop(game, message.col);
          if (next === game) return;
          publish(next);
          sendState(next);
          return;
        }

        case 'state': {
          if (role !== 'guest') return;
          const state = sanitizeState(message.state);
          if (!state || hashState(state) !== message.hash) {
            debug('局面校验失败，重新请求同步');
            startSyncLoop(peerId);
            return;
          }

          stopSync();
          publish(state);
          if (state.count === 0) {
            rematchMineRef.current = false;
            rematchPeerRef.current = false;
            patch({
              phase: 'playing',
              peerConnected: true,
              notice: null,
              rematchMine: false,
              rematchPeer: false,
            });
          } else {
            patch({ phase: 'playing', peerConnected: true, notice: null });
          }
          return;
        }

        case 'rematch': {
          rematchPeerRef.current = true;
          patch({ rematchPeer: true });
          if (role === 'host' && rematchMineRef.current) beginRematch();
          return;
        }

        case 'pong': {
          const probe = probeRef.current;
          if (!probe) return;
          window.clearTimeout(probe.timer);
          probeRef.current = null;
          send({ t: 'bye', reason: 'full' }, probe.peerId);
          patch({ notice: 'kickedFull' });
          return;
        }
      }
    },
    [
      acceptPeer,
      beginRematch,
      clearRoom,
      debug,
      patch,
      publish,
      send,
      sendState,
      startSyncLoop,
      stopSync,
    ],
  );

  const handlePeerJoin = useCallback(
    (peerId: string) => {
      debug('peer join', peerId);
      const role = roleRef.current;
      if (!role) return;

      if (peerRef.current === peerId) {
        // 同一个对端的重复 join 事件：只补发，绝不能走「替换旧对手」逻辑，
        // 否则会给自己真正的对手发 bye，把好好的房间拆掉。
        const game = gameRef.current;
        if (role === 'host' && game) sendState(game, peerId);
        else if (role === 'guest' && snapshotRef.current.phase !== 'playing') {
          startSyncLoop(peerId);
        }
        return;
      }

      if (role === 'guest') {
        // 访客不仲裁房间归属：房间里可能有多个对端（例如第三个人也进来了），
        // 先向新对端要一次局面，谁能给出合法 state，谁就是房主。
        if (!peerRef.current) {
          acceptPeer(peerId);
        } else {
          send({ t: 'sync' }, peerId);
        }
        return;
      }

      if (!peerRef.current) {
        acceptPeer(peerId);
        return;
      }

      // 房主：房间里已经有一名对手，先确认它是否还在线，
      // 这样对手掉线（没有触发 onPeerLeave）时也能用同一房间码重连。
      // 仲裁只由房主做，新加入者不会被误认成对手。
      stopSync();
      if (probeRef.current) window.clearTimeout(probeRef.current.timer);
      const nonce = Math.floor(Math.random() * 1e9);
      const timer = window.setTimeout(() => {
        probeRef.current = null;
        const stale = peerRef.current;
        peerRef.current = null;
        if (stale) send({ t: 'bye', reason: 'leave' }, stale);
        acceptPeer(peerId);
      }, 1500);

      probeRef.current = { peerId, nonce, timer };
      send({ t: 'ping', nonce }, peerRef.current);
      patch({ notice: 'probe' });
    },
    [acceptPeer, debug, patch, send, sendState, startSyncLoop, stopSync],
  );

  const handlePeerLeave = useCallback(
    (peerId: string) => {
      debug('peer leave', peerId);
      if (probeRef.current?.peerId === peerId) {
        window.clearTimeout(probeRef.current.timer);
        probeRef.current = null;
      }
      if (peerRef.current !== peerId) return;
      stopSync();
      peerRef.current = null;
      rematchMineRef.current = false;
      rematchPeerRef.current = false;
      patch({
        phase: 'left',
        peerConnected: false,
        notice: 'peerLeftWaiting',
        rematchMine: false,
        rematchPeer: false,
      });
    },
    [debug, patch, stopSync],
  );

  const start = useCallback(
    async (code: string, role: OnlineRole) => {
      if (roleRef.current || transportRef.current) return;

      stopSync();
      const generation = ++generationRef.current;
      roleRef.current = role;
      peerRef.current = null;
      rematchMineRef.current = false;
      rematchPeerRef.current = false;
      gameRef.current =
        role === 'host' ? createGame(1, makeConfig(sizeRef.current, 2)) : null;

      setSnapshot({
        ...IDLE,
        phase: 'connecting',
        code,
        seat: role === 'host' ? 1 : 2,
        link: roomLink(window.location.href, code),
      });

      try {
        const transport = await connect(
          { code, strategy: resolveStrategy(strategy) },
          {
            onPeerJoin: handlePeerJoin,
            onPeerLeave: handlePeerLeave,
            onMessage: handleMessage,
            onError: (detail) => {
              if (generation !== generationRef.current) return;
              setSnapshot((prev) => ({
                ...prev,
                phase: 'error',
                error: 'signal',
                errorDetail: detail,
              }));
            },
          },
        );

        if (generation !== generationRef.current) {
          transport.leave();
          return;
        }

        transportRef.current = transport;
        for (const peerId of transport.peers()) handlePeerJoin(peerId);

        setSnapshot((prev) =>
          prev.phase === 'connecting' ? { ...prev, phase: 'waiting' } : prev,
        );
      } catch {
        if (generation !== generationRef.current) return;
        roleRef.current = null;
        gameRef.current = null;
        setSnapshot({
          ...IDLE,
          phase: 'error',
          error: 'connect',
          code,
          seat: role === 'host' ? 1 : 2,
        });
      }
    },
    [handleMessage, handlePeerJoin, handlePeerLeave, stopSync, strategy],
  );

  const host = useCallback(() => {
    void start(makeRoomCode(), 'host');
  }, [start]);

  const join = useCallback(
    (raw: string) => {
      const code = normalizeRoomCode(raw);
      if (!code) {
        patch({ phase: 'error', error: 'invalidCode' });
        return;
      }
      void start(code, 'guest');
    },
    [patch, start],
  );

  const leave = useCallback(() => {
    send({ t: 'bye', reason: 'leave' });
    clearRoom({});
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('room')) {
        url.searchParams.delete('room');
        window.history.replaceState(null, '', url.toString());
      }
    } catch {
      /* 忽略 */
    }
  }, [clearRoom, send]);

  const play = useCallback(
    (col: number) => {
      const game = gameRef.current;
      const role = roleRef.current;
      if (!game || !role) return false;
      if (!peerRef.current || snapshotRef.current.phase !== 'playing') return false;
      if (game.status !== 'playing') return false;

      const seat: Seat = role === 'host' ? 1 : 2;
      if (game.turn !== seat) return false;

      if (role === 'host') {
        const next = drop(game, col);
        if (next === game) return false;
        publish(next);
        sendState(next);
        return true;
      }

      if (!canDrop(game, col)) return false;
      send({ t: 'play', col, count: game.count });
      return true;
    },
    [publish, send, sendState],
  );

  const requestRematch = useCallback(() => {
    if (!transportRef.current) return;
    rematchMineRef.current = true;
    patch({ rematchMine: true });
    send({ t: 'rematch' });
    if (roleRef.current === 'host' && rematchPeerRef.current) beginRematch();
  }, [beginRematch, patch, send]);

  /** 手动重新同步：访客重发 sync，房主重发当前局面。 */
  const resync = useCallback(() => {
    const peerId = peerRef.current;
    if (!peerId) return;

    if (roleRef.current === 'host') {
      const game = gameRef.current;
      if (game) sendState(game, peerId);
      return;
    }

    patch({ notice: 'resyncing' });
    startSyncLoop(peerId);
  }, [patch, sendState, startSyncLoop]);

  /* 分享链接带 ?room=CODE：首次打开时自动加入（StrictMode 下用延迟清理兜底）。 */
  useEffect(() => {
    if (unmountTimerRef.current !== null) {
      window.clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }

    if (!autoJoinRef.current) {
      autoJoinRef.current = true;
      const code = roomCodeFromUrl(window.location.href);
      if (code) void start(code, 'guest');
    }

    return () => {
      unmountTimerRef.current = window.setTimeout(() => {
        unmountTimerRef.current = null;
        leave();
      }, 400);
    };
  }, [leave, start]);

  return {
    ...snapshot,
    host,
    join,
    leave,
    play,
    requestRematch,
    resync,
  };
}
