import { InputMessage, OutputMessage, Policy } from './types.ts';

type PolicyTuple<Opts = unknown> = [policy: Policy<Opts>, opts?: Opts];

// https://stackoverflow.com/a/75806165
// https://stackoverflow.com/a/54608401
type PolicyTuplesRest<T extends PolicyTuple[]> = {
  [K in keyof T]: PolicyTuple<T[K]> | Policy<T[K]>
}

/** Processes messages through multiple policies, bailing early on rejection. */
async function pipeline<P extends any[]>(msg: InputMessage, policies: [...PolicyTuplesRest<P>]): Promise<OutputMessage> {
  for (const item of policies) {
    const [policy, opts] = toTuple(item);
    const result = await policy(msg, opts);
    if (result.action !== 'accept') {
      return result;
    }
  }

  return {
    id: msg.event.id,
    action: 'accept',
    msg: '',
  };
}

/** Coerce item into a tuple if it isn't already. */
function toTuple<T>(item: PolicyTuple<T> | Policy<T>): PolicyTuple<T> {
  return typeof item === 'function' ? [item] : item;
}

export default pipeline;
