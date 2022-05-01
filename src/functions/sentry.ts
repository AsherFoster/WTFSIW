import Toucan from 'toucan-js';
import {ENVIRONMENT, SENTRY_DSN, VERSION} from '../shared/config';
import {WTFSIWContext} from './types';

export function initSentry(request: Request, context: WTFSIWContext): Toucan {
  // Based on some pretty cool config here https://github.com/cloudflare/worker-sentry/blob/main/index.js
  const sentry = new Toucan({
    dsn: SENTRY_DSN,
    context,
    allowedHeaders: [
      'user-agent',
      'cf-challenge',
      'accept-encoding',
      'accept-language',
      'cf-ray',
      'content-length',
      'content-type',
      'x-real-ip',
      'host',
    ],
    allowedSearchParams: /(.*)/,
    rewriteFrames: {
      root: '/',
    },
    environment: ENVIRONMENT,
    release: VERSION,
  });

  const colo = request.cf && request.cf.colo ? request.cf.colo : 'UNKNOWN';
  sentry.setTag('colo', colo);

  // cf-connecting-ip should always be present, but if not we can fallback to XFF.
  const ipAddress =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for');
  const userAgent = request.headers.get('user-agent') || '';
  sentry.setUser({ip: ipAddress, userAgent: userAgent, colo: colo});

  return sentry;
}
