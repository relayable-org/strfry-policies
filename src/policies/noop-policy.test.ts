import { assertEquals } from '../deps.ts';
import { buildInputMessage } from '../test.ts';

import noopPolicy from './noop-policy.ts';

Deno.test('allows events', async () => {
  const msg = buildInputMessage();
  assertEquals((await noopPolicy(msg)).action, 'accept');
});
