/**
 * 本机调试用传输：同一浏览器内用 BroadcastChannel 模拟房间。
 *
 * 只在开发环境通过 `?net=local` 启用，用来验证房间逻辑、同步与重连，
 * 不需要 WebRTC / 中继，也不影响正式构建的行为。
 */

import { decodeMessage, type NetMessage } from './protocol';
import type { Transport, TransportHandlers } from './transport';

type Wire =
  | { from: string; kind: 'join' }
  | { from: string; kind: 'hello'; to: string }
  | { from: string; kind: 'msg'; to?: string; payload: NetMessage }
  | { from: string; kind: 'leave' };

function randomId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function connectLocal(
  { code }: { code: string },
  handlers: TransportHandlers,
): Promise<Transport> {
  const selfId = randomId();
  const channel = new BroadcastChannel(`4link-local-${code}`);
  const peers = new Set<string>();

  const post = (message: Wire) => channel.postMessage(message);

  channel.onmessage = (event: MessageEvent<Wire>) => {
    const data = event.data;
    if (!data || data.from === selfId) return;

    switch (data.kind) {
      case 'join': {
        peers.add(data.from);
        post({ from: selfId, kind: 'hello', to: data.from });
        handlers.onPeerJoin(data.from);
        return;
      }
      case 'hello': {
        if (data.to !== selfId || peers.has(data.from)) return;
        peers.add(data.from);
        handlers.onPeerJoin(data.from);
        return;
      }
      case 'msg': {
        if (data.to && data.to !== selfId) return;
        const message = decodeMessage(data.payload);
        if (message) handlers.onMessage(message, data.from);
        return;
      }
      case 'leave': {
        if (peers.delete(data.from)) handlers.onPeerLeave(data.from);
        return;
      }
    }
  };

  post({ from: selfId, kind: 'join' });

  const announceLeave = () => post({ from: selfId, kind: 'leave' });
  window.addEventListener('pagehide', announceLeave);

  return {
    strategy: 'local',
    peers: () => [...peers],
    send: (message, peerId) => {
      post({ from: selfId, kind: 'msg', to: peerId, payload: message });
    },
    leave: () => {
      announceLeave();
      window.removeEventListener('pagehide', announceLeave);
      channel.onmessage = null;
      channel.close();
    },
  };
}
