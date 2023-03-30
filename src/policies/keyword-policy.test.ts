import { assertEquals } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import keywordPolicy from './keyword-policy.ts';

Deno.test('blocks banned pubkeys', async () => {
  const words = ['https://t.me/spam', 'hello world'];

  const msg0 = buildInputMessage();
  const msg1 = buildInputMessage({ event: buildEvent({ content: '🔥🔥🔥 https://t.me/spam 我想死' }) });
  const msg2 = buildInputMessage({ event: buildEvent({ content: 'hElLo wOrLd!' }) });

  assertEquals((await keywordPolicy(msg0, words)).action, 'accept');
  assertEquals((await keywordPolicy(msg1, words)).action, 'reject');
  assertEquals((await keywordPolicy(msg1, [])).action, 'accept');
  assertEquals((await keywordPolicy(msg2, words)).action, 'reject');
});
