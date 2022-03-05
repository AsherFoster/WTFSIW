import {Request} from 'itty-router';
import {MovieResponse} from '../../shared/clientapi/Response';
import {createErrorResponse, createResponse, getClientMovie} from '../response';
import type {Storage} from '../storage';

export const MovieById = async (request: Request, storage: Storage) => {
  const idStr = request.params?.id;
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
