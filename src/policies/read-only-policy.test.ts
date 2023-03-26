import { assertEquals } from '../deps.ts';
import { buildInputMessage } from '../test.ts';

import readOnlyPolicy from './read-only-policy.ts';

Deno.test('always rejects', async () => {
  const msg = buildInputMessage();
  const result = await readOnlyPolicy(msg);
  assertEquals(result.action, 'reject');
});
