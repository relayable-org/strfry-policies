import type { Policy } from '../types.ts';

interface Hellthread {
  /** Total number of "p" tags a kind 1 note may have before it's rejected. Default: `100`  */
  limit?: number;
}

/** Reject messages that tag too many participants. */
const hellthreadPolicy: Policy<Hellthread> = (msg, opts) => {
  const limit = opts?.limit ?? 100;

  if (msg.event.kind === 1) {
    const p = msg.event.tags.filter((tag) => tag[0] === 'p');

    if (p.length > limit) {
      return {
        id: msg.event.id,
        action: 'reject',
        msg: `Event rejected due to ${p.length} "p" tags (${limit} is the limit).`,
      };
    }
  }

  return {
    id: msg.event.id,
    action: 'accept',
    msg: '',
  };
};

export default hellthreadPolicy;

export type { Hellthread };
