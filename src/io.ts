import { readLines } from './deps.ts';

import type { InputMessage, OutputMessage } from './types.ts';

/**
 * Get the first line from stdin.
 * Can only be read ONCE, or else it returns undefined.
 */
async function readStdin(): Promise<InputMessage> {
  const { value } = await readLines(Deno.stdin).next();
  return JSON.parse(value);
}

/** Writes the output message to stdout. */
function writeStdout(msg: OutputMessage): void {
  console.log(JSON.stringify(msg));
}

export { readStdin, writeStdout };
