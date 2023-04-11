import { type Filter, matchFilter } from '../deps.ts';
import { Policy } from '../types.ts';

/**
 * Reject all events which don't match the filter.
 *
 * Only messages which **match** the filter are allowed, and all others are dropped.
 * The filter is a [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) relay filter.
 *
 * @example
 * ```ts
 * // Only allow kind 1, 3, 5, and 7 events.
 * filterPolicy(msg, { kinds: [0, 1, 3, 5, 7] });
 * ```
 */
const filterPolicy: Policy<Filter> = ({ event }, filter = {}) => {
  if (matchFilter(filter, event)) {
    return {
      id: event.id,
      action: 'accept',
      msg: '',
    };
  }

  return {
    id: event.id,
    action: 'reject',
    msg: 'blocked: the event doesn\'t match the allowed filters',
  };
};

export default filterPolicy;

export type { Filter };
