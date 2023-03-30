import { IterablePubkeys, Policy } from '../types.ts';

/**
 * Ban individual pubkeys from publishing events to the relay.
 *
 * @example
 * ```ts
 * // Ban a specific pubkey.
 * pubkeyBanPolicy(msg, ['e810fafa1e89cdf80cced8e013938e87e21b699b24c8570537be92aec4b12c18']);
 *
 * // Load banned pubkeys from a text file.
 * import { readLines } from 'https://deno.land/std/io/mod.ts';
 * const pubkeys = readLines(await Deno.open('pubkeys.txt'));
 * const result = await pubkeyBanPolicy(msg, pubkeys);
 * ```
 */
const pubkeyBanPolicy: Policy<IterablePubkeys> = async ({ event: { id, pubkey } }, pubkeys = []) => {
  for await (const p of pubkeys) {
    if (p === pubkey) {
      return {
        id,
        action: 'reject',
        msg: 'blocked: pubkey is banned.',
      };
    }
  }

  return {
    id,
    action: 'accept',
    msg: '',
  };
};

export default pubkeyBanPolicy;
