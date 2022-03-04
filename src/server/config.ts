import * as path from 'path';

export const ENVIRONMENT = process.env.NODE_ENV || 'development';
const allowedEnvironments = ['development', 'production', 'test'];
if (!allowedEnvironments.includes(ENVIRONMENT)) {
  throw new Error(`Environment must be one of ${allowedEnvironments.join(', ')}`);
}

export const SENTRY_DSN = process.env.SENTRY_DSN;
export const DATABASE_PATH = path.resolve(__dirname, '../data/db.sqlite');
export const PORT = process.env.PORT || 8080;
