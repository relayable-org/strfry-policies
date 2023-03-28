import type { Policy } from '../types.ts';

/** This policy rejects all messages. */
const readOnlyPolicy: Policy<void> = (msg) => ({
  id: msg.event.id,
  action: 'reject',
  msg: 'blocked: the relay is read-only',
});

export default readOnlyPolicy;
