import {Request} from 'itty-router';
import {getMovie} from '../data';
import {
  createErrorResponse,
  createResponse,
  getClientMovie,
  MovieResponse,
} from '../../types/clientapi/Response';

export const MovieById = async (request: Request) => {
  const idStr = request.params?.id;
  if (!idStr || !idStr.match(/^\d+$/)) {
    return createErrorResponse('ERR_BAD_REQUEST', 'Invalid ID');
  }

  const id = parseInt(idStr);

  const movie = await getMovie(id);

  if (!movie) return createErrorResponse('ERR_NOT_FOUND', 'Movie not found');

  return createResponse<MovieResponse>({
    movie: await getClientMovie(movie),
  });
};
