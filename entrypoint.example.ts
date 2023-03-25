#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"
import {
  antiDuplicationPolicy,
  hellthreadPolicy,
  noopPolicy,
  pipeline,
  rateLimitPolicy,
  readStdin,
  writeStdout,
} from './mod.ts';

const msg = await readStdin();

const result = await pipeline(msg, [
  [noopPolicy],
  [hellthreadPolicy, { limit: 100 }],
  [antiDuplicationPolicy],
  [rateLimitPolicy],
]);

writeStdout(result);
