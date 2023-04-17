import { build, emptyDir } from 'https://deno.land/x/dnt@0.34.0/mod.ts';

await emptyDir('./npm');

await build({
  entryPoints: ['./mod.ts'],
  outDir: './npm',
  shims: {
    deno: true,
    undici: true,
  },
  package: {
    name: 'strfry-policies',
    version: Deno.args[0],
    description: 'Configurable policies for the strfry Nostr relay.',
    license: 'Unlicense',
    repository: {
      type: 'git',
      url: 'git+https://gitlab.com/soapbox-pub/strfry-policies.git',
    },
    bugs: {
      url: 'https://gitlab.com/soapbox-pub/strfry-policies/-/issues',
    },
  },
  typeCheck: false,
  test: false,
  scriptModule: false,
  postBuild() {
    Deno.copyFileSync('LICENSE', 'npm/LICENSE');
    Deno.copyFileSync('README.md', 'npm/README.md');
  },
});
