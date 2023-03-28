import { Policy } from '../types.ts';

/** Reject events whose content matches the regex. */
const regexPolicy: Policy<RegExp> = ({ event: { id, content } }, regex) => {
  const isMatch = regex ? regex.test(content) : false;

  if (isMatch) {
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
