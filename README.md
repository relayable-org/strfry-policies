# strfry policies

A collection of policies for the [strfry](https://github.com/hoytech/strfry) Nostr relay, built in Deno.

For more information about policy plugins, see [strfry: Write policy plugins](https://github.com/hoytech/strfry/blob/master/docs/plugins.md).

This library introduces a model for writing policies and composing them in a pipeline. Policies are fully configurable and it's easy to add your own or install more from anywhere on the net.

![Screenshot_from_2023-03-29_23-09-09](https://gitlab.com/soapbox-pub/strfry-policies/uploads/4a95c433eb6b4b0ca74f5c5e71f27d7b/Screenshot_from_2023-03-29_23-09-09.png)

## Getting started

To get up and running, you will need to install Deno on the same machine as strfry:

```sh
sudo apt install -y unzip
curl -fsSL https://deno.land/x/install/install.sh | sudo DENO_INSTALL=/usr/local sh
```

Create an entrypoint file somewhere and make it executable:

```sh
sudo touch /opt/strfry-policy.ts
sudo chmod +x /opt/strfry-policy.ts
```

Now you can write your policy. Here's a good starting point:

```ts
#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"
import {
  antiDuplicationPolicy,
  hellthreadPolicy,
  pipeline,
  rateLimitPolicy,
  readStdin,
  writeStdout,
} from 'https://gitlab.com/soapbox-pub/strfry-policies/-/raw/develop/mod.ts';

for await (const msg of readStdin()) {
  const result = await pipeline(msg, [
    [hellthreadPolicy, { limit: 100 }],
    [antiDuplicationPolicy, { ttl: 60000, minLength: 50 }],
    [rateLimitPolicy, { whitelist: ['127.0.0.1'] }],
  ]);

  writeStdout(result);
}
```

Finally, edit `strfry.conf` and enable the policy:

```diff
     writePolicy {
         # If non-empty, path to an executable script that implements the writePolicy plugin logic
-        plugin = ""
+        plugin = "/opt/strfry-policy.ts"
 
         # Number of seconds to search backwards for lookback events when starting the writePolicy plugin (0 for no lookback)
         lookbackSeconds = 0
```

That's it! 🎉 Now you should check strfry logs to ensure everything is working okay.

## Available policies

For complete documentation of policies, see: https://doc.deno.land/https://gitlab.com/soapbox-pub/strfry-policies/-/raw/develop/mod.ts

| Policy                  | Description                                                                                                                 | Example Options                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `antiDuplicationPolicy` | Prevent messages with the exact same content from being submitted repeatedly.                                               | `{ ttl: 60000, minLength: 50}`      |
| `filterPolicy`          | Reject all events which don't match the filter.                                                                             | `{ kinds: [0, 1, 3, 5, 6, 7] }`     |
| `hellthreadPolicy`      | Reject messages that tag too many participants.                                                                             | `{ limit: 15 }`                     |
| `keywordPolicy`         | Reject events containing any of the strings in its content.                                                                 | `['moo', 'oink', 'honk']`           |
| `noopPolicy`            | Minimal sample policy for demonstration purposes. Allows all events through.                                                |                                     |
| `openaiPolicy`          | Passes event content to OpenAI and then rejects flagged events.                                                             | `{ apiKey: '123...' }`              |
| `powPolicy`             | Reject events which don't meet Proof-of-Work ([NIP-13](https://github.com/nostr-protocol/nips/blob/master/13.md)) criteria. | `{ difficulty: 20 }`                |
| `pubkeyBanPolicy`       | Ban individual pubkeys from publishing events to the relay.                                                                 | `['e810...', 'fafa...', '1e89...']` |
| `rateLimitPolicy`       | Rate-limits users by their IP address.                                                                                      | `{ max: 10, interval: 60000 }`      |
| `readOnlyPolicy`        | This policy rejects all messages.                                                                                           |                                     |
| `regexPolicy`           | Reject events whose content matches the regex.                                                                              | `/(🟠\|🔥\|😳)ChtaGPT/i`            |
| `whitelistPolicy`       | Allows only the listed pubkeys to post to the relay. All other events are rejected.                                         | `['e810...', 'fafa...', '1e89...']` |

## Upgrading strfry-policies

When writing your script, it's a good idea to import the module with a permalink, eg:

```diff
- import * as strfry from 'https://gitlab.com/soapbox-pub/strfry-policies/-/raw/develop/mod.ts';
+ import * as strfry from 'https://gitlab.com/soapbox-pub/strfry-policies/-/raw/33ef127ca7599d9d7016786cbe2de34c9536078c/mod.ts';
```

You can also import from a tag:

```diff
- import * as strfry from 'https://gitlab.com/soapbox-pub/strfry-policies/-/raw/develop/mod.ts';
+ import * as strfry from 'https://gitlab.com/soapbox-pub/strfry-policies/-/raw/v0.1.0/mod.ts';
```

Therefore, to upgrade to a newer version of strfry-policies, you can simply change the import URL.

## Usage with Node.js

We highly recommend running this library with Deno, but for those looking to incorporate it into an existing Node.js project, an NPM version is provided:

- https://www.npmjs.com/package/strfry-policies

This version is built with [dnt](https://github.com/denoland/dnt) which provides Node.js shims for Deno features. Some policies that rely on sqlite may not work, but core fuctionality and TypeScript types work fine, so it can be used as a framework to build other policies.

## Writing your own policies

You can write a policy in TypeScript and host it anywhere. Deno allows importing modules by URL, making it easy to share policies.

Here is a basic sample policy:

```ts
import type { Policy } from 'https://gitlab.com/soapbox-pub/strfry-policies/-/raw/develop/mod.ts';

/** Only American English is allowed. */
const americanPolicy: Policy<void> = (msg) => {
  const { content } = msg.event;

  const words = [
    'armour',
    'behaviour',
    'colour',
    'favourite',
    'flavour',
    'honour',
    'humour',
    'rumour',
  ];

  const isBritish = words.some((word) => content.toLowerCase().includes(word));

  if (isBritish) {
    return {
      id: msg.event.id,
      action: 'reject',
      msg: 'Sorry, only American English is allowed on this server!',
    };
  } else {
    return {
      id: msg.event.id,
      action: 'accept',
      msg: '',
    };
  }
};

export default americanPolicy;
```

Once you're done, you can either upload the file somewhere online or directly to your server. Then, update your pipeline:

```diff
--- a/strfry-policy.ts
+++ b/strfry-policy.ts
@@ -8,12 +8,14 @@ import {
   readStdin,
   writeStdout,
 } from 'https://gitlab.com/soapbox-pub/strfry-policies/-/raw/develop/mod.ts';
+import { americanPolicy } from 'https://gist.githubusercontent.com/alexgleason/5c2d084434fa0875397f44da198f4352/raw/3d3ce71c7ed9cef726f17c3a102c378b81760a45/american-policy.ts';
 
 for await (const msg of readStdin()) {
   const result = await pipeline(msg, [
     [hellthreadPolicy, { limit: 100 }],
     [antiDuplicationPolicy, { ttl: 60000, minLength: 50 }],
     [rateLimitPolicy, { whitelist: ['127.0.0.1'] }],
+    americanPolicy,
   ]);
 
   writeStdout(result);
```

### Policy options

The `Policy<Opts>` type is a generic that accepts options of any type. With opts, the policy above could be rewritten as:

```diff
--- a/american-policy.ts
+++ b/american-policy.ts
@@ -1,7 +1,11 @@
 import type { Policy } from 'https://gitlab.com/soapbox-pub/strfry-policies/-/raw/develop/mod.ts';
 
+interface American {
+  withGrey?: boolean;
+}
+
 /** Only American English is allowed. */
-const americanPolicy: Policy<void> = (msg) => {
+const americanPolicy: Policy<American> = (msg, opts) => {
   const { content } = msg.event;
 
   const words = [
@@ -15,6 +19,10 @@
     'rumour',
   ];
 
+  if (opts?.withGrey) {
+    words.push('grey');
+  }
+
   const isBritish = words.some((word) => content.toLowerCase().includes(word));
 
   if (isBritish) {
```

Then, in the pipeline:

```diff
-  americanPolicy,
+  [americanPolicy, { withGrey: true }],
```

### Caveats

- You should not use `console.log` anywhere in your policies, as strfry expects stdout to be the strfry output message.

## Filtering jsonl events with your policy

It is not currently possible to retroactively filter events on your strfry relay. You can however export the events with `strfry export`, filter them locally, and then import them into a fresh database. You can also use this command to filter Nostr events from any source, not just strfry.

To do so, run:

```sh
cat [EVENTS_FILE] | deno task filter [POLICY_CMD] > [OUT_FILE]
```

For example:

```sh
cat events.jsonl | deno task filter ./my-policy.ts > filtered.jsonl
```

Accepted messages will be written to stdout, while rejected messages will be skipped. Also, `[POLICY_CMD]` can be _any_ strfry policy, not just one created from this repo.

The command wraps each event in a strfry message of type `new`, with an `IP4` source of `127.0.0.1`, and a timestamp of the current UTC time. Therefore you may want to avoid certain policies such as the `rateLimitPolicy` that don't makes sense in this context.

## FAQ

### Why Deno?

Deno was developed by the creator of Node.js to solve various problems with Node. It implements web standard APIs such as SubtleCrypto and Fetch so your code is compatible with web browsers. It is also significantly faster in benchmarks.

### Can I integrate this into another project?

If you're building your own relay, make it compatible with [strfry plugins](https://github.com/hoytech/strfry/blob/master/docs/plugins.md). strfry plugins utilize stdin and stdout of the operating system, so the relay can be written in any programming language and it will be able to utilize plugins written in any programming language.

If you're writing software that deals with Nostr events in JavaScript or TypeScript, you can import this library and use its functions directly.

## License

This is free and unencumbered software released into the public domain.
