import { InputMessage, OutputMessage, Policy } from './types.ts';

/** Processes messages through multiple policies, bailing early on rejection. */
async function pipeline(msg: InputMessage, policies: Policy[]): Promise<OutputMessage> {
  for (const policy of policies) {
    const result = await policy(msg);
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
