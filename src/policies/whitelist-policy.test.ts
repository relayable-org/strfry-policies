import { assertEquals } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import whitelistPolicy from './whitelist-policy.ts';

Deno.test('allows only whitelisted pubkeys', async () => {
  const msgA = buildInputMessage({ event: buildEvent({ pubkey: 'A' }) });
  const msgB = buildInputMessage({ event: buildEvent({ pubkey: 'B' }) });
  const msgC = buildInputMessage({ event: buildEvent({ pubkey: 'C' }) });

  assertEquals((await whitelistPolicy(msgA, [])).action, 'reject');
  assertEquals((await whitelistPolicy(msgA, ['A'])).action, 'accept');
  assertEquals((await whitelistPolicy(msgC, ['B', 'A'])).action, 'reject');
  assertEquals((await whitelistPolicy(msgB, ['B', 'A'])).action, 'accept');
});
