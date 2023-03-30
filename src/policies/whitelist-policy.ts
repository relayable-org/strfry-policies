import type { IterablePubkeys, Policy } from '../types.ts';

/**
 * Allows only the listed pubkeys to post to the relay. All other events are rejected.

 * @example
 * ```ts
 * // Load allowed pubkeys from a text file.
 * import { readLines } from 'https://deno.land/std/io/mod.ts';
 * const pubkeys = readLines(await Deno.open('pubkeys.txt'));
 * const result = await whitelistPolicy(msg, pubkeys);
 * ```
 */
const whitelistPolicy: Policy<IterablePubkeys> = async ({ event: { id, pubkey } }, pubkeys = []) => {
  for await (const p of pubkeys) {
    if (p === pubkey) {
      return {
        id,
        action: 'accept',
        msg: '',
      };
    }
  }

  return {
    id,
    action: 'reject',
    msg: 'blocked: only certain pubkeys are allowed to post',
  };
};

export default whitelistPolicy;
