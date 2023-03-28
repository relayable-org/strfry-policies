import { Policy } from '../types.ts';

/**
 * Ban individual pubkeys from publishing events to the relay.
 * Pass an array of pubkeys or an iterable, making it efficient to load pubkeys from a large file.
 */
const pubkeyBanPolicy: Policy<Iterable<string>> = ({ event: { id, pubkey } }, pubkeys = []) => {
  let isMatch = false;

  for (const p of pubkeys) {
    if (p === pubkey) {
      isMatch = true;
      break;
    }
  }

  if (isMatch) {
    return {
      id,
      action: 'reject',
      msg: 'blocked: pubkey is banned.',
    };
  }

  return {
    id,
    action: 'accept',
    msg: '',
  };
};

export default pubkeyBanPolicy;
