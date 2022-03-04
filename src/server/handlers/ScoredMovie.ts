import type {Request} from 'itty-router';
import Ajv from 'ajv/dist/jtd';
import {generateActions, getScoredMovie} from '../scoring';
import {getRandomMovies} from '../data';
import {preferenceListSchema} from '../../types/clientapi/Request';
import type {RankedMovieResponse} from '../../types/clientapi/Response';
import {createErrorResponse, createResponse, getClientMovie} from '../../types/clientapi/Response';

const ajv = new Ajv();
const parse = ajv.compileParser(preferenceListSchema);

async function returnRandomMovie(): Promise<Response> {
  const [movie] = await getRandomMovies(1);

  return createResponse<RankedMovieResponse>({
    movie: await getClientMovie(movie),
    actions: await generateActions(movie, [])
  });
}

export const ScoredMovie = async (request: Request) => {
  const prefString = request.query?.preferences;
  if (!prefString) {
    return returnRandomMovie();
  }

  const prefs = parse(prefString);
  if (!prefs) {
    return createErrorResponse('ERR_BAD_REQUEST', parse.message || 'Unable to parse prefs');
  }

  if (!prefs.length) {
    return returnRandomMovie();
  }

  const {movie, factors} = await getScoredMovie(prefs);

  return createResponse<RankedMovieResponse>({
    movie: await getClientMovie(movie),
    actions: await generateActions(movie, prefs),
    rankingInfo: factors
  });
};
