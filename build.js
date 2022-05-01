import {build} from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import path from 'path';
import fs from 'fs/promises';

const walkDir = async (dir) => {
  const files = await fs.readdir(dir);

  return (
    await Promise.all(
      files.map(async (file) => {
        const full = path.join(dir, file);
        if ((await fs.stat(full)).isDirectory()) {
          return walkDir(full);
        }
        return full;
      })
    )
  ).flat();
};

const watch = process.argv.includes('watch');

const define = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  'process.env.SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN),
  'process.env.TMDB_API_KEY': JSON.stringify(process.env.TMDB_API_KEY),
  'process.env.CLOUDFLARE_API_KEY': JSON.stringify(
    process.env.CLOUDFLARE_API_KEY
  ),
  'process.env.VERSION': JSON.stringify(
    process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || 'HEAD'
  ),
};

// Compile the client script into something browser-ready
build({
  entryPoints: ['src/client/index.html'],
  outdir: 'public',
  assetNames: 'static/[name]-[hash]',
  chunkNames: 'static/[name]-[hash]',
  // entryNames:
  //   process.env.NODE_ENV === 'production' ? '[name]-[hash]' : undefined,
  format: 'esm',
  bundle: true,
  minify: true,
  sourcemap: true,
  plugins: [
    htmlPlugin({
      scriptsTarget: 'firefox70',
      modulesTarget: 'firefox95',
    }),
  ],
  watch,
  define,
});

// Compile the scraper script into a simple script
build({
  entryPoints: ['src/scraper/index.ts'],
  outfile: 'dist/scraper.js',
  format: 'esm',
  platform: 'node',
  bundle: true,
  external: ['miniflare', '@sentry/node'],
  sourcemap: true,
  target: 'node16',
  watch,
  define,
});

// Compile the src/functions tree into the base /functions dir used by CF Pages
build({
  entryPoints: await walkDir('src/functions/api'),
  outbase: 'src/functions',
  outdir: 'functions',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  target: 'node16',
  watch,
  define,
});

// Compile the src/test tree into the base /test dir used by Node TAP
build({
  entryPoints: (await walkDir('src/test')).filter((f) => f.endsWith('.ts')),
  outbase: 'src/test',
  outdir: 'test',
  format: 'esm',
  platform: 'node',
  bundle: true,
  external: ['tap'],
  sourcemap: true,
  target: 'node16',
  watch,
  define,
});
