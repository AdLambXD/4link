/**
 * 4Link WebSocket 中继 —— Cloudflare Workers + Durable Objects 版。
 *
 * 一个 Durable Object 实例 = 一个房间（最多 2 人），只做转发，不解析棋局。
 * 免费计划即可运行：棋类游戏流量极小，休眠 API 还能在没人说话时不计费。
 *
 * 部署：
 *   cd server/relay/cloudflare
 *   npx wrangler deploy
 * 然后把输出的 wss://<name>.<account>.workers.dev/ws 填进站点
 * （构建变量 VITE_RELAY_URL，或让玩家在联机面板里自己填）。
 */

const ROOM_RE = /^[A-Z2-9]{5}$/;
const MAX_PEERS = 2;
const MAX_MESSAGE_CHARS = 64 * 1024;

function parseRoom(url) {
  const room = (url.searchParams.get('room') ?? '').toUpperCase();
  return ROOM_RE.test(room) ? room : null;
}

/** 从 WebSocket 上取回 join 时写入的 id。 */
function peerId(ws) {
  const attachment = ws.deserializeAttachment();
  return attachment && typeof attachment.id === 'string' ? attachment.id : null;
}

export class RelayRoom {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected websocket', { status: 426 });
    }
    if (!parseRoom(new URL(request.url))) {
      return new Response('bad room', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);

    const sockets = this.state.getWebSockets();
    if (sockets.length > MAX_PEERS) {
      server.send(JSON.stringify({ t: 'full' }));
      server.close(4001, 'room full');
      return new Response(null, { status: 101, webSocket: client });
    }

    const id = crypto.randomUUID().slice(0, 8);
    server.serializeAttachment({ id });

    const others = [];
    for (const ws of sockets) {
      if (ws === server) continue;
      const otherId = peerId(ws);
      if (!otherId) continue;
      others.push(otherId);
      ws.send(JSON.stringify({ t: 'peer', ev: 'join', id }));
    }

    server.send(JSON.stringify({ t: 'welcome', id, peers: others }));
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, message) {
    if (typeof message !== 'string' || message.length > MAX_MESSAGE_CHARS) return;

    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }
    if (!data || data.t !== 'msg' || data.payload === undefined) return;

    const from = peerId(ws);
    if (!from) return;

    const frame = JSON.stringify({ t: 'msg', from, payload: data.payload });
    for (const peer of this.state.getWebSockets()) {
      if (peer === ws) continue;
      try {
        peer.send(frame);
      } catch {
        /* 对端刚好断开：忽略，close 事件会补广播 */
      }
    }
  }

  webSocketClose(ws, code, reason) {
    this.announceLeave(ws);
    // 完成关闭握手；重复关闭不会抛错。
    try {
      ws.close(code, reason);
    } catch {
      /* 已关闭 */
    }
  }

  webSocketError(ws) {
    this.announceLeave(ws);
  }

  announceLeave(ws) {
    const id = peerId(ws);
    if (!id) return;
    const frame = JSON.stringify({ t: 'peer', ev: 'leave', id });
    for (const peer of this.state.getWebSockets()) {
      if (peer === ws) continue;
      try {
        peer.send(frame);
      } catch {
        /* 忽略 */
      }
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/ws') {
      return new Response('4Link relay: connect to /ws?room=CODE', {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    const room = parseRoom(url);
    if (!room) return new Response('bad room', { status: 400 });

    const id = env.ROOMS.idFromName(room);
    return env.ROOMS.get(id).fetch(request);
  },
};
