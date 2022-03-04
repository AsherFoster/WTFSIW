// Giving a sort of weird, non-relational database model a shot here
// The idea is, this is all gonna be shoved in a Cloudflare KV store

export interface Genre {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  name: string;
}

export interface Credit {
  personId: number;
  creditType: 'cast' | 'crew';
  job: string;
  creditNumber: number | null;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string;
  averageRating: number;

  genres: number[];
  credits: Credit[];
}

interface Root {
  movies: Movie[];
  persons: Person[];
  genres: Genre[];
}
