import { Router } from 'itty-router';
import './sentry';
import {WeightedMovie} from './handlers/Scored';
import {MovieById} from './handlers/MovieById';

const router = Router();

router
  .get('/api/movie', WeightedMovie)
  .get('/api/movie/:id', MovieById)
  .get('*', () => new Response('Not Found :(', { status: 404 }));

export const handleRequest = (request: Request) => router.handle(request);
