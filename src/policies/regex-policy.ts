import { Policy } from '../types.ts';

/** Reject events whose content matches the regex. */
const regexPolicy: Policy<RegExp> = ({ event: { id, content } }, regex) => {
  if (regex?.test(content)) {
    return {
      id,
      action: 'reject',
      msg: 'blocked: text matches a banned expression.',
    };
  }

  return {
    id,
    action: 'accept',
    msg: '',
  };
};

export default regexPolicy;
