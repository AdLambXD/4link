import { connectLocal } from './local';
import { connectTrystero } from './trystero';
import type { ConnectOptions, Transport, TransportHandlers } from './transport';

/** 按策略选择传输实现；正式环境只有 nostr。 */
export async function connect(
  options: ConnectOptions,
  handlers: TransportHandlers,
): Promise<Transport> {
  if (options.strategy === 'local') return connectLocal(options, handlers);
  return connectTrystero(options, handlers);
}
