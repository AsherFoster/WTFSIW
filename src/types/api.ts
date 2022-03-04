import {Credit, Genre, Person} from '../data/model';
import {RankingPreference} from '../server/ranking';

type CreditWithPerson = Omit<Credit, 'personId'> & {person: Person};

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

export interface RankedMovieQueryParams {
  preferences: string;
}
export interface RankedMovieResponse {
  movie: ClientMovie;
  actions: RankingPreference[];
  rankingInfo: RankingPreference[];
}
export interface MovieByIdResponse {
  movie: ClientMovie;
}
