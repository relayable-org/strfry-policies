import { assertEquals } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import filterPolicy from './filter-policy.ts';

Deno.test('only allows events that match the filter', async () => {
  const msg0 = buildInputMessage({ event: buildEvent({ kind: 0 }) });
  const msg1 = buildInputMessage({ event: buildEvent({ kind: 1 }) });

  assertEquals((await filterPolicy(msg0, { kinds: [1] })).action, 'reject');
  assertEquals((await filterPolicy(msg1, { kinds: [1] })).action, 'accept');
  assertEquals((await filterPolicy(msg1, { kinds: [1], authors: [] })).action, 'reject');
});
