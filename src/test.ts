import type { Event, InputMessage } from './types.ts';

/** Constructs a fake event for tests. */
function buildEvent(attrs: Partial<Event> = {}): Event {
  const event: Event = {
    kind: 1,
    id: '',
    content: '',
    created_at: 0,
    pubkey: '',
    sig: '',
    tags: [],
  };

  return Object.assign(event, attrs);
}

/** Constructs a fake strfry input message for tests. */
function buildInputMessage(attrs: Partial<InputMessage> = {}): InputMessage {
  const msg = {
    event: buildEvent(),
    receivedAt: 0,
    sourceInfo: '127.0.0.1',
    sourceType: 'IP4',
    type: 'new',
  };

  return Object.assign(msg, attrs);
}

export { buildEvent, buildInputMessage };
