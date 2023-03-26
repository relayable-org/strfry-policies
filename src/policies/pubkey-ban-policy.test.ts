import { assert } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import pubkeyBanPolicy from './pubkey-ban-policy.ts';

Deno.test('blocks banned pubkeys', async () => {
  const msgA = buildInputMessage({ event: buildEvent({ pubkey: 'A' }) });
  const msgB = buildInputMessage({ event: buildEvent({ pubkey: 'B' }) });
  const msgC = buildInputMessage({ event: buildEvent({ pubkey: 'C' }) });

  assert((await pubkeyBanPolicy(msgA, [])).action === 'accept');
  assert((await pubkeyBanPolicy(msgA, ['A'])).action === 'reject');
  assert((await pubkeyBanPolicy(msgC, ['B', 'A'])).action === 'accept');
  assert((await pubkeyBanPolicy(msgB, ['B', 'A'])).action === 'reject');
});
