#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"
import {
  antiDuplicationPolicy,
  hellthreadPolicy,
  noopPolicy,
  pipeline,
  pubkeyBanPolicy,
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
    [pubkeyBanPolicy, ['e810fafa1e89cdf80cced8e013938e87e21b699b24c8570537be92aec4b12c18']],
  ]);

  writeStdout(result);
}
