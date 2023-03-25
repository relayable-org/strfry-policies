/**
 * strfry input message from stdin.
 * https://github.com/hoytech/strfry/blob/master/docs/plugins.md#input-messages
 */
interface InputMessage {
  /** Either `new` or `lookback`. */
  type: 'new' | 'lookback';
  /** The event posted by the client, with all the required fields such as `id`, `pubkey`, etc. */
  event: Event;
  /** Unix timestamp of when this event was received by the relay. */
  receivedAt: number;
  /** Where this event came from. Typically will be `IP4` or `IP6`, but in lookback can also be `Import`, `Stream`, or `Sync`. */
  sourceType: 'IP4' | 'IP6' | 'Import' | 'Stream' | 'Sync';
  /** Specifics of the event's source. Either an IP address or a relay URL (for stream/sync). */
  sourceInfo: string;
}

/**
 * strfry output message to be printed as JSONL (minified JSON followed by a newline) to stdout.
 * https://github.com/hoytech/strfry/blob/master/docs/plugins.md#output-messages
 */
interface OutputMessage {
  /** The event ID taken from the `event.id` field of the input message. */
  id: string;
  /** Either `accept`, `reject`, or `shadowReject`. */
  action: 'accept' | 'reject' | 'shadowReject';
  /** The NIP-20 response message to be sent to the client. Only used for `reject`. */
  msg: string;
}

/**
 * Nostr event.
 * https://github.com/nostr-protocol/nips/blob/master/01.md
 */
interface Event<K extends number = number> {
  id: string;
  sig: string;
  kind: K;
  tags: string[][];
  pubkey: string;
  content: string;
  created_at: number;
}

/**
 * A policy function in this library.
 * It accepts an input message, opts, and returns an output message.
 */
type Policy<Opts = unknown> = (msg: InputMessage, opts?: Opts) => Promise<OutputMessage> | OutputMessage;

export type { Event, InputMessage, OutputMessage, Policy };
