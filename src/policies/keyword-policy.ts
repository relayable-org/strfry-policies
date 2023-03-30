import { Policy } from '../types.ts';

/**
 * Reject events containing any of the strings in its content.
 *
 * @example
 * ```ts
 * // Reject events with bad words.
 * keywordPolicy(msg, ['moo', 'oink', 'honk']);
 * ```
 */
const keywordPolicy: Policy<Iterable<string>> = ({ event: { id, content } }, words = []) => {
  for (const word of words) {
    if (content.toLowerCase().includes(word.toLowerCase())) {
      return {
        id,
        action: 'reject',
        msg: 'blocked: contains a banned word or phrase.',
      };
    }
  }

  return {
    id,
    action: 'accept',
    msg: '',
  };
};

export default keywordPolicy;
