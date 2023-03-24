#!/usr/bin/env -S deno run
import { readLines } from 'https://deno.land/std@0.178.0/io/mod.ts';

interface InputMessage {
  type: 'new' | 'lookback';
  event: Event;
  receivedAt: number;
  sourceType: 'IP4' | 'IP6' | 'Import' | 'Stream' | 'Sync';
  sourceInfo: string;
}

interface OutputMessage {
  id: string;
  action: 'accept' | 'reject' | 'shadowReject';
  msg: string;
}

interface Event {
  id: string;
  sig: string;
  kind: number;
  tags: string[][];
  pubkey: string;
  content: string;
  created_at: number;
}

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
