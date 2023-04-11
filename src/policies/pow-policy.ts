import { nip13 } from '../deps.ts';

import type { Policy } from '../types.ts';

/** Policy options for `powPolicy`. */
interface POW {
  /** Events will be rejected if their `id` does not contain at least this many leading 0 bits. Default: `1` */
  difficulty?: number;
}

/** Reject events which don't meet Proof-of-Work ([NIP-13](https://github.com/nostr-protocol/nips/blob/master/13.md)) criteria. */
const powPolicy: Policy<POW> = ({ event }, opts = {}) => {
  const { difficulty = 1 } = opts;

  const pow = nip13.getPow(event.id);
  const nonce = event.tags.find((t) => t[0] === 'nonce');

  if (pow >= difficulty && nonce && Number(nonce[2]) >= difficulty) {
    return {
      id: event.id,
      action: 'accept',
      msg: '',
    };
  }

  return {
    id: event.id,
    action: 'reject',
    msg: `pow: insufficient proof-of-work (difficulty ${difficulty})`,
  };
};

export default powPolicy;
