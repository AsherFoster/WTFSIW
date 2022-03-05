import {Router} from 'itty-router';
import Toucan from 'toucan-js';
import {ScoredMovie} from './handlers/ScoredMovie';
import {MovieById} from './handlers/MovieById';
import {initSentry} from './sentry';
import {createErrorResponse} from './response';
import {ENVIRONMENT} from '../shared/config';
import {Storage} from './storage';

const router = Router();

router
  .get('/api/movie', ScoredMovie)
  .get('/api/movie/:id', MovieById)
  .get('*', () => createErrorResponse('ERR_NOT_FOUND', 'Not Found :('));

const handleRequest = (request: Request, storage: Storage, sentry: Toucan) => {
  return router.handle(request, storage).catch((e: Error) => {
    if (ENVIRONMENT !== 'production') console.error(e.message);
    sentry.captureException(e);
    return createErrorResponse('ERR_INTERNAL_ERROR', 'Internal Error');
  });
};

interface Env {
  storage: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const sentry = initSentry(request, ctx);

    return handleRequest(request, new Storage(env.storage), sentry);
  },
} as ExportedHandler<Env>;
