import type { Policy } from '../types.ts';

/** Policy options for `hellthreadPolicy`. */
interface Hellthread {
  /** Total number of "p" tags a kind 1 note may have before it's rejected. Default: `100` */
  limit?: number;
}

/**
 * Reject messages that tag too many participants.
 *
 * This policy is useful to prevent unwanted notifications by limiting the number of "p" tags a kind 1 event may have.
 * Only kind 1 events are impacted by this policy, since kind 3 events will commonly exceed this number.
 *
 * @example
 * ```ts
 * // Reject events with more than 15 mentions.
 * hellthreadPolicy(msg, { limit: 15 });
 * ```
 */
const hellthreadPolicy: Policy<Hellthread> = (msg, opts) => {
  const limit = opts?.limit ?? 100;

  if (msg.event.kind === 1) {
    const p = msg.event.tags.filter((tag) => tag[0] === 'p');

    if (p.length > limit) {
      return {
        id: msg.event.id,
        action: 'reject',
        msg: `blocked: rejected due to ${p.length} "p" tags (${limit} is the limit).`,
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
