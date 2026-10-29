import { describe, expect, it } from 'vitest';
import { createGame, drop, makeConfig, type GameState } from '../game/rules';
import {
  decodeMessage,
  hashState,
  makeRoomCode,
  normalizeRoomCode,
  roomCodeFromUrl,
  roomLink,
  sanitizeState,
} from './protocol';

function played(cols: number[]): GameState {
  let state = createGame(1, makeConfig(6, 2));
  for (const col of cols) state = drop(state, col);
  return state;
}

describe('房间码', () => {
  it('生成 5 位、只含无歧义字符的码', () => {
    for (let i = 0; i < 50; i++) {
      const code = makeRoomCode();
      expect(code).toHaveLength(5);
      expect(code).toMatch(/^[A-HJ-NP-Z2-9]{5}$/);
      expect(normalizeRoomCode(code)).toBe(code);
    }
  });

  it('归一化手输的房间码', () => {
    expect(normalizeRoomCode(' ab-cde ')).toBe('ABCDE');
    expect(normalizeRoomCode('4k7-qp')).toBe('4K7QP');
    expect(normalizeRoomCode('ABCDE')).toBe('ABCDE');
  });

  it('拒绝长度或字符不合法的码', () => {
    expect(normalizeRoomCode('')).toBeNull();
    expect(normalizeRoomCode(null)).toBeNull();
    expect(normalizeRoomCode('ABCD')).toBeNull();
    expect(normalizeRoomCode('ABCDEF')).toBeNull();
    expect(normalizeRoomCode('ABC0E')).toBeNull();
    expect(normalizeRoomCode('ABC1E')).toBeNull();
  });

  it('从分享链接读取房间码，并可反向生成链接', () => {
    const link = roomLink('https://example.github.io/4link/?foo=1#x', '4K7QP');
    expect(link).toBe('https://example.github.io/4link/?foo=1&room=4K7QP');
    expect(roomCodeFromUrl(link)).toBe('4K7QP');
    expect(roomCodeFromUrl('https://example.github.io/4link/')).toBeNull();
    expect(roomCodeFromUrl('not a url')).toBeNull();
  });
});

describe('sanitizeState', () => {
  it('接受真实对局产生的局面', () => {
    const state = played([2, 2, 3]);
    const safe = sanitizeState(JSON.parse(JSON.stringify(state)));
    expect(safe).not.toBeNull();
    expect(safe?.count).toBe(3);
    expect(safe?.heights).toEqual(state.heights);
    expect(hashState(safe as GameState)).toBe(hashState(state));
  });

  it('按棋盘重新推导 heights / count，不信任对端字段', () => {
    const state = played([0, 1, 0]);
    const tampered = {
      ...JSON.parse(JSON.stringify(state)),
      heights: [0, 0, 0, 0, 0, 0],
      count: 99,
    };
    const safe = sanitizeState(tampered);
    expect(safe?.count).toBe(3);
    expect(safe?.heights).toEqual(state.heights);
  });

  it('拒绝尺寸不符的棋盘', () => {
    const state = played([0]);
    expect(
      sanitizeState({ ...JSON.parse(JSON.stringify(state)), board: [0, 0, 0] }),
    ).toBeNull();
  });

  it('拒绝悬空棋子', () => {
    const state = played([]);
    const raw = JSON.parse(JSON.stringify(state));
    raw.board[1 * state.config.cols + 0] = 1; // 第 0 列第 1 行有子，但第 0 行是空的
    expect(sanitizeState(raw)).toBeNull();
  });

  it('拒绝越界棋子编号', () => {
    const state = played([0]);
    const raw = JSON.parse(JSON.stringify(state));
    raw.board[raw.board.indexOf(1)] = 9;
    expect(sanitizeState(raw)).toBeNull();
  });

  it('拒绝与棋盘不符的结束状态', () => {
    const state = played([0, 1]);
    const raw = JSON.parse(JSON.stringify(state));
    raw.status = 'draw';
    raw.winner = null;
    expect(sanitizeState(raw)).toBeNull();

    const won = played([0, 0, 1, 1, 2, 2, 3]);
    expect(won.status).toBe('won');
    const fake = JSON.parse(JSON.stringify(won));
    fake.winLine = null;
    expect(sanitizeState(fake)).toBeNull();
  });

  it('拒绝非对象输入', () => {
    expect(sanitizeState(null)).toBeNull();
    expect(sanitizeState('state')).toBeNull();
    expect(sanitizeState({})).toBeNull();
  });
});

describe('hashState', () => {
  it('同一局面摘要稳定', () => {
    const a = played([0, 1, 2]);
    const b = played([0, 1, 2]);
    expect(hashState(a)).toBe(hashState(b));
  });

  it('不同局面摘要不同', () => {
    const a = played([0, 1, 2]);
    const b = played([0, 1, 3]);
    expect(hashState(a)).not.toBe(hashState(b));
  });
});

describe('decodeMessage', () => {
  it('解析落子与局面消息', () => {
    const state = played([0, 1]);
    expect(decodeMessage({ t: 'play', col: 2, count: 2 })).toEqual({
      t: 'play',
      col: 2,
      count: 2,
    });

    const decoded = decodeMessage({ t: 'state', state, hash: hashState(state) });
    expect(decoded?.t).toBe('state');
    if (decoded?.t === 'state') {
      expect(decoded.state.count).toBe(2);
      expect(decoded.hash).toBe(hashState(state));
    }
  });

  it('丢弃非法消息', () => {
    expect(decodeMessage(null)).toBeNull();
    expect(decodeMessage({ t: 'nope' })).toBeNull();
    expect(decodeMessage({ t: 'play', col: -1, count: 0 })).toBeNull();
    expect(decodeMessage({ t: 'state', state: { bad: true }, hash: 1 })).toBeNull();
    expect(decodeMessage({ t: 'state', state: played([0]), hash: 'x' })).toBeNull();
  });

  it('bye 的 reason 只接受 full / leave', () => {
    expect(decodeMessage({ t: 'bye', reason: 'full' })).toEqual({
      t: 'bye',
      reason: 'full',
    });
    expect(decodeMessage({ t: 'bye', reason: 'whatever' })).toEqual({
      t: 'bye',
      reason: 'leave',
    });
  });
});
