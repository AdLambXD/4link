/**
 * Trystero（WebRTC）传输实现。
 *
 * 走 nostr 公共中继做信令：不需要注册账号，静态站点也能用。
 * 中继只负责交换 SDP / ICE，棋步本身是端到端直连的。
 *
 * 注意：Trystero 0.26 起 mqtt / torrent 子路径会直接抛错，
 * 需要改用独立的 @trystero-p2p/* 包，所以这里只保留 nostr。
 */

import { joinRoom } from 'trystero/nostr';
import { NET_APP_ID, decodeMessage } from './protocol';
import type { NetStrategy, Transport, TransportHandlers } from './transport';

export async function connectTrystero(
  { code }: { code: string; strategy?: NetStrategy },
  handlers: TransportHandlers,
): Promise<Transport> {
  const room = joinRoom(
    {
      appId: NET_APP_ID,
      // 同一台机器开两个标签页调试时，Chrome 的 mDNS 候选可能互相解析不到；
      // 开发环境回落到 loopback，正式构建不启用。
      ...(import.meta.env.DEV ? { _test_only_mdnsHostFallbackToLoopback: true } : {}),
    },
    code,
    {
      onJoinError: (details) => {
        handlers.onError(details.error);
      },
    },
  );

  // 用 JSON 字符串传，避免把 GameState 的 readonly 类型塞进 Trystero 的二进制编码。
  const action = room.makeAction<string>('msg');
  action.onMessage = (data, context) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }
    const message = decodeMessage(parsed);
    if (message) handlers.onMessage(message, context.peerId);
  };

  room.onPeerJoin = (peerId) => handlers.onPeerJoin(peerId);
  room.onPeerLeave = (peerId) => handlers.onPeerLeave(peerId);

  return {
    strategy: 'nostr',
    peers: () => Object.keys(room.getPeers()),
    send: (message, peerId) =>
      action.send(JSON.stringify(message), peerId ? { target: peerId } : undefined),
    leave: () => {
      room.onPeerJoin = null;
      room.onPeerLeave = null;
      action.onMessage = null;
      void room.leave();
    },
  };
}
