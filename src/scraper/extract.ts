import {
  getGenres,
  Genre as TMDBGenre,
  MovieResult as TMDBMovie,
  Crew,
  Cast,
  getMovies,
  getMovieCredits,
} from './tmdb';
import {MOVIE_DATASET_SIZE} from '../shared/config';
import type {Credit, Genre, Movie} from '../shared/database';

function toGenre({id, name}: TMDBGenre): Genre {
  if (!name || typeof id !== 'number') throw new Error('Bad genre');
  return {id, name};
}

function castToCredit(cast: Cast): Credit {
  if (
    typeof cast.id !== 'number' ||
    !cast.name ||
    typeof cast.character !== 'string' ||
    typeof cast.order !== 'number'
  ) {
    console.log(cast);
    throw new Error('bad cast');
  }

  return {
    personId: cast.id,
    name: cast.name,
    creditType: 'cast',
    job: cast.character || null,
    creditNumber: cast.order,
  };
}
function crewToCredit(crew: Crew): Credit {
  if (
    typeof crew.id !== 'number' ||
    !crew.name ||
    typeof crew.job !== 'string'
  ) {
    throw new Error('bad crew');
  }
  return {
    personId: crew.id,
    name: crew.name,
    creditType: 'crew',
    job: crew.job || null,
  };
}
function toCredits(cast: Cast[], crew: Crew[]): Credit[] {
  return cast.map(castToCredit).concat(crew.map(crewToCredit));
}

function toMovie(movie: Required<TMDBMovie>, credits: Credit[]): Movie | null {
  if (!movie.title || !movie.overview) {
    console.log(
      `Skipping movie ${movie.id} as it's missing either a title or overview`
    );
    return null;
  }

  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.poster_path
      ? 'https://image.tmdb.org/t/p/w500/' + movie.poster_path // TODO technically this should be fetched from /configuration
      : null,
    releaseDate: movie.release_date || null,
    averageRating: movie.vote_average,
    popularity: movie.popularity,

    genres: movie.genre_ids || [],
    credits,
  };
}

interface AllTheThings {
  genres: Genre[];
  movies: Movie[];
}
async function extract(): Promise<AllTheThings> {
  const genres = await getGenres();
  const tmdbMovies = await getMovies(MOVIE_DATASET_SIZE);

  const movies: Movie[] = [];

  for (const movie of tmdbMovies) {
    const {cast, crew} = await getMovieCredits(movie.id!);
    const credits = toCredits(cast, crew);
    const transformedMovie = toMovie(movie as Required<TMDBMovie>, credits);
    if (transformedMovie) movies.push(transformedMovie);
  }

  return {
    movies,
    genres: genres.map(toGenre),
  };
}

export default extract;
