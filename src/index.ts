import app from './server';
import * as Sentry from '@sentry/node';
import {connect} from './database';
Sentry.init({dsn: process.env.SENTRY_DSN});

const PORT = process.env.PORT || 8080;

async function main() {
  await connect();
  app.listen(PORT);
  console.log('Listening on port', PORT);
}

main();
