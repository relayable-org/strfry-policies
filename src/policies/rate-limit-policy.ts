import { Keydb } from '../deps.ts';

import type { Policy } from '../types.ts';

interface RateLimit {
  /** How often (ms) to check whether `max` has been exceeded. Default: `60000` (1 minute). */
  interval?: number;
  /** Max number of requests within the `interval` until the IP is rate-limited. Default: `10`. */
  max?: number;
  /** List of IP addresses to skip this policy. */
  whitelist?: string[];
  /** Database connection string. Default: `sqlite:///tmp/strfry-rate-limit-policy.sqlite3` */
  databaseUrl?: string;
}

/**
 * Rate-limits users by their IP address.
 * IPs are stored in an SQLite database. If you are running internal services,
 * it's a good idea to at least whitelist `127.0.0.1` etc.
 */
const rateLimitPolicy: Policy<RateLimit> = async (msg, opts = {}) => {
  const {
    interval = 60000,
    max = 10,
    whitelist = [],
    databaseUrl = 'sqlite:///tmp/strfry-rate-limit-policy.sqlite3',
  } = opts;

  if ((msg.sourceType === 'IP4' || msg.sourceType === 'IP6') && !whitelist.includes(msg.sourceInfo)) {
    const db = new Keydb(databaseUrl);
    const count = await db.get<number>(msg.sourceInfo) || 0;
    await db.set(msg.sourceInfo, count + 1, interval);

    if (count >= max) {
      return {
        id: msg.event.id,
        action: 'reject',
        msg: 'rate-limited: too many requests',
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

export type { RateLimit };
