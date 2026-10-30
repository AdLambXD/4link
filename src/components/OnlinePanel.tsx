import { useState } from 'react';
import type { OnlineMethod, OnlinePhase } from '../hooks/useOnlineGame';
import { useI18n } from '../i18n';
import {
  ONLINE_ERROR_KEYS,
  ONLINE_NOTICE_KEYS,
  type OnlineError,
  type OnlineNotice,
} from '../net/labels';
import { ROOM_CODE_LENGTH, roomCodeFromUrl, type Seat } from '../net/protocol';

export interface OnlinePanelProps {
  phase: OnlinePhase;
  code: string | null;
  link: string | null;
  seat: Seat | null;
  error: OnlineError | null;
  errorDetail: string | null;
  notice: OnlineNotice | null;
  /** 玩家选择的连接方式。 */
  method: OnlineMethod;
  relayUrl: string;
  /** 构建时内置的中继地址，用作占位提示。 */
  defaultRelayUrl: string;
  onMethodChange: (method: OnlineMethod) => void;
  onRelayUrlChange: (url: string) => void;
  onHost: () => void;
  onJoin: (code: string) => void;
  onLeave: () => void;
  onResync: () => void;
}

type CopyState = 'idle' | 'ok' | 'fail';

function relayHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function OnlinePanel({
  phase,
  code,
  link,
  seat,
  error,
  errorDetail,
  notice,
  method,
  relayUrl,
  defaultRelayUrl,
  onMethodChange,
  onRelayUrlChange,
  onHost,
  onJoin,
  onLeave,
  onResync,
}: OnlinePanelProps) {
  const { t } = useI18n();
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
      <span className="online-room-label">{t('online.codeLabel')}</span>
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
        aria-label={t('online.shareLink')}
      />
      <button type="button" className="online-copy" onClick={copyLink}>
        {copyState === 'ok'
          ? t('online.copied')
          : copyState === 'fail'
            ? t('online.copyManual')
            : t('online.copyLink')}
      </button>
    </div>
  ) : null;

  const noticeText = notice ? t(ONLINE_NOTICE_KEYS[notice]) : null;
  const errorText = error
    ? t(ONLINE_ERROR_KEYS[error], { detail: errorDetail ?? '' })
    : t('online.errorFallback');

  /* 连上之后只展示实际在用的路径，避免玩家以为还在直连。 */
  const pathLine =
    method === 'relay'
      ? t('online.usingRelay', { host: relayHost(relayUrl) })
      : t('online.usingDirect');

  const methodPicker = (
    <div className="online-methods">
      <span className="online-method-label">{t('online.methodHeading')}</span>
      <div className="choices choices-2">
        <button
          type="button"
          className={`choice choice-compact${method === 'direct' ? ' is-on' : ''}`}
          onClick={() => onMethodChange('direct')}
        >
          <span className="choice-main">{t('online.method.direct')}</span>
          <span className="choice-note">{t('online.method.directNote')}</span>
        </button>
        <button
          type="button"
          className={`choice choice-compact${method === 'relay' ? ' is-on' : ''}`}
          onClick={() => onMethodChange('relay')}
        >
          <span className="choice-main">{t('online.method.relay')}</span>
          <span className="choice-note">{t('online.method.relayNote')}</span>
        </button>
      </div>
      <p className="online-note">
        {method === 'direct'
          ? t('online.method.directHint')
          : t('online.method.relayHint')}
      </p>
      {method === 'relay' && (
        <>
          <div className="online-field">
            <input
              className="online-input online-link"
              value={relayUrl}
              onChange={(event) => onRelayUrlChange(event.currentTarget.value)}
              placeholder={defaultRelayUrl || t('online.relayUrlPlaceholder')}
              aria-label={t('online.relayUrl')}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <p className="online-note">{t('online.relayUrlHint')}</p>
        </>
      )}
    </div>
  );

  return (
    <div className="online-panel">
      {phase === 'idle' && (
        <>
          {methodPicker}

          <div className="choices choices-2">
            <button type="button" className="choice choice-compact" onClick={onHost}>
              <span className="choice-main">{t('online.host')}</span>
              <span className="choice-note">{t('online.hostNote')}</span>
            </button>
            <button
              type="button"
              className={`choice choice-compact${joining ? ' is-on' : ''}`}
              onClick={() => setJoining((value) => !value)}
            >
              <span className="choice-main">{t('online.join')}</span>
              <span className="choice-note">{t('online.joinNote')}</span>
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
                placeholder={t('online.codePlaceholder')}
                autoFocus
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                aria-label={t('online.codeLabel')}
              />
              <button
                type="button"
                className="online-copy"
                onClick={submitJoin}
                disabled={input.length !== ROOM_CODE_LENGTH}
              >
                {t('online.joinAction')}
              </button>
            </div>
          )}

          <p className="online-note">{t('online.note.idle')}</p>
        </>
      )}

      {phase === 'connecting' && (
        <>
          <div className="online-status">
            <span className="online-dot is-busy" />
            {t('online.connecting')}
          </div>
          {roomCodeField}
          <p className="online-note">{pathLine}</p>
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              {t('online.cancel')}
            </button>
          </div>
        </>
      )}

      {phase === 'waiting' && (
        <>
          <div className="online-status">
            <span className="online-dot is-busy" />
            {noticeText ??
              (seat === 1 ? t('online.waitingHost') : t('online.waitingGuest'))}
          </div>
          {roomCodeField}
          {linkField}
          <p className="online-note">
            {seat === 1 ? t('online.note.waitingHost') : t('online.note.waitingGuest')}
          </p>
          <p className="online-note">{pathLine}</p>
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              {t('online.leave')}
            </button>
          </div>
        </>
      )}

      {phase === 'syncing' && (
        <>
          <div className="online-status">
            <span className="online-dot is-busy" />
            {noticeText ?? t('online.syncing')}
          </div>
          {roomCodeField}
          <p className="online-note">{t('online.note.syncing')}</p>
          <p className="online-note">{pathLine}</p>
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onResync}>
              {t('online.resync')}
            </button>
            <button type="button" className="btn-line" onClick={onLeave}>
              {t('online.leave')}
            </button>
          </div>
        </>
      )}

      {phase === 'playing' && (
        <>
          <div className="online-status">
            <span className="online-dot is-on" />
            {t('online.playing')}
          </div>
          {roomCodeField}
          <p className="online-note">{pathLine}</p>
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              {t('online.leave')}
            </button>
          </div>
        </>
      )}

      {phase === 'left' && (
        <>
          <div className="online-status">
            <span className="online-dot" />
            {t('online.left')}
          </div>
          {roomCodeField}
          {linkField}
          <p className="online-note">{noticeText ?? t('online.note.left')}</p>
          <p className="online-note">{pathLine}</p>
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              {t('online.leave')}
            </button>
          </div>
        </>
      )}

      {phase === 'error' && (
        <>
          <p className="online-error">{errorText}</p>
          <div className="online-actions">
            <button type="button" className="btn-line" onClick={onLeave}>
              {t('online.back')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
