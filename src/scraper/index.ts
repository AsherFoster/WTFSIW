import * as Sentry from '@sentry/node';
import extract from './extract';
import load from './load';
import {ENVIRONMENT, SENTRY_DSN, VERSION} from '../shared/config';

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1,
  environment: ENVIRONMENT,
  release: VERSION,
});

async function main() {
  const txn = Sentry.startTransaction({
    op: 'update-dataset',
    name: 'Update Dataset',
  });
  Sentry.configureScope((scope) => {
    scope.setSpan(txn);
  });

  try {
    const allTheThings = await extract();
    await load(1, allTheThings);
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    txn.finish();
  }
}

main();
