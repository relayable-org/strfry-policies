import { readLines } from './deps.ts';

import type { InputMessage, OutputMessage } from './types.ts';

/**
 * Parse strfy messages from stdin.
 * strfry may batch multiple messages at once.
 *
 * @example
 * ```ts
 * // Loop through strfry input messages
 * for await (const msg of readStdin()) {
 *   // handle `msg`
 * }
 * ```
 */
async function* readStdin(): AsyncGenerator<InputMessage> {
  for await (const line of readLines(Deno.stdin)) {
    try {
      yield JSON.parse(line);
    } catch (e) {
      console.error(line);
      throw e;
    }
  }
}

/** Writes the output message to stdout. */
function writeStdout(msg: OutputMessage): void {
  console.log(JSON.stringify(msg));
}

export { readStdin, writeStdout };
