import {sentryMiddleware, storageMiddleware} from '../../middlewares';
import {Storage} from '../../storage';
import {
  createErrorResponse,
  createResponse,
  getClientMovie,
} from '../../response';
import {ScoredMovieResponse} from '../../../shared/clientapi/Response';
import {getScoredMovie} from '../../scoring';
import {
  preferenceListSchema,
  ScoredMovieRequest,
} from '../../../shared/clientapi/Request';
import {generateActions} from '../../scoringActions';
import type {WTFSIWFunction} from '../../types';

async function returnRandomMovie(storage: Storage): Promise<Response> {
  const [movie] = await storage.getRandomMovies(1);

  return createResponse<ScoredMovieResponse>({
    movie: await getClientMovie(storage, movie),
    actions: await generateActions(storage, movie, []),
  });
}

export const ScoredMovie: WTFSIWFunction<never> = async ({request, data}) => {
  const {storage} = data;

  const req = await request.json<ScoredMovieRequest>();
  // If no preferences were passed - return a random movie
  if (!req) {
    return returnRandomMovie(storage);
  }

  // If the prefs are there, validate the hell out of them
  const validation = preferenceListSchema.safeParse(req?.preferences);
  if (!validation.success) {
    return createErrorResponse(
      'ERR_BAD_REQUEST',
      validation.error.message || 'Unable to parse prefs'
    );
  }
  const prefs = validation.data;

  // If the prefs are empty, we're back to returning a random movie
  if (!prefs.length) {
    return returnRandomMovie(storage);
  }

  // Ok, we have valid, non-empty prefs! Let's give them something good!
  const {movie, factors} = await getScoredMovie(storage, prefs);

  return createResponse<ScoredMovieResponse>({
    movie: await getClientMovie(storage, movie),
    actions: await generateActions(storage, movie, prefs),
    rankingInfo: factors,
  });
};

export const onRequestPost = [sentryMiddleware, storageMiddleware, ScoredMovie];
