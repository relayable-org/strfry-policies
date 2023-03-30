import type { Event, Policy } from '../types.ts';

/**
 * OpenAI moderation result.
 *
 * https://platform.openai.com/docs/api-reference/moderations/create
 */
interface ModerationData {
  id: string;
  model: string;
  results: {
    categories: {
      'hate': boolean;
      'hate/threatening': boolean;
      'self-harm': boolean;
      'sexual': boolean;
      'sexual/minors': boolean;
      'violence': boolean;
      'violence/graphic': boolean;
    };
    category_scores: {
      'hate': number;
      'hate/threatening': number;
      'self-harm': number;
      'sexual': number;
      'sexual/minors': number;
      'violence': number;
      'violence/graphic': number;
    };
    flagged: boolean;
  }[];
}

/**
 * Callback for fine control over the policy. It contains the event and the OpenAI moderation data.
 * Implementations should return `true` to **reject** the content, and `false` to accept.
 */
type OpenAIHandler = (event: Event, data: ModerationData) => boolean;

/** Policy options for `openaiPolicy`. */
interface OpenAI {
  handler?: OpenAIHandler;
  endpoint?: string;
  apiKey?: string;
}

/** Default handler. Simply checks whether OpenAI flagged the content. */
const flaggedHandler: OpenAIHandler = (_, { results }) => results.some((r) => r.flagged);

/**
 * Passes event content to OpenAI and then rejects flagged events.
 *
 * By default, this policy will reject kind 1 events that OpenAI flags.
 * It's possible to pass a custom handler for more control. An OpenAI API key is required.
 *
 * @example
 * ```ts
 * // Default handler. It's so strict it's suitable for school children.
 * openaiPolicy(msg, { apiKey: Deno.env.get('OPENAI_API_KEY') });
 *
 * // With a custom handler.
 * openaiPolicy(msg, {
 *   apiKey: Deno.env.get('OPENAI_API_KEY'),
 *   handler(event, result) {
 *     // Loop each result.
 *     return data.results.some((result) => {
 *       if (result.flagged) {
 *         const { sexual, violence } = result.categories;
 *         // Reject only events flagged as sexual and violent.
 *         return sexual && violence;
 *       }
 *     });
 *   },
 * });
 * ```
 */
const openaiPolicy: Policy<OpenAI> = async ({ event }, opts = {}) => {
  const {
    handler = flaggedHandler,
    endpoint = 'https://api.openai.com/v1/moderations',
    apiKey,
  } = opts;

  if (event.kind === 1) {
    const resp = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: event.content,
      }),
    });

    const result = await resp.json();

    if (handler(event, result)) {
      return {
        id: event.id,
        action: 'reject',
        msg: 'blocked: content flagged by AI',
      };
    }
  }

  return {
    id: event.id,
    action: 'accept',
    msg: '',
  };
};

export { flaggedHandler, openaiPolicy as default };

export type { ModerationData, OpenAI, OpenAIHandler };
