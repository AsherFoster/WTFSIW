import {sentryMiddleware, storageMiddleware} from '../../middlewares';
import {WTFSIWFunction} from '../../types';
import {
  createErrorResponse,
  createResponse,
  getClientMovie,
} from '../../response';
import {MovieResponse} from '../../../shared/clientapi/Response';

export const MovieById: WTFSIWFunction<'id'> = async ({data, params}) => {
  const {storage} = data;
  const idStr = params.id as Exclude<typeof params.id, string[]>; // come on, there's not multiple ids...
  if (!idStr || !idStr.match(/^\d+$/)) {
    return createErrorResponse('ERR_BAD_REQUEST', 'Invalid ID');
  }

  const id = parseInt(idStr);

  const movie = await storage.getMovie(id);

  if (!movie) return createErrorResponse('ERR_NOT_FOUND', 'Movie not found');

  return createResponse<MovieResponse>({
    movie: await getClientMovie(storage, movie),
  });
};

export const onRequestGet = [sentryMiddleware, storageMiddleware, MovieById];
