import {MovieDb} from 'moviedb-promise';
import type {Cast, Crew, MovieResult} from 'moviedb-promise/dist/request-types';
import type {Genre} from 'moviedb-promise/dist/types';
import {TMDB_API_KEY} from '../config';

export * from 'moviedb-promise/dist/request-types';
export * from 'moviedb-promise/dist/types';

if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY is required');
const client = new MovieDb(TMDB_API_KEY);

export async function getMovies(amount: number): Promise<MovieResult[]> {
  let page = 0;
  const movies: MovieResult[] = [];
  while (movies.length < amount) {
    page++;
    const resp = await client.discoverMovie({
      page
      // TODO additional filtering?
    });
    if (!resp.total_pages || !resp.results?.length || resp.total_pages <= page) {
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
  const resp = await client.movieCredits(movie);
  if (!resp.crew || !resp.cast) throw new Error('Bad credits');

  return {
    cast: resp.cast,
    crew: resp.crew
  };
}

export async function getGenres(): Promise<Genre[]> {
  const resp = await client.genreMovieList();
  if (!resp.genres) throw new Error('No genres returned');
  return resp.genres;
}

