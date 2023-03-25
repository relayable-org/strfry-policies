import { InputMessage, OutputMessage, Policy } from './types.ts';

type PolicyTuple<Opts = any> = [policy: Policy<Opts>, opts?: Opts];

type PolicyTuplesRest<T extends PolicyTuple[]> = {
  [K in keyof T]: PolicyTuple<T[K]>
}

/** Processes messages through multiple policies, bailing early on rejection. */
async function pipeline<P extends any[]>(msg: InputMessage, policies: [...PolicyTuplesRest<P>]): Promise<OutputMessage> {
  for (const tuple of policies) {
    const [policy, opts] = tuple;
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

export default pipeline;
