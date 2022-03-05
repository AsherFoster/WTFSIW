import type {Request} from 'itty-router';
import {generateActions, getScoredMovie} from '../scoring';
import {preferenceListSchema} from '../../shared/clientapi/Request';
import type {RankedMovieResponse} from '../../shared/clientapi/Response';
import {createErrorResponse, createResponse, getClientMovie} from '../response';
import type {Storage} from '../storage';

async function returnRandomMovie(storage: Storage): Promise<Response> {
  const [movie] = await storage.getRandomMovies(1);

  return createResponse<RankedMovieResponse>({
    movie: await getClientMovie(storage, movie),
    actions: await generateActions(movie, []),
  });
}

export const ScoredMovie = async (request: Request, storage: Storage) => {
  const prefString = request.query?.preferences;
  if (!prefString) {
    return returnRandomMovie(storage);
  }

  const parsed = preferenceListSchema.safeParse(prefString);
  if (!parsed.success) {
    return createErrorResponse(
      'ERR_BAD_REQUEST',
      parsed.error.message || 'Unable to parse prefs'
    );
  }

  const prefs = parsed.data;
  if (!prefs.length) {
    return returnRandomMovie(storage);
  }

  const {movie, factors} = await getScoredMovie(storage, prefs);

  return createResponse<RankedMovieResponse>({
    movie: await getClientMovie(storage, movie),
    actions: await generateActions(movie, prefs),
    rankingInfo: factors,
  });
};
