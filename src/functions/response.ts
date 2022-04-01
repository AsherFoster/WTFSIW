import {
  ClientMovie,
  ErrorCode,
  ErrorResponse,
  statusCodes,
} from '../shared/clientapi/Response';
import type {Genre, Movie} from '../shared/database';
import type {Storage} from './storage';

const baseHeaders = {'Content-Type': 'application/json'};

export function createResponse<T>(
  body: T,
  status = 200,
  headers?: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    headers: {...baseHeaders, ...headers},
    status,
  });
}

export function createErrorResponse(
  error: ErrorCode,
  message: string
): Response {
  return createResponse<ErrorResponse>(
    {
      error,
      message,
    },
    statusCodes[error]
  );
}

export async function getClientMovie(
  storage: Storage,
  movie: Movie
): Promise<ClientMovie> {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.posterUrl,
    releaseDate: movie.releaseDate,
    averageRating: movie.averageRating,

    genres: (await Promise.all(
      movie.genres.map((g) => storage.getGenre(g))
    )) as Genre[], // TODO don't cast
  };
}
