import { connectLocal } from './local';
import { RelayError, connectRelay, normalizeRelayUrl } from './relay';
import { connectTrystero } from './trystero';
import type { ConnectOptions, Transport, TransportHandlers } from './transport';

/** 按策略选择传输实现。 */
export async function connect(
  options: ConnectOptions,
  handlers: TransportHandlers,
): Promise<Transport> {
  if (options.strategy === 'local') return connectLocal(options, handlers);

  if (options.strategy === 'relay') {
    const relayUrl = normalizeRelayUrl(options.relayUrl);
    if (!relayUrl) throw new RelayError('bad-url', 'invalid relay url');
    return connectRelay({ ...options, relayUrl }, handlers);
  }

  return connectTrystero(options, handlers);
}
