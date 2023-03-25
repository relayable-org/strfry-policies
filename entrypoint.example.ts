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

for await (const msg of readStdin()) {
  const result = await pipeline(msg, [
    noopPolicy,
    [hellthreadPolicy, { limit: 100 }],
    [antiDuplicationPolicy, { ttl: 60000, minLength: 50 }],
    [rateLimitPolicy, { whitelist: ['127.0.0.1'] }],
  ]);

  writeStdout(result);
}
