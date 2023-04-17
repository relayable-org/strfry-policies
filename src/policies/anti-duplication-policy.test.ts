import { assertEquals } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import antiDuplicationPolicy from './anti-duplication-policy.ts';

Deno.test({
  name: 'blocks events that post the same content too quickly',
  fn: async () => {
    const content = 'Spicy peppermint apricot mediterranean ginger carrot spiced juice edamame hummus';

    const msg1 = buildInputMessage({ event: buildEvent({ content }) });

    assertEquals((await antiDuplicationPolicy(msg1)).action, 'accept');
    assertEquals((await antiDuplicationPolicy(msg1)).action, 'shadowReject');
    assertEquals((await antiDuplicationPolicy(msg1)).action, 'shadowReject');

    const msg2 = buildInputMessage({ event: buildEvent({ content: 'a' }) });

    assertEquals((await antiDuplicationPolicy(msg2)).action, 'accept');
    assertEquals((await antiDuplicationPolicy(msg2)).action, 'accept');
    assertEquals((await antiDuplicationPolicy(msg2)).action, 'accept');
  },
  sanitizeResources: false,
});
