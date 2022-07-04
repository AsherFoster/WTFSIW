import {init} from '@sentry/react';
import {ENVIRONMENT, SENTRY_DSN, VERSION} from '../shared/config';
import {BrowserTracing} from '@sentry/tracing';

init({
  dsn: SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: ENVIRONMENT,
  release: VERSION,
});
