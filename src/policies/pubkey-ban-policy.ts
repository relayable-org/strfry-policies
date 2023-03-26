import { Policy } from '../types.ts';

/** Ban individual pubkeys from publishing events to the relay. */
const pubkeyPolicy: Policy<string[]> = ({ event: { id, pubkey } }, pubkeys = []) => {
  const isMatch = pubkeys.includes(pubkey);

  if (isMatch) {
    return {
      id,
      action: 'reject',
      msg: 'Pubkey is banned.',
    };
  }

  return {
    id,
    action: 'accept',
    msg: '',
  };
};

export default pubkeyPolicy;
