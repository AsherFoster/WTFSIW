import {
  ClientMovie,
  CreditWithPerson,
  ErrorCode,
  ErrorResponse,
  statusCodes,
} from '../shared/clientapi/Response';
import {Credit, Movie} from '../shared/database';
import {getGenre, getPerson} from './data';

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

async function getCreditWithPerson(credit: Credit): Promise<CreditWithPerson> {
  return {
    job: credit.job,
    creditType: credit.creditType,
    creditNumber: credit.creditNumber,
    person: await getPerson(credit.personId),
  };
}

export async function getClientMovie(movie: Movie): Promise<ClientMovie> {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.posterUrl,
    releaseDate: movie.releaseDate,
    averageRating: movie.averageRating,

    genres: await Promise.all(movie.genres.map((g) => getGenre(g))),
    credits: await Promise.all(
      movie.credits.map((c) => getCreditWithPerson(c))
    ),
  };
}
