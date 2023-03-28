#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"
import {
  antiDuplicationPolicy,
  filterPolicy,
  hellthreadPolicy,
  keywordPolicy,
  noopPolicy,
  pipeline,
  pubkeyBanPolicy,
  rateLimitPolicy,
  readStdin,
  regexPolicy,
  writeStdout,
} from './mod.ts';

for await (const msg of readStdin()) {
  const result = await pipeline(msg, [
    noopPolicy,
    [filterPolicy, { kinds: [0, 1, 3, 5, 7, 1984, 9734, 9735, 10002] }],
    [keywordPolicy, ['https://t.me/']],
    [regexPolicy, /(🟠|🔥|😳)ChtaGPT/i],
    [pubkeyBanPolicy, ['e810fafa1e89cdf80cced8e013938e87e21b699b24c8570537be92aec4b12c18']],
    [hellthreadPolicy, { limit: 100 }],
    [rateLimitPolicy, { whitelist: ['127.0.0.1'] }],
    [antiDuplicationPolicy, { ttl: 60000, minLength: 50 }],
  ]);

  writeStdout(result);
}
