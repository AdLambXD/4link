/**
 * WebSocket 中继传输。
 *
 * WebRTC 直连在对称 NAT / CGNAT / 公司网络下必然失败（STUN 只能发现地址，
 * 不能中继数据）。中继把棋步交给一台小服务器转发，443 出站即可，几乎任何
 * 网络都能连上；协议、房主权威、同步与重连逻辑全部复用，只是换了搬运工。
 *
 * 线上信封（与 server/relay 下的两个实现保持一致）：
 *   客户端 → 服务器  { t: 'msg', to?: string, payload: NetMessage }
 *   服务器 → 客户端  { t: 'welcome', id, peers: string[] }
 *                    { t: 'peer', ev: 'join' | 'leave', id }
 *                    { t: 'msg', from, payload }
 *                    { t: 'full' } / { t: 'error', message }
 */

import { decodeMessage, type NetMessage } from './protocol';
import type { ConnectOptions, Transport, TransportHandlers } from './transport';

/** 服务器给每条连接分配的 id（8 位十六进制）。 */
const PEER_ID_PATTERN = /^[a-z0-9-]{1,64}$/i;

/** 重连退避（毫秒）；到顶后一直按最后一档重试。 */
const BACKOFF_MS = [500, 1000, 2000, 4000, 8000];

/** 首次连接最多尝试几次（含第一次），避免服务器没起来时无限转圈。 */
const FIRST_CONNECT_TRIES = 3;

/** 等 welcome 的超时；超时就当这条连接失败。 */
const WELCOME_TIMEOUT_MS = 12_000;

/** 断线期间最多缓存多少条待发消息。 */
const MAX_OUTBOX = 32;

export type RelayEvent =
  | { t: 'welcome'; id: string; peers: string[] }
  | { t: 'peer'; ev: 'join' | 'leave'; id: string }
  | { t: 'msg'; from: string; payload: NetMessage }
  | { t: 'full' }
  | { t: 'error'; message: string };

/** 中继特有的失败原因，供上层区分「房间满」和「连不上」。 */
export class RelayError extends Error {
  constructor(
    readonly code: 'full' | 'offline' | 'bad-url',
    message: string,
  ) {
    super(message);
    this.name = 'RelayError';
  }
}

/**
 * 归一化中继地址：只接受 ws:// 与 wss://，去掉 hash。
 * 返回 null 表示地址不可用（空串、http、乱写）。
 */
export function normalizeRelayUrl(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'ws:' && url.protocol !== 'wss:') return null;
  if (!url.host) return null;
  url.hash = '';
  return url.toString();
}

/** 把房间码拼进中继地址；保留地址自带的查询参数。 */
export function relaySocketUrl(relayUrl: string, code: string): string {
  const url = new URL(relayUrl);
  url.searchParams.set('room', code);
  return url.toString();
}

function readPeerId(value: unknown): string | null {
  return typeof value === 'string' && PEER_ID_PATTERN.test(value) ? value : null;
}

/** 解析服务器事件；不认识或不合法的一律忽略，不让脏数据进状态机。 */
export function decodeRelayEvent(value: unknown): RelayEvent | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;

  switch (raw.t) {
    case 'welcome': {
      const id = readPeerId(raw.id);
      if (!id || !Array.isArray(raw.peers)) return null;
      const peers: string[] = [];
      for (const item of raw.peers) {
        const peer = readPeerId(item);
        if (peer && peer !== id && !peers.includes(peer)) peers.push(peer);
      }
      return { t: 'welcome', id, peers };
    }

    case 'peer': {
      const id = readPeerId(raw.id);
      if (!id || (raw.ev !== 'join' && raw.ev !== 'leave')) return null;
      return { t: 'peer', ev: raw.ev, id };
    }

    case 'msg': {
      const from = readPeerId(raw.from);
      const payload = decodeMessage(raw.payload);
      if (!from || !payload) return null;
      return { t: 'msg', from, payload };
    }

    case 'full':
      return { t: 'full' };

    case 'error': {
      const message =
        typeof raw.message === 'string' && raw.message.trim()
          ? raw.message.slice(0, 200)
          : 'relay error';
      return { t: 'error', message };
    }

    default:
      return null;
  }
}

export function connectRelay(
  { code, relayUrl }: ConnectOptions & { relayUrl: string },
  handlers: TransportHandlers,
): Promise<Transport> {
  const url = relaySocketUrl(relayUrl, code);
  const peers = new Set<string>();

  let socket: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let retryTimer: number | null = null;
  let welcomeTimer: number | null = null;
  let outbox: string[] = [];
  let settled = false;

  let resolveReady: () => void = () => {};
  let rejectReady: (error: Error) => void = () => {};
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  function clearRetry() {
    if (retryTimer !== null) {
      window.clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  function clearWelcome() {
    if (welcomeTimer !== null) {
      window.clearTimeout(welcomeTimer);
      welcomeTimer = null;
    }
  }

  function flush() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const pending = outbox;
    outbox = [];
    for (const data of pending) socket.send(data);
  }

  function announceLeave() {
    for (const id of [...peers]) {
      peers.delete(id);
      handlers.onPeerLeave(id);
    }
  }

  function scheduleRetry() {
    if (closed || retryTimer !== null) return;
    const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
    attempt += 1;
    retryTimer = window.setTimeout(() => {
      retryTimer = null;
      dial();
    }, delay);
  }

  function failInitial(error: Error) {
    if (settled) return;
    settled = true;
    closed = true;
    clearRetry();
    clearWelcome();
    const current = socket;
    socket = null;
    current?.close();
    rejectReady(error);
  }

  function dial() {
    if (closed) return;

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      scheduleRetry();
      return;
    }
    socket = ws;

    clearWelcome();
    welcomeTimer = window.setTimeout(() => {
      welcomeTimer = null;
      // 连上了却没收到 welcome：当作失败，重连一次。
      if (socket === ws && !settled) ws.close();
    }, WELCOME_TIMEOUT_MS);

    ws.onmessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      const relayEvent = decodeRelayEvent(parsed);
      if (!relayEvent) return;

      switch (relayEvent.t) {
        case 'welcome': {
          clearWelcome();
          attempt = 0;
          for (const id of relayEvent.peers) {
            if (peers.has(id)) continue;
            peers.add(id);
            handlers.onPeerJoin(id);
          }
          if (!settled) {
            settled = true;
            resolveReady();
          }
          flush();
          return;
        }

        case 'peer': {
          if (relayEvent.ev === 'join') {
            if (peers.has(relayEvent.id)) return;
            peers.add(relayEvent.id);
            handlers.onPeerJoin(relayEvent.id);
          } else if (peers.delete(relayEvent.id)) {
            handlers.onPeerLeave(relayEvent.id);
          }
          return;
        }

        case 'msg': {
          if (!peers.has(relayEvent.from)) {
            // 漏掉 peer join 时也能自愈：收到消息就把对方认作邻居。
            peers.add(relayEvent.from);
            handlers.onPeerJoin(relayEvent.from);
          }
          handlers.onMessage(relayEvent.payload, relayEvent.from);
          return;
        }

        case 'full': {
          clearWelcome();
          if (!settled) {
            failInitial(new RelayError('full', 'room full'));
            return;
          }
          closed = true;
          socket?.close();
          handlers.onError('room full');
          return;
        }

        case 'error': {
          handlers.onError(relayEvent.message);
          return;
        }
      }
    };

    ws.onclose = () => {
      clearWelcome();
      if (socket !== ws) return;
      socket = null;
      if (closed) return;

      // 先告诉上层「对端都掉了」，重连后再按新的 peer 重新建立房间状态。
      announceLeave();

      if (!settled) {
        if (attempt + 1 >= FIRST_CONNECT_TRIES) {
          failInitial(new RelayError('offline', 'relay unreachable'));
          return;
        }
        scheduleRetry();
        return;
      }

      scheduleRetry();
    };
  }

  const transport: Transport = {
    strategy: 'relay',
    peers: () => [...peers],
    send: (message: NetMessage, peerId?: string) => {
      const data = JSON.stringify({ t: 'msg', to: peerId, payload: message });
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(data);
        return;
      }
      if (closed) throw new Error('relay closed');
      if (outbox.length >= MAX_OUTBOX) outbox.shift();
      outbox.push(data);
    },
    leave: () => {
      closed = true;
      clearRetry();
      clearWelcome();
      const current = socket;
      socket = null;
      peers.clear();
      outbox = [];
      current?.close(1000, 'leave');
    },
  };

  dial();
  return ready.then(() => transport);
}
