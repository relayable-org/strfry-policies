import { assertEquals } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import hellthreadPolicy from './hellthread-policy.ts';

Deno.test('blocks events with too many mentioned users', async () => {
  const tags = [['p'], ['p'], ['p']];

  const msg0 = buildInputMessage();
  const msg1 = buildInputMessage({ event: buildEvent({ tags }) });

  assertEquals((await hellthreadPolicy(msg0, { limit: 1 })).action, 'accept');
  assertEquals((await hellthreadPolicy(msg1, { limit: 1 })).action, 'reject');
});
