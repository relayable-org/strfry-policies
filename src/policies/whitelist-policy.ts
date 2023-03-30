import type { Policy } from '../types.ts';

/**
 * Allows only the listed pubkeys to post to the relay. All other events are rejected.
 * Pass an array of pubkeys or an iterable, making it efficient to load pubkeys from a large file.
 */
const whitelistPolicy: Policy<Iterable<string>> = ({ event: { id, pubkey } }, pubkeys = []) => {
  for (const p of pubkeys) {
    if (p === pubkey) {
      return {
        id,
        action: 'accept',
        msg: '',
      };
    }
  }

  return {
    id,
    action: 'reject',
    msg: 'blocked: only certain pubkeys are allowed to post',
  };
};

export default whitelistPolicy;
