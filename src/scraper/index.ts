import {Credit, Genre, Movie, Person} from '../types/database';
import {
  getGenres,
  Genre as TMDBGenre,
  MovieResult as TMDBMovie,
  getMovies,
  getMovieCredits,
} from './tmdb';
import {MOVIE_DATASET_SIZE} from '../config';

interface AllTheThings {
  genres: Genre[];
  movies: Movie[];
  persons: Person[];
}

function toGenre({id, name}: TMDBGenre): Genre {
  if (!name || typeof id !== 'number') throw new Error('Bad genre');
  return {id, name};
}

function toMovie(movie: TMDBMovie, credits: Credit[]): Movie {
  if (
    !movie.id ||
    !movie.title ||
    !movie.overview ||
    !movie.poster_path ||
    !movie.release_date ||
    !movie.vote_average ||
    !movie.popularity ||
    !movie.genre_ids
  )
    throw new Error('bad movie'); // TODO some of these will be optional

  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.poster_path, // TODO expand poster path
    releaseDate: movie.release_date,
    averageRating: movie.vote_average || movie.popularity,

    genres: movie.genre_ids,
    credits: credits,
  };
}

async function getAllTheThings(): Promise<AllTheThings> {
  const genres = await getGenres();
  const movies = await getMovies(MOVIE_DATASET_SIZE);

  const persons: Person[] = [];

  for (const movie of movies) {
    const {cast, crew} = getMovieCredits(movie.id);
  }

  return {
    movies: [],
    persons: [],
    genres: genres.map(toGenre),
  };
}
