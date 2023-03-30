import { InputMessage, OutputMessage, Policy } from './types.ts';

/** A policy function with opts to run it with. Used by the pipeline. */
type PolicyTuple<P extends Policy = Policy> = [policy: P, opts?: InferPolicyOpts<P>];
/** Infer opts from the policy. */
type InferPolicyOpts<P> = P extends Policy<infer Opts> ? Opts : never;

/** Helper type for proper type inference of PolicyTuples. */
// https://stackoverflow.com/a/75806165
// https://stackoverflow.com/a/54608401
type Policies<T extends any[]> = {
  [K in keyof T]: PolicyTuple<T[K]> | Policy<T[K]>;
};

/**
 * Processes messages through multiple policies.
 *
 * If any policy returns a `reject` or `shadowReject` action, the pipeline will stop and return the rejected message.
 *
 * @example
 * ```ts
 * const result = await pipeline(msg, [
 *  noopPolicy,
 *  [filterPolicy, { kinds: [0, 1, 3, 5, 7, 1984, 9734, 9735, 10002] }],
 *  [keywordPolicy, ['https://t.me/']],
 *  [regexPolicy, /(🟠|🔥|😳)ChtaGPT/i],
 *  [pubkeyBanPolicy, ['e810fafa1e89cdf80cced8e013938e87e21b699b24c8570537be92aec4b12c18']],
 *  [hellthreadPolicy, { limit: 100 }],
 *  [rateLimitPolicy, { whitelist: ['127.0.0.1'] }],
 *  [antiDuplicationPolicy, { ttl: 60000, minLength: 50 }],
 * ]);
 * ```
 */
async function pipeline<T extends unknown[]>(msg: InputMessage, policies: [...Policies<T>]): Promise<OutputMessage> {
  for (const item of policies as (Policy | PolicyTuple)[]) {
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
