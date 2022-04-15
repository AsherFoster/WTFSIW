import * as Sentry from '@sentry/node';
import extract from './extract';
import load from './load';
import {SENTRY_DSN} from '../shared/config';

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1,
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
