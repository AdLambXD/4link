/**
 * 联机房间状态机。
 *
 * 房主（seat 1）持权威局面，访客（seat 2）只发落子请求。
 * 状态全部放在 ref 里，React 状态只负责渲染，避免回调里读到旧闭包。
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
import type { NetStrategy, Transport } from '../net/transport';

export type OnlinePhase = 'idle' | 'connecting' | 'waiting' | 'playing' | 'left' | 'error';

export type OnlineRole = 'host' | 'guest';

export interface OnlineSnapshot {
  phase: OnlinePhase;
  code: string | null;
  seat: Seat | null;
  link: string | null;
  error: string | null;
  notice: string | null;
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
  notice: null,
  peerConnected: false,
  rematchMine: false,
  rematchPeer: false,
};

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
  const roleRef = useRef<OnlineRole | null>(null);
  const rematchMineRef = useRef(false);
  const rematchPeerRef = useRef(false);
  const generationRef = useRef(0);
  const autoJoinRef = useRef(false);
  const unmountTimerRef = useRef<number | null>(null);

  const patch = useCallback((next: Partial<OnlineSnapshot>) => {
    setSnapshot((prev) => ({ ...prev, ...next }));
  }, []);

  const send = useCallback((message: NetMessage, peerId?: string) => {
    transportRef.current?.send(message, peerId);
  }, []);

  const publish = useCallback((state: GameState) => {
    gameRef.current = state;
    onStateRef.current(state);
  }, []);

  const clearRoom = useCallback((next: Partial<OnlineSnapshot>) => {
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
  }, []);

  const beginRematch = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    const fresh = createGame(1, game.config);
    rematchMineRef.current = false;
    rematchPeerRef.current = false;
    publish(fresh);
    send({ t: 'state', state: fresh, hash: hashState(fresh) });
    patch({ rematchMine: false, rematchPeer: false, notice: null });
  }, [patch, publish, send]);

  const handleMessage = useCallback(
    (message: NetMessage, peerId: string) => {
      const role = roleRef.current;
      if (!role) return;

      if (message.t === 'bye') {
        if (probeRef.current?.peerId === peerId) {
          window.clearTimeout(probeRef.current.timer);
          probeRef.current = null;
        }

        if (message.reason === 'full') {
          clearRoom({
            phase: 'error',
            error: '房间已满：这局 1v1 已经开始了。',
          });
          return;
        }

        // 对手主动离开：保留房间和棋局，等对方用同一房间码回来。
        if (peerRef.current === peerId) {
          peerRef.current = null;
          rematchMineRef.current = false;
          rematchPeerRef.current = false;
          patch({
            phase: 'left',
            peerConnected: false,
            notice: '对手离开了房间，等待重新加入…',
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

      if (peerRef.current !== peerId) return;

      switch (message.t) {
        case 'sync': {
          if (role !== 'host') return;
          const game = gameRef.current;
          if (game) send({ t: 'state', state: game, hash: hashState(game) }, peerId);
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
            send({ t: 'state', state: game, hash: hashState(game) }, peerId);
            return;
          }

          const next = drop(game, message.col);
          if (next === game) return;
          publish(next);
          send({ t: 'state', state: next, hash: hashState(next) }, peerId);
          return;
        }

        case 'state': {
          if (role !== 'guest') return;
          const state = sanitizeState(message.state);
          if (!state || hashState(state) !== message.hash) {
            send({ t: 'sync' }, peerId);
            return;
          }

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
          patch({ notice: '房间已满，已请其他玩家离开。' });
          return;
        }
      }
    },
    [beginRematch, clearRoom, patch, publish, send],
  );

  const acceptPeer = useCallback(
    (peerId: string) => {
      peerRef.current = peerId;
      const role = roleRef.current;
      patch({ peerConnected: true, phase: 'playing', notice: null });

      if (role === 'host') {
        const game = gameRef.current;
        if (game) {
          // 让房主自己的界面也进入对局，并把局面发给刚加入的访客。
          publish(game);
          send({ t: 'state', state: game, hash: hashState(game) }, peerId);
        }
      } else {
        send({ t: 'sync' }, peerId);
        patch({ notice: '已连接房主，正在同步棋局…' });
      }
    },
    [patch, publish, send],
  );

  const handlePeerJoin = useCallback(
    (peerId: string) => {
      if (!peerRef.current) {
        acceptPeer(peerId);
        return;
      }

      // 房间里已经有一名对手：先确认它是否还在线，
      // 这样对手掉线（没有触发 onPeerLeave）时也能用同一房间码重连。
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
      patch({ notice: '有新的连接加入，正在确认原对手是否在线…' });
    },
    [acceptPeer, patch, send],
  );

  const handlePeerLeave = useCallback(
    (peerId: string) => {
      if (probeRef.current?.peerId === peerId) {
        window.clearTimeout(probeRef.current.timer);
        probeRef.current = null;
      }
      if (peerRef.current !== peerId) return;
      peerRef.current = null;
      rematchMineRef.current = false;
      rematchPeerRef.current = false;
      patch({
        phase: 'left',
        peerConnected: false,
        notice: '对手已离开，房间仍然开着：让对手用同一个房间码重新加入即可续局。',
        rematchMine: false,
        rematchPeer: false,
      });
    },
    [patch],
  );

  const start = useCallback(
    async (code: string, role: OnlineRole) => {
      if (roleRef.current || transportRef.current) return;

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
            onError: (message) => {
              if (generation !== generationRef.current) return;
              setSnapshot((prev) => ({ ...prev, phase: 'error', error: message }));
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
          code,
          seat: role === 'host' ? 1 : 2,
          error: '无法加入房间，请检查网络后重试。',
        });
      }
    },
    [handleMessage, handlePeerJoin, handlePeerLeave, strategy],
  );

  const host = useCallback(() => {
    void start(makeRoomCode(), 'host');
  }, [start]);

  const join = useCallback(
    (raw: string) => {
      const code = normalizeRoomCode(raw);
      if (!code) {
        patch({ phase: 'error', error: '房间码是 5 位字母或数字，例如 4K7QP。' });
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
        send({ t: 'state', state: next, hash: hashState(next) });
        return true;
      }

      if (!canDrop(game, col)) return false;
      send({ t: 'play', col, count: game.count });
      return true;
    },
    [publish, send],
  );

  const requestRematch = useCallback(() => {
    if (!transportRef.current) return;
    rematchMineRef.current = true;
    patch({ rematchMine: true });
    send({ t: 'rematch' });
    if (roleRef.current === 'host' && rematchPeerRef.current) beginRematch();
  }, [beginRematch, patch, send]);

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
  };
}
