import { assertEquals } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import rateLimitPolicy from './rate-limit-policy.ts';

Deno.test({
  name: 'blocks events from IPs that are publishing events too quickly',
  fn: async () => {
    const opts = {
      max: 4,
      databaseUrl: `sqlite:///tmp/${crypto.randomUUID()}.sqlite3`,
    };

    const msg = buildInputMessage({ sourceType: 'IP4', sourceInfo: '1.1.1.1', event: buildEvent() });

    assertEquals((await rateLimitPolicy(msg, opts)).action, 'accept');
    assertEquals((await rateLimitPolicy(msg, opts)).action, 'accept');
    assertEquals((await rateLimitPolicy(msg, opts)).action, 'accept');
    assertEquals((await rateLimitPolicy(msg, opts)).action, 'accept');
    assertEquals((await rateLimitPolicy(msg, opts)).action, 'reject');
    assertEquals((await rateLimitPolicy(msg, opts)).action, 'reject');
    assertEquals((await rateLimitPolicy(msg, opts)).action, 'reject');
  },
  sanitizeResources: false,
});
