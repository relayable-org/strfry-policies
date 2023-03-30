import { Keydb } from '../deps.ts';

import type { Policy } from '../types.ts';

interface AntiDuplication {
  /** Time in ms until a message with this content may be posted again. Default: `60000` (1 minute). */
  ttl?: number;
  /** Note text under this limit will be skipped by the policy. Default: `50`. */
  minLength?: number;
  /** Database connection string. Default: `sqlite:///tmp/strfry-anti-duplication-policy.sqlite3` */
  databaseUrl?: string;
}

/**
 * Prevent messages with the exact same content from being submitted repeatedly.
 * It stores a hashcode for each content in an SQLite database and rate-limits them.
 * Only messages that meet the minimum length criteria are selected.
 */
const antiDuplicationPolicy: Policy<AntiDuplication> = async (msg, opts = {}) => {
  const {
    ttl = 60000,
    minLength = 50,
    databaseUrl = 'sqlite:///tmp/strfry-anti-duplication-policy.sqlite3',
  } = opts;

  const { kind, content } = msg.event;

  if (kind === 1 && content.length >= minLength) {
    const db = new Keydb(databaseUrl);
    const hash = String(hashCode(content));

    if (await db.get(hash)) {
      await db.set(hash, 1, ttl);
      return {
        id: msg.event.id,
        action: 'shadowReject',
        msg: '',
      };
    }

    await db.set(hash, 1, ttl);
  }

  return {
    id: msg.event.id,
    action: 'accept',
    msg: '',
  };
};

/**
 * Get a "good enough" unique identifier for this content.
 * This algorithm was chosen because it's very fast with a low chance of collisions.
 * https://stackoverflow.com/a/8831937
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export default antiDuplicationPolicy;

export type { AntiDuplication };
