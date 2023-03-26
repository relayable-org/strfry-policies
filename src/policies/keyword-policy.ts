import { Policy } from '../types.ts';

/** Reject events containing any of the strings in its content. */
const keywordPolicy: Policy<Iterable<string>> = ({ event: { id, content } }, words = []) => {
  let isMatch = false;

  for (const word of words) {
    if (content.toLocaleLowerCase().includes(word.toLowerCase())) {
      isMatch = true;
      break;
    }
  }

  if (isMatch) {
    return {
      id,
      action: 'reject',
      msg: 'Event contains a banned word or phrase.',
    };
  }

  return {
    id,
    action: 'accept',
    msg: '',
  };
};

export default keywordPolicy;
