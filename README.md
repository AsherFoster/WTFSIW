# What the fuck should I watch?

Do you want to watch a movie? Do you find normal recommendation sites too polite? Well, this is the app for you!

## 2.0 goals
- High levels of automation
  - Build & Deploy
  - Dataset updates
  - Dependency upgrades
- Robust unit tests to back these up
- Trying out new tools
  - Prettier
  - Rounding out my eslint config
  - Cloudflare workers
- Doing all of this, while ideally not costing anything
- Making the most of a common search term with good SEO
- Privacy-friendly analytics to feed my curiosity

### Still to do:
- Write unit tests (ugh)
- Automate dependency updates
- SEO

## Usage
- Clone, then `npm install`
- Build using `npm run build` (or `npm run build watch`)
  - You'll need to have [Environment Variables](#environment-variables) configured (these get baked in at buildtime)
- Run `npm run scraper` to populate your KV with movie data. (When built in `development` this will populate Miniflare)
- Run `npm run dev` to start Miniflare and serve the static content
- Open [localhost:8788/](http://localhost:8788/)

## Configuration

### Environment variables:

- `NODE_ENV`: `development` or `production`
- `TMDB_API_KEY`: Your ["API Read Access Token (v4 auth)"](https://www.themoviedb.org/settings/api). Used by the scraper to authenticate to TMDB's API.
- `CLOUDFLARE_API_KEY`: TODO confirm, should be optional on local dev when using Miniflare
- `SENTRY_DSN`: Used for error reporting, usually left unset in development.

### Additional configuration
Additional configuration can be found in `src/shared/config.ts`
