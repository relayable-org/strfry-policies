import { Policy } from './types.ts';

/**
 * Inverts the result of a policy. A policy which would normally accept
 * an event will now reject it, and vice-versa. shadowReject is treated
 * the same as a reject. An optional reject msg can be passed.
 */
function invert<P extends Policy<any>>(policy: P, rejectMsg = ''): P {
  const fn: Policy = async (msg, opts) => {
    const result = await policy(msg, opts);

    if (result.action === 'accept') {
      return {
        id: msg.event.id,
        action: 'reject',
        msg: rejectMsg,
      };
    }

    return {
      id: msg.event.id,
      action: 'accept',
      msg: '',
    };
  };

  return fn as P;
}

export { invert };
