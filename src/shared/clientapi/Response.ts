import type {Credit, Genre, Person} from '../database';
import type {RankingPreference} from './Scoring';

// Error Response
export const statusCodes = {
  ERR_BAD_REQUEST: 400,
  ERR_NOT_FOUND: 404,
  ERR_INTERNAL_ERROR: 500,
} as const;
export type ErrorCode = keyof typeof statusCodes;
export interface ErrorResponse {
  error: ErrorCode;
  message: string;
}

// Specific API response shared
export type CreditWithPerson = Omit<Credit, 'personId'> & {person: Person};

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

export interface RankedMovieResponse {
  movie: ClientMovie;
  actions: RankingPreference[];
  rankingInfo?: RankingPreference[];
}
export interface MovieResponse {
  movie: ClientMovie;
}
