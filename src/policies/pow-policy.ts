import { secp } from '../deps.ts';

import type { Policy } from '../types.ts';

/** Policy options for `powPolicy`. */
interface POW {
  /** Events will be rejected if their `id` does not contain at least this many leading `0`'s. Default: `1` */
  difficulty?: number;
}

/** Reject events which don't meet Proof-of-Work ([NIP-13](https://github.com/nostr-protocol/nips/blob/master/13.md)) criteria. */
const powPolicy: Policy<POW> = ({ event }, opts = {}) => {
  const { difficulty = 1 } = opts;

  const pow = getPow(event.id);
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

/** Get POW difficulty from a Nostr hex ID. */
function getPow(id: string): number {
  return getLeadingZeroBits(secp.utils.hexToBytes(id));
}

/**
 * Get number of leading 0 bits. Adapted from nostream.
 * https://github.com/Cameri/nostream/blob/fb6948fd83ca87ce552f39f9b5eb780ea07e272e/src/utils/proof-of-work.ts
 */
function getLeadingZeroBits(hash: Uint8Array): number {
  let total: number, i: number, bits: number;

  for (i = 0, total = 0; i < hash.length; i++) {
    bits = msb(hash[i]);
    total += bits;
    if (bits !== 8) {
      break;
    }
  }
  return total;
}

/**
 * Adapted from nostream.
 * https://github.com/Cameri/nostream/blob/fb6948fd83ca87ce552f39f9b5eb780ea07e272e/src/utils/proof-of-work.ts
 */
function msb(b: number) {
  let n = 0;

  if (b === 0) {
    return 8;
  }

  // deno-lint-ignore no-cond-assign
  while (b >>= 1) {
    n++;
  }

  return 7 - n;
}

export default powPolicy;
