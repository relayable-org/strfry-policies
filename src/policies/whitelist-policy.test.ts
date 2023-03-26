import { assert } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import whitelistPolicy from './whitelist-policy.ts';

Deno.test('allows only whitelisted pubkeys', async () => {
  const msgA = buildInputMessage({ event: buildEvent({ pubkey: 'A' }) });
  const msgB = buildInputMessage({ event: buildEvent({ pubkey: 'B' }) });
  const msgC = buildInputMessage({ event: buildEvent({ pubkey: 'C' }) });

  assert((await whitelistPolicy(msgA, [])).action === 'reject');
  assert((await whitelistPolicy(msgA, ['A'])).action === 'accept');
  assert((await whitelistPolicy(msgC, ['B', 'A'])).action === 'reject');
  assert((await whitelistPolicy(msgB, ['B', 'A'])).action === 'accept');
});
