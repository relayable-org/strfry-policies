import { readLines } from './deps.ts';

import type { InputMessage } from './types.ts';

/**
 * Get the first line from stdin.
 * Can only be read ONCE, or else it returns undefined.
 */
async function readStdin(): Promise<InputMessage> {
  const { value } = await readLines(Deno.stdin).next();
  return JSON.parse(value);
}

export { readStdin };
