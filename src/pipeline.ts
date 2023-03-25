import { InputMessage, OutputMessage, Policy } from './types.ts';

/** A policy function with opts to run it with. Used by the pipeline. */
type PolicyTuple<P extends Policy = Policy> = [policy: P, opts?: InferPolicyOpts<P>];
/** Infer opts from the policy. */
type InferPolicyOpts<P> = P extends Policy<infer Opts> ? Opts : never;

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
function toTuple<P extends Policy>(item: PolicyTuple<P> | P): PolicyTuple<P> {
  return typeof item === 'function' ? [item] : item;
}

export default pipeline;

export type { PolicyTuple };
