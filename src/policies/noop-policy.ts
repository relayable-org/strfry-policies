#!/usr/bin/env -S deno run
import { readLines } from 'https://deno.land/std@0.178.0/io/mod.ts';

import type { InputMessage, OutputMessage } from '../types.ts';

function handleMessage(msg: InputMessage): OutputMessage {
  return {
    id: msg.event.id,
    action: 'accept',
    msg: '',
  };
}

for await (const line of readLines(Deno.stdin)) {
  console.log(JSON.stringify(handleMessage(JSON.parse(line))));
}
