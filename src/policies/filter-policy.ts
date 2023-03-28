import { Policy } from '../types.ts';

import { Filter, matchFilter } from 'npm:nostr-tools@^1.7.4';

/** Reject all events which don't match the filter. */
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
