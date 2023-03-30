import { MockFetch } from 'https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts';

import { assertEquals } from '../deps.ts';
import { buildEvent, buildInputMessage } from '../test.ts';

import openaiPolicy from './openai-policy.ts';

const mockFetch = new MockFetch();

mockFetch.deactivateNetConnect();

mockFetch
  .intercept('https://api.openai.com/v1/moderations', { body: '{"input":"I want to kill them."}' })
  .response(
    '{"id":"modr-6zvK0JiWLBpJvA5IrJufw8BHPpEpB","model":"text-moderation-004","results":[{"flagged":true,"categories":{"sexual":false,"hate":false,"violence":true,"self-harm":false,"sexual/minors":false,"hate/threatening":false,"violence/graphic":false},"category_scores":{"sexual":9.759669410414062e-07,"hate":0.180674210190773,"violence":0.8864424824714661,"self-harm":1.8088556208439854e-09,"sexual/minors":1.3363569806301712e-08,"hate/threatening":0.003288434585556388,"violence/graphic":3.2010063932830235e-08}}]}',
  );

mockFetch
  .intercept('https://api.openai.com/v1/moderations', { body: '{"input":"I want to love them."}' })
  .response(
    '{"id":"modr-6zvS6HoiwBqOQ9VYSggGAAI9vSgWD","model":"text-moderation-004","results":[{"flagged":false,"categories":{"sexual":false,"hate":false,"violence":false,"self-harm":false,"sexual/minors":false,"hate/threatening":false,"violence/graphic":false},"category_scores":{"sexual":1.94798508346139e-06,"hate":2.756592039077077e-07,"violence":1.4010063864589029e-07,"self-harm":3.1806530742528594e-09,"sexual/minors":1.8928545841845335e-08,"hate/threatening":3.1036221769670247e-12,"violence/graphic":1.5348690096672613e-09}}]}',
  );

Deno.test('rejects flagged events', async () => {
  const msg = buildInputMessage({ event: buildEvent({ content: 'I want to kill them.' }) });
  assertEquals((await openaiPolicy(msg)).action, 'reject');
});

Deno.test('accepts unflagged events', async () => {
  const msg = buildInputMessage({ event: buildEvent({ content: 'I want to love them.' }) });
  assertEquals((await openaiPolicy(msg)).action, 'accept');
});
