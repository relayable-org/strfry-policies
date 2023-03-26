import { assertEquals } from './deps.ts';

import pipeline from './pipeline.ts';
import noopPolicy from './policies/noop-policy.ts';
import readOnlyPolicy from './policies/read-only-policy.ts';
import { buildInputMessage } from './test.ts';

Deno.test('passes events through multiple policies', async () => {
  const msg = buildInputMessage();

  const result = await pipeline(msg, [
    noopPolicy,
    readOnlyPolicy,
  ]);

  assertEquals(result.action, 'reject');
  assertEquals(result.msg, 'The relay is read-only.');
});

Deno.test('short-circuits on the first reject', async () => {
  const msg = buildInputMessage();

  const result = await pipeline(msg, [
    readOnlyPolicy,
    noopPolicy,
  ]);

  assertEquals(result.action, 'reject');
  assertEquals(result.msg, 'The relay is read-only.');
});

Deno.test('accepts when all policies accept', async () => {
  const msg = buildInputMessage();

  const result = await pipeline(msg, [
    noopPolicy,
    noopPolicy,
    noopPolicy,
  ]);

  assertEquals(result.action, 'accept');
});
