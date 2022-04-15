import * as Sentry from '@sentry/react';
import {SENTRY_DSN} from '../shared/config';
import {BrowserTracing} from '@sentry/tracing';

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});
