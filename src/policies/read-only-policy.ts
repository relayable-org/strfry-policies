#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"
import { readLines } from 'https://deno.land/std@0.178.0/io/mod.ts';

import type { InputMessage, OutputMessage } from '../types.ts';

function handleMessage(msg: InputMessage): OutputMessage {
  return {
    id: msg.event.id,
    action: 'reject',
    msg: 'The relay is set to read-only.',
  };
}

for await (const line of readLines(Deno.stdin)) {
  console.log(JSON.stringify(handleMessage(JSON.parse(line))));
}
