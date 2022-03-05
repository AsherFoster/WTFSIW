export const ENVIRONMENT = process.env.NODE_ENV || 'development';
const allowedEnvironments = ['development', 'production', 'test'];
if (!allowedEnvironments.includes(ENVIRONMENT)) {
  throw new Error(
    `Environment must be one of ${allowedEnvironments.join(', ')}`
  );
}

export const SENTRY_DSN = process.env.SENTRY_DSN;

// Scoring algorithm parameters
export const INITIAL_SAMPLE_SIZE = 100;
export const SUGGESTED_ACTION_COUNT = 3;

// Scraper params
export const MOVIE_DATASET_SIZE = 5000;
export const TMDB_API_KEY = process.env.TMDB_API_KEY;
