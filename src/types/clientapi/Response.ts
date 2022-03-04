import {getGenre, getPerson} from '../../server/data';
import type {Genre, Credit, Movie, Person} from '../database';
import type {RankingPreference} from './Scoring';

// General Response helpers
const baseHeaders = {'Content-Type': 'application/json'};

export function createResponse<T>(body: T, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    headers: {...baseHeaders, ...headers},
    status
  });
}

// Error Response
const statusCodes = {
  'ERR_BAD_REQUEST': 400,
  'ERR_NOT_FOUND': 404,
  'ERR_INTERNAL_ERROR': 500
} as const;
export type ErrorCode = keyof typeof statusCodes;
export interface ErrorResponse {
  error: ErrorCode;
  message: string;
}

export function createErrorResponse(error: ErrorCode, message: string): Response {
  return createResponse<ErrorResponse>({
    error,
    message
  }, statusCodes[error]);
}

// Specific API response types
export type CreditWithPerson = Omit<Credit, 'personId'> & {person: Person};
async function getCreditWithPerson(credit: Credit): Promise<CreditWithPerson> {
  return {
    job: credit.job,
    creditType: credit.creditType,
    creditNumber: credit.creditNumber,
    person: await getPerson(credit.personId)
  };
}

export interface ClientMovie {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string;
  averageRating: number;

  genres: Genre[];
  credits: CreditWithPerson[];
}
export async function getClientMovie(movie: Movie): Promise<ClientMovie> {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.posterUrl,
    releaseDate: movie.releaseDate,
    averageRating: movie.averageRating,

    genres: await Promise.all(movie.genres.map(g => getGenre(g))),
    credits: await Promise.all(movie.credits.map(c => getCreditWithPerson(c)))
  };
}

export interface RankedMovieResponse {
  movie: ClientMovie;
  actions: RankingPreference[];
  rankingInfo?: RankingPreference[];
}
export interface MovieResponse {
  movie: ClientMovie;
}
