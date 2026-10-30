import { describe, expect, it } from 'vitest';
import { createGame, drop, makeConfig } from '../game/rules';
import { decodeMessage, relayFromUrl, roomLink } from './protocol';
import {
  decodeRelayEvent,
  normalizeRelayUrl,
  relaySocketUrl,
} from './relay';

describe('中继地址', () => {
  it('只接受 ws:// 与 wss://，并去掉首尾空白与 hash', () => {
    expect(normalizeRelayUrl('wss://relay.example.com/ws')).toBe(
      'wss://relay.example.com/ws',
    );
    expect(normalizeRelayUrl('  ws://127.0.0.1:8787/ws#debug ')).toBe(
      'ws://127.0.0.1:8787/ws',
    );
  });

  it('拒绝 http、空串和乱写的地址', () => {
    expect(normalizeRelayUrl('https://relay.example.com/ws')).toBeNull();
    expect(normalizeRelayUrl('relay.example.com')).toBeNull();
    expect(normalizeRelayUrl('')).toBeNull();
    expect(normalizeRelayUrl('   ')).toBeNull();
    expect(normalizeRelayUrl(null)).toBeNull();
    expect(normalizeRelayUrl(undefined)).toBeNull();
  });

  it('把房间码拼进地址，并保留原有查询参数', () => {
    const url = new URL(relaySocketUrl('wss://relay.example.com/ws?token=abc', '4K7QP'));
    expect(url.protocol).toBe('wss:');
    expect(url.pathname).toBe('/ws');
    expect(url.searchParams.get('token')).toBe('abc');
    expect(url.searchParams.get('room')).toBe('4K7QP');
  });
});

describe('中继事件', () => {
  it('解析 welcome，过滤自己、重复和非法 id', () => {
    expect(
      decodeRelayEvent({
        t: 'welcome',
        id: 'aaaaaaaa',
        peers: ['bbbbbbbb', 'bbbbbbbb', 'aaaaaaaa', 42, ''],
      }),
    ).toEqual({ t: 'welcome', id: 'aaaaaaaa', peers: ['bbbbbbbb'] });
  });

  it('拒绝缺少 id 的 welcome', () => {
    expect(decodeRelayEvent({ t: 'welcome', peers: [] })).toBeNull();
    expect(decodeRelayEvent({ t: 'welcome', id: '', peers: [] })).toBeNull();
    expect(decodeRelayEvent({ t: 'welcome', id: 'aaaaaaaa', peers: 'nope' })).toBeNull();
  });

  it('解析 peer 加入与离开', () => {
    expect(decodeRelayEvent({ t: 'peer', ev: 'join', id: 'bbbbbbbb' })).toEqual({
      t: 'peer',
      ev: 'join',
      id: 'bbbbbbbb',
    });
    expect(decodeRelayEvent({ t: 'peer', ev: 'leave', id: 'bbbbbbbb' })).toEqual({
      t: 'peer',
      ev: 'leave',
      id: 'bbbbbbbb',
    });
    expect(decodeRelayEvent({ t: 'peer', ev: 'bye', id: 'bbbbbbbb' })).toBeNull();
  });

  it('转发合法棋局消息，拒绝被篡改的 payload', () => {
    let state = createGame(1, makeConfig(6, 2));
    state = drop(state, 2);

    const message = { t: 'state', state, hash: 123 };
    expect(decodeRelayEvent({ t: 'msg', from: 'bbbbbbbb', payload: message })).toEqual({
      t: 'msg',
      from: 'bbbbbbbb',
      payload: decodeMessage(message),
    });

    // 悬空棋子：重力棋盘不允许 row > heights，必须被拒绝。
    const board = [...state.board];
    board[state.config.cols + 0] = 1;
    const broken = { ...message, state: { ...state, board } };
    expect(
      decodeRelayEvent({ t: 'msg', from: 'bbbbbbbb', payload: broken }),
    ).toBeNull();
  });

  it('房间满与错误事件', () => {
    expect(decodeRelayEvent({ t: 'full' })).toEqual({ t: 'full' });
    expect(decodeRelayEvent({ t: 'error', message: 'boom' })).toEqual({
      t: 'error',
      message: 'boom',
    });
    expect(decodeRelayEvent({ t: 'error' })).toEqual({
      t: 'error',
      message: 'relay error',
    });
    expect(decodeRelayEvent({ t: 'unknown' })).toBeNull();
    expect(decodeRelayEvent(null)).toBeNull();
    expect(decodeRelayEvent('welcome')).toBeNull();
  });
});

describe('分享链接带上连接方式', () => {
  it('中继房间的链接带 ?relay=，对手打开后能还原', () => {
    const link = roomLink('https://example.github.io/4link/?foo=1', '4K7QP', {
      relayUrl: 'wss://relay.example.com/ws',
    });
    expect(relayFromUrl(link)).toBe('wss://relay.example.com/ws');
    expect(new URL(link).searchParams.get('foo')).toBe('1');
  });

  it('直连房间的链接不带 relay 参数', () => {
    const link = roomLink(
      'https://example.github.io/4link/?relay=wss%3A%2F%2Fold',
      '4K7QP',
    );
    expect(relayFromUrl(link)).toBeNull();
    expect(relayFromUrl('not a url')).toBeNull();
  });
});
