/**
 * 联机传输层接口。
 *
 * 只描述「一个房间 + 点对点消息」需要的最小能力，
 * 这样以后换成 Supabase / 自建 WebSocket 时，上层房间逻辑不用改。
 */

import type { NetMessage } from './protocol';

/** 正式环境只有 nostr；local 是同一浏览器双标签页调试用的实现。 */
export type NetStrategy = 'nostr' | 'local';

export interface Transport {
  readonly strategy: NetStrategy;
  /** 当前已连上的对端 id（1v1 下最多 1 个）。 */
  peers(): string[];
  /** 允许返回 Promise：上层据此发现「消息没发出去」，而不是静默丢弃。 */
  send(message: NetMessage, peerId?: string): void | Promise<void>;
  leave(): void;
}

export interface TransportHandlers {
  onPeerJoin(peerId: string): void;
  onPeerLeave(peerId: string): void;
  onMessage(message: NetMessage, peerId: string): void;
  /** 信令层报错原因（例如公共中继不可用）；文案由上层用 i18n 组装。 */
  onError(detail: string): void;
}

export interface ConnectOptions {
  code: string;
  strategy?: NetStrategy;
}

export type Connect = (
  options: ConnectOptions,
  handlers: TransportHandlers,
) => Promise<Transport>;
