/**
 * 4Link WebSocket 中继 —— 自建 VPS 版（零依赖，Node 22+）。
 *
 * 自己实现 RFC 6455 的握手、帧解析与心跳，不需要 npm install，
 * 拷到服务器上 `node server.mjs` 就能跑；TLS 交给 Caddy / Nginx。
 *
 *   node server.mjs --port 8787
 *   PORT=8787 HOST=127.0.0.1 node server.mjs
 *
 * 客户端连接：wss://relay.example.com/ws?room=ABCDE
 *
 * 房间最多 2 人，服务器只转发 { t: 'msg' }，不解析棋局；
 * 房主权威、同步与重连全部在浏览器里完成。
 */

import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';

const ROOM_RE = /^[A-Z2-9]{5}$/;
const MAX_PEERS = 2;
const MAX_MESSAGE_BYTES = 64 * 1024;
const MAX_BUFFER_BYTES = 256 * 1024;
const PING_INTERVAL_MS = 30_000;
const MAX_MESSAGES_PER_SECOND = 40;
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}
const PORT = Number(process.env.PORT ?? argValue('--port', '8787'));
const HOST = process.env.HOST ?? argValue('--host', '0.0.0.0');

/** 房间码 → Room。空房间会被回收。 */
const rooms = new Map();

/* ---------- WebSocket 帧 ---------- */

/** 服务器 → 客户端：不加掩码。 */
function encodeFrame(opcode, payload = Buffer.alloc(0)) {
  const length = payload.length;
  let header;
  if (length < 126) {
    header = Buffer.alloc(2);
    header[1] = length;
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }
  header[0] = 0x80 | opcode;
  return Buffer.concat([header, payload]);
}

class Room {
  constructor(code) {
    this.code = code;
    this.peers = new Set();
  }
}

class Peer {
  constructor(socket, room, id) {
    this.socket = socket;
    this.room = room;
    this.id = id;
    this.buffer = Buffer.alloc(0);
    this.fragments = [];
    this.fragmentOpcode = 0;
    this.closed = false;
    this.alive = true;
    this.hits = 0;
    this.windowStart = Date.now();
  }

  sendRaw(text) {
    if (this.closed) return;
    try {
      this.socket.write(encodeFrame(0x1, Buffer.from(text, 'utf8')));
    } catch {
      this.socket.destroy();
    }
  }

  sendEvent(event) {
    this.sendRaw(JSON.stringify(event));
  }

  close(code = 1000, reason = '') {
    if (this.closed) return;
    this.closed = true;
    const text = Buffer.from(reason, 'utf8').subarray(0, 120);
    const payload = Buffer.alloc(2 + text.length);
    payload.writeUInt16BE(code, 0);
    text.copy(payload, 2);
    try {
      this.socket.write(encodeFrame(0x8, payload));
    } catch {
      /* 已断开 */
    }
    this.socket.end();
  }

  onData(chunk) {
    if (this.closed) return;
    this.buffer = this.buffer.length
      ? Buffer.concat([this.buffer, chunk])
      : chunk;
    if (this.buffer.length > MAX_BUFFER_BYTES) {
      this.close(1009, 'buffer too large');
      return;
    }

    for (;;) {
      const frame = this.readFrame();
      if (!frame) return;
      this.handleFrame(frame);
      if (this.closed) return;
    }
  }

  readFrame() {
    const buffer = this.buffer;
    if (buffer.length < 2) return null;

    const fin = (buffer[0] & 0x80) !== 0;
    const opcode = buffer[0] & 0x0f;
    const masked = (buffer[1] & 0x80) !== 0;
    let length = buffer[1] & 0x7f;
    let offset = 2;

    if (length === 126) {
      if (buffer.length < 4) return null;
      length = buffer.readUInt16BE(2);
      offset = 4;
    } else if (length === 127) {
      if (buffer.length < 10) return null;
      const big = buffer.readBigUInt64BE(2);
      if (big > BigInt(MAX_MESSAGE_BYTES)) {
        this.close(1009, 'too large');
        return null;
      }
      length = Number(big);
      offset = 10;
    }

    if (length > MAX_MESSAGE_BYTES) {
      this.close(1009, 'too large');
      return null;
    }

    const maskOffset = offset;
    if (masked) offset += 4;
    if (buffer.length < offset + length) return null;

    let payload = buffer.subarray(offset, offset + length);
    if (masked) {
      const mask = buffer.subarray(maskOffset, maskOffset + 4);
      const copy = Buffer.allocUnsafe(length);
      for (let i = 0; i < length; i += 1) copy[i] = payload[i] ^ mask[i & 3];
      payload = copy;
    }

    this.buffer = buffer.subarray(offset + length);
    return { fin, opcode, payload };
  }

  handleFrame({ fin, opcode, payload }) {
    switch (opcode) {
      case 0x8: // close
        this.close(1000, '');
        return;
      case 0x9: // ping
        try {
          this.socket.write(encodeFrame(0xa, payload));
        } catch {
          this.socket.destroy();
        }
        return;
      case 0xa: // pong
        this.alive = true;
        return;
      case 0x0: { // continuation
        this.fragments.push(payload);
        if (fin) this.finishMessage(this.fragmentOpcode);
        return;
      }
      case 0x1: // text
      case 0x2: { // binary：只接受文本
        if (!fin) {
          this.fragments = [payload];
          this.fragmentOpcode = opcode;
          return;
        }
        if (opcode === 0x1) this.onText(payload);
        return;
      }
      default:
        this.close(1002, 'bad opcode');
    }
  }

  finishMessage(opcode) {
    const payload = Buffer.concat(this.fragments);
    this.fragments = [];
    this.fragmentOpcode = 0;
    if (opcode === 0x1) this.onText(payload);
  }

  allow() {
    const now = Date.now();
    if (now - this.windowStart > 1000) {
      this.windowStart = now;
      this.hits = 0;
    }
    this.hits += 1;
    return this.hits <= MAX_MESSAGES_PER_SECOND;
  }

  onText(payload) {
    if (!this.allow()) {
      this.close(1008, 'rate limit');
      return;
    }

    let data;
    try {
      data = JSON.parse(payload.toString('utf8'));
    } catch {
      return;
    }
    if (!data || data.t !== 'msg' || data.payload === undefined) return;

    const frame = JSON.stringify({ t: 'msg', from: this.id, payload: data.payload });
    if (Buffer.byteLength(frame) > MAX_MESSAGE_BYTES) return;
    for (const peer of this.room.peers) {
      if (peer !== this) peer.sendRaw(frame);
    }
  }
}

/* ---------- 房间 ---------- */

function removePeer(room, peer) {
  if (!room.peers.delete(peer)) return;
  peer.closed = true;
  for (const other of room.peers) {
    other.sendEvent({ t: 'peer', ev: 'leave', id: peer.id });
  }
  if (room.peers.size === 0) rooms.delete(room.code);
}

/* ---------- HTTP / Upgrade ---------- */

const server = createServer((req, res) => {
  if (req.url && req.url.startsWith('/ws')) {
    res.writeHead(426, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('expected websocket upgrade\n');
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(`4Link relay ok · ${rooms.size} room(s)\n`);
});

server.on('upgrade', (req, socket, head) => {
  const key = req.headers['sec-websocket-key'];
  const upgrade = String(req.headers.upgrade ?? '').toLowerCase();
  if (upgrade !== 'websocket' || typeof key !== 'string') {
    socket.destroy();
    return;
  }

  let url;
  try {
    url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  } catch {
    socket.destroy();
    return;
  }

  const code = (url.searchParams.get('room') ?? '').toUpperCase();
  if (url.pathname !== '/ws' || !ROOM_RE.test(code)) {
    socket.destroy();
    return;
  }

  const accept = createHash('sha1').update(key + WS_GUID).digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${accept}\r\n` +
      '\r\n',
  );
  socket.setNoDelay(true);

  let room = rooms.get(code);
  if (!room) {
    room = new Room(code);
    rooms.set(code, room);
  }

  const peer = new Peer(socket, room, randomUUID().slice(0, 8));

  if (room.peers.size >= MAX_PEERS) {
    peer.sendEvent({ t: 'full' });
    peer.close(4001, 'room full');
    return;
  }

  const others = [...room.peers].map((other) => other.id);
  room.peers.add(peer);
  peer.sendEvent({ t: 'welcome', id: peer.id, peers: others });
  for (const other of room.peers) {
    if (other !== peer) other.sendEvent({ t: 'peer', ev: 'join', id: peer.id });
  }

  socket.on('data', (chunk) => peer.onData(chunk));
  socket.on('close', () => removePeer(room, peer));
  socket.on('error', () => removePeer(room, peer));
  if (head && head.length) peer.onData(head);
});

/* ---------- 心跳 ---------- */

const heartbeat = setInterval(() => {
  for (const room of [...rooms.values()]) {
    for (const peer of [...room.peers]) {
      if (!peer.alive) {
        peer.socket.destroy();
        removePeer(room, peer);
        continue;
      }
      peer.alive = false;
      try {
        peer.socket.write(encodeFrame(0x9, Buffer.from('hb')));
      } catch {
        peer.socket.destroy();
      }
    }
  }
}, PING_INTERVAL_MS);
heartbeat.unref();

function shutdown() {
  clearInterval(heartbeat);
  for (const room of rooms.values()) {
    for (const peer of room.peers) peer.close(1001, 'server shutting down');
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, HOST, () => {
  console.log(`4Link relay listening on ws://${HOST}:${PORT}/ws?room=CODE`);
});
