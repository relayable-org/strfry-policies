import { assert } from '../deps.ts';

import readOnlyPolicy from './read-only-policy.ts';

Deno.test('always rejects', async () => {
  const result = await readOnlyPolicy({
    event: {
      kind: 1,
      id: '',
      content: '',
      created_at: 0,
      pubkey: '',
      sig: '',
      tags: [],
    },
    receivedAt: 0,
    sourceInfo: '127.0.0.1',
    sourceType: 'IP4',
    type: 'new',
  });

  assert(result.action === 'reject');
});
