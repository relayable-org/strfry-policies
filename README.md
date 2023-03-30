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

For complete documentation of policies, see:

- https://doc.deno.land/https://gitlab.com/soapbox-pub/strfry-policies/-/raw/develop/mod.ts

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

## License

This is free and unencumbered software released into the public domain.
