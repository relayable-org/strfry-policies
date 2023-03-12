#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"
import { readLines } from 'https://deno.land/std@0.178.0/io/mod.ts';
import { Keydb } from 'https://deno.land/x/keydb@1.0.0/sqlite.ts';

const ANTI_DUPLICATION_TTL = Number(Deno.env.get('ANTI_DUPLICATION_TTL') || 60000);
const ANTI_DUPLICATION_MIN_LENGTH = Number(Deno.env.get('ANTI_DUPLICATION_MIN_LENGTH') || 50);

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

/** https://stackoverflow.com/a/8831937 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

async function handleMessage(msg: InputMessage): Promise<OutputMessage> {
  const { kind, content } = msg.event;

  if (kind === 1 && content.length >= ANTI_DUPLICATION_MIN_LENGTH) {
    const db = new Keydb('sqlite:///tmp/strfry-anti-duplication-policy.sqlite3');
    const hash = String(hashCode(content));

    if (await db.get(hash)) {
      await db.set(hash, 1, ANTI_DUPLICATION_TTL);
      return {
        id: msg.event.id,
        action: 'shadowReject',
        msg: '',
      };
    }

    await db.set(hash, 1, ANTI_DUPLICATION_TTL);
  }

  return {
    id: msg.event.id,
    action: 'accept',
    msg: '',
  };
}

for await (const line of readLines(Deno.stdin)) {
  console.log(JSON.stringify(await handleMessage(JSON.parse(line))));
}
