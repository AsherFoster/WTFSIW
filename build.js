import {build} from 'esbuild';

const watch = process.argv.includes('watch');

build({
  entryPoints: ['src/client/index.tsx'],
  outdir: 'static',
  format: 'esm',
  bundle: true,
  minify: true,
  sourcemap: true,
  splitting: true,
  target: 'firefox95',
  watch
});
