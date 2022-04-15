declare const process: {
  env: {
    // Based off of constants provided in build.js
    NODE_ENV?: string;
    SENTRY_DSN?: string;
    TMDB_API_KEY?: string;
    CLOUDFLARE_API_KEY?: string;
  };
};
const allowedEnvironments = ['development', 'production', 'test'] as const;
type Environment = 'development' | 'production' | 'test';
if (!allowedEnvironments.includes(process.env.NODE_ENV as any)) {
  throw new Error(
    `Environment must be one of ${allowedEnvironments.join(', ')}`
  );
}
export const ENVIRONMENT = process.env.NODE_ENV as Environment;

export const SENTRY_DSN = process.env.SENTRY_DSN;

// Scoring algorithm parameters
export const INITIAL_SAMPLE_SIZE = 100;
export const SUGGESTED_ACTION_COUNT = 3;

// Scraper params
export const MOVIE_DATASET_SIZE = ENVIRONMENT === 'production' ? 900 : 10;
export const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Scraper/Cloudflare KV params
export const CF_ACCOUNT_ID = '58371b47d4ca0f32a2aabf9c50836c44';
export const CF_KV_BINDING = 'storage';
export const CF_KV_NAMESPACE =
  ENVIRONMENT === 'production'
    ? 'eff3591587a14a5eaf64699b2297e407'
    : '9f8139775fc044dda406db9c3b86a9b2';
export const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
