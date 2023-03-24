import type { Policy } from '../types.ts';

/** This policy rejects all messages. */
const readOnlyPolicy: Policy = (msg) => ({
  id: msg.event.id,
  action: 'reject',
  msg: 'The relay is read-only.',
});

export default readOnlyPolicy;
