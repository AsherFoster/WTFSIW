// Giving a sort of weird, non-relational database model a shot here
// The idea is this will all be shoved in a Cloudflare KV store

export interface Genre {
  id: number;
  name: string;
}

export interface Credit {
  personId: number;
  name: string;
  creditType: 'cast' | 'crew';
  job: string | null;
  creditNumber?: number; // present on 'cast' shared
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string | null;
  averageRating: number;
  popularity: number;

  genres: number[];
  credits: Credit[];
}

interface Root {
  movies: Movie[];
  genres: Genre[];
}
