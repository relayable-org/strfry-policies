import type { Policy } from '../types.ts';

const HELLTHREAD_LIMIT = Number(Deno.env.get('HELLTHREAD_LIMIT') || 100);

/** Reject messages that tag too many participants. */
const hellthreadPolicy: Policy = (msg) => {
  if (msg.event.kind === 1) {
    const p = msg.event.tags.filter((tag) => tag[0] === 'p');

    if (p.length > HELLTHREAD_LIMIT) {
      return {
        id: msg.event.id,
        action: 'reject',
        msg: `Event rejected due to ${p.length} "p" tags (${HELLTHREAD_LIMIT} is the limit).`,
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
