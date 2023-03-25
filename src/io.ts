import { readLines } from './deps.ts';

import type { InputMessage, OutputMessage } from './types.ts';

/**
 * Parse strfy messages from stdin.
 * strfry may batch multiple messages at once.
 */
async function* readStdin(): AsyncGenerator<InputMessage> {
  for await (const line of readLines(Deno.stdin)) {
    yield JSON.parse(line);
  }
}

/** Writes the output message to stdout. */
function writeStdout(msg: OutputMessage): void {
  console.log(JSON.stringify(msg));
}

export { readStdin, writeStdout };
