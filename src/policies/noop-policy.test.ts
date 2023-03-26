import { assert } from '../deps.ts';
import { buildInputMessage } from '../test.ts';

import noopPolicy from './noop-policy.ts';

Deno.test('allows events', async () => {
  const msg = buildInputMessage();
  assert((await noopPolicy(msg)).action === 'accept');
});
