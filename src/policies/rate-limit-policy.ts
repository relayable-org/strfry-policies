import { Keydb } from '../deps.ts';

import type { Policy } from '../types.ts';

const IP_WHITELIST = (Deno.env.get('IP_WHITELIST') || '').split(',');

const RATE_LIMIT_INTERVAL = Number(Deno.env.get('RATE_LIMIT_INTERVAL') || 60000);
const RATE_LIMIT_MAX = Number(Deno.env.get('RATE_LIMIT_MAX') || 10);

/**
 * Rate-limits users by their IP address.
 * IPs are stored in an SQLite database. If you are running internal services,
 * it's a good idea to at least whitelist `127.0.0.1` etc.
 */
const rateLimitPolicy: Policy = async (msg) => {
  if ((msg.sourceType === 'IP4' || msg.sourceType === 'IP6') && !IP_WHITELIST.includes(msg.sourceInfo)) {
    const db = new Keydb('sqlite:///tmp/strfry-rate-limit-policy.sqlite3');
    const count = await db.get<number>(msg.sourceInfo) || 0;
    await db.set(msg.sourceInfo, count + 1, RATE_LIMIT_INTERVAL);

    if (count >= RATE_LIMIT_MAX) {
      return {
        id: msg.event.id,
        action: 'reject',
        msg: 'Rate-limited.',
      };
    }
  }

  return {
    id: msg.event.id,
    action: 'accept',
    msg: '',
  };
};

export default rateLimitPolicy;
