import * as Sentry from '@sentry/node';
import {SENTRY_DSN} from '../shared/config';

Sentry.init({dsn: SENTRY_DSN});
