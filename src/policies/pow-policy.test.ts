import { assertEquals } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import powPolicy from './pow-policy.ts';

Deno.test('blocks events without a nonce', async () => {
  const msg = buildInputMessage();
  assertEquals((await powPolicy(msg)).action, 'reject');
});

Deno.test('accepts event with sufficient POW', async () => {
  const msg = buildInputMessage({
    event: buildEvent({
      id: '000006d8c378af1779d2feebc7603a125d99eca0ccf1085959b307f64e5dd358',
      tags: [['nonce', '776797', '20']],
    }),
  });

  assertEquals((await powPolicy(msg, { difficulty: 20 })).action, 'accept');
});
