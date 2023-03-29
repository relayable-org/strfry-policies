import { readLines } from '../src/deps.ts';

import type { Event, InputMessage, OutputMessage } from '../mod.ts';

for await (const line of readLines(Deno.stdin)) {
  const event: Event = JSON.parse(line);

  const input: InputMessage = {
    type: 'new',
    event: event,
    receivedAt: Date.now() / 1000,
    sourceType: 'IP4',
    sourceInfo: '127.0.0.1',
  };

  const policy = Deno.run({
    cmd: Deno.args,
    stdin: 'piped',
    stdout: 'piped',
  });

  const bytes = new TextEncoder().encode(JSON.stringify(input));
  const writer = policy.stdin.writable.getWriter();

  const chunkSize = 4096;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    await writer.write(chunk);
  }

  policy.stdin.close();

  for await (const out of readLines(policy.stdout)) {
    const msg: OutputMessage = JSON.parse(out);

    if (msg.action === 'accept') {
      console.log(line);
    }

    break;
  }
}
