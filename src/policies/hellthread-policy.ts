#!/usr/bin/env -S deno run
import { readLines } from 'https://deno.land/std@0.178.0/io/mod.ts';

import type { InputMessage, OutputMessage } from '../types.ts';

const HELLTHREAD_LIMIT = Number(Deno.env.get('HELLTHREAD_LIMIT') || 100);

function handleMessage(msg: InputMessage): OutputMessage {
  if (msg.event.kind === 1) {
    const p = msg.event.tags.filter((tag) => tag[0] === 'p');

    if (p.length > HELLTHREAD_LIMIT) {
      return {
        id: msg.event.id,
        action: 'reject',
        msg: `Event rejected due to ${p.length} "p" tags (${HELLTHREAD_LIMIT} is the limit).`,
      };
    }
  }

  return {
    id: msg.event.id,
    action: 'accept',
    msg: '',
  };
}

for await (const line of readLines(Deno.stdin)) {
  console.log(JSON.stringify(handleMessage(JSON.parse(line))));
}
