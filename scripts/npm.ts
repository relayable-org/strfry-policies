import { build, emptyDir } from "https://deno.land/x/dnt@0.34.0/mod.ts";

await emptyDir('./npm');

await build({
  entryPoints: ['./mod.ts'],
  outDir: './npm',
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    name: 'strfry-policies',
    version: Deno.args[0],
    description: 'Your package.',
    license: 'Unlicense',
    repository: {
      type: 'git',
      url: 'git+https://gitlab.com/soapbox-pub/strfry-policies.git',
    },
    bugs: {
      url: 'https://gitlab.com/soapbox-pub/strfry-policies/-/issues',
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync('LICENSE', 'npm/LICENSE');
    Deno.copyFileSync('README.md', 'npm/README.md');
  },
});
