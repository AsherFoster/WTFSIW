import type {Genre} from '../database';
import type {ScoringPreference} from './Scoring';

// Error Response
export const statusCodes = {
  ERR_BAD_REQUEST: 400,
  ERR_UNAUTHORIZED: 401,
  ERR_NOT_FOUND: 404,
  ERR_INTERNAL_ERROR: 500,
} as const;
export type ErrorCode = keyof typeof statusCodes;
export interface ErrorResponse {
  error: ErrorCode;
  message: string;
}

// Specific API response shared
export interface ClientMovie {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string | null;
  averageRating: number;

  genres: Genre[];
}

export type ScoringAction = ScoringPreference & {label: string};
export interface ScoredMovieResponse {
  movie: ClientMovie;
  actions: ScoringAction[];
  rankingInfo?: ScoringPreference[];
}
export interface MovieResponse {
  movie: ClientMovie;
}
