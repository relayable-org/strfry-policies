import { InputMessage, OutputMessage, Policy } from './types.ts';

/** A policy function with opts to run it with. Used by the pipeline. */
type PolicyTuple<Opts = unknown> = [policy: Policy<Opts>, opts?: Opts];

/** Helper type for proper type inference of PolicyTuples in the pipeline. */
// https://stackoverflow.com/a/75806165
// https://stackoverflow.com/a/54608401
type PolicySpread<T extends any[]> = {
  [K in keyof T]: PolicyTuple<T[K]> | Policy<T[K]>;
};

/** Processes messages through multiple policies, bailing early on rejection. */
async function pipeline<T extends any[]>(msg: InputMessage, policies: [...PolicySpread<T>]): Promise<OutputMessage> {
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
