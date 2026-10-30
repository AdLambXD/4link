/**
 * 4Link 联机协议（纯函数，无 DOM / WebRTC 依赖）。
 *
 * 静态站点没有自己的服务端，联机靠 WebRTC 直连。
 * 房主（seat 1）是唯一权威：访客只上报「落哪一列」，
 * 房主用本地规则校验后把完整 GameState 广播回去，因此不需要锁步或回滚。
 */

import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  normalizeConfig,
  type Cell,
  type GameState,
  type Status,
} from '../game/rules';

/** Trystero 的 appId；换名字等于换一个独立网络。 */
export const NET_APP_ID = '4link-online-v1';

export const PROTOCOL_VERSION = 1;

export const ROOM_CODE_LENGTH = 5;

/** 去掉 I / O / 0 / 1，避免口头或手抄房间码时认错。 */
const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** 房间座位：房主 1，访客 2（第一版只支持 1v1）。 */
export type Seat = 1 | 2;

export type NetMessage =
  /** 访客 → 房主：我想落这一列。count 用来发现过期请求。 */
  | { t: 'play'; col: number; count: number }
  /** 房主 → 访客：权威局面。hash 用于校验传输是否完整。 */
  | { t: 'state'; state: GameState; hash: number }
  /** 访客 → 房主：请求一次全量局面（刚加入、重连或校验失败）。 */
  | { t: 'sync' }
  /** 任意一方 → 对方：我同意再来一局。 */
  | { t: 'rematch' }
  /** 房间满员时探测原对手是否还在线。 */
  | { t: 'ping'; nonce: number }
  | { t: 'pong'; nonce: number }
  /** 离开 / 房间已满。 */
  | { t: 'bye'; reason: 'leave' | 'full' };

/* ---------- 房间码 ---------- */

export function makeRoomCode(): string {
  const bytes = new Uint8Array(ROOM_CODE_LENGTH);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  let code = '';
  for (const byte of bytes) code += ROOM_ALPHABET[byte % ROOM_ALPHABET.length];
  return code;
}

/** 归一化用户输入：去空格 / 连字符、转大写；非法字符或长度不对返回 null。 */
export function normalizeRoomCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[\s-_]/g, '').toUpperCase();
  if (cleaned.length !== ROOM_CODE_LENGTH) return null;
  for (const char of cleaned) {
    if (!ROOM_ALPHABET.includes(char)) return null;
  }
  return cleaned;
}

export function roomCodeFromUrl(href: string): string | null {
  try {
    return normalizeRoomCode(new URL(href).searchParams.get('room'));
  } catch {
    return null;
  }
}

/** 分享链接里的中继地址（原样返回，交给 net/relay 校验）。 */
export function relayFromUrl(href: string): string | null {
  try {
    return new URL(href).searchParams.get('relay');
  } catch {
    return null;
  }
}

/**
 * 生成分享链接。
 *
 * 带上中继地址后，对手打开链接会自动走同一条路，
 * 不会出现「房主用中继、访客用直连」连不上的情况。
 */
export function roomLink(
  href: string,
  code: string,
  options?: { relayUrl?: string | null },
): string {
  const url = new URL(href);
  url.searchParams.set('room', code);
  if (options?.relayUrl) url.searchParams.set('relay', options.relayUrl);
  else url.searchParams.delete('relay');
  url.hash = '';
  return url.toString();
}

/* ---------- 局面校验 ---------- */

function readInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

const STATUS_CODES: Record<Status, number> = { playing: 0, won: 1, draw: 2 };

/**
 * 把网络来的未知数据重建为可信 GameState。
 *
 * 对手是任意浏览器，不能信任它发来的对象：这里重新推导 heights / count，
 * 并检查重力堆叠、胜负状态与棋盘是否自洽。任何不一致都返回 null。
 */
export function sanitizeState(value: unknown): GameState | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;

  const configRaw = raw.config;
  if (!configRaw || typeof configRaw !== 'object') return null;
  const c = configRaw as Record<string, unknown>;

  const cols = readInt(c.cols);
  const rows = readInt(c.rows);
  const win = readInt(c.win);
  const players = readInt(c.players);
  if (cols === null || rows === null || win === null || players === null) return null;

  // 限制尺寸，避免对方发一个 10000×10000 的棋盘把页面撑爆。
  if (cols < 3 || rows < 3 || cols > 32 || rows > 32) return null;
  if (players < MIN_PLAYERS || players > MAX_PLAYERS) return null;

  const config = normalizeConfig({ cols, rows, win, players });
  if (
    config.cols !== cols ||
    config.rows !== rows ||
    config.win !== win ||
    config.players !== players
  ) {
    return null;
  }

  const boardRaw = raw.board;
  if (!Array.isArray(boardRaw) || boardRaw.length !== cols * rows) return null;

  const board: Cell[] = new Array<Cell>(cols * rows).fill(0);
  const heights: number[] = new Array<number>(cols).fill(0);
  let count = 0;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const cell = readInt(boardRaw[row * cols + col]);
      if (cell === null || cell < 0 || cell > players) return null;
      if (cell === 0) continue;
      // 重力棋盘：每列必须从底部连续堆叠，中间不能悬空。
      if (row !== heights[col]) return null;
      board[row * cols + col] = cell as Cell;
      heights[col] += 1;
      count += 1;
    }
  }

  const turn = readInt(raw.turn);
  if (turn === null || turn < 1 || turn > players) return null;

  const status = raw.status;
  if (status !== 'playing' && status !== 'won' && status !== 'draw') return null;

  const winnerRaw = raw.winner;
  let winner: GameState['winner'] = null;
  if (winnerRaw !== null && winnerRaw !== undefined) {
    const parsed = readInt(winnerRaw);
    if (parsed === null || parsed < 1 || parsed > players) return null;
    winner = parsed as GameState['winner'];
  }

  const lastRaw = raw.last;
  let last: number | null = null;
  if (lastRaw !== null && lastRaw !== undefined) {
    const parsed = readInt(lastRaw);
    if (parsed === null || parsed < 0 || parsed >= cols * rows || board[parsed] === 0) {
      return null;
    }
    last = parsed;
  }

  const lineRaw = raw.winLine;
  let winLine: readonly number[] | null = null;
  if (lineRaw !== null && lineRaw !== undefined) {
    if (!Array.isArray(lineRaw)) return null;
    const line: number[] = [];
    for (const item of lineRaw) {
      const parsed = readInt(item);
      if (parsed === null || parsed < 0 || parsed >= cols * rows) return null;
      line.push(parsed);
    }
    if (line.length < config.win) return null;
    winLine = line;
  }

  // 状态自洽性
  if (status === 'playing') {
    if (winner !== null || winLine !== null || count >= cols * rows) return null;
  } else if (status === 'draw') {
    if (winner !== null || count !== cols * rows) return null;
  } else {
    if (winner === null || winLine === null) return null;
  }

  return {
    config,
    board,
    heights,
    turn: turn as GameState['turn'],
    status,
    winner,
    winLine,
    last,
    count,
  };
}

/* ---------- 摘要 ---------- */

/** FNV-1a 32 位摘要，用来发现两端局面不一致。 */
export function hashState(state: GameState): number {
  let hash = 0x811c9dc5;
  const mix = (value: number) => {
    hash ^= value & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (value >>> 8) & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (value >>> 16) & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (value >>> 24) & 0xff;
    hash = Math.imul(hash, 0x01000193);
  };

  mix(state.config.cols);
  mix(state.config.rows);
  mix(state.config.win);
  mix(state.config.players);
  for (const cell of state.board) mix(cell);
  for (const height of state.heights) mix(height);
  mix(state.turn);
  mix(state.count);
  mix(STATUS_CODES[state.status]);
  mix(state.winner ?? 0);
  return hash >>> 0;
}

/* ---------- 消息编解码 ---------- */

export function decodeMessage(value: unknown): NetMessage | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;

  switch (raw.t) {
    case 'play': {
      const col = readInt(raw.col);
      const count = readInt(raw.count);
      if (col === null || count === null || col < 0 || count < 0) return null;
      return { t: 'play', col, count };
    }
    case 'state': {
      const state = sanitizeState(raw.state);
      const hash = readInt(raw.hash);
      if (!state || hash === null) return null;
      return { t: 'state', state, hash };
    }
    case 'sync':
      return { t: 'sync' };
    case 'rematch':
      return { t: 'rematch' };
    case 'ping': {
      const nonce = readInt(raw.nonce);
      return nonce === null ? null : { t: 'ping', nonce };
    }
    case 'pong': {
      const nonce = readInt(raw.nonce);
      return nonce === null ? null : { t: 'pong', nonce };
    }
    case 'bye':
      return { t: 'bye', reason: raw.reason === 'full' ? 'full' : 'leave' };
    default:
      return null;
  }
}
