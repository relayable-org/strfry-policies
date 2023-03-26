import { assertEquals } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import regexPolicy from './regex-policy.ts';

Deno.test('blocks banned regular expressions', async () => {
  const msg = buildInputMessage({ event: buildEvent({ content: '🔥🔥🔥 https://t.me/spam 我想死' }) });

  assertEquals((await regexPolicy(msg)).action, 'accept');
  assertEquals((await regexPolicy(msg, /https:\/\/t\.me\/\w+/i)).action, 'reject');
  assertEquals((await regexPolicy(msg, /🔥{1,3}/)).action, 'reject');
  assertEquals((await regexPolicy(msg, /🔥{4}/)).action, 'accept');
  assertEquals((await regexPolicy(msg, /🔥$/)).action, 'accept');
  assertEquals((await regexPolicy(msg, /^🔥/)).action, 'reject');
});
