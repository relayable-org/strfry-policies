import { Keydb } from '../deps.ts';

import type { Policy } from '../types.ts';

const ANTI_DUPLICATION_TTL = Number(Deno.env.get('ANTI_DUPLICATION_TTL') || 60000);
const ANTI_DUPLICATION_MIN_LENGTH = Number(Deno.env.get('ANTI_DUPLICATION_MIN_LENGTH') || 50);

/**
 * Prevent messages with the exact same content from being submitted repeatedly.
 * It stores a hashcode for each content in an SQLite database and rate-limits them.
 * Only messages that meet the minimum length criteria are selected.
 */
const antiDuplicationPolicy: Policy = async (msg) => {
  const { kind, content } = msg.event;

  if (kind === 1 && content.length >= ANTI_DUPLICATION_MIN_LENGTH) {
    const db = new Keydb('sqlite:///tmp/strfry-anti-duplication-policy.sqlite3');
    const hash = String(hashCode(content));

    if (await db.get(hash)) {
      await db.set(hash, 1, ANTI_DUPLICATION_TTL);
      return {
        id: msg.event.id,
        action: 'shadowReject',
        msg: '',
      };
    }

    await db.set(hash, 1, ANTI_DUPLICATION_TTL);
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
