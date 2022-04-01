import fetch from 'node-fetch';
import type {
  Cast,
  CreditsResponse,
  Crew,
  DiscoverMovieResponse,
  GenresResponse,
  MovieResult,
} from 'moviedb-promise/dist/request-types';
import type {Genre} from 'moviedb-promise/dist/types';
import {TMDB_API_KEY} from '../shared/config';

export {Cast, Crew, MovieResult, Genre};

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY is required');

  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => query.append(k, v));

  const url = `https://api.themoviedb.org/3${path}?${query}`;
  console.log('Fetch', url);
  const resp = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + TMDB_API_KEY,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  return resp.json() as Promise<T>;
}

export async function getMovies(amount: number): Promise<MovieResult[]> {
  let page = 0;
  const movies: MovieResult[] = [];
  while (movies.length < amount) {
    page++;
    const resp = await tmdbFetch<DiscoverMovieResponse>('/discover/movie', {
      page: page.toString(),
      sort_by: 'popularity.desc',
    });
    if (
      !resp.total_pages ||
      !resp.results?.length ||
      resp.total_pages <= page
    ) {
      return movies; // No more results
    }
    movies.push(...resp.results);
  }
  return movies;
}

interface CastAndCrew {
  cast: Cast[];
  crew: Crew[];
}
export async function getMovieCredits(movie: number): Promise<CastAndCrew> {
  const resp = await tmdbFetch<CreditsResponse>(`/movie/${movie}/credits`);
  if (!resp.crew || !resp.cast) throw new Error('Bad credits');

  return {
    cast: resp.cast,
    crew: resp.crew,
  };
}

export async function getGenres(): Promise<Genre[]> {
  const resp = await tmdbFetch<GenresResponse>('/genre/movie/list');
  if (!resp.genres) throw new Error('No genres returned');
  return resp.genres;
}
