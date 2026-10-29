import { useState } from 'react';
import type { OnlinePhase } from '../hooks/useOnlineGame';
import { ROOM_CODE_LENGTH, roomCodeFromUrl, type Seat } from '../net/protocol';

export interface OnlinePanelProps {
  phase: OnlinePhase;
  code: string | null;
  link: string | null;
  seat: Seat | null;
  error: string | null;
  notice: string | null;
  onHost: () => void;
  onJoin: (code: string) => void;
  onLeave: () => void;
}

type CopyState = 'idle' | 'ok' | 'fail';

export function OnlinePanel({
  phase,
  code,
  link,
  seat,
  error,
  notice,
  onHost,
  onJoin,
  onLeave,
}: OnlinePanelProps) {
  const [joining, setJoining] = useState(false);
  const [input, setInput] = useState(() => roomCodeFromUrl(window.location.href) ?? '');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopyState('ok');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('fail');
    }
  };

  const submitJoin = () => {
    const code = input.trim();
    if (!code) return;
    onJoin(code);
  };

  const roomCodeField = code ? (
    <div className="online-room">
      <span className="online-room-label">房间码</span>
      <strong className="online-code">{code}</strong>
    </div>
  ) : null;

  const linkField = link ? (
    <div className="online-field">
      <input
        className="online-input online-link"
        value={link}
        readOnly
        onFocus={(event) => event.currentTarget.select()}
        aria-label="分享链接"
      />
      <button type="button" className="online-copy" onClick={copyLink}>
        {copyState === 'ok' ? '已复制' : copyState === 'fail' ? '手动复制' : '复制链接'}
      </button>
    </div>
  ) : null;

  return (
    <div className="online-panel">
      {phase === 'idle' && (
        <>
          <div className="choices choices-2">
            <button type="button" className="choice choice-compact" onClick={onHost}>
              <span className="choice-main">创建房间</span>
              <span className="choice-note">HOST · 你先手</span>
            </button>
            <button
              type="button"
              className={`choice choice-compact${joining ? ' is-on' : ''}`}
              onClick={() => setJoining((value) => !value)}
            >
              <span className="choice-main">加入房间</span>
              <span className="choice-note">JOIN · 你后手</span>
            </button>
          </div>

          {joining && (
            <div className="online-field online-field-join">
              <input
                className="online-input online-code-input"
                value={input}
                onChange={(event) =>
                  setInput(
                    event.currentTarget.value
                      .replace(/[\s-_]/g, '')
                      .toUpperCase()
                      .slice(0, ROOM_CODE_LENGTH),
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitJoin();
                }}
                placeholder="输入 5 位房间码"
                autoFocus
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                aria-label="房间码"
              />
              <button
                type="button"
                className="online-copy"
                onClick={submitJoin}
                disabled={input.length !== ROOM_CODE_LENGTH}
              >
                加入
              </button>
            </div>
          )}

          <p className="online-note">
            两台设备连到同一个房间后直接 P2P 对弈，棋步不经过服务器；
            房主执先手。分享链接可直接把房间码带给对手。
          </p>
        </>
      )}

      {phase === 'connecting' && (
        <>
          <div className="online-status">
            <span className="online-dot is-busy" />
            正在连接信令服务器…
          </div>
          {roomCodeField}
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              取消
            </button>
          </div>
        </>
      )}

      {phase === 'waiting' && (
        <>
          <div className="online-status">
            <span className="online-dot is-busy" />
            {seat === 1 ? '房间已创建，等待对手加入…' : '正在连接房主，等待同步棋局…'}
          </div>
          {roomCodeField}
          {linkField}
          <p className="online-note">
            {seat === 1
              ? '把房间码或链接发给对手；对手加入后会自动开局。'
              : '确认对手已经创建了同一房间码；连上后会直接进入对局。'}
          </p>
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              离开房间
            </button>
          </div>
        </>
      )}

      {phase === 'playing' && (
        <>
          <div className="online-status">
            <span className="online-dot is-on" />
            对局进行中
          </div>
          {roomCodeField}
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              离开房间
            </button>
          </div>
        </>
      )}

      {phase === 'left' && (
        <>
          <div className="online-status">
            <span className="online-dot" />
            对手已离开
          </div>
          {roomCodeField}
          {linkField}
          <p className="online-note">{notice ?? '房间仍然开着，等对手用同一房间码重新加入即可续局。'}</p>
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              离开房间
            </button>
          </div>
        </>
      )}

      {phase === 'error' && (
        <>
          <p className="online-error">{error ?? '联机出错了，请重试。'}</p>
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              返回
            </button>
          </div>
        </>
      )}
    </div>
  );
}
