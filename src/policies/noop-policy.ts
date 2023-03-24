import type { Policy } from '../types.ts';

/**
 * Minimal sample policy for demonstration purposes.
 * Allows all events through.
 */
const noopPolicy: Policy = (msg) => ({
  id: msg.event.id,
  action: 'accept',
  msg: '',
});

export default noopPolicy;
