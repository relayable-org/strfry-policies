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

interface Event<K extends number = number> {
  id: string;
  sig: string;
  kind: K;
  tags: string[][];
  pubkey: string;
  content: string;
  created_at: number;
}

type Policy = (msg: InputMessage) => Promise<OutputMessage> | OutputMessage;

export type { Event, InputMessage, OutputMessage, Policy };
