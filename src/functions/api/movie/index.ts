import {sentryMiddleware, storageMiddleware} from '../../middlewares';
import {Storage} from '../../storage';
import {
  createErrorResponse,
  createResponse,
  getClientMovie,
} from '../../response';
import {ScoredMovieResponse} from '../../../shared/clientapi/Response';
import {generateActions, getScoredMovie} from '../../scoring';
import {WTFSIWFunction} from '../../types';
import {preferenceListSchema} from '../../../shared/clientapi/Request';

async function returnRandomMovie(storage: Storage): Promise<Response> {
  const [movie] = await storage.getRandomMovies(1);

  return createResponse<ScoredMovieResponse>({
    movie: await getClientMovie(storage, movie),
    actions: await generateActions(storage, movie, []),
  });
}

export const ScoredMovie: WTFSIWFunction<never> = async ({request, data}) => {
  const {storage} = data;
  const url = new URL(request.url);
  const prefString = url.searchParams.get('preferences');

  // If no preferences were passed - return a random movie
  if (!prefString) {
    return returnRandomMovie(storage);
  }

  // If the prefs are there, validate the hell out of them
  let prefs;
  try {
    const parsed = preferenceListSchema.safeParse(JSON.parse(prefString));
    if (!parsed.success) {
      return createErrorResponse(
        'ERR_BAD_REQUEST',
        parsed.error.message || 'Unable to parse prefs'
      );
    }
    prefs = parsed.data;
  } catch (e) {
    return createErrorResponse('ERR_BAD_REQUEST', 'Unable to parse prefs');
  }

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

export const onRequestGet = [sentryMiddleware, storageMiddleware, ScoredMovie];
