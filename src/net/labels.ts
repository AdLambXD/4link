import type { StringKey } from '../i18n';

/** 房间状态里需要展示给用户的提示（具体文案由 i18n 字典决定）。 */
export type OnlineNotice =
  | 'syncing'
  | 'peerLeft'
  | 'peerLeftWaiting'
  | 'probe'
  | 'kickedFull'
  | 'syncTimeout'
  | 'resyncing';

/** 联机错误码。 */
export type OnlineError = 'roomFull' | 'invalidCode' | 'connect' | 'signal';

export const ONLINE_NOTICE_KEYS: Record<OnlineNotice, StringKey> = {
  syncing: 'online.notice.syncing',
  peerLeft: 'online.notice.peerLeft',
  peerLeftWaiting: 'online.notice.peerLeftWaiting',
  probe: 'online.notice.probe',
  kickedFull: 'online.notice.kickedFull',
  syncTimeout: 'online.notice.syncTimeout',
  resyncing: 'online.notice.resyncing',
};

export const ONLINE_ERROR_KEYS: Record<OnlineError, StringKey> = {
  roomFull: 'online.error.roomFull',
  invalidCode: 'online.error.invalidCode',
  connect: 'online.error.connect',
  signal: 'online.error.signal',
};
