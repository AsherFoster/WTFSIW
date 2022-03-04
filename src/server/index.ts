import {Router} from 'itty-router';
import './sentry';
import {ScoredMovie} from './handlers/ScoredMovie';
import {MovieById} from './handlers/MovieById';

const router = Router();

router
  .get('/api/movie', ScoredMovie)
  .get('/api/movie/:id', MovieById)
  .get('*', () => new Response('Not Found :(', {status: 404}));

export const handleRequest = (request: Request) => router.handle(request);
