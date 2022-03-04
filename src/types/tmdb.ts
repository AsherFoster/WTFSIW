export interface DiscoverMovie {
  vote_count: number;
  id: number;
  video: boolean;
  vote_average: number;
  title: string;
  popularity: number;
  poster_path: string | null;
  original_language: string;
  original_title: string;
  genre_ids: number[];
  backdrop_path: string | null;
  adult: boolean;
  overview: string;
  release_date: string;
}
export interface Cast {
  cast_id: number;
  character: string;
  credit_id: string;
  gender: number;
  id: number;
  name: string;
  order: number;
  profile_path: string | null;
}
export interface Crew {
  credit_id: string;
  department: string;
  gender: number;
  id: number;
  job: string;
  name: string;
  profile_path: string | null;
}
export interface Genre {
  name: string;
  id: number;
}

export interface DataDump {
  discover: DiscoverMovie;
  cast: Cast[] | null;
  crew: Crew[] | null;
}
