import {build} from 'esbuild';

const watch = process.argv.includes('watch');

const define = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN), // TODO different DSNs for client/server
  'process.env.TMDB_API_KEY': JSON.stringify(process.env.TMDB_API_KEY),
};

build({
  entryPoints: ['src/client/index.tsx'],
  outdir: 'dist/client',
  format: 'esm',
  bundle: true,
  minify: true,
  sourcemap: true,
  target: 'firefox95',
  watch,
  define,
});

build({
  entryPoints: ['src/scraper/index.ts'],
  outfile: 'dist/scraper.js',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  target: 'node16',
  watch,
  define,
});

build({
  entryPoints: ['src/server/index.ts'],
  outfile: 'dist/server.js',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  target: 'node16',
  watch,
  define,
});
